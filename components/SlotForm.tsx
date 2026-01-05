/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { movieService } from '@/lib/services/movieService';
import { roomService } from '@/lib/services/roomService';

interface Movie {
  id: number;
  title: string;
  duration: number; 
}

interface Room {
  id: number;
  room_name: string;
  cinemas?: {
    cinema_name: string;
  };
}

interface SlotFormProps {
  initialData?: any; 
  onSubmit: (data: any) => Promise<void>;
  isEditing?: boolean;
}

export default function SlotForm({ initialData, onSubmit, isEditing = false }: SlotFormProps) {
  
  // 1. CHUYỂN dd-MM-yyyy HH:mm:ss -> yyyy-MM-ddTHH:mm (Hiện lên ô Input)
  const formatDateTimeForInput = (dateString: string | undefined) => {
    if (!dateString) return '';
    try {
      // Backend: "31-12-2025 20:30:00"
      const parts = dateString.split(' ');
      const [day, month, year] = parts[0].split('-');
      const timePart = parts[1].substring(0, 5); // "20:30"
      
      return `${year}-${month}-${day}T${timePart}`; // Trả về: "2025-12-31T20:30"
    } catch (e) {
      return '';
    }
  };

  const [formData, setFormData] = useState<any>({
    movie_id: initialData?.movie_id || 0,
    room_id: initialData?.room_id || 0,
    show_time: formatDateTimeForInput(initialData?.show_time),
    end_time: formatDateTimeForInput(initialData?.end_time),
    price: initialData?.price || 0,
    empty_seats: initialData?.empty_seats || 0,
  });

  const [movies, setMovies] = useState<Movie[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [moviesRes, roomsRes] = await Promise.all([
          movieService.getMovies({ page: 0, size: 100 }),
          roomService.getRooms({ page: 0, size: 100 })
        ]);
        setMovies(moviesRes.content);
        setRooms(roomsRes.content);
      } catch (err) {
        setError('Không thể tải danh sách phim hoặc phòng.');
      }
    };
    fetchData();
  }, []);

  // BỎ tự động tính end_time - để người dùng tự nhập

  // Sync dữ liệu khi Edit
  useEffect(() => {
    if (initialData) {
      setFormData({
        movie_id: initialData.movies?.id || initialData.movie_id || 0,
        room_id: initialData.rooms?.id || initialData.room_id || 0,
        show_time: formatDateTimeForInput(initialData.show_time),
        end_time: formatDateTimeForInput(initialData.end_time),
        price: initialData.price || 0,
        empty_seats: initialData.empty_seats || 0,
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  // 3. CHUYỂN yyyy-MM-ddTHH:mm -> dd-MM-yyyy HH:mm:ss (Gửi về Spring Boot)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formatForBackend = (inputStr: string) => {
        if (!inputStr) return null;
        // inputStr: "2025-12-31T20:30"
        const [datePart, timePart] = inputStr.split('T');
        const [year, month, day] = datePart.split('-');
        return `${day}-${month}-${year} ${timePart}:00`; // Trả về: "31-12-2025 20:30:00"
      };

      const submitData = {
        movie_id: Number(formData.movie_id),
        room_id: Number(formData.room_id),
        price: Number(formData.price),
        empty_seats: Number(formData.empty_seats),
        show_time: formatForBackend(formData.show_time),
        end_time: formatForBackend(formData.end_time),
      };

      await onSubmit(submitData);
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          ⚠️ {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Phim *</label>
          <select name="movie_id" value={formData.movie_id} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg bg-white">
            <option value="0">Chọn phim</option>
            {movies.map(movie => (
              <option key={movie.id} value={movie.id}>{movie.title} - {movie.duration} phút</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Phòng chiếu *</label>
          <select name="room_id" value={formData.room_id} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg bg-white">
            <option value="0">Chọn phòng</option>
            {rooms.map(room => (
              <option key={room.id} value={room.id}>{room.room_name} {room.cinemas?.cinema_name && `- ${room.cinemas.cinema_name}`}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Giờ chiếu *</label>
          <input type="datetime-local" name="show_time" value={formData.show_time || ''} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Giờ kết thúc *</label>
          <input type="datetime-local" name="end_time" value={formData.end_time || ''} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Giá vé (VNĐ) *</label>
          <input type="number" name="price" value={formData.price} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Số ghế trống *</label>
          <input type="number" name="empty_seats" value={formData.empty_seats} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg" />
        </div>
      </div>

      <div className="flex gap-4 pt-4 border-t mt-6">
        <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400">
          {loading ? 'Đang xử lý...' : (isEditing ? 'Cập nhật' : 'Thêm mới')}
        </button>
        <button type="button" onClick={() => window.history.back()} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg border">
          Hủy bỏ
        </button>
      </div>
    </form>
  );
}