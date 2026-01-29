'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CGVHeader from '@/components/cgv/CGVHeader';
import CGVFooter from '@/components/cgv/CGVFooter';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Seat {
  id: number;
  seat_row: string;
  seat_number: number;
  seat_type_id: number;
  status: string;
  room_id: number;
  seattypes: {
    id: number;
    type_name: string;
    price_multiplier: number;
  };
}

interface Slot {
  id: number;
  show_time: string;
  end_time: string;
  price: number;
  empty_seats: number;
  movies: {
    id: number;
    title: string;
    duration: number;
    poster_url: string;
  };
  rooms: {
    id: number;
    room_name: string;
    cinemas: {
      id: number;
      cinema_name: string;
      address: string;
    };
  };
}

interface Product {
  id: number;
  product_name: string;
  category: string;
  description: string | null;
  price: number;
  image_url: string | null;
}

interface ProductItem {
  product: Product;
  quantity: number;
}

export default function BookingPage({ params }: { params: Promise<{ slotId: string }> }) {
  const router = useRouter();
  const [slotId, setSlotId] = useState<string>('');
  const [slot, setSlot] = useState<Slot | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<ProductItem[]>([]);

  useEffect(() => {
    params.then(p => setSlotId(p.slotId));
  }, [params]);

  useEffect(() => {
    if (slotId) {
      fetchBookingData();
      fetchProducts();
    }
  }, [slotId]);

  const fetchBookingData = async () => {
    try {
      setLoading(true);
      
      // Fetch slot info
      const slotRes = await fetch(`/api/slots/${slotId}`);
      const slotData = await slotRes.json();
      setSlot(slotData);

      // Fetch seats for this room
      const seatsRes = await fetch(`/api/seats?room_id=${slotData.rooms.id}`);
      const seatsData = await seatsRes.json();
      console.log('🔍 Seats API response:', seatsData);
      console.log('🔍 Seats content:', seatsData.content);
      setSeats(seatsData.content || []);
    } catch (error) {
      console.error('Error fetching booking data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${hours}:${minutes}, ${day}/${month}/${year}`;
  };

  const toggleSeat = (seatId: number, status: string) => {
    if (status !== 'active') return;
    
    const seat = seats.find(s => s.id === seatId);
    if (!seat) return;
    
    setSelectedSeats(prev => {
      if (prev.includes(seatId)) {
        return prev.filter(id => id !== seatId);
      } else {
        // Check if selecting different seat type
        if (prev.length > 0) {
          const firstSelectedSeat = seats.find(s => s.id === prev[0]);
          if (firstSelectedSeat && firstSelectedSeat.seattypes.id !== seat.seattypes.id) {
            alert(`Vui lòng chọn cùng loại ghế! Bạn đã chọn ghế ${firstSelectedSeat.seattypes.type_name}, không thể chọn ghế ${seat.seattypes.type_name}.`);
            return prev;
          }
        }
        return [...prev, seatId];
      }
    });
  };

  const getSeatColor = (seat: Seat) => {
    if (selectedSeats.includes(seat.id)) {
      return 'bg-red-600 text-white border-red-600';
    }
    if (seat.status === 'booked') {
      return 'bg-gray-400 text-white border-gray-400 cursor-not-allowed';
    }
    const typeName = seat.seattypes?.type_name?.toLowerCase() || '';
    // Phải kiểm tra provip trước vì nó chứa "vip"
    if (typeName.includes('provip') || typeName.includes('pro vip')) {
      return 'bg-orange-500 text-white border-orange-500 hover:bg-orange-600';
    }
    if (typeName.includes('vip')) {
      return 'bg-yellow-500 text-white border-yellow-500 hover:bg-yellow-600';
    }
    if (typeName.includes('couple') || typeName.includes('đôi')) {
      return 'bg-pink-500 text-white border-pink-500 hover:bg-pink-600';
    }
    if (typeName.includes('premium') || typeName.includes('cao cấp')) {
      return 'bg-purple-500 text-white border-purple-500 hover:bg-purple-600';
    }
    if (typeName.includes('deluxe') || typeName.includes('cao cấp')) {
      return 'bg-indigo-500 text-white border-indigo-500 hover:bg-indigo-600';
    }
    if (typeName.includes('economy') || typeName.includes('tiết kiệm')) {
      return 'bg-green-500 text-white border-green-500 hover:bg-green-600';
    }
    if (typeName.includes('standard') || typeName.includes('tiêu chuẩn')) {
      return 'bg-cyan-500 text-white border-cyan-500 hover:bg-cyan-600';
    }
    return 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600';
  };

  const getSeatPrice = (seat: Seat) => {
    const basePrice = slot?.price || 0;
    const multiplier = seat.seattypes?.price_multiplier || 1;
    return Math.round(basePrice * multiplier);
  };

  const getTotalPrice = () => {
    return selectedSeats.reduce((total, seatId) => {
      const seat = seats.find(s => s.id === seatId);
      return total + (seat ? getSeatPrice(seat) : 0);
    }, 0);
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products?size=100');
      const data = await response.json();
      setProducts(data.content || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const updateProductQuantity = (product: Product, delta: number) => {
    setSelectedProducts(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      
      if (existing) {
        const newQuantity = existing.quantity + delta;
        if (newQuantity <= 0) {
          return prev.filter(item => item.product.id !== product.id);
        }
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: newQuantity }
            : item
        );
      } else if (delta > 0) {
        return [...prev, { product, quantity: 1 }];
      }
      return prev;
    });
  };

  const getProductQuantity = (productId: number) => {
    return selectedProducts.find(item => item.product.id === productId)?.quantity || 0;
  };

  const getProductsTotal = () => {
    return selectedProducts.reduce(
      (sum, item) => sum + (item.product.price * item.quantity),
      0
    );
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (selectedSeats.length === 0) {
        alert('Vui lòng chọn ít nhất 1 ghế!');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Lưu thông tin booking và combo vào sessionStorage
      const bookingData = {
        slotId,
        selectedSeats,
        seats: selectedSeats.map(seatId => {
          const seat = seats.find(s => s.id === seatId);
          return `${seat?.seat_number}${seat?.seat_row}`;
        }),
        totalPrice: getTotalPrice(),
        movieTitle: slot?.movies?.title || '',
        cinema: slot?.rooms?.cinemas?.cinema_name || '',
        room: slot?.rooms?.room_name || '',
        time: slot?.show_time ? formatDateTime(slot.show_time).split(',')[0] : '',
        date: slot?.show_time ? formatDateTime(slot.show_time).split(',')[1].trim() : '',
        poster: slot?.movies?.poster_url || '',
      };
      
      const comboData = {
        combos: selectedProducts,
        comboTotal: getProductsTotal(),
      };
      
      sessionStorage.setItem(`booking_${slotId}`, JSON.stringify(bookingData));
      sessionStorage.setItem(`combo_${slotId}`, JSON.stringify(comboData));
      
      // Chuyển đến trang thanh toán
      router.push(`/cgv/booking/${slotId}/payment`);
    }
  };

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    } else {
      router.back();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <CGVHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải...</p>
          </div>
        </div>
        <CGVFooter />
      </div>
    );
  }

  if (!slot) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <CGVHeader />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-red-600">Không tìm thấy suất chiếu!</p>
        </div>
        <CGVFooter />
      </div>
    );
  }

  // Group seats by row
  const seatsByRow = seats.reduce((acc, seat) => {
    if (!acc[seat.seat_row]) {
      acc[seat.seat_row] = [];
    }
    acc[seat.seat_row].push(seat);
    return acc;
  }, {} as Record<string, Seat[]>);

  // Sort rows alphabetically
  const sortedRows = Object.keys(seatsByRow).sort();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <CGVHeader />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-black text-white text-center py-3 mb-6">
          <h1 className="text-xl font-bold">BOOKING ONLINE</h1>
        </div>

        {/* Movie Info */}
        <div className="bg-yellow-100 border border-yellow-600 p-4 mb-6">
          <h2 className="font-bold text-gray-900">
            {slot.rooms.cinemas.cinema_name} | {slot.rooms.room_name} | {seats.length - seats.filter(s => s.status === 'booked').length}/{seats.length} ghế
          </h2>
          <p className="text-gray-700">
            {formatDateTime(slot.show_time)} ~ {formatDateTime(slot.end_time)}
          </p>
        </div>

        {/* Step Indicator */}
        <div className="bg-gray-200 text-center py-2 mb-6">
          <h3 className="font-bold text-gray-900">
            {currentStep === 1 ? 'Người / Ghế' : 'Bắp Nước'}
          </h3>
        </div>

        {/* Step 1: Seat Selection */}
        {currentStep === 1 && (
          <>
            {/* Screen */}
            <div className="mb-8">
              <div className="relative">
                <svg viewBox="0 0 800 80" className="w-full h-20">
                  <path
                    d="M 50 60 Q 400 20, 750 60"
                    fill="none"
                    stroke="#999"
                    strokeWidth="2"
                  />
                  <text x="400" y="50" textAnchor="middle" fill="#666" fontSize="16" fontWeight="bold">
                    SCREEN
                  </text>
                </svg>
              </div>
            </div>

            {/* Seats Grid */}
            <div className="mb-8 overflow-x-auto">
          <div className="inline-block min-w-full">
            {sortedRows.map(row => {
              const rowSeats = seatsByRow[row].sort((a, b) => a.seat_number - b.seat_number);
              return (
                <div key={row} className="flex items-center justify-center mb-2">
                  <span className="w-8 text-center font-bold text-gray-700">{row}</span>
                  <div className="flex gap-1 mx-4">
                    {rowSeats.map(seat => (
                      <button
                        key={seat.id}
                        onClick={() => toggleSeat(seat.id, seat.status)}
                        disabled={seat.status === 'booked'}
                        className={`w-10 h-10 text-xs font-bold border-2 rounded transition-colors ${getSeatColor(seat)}`}
                        title={`${seat.seat_number}${seat.seat_row} - ${seat.seattypes?.type_name || 'Thường'} - ${getSeatPrice(seat).toLocaleString('vi-VN')} đ`}
                      >
                        {seat.seat_number}{seat.seat_row}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

            {/* Legend */}
            <div className="flex justify-center gap-6 mb-8 text-sm flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-red-600 border-2 border-red-600 rounded"></div>
                <span className="font-medium">Đã chọn</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-400 border-2 border-gray-400 rounded"></div>
                <span className="font-medium">Đã đặt</span>
              </div>
              {/* Chỉ hiển thị các loại ghế có trong phòng hiện tại */}
              {(() => {
                const uniqueSeatTypes = [...new Set(seats.map(seat => seat.seattypes.id))];
                const seatTypeLegends = [
                  { typeId: 'provip', color: 'bg-orange-500', borderColor: 'border-orange-500', name: 'Ghế ProVIP' },
                  { typeId: 'vip', color: 'bg-yellow-500', borderColor: 'border-yellow-500', name: 'Ghế VIP' },
                  { typeId: 'couple', color: 'bg-pink-500', borderColor: 'border-pink-500', name: 'Ghế đôi' },
                  { typeId: 'standard', color: 'bg-blue-500', borderColor: 'border-blue-500', name: 'Ghế thường' }
                ];

                return seatTypeLegends.map(legend => {
                  const hasThisType = seats.some(seat => {
                    const typeName = seat.seattypes?.type_name?.toLowerCase() || '';
                    if (legend.typeId === 'provip') {
                      return typeName.includes('provip') || typeName.includes('pro vip');
                    }
                    if (legend.typeId === 'vip') {
                      return typeName.includes('vip') && !typeName.includes('provip') && !typeName.includes('pro vip');
                    }
                    if (legend.typeId === 'couple') {
                      return typeName.includes('couple') || typeName.includes('đôi');
                    }
                    if (legend.typeId === 'standard') {
                      return typeName.includes('standard') || typeName.includes('tiêu chuẩn') || (!typeName.includes('vip') && !typeName.includes('couple') && !typeName.includes('provip') && !typeName.includes('pro vip'));
                    }
                    return false;
                  });

                  if (!hasThisType) return null;

                  return (
                    <div key={legend.typeId} className="flex items-center gap-2">
                      <div className={`w-8 h-8 ${legend.color} border-2 ${legend.borderColor} rounded`}></div>
                      <span className="font-medium">{legend.name}</span>
                    </div>
                  );
                });
              })()}
            </div>
          </>
        )}

        {/* Step 2: Product Selection */}
        {currentStep === 2 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
            {products.map(product => {
              const quantity = getProductQuantity(product.id);
              return (
                <div key={product.id} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="relative h-40 bg-gray-100">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.product_name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/200x160?text=' + encodeURIComponent(product.product_name);
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-sm mb-1 line-clamp-1">{product.product_name}</h3>
                    {product.description && (
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                    )}
                    <p className="text-red-600 font-bold text-sm mb-3">
                      {product.price.toLocaleString('vi-VN')} đ
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateProductQuantity(product, -1)}
                          disabled={quantity === 0}
                          className="w-6 h-6 bg-red-600 text-white rounded flex items-center justify-center disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-red-700 transition-colors text-sm font-bold"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-bold text-sm">{quantity}</span>
                        <button
                          onClick={() => updateProductQuantity(product, 1)}
                          className="w-6 h-6 bg-red-600 text-white rounded flex items-center justify-center hover:bg-red-700 transition-colors text-sm font-bold"
                        >
                          +
                        </button>
                      </div>
                      {quantity > 0 && (
                        <span className="text-red-600 font-bold text-xs">
                          {(product.price * quantity).toLocaleString('vi-VN')} đ
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom Bar */}
        <div className="bg-black text-white py-6 border-t-4 border-red-600">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-6">
              {/* Movie Poster */}
              <div className="shrink-0">
                <img
                  src={slot.movies.poster_url || 'https://via.placeholder.com/96x128?text=No+Image'}
                  alt={slot.movies.title}
                  className="w-24 h-32 object-cover rounded-lg shadow-lg"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/96x128?text=No+Image';
                  }}
                />
              </div>

              {/* Movie Info */}
              <div className="flex-1 grid grid-cols-4 gap-6">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Phim</p>
                  <p className="font-bold text-lg">{slot.movies.title}</p>
                  <p className="text-sm text-gray-300">2D</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Rạp</p>
                  <p className="font-semibold">{slot.rooms.cinemas.cinema_name}</p>
                  <p className="text-sm text-gray-300">Phòng {slot.rooms.room_name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Suất chiếu</p>
                  <p className="font-semibold">{formatDateTime(slot.show_time)}</p>
                  <p className="text-sm text-gray-300">{slot.movies.duration} phút</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 mb-1">Ghế đã chọn</p>
                  <p className="font-bold text-yellow-400">
                    {selectedSeats.length > 0
                      ? selectedSeats.map(id => {
                          const seat = seats.find(s => s.id === id);
                          return seat ? `${seat.seat_number}${seat.seat_row}` : '';
                        }).join(', ')
                      : 'Chưa chọn'}
                  </p>
                  {currentStep === 2 && selectedProducts.length > 0 && (
                    <p className="text-sm text-gray-300 mt-1">
                      Combo: {getProductsTotal().toLocaleString('vi-VN')} đ
                    </p>
                  )}
                  <p className="text-2xl font-bold text-red-500 mt-2">
                    {(getTotalPrice() + (currentStep === 2 ? getProductsTotal() : 0)).toLocaleString('vi-VN')} đ
                  </p>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-3 shrink-0">
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors font-semibold"
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span>QUAY LẠI</span>
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentStep === 1 && selectedSeats.length === 0}
                  className="flex items-center gap-2 px-8 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors font-semibold shadow-lg"
                >
                  <span>TIẾP TỤC</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <CGVFooter />
    </div>
  );
}
