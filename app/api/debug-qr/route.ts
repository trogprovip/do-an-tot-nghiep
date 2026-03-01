import QRCode from 'qrcode';

export async function GET() {
  try {
    console.log('🔄 Testing QR code generation...');
    
    const testUrl = 'http://localhost:3000/verify?id=123';
    const qrCodeDataUrl = await QRCode.toDataURL(testUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    console.log('✅ QR code generated successfully');
    console.log('📏 Length:', qrCodeDataUrl.length);
    console.log('🔍 Format:', qrCodeDataUrl.substring(0, 30) + '...');
    
    return Response.json({
      success: true,
      message: 'QR code generation test successful',
      qrCodeLength: qrCodeDataUrl.length,
      qrCodeFormat: qrCodeDataUrl.substring(0, 30) + '...',
      testUrl: testUrl
    });
    
  } catch (error) {
    console.error('❌ QR code test failed:', error);
    return Response.json({
      success: false,
      error: 'QR code generation failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
