import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get movies currently showing (status = 'now_showing')
    const currentlyShowingMovies = await prisma.movies.count({
      where: {
        status: 'now_showing',
        is_deleted: false,
      },
    });

    // Get active cinemas
    const activeCinemas = await prisma.cinemas.count({
      where: {
        status: 'active',
        is_deleted: false,
      },
    });

    // Get today's showtimes
    const todayShowtimes = await prisma.slots.count({
      where: {
        show_time: {
          gte: today,
          lt: tomorrow,
        },
        is_deleted: false,
      },
    });

    // Get today's sold tickets (paid tickets)
    const todaySoldTickets = await prisma.tickets.count({
      where: {
        tickets_date: {
          gte: today,
          lt: tomorrow,
        },
        payment_status: 'paid',
        is_deleted: false,
      },
    });

    const statistics = {
      currentlyShowingMovies,
      activeCinemas,
      todayShowtimes,
      todaySoldTickets,
    };

    return NextResponse.json(statistics);
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
