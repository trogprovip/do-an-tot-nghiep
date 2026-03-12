import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAutoMovieStatus } from '@/lib/utils/movieStatus';

const MOVIES_PER_PAGE = 8;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'now_showing';
    const page = parseInt(searchParams.get('page') || '1');
    const autoUpdate = searchParams.get('autoUpdate') === 'true';

    const skip = (page - 1) * MOVIES_PER_PAGE;

    const where: any = {
      is_deleted: false,
    };

    if (status && status !== 'all') {
      where.status = status;
    }

    // Get total count
    const totalMovies = await prisma.movies.count({ where });

    // Get movies with pagination
    let movies = await prisma.movies.findMany({
      where,
      skip,
      take: MOVIES_PER_PAGE,
      orderBy: [
        { release_date: 'desc' },
        { id: 'desc' }
      ],
      select: {
        id: true,
        title: true,
        description: true,
        duration: true,
        release_date: true,
        director: true,
        genre: true,
        poster_url: true,
        trailer_url: true,
        status: true,
        _count: {
          select: {
            favorites: {
              where: {
                is_deleted: false,
              },
            },
          },
        },
      },
    });

    // Auto-update status if requested
    if (autoUpdate) {
      movies = movies.map(movie => ({
        ...movie,
        status: getAutoMovieStatus({
          releaseDate: movie.release_date,
          currentStatus: movie.status || undefined
        })
      }));
    }

    const totalPages = Math.ceil(totalMovies / MOVIES_PER_PAGE);

    return NextResponse.json({
      success: true,
      movies,
      pagination: {
        currentPage: page,
        totalPages,
        totalMovies,
        moviesPerPage: MOVIES_PER_PAGE,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching public movies:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch movies',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
