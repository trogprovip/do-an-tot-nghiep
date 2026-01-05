/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import SlotForm from '@/components/SlotForm';
import { slotService } from '@/lib/services/slotService';

export default function CreateSlotPage() {
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    try {
      await slotService.createSlot(data);
      alert('Thêm suất chiếu thành công!');
      router.push('/admin/slots');
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error.message || 'Có lỗi xảy ra khi thêm suất chiếu';
      throw new Error(errorMessage);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Thêm suất chiếu mới</h1>
        <p className="text-gray-600 mt-2">Điền thông tin để thêm suất chiếu mới vào hệ thống</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <SlotForm onSubmit={handleSubmit} isEditing={false} />
      </div>
    </div>
  );
}