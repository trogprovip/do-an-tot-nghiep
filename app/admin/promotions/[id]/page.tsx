'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, Users, Ticket, Calendar, Tag, Percent, DollarSign } from 'lucide-react';

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

interface PromotionUsage {
  id: number;
  promotion_id: number;
  account_id: number;
  tickets_id: number;
  discount_amount: number;
  used_at: string;
  account?: {
    id: number;
    username: string;
    email: string;
    full_name: string;
  };
  tickets?: {
    id: number;
    tickets_code: string;
    final_amount: number;
  };
}

interface PromotionStats {
  totalUsage: number;
  totalDiscount: number;
  uniqueUsers: number;
  averageDiscount: number;
  usageByDay: Array<{
    date: string;
    count: number;
    discount: number;
  }>;
  topUsers: Array<{
    account_id: number;
    username: string;
    full_name: string;
    usage_count: number;
    total_discount: number;
  }>;
}

export default function PromotionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [usage, setUsage] = useState<PromotionUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [paramsResolved, setParamsResolved] = useState<{ id: string } | null>(null);

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setParamsResolved(resolvedParams);
    };
    resolveParams();
  }, [params]);

  useEffect(() => {
    if (paramsResolved) {
      fetchPromotionData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsResolved]);

  const fetchPromotionData = async () => {
    if (!paramsResolved) return;
    
    try {
      setLoading(true);
      const [promotionRes, usageRes] = await Promise.all([
        fetch(`/api/admin/promotions/${paramsResolved.id}`),
        fetch(`/api/admin/promotions/${paramsResolved.id}/usage`)
      ]);

      if (promotionRes.ok) {
        const promotionData = await promotionRes.json();
        setPromotion(promotionData);
      }

      if (usageRes.ok) {
        const usageData = await usageRes.json();
        setUsage(usageData.content || []);
      }
    } catch (error) {
      console.error('Error fetching promotion data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa khuyến mại này?')) return;
    if (!paramsResolved) return;
    
    try {
      const response = await fetch(`/api/admin/promotions/${paramsResolved.id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        router.push('/admin/promotions');
      }
    } catch (error) {
      console.error('Error deleting promotion:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Đang hoạt động';
      case 'inactive':
        return 'Không hoạt động';
      case 'expired':
        return 'Hết hạn';
      default:
        return status;
    }
  };

  const formatDiscount = (promotion: Promotion) => {
    if (promotion.discount_type === 'percentage') {
      return `${promotion.discount_value}%`;
    } else {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(promotion.discount_value);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const getDaysOfWeek = (daysString?: string) => {
    if (!daysString) return 'Tất cả các ngày';
    
    const days = daysString.split(',');
    const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    
    return days.map(day => dayNames[parseInt(day)] || '').join(', ');
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

  if (!promotion) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy khuyến mại</h3>
        <p className="text-gray-500 mb-4">Khuyến mại này không tồn tại hoặc đã bị xóa.</p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              Quay lại
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{promotion.promotion_name}</h1>
              <p className="text-gray-600 mt-2">Chi tiết chương trình khuyến mại</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {paramsResolved && (
              <a
                href={`/admin/promotions/${paramsResolved.id}/edit`}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Chỉnh sửa
              </a>
            )}
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Xóa
            </button>
          </div>
        </div>
      </div>

      {/* Promotion Info Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Tag className="w-5 h-5 text-blue-600" />
              <span className="text-lg font-semibold text-gray-900">{promotion.promotion_code}</span>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(promotion.status)}`}>
                {getStatusText(promotion.status)}
              </span>
            </div>
            
            {promotion.description && (
              <p className="text-gray-600 mb-4">{promotion.description}</p>
            )}

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {promotion.discount_type === 'percentage' ? (
                  <Percent className="w-4 h-4 text-green-600" />
                ) : (
                  <DollarSign className="w-4 h-4 text-blue-600" />
                )}
                <span className="font-medium">Giảm giá:</span>
                <span className="text-gray-900">{formatDiscount(promotion)}</span>
              </div>

              {promotion.discount_type === 'percentage' && promotion.max_discount_amount && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Tối đa:</span>
                  <span>{formatCurrency(promotion.max_discount_amount)}</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Đơn hàng tối thiểu:</span>
                <span>{formatCurrency(promotion.min_order_amount)}</span>
              </div>
            </div>
          </div>

          <div>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-600">Thời gian</div>
                  <div className="text-sm font-medium">{formatDate(promotion.start_date)}</div>
                  <div className="text-sm text-gray-500">đến {formatDate(promotion.end_date)}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-600">Sử dụng</div>
                  <div className="text-sm font-medium">
                    {promotion.usage_count} {promotion.usage_limit && `/ ${promotion.usage_limit}`}
                  </div>
                  <div className="text-sm text-gray-500">{promotion.usage_per_user} lần/người dùng</div>
                </div>
              </div>

              {promotion.applicable_days && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-600">Ngày áp dụng</div>
                    <div className="text-sm font-medium">{getDaysOfWeek(promotion.applicable_days)}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {promotion.image_url && (
          <div className="mt-6">
            <img
              src={promotion.image_url}
              alt={promotion.promotion_name}
              className="w-full h-48 object-cover rounded-lg"
            />
          </div>
        )}
      </div>

      {/* Số lượng người kích hoạt */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Số lượng người kích hoạt</h3>
          </div>
        </div>

        <div className="p-6">
          <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tài khoản Gmail
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thời gian kích hoạt
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {usage.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.account_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.account?.email || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(item.used_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {usage.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có người kích hoạt</h3>
                  <p className="text-gray-500">Chưa có ai kích hoạt khuyến mại này.</p>
                </div>
              )}
            </div>
        </div>
      </div>
    </div>
  );
}
