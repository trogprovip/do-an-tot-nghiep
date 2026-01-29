/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CGVHeader from '@/components/cgv/CGVHeader';
import CGVFooter from '@/components/cgv/CGVFooter';
import { authService } from '@/lib/services/authService';
import { 
  EyeOutlined, 
  EyeInvisibleOutlined, 
  UserOutlined, 
  LockOutlined, 
  MailOutlined, 
  PhoneOutlined,
  GoogleOutlined,
  FacebookOutlined
} from '@ant-design/icons';

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // State giữ nguyên
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });

  const [registerForm, setRegisterForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    password: '',
    username: '',
  });

  // Logic Login giữ nguyên
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authService.login({
        email: loginForm.email,
        password: loginForm.password,
      });

      if (response.success) {
        if (response.user?.role === 'admin') {
          alert('Tài khoản Admin vui lòng đăng nhập tại trang Admin!');
          authService.logout();
          return;
        }
        alert('Đăng nhập thành công!');
        router.push('/');
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Đăng nhập thất bại!');
    } finally {
      setLoading(false);
    }
  };

  // Logic Register giữ nguyên
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authService.register(registerForm);

      if (response.success) {
        alert('Đăng ký thành công! Vui lòng đăng nhập.');
        setActiveTab('login');
        setRegisterForm({
          full_name: '',
          phone: '',
          email: '',
          password: '',
          username: '',
        });
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Đăng ký thất bại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans relative">
      <CGVHeader hideQuickLinks />

      {/* Main Content Container */}
      <div className="relative min-h-screen flex items-center justify-center py-24 px-4 overflow-hidden">
        
        {/* Background Ambient Blobs (Trang trí nền) */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-red-100 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-orange-100 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob animation-delay-2000 pointer-events-none" />

        {/* Card Container - Glass Effect */}
        <div className="relative w-full max-w-5xl bg-white/80 backdrop-blur-xl rounded-[30px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-white/50 overflow-hidden grid grid-cols-1 lg:grid-cols-2 z-10">
          
          {/* CỘT TRÁI: Hình ảnh Lifestyle (Chỉ hiện trên desktop) */}
          <div className="hidden lg:block relative h-full min-h-[600px] bg-black">
            <img 
              src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2525&auto=format&fit=crop" 
              alt="Cinema Experience" 
              className="absolute inset-0 w-full h-full object-cover opacity-60 transition-transform duration-700 hover:scale-105"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-red-900/90 via-black/40 to-transparent" />
            
            {/* Content Text */}
            <div className="absolute bottom-0 left-0 p-12 text-white">
              <h2 className="text-4xl font-black mb-4 leading-tight">
                TRẢI NGHIỆM <br/>
                <span className="text-red-500">ĐIỆN ẢNH</span> ĐỈNH CAO
              </h2>
              <p className="text-gray-300 font-medium text-lg max-w-md">
                Đặt vé nhanh chóng, ưu đãi ngập tràn cùng hàng ngàn phim bom tấn đang chờ đón bạn.
              </p>
            </div>
          </div>

          {/* CỘT PHẢI: Form */}
          <div className="p-8 lg:p-12 flex flex-col justify-center h-full">
            
            {/* Tab Switcher - Pill Style */}
            <div className="flex bg-gray-100 p-1.5 rounded-full w-fit mb-8 mx-auto lg:mx-0">
              <button
                onClick={() => setActiveTab('login')}
                className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                  activeTab === 'login'
                    ? 'bg-white text-red-600 shadow-md transform scale-105'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Đăng nhập
              </button>
              <button
                onClick={() => setActiveTab('register')}
                className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                  activeTab === 'register'
                    ? 'bg-white text-red-600 shadow-md transform scale-105'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Đăng ký
              </button>
            </div>

            {/* Header Text */}
            <div className="mb-8 text-center lg:text-left">
              <h1 className="text-3xl font-black text-gray-900 mb-2">
                {activeTab === 'login' ? 'Welcome' : 'Tạo tài khoản mới'}
              </h1>
              <p className="text-gray-400 font-medium text-sm">
                {activeTab === 'login' 
                  ? 'Vui lòng đăng nhập để tiếp tục đặt vé.' 
                  : 'Điền thông tin bên dưới để tham gia cùng chúng tôi.'}
              </p>
            </div>

            {/* --- LOGIN FORM --- */}
            {activeTab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-6 animate-fade-in-up">
                <div className="space-y-5">
                  <div className="relative group">
                    <MailOutlined className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-600 text-lg transition-colors" />
                    <input
                      type="text"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      placeholder="Email hoặc số điện thoại"
                      className="w-full bg-transparent border-b-2 border-gray-100 py-3 pl-8 text-gray-700 font-medium focus:border-red-600 focus:outline-none transition-colors placeholder:text-gray-300"
                      required
                    />
                  </div>

                  <div className="relative group">
                    <LockOutlined className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-600 text-lg transition-colors" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      placeholder="Mật khẩu"
                      className="w-full bg-transparent border-b-2 border-gray-100 py-3 pl-8 pr-8 text-gray-700 font-medium focus:border-red-600 focus:outline-none transition-colors placeholder:text-gray-300"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-300 hover:text-red-600 transition-colors"
                    >
                      {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Link href="/auth/forgot-password" className="text-xs font-bold text-gray-400 hover:text-red-600 transition-colors uppercase">
                    Quên mật khẩu?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gray-900 text-white rounded-xl font-black text-sm uppercase tracking-widest hover:bg-red-600 hover:shadow-lg hover:shadow-red-200 transition-all duration-300 transform active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? 'Đang xử lý...' : 'Đăng nhập ngay'}
                </button>
              </form>
            )}

            {/* --- REGISTER FORM --- */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegister} className="space-y-5 animate-fade-in-up">
                <div className="grid grid-cols-2 gap-5">
                  <div className="relative group">
                    <UserOutlined className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-600 transition-colors" />
                    <input
                      type="text"
                      value={registerForm.full_name}
                      onChange={(e) => setRegisterForm({ ...registerForm, full_name: e.target.value })}
                      placeholder="Họ tên"
                      className="w-full bg-transparent border-b-2 border-gray-100 py-3 pl-7 text-gray-700 font-medium focus:border-red-600 focus:outline-none transition-colors placeholder:text-gray-300 text-sm"
                      required
                    />
                  </div>
                  <div className="relative group">
                    <UserOutlined className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-600 transition-colors" />
                    <input
                      type="text"
                      value={registerForm.username}
                      onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                      placeholder="Username"
                      className="w-full bg-transparent border-b-2 border-gray-100 py-3 pl-7 text-gray-700 font-medium focus:border-red-600 focus:outline-none transition-colors placeholder:text-gray-300 text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="relative group">
                  <PhoneOutlined className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-600 transition-colors" />
                  <input
                    type="tel"
                    value={registerForm.phone}
                    onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                    placeholder="Số điện thoại"
                    className="w-full bg-transparent border-b-2 border-gray-100 py-3 pl-8 text-gray-700 font-medium focus:border-red-600 focus:outline-none transition-colors placeholder:text-gray-300"
                    required
                  />
                </div>

                <div className="relative group">
                  <MailOutlined className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-600 transition-colors" />
                  <input
                    type="email"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    placeholder="Email"
                    className="w-full bg-transparent border-b-2 border-gray-100 py-3 pl-8 text-gray-700 font-medium focus:border-red-600 focus:outline-none transition-colors placeholder:text-gray-300"
                    required
                  />
                </div>

                <div className="relative group">
                  <LockOutlined className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-600 transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    placeholder="Mật khẩu"
                    className="w-full bg-transparent border-b-2 border-gray-100 py-3 pl-8 pr-8 text-gray-700 font-medium focus:border-red-600 focus:outline-none transition-colors placeholder:text-gray-300"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-300 hover:text-red-600 transition-colors"
                  >
                    {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gray-900 text-white rounded-xl font-black text-sm uppercase tracking-widest hover:bg-red-600 hover:shadow-lg hover:shadow-red-200 transition-all duration-300 transform active:scale-[0.98] disabled:opacity-50 mt-4"
                >
                  {loading ? 'Đang xử lý...' : 'Tạo tài khoản'}
                </button>
              </form>
            )}

          </div>
        </div>
      </div>

      <CGVFooter />
    </div>
  );
}