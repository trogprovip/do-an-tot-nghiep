'use client';

import React, { useState } from 'react';
import { CreateMovieDto, UpdateMovieDto } from '@/lib/services/movieService';

interface MovieFormProps {
  initialData?: UpdateMovieDto;
  onSubmit: (data: CreateMovieDto | UpdateMovieDto) => Promise<void>;
  isEditing?: boolean;
}

export default function MovieForm({ initialData, onSubmit, isEditing = false }: MovieFormProps) {
  const [formData, setFormData] = useState<CreateMovieDto | UpdateMovieDto>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    duration: initialData?.duration || 0,
    release_date: initialData?.release_date ? new Date(initialData.release_date).toISOString().split('T')[0] : '',
    director: initialData?.director || '',
    cast: initialData?.cast || '',
    genre: initialData?.genre || '',
    language: initialData?.language || '',
    poster_url: initialData?.poster_url || '',
    trailer_url: initialData?.trailer_url || '',
    status: initialData?.status || 'coming_soon',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duration' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSubmit(formData);
      // Thành công, không cần làm gì thêm vì component cha sẽ xử lý redirect
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi lưu phim');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Tên phim <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
            Thời lượng (phút) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="duration"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            required
            min="1"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="release_date" className="block text-sm font-medium text-gray-700">
            Ngày khởi chiếu
          </label>
          <input
            type="date"
            id="release_date"
            name="release_date"
            value={formData.release_date as string}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="director" className="block text-sm font-medium text-gray-700">
            Đạo diễn
          </label>
          <input
            type="text"
            id="director"
            name="director"
            value={formData.director || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="genre" className="block text-sm font-medium text-gray-700">
            Thể loại
          </label>
          <input
            type="text"
            id="genre"
            name="genre"
            value={formData.genre || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="language" className="block text-sm font-medium text-gray-700">
            Ngôn ngữ
          </label>
          <input
            type="text"
            id="language"
            name="language"
            value={formData.language || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="poster_url" className="block text-sm font-medium text-gray-700">
            URL Poster
          </label>
          <input
            type="text"
            id="poster_url"
            name="poster_url"
            value={formData.poster_url || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="trailer_url" className="block text-sm font-medium text-gray-700">
            URL Trailer
          </label>
          <input
            type="text"
            id="trailer_url"
            name="trailer_url"
            value={formData.trailer_url || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Trạng thái
          </label>
          <select
            id="status"
            name="status"
            value={formData.status || 'coming_soon'}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="coming_soon">Sắp chiếu</option>
            <option value="now_showing">Đang chiếu</option>
            <option value="ended">Đã kết thúc</option>
          </select>
        </div>
      </div>

      <div className="space-y-2 col-span-2">
        <label htmlFor="cast" className="block text-sm font-medium text-gray-700">
          Diễn viên
        </label>
        <textarea
          id="cast"
          name="cast"
          value={formData.cast || ''}
          onChange={handleChange}
          rows={2}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-2 col-span-2">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Mô tả
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description || ''}
          onChange={handleChange}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {formData.poster_url && (
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Xem trước poster:</p>
          <div className="w-40 h-60 bg-gray-100 rounded-lg border border-gray-200 relative overflow-hidden">
            <img 
              src={formData.poster_url} 
              alt="Poster Preview" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      <div className="flex justify-end gap-4 pt-4">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={loading}
          className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
            loading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Đang lưu...' : isEditing ? 'Cập nhật' : 'Tạo mới'}
        </button>
      </div>
    </form>
  );
}
