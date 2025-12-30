/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { Card, Badge, Spin, Empty } from 'antd';
import { PlayCircleOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { movieService, Movie } from '@/lib/services/movieService';

export default function MovieSelection() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  }, []);
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

  return (
    <section className="py-12 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Title */}
        <div className="text-center mb-8">
          <h2 
            className="text-4xl font-bold text-gray-800 inline-block relative"
            style={{
              fontFamily: 'Impact, sans-serif',
              letterSpacing: '2px',
            }}
          >
            <span className="relative z-10">MOVIE SELECTION</span>
            <div className="absolute inset-0 border-t-2 border-b-2 border-gray-800 top-1/2 -translate-y-1/2 -left-32 -right-32" />
          </h2>
        </div>

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {movies.map((movie) => (
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
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-center py-2">
                      {formatDate(movie.release_date)}
                    </div>
                  </div>
                }
              >
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-3 line-clamp-2 min-h-[56px]">
                    {movie.title}
                  </h3>
                  
                  <div className="flex gap-2">
                    <Link href={`/movies/${movie.id}`} className="flex-1">
                      <button className="w-full bg-white border-2 border-red-600 text-red-600 py-2 rounded-lg font-bold hover:bg-red-50 transition-colors">
                        XEM CHI TIẾT
                      </button>
                    </Link>
                    <Link href={`/booking/${movie.id}`} className="flex-1">
                      <button className="w-full bg-red-600 text-white py-2 rounded-lg font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2">
                        <ShoppingCartOutlined />
                        MUA VÉ
                      </button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* View All Button */}
        <div className="text-center">
          <Link href="/movies">
            <button className="bg-gray-800 text-white px-8 py-3 rounded-lg font-bold hover:bg-gray-700 transition-colors">
              XEM TẤT CẢ PHIM
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
