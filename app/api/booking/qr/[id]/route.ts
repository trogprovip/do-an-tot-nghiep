/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import QRCode from 'qrcode';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// JWT secret for QR code
const QR_SECRET = process.env.QR_SECRET || 'your-qr-secret-key';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ticketId = parseInt(id);
    
    if (isNaN(ticketId)) {
      return NextResponse.json(
        { error: 'Invalid ticket ID' },
        { status: 400 }
      );
    }

    // Get ticket details with all related data
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

    // Generate QR code with simple ticket ID for easier scanning
    const qrData = {
      ticketId: ticket.id,
      ticketCode: ticket.tickets_code,
      movieTitle: ticket.slots.movies.title,
      showtime: ticket.slots.show_time,
      cinema: ticket.slots.rooms?.cinemas?.cinema_name || 'N/A',
      screen: ticket.slots.rooms?.room_name || 'N/A',
      seats: ticket.bookingseats.map((bs) => bs.seats.seat_row + bs.seats.seat_number),
      user: ticket.accounts.username,
      totalAmount: ticket.total_amount,
      status: ticket.status,
      timestamp: new Date().toISOString()
    };

    // Create JWT token for QR code - NO EXPIRATION for permanent validity
    const token = jwt.sign(qrData, QR_SECRET);

    // Create QR code with simple URL containing only ticket ID
    // Dùng IP address để điện thoại có thể truy cập
    const baseUrl = 'http://192.168.1.100:3000'; // Thay bằng IP của bạn
    const qrUrl = `${baseUrl}/verify?id=${ticket.id}`;

    // Generate QR code image
    const qrCodeDataURL = await QRCode.toDataURL(qrUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    return NextResponse.json({
      success: true,
      qrCode: qrCodeDataURL,
      ticketData: qrData
    });

  } catch (error) {
    console.error('Error generating QR code:', error);
    return NextResponse.json(
      { error: 'Failed to generate QR code' },
      { status: 500 }
    );
  }
}

// Public endpoint to verify QR code
export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Verify JWT token
    const decoded = jwt.verify(token, QR_SECRET) as any;

    // Get fresh ticket data
    const ticket = await prisma.tickets.findUnique({
      where: { id: decoded.ticketId },
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

    console.error('Error verifying QR code:', error);
    return NextResponse.json(
      { error: 'Failed to verify QR code' },
      { status: 500 }
    );
  }
}
