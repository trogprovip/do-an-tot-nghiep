import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, seats_status } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('room_id');
    const slotId = searchParams.get('slot_id');

    console.log('🔍 [Seats API] Request URL:', request.url);
    console.log('🔍 [Seats API] room_id param:', roomId);
    console.log('🔍 [Seats API] slot_id param:', slotId);

    const where: { room_id?: number } = {};
    if (roomId) {
      where.room_id = parseInt(roomId);
    }

    console.log('🔍 [Seats API] Where clause:', where);

    const seats = await prisma.seats.findMany({
      where,
      include: {
        seattypes: true,
        rooms: {
          include: {
            cinemas: true,
          },
        },
      },
      orderBy: [
        { seat_row: 'asc' },
        { seat_number: 'asc' },
      ],
    });

    console.log('🔍 [Seats API] Found seats:', seats.length);
    console.log('🔍 [Seats API] First seat:', seats[0]);

    // If slot_id is provided, calculate dynamic status based on bookings for this specific slot
    let seatsWithDynamicStatus = seats;
    if (slotId) {
      const slotIdNum = parseInt(slotId);
      const now = new Date();

      console.log('🔍 [Seats API] Processing slot_id:', slotIdNum);

      // Debug: Check all tickets for this slot
      const allTickets = await prisma.$queryRaw`
        SELECT id, slot_id, status, tickets_code 
        FROM tickets 
        WHERE slot_id = ${slotIdNum}
      `;
      console.log('🔍 [Seats API] All tickets for slot', slotIdNum, ':', allTickets);

      // Get booked seats for this specific slot using raw SQL
      const bookedSeats = await prisma.$queryRaw`
        SELECT bs.seat_id, bs.tickets_id, t.id as ticket_id, t.status 
        FROM bookingseats bs
        JOIN tickets t ON bs.tickets_id = t.id
        WHERE t.slot_id = ${slotIdNum}
        AND t.status IN ('confirmed', 'pending', 'completed')
        AND (bs.is_deleted = false OR bs.is_deleted IS NULL)
      `;
      console.log('🔍 [Seats API] Raw booked seats data:', bookedSeats);
      
      const bookedSeatIds = new Set((bookedSeats as {seat_id: bigint}[]).map(bs => Number(bs.seat_id)));
      console.log('🔍 [Seats API] Booked seat IDs for slot', slotIdNum, ':', Array.from(bookedSeatIds));
      console.log('🔍 [Seats API] Available seat IDs in room:', seats.map(s => s.id));

      // Get locked seats for this slot
      const lockedSeats = await prisma.seatlocks.findMany({
        where: {
          seat_id: {
            in: seats.map(s => s.id),
          },
          is_active: true,
          expires_at: {
            gt: now,
          },
        },
        select: {
          seat_id: true,
        },
      });
      const lockedSeatIds = new Set(lockedSeats.map(ls => ls.seat_id));

      // Calculate dynamic status - ignore static seat.status when slot_id is provided
      seatsWithDynamicStatus = seats.map(seat => {
        let dynamicStatus: seats_status;
        if (bookedSeatIds.has(seat.id)) {
          dynamicStatus = 'booked';
        } else if (lockedSeatIds.has(seat.id)) {
          dynamicStatus = 'locked' as seats_status;
        } else if (seat.status === 'broken') {
          dynamicStatus = 'broken';
        } else {
          dynamicStatus = 'active';
        }
        return {
          ...seat,
          status: dynamicStatus,
        };
      });
    }

    return NextResponse.json({
      content: seatsWithDynamicStatus,
      totalElements: seatsWithDynamicStatus.length,
      totalPages: 1,
      size: seatsWithDynamicStatus.length,
      number: 0,
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Error fetching seats:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi khi tải danh sách ghế' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { room_id, seat_row, seat_number, seat_type_id, status } = body;

    if (!room_id || !seat_row || !seat_number || !seat_type_id) {
      return NextResponse.json(
        { success: false, message: 'Thiếu thông tin bắt buộc' },
        { status: 400 }
      );
    }

    const existingSeat = await prisma.seats.findFirst({
      where: {
        room_id: parseInt(room_id),
        seat_row,
        seat_number: parseInt(seat_number),
      },
    });

    if (existingSeat) {
      return NextResponse.json(
        { success: false, message: 'Ghế này đã tồn tại trong phòng' },
        { status: 400 }
      );
    }

    const seat = await prisma.seats.create({
      data: {
        room_id: parseInt(room_id),
        seat_row,
        seat_number: parseInt(seat_number),
        seat_type_id: parseInt(seat_type_id),
        status: status || 'active',
      },
      include: {
        seattypes: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Tạo ghế thành công',
      data: seat,
    });
  } catch (error) {
    console.error('Error creating seat:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi khi tạo ghế' },
      { status: 500 }
    );
  }
}
