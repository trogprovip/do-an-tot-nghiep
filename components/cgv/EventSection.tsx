/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { Carousel, Spin } from 'antd';
import { 
  LeftOutlined, 
  RightOutlined, 
  TagFilled, 
  GiftFilled,
  StarFilled,
  FireFilled,
  TeamOutlined,
  CalendarOutlined,
  NotificationOutlined
} from '@ant-design/icons';
import Link from 'next/link';

interface News {
  id: number;
  title: string;
  content: string;
  image_url: string;
  type: string;
  status: string;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

// Icon mapping for different news types
const getIconForType = (type: string) => {
  switch (type?.toUpperCase()) {
    case 'EVENT':
      return <CalendarOutlined />;
    case 'PROMOTION':
      return <TagFilled />;
    case 'MEMBER':
      return <StarFilled />;
    case 'COMBO':
      return <FireFilled />;
    case 'GROUP':
      return <TeamOutlined />;
    case 'GIFT':
      return <GiftFilled />;
    default:
      return <NotificationOutlined />;
  }
};

// Color mapping for different news types
const getColorForType = (type: string) => {
  switch (type?.toUpperCase()) {
    case 'EVENT':
      return 'from-purple-500 to-indigo-500';
    case 'PROMOTION':
      return 'from-orange-400 to-red-500';
    case 'MEMBER':
      return 'from-blue-400 to-cyan-500';
    case 'COMBO':
      return 'from-yellow-400 to-orange-500';
    case 'GROUP':
      return 'from-teal-500 to-emerald-700';
    case 'GIFT':
      return 'from-pink-500 to-rose-500';
    default:
      return 'from-gray-500 to-gray-700';
  }
};

const specialOffers = [
  {
    id: 1,
    title: 'Quà Tặng Kỷ Niệm',
    sub: 'Dành cho cặp đôi',
    gradient: 'from-rose-500 to-red-700', // Chỉnh lại gradient đậm hơn chút để overlay đẹp hơn
    icon: <GiftFilled className="text-4xl opacity-50" />,
    backgroundImage: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 2,
    title: 'Học Sinh - Sinh Viên',
    sub: 'Chỉ từ 60.000đ',
    gradient: 'from-teal-500 to-emerald-700',
    icon: <TagFilled className="text-4xl opacity-50" />,
    backgroundImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 3,
    title: 'Thuê Rạp & Vé Nhóm',
    sub: 'Ưu đãi doanh nghiệp',
    gradient: 'from-amber-500 to-orange-700',
    icon: <TeamOutlined className="text-4xl opacity-50" />,
    backgroundImage: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=800&auto=format&fit=crop'
  },
];

export default function EventSection() {
  const carouselRef = React.useRef<any>(null);
  const [activeTab, setActiveTab] = useState('member');
  const [events, setEvents] = useState<News[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch news data
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/news?size=10&status=ACTIVE');
      const data = await response.json();
      setEvents(data.content || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <section className="py-16 bg-[#fdfcf0] relative overflow-hidden">
        {/* Background Decorative Circles */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-red-100 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 opacity-60 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-100 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 opacity-60 pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10">
        
        {/* Section Title */}
        <div className="text-center mb-10">
          <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-red-600 to-pink-600 uppercase tracking-tighter drop-shadow-sm mb-2">
            KHUYẾN MÃI & ƯU ĐÃI
          </h2>
          <div className="w-20 h-1.5 bg-red-500 mx-auto rounded-full"></div>
        </div>

        {/* Events Carousel */}
      <div className="relative mb-12 px-4 md:px-10 group/carousel overflow-x-hidden">
        {/* Nút điều hướng - Thu nhỏ lại và ẩn/hiện thông minh */}
      <button
    onClick={() => carouselRef.current?.prev()}
    className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/90 text-red-600 rounded-full shadow-md flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-all -ml-2 hover:bg-red-600 hover:text-white"
  >
    <LeftOutlined />
  </button>

  <button
    onClick={() => carouselRef.current?.next()}
    className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/90 text-red-600 rounded-full shadow-md flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-all -mr-2 hover:bg-red-600 hover:text-white"
  >
    <RightOutlined />
  </button>

  <Carousel
    ref={carouselRef}
    slidesToShow={4}
    slidesToScroll={1}
    dots={false}
    autoplay={true}         // Tự động chạy
    autoplaySpeed={3000}    // 3 giây chuyển 1 lần
    infinite={true}         // Chạy vòng lặp vô tận
    className="pb-6"
    responsive={[
      { breakpoint: 1024, settings: { slidesToShow: 3 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
      { breakpoint: 480, settings: { slidesToShow: 1 } },
    ]}
  >
    {events.map((news) => (
      <div key={news.id} className="px-2"> 
        <Link href={`/news/${news.id}`}>
          {/* Group để hover cái nào hiện cái đó */}
          <div className="group relative bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
            
            {/* Vùng ảnh: Dùng tỉ lệ 3:4 để khớp với poster đứng của CGV */}
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-gray-200">
              <img 
                src={news.image_url} 
                alt={news.title} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Lớp phủ Hover riêng biệt cho từng thẻ */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
                <span className="bg-red-600 text-white px-4 py-1.5 rounded-full font-bold text-[10px] tracking-wider transform translate-y-4 group-hover:translate-y-0 transition-transform">
                  XEM CHI TIẾT
                </span>
              </div>

              {/* Icon nhỏ xinh ở góc */}
              <div className="absolute top-2 right-2 z-20 bg-black/20 backdrop-blur-sm p-1.5 rounded-lg text-white text-xs">
                {getIconForType(news.type)}
              </div>
            </div>

            {/* Nội dung chữ: Cực kỳ gọn gàng */}
            <div className="p-3">
              <h3 className="font-bold text-gray-800 text-[13px] line-clamp-2 h-9 leading-tight uppercase group-hover:text-red-600 transition-colors">
                {news.title}
              </h3>
              <div className="mt-2 flex items-center justify-between border-t pt-2 border-gray-50">
                <span className="text-[9px] text-gray-400 font-bold tracking-widest">TIN MỚI NHẤT</span>
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
              </div>
            </div>
          </div>
        </Link>
      </div>
    ))}
  </Carousel>
</div>
      </div>
    </section>
  );
}