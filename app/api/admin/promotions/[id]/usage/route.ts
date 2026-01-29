/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid promotion ID' },
        { status: 400 }
      );
    }

    // Auto-update expired promotions first
    await updateExpiredPromotions();

    // Check if promotion exists
    const promotion = await (prisma as any).promotions.findFirst({
      where: {
        id,
        is_deleted: false,
      },
    });

    if (!promotion) {
      return NextResponse.json(
        { error: 'Promotion not found' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '0');
    const size = parseInt(searchParams.get('size') || '10');

    // Get usage with relations (hiển thị TẤT CẢ người đã KÍCH HOẠT mã)
    const usage = await (prisma as any).promotionusage.findMany({
      where: { 
        promotion_id: id,
        tickets_id: 1 // Chỉ hiển thị các usage đã kích hoạt (tickets_id = 1)
      },
      include: {
        accounts: {
          select: {
            id: true,
            username: true,
            email: true,
            full_name: true,
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
      skip: page * size,
      take: size,
    });

    // Get total count (đếm TẤT CẢ người đã kích hoạt)
    const totalElements = await (prisma as any).promotionusage.count({
      where: { 
        promotion_id: id,
        tickets_id: 1 // Chỉ đếm các usage đã kích hoạt (tickets_id = 1)
      },
    });

    const totalPages = Math.ceil(totalElements / size);

    return NextResponse.json({
      content: usage,
      page,
      size,
      totalElements,
      totalPages,
      first: page === 0,
      last: page === totalPages - 1,
    });
  } catch (error) {
    console.error('Error fetching promotion usage:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to update expired promotions
async function updateExpiredPromotions() {
  try {
    const now = new Date();
    
    // Find all active promotions that have expired
    const expiredPromotions = await (prisma as any).promotions.findMany({
      where: {
        status: 'active',
        end_date: {
          lt: now,
        },
        is_deleted: false,
      },
      select: { id: true }
    });

    // Update all expired promotions to 'expired' status
    if (expiredPromotions.length > 0) {
      await (prisma as any).promotions.updateMany({
        where: {
          id: {
            in: expiredPromotions.map((p: any) => p.id)
          },
        },
        data: {
          status: 'expired',
          update_at: now,
        },
      });
      
      console.log(`Updated ${expiredPromotions.length} expired promotions`);
    }
  } catch (error) {
    console.error('Error updating expired promotions:', error);
  }
}
