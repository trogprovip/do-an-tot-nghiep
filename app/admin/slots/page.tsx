'use client';

import React, { useState, useEffect } from 'react';
import DataTable from '@/components/DataTable';
import { Plus, Search } from 'lucide-react';

export default function SlotsPage() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSlots();
  }, [searchTerm]);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: '0',
        size: '100',
        ...(searchTerm && { search: searchTerm }),
      });
      
      const response = await fetch(`/api/slots?${params}`);
      const data = await response.json();
      setSlots(data.content || []);
    } catch (error) {
      console.error('Error fetching slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { 
      key: 'movies', 
      label: 'Phim',
      render: (value: { title: string }) => value?.title || '-'
    },
    { 
      key: 'rooms', 
      label: 'Phòng',
      render: (value: { room_name: string }) => value?.room_name || '-'
    },
    { 
      key: 'show_time', 
      label: 'Giờ chiếu',
      render: (value: string) => value ? new Date(value).toLocaleString('vi-VN') : '-'
    },
    { 
      key: 'price', 
      label: 'Giá vé',
      render: (value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
    },
    { key: 'empty_seats', label: 'Ghế trống' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý Suất chiếu</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" />
          Thêm suất chiếu
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm suất chiếu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Đang tải...</div>
      ) : (
        <DataTable
          columns={columns}
          data={slots}
        />
      )}
    </div>
  );
}
