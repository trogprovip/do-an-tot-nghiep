'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CinemaForm from '@/components/CinemaForm';
import { cinemaService, UpdateCinemaForm, Cinema } from '@/lib/services/cinemaService';

interface EditCinemaPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditCinemaPage({ params }: EditCinemaPageProps) {
  const resolvedParams = React.use(params);
  const cinemaId = parseInt(resolvedParams.id);

  const [cinema, setCinema] = useState<UpdateCinemaForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchCinema();
  }, [cinemaId]);

  const fetchCinema = async () => {
    try {
      setLoading(true);
      const data: Cinema = await cinemaService.getCinema(cinemaId);
      
      setCinema({
        cinema_name: data.cinema_name,
        address: data.address,
        phone: data.phone || '',
        email: data.email || '',
        province_id: data.province_id,
        latitude: data.latitude ? parseFloat(data.latitude) : undefined,
        longitude: data.longitude ? parseFloat(data.longitude) : undefined,
        status: data.status || 'active',
      });
    } catch (err) {
      console.error('Error fetching cinema:', err);
      setError('Không thể tải thông tin rạp');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: UpdateCinemaForm) => {
    try {
      await cinemaService.updateCinema(cinemaId, data);
      alert('Cập nhật rạp thành công!');
      router.push('/admin/cinemas');
    } catch (err) {
      console.error('Error updating cinema:', err);
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Đang tải thông tin rạp...</p>
        </div>
      </div>
    );
  }

  if (error || !cinema) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error || 'Không tìm thấy thông tin rạp'}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Chỉnh sửa rạp chiếu</h1>
        <p className="text-gray-600 mt-2">Cập nhật thông tin rạp chiếu trong hệ thống</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <CinemaForm 
          initialData={cinema} 
          onSubmit={handleSubmit} 
          isEditing={true}
        />
      </div>
    </div>
  );
}
