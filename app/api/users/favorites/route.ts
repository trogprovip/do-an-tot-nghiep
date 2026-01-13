import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken, getAdminFromToken } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  try {
    // Get user from token
    const userPayload = getUserFromToken(request) || getAdminFromToken(request);
    
    if (!userPayload) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get actual favorite movies from favorites table
    const favoriteRecords = await prisma.favorites.findMany({
      where: {
        account_id: userPayload.id,
        is_deleted: false,
      },
      include: {
        movies: true,
      },
      orderBy: {
        create_at: 'desc',
      },
    });

    // Transform data to match frontend interface
    const favoriteMovies = favoriteRecords.map((favorite) => ({
      id: favorite.movies.id,
      title: favorite.movies.title,
      poster_url: favorite.movies.poster_url || 'https://via.placeholder.com/300x450',
      genre: favorite.movies.genre || 'N/A',
      duration: favorite.movies.duration,
      release_date: favorite.movies.release_date?.toISOString() || new Date().toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: favoriteMovies,
    });
  } catch (error) {
    console.error('Error fetching favorite movies:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch favorite movies' },
      { status: 500 }
    );
  }
}
