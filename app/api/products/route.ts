/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '0');
    const size = parseInt(searchParams.get('size') || '10');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';

    const skip = page * size;

    const where: any = {
      is_deleted: false,
    };

    if (search) {
      where.product_name = { contains: search };
    }

    if (category) {
      where.category = category;
    }

    const totalElements = await prisma.products.count({ where });

    const content = await prisma.products.findMany({
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
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const newProduct = await prisma.products.create({
      data: {
        product_name: body.product_name,
        category: body.category,
        description: body.description,
        price: parseFloat(body.price),
        image_url: body.image_url,
        create_at: new Date(),
        is_deleted: false,
      },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
