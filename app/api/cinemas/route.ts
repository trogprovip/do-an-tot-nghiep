import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '0');
    const size = parseInt(searchParams.get('size') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const provinceId = searchParams.get('provinceId');

    const skip = page * size;

    const where: any = {
      is_deleted: false,
    };

    if (search) {
      where.OR = [
        { cinema_name: { contains: search } },
        { address: { contains: search } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (provinceId) {
      where.province_id = parseInt(provinceId);
    }

    const totalElements = await prisma.cinemas.count({ where });

    const content = await prisma.cinemas.findMany({
      where,
      skip,
      take: size,
      orderBy: { id: 'desc' },
    });

    return NextResponse.json({
      content,
      totalElements,
      totalPages: Math.ceil(totalElements / size),
      size,
      number: page,
    });
  } catch (error) {
    console.error('Error fetching cinemas:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cinemas', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('Creating cinema with data:', body);

    if (!body.cinema_name || !body.address || !body.phone || !body.email || !body.province_id) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: cinema_name, address, phone, email, province_id' },
        { status: 400 }
      );
    }

    const newCinema = await prisma.cinemas.create({
      data: {
        cinema_name: body.cinema_name,
        address: body.address,
        phone: body.phone,
        email: body.email,
        province_id: parseInt(body.province_id),
        latitude: body.latitude ? String(body.latitude) : null,
        longitude: body.longitude ? String(body.longitude) : null,
        status: body.status || 'active',
        create_at: new Date(),
        is_deleted: false,
      },
    });

    console.log('Cinema created successfully:', newCinema);

    return NextResponse.json(newCinema, { status: 201 });
  } catch (error) {
    console.error('Error creating cinema:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: 'Failed to create cinema', details: errorMessage },
      { status: 500 }
    );
  }
}