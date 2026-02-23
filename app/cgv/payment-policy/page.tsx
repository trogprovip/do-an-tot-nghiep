'use client';

import React from 'react';
import CGVHeader from '@/components/cgv/CGVHeader';
import CGVFooter from '@/components/cgv/CGVFooter';
import { 
  CreditCard, 
  Shield, 
  CheckCircle,
  AlertTriangle,
  Info,
  Smartphone,
  Wallet,
  Banknote,
  Clock,
  DollarSign
} from 'lucide-react';

export default function PaymentPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <CGVHeader />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-800 to-indigo-900 text-white py-16">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="relative container mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <CreditCard className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">Chính Sách Thanh Toán</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Quy định về phương thức thanh toán và bảo mật giao dịch tại CGV Việt Nam
          </p>
        </div>
      </section>

      {/* Payment Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8">
              
              {/* 1. Phương Thức Thanh Toán */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  Phương Thức Thanh Toán
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <CreditCard className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900">Thẻ tín dụng/ghi nợ</p>
                      <p className="text-gray-600">Visa, Mastercard, JCB, AMEX</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Smartphone className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900">Ví điện tử</p>
                      <p className="text-gray-600">MoMo, ZaloPay, ShopeePay</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Wallet className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900">Chuyển khoản</p>
                      <p className="text-gray-600">Ngân hàng nội địa</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Banknote className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900">Tiền mặt</p>
                      <p className="text-gray-600">Tại quầy vé</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Quy Trình Thanh Toán */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  Quy Trình Thanh Toán
                </h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">
                      <strong>Bước 1:</strong> Chọn sản phẩm và dịch vụ
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">
                      <strong>Bước 2:</strong> Chọn phương thức thanh toán
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">
                      <strong>Bước 3:</strong> Xác nhận thông tin và thanh toán
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">
                      <strong>Bước 4:</strong> Nhận xác nhận giao dịch thành công
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. Bảo Mật Thanh Toán */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                  Bảo Mật Thanh Toán
                </h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">
                      <strong>Mã hóa SSL:</strong> Mọi thông tin thanh toán được mã hóa bằng công nghệ SSL 256-bit
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">
                      <strong>PCI DSS:</strong> Tuân thủ tiêu chuẩn bảo mật dữ liệu thẻ ngành công nghiệp
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">
                      <strong>3D Secure:</strong> Xác thực giao dịch bằng mã OTP cho các thẻ quốc tế
                    </p>
                  </div>
                </div>
              </div>

              {/* 4. Phí Dịch Vụ */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                  Phí Dịch Vụ
                </h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-600 mb-2">
                    CGV có thể áp dụng phí dịch vụ cho các giao dịch trực tuyến:
                  </p>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Thanh toán qua thẻ: 1.500 VNĐ/giao dịch</li>
                    <li>• Thanh toán qua ví điện tử: Miễn phí</li>
                    <li>• Chuyển khoản ngân hàng: Miễn phí</li>
                  </ul>
                </div>
              </div>

              {/* 5. Hoàn Tiền */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">5</span>
                  Chính Sách Hoàn Tiền
                </h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">
                      <strong>Không hoàn vé:</strong> Sau khi giao dịch thành công, vé không được hoàn trả
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">
                      <strong>Thời gian xử lý:</strong> 5-7 ngày làm việc cho các trường hợp được hoàn tiền
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <div className="bg-blue-50 rounded-lg p-6">
                  <p className="text-gray-600 mb-4">
                    Cần hỗ trợ về thanh toán? Liên hệ ngay:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="font-semibold text-gray-900">Hotline:</p>
                      <p className="text-gray-600">1900 6017</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Email:</p>
                      <p className="text-gray-600">support@cgv.vn</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      <CGVFooter />
    </div>
  );
}
