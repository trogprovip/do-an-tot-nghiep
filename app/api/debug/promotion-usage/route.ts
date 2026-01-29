/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Lấy tất cả dữ liệu trong promotionusage để debug
    const allUsage = await (prisma as any).promotionusage.findMany({
      include: {
        accounts: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        promotions: {
          select: {
            id: true,
            promotion_code: true,
            promotion_name: true,
          },
        },
        tickets: {
          select: {
            id: true,
            tickets_code: true,
            final_amount: true,
          },
        },
      },
      orderBy: {
        used_at: 'desc',
      },
      take: 20,
    });

    // Lấy thông tin promotions để so sánh
    const promotions = await (prisma as any).promotions.findMany({
      where: {
        is_deleted: false,
      },
      select: {
        id: true,
        promotion_code: true,
        promotion_name: true,
        usage_count: true,
        usage_per_user: true,
      },
      orderBy: {
        id: 'desc',
      },
      take: 10,
    });

    return NextResponse.json({
      allUsage,
      promotions,
      message: 'Debug data for promotion usage'
    });
  } catch (error) {
    console.error('Error debugging promotion usage:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
