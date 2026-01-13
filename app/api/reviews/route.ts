import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '0');
    const size = parseInt(searchParams.get('size') || '10');
    const search = searchParams.get('search') || '';
    const rating = searchParams.get('rating') || '';
    const movieId = searchParams.get('movieId') || '';
    const status = searchParams.get('status') || '';

    const skip = page * size;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      is_deleted: false,
    };

    if (search) {
      where.OR = [
        { comment: { contains: search } },
        { accounts: { username: { contains: search } } },
        { accounts: { full_name: { contains: search } } },
        { movies: { title: { contains: search } } },
      ];
    }

    if (rating) {
      if (rating.includes('-')) {
        // Handle range filters like "4-5" or "1-2"
        const [minRating, maxRating] = rating.split('-').map(r => parseInt(r));
        where.rating = {
          gte: minRating,
          lte: maxRating,
        };
      } else {
        // Handle single rating
        where.rating = parseInt(rating);
      }
    }

    if (movieId) {
      where.movie_id = parseInt(movieId);
    }

    if (status) {
      where.status = status;
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
            email: true,
          },
        },
        movies: {
          select: {
            id: true,
            title: true,
            poster_url: true,
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
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}
