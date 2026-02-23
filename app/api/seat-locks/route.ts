import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const LOCK_DURATION_MINUTES = 20; // 20 phút timeout

// Helper function to execute raw SQL queries
async function executeRawQuery(query: string, params?: unknown[]) {
  try {
    // @ts-expect-error - Using raw query as workaround for Prisma client issue
    return await prisma.$queryRawUnsafe(query, ...(params || []));
  } catch (error) {
    console.error('Raw query error:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { seatIds, userId, sessionId } = await request.json();

    if (!seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng cung cấp danh sách ghế' },
        { status: 400 }
      );
    }

    if (!userId && !sessionId) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng cung cấp userId hoặc sessionId' },
        { status: 400 }
      );
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + LOCK_DURATION_MINUTES * 60 * 1000);

    // Cleanup expired locks first
    await cleanupExpiredLocks();

    const results = [];
    const errors = [];

    for (const seatId of seatIds) {
      try {
        // Check if seat is already locked by someone else using raw query
        const existingLocks = await executeRawQuery(
          `SELECT * FROM seatlocks WHERE seat_id = ? AND is_active = 1 AND expires_at > ? AND ((user_id != ? OR user_id IS NULL) AND (session_id != ? OR session_id IS NULL)) LIMIT 1`,
          [seatId, now, userId || null, sessionId || null]
        );

        if (existingLocks && Array.isArray(existingLocks) && existingLocks.length > 0) {
          errors.push({
            seatId,
            message: `Ghế ${seatId} đã bị người khác giữ`
          });
          continue;
        }

        // Lock the seat using raw query (UPSERT)
        await executeRawQuery(
          `INSERT INTO seatlocks (seat_id, user_id, session_id, locked_at, expires_at, is_active, created_at, updated_at) 
           VALUES (?, ?, ?, ?, ?, 1, ?, ?)
           ON DUPLICATE KEY UPDATE 
           user_id = VALUES(user_id), 
           session_id = VALUES(session_id), 
           locked_at = VALUES(locked_at), 
           expires_at = VALUES(expires_at), 
           is_active = 1, 
           updated_at = VALUES(updated_at)`,
          [seatId, userId || null, sessionId || null, now, expiresAt, now, now]
        );

        results.push({
          seatId,
          lockId: seatId, // Using seatId as identifier
          expiresAt: expiresAt
        });

      } catch (error) {
        console.error(`Error locking seat ${seatId}:`, error);
        errors.push({
          seatId,
          message: `Lỗi khi giữ ghế ${seatId}`
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        locked: results,
        errors: errors,
        lockDuration: LOCK_DURATION_MINUTES
      }
    });

  } catch (error) {
    console.error('Error in seat-locks POST:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi server' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { seatIds, userId, sessionId, extendMinutes } = await request.json();

    if (!seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng cung cấp danh sách ghế' },
        { status: 400 }
      );
    }

    if (!userId && !sessionId) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng cung cấp userId hoặc sessionId' },
        { status: 400 }
      );
    }

    const now = new Date();
    const extendDuration = extendMinutes || LOCK_DURATION_MINUTES;
    const newExpiresAt = new Date(now.getTime() + extendDuration * 60 * 1000);

    // Cleanup expired locks first
    await cleanupExpiredLocks();

    const results = [];
    const errors = [];

    for (const seatId of seatIds) {
      try {
        // Check if seat is locked by this user using raw query
        const existingLocks = await executeRawQuery(
          `SELECT * FROM seatlocks WHERE seat_id = ? AND is_active = 1 AND expires_at > ? AND (user_id = ? OR session_id = ?) LIMIT 1`,
          [seatId, now, userId || null, sessionId || null]
        );

        if (!existingLocks || !Array.isArray(existingLocks) || existingLocks.length === 0) {
          errors.push({
            seatId,
            message: `Ghế ${seatId} không được giữ bởi bạn hoặc đã hết hạn`
          });
          continue;
        }

        // Extend the lock using raw query
        await executeRawQuery(
          `UPDATE seatlocks SET expires_at = ?, updated_at = ? WHERE seat_id = ? AND is_active = 1`,
          [newExpiresAt, now, seatId]
        );

        results.push({
          seatId,
          lockId: seatId,
          expiresAt: newExpiresAt
        });

      } catch (error) {
        console.error(`Error extending lock for seat ${seatId}:`, error);
        errors.push({
          seatId,
          message: `Lỗi khi gia hạn ghế ${seatId}`
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        extended: results,
        errors: errors
      }
    });

  } catch (error) {
    console.error('Error in seat-locks PUT:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi server' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { seatIds, userId, sessionId } = await request.json();

    if (!seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng cung cấp danh sách ghế' },
        { status: 400 }
      );
    }

    if (!userId && !sessionId) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng cung cấp userId hoặc sessionId' },
        { status: 400 }
      );
    }

    const now = new Date();
    const results = [];
    const errors = [];

    for (const seatId of seatIds) {
      try {
        // Check if seat is locked by this user using raw query
        const existingLocks = await executeRawQuery(
          `SELECT * FROM seatlocks WHERE seat_id = ? AND is_active = 1 AND expires_at > ? AND (user_id = ? OR session_id = ?) LIMIT 1`,
          [seatId, now, userId || null, sessionId || null]
        );

        if (!existingLocks || !Array.isArray(existingLocks) || existingLocks.length === 0) {
          errors.push({
            seatId,
            message: `Ghế ${seatId} không được giữ bởi bạn hoặc đã hết hạn`
          });
          continue;
        }

        // Deactivate the lock using raw query
        await executeRawQuery(
          `UPDATE seatlocks SET is_active = 0, updated_at = ? WHERE seat_id = ? AND is_active = 1`,
          [now, seatId]
        );

        results.push({
          seatId,
          lockId: seatId
        });

      } catch (error) {
        console.error(`Error unlocking seat ${seatId}:`, error);
        errors.push({
          seatId,
          message: `Lỗi khi mở ghế ${seatId}`
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        unlocked: results,
        errors: errors
      }
    });

  } catch (error) {
    console.error('Error in seat-locks DELETE:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi server' },
      { status: 500 }
    );
  }
}

async function cleanupExpiredLocks() {
  try {
    const now = new Date();
    await executeRawQuery(
      `UPDATE seatlocks SET is_active = 0, updated_at = ? WHERE expires_at < ? AND is_active = 1`,
      [now, now]
    );
  } catch (error) {
    console.error('Error cleaning up expired locks:', error);
  }
}
