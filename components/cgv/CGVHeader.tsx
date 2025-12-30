'use client';

import React, { useState, useEffect } from 'react';
import { 
  UserOutlined, 
  ShoppingCartOutlined, 
  MenuOutlined,
  SearchOutlined,
  GlobalOutlined,
  VideoCameraOutlined,
  PlayCircleOutlined,
  StarOutlined,
  ShopOutlined,
  PhoneOutlined,
  GiftOutlined,
  IdcardOutlined,
  DownOutlined
} from '@ant-design/icons';
import Link from 'next/link';

export default function CGVHeader() {
  const [scrolled, setScrolled] = useState(false);

  // Hiệu ứng shadow khi cuộn trang
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Danh sách menu tiện ích bên dưới để code gọn hơn
  const quickLinks = [
    { href: '/cinemas', icon: <VideoCameraOutlined />, title: 'CGV CINEMAS', sub: 'TÌM RẠP GẦN BẠN' },
    { href: '/showtimes', icon: <PlayCircleOutlined />, title: 'NOW SHOWING', sub: 'PHIM ĐANG CHIẾU' },
    { href: '/special', icon: <StarOutlined />, title: 'CGV SPECIAL', sub: 'RẠP ĐẶC BIỆT' },
    { href: '/rental', icon: <ShopOutlined />, title: 'GROUP SALES', sub: 'THUÊ RẠP & VÉ NHÓM' },
    { href: '/contact', icon: <PhoneOutlined />, title: 'CONTACT CGV', sub: 'LIÊN HỆ CGV' },
    { href: '/news-offers', icon: <GiftOutlined />, title: 'NEWS & OFFERS', sub: 'TIN MỚI & ƯU ĐÃI' },
    { href: '/register', icon: <IdcardOutlined />, title: 'REGISTER', sub: 'ĐĂNG KÝ NGAY' },
  ];

  return (
    <header className={`font-sans z-50 transition-all duration-300 ${scrolled ? 'sticky top-0 shadow-xl' : 'relative'}`}>
      
      {/* --- 1. TOP BAR (Mỏng, tinh tế) --- */}
      <div className="bg-gradient-to-r from-red-900 to-red-700 text-white text-xs md:text-sm py-1.5 transition-colors">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex gap-4 opacity-90">
            <Link href="/news" className="hover:text-yellow-400 transition-colors flex items-center gap-1">
              <GiftOutlined /> TIN MỚI & ƯU ĐÃI
            </Link>
            <span className="text-white/30">|</span>
            <Link href="/my-tickets" className="hover:text-yellow-400 transition-colors">
              VÉ CỦA TÔI
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-yellow-400 flex items-center gap-1 transition-colors">
              <UserOutlined /> ĐĂNG NHẬP / ĐĂNG KÝ
            </Link>
            
            <div className="flex items-center gap-1 bg-black/20 rounded-full px-2 py-0.5 border border-white/10">
              <GlobalOutlined className="text-xs" />
              <button className="px-1.5 font-bold hover:text-yellow-400 transition-colors">VN</button>
              <span className="text-white/30">|</span>
              <button className="px-1.5 opacity-60 hover:opacity-100 hover:text-yellow-400 transition-colors">EN</button>
            </div>
          </div>
        </div>
      </div>

      {/* --- 2. MAIN NAVIGATION (Trắng, Sạch sẽ) --- */}
      <div className="bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex justify-between items-center">
            
            {/* LOGO AREA */}
            <Link href="/" className="group relative flex-shrink-0">
               <img 
                 src="/assets/images/cgvlogo.png" 
                 alt="CGV Cinemas" 
                 className="h-10 md:h-12 object-contain transition-transform duration-300 group-hover:scale-105"
                 onError={(e) => {
                   e.currentTarget.style.display = 'none';
                   e.currentTarget.nextElementSibling?.classList.remove('hidden');
                 }}
               />
               <div className="hidden flex items-center gap-1">
                  <span className="text-red-600 font-black text-4xl tracking-tighter">CGV</span>
                  <StarOutlined className="text-yellow-400 text-xl animate-pulse" />
               </div>
            </Link>

            {/* DESKTOP MENU (Custom đẹp hơn Antd Menu mặc định) */}
            <nav className="hidden lg:flex items-center gap-8 font-bold text-gray-700">
              {['PHIM', 'RẠP CGV', 'THÀNH VIÊN', 'CULTUREPLEX'].map((item, idx) => (
                <div key={idx} className="group relative cursor-pointer py-2">
                  <span className="group-hover:text-red-600 transition-colors duration-300 flex items-center gap-1">
                    {item} <DownOutlined className="text-[10px] opacity-50 group-hover:opacity-100 transition-opacity" />
                  </span>
                  {/* Hiệu ứng gạch chân chạy từ trái sang */}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-600 transition-all duration-300 group-hover:w-full"></span>
                </div>
              ))}
            </nav>

            {/* ACTION BUTTONS */}
            <div className="flex items-center gap-3">
              <button className="hidden md:flex items-center justify-center w-10 h-10 rounded-full text-gray-500 hover:bg-gray-100 hover:text-red-600 transition-all">
                <SearchOutlined className="text-xl" />
              </button>

              <Link href="/booking">
                <button className="bg-red-600 text-white px-5 py-2.5 rounded-full font-bold shadow-lg shadow-red-600/30 hover:shadow-red-600/50 hover:bg-red-700 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 flex items-center gap-2">
                  <ShoppingCartOutlined className="text-lg animate-bounce-slow" />
                  <span className="hidden md:inline">MUA VÉ</span>
                </button>
              </Link>
              
              {/* Mobile Menu Button */}
              <button className="lg:hidden text-2xl text-gray-700 hover:text-red-600 transition-colors">
                <MenuOutlined />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- 3. QUICK LINKS BAR (Icon hiện đại) --- */}
      <div className="bg-pattern bg-gray-50 border-b border-gray-200 shadow-inner overflow-hidden">
        {/* Pattern Background nhẹ */}
        <div className="container mx-auto px-4 py-4 relative">
            {/* Scroll ngang trên mobile, ẩn thanh scroll */}
            <div className="flex md:justify-center items-start gap-4 md:gap-8 overflow-x-auto pb-2 md:pb-0 no-scrollbar snap-x">
              
              {quickLinks.map((link, index) => (
                <Link 
                  href={link.href} 
                  key={index} 
                  className="group flex flex-col items-center min-w-[85px] snap-center cursor-pointer"
                >
                  {/* Icon Circle Container */}
                  <div className="relative mb-2">
                    <div className="w-14 h-14 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-2xl text-gray-400 group-hover:text-white group-hover:bg-red-600 group-hover:border-red-600 group-hover:-translate-y-2 group-hover:shadow-lg group-hover:shadow-red-500/30 transition-all duration-300 ease-out z-10 relative">
                       {link.icon}
                    </div>
                    {/* Bóng đổ giả bên dưới khi icon bay lên */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-black/20 blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  
                  {/* Text */}
                  <div className="text-center group-hover:translate-y-[-4px] transition-transform duration-300">
                    <h3 className="text-[11px] font-bold text-gray-800 uppercase leading-tight group-hover:text-red-600 transition-colors">
                      {link.title}
                    </h3>
                    <p className="text-[9px] text-gray-500 font-medium mt-0.5 truncate max-w-[90px]">
                      {link.sub}
                    </p>
                  </div>
                </Link>
              ))}

            </div>
        </div>
      </div>

      {/* CSS Utility cho scrollbar ẩn (nếu chưa có trong globals.css) */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .animate-bounce-slow {
          animation: bounce 2s infinite;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(-5%); }
          50% { transform: translateY(5%); }
        }
      `}</style>
    </header>
  );
}