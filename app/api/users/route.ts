import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '0');
    const size = parseInt(searchParams.get('size') || '10');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';

    const skip = page * size;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      is_deleted: false,
    };

    if (search) {
      where.OR = [
        { username: { contains: search } },
        { email: { contains: search } },
        { full_name: { contains: search } },
      ];
    }

    if (role) {
      where.role = role;
    }

    const totalElements = await prisma.accounts.count({ where });

    const content = await prisma.accounts.findMany({
      where,
      skip,
      take: size,
      orderBy: { id: 'desc' },
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        full_name: true,
        role: true,
        create_at: true,
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
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const newUser = await prisma.accounts.create({
      data: {
        username: body.username,
        password_hash: body.password_hash,
        email: body.email,
        phone: body.phone,
        full_name: body.full_name,
        role: body.role || 'user',
        create_at: new Date(),
        is_deleted: false,
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
