'use client';

import React, { useState, useEffect } from 'react';
import { Film, Users, Ticket, ShoppingBag, DollarSign } from 'lucide-react';

interface Stats {
  totalMovies: number;
  totalUsers: number;
  totalTickets: number;
  totalRevenue: number;
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats>({
    totalMovies: 0,
    totalUsers: 0,
    totalTickets: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [moviesRes, usersRes, ticketsRes] = await Promise.all([
        fetch('/api/movies?page=0&size=1'),
        fetch('/api/users?page=0&size=1'),
        fetch('/api/tickets?page=0&size=100'),
      ]);

      const [moviesData, usersData, ticketsData] = await Promise.all([
        moviesRes.json(),
        usersRes.json(),
        ticketsRes.json(),
      ]);

      const revenue = ticketsData.content?.reduce((sum: number, ticket: { final_amount: number }) => 
        sum + Number(ticket.final_amount), 0) || 0;

      setStats({
        totalMovies: moviesData.totalElements || 0,
        totalUsers: usersData.totalElements || 0,
        totalTickets: ticketsData.totalElements || 0,
        totalRevenue: revenue,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Tổng số phim',
      value: stats.totalMovies,
      icon: Film,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Người dùng',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Vé đã bán',
      value: stats.totalTickets,
      icon: Ticket,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Doanh thu',
      value: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.totalRevenue),
      icon: DollarSign,
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Chào mừng đến với hệ thống quản lý CGV Cinema</p>
      </div>

      {loading ? (
        <div className="text-center py-8">Đang tải...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.title} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{card.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                    </div>
                    <div className={`${card.bgColor} p-3 rounded-lg`}>
                      <Icon className={`w-6 h-6 ${card.textColor}`} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quản lý nhanh</h2>
              <div className="space-y-3">
                <a href="/admin/movies" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <Film className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700">Quản lý Phim</span>
                </a>
                <a href="/admin/cinemas" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <ShoppingBag className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Quản lý Rạp</span>
                </a>
                <a href="/admin/tickets" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <Ticket className="w-5 h-5 text-purple-600" />
                  <span className="text-gray-700">Quản lý Vé</span>
                </a>
                <a href="/admin/users" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <Users className="w-5 h-5 text-orange-600" />
                  <span className="text-gray-700">Quản lý Người dùng</span>
                </a>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Thống kê</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Phim đang chiếu</span>
                  <span className="font-semibold text-gray-900">-</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Rạp hoạt động</span>
                  <span className="font-semibold text-gray-900">-</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Suất chiếu hôm nay</span>
                  <span className="font-semibold text-gray-900">-</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Vé đã bán hôm nay</span>
                  <span className="font-semibold text-gray-900">-</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
