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

    return NextResponse.json(promotion);
  } catch (error) {
    console.error('Error fetching promotion:', error);
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

export async function PUT(
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

    const existingPromotion = await (prisma as any).promotions.findFirst({
      where: {
        id,
        is_deleted: false,
      },
    });
    
    if (!existingPromotion) {
      return NextResponse.json(
        { error: 'Promotion not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    
    // Validate required fields
    if (!body.promotion_code || !body.promotion_name || !body.discount_value) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if promotion code already exists (excluding current promotion)
    const duplicatePromotion = await (prisma as any).promotions.findFirst({
      where: {
        promotion_code: body.promotion_code,
        id: { not: id },
        is_deleted: false,
      },
    });
    
    if (duplicatePromotion) {
      return NextResponse.json(
        { error: 'Promotion code already exists' },
        { status: 409 }
      );
    }

    // Update promotion
    const updatedPromotion = await (prisma as any).promotions.update({
      where: { id },
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
        update_at: new Date(),
      },
    });

    return NextResponse.json(updatedPromotion);
  } catch (error) {
    console.error('Error updating promotion:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const promotion = await prisma.promotions.findFirst({
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

    // Soft delete
    await (prisma as any).promotions.update({
      where: { id },
      data: {
        is_deleted: true,
        update_at: new Date(),
      },
    });

    return NextResponse.json({ message: 'Promotion deleted successfully' });
  } catch (error) {
    console.error('Error deleting promotion:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
