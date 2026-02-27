import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, token, newPassword } = body;

    if (!email || !token || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'Thiếu thông tin bắt buộc' },
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

    // Kiểm tra độ dài mật khẩu
    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Mật khẩu phải có ít nhất 6 ký tự' },
        { status: 400 }
      );
    }

    // Mã hóa mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Cập nhật mật khẩu trong database
    await prisma.accounts.update({
      where: { email },
      data: { 
        password_hash: hashedPassword,
        update_at: new Date()
      },
    });

    // Xóa token đã sử dụng và tất cả token cũ của email này
    await prisma.password_resets.deleteMany({
      where: { email },
    });

    return NextResponse.json({
      success: true,
      message: 'Đặt lại mật khẩu thành công. Bạn có thể đăng nhập với mật khẩu mới.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { success: false, message: 'Có lỗi xảy ra khi đặt lại mật khẩu' },
      { status: 500 }
    );
  }
}
