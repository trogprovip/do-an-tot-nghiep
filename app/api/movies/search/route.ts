import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface MovieResult {
  id: number;
  title: string;
  poster_url?: string | null;
  status: 'now_showing' | 'coming_soon' | 'ended' | null;
  release_date?: Date | null;
  duration?: number | null;
  genre?: string | null;
  director?: string | null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ movies: [] });
    }

    const searchQuery = query.trim();

    // Tìm kiếm phim theo title và description
    const movies = await prisma.movies.findMany({
      where: {
        OR: [
          {
            title: {
              contains: searchQuery
            }
          },
          {
            description: {
              contains: searchQuery
            }
          },
          {
            genre: {
              contains: searchQuery
            }
          },
          {
            director: {
              contains: searchQuery
            }
          }
        ]
      },
      select: {
        id: true,
        title: true,
        poster_url: true,
        status: true,
        release_date: true,
        duration: true,
        genre: true,
        director: true
      },
      orderBy: [
        { status: 'desc' }, // Now showing first
        { title: 'asc' }
      ],
      take: 10 // Limit results for better performance
    });

    return NextResponse.json({ 
      movies: movies.map((movie): MovieResult => ({
        ...movie,
        duration: movie.duration || undefined,
        genre: movie.genre || undefined
      }))
    });

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
