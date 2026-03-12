'use client';

import React, { useState, useEffect } from 'react';
import DataTable from '@/components/DataTable';
import { Plus, Search } from 'lucide-react';
import { movieService, Movie, MovieFilterParams } from '@/lib/services/movieService';

export default function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    size: 5
  });

  useEffect(() => {
    fetchMovies();
  }, [searchTerm, statusFilter, pagination.currentPage]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      
      const params: MovieFilterParams = {
        search: searchTerm || undefined,
        status: statusFilter || undefined,
        page: pagination.currentPage,
        size: pagination.size,
        autoUpdate: true // Enable automatic status updates
      };
      
      const data = await movieService.getMovies(params);
      setMovies(data.content || []);
      setPagination(prev => ({
        ...prev,
        totalPages: data.totalPages || 0,
        totalElements: data.totalElements || 0
      }));
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handleDelete = async (movie: Movie) => {
    if (!confirm(`Bạn có chắc muốn xóa phim "${movie.title}"?`)) return;
    
    try {
      await movieService.deleteMovie(movie.id);
      alert('Xóa phim thành công!');
      fetchMovies();
    } catch (error) {
      console.error('Error deleting movie:', error);
      alert('Có lỗi xảy ra khi xóa phim!');
    }
  };

  const handleView = (movie: Movie) => {
    window.location.href = `/admin/movies/${movie.id}`;
  };

  const handleEdit = (movie: Movie) => {
    window.location.href = `/admin/movies/edit/${movie.id}`;
  };

  const handleCreate = () => {
    // Chuyển đến trang tạo phim mới
    window.location.href = '/admin/movies/create';
  };

  const handleUpdateStatuses = async () => {
    try {
      const response = await fetch('/api/movies/update-statuses', {
        method: 'POST',
      });
      
      if (response.ok) {
        const result = await response.json();
        alert(`Cập nhật thành công ${result.updatedCount} phim!`);
        fetchMovies(); // Refresh the movie list
      } else {
        alert('Có lỗi xảy ra khi cập nhật trạng thái phim!');
      }
    } catch (error) {
      console.error('Error updating movie statuses:', error);
      alert('Có lỗi xảy ra khi cập nhật trạng thái phim!');
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { 
      key: 'poster_url', 
      label: 'Poster',
      render: (value: string, row: Movie) => row.poster_url ? (
        <img src={row.poster_url} alt="Poster" className="w-16 h-24 object-cover rounded shadow-sm" />
      ) : <span className="text-gray-400 text-xs">Chưa có ảnh</span>
    },
    { key: 'title', label: 'Tên phim' },
    { key: 'director', label: 'Đạo diễn' },
    { key: 'genre', label: 'Thể loại' },
    { 
      key: 'duration', 
      label: 'Thời lượng',
      render: (value: number) => `${value} phút`
    },
    { 
      key: 'status', 
      label: 'Trạng thái',
      render: (value: string) => {
        const statusMap: Record<string, { label: string; class: string }> = {
          coming_soon: { label: 'Sắp chiếu', class: 'bg-yellow-100 text-yellow-800' },
          now_showing: { label: 'Đang chiếu', class: 'bg-green-100 text-green-800' },
          ended: { label: 'Đã kết thúc', class: 'bg-gray-100 text-gray-800' },
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
      key: 'release_date', 
      label: 'Ngày khởi chiếu',
      render: (value: string | Date | null) => {
        if (!value) return <span className="text-gray-400">-</span>;
        try {
          return new Date(value).toLocaleDateString('vi-VN');
        } catch {
          return <span className="text-gray-400">-</span>;
        }
      }
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý Phim</h1>
        <div className="flex gap-3">
          <button 
            onClick={handleUpdateStatuses}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Cập nhật trạng thái tự động
          </button>
          <button 
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Thêm phim mới
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên phim, đạo diễn..."
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
            <option value="coming_soon">Sắp chiếu</option>
            <option value="now_showing">Đang chiếu</option>
            <option value="ended">Đã kết thúc</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Đang tải...</div>
      ) : (
        <DataTable
          columns={columns}
          data={movies}
          onDelete={handleDelete}
          onEdit={handleEdit}
          onView={handleView}
          pagination={{
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalElements: pagination.totalElements,
            size: pagination.size,
            onPageChange: handlePageChange
          }}
        />
      )}
    </div>
  );
}
