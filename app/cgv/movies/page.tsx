'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { Spin, Empty, Pagination } from 'antd';
import { 
  PlayCircleFilled, 
  ShoppingCartOutlined, 
  StarFilled,
  ClockCircleOutlined,
  HeartOutlined,
  HeartFilled
} from '@ant-design/icons';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { movieService, Movie } from '@/lib/services/movieService';
import CGVHeader from '@/components/cgv/CGVHeader';
import CGVFooter from '@/components/cgv/CGVFooter';

export default function AllMoviesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const status = searchParams.get('status') || 'all';
  
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [userFavorites, setUserFavorites] = useState<Set<number>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [optimisticFavorites, setOptimisticFavorites] = useState<Set<number>>(new Set());
  
  const pageSize = 12;

  useEffect(() => {
    fetchMovies();
    fetchUserFavorites();
  }, [currentPage, status]);

  // Listen for favorites updates from other pages
  useEffect(() => {
    const handleFavoritesUpdate = () => {
      fetchUserFavorites();
    };

    window.addEventListener('favorites_updated', handleFavoritesUpdate);
    
    return () => {
      window.removeEventListener('favorites_updated', handleFavoritesUpdate);
    };
  }, []);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const response = await movieService.getMovies({
        page: currentPage,
        size: pageSize,
        status: status === 'all' ? undefined : status,
      });
      setMovies(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (err) {
      console.error('Error fetching movies:', err);
      setError('Không thể tải danh sách phim');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (key: string) => {
    // Không reset page, giữ nguyên vị trí
    startTransition(() => {
      if (key === 'all') {
        router.push('/cgv/movies', { scroll: false });
      } else {
        router.push(`/cgv/movies?status=${key}`, { scroll: false });
      }
    });
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

  const fetchUserFavorites = async () => {
    try {
      const response = await fetch('/api/favorites');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const favoriteIds = new Set(result.data.map((movie: { id: number }) => movie.id)) as Set<number>;
          setUserFavorites(favoriteIds);
          setOptimisticFavorites(favoriteIds);
        }
      }
    } catch (error) {
      console.error('Error fetching user favorites:', error);
    }
  };

  const toggleFavorite = async (movieId: number) => {
    const isFavorited = optimisticFavorites.has(movieId);
    
    // Optimistic UI update - cập nhật ngay lập tức
    setOptimisticFavorites(prev => {
      const newFavorites = new Set(prev);
      if (isFavorited) {
        newFavorites.delete(movieId);
      } else {
        newFavorites.add(movieId);
      }
      return newFavorites;
    });

    // Cập nhật count ngay lập tức
    setMovies(prev => prev.map(movie => 
      movie.id === movieId 
        ? { 
            ...movie, 
            _count: { 
              ...movie._count, 
              favorites: isFavorited 
                ? Math.max(0, (movie._count?.favorites || 0) - 1)
                : (movie._count?.favorites || 0) + 1
            }
          }
        : movie
    ));

    try {
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
          
          // Notify other pages
          localStorage.setItem('favorites_updated', Date.now().toString());
          window.dispatchEvent(new Event('favorites_updated'));
        } else {
          // Rollback nếu thất bại
          setOptimisticFavorites(prev => {
            const newFavorites = new Set(prev);
            newFavorites.add(movieId);
            return newFavorites;
          });
          
          setMovies(prev => prev.map(movie => 
            movie.id === movieId 
              ? { 
                  ...movie, 
                  _count: { 
                    ...movie._count, 
                    favorites: (movie._count?.favorites || 0) + 1
                  }
                }
              : movie
          ));
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
            
            // Notify other pages
            localStorage.setItem('favorites_updated', Date.now().toString());
            window.dispatchEvent(new Event('favorites_updated'));
          }
        } else {
          // Rollback nếu thất bại
          if (response.status === 400) {
            // Movie already favorited
            setUserFavorites(prev => new Set(prev).add(movieId));
          } else {
            setOptimisticFavorites(prev => {
              const newFavorites = new Set(prev);
              newFavorites.delete(movieId);
              return newFavorites;
            });
            
            setMovies(prev => prev.map(movie => 
              movie.id === movieId 
                ? { 
                    ...movie, 
                    _count: { 
                      ...movie._count, 
                      favorites: Math.max(0, (movie._count?.favorites || 0) - 1)
                    }
                  }
                : movie
            ));
          }
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      
      // Rollback on error
      setOptimisticFavorites(prev => {
        const newFavorites = new Set(prev);
        if (isFavorited) {
          newFavorites.add(movieId);
        } else {
          newFavorites.delete(movieId);
        }
        return newFavorites;
      });
      
      setMovies(prev => prev.map(movie => 
        movie.id === movieId 
          ? { 
              ...movie, 
              _count: { 
                ...movie._count, 
                favorites: isFavorited 
                  ? (movie._count?.favorites || 0) + 1
                  : Math.max(0, (movie._count?.favorites || 0) - 1)
              }
            }
          : movie
      ));
    }
  };

  return (
    <>
      <CGVHeader />
      
      <div className="min-h-screen bg-[#fdfcf0]">
        {/* Page Header */}
        <div className="relative py-20 bg-[#fdfcf0] overflow-hidden border-b border-red-100">
          {/* Background Decor */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none">
            <span className="text-[120px] md:text-[180px] font-black text-gray-900/5 tracking-widest uppercase leading-none whitespace-nowrap">
              CINEMA
            </span>
          </div>

          {/* Content */}
          <div className="container mx-auto px-4 text-center relative z-10">
            {/* Label */}
            <div className="inline-flex items-center gap-2 mb-4 bg-white/80 backdrop-blur-sm border border-red-100 px-4 py-1 rounded-full shadow-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></div>
              <span className="text-[10px] font-bold tracking-[0.3em] text-red-600 uppercase">CGV Catalog</span>
              <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></div>
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter flex flex-col md:block items-center justify-center gap-2 md:gap-4 mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-red-600 to-red-800 drop-shadow-sm">
                MOVIES
              </span>
              <span className="text-[#2b2b2b] md:ml-4 relative">
                SELECTION
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-yellow-400" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.6" />
                </svg>
              </span>
            </h1>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-12">
          {/* Filter Tabs */}
          <div className="mb-8 flex gap-3 flex-wrap">
            <button
              onClick={() => handleTabChange('all')}
              disabled={isPending}
              className={`px-6 py-3 rounded-full font-bold transition-all duration-300 ${
                status === 'all'
                  ? 'bg-red-600 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 hover:bg-red-50 border-2 border-gray-200'
              } ${isPending ? 'opacity-50 cursor-wait' : ''}`}
            >
              <StarFilled className="mr-2" />
              Tất Cả Phim
            </button>
            <button
              onClick={() => handleTabChange('now_showing')}
              disabled={isPending}
              className={`px-6 py-3 rounded-full font-bold transition-all duration-300 ${
                status === 'now_showing'
                  ? 'bg-red-600 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 hover:bg-red-50 border-2 border-gray-200'
              } ${isPending ? 'opacity-50 cursor-wait' : ''}`}
            >
              <PlayCircleFilled className="mr-2" />
              Phim Đang Chiếu
            </button>
            <button
              onClick={() => handleTabChange('coming_soon')}
              disabled={isPending}
              className={`px-6 py-3 rounded-full font-bold transition-all duration-300 ${
                status === 'coming_soon'
                  ? 'bg-red-600 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 hover:bg-red-50 border-2 border-gray-200'
              } ${isPending ? 'opacity-50 cursor-wait' : ''}`}
            >
              <ClockCircleOutlined className="mr-2" />
              Phim Sắp Chiếu
            </button>
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
            <>
              <div className="mb-8 flex items-center gap-3 pl-4 border-l-4 border-red-600">
                <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Số lượng phim</span>
                <span className="text-3xl font-black text-gray-800 leading-none">{totalElements}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {movies.map((movie) => {
                  const rating = getMovieRating(movie);
                  const isFavorited = optimisticFavorites.has(movie.id);
                  
                  return (
                    <div 
                      key={movie.id}
                      className="group relative bg-white rounded-2xl overflow-hidden border-2 border-gray-100 hover:border-red-500 transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-red-200/50 hover:-translate-y-2"
                    >
                      {/* Poster Area */}
                      <div className="relative aspect-[2/3] overflow-hidden cursor-pointer">
                        {/* Badge Rating */}
                        <div className="absolute top-3 left-3 z-20">
                          <span className="bg-red-600 text-white text-xs font-extrabold px-2.5 py-1 rounded-md shadow-md border-2 border-white/30">
                            {getRatingBadge(movie.status)}
                          </span>
                        </div>

                        {/* Image */}
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

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-red-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                        {/* Play Button */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-50 group-hover:scale-100 z-10">
                          <Link href={`/cgv/movies/${movie.id}`}>
                            <button className="w-16 h-16 rounded-full bg-white/90 text-red-600 flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.5)] hover:bg-white hover:scale-110 transition-all backdrop-blur-sm">
                              <PlayCircleFilled className="text-4xl ml-1" />
                            </button>
                          </Link>
                        </div>

                        {/* Release Date */}
                        <div className="absolute bottom-3 right-3 z-20 bg-yellow-400 text-red-900 text-xs font-bold px-2 py-1 rounded shadow-sm transform translate-y-8 group-hover:translate-y-0 transition-transform duration-300 border border-yellow-300">
                          {formatDate(movie.release_date)}
                        </div>
                      </div>

                      {/* Content Area */}
                      <div className="p-4">
                        <Link href={`/cgv/movies/${movie.id}`}>
                          <h3 className="font-bold text-lg text-gray-800 mb-2 hover:text-red-600 transition-colors line-clamp-2 min-h-[3.5rem]">
                            {movie.title}
                          </h3>
                        </Link>

                        <p className="text-sm text-gray-500 mb-3 line-clamp-1">
                          {movie.genre || 'Thể loại: Đang cập nhật'}
                        </p>

                        {/* Rating & Favorite */}
                        <div className="flex items-center justify-between mb-4">
                          {/* Rating Display */}
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
                                );
                              })}
                            </div>
                            <div className="h-3 w-px bg-amber-200"></div>
                            <Link href={`/cgv/movies/${movie.id}#reviews`} className="text-[10px] font-medium text-amber-700 underline decoration-amber-300 underline-offset-1 cursor-pointer hover:text-amber-800 whitespace-nowrap">
                              {rating.count} đánh giá
                            </Link>
                          </div>

                          {/* Favorite Button */}
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => toggleFavorite(movie.id)}
                              className={`relative flex items-center justify-center w-7 h-7 rounded-full border transition-all duration-200 active:scale-90 ${
                                isFavorited
                                  ? 'bg-red-500 border-red-500 text-white shadow-sm shadow-red-200'
                                  : 'bg-white border-gray-200 text-gray-300 hover:border-red-200 hover:text-red-500'
                              }`}
                            >
                              {isFavorited ? (
                                <HeartFilled className="text-xs" />
                              ) : (
                                <HeartOutlined className="text-xs" />
                              )}
                            </button>
                            
                            <span className="text-xs font-medium text-gray-500">
                              {movie._count?.favorites || 0}
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-12">
                  <Pagination
                    current={currentPage + 1}
                    total={totalElements}
                    pageSize={pageSize}
                    onChange={(page) => setCurrentPage(page - 1)}
                    showSizeChanger={false}
                    className="cgv-pagination"
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <CGVFooter />
    </>
  );
}