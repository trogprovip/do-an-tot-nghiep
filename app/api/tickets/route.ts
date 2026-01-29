import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '0');
    const size = parseInt(searchParams.get('size') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const payment_status = searchParams.get('payment_status') || '';

    const skip = page * size;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      is_deleted: false,
    };

    if (search) {
      where.OR = [
        { tickets_code: { contains: search } },
        { accounts: { full_name: { contains: search } } },
        { accounts: { email: { contains: search } } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (payment_status) {
      where.payment_status = payment_status;
    }

    const totalElements = await prisma.tickets.count({ where });

    const content = await prisma.tickets.findMany({
      where,
      skip,
      take: size,
      orderBy: { id: 'desc' },
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
        promotions: {
          select: {
            id: true,
            promotion_code: true,
            promotion_name: true,
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
    console.error('Error fetching tickets:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tickets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.account_id || !body.slot_id || !body.tickets_code) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newTicket = await prisma.tickets.create({
      data: {
        account_id: parseInt(body.account_id),
        slot_id: parseInt(body.slot_id),
        tickets_code: body.tickets_code,
        tickets_date: new Date(),
        total_amount: parseFloat(body.total_amount) || 0,
        discount_amount: body.discount_amount ? parseFloat(body.discount_amount) : 0,
        final_amount: parseFloat(body.final_amount) || 0,
        payment_status: body.payment_status || 'unpaid',
        status: body.status || 'pending',
        note: body.note || null,
        is_deleted: false,
      },
    });

    return NextResponse.json(newTicket, { status: 201 });
  } catch (error) {
    console.error('Error creating ticket:', error);
    return NextResponse.json(
      { error: 'Failed to create ticket' },
      { status: 500 }
    );
  }
}
