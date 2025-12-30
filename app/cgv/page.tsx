'use client';

import React from 'react';
import CGVHeader from '@/components/cgv/CGVHeader';
import HeroBanner from '@/components/cgv/HeroBanner';
import MovieSelection from '@/components/cgv/MovieSelection';
import EventSection from '@/components/cgv/EventSection';
import CGVFooter from '@/components/cgv/CGVFooter';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';

export default function CGVHomePage() {
  return (
    <ConfigProvider locale={viVN}>
      <div className="min-h-screen bg-white">
        <CGVHeader />
        <main>
          <HeroBanner />
          <MovieSelection />
          <EventSection />
        </main>
        <CGVFooter />
      </div>
    </ConfigProvider>
  );
}
