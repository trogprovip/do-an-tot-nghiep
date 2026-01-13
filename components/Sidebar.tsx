'use client';

import React from 'react';
import { usePathname } from 'next/navigation'; // Hook để lấy đường dẫn hiện tại
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Users, 
  Film, 
  Building2, 
  Ticket, 
  ShoppingBag, 
  Newspaper,
  MapPin,
  DoorOpen,
  Clock,
  ChevronRight,
  Tag,
  Armchair,
  Sofa,
  Star
} from 'lucide-react';
import { DollarCircleOutlined } from '@ant-design/icons';
// Phân nhóm menu để sidebar cân đối hơn
const menuGroups = [
  {
    title: 'TỔNG QUAN',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
    ]
  },
  {
    title: 'NỘI DUNG & SẢN PHẨM',
    items: [
      { icon: Film, label: 'Quản lý Phim', href: '/admin/movies' },
      { icon: Star, label: 'Quản lý Đánh giá', href: '/admin/reviews' },
      { icon: Newspaper, label: 'Quản lý Tin tức', href: '/admin/news' },
      { icon: ShoppingBag, label: 'Quản lý Sản phẩm', href: '/admin/products' },
    ]
  },
  {
    title: 'VẬN HÀNH RẠP',
    items: [
      { icon: Building2, label: 'Quản lý Rạp', href: '/admin/cinemas' },
      { icon: MapPin, label: 'Quản lý Tỉnh/TP', href: '/admin/provinces' },
      { icon: DoorOpen, label: 'Quản lý Phòng chiếu', href: '/admin/rooms' },
      { icon: Sofa, label: 'Quản lý Loại ghế', href: '/admin/seat-types' },
      { icon: Armchair, label: 'Quản lý Ghế', href: '/admin/seats' },
      { icon: Clock, label: 'Quản lý Suất chiếu', href: '/admin/slots' },
      { icon: Ticket, label: 'Quản lý Vé', href: '/admin/tickets' },
    ]
  },
  {
    title: 'HỆ THỐNG',
    items: [
      { icon: Users, label: 'Người dùng', href: '/admin/users' },
      { icon: DollarCircleOutlined, label: 'Giá vé', href: '/admin/settings' },
    ]
  }
];

export default function Sidebar() {
  const pathname = usePathname(); // Lấy đường dẫn hiện tại để active menu

  return (
    <div className="w-72 bg-white h-screen flex flex-col border-r border-gray-100 shadow-[4px_0_24px_rgba(0,0,0,0.02)] sticky top-0 left-0 transition-all duration-300">
      
      {/* 1. Logo Section - Làm nổi bật */}
      <div className="p-6 pb-2">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-rose-500 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/30 transform hover:rotate-12 transition-transform duration-300">
            <span className="text-white font-black text-xl italic font-serif">C</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black text-gray-800 tracking-tight leading-none">CGV ADMIN</span>
            <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest mt-1">Management</span>
          </div>
        </div>
      </div>

      {/* 2. Navigation Section - Có thanh cuộn ẩn */}
      <nav className="flex-1 px-4 py-4 space-y-6 overflow-y-auto scrollbar-hide">
        {menuGroups.map((group, groupIndex) => (
          <div key={groupIndex}>
            {/* Group Title */}
            <h3 className="px-4 mb-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              {group.title}
            </h3>
            
            {/* Menu Items */}
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href; // Kiểm tra active tự động

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      group relative w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300
                      ${isActive 
                        ? 'bg-gradient-to-r from-red-600 to-rose-500 text-white shadow-md shadow-red-500/25 translate-x-1' 
                        : 'text-gray-600 hover:bg-red-50 hover:text-red-600 hover:translate-x-1'
                      }
                    `}
                  >
                    {/* Active Indicator Line (Optional decoration) */}
                    {isActive && (
                        <div className="absolute left-0 h-1/2 w-1 bg-white/30 rounded-r-full"></div>
                    )}

                    <Icon 
                      className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} 
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    
                    <span className="flex-1 font-semibold tracking-wide">{item.label}</span>
                    
                    {/* Arrow icon appears on hover or active */}
                    {(isActive) && (
                         <ChevronRight className="w-4 h-4 text-white/80 animate-pulse" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* 3. Footer Section - Logout */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/50">     
        <div className="mt-4 px-4 text-xs text-center text-gray-400 font-medium">
            &copy; 2024 CGV Management v1.0
        </div>
      </div>
    </div>
  );
}