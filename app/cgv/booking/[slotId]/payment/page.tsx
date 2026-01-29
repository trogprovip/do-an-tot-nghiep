/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Spin, Card, Button, Alert, Divider, Typography, Tag, message } from 'antd';
import { 
  QrcodeOutlined,
  ClockCircleOutlined,
  CheckCircleFilled,
  GiftOutlined,
  CloseOutlined
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
  const [paymentMethod] = useState<string>('vnpay');
  const [countdown, setCountdown] = useState<number>(300); // 5 minutes = 300 seconds
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [ticketCode, setTicketCode] = useState<string>('');
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
  const [userVouchers, setUserVouchers] = useState<any[]>([]);
  const [showVoucherModal, setShowVoucherModal] = useState<boolean>(false);
  const [loadingVouchers, setLoadingVouchers] = useState<boolean>(false);

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
    const baseTotal = seatTotal + comboTotal;
    
    // Apply voucher discount if available
    if (appliedVoucher) {
      if (appliedVoucher.discount_type === 'percentage') {
        return baseTotal * (1 - appliedVoucher.discount_value / 100);
      } else if (appliedVoucher.discount_type === 'fixed_amount') {
        return Math.max(0, baseTotal - appliedVoucher.discount_value);
      }
    }
    
    return baseTotal;
  };

  const getDiscountAmount = () => {
    const seatTotal = bookingData?.totalPrice || 0;
    const comboTotal = comboData?.comboTotal || 0;
    const baseTotal = seatTotal + comboTotal;
    
    if (appliedVoucher) {
      if (appliedVoucher.discount_type === 'percentage') {
        return baseTotal * (appliedVoucher.discount_value / 100);
      } else if (appliedVoucher.discount_type === 'fixed_amount') {
        return Math.min(baseTotal, appliedVoucher.discount_value);
      }
    }
    
    return 0;
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    message.info('Đã xóa voucher');
  };

  // Fetch user vouchers
  const fetchUserVouchers = async () => {
    setLoadingVouchers(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/user/vouchers', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Filter only valid (not expired) vouchers
        const validVouchers = result.data.filter((voucher: any) => 
          new Date(voucher.expired_at) >= new Date()
        );
        setUserVouchers(validVouchers);
      } else {
        console.error('Failed to fetch vouchers:', result.error);
        setUserVouchers([]);
      }
    } catch (error) {
      console.error('Error fetching user vouchers:', error);
      setUserVouchers([]);
    } finally {
      setLoadingVouchers(false);
    }
  };

  // Handle selecting voucher from modal
  const handleSelectVoucher = (voucher: any) => {
    setAppliedVoucher(voucher);
    setShowVoucherModal(false);
    message.success(`Áp dụng voucher thành công! Giảm ${voucher.discount_value}${voucher.discount_type === 'percentage' ? '%' : 'đ'}`);
  };

  // Load vouchers when component mounts
  useEffect(() => {
    if (slotId) {
      fetchUserVouchers();
    }
  }, [slotId]);

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
      if (paymentMethod === 'vnpay') {
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
        discountAmount: getDiscountAmount(),
        finalAmount: getTotalAmount(),
        // Force pending status for VNPay
        status: 'pending',
        payment_status: 'unpaid',
        // Add voucher information if applied
        ...(appliedVoucher && {
          voucher_id: appliedVoucher.id,
          promotion_code: appliedVoucher.promotion_code,
        })
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
            {/* Cột trái: Thanh toán VNPay (8 cols) */}
            <div className="lg:col-span-8">
              <section className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-gray-100">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-xl flex items-center justify-center font-bold shadow-md">
                    <QrcodeOutlined className="text-xl" />
                  </div>
                  <div>
                    <Title level={3} className="!m-0 !mb-1">Thanh Toán VNPay</Title>
                    <Text type="secondary" className="text-sm">An toàn - Nhanh chóng - Tiện lợi</Text>
                  </div>
                </div>

                <div className="max-w-2xl mx-auto">
                  {/* VNPay Logo & Info */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl mb-6 border-2 border-blue-200">
                    <div className="flex items-center justify-center mb-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-xl">
                        <span className="text-white font-black text-3xl">V</span>
                      </div>
                    </div>
                    
                    <Title level={3} className="!text-blue-900 !m-0 mb-6 text-center font-bold">VNPay - Cổng Thanh Toán Quốc Gia</Title>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-white p-4 rounded-xl text-center shadow-sm">
                        <CheckCircleFilled className="text-green-600 text-2xl mb-2" />
                        <Text strong className="block text-sm">An toàn & Bảo mật</Text>
                        <Text className="text-xs text-gray-500">Mã hóa 256-bit</Text>
                      </div>
                      <div className="bg-white p-4 rounded-xl text-center shadow-sm">
                        <CheckCircleFilled className="text-green-600 text-2xl mb-2" />
                        <Text strong className="block text-sm">Đa dạng ngân hàng</Text>
                        <Text className="text-xs text-gray-500">50+ ngân hàng</Text>
                      </div>
                      <div className="bg-white p-4 rounded-xl text-center shadow-sm">
                        <CheckCircleFilled className="text-green-600 text-2xl mb-2" />
                        <Text strong className="block text-sm">Xác nhận tức thì</Text>
                        <Text className="text-xs text-gray-500">Thanh toán nhanh</Text>
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl shadow-sm">
                      <div className="flex justify-between items-center mb-2">
                        <Text className="text-gray-600 font-medium">Số tiền thanh toán:</Text>
                        <Text className="text-3xl font-black text-red-600">
                          {getTotalAmount().toLocaleString('vi-VN')}đ
                        </Text>
                      </div>
                      <Divider className="my-3" />
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                          <span>Hỗ trợ: ATM nội địa, Visa, Mastercard, JCB</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                          <span>Ví điện tử: MoMo, ZaloPay, ShopeePay</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                          <span>Quét mã QR thanh toán nhanh</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Button */}
                  <Button 
                    type="primary" 
                    size="large"
                    block
                    className="h-16 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-none text-xl font-bold shadow-xl uppercase transition-all duration-300 hover:shadow-2xl"
                    onClick={handlePayment}
                    icon={<QrcodeOutlined className="text-2xl" />}
                  >
                    Thanh toán qua VNPay
                  </Button>
                  
                  <div className="mt-4 text-center">
                    <Text className="text-xs text-gray-500">
                      Bạn sẽ được chuyển đến cổng thanh toán VNPay để hoàn tất giao dịch
                    </Text>
                  </div>
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

                    {/* Mã khuyến mại */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <GiftOutlined className="text-red-600" />
                        <Text strong className="text-gray-900">Mã khuyến mại</Text>
                      </div>
                      
                      {!appliedVoucher ? (
                        <div className="space-y-2">
                          <button
                            onClick={() => setShowVoucherModal(true)}
                            className="w-full py-3 border-2 border-dashed border-red-300 rounded-lg hover:border-red-500 hover:bg-red-50 transition-all flex items-center justify-center gap-2 group"
                          >
                            <GiftOutlined className="text-red-600 group-hover:scale-110 transition-transform" />
                            <Text className="text-red-600 font-medium">Chọn Voucher Khuyến Mại</Text>
                          </button>
                          
                          {userVouchers.length > 0 && (
                            <Text className="text-xs text-gray-500 text-center">
                              Bạn có {userVouchers.length} voucher sẵn sàng sử dụng
                            </Text>
                          )}
                        </div>
                      ) : (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <CheckCircleFilled className="text-green-600 text-sm" />
                                <Text strong className="text-green-800 text-sm">{appliedVoucher.title}</Text>
                              </div>
                              <Text className="text-xs text-gray-600">{appliedVoucher.description}</Text>
                              <div className="mt-1">
                                <Text className="text-xs text-green-700 font-medium">
                                  Giảm {appliedVoucher.discount_value}{appliedVoucher.discount_type === 'percentage' ? '%' : 'đ'}
                                </Text>
                              </div>
                            </div>
                            <button
                              onClick={handleRemoveVoucher}
                              className="text-gray-400 hover:text-red-600 transition-colors p-1"
                            >
                              <CloseOutlined className="text-sm" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Hiển thị giảm giá nếu có */}
                    {appliedVoucher && (
                      <div className="flex justify-between items-center bg-red-50 p-3 rounded-lg">
                        <Text className="text-sm text-gray-600">Giảm giá:</Text>
                        <Text className="text-sm font-bold text-red-600">
                          -{getDiscountAmount().toLocaleString('vi-VN')}đ
                        </Text>
                      </div>
                    )}

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

      {/* Voucher Selection Modal */}
      {showVoucherModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="bg-red-600 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GiftOutlined className="text-xl" />
                  <Title level={4} className="!m-0 text-white">Chọn Voucher</Title>
                </div>
                <button
                  onClick={() => setShowVoucherModal(false)}
                  className="text-white/80 hover:text-white transition-colors p-1"
                >
                  <CloseOutlined className="text-xl" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {loadingVouchers ? (
                <div className="flex items-center justify-center py-12">
                  <Spin size="large" />
                  <Text className="ml-3">Đang tải voucher...</Text>
                </div>
              ) : userVouchers.length === 0 ? (
                <div className="text-center py-12">
                  <GiftOutlined className="text-6xl text-gray-300 mb-4" />
                  <Text className="text-gray-500 text-lg">Bạn chưa có voucher nào</Text>
                  <Text className="text-gray-400 text-sm mt-2">Săn mã khuyến mại để nhận ưu đãi!</Text>
                </div>
              ) : (
                <div className="space-y-3">
                  {userVouchers.map((voucher) => (
                    <div
                      key={voucher.id}
                      className="border border-gray-200 rounded-xl p-4 hover:border-red-300 hover:shadow-md transition-all cursor-pointer"
                      onClick={() => handleSelectVoucher(voucher)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-bold">
                              {voucher.discount_type === 'percentage' ? `${voucher.discount_value}%` : `${voucher.discount_value}đ`}
                            </div>
                            <Text strong className="text-gray-900">{voucher.title}</Text>
                          </div>
                          <Text className="text-sm text-gray-600 mb-2">{voucher.description}</Text>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Mã: {voucher.code}</span>
                            <span>Hết hạn: {new Date(voucher.expired_at).toLocaleDateString('vi-VN')}</span>
                          </div>
                        </div>
                        <div className="bg-red-50 text-red-600 px-3 py-2 rounded-lg">
                          <Text className="text-sm font-bold">Chọn</Text>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <button
                onClick={() => setShowVoucherModal(false)}
                className="w-full py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Đóng
              </button>
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