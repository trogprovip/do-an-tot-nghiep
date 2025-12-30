'use client';

import React, { useState, useEffect } from 'react';
import DataTable from '@/components/DataTable';
import { Search } from 'lucide-react';

export default function TicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchTickets();
  }, [searchTerm, statusFilter]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: '0',
        size: '100',
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter }),
      });
      
      const response = await fetch(`/api/tickets?${params}`);
      const data = await response.json();
      setTickets(data.content || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'tickets_code', label: 'Mã vé' },
    { 
      key: 'accounts', 
      label: 'Khách hàng',
      render: (value: { full_name: string }) => value?.full_name || '-'
    },
    { 
      key: 'slots', 
      label: 'Phim',
      render: (value: { movies: { title: string } }) => value?.movies?.title || '-'
    },
    { 
      key: 'slots', 
      label: 'Phòng',
      render: (value: { rooms: { room_name: string } }) => value?.rooms?.room_name || '-'
    },
    { 
      key: 'final_amount', 
      label: 'Tổng tiền',
      render: (value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
    },
    { 
      key: 'payment_status', 
      label: 'Thanh toán',
      render: (value: string) => {
        const statusMap: Record<string, { label: string; class: string }> = {
          paid: { label: 'Đã thanh toán', class: 'bg-green-100 text-green-800' },
          unpaid: { label: 'Chưa thanh toán', class: 'bg-yellow-100 text-yellow-800' },
          refunded: { label: 'Đã hoàn tiền', class: 'bg-gray-100 text-gray-800' },
        };
        const status = statusMap[value] || { label: value, class: 'bg-gray-100 text-gray-800' };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.class}`}>
            {status.label}
          </span>
        );
      }
    },
    { 
      key: 'status', 
      label: 'Trạng thái',
      render: (value: string) => {
        const statusMap: Record<string, { label: string; class: string }> = {
          confirmed: { label: 'Đã xác nhận', class: 'bg-green-100 text-green-800' },
          pending: { label: 'Chờ xử lý', class: 'bg-yellow-100 text-yellow-800' },
          cancelled: { label: 'Đã hủy', class: 'bg-red-100 text-red-800' },
        };
        const status = statusMap[value] || { label: value, class: 'bg-gray-100 text-gray-800' };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.class}`}>
            {status.label}
          </span>
        );
      }
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý Vé</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo mã vé..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="pending">Chờ xử lý</option>
            <option value="confirmed">Đã xác nhận</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Đang tải...</div>
      ) : (
        <DataTable
          columns={columns}
          data={tickets}
        />
      )}
    </div>
  );
}
