/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to execute raw SQL queries
async function executeRawQuery(query: string, params?: unknown[]) {
  try {
    return await prisma.$queryRawUnsafe(query, ...(params || []));
  } catch (error) {
    console.error('Raw query error:', error);
    throw error;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slotId: string }> }
) {
  try {
    const { slotId } = await params;
    const slotIdNum = parseInt(slotId);
    
    if (isNaN(slotIdNum)) {
      return NextResponse.json(
        { success: false, error: 'Invalid slot ID' },
        { status: 400 }
      );
    }

    // Get all seats for this slot to check their locks
    const seatsResponse = await fetch(`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/seats?room_id=${slotIdNum}`);
    const seatsData = await seatsResponse.json();
    
    if (!seatsResponse.ok || !seatsData.content) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch seats' },
        { status: 500 }
      );
    }

    const seatIds = seatsData.content.map((seat: any) => seat.id);
    
    if (seatIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: { locks: [] }
      });
    }

    // Fetch active locks for these seats
    const locks = await executeRawQuery(
      `SELECT seat_id, user_id, session_id, locked_at, expires_at, is_active 
       FROM seatlocks 
       WHERE seat_id IN (${seatIds.join(',')}) 
       AND is_active = 1 
       AND expires_at > NOW()
       ORDER BY expires_at DESC`
    );

    return NextResponse.json({
      success: true,
      data: {
        locks: locks,
        count: Array.isArray(locks) ? locks.length : 0
      }
    });

  } catch (error) {
    console.error('Error fetching seat locks for slot:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch seat locks' },
      { status: 500 }
    );
  }
}
