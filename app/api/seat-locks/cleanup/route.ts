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

export async function POST() {
  try {
    const now = new Date();
    
    // Deactivate all expired locks using raw query
    const result = await executeRawQuery(
      `UPDATE seatlocks SET is_active = 0, updated_at = ? WHERE expires_at < ? AND is_active = 1`,
      [now, now]
    );

    return NextResponse.json({
      success: true,
      message: `Đã mở ghế hết hạn`,
      data: {
        cleanedUpCount: Array.isArray(result) ? result.length : 0,
        timestamp: now
      }
    });

  } catch (error) {
    console.error('Error in seat-locks cleanup:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi server khi cleanup' },
      { status: 500 }
    );
  }
}

// Also allow GET for manual testing
export async function GET() {
  return POST();
}
