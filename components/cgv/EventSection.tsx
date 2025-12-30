'use client';

import React from 'react';
import { Carousel, Card, Tabs } from 'antd';
import { LeftOutlined, RightOutlined, TagOutlined, GiftOutlined } from '@ant-design/icons';
import Link from 'next/link';

const events = [
  {
    id: 1,
    title: 'Quà Tặng Đầy Tay',
    image: '/events/gift-1.jpg',
    category: 'member',
  },
  {
    id: 2,
    title: 'Đồng Giá 79.000',
    image: '/events/price-79k.jpg',
    category: 'promotion',
  },
  {
    id: 3,
    title: 'Đồng Giá 79.000 VND',
    image: '/events/price-79k-2.jpg',
    category: 'promotion',
  },
  {
    id: 4,
    title: 'CGV Member Day',
    image: '/events/member-day.jpg',
    category: 'member',
  },
];

const specialOffers = [
  {
    id: 1,
    title: 'Quà Tặng Kỷ Niệm Phim Mê Ly',
    image: '/offers/gift-movie.jpg',
  },
  {
    id: 2,
    title: 'Khách Hàng Dưới 23 Tuổi',
    description: '60.000đ - 70.000đ',
    image: '/offers/under-23.jpg',
  },
  {
    id: 3,
    title: 'Thuê Rạp/Sự Kiện & Vé Nhóm',
    image: '/offers/rental.jpg',
  },
];

export default function EventSection() {
  const carouselRef = React.useRef<any>(null);

  return (
    <section className="py-12 bg-white">
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
            <span className="relative z-10">EVENT</span>
            <div className="absolute inset-0 border-t-2 border-b-2 border-gray-800 top-1/2 -translate-y-1/2 -left-32 -right-32" />
          </h2>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex justify-center">
            <div className="inline-flex bg-red-600 text-white rounded-lg overflow-hidden shadow-lg">
              <button className="px-6 py-3 font-bold flex items-center gap-2 hover:bg-red-700 transition-colors">
                <GiftOutlined />
                Thành Viên CGV
              </button>
              <div className="w-px bg-white/30" />
              <button className="px-6 py-3 font-bold flex items-center gap-2 hover:bg-red-700 transition-colors">
                <TagOutlined />
                Tin Mới & Ưu Đãi
              </button>
            </div>
          </div>
        </div>

        {/* Events Carousel */}
        <div className="relative mb-12">
          <button
            onClick={() => carouselRef.current?.prev()}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all -translate-x-4"
          >
            <LeftOutlined className="text-xl text-gray-700" />
          </button>

          <Carousel
            ref={carouselRef}
            slidesToShow={4}
            slidesToScroll={1}
            dots={false}
            responsive={[
              {
                breakpoint: 1024,
                settings: {
                  slidesToShow: 3,
                },
              },
              {
                breakpoint: 768,
                settings: {
                  slidesToShow: 2,
                },
              },
              {
                breakpoint: 480,
                settings: {
                  slidesToShow: 1,
                },
              },
            ]}
          >
            {events.map((event) => (
              <div key={event.id} className="px-3">
                <Card
                  hoverable
                  className="overflow-hidden shadow-lg transition-transform hover:scale-105 duration-300"
                  cover={
                    <div className="relative h-64 bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
                      <div className="text-white text-center p-4">
                        <h3 className="text-2xl font-bold">{event.title}</h3>
                      </div>
                    </div>
                  }
                >
                  <Link href={`/events/${event.id}`}>
                    <button className="w-full bg-red-600 text-white py-2 rounded-lg font-bold hover:bg-red-700 transition-colors">
                      XEM CHI TIẾT
                    </button>
                  </Link>
                </Card>
              </div>
            ))}
          </Carousel>

          <button
            onClick={() => carouselRef.current?.next()}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all translate-x-4"
          >
            <RightOutlined className="text-xl text-gray-700" />
          </button>
        </div>

        {/* Special Offers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {specialOffers.map((offer) => (
            <Card
              key={offer.id}
              hoverable
              className="overflow-hidden shadow-lg border-4 border-gray-800 transition-transform hover:scale-105 duration-300"
              cover={
                <div className="relative h-64 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <div className="text-white text-center p-6">
                    <h3 className="text-xl font-bold mb-2">{offer.title}</h3>
                    {offer.description && (
                      <p className="text-3xl font-bold">{offer.description}</p>
                    )}
                  </div>
                </div>
              }
            >
              <Link href={`/offers/${offer.id}`}>
                <button className="w-full bg-red-600 text-white py-2 rounded-lg font-bold hover:bg-red-700 transition-colors">
                  XEM NGAY
                </button>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
