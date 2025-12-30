import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '0');
    const size = parseInt(searchParams.get('size') || '10');

    const skip = page * size;

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