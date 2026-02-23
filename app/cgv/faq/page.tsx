'use client';

import React, { useState } from 'react';
import CGVHeader from '@/components/cgv/CGVHeader';
import CGVFooter from '@/components/cgv/CGVFooter';
import { 
  HelpCircle, 
  ChevronDown, 
  ChevronUp,
  Ticket,
  CreditCard,
  Users,
  Film,
  Popcorn,
  Phone,
  Mail,
  MessageCircle
} from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  // Đặt vé & Thanh toán
  {
    question: "Làm thế nào để đặt vé xem phim tại CGV?",
    answer: "Bạn có thể đặt vé qua 4 cách: 1) Trực tiếp tại website CGV, 2) Qua ứng dụng di động CGV, 3) Gọi hotline 1900 6017, 4) Đến trực tiếp quầy vé tại rạp. Đặt vé online giúp bạn chọn ghế tốt nhất và nhận nhiều ưu đãi.",
    category: "booking"
  },
  {
    question: "Các phương thức thanh toán nào được chấp nhận?",
    answer: "CGV chấp nhận: Thẻ tín dụng/ghi nợ (Visa, Mastercard, JCB), Ví điện tử (MoMo, ZaloPay, ShopeePay), Chuyển khoản ngân hàng, Tiền mặt tại quầy, CGV Cinemas Points.",
    category: "booking"
  },
  {
    question: "Tôi có thể hủy vé đã đặt không?",
    answer: "Vé đã đặt không thể hủy hoặc đổi. Tuy nhiên, bạn có thể chuyển nhượng vé cho người khác. Vui lòng kiểm tra kỹ thông tin phim và giờ chiếu trước khi xác nhận đặt vé.",
    category: "booking"
  },
  {
    question: "Làm thế nào để nhận vé đã đặt online?",
    answer: "Sau khi đặt vé thành công, bạn sẽ nhận email xác nhận chứa mã QR. Hãy đến rạp trước 15 phút suất chiếu, xuất trình mã QR tại quầy vé hoặc máy tự động để nhận vé giấy.",
    category: "booking"
  },
  
  // Giá vé & Khuyến mãi
  {
    question: "Giá vé CGV được tính như thế nào?",
    answer: "Giá vé phụ thuộc vào: 1) Loại ghế (Standard, VIP, Couple, ProVIP), 2) Thời gian chiếu (giờ thường, giờ vàng, cuối tuần), 3) Loại phim (2D, 3D, IMAX, 4DX), 4) Đối tượng (học sinh, sinh viên, người cao tuổi).",
    category: "pricing"
  },
  {
    question: "Làm thế nào để nhận khuyến mãi và giảm giá?",
    answer: "Đừng quên: 1) Đăng ký thành viên CGV, 2) Tải app CGV Cinemas, 3) Theo dõi fanpage Facebook, 4) Kiểm tra mục 'Ưu đãi' trên website, 5) Sử dụng thẻ thành viên để tích điểm và đổi quà.",
    category: "pricing"
  },
  {
    question: "CGV có các loại thẻ thành viên nào?",
    answer: "CGV có 3 loại thẻ: 1) Classic (miễn phí), 2) Silver (tích 200 điểm/năm), 3) Gold (tích 600 điểm/năm). Càng hạng cao, quyền lợi càng nhiều: giảm giá vé, bắp nước, sinh nhật đặc biệt...",
    category: "pricing"
  },
  
  // Sản phẩm & Dịch vụ
  {
    question: "Tôi có thể mang đồ ăn từ bên ngoài vào rạp không?",
    answer: "Theo quy định của CGV, khách hàng không được mang đồ ăn và nước uống từ bên ngoài vào rạp. CGV có đa dạng combo bắp nước với giá ưu đãi để phục vụ bạn.",
    category: "services"
  },
  {
    question: "Các loại phòng chiếu tại CGV có gì khác biệt?",
    answer: "CGV có nhiều loại phòng: Standard (phòng thường), IMAX (màn hình khổng lồ, âm thanh vòm), 4DX (ghế động, hiệu ứng đặc biệt), Gold Class (ghế sofa cao cấp, phục vụ tại chỗ), Studio (phòng nghệ thuật, phim độc lập).",
    category: "services"
  },
  {
    question: "CGV có dịch vụ tổ chức sinh nhật không?",
    answer: "Có! CGV có gói tổ chức sinh nhật tại rạp với: phòng chiếu riêng, trang trí, bánh kem, quà tặng, nhân viên hỗ trợ. Vui lòng liên hệ rạp gần nhất để được tư vấn chi tiết.",
    category: "services"
  },
  
  // Chính sách & Quy định
  {
    question: "Trẻ em bao nhiêu tuổi phải mua vé?",
    answer: "Trẻ em dưới 1m22 được miễn vé (kèm theo người lớn). Trẻ em từ 1m22 đến 1m3 mua vé trẻ em. Trẻ em trên 1m3 mua vé người lớn. Đối với phim 16+, 18+, tất cả khách hàng đều phải mua vé người lớn.",
    category: "policy"
  },
  {
    question: "Tôi có thể mang theo túi xách, balo vào rạp không?",
    answer: "Bạn có thể mang túi xách cá nhân kích thước bình thường. Với balo lớn hoặc hành lý, vui lòng gửi tại tủ giữ đồ. CGV có quyền kiểm tra túi xách để đảm bảo an ninh.",
    category: "policy"
  },
  {
    question: "Quy định về trang phục khi xem phim?",
    answer: "CGV yêu cầu khách hàng mặc trang phục lịch sự, gọn gàng. Không mặc đồ ngủ, đồ bơi, đồ quá ngắn hoặc quá hở. CGV có quyền từ chối phục vụ khách hàng không tuân thủ quy định.",
    category: "policy"
  },
  
  // Kỹ thuật & Sự cố
  {
    question: "Nếu phim bị hủy hoặc dừng đột ngột thì sao?",
    answer: "Nếu phim bị hủy trước khi chiếu, bạn sẽ được hoàn tiền 100% hoặc đổi vé cho suất chiếu khác. Nếu phim dừng giữa chừng, bạn sẽ được hoàn tiền tương ứng với thời gian chưa xem hoặc vé xem lại miễn phí.",
    category: "technical"
  },
  {
    question: "Làm thế nào nếu tôi bị mất vé?",
    answer: "Nếu mất vé giấy, hãy liên hệ ngay với quầy vé. Nếu bạn đặt vé online, có thể xuất hiện lại mã QR từ email hoặc ứng dụng. CGV không chịu trách nhiệm cho vé đã bị mất.",
    category: "technical"
  },
  {
    question: "Tại sao phim tôi muốn xem không có suất chiếu?",
    answer: "Phim có thể không chiếu vì: 1) Hết thời gian chiếu, 2) Không đủ lượt đặt, 3) Lịch chiếu thay đổi, 4) Phim bị cấm chiếu. Vui lòng kiểm tra lại lịch hoặc liên hệ rạp để biết thông tin chính xác.",
    category: "technical"
  },
  
  // Thành viên & Đặc quyền
  {
    question: "Làm thế nào để trở thành thành viên CGV?",
    answer: "Bạn chỉ cần đăng ký tài khoản trên website hoặc app CGV. Đăng ký hoàn toàn miễn phí và ngay lập tức trở thành thành viên Classic với nhiều quyền lợi.",
    category: "membership"
  },
  {
    question: "Điểm CGV Cinemas Points sử dụng như thế nào?",
    answer: "1000 points = 10.000 VNĐ. Bạn có thể dùng điểm để: 1) Trừ tiền khi đặt vé, 2) Đổi bắp nước miễn phí, 3) Đổi vé xem phim, 4) Đổi quà tặng từ đối tác CGV.",
    category: "membership"
  },
  {
    question: "Thành viên có những đặc quyền gì?",
    answer: "Thành viên được: 1) Tích điểm đổi quà, 2) Nhận ưu đãi độc quyền, 3) Mua vé trước 24h, 4) Sinh nhật đặc biệt, 5) Tham gia sự kiện riêng, 6) Nhận thông tin phim mới sớm nhất.",
    category: "membership"
  }
];

const categories = [
  { id: 'all', name: 'Tất cả', icon: HelpCircle },
  { id: 'booking', name: 'Đặt vé & Thanh toán', icon: Ticket },
  { id: 'pricing', name: 'Giá vé & Khuyến mãi', icon: CreditCard },
  { id: 'services', name: 'Sản phẩm & Dịch vụ', icon: Popcorn },
  { id: 'policy', name: 'Chính sách & Quy định', icon: Users },
  { id: 'technical', name: 'Kỹ thuật & Sự cố', icon: Film },
  { id: 'membership', name: 'Thành viên & Đặc quyền', icon: Users }
];

export default function FAQPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedItems, setExpandedItems] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFAQs = faqData.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleExpanded = (index: number) => {
    setExpandedItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const expandAll = () => {
    setExpandedItems(filteredFAQs.map((_, index) => index));
  };

  const collapseAll = () => {
    setExpandedItems([]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <CGVHeader />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-900 to-purple-900 text-white py-16">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="relative container mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <HelpCircle className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">Câu Hỏi Thường Gặp</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Tìm câu trả lời cho mọi thắc mắc của bạn về CGV
          </p>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Search Bar */}
            <div className="mb-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm câu hỏi của bạn..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <HelpCircle className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 justify-center mb-6">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full font-medium transition-colors flex items-center gap-2 ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <category.icon className="w-4 h-4" />
                  {category.name}
                </button>
              ))}
            </div>

            {/* Expand/Collapse All */}
            <div className="text-center">
              <button
                onClick={expandAll}
                className="text-blue-600 hover:text-blue-700 font-medium mr-4"
              >
                Mở tất cả
              </button>
              <button
                onClick={collapseAll}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Đóng tất cả
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Items */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {filteredFAQs.length === 0 ? (
              <div className="text-center py-12">
                <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Không tìm thấy câu hỏi nào
                </h3>
                <p className="text-gray-500">
                  Thử tìm kiếm với từ khóa khác hoặc chọn danh mục khác
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFAQs.map((item, index) => {
                  const actualIndex = faqData.indexOf(item);
                  const isExpanded = expandedItems.includes(actualIndex);
                  
                  return (
                    <div
                      key={actualIndex}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md"
                    >
                      <button
                        onClick={() => toggleExpanded(actualIndex)}
                        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <HelpCircle className="w-4 h-4 text-blue-600" />
                          </div>
                          <h3 className="font-semibold text-gray-900 pr-4">
                            {item.question}
                          </h3>
                        </div>
                        <div className="flex-shrink-0">
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </button>
                      
                      {isExpanded && (
                        <div className="px-6 pb-4 border-t border-gray-100">
                          <div className="pt-4 pl-11">
                            <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                              {item.answer}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Still Need Help */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Vẫn Cần Trợ Giúp?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Đội ngũ hỗ trợ CGV luôn sẵn sàng phục vụ bạn
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl p-6 text-center shadow-lg">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Hotline</h3>
              <p className="text-gray-600 mb-2">
                1900 6017
              </p>
              <p className="text-sm text-gray-500">
                8:00 - 22:00 hàng ngày
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 text-center shadow-lg">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Email</h3>
              <p className="text-gray-600 mb-2">
                hoidap@cgv.vn
              </p>
              <p className="text-sm text-gray-500">
                Phản hồi trong 24h
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 text-center shadow-lg">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Live Chat</h3>
              <p className="text-gray-600 mb-2">
                Trên website & app
              </p>
              <p className="text-sm text-gray-500">
                8:00 - 22:00 hàng ngày
              </p>
            </div>
          </div>
        </div>
      </section>

      <CGVFooter />
    </div>
  );
}
