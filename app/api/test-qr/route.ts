import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';

export async function GET(request: NextRequest) {
  try {
    const testUrl = 'http://localhost:3000/verify?id=123';
    
    console.log('🔄 Testing QR code generation...');
    
    const qrCodeDataUrl = await QRCode.toDataURL(testUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    console.log('✅ QR code generated, length:', qrCodeDataUrl.length);
    console.log('🔍 QR code starts with:', qrCodeDataUrl.substring(0, 50));
    
    return NextResponse.json({
      success: true,
      qrCode: qrCodeDataUrl,
      length: qrCodeDataUrl.length,
      testUrl: testUrl
    });
    
  } catch (error) {
    console.error('❌ Error testing QR code:', error);
    return NextResponse.json(
      { error: 'Failed to test QR code', details: error },
      { status: 500 }
    );
  }
}
