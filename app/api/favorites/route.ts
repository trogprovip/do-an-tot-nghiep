import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken, getAdminFromToken } from '@/lib/jwt';

// GET - Get user's favorites or get favorite count for a movie
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const movieId = searchParams.get('movieId');
    
    // If movieId is provided, return favorite count for that movie
    if (movieId) {
      const favoriteCount = await prisma.favorites.count({
        where: {
          movie_id: parseInt(movieId),
          is_deleted: false,
        },
      });
      
      return NextResponse.json({
        success: true,
        count: favoriteCount,
      });
    }
    
    // Otherwise, get current user's favorites
    const userPayload = getUserFromToken(request) || getAdminFromToken(request);
    
    if (!userPayload) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const favorites = await prisma.favorites.findMany({
      where: {
        account_id: userPayload.id,
        is_deleted: false,
      },
      include: {
        movies: {
          select: {
            id: true,
            title: true,
            poster_url: true,
            genre: true,
            duration: true,
            release_date: true,
          },
        },
      },
      orderBy: { create_at: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: favorites.map(fav => fav.movies),
    });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch favorites' },
      { status: 500 }
    );
  }
}

// POST - Add a movie to favorites
export async function POST(request: NextRequest) {
  try {
    const userPayload = getUserFromToken(request) || getAdminFromToken(request);
    
    if (!userPayload) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { movieId } = body;

    if (!movieId) {
      return NextResponse.json(
        { success: false, error: 'Movie ID is required' },
        { status: 400 }
      );
    }

    // Check if movie exists
    const movie = await prisma.movies.findFirst({
      where: { id: parseInt(movieId), is_deleted: false },
    });

    if (!movie) {
      return NextResponse.json(
        { success: false, error: 'Movie not found' },
        { status: 404 }
      );
    }

    // Check if already favorited (including soft deleted)
    const existingFavorite = await prisma.favorites.findFirst({
      where: {
        account_id: userPayload.id,
        movie_id: parseInt(movieId),
      },
    });

    if (existingFavorite) {
      if (existingFavorite.is_deleted) {
        // Reactivate soft deleted favorite
        const favorite = await prisma.favorites.update({
          where: { id: existingFavorite.id },
          data: {
            is_deleted: false,
            create_at: new Date(),
          },
        });

        return NextResponse.json({
          success: true,
          message: 'Movie added to favorites',
          favorite,
        });
      } else {
        // Already active favorite
        return NextResponse.json(
          { success: false, error: 'Movie already in favorites' },
          { status: 400 }
        );
      }
    }

    // Add to favorites
    const favorite = await prisma.favorites.create({
      data: {
        account_id: userPayload.id,
        movie_id: parseInt(movieId),
        create_at: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Movie added to favorites',
      favorite,
    });
  } catch (error) {
    console.error('Error adding favorite:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add favorite' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a movie from favorites
export async function DELETE(request: NextRequest) {
  try {
    const userPayload = getUserFromToken(request) || getAdminFromToken(request);
    
    if (!userPayload) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const movieId = searchParams.get('movieId');

    if (!movieId) {
      return NextResponse.json(
        { success: false, error: 'Movie ID is required' },
        { status: 400 }
      );
    }

    // Soft delete the favorite
    const result = await prisma.favorites.updateMany({
      where: {
        account_id: userPayload.id,
        movie_id: parseInt(movieId),
        is_deleted: false,
      },
      data: {
        is_deleted: true,
      },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { success: false, error: 'Favorite not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Movie removed from favorites',
    });
  } catch (error) {
    console.error('Error removing favorite:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove favorite' },
      { status: 500 }
    );
  }
}
