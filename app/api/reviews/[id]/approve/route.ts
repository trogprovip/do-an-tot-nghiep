import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const updatedReview = await prisma.reviews.update({
      where: { id: parseInt(id) },
      data: {
        status: 'approved',
        update_at: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Phê duyệt đánh giá thành công',
      data: updatedReview,
    });
  } catch (error) {
    console.error('Error approving review:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi khi phê duyệt đánh giá' },
      { status: 500 }
    );
  }
}
