import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RevenueByDateItem {
  date: string;
  revenue: number;
  ticketCount: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const cinemaId = searchParams.get('cinemaId');
    const movieId = searchParams.get('movieId');
    const page = parseInt(searchParams.get('page') || '0');
    const size = parseInt(searchParams.get('size') || '10');

    const skip = page * size;

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      is_deleted: false,
      payment_status: 'paid',
    };

    if (startDate || endDate) {
      where.tickets_date = {};
      if (startDate) {
        where.tickets_date.gte = new Date(startDate);
      }
      if (endDate) {
        where.tickets_date.lte = new Date(endDate + 'T23:59:59.999Z');
      }
    }

    if (cinemaId || movieId) {
      where.slots = {};
      if (cinemaId) {
        where.slots.rooms = {
          cinema_id: parseInt(cinemaId)
        };
      }
      if (movieId) {
        where.slots.movie_id = parseInt(movieId);
      }
    }

    // Get total revenue and stats
    const totalRevenue = await prisma.tickets.aggregate({
      where,
      _sum: {
        final_amount: true,
        total_amount: true,
        discount_amount: true,
      },
      _count: {
        id: true,
      },
    });

    // Get revenue by date for chart
    
    // Use simple groupBy for all cases - it's more reliable
    const groupedData = await prisma.tickets.groupBy({
      by: ['tickets_date'],
      where,
      _sum: {
        final_amount: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        tickets_date: 'asc',
      },
    });
    
    // Process the grouped data to extract date part and aggregate by day
    const dateMap = new Map();
    groupedData.forEach(item => {
      if (!item.tickets_date) return;
      
      // Convert to local date string to avoid timezone issues
      const localDate = new Date(item.tickets_date);
      const dateStr = localDate.toLocaleDateString('en-CA'); // YYYY-MM-DD format
      
      if (dateMap.has(dateStr)) {
        const existing = dateMap.get(dateStr);
        existing.revenue += Number(item._sum.final_amount || 0);
        existing.ticketCount += item._count.id || 0;
      } else {
        dateMap.set(dateStr, {
          date: dateStr,
          revenue: Number(item._sum.final_amount || 0),
          ticketCount: item._count.id || 0,
        });
      }
    });
    
    const revenueByDate = Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));

    // Get revenue by movie
    const revenueByMovie = await prisma.tickets.findMany({
      where,
      select: {
        slot_id: true,
        final_amount: true,
        slots: {
          select: {
            movies: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });

    // Get detailed tickets with relations
    const content = await prisma.tickets.findMany({
      where,
      skip,
      take: size,
      orderBy: { tickets_date: 'desc' },
      include: {
        accounts: {
          select: {
            full_name: true,
            email: true,
          },
        },
        slots: {
          include: {
            movies: {
              select: {
                id: true,
                title: true,
              },
            },
            rooms: {
              select: {
                room_name: true,
                cinema_id: true, // Thêm cinema_id
                cinemas: {
                  select: {
                    cinema_name: true,
                  },
                },
              },
            },
          },
        },
        bookingseats: {
          include: {
            seats: {
              select: {
                seat_number: true,
                seattypes: {
                  select: {
                    type_name: true,
                  },
                },
              },
            },
          },
        },
        promotions: {
          select: {
            id: true,
            promotion_code: true,
            promotion_name: true,
          },
        },
      },
    });

    // Get movie, cinema and province lists for filters
    const [movies, cinemas, provinces] = await Promise.all([
      prisma.movies.findMany({
        select: {
          id: true,
          title: true,
        },
        orderBy: { title: 'asc' },
      }),
      prisma.cinemas.findMany({
        select: {
          id: true,
          cinema_name: true,
          province_id: true,
        },
        orderBy: { cinema_name: 'asc' },
      }),
      prisma.provinces.findMany({
        select: {
          id: true,
          province_name: true,
        },
        orderBy: { province_name: 'asc' },
      }),
    ]);

    // Process revenue by movie data
    const movieRevenueMap = new Map();
    for (const item of revenueByMovie) {
      if (item.slots?.movies) {
        const movieId = item.slots.movies.id;
        const movieTitle = item.slots.movies.title;
        
        if (!movieRevenueMap.has(movieId)) {
          movieRevenueMap.set(movieId, {
            movieId,
            movieTitle,
            revenue: 0,
            ticketCount: 0,
          });
        }
        
        const movieData = movieRevenueMap.get(movieId);
        movieData.revenue += Number(item.final_amount || 0);
        movieData.ticketCount += 1;
      }
    }

    // Process revenue by cinema data
    const cinemaRevenueMap = new Map();
    for (const ticket of content) {
      if (ticket.slots?.rooms?.cinemas && ticket.slots.rooms.cinema_id) {
        const cinemaId = ticket.slots.rooms.cinema_id;
        const cinemaName = ticket.slots.rooms.cinemas.cinema_name;
        
        if (!cinemaRevenueMap.has(cinemaId)) {
          cinemaRevenueMap.set(cinemaId, {
            cinemaId,
            cinemaName,
            revenue: 0,
            ticketCount: 0,
          });
        }
        
        const cinemaData = cinemaRevenueMap.get(cinemaId);
        cinemaData.revenue += Number(ticket.final_amount || 0);
        cinemaData.ticketCount += 1;
      }
    }

    
    const totalElements = await prisma.tickets.count({ where });

    return NextResponse.json({
      content,
      totalElements,
      totalPages: Math.ceil(totalElements / size),
      size,
      number: page,
      stats: {
        totalRevenue: Number(totalRevenue._sum.final_amount || 0),
        totalTickets: totalRevenue._count.id || 0,
      },
      chartData: Array.isArray(revenueByDate) 
        ? revenueByDate.map((item: RevenueByDateItem) => ({
            date: item.date ? item.date.toString() : new Date().toISOString().split('T')[0],
            revenue: Number(item.revenue || 0),
            ticketCount: Number(item.ticketCount || 0),
          }))
        : [],
      movieRevenue: Array.from(movieRevenueMap.values()).sort((a, b) => b.revenue - a.revenue),
      cinemaRevenue: Array.from(cinemaRevenueMap.values()).sort((a, b) => b.revenue - a.revenue),
      filters: {
        movies,
        cinemas,
        provinces,
      },
    });
  } catch (error) {
    console.error('Error fetching revenue data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch revenue data' },
      { status: 500 }
    );
  }
}
