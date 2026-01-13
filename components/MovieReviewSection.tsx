/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Send, ChevronLeft, ChevronRight, Filter, User } from 'lucide-react';

interface Review {
  id: number;
  rating: number;
  comment: string | null;
  create_at: string;
  accounts: {
    id: number;
    username: string;
    full_name: string;
  };
}

interface MovieReviewSectionProps {
  movieId: number;
  userId?: number;
}

export default function MovieReviewSection({ movieId, userId }: MovieReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [ratingFilter, setRatingFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    fetchReviews();
  }, [movieId, ratingFilter, currentPage]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        size: pageSize.toString(),
        ...(ratingFilter && { rating: ratingFilter }),
      });
      const response = await fetch(`/api/movies/${movieId}/reviews?${params}`);
      const data = await response.json();
      setReviews(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!userId) {
      alert('Vui lòng đăng nhập để đánh giá phim');
      return;
    }

    if (rating === 0) {
      alert('Vui lòng chọn số sao đánh giá');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/movies/${movieId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          account_id: userId,
          rating,
          comment: comment.trim() || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message || 'Đánh giá của bạn đã được gửi và đang chờ phê duyệt');
        setRating(0);
        setComment('');
        setHasReviewed(true);
      } else {
        alert(data.message || 'Có lỗi xảy ra khi gửi đánh giá');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Có lỗi xảy ra khi gửi đánh giá');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (ratingValue: number, interactive = false) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = ratingValue >= star;
          const isHalfStar = !isFilled && ratingValue >= star - 0.5;
          
          if (interactive) {
            return (
              <Star
                key={star}
                className={`w-5 h-5 cursor-pointer transition-all ${
                  star <= (hoverRating || rating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-gray-300'
                }`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
              />
            );
          }
          
          return (
            <div key={star} className="relative w-4 h-4">
              {/* Base star (background) */}
              <svg className="w-4 h-4 absolute top-0 left-0" viewBox="0 0 24 24" fill="currentColor">
                <path className="text-gray-300" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              {/* Filled star overlay */}
              {(isFilled || isHalfStar) && (
                <svg className="w-4 h-4 absolute top-0 left-0" viewBox="0 0 24 24" fill="currentColor" style={isHalfStar ? { clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)' } : undefined}>
                  <path className="text-amber-400" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

 return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      
      {/* 1. HEADER & THỐNG KÊ TỔNG QUAN */}
      <div className="p-6 border-b border-gray-50 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Đánh giá & Nhận xét</h2>
            <p className="text-sm text-gray-500 mt-1">Xem mọi người nghĩ gì về phim này</p>
          </div>

          <div className="flex items-center gap-4 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
            <div className="text-center">
              <span className="text-2xl font-bold text-gray-900 leading-none">{averageRating}</span>
              <span className="text-[10px] text-gray-400 block uppercase font-bold mt-0.5">trên 5</span>
            </div>
            <div className="h-8 w-px bg-gray-200"></div>
            <div className="flex flex-col justify-center">
              {renderStars(parseFloat(averageRating))}
              <span className="text-xs text-gray-500 mt-1 font-medium">{reviews.length} lượt đánh giá</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. FORM VIẾT ĐÁNH GIÁ (GỌN GÀNG HƠN) */}
      {userId && !hasReviewed && (
        <div className="p-6 bg-blue-50/30">
          <div className="flex gap-4">
            {/* Avatar giả lập của người đang đánh giá */}
            <div className="hidden sm:flex w-10 h-10 rounded-full bg-blue-100 items-center justify-center text-blue-600 flex-shrink-0">
              <User className="w-5 h-5" />
            </div>

            <div className="flex-1">
              <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-700">Đánh giá của bạn:</span>
                  <div className="flex items-center gap-1 cursor-pointer">
                     {renderStars(rating, true)}
                  </div>
                </div>
                
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Bạn cảm thấy phim thế nào? Chia sẻ nhé..."
                  className="w-full text-sm text-gray-700 placeholder:text-gray-400 resize-none focus:outline-none bg-transparent min-h-[60px]"
                />
                
                <div className="flex justify-end mt-2 pt-2 border-t border-gray-50">
                   <button
                    onClick={handleSubmitReview}
                    disabled={submitting || rating === 0}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-blue-200"
                  >
                    {submitting ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Gửi đánh giá
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. BỘ LỌC & DANH SÁCH REVIEW */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            Reviews <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-normal">{totalElements}</span>
          </h3>
          
          <div className="relative">
            <Filter className="w-3 h-3 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <select
              value={ratingFilter}
              onChange={(e) => {
                setRatingFilter(e.target.value);
                setCurrentPage(0);
              }}
              className="pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 focus:outline-none focus:border-blue-500 cursor-pointer hover:bg-gray-50 transition-colors appearance-none"
            >
              <option value="">Tất cả sao</option>
              <option value="5">5 Tuyệt vời</option>
              <option value="4">4 Rất tốt</option>
              <option value="3">3 Tạm ổn</option>
              <option value="2">2 Tệ</option>
              <option value="1">1 Rất tệ</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-gray-400">Đang tải bình luận...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Chưa có đánh giá nào.</p>
            <p className="text-xs text-gray-400">Hãy là người đầu tiên chia sẻ cảm nhận!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review: any) => (
              <div key={review.id} className="flex gap-4 group">
                {/* Avatar */}
                <div className="flex-shrink-0">
                   <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-500 font-bold text-sm shadow-sm border border-white">
                      {review.accounts.full_name.charAt(0).toUpperCase()}
                   </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {review.accounts.full_name}
                    </h4>
                    <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                      {new Date(review.create_at).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                     {renderStars(review.rating)}
                  </div>

                  {review.comment && (
                    <div className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-tr-xl rounded-br-xl rounded-bl-xl border border-transparent group-hover:border-gray-100 group-hover:bg-white transition-all">
                      {review.comment}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 4. PHÂN TRANG GỌN NHẸ */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8 pt-6 border-t border-gray-50">
            <button
              onClick={() => setCurrentPage((prev: number) => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-blue-600 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <span className="text-xs font-medium text-gray-500">
              Trang <span className="text-gray-900 font-bold">{currentPage + 1}</span> / {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((prev: number) => Math.min(totalPages - 1, prev + 1))}
              disabled={currentPage === totalPages - 1}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-blue-600 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
