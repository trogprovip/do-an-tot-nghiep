/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { Badge, Spin, Empty } from 'antd';
import { 
  PlayCircleFilled, 
  ShoppingCartOutlined, 
  StarFilled, 
  RightOutlined,
  HeartOutlined,
  HeartFilled
} from '@ant-design/icons';
import Link from 'next/link';
import { movieService, Movie } from '@/lib/services/movieService';

export default function MovieSelection() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userFavorites, setUserFavorites] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const response = await movieService.getMovies({
          status: 'now_showing',
          page: 0,
          size: 8,
        });
        setMovies(response.content);
      } catch (err) {
        console.error('Error fetching movies:', err);
        setError('Không thể tải danh sách phim');
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
    fetchUserFavorites();
  }, []);

  // Listen for favorites updates from other pages
  useEffect(() => {
    const handleFavoritesUpdate = async () => {
      fetchUserFavorites();
      // Refresh movies to get updated favorite counts
      try {
        const response = await movieService.getMovies({
          status: 'now_showing',
          page: 0,
          size: 8,
        });
        setMovies(response.content);
      } catch (err) {
        console.error('Error refreshing movies:', err);
      }
    };

    window.addEventListener('favorites_updated', handleFavoritesUpdate);
    
    return () => {
      window.removeEventListener('favorites_updated', handleFavoritesUpdate);
    };
  }, []);

  const fetchUserFavorites = async () => {
    try {
      const response = await fetch('/api/favorites');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const favoriteIds = new Set(result.data.map((movie: { id: number }) => movie.id)) as Set<number>;
          setUserFavorites(favoriteIds);
        }
      }
    } catch (error) {
      console.error('Error fetching user favorites:', error);
    }
  };

  const toggleFavorite = async (movieId: number) => {
    try {
      const isFavorited = userFavorites.has(movieId);
      
      if (isFavorited) {
        // Remove from favorites
        const response = await fetch(`/api/favorites?movieId=${movieId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          setUserFavorites(prev => {
            const newFavorites = new Set(prev);
            newFavorites.delete(movieId);
            return newFavorites;
          });
          
          // Update movie favorite count
          setMovies(prev => prev.map(movie => 
            movie.id === movieId 
              ? { ...movie, _count: { ...movie._count, favorites: Math.max(0, (movie._count?.favorites || 0) - 1) }}
              : movie
          ));
          
          // Notify other pages about favorite change
          localStorage.setItem('favorites_updated', Date.now().toString());
          window.dispatchEvent(new Event('favorites_updated'));
        }
      } else {
        // Add to favorites
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ movieId }),
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setUserFavorites(prev => new Set(prev).add(movieId));
            
            // Update movie favorite count
            setMovies(prev => prev.map(movie => 
              movie.id === movieId 
                ? { ...movie, _count: { ...movie._count, favorites: (movie._count?.favorites || 0) + 1 }}
                : movie
            ));
            
            // Notify other pages about favorite change
            localStorage.setItem('favorites_updated', Date.now().toString());
            window.dispatchEvent(new Event('favorites_updated'));
          }
        } else {
          // Handle error - movie already in favorites
          if (response.status === 400) {
            // Movie already favorited, update UI state
            setUserFavorites(prev => new Set(prev).add(movieId));
            
            // Notify other pages about favorite change
            localStorage.setItem('favorites_updated', Date.now().toString());
            window.dispatchEvent(new Event('favorites_updated'));
          }
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const getRatingBadge = (status: string | null) => 'T16'; 
  const formatDate = (date: Date | null) => date ? new Date(date).toLocaleDateString('vi-VN') : 'Đang cập nhật';
  
  const getMovieRating = (movie: Movie) => {
    if (!movie.reviews || movie.reviews.length === 0) {
      return { average: '0.0', count: 0 };
    }
    const totalRating = movie.reviews.reduce((sum, review) => sum + review.rating, 0);
    return {
      average: (totalRating / movie.reviews.length).toFixed(1),
      count: movie.reviews.length
    };
  };

  return (
    <section className="py-16 bg-[#fdfcf0] relative overflow-hidden overflow-x-hidden font-sans">
      
      {/* Background Decor - Vệt sáng nền ấm áp, rực rỡ */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-full bg-gradient-to-tr from-red-200/40 via-yellow-200/40 to-transparent blur-[100px] pointer-events-none"></div>
      
      {/* Họa tiết chấm bi mờ tạo texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#d90000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

      <div className="container mx-auto px-4 relative z-10">
        
        {/* Section Title - Style Màu Mè & Nổi Bật */}
        <div className="flex flex-col items-center mb-12">
            <span className="text-yellow-600 font-black tracking-[0.3em] text-sm uppercase mb-2 animate-pulse flex items-center gap-2">
                <StarFilled className="text-yellow-400" /> What On <StarFilled className="text-yellow-400" />
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-red-700 to-red-900 uppercase tracking-tighter drop-shadow-[0_2px_4px_rgba(220,38,38,0.3)]">
                PHIM ĐANG CHIẾU
            </h2>
            <div className="w-24 h-1.5 bg-gradient-to-r from-transparent via-red-600 to-transparent mt-4 rounded-full"></div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col justify-center items-center py-20 gap-4">
            <Spin size="large" />
            <span className="text-gray-600 font-bold">Đang tải phim...</span>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex justify-center items-center py-20">
             <Empty description={<span className="text-gray-600 font-bold">{error}</span>} />
          </div>
        )}

        {/* Movies Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-12">
            {movies.map((movie) => {
              const rating = getMovieRating(movie);
              return (
                <div 
                  key={movie.id}
                  className="group relative bg-white rounded-xl sm:rounded-2xl overflow-hidden border border-gray-100 sm:border-2 hover:border-red-500 transition-all duration-300 shadow-sm sm:shadow-md hover:shadow-lg sm:hover:shadow-xl hover:shadow-red-200/50 hover:-translate-y-1 sm:hover:-translate-y-2"
                >
                  {/* Poster Area */}
                  <div className="relative aspect-[2/3] overflow-hidden cursor-pointer">
                      {/* Badge Rating - Màu sắc hơn */}
                      <div className="absolute top-3 left-3 z-20">
                          <span className="bg-red-600 text-white text-xs font-extrabold px-2.5 py-1 rounded-md shadow-md border-2 border-white/30">
                              {getRatingBadge(movie.status)}
                          </span>
                      </div>

                      {/* Image with Zoom Effect */}
                      {movie.poster_url ? (
                        <img 
                          src={movie.poster_url} 
                          alt={movie.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                          <PlayCircleFilled className="text-5xl" />
                        </div>
                      )}

                      {/* Overlay gradient khi hover - Sáng hơn */}
                      <div className="absolute inset-0 bg-gradient-to-t from-red-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                      {/* Button Play giữa hình */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-50 group-hover:scale-100 z-10">
                          <Link href={`/cgv/movies/${movie.id}`}>
                              <button className="w-16 h-16 rounded-full bg-white/90 text-red-600 flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.5)] hover:bg-white hover:scale-110 transition-all backdrop-blur-sm">
                                  <PlayCircleFilled className="text-4xl ml-1" />
                              </button>
                          </Link>
                      </div>

                      {/* Release Date Tag - Màu vàng nổi bật */}
                      <div className="absolute bottom-3 right-3 z-20 bg-yellow-400 text-red-900 text-xs font-bold px-2 py-1 rounded shadow-sm transform translate-y-8 group-hover:translate-y-0 transition-transform duration-300 border border-yellow-300">
                          {formatDate(movie.release_date)}
                      </div>
                  </div>

                  {/* Content Area - Nền trắng, chữ đen */}
                  <div className="p-3 sm:p-4 lg:p-5 relative">
                    <h3 className="font-black text-xs sm:text-sm lg:text-lg text-gray-900 mb-1 line-clamp-1 group-hover:text-red-600 transition-colors" title={movie.title}>
                      {movie.title}
                    </h3>
                    <p className="text-[10px] sm:text-sm text-gray-500 mb-2 sm:mb-3 line-clamp-1 font-medium">Thể loại: Hành động, Viễn tưởng...</p>

                    {/* Rating Display */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="inline-flex items-center gap-2 px-2 py-1.5 bg-amber-50 border border-amber-100 rounded-full">
                          <div className="flex items-center gap-0.5 text-amber-400">
                            <span className="text-xs font-bold text-gray-900 mr-0.5">{rating.average}</span>
                            {[1, 2, 3, 4, 5].map((star) => {
                                const ratingValue = parseFloat(String(rating.average));
                                const isFilled = ratingValue >= star;
                                const isHalfStar = !isFilled && ratingValue >= star - 0.5;
          
                            return (
                            <div key={star} className="relative w-3 h-3">
                              {/* Base star (background) */}
                              <svg className="w-3 h-3 absolute top-0 left-0" viewBox="0 0 24 24" fill="currentColor">
                                <path className="text-gray-300" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                              </svg>
                              {/* Filled star overlay */}
                              {(isFilled || isHalfStar) && (
                                <svg className="w-3 h-3 absolute top-0 left-0" viewBox="0 0 24 24" fill="currentColor" style={isHalfStar ? { clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)' } : undefined}>
                                  <path className="text-amber-400" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                </svg>
                              )}
                            </div>
                              )
                            })}
                          </div>
                          <div className="h-3 w-px bg-amber-200"></div>
                                    <Link href={`/cgv/movies/${movie.id}#reviews`} className="text-[10px] font-medium text-amber-700 underline decoration-amber-300 underline-offset-1 cursor-pointer hover:text-amber-800 whitespace-nowrap">
                            {rating.count} đánh giá
                          </Link>
                        </div>

                      {/* Favorite Button */}
                        <div className="flex items-center gap-1.5">
                         {/* Nút bấm tròn (28px) */}
                        <button
                    onClick={() => toggleFavorite(movie.id)}
                    className={`relative flex items-center justify-center w-7 h-7 rounded-full border transition-all duration-200 active:scale-90 ${
                     userFavorites.has(movie.id)
                         ? 'bg-red-500 border-red-500 text-white shadow-sm shadow-red-200'
                     : 'bg-white border-gray-200 text-gray-300 hover:border-red-200 hover:text-red-500'
                         }`}
                        >
                  {userFavorites.has(movie.id) ? (
                       <HeartFilled className="text-xs" /> 
                    ) : (
                    <HeartOutlined className="text-xs" />
                  )}
                   </button>
    
                  {/* Phần chữ bên cạnh */}
                          <div className="flex flex-col leading-tight">
                            <span className={`text-[10px] font-bold ${userFavorites.has(movie.id) ? 'text-gray-800' : 'text-gray-500'}`}>
                              {movie._count?.favorites || 0 }
                            </span>
                          </div>
                        </div>
                      </div>
                    
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      <Link href={`/cgv/movies/${movie.id}`}>
                        <button className="w-full py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-bold border border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-300">
                          CHI TIẾT
                        </button>
                      </Link>
                      <Link href={`/cgv/movies/${movie.id}/showtimes`}>
                        <button className="w-full py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-bold bg-gradient-to-r from-red-600 to-red-500 text-white shadow-sm hover:shadow-md hover:shadow-red-500/30 hover:to-red-400 transition-all duration-300 flex items-center justify-center gap-1 group/btn">
                          <ShoppingCartOutlined className="group-hover/btn:animate-bounce text-[10px] sm:text-sm"/> MUA VÉ
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* View All Button - Màu đỏ rực */}
        <div className="text-center mt-10">
          <Link href="/cgv/movies">
            <button className="group relative inline-flex items-center justify-center px-10 py-3.5 overflow-hidden font-black text-red-600 transition-all duration-300 bg-white border-2 border-red-600 rounded-full hover:bg-red-600 hover:text-white shadow-md hover:shadow-xl hover:shadow-red-600/20">
              <span className="mr-2 uppercase tracking-widest text-sm">Xem tất cả phim</span>
              <RightOutlined className="group-hover:translate-x-1 transition-transform text-lg" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
