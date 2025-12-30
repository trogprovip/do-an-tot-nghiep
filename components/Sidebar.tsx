'use client';

import React from 'react';
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
  Settings
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin', active: false },
  { icon: Film, label: 'Quản lý Phim', href: '/admin/movies', active: false },
  { icon: Building2, label: 'Quản lý Rạp', href: '/admin/cinemas', active: false },
  { icon: Ticket, label: 'Quản lý Vé', href: '/admin/tickets', active: false },
  { icon: Users, label: 'Quản lý Người dùng', href: '/admin/users', active: false },
  { icon: ShoppingBag, label: 'Quản lý Sản phẩm', href: '/admin/products', active: false },
  { icon: Newspaper, label: 'Quản lý Tin tức', href: '/admin/news', active: false },
  { icon: MapPin, label: 'Quản lý Tỉnh/TP', href: '/admin/provinces', active: false },
  { icon: DoorOpen, label: 'Quản lý Phòng chiếu', href: '/admin/rooms', active: false },
  { icon: Clock, label: 'Quản lý Suất chiếu', href: '/admin/slots', active: false },
  { icon: Settings, label: 'Cài đặt hệ thống', href: '/admin/settings', active: false },
];

export default function Sidebar() {
  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">C</span>
          </div>
          <span className="text-xl font-bold text-gray-900">CGV Admin</span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          
          return (
            <a
              key={item.label}
              href={item.href}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                ${item.active 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="flex-1 text-left">{item.label}</span>
            </a>
          );
        })}
      </nav>
    </div>
  );
}
