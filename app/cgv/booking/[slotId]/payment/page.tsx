/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Spin, Card, Button, Alert, Divider, Typography, Space, Tag } from 'antd';
import { 
  CreditCardOutlined, 
  BankOutlined, 
  MobileOutlined, 
  QrcodeOutlined,
  ClockCircleOutlined,
  CheckCircleFilled,
  InfoCircleOutlined
} from '@ant-design/icons';
import CGVHeader from '@/components/cgv/CGVHeader';
import CGVFooter from '@/components/cgv/CGVFooter';

const { Title, Text } = Typography;

interface BookingData {
  slotId: string;
  selectedSeats: number[];
  seats: string[];
  totalPrice: number;
  movieTitle: string;
  cinema: string;
  room: string;
  time: string;
  date: string;
  poster: string;
}

interface ComboData {
  combos: Array<{
    product: {
      id: number;
      product_name: string;
      price: number;
    };
    quantity: number;
  }>;
  comboTotal: number;
}

export default function PaymentPage({ params }: { params: Promise<{ slotId: string }> }) {
  const router = useRouter();
  const [slotId, setSlotId] = useState<string>('');
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [comboData, setComboData] = useState<ComboData | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<string>('credit_card');
  const [countdown, setCountdown] = useState<number>(300); // 5 minutes = 300 seconds
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [ticketCode, setTicketCode] = useState<string>('');
  const [isExpired, setIsExpired] = useState<boolean>(false);

  const loadData = (id: string) => {
    const booking = sessionStorage.getItem(`booking_${id}`);
    const combo = sessionStorage.getItem(`combo_${id}`);
    
    if (booking) {
      setBookingData(JSON.parse(booking));
    }
    if (combo) {
      setComboData(JSON.parse(combo));
    }
    setLoading(false);
  };

  const handleTimeout = useCallback(() => {
    setIsExpired(true);
    // Clear session storage
    sessionStorage.removeItem(`booking_${slotId}`);
    sessionStorage.removeItem(`combo_${slotId}`);
    // Ta không auto redirect ngay để người dùng thấy thông báo lỗi rõ ràng hơn
  }, [slotId]);

  useEffect(() => {
    params.then(p => {
      setSlotId(p.slotId);
      loadData(p.slotId);
    });
  }, [params]);

  useEffect(() => {
    if (countdown > 0 && !isExpired) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !isExpired) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      handleTimeout();
    }
  }, [countdown, isExpired, handleTimeout]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTotalAmount = () => {
    const seatTotal = bookingData?.totalPrice || 0;
    const comboTotal = comboData?.comboTotal || 0;
    return seatTotal + comboTotal;
  };

  const handlePayment = async () => {
    try {
      // Get auth token
      const token = localStorage.getItem('auth_token');
      console.log('Token from localStorage:', token ? 'exists' : 'not found');
      
      if (!token) {
        alert('Bạn cần đăng nhập để đặt vé');
        router.push('/auth/login');
        return;
      }

      // Handle VNPay payment
      if (paymentMethod === 'qr_code') {
        const totalAmount = getTotalAmount();

        try {
          // 1️⃣ Tạo booking với status pending trước
          const bookingResponse = await createPendingBooking();
          
          if (!bookingResponse.success) {
            alert('Không thể tạo đơn hàng, vui lòng thử lại');
            return;
          }

          const bookingId = bookingResponse.data.id;
          const orderId = `BOOKING_${bookingId}`;

          // 2️⃣ Gọi VNPay với booking ID
          const response = await fetch('/api/payment/vnpay/create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              amount: totalAmount,
              orderId: orderId,
              orderInfo: `Thanh toan ve xem phim - Booking ID: ${bookingId}`,
            }),
          });

          const result = await response.json();
          console.log("result payment", result);

          if (response.ok && result.success) {
            // 3️⃣ Redirect đến VNPay
            setTimeout(() => {
              window.location.href = result.paymentUrl;
            }, 100);
            console.log(result.paymentUrl);
          } else {
            // Nếu VNPay thất bại, cập nhật booking status thành failed
            await updateBookingStatus(bookingId, 'cancelled', 'failed');
            alert(result.error || 'Tạo thanh toán VNPay thất bại');
          }
        } catch (error) {
          console.error('VNPay payment error:', error);
          alert('Có lỗi xảy ra khi tạo thanh toán VNPay');
        }
        return;
      }

      // Fetch slot and seat information to calculate accurate prices
      let selectedSeatsWithPrices: Array<{seat_id: number; seat_price: number}> = [];
      
      if (bookingData?.selectedSeats && bookingData.selectedSeats.length > 0) {
        try {
          // Fetch slot info to get base price
          const slotRes = await fetch(`/api/slots/${slotId}`);
          const slotData = await slotRes.json();
          const basePrice = slotData.price || 0;

          // Fetch seats for this room to get seat types and multipliers
          const seatsRes = await fetch(`/api/seats?room_id=${slotData.rooms?.id}`);
          const seatsData = await seatsRes.json();
          const allSeats = seatsData.content || [];

          // Calculate price for each selected seat
          selectedSeatsWithPrices = bookingData.selectedSeats.map(seatId => {
            const seat = allSeats.find((s: any) => s.id === seatId);
            const multiplier = seat?.seattypes?.price_multiplier || 1;
            const seatPrice = Math.round(basePrice * multiplier);
            return {
              seat_id: seatId,
              seat_price: seatPrice
            };
          });
        } catch (error) {
          console.error('Error fetching seat pricing:', error);
          // Fallback: distribute total price evenly
          selectedSeatsWithPrices = bookingData.selectedSeats.map(seatId => ({
            seat_id: seatId,
            seat_price: Math.round((bookingData?.totalPrice || 0) / (bookingData?.selectedSeats.length || 1))
          }));
        }
      }

      const bookingRequest = {
        slotId: parseInt(slotId),
        selectedSeats: selectedSeatsWithPrices,
        combos: comboData?.combos.map(combo => ({
          product_id: combo.product.id,
          quantity: combo.quantity,
          unit_price: combo.product.price,
          total_price: combo.product.price * combo.quantity,
        })) || [],
        totalAmount: getTotalAmount(),
        finalAmount: getTotalAmount(),
      };

      // Call booking API
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(bookingRequest),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Clear session storage
        sessionStorage.removeItem(`booking_${slotId}`);
        sessionStorage.removeItem(`combo_${slotId}`);
        
        // Show success modal
        setTicketCode(result.data.tickets_code);
        setShowSuccessModal(true);
      } else {
        alert(result.error || 'Đặt vé thất bại, vui lòng thử lại');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Có lỗi xảy ra, vui lòng thử lại');
    }
  };

  // Helper function để tạo booking pending
  const createPendingBooking = async () => {
    try {
      // Fetch slot and seat information to calculate accurate prices
      let selectedSeatsWithPrices: Array<{seat_id: number; seat_price: number}> = [];
      
      if (bookingData?.selectedSeats && bookingData.selectedSeats.length > 0) {
        try {
          // Fetch slot info to get base price
          const slotRes = await fetch(`/api/slots/${slotId}`);
          const slotData = await slotRes.json();
          const basePrice = slotData.price || 0;

          // Fetch seats for this room to get seat types and multipliers
          const seatsRes = await fetch(`/api/seats?room_id=${slotData.rooms?.id}`);
          const seatsData = await seatsRes.json();
          const allSeats = seatsData.content || [];

          // Calculate price for each selected seat
          selectedSeatsWithPrices = bookingData.selectedSeats.map(seatId => {
            const seat = allSeats.find((s: any) => s.id === seatId);
            const multiplier = seat?.seattypes?.price_multiplier || 1;
            const seatPrice = Math.round(basePrice * multiplier);
            return {
              seat_id: seatId,
              seat_price: seatPrice
            };
          });
        } catch (error) {
          console.error('Error fetching seat pricing:', error);
          // Fallback: distribute total price evenly
          selectedSeatsWithPrices = bookingData.selectedSeats.map(seatId => ({
            seat_id: seatId,
            seat_price: Math.round((bookingData?.totalPrice || 0) / (bookingData?.selectedSeats.length || 1))
          }));
        }
      }

      const bookingRequest = {
        slotId: parseInt(slotId),
        selectedSeats: selectedSeatsWithPrices,
        combos: comboData?.combos.map(combo => ({
          product_id: combo.product.id,
          quantity: combo.quantity,
          unit_price: combo.product.price,
          total_price: combo.product.price * combo.quantity,
        })) || [],
        totalAmount: getTotalAmount(),
        finalAmount: getTotalAmount(),
        // Force pending status for VNPay
        status: 'pending',
        payment_status: 'unpaid'
      };

      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(bookingRequest),
      });

      return await response.json();
    } catch (error) {
      console.error('Error creating pending booking:', error);
      return { success: false, error: 'Không thể tạo đơn hàng' };
    }
  };

  // Helper function để cập nhật booking status
  const updateBookingStatus = async (bookingId: number, status: string, paymentStatus?: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: status,
          payment_status: paymentStatus
        }),
      });

      return await response.json();
    } catch (error) {
      console.error('Error updating booking status:', error);
      return { success: false };
    }
  };

  const paymentMethods = [
    {
      key: 'credit_card',
      label: 'Thẻ Quốc Tế',
      icon: <CreditCardOutlined />,
      description: 'Visa, Mastercard, JCB'
    },
    {
      key: 'bank_transfer',
      label: 'ATM Nội Địa',
      icon: <BankOutlined />,
      description: 'Internet Banking'
    },
    {
      key: 'mobile_banking',
      label: 'Ví Điện Tử',
      icon: <MobileOutlined />,
      description: 'MoMo, ZaloPay, ShopeePay'
    },
    {
      key: 'qr_code',
      label: 'Quét Mã QR',
      icon: <QrcodeOutlined />,
      description: 'VNPay, VietQR'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <CGVHeader />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <Spin size="large" />
          <Text type="secondary">Đang tải dữ liệu thanh toán...</Text>
        </div>
        <CGVFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfcf0]"> {/* Nền kem nhẹ đặc trưng của CGV */}
      <CGVHeader />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Tiêu đề & Countdown */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 border-b-2 border-black pb-4">
          <Title level={2} className="!m-0 !font-serif italic tracking-wider">THANH TOÁN</Title>
          <div className={`flex items-center gap-3 px-6 py-2 rounded-full shadow-inner ${countdown < 60 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-700'}`}>
            <ClockCircleOutlined className={countdown < 60 ? 'animate-pulse' : ''} />
            <span className="font-mono font-bold text-xl uppercase">Thời gian giữ vé: {formatTime(countdown)}</span>
          </div>
        </div>

        {isExpired ? (
          <div className="max-w-2xl mx-auto py-20 text-center">
            <Alert
              message="Hết thời gian thanh toán"
              description="Phiên giao dịch của bạn đã hết hạn sau 5 phút. Vui lòng quay lại trang chọn ghế."
              type="error"
              showIcon
              className="mb-6 py-4 shadow-lg"
            />
            <Button type="primary" size="large" danger onClick={() => router.push('/')}>
              Về trang chủ
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Cột trái: Phương thức thanh toán (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold">1</div>
                  <Title level={4} className="!m-0 uppercase">Phương thức thanh toán</Title>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.key}
                      onClick={() => setPaymentMethod(method.key)}
                      className={`relative cursor-pointer p-5 rounded-xl border-2 transition-all duration-300 shadow-sm ${
                        paymentMethod === method.key 
                        ? 'border-red-600 bg-red-50' 
                        : 'border-gray-200 bg-white hover:border-red-300'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`text-3xl ${paymentMethod === method.key ? 'text-red-600' : 'text-gray-400'}`}>
                          {method.icon}
                        </div>
                        <div>
                          <Text strong className="block text-lg">{method.label}</Text>
                          <Text type="secondary" className="text-sm">{method.description}</Text>
                        </div>
                      </div>
                      {paymentMethod === method.key && (
                        <CheckCircleFilled className="absolute top-3 right-3 text-red-600 text-xl" />
                      )}
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold">2</div>
                  <Title level={4} className="!m-0 uppercase">Chi tiết thanh toán</Title>
                </div>

                <div className="min-h-[200px] flex items-center justify-center">
                  {paymentMethod === 'credit_card' && (
                    <div className="w-full max-w-md space-y-4 animate-fadeIn">
                      <input className="w-full p-4 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none" placeholder="Số thẻ (Card Number)" />
                      <div className="flex gap-4">
                        <input className="w-1/2 p-4 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none" placeholder="MM/YY" />
                        <input className="w-1/2 p-4 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none" placeholder="CVV" />
                      </div>
                      <input className="w-full p-4 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none uppercase" placeholder="Tên chủ thẻ (Viết liền không dấu)" />
                    </div>
                  )}

                  {paymentMethod === 'bank_transfer' && (
                    <div className="bg-blue-50 p-6 rounded-xl border-2 border-dashed border-blue-200 text-center w-full max-w-md animate-fadeIn">
                      <Title level={4} className="!text-blue-800 !m-0">CGV CINEMA VIETNAM</Title>
                      <Divider className="my-3 border-blue-200" />
                      <div className="space-y-1">
                        <p className="text-gray-600 uppercase text-xs tracking-widest">Số tài khoản</p>
                        <p className="text-2xl font-black text-blue-900">8166666829999</p>
                        <p className="font-bold">Ngân Hàng MBBank</p>
                      </div>
                      <div className="mt-4 p-3 bg-white rounded-lg">
                        <Text type="secondary" className="text-xs">Nội dung chuyển khoản:</Text>
                        <p className="font-bold text-red-600 uppercase">PAY {slotId}</p>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'qr_code' && (
                    <div className="text-center animate-fadeIn">
                      <div className="bg-blue-50 p-6 rounded-xl border-2 border-dashed border-blue-200 text-center w-full max-w-md mb-4">
                        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="text-white font-bold text-2xl">V</span>
                        </div>
                        <Title level={4} className="!text-blue-800 !m-0 mb-4">Thanh Toán VNPay</Title>
                        <div className="space-y-3 text-left">
                          <div className="flex items-center gap-3">
                            <CheckCircleFilled className="text-green-600" />
                            <Text className="text-sm">An toàn và bảo mật</Text>
                          </div>
                          <div className="flex items-center gap-3">
                            <CheckCircleFilled className="text-green-600" />
                            <Text className="text-sm">Hỗ trợ nhiều ngân hàng</Text>
                          </div>
                          <div className="flex items-center gap-3">
                            <CheckCircleFilled className="text-green-600" />
                            <Text className="text-sm">Xác nhận tức thì</Text>
                          </div>
                        </div>
                        <div className="mt-4 p-3 bg-white rounded-lg">
                          <Text type="secondary" className="text-xs">Số tiền:</Text>
                          <p className="font-bold text-red-600 text-lg">{getTotalAmount().toLocaleString('vi-VN')}đ</p>
                        </div>
                      </div>
                      
                      <Button 
                        type="primary" 
                        size="large"
                        className="w-full bg-blue-600 hover:bg-blue-700 h-12 font-semibold"
                        onClick={handlePayment}
                      >
                        Thanh toán qua VNPay
                      </Button>
                    </div>
                  )}

                  {paymentMethod === 'mobile_banking' && (
                    <div className="flex justify-center gap-8 py-8 animate-fadeIn">
                      {['MoMo', 'ZaloPay', 'ShopeePay'].map((name, i) => (
                        <div key={i} className="group flex flex-col items-center gap-3 cursor-pointer">
                          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-xs transition-transform group-hover:scale-110 shadow-lg ${
                            name === 'MoMo' ? 'bg-[#ae2070]' : name === 'ZaloPay' ? 'bg-[#0081c6]' : 'bg-[#ee4d2d]'
                          }`}>
                            {name}
                          </div>
                          <Text strong className="group-hover:text-red-600 transition-colors">{name}</Text>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* Cột phải: Thông tin đơn hàng (4 cols) */}
            <div className="lg:col-span-4">
              <div className="sticky top-6">
                  <Card 
                  className="shadow-2xl border-none overflow-hidden" 
                    styles={{ body: { padding: 0 } }}
                    >
                  <div className="bg-black p-4 text-white">
                    <Title level={5} className="text-white m-0 uppercase tracking-widest text-center">Tóm tắt đơn hàng</Title>
                  </div>
                  
                  <div className="p-6 space-y-4 bg-white">
                    {/* Thông tin Phim */}
                    {bookingData && (
                      <div className="flex gap-4">
                        <img 
                          src={bookingData.poster} 
                          alt="Movie Poster" 
                          className="w-24 h-36 object-cover rounded shadow-lg border-2 border-white" 
                        />
                        <div className="flex-1">
                          <Title level={5} className="!mb-1 leading-tight line-clamp-2 uppercase font-bold">{bookingData.movieTitle}</Title>
                          <Text type="secondary" className="text-xs block mb-2">{bookingData.cinema}</Text>
                          <div className="space-y-1">
                             <Tag color="black" className="font-bold">Phòng {bookingData.room}</Tag>
                             <div className="text-xs font-bold text-gray-700 mt-1">{bookingData.time} | {bookingData.date}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    <Divider className="my-2" />

                    {/* Danh sách ghế & Combo */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Text className="text-gray-500">Ghế ({bookingData?.seats.length})</Text>
                        <Text strong className="text-red-600">{bookingData?.seats.join(', ')}</Text>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <Text className="text-gray-500">Giá ghế</Text>
                        <Text strong className="text-red-600">{(bookingData?.totalPrice || 0).toLocaleString('vi-VN')}đ</Text>
                      </div>
                      
                      {comboData && comboData.combos.length > 0 && (
                        <div className="space-y-2 pt-2">
                          <Text type="secondary" className="block uppercase text-[10px] tracking-widest font-bold">Combo đã chọn:</Text>
                          {comboData.combos.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm italic">
                              <Text>{item.product.product_name} x{item.quantity}</Text>
                              <Text>{(item.product.price * item.quantity).toLocaleString('vi-VN')}đ</Text>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <Divider className="my-2" />

                    {/* Tổng tiền */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex justify-between items-center">
                      <div className="flex flex-col">
                        <Text className="text-xs text-gray-400 uppercase font-bold">Tổng thanh toán</Text>
                        <Text className="text-3xl font-black text-red-600">
                          {getTotalAmount().toLocaleString('vi-VN')}đ
                        </Text>
                      </div>
                    </div>

                    <Button 
                      type="primary" 
                      block 
                      size="large"
                      className="h-16 bg-[#e71a0f] hover:bg-black border-none text-xl font-black shadow-xl uppercase transition-all duration-300"
                      onClick={handlePayment}
                    >
                      Thanh toán ngay
                    </Button>
                    
                    <p className="text-[10px] text-gray-400 text-center uppercase tracking-tight leading-relaxed italic mt-4">
                      Vui lòng kiểm tra kỹ thông tin. Vé đã mua không thể đổi trả hoặc hủy.
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}
      </main>

      <CGVFooter />

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50z">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 text-center transform scale-100 animate-fadeIn">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircleFilled className="text-5xl text-green-600" />
            </div>
            
            <Title level={2} className="!mb-4 text-green-600">🎉 Đặt Vé Thành Công!</Title>
            
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <Text className="text-gray-600 block mb-2">Mã vé của bạn:</Text>
              <div className="bg-red-600 text-white px-4 py-3 rounded-lg font-mono font-bold text-xl tracking-wider">
                {ticketCode}
              </div>
            </div>
            
            <div className="space-y-3 mb-6 text-left">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <Text className="text-sm">Vé đã được xác nhận và lưu vào hệ thống</Text>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <Text className="text-sm">Bạn có thể sử dụng mã vé để check-in tại rạp</Text>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <Text className="text-sm">Vui lòng đến rạp trước 15 phút suất chiếu</Text>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                size="large" 
                className="flex-1"
                onClick={() => router.push('/')}
              >
                Về Trang Chủ
              </Button>
              <Button 
                type="primary" 
                size="large" 
                className="flex-1 bg-red-600 hover:bg-red-700"
                onClick={() => {
                  setShowSuccessModal(false);
                  router.push('/');
                }}
              >
                Đặt Vé Tiếp
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Animation đơn giản */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}