import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '0');
    const size = parseInt(searchParams.get('size') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    const skip = page * size;

    const where: Record<string, unknown> = {
      is_deleted: false,
    };

    if (search) {
      where.tickets_code = { contains: search };
    }

    if (status) {
      where.status = status;
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
