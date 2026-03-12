'use client';

import React, { useState, useEffect } from 'react';
import { CreateCinemaForm, UpdateCinemaForm } from '@/lib/services/cinemaService';

interface Province {
  id: number;
  province_name: string;
}

interface CinemaFormProps {
  initialData?: UpdateCinemaForm & { id?: number };
  onSubmit: (data: CreateCinemaForm | UpdateCinemaForm) => Promise<void>;
  isEditing?: boolean;
}

export default function CinemaForm({ initialData, onSubmit, isEditing = false }: CinemaFormProps) {
  const [formData, setFormData] = useState<CreateCinemaForm | UpdateCinemaForm>({
    cinema_name: initialData?.cinema_name || '',
    address: initialData?.address || '',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    province_id: initialData?.province_id || 0,
    latitude: initialData?.latitude || undefined,
    longitude: initialData?.longitude || undefined,
    status: initialData?.status || 'active',
  });

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [loading, setLoading] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProvinces();
  }, []);

  const fetchProvinces = async () => {
    try {
      const response = await fetch('/api/provinces');
      const data = await response.json();
      // Fix: API bây giờ trả về { content: [], ... } thay vì array trực tiếp
      setProvinces(Array.isArray(data) ? data : data.content || []);
    } catch (error) {
      console.error('Error fetching provinces:', error);
    }
  };

  const handleGetCoordinates = async () => {
    if (!formData.address) {
      alert('Vui lòng nhập địa chỉ trước!');
      return;
    }

    setGeocoding(true);
    try {
      const province = provinces.find(p => p.id === formData.province_id);
      const fullAddress = province 
        ? `${formData.address}, ${province.province_name}, Vietnam`
        : `${formData.address}, Vietnam`;

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1`,
        {
          headers: {
            'User-Agent': 'CinemaManagementApp/1.0'
          }
        }
      );

      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setFormData(prev => ({
          ...prev,
          latitude: parseFloat(lat),
          longitude: parseFloat(lon)
        }));
        alert(`Đã lấy tọa độ thành công!\nVĩ độ: ${lat}\nKinh độ: ${lon}`);
      } else {
        alert('Không tìm thấy tọa độ cho địa chỉ này. Vui lòng nhập thủ công hoặc kiểm tra lại địa chỉ.');
      }
    } catch (error) {
      console.error('Error geocoding address:', error);
      alert('Có lỗi xảy ra khi lấy tọa độ. Vui lòng thử lại sau.');
    } finally {
      setGeocoding(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'province_id' ? (parseInt(value) || 0) : 
              name === 'latitude' || name === 'longitude' ? (value ? parseFloat(value) : undefined) :
              value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate province_id is selected
    if (!formData.province_id || formData.province_id === 0) {
      setError('Vui lòng chọn tỉnh/thành phố');
      setLoading(false);
      return;
    }

    // Validate phone number length
    if (formData.phone && formData.phone.length > 10) {
      setError('Số điện thoại không được vượt quá 10 ký tự');
      setLoading(false);
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi lưu rạp');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tên rạp <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="cinema_name"
            value={formData.cinema_name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="VD: CGV Vincom Center"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Địa chỉ <span className="text-red-500">*</span>
          </label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập địa chỉ đầy đủ của rạp"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tỉnh/Thành phố <span className="text-red-500">*</span>
          </label>
          <select
            name="province_id"
            value={formData.province_id}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Chọn tỉnh/thành phố</option>
            {provinces.map(province => (
              <option key={province.id} value={province.id}>
                {province.province_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Trạng thái <span className="text-red-500">*</span>
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="active">Hoạt động</option>
            <option value="inactive">Không hoạt động</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Số điện thoại <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            maxLength={10}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="VD: 0901234567 (tối đa 10 số)"
          />
          <p className="text-xs text-gray-500 mt-1">Số điện thoại không được vượt quá 10 ký tự</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="VD: cinema@example.com"
          />
        </div>

        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Tọa độ GPS (Vĩ độ / Kinh độ)
            </label>
            <button
              type="button"
              onClick={handleGetCoordinates}
              disabled={geocoding || !formData.address}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {geocoding ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang lấy...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Lấy tọa độ tự động
                </>
              )}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <input
                type="number"
                step="0.00000001"
                name="latitude"
                value={formData.latitude || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Vĩ độ (VD: 10.762622)"
              />
            </div>
            <div>
              <input
                type="number"
                step="0.00000001"
                name="longitude"
                value={formData.longitude || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Kinh độ (VD: 106.660172)"
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            💡 Nhập địa chỉ và tỉnh/thành phố trước, sau đó nhấn &quot;Lấy tọa độ tự động&quot; để tự động điền tọa độ GPS
          </p>
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {loading ? 'Đang xử lý...' : (isEditing ? 'Cập nhật rạp' : 'Thêm rạp')}
        </button>
        <button
          type="button"
          onClick={() => window.history.back()}
          className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors font-medium"
        >
          Hủy
        </button>
      </div>
    </form>
  );
}
