import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendPasswordResetEmail } from '@/lib/services/emailService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email là bắt buộc' },
        { status: 400 }
      );
    }

    // Kiểm tra email tồn tại trong hệ thống
    const user = await prisma.accounts.findFirst({
      where: {
        email,
        is_deleted: false,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Email không tồn tại trong hệ thống' },
        { status: 404 }
      );
    }

    // Tạo mã xác thực 6 số
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 phút

    // Xóa các token cũ của email này (nếu có)
    await prisma.password_resets.deleteMany({
      where: {
        email,
      },
    });

    // Lưu mã mới vào database
    await prisma.password_resets.create({
      data: {
        email,
        token,
        expires_at: expiresAt,
      },
    });

    // Gửi email chứa mã xác thực
    try {
      await sendPasswordResetEmail(email, token);
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      return NextResponse.json(
        { success: false, message: 'Không thể gửi email. Vui lòng thử lại sau.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Mã xác thực đã được gửi đến email của bạn',
      email: email, // Trả về email để frontend có thể sử dụng
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { success: false, message: 'Có lỗi xảy ra khi xử lý yêu cầu' },
      { status: 500 }
    );
  }
}
