# Email Configuration Guide

Để chức năng gửi email xác nhận đặt vé hoạt động, bạn cần cấu hình các biến môi trường sau:

## Cấu hình Email Service

Thêm các biến sau vào file `.env` hoặc `.env.local`:

```bash
# Email Configuration
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_SECURE="false"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
EMAIL_FROM_NAME="CGV Cinema"

# Next.js URL (cần thiết để tạo QR code)
NEXT_PUBLIC_URL="http://localhost:3000"

# IP Address cho QR code (quan trọng cho email client)
# Thay bằng IP address của máy bạn để email có thể truy cập QR images
QR_BASE_URL="http://192.168.1.100:3000"
```

## Hướng dẫn cấu hình Gmail

### 1. Bật 2-Factor Authentication (2FA)
- Truy cập: https://myaccount.google.com/security
- Bật "Xác thực hai bước" (2-Step Verification)

### 2. Tạo App Password
- Truy cập: https://myaccount.google.com/apppasswords
- Chọn "Select app" → "Other (Custom name)"
- Đặt tên: "CGV Cinema Email Service"
- Nhấn "Generate" để lấy mật khẩu
- Sao chép mật khẩu 16 ký tự này

### 3. Cấu hình trong .env
```bash
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_SECURE="false"
EMAIL_USER="email-cua-ban@gmail.com"
EMAIL_PASS="app-password-16-ky-tu"
EMAIL_FROM_NAME="CGV Cinema"
```

## Các nhà cung cấp email khác

### Outlook/Hotmail
```bash
EMAIL_HOST="smtp-mail.outlook.com"
EMAIL_PORT="587"
EMAIL_SECURE="false"
```

### Yahoo Mail
```bash
EMAIL_HOST="smtp.mail.yahoo.com"
EMAIL_PORT="587"
EMAIL_SECURE="false"
```

## Test Email Service

Sau khi cấu hình, bạn có thể test kết nối email bằng cách:

1. Khởi động lại server
2. Thực hiện một giao dịch thanh toán thành công
3. Kiểm tra console log để xem trạng thái gửi email

## Troubleshooting

### Lỗi "Authentication failed"
- Kiểm tra lại email và app password
- Đảm bảo đã bật 2FA cho tài khoản Gmail

### Lỗi "Connection timeout"
- Kiểm tra lại host và port
- Đảm bảo firewall không chặn port 587

### Lỗi "Greeting failed"
- Kiểm tra lại cấu hình EMAIL_SECURE
- Với Gmail, nên đặt là "false"

## Lưu ý quan trọng

- Không bao giờ commit file .env vào git
- Luôn sử dụng App Password thay vì mật khẩu thực
- Test kỹ trước khi deploy production
- Sử dụng email chuyên nghiệp cho production
