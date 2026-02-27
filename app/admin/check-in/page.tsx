'use client';

import React, { useState } from 'react';
import { QrCode, Search, CheckCircle, XCircle, Ticket, User, Calendar, MapPin, Monitor, Armchair, Loader2, RefreshCw } from 'lucide-react';

interface TicketData {
  id: number;
  ticketCode: string;
  movieTitle: string;
  moviePoster?: string;
  showtime: string;
  cinema: string;
  cinemaAddress: string;
  screen: string;
  seats: Array<{
    row: string;
    number: string;
    type: number;
    price: number;
  }>;
  user: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
}

interface VerificationResult {
  success: boolean;
  valid: boolean;
  ticket?: TicketData;
  error?: string;
}

export default function CheckInPage() {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);

  const handleVerify = async () => {
    if (!token.trim()) {
      alert('Vui lòng nhập mã QR');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/booking/qr/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: token.trim() }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error verifying QR:', error);
      setResult({
        success: false,
        valid: false,
        error: 'Có lỗi xảy ra khi xác thực mã QR',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleVerify();
    }
  };

  const reset = () => {
    setToken('');
    setResult(null);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <QrCode className="w-8 h-8 text-blue-600" />
          Quét Mã QR Check-in
        </h1>
        <p className="text-gray-600 mt-2">
          Quét mã QR từ vé của khách hàng để xác thực và check-in tại rạp
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nhập mã QR hoặc quét từ camera
            </label>
            <div className="relative">
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Dán mã QR token vào đây..."
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                alert('Hướng dẫn:\n1. Mở ứng dụng điện thoại của khách hàng\n2. Chụp màn hình mã QR\n3. Copy text từ mã QR\n4. Paste vào ô input bên trên\n5. Nhấn "Xác Thực"');
              }}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2"
            >
              <QrCode className="w-5 h-5" />
              Quét QR (Hướng dẫn)
            </button>
            <button
              onClick={() => handleVerify()}
              disabled={loading || !token.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Đang xác thực...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Xác Thực
                </>
              )}
            </button>
            <button
              onClick={reset}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium flex items-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Làm Mới
            </button>
          </div>
        </div>
      </div>

      {/* Result Section */}
      {result && (
        <div className={`rounded-xl shadow-lg overflow-hidden ${result.valid ? 'border-2 border-green-500' : 'border-2 border-red-500'}`}>
          {/* Result Header */}
          <div className={`p-4 ${result.valid ? 'bg-green-50' : 'bg-red-50'}`}>
            <div className="flex items-center gap-3">
              {result.valid ? (
                <>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <div>
                    <h2 className="text-xl font-bold text-green-800">Vé Hợp Lệ!</h2>
                    <p className="text-green-700">Mã QR đã được xác thực thành công</p>
                  </div>
                </>
              ) : (
                <>
                  <XCircle className="w-8 h-8 text-red-600" />
                  <div>
                    <h2 className="text-xl font-bold text-red-800">Vé Không Hợp Lệ!</h2>
                    <p className="text-red-700">{result.error || 'Mã QR không hợp lệ hoặc đã hết hạn'}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Ticket Details */}
          {result.valid && result.ticket && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column - Ticket Info */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Ticket className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Mã vé</p>
                      <p className="font-mono font-semibold text-gray-900">{result.ticket.ticketCode}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Khách hàng</p>
                      <p className="font-semibold text-gray-900">{result.ticket.user}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Thời gian chiếu</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(result.ticket.showtime).toLocaleString('vi-VN', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Rạp chiếu</p>
                      <p className="font-semibold text-gray-900">{result.ticket.cinema}</p>
                      <p className="text-sm text-gray-500">{result.ticket.cinemaAddress}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Monitor className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Phòng chiếu</p>
                      <p className="font-semibold text-gray-900">{result.ticket.screen}</p>
                    </div>
                  </div>
                </div>

                {/* Right Column - Movie & Seats */}
                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-2">Phim</p>
                    <h3 className="text-lg font-bold text-gray-900">{result.ticket.movieTitle}</h3>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                      <Armchair className="w-4 h-4" />
                      Ghế đã đặt ({result.ticket.seats.length} ghế)
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {result.ticket.seats.map((seat, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-3 py-1 bg-white rounded-full text-sm font-semibold text-green-700 border border-green-200"
                        >
                          {seat.row}{seat.number}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-orange-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Tổng tiền</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {result.ticket.totalAmount.toLocaleString('vi-VN')} đ
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      result.ticket.paymentStatus === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {result.ticket.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      result.ticket.status === 'used'
                        ? 'bg-gray-100 text-gray-800'
                        : result.ticket.status === 'confirmed'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {result.ticket.status === 'used'
                        ? 'Đã sử dụng'
                        : result.ticket.status === 'confirmed'
                        ? 'Đã xác nhận'
                        : result.ticket.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {result.ticket.status !== 'used' && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button
                    className="w-full md:w-auto px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Xác Nhận Check-in (Đánh dấu đã sử dụng)
                  </button>
                </div>
              )}

              {result.ticket.status === 'used' && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="bg-gray-100 rounded-lg p-4 text-center">
                    <p className="text-gray-600 font-medium">Vé này đã được sử dụng</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      {!result && (
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Hướng dẫn sử dụng:</h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start gap-2">
              <span className="font-bold">1.</span>
              <span>Nhân viên yêu cầu khách hàng mở ứng dụng và hiển thị mã QR trong phần Chi tiết vé</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">2.</span>
              <span>Sao chép hoặc chụp lại mã QR, sau đó dán vào ô input bên trên</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">3.</span>
              <span>Nhấn Xác Thực để kiểm tra thông tin vé</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">4.</span>
              <span>Nhấn Xác Nhận Check-in để đánh dấu vé đã được sử dụng</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
