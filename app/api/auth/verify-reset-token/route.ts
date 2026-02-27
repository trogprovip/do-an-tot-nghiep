import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, token } = body;

    if (!email || !token) {
      return NextResponse.json(
        { success: false, message: 'Email và mã xác thực là bắt buộc' },
        { status: 400 }
      );
    }

    // Kiểm tra token có tồn tại và còn hiệu lực không
    const resetRecord = await prisma.password_resets.findFirst({
      where: {
        email,
        token,
        expires_at: {
          gt: new Date(),
        },
      },
    });

    if (!resetRecord) {
      return NextResponse.json(
        { success: false, message: 'Mã xác thực không hợp lệ hoặc đã hết hạn' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Mã xác thực hợp lệ',
      email: email,
    });
  } catch (error) {
    console.error('Verify token error:', error);
    return NextResponse.json(
      { success: false, message: 'Có lỗi xảy ra khi xác thực mã' },
      { status: 500 }
    );
  }
}
