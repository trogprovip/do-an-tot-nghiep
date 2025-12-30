'use client';

import React from 'react';
import { FacebookOutlined, YoutubeOutlined, InstagramOutlined } from '@ant-design/icons';
import Link from 'next/link';

export default function CGVFooter() {
  return (
    <footer className="bg-white border-t-2 border-gray-200">
      {/* Cinema Brands */}
      <div className="bg-gray-50 py-6 border-b">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center gap-8 flex-wrap">
            <span className="text-gray-400 font-bold">IMAX</span>
            <span className="text-gray-400 font-bold">STARIUM</span>
            <span className="text-gray-400 font-bold">GOLDCLASS</span>
            <span className="text-pink-500 font-bold">SWEETBOX</span>
            <span className="text-red-600 font-bold">PREMIUM CINEMA</span>
            <span className="text-gray-400 font-bold">CINE & FORET</span>
            <span className="text-gray-400 font-bold">CINE & LIVING ROOM</span>
            <span className="text-gray-400 font-bold">CINESUITE</span>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* CGV Vietnam */}
          <div>
            <h3 className="font-bold text-lg mb-4">CGV Việt Nam</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/about" className="hover:text-red-600">Giới Thiệu</Link></li>
              <li><Link href="/online-services" className="hover:text-red-600">Tiện Ích Online</Link></li>
              <li><Link href="/gift-card" className="hover:text-red-600">Thẻ Quà Tặng</Link></li>
              <li><Link href="/recruitment" className="hover:text-red-600">Tuyển Dụng</Link></li>
              <li><Link href="/advertising" className="hover:text-red-600">Liên Hệ Quảng Cáo CGV</Link></li>
              <li><Link href="/partners" className="hover:text-red-600">Dành cho đối tác</Link></li>
            </ul>
          </div>

          {/* Terms & Conditions */}
          <div>
            <h3 className="font-bold text-lg mb-4">Điều khoản sử dụng</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/terms-general" className="hover:text-red-600">Điều Khoản Chung</Link></li>
              <li><Link href="/terms-transaction" className="hover:text-red-600">Điều Khoản Giao Dịch</Link></li>
              <li><Link href="/terms-payment" className="hover:text-red-600">Chính Sách Thanh Toán</Link></li>
              <li><Link href="/privacy" className="hover:text-red-600">Chính Sách Bảo Mật</Link></li>
              <li><Link href="/faq" className="hover:text-red-600">Câu Hỏi Thường Gặp</Link></li>
            </ul>
          </div>

          {/* Connect with us */}
          <div>
            <h3 className="font-bold text-lg mb-4">Kết nối với chúng tôi</h3>
            <div className="flex gap-4 mb-6">
              <Link href="https://facebook.com/cgvcinemasvietnam" target="_blank">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                  <FacebookOutlined className="text-white text-xl" />
                </div>
              </Link>
              <Link href="https://youtube.com/cgvcinemas" target="_blank">
                <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors">
                  <YoutubeOutlined className="text-white text-xl" />
                </div>
              </Link>
              <Link href="https://instagram.com/cgvcinemasvietnam" target="_blank">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center hover:opacity-90 transition-opacity">
                  <InstagramOutlined className="text-white text-xl" />
                </div>
              </Link>
              <Link href="https://zalo.me/cgvcinemas" target="_blank">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                  <span className="text-white font-bold text-sm">Zalo</span>
                </div>
              </Link>
            </div>

            {/* Certification Badge */}
            <div className="mt-4">
              <div className="border-2 border-blue-600 rounded-lg p-3 inline-block">
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xs">✓</span>
                  </div>
                  <div className="text-xs">
                    <div className="font-bold text-blue-600">ĐÃ THÔNG BÁO</div>
                    <div className="text-gray-600">BỘ CÔNG THƯƠNG</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Care */}
          <div>
            <h3 className="font-bold text-lg mb-4">Chăm sóc khách hàng</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div>
                <p className="font-semibold text-gray-800">Hotline: 1900 6017</p>
              </div>
              <div>
                <p>Giờ làm việc: 8:00 - 22:00</p>
                <p>(Tất cả các ngày bao gồm cả Lễ Tết)</p>
              </div>
              <div>
                <p>Email hỗ trợ: <Link href="mailto:hoidap@cgv.vn" className="text-blue-600 hover:underline">hoidap@cgv.vn</Link></p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Company Info */}
      <div className="bg-gray-50 py-6 border-t">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-red-600 font-bold text-2xl">CGV</div>
            <span className="text-yellow-500 text-xl">★</span>
          </div>
          
          <div className="text-xs text-gray-600 space-y-1">
            <p className="font-semibold">CÔNG TY TNHH CJ CGV VIỆT NAM</p>
            <p>Giấy CNĐKDN: 0303675393, đăng ký lần đầu ngày 31/7/2008, được cấp bởi Sở Kế hoạch và Đầu tư Thành phố Hồ Chí Minh</p>
            <p>Địa chỉ: Lầu 2, số 7/28, đường Thành Thái, phường Điện Hồng, Thành phố Hồ Chí Minh, Việt Nam</p>
            <p>Đường dây nóng (Hotline): 1900 6017</p>
            <p className="mt-4">COPYRIGHT 2017 CJ CGV VIETNAM CO., LTD. ALL RIGHTS RESERVED</p>
          </div>
        </div>
      </div>

      {/* Brick Wall Bottom */}
      <div 
        className="h-16 bg-orange-800"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, #8B4513 0px, #8B4513 2px, transparent 2px, transparent 16px), repeating-linear-gradient(90deg, #A0522D 0px, #A0522D 2px, transparent 2px, transparent 60px)',
        }}
      />
    </footer>
  );
}
