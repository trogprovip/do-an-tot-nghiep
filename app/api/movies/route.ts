import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '0');
    const size = parseInt(searchParams.get('size') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

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

    const content = await prisma.movies.findMany({
      where,
      skip,
      take: size,
      orderBy: { id: 'desc' },
    });

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

    const newMovie = await prisma.movies.create({
      data: {
        title: body.title,
        description: body.description,
        duration: parseInt(body.duration),
        release_date: body.release_date ? new Date(body.release_date) : null,
        director: body.director,
        cast: body.cast,
        genre: body.genre,
        language: body.language,
        poster_url: body.poster_url,
        trailer_url: body.trailer_url,
        status: body.status || 'coming_soon',
        create_at: new Date(),
        is_deleted: false,
      },
    });

    return NextResponse.json(newMovie, { status: 201 });
  } catch (error) {
    console.error('Error creating movie:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create movie' },
      { status: 500 }
    );
  }
}