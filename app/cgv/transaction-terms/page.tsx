'use client';

import React from 'react';
import CGVHeader from '@/components/cgv/CGVHeader';
import CGVFooter from '@/components/cgv/CGVFooter';
import { 
  FileText, 
  CreditCard, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Scale,
  Clock,
  DollarSign
} from 'lucide-react';

export default function TransactionTermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <CGVHeader />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-green-800 to-teal-900 text-white py-16">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="relative container mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <CreditCard className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">Điều Khoản Giao Dịch</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Quy định về việc mua bán và giao dịch dịch vụ tại CGV Việt Nam
          </p>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8">
              
              {/* Introduction */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <Info className="w-6 h-6 text-green-600" />
                  Giới Thiệu
                </h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-600 leading-relaxed">
                    Điều khoản giao dịch này quy định các quy tắc và điều kiện khi thực hiện các giao dịch 
                    mua bán vé, sản phẩm và dịch vụ tại CGV Việt Nam.
                  </p>
                </div>
              </div>

              {/* 1. Đối Tượng Giao Dịch */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  Đối Tượng Giao Dịch
                </h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">
                      <strong>Khách hàng cá nhân:</strong> Người từ 16 tuổi trở lên có thể thực hiện giao dịch.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">
                      <strong>Khách hàng dưới 16 tuổi:</strong> Phải có sự đồng ý của phụ huynh hoặc người giám hộ.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">
                      <strong>Khách hàng doanh nghiệp:</strong> Cần có giấy giới thiệu và thông tin công ty hợp lệ.
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. Phương Thức Thanh Toán */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  Phương Thức Thanh Toán
                </h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CreditCard className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">
                      <strong>Thẻ tín dụng/ghi nợ:</strong> Visa, Mastercard, JCB, AMEX được chấp nhận.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <DollarSign className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">
                      <strong>Ví điện tử:</strong> MoMo, ZaloPay, ShopeePay, VNPay QR.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Scale className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">
                      <strong>Tiền mặt:</strong> Chấp nhận tại quầy vé và các điểm bán hàng.
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. Quy Trình Giao Dịch */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                  Quy Trình Giao Dịch
                </h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">
                      <strong>Bước 1 - Chọn sản phẩm:</strong> Khách hàng chọn phim, suất chiếu, ghế và các dịch vụ khác.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">
                      <strong>Bước 2 - Xác nhận thông tin:</strong> Kiểm tra lại thông tin đặt vé và thanh toán.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">
                      <strong>Bước 3 - Thanh toán:</strong> Thực hiện thanh toán bằng phương thức đã chọn.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">
                      <strong>Bước 4 - Nhận vé:</strong> Nhận vé điện tử qua email hoặc vé giấy tại quầy.
                    </p>
                  </div>
                </div>
              </div>

              {/* 4. Hủy Giao Dịch */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                  Hủy Giao Dịch
                </h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">
                      <strong>Không hủy vé:</strong> Sau khi thanh toán thành công, vé không thể hủy hoặc đổi trả.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">
                      <strong>Trường hợp đặc biệt:</strong> Nếu CGV hủy suất chiếu, khách hàng sẽ được hoàn tiền 100%.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">
                      <strong>Thời gian hoàn tiền:</strong> 5-7 ngày làm việc kể từ ngày CGV xác nhận hủy.
                    </p>
                  </div>
                </div>
              </div>

              {/* 5. Bảo Vệ Giao Dịch */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">5</span>
                  Bảo Vệ Giao Dịch
                </h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">
                      <strong>Bảo mật thông tin:</strong> Mọi thông tin giao dịch được bảo mật theo tiêu chuẩn PCI DSS.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">
                      <strong>Mã hóa dữ liệu:</strong> Sử dụng công nghệ mã hóa SSL để bảo vệ dữ liệu truyền tải.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">
                      <strong>Xác thực giao dịch:</strong> Yêu cầu mã OTP cho các giao dịch lớn.
                    </p>
                  </div>
                </div>
              </div>

              {/* 6. Tranh Chấp */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">6</span>
                  Giải Quyết Tranh Chấp
                </h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">
                      <strong>Thương lượng trước:</strong> Ưu tiên giải quyết tranh chấp thông qua thương lượng.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">
                      <strong>Khiếu nại:</strong> Khách hàng có thể khiếu nại trong vòng 7 ngày kể từ ngày giao dịch.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">
                      <strong>Pháp luật:</strong> Tranh chấp không giải quyết được sẽ được đưa ra Tòa án có thẩm quyền.
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <div className="bg-gray-50 rounded-lg p-6">
                  <p className="text-gray-600 mb-4">
                    Nếu bạn có câu hỏi về điều khoản giao dịch, vui lòng liên hệ:
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
