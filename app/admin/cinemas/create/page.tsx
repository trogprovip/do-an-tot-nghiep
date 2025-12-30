'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import CinemaForm from '@/components/CinemaForm';
import { cinemaService, CreateCinemaForm, UpdateCinemaForm } from '@/lib/services/cinemaService';

export default function CreateCinemaPage() {
  const router = useRouter();

  const handleSubmit = async (data: CreateCinemaForm | UpdateCinemaForm) => {
    try {
      await cinemaService.createCinema(data as CreateCinemaForm);
      alert('Thêm rạp thành công!');
      router.push('/admin/cinemas');
    } catch (error) {
      console.error('Error creating cinema:', error);
      throw error;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Thêm rạp chiếu mới</h1>
        <p className="text-gray-600 mt-2">Điền thông tin để thêm rạp chiếu mới vào hệ thống</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <CinemaForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
