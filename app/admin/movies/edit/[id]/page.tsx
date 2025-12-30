'use client';

import React, { useState, useEffect, use } from 'react'; // 1. Thêm 'use' từ react
import { useRouter } from 'next/navigation';
import MovieForm from '@/components/MovieForm';
import { movieService, UpdateMovieDto, Movie } from '@/lib/services/movieService';

// 2. Cập nhật Interface: params bây giờ là một Promise
interface EditMoviePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditMoviePage({ params }: EditMoviePageProps) {
  const router = useRouter();
  
  // 3. Sử dụng React.use() để lấy dữ liệu từ params
  const resolvedParams = React.use(params);
  const movieId = parseInt(resolvedParams.id);

  const [movie, setMovie] = useState<UpdateMovieDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const data = await movieService.getMovie(movieId);
        
        setMovie({
          title: data.title,
          description: data.description || undefined,
          duration: data.duration,
          release_date: data.release_date ? data.release_date.toString() : undefined,
          director: data.director || undefined,
          cast: data.cast || undefined,
          genre: data.genre || undefined,
          language: data.language || undefined,
          poster_url: data.poster_url || undefined,
          trailer_url: data.trailer_url || undefined,
          status: data.status || undefined,
        });
      } catch (err) {
        console.error('Error fetching movie:', err);
        setError('Không thể tải thông tin phim. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    if (movieId) {
      fetchMovie();
    }
  }, [movieId]);

  const handleSubmit = async (data: UpdateMovieDto) => {
    try {
      await movieService.updateMovie(movieId, data);
      alert('Cập nhật phim thành công!');
      router.push('/admin/movies');
    } catch (err) {
      console.error('Error updating movie:', err);
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin phim...</p>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="container mx-auto py-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Đã xảy ra lỗi</h2>
          <p className="text-red-500">{error || 'Không tìm thấy phim'}</p>
          <button
            onClick={() => router.push('/admin/movies')}
            className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
          >
            Quay lại danh sách phim
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Chỉnh sửa phim</h1>
        <p className="text-gray-600 mt-2">Cập nhật thông tin phim &quot;{movie.title}&quot;</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <MovieForm initialData={movie} onSubmit={handleSubmit} isEditing={true} />
      </div>
    </div>
  );
}