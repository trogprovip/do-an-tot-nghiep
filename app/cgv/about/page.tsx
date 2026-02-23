'use client';

import React from 'react';
import CGVHeader from '@/components/cgv/CGVHeader';
import CGVFooter from '@/components/cgv/CGVFooter';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Star,
  Users,
  Film,
  Popcorn,
  Shield,
  Award,
  Heart,
  Target,
  Zap
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <CGVHeader />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-900 to-purple-900 text-white py-20">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="relative container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Về CGV Việt Nam</h1>
          <p className="text-xl max-w-3xl mx-auto leading-relaxed">
            Trải nghiệm điện ảnh đỉnh cao với công nghệ hiện đại và dịch vụ vượt trội
          </p>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                CGV - Trải Nghiệm Điện Ảnh Vượt Trội
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                CGV Việt Nam là chuỗi rạp chiếu phim hiện đại hàng đầu, mang đến trải nghiệm xem phim đỉnh cao 
                với công nghệ âm thanh hình ảnh tiên tiến và không gian tiện nghi.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Với hệ thống rạp trải dài khắp cả nước, CGV cam kết mang đến những bộ phim hay nhất, 
                dịch vụ chất lượng nhất và những khoảnh khắc đáng nhớ nhất cho khán giả.
              </p>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Film className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Phim Hay Mỗi Ngày</h3>
                    <p className="text-gray-600 text-sm">Cập nhật phim mới nhất</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Popcorn className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Đồ Ăn Đa Dạng</h3>
                    <p className="text-gray-600 text-sm">Bắp nước hấp dẫn</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
                <div className="grid grid-cols-2 gap-8">
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2">50+</div>
                    <div className="text-sm opacity-90">Rạp Chiếu Phim</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2">300+</div>
                    <div className="text-sm opacity-90">Phòng Chiếu</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2">10M+</div>
                    <div className="text-sm opacity-90">Khán Hàng</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2">15+</div>
                    <div className="text-sm opacity-90">Năm Kinh Nghiệm</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Dịch Vụ Của Chúng Tôi</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Mang đến trải nghiệm điện ảnh hoàn hảo với các dịch vụ đa dạng
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <Star className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">CGV IMAX</h3>
              <p className="text-gray-600 leading-relaxed">
                Công nghệ màn hình khổng lồ với âm thanh vòm mạnh mẽ, mang đến trải nghiệm xem phim 
                sống động và chân thực như never before.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gold-100 rounded-full flex items-center justify-center mb-6">
                <Award className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">CGV Gold Class</h3>
              <p className="text-gray-600 leading-relaxed">
                Không gian riêng tư với ghế sofa cao cấp, dịch vụ phục vụ tận nơi và những tiện ích 
                đẳng cấp dành cho khách hàng VIP.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">CGV Sweetbox</h3>
              <p className="text-gray-600 leading-relaxed">
                Thương hiệu combo bắp nước độc quyền với nhiều lựa chọn đa dạng, 
                mang lại trải nghiệm ẩm thực tuyệt vời khi xem phim.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Giá Trị Cốt Lõi</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Những nguyên tắc định hình nên CGV Việt Nam
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Đam Mê</h3>
              <p className="text-gray-600">
                Đam mê điện ảnh và cam kết mang đến trải nghiệm tốt nhất
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Chất Lượng</h3>
              <p className="text-gray-600">
                Luôn đặt chất lượng lên hàng đầu trong mọi dịch vụ
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Đổi Mới</h3>
              <p className="text-gray-600">
                Liên tục đổi mới để mang đến trải nghiệm đột phá
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Uy Tín</h3>
              <p className="text-gray-600">
                Xây dựng niềm tin và sự hài lòng của khách hàng
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Liên Hệ Với Chúng Tôi</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Hãy kết nối với CGV để nhận thông tin phim mới và ưu đãi hấp dẫn
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-xl p-6 text-center shadow-lg">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Địa Chỉ</h3>
              <p className="text-gray-600">
                123 Nguyễn Huệ, Q.1<br />
                TP. Hồ Chí Minh
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 text-center shadow-lg">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Điện Thoại</h3>
              <p className="text-gray-600">
                Hotline: 1900 1234<br />
                CSKH: 1900 5678
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 text-center shadow-lg">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Email</h3>
              <p className="text-gray-600">
                info@cgv.vn<br />
                support@cgv.vn
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 text-center shadow-lg">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Giờ Mở Cửa</h3>
              <p className="text-gray-600">
                Thứ 2 - CN: 8:00 - 23:00<br />
                Chiếu phim đến 24:00
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-900 to-purple-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Sẵn Sàng Trải Nghiệm Điện Ảnh Đỉnh Cao?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Đặt vé ngay hôm nay để tận hưởng những bộ phim hay nhất với công nghệ hiện đại nhất
          </p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => window.location.href = '/cgv/movies'}
              className="px-8 py-4 bg-white text-blue-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Đặt Vé Ngay
            </button>
            <button 
              onClick={() => window.location.href = '/cgv/movies?status=now_showing'}
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-blue-900 transition-colors"
            >
              Xem Phim Đang Chiếu
            </button>
          </div>
        </div>
      </section>

      <CGVFooter />
    </div>
  );
}
