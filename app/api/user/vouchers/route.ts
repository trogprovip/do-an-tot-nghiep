import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken, getAdminFromToken } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  try {
    // Get user from JWT token
    const userPayload = getUserFromToken(request) || getAdminFromToken(request);
    
    if (!userPayload) {
      return NextResponse.json(
        { success: false, error: 'Yêu cầu xác thực' },
        { status: 401 }
      );
    }

    // Get user's activated vouchers (only non-expired)
    const userVouchers = await prisma.promotionusage.findMany({
      where: {
        account_id: userPayload.id,
        promotions: {
          end_date: {
            gte: new Date()
          }
        }
      },
      orderBy: {
        used_at: 'desc',
      },
    });

    // Get promotion details separately
    const vouchers = await Promise.all(
      userVouchers.map(async (usage) => {
        const promotion = await prisma.promotions.findUnique({
          where: { id: usage.promotion_id }
        });
        
        if (!promotion) {
          console.warn(`Promotion not found for usage ID: ${usage.id}, promotion_id: ${usage.promotion_id}`);
          return null;
        }
        
        return {
          id: promotion.id,
          title: promotion.promotion_name,
          description: promotion.description || '',
          discount_type: promotion.discount_type,
          discount_value: promotion.discount_value,
          code: promotion.promotion_code,
          used_at: usage.used_at,
          expired_at: promotion.end_date,
          discount_amount: usage.discount_amount,
        };
      })
    );

    // Filter out null values
    const validVouchers = vouchers.filter(v => v !== null);

    console.log(`Found ${validVouchers.length} valid vouchers for user ${userPayload.id}`);

    return NextResponse.json({
      success: true,
      data: validVouchers,
    });
  } catch (error) {
    console.error('Error fetching user vouchers:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể lấy phiếu giảm giá.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get user from JWT token
    const userPayload = getUserFromToken(request) || getAdminFromToken(request);
    
    console.log('User payload from token:', userPayload);
    
    if (!userPayload) {
      return NextResponse.json(
        { success: false, error: 'Yêu cầu xác thực' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { promotion_code } = body;

    if (!promotion_code) {
      return NextResponse.json(
        { success: false, error: 'Mã khuyến mãi là bắt buộc' },
        { status: 400 }
      );
    }

    // Find the promotion by code
    console.log('Looking for promotion code:', promotion_code.toUpperCase());
    
    const promotion = await prisma.promotions.findFirst({
      where: {
        promotion_code: promotion_code.toUpperCase(),
        status: 'active',
      },
    });

    console.log('Found promotion:', promotion);

    if (!promotion) {
      // Check if any promotion exists with that code (regardless of status)
      const anyPromotion = await prisma.promotions.findFirst({
        where: {
          promotion_code: promotion_code.toUpperCase(),
        },
      });
      
      console.log('Any promotion with this code:', anyPromotion);
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Mã khuyến mãi không hợp lệ',
          debug: {
            searched_code: promotion_code.toUpperCase(),
            found_any_promotion: !!anyPromotion,
            promotion_status: anyPromotion?.status
          }
        },
        { status: 404 }
      );
    }

    // Check if promotion has expired
    const now = new Date();
    if (promotion.end_date && new Date(promotion.end_date) < now) {
      return NextResponse.json(
        { success: false, error: 'Khuyến mãi đã hết hạn' },
        { status: 400 }
      );
    }

    // Check if user has already used this promotion
    console.log('Checking for existing usage for user:', userPayload.id, 'promotion:', promotion.id);
    
    const existingUsage = await prisma.promotionusage.findFirst({
      where: {
        account_id: userPayload.id,
        promotion_id: promotion.id,
      },
    });

    console.log('Existing usage found:', existingUsage);
    console.log('existingUsage truthy:', !!existingUsage);
    console.log('Type of existingUsage:', typeof existingUsage);
    console.log('existingUsage === null:', existingUsage === null);
    console.log('existingUsage === undefined:', existingUsage === undefined);

    if (existingUsage && existingUsage !== null) {
      console.log('ENTERING THE IF BLOCK - existingUsage is truthy');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Bạn đã sử dụng chương trình khuyến mãi này rồi.',
          debug: {
            user_id: userPayload.id,
            promotion_id: promotion.id,
            existing_usage: existingUsage,
            existing_usage_type: typeof existingUsage,
            is_null: existingUsage === null,
            is_undefined: existingUsage === undefined
          }
        },
        { status: 400 }
      );
    } else {
      console.log('SKIPPING THE IF BLOCK - existingUsage is falsy');
    }

    // Check usage limit
    const totalUsage = await prisma.promotionusage.count({
      where: {
        promotion_id: promotion.id,
      },
    });

    if (promotion.usage_limit && totalUsage >= promotion.usage_limit) {
      return NextResponse.json(
        { success: false, error: 'Đã đạt đến giới hạn sử dụng khuyến mãi' },
        { status: 400 }
      );
    }

    // Create promotion usage
    console.log('Creating promotion usage with data:', {
      account_id: userPayload.id,
      promotion_id: promotion.id,
      tickets_id: 0,
      used_at: new Date(),
      discount_amount: promotion.discount_value,
    });

    let usage;
    try {
      usage = await prisma.promotionusage.create({
        data: {
          account_id: userPayload.id,
          promotion_id: promotion.id,
          tickets_id: 1, // Use placeholder ticket ID
          used_at: new Date(),
          discount_amount: promotion.discount_value,
        },
      });
      
      console.log('Successfully created usage:', usage);

      // Increment promotion usage count when activation code is entered
      await prisma.promotions.update({
        where: { id: promotion.id },
        data: {
          usage_count: {
            increment: 1
          }
        }
      });

      console.log(`✅ Incremented promotion usage count for voucher ${promotion.id}`);

    } catch (createError) {
      console.error('Error creating usage:', createError);
      throw createError;
    }

    return NextResponse.json({
      success: true,
      data: {
        id: promotion.id,
        title: promotion.promotion_name,
        description: promotion.description,
        discount_type: promotion.discount_type,
        discount_value: promotion.discount_value,
        code: promotion.promotion_code,
        used_at: usage.used_at,
      },
      message: 'Voucher đã được kích hoạt thành công',
    });
  } catch (error) {
    console.error('Error activating voucher:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể kích hoạt mã giảm giá.' },
      { status: 500 }
    );
  }
}
