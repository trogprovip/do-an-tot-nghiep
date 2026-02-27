'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { QrCode, CheckCircle, XCircle, Ticket, User, Calendar, MapPin, Monitor, Armchair, Loader2, Camera, X } from 'lucide-react';

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

export default function VerifyPage() {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerDivId = 'qr-reader';

  // Cleanup scanner on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const handleVerify = useCallback(async (tokenToVerify?: string) => {
    const verifyToken = tokenToVerify || token;
    if (!verifyToken.trim()) {
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
        body: JSON.stringify({ token: verifyToken.trim() }),
      });

      const data = await response.json();
      setResult(data);
      if (data.success && data.valid) {
        stopScanning();
      }
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
  }, [token]);

  const handleVerifyById = useCallback(async (ticketId: string) => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(`/api/booking/qr/${ticketId}`);
      const data = await response.json();
      
      if (data.success) {
        // Get the token from the QR data and verify it
        const verifyResponse = await fetch('/api/booking/qr/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: data.ticketData }),
        });

        const verifyData = await verifyResponse.json();
        setResult(verifyData);
      } else {
        setResult({
          success: false,
          valid: false,
          error: data.error || 'Không tìm thấy vé',
        });
      }
    } catch (error) {
      console.error('Error verifying ticket by ID:', error);
      setResult({
        success: false,
        valid: false,
        error: 'Có lỗi xảy ra khi xác thực vé',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-verify token from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
    const urlId = urlParams.get('id');
    
    if (urlToken) {
      setToken(urlToken);
      handleVerify(urlToken);
    } else if (urlId) {
      // If ID is provided, fetch ticket by ID
      handleVerifyById(urlId);
    }
  }, [handleVerify, handleVerifyById]);

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().catch(console.error);
      scannerRef.current = null;
    }
    setScanning(false);
  };

  const startScanning = async () => {
    try {
      setScanning(true);
      setResult(null);

      setTimeout(async () => {
        const scannerDiv = document.getElementById(scannerDivId);
        if (!scannerDiv) {
          console.error('Scanner div not found');
          return;
        }

        scannerRef.current = new Html5Qrcode(scannerDivId);

        const qrCodeSuccessCallback = (decodedText: string) => {
          stopScanning();
          setToken(decodedText);
          handleVerify(decodedText);
        };

        const qrCodeErrorCallback = () => {
          // Ignore frequent errors when no QR found
        };

        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        };

        await scannerRef.current.start(
          { facingMode: 'environment' },
          config,
          qrCodeSuccessCallback,
          qrCodeErrorCallback
        );
      }, 100);
    } catch (error) {
      console.error('Error starting scanner:', error);
      alert('Không thể khởi động camera. Vui lòng cấp quyền camera và thử lại.');
      stopScanning();
    }
  };

  const reset = () => {
    setToken('');
    setResult(null);
    stopScanning();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-6 pt-4">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <QrCode className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Kiểm Tra Vé</h1>
          <p className="text-gray-600 text-sm mt-1">
            Quét mã QR để xác thực thông tin vé
          </p>
        </div>

        {/* Scanner or Input */}
        {!scanning && !result && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-4">
            <button
              onClick={startScanning}
              disabled={scanning}
              className="w-full py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 font-semibold flex items-center justify-center gap-2 mb-4"
            >
              <Camera className="w-6 h-6" />
              Quét Mã QR
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">hoặc</span>
              </div>
            </div>

            <div className="mt-4">
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Dán mã QR vào đây..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <button
                onClick={() => handleVerify()}
                disabled={loading || !token.trim()}
                className="w-full mt-2 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 font-semibold"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Đang xác thực...
                  </span>
                ) : (
                  'Xác Thực'
                )}
              </button>
            </div>
          </div>
        )}

        {/* Camera Scanner */}
        {scanning && (
          <div className="bg-black rounded-2xl overflow-hidden mb-4">
            <div className="p-3 bg-gray-900 text-white flex items-center justify-between">
              <span className="font-medium text-sm">Đang quét...</span>
              <button
                onClick={stopScanning}
                className="p-2 hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div id={scannerDivId} className="w-full" style={{ minHeight: '300px' }} />
            <p className="text-center text-gray-400 py-3 text-xs">
              Đưa mã QR vào vùng quét
            </p>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className={`rounded-2xl shadow-lg overflow-hidden ${result.valid ? 'border-2 border-green-500' : 'border-2 border-red-500'}`}>
            {/* Result Header */}
            <div className={`p-4 ${result.valid ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="flex items-center gap-3">
                {result.valid ? (
                  <>
                    <CheckCircle className="w-10 h-10 text-green-600" />
                    <div>
                      <h2 className="text-lg font-bold text-green-800">Vé Hợp Lệ!</h2>
                      <p className="text-green-700 text-sm">Mã QR đã được xác thực</p>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="w-10 h-10 text-red-600" />
                    <div>
                      <h2 className="text-lg font-bold text-red-800">Vé Không Hợp Lệ!</h2>
                      <p className="text-red-700 text-sm">{result.error || 'Mã QR không hợp lệ'}</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Ticket Details */}
            {result.valid && result.ticket && (
              <div className="p-4 bg-white">
                {/* Movie */}
                <div className="bg-blue-50 rounded-xl p-3 mb-3">
                  <p className="text-xs text-gray-600 mb-1">Phim</p>
                  <h3 className="font-bold text-gray-900">{result.ticket.movieTitle}</h3>
                </div>

                {/* Info Grid */}
                <div className="space-y-3 mb-3">
                  <div className="flex items-start gap-2">
                    <Ticket className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-600">Mã vé</p>
                      <p className="font-mono font-semibold text-sm">{result.ticket.ticketCode}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <User className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-600">Khách hàng</p>
                      <p className="font-semibold text-sm">{result.ticket.user}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-600">Thời gian</p>
                      <p className="font-semibold text-sm">
                        {new Date(result.ticket.showtime).toLocaleString('vi-VN', {
                          weekday: 'short',
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-600">Rạp</p>
                      <p className="font-semibold text-sm">{result.ticket.cinema}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Monitor className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-600">Phòng</p>
                      <p className="font-semibold text-sm">{result.ticket.screen}</p>
                    </div>
                  </div>
                </div>

                {/* Seats */}
                <div className="bg-green-50 rounded-xl p-3 mb-3">
                  <p className="text-xs text-gray-600 mb-2 flex items-center gap-1">
                    <Armchair className="w-3 h-3" />
                    Ghế ({result.ticket.seats.length})
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {result.ticket.seats.map((seat, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-white rounded text-xs font-semibold text-green-700 border border-green-200"
                      >
                        {seat.row}{seat.number}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Price & Status */}
                <div className="bg-orange-50 rounded-xl p-3 mb-3">
                  <p className="text-xs text-gray-600 mb-1">Tổng tiền</p>
                  <p className="text-xl font-bold text-orange-600">
                    {result.ticket.totalAmount.toLocaleString('vi-VN')} đ
                  </p>
                </div>

                <div className="flex gap-2">
                  <span className={`flex-1 text-center py-2 rounded-lg text-xs font-medium ${
                    result.ticket.paymentStatus === 'paid'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {result.ticket.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                  </span>
                  <span className={`flex-1 text-center py-2 rounded-lg text-xs font-medium ${
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
            )}
          </div>
        )}

        {/* Reset Button */}
        {(result || token) && (
          <button
            onClick={reset}
            className="w-full mt-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold"
          >
            Quét Vé Khác
          </button>
        )}
      </div>
    </div>
  );
}
