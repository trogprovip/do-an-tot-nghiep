import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cinemaId = searchParams.get('cinemaId');

    const where: any = {
      is_deleted: false,
    };

    if (cinemaId) {
      where.cinema_id = parseInt(cinemaId);
    }

    const rooms = await prisma.rooms.findMany({
      where,
      orderBy: { id: 'desc' },
    });

    return NextResponse.json(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch rooms' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const newRoom = await prisma.rooms.create({
      data: {
        cinema_id: parseInt(body.cinema_id),
        room_name: body.room_name,
        room_type: body.room_type,
        total_seats: parseInt(body.total_seats),
        status: body.status || 'active',
        is_deleted: false,
      },
    });

    return NextResponse.json(newRoom, { status: 201 });
  } catch (error) {
    console.error('Error creating room:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create room' },
      { status: 500 }
    );
  }
}