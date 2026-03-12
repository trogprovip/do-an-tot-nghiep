'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  DollarSign, 
  Ticket, 
  Filter,
  X
} from 'lucide-react';

interface RevenueStats {
  totalRevenue: number;
  totalTickets: number;
}

interface ChartData {
  date: string;
  revenue: number;
  ticketCount: number;
}

interface MovieRevenue {
  movieId: number;
  movieTitle: string;
  revenue: number;
  ticketCount: number;
}

interface CinemaRevenue {
  cinemaId: number;
  cinemaName: string;
  revenue: number;
  ticketCount: number;
}

interface Ticket {
  id: number;
  tickets_code: string;
  tickets_date: string;
  total_amount: number;
  discount_amount: number;
  final_amount: number;
  payment_status: string;
  status: string;
  accounts: {
    full_name: string;
    email: string;
  };
  slots: {
    movies: {
      id: number;
      title: string;
    };
    rooms: {
      cinema_id: number;
      room_name: string;
      cinemas: {
        cinema_name: string;
      };
    };
  };
  promotions?: {
    id: number;
    promotion_code: string;
    promotion_name: string;
  };
}

interface FilterOptions {
  movies: Array<{ id: number; title: string }>;
  cinemas: Array<{ id: number; cinema_name: string; province_id: number }>;
  provinces: Array<{ id: number; province_name: string }>;
}

export default function RevenuePage() {
  const [stats, setStats] = useState<RevenueStats>({
    totalRevenue: 0,
    totalTickets: 0,
  });
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [movieRevenue, setMovieRevenue] = useState<MovieRevenue[]>([]);
  const [cinemaRevenue, setCinemaRevenue] = useState<CinemaRevenue[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({
    movies: [],
    cinemas: [],
    provinces: [],
  });
  
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  
  // Filter states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterMovie, setFilterMovie] = useState('');
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedCinema, setSelectedCinema] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [chartType, setChartType] = useState<'day' | 'month' | 'year'>('day');
  const [selectedCinemaDetail, setSelectedCinemaDetail] = useState<CinemaRevenue | null>(null);
  const [showCinemaDetail, setShowCinemaDetail] = useState(false);
  const [cinemaChartType, setCinemaChartType] = useState<'day' | 'month' | 'year'>('day');

  // Ref để lưu scroll position
  const scrollPositionRef = useRef(0);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        size: '10',
      });
      
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (selectedCinema) params.append('cinemaId', selectedCinema);
      if (filterMovie) params.append('movieId', filterMovie);

      const response = await fetch(`/api/revenue?${params}`);
      const data = await response.json();

      if (response.ok) {
        setStats(data.stats);
        setChartData(data.chartData || []);
        setMovieRevenue(data.movieRevenue || []);
        setCinemaRevenue(data.cinemaRevenue || []);
        setTickets(data.content || []);
        setFilters(data.filters || { movies: [], cinemas: [] });
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
        
        // Khôi phục scroll position sau khi data được cập nhật
        setTimeout(() => {
          window.scrollTo(0, scrollPositionRef.current);
        }, 0);
      } else {
        console.error('Error fetching revenue data:', data.error);
      }
    } catch (error) {
      console.error('Error fetching revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenueData();
  }, []); // Chỉ fetch lần đầu

  useEffect(() => {
    // Lưu scroll position trước khi fetch
    scrollPositionRef.current = window.scrollY;
    fetchRevenueData();
  }, [currentPage]); // Fetch khi trang thay đổi

  useEffect(() => {
    // Reset scroll khi filter thay đổi
    scrollPositionRef.current = 0;
    fetchRevenueData();
  }, [startDate, endDate, selectedCinema, filterMovie]); // Fetch khi filter thay đổi

  // Fetch data khi province thay đổi (vì cinema sẽ được reset)
  useEffect(() => {
    setSelectedCinema(''); // Reset cinema khi province thay đổi
    if (selectedProvince || startDate || endDate || filterMovie) {
      scrollPositionRef.current = 0;
      fetchRevenueData();
    }
  }, [selectedProvince]);

  const resetFilters = () => {
    setStartDate('');
    setEndDate('');
    setSelectedProvince('');
    setSelectedCinema('');
    setFilterMovie('');
    setCurrentPage(0);
  };

  // Xử lý dữ liệu biểu đồ theo loại
  const processChartData = (data: ChartData[], type: 'day' | 'month' | 'year') => {
    if (!data || data.length === 0) return [];

    const groupedData = new Map<string, { revenue: number; ticketCount: number }>();

    data.forEach(item => {
      if (!item.date) return;
      
      const date = new Date(item.date);
      let key = '';
      
      switch (type) {
        case 'day':
          key = item.date;
          break;
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'year':
          key = date.getFullYear().toString();
          break;
      }

      if (groupedData.has(key)) {
        const existing = groupedData.get(key)!;
        existing.revenue += item.revenue;
        existing.ticketCount += item.ticketCount;
      } else {
        groupedData.set(key, {
          revenue: item.revenue,
          ticketCount: item.ticketCount,
        });
      }
    });

    return Array.from(groupedData.entries())
      .map(([key, value]) => ({
        date: key,
        revenue: value.revenue,
        ticketCount: value.ticketCount,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  };

  // Lấy dữ liệu biểu đồ đã xử lý
  const processedChartData = processChartData(chartData, chartType);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(amount);
  };

  // Simple bar chart component
  const SimpleBarChart = ({ data, type }: { data: ChartData[]; type: 'day' | 'month' | 'year' }) => {
    const maxRevenue = Math.max(...data.map(d => d.revenue), 1); // Avoid division by zero
    
    const formatChartDate = (dateString: string, type: 'day' | 'month' | 'year') => {
      const date = new Date(dateString);
      switch (type) {
        case 'day':
          return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
        case 'month':
          return date.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' });
        case 'year':
          return date.getFullYear().toString();
        default:
          return dateString;
      }
    };
    
    const formatCompactCurrency = (amount: number) => {
      if (amount >= 1000000) {
        return `${(amount / 1000000).toFixed(1)}tr`;
      } else if (amount >= 1000) {
        return `${(amount / 1000).toFixed(0)}k`;
      }
      return `${amount}đ`;
    };
    
    return (
      <div className="space-y-3">
        {data.slice(-7).map((item, index) => (
          <div key={index} className="flex items-center gap-4">
            <div className="w-20 text-sm font-medium text-gray-700">
              {formatChartDate(item.date, type)}
            </div>
            <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full flex items-center justify-end pr-3 transition-all duration-300"
                style={{ width: `${Math.max((item.revenue / maxRevenue) * 100, 5)}%` }}
              >
              </div>
            </div>
            <div className="w-16 text-sm text-gray-600 text-right font-medium">
              {item.ticketCount} vé
            </div>
            <div className="w-20 text-sm text-gray-900 text-right font-semibold">
              {formatCurrency(item.revenue)}
            </div>
          </div>
        ))}
        {data.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Không có dữ liệu doanh thu trong khoảng thời gian này
          </div>
        )}
      </div>
    );
  };

  // Cinema list component
  const CinemaList = ({ cinemas }: { cinemas: CinemaRevenue[] }) => {
    const handleCinemaClick = (cinema: CinemaRevenue) => {
      setSelectedCinemaDetail(cinema);
      setShowCinemaDetail(true);
    };

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cinemas.map((cinema) => (
          <div
            key={cinema.cinemaId}
            onClick={() => handleCinemaClick(cinema)}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-green-300 cursor-pointer transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 truncate">{cinema.cinemaName}</h3>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-green-600">#</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Doanh thu:</span>
                <span className="font-semibold text-green-600">{formatCurrency(cinema.revenue)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Số vé:</span>
                <span className="font-medium text-gray-900">{cinema.ticketCount} vé</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Trung bình:</span>
                <span className="font-medium text-blue-600">
                  {formatCurrency(cinema.revenue / cinema.ticketCount)}
                </span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <button className="w-full text-sm text-green-600 hover:text-green-700 font-medium">
                Xem chi tiết →
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Cinema detail modal
  const CinemaDetailModal = () => {
    if (!selectedCinemaDetail || !showCinemaDetail) return null;

    const cinemaTickets = tickets.filter(ticket => 
      ticket.slots?.rooms?.cinema_id === selectedCinemaDetail.cinemaId
    );

    // Xử lý dữ liệu biểu đồ cho rạp cụ thể
    const processCinemaChartData = (tickets: Ticket[], type: 'day' | 'month' | 'year') => {
      if (!tickets || tickets.length === 0) return [];

      const groupedData = new Map<string, { revenue: number; ticketCount: number }>();

      tickets.forEach(ticket => {
        if (!ticket.tickets_date) return;
        
        const date = new Date(ticket.tickets_date);
        let key = '';
        
        switch (type) {
          case 'day':
            // Extract date part only (YYYY-MM-DD format)
            key = ticket.tickets_date ? ticket.tickets_date.split('T')[0] : new Date().toISOString().split('T')[0];
            break;
          case 'month':
            key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            break;
          case 'year':
            key = date.getFullYear().toString();
            break;
        }

        if (groupedData.has(key)) {
          const existing = groupedData.get(key)!;
          existing.revenue += Number(ticket.final_amount || 0);
          existing.ticketCount += 1;
        } else {
          groupedData.set(key, {
            revenue: Number(ticket.final_amount || 0),
            ticketCount: 1,
          });
        }
      });

      return Array.from(groupedData.entries())
        .map(([key, value]) => ({
          date: key,
          revenue: value.revenue,
          ticketCount: value.ticketCount,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));
    };

    const cinemaChartData = processCinemaChartData(cinemaTickets, cinemaChartType);

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">{selectedCinemaDetail.cinemaName}</h2>
            <button
              onClick={() => setShowCinemaDetail(false)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Thống kê tổng quan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-green-600 mb-1">Tổng Doanh thu</p>
                <p className="text-2xl font-bold text-green-900">{formatCurrency(selectedCinemaDetail.revenue)}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-600 mb-1">Số vé đã bán</p>
                <p className="text-2xl font-bold text-blue-900">{selectedCinemaDetail.ticketCount}</p>
              </div>
            </div>

            {/* Biểu đồ doanh thu theo thời gian cho rạp */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 overflow-hidden relative">
              {/* Decorative accent */}
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-500 to-green-600 rounded-l-2xl" />
              
              <div className="pl-3">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 tracking-tight">Biểu đồ Doanh thu theo Thời gian</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Phân tích doanh thu {cinemaChartType === 'day' ? 'theo ngày' : cinemaChartType === 'month' ? 'theo tháng' : 'theo năm'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <select
                      value={cinemaChartType}
                      onChange={(e) => setCinemaChartType(e.target.value as 'day' | 'month' | 'year')}
                      className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white hover:border-gray-300 transition-colors"
                    >
                      <option value="day">Theo ngày</option>
                      <option value="month">Theo tháng</option>
                      <option value="year">Theo năm</option>
                    </select>
                  </div>
                </div>
                
                {cinemaChartData.length > 0 ? (
                  <div className="space-y-3">
                    {cinemaChartData.slice(-7).map((item, index) => {
                      const maxRevenue = Math.max(...cinemaChartData.map(d => d.revenue));
                      const barWidth = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
                      
                      return (
                        <div
                          key={index}
                          className="group relative p-3.5 rounded-xl bg-gray-50 hover:bg-emerald-50/60 transition-all duration-200 border border-transparent hover:border-emerald-100"
                        >
                          <div className="flex items-center gap-4 mb-2">
                            <div className="w-16 text-sm font-medium text-gray-600 flex-shrink-0">
                              {new Date(item.date).toLocaleDateString('vi-VN', { 
                                day: '2-digit', 
                                month: cinemaChartType === 'day' ? '2-digit' : 'short',
                                year: cinemaChartType === 'year' ? undefined : 'numeric'
                              })}
                            </div>
                            <div className="flex-1 bg-gray-200 rounded-full h-8 relative overflow-hidden">
                              <div 
                                className="bg-gradient-to-r from-emerald-400 to-green-500 h-full rounded-full flex items-center justify-end pr-3 transition-all duration-500 shadow-sm"
                                style={{ width: `${barWidth}%` }}
                              >
                                <span className="text-xs text-white font-semibold drop-shadow-sm">
                                  {formatCurrency(item.revenue)}
                                </span>
                              </div>
                            </div>
                            <div className="w-16 text-sm font-semibold text-gray-700 text-right flex-shrink-0 flex items-center justify-end gap-1">
                              <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                              </svg>
                              {item.ticketCount}
                            </div>
                          </div>
                          {/* Progress bar background indicator */}
                          <div className="h-1 bg-gray-200 rounded-full overflow-hidden mt-1">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-300 to-green-400 rounded-full transition-all duration-500"
                              style={{ width: `${barWidth}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p className="text-sm">Không có dữ liệu biểu đồ</p>
                  </div>
                )}
              </div>
            </div>

            {/* Danh sách vé */}
            <div className="bg-white border border-gray-200 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 p-4 border-b border-gray-200">
                Danh sách vé ({cinemaTickets.length})
              </h3>
              <div className="max-h-96 overflow-y-auto">
                {cinemaTickets.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {cinemaTickets.map((ticket) => (
                      <div key={ticket.id} className="p-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{ticket.tickets_code}</p>
                            <p className="text-sm text-gray-600">{ticket.accounts?.full_name}</p>
                            <p className="text-sm text-gray-500">{ticket.slots?.movies?.title}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">{formatCurrency(ticket.final_amount)}</p>
                            <p className="text-xs text-gray-500">{formatDate(ticket.tickets_date)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    Không có vé nào cho rạp này
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Quản lý Doanh thu</h1>
              <p className="text-gray-600 mt-2 text-lg">Theo dõi và phân tích doanh thu rạp chiếu phim</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-600 font-medium">Live</span>
            </div>
          </div>
        </div>

        {loading && tickets.length === 0 ? (
          // Chỉ hiển thị full loading khi load lần đầu
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-600">Đang tải dữ liệu...</span>
            </div>
          </div>
        ) : (
          <div className="space-y-6 relative">
            {/* Loading overlay - không thay thế nội dung */}
            {loading && tickets.length > 0 && (
              <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-40 flex items-center justify-center">
                <div className="inline-flex items-center gap-2 bg-white px-4 py-3 rounded-xl shadow-lg">
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-gray-600 font-medium">Đang cập nhật...</span>
                </div>
              </div>
            )}
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Tổng Doanh thu</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mt-2">{formatCurrency(stats.totalRevenue)}</p>
                  <p className="text-xs text-gray-500 mt-1">Tổng thu từ tất cả rạp</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl">
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Tổng Vé đã bán</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mt-2">{stats.totalTickets}</p>
                  <p className="text-xs text-gray-500 mt-1">Số vé đã được bán</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl">
                  <Ticket className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg">
                  <Filter className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Bộ lọc</h2>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-4 h-4" />
                {showFilters ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
              </button>
            </div>
            
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tỉnh/Thành phố</label>
                  <select
                    value={selectedProvince}
                    onChange={(e) => setSelectedProvince(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  >
                    <option value="">Tất cả tỉnh</option>
                    {filters.provinces.map((province) => (
                      <option key={province.id} value={province.id}>
                        {province.province_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rạp chiếu phim</label>
                  <select
                    value={selectedCinema}
                    onChange={(e) => setSelectedCinema(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                    disabled={!selectedProvince}
                  >
                    <option value="">
                      {selectedProvince ? 'Tất cả rạp' : 'Chọn tỉnh trước'}
                    </option>
                    {selectedProvince && filters.cinemas
                      .filter(cinema => cinema.province_id.toString() === selectedProvince)
                      .map((cinema) => (
                        <option key={cinema.id} value={cinema.id}>
                          {cinema.cinema_name}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Từ ngày</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Đến ngày</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phim</label>
                  <select
                    value={filterMovie}
                    onChange={(e) => setFilterMovie(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  >
                    <option value="">Tất cả phim</option>
                    {filters.movies.map((movie) => (
                      <option key={movie.id} value={movie.id}>
                        {movie.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            
            <div className="flex gap-2 mt-6">
              <button
                onClick={resetFilters}
                className="px-6 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Reset bộ lọc
              </button>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Biểu đồ Doanh thu</h2>
                <select
                  value={chartType}
                  onChange={(e) => setChartType(e.target.value as 'day' | 'month' | 'year')}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="day">Theo ngày</option>
                  <option value="month">Theo tháng</option>
                  <option value="year">Theo năm</option>
                </select>
              </div>
              {processedChartData.length > 0 ? (
                <SimpleBarChart data={processedChartData} type={chartType} />
              ) : (
                <div className="text-center py-8 text-gray-500">Không có dữ liệu</div>
              )}
            </div>

<div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 overflow-hidden relative">
  {/* Decorative accent */}
  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-indigo-600 rounded-l-2xl" />

  <div className="pl-3">
    <div className="flex items-center justify-between mb-5">
      <div>
        <h2 className="text-lg font-bold text-gray-900 tracking-tight">Doanh thu theo Phim</h2>
        <p className="text-xs text-gray-400 mt-0.5">Top 5 phim doanh thu cao nhất</p>
      </div>
      <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
        <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
        </svg>
      </div>
    </div>

    <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
      {movieRevenue.slice(0, 5).map((movie, index) => {
        const maxRevenue = movieRevenue[0]?.revenue || 1;
        const barWidth = Math.round((movie.revenue / maxRevenue) * 100);
        const rankColors = [
          { bg: "bg-amber-100", text: "text-amber-600", bar: "bg-gradient-to-r from-amber-400 to-orange-400" },
          { bg: "bg-slate-100", text: "text-slate-500", bar: "bg-gradient-to-r from-slate-400 to-slate-500" },
          { bg: "bg-orange-50", text: "text-orange-500", bar: "bg-gradient-to-r from-orange-300 to-orange-400" },
          { bg: "bg-blue-50", text: "text-blue-500", bar: "bg-gradient-to-r from-blue-400 to-indigo-400" },
          { bg: "bg-blue-50", text: "text-blue-500", bar: "bg-gradient-to-r from-blue-300 to-blue-400" },
        ];
        const color = rankColors[index];

        return (
          <div
            key={movie.movieId}
            className="group relative p-3.5 rounded-xl bg-gray-50 hover:bg-blue-50/60 transition-all duration-200 border border-transparent hover:border-blue-100"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-7 h-7 ${color.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <span className={`text-xs font-extrabold ${color.text}`}>{index + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">{movie.movieTitle}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-gray-900 text-sm">{formatCurrency(movie.revenue)}</p>
                <p className="text-xs text-gray-400">{movie.ticketCount} vé</p>
              </div>
            </div>
            {/* Revenue bar */}
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${color.bar} rounded-full transition-all duration-500`}
                style={{ width: `${barWidth}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  </div>
</div>
          </div>

          {/* Tickets Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Chi tiết giao dịch</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Mã vé</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Khách hàng</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Phim</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Rạp</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Ngày</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Tổng tiền</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Giảm giá</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket) => (
                    <tr key={ticket.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-900">{ticket.tickets_code}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">{ticket.accounts.full_name}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">{ticket.slots.movies.title}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">{ticket.slots.rooms.cinemas.cinema_name}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">{formatDate(ticket.tickets_date)}</td>
                      <td className="py-3 px-4 text-sm text-gray-900 text-right">{formatCurrency(ticket.total_amount)}</td>
                      <td className="py-3 px-4 text-sm text-gray-900 text-right">{formatCurrency(ticket.discount_amount)}</td>
                      <td className="py-3 px-4 text-sm font-medium text-gray-900 text-right">{formatCurrency(ticket.final_amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-600">
                  Hiển thị {currentPage * 10 + 1} đến {Math.min((currentPage + 1) * 10, totalElements)} của {totalElements} kết quả
                </div>
                <div className="flex gap-2 items-center">
                  <button
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Trước
                  </button>
                  
                  {/* Page numbers */}
                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => {
                      const pageNum = i + 1;
                      const isCurrentPage = i === currentPage;
                      
                      // Logic hiển thị rút gọn
                      let shouldShow = false;
                      
                      if (totalPages <= 7) {
                        // Nếu ít trang, hiển thị tất cả
                        shouldShow = true;
                      } else {
                        // Nếu nhiều trang, hiển thị theo logic rút gọn
                        if (i === 0 || i === 1) {
                          // Luôn hiển thị 2 trang đầu
                          shouldShow = true;
                        } else if (i === totalPages - 2 || i === totalPages - 1) {
                          // Luôn hiển thị 2 trang cuối
                          shouldShow = true;
                        } else if (Math.abs(i - currentPage) <= 1) {
                          // Hiển thị trang hiện tại và 1 trang xung quanh
                          shouldShow = true;
                        }
                      }
                      
                      // Hiển thị dấu "..." khi cần
                      if (!shouldShow) {
                        // Chỉ hiển thị dấu "..." ở vị trí phù hợp
                        if (
                          (i === 2 && currentPage > 3) || // Sau trang 2 nếu trang hiện tại xa
                          (i === totalPages - 3 && currentPage < totalPages - 4) // Trước trang cuối-2 nếu trang hiện tại xa
                        ) {
                          return (
                            <span key={i} className="px-2 py-1 text-sm text-gray-400">
                              ...
                            </span>
                          );
                        }
                        return null;
                      }
                      
                      return (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i)}
                          className={`px-3 py-1 text-sm border rounded-lg transition-colors ${
                            isCurrentPage
                              ? 'bg-blue-50 text-blue-600 border-blue-300'
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                    disabled={currentPage === totalPages - 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Cinema Detail Modal */}
      <CinemaDetailModal />
      </div>
    </div>
  );
}
