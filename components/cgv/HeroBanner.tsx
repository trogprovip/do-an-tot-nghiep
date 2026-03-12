'use client';

import React from 'react';
import { Carousel } from 'antd';
import { LeftOutlined, RightOutlined, FireFilled, StarFilled } from '@ant-design/icons';

const banners = [
  {
    id: 1,
    image: 'https://iguov8nhvyobj.vcdn.cloud/media/wysiwyg/2026/022026/SELF_LOVE_N_O_350x495.png',
    title: 'CGV MEMBER DAY',
    description: 'SELF LOVE',
    tag: 'ƯU ĐÃI HOT'
  },
  {
    id: 2,
    image: 'https://iguov8nhvyobj.vcdn.cloud/media/catalog/product/cache/1/image/c5f0a1eff4c394a251036189ccddaacd/t/o/to_poster_official_tiectet_3x4_fa.jpg',
    title: 'SIÊU PHẨM PHIM HOT',
    description: 'PHIM MỚI RA RẤT HAY',
    tag: 'ĐANG CHIẾU'
  },
  {
    id: 3,
    image: 'https://iguov8nhvyobj.vcdn.cloud/media/wysiwyg/2025/032025/Masita_N_O_350x495.png',
    title: 'BẮP LẮC MASITA',
    description: 'Thưởng thức phim hay - Nhận ngay quà chất',
    tag: 'ĐỘC QUYỀN'
  },
];

export default function HeroBanner() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const carouselRef = React.useRef<any>(null);

  return (
    <div className="relative bg-[#fdfcf0] pb-6 sm:pb-8 pt-2 sm:pt-4 overflow-hidden">
      
      {/* Pattern nền mờ ảo phía sau */}
      <div className="absolute inset-0 opacity-30 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#d90000 0.5px, transparent 0.5px)', backgroundSize: '20px 20px' }}></div>

      <div className="container mx-auto px-2 sm:px-3 md:px-4 lg:px-6 relative z-10">
        
        {/* Khung chứa Carousel với hiệu ứng đổ bóng Neon */}
        <div className="relative group rounded-xl sm:rounded-2xl overflow-hidden shadow-[0_10px_40px_-10px_rgba(220,38,38,0.5)] border-2 sm:border-4 border-white ring-2 sm:ring-4 ring-red-100">
          
          {/* Nút Previous - Cách điệu Glassmorphism */}
          <button
            onClick={() => carouselRef.current?.prev()}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-12 sm:h-12 flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/30 text-white rounded-full hover:bg-red-600 hover:border-red-600 hover:scale-110 hover:shadow-[0_0_15px_rgba(220,38,38,0.8)] transition-all duration-300 opacity-0 group-hover:opacity-100 translate-x-[-20px] group-hover:translate-x-0"
          >
            <LeftOutlined className="text-sm sm:text-xl" />
          </button>

          {/* Carousel */}
          <Carousel
            ref={carouselRef}
            autoplay
            autoplaySpeed={5000}
            effect="fade"
            dots={{ className: 'custom-dots-cgv' }}
          >
            {banners.map((banner) => (
              <div key={banner.id} className="relative w-full h-[280px] sm:h-[350px] md:h-[450px] lg:h-[500px] overflow-hidden">
                
                {/* 1. IMAGE LAYER with Ken Burns Effect (Zoom chậm) */}
                <div className="absolute inset-0 w-full h-full animate-ken-burns">
                  <img 
                    src={banner.image} 
                    alt={banner.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* 2. GRADIENT OVERLAY (Màu mè & Cinematic) */}
                {/* Gradient từ dưới lên: Đen đậm -> Đỏ tối -> Trong suốt */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-90"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-red-900/40 via-transparent to-transparent mix-blend-multiply"></div>

                {/* 3. CONTENT LAYER */}
                <div className="relative z-20 h-full flex flex-col items-center justify-center text-center px-2 sm:px-4 md:px-20 mt-4 sm:mt-8">
                  
                  {/* Tag nhỏ phía trên */}
                  <span className="inline-flex items-center gap-1 bg-yellow-400 text-red-900 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-black uppercase tracking-wider mb-2 sm:mb-4 animate-fade-in-up shadow-[0_0_15px_rgba(250,204,21,0.6)]">
                    <FireFilled className="animate-pulse text-sm sm:text-base"/> {banner.tag}
                  </span>

                  {/* Title với hiệu ứng chữ Gradient */}
                  <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-black mb-2 sm:mb-3 uppercase font-sans tracking-tight animate-fade-in-up delay-100">
                    <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-300 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
                      {banner.title}
                    </span>
                  </h2>

                  {/* Description */}
                  <p className="text-sm sm:text-base md:text-lg lg:text-2xl text-gray-200 mb-4 sm:mb-8 font-medium max-w-xs sm:max-w-lg lg:max-w-2xl mx-auto animate-fade-in-up delay-200 drop-shadow-md">
                    {banner.description}
                  </p>
                  
                  {/* Button - Hiệu ứng trượt sáng (Shine) */}
                  <div className="animate-fade-in-up delay-300">

                  </div>

                </div>
              </div>
            ))}
          </Carousel>

          {/* Nút Next */}
          <button
            onClick={() => carouselRef.current?.next()}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-12 sm:h-12 flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/30 text-white rounded-full hover:bg-red-600 hover:border-red-600 hover:scale-110 hover:shadow-[0_0_15px_rgba(220,38,38,0.8)] transition-all duration-300 opacity-0 group-hover:opacity-100 translate-x-[20px] group-hover:translate-x-0"
          >
            <RightOutlined className="text-sm sm:text-xl" />
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        /* 1. Hiệu ứng Ken Burns (Zoom ảnh nền) */
        @keyframes ken-burns {
          0% { transform: scale(1); }
          100% { transform: scale(1.15); }
        }
        .animate-ken-burns {
          animation: ken-burns 10s ease-out infinite alternate;
        }
        /* 2. Hiệu ứng trượt lên (Fade In Up) cho chữ */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translate3d(0, 40px, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
          opacity: 0;
        }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        /* 3. Hiệu ứng quét sáng (Shine) cho nút */
        @keyframes shine {
          100% { left: 125%; }
        }
        .group-hover\/btn\\:animate-shine {
          animation: shine 0.75s;
          left: -75%;
          top: 0;
          width: 50%;
          height: 100%;
          transform: skewX(-25deg);
        }
        /* 4. Custom Dots Ant Design */
        .custom-dots-cgv li {
          width: 12px !important;
          height: 12px !important;
          border-radius: 50% !important;
          background: rgba(255, 255, 255, 0.4) !important;
          margin: 0 6px !important;
          transition: all 0.3s !important;
          border: 1px solid rgba(0,0,0,0.1);
        }
        .custom-dots-cgv li.slick-active {
          width: 30px !important;
          border-radius: 10px !important;
          background: #d90000 !important;
          box-shadow: 0 0 10px #d90000;
        }
        .custom-dots-cgv {
          bottom: 25px !important;
        }
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}} />
    </div>
  );
}