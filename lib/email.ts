/* eslint-disable @typescript-eslint/no-explicit-any */
import nodemailer from 'nodemailer';
import axios from 'axios';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface BookingEmailData {
  bookingId: string;
  ticketsCode: string;
  movieTitle: string;
  cinemaName: string;
  showTime: Date;
  seats: Array<{
    row: string;
    number: number;
    type: string;
    price: number;
  }>;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  customerName: string;
  customerEmail: string;
  qrCodeUrl?: string;
  qrCodeBuffer?: Buffer;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    const config: EmailConfig = {
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASS || ''
      }
    };

    this.transporter = nodemailer.createTransport(config);
  }

  async sendBookingConfirmationEmail(bookingData: BookingEmailData): Promise<boolean> {
    try {
      console.log(`📧 Preparing email for booking ${bookingData.bookingId}`);
      console.log(`📧 QR Code Buffer present: ${!!bookingData.qrCodeBuffer}`);
      console.log(`📧 QR Code Buffer size: ${bookingData.qrCodeBuffer?.length || 0} bytes`);
      
      const emailContent = this.generateBookingEmailTemplate(bookingData);

      // Tạo mail options với QR code attachment
      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'CGV Cinema'}" <${process.env.EMAIL_USER}>`,
        to: bookingData.customerEmail,
        subject: `Xác nhận đặt vé thành công - ${bookingData.movieTitle} - ${bookingData.ticketsCode}`,
        html: emailContent,
        attachments: [] as any[]
      };

      // Nếu có QR code buffer, thêm attachment trực tiếp
      if (bookingData.qrCodeBuffer) {
        mailOptions.attachments.push({
          filename: `qrcode-${bookingData.bookingId}.png`,
          content: bookingData.qrCodeBuffer,
          cid: 'qrcode' // Content ID để reference trong HTML
        });
        
        console.log(`✅ QR code buffer attached to email for booking ${bookingData.bookingId}`);
      }

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email sent successfully to ${bookingData.customerEmail}:`, result.messageId);
      return true;

    } catch (error) {
      console.error('❌ Error sending booking confirmation email:', error);
      return false;
    }
  }

  private generateBookingEmailTemplate(data: BookingEmailData): string {
    const formattedShowTime = new Date(data.showTime).toLocaleString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const seatsList = data.seats.map(seat => 
      `Ghế ${seat.row}${seat.number} (${seat.type}) - ${seat.price.toLocaleString('vi-VN')} VNĐ`
    ).join('<br>');

    return `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Xác nhận đặt vé thành công</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #e50914, #b20710);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
        }
        .content {
            padding: 30px;
        }
        .booking-info {
            background: #f8f9fa;
            border-left: 4px solid #e50914;
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
            padding: 5px 0;
            border-bottom: 1px solid #eee;
        }
        .info-label {
            font-weight: bold;
            color: #555;
        }
        .info-value {
            color: #333;
        }
        .seats-section {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
        }
        .price-section {
            background: #d4edda;
            border: 1px solid #c3e6cb;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
        }
        .qr-section {
            text-align: center;
            margin: 30px 0;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 5px;
        }
        .qr-code {
            max-width: 200px;
            height: auto;
            border: 2px solid #e50914;
            border-radius: 10px;
        }
        .footer {
            background: #333;
            color: white;
            padding: 20px;
            text-align: center;
            font-size: 14px;
        }
        .success-icon {
            font-size: 48px;
            color: #28a745;
            margin-bottom: 20px;
        }
        .important-note {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
            border-left: 4px solid #ffc107;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="success-icon">✅</div>
            <h1>XÁC NHẬN ĐẶT VÉ THÀNH CÔNG</h1>
            <p>Cảm ơn bạn đã đặt vé tại CGV Cinema</p>
        </div>

        <div class="content">
            <p>Kính gửi <strong>${data.customerName}</strong>,</p>
            <p>Đặt vé của bạn đã được xác nhận thành công! Dưới đây là thông tin chi tiết về suất chiếu:</p>

            <div class="booking-info">
                <h3>📽️ THÔNG TIN SUẤT CHIỀU</h3>
                <div class="info-row">
                    <span class="info-label">Mã đặt vé:</span>
                    <span class="info-value"><strong>${data.ticketsCode}</strong></span>
                </div>
                <div class="info-row">
                    <span class="info-label">Phim:</span>
                    <span class="info-value">${data.movieTitle}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Rạp:</span>
                    <span class="info-value">${data.cinemaName}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Suất chiếu:</span>
                    <span class="info-value">${formattedShowTime}</span>
                </div>
            </div>

            <div class="seats-section">
                <h3>🪑 THÔNG TIN GHẾ</h3>
                ${seatsList}
            </div>

            <div class="price-section">
                <h3>💰 CHI TIẾT THANH TOÁN</h3>
                <div class="info-row">
                    <span class="info-label">Tổng tiền:</span>
                    <span class="info-value">${data.totalAmount.toLocaleString('vi-VN')} VNĐ</span>
                </div>
                ${data.discountAmount > 0 ? `
                <div class="info-row">
                    <span class="info-label">Giảm giá:</span>
                    <span class="info-value" style="color: #28a745;">-${data.discountAmount.toLocaleString('vi-VN')} VNĐ</span>
                </div>
                ` : ''}
                <div class="info-row" style="border-top: 2px solid #333; padding-top: 10px; margin-top: 10px;">
                    <span class="info-label" style="font-size: 18px; color: #e50914;">Thành tiền:</span>
                    <span class="info-value" style="font-size: 18px; font-weight: bold; color: #e50914;">${data.finalAmount.toLocaleString('vi-VN')} VNĐ</span>
                </div>
            </div>

            ${data.qrCodeBuffer ? `
            <div class="qr-section">
                <h3>📱 MÃ QR CHECK-IN</h3>
                <p>Vui lòng xuất trình mã QR này tại quầy vé hoặc tại cổng check-in để vào xem phim</p>
                <!-- Dùng CID để reference attachment -->
                <img src="cid:qrcode" alt="QR Code" class="qr-code" 
                     style="border: 2px solid #e50914; border-radius: 10px; display: block; margin: 0 auto; width: 200px; height: 200px;">
                <p><strong>Mã vé: ${data.ticketsCode}</strong></p>
                <p style="font-size: 14px; color: #666; margin-top: 10px;">
                    ⏰ Mã QR có thể được quét tại rạp hoặc online<br>
                    🔒 Mã QR duy nhất cho mỗi vé và không thể chia sẻ
                </p>
            </div>
            ` : `
            <div class="qr-section" style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 20px 0; border-radius: 5px;">
                <h3>📱 THÔNG TIN VÉ</h3>
                <p><strong>Mã vé: ${data.ticketsCode}</strong></p>
                <p style="font-size: 14px; color: #666;">QR code không khả dụng<br>Vui lòng xuất trình mã vé này tại quầy</p>
            </div>
            `}

            <div class="important-note">
                <h4>⚠️ LƯU Ý QUAN TRỌNG</h4>
                <ul>
                    <li>Vui lòng có mặt tại rạp trước 15 phút suất chiếu</li>
                    <li>Mang theo email xác nhận này để check-in</li>
                    <li>Mã QR có thể được sử dụng để check-in tự động</li>
                    <li>Vé đã đặt không được hoàn trả hoặc đổi sang suất chiếu khác</li>
                </ul>
            </div>

            <p>Nếu có bất kỳ câu hỏi nào, vui lòng liên hệ:</p>
            <p>
                📞 Hotline: 1900 6017<br>
                📧 Email: support@cgv.vn<br>
                🌐 Website: www.cgv.vn
            </p>

            <p>Trân trọng,<br><strong>Đội ngũ CGV Cinema</strong></p>
        </div>

        <div class="footer">
            <p>© 2024 CGV Cinema. All rights reserved.</p>
            <p>Email này được gửi tự động, vui lòng không trả lời.</p>
        </div>
    </div>
</body>
</html>
    `;
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('✅ Email service connection verified');
      return true;
    } catch (error) {
      console.error('❌ Email service connection failed:', error);
      return false;
    }
  }
}

export default EmailService;
export type { BookingEmailData };
