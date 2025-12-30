'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import MovieForm from '@/components/MovieForm';
import { movieService, CreateMovieDto, UpdateMovieDto } from '@/lib/services/movieService';

export default function CreateMoviePage() {
  const router = useRouter();

  const handleSubmit = async (data: CreateMovieDto | UpdateMovieDto) => {
    const movieData = data as CreateMovieDto;
    try {
      await movieService.createMovie(movieData);
      alert('Thêm phim mới thành công!');
      router.push('/admin/movies');
    } catch (error) {
      console.error('Error creating movie:', error);
      throw error; // Để MovieForm component có thể bắt và hiển thị lỗi
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Thêm phim mới</h1>
        <p className="text-gray-600 mt-2">Điền thông tin để thêm phim mới vào hệ thống</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <MovieForm 
          onSubmit={handleSubmit} 
          isEditing={false} 
        />
      </div>
    </div>
  );
}
