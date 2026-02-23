/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '0');
    const size = parseInt(searchParams.get('size') || '10');
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const search = searchParams.get('search');

    // Build where clause
    const where: any = {
      is_deleted: false,
    };

    if (status && status !== 'all') {
      where.status = status;
    }

    if (type && type !== 'all') {
      where.discount_type = type;
    }

    if (search) {
      const searchLower = search.toLowerCase();
      where.OR = [
        {
          promotion_name: {
            contains: searchLower,
            mode: 'insensitive',
          },
        },
        {
          promotion_code: {
            contains: searchLower,
            mode: 'insensitive',
          },
        },
      ];
    }

    // Auto-update expired promotions first
    await updateExpiredPromotions();

    // Get total count
    const totalElements = await (prisma as any).promotions.count({ where });

    // Get promotions with pagination
    const promotions = await (prisma as any).promotions.findMany({
      where,
      orderBy: {
        create_at: 'desc',
      },
      skip: page * size,
      take: size,
    });

    const totalPages = Math.ceil(totalElements / size);

    return NextResponse.json({
      content: promotions,
      page,
      size,
      totalElements,
      totalPages,
      first: page === 0,
      last: page === totalPages - 1,
    });
  } catch (error) {
    console.error('Error fetching promotions:', error);
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.promotion_code || !body.promotion_name || !body.discount_value) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if promotion code already exists
    const existingPromotion = await (prisma as any).promotions.findFirst({
      where: {
        promotion_code: body.promotion_code,
        is_deleted: false,
      },
    });
    
    if (existingPromotion) {
      return NextResponse.json(
        { error: 'Promotion code already exists' },
        { status: 409 }
      );
    }

    // Create new promotion
    const newPromotion = await (prisma as any).promotions.create({
      data: {
        promotion_code: body.promotion_code,
        promotion_name: body.promotion_name,
        description: body.description || null,
        discount_type: body.discount_type,
        discount_value: parseFloat(body.discount_value),
        max_discount_amount: body.max_discount_amount ? parseFloat(body.max_discount_amount) : null,
        min_order_amount: Math.round(parseFloat(body.min_order_amount) * 100) / 100,
        usage_limit: body.usage_limit ? parseInt(body.usage_limit) : null,
        usage_per_user: parseInt(body.usage_per_user),
        start_date: new Date(body.start_date),
        end_date: new Date(body.end_date),
        applicable_days: body.applicable_days || null,
        applicable_movies: body.applicable_movies || null,
        applicable_cinemas: body.applicable_cinemas || null,
        status: body.status,
        image_url: body.image_url || null,
      },
    });

    return NextResponse.json(newPromotion, { status: 201 });
  } catch (error) {
    console.error('Error creating promotion:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
