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

    // Get total usage (chỉ đếm các usage đã thanh toán thành công)
    const totalUsage = await (prisma as any).promotionusage.count({
      where: { 
        promotion_id: id,
        tickets_id: {
          not: 1 // Chỉ đếm những usage đã có ticket_id thực tế (đã thanh toán)
        }
      },
    });

    // Get total discount amount (chỉ tính các usage đã thanh toán)
    const usageData = await (prisma as any).promotionusage.aggregate({
      where: { 
        promotion_id: id,
        tickets_id: {
          not: 1 // Chỉ tính những usage đã có ticket_id thực tế (đã thanh toán)
        }
      },
      _sum: {
        discount_amount: true,
      },
    });

    const totalDiscount = usageData._sum.discount_amount?.toNumber() || 0;

    // Get unique users (chỉ đếm các usage đã thanh toán)
    const uniqueUsersData = await (prisma as any).promotionusage.groupBy({
      by: ['account_id'],
      where: { 
        promotion_id: id,
        tickets_id: {
          not: 1 // Chỉ đếm những usage đã có ticket_id thực tế (đã thanh toán)
        }
      },
    });

    const uniqueUsers = uniqueUsersData.length;

    // Calculate average discount
    const averageDiscount = totalUsage > 0 ? totalDiscount / totalUsage : 0;

    // Get usage by day (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const usageByDay = await (prisma as any).promotionusage.groupBy({
      by: ['used_at'],
      where: {
        promotion_id: id,
        tickets_id: {
          not: 1 // Chỉ đếm những usage đã có ticket_id thực tế (đã thanh toán)
        },
        used_at: {
          gte: sevenDaysAgo,
        },
      },
      _count: {
        id: true,
      },
      _sum: {
        discount_amount: true,
      },
    });

    // Format usage by day
    const formattedUsageByDay = usageByDay.map((item: any) => ({
      date: item.used_at?.toISOString().split('T')[0] || '',
      count: item._count.id,
      discount: item._sum.discount_amount?.toNumber() || 0,
    }));

    // Get top users (chỉ tính các usage đã thanh toán)
    const topUsersData = await (prisma as any).promotionusage.groupBy({
      by: ['account_id'],
      where: { 
        promotion_id: id,
        tickets_id: {
          not: 1 // Chỉ đếm những usage đã có ticket_id thực tế (đã thanh toán)
        }
      },
      _count: {
        id: true,
      },
      _sum: {
        discount_amount: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 10,
    });

    // Get user details for top users
    const topUsers = await Promise.all(
      topUsersData.map(async (userData: any) => {
        const account = await (prisma as any).accounts.findUnique({
          where: { id: userData.account_id },
          select: {
            id: true,
            username: true,
            full_name: true,
          },
        });

        return {
          account_id: userData.account_id,
          username: account?.username || `User ${userData.account_id}`,
          full_name: account?.full_name || '',
          usage_count: userData._count.id,
          total_discount: userData._sum.discount_amount?.toNumber() || 0,
        };
      })
    );

    const stats = {
      totalUsage,
      totalDiscount,
      uniqueUsers,
      averageDiscount,
      usageByDay: formattedUsageByDay,
      topUsers,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching promotion stats:', error);
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
