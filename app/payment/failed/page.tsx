/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Spin, Card, Button, Alert, Typography } from 'antd';
import { CloseCircleFilled, InfoCircleOutlined } from '@ant-design/icons';
import CGVHeader from '@/components/cgv/CGVHeader';
import CGVFooter from '@/components/cgv/CGVFooter';

const { Title, Text } = Typography;

export default function PaymentFailedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [errorData, setErrorData] = useState<any>(null);

  useEffect(() => {
    const orderId = searchParams.get('orderId');
    const responseCode = searchParams.get('responseCode');
    const message = searchParams.get('message');
    const error = searchParams.get('error');

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setErrorData({
      orderId,
      responseCode,
      message: message || error || 'Giao dịch thất bại',
    });
    setLoading(false);
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <CGVHeader />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <Spin size="large" />
          <Text type="secondary">Đang xử lý kết quả thanh toán...</Text>
        </div>
        <CGVFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfcf0]">
      <CGVHeader />
      
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CloseCircleFilled className="text-6xl text-red-600" />
          </div>
          
          <Title level={1} className="!mb-4 text-red-600">😔 Thanh Toán Thất Bại</Title>
          <Text className="text-lg text-gray-600">
            Giao dịch của bạn không thể hoàn tất. Vui lòng thử lại.
          </Text>
        </div>

        <Card className="shadow-2xl border-none overflow-hidden mb-8">
          <div className="bg-black p-4 text-white">
            <Title level={4} className="text-white m-0 uppercase tracking-widest text-center">
              Thông Tin Lỗi
            </Title>
          </div>
          
          <div className="p-8 space-y-6 bg-white">
            {errorData && (
              <>
                <div className="space-y-4">
                  {errorData.orderId && (
                    <div>
                      <Text type="secondary" className="block text-sm mb-1">Mã Giao Dịch</Text>
                      <div className="bg-gray-200 text-gray-800 px-4 py-3 rounded-lg font-mono font-bold text-lg tracking-wider">
                        {errorData.orderId}
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <Text type="secondary" className="block text-sm mb-1">Lỗi</Text>
                    <Alert
                      message={errorData.message}
                      type="error"
                      showIcon
                      className="text-left"
                    />
                  </div>
                  
                  {errorData.responseCode && (
                    <div>
                      <Text type="secondary" className="block text-sm mb-1">Mã Phản Hồi</Text>
                      <Text code className="text-lg">{errorData.responseCode}</Text>
                    </div>
                  )}
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                  <div className="flex items-start gap-3">
                    <InfoCircleOutlined className="text-yellow-600 text-xl mt-1" />
                    <div>
                      <Text strong className="text-yellow-800 block mb-2">Bạn có thể thử lại:</Text>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Kiểm tra lại thông tin thẻ ngân hàng</li>
                        <li>• Đảm bảo số dư tài khoản đủ</li>
                        <li>• Thử lại với phương thức thanh toán khác</li>
                        <li>• Liên hệ ngân hàng nếu vấn đề vẫn tiếp diễn</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>

        <div className="flex gap-4 justify-center">
          <Button 
            size="large" 
            className="px-8"
            onClick={() => router.back()}
          >
            Thử Lại
          </Button>
          <Button 
            type="primary" 
            size="large" 
            className="px-8 bg-red-600 hover:bg-red-700"
            onClick={() => router.push('/')}
          >
            Về Trang Chủ
          </Button>
        </div>
      </main>

      <CGVFooter />
    </div>
  );
}
