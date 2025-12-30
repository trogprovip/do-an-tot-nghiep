/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { Card, Badge, Spin, Empty, Tabs, Input } from 'antd';
import { PlayCircleOutlined, ShoppingCartOutlined, SearchOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { movieService, Movie } from '@/lib/services/movieService';
import CGVHeader from '@/components/cgv/CGVHeader';
import CGVFooter from '@/components/cgv/CGVFooter';

export default function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('now_showing');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMovies(activeTab);
  }, [activeTab]);

  const fetchMovies = async (status: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await movieService.getMovies({
        status: status === 'all' ? undefined : status,
        page: 0,
        size: 50,
      });
      setMovies(response.content);
    } catch (err) {
      console.error('Error fetching movies:', err);
      setError('Không thể tải danh sách phim');
    } finally {
      setLoading(false);
    }
  };

  const getRatingBadge = (status: string | null) => {
    if (status === 'now_showing') return '13+';
    if (status === 'coming_soon') return 'P';
    return '13+';
  };

  const getRatingColor = (status: string | null) => {
    if (status === 'coming_soon') return '#52c41a';
    if (status === 'ended') return '#f5222d';
    return '#faad14';
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Đang cập nhật';
    return new Date(date).toLocaleDateString('vi-VN');
  };

  const filteredMovies = movies.filter(movie =>
    movie.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white">
      {/* CGV Header */}
      <CGVHeader />

      {/* Page Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-12 mt-20">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold mb-4" style={{ fontFamily: 'Impact, sans-serif' }}>
            DANH SÁCH PHIM
          </h1>
          <p className="text-xl opacity-90">Khám phá những bộ phim đang chiếu và sắp chiếu</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <Input
            size="large"
            placeholder="Tìm kiếm phim..."
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>

        {/* Tabs */}
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          size="large"
          className="mb-8"
          items={[
            { key: 'now_showing', label: 'Đang Chiếu' },
            { key: 'coming_soon', label: 'Sắp Chiếu' },
            { key: 'ended', label: 'Đã Kết Thúc' },
            { key: 'all', label: 'Tất Cả' },
          ]}
        />

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <Spin size="large">
              <div className="text-center mt-4">Đang tải phim...</div>
            </Spin>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex justify-center items-center py-20">
            <Empty description={error} />
          </div>
        )}

        {/* Movies Grid */}
        {!loading && !error && (
          <>
            {filteredMovies.length === 0 ? (
              <Empty description="Không tìm thấy phim nào" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredMovies.map((movie) => (
                  <Card
                    key={movie.id}
                    hoverable
                    className="overflow-hidden shadow-lg transition-transform hover:scale-105 duration-300"
                    cover={
                      <div className="relative h-96 bg-gray-200">
                        {movie.poster_url ? (
                          <img 
                            src={movie.poster_url} 
                            alt={movie.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                            <PlayCircleOutlined className="text-6xl" />
                          </div>
                        )}
                        
                        {/* Rating Badge */}
                        <Badge
                          count={getRatingBadge(movie.status)}
                          className="absolute top-4 left-4"
                          style={{
                            backgroundColor: getRatingColor(movie.status),
                            fontSize: '14px',
                            fontWeight: 'bold',
                            padding: '4px 8px',
                          }}
                        />

                        {/* Release Date */}
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-center py-2 text-sm">
                          {formatDate(movie.release_date)}
                        </div>
                      </div>
                    }
                  >
                    <div className="p-4">
                      <h3 className="font-bold text-base mb-2 line-clamp-2 min-h-[48px]">
                        {movie.title}
                      </h3>
                      
                      {movie.genre && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-1">
                          {movie.genre}
                        </p>
                      )}

                      <div className="flex gap-2">
                        <Link href={`/movies/${movie.id}`} className="flex-1">
                          <button className="w-full bg-white border-2 border-red-600 text-red-600 py-2 rounded-lg font-bold hover:bg-red-50 transition-colors text-sm">
                            CHI TIẾT
                          </button>
                        </Link>
                        {movie.status === 'now_showing' && (
                          <Link href={`/booking/${movie.id}`} className="flex-1">
                            <button className="w-full bg-red-600 text-white py-0 rounded-lg font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-1 text-sm">
                              <ShoppingCartOutlined />
                              MUA VÉ
                            </button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* CGV Footer */}
      <CGVFooter />
    </div>
  );
}
