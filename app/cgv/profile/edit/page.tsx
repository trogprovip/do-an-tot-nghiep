/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Spin, Avatar, Button, Form, Input, Upload, message, Card } from 'antd';
import { 
  UserOutlined, 
  ArrowLeftOutlined,
  UploadOutlined,
  SaveOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import CGVHeader from '@/components/cgv/CGVHeader';
import CGVFooter from '@/components/cgv/CGVFooter';
import BackButton from '@/components/ui/BackButton';
import type { UploadFile, UploadProps } from 'antd';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  full_name: string;
  phone: string;
  avatar_url?: string;
  membership_tier: string;
  points: number;
  created_at: string;
}

export default function EditProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const [avatarFile, setAvatarFile] = useState<UploadFile | null>(null);

  // Khởi tạo form instance một cách ổn định
  useEffect(() => {
    // Không cần cleanup function ở đây để tránh lỗi form connection
  }, []);

  const fetchUserData = useCallback(async () => {
    try {
      // Call API to get user data from database
      const response = await fetch('/api/users/profile');
      
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      
      const result = await response.json();
      
      if (result.success) {
        setUser(result.data);
        // Sử dụng setFieldsValue một cách an toàn
        setTimeout(() => {
          form.setFieldsValue({
            full_name: result.data.full_name,
            email: result.data.email,
            phone: result.data.phone
          });
        }, 0);
      } else {
        throw new Error(result.error || 'Failed to fetch user data');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      message.error('Không thể tải thông tin người dùng');
      // Fallback to mock data if API fails
      const mockUser: UserProfile = {
        id: 1,
        username: 'cgv_member',
        email: 'user@example.com',
        full_name: 'Nguyễn Văn A',
        phone: '0912345678',
        avatar_url: 'https://via.placeholder.com/150',
        membership_tier: 'GOLD',
        points: 2500,
        created_at: '2024-01-15'
      };
      setUser(mockUser);
      // Sử dụng setFieldsValue một cách an toàn
      setTimeout(() => {
        form.setFieldsValue({
          full_name: mockUser.full_name,
          email: mockUser.email,
          phone: mockUser.phone
        });
      }, 0);
    } finally {
      setLoading(false);
    }
  }, [form]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleAvatarChange: UploadProps['onChange'] = ({ fileList }) => {
    const file = fileList[0];
    if (file) {
      setAvatarFile(file);
      // Create preview URL for the selected image
      const previewUrl = URL.createObjectURL(file.originFileObj as File);
      setUser(prev => prev ? { ...prev, avatar_url: previewUrl } : null);
    }
  };

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      // Call API to update user profile
      const formData = new FormData();
      formData.append('full_name', values.full_name);
      formData.append('email', values.email);
      formData.append('phone', values.phone);
      
      if (avatarFile?.originFileObj) {
        formData.append('avatar', avatarFile.originFileObj);
      }

      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      const result = await response.json();
      
      if (result.success) {
        message.success('Cập nhật hồ sơ thành công!');
        
        // Redirect back to profile page
        window.location.href = '/cgv/profile';
      } else {
        throw new Error(result.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      message.error('Không thể cập nhật hồ sơ. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const beforeUpload = (file: File) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('Chỉ chấp nhận file JPG/PNG!');
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Kích thước ảnh phải nhỏ hơn 2MB!');
      return false;
    }
    return false; // Prevent auto upload
  };

  if (loading) {
    return (
      <>
        <CGVHeader />
        <div className="min-h-screen bg-[#fdfcf0] flex items-center justify-center">
          <Spin size="large" />
        </div>
        <CGVFooter />
      </>
    );
  }

  return (
    <>
      <CGVHeader />
      
      <div className="min-h-screen bg-[#fdfcf0]">
        {/* Back Button */}
        <div className="container mx-auto px-4 pt-6">
          <BackButton 
            onClick={() => window.history.back()}
            text="Quay lại hồ sơ"
          />
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="shadow-lg">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Chỉnh Sửa Hồ Sơ</h1>
                <p className="text-gray-600">Cập nhật thông tin cá nhân của bạn</p>
              </div>

              <Form
                key="profile-edit-form"
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                className="space-y-6"
                preserve={false}
                initialValues={{
                  full_name: user?.full_name || '',
                  email: user?.email || '',
                  phone: user?.phone || ''
                }}
              >
                {/* Avatar Upload */}
                <div className="text-center mb-8">
                  <Upload
                    showUploadList={false}
                    beforeUpload={beforeUpload}
                    onChange={handleAvatarChange}
                    accept="image/*"
                  >
                    <div className="relative inline-block cursor-pointer group">
                      <Avatar 
                        size={120} 
                        src={user?.avatar_url} 
                        icon={<UserOutlined />}
                        className="border-4 border-gray-200 shadow-lg transition-all duration-300 group-hover:border-red-400"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <UploadOutlined className="text-white text-2xl" />
                      </div>
                    </div>
                  </Upload>
                  <p className="text-sm text-gray-500 mt-2">
                    Nhấp vào ảnh để thay đổi (JPG/PNG, tối đa 2MB)
                  </p>
                </div>

                {/* Form Fields */}
                <Form.Item
                  label="Họ và Tên"
                  name="full_name"
                  rules={[
                    { required: true, message: 'Vui lòng nhập họ và tên!' },
                    { min: 2, message: 'Họ và tên phải có ít nhất 2 ký tự!' }
                  ]}
                >
                  <Input 
                    size="large" 
                    placeholder="Nhập họ và tên của bạn"
                    className="rounded-lg"
                  />
                </Form.Item>

                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: 'Vui lòng nhập email!' },
                    { type: 'email', message: 'Email không hợp lệ!' }
                  ]}
                >
                  <Input 
                    size="large" 
                    placeholder="Nhập email của bạn"
                    className="rounded-lg"
                  />
                </Form.Item>

                <Form.Item
                  label="Số Điện Thoại"
                  name="phone"
                  rules={[
                    { required: true, message: 'Vui lòng nhập số điện thoại!' },
                    { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ!' }
                  ]}
                >
                  <Input 
                    size="large" 
                    placeholder="Nhập số điện thoại của bạn"
                    className="rounded-lg"
                  />
                </Form.Item>

                {/* Hidden fields that can't be edited */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Tên đăng nhập:</span>
                      <p className="font-semibold">{user?.username}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Hạng thành viên:</span>
                      <p className="font-semibold text-yellow-600">{user?.membership_tier}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Điểm thưởng:</span>
                      <p className="font-semibold">{user?.points?.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Ngày tham gia:</span>
                      <p className="font-semibold">
                        {new Date(user?.created_at || '').toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-6">
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={submitting}
                    size="large"
                    icon={<SaveOutlined />}
                    className="flex-1 bg-red-600 hover:bg-red-700 rounded-lg"
                  >
                    Lưu Thay Đổi
                  </Button>
                  <Link href="/cgv/profile">
                    <Button
                      size="large"
                      icon={<ArrowLeftOutlined />}
                      className="flex-1 rounded-lg"
                    >
                      Hủy
                    </Button>
                  </Link>
                </div>
              </Form>
            </Card>
          </div>
        </div>
      </div>

      <CGVFooter />
    </>
  );
}
