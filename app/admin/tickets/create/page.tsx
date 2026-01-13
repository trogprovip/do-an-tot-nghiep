'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, X } from 'lucide-react';
import { movieService } from '@/lib/services/movieService';
import { roomService } from '@/lib/services/roomService';
import { ticketService, CreateTicketForm } from '@/lib/services/ticketService';

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

interface Slot {
  id: number;
  show_time: string;
  movies: Movie;
  rooms: Room;
  price: number;
  empty_seats: number;
}

interface Account {
  id: number;
  full_name: string;
  email: string;
}

export default function CreateTicketPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  
  const [formData, setFormData] = useState({
    account_id: 0,
    slot_id: 0,
    total_amount: 0,
    discount_amount: 0,
    final_amount: 0,
    payment_status: 'unpaid' as 'paid' | 'unpaid' | 'refunded',
    status: 'pending' as 'pending' | 'confirmed' | 'used' | 'cancelled',
    note: ''
  });

  const [selectedMovieId, setSelectedMovieId] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedMovieId) {
      fetchSlots();
    }
  }, [selectedMovieId]);

  const fetchData = async () => {
    try {
      const [moviesRes, roomsRes] = await Promise.all([
        movieService.getMovies({ page: 0, size: 100 }),
        roomService.getRooms({ page: 0, size: 100 })
      ]);
      setMovies(moviesRes.content);
      setRooms(roomsRes.content);
      
      // Fetch accounts directly
      const accountsResponse = await fetch('/api/accounts');
      const accountsData = await accountsResponse.json();
      if (accountsData.success) {
        setAccounts(accountsData.content);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchSlots = async () => {
    if (!selectedMovieId) return;
    
    try {
      const response = await fetch(`/api/slots?movieId=${selectedMovieId}`);
      const data = await response.json();
      if (data.success) {
        setSlots(data.content);
      }
    } catch (error) {
      console.error('Error fetching slots:', error);
    }
  };

  const handleMovieChange = (movieId: number) => {
    setSelectedMovieId(movieId);
    setFormData(prev => ({ ...prev, slot_id: 0 }));
  };

  const handleSlotChange = (slotId: number) => {
    const selectedSlot = slots.find(slot => slot.id === slotId);
    if (selectedSlot) {
      setFormData(prev => ({
        ...prev,
        slot_id: slotId,
        total_amount: selectedSlot.price,
        final_amount: selectedSlot.price - prev.discount_amount
      }));
    }
  };

  const handleDiscountChange = (discount: number) => {
    const discountAmount = Math.min(discount, formData.total_amount);
    setFormData(prev => ({
      ...prev,
      discount_amount: discountAmount,
      final_amount: prev.total_amount - discountAmount
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.account_id || !formData.slot_id) {
      alert('Vui lòng chọn khách hàng và suất chiếu!');
      return;
    }

    setLoading(true);
    try {
      // Generate ticket code
      const ticketCode = 'CGV' + Date.now().toString().slice(-6);
      
      const ticketData: CreateTicketForm = {
        ...formData,
        tickets_code: ticketCode
      };
      
      await ticketService.createTicket(ticketData);
      alert('Tạo vé thành công!');
      router.push('/admin/tickets');
    } catch (error) {
      console.error('Error creating ticket:', error);
      alert('Có lỗi xảy ra khi tạo vé!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link href="/admin/tickets" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Tạo Vé Mới</h1>
        <p className="text-gray-600 mt-1">Tạo vé mới cho khách hàng</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Khách hàng *
            </label>
            <select
              value={formData.account_id}
              onChange={(e) => setFormData(prev => ({ ...prev, account_id: Number(e.target.value) }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="0">Chọn khách hàng</option>
              {accounts.map(account => (
                <option key={account.id} value={account.id}>
                  {account.full_name} ({account.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phim *
            </label>
            <select
              value={selectedMovieId}
              onChange={(e) => handleMovieChange(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="0">Chọn phim</option>
              {movies.map(movie => (
                <option key={movie.id} value={movie.id}>
                  {movie.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Suất chiếu *
            </label>
            <select
              value={formData.slot_id}
              onChange={(e) => handleSlotChange(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={!selectedMovieId}
            >
              <option value="0">Chọn suất chiếu</option>
              {slots.map(slot => (
                <option key={slot.id} value={slot.id}>
                  {new Date(slot.show_time).toLocaleString('vi-VN')} - {slot.rooms.room_name} ({slot.empty_seats} ghế trống)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tổng tiền
            </label>
            <input
              type="text"
              value={`${Number(formData.total_amount).toLocaleString('vi-VN')} đ`}
              readOnly
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Giảm giá
            </label>
            <input
              type="number"
              value={formData.discount_amount}
              onChange={(e) => handleDiscountChange(Number(e.target.value))}
              min="0"
              max={formData.total_amount}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thành tiền
            </label>
            <input
              type="text"
              value={`${Number(formData.final_amount).toLocaleString('vi-VN')} đ`}
              readOnly
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 font-semibold text-blue-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trạng thái thanh toán
            </label>
            <select
              value={formData.payment_status}
              onChange={(e) => setFormData(prev => ({ ...prev, payment_status: e.target.value as 'paid' | 'unpaid' | 'refunded' }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="unpaid">Chưa thanh toán</option>
              <option value="paid">Đã thanh toán</option>
              <option value="refunded">Đã hoàn tiền</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trạng thái vé
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'pending' | 'confirmed' | 'used' | 'cancelled' }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="pending">Chờ xác nhận</option>
              <option value="confirmed">Đã xác nhận</option>
              <option value="used">Đã sử dụng</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ghi chú
          </label>
          <textarea
            value={formData.note}
            onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Thêm ghi chú cho vé..."
          />
        </div>

        <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Tạo vé
              </>
            )}
          </button>
          <Link
            href="/admin/tickets"
            className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            Hủy bỏ
          </Link>
        </div>
      </form>
    </div>
  );
}
