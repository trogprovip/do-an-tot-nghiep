/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React from 'react';
import { Carousel } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

const banners = [
  {
    id: 1,
    // Đã sửa link ảnh bị lỗi
    image: 'https://iguov8nhvyobj.vcdn.cloud/media/banner/cache/1/b58515f018eb873dafa430b6f9ae0c1e/g/h/ghibli.jpg',
    title: 'CGV MEMBER DAY',
    description: 'Mua 2 Tặng 1 - X2 ĐIỂM THƯỞNG',
  },
  {
    id: 2,
    image: 'https://iguov8nhvyobj.vcdn.cloud/media/banner/cache/1/b58515f018eb873dafa430b6f9ae0c1e/9/8/980x448_23__4.jpg',
    title: 'ƯU ĐÃI ĐẶC BIỆT',
    description: 'Đồng giá 79.000đ',
  },
  {
    id: 3,
    image: 'https://iguov8nhvyobj.vcdn.cloud/media/banner/cache/1/b58515f018eb873dafa430b6f9ae0c1e/r/o/rollingbanner_980x448_2_-min.png',
    title: 'COMBO TIẾT KIỆM',
    description: '',
  },
];

export default function HeroBanner() {
  const carouselRef = React.useRef<any>(null);

  return (
    <div className="relative bg-[#fdfcf0]"> {/* Đổi màu nền nhẹ cho hợp CGV */}
      
      {/* Pattern gạch nền (Giữ nguyên của bạn) */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, #8B4513 0px, #8B4513 1px, transparent 1px, transparent 20px), repeating-linear-gradient(90deg, #A0522D 0px, #A0522D 1px, transparent 1px, transparent 60px)',
        }}
      />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="relative group">
          {/* Nút Previous - Chỉ hiện khi hover vào banner */}
          <button
            onClick={() => carouselRef.current?.prev()}
            className="absolute left-0 md:left-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-red-600 text-white rounded-full p-3 transition-all opacity-0 group-hover:opacity-100"
          >
            <LeftOutlined className="text-xl" />
          </button>

          {/* Carousel */}
          <Carousel
            ref={carouselRef}
            autoplay
            autoplaySpeed={5000}
            effect="fade" // Thêm hiệu ứng fade cho mượt
            dots={{ className: 'custom-dots-cgv' }} // Bạn có thể style dots này trong file css global
            className="rounded-xl overflow-hidden shadow-2xl border-4 border-white"
          >
            {banners.map((banner) => (
              <div key={banner.id}>
                {/* Container của Banner */}
                <div className="relative h-[300px] md:h-[450px] w-full">
                  
                  {/* --- PHẦN QUAN TRỌNG: HIỂN THỊ ẢNH --- */}
                  <img 
                    src={banner.image} 
                    alt={banner.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  
                  {/* Lớp phủ đen mờ để chữ dễ đọc hơn */}
                  <div className="absolute inset-0 bg-black/40"></div>

                  {/* Nội dung chữ đè lên ảnh */}
                  <div className="relative z-10 h-full flex flex-col items-center justify-center text-center text-white px-4">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] uppercase font-sans">
                      {banner.title}
                    </h2>
                    <p className="text-xl md:text-2xl mb-8 drop-shadow-md font-medium">
                      {banner.description}
                    </p>
                    
                    <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded font-bold text-lg transition-transform transform hover:scale-105 shadow-lg uppercase border border-red-500">
                      Xem chi tiết
                    </button>
                  </div>
                  
                  {/* Tag trang trí góc phải */}
                  <div className="absolute top-4 right-4 bg-yellow-400 text-red-700 px-4 py-1 rounded font-bold shadow-lg transform rotate-2">
                    HOT PROMOTION
                  </div>
                </div>
              </div>
            ))}
          </Carousel>

          {/* Nút Next */}
          <button
            onClick={() => carouselRef.current?.next()}
            className="absolute right-0 md:right-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-red-600 text-white rounded-full p-3 transition-all opacity-0 group-hover:opacity-100"
          >
            <RightOutlined className="text-xl" />
          </button>
        </div>

        {/* Promotion Info - Phần chữ bên dưới
        <div className="mt-6 flex justify-center gap-8 text-sm text-gray-600 font-medium">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full"></span> 
            Áp dụng cho mọi cụm rạp
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            Ưu đãi thành viên U22
          </span>
        </div> */}
      </div>
    </div>
  );
}