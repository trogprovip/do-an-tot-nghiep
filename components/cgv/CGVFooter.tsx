'use client';

import React from 'react';
import { 
  FacebookFilled, 
  YoutubeFilled, 
  InstagramFilled, 
  PhoneFilled,
  MailFilled,
  ClockCircleFilled,
  CheckCircleFilled,
  SafetyCertificateFilled
} from '@ant-design/icons';
import Link from 'next/link';

export default function CGVFooter() {


  return (
    <footer className="relative bg-[#fdfcf0] pt-10 text-gray-700 overflow-hidden font-sans border-t-4 border-red-600">
      
      {/* Họa tiết nền mờ */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#d90000 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      </div>


      {/* Main Footer Content */}
      <div className="relative z-10 container mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Column 1: CGV Vietnam */}
          <div>
            <h3 className="font-extrabold text-xl text-red-700 mb-6 uppercase tracking-tight border-b-2 border-red-100 inline-block pb-1">CGV Việt Nam</h3>
            <ul className="space-y-3 text-sm font-medium">
              {['Giới Thiệu', 'Dành cho đối tác', 'Liên Hệ Quảng Cáo'].map((item) => (
                <li key={item}>
                  <Link href="#" className="flex items-center group">
                    <span className="w-1.5 h-1.5 bg-gray-300 rounded-full mr-2 group-hover:bg-red-600 transition-colors"></span>
                    <span className="group-hover:text-red-600 group-hover:translate-x-1 transition-all duration-300">{item}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Terms & Conditions */}
          <div>
            <h3 className="font-extrabold text-xl text-red-700 mb-6 uppercase tracking-tight border-b-2 border-red-100 inline-block pb-1">Điều khoản</h3>
            <ul className="space-y-3 text-sm font-medium">
              {['Điều Khoản Chung', 'Điều Khoản Giao Dịch', 'Chính Sách Thanh Toán', 'Chính Sách Bảo Mật', 'Câu Hỏi Thường Gặp'].map((item) => (
                <li key={item}>
                  <Link href="#" className="flex items-center group">
                    <span className="w-1.5 h-1.5 bg-gray-300 rounded-full mr-2 group-hover:bg-red-600 transition-colors"></span>
                    <span className="group-hover:text-red-600 group-hover:translate-x-1 transition-all duration-300">{item}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Connect with us - Màu mè hơn */}
          <div>
            <h3 className="font-extrabold text-xl text-red-700 mb-6 uppercase tracking-tight border-b-2 border-red-100 inline-block pb-1">Kết nối</h3>
            <div className="flex gap-3 mb-6">
              <Link href="https://facebook.com" target="_blank" className="group">
                <div className="w-11 h-11 bg-white border-2 border-blue-600 rounded-full flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-lg group-hover:-translate-y-1">
                  <FacebookFilled className="text-xl" />
                </div>
              </Link>
              <Link href="https://youtube.com" target="_blank" className="group">
                <div className="w-11 h-11 bg-white border-2 border-red-600 rounded-full flex items-center justify-center text-red-600 group-hover:bg-red-600 group-hover:text-white transition-all duration-300 shadow-lg group-hover:-translate-y-1">
                  <YoutubeFilled className="text-xl" />
                </div>
              </Link>
              <Link href="https://instagram.com" target="_blank" className="group">
                <div className="w-11 h-11 bg-white border-2 border-pink-500 rounded-full flex items-center justify-center text-pink-500 group-hover:bg-gradient-to-tr group-hover:from-purple-500 group-hover:to-pink-500 group-hover:border-transparent group-hover:text-white transition-all duration-300 shadow-lg group-hover:-translate-y-1">
                  <InstagramFilled className="text-xl" />
                </div>
              </Link>
              <Link href="https://zalo.me" target="_blank" className="group">
                <div className="w-11 h-11 bg-white border-2 border-blue-400 rounded-full flex items-center justify-center text-blue-400 group-hover:bg-blue-400 group-hover:text-white transition-all duration-300 shadow-lg group-hover:-translate-y-1 font-bold text-xs">
                  Zalo
                </div>
              </Link>
            </div>

            {/* Certification Badge - Style mới */}
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-white border-2 border-blue-600 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
               <SafetyCertificateFilled className="text-3xl text-blue-600" />
               <div className="leading-tight">
                  <div className="text-[10px] font-bold text-gray-500">ĐÃ THÔNG BÁO</div>
                  <div className="text-xs font-black text-blue-800">BỘ CÔNG THƯƠNG</div>
               </div>
            </div>
          </div>

          {/* Column 4: Customer Care - Nổi bật Hotline */}
          <div>
            <h3 className="font-extrabold text-xl text-red-700 mb-6 uppercase tracking-tight border-b-2 border-red-100 inline-block pb-1">Chăm sóc khách hàng</h3>
            <div className="bg-white p-5 rounded-xl border border-red-100 shadow-[0_4px_15px_rgba(220,38,38,0.05)]">
              <div className="mb-4 text-center">
                 <p className="text-xs text-gray-500 uppercase font-bold mb-1">Hotline hỗ trợ</p>
                 <a href="tel:19006017" className="text-3xl font-black text-red-600 hover:scale-105 inline-block transition-transform flex items-center justify-center gap-2">
                    <PhoneFilled className="text-2xl"/> 1900 6017
                 </a>
                 <p className="text-xs text-gray-400 mt-1">1000đ/phút</p>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600 border-t border-dashed border-gray-200 pt-3">
                 <div className="flex items-start gap-2">
                    <ClockCircleFilled className="text-red-500 mt-0.5" />
                    <span>08:00 - 22:00 (Tất cả các ngày)</span>
                 </div>
                 <div className="flex items-start gap-2">
                    <MailFilled className="text-red-500 mt-0.5" />
                    <a href="mailto:hoidap@cgv.vn" className="hover:text-red-600 hover:underline">hoidap@cgv.vn</a>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Company Info - Nền tối tạo độ nặng cho footer */}
      <div className="bg-[#1a1a1a] text-gray-400 py-8 border-t-4 border-yellow-500 relative">
         <div className="container mx-auto px-4">
             {/* Logo Footer */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6">
                <div 
                    className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                    style={{ fontFamily: 'Impact, sans-serif' }}
                >
                    CGV CINEMAS
                </div>
                <div className="flex gap-4">
                    <span className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-white hover:text-black transition-colors cursor-pointer"><CheckCircleFilled /></span>
                    <span className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-white hover:text-black transition-colors cursor-pointer"><MailFilled /></span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs leading-relaxed">
                <div>
                    <h4 className="text-white font-bold mb-2 uppercase">Công Ty TNHH CJ CGV Việt Nam</h4>
                    <p>Giấy CNĐKDN: 0303675393, đăng ký lần đầu ngày 31/7/2008, được cấp bởi Sở Kế hoạch và Đầu tư Thành phố Hồ Chí Minh.</p>
                    <p className="mt-2">Địa chỉ: Lầu 2, số 7/28, đường Thành Thái, phường 14, Quận 10, Thành phố Hồ Chí Minh, Việt Nam.</p>
                </div>
                <div className="md:text-right flex flex-col justify-end">
                    <p>COPYRIGHT © 2017 CJ CGV VIETNAM CO., LTD.</p>
                    <p>ALL RIGHTS RESERVED.</p>
                    <div className="mt-2 text-yellow-600 italic">Chính sách bảo mật | Điều khoản sử dụng</div>
                </div>
            </div>
         </div>

         {/* Decorative Brick Wall Bottom */}
         <div 
           className="absolute bottom-0 left-0 right-0 h-3 opacity-30"
           style={{
             backgroundImage: 'repeating-linear-gradient(45deg, #b91c1c 0px, #b91c1c 10px, #991b1b 10px, #991b1b 20px)',
           }}
         />
      </div>
    </footer>
  );
}