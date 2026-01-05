'use client';

import React, { useState, useEffect } from 'react';
import DataTable from '@/components/DataTable';
import { Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { slotService, Slot } from '@/lib/services/slotService';

export default function SlotsPage() {
  const router = useRouter();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSlots();
  }, [searchTerm]);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const response = await slotService.getSlots({
        page: 0,
        size: 100,
        search: searchTerm || undefined,
      });
      setSlots(response.content);
    } catch (error) {
      console.error('Error fetching slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (row: Slot) => {
    router.push(`/admin/slots/edit/${row.id}`);
  };

  const handleDelete = async (row: Slot) => {
    if (!confirm('Bạn có chắc chắn muốn xóa suất chiếu này?')) {
      return;
    }

    try {
      await slotService.deleteSlot(row.id);
      alert('Xóa suất chiếu thành công!');
      fetchSlots();
    } catch (error) {
      console.error('Error deleting slot:', error);
      alert('Có lỗi xảy ra khi xóa suất chiếu!');
    }
  };

  // --- SỬA LOGIC HIỂN THỊ TẠI ĐÂY ---
 const formatLocalDateTime = (dateString: string) => {
  if (!dateString) return '-';
  
  // Khi dùng new Date(dateString), JavaScript sẽ tự động hiểu đây là giờ UTC 
  // và các hàm getHours(), getDate()... sẽ tự động cộng thêm múi giờ máy tính (VN là +7)
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) return '-';

  // BỎ chữ "UTC" trong các hàm để lấy giờ đã cộng 7
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${hours}:${minutes} ${day}/${month}/${year}`;
};

  const columns = [
    { key: 'id', label: 'ID', width: '60px' },
    { 
      key: 'movies', 
      label: 'Phim',
      width: '250px',
      render: (value: Slot['movies']) => value?.title || '-'
    },
    { 
      key: 'rooms', 
      label: 'Phòng chiếu',
      width: '200px',
      render: (value: Slot['rooms']) => {
        if (!value) return '-';
        return (
          <div>
            <div className="font-medium">{value.room_name}</div>
            {value.cinemas && (
              <div className="text-xs text-gray-500">{value.cinemas.cinema_name}</div>
            )}
          </div>
        );
      }
    },
    { 
      key: 'show_time', 
      label: 'Giờ chiếu',
      width: '150px',
      render: (value: string) => formatLocalDateTime(value)
    },
    { 
      key: 'price', 
      label: 'Giá vé',
      width: '120px',
      render: (value: number) => `${Number(value || 0).toLocaleString('vi-VN')} đ`
    },
    { key: 'empty_seats', label: 'Ghế trống', width: '100px' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý Suất chiếu</h1>
        <Link href="/admin/slots/create">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            Thêm suất chiếu
          </button>
        </Link>
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
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}