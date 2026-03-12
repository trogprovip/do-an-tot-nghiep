import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAutoMovieStatus } from '@/lib/utils/movieStatus';

/**
 * Bulk update all movie statuses based on their release dates
 * This endpoint can be called periodically or manually to ensure all movie statuses are up-to-date
 */
export async function POST() {
  try {
    // Get all movies that are not deleted
    const movies = await prisma.movies.findMany({
      where: {
        is_deleted: false,
      },
      select: {
        id: true,
        release_date: true,
        status: true,
      },
    });

    let updatedCount = 0;
    const updates: Promise<any>[] = [];

    // Process each movie and update status if needed
    for (const movie of movies) {
      const newStatus = getAutoMovieStatus({
        releaseDate: movie.release_date,
        currentStatus: movie.status || undefined,
      });

      // Only update if status has changed
      if (newStatus !== movie.status) {
        updates.push(
          prisma.movies.update({
            where: { id: movie.id },
            data: {
              status: newStatus,
              update_at: new Date(),
            },
          })
        );
        updatedCount++;
      }
    }

    // Execute all updates in parallel
    if (updates.length > 0) {
      await Promise.all(updates);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${updatedCount} movie statuses`,
      updatedCount,
      totalProcessed: movies.length,
    });
  } catch (error) {
    console.error('Error updating movie statuses:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update movie statuses',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Get status update statistics
 */
export async function GET() {
  try {
    const movies = await prisma.movies.findMany({
      where: {
        is_deleted: false,
      },
      select: {
        id: true,
        title: true,
        release_date: true,
        status: true,
      },
    });

    let needsUpdate = 0;
    const statusSummary: Record<string, number> = {};
    const moviesNeedingUpdate: Array<{
      id: number;
      title: string;
      release_date: Date | null;
      current_status: string | null;
      correct_status: 'coming_soon' | 'now_showing' | 'ended';
    }> = [];

    movies.forEach(movie => {
      // Count current statuses
      const currentStatus = movie.status || 'unknown';
      statusSummary[currentStatus] = (statusSummary[currentStatus] || 0) + 1;

      // Check if status needs updating
      const correctStatus = getAutoMovieStatus({
        releaseDate: movie.release_date,
        currentStatus: movie.status || undefined,
      });

      if (correctStatus !== movie.status) {
        needsUpdate++;
        moviesNeedingUpdate.push({
          id: movie.id,
          title: movie.title,
          release_date: movie.release_date,
          current_status: movie.status,
          correct_status: correctStatus,
        });
      }
    });

    return NextResponse.json({
      success: true,
      totalMovies: movies.length,
      needsUpdate,
      statusSummary,
      moviesNeedingUpdate,
    });
  } catch (error) {
    console.error('Error getting status update statistics:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get status update statistics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
