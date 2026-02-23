'use client';

import React from 'react';
import CGVHeader from '@/components/cgv/CGVHeader';
import CGVFooter from '@/components/cgv/CGVFooter';
import { 
  FileText, 
  Shield, 
  Users, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Scale,
  Gavel,
  Eye,
  Lock
} from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <CGVHeader />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-gray-800 to-gray-900 text-white py-16">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="relative container mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <FileText className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">Điều Khoản Chung</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Điều khoản sử dụng dịch vụ của CGV Việt Nam
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
                  <Info className="w-6 h-6 text-blue-600" />
                  Giới Thiệu
                </h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-600 leading-relaxed">
                    Chào mừng bạn đến với website và ứng dụng CGV Việt Nam. Các điều khoản sử dụng này 
                    Điều Khoản quy định việc sử dụng các dịch vụ do Công Ty TNHH CJ CGV Việt Nam 
                    CGV cung cấp. Bằng việc truy cập hoặc sử dụng dịch vụ của chúng tôi, bạn đồng ý 
                    tuân thủ các điều khoản này.
                  </p>
                  <p className="text-gray-600 leading-relaxed mt-4">
                    Nếu bạn không đồng ý với các điều khoản này, vui lòng không sử dụng dịch vụ của chúng tôi.
                  </p>
                </div>
              </div>

              {/* 1. Chấp Nhận Điều Khoản */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  Chấp Nhận Điều Khoản
                </h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">
                      Bằng việc sử dụng dịch vụ CGV, bạn xác nhận rằng bạn đã đọc, hiểu và đồng ý bị ràng buộc bởi các Điều khoản này.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">
                      Nếu bạn dưới 18 tuổi, bạn phải có sự đồng ý của phụ huynh hoặc người giám hộ hợp pháp.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">
                      CGV có quyền thay đổi các điều khoản này bất cứ lúc nào. Việc tiếp tục sử dụng dịch vụ sau khi có thay đổi đồng nghĩa với việc bạn chấp nhận các điều khoản đã thay đổi.
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. Dịch Vụ CGV */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  Dịch Vụ CGV
                </h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Eye className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">
                      <strong>Đặt vé xem phim:</strong> Cung cấp dịch vụ đặt vé online và tại quầy cho các suất chiếu phim.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Eye className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">
                      <strong>Thông tin phim:</strong> Cung cấp thông tin về phim đang chiếu, sắp chiếu, lịch chiếu và giá vé.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Eye className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">
                      <strong>Thành viên:</strong> Dịch vụ đăng ký thành viên, tích điểm và các quyền lợi đi kèm.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Eye className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">
                      <strong>Khuyến mãi:</strong> Các chương trình ưu đãi, giảm giá và quà tặng cho thành viên.
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. Trách Nhiệm Người Dùng */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                  Trách Nhiệm Người Dùng
                </h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">
                      <strong>Thông tin chính xác:</strong> Cung cấp thông tin cá nhân chính xác, đầy đủ và cập nhật khi cần thiết.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">
                      <strong>Bảo mật tài khoản:</strong> Chịu trách nhiệm bảo mật tài khoản và không chia sẻ thông tin đăng nhập.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">
                      <strong>Sử dụng hợp pháp:</strong> Không sử dụng dịch vụ cho các mục đích bất hợp pháp hoặc trái pháp luật.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">
                      <strong>Tôn trọng người khác:</strong> Không đăng tải nội dung xúc phạm, đe dọa hoặc gây hại cho người khác.
                    </p>
                  </div>
                </div>
              </div>

              {/* 4. Quyền Sở Hữu Trí Tuệ */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                  Quyền Sở Hữu Trí Tuệ
                </h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">
                      <strong>Nội dung CGV:</strong> Toàn bộ nội dung trên website và ứng dụng CGV (text, hình ảnh, video, logo) thuộc sở hữu của CGV và được bảo vệ bởi luật bản quyền.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">
                      <strong>Giấy phép sử dụng:</strong> Bạn được cấp phép sử dụng nội dung CGV cho mục đích cá nhân, không thương mại.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">
                      <strong>Cấm sao chép:</strong> Không được sao chép, phân phối, sửa đổi hoặc sử dụng nội dung CGV mà không có sự cho phép bằng văn bản.
                    </p>
                  </div>
                </div>
              </div>

              {/* 5. Thanh Toán */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">5</span>
                  Thanh Toán
                </h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Scale className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">
                      <strong>Phương thức thanh toán:</strong> CGV chấp nhận các phương thức thanh toán: thẻ tín dụng/ghi nợ, ví điện tử, chuyển khoản, tiền mặt.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Scale className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">
                      <strong>Giá vé:</strong> Giá vé có thể thay đổi tùy thuộc vào thời điểm, loại phim và loại ghế. CGV không hoàn lại tiền cho vé đã mua.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Scale className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">
                      <strong>Phí dịch vụ:</strong> Có thể áp dụng phí dịch vụ cho các giao dịch trực tuyến. Phí này sẽ được hiển thị rõ trước khi xác nhận thanh toán.
                    </p>
                  </div>
                </div>
              </div>

              {/* 6. Hủy Vé và Hoàn Tiền */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">6</span>
                  Hủy Vé và Hoàn Tiền
                </h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">
                      <strong>Không hủy vé:</strong> Sau khi đặt vé thành công, vé không thể hủy hoặc đổi trả.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">
                      <strong>Trường hợp đặc biệt:</strong> Nếu phim bị hủy hoặc dừng chiếu do lỗi của CGV, bạn sẽ được hoàn tiền 100% hoặc đổi vé miễn phí.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">
                      <strong>Thời gian hoàn tiền:</strong> Trong trường hợp được hoàn tiền, quá trình xử lý có thể mất 5-7 ngày làm việc.
                    </p>
                  </div>
                </div>
              </div>

              {/* 7. Bảo Mật */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">7</span>
                  Bảo Mật
                </h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Lock className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">
                      <strong>Thu thập thông tin:</strong> CGV thu thập thông tin cá nhân khi bạn đăng ký tài khoản, đặt vé hoặc sử dụng dịch vụ khác.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Lock className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">
                      <strong>Sử dụng thông tin:</strong> Thông tin của bạn được sử dụng để cung cấp dịch vụ, cải thiện trải nghiệm và gửi thông tin khuyến mãi.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Lock className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">
                      <strong>Bảo vệ thông tin:</strong> CGV cam kết bảo mật thông tin cá nhân của bạn theo Chính sách Bảo mật.
                    </p>
                  </div>
                </div>
              </div>

              {/* 8. Giới Hạn Trách Nhiệm */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">8</span>
                  Giới Hạn Trách Nhiệm
                </h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">
                      <strong>Dịch vụ nguyên trạng:</strong> Dịch vụ được cung cấp nguyên trạng mà không có bảo đảm nào, rõ ràng hay ngụ ý.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">
                      <strong>Không chịu trách nhiệm:</strong> CGV không chịu trách nhiệm cho bất kỳ thiệt hại nào phát sinh từ việc sử dụng dịch vụ.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">
                      <strong>Gián đoạn dịch vụ:</strong> CGV có quyền tạm ngừng hoặc ngừng cung cấp dịch vụ mà không cần báo trước.
                    </p>
                  </div>
                </div>
              </div>

              {/* 9. Giải Quyết Tranh Chấp */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">9</span>
                  Giải Quyết Tranh Chấp
                </h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Gavel className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">
                      <strong>Thương lượng:</strong> Mọi tranh chấp phát sinh từ hoặc liên quan đến việc sử dụng dịch vụ sẽ được giải quyết thông qua thương lượng.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Gavel className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">
                      <strong>Pháp luật áp dụng:</strong> Các điều khoản này được điều chỉnh bởi pháp luật Việt Nam. Mọi tranh chấp sẽ được giải quyết tại Tòa án có thẩm quyền.
                    </p>
                  </div>
                </div>
              </div>

              {/* 10. Liên Hệ */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">10</span>
                  Liên Hệ
                </h2>
                <div className="bg-gray-50 rounded-lg p-6">
                  <p className="text-gray-600 mb-4">
                    Nếu bạn có bất kỳ câu hỏi hoặc thắc mắc nào về các Điều khoản sử dụng này, vui lòng liên hệ với chúng tôi:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="font-semibold text-gray-900">Hotline:</p>
                      <p className="text-gray-600">1900 6017</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Email:</p>
                      <p className="text-gray-600">hotline@cgv.vn</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Địa chỉ:</p>
                      <p className="text-gray-600">Lầu 2, 7/28 Thành Thái, Q.10, TP.HCM</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Website:</p>
                      <p className="text-gray-600">www.cgv.vn</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Last Updated */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <p className="text-center text-gray-500 text-sm">
                  Điều khoản sử dụng này được cập nhật lần cuối vào ngày 01/01/2024
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
