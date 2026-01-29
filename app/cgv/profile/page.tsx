'use client';

import React, { useState, useEffect } from 'react';
import { Spin, Avatar, Button, Tabs, Card, Tag } from 'antd';
import { 
  UserOutlined, 
  HistoryOutlined, 
  HeartOutlined, 
  HeartFilled,
  SettingOutlined,
  CrownOutlined,
  CalendarOutlined,
  PhoneOutlined,
  MailOutlined,
  EditOutlined,
  TagOutlined,
  CloseOutlined,
  QrcodeOutlined,
  ClockCircleOutlined,
  CheckCircleFilled,
  PlayCircleOutlined,
  StarOutlined,
  GiftOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import Image from 'next/image';
import CGVHeader from '@/components/cgv/CGVHeader';
import CGVFooter from '@/components/cgv/CGVFooter';
import BackButton from '@/components/ui/BackButton';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  full_name: string;
  phone: string;
  avatar_url?: string;
  membership_tier: string;
  points: number;
  created_at: string;
}

interface BookingHistory {
  id: number;
  movie_title: string;
  cinema_name: string;
  showtime: string;
  seats: string;
  total_price: number;
  status: string;
  booking_date: string;
  tickets_code?: string;
  payment_status?: string;
  slots?: {
    movies: {
      title: string;
      poster?: string;
    };
    rooms: {
      room_name: string;
      cinemas?: {
        cinema_name: string;
      };
    };
    show_time: string;
  };
  bookingseats?: Array<{
    id: number;
    seat_price: number;
    seats: {
      seat_number: string;
      seat_row: string;
      seattypes: {
        type_name: string;
      };
    };
  }>;
  ticketsdetails?: Array<{
    id: number;
    quantity: number;
    unit_price: number;
    total_price: number;
    products: {
      product_name: string;
      category: 'food' | 'drink' | 'combo' | 'voucher';
    };
  }>;
}

interface FavoriteMovie {
  id: number;
  title: string;
  poster_url: string;
  genre: string;
  duration: number;
  release_date: string;
}

interface ReviewHistory {
  id: number;
  rating: number;
  comment: string | null;
  status: string;
  create_at: string;
  movies: {
    id: number;
    title: string;
    poster_url: string | null;
    genre: string | null;
  };
}

interface UserVoucher {
  id: number;
  title: string;
  description: string;
  discount_type: string;
  discount_value: number;
  code: string;
  used_at: string;
  expired_at: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [bookings, setBookings] = useState<BookingHistory[]>([]);
  const [favorites, setFavorites] = useState<FavoriteMovie[]>([]);
  const [reviews, setReviews] = useState<ReviewHistory[]>([]);
  const [userVouchers, setUserVouchers] = useState<UserVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedBooking, setSelectedBooking] = useState<BookingHistory | null>(null);
  const [selectedVoucher, setSelectedVoucher] = useState<UserVoucher | null>(null);
  const [promotionCode, setPromotionCode] = useState('');
  const [activatingVoucher, setActivatingVoucher] = useState(false);
  const [voucherMessage, setVoucherMessage] = useState<{ type: 'success' | 'error' | ''; message: string }>({ type: '', message: '' });

  // Helper function to get cookie
  const getCookie = (name: string) => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return null;
  };

  // Check URL parameter for tab selection
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tab = urlParams.get('tab');
      if (tab === 'bookings') {
        setActiveTab('bookings');
      }
    }
  }, []);

  useEffect(() => {
    fetchUserData();
    fetchBookingHistory();
    fetchFavoriteMovies();
    fetchReviewHistory();
    fetchUserVouchers();
  }, []);

  // Listen for favorites updates from other pages
  useEffect(() => {
    const handleFavoritesUpdate = () => {
      fetchFavoriteMovies();
    };

    window.addEventListener('favorites_updated', handleFavoritesUpdate);
    
    return () => {
      window.removeEventListener('favorites_updated', handleFavoritesUpdate);
    };
  }, []);

  const fetchUserData = async () => {
    try {
      // Get token from cookies (not localStorage)
      const token = getCookie('auth_token');
      
      // Call API to get user data from database
      const response = await fetch('/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      
      const result = await response.json();
      
      if (result.success) {
        setUser(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch user data');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Fallback to mock data if API fails
      const mockUser: UserProfile = {
        id: 1,
        username: 'cgv_member',
        email: 'user@example.com',
        full_name: 'Nguyễn Văn A',
        phone: '0912345678',
        avatar_url: 'https://via.placeholder.com/150',
        membership_tier: 'GOLD',
        points: 2500,
        created_at: '2024-01-15'
      };
      setUser(mockUser);
    }
  };

  const fetchBookingHistory = async () => {
    try {
      const token = getCookie('auth_token');
      
      // Call API to get booking history from database
      const response = await fetch('/api/users/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch booking history');
      }
      
      const result = await response.json();
      
      if (result.success) {
        setBookings(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch booking history');
      }
    } catch (error) {
      console.error('Error fetching booking history:', error);
      // Fallback to empty array if API fails
      setBookings([]);
    }
  };

  const fetchFavoriteMovies = async () => {
    try {
      const token = getCookie('auth_token');
      
      // Call API to get favorite movies from database
      const response = await fetch('/api/users/favorites', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch favorite movies');
      }
      
      const result = await response.json();
      
      if (result.success) {
        setFavorites(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch favorite movies');
      }
    } catch (error) {
      console.error('Error fetching favorite movies:', error);
      // Fallback to empty array if API fails
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviewHistory = async () => {
    try {
      const token = getCookie('auth_token');
      
      const response = await fetch('/api/users/reviews?size=100', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch review history');
      }
      
      const result = await response.json();
      
      if (result.success) {
        setReviews(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch review history');
      }
    } catch (error) {
      console.error('Error fetching review history:', error);
      setReviews([]);
    }
  };

  const fetchUserVouchers = async () => {
    try {
      const token = getCookie('auth_token');
      
      const response = await fetch('/api/user/vouchers', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user vouchers');
      }
      
      const result = await response.json();
      
      if (result.success) {
        setUserVouchers(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch user vouchers');
      }
    } catch (error) {
      console.error('Error fetching user vouchers:', error);
      setUserVouchers([]);
    }
  };

  const getMembershipColor = (tier: string) => {
    switch (tier?.toUpperCase()) {
      case 'PLATINUM': return 'bg-gradient-to-r from-gray-700 to-gray-900';
      case 'GOLD': return 'bg-gradient-to-r from-yellow-500 to-amber-600';
      case 'SILVER': return 'bg-gradient-to-r from-gray-400 to-gray-600';
      default: return 'bg-gradient-to-r from-blue-500 to-blue-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'used': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'Đã xác nhận';
      case 'cancelled': return 'Đã hủy';
      case 'used': return 'Đã sử dụng';
      case 'pending': return 'Chờ xét duyệt';
      default: return status;
    }
  };

  const handleActivateVoucher = async () => {
    if (!promotionCode.trim()) {
      setVoucherMessage({ type: 'error', message: 'Vui lòng nhập mã khuyến mại' });
      return;
    }

    setActivatingVoucher(true);
    setVoucherMessage({ type: '', message: '' });

    try {
      const token = getCookie('auth_token');
      
      const response = await fetch('/api/user/vouchers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          promotion_code: promotionCode.trim().toUpperCase()
        }),
      });

      const result = await response.json();

      if (result.success) {
        setVoucherMessage({ 
          type: 'success', 
          message: `🎉 Kích hoạt thành công! Bạn nhận được ${result.data.discount_value}${result.data.discount_type === 'percentage' ? '%' : 'đ'} giảm giá` 
        });
        setPromotionCode('');
        // Refresh vouchers after successful activation
        await fetchUserVouchers();
      } else {
        setVoucherMessage({ 
          type: 'error', 
          message: result.error || 'Mã khuyến mại không hợp lệ hoặc đã hết hạn' 
        });
      }
    } catch (error) {
      console.error('Error activating voucher:', error);
      setVoucherMessage({ 
        type: 'error', 
        message: 'Có lỗi xảy ra, vui lòng thử lại sau' 
      });
    } finally {
      setActivatingVoucher(false);
    }
  };

  if (loading) {
    return (
      <>
        <CGVHeader />
        <div className="min-h-screen bg-[#fdfcf0] flex items-center justify-center">
          <Spin size="large" />
        </div>
        <CGVFooter />
      </>
    );
  }

  return (
    <div>
      <CGVHeader />
      
      <div className="min-h-screen bg-[#fdfcf0]">
        {/* Back Button */}
        <div className="container mx-auto px-4 pt-6">
          <BackButton 
            onClick={() => window.history.back()}
            text="Quay lại trang chủ"
          />
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Profile Header */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Avatar */}
              <div className="relative">
                <Avatar 
                  size={120} 
                  src={user?.avatar_url ? `${user.avatar_url}?t=${Date.now()}` : undefined} 
                  icon={<UserOutlined />}
                  className="border-4 border-white shadow-lg"
                />
              </div>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">{user?.full_name}</h1>
                <p className="text-gray-600 mb-4">@{user?.username}</p>
                
                {/* Membership Badge */}
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-white font-bold ${getMembershipColor(user?.membership_tier || '')} mb-4`}>
                  <CrownOutlined />
                  {user?.membership_tier} MEMBER
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MailOutlined />
                    {user?.email}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <PhoneOutlined />
                    {user?.phone}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <CalendarOutlined />
                    Tham gia: {new Date(user?.created_at || '').toLocaleDateString('vi-VN')}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <TagOutlined />
                    {user?.points?.toLocaleString()} điểm
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <Link href="/cgv/profile/edit">
                  <Button type="primary" icon={<EditOutlined />} size="large" className="bg-red-600 hover:bg-red-700 w-full">
                    Chỉnh Sửa Hồ Sơ
                  </Button>
                </Link>
                <Button icon={<SettingOutlined />} size="large">
                  Cài Đặt
                </Button>
              </div>
            </div>
          </div>

          {/* Tabs Content */}
<Tabs
  activeKey={activeTab}
  onChange={setActiveTab}
  className="profile-tabs-premium"
  items={[
    {
      key: 'overview',
      label: (
        <span className="flex items-center gap-2 py-2">
          <UserOutlined className="text-lg" />
          <span className="font-semibold tracking-wide">TỔNG QUAN</span>
        </span>
      ),
      children: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-2">
          {[
            { label: 'Lịch Đặt Vé', count: bookings.length, icon: <HistoryOutlined />, color: 'bg-rose-50 text-rose-600' },
            { label: 'Phim Yêu Thích', count: favorites.length, icon: <HeartOutlined />, color: 'bg-amber-50 text-amber-600' },
            { label: 'Điểm Thưởng', count: user?.points?.toLocaleString(), icon: <StarOutlined />, color: 'bg-blue-50 text-blue-600' }
          ].map((item, i) => (
            <div key={i} className="relative group p-8 rounded-[2rem] bg-white border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-300 overflow-hidden">
              <div className={`absolute top-0 right-0 w-24 h-24 -mr-6 -mt-6 rounded-full opacity-20 transition-transform group-hover:scale-150 duration-500 ${item.color.split(' ')[0]}`} />
              <div className={`${item.color} w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-sm`}>
                {item.icon}
              </div>
              <div className="text-4xl font-black text-gray-900 mb-1">{item.count}</div>
              <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">{item.label}</div>
            </div>
          ))}
        </div>
      )
    },
    {
      key: 'bookings',
      label: (
        <span className="flex items-center gap-2 py-2">
          <HistoryOutlined className="text-lg" />
          <span className="font-semibold tracking-wide">LỊCH SỬ ĐẶT VÉ</span>
        </span>
      ),
      children: (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <div key={booking.id} className="group relative flex flex-col md:flex-row bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500">
              {/* Phần "Cuống vé" bên trái */}
              <div className="bg-gray-50 md:w-12 border-r border-dashed border-gray-200 flex items-center justify-center py-4">
                <span className="md:-rotate-90 whitespace-nowrap text-[10px] font-bold text-gray-400 tracking-[0.3em] uppercase">
                   {booking.tickets_code || 'CINEMA TICKET'}
                </span>
              </div>

              {/* Nội dung vé */}
              <div className="flex-1 p-6 flex flex-col md:flex-row justify-between gap-6">
                <div className="flex-1">
                  <div className="inline-block px-3 py-1 rounded-full bg-red-50 text-red-600 text-[10px] font-bold uppercase mb-3">
                    Movie Booking
                  </div>
                  <h3 className="text-2xl font-black text-gray-800 mb-2 group-hover:text-red-600 transition-colors">
                    {booking.movie_title}
                  </h3>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Rạp</p>
                      <p className="text-sm font-semibold text-gray-700">{booking.cinema_name}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Ghế</p>
                      <p className="text-sm font-bold text-red-600">{booking.seats}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Thời gian</p>
                      <p className="text-sm font-semibold text-gray-700">
                        {new Date(booking.showtime).toLocaleString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Phần thanh toán */}
                <div className="md:w-48 flex flex-col justify-between items-end border-t md:border-t-0 md:border-l border-dashed border-gray-200 pt-6 md:pt-0 md:pl-8">
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Tổng cộng</p>
                    <div className="text-3xl font-black text-gray-900 leading-none">
                      {booking.total_price.toLocaleString('vi-VN')}<span className="text-sm ml-1 font-bold">đ</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-3 w-full">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${getStatusColor(booking.status)}`}>
                      {getStatusText(booking.status)}
                    </span>
                    <button
                      onClick={() => setSelectedBooking(booking)}
                      className="w-full py-2.5 bg-gray-900 hover:bg-red-600 text-white text-[11px] font-bold rounded-xl transition-all duration-300 active:scale-95 shadow-lg shadow-gray-200"
                    >
                      CHI TIẾT VÉ
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )
    },
    {
      key: 'favorites',
      label: (
        <span className="flex items-center gap-2 py-2">
          <HeartOutlined className="text-lg" />
          <span className="font-semibold tracking-wide">YÊU THÍCH</span>
        </span>
      ),
      children: (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {favorites.map((movie) => (
            <Link key={movie.id} href={`/cgv/movies/${movie.id}`} className="group">
              <div className="relative rounded-[2rem] overflow-hidden shadow-lg transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl">
                <div className="aspect-[2/3] overflow-hidden">
                  <Image 
                    src={movie.poster_url} 
                    alt={movie.title}
                    width={300}
                    height={450}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                {/* Overlay khi hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-6">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white mb-2 mx-auto">
                    <PlayCircleOutlined className="text-2xl" />
                  </div>
                </div>
              </div>
              <h4 className="mt-4 font-bold text-sm text-gray-800 text-center px-2 group-hover:text-red-600 transition-colors line-clamp-1 italic">
                {movie.title}
              </h4>
            </Link>
          ))}
        </div>
      )
    },
    {
      key: 'reviews',
      label: (
        <span className="flex items-center gap-2 py-2">
          <StarOutlined className="text-lg" />
          <span className="font-semibold tracking-wide">LỊCH SỬ ĐÁNH GIÁ</span>
        </span>
      ),
      children: (
        <div className="space-y-6">
          {reviews.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl">
              <StarOutlined className="text-6xl text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">Bạn chưa có đánh giá nào</p>
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="group relative flex flex-col md:flex-row bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500">
                {/* Movie Poster */}
                <div className="md:w-32 h-48 md:h-auto relative overflow-hidden bg-gray-100">
                  {review.movies.poster_url ? (
                    <Image
                      src={review.movies.poster_url}
                      alt={review.movies.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <PlayCircleOutlined className="text-4xl text-gray-300" />
                    </div>
                  )}
                </div>

                {/* Review Content */}
                <div className="flex-1 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <Link href={`/cgv/movies/${review.movies.id}`}>
                        <h3 className="text-2xl font-black text-gray-800 mb-2 group-hover:text-red-600 transition-colors cursor-pointer">
                          {review.movies.title}
                        </h3>
                      </Link>
                      {review.movies.genre && (
                        <p className="text-sm text-gray-500 mb-3">{review.movies.genre}</p>
                      )}
                    </div>
                    
                    {/* Status Badge */}
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      review.status === 'approved' ? 'bg-green-100 text-green-800' :
                      review.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {review.status === 'approved' ? 'Đã duyệt' :
                       review.status === 'pending' ? 'Chờ duyệt' :
                       'Từ chối'}
                    </span>
                  </div>

                  {/* Rating Stars */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarOutlined
                          key={star}
                          className={`text-lg ${
                            star <= review.rating
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                          }`}
                          style={{ 
                            color: star <= review.rating ? '#fadb14' : undefined 
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-semibold text-gray-700">
                      {review.rating}/5
                    </span>
                  </div>

                  {/* Comment */}
                  {review.comment && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-3">
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {review.comment}
                      </p>
                    </div>
                  )}

                  {/* Date */}
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <CalendarOutlined />
                    {new Date(review.create_at).toLocaleDateString('vi-VN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )
    },
    {
      key: 'promotions',
      label: (
        <span className="flex items-center gap-2 py-2">
          <GiftOutlined className="text-lg" />
          <span className="font-semibold tracking-wide">MÃ KHUYẾN MẠI</span>
        </span>
      ),
      children: (
<div className="max-w-4xl mx-auto space-y-8 p-4">
  {/* Section 1: Kích hoạt mã khuyến mại */}
  <div className="relative overflow-hidden bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
    {/* Decor nền nhẹ nhàng */}
    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-red-50 rounded-full blur-3xl opacity-50" />
    
    <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-gradient-to-tr from-red-600 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-red-200">
          <GiftOutlined className="text-2xl text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">Voucher Ưu Đãi</h3>
          <p className="text-gray-500">Nhập mã khuyến mại để tiết kiệm chi phí</p>
        </div>
      </div>

      <div className="flex w-full md:w-auto gap-2 p-1.5 bg-gray-50 rounded-2xl border border-gray-100">
        <input
          type="text"
          placeholder="Nhập mã của bạn..."
          value={promotionCode}
          onChange={(e) => setPromotionCode(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleActivateVoucher()}
          className="flex-1 md:w-64 px-4 py-3 bg-transparent focus:outline-none font-medium text-gray-700"
        />
        <button
          onClick={handleActivateVoucher}
          disabled={activatingVoucher}
          className="px-8 py-3 bg-gray-900 hover:bg-red-600 disabled:bg-gray-300 text-white font-bold rounded-xl transition-all duration-300 active:scale-95 shadow-md"
        >
          {activatingVoucher ? '...' : 'Kích Hoạt'}
        </button>
      </div>
    </div>

    {/* Message display - Tinh tế hơn */}
    {voucherMessage.message && (
      <div className={`mt-4 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-2 ${
        voucherMessage.type === 'success' 
          ? 'bg-green-50 text-green-700 border border-green-100' 
          : 'bg-red-50 text-red-700 border border-red-100'
      }`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
        {voucherMessage.message}
      </div>
    )}
  </div>

  {/* Section 2: Kho voucher */}
  <div>
    <div className="flex items-center justify-between mb-6 px-2">
      <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
        <div className="w-2 h-6 bg-red-600 rounded-full" />
        Voucher của bạn <span className="text-gray-400 font-normal">({userVouchers.length})</span>
      </h3>
    </div>

    {userVouchers.length === 0 ? (
      <div className="bg-gray-50 rounded-3xl py-16 flex flex-col items-center border-2 border-dashed border-gray-200">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
          <TagOutlined className="text-3xl text-gray-300" />
        </div>
        <p className="text-gray-500 font-medium">Kho ưu đãi đang trống</p>
        <p className="text-gray-400 text-sm">Săn mã ngay để nhận quà bạn nhé!</p>
      </div>
    ) : (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {userVouchers
          .filter(voucher => new Date(voucher.expired_at) >= new Date())
          .map((voucher) => (
            <div key={voucher.id} className="group relative flex bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-red-200 hover:shadow-xl hover:shadow-red-500/5 transition-all duration-300">
              {/* Left Side: Ticket Stub Design */}
              <div className="w-32 bg-gradient-to-br from-red-600 to-red-500 p-4 flex flex-col items-center justify-center text-white relative border-r border-dashed border-white/30">
                {/* Half circles for ticket effect */}
                <div className="absolute -top-3 -right-3 w-6 h-6 bg-white rounded-full border border-gray-100" />
                <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-white rounded-full border border-gray-100" />
                
                <span className="text-xs font-medium opacity-80 uppercase tracking-wider">Giảm</span>
                <span className="text-2xl font-black">
                  {voucher.discount_type === 'percentage' ? `${voucher.discount_value}%` : `${voucher.discount_value/1000}k`}
                </span>
              </div>

              {/* Right Side: Content */}
              <div className="flex-1 p-5 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-gray-900 line-clamp-1 group-hover:text-red-600 transition-colors">
                      {voucher.title}
                    </h4>
                    <span className="text-[10px] font-bold bg-red-50 text-red-600 px-2 py-0.5 rounded uppercase">
                      Mã: {voucher.code}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                    {voucher.description}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 uppercase">Hết hạn</span>
                    <span className="text-xs font-semibold text-gray-700">
                      {new Date(voucher.expired_at).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <button 
                    onClick={() => setSelectedVoucher(voucher)}
                    className="text-xs font-bold text-red-600 hover:text-red-700 underline underline-offset-4"
                  >
                    Chi tiết
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>
    )}
  </div>
</div>
      )
    }
  ]}
/>
        </div>
      </div>

      <CGVFooter />

      {/* Modal chi tiết vé */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Chi Tiết Vé Của Bạn</h2>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <CloseOutlined className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Thông tin vé */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">Thông Tin Vé</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Mã vé</p>
                    <p className="font-medium text-gray-900 font-mono">{selectedBooking.tickets_code || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Ngày đặt vé</p>
                    <p className="font-medium text-gray-900">
                      {new Date(selectedBooking.booking_date).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Thông tin suất chiếu */}
              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-purple-900 mb-3">Thông Tin Suất Chiếu</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Phim</p>
                    <p className="font-medium text-gray-900">
                      {selectedBooking.slots?.movies?.title || selectedBooking.movie_title}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Phòng chiếu</p>
                      <p className="font-medium text-gray-900">
                        {selectedBooking.slots?.rooms?.room_name || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Rạp</p>
                      <p className="font-medium text-gray-900">
                        {selectedBooking.slots?.rooms?.cinemas?.cinema_name || selectedBooking.cinema_name}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Thời gian chiếu</p>
                    <p className="font-medium text-gray-900">
                      {new Date(selectedBooking.slots?.show_time || selectedBooking.showtime).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Thông tin ghế đã đặt */}
              {selectedBooking.bookingseats && selectedBooking.bookingseats.length > 0 && (
                <div className="bg-indigo-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-indigo-900 mb-3">Ghế Đã Đặt</h3>
                  <div className="space-y-2">
                    {selectedBooking.bookingseats.map((bookingSeat) => (
                      <div key={bookingSeat.id} className="flex items-center justify-between bg-white rounded-lg p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-indigo-600">G</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Ghế {bookingSeat.seats.seat_row}{bookingSeat.seats.seat_number}</p>
                            <p className="text-xs text-gray-500">{bookingSeat.seats.seattypes.type_name}</p>
                          </div>
                        </div>
                        <p className="font-semibold text-indigo-600">
                          {Number(bookingSeat.seat_price).toLocaleString('vi-VN')} đ
                        </p>
                      </div>
                    ))}
                    <div className="mt-3 pt-3 border-t border-indigo-200">
                      <div className="flex justify-between items-center">
                        <p className="font-medium text-gray-700">Tổng tiền ghế:</p>
                        <p className="font-bold text-indigo-600">
                          {selectedBooking.bookingseats.reduce((sum, seat) => sum + Number(seat.seat_price), 0).toLocaleString('vi-VN')} đ
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Thông tin sản phẩm đã mua */}
              {selectedBooking.ticketsdetails && selectedBooking.ticketsdetails.length > 0 && (
                <div className="bg-orange-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-orange-900 mb-3">Sản Phẩm Đã Mua</h3>
                  <div className="space-y-2">
                    {selectedBooking.ticketsdetails.map((detail) => (
                      <div key={detail.id} className="flex items-center justify-between bg-white rounded-lg p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-orange-600">
                              {detail.products.category === 'food' ? 'F' : 
                               detail.products.category === 'drink' ? 'D' : 
                               detail.products.category === 'combo' ? 'C' : 'V'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{detail.products.product_name}</p>
                            <p className="text-xs text-gray-500 capitalize">{detail.products.category}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-orange-600">
                            {Number(detail.unit_price).toLocaleString('vi-VN')} đ x {detail.quantity}
                          </p>
                          <p className="font-semibold text-orange-700">
                            {Number(detail.total_price).toLocaleString('vi-VN')} đ
                          </p>
                        </div>
                      </div>
                    ))}
                    <div className="mt-3 pt-3 border-t border-orange-200">
                      <div className="flex justify-between items-center">
                        <p className="font-medium text-gray-700">Tổng tiền sản phẩm:</p>
                        <p className="font-bold text-orange-600">
                          {selectedBooking.ticketsdetails.reduce((sum, item) => sum + Number(item.total_price), 0).toLocaleString('vi-VN')} đ
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Thông tin thanh toán */}
              <div className="bg-yellow-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-yellow-900 mb-3">Thông Tin Thanh Toán</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Tổng tiền</p>
                      <p className="font-medium text-gray-900">
                        {selectedBooking.total_price.toLocaleString('vi-VN')} đ
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Trạng thái thanh toán</p>
                      <div className="mt-1">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          selectedBooking.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                          selectedBooking.payment_status === 'unpaid' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedBooking.payment_status === 'paid' ? 'Đã thanh toán' :
                           selectedBooking.payment_status === 'unpaid' ? 'Chưa thanh toán' :
                           selectedBooking.payment_status || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Trạng thái vé</p>
                    <div className="mt-1">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        selectedBooking.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                        selectedBooking.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {getStatusText(selectedBooking.status)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal chi tiết voucher */}
{selectedVoucher && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[95vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-5 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Chi Tiết Khuyến Mãi</h2>
              <button
                onClick={() => setSelectedVoucher(null)}
                className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-200"
              >
                <CloseOutlined className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto flex-1">
              <div className="p-6 space-y-5">
                {/* Voucher Card Preview - Enhanced */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl blur-xl opacity-30"></div>
                  <div className="relative flex bg-gradient-to-br from-red-600 via-red-500 to-pink-600 rounded-2xl overflow-hidden shadow-xl">
                    <div className="w-36 p-5 flex flex-col items-center justify-center text-white relative border-r border-dashed border-white/30">
                      <div className="absolute -top-4 -right-4 w-8 h-8 bg-white rounded-full shadow-lg" />
                      <div className="absolute -bottom-4 -right-4 w-8 h-8 bg-white rounded-full shadow-lg" />
                      
                      <span className="text-xs font-semibold opacity-90 uppercase tracking-widest mb-1">Giảm</span>
                      <span className="text-4xl font-black mb-1">
                        {selectedVoucher.discount_type === 'percentage' 
                          ? `${selectedVoucher.discount_value}%` 
                          : `${selectedVoucher.discount_value/1000}k`}
                      </span>
                      <span className="text-xs opacity-80">OFF</span>
                    </div>

                    <div className="flex-1 p-6 text-white">
                      <h3 className="text-2xl font-bold mb-3 drop-shadow-md">{selectedVoucher.title}</h3>
                      <div className="flex items-center gap-2 mb-3 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 w-fit">
                        <TagOutlined className="text-lg" />
                        <span className="font-mono font-bold text-lg tracking-widest">{selectedVoucher.code}</span>
                      </div>
                      <p className="text-white/95 text-sm leading-relaxed">{selectedVoucher.description}</p>
                    </div>
                  </div>
                </div>

                {/* Thông tin chi tiết - Enhanced */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-6 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></div>
                    <h3 className="text-lg font-bold text-gray-800">Thông Tin Khuyến Mãi</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white rounded-xl p-3 shadow-sm">
                        <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Mã khuyến mãi</p>
                        <p className="font-bold text-gray-900 font-mono text-lg">{selectedVoucher.code}</p>
                      </div>
                      <div className="bg-white rounded-xl p-3 shadow-sm">
                        <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Loại giảm giá</p>
                        <p className="font-semibold text-gray-900 text-sm">
                          {selectedVoucher.discount_type === 'percentage' ? 'Phần trăm (%)' : 'Số tiền cố định (đ)'}
                        </p>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                      <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Giá trị giảm</p>
                      <p className="font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 text-3xl">
                        {selectedVoucher.discount_type === 'percentage' 
                          ? `${selectedVoucher.discount_value}%` 
                          : `${selectedVoucher.discount_value.toLocaleString('vi-VN')} đ`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mô tả chi tiết - Enhanced */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 border border-purple-100">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-6 bg-gradient-to-b from-purple-600 to-pink-600 rounded-full"></div>
                    <h3 className="text-lg font-bold text-gray-800">Mô Tả Chi Tiết</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed bg-white rounded-xl p-4 shadow-sm">{selectedVoucher.description}</p>
                </div>

                {/* Thời gian hiệu lực - Enhanced */}
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-5 border border-orange-100">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-6 bg-gradient-to-b from-orange-600 to-amber-600 rounded-full"></div>
                    <h3 className="text-lg font-bold text-gray-800">Thời Gian Hiệu Lực</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                      <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Ngày hết hạn</p>
                      <div className="flex items-center gap-2">
                        <CalendarOutlined className="text-orange-600 text-lg" />
                        <p className="font-semibold text-gray-900 text-sm">
                          {new Date(selectedVoucher.expired_at).toLocaleDateString('vi-VN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                      <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Trạng thái</p>
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${
                        new Date(selectedVoucher.expired_at) >= new Date()
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                          : 'bg-gradient-to-r from-red-500 to-rose-500 text-white'
                      }`}>
                        {new Date(selectedVoucher.expired_at) >= new Date() ? '✓ Còn hiệu lực' : '✗ Đã hết hạn'}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Footer Actions - Enhanced */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(selectedVoucher.code);
                  alert('Đã sao chép mã khuyến mãi!');
                }}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 flex items-center gap-2"
              >
                <TagOutlined />
                Sao Chép Mã
              </button>
              <button
                onClick={() => setSelectedVoucher(null)}
                className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 hover:border-gray-400 transition-all duration-200 font-medium"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}  
    </div>
  );
}