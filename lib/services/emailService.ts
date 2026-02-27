import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: email,
    subject: 'Đặt lại mật khẩu - Rạp Chiếu Phim',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="background-color: #007bff; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Rạp Chiếu Phim</h1>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #dee2e6;">
          <h2 style="color: #333; margin-bottom: 20px;">Đặt lại mật khẩu</h2>
          
          <p style="color: #666; line-height: 1.6;">Chào bạn,</p>
          <p style="color: #666; line-height: 1.6;">Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản của mình.</p>
          
          <div style="background-color: white; padding: 20px; border-radius: 6px; margin: 20px 0; border: 1px solid #e9ecef;">
            <p style="margin: 0 0 10px 0; color: #495057; font-weight: bold;">Mã xác thực của bạn:</p>
            <div style="background-color: #007bff; color: white; padding: 15px; border-radius: 4px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 2px;">
              ${token}
            </div>
          </div>
          
          <p style="color: #666; line-height: 1.6;">Hoặc click vào nút bên dưới để đặt lại mật khẩu:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Đặt lại mật khẩu</a>
          </div>
          
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin-top: 20px;">
            <p style="margin: 0; color: #856404; font-size: 14px;">
              <strong>Lưu ý:</strong> Mã này sẽ hết hạn sau 15 phút. Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
            </p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #6c757d; font-size: 12px;">
          <p>© 2024 Rạp Chiếu Phim. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully to:', email);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Không thể gửi email. Vui lòng kiểm tra cấu hình email.');
  }
};
