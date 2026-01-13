import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '0');
    const size = parseInt(searchParams.get('size') || '10');
    const rating = searchParams.get('rating');

    const skip = page * size;

    const where: {
      movie_id: number;
      is_deleted: boolean;
      status: 'approved';
      rating?: number;
    } = {
      movie_id: parseInt(id),
      is_deleted: false,
      status: 'approved' as const,
    };

    if (rating) {
      where.rating = parseInt(rating);
    }

    const totalElements = await prisma.reviews.count({ where });

    const content = await prisma.reviews.findMany({
      where,
      skip,
      take: size,
      orderBy: { create_at: 'desc' },
      include: {
        accounts: {
          select: {
            id: true,
            username: true,
            full_name: true,
          },
        },
      },
    });

    return NextResponse.json({
      content,
      totalElements,
      totalPages: Math.ceil(totalElements / size),
      size,
      number: page,
    });
  } catch (error) {
    console.error('Error fetching movie reviews:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existingReview = await prisma.reviews.findFirst({
      where: {
        account_id: body.account_id,
        movie_id: parseInt(id),
        is_deleted: false,
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { success: false, message: 'Bạn đã đánh giá phim này rồi' },
        { status: 400 }
      );
    }

    const newReview = await prisma.reviews.create({
      data: {
        account_id: body.account_id,
        movie_id: parseInt(id),
        rating: body.rating,
        comment: body.comment || null,
        status: 'pending' as const,
        create_at: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Đánh giá của bạn đã được gửi và đang chờ phê duyệt',
      data: newReview,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create review' },
      { status: 500 }
    );
  }
}
