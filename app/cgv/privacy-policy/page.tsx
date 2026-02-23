'use client';

import React from 'react';
import CGVHeader from '@/components/cgv/CGVHeader';
import CGVFooter from '@/components/cgv/CGVFooter';
import { 
  Shield, 
  Lock, 
  Eye, 
  CheckCircle,
  AlertTriangle,
  Info,
  Users,
  Database,
  Mail,
  Smartphone,
  Cookie
} from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <CGVHeader />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-purple-800 to-indigo-900 text-white py-16">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="relative container mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <Shield className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">Chính Sách Bảo Mật</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Cam kết bảo vệ thông tin cá nhân của khách hàng
          </p>
        </div>
      </section>

      {/* Privacy Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8">
              
              {/* Introduction */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <Info className="w-6 h-6 text-purple-600" />
                  Giới Thiệu
                </h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-600 leading-relaxed">
                    CGV Việt Nam cam kết bảo vệ thông tin cá nhân của bạn. Chính sách bảo mật này giải thích cách chúng tôi 
                    thu thập, sử dụng, bảo vệ và chia sẻ thông tin của bạn khi sử dụng dịch vụ của CGV.
                  </p>
                </div>
              </div>

              {/* 1. Thông Tin Thu Thập */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  Thông Tin Thu Thập
                </h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">
                      <strong>Thông tin cá nhân:</strong> Tên, email, số điện thoại, ngày sinh, địa chỉ
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Database className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">
                      <strong>Thông tin tài khoản:</strong> Tên đăng nhập, mật khẩu, lịch sử giao dịch
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Smartphone className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">
                      <strong>Thông tin thiết bị:</strong> Loại thiết bị, hệ điều hành, địa chỉ IP
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Cookie className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">
                      <strong>Cookie và dữ liệu truy cập:</strong> Lịch sử dụng, sở thích, hành vi trên website
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. Mục Đích Sử Dụng */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  Mục Đích Sử Dụng
                </h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">
                      <strong>Cung cấp dịch vụ:</strong> Đặt vé, thanh toán, gửi thông tin khuyến mãi
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">
                      <strong>Cải thiện dịch vụ:</strong> Phân tích sử dụng để cải thiện trải nghiệm khách hàng
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">
                      <strong>Marketing:</strong> Gửi thông tin khuyến mãi, quảng cáo phù hợp sở thích
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">
                      <strong>Bảo mật:</strong> Ngăn chặn gian lận, lừa đảo và bảo vệ tài khoản
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. Bảo Mật Thông Tin */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                  Bảo Mật Thông Tin
                </h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Lock className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">
                      <strong>Mã hóa:</strong> Mọi thông tin nhạy cảm được mã hóa bằng công nghệ SSL 256-bit
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Lock className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">
                      <strong>Truy cập giới hạn:</strong> Chỉ nhân viên được ủy quyền mới có thể truy cập thông tin
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Lock className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">
                      <strong>Lưu trữ an toàn:</strong> Dữ liệu được lưu trữ trên máy chủ bảo mật tại Việt Nam
                    </p>
                  </div>
                </div>
              </div>

              {/* 4. Quyền Của Người Dùng */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                  Quyền Của Người Dùng
                </h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Eye className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">
                      <strong>Truy cập thông tin:</strong> Yêu cầu cung cấp bản sao thông tin cá nhân
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Eye className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">
                      <strong>Chỉnh sửa thông tin:</strong> Cập nhật thông tin tài khoản và cá nhân
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Eye className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">
                      <strong>Xóa tài khoản:</strong> Yêu cầu xóa tài khoản và thông tin liên quan
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Eye className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">
                      <strong>Opt-out marketing:</strong> Chọn không nhận email marketing và quảng cáo
                    </p>
                  </div>
                </div>
              </div>

              {/* 5. Cookie */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">5</span>
                  Cookie
                </h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Cookie className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">
                      <strong>Cookie thiết yếu:</strong> Cần thiết bị cho website hoạt động, không thể tắt
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Cookie className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">
                      <strong>Cookie phân tích:</strong> Theo dõi hành vi để cải thiện website, có thể tắt
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Cookie className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">
                      <strong>Cookie quảng cáo:</strong> Cá nhân hóa quảng cáo, có thể tắt
                    </p>
                  </div>
                </div>
              </div>

              {/* 6. Liên Hệ */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">6</span>
                  Liên Hệ
                </h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">
                      <strong>Email bảo mật:</strong> privacy@cgv.vn
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">
                      <strong>Thời gian phản hồi:</strong> Trong vòng 7 ngày làm việc
                    </p>
                  </div>
                </div>
              </div>

              {/* Last Updated */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <p className="text-center text-gray-500 text-sm">
                  Chính sách bảo mật này được cập nhật lần cuối vào ngày 01/01/2024
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>

      <CGVFooter />
    </div>
  );
}
