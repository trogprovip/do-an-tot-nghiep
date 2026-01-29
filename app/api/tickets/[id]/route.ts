import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID không hợp lệ' }, { status: 400 });
    }

    const ticket = await prisma.tickets.findFirst({
      where: {
        id,
        is_deleted: false,
      },
      include: {
        // Lấy thông tin người dùng
        accounts: {
          select: {
            id: true,
            full_name: true,
            email: true,
          },
        },
        // Lấy thông tin suất chiếu, phim và phòng
        slots: {
          include: {
            movies: {
              select: { title: true },
            },
            rooms: {
              select: { room_name: true },
            },
          },
        },
        // QUAN TRỌNG: Lấy thông tin ghế đã đặt và giá tiền
        bookingseats: {
          include: {
            seats: {
              include: {
                seattypes: true, // Lấy tên loại ghế (Vip/Thường) và giá mặc định nếu cần
              },
            },
          },
        },
        // Lấy thông tin bắp nước kèm theo
        ticketsdetails: {
          include: {
            products: true,
          },
        },
        // Lấy thông tin mã khuyến mại
        promotions: {
          select: {
            id: true,
            promotion_code: true,
            promotion_name: true,
          },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { error: 'Không tìm thấy vé' },
        { status: 404 }
      );
    }

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Error fetching ticket:', error);
    return NextResponse.json(
      { error: 'Lỗi hệ thống khi lấy dữ liệu vé' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    const body = await request.json();

    const existingTicket = await prisma.tickets.findFirst({
      where: {
        id,
        is_deleted: false,
      },
    });

    if (!existingTicket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};

    if (body.account_id !== undefined) updateData.account_id = parseInt(body.account_id);
    if (body.slot_id !== undefined) updateData.slot_id = parseInt(body.slot_id);
    if (body.total_amount !== undefined) updateData.total_amount = parseFloat(body.total_amount);
    if (body.discount_amount !== undefined) updateData.discount_amount = parseFloat(body.discount_amount);
    if (body.final_amount !== undefined) updateData.final_amount = parseFloat(body.final_amount);
    if (body.payment_status !== undefined) updateData.payment_status = body.payment_status;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.note !== undefined) updateData.note = body.note || null;

    await prisma.tickets.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating ticket:', error);
    return NextResponse.json(
      { error: 'Failed to update ticket' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    const existingTicket = await prisma.tickets.findFirst({
      where: {
        id,
        is_deleted: false,
      },
    });

    if (!existingTicket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    await prisma.tickets.update({
      where: { id },
      data: { is_deleted: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    return NextResponse.json(
      { error: 'Failed to delete ticket' },
      { status: 500 }
    );
  }
}