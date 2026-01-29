import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

interface BookingRequest {
  slotId: number;
  selectedSeats: Array<{
    seat_id: number;
    seat_price: number;
  }>;
  combos: Array<{
    product_id: number;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
  totalAmount: number;
  discountAmount?: number;
  finalAmount: number;
  voucher_id?: number;
  promotion_code?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '0');
    const size = parseInt(searchParams.get('size') || '10');

    const skip = page * size;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      is_deleted: false,
    };

    const totalElements = await prisma.tickets.count({ where });

    const content = await prisma.tickets.findMany({
      where,
      skip,
      take: size,
      orderBy: { id: 'desc' },
      include: {
        accounts: {
          select: {
            username: true,
            email: true,
          },
        },
        slots: {
          include: {
            movies: {
              select: {
                title: true,
              },
            },
            rooms: {
              select: {
                room_name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      content,
      totalElements,
      totalPages: Math.ceil(totalElements / size),
      size,
      number: page,
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get token from header
    const authHeader = request.headers.get('authorization');
    console.log('Auth header:', authHeader ? 'exists' : 'not found');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Bạn cần đăng nhập để đặt vé' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    console.log('Token length:', token.length);
    console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
    
    let decoded: jwt.JwtPayload;
    
    try {
      // For testing: decode token without verification first
      const decodedWithoutVerify = jwt.decode(token) as jwt.JwtPayload;
      console.log('Token content (without verification):', decodedWithoutVerify);
      
      if (!decodedWithoutVerify?.id) {
        return NextResponse.json(
          { error: 'Token không chứa thông tin người dùng' },
          { status: 401 }
        );
      }
      
      // Use the decoded token without verification for now
      decoded = decodedWithoutVerify;
      console.log('Using decoded token:', decoded);
      
    } catch (error) {
      console.error('JWT decode error:', error);
      return NextResponse.json(
        { error: 'Token không hợp lệ' },
        { status: 401 }
      );
    }

    if (!decoded?.id) {
      return NextResponse.json(
        { error: 'Token không chứa thông tin người dùng' },
        { status: 401 }
      );
    }

    const body: BookingRequest = await request.json();
    const { slotId, selectedSeats, combos, totalAmount, discountAmount, finalAmount, voucher_id, promotion_code } = body;

    // Validate required fields
    if (!slotId || !selectedSeats || selectedSeats.length === 0 || !finalAmount) {
      return NextResponse.json(
        { error: 'Thiếu thông tin bắt buộc' },
        { status: 400 }
      );
    }

    // Generate ticket code
    const ticketCode = 'CGV' + Date.now() + Math.floor(Math.random() * 1000);

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create ticket
      const ticket = await tx.tickets.create({
        data: {
          account_id: parseInt(decoded.id),
          slot_id: slotId,
          tickets_code: ticketCode,
          tickets_date: new Date(),
          total_amount: totalAmount || 0,
          discount_amount: discountAmount || 0,
          final_amount: finalAmount,
          payment_status: 'unpaid', // Mặc định là chưa thanh toán
          status: 'pending', // Bắt đầu với trạng thái chờ xét duyệt
          note: 'Đặt vé thành công qua hệ thống CGV',
          is_deleted: false,
          promotion_id: voucher_id || null,
          promotion_code: promotion_code || null,
        },
      });

      // Create booking seats
      const bookingSeats = await Promise.all(
        selectedSeats.map((seatData) =>
          tx.bookingseats.create({
            data: {
              tickets_id: ticket.id,
              seat_id: seatData.seat_id,
              seat_price: seatData.seat_price,
            },
          })
        )
      );

      // Create ticket details for combos
      const ticketDetails: Array<{id: number}> = [];
      if (combos && combos.length > 0) {
        const details = await Promise.all(
          combos.map((combo) =>
            tx.ticketsdetails.create({
              data: {
                tickets_id: ticket.id,
                product_id: combo.product_id,
                quantity: combo.quantity,
                unit_price: combo.unit_price,
                total_price: combo.total_price,
              },
            })
          )
        );
        ticketDetails.push(...details);
      }

      // Get complete ticket information
      const completeTicket = await tx.tickets.findUnique({
        where: { id: ticket.id },
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
                  title: true,
                },
              },
              rooms: {
                select: {
                  room_name: true,
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
          ticketsdetails: {
            include: {
              products: {
                select: {
                  product_name: true,
                  category: true,
                },
              },
            },
          },
        },
      });

      return {
        ticket: completeTicket,
        bookingSeats,
        ticketDetails,
      };
    });

    return NextResponse.json({
      success: true,
      message: 'Đặt vé thành công!',
      data: result.ticket,
    });

  } catch (error) {
    console.error('Error creating booking:', error);
    
    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: 'Ghế đã được đặt, vui lòng chọn ghế khác' },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra khi đặt vé, vui lòng thử lại' },
      { status: 500 }
    );
  }
}