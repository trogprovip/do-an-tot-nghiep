import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken, getAdminFromToken } from '@/lib/jwt';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function GET(request: NextRequest) {
  try {
    // Try to get user from token (both user and admin tokens)
    const userPayload = getUserFromToken(request) || getAdminFromToken(request);
    
    if (!userPayload) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = await prisma.accounts.findFirst({
      where: {
        id: userPayload.id,
        is_deleted: false,
      },
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        full_name: true,
        avatar_url: true,
        role: true,
        create_at: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        avatar_url: user.avatar_url,
        membership_tier: user.role === 'admin' ? 'PLATINUM' : 'STANDARD', // Mock membership tier
        points: 0, // TODO: Add points field to database
        created_at: user.create_at,
      },
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Try to get user from token (both user and admin tokens)
    const userPayload = getUserFromToken(request) || getAdminFromToken(request);
    
    if (!userPayload) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const contentType = request.headers.get('content-type');
    
    if (contentType?.includes('multipart/form-data')) {
      // Handle form data with file upload
      const formData = await request.formData();
      
      const full_name = formData.get('full_name') as string;
      const email = formData.get('email') as string;
      const phone = formData.get('phone') as string;
      const avatar = formData.get('avatar') as File;

      // Validate required fields
      if (!full_name || !email || !phone) {
        return NextResponse.json(
          { success: false, error: 'Missing required fields' },
          { status: 400 }
        );
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { success: false, error: 'Invalid email format' },
          { status: 400 }
        );
      }

      // Validate phone number
      const phoneRegex = /^[0-9]{10,11}$/;
      if (!phoneRegex.test(phone)) {
        return NextResponse.json(
          { success: false, error: 'Invalid phone number format' },
          { status: 400 }
        );
      }

      let avatar_url: string | undefined;

      // Handle avatar upload if present
      if (avatar && avatar.size > 0) {
        // Validate file type
        if (!avatar.type.startsWith('image/')) {
          return NextResponse.json(
            { success: false, error: 'Avatar must be an image file' },
            { status: 400 }
          );
        }

        // Validate file size (max 2MB)
        if (avatar.size > 2 * 1024 * 1024) {
          return NextResponse.json(
            { success: false, error: 'Avatar size must be less than 2MB' },
            { status: 400 }
          );
        }

        // TODO: Upload to cloud storage (AWS S3, Cloudinary, etc.)
        // For now, save to public directory
        const timestamp = Date.now();
        const fileName = `user_${userPayload.id}_${timestamp}.jpg`;
        const publicPath = `/avatars/${fileName}`;
        
        // Create avatars directory if it doesn't exist
        const avatarsDir = join(process.cwd(), 'public', 'avatars');
        try {
          await mkdir(avatarsDir, { recursive: true });
        } catch (error) {
          // Directory already exists
        }
        
        // Save file to public/avatars directory
        const buffer = Buffer.from(await avatar.arrayBuffer());
        const filePath = join(avatarsDir, fileName);
        await writeFile(filePath, buffer);
        
        avatar_url = publicPath;
      }

      // Update user profile
      const updatedUser = await prisma.accounts.update({
        where: { id: userPayload.id },
        data: {
          full_name,
          email,
          phone,
          avatar_url,
          update_at: new Date(),
        },
        select: {
          id: true,
          username: true,
          email: true,
          phone: true,
          full_name: true,
          avatar_url: true,
          role: true,
          create_at: true,
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          full_name: updatedUser.full_name,
          phone: updatedUser.phone,
          avatar_url: updatedUser.avatar_url,
          membership_tier: updatedUser.role === 'admin' ? 'PLATINUM' : 'STANDARD', // Mock membership tier
          points: 0, // TODO: Add points field to database
          created_at: updatedUser.create_at,
        },
        message: 'Profile updated successfully',
      });
    } else {
      // Handle JSON data (without file upload)
      const body = await request.json();
      
      const { full_name, email, phone } = body;

      // Validate required fields
      if (!full_name || !email || !phone) {
        return NextResponse.json(
          { success: false, error: 'Missing required fields' },
          { status: 400 }
        );
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { success: false, error: 'Invalid email format' },
          { status: 400 }
        );
      }

      // Validate phone number
      const phoneRegex = /^[0-9]{10,11}$/;
      if (!phoneRegex.test(phone)) {
        return NextResponse.json(
          { success: false, error: 'Invalid phone number format' },
          { status: 400 }
        );
      }

      // Update user profile
      const updatedUser = await prisma.accounts.update({
        where: { id: userPayload.id },
        data: {
          full_name,
          email,
          phone,
          update_at: new Date(),
        },
        select: {
          id: true,
          username: true,
          email: true,
          phone: true,
          full_name: true,
          avatar_url: true,
          role: true,
          create_at: true,
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          full_name: updatedUser.full_name,
          phone: updatedUser.phone,
          avatar_url: updatedUser.avatar_url,
          membership_tier: updatedUser.role === 'admin' ? 'PLATINUM' : 'STANDARD', // Mock membership tier
          points: 0, // TODO: Add points field to database
          created_at: updatedUser.create_at,
        },
        message: 'Profile updated successfully',
      });
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update user profile' },
      { status: 500 }
    );
  }
}
