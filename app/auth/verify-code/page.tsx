'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Input, message, Spin } from 'antd';
import { ArrowLeft, Mail, Lock } from 'lucide-react';
import Link from 'next/link';

export default function VerifyCodePage() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [timeLeft, setTimeLeft] = useState(900); // 15 phút
  const [canResend, setCanResend] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    } else {
      message.error('Thiếu thông tin email');
      router.push('/auth/forgot-password');
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleVerify = async () => {
    if (!code || code.length !== 6) {
      message.error('Vui lòng nhập mã xác thực 6 số');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/verify-reset-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          token: code,
        }),
      });

      const data = await response.json();

      if (data.success) {
        message.success('Mã xác thực hợp lệ');
        router.push(`/auth/reset-password?email=${encodeURIComponent(email)}&token=${code}`);
      } else {
        message.error(data.message || 'Mã xác thực không hợp lệ');
      }
    } catch (error) {
      message.error('Có lỗi xảy ra. Vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
        }),
      });

      const data = await response.json();

      if (data.success) {
        message.success('Mã xác thực mới đã được gửi đến email của bạn');
        setTimeLeft(900); // Reset 15 phút
        setCanResend(false);
        setCode(''); // Xóa mã cũ
      } else {
        message.error(data.message || 'Không thể gửi lại mã xác thực');
      }
    } catch (error) {
      message.error('Có lỗi xảy ra. Vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Xác thực mã
          </h1>
          <p className="text-gray-600">
            Nhập mã xác thực 6 số đã được gửi đến
          </p>
          <p className="text-blue-600 font-medium">{email}</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mã xác thực
            </label>
            <Input
              type="text"
              value={code}
              onChange={handleCodeChange}
              placeholder="Nhập 6 số"
              className="text-center text-xl tracking-widest h-12"
              maxLength={6}
              style={{ letterSpacing: '0.5em' }}
            />
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">
              {timeLeft > 0 ? (
                <>Mã sẽ hết hạn sau: <span className="font-medium text-blue-600">{formatTime(timeLeft)}</span></>
              ) : (
                <span className="text-red-600">Mã đã hết hạn</span>
              )}
            </p>
            
            {canResend && (
              <Button
                type="link"
                onClick={handleResend}
                loading={loading}
                className="p-0 h-auto text-blue-600"
              >
                Gửi lại mã xác thực
              </Button>
            )}
          </div>

          <Button
            type="primary"
            onClick={handleVerify}
            loading={loading}
            disabled={code.length !== 6}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700"
            size="large"
          >
            {loading ? <Spin size="small" /> : <Lock className="w-4 h-4 mr-2" />}
            Xác thực
          </Button>

          <div className="text-center">
            <Link
              href="/auth/forgot-password"
              className="inline-flex items-center text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Quay lại
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
