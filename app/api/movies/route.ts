/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAutoMovieStatus } from '@/lib/utils/movieStatus';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '0');
    const size = parseInt(searchParams.get('size') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const autoUpdate = searchParams.get('autoUpdate') === 'true';

    const skip = page * size;

    const where: any = {
      is_deleted: false,
    };

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { director: { contains: search } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const totalElements = await prisma.movies.count({ where });

    let content = await prisma.movies.findMany({
      where,
      skip,
      take: size,
      orderBy: { id: 'desc' },
      include: {
        reviews: {
          where: {
            is_deleted: false,
          },
          select: {
            id: true,
            rating: true,
            comment: true,
            create_at: true,
            accounts: {
              select: {
                id: true,
                full_name: true,
                username: true,
              }
            }
          },
        },
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
      content = content.map(movie => ({
        ...movie,
        status: getAutoMovieStatus({
          releaseDate: movie.release_date,
          currentStatus: movie.status || undefined
        })
      }));
    }

    return NextResponse.json({
      content,
      totalElements,
      totalPages: Math.ceil(totalElements / size),
      size,
      number: page,
    });
  } catch (error) {
    console.error('Error fetching movies:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch movies' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('🔵 Movie data received:', body);

    // Auto-determine status based on release date
    const autoStatus = getAutoMovieStatus({
      releaseDate: body.release_date,
      currentStatus: body.status
    });
    
    console.log('🔵 Auto status:', autoStatus);

    // Validate and parse duration
    let duration = 0;
    if (body.duration) {
      duration = parseInt(body.duration);
      if (isNaN(duration)) {
        console.error('❌ Invalid duration:', body.duration);
        return NextResponse.json(
          { success: false, error: 'Invalid duration value' },
          { status: 400 }
        );
      }
    }

    // Validate release date
    let releaseDate = null;
    if (body.release_date) {
      releaseDate = new Date(body.release_date);
      if (isNaN(releaseDate.getTime())) {
        console.error('❌ Invalid release date:', body.release_date);
        return NextResponse.json(
          { success: false, error: 'Invalid release date format' },
          { status: 400 }
        );
      }
    }

    const movieData = {
      title: body.title,
      description: body.description || null,
      duration: duration,
      release_date: releaseDate,
      director: body.director || null,
      cast: body.cast || null,
      genre: body.genre || null,
      language: body.language || null,
      poster_url: body.poster_url || null,
      trailer_url: body.trailer_url || null,
      status: autoStatus,
      create_at: new Date(),
      is_deleted: false,
    };
    
    console.log('🔵 Final movie data:', movieData);

    const newMovie = await prisma.movies.create({
      data: movieData,
    });

    console.log('✅ Movie created successfully:', newMovie);
    return NextResponse.json(newMovie, { status: 201 });
  } catch (error) {
    console.error('❌ Error creating movie:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create movie',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}