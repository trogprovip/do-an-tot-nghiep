/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bookingId = parseInt(params.id);
    
    if (isNaN(bookingId)) {
      return NextResponse.json(
        { error: 'Invalid booking ID' },
        { status: 400 }
      );
    }

    const ticket = await prisma.tickets.findUnique({
      where: { id: bookingId },
      include: {
        slots: {
          include: {
            movies: {
              select: {
                title: true,
                poster_url: true
              }
            },
            rooms: {
              include: {
                cinemas: {
                  select: {
                    cinema_name: true,
                    address: true
                  }
                }
              }
            }
          }
        },
        bookingseats: {
          include: {
            seats: {
              include: {
                seattypes: {
                  select: {
                    type_name: true,
                    price_multiplier: true
                  }
                }
              }
            }
          }
        },
        accounts: {
          select: {
            username: true,
            email: true,
            phone: true
          }
        }
      }
    });

    if (!ticket) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Transform the data to match the expected format
    const formattedBooking = {
      id: ticket.id,
      booking_code: ticket.tickets_code,
      total_amount: parseFloat(ticket.final_amount.toString()),
      status: ticket.status,
      payment_method: 'VNPay',
      created_at: ticket.tickets_date?.toISOString() || new Date().toISOString(),
      movie: ticket.slots?.movies || null,
      showtime: {
        start_time: ticket.slots?.show_time?.toISOString().split('T')[1]?.substring(0, 5) || '',
        date: ticket.slots?.show_time?.toISOString().split('T')[0] || '',
        room: {
          name: ticket.slots?.rooms?.room_name || '',
          cinema: {
            name: ticket.slots?.rooms?.cinemas?.cinema_name || '',
            address: ticket.slots?.rooms?.cinemas?.address || ''
          }
        }
      },
      seats: ticket.bookingseats.map((bs: any) => ({
        seat_number: bs.seats?.seat_row + bs.seats?.seat_number.toString(),
        seat_type: {
          name: bs.seats?.seattypes?.type_name || 'Standard',
          price: bs.seats?.seattypes?.price_multiplier ? 75000 * parseFloat(bs.seats.seattypes.price_multiplier.toString()) : 75000
        }
      })),
      user: {
        full_name: ticket.accounts?.username || '',
        email: ticket.accounts?.email || '',
        phone: ticket.accounts?.phone || ''
      }
    };

    return NextResponse.json(formattedBooking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
