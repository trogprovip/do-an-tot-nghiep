'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Input, message, Spin } from 'antd';
import { ArrowLeft, Lock, Eye, EyeOff, Check } from 'lucide-react';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const emailParam = searchParams.get('email');
    const tokenParam = searchParams.get('token');
    
    if (emailParam && tokenParam) {
      setEmail(emailParam);
      setToken(tokenParam);
    } else {
      message.error('Thiếu thông tin xác thực');
      router.push('/auth/forgot-password');
    }
  }, [searchParams, router]);

  const validatePassword = (password: string) => {
    if (password.length < 6) {
      return 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return 'Mật khẩu phải có ít nhất 1 chữ thường';
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'Mật khẩu phải có ít nhất 1 chữ hoa';
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'Mật khẩu phải có ít nhất 1 số';
    }
    return '';
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/(?=.*[a-z])/.test(password)) strength++;
    if (/(?=.*[A-Z])/.test(password)) strength++;
    if (/(?=.*\d)/.test(password)) strength++;
    if (/(?=.*[@$!%*?&])/.test(password)) strength++;
    return strength;
  };

  const getStrengthColor = (strength: number) => {
    if (strength <= 2) return 'text-red-500';
    if (strength <= 4) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getStrengthText = (strength: number) => {
    if (strength <= 2) return 'Yếu';
    if (strength <= 4) return 'Trung bình';
    return 'Mạnh';
  };

  const handleReset = async () => {
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      message.error(passwordError);
      return;
    }

    if (newPassword !== confirmPassword) {
      message.error('Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          token,
          newPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        message.success('Đặt lại mật khẩu thành công!');
        setTimeout(() => {
          router.push('/auth/login');
        }, 2000);
      } else {
        message.error(data.message || 'Không thể đặt lại mật khẩu');
      }
    } catch (error) {
      message.error('Có lỗi xảy ra. Vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(newPassword);
  const passwordError = validatePassword(newPassword);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <Lock className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Đặt lại mật khẩu
          </h1>
          <p className="text-gray-600">
            Tạo mật khẩu mới cho tài khoản của bạn
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mật khẩu mới
            </label>
            <div className="relative">
              <Input.Password
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới"
                className="h-12"
                visibilityToggle={{
                  visible: showPassword,
                  onVisibleChange: setShowPassword,
                }}
                iconRender={(visible) => (visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />)}
              />
            </div>
            
            {newPassword && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500">Độ mạnh mật khẩu:</span>
                  <span className={`text-xs font-medium ${getStrengthColor(passwordStrength)}`}>
                    {getStrengthText(passwordStrength)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      passwordStrength <= 2 ? 'bg-red-500' : 
                      passwordStrength <= 4 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${(passwordStrength / 6) * 100}%` }}
                  />
                </div>
                {passwordError && (
                  <p className="text-red-500 text-xs mt-1">{passwordError}</p>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Xác nhận mật khẩu
            </label>
            <div className="relative">
              <Input.Password
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                className="h-12"
                visibilityToggle={{
                  visible: showConfirmPassword,
                  onVisibleChange: setShowConfirmPassword,
                }}
                iconRender={(visible) => (visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />)}
              />
            </div>
            
            {confirmPassword && newPassword === confirmPassword && (
              <div className="mt-1 flex items-center text-green-500 text-xs">
                <Check className="w-3 h-3 mr-1" />
                Mật khẩu khớp
              </div>
            )}
            
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-red-500 text-xs mt-1">Mật khẩu không khớp</p>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Yêu cầu mật khẩu:</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li className="flex items-center">
                <Check className={`w-3 h-3 mr-2 ${newPassword.length >= 6 ? 'text-green-500' : 'text-gray-400'}`} />
                Ít nhất 6 ký tự
              </li>
              <li className="flex items-center">
                <Check className={`w-3 h-3 mr-2 ${/(?=.*[a-z])/.test(newPassword) ? 'text-green-500' : 'text-gray-400'}`} />
                1 chữ thường
              </li>
              <li className="flex items-center">
                <Check className={`w-3 h-3 mr-2 ${/(?=.*[A-Z])/.test(newPassword) ? 'text-green-500' : 'text-gray-400'}`} />
                1 chữ hoa
              </li>
              <li className="flex items-center">
                <Check className={`w-3 h-3 mr-2 ${/(?=.*\d)/.test(newPassword) ? 'text-green-500' : 'text-gray-400'}`} />
                1 số
              </li>
            </ul>
          </div>

          <Button
            type="primary"
            onClick={handleReset}
            loading={loading}
            disabled={!newPassword || !confirmPassword || newPassword !== confirmPassword || !!passwordError}
            className="w-full h-12 bg-green-600 hover:bg-green-700"
            size="large"
          >
            {loading ? <Spin size="small" /> : <Lock className="w-4 h-4 mr-2" />}
            Đặt lại mật khẩu
          </Button>

          <div className="text-center">
            <Link
              href="/auth/login"
              className="inline-flex items-center text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
