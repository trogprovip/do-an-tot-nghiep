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
  StarOutlined
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

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [bookings, setBookings] = useState<BookingHistory[]>([]);
  const [favorites, setFavorites] = useState<FavoriteMovie[]>([]);
  const [reviews, setReviews] = useState<ReviewHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedBooking, setSelectedBooking] = useState<BookingHistory | null>(null);

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
      // Call API to get user data from database
      const response = await fetch('/api/users/profile');
      
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
      // Call API to get booking history from database
      const response = await fetch('/api/users/bookings');
      
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
      // Call API to get favorite movies from database
      const response = await fetch('/api/users/favorites');
      
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
      const response = await fetch('/api/users/reviews?size=100');
      
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

  const getMembershipColor = (tier: string) => {
    switch (tier?.toUpperCase()) {
      case 'PLATINUM': return 'bg-gradient-to-r from-gray-700 to-gray-900';
      case 'GOLD': return 'bg-gradient-to-r from-yellow-500 to-amber-600';
      case 'SILVER': return 'bg-gradient-to-r from-gray-400 to-gray-600';
      default: return 'bg-gradient-to-r from-blue-500 to-blue-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      case 'UPCOMING': return 'bg-blue-100 text-blue-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED': return 'Đã Xác Nhận';
      case 'CANCELLED': return 'Đã Hủy';
      case 'UPCOMING': return 'Sắp Chiếu';
      case 'PENDING': return 'Chờ xác nhận';
      default: return status;
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
    <>
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

              {/* Hướng dẫn sử dụng vé */}
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-900 mb-3">Hướng Dẫn Sử Dụng Vé</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <CheckCircleFilled className="text-green-600" />
                    <p className="text-sm text-gray-700">Đến rạp trước 15 phút suất chiếu</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <QrcodeOutlined className="text-green-600" />
                    <p className="text-sm text-gray-700">Xuất trình mã vé tại quầy check-in</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <ClockCircleOutlined className="text-green-600" />
                    <p className="text-sm text-gray-700">Mang theo giấy tờ tùy thân để xác nhận</p>
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
    </>
  );
}