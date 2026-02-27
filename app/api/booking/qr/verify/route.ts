/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// JWT secret for QR code
const QR_SECRET = process.env.QR_SECRET || 'your-qr-secret-key';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Nếu token là URL, extract ticket ID từ URL
    let ticketId;
    let decoded;

    if (token.includes('/verify?id=')) {
      // Extract ticket ID từ URL: http://localhost:3000/verify?id=123
      const urlParts = token.split('/verify?id=');
      if (urlParts.length > 1) {
        ticketId = parseInt(urlParts[1]);
        if (isNaN(ticketId)) {
          return NextResponse.json(
            { error: 'Invalid ticket ID in URL' },
            { status: 400 }
          );
        }
      } else {
        return NextResponse.json(
          { error: 'Invalid URL format' },
          { status: 400 }
        );
      }
    } else {
      // Nếu là JWT token, verify và lấy ticket ID
      try {
        decoded = jwt.verify(token, QR_SECRET) as any;
        ticketId = decoded.ticketId;
      } catch (jwtError) {
        return NextResponse.json(
          { error: 'Invalid QR code token' },
          { status: 400 }
        );
      }
    }

    // Get fresh ticket data
    const ticket = await prisma.tickets.findUnique({
      where: { id: ticketId },
      include: {
        accounts: {
          select: {
            id: true,
            username: true,
            email: true
          }
        },
        slots: {
          include: {
            movies: true,
            rooms: {
              include: {
                cinemas: true
              }
            }
          }
        },
        bookingseats: {
          include: {
            seats: true
          }
        }
      }
    });

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      valid: true,
      ticket: {
        id: ticket.id,
        ticketCode: ticket.tickets_code,
        movieTitle: ticket.slots.movies.title,
        moviePoster: ticket.slots.movies.poster_url,
        showtime: ticket.slots.show_time,
        cinema: ticket.slots.rooms?.cinemas?.cinema_name || 'N/A',
        cinemaAddress: ticket.slots.rooms?.cinemas?.address || 'N/A',
        screen: ticket.slots.rooms?.room_name || 'N/A',
        seats: ticket.bookingseats.map((bs) => ({
          row: bs.seats.seat_row,
          number: bs.seats.seat_number,
          type: bs.seats.seat_type_id,
          price: bs.seat_price
        })),
        user: ticket.accounts.username,
        totalAmount: ticket.total_amount,
        status: ticket.status,
        paymentStatus: ticket.payment_status
      }
    });

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { error: 'Invalid QR code' },
        { status: 400 }
      );
    }

    if (error instanceof jwt.TokenExpiredError) {
      return NextResponse.json(
        { error: 'QR code has expired' },
        { status: 400 }
      );
    }

    console.error('Error verifying QR code:', error);
    return NextResponse.json(
      { error: 'Failed to verify QR code' },
      { status: 500 }
    );
  }
}
