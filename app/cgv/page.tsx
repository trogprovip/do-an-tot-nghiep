'use client';

import React, { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { message } from 'antd';
import CGVHeader from '@/components/cgv/CGVHeader';
import HeroBanner from '@/components/cgv/HeroBanner';
import MovieSelection from '@/components/cgv/MovieSelection';
import EventSection from '@/components/cgv/EventSection';
import CGVFooter from '@/components/cgv/CGVFooter';

export default function CGVHomePage() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    const orderId = searchParams.get('orderId');

    if (paymentStatus === 'success' && orderId) {
      message.success({
        content: '🎉 Đặt vé thành công! Vé của bạn đã được xác nhận.',
        duration: 5,
        style: {
          marginTop: '20vh',
          fontSize: '16px',
        },
      });

      // Clear URL params sau khi hiển thị thông báo
      if (window.history.replaceState) {
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <CGVHeader />
      <main>
        <HeroBanner />
        <MovieSelection />
        <EventSection />
      </main>
      <CGVFooter />
    </div>
  );
}
