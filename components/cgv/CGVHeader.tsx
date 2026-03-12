'use client';

import React, { useState, useEffect } from 'react';
import { 
  UserOutlined, ShoppingCartOutlined, MenuOutlined, SearchOutlined,
  GlobalOutlined, VideoCameraOutlined, PlayCircleOutlined, StarOutlined,
  ShopOutlined, PhoneOutlined, GiftOutlined, IdcardOutlined, DownOutlined,
  LogoutOutlined, CloseOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { authService, User } from '@/lib/services/authService'; // ✅ authService cho User/CGV

interface Movie {
  id: number;
  title: string;
  poster_url?: string | null;
  status: 'now_showing' | 'coming_soon' | 'ended' | null;
  release_date?: Date | null;
  duration?: number | null;
  genre?: string | null;
  director?: string | null;
}

export default function CGVHeader({ hideQuickLinks = false }: { hideQuickLinks?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const user = authService.getCurrentUser(); // ✅ Dùng authService cho User
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentUser(user);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.search-container')) {
        setSearchOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSearchOpen(false);
      }
    };

    if (searchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [searchOpen]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/movies/search?q=${encodeURIComponent(query.trim())}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.movies || []);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
      authService.logout(); // ✅ Dùng authService cho User
      setCurrentUser(null);
      window.location.href = '/'; // ✅ Redirect về trang chủ CGV
    }
  };

  const quickLinks = [
    { href: '/cgv/cinemas', icon: <VideoCameraOutlined />, title: 'CGV CINEMAS', sub: 'RẠP CGV' },
    { href: '/cgv/movies?status=now_showing', icon: <PlayCircleOutlined />, title: 'NOW SHOWING', sub: 'PHIM ĐANG CHIẾU' },
    { href: '/cgv/movies?status=coming_soon', icon: <StarOutlined />, title: 'COMING SOON', sub: 'PHIM SẮP CHIẾU' },
    { href: '/cgv/advertising', icon: <PhoneOutlined />, title: 'CONTACT CGV', sub: 'LIÊN HỆ CGV' },
    { href: '/news', icon: <GiftOutlined />, title: 'NEWS & OFFERS', sub: 'TIN MỚI & ƯU ĐÃI' },
    { href: '/auth/login', icon: <IdcardOutlined />, title: 'REGISTER', sub: 'ĐĂNG KÝ NGAY' },
  ];

  return (
    <header className="font-sans relative z-50">
      
      {/* ================= 1. THANH TRÊN CÙNG ================= */}
      <div className="bg-white text-gray-700 text-xs py-2 border-b border-gray-200">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex gap-4 items-center">
            <Link href="/news" className="hover:text-yellow-600 transition-colors flex items-center gap-1.5 group">
              <GiftOutlined className="text-sm group-hover:scale-110 transition-transform text-yellow-600"/>
              <span className="hidden md:inline font-medium">Tin Mới & Ưu Đãi</span>
              <span className="md:hidden font-medium">Ưu Đãi</span>
            </Link>
            
            <span className="text-gray-300 hidden md:inline">|</span>
            
            <Link href="/cgv/profile?tab=bookings" className="hover:text-yellow-600 transition-colors flex items-center gap-1.5">
              <ShoppingCartOutlined className="text-sm"/>
              <span className="hidden md:inline font-medium">Vé Của Tôi</span>
              <span className="md:hidden font-medium">Vé</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full">
                <Link href="/cgv/profile" className="text-yellow-600 hover:text-yellow-700 transition-colors flex items-center gap-1.5">
                  <UserOutlined className="text-sm"/>
                  <span className="hidden lg:inline text-xs">Xin chào, <strong>{currentUser.full_name}</strong></span>
                  <span className="lg:hidden text-xs"><strong>{currentUser.full_name?.split(' ')[0]}</strong></span>
                </Link>
                <span className="text-gray-300">|</span>
                <button 
                  onClick={handleLogout}
                  className="hover:text-yellow-600 transition-colors text-xs flex items-center gap-1"
                >
                  <LogoutOutlined className="text-sm"/>
                  <span className="hidden md:inline">Đăng Xuất</span>
                </button>
              </div>
            ) : (
              <Link href="/auth/login" className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-3 py-1 rounded-full font-bold hover:from-yellow-600 hover:to-yellow-700 transition-all flex items-center gap-1.5 text-xs shadow-md">
                <UserOutlined className="text-sm"/>
                <span className="hidden md:inline">Đăng Nhập / Đăng Ký</span>
                <span className="md:hidden">Login</span>
              </Link>
            )}
            
          </div>
        </div>
      </div>

      {/* ================= 2. THANH ĐIỀU HƯỚNG CHÍNH (STICKY) ================= */}
      <div className={`bg-white backdrop-blur-md border-b border-gray-200 z-50 transition-all duration-300 sticky top-0 ${scrolled ? 'shadow-lg py-2' : 'py-3'}`}>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            
            {/* LOGO */}
            <Link href="/" className="group flex items-center gap-1.5">
               <span className="text-red-600 font-black text-3xl md:text-4xl tracking-tighter hover:scale-105 transition-transform">CGV</span>
               <StarOutlined className="text-yellow-500 text-lg md:text-xl animate-pulse" />
            </Link>

            {/* MENU DESKTOP */}
            <nav className="hidden lg:flex items-center gap-6 font-bold text-gray-700 text-sm">
              {/* Menu PHIM với Dropdown */}
              <div className="group relative cursor-pointer py-2">
                <span className="group-hover:text-red-600 transition-colors flex items-center gap-1 uppercase">
                  Phim <DownOutlined className="text-[9px] opacity-60" />
                </span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-600 transition-all duration-300 group-hover:w-full"></span>
                
                {/* Dropdown */}
                <div className="absolute top-full left-0 pt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
                    <Link href="/cgv/movies?status=now_showing" className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors border-b border-gray-100">
                      <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
                        <PlayCircleOutlined className="text-lg" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-800 text-xs">Phim Đang Chiếu</div>
                        <div className="text-[10px] text-gray-500">Now Showing</div>
                      </div>
                    </Link>

                    <Link href="/cgv/movies?status=coming_soon" className="flex items-center gap-3 px-4 py-3 hover:bg-amber-50 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
                        <StarOutlined className="text-lg" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-800 text-xs">Phim Sắp Chiếu</div>
                        <div className="text-[10px] text-gray-500">Coming Soon</div>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Menu RẠP CGV */}
              <Link href="/cgv/cinemas" className="group relative cursor-pointer py-2">
                <span className="group-hover:text-red-600 transition-colors uppercase">
                  Rạp CGV
                </span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-600 transition-all duration-300 group-hover:w-full"></span>
              </Link>

              {/* SEARCH BAR */}
              <div className="relative search-container">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Tìm kiếm phim..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    onFocus={() => setSearchOpen(true)}
                    className="w-64 px-4 py-2 pr-10 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  <SearchOutlined className="absolute right-3 top-2.5 text-gray-400 text-base" />
                </div>

                {/* Search Results Dropdown */}
                {(searchOpen || searchQuery) && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 max-h-96 overflow-y-auto z-50">
                    {loading ? (
                      <div className="p-4 text-center text-gray-500">
                        <div className="animate-spin inline-block w-4 h-4 border-2 border-gray-300 border-t-red-500 rounded-full"></div>
                        <span className="ml-2">Đang tìm kiếm...</span>
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div>
                        {searchResults.map((movie) => (
                          <Link
                            key={movie.id}
                            href={`/cgv/movies/${movie.id}`}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                            onClick={() => {
                              setSearchOpen(false);
                              setSearchQuery('');
                              setSearchResults([]);
                            }}
                          >
                            <div className="w-12 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                              {movie.poster_url ? (
                                <img src={movie.poster_url} alt={movie.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
                                  <PlayCircleOutlined className="text-white text-xl" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 text-sm truncate">{movie.title}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  movie.status === 'now_showing' 
                                    ? 'bg-green-100 text-green-700' 
                                    : movie.status === 'coming_soon'
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-gray-100 text-gray-700'
                                }`}>
                                  {movie.status === 'now_showing' ? 'Đang chiếu' : 
                                   movie.status === 'coming_soon' ? 'Sắp chiếu' : 'Đã chiếu'}
                                </span>
                                {movie.duration && (
                                  <span className="text-xs text-gray-500">{movie.duration} phút</span>
                                )}
                              </div>
                              {movie.genre && (
                                <p className="text-xs text-gray-500 mt-1 truncate">{movie.genre}</p>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : searchQuery.length >= 2 ? (
                      <div className="p-4 text-center text-gray-500">
                        <SearchOutlined className="text-2xl text-gray-300 mb-2" />
                        <p className="text-sm">Không tìm thấy phim nào</p>
                        <p className="text-xs text-gray-400 mt-1">Thử tìm với từ khóa khác</p>
                      </div>
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        <p className="text-sm">Nhập tối thiểu 2 ký tự để tìm kiếm</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </nav>

            {/* NÚT MUA VÉ */}
            <div className="flex items-center gap-3">
              <Link href="/cgv/movies">
                <button className="bg-gradient-to-r from-red-600 to-red-700 text-white px-5 py-2 rounded-full font-bold shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 hover:-translate-y-0.5 transition-all flex items-center gap-2 text-sm">
                  <ShoppingCartOutlined className="text-base" />
                  <span className="hidden md:inline">Mua Vé</span>
                  <span className="md:hidden">Vé</span>
                </button>
              </Link>
              
              <button className="lg:hidden text-2xl text-red-600 hover:scale-110 transition-transform">
                <MenuOutlined />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= 3. QUICK LINKS BAR (Sẽ bị cuộn đi) ================= */}
      {!hideQuickLinks && (
        <div className="relative bg-gradient-to-b from-[#fff8f0] via-[#fff5e6] to-[#fef3e0] py-6 border-t-[3px] border-[#990000] border-b-[3px] border-[#d4af37] overflow-hidden shadow-lg">
          {/* Pattern trang trí */}
          <div className="absolute top-0 left-0 w-full h-3 bg-red-900/10 bg-repeat-x"></div>
          <div className="absolute inset-0 opacity-[0.07] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#8f0000 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }}></div>

          <div className="container mx-auto px-2 sm:px-4 relative z-10">
            <div className="flex justify-start md:justify-center items-stretch gap-2 sm:gap-4 md:gap-6 lg:gap-8 overflow-x-auto py-2 no-scrollbar snap-x">
              {quickLinks.map((link, index) => (
                <Link href={link.href} key={index} className="group flex flex-col items-center justify-center min-w-[85px] sm:min-w-[95px] md:min-w-[110px] lg:min-w-[125px] snap-center cursor-pointer p-2 sm:p-3 rounded-xl sm:rounded-2xl transition-all duration-300 hover:bg-white/60 hover:shadow-lg hover:shadow-[#d90000]/10 flex-shrink-0">
                  <div className="relative mb-2 sm:mb-3">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-full border-[2px] sm:border-[2.5px] border-dashed border-[#8f0000]/40 bg-white/80 text-2xl sm:text-3xl text-[#c4a000] group-hover:border-[#d90000] group-hover:bg-gradient-to-br group-hover:from-[#d90000] group-hover:to-[#ff3333] group-hover:text-white group-hover:border-solid group-hover:shadow-[0_0_25px_rgba(217,0,0,0.7)] group-hover:-translate-y-2 group-hover:scale-110 transition-all duration-500 ease-out z-10 relative overflow-hidden flex items-center justify-center">
                       <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#ffd700]/50 to-transparent translate-y-full group-hover:translate-y-[-100%] transition-transform duration-700"></div>
                       <span className="relative z-10 group-hover:animate-wiggle drop-shadow-sm text-sm sm:text-base lg:text-xl">{link.icon}</span>
                    </div>
                    <div className="absolute -bottom-2 sm:-bottom-3 left-1/2 -translate-x-1/2 w-8 sm:w-10 lg:w-12 h-1.5 sm:h-2 bg-[#d90000]/30 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                  <div className="text-center transition-transform duration-300 group-hover:translate-y-[-5px]">
                    <h3 className="text-[10px] xs:text-xs sm:text-xs md:text-sm font-black text-[#2b2b2b] uppercase tracking-tight group-hover:text-[#d90000] transition-colors line-clamp-1">{link.title}</h3>
                    <p className="text-[8px] xs:text-[9px] sm:text-[10px] md:text-xs text-[#8f0000]/70 font-bold mt-0.5 sm:mt-1 group-hover:text-[#d90000] transition-colors line-clamp-1">{link.sub}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .animate-bounce-slow { animation: bounce 2s infinite; }
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-15deg); }
          75% { transform: rotate(15deg); }
        }
        .group:hover .group-hover\\:animate-wiggle { animation: wiggle 0.5s ease-in-out; }
      `}} />
    </header>
  );
}