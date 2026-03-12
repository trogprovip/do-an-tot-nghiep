/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    console.log('🔍 API Request URL:', request.url);
    console.log('🔍 API Search params:', Object.fromEntries(searchParams.entries()));
    
    const page = parseInt(searchParams.get('page') || '0');
    const size = parseInt(searchParams.get('size') || '10');
    const search = searchParams.get('search') || '';
    const movie_id = searchParams.get('movie_id');
    const room_id = searchParams.get('room_id');
    const cinema_id = searchParams.get('cinema_id');
    const date = searchParams.get('date');
    const province_id = searchParams.get('province_id');
    
    console.log('🔍 API Parsed params:', { page, size, search, movie_id, room_id, cinema_id, date, province_id });

    const skip = page * size;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      is_deleted: false,
    };

    if (movie_id) {
      where.movie_id = parseInt(movie_id);
    }

    if (room_id) {
      where.room_id = parseInt(room_id);
    }

    if (cinema_id) {
      where.rooms = {
        cinema_id: parseInt(cinema_id),
      };
    }

    if (province_id) {
      if (where.rooms) {
        where.rooms.cinemas = {
          province_id: parseInt(province_id),
        };
      } else {
        where.rooms = {
          cinemas: {
            province_id: parseInt(province_id),
          },
        };
      }
    }

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      where.show_time = {
        gte: startDate,
        lte: endDate,
      };
    }

    if (search) {
      where.OR = [
        { movies: { title: { contains: search } } },
        { rooms: { room_name: { contains: search } } },
      ];
    }

    console.log('🔍 Final where clause:', JSON.stringify(where, null, 2));

    const [slots, total] = await Promise.all([
      prisma.slots.findMany({
        where,
        include: {
          movies: {
            select: {
              id: true,
              title: true,
            },
          },
          rooms: {
            select: {
              id: true,
              room_name: true,
              cinemas: {
                select: {
                  id: true,
                  cinema_name: true,
                  address: true,
                  province_id: true,
                },
              },
            },
          },
        },
        orderBy: { show_time: 'desc' },
        skip,
        take: size,
      }),
      prisma.slots.count({ where }),
    ]);

    console.log('🔍 Query result:', { slotsCount: slots.length, total });

    return NextResponse.json({
      content: slots,
      totalElements: total,
      totalPages: Math.ceil(total / size),
      size,
      number: page,
    });
  } catch (error) {
    console.error('Error fetching slots:', error);
    return NextResponse.json(
      { error: 'Failed to fetch slots' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('🔍 Request body:', body);
    console.log('🔍 movieId:', body.movieId);
    console.log('🔍 roomId:', body.roomId);
    console.log('🔍 showTime:', body.showTime);
    console.log('🔍 endTime:', body.endTime);

    if (!body.movieId || !body.roomId || !body.showTime || !body.endTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Đếm số ghế thực tế trong phòng (chỉ đếm ghế active)
    console.log('🔍 Counting seats for room_id:', parseInt(body.roomId));
    
    const seatCount = await prisma.seats.count({
      where: {
        room_id: parseInt(body.roomId),
        status: 'active',
      },
    });
    
    console.log('🔍 Seat count result:', seatCount);
    
    // Kiểm tra tất cả ghế trong phòng (không filter status)
    const allSeats = await prisma.seats.count({
      where: { room_id: parseInt(body.roomId) },
    });
    console.log('🔍 All seats in room (no status filter):', allSeats);

    if (allSeats === 0) {
      return NextResponse.json(
        { error: 'Room has no seats. Please create seats first.' },
        { status: 400 }
      );
    }

    // Lấy giá vé từ setting_system (type = 'ticket_price')
    let ticketPrice = 80000; // Giá mặc định (ngày thường)
    try {
      const priceSetting = await prisma.setting_system.findUnique({
        where: { type: 'ticket_price' },
      });
      if (priceSetting && priceSetting.config_data) {
        const config = priceSetting.config_data as any;
        // Kiểm tra ngày chiếu là ngày thường hay cuối tuần
        // Parse showTime string: "2026-01-07 19:00:00"
        const parts = body.showTime.split(' ');
        const [year, month, day] = parts[0].split('-');
        const showDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        const dayOfWeek = showDate.getDay(); // 0 = Sunday, 6 = Saturday
        
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          // Cuối tuần (Thứ 7, Chủ nhật)
          ticketPrice = config.weekendPrice || 120000;
        } else {
          // Ngày thường (Thứ 2 - Thứ 6)
          ticketPrice = config.weekdayPrice || 80000;
        }
      }
    } catch (err) {
      console.log('Using default ticket price:', ticketPrice);
    }

    // Format datetime
    const formattedShowTime = new Date(body.showTime.replace(' ', 'T'));
    const formattedEndTime = new Date(body.endTime.replace(' ', 'T'));

    // Chỉ kiểm tra trùng lặp giờ chiếu trong cùng phòng
    const existingSlot = await prisma.slots.findFirst({
      where: {
        room_id: parseInt(body.roomId),
        show_time: formattedShowTime,
        is_deleted: false,
      },
    });

    if (existingSlot) {
      console.log('🔍 Duplicate showtime found:', existingSlot);
      return NextResponse.json(
        { 
          error: 'Suất chiếu này đã tồn tại! Không thể tạo suất chiếu trùng lặp.',
          details: `Phòng này đã có suất chiếu khác vào lúc ${body.showTime}`
        },
        { status: 409 }
      );
    }

    const newSlot = await prisma.slots.create({
      data: {
        movie_id: parseInt(body.movieId),
        room_id: parseInt(body.roomId),
        show_time: formattedShowTime,
        end_time: formattedEndTime,
        price: ticketPrice,
        empty_seats: allSeats,
        create_at: new Date(),
        is_deleted: false,
      },
    });

    return NextResponse.json(newSlot, { status: 201 });
  } catch (error) {
    console.error('Error creating slot:', error);
    return NextResponse.json(
      { error: 'Failed to create slot' },
      { status: 500 }
    );
  }
}
