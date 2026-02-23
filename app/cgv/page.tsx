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
    const responseCode = searchParams.get('responseCode');
    const errorMessage = searchParams.get('message');
    const errorType = searchParams.get('error');

    if (paymentStatus === 'success' && orderId) {
      message.success({
        content: '🎉 Thanh toán thành công! Vé của bạn đã được xác nhận.',
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
    } else if (paymentStatus === 'failed' && orderId) {
      message.error({
        content: `❌ Thanh toán thất bại: ${errorMessage || 'Vui lòng thử lại.'}`,
        duration: 5,
        style: {
          marginTop: '20vh',
          fontSize: '16px',
        },
      });

      // Clear URL params
      if (window.history.replaceState) {
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }
    } else if (paymentStatus === 'error') {
      let errorMsg = 'Có lỗi xảy ra trong quá trình thanh toán.';
      
      if (errorType === 'missing_params') {
        errorMsg = 'Thiếu thông tin giao dịch.';
      } else if (errorType === 'invalid_signature') {
        errorMsg = 'Chữ ký giao dịch không hợp lệ.';
      } else if (errorType === 'server_error') {
        errorMsg = 'Lỗi máy chủ, vui lòng thử lại.';
      }

      message.error({
        content: `❌ ${errorMsg}`,
        duration: 5,
        style: {
          marginTop: '20vh',
          fontSize: '16px',
        },
      });

      // Clear URL params
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
