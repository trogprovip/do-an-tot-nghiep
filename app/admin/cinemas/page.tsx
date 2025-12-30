'use client';

import React, { useState, useEffect } from 'react';
import DataTable from '@/components/DataTable';
import { Plus, Search } from 'lucide-react';
import { cinemaService, Cinema, CinemaFilterForm } from '@/lib/services/cinemaService';

export default function CinemasPage() {
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchCinemas();
  }, [searchTerm, statusFilter]);

  const fetchCinemas = async () => {
    try {
      setLoading(true);
      
      const params: CinemaFilterForm = {
        search: searchTerm || undefined,
        status: statusFilter || undefined,
        page: 0,
        size: 100
      };
      
      const data = await cinemaService.getCinemas(params);
      setCinemas(data.content || []);
    } catch (error) {
      console.error('Error fetching cinemas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (cinema: Cinema) => {
    if (!confirm(`Bạn có chắc muốn xóa rạp "${cinema.cinema_name}"?`)) return;
    
    try {
      await cinemaService.deleteCinema(cinema.id);
      alert('Xóa rạp thành công!');
      fetchCinemas();
    } catch (error) {
      console.error('Error deleting cinema:', error);
      alert('Có lỗi xảy ra khi xóa rạp!');
    }
  };

  const handleEdit = (cinema: Cinema) => {
    window.location.href = `/admin/cinemas/edit/${cinema.id}`;
  };

  const handleCreate = () => {
    window.location.href = '/admin/cinemas/create';
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'cinema_name', label: 'Tên rạp' },
    { key: 'address', label: 'Địa chỉ' },
    { key: 'phone', label: 'Số điện thoại' },
    { key: 'email', label: 'Email' },
    { 
      key: 'status', 
      label: 'Trạng thái',
      render: (value: string) => {
        const statusMap: Record<string, { label: string; class: string }> = {
          active: { label: 'Hoạt động', class: 'bg-green-100 text-green-800' },
          inactive: { label: 'Không hoạt động', class: 'bg-gray-100 text-gray-800' },
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
        <h1 className="text-3xl font-bold text-gray-900">Quản lý Rạp chiếu</h1>
        <button 
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Thêm rạp mới
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên rạp, địa chỉ..."
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
            <option value="active">Hoạt động</option>
            <option value="inactive">Không hoạt động</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Đang tải...</div>
      ) : (
        <DataTable
          columns={columns}
          data={cinemas}
          onDelete={handleDelete}
          onEdit={handleEdit}
          onView={(cinema) => handleEdit(cinema)}
        />
      )}
    </div>
  );
}
