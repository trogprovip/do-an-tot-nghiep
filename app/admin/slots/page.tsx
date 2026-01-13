'use client';

import React, { useState, useEffect } from 'react';
import DataTable from '@/components/DataTable';
import { Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { slotService, Slot } from '@/lib/services/slotService';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import 'antd/dist/reset.css';

export default function SlotsPage() {
  const router = useRouter();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    size: 5
  });

  useEffect(() => {
    fetchSlots();
  }, [searchTerm, dateFilter, pagination.currentPage]);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const response = await slotService.getSlots({
        page: pagination.currentPage,
        size: pagination.size,
        search: searchTerm || undefined,
        date: dateFilter || undefined,
      });
      setSlots(response.content);
      setPagination(prev => ({
        ...prev,
        totalPages: response.totalPages || 0,
        totalElements: response.totalElements || 0
      }));
    } catch (error) {
      console.error('Error fetching slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handleDateChange = (date: dayjs.Dayjs | null) => {
    setSelectedDate(date);
    setDateFilter(date ? date.format('YYYY-MM-DD') : '');
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

  // ✅ FORMAT ĐÚNG: HH:mm dd/MM/yyyy - Xử lý cả format từ backend
  const formatLocalDateTime = (dateString: string) => {
    if (!dateString) return '-';
    
    try {
      let date: Date;
      
      if (typeof dateString === 'string') {
        // Xử lý format "dd-MM-yyyy HH:mm:ss" hoặc "yyyy-MM-dd HH:mm:ss" từ backend
        if (dateString.includes('-') && !dateString.includes('T')) {
          const parts = dateString.split(' ');
          const dateParts = parts[0].split('-');
          const timeParts = parts[1]?.split(':') || ['00', '00', '00'];
          
          // Kiểm tra xem là dd-MM-yyyy hay yyyy-MM-dd
          if (dateParts[0].length === 4) {
            // yyyy-MM-dd HH:mm:ss
            const [year, month, day] = dateParts;
            const [hours, minutes] = timeParts;
            date = new Date(Number(year), Number(month) - 1, Number(day), Number(hours), Number(minutes));
          } else {
            // dd-MM-yyyy HH:mm:ss
            const [day, month, year] = dateParts;
            const [hours, minutes] = timeParts;
            date = new Date(Number(year), Number(month) - 1, Number(day), Number(hours), Number(minutes));
          }
        } else {
          // ISO format hoặc format khác
          date = new Date(dateString);
        }
      } else {
        date = new Date(dateString);
      }
      
      if (isNaN(date.getTime())) return '-';

      // Lấy giờ địa phương
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');

      // Format: HH:mm dd/MM/yyyy
      return `${hours}:${minutes} ${day}/${month}/${year}`;
    } catch (e) {
      console.error('Error formatting date:', e);
      return '-';
    }
  };

  const columns = [
    { 
      key: 'id', 
      label: 'ID', 
      width: '60px',
      render: (value: number) => (
        <span className="font-mono text-gray-600">#{value}</span>
      )
    },
    { 
      key: 'movies', 
      label: 'Phim',
      width: '250px',
      render: (value: Slot['movies']) => {
        if (!value) return <span className="text-gray-400">-</span>;
        return (
          <div>
            <div className="font-medium text-gray-900">{value.title}</div>
            {value.duration && (
              <div className="text-xs text-gray-500">{value.duration} phút</div>
            )}
          </div>
        );
      }
    },
    { 
      key: 'rooms', 
      label: 'Phòng chiếu',
      width: '200px',
      render: (value: Slot['rooms']) => {
        if (!value) return <span className="text-gray-400">-</span>;
        return (
          <div>
            <div className="font-medium text-gray-900">{value.room_name}</div>
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
      render: (value: string) => (
        <span className="text-sm font-medium text-blue-600">
          {formatLocalDateTime(value)}
        </span>
      )
    },
    { 
      key: 'end_time', 
      label: 'Giờ kết thúc',
      width: '150px',
      render: (value: string) => (
        <span className="text-sm text-gray-600">
          {formatLocalDateTime(value)}
        </span>
      )
    },
    { 
      key: 'price', 
      label: 'Giá vé',
      width: '120px',
      render: (value: number) => (
        <span className="font-semibold text-green-600">
          {Number(value || 0).toLocaleString('vi-VN')} đ
        </span>
      )
    },
    { 
      key: 'empty_seats', 
      label: 'Ghế trống', 
      width: '100px',
      render: (value: number) => {
        const isEmpty = value === 0;
        return (
          <span className={`font-medium ${isEmpty ? 'text-red-600' : 'text-green-600'}`}>
            {value}
          </span>
        );
      }
    },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Suất chiếu</h1>
          <p className="text-gray-600 mt-1">Danh sách tất cả suất chiếu phim</p>
        </div>
        <Link href="/admin/slots/create">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
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
              placeholder="Tìm kiếm theo tên phim, phòng chiếu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="relative">
            <DatePicker
              value={selectedDate}
              onChange={handleDateChange}
              placeholder="Lọc theo ngày"
              format="DD/MM/YYYY"
              className="w-full"
              style={{ 
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                height: '40px'
              }}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải danh sách suất chiếu...</p>
          </div>
        </div>
      ) : slots.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có suất chiếu nào</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm ? 'Không tìm thấy suất chiếu phù hợp' : 'Hãy thêm suất chiếu đầu tiên'}
          </p>
          {!searchTerm && (
            <Link href="/admin/slots/create">
              <button className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="w-5 h-5" />
                Thêm suất chiếu mới
              </button>
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <DataTable
            columns={columns}
            data={slots}
            onEdit={handleEdit}
            onDelete={handleDelete}
            pagination={{
              currentPage: pagination.currentPage,
              totalPages: pagination.totalPages,
              totalElements: pagination.totalElements,
              size: pagination.size,
              onPageChange: handlePageChange
            }}
          />
        </div>
      )}
    </div>
  );
}