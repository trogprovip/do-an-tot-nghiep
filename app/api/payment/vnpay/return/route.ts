/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { VNPayService, VNPayReturnData } from '@/lib/vnpay';
import { PrismaClient } from '@prisma/client';
import EmailService, { BookingEmailData } from '@/lib/email';
import QRCode from 'qrcode';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync, statSync } from 'fs';

const prisma = new PrismaClient();

// Helper function để cập nhật booking status
async function updateBookingPaymentStatus(bookingId: string, status: string, paymentStatus: string) {
  try {
    const bookingIdNum = parseInt(bookingId);
    if (isNaN(bookingIdNum)) {
      throw new Error('Invalid booking ID');
    }

    await prisma.tickets.update({
      where: { id: bookingIdNum },
      data: {
        status: status as any, // pending, confirmed, cancelled
        payment_status: paymentStatus as any, // unpaid, paid, refunded
      }
    });

    console.log(`✅ Updated booking ${bookingId} to status: ${status}, payment: ${paymentStatus}`);
  } catch (error) {
    console.error('❌ Error updating booking status:', error);
    throw error;
  }
}

// Helper function để cập nhật trạng thái ghế khi thanh toán thành công
async function updateSeatsStatus(bookingId: string, status: 'booked' | 'active') {
  try {
    const bookingIdNum = parseInt(bookingId);
    if (isNaN(bookingIdNum)) {
      throw new Error('Invalid booking ID');
    }

    // Lấy danh sách seat_ids từ bookingseats
    const bookingSeats = await prisma.bookingseats.findMany({
      where: { tickets_id: bookingIdNum },
      select: { seat_id: true }
    });

    if (bookingSeats.length > 0) {
      // Cập nhật trạng thái tất cả các ghế
      await prisma.seats.updateMany({
        where: {
          id: { in: bookingSeats.map(bs => bs.seat_id) }
        },
        data: { status: status as any }
      });

      // Release seat locks cho cả hai trường hợp (thành công và thất bại)
      await prisma.$executeRaw`UPDATE seatlocks SET is_active = 0, updated_at = NOW() WHERE seat_id IN (${bookingSeats.map(bs => bs.seat_id).join(',')}) AND is_active = 1`;

      console.log(`✅ Updated ${bookingSeats.length} seats to status: ${status} and released locks`);
    }
  } catch (error) {
    console.error('❌ Error updating seats status:', error);
    throw error;
  }
}

// Helper function để cập nhật voucher usage khi thanh toán thành công
async function updateVoucherUsage(bookingId: string) {
  try {
    const bookingIdNum = parseInt(bookingId);
    if (isNaN(bookingIdNum)) {
      throw new Error('Invalid booking ID');
    }

    // Lấy thông tin ticket để tìm promotion_id
    const ticket = await prisma.tickets.findUnique({
      where: { id: bookingIdNum },
      select: { 
        promotion_id: true,
        account_id: true,
        discount_amount: true
      }
    });

    if (!ticket || !ticket.promotion_id) {
      console.log(`📝 No voucher found for booking ${bookingId}`);
      return;
    }

    // Lấy thông tin promotion để kiểm tra usage_per_user
    const promotion = await prisma.promotions.findUnique({
      where: { id: ticket.promotion_id },
      select: {
        usage_per_user: true,
        promotion_code: true
      }
    });

    if (!promotion) {
      console.log(`📝 Promotion not found for id ${ticket.promotion_id}`);
      return;
    }

    // Đếm số lần user đã sử dụng voucher này TRƯỚC KHI update
    const userUsageCount = await prisma.promotionusage.count({
      where: {
        account_id: ticket.account_id,
        promotion_id: ticket.promotion_id,
        tickets_id: {
          not: 1 // Chỉ đếm những usage đã có ticket_id thực tế (đã thanh toán)
        }
      }
    });

    console.log(`📊 User ${ticket.account_id} has used voucher ${promotion.promotion_code} ${userUsageCount}/${promotion.usage_per_user} times`);

    // Cập nhật promotionusage với ticket_id thực tế
    const updatedUsage = await prisma.promotionusage.updateMany({
      where: {
        account_id: ticket.account_id,
        promotion_id: ticket.promotion_id,
        tickets_id: 1, // Giá trị mặc định khi activate
      },
      data: {
        tickets_id: bookingIdNum, // Cập nhật với ticket_id thực tế
        discount_amount: ticket.discount_amount || 0,
      }
    });

    console.log(`✅ Updated voucher usage for booking ${bookingId}:`, updatedUsage);

    // Xóa voucher khỏi kho user nếu đã hết lượt sử dụng
    // Sau khi update, userUsageCount + 1 >= usage_per_user thì xóa các bản ghi còn lại
    if (userUsageCount + 1 >= promotion.usage_per_user) {
      // Xóa tất cả các bản ghi còn lại của user với voucher này
      await prisma.promotionusage.deleteMany({
        where: {
          account_id: ticket.account_id,
          promotion_id: ticket.promotion_id,
          // Không cần điều kiện tickets_id vì muốn xóa tất cả các bản ghi còn lại
        }
      });
    }

    console.log(`📝 Voucher usage updated successfully for booking ${bookingId}`);

  } catch (error) {
    console.error('❌ Error updating voucher usage:', error);
    // Không throw error để không ảnh hưởng đến payment flow
  }
}

// Helper function để gửi email xác nhận đặt vé thành công
async function sendBookingConfirmationEmail(bookingId: string) {
  try {
    const bookingIdNum = parseInt(bookingId);
    if (isNaN(bookingIdNum)) {
      throw new Error('Invalid booking ID');
    }

    // Lấy thông tin ticket với các relations cần thiết
    const ticket = await prisma.tickets.findUnique({
      where: { id: bookingIdNum },
      include: {
        accounts: {
          select: {
            full_name: true,
            email: true
          }
        },
        slots: {
          include: {
            movies: {
              select: {
                title: true
              }
            },
            rooms: {
              include: {
                cinemas: {
                  select: {
                    cinema_name: true
                  }
                }
              }
            }
          }
        },
        bookingseats: {
          include: {
            seats: {
              include: {
                seattypes: {
                  select: {
                    type_name: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!ticket) {
      console.error(`❌ Ticket not found for booking ${bookingId}`);
      return false;
    }

    if (!ticket.accounts?.email) {
      console.error(`❌ Customer email not found for booking ${bookingId}`);
      return false;
    }

    // Tạo QR code cho vé (giống hệt QR code trong lịch sử)
    let qrCodeBuffer = undefined;
    try {
      // Tạo QR code giống hệt trong lịch sử đặt vé
      // Dùng cùng URL và options với API /api/booking/qr/[id]
      const baseUrl = 'http://192.168.1.100:3000'; // Cùng IP với API QR
      const qrUrl = `${baseUrl}/verify?id=${bookingIdNum}`; // Cùng URL với API QR
      
      console.log(`🔄 Creating QR code for booking ${bookingId} with SAME URL as history: ${qrUrl}`);
      
      // Tạo QR code với options giống hệt API QR (toDataURL -> toBuffer)
      const qrCodeDataURL = await QRCode.toDataURL(qrUrl, {
        width: 300, // Cùng width
        margin: 2,  // Cùng margin
        color: {
          dark: '#000000', // Cùng màu
          light: '#FFFFFF'
        }
      });
      
      // Convert Data URL to Buffer để attach vào email
      const base64Data = qrCodeDataURL.replace(/^data:image\/png;base64,/, '');
      qrCodeBuffer = Buffer.from(base64Data, 'base64');
      
      console.log(`✅ Generated QR code buffer for booking ${bookingId}, size: ${qrCodeBuffer.length} bytes`);
      console.log(`📱 QR code URL (same as history): ${qrUrl}`);
      console.log(`🔗 QR code will be identical to history QR code`);
      
    } catch (qrError) {
      console.warn(`⚠️ Error generating QR code for booking ${bookingId}:`, qrError);
    }

    // Chuẩn bị dữ liệu cho email
    const emailData: BookingEmailData = {
      bookingId: bookingId,
      ticketsCode: ticket.tickets_code,
      movieTitle: ticket.slots.movies.title,
      cinemaName: ticket.slots.rooms?.cinemas?.cinema_name || 'N/A',
      showTime: ticket.slots.show_time,
      seats: ticket.bookingseats.map(bs => ({
        row: bs.seats.seat_row,
        number: bs.seats.seat_number,
        type: bs.seats.seattypes.type_name,
        price: Number(bs.seat_price)
      })),
      totalAmount: Number(ticket.total_amount),
      discountAmount: Number(ticket.discount_amount || 0),
      finalAmount: Number(ticket.final_amount),
      customerName: ticket.accounts.full_name,
      customerEmail: ticket.accounts.email,
      qrCodeUrl: undefined, // QR code sẽ được truyền qua buffer
      qrCodeBuffer: qrCodeBuffer // Truyền trực tiếp buffer
    };

    // Gửi email
    const emailService = new EmailService();
    const emailSent = await emailService.sendBookingConfirmationEmail(emailData);

    if (emailSent) {
      console.log(`✅ Booking confirmation email sent successfully to ${ticket.accounts.email}`);
      return true;
    } else {
      console.error(`❌ Failed to send booking confirmation email to ${ticket.accounts.email}`);
      return false;
    }

  } catch (error) {
    console.error(`❌ Error sending booking confirmation email for ${bookingId}:`, error);
    return false;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // ✅ Log raw URL để debug
    console.log('📥 Raw URL:', request.url);
    
    const query = Object.fromEntries(searchParams.entries()) as unknown as VNPayReturnData;

    console.log('📥 VNPay Return Query:', query);
    console.log('🔐 Received Hash:', query.vnp_SecureHash);

    // Validate required fields
    if (!query.vnp_TxnRef || !query.vnp_ResponseCode || !query.vnp_SecureHash) {
      console.error('❌ Missing required VNPay response parameters');
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_URL}/cgv?payment=error&error=missing_params&orderId=${query.vnp_TxnRef || 'unknown'}`
      );
    }

    const vnpayService = new VNPayService();
    
    // Verify the response
    const isValid = vnpayService.verifyReturnUrl(query);
    
    if (!isValid) {
      console.error('❌ Invalid VNPay signature');
      console.error('Query params:', JSON.stringify(query, null, 2));
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_URL}/cgv?payment=error&error=invalid_signature&orderId=${query.vnp_TxnRef}`
      );
    }

    console.log('✅ VNPay signature verified');

    // Check payment status
    const isSuccessful = query.vnp_ResponseCode === '00';
    const statusMessage = vnpayService.getPaymentStatus(query.vnp_ResponseCode);

    if (isSuccessful) {
      console.log(`✅ Payment successful for order ${query.vnp_TxnRef}`);
      
      // 1️⃣ Cập nhật booking status thành paid
      const bookingId = query.vnp_TxnRef.replace('BOOKING_', '');
      try {
        await updateBookingPaymentStatus(bookingId, 'confirmed', 'paid');
        console.log(`✅ Updated booking ${bookingId} from pending to confirmed/paid`);
        
        // 2️⃣ Cập nhật trạng thái ghế thành booked khi thanh toán thành công
        await updateSeatsStatus(bookingId, 'booked');
        console.log(`✅ Updated seats to booked for booking ${bookingId}`);
        
        // 3️⃣ Cập nhật voucher usage khi thanh toán thành công
        await updateVoucherUsage(bookingId);
        console.log(`✅ Updated voucher usage for booking ${bookingId}`);
        
        // 4️⃣ Gửi email xác nhận đặt vé thành công
        await sendBookingConfirmationEmail(bookingId);
        console.log(`✅ Sent booking confirmation email for booking ${bookingId}`);
      } catch (error) {
        console.error(`❌ Failed to update booking ${bookingId}:`, error);
      }
      
      // Redirect về trang chủ với thông báo thành công
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_URL}/cgv?payment=success&orderId=${query.vnp_TxnRef}`
      );
    } else {
      console.log(`❌ Payment failed for order ${query.vnp_TxnRef}: ${statusMessage}`);
      
      // 2️⃣ Cập nhật booking status thành cancelled với payment_status là unpaid
      const bookingId = query.vnp_TxnRef.replace('BOOKING_', '');
      try {
        await updateBookingPaymentStatus(bookingId, 'cancelled', 'unpaid');
        console.log(`✅ Updated booking ${bookingId} to cancelled/unpaid status`);
        
        // 3️⃣ Rollback seat status về active khi payment thất bại
        await updateSeatsStatus(bookingId, 'active');
        console.log(`✅ Rolled back seats to active for booking ${bookingId}`);
      } catch (error) {
        console.error(`❌ Failed to update booking ${bookingId}:`, error);
      }
      
      // Redirect về trang chủ với thông báo thất bại
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_URL}/cgv?payment=failed&orderId=${query.vnp_TxnRef}&responseCode=${query.vnp_ResponseCode}&message=${encodeURIComponent(statusMessage)}`
      );
    }

  } catch (error) {
    console.error('❌ VNPay return processing error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_URL}/cgv?payment=error&error=server_error`
    );
  }
}
