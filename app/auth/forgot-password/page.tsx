'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CGVHeader from '@/components/cgv/CGVHeader';
import CGVFooter from '@/components/cgv/CGVFooter';
import { authService } from '@/lib/services/authService';
import { MailOutlined, ArrowLeftOutlined, CheckCircleFilled, RedoOutlined } from '@ant-design/icons';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const timer = setTimeout(() => {
      setMounted(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authService.forgotPassword(email);
      if (response.success) {
        setSuccess(true);
      }
    } catch (error) {
      alert('Có lỗi xảy ra. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans relative">
      <CGVHeader hideQuickLinks />

      {/* Main Content Container */}
      <div className="relative min-h-screen flex items-center justify-center py-24 px-4 overflow-hidden">
        
        {/* Background Ambient Blobs (Giống trang Login) */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-red-100 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-orange-100 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob animation-delay-2000 pointer-events-none" />

        {/* Card Container - Glass Effect */}
        <div 
          className={`relative w-full max-w-lg bg-white/80 backdrop-blur-xl rounded-[30px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-white/50 p-10 lg:p-14 transition-all duration-700 transform ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Header Section */}
          <div className="text-center mb-10">
             <h1 className="text-3xl font-black text-gray-900 mb-3 uppercase tracking-tight">
               {success ? 'Đã Gửi Email!' : 'Quên Mật Khẩu?'}
             </h1>
             <p className="text-gray-400 font-medium text-sm px-4 leading-relaxed">
               {success 
                 ? 'Vui lòng kiểm tra hộp thư đến (bao gồm cả mục Spam) để nhận hướng dẫn đặt lại mật khẩu.'
                 : 'Đừng lo lắng. Hãy nhập email đã đăng ký, chúng tôi sẽ giúp bạn lấy lại tài khoản.'}
             </p>
          </div>

          {/* Form Content */}
          <div className="relative">
            {!success ? (
              <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* Input Field - Style Luxury Borderless */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                    Địa chỉ Email
                  </label>
                  <div className="relative group">
                    <MailOutlined className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-600 text-lg transition-colors duration-300" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="vidu@gmail.com"
                      className="w-full bg-transparent border-b-2 border-gray-100 py-3 pl-8 text-gray-900 font-bold focus:border-red-600 focus:outline-none transition-all duration-300 placeholder:text-gray-300 placeholder:font-normal"
                      required
                    />
                  </div>
                </div>

                {/* Submit Button - Black to Red Style */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gray-900 text-white rounded-xl font-black text-sm uppercase tracking-widest hover:bg-red-600 hover:shadow-lg hover:shadow-red-200 transition-all duration-300 transform active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    'Đang xử lý...'
                  ) : (
                    <>
                      Gửi yêu cầu <RedoOutlined className="text-xs" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              // Success State
              <div className="text-center animate-fade-in-up">
                <div className="mb-8 relative inline-block">
                  <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-75"></div>
                  <CheckCircleFilled className="text-6xl text-green-500 relative z-10 bg-white rounded-full shadow-lg border-4 border-white" />
                </div>
                
                <div className="space-y-4">
                  <Link 
                    href="/auth/login"
                    className="block w-full py-4 bg-gray-900 text-white rounded-xl font-black text-sm uppercase tracking-widest hover:bg-green-600 hover:shadow-lg hover:shadow-green-200 transition-all duration-300"
                  >
                    Về trang đăng nhập
                  </Link>
                  
                  <button 
                    onClick={() => setSuccess(false)}
                    className="text-gray-400 text-sm font-semibold hover:text-gray-600 transition-colors"
                  >
                    Chưa nhận được? Thử lại
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Back Link */}
          {!success && (
            <div className="mt-10 text-center border-t border-gray-100 pt-8">
              <Link 
                href="/auth/login" 
                className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-red-600 transition-colors group"
              >
                <ArrowLeftOutlined className="group-hover:-translate-x-1 transition-transform" />
                Quay lại đăng nhập
              </Link>
            </div>
          )}
        </div>
      </div>

      <CGVFooter />
    </div>
  );
}