import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Cho phép truy cập trang đăng nhập admin mà không cần kiểm tra
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  // Kiểm tra tất cả các route admin khác
  if (pathname.startsWith('/admin')) {
    // Lấy token ADMIN (không phải token user)
    const adminToken = request.cookies.get('admin_auth_token')?.value;

    // Nếu không có token admin → chuyển về trang đăng nhập admin
    if (!adminToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    try {
      // Parse JWT token để lấy thông tin user
      const base64Payload = adminToken.split('.')[1];
      const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString());
      
      // Kiểm tra token hết hạn
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        const response = NextResponse.redirect(new URL('/admin/login', request.url));
        response.cookies.delete('admin_auth_token');
        return response;
      }
      
      // Kiểm tra role - CHỈ cho phép admin
      if (payload.role !== 'admin') {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
    } catch (error) {
      console.error('Token parsing failed:', error);
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // Kiểm tra các route user (nếu cần)
  if (pathname.startsWith('/profile') || pathname.startsWith('/booking') || pathname.startsWith('/cgv/profile')) {
    // Lấy token USER (không phải token admin)
    const userToken = request.cookies.get('auth_token')?.value;

    if (!userToken) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    try {
      const base64Payload = userToken.split('.')[1];
      const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString());
      
      // Kiểm tra token hết hạn
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        const response = NextResponse.redirect(new URL('/auth/login', request.url));
        response.cookies.delete('auth_token');
        return response;
      }
    } catch (error) {
      console.error('Token parsing failed:', error);
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',      // Bảo vệ tất cả route admin
    '/profile/:path*',    // Bảo vệ route user (nếu cần)
    '/booking/:path*',    // Bảo vệ route booking (nếu cần)
    '/cgv/profile',       // Bảo vệ trang profile CGV
  ],
};