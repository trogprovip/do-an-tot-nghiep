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

    const totalElements = await prisma.news.count({ where });

    const content = await prisma.news.findMany({
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
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const newNews = await prisma.news.create({
      data: {
        title: body.title,
        content: body.content,
        image_url: body.image_url,
        create_at: new Date(),
        is_deleted: false,
      },
    });

    return NextResponse.json(newNews, { status: 201 });
  } catch (error) {
    console.error('Error creating news:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create news' },
      { status: 500 }
    );
  }
}