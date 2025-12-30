/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const movieId = parseInt(id);
    
    if (isNaN(movieId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid movie ID' },
        { status: 400 }
      );
    }

    const movie = await prisma.movies.findFirst({
      where: {
        id: movieId,
        is_deleted: false,
      },
    });

    if (!movie) {
      return NextResponse.json(
        { success: false, error: 'Movie not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(movie);
  } catch (error) {
    console.error('Error fetching movie:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch movie' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const movieId = parseInt(id);
    
    if (isNaN(movieId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid movie ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    const existingMovie = await prisma.movies.findFirst({
      where: {
        id: movieId,
        is_deleted: false,
      },
    });

    if (!existingMovie) {
      return NextResponse.json(
        { success: false, error: 'Movie not found' },
        { status: 404 }
      );
    }

    const updateData: any = {};
    
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.duration !== undefined) updateData.duration = parseInt(body.duration);
    if (body.release_date !== undefined) updateData.release_date = body.release_date ? new Date(body.release_date) : null;
    if (body.director !== undefined) updateData.director = body.director;
    if (body.cast !== undefined) updateData.cast = body.cast;
    if (body.genre !== undefined) updateData.genre = body.genre;
    if (body.language !== undefined) updateData.language = body.language;
    if (body.poster_url !== undefined) updateData.poster_url = body.poster_url;
    if (body.trailer_url !== undefined) updateData.trailer_url = body.trailer_url;
    if (body.status !== undefined) updateData.status = body.status;
    
    updateData.update_at = new Date();

    const updatedMovie = await prisma.movies.update({
      where: { id: movieId },
      data: updateData,
    });

    return NextResponse.json(updatedMovie);
  } catch (error) {
    console.error('Error updating movie:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: 'Failed to update movie', details: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const movieId = parseInt(id);
    
    if (isNaN(movieId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid movie ID' },
        { status: 400 }
      );
    }

    const existingMovie = await prisma.movies.findFirst({
      where: {
        id: movieId,
        is_deleted: false,
      },
    });

    if (!existingMovie) {
      return NextResponse.json(
        { success: false, error: 'Movie not found' },
        { status: 404 }
      );
    }

    await prisma.movies.update({
      where: { id: movieId },
      data: {
        is_deleted: true,
      },
    });

    return NextResponse.json({ success: true, message: 'Movie deleted successfully' });
  } catch (error) {
    console.error('Error deleting movie:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: 'Failed to delete movie', details: errorMessage },
      { status: 500 }
    );
  }
}