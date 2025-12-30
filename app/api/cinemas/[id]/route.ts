/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const cinemaId = parseInt(id);
    
    if (isNaN(cinemaId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid cinema ID' },
        { status: 400 }
      );
    }

    const cinema = await prisma.cinemas.findFirst({
      where: {
        id: cinemaId,
        is_deleted: false,
      },
    });

    if (!cinema) {
      return NextResponse.json(
        { success: false, error: 'Cinema not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(cinema);
  } catch (error) {
    console.error('Error fetching cinema:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cinema' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const cinemaId = parseInt(id);
    
    if (isNaN(cinemaId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid cinema ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    const existingCinema = await prisma.cinemas.findFirst({
      where: {
        id: cinemaId,
        is_deleted: false,
      },
    });

    if (!existingCinema) {
      return NextResponse.json(
        { success: false, error: 'Cinema not found' },
        { status: 404 }
      );
    }

    const updateData: any = {};
    
    if (body.cinema_name !== undefined) updateData.cinema_name = body.cinema_name;
    if (body.address !== undefined) updateData.address = body.address;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.province_id !== undefined) updateData.province_id = parseInt(body.province_id);
    if (body.latitude !== undefined) updateData.latitude = body.latitude ? String(body.latitude) : null;
    if (body.longitude !== undefined) updateData.longitude = body.longitude ? String(body.longitude) : null;
    if (body.status !== undefined) updateData.status = body.status;

    const updatedCinema = await prisma.cinemas.update({
      where: { id: cinemaId },
      data: updateData,
    });

    return NextResponse.json(updatedCinema);
  } catch (error) {
    console.error('Error updating cinema:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: 'Failed to update cinema', details: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const cinemaId = parseInt(id);
    
    if (isNaN(cinemaId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid cinema ID' },
        { status: 400 }
      );
    }

    const existingCinema = await prisma.cinemas.findFirst({
      where: {
        id: cinemaId,
        is_deleted: false,
      },
    });

    if (!existingCinema) {
      return NextResponse.json(
        { success: false, error: 'Cinema not found' },
        { status: 404 }
      );
    }

    await prisma.cinemas.update({
      where: { id: cinemaId },
      data: {
        is_deleted: true,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting cinema:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: 'Failed to delete cinema', details: errorMessage },
      { status: 500 }
    );
  }
}