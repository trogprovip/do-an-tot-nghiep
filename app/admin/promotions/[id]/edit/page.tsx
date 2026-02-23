'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Plus, X, Calendar, Film, MapPin, Tag, Percent, DollarSign } from 'lucide-react';

interface Promotion {
  id: number;
  promotion_code: string;
  promotion_name: string;
  description?: string;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  max_discount_amount?: number;
  min_order_amount: number;
  usage_limit?: number;
  usage_count: number;
  usage_per_user: number;
  start_date: string;
  end_date: string;
  applicable_days?: string;
  applicable_movies?: string;
  applicable_cinemas?: string;
  status: 'active' | 'inactive' | 'expired';
  image_url?: string;
  create_at: string;
  update_at?: string;
  is_deleted: boolean;
}

interface PromotionForm {
  promotion_code: string;
  promotion_name: string;
  description: string;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: string;
  max_discount_amount: string;
  min_order_amount: string;
  usage_limit: string;
  usage_per_user: string;
  start_date: string;
  end_date: string;
  applicable_days: string[];
  applicable_movies: string[];
  applicable_cinemas: string[];
  status: 'active' | 'inactive';
  image_url: string;
}

export default function EditPromotionPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [formData, setFormData] = useState<PromotionForm>({
    promotion_code: '',
    promotion_name: '',
    description: '',
    discount_type: 'percentage',
    discount_value: '',
    max_discount_amount: '',
    min_order_amount: '0',
    usage_limit: '',
    usage_per_user: '1',
    start_date: '',
    end_date: '',
    applicable_days: [],
    applicable_movies: [],
    applicable_cinemas: [],
    status: 'active',
    image_url: '',
  });

  const [paramsResolved, setParamsResolved] = useState<{ id: string } | null>(null);

  const [newMovie, setNewMovie] = useState('');
  const [newCinema, setNewCinema] = useState('');

  const daysOfWeek = [
    { value: '1', label: 'Thứ 2' },
    { value: '2', label: 'Thứ 3' },
    { value: '3', label: 'Thứ 4' },
    { value: '4', label: 'Thứ 5' },
    { value: '5', label: 'Thứ 6' },
    { value: '6', label: 'Thứ 7' },
    { value: '0', label: 'Chủ nhật' },
  ];

  const fetchPromotion = async () => {
    if (!paramsResolved) return;
    
    try {
      const response = await fetch(`/api/admin/promotions/${paramsResolved.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch promotion');
      }
      const promotion: Promotion = await response.json();

      // Parse applicable fields
      const applicableDays = promotion.applicable_days ? promotion.applicable_days.split(',') : [];
      const applicableMovies = promotion.applicable_movies ? promotion.applicable_movies.split(',') : [];
      const applicableCinemas = promotion.applicable_cinemas ? promotion.applicable_cinemas.split(',') : [];

      // Format dates for datetime-local input (giống slots)
const formatDate = (dateString: string) => {
  try {
    if (!dateString) return '';
    
    let date: Date;
    if (typeof dateString === 'string') {
      // Nếu là string format yyyy-MM-dd HH:mm:ss hoặc ISO string
      if (dateString.includes(' ')) {
        const [datePart, timePart] = dateString.split(' ');
        const [year, month, day] = datePart.split('-');
        const [hours, minutes, seconds] = timePart.split(':');
        
        date = new Date(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day),
          parseInt(hours),
          parseInt(minutes),
          parseInt(seconds || '0')
        );
      } else {
        date = new Date(dateString);
      }
    } else {
      date = new Date(dateString);
    }
    
    if (isNaN(date.getTime())) return '';
    
    // Chuyển sang format yyyy-MM-ddTHH:mm cho input với local timezone
    const offset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - offset);
    return localDate.toISOString().slice(0, 16);
  } catch (e) {
    console.error('Error formatting date:', e);
    return '';
  }
};

      setFormData({
        promotion_code: promotion.promotion_code,
        promotion_name: promotion.promotion_name,
        description: promotion.description || '',
        discount_type: promotion.discount_type,
        discount_value: promotion.discount_value.toString(),
        max_discount_amount: promotion.max_discount_amount?.toString() || '',
        min_order_amount: promotion.min_order_amount.toString(),
        usage_limit: promotion.usage_limit?.toString() || '',
        usage_per_user: promotion.usage_per_user.toString(),
        start_date: formatDate(promotion.start_date),
        end_date: formatDate(promotion.end_date),
        applicable_days: applicableDays,
        applicable_movies: applicableMovies,
        applicable_cinemas: applicableCinemas,
        status: promotion.status as 'active' | 'inactive',
        image_url: promotion.image_url || '',
      });
      
      setPromotion(promotion);
    } catch (error) {
      console.error('Error fetching promotion:', error);
      setError('Failed to fetch promotion');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setParamsResolved(resolvedParams);
    };
    resolveParams();
  }, [params]);

  useEffect(() => {
    if (paramsResolved) {
      fetchPromotion();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsResolved]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleDayToggle = (dayValue: string) => {
    setFormData(prev => ({
      ...prev,
      applicable_days: prev.applicable_days.includes(dayValue)
        ? prev.applicable_days.filter(d => d !== dayValue)
        : [...prev.applicable_days, dayValue]
    }));
  };

  const addMovie = () => {
    if (newMovie.trim() && !formData.applicable_movies.includes(newMovie.trim())) {
      setFormData(prev => ({
        ...prev,
        applicable_movies: [...prev.applicable_movies, newMovie.trim()]
      }));
      setNewMovie('');
    }
  };

  const removeMovie = (movie: string) => {
    setFormData(prev => ({
      ...prev,
      applicable_movies: prev.applicable_movies.filter(m => m !== movie)
    }));
  };

  const addCinema = () => {
    if (newCinema.trim() && !formData.applicable_cinemas.includes(newCinema.trim())) {
      setFormData(prev => ({
        ...prev,
        applicable_cinemas: [...prev.applicable_cinemas, newCinema.trim()]
      }));
      setNewCinema('');
    }
  };

  const removeCinema = (cinema: string) => {
    setFormData(prev => ({
      ...prev,
      applicable_cinemas: prev.applicable_cinemas.filter(c => c !== cinema)
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.promotion_code.trim()) {
      newErrors.promotion_code = 'Mã khuyến mại không được để trống';
    }

    if (!formData.promotion_name.trim()) {
      newErrors.promotion_name = 'Tên chương trình không được để trống';
    }

    if (!formData.discount_value || parseFloat(formData.discount_value) <= 0) {
      newErrors.discount_value = 'Giá trị giảm giá phải lớn hơn 0';
    }

    if (formData.discount_type === 'percentage' && parseFloat(formData.discount_value) > 100) {
      newErrors.discount_value = 'Giảm giá theo % không được vượt quá 100';
    }

    if (!formData.start_date) {
      newErrors.start_date = 'Ngày bắt đầu không được để trống';
    }

    if (!formData.end_date) {
      newErrors.end_date = 'Ngày kết thúc không được để trống';
    }

    if (formData.start_date && formData.end_date && new Date(formData.start_date) >= new Date(formData.end_date)) {
      newErrors.end_date = 'Ngày kết thúc phải sau ngày bắt đầu';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setSaving(true);
    try {
      const payload = {
        ...formData,
        discount_value: parseFloat(formData.discount_value),
        max_discount_amount: formData.max_discount_amount ? parseFloat(formData.max_discount_amount) : null,
        min_order_amount: parseFloat(formData.min_order_amount),
        usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
        usage_per_user: parseInt(formData.usage_per_user),
        applicable_days: formData.applicable_days.length > 0 ? formData.applicable_days.join(',') : null,
        applicable_movies: formData.applicable_movies.length > 0 ? formData.applicable_movies.join(',') : null,
        applicable_cinemas: formData.applicable_cinemas.length > 0 ? formData.applicable_cinemas.join(',') : null,
      };

      if (!paramsResolved) return;
      
      const response = await fetch(`/api/admin/promotions/${paramsResolved.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        router.push('/admin/promotions');
      } else {
        const error = await response.json();
        setError(error.error || 'Failed to update promotion');
      }
    } catch (error) {
      console.error('Error updating promotion:', error);
      setError('Failed to update promotion');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Chỉnh sửa Khuyến mại</h1>
            <p className="text-gray-600 mt-2">Cập nhật thông tin chương trình khuyến mại</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Thông tin cơ bản</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mã khuyến mại <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="promotion_code"
                  value={formData.promotion_code}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.promotion_code ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="VD: SUMMER2024"
                />
              </div>
              {errors.promotion_code && (
                <p className="mt-1 text-sm text-red-600">{errors.promotion_code}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên chương trình <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="promotion_name"
                value={formData.promotion_name}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.promotion_name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="VD: Khuyến mùa hè 2024"
              />
              {errors.promotion_name && (
                <p className="mt-1 text-sm text-red-600">{errors.promotion_name}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Mô tả chi tiết về chương trình khuyến mại..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Không hoạt động</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL Banner
              </label>
              <input
                type="url"
                name="image_url"
                value={formData.image_url}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/banner.jpg"
              />
            </div>
          </div>
        </div>

        {/* Discount Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Thông tin giảm giá</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loại giảm giá <span className="text-red-500">*</span>
              </label>
              <select
                name="discount_type"
                value={formData.discount_type}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="percentage">Giảm theo %</option>
                <option value="fixed_amount">Giảm cố định</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giá trị giảm giá <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                {formData.discount_type === 'percentage' ? (
                  <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                ) : (
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                )}
                <input
                  type="number"
                  name="discount_value"
                  value={formData.discount_value}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.discount_value ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={formData.discount_type === 'percentage' ? 'VD: 20' : 'VD: 50000'}
                />
              </div>
              {errors.discount_value && (
                <p className="mt-1 text-sm text-red-600">{errors.discount_value}</p>
              )}
            </div>

            {formData.discount_type === 'percentage' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giảm tối đa (VNĐ)
                </label>
                <input
                  type="number"
                  name="max_discount_amount"
                  value={formData.max_discount_amount}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="VD: 100000"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giá trị đơn hàng tối thiểu (VNĐ)
              </label>
              <input
                type="number"
                name="min_order_amount"
                value={formData.min_order_amount}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="VD: 100000"
              />
            </div>
          </div>
        </div>

        {/* Usage Limits */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Giới hạn sử dụng</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số lần sử dụng tối đa
              </label>
              <input
                type="number"
                name="usage_limit"
                value={formData.usage_limit}
                onChange={handleInputChange}
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Để trống nếu không giới hạn"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số lần mỗi user được dùng
              </label>
              <input
                type="number"
                name="usage_per_user"
                value={formData.usage_per_user}
                onChange={handleInputChange}
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="VD: 1"
              />
            </div>
          </div>
        </div>

        {/* Time Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Thời gian áp dụng</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày bắt đầu <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="datetime-local"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.start_date ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.start_date && (
                <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày kết thúc <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="datetime-local"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.end_date ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.end_date && (
                <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>
              )}
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ngày áp dụng trong tuần
            </label>
            <div className="flex flex-wrap gap-2">
              {daysOfWeek.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => handleDayToggle(day.value)}
                  className={`px-3 py-2 rounded-lg border transition-colors ${
                    formData.applicable_days.includes(day.value)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Đang lưu...' : 'Cập nhật khuyến mại'}
          </button>
        </div>
      </form>
    </div>
  );
}
