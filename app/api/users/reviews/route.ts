import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken, getAdminFromToken } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  try {
    // Get user from JWT token
    const userPayload = getUserFromToken(request) || getAdminFromToken(request);
    
    if (!userPayload) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '0');
    const size = parseInt(searchParams.get('size') || '10');
    const rating = searchParams.get('rating');

    const skip = page * size;

    const where: {
      account_id: number;
      is_deleted: boolean;
      rating?: number;
    } = {
      account_id: userPayload.id,
      is_deleted: false,
    };

    if (rating) {
      where.rating = parseInt(rating);
    }

    const totalElements = await prisma.reviews.count({ where });

    const reviews = await prisma.reviews.findMany({
      where,
      skip,
      take: size,
      orderBy: { create_at: 'desc' },
      include: {
        movies: {
          select: {
            id: true,
            title: true,
            poster_url: true,
            genre: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: reviews,
      totalElements,
      totalPages: Math.ceil(totalElements / size),
      size,
      page,
    });
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}
