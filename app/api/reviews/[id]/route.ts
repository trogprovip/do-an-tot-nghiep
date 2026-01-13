import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.reviews.update({
      where: { id: parseInt(id) },
      data: { is_deleted: true },
    });

    return NextResponse.json({
      success: true,
      message: 'Xóa đánh giá thành công',
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi khi xóa đánh giá' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updatedReview = await prisma.reviews.update({
      where: { id: parseInt(id) },
      data: {
        comment: body.comment,
        update_at: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Cập nhật đánh giá thành công',
      data: updatedReview,
    });
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi khi cập nhật đánh giá' },
      { status: 500 }
    );
  }
}
