import { prisma } from '../prisma';
import { tickets, tickets_status, tickets_payment_status } from '@prisma/client';

export interface TicketQueryParams {
  page?: number;
  size?: number;
  search?: string;
  status?: string;
  payment_status?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const dbTicketService = {
  getAll: async (params: TicketQueryParams = {}) => {
    const { page = 0, size = 10, search = '', status = '', payment_status = '' } = params;
    const skip = page * size;

    const where: any = {
      is_deleted: false,
    };

    if (search) {
      where.tickets_code = { contains: search };
    }

    if (status) {
      where.status = status as tickets_status;
    }

    if (payment_status) {
      where.payment_status = payment_status as tickets_payment_status;
    }

    const [content, totalElements] = await Promise.all([
      prisma.tickets.findMany({
        where,
        skip,
        take: size,
        orderBy: { id: 'desc' },
        include: {
          accounts: {
            select: {
              id: true,
              full_name: true,
              email: true,
              phone: true,
            },
          },
          slots: {
            include: {
              movies: {
                select: {
                  id: true,
                  title: true,
                },
              },
              rooms: {
                select: {
                  id: true,
                  room_name: true,
                },
              },
            },
          },
          bookingseats: {
            include: {
              seats: true,
            },
          },
        },
      }),
      prisma.tickets.count({ where }),
    ]);

    return {
      content,
      totalElements,
      totalPages: Math.ceil(totalElements / size),
      size,
      number: page,
    };
  },

  getById: async (id: number) => {
    return prisma.tickets.findFirst({
      where: {
        id,
        is_deleted: false,
      },
      include: {
        accounts: true,
        slots: {
          include: {
            movies: true,
            rooms: true,
          },
        },
        bookingseats: {
          include: {
            seats: true,
          },
        },
        ticketsdetails: {
          include: {
            products: true,
          },
        },
      },
    });
  },

  updateStatus: async (id: number, status: tickets_status): Promise<tickets> => {
    return prisma.tickets.update({
      where: { id },
      data: { status },
    });
  },

  updatePaymentStatus: async (id: number, payment_status: tickets_payment_status): Promise<tickets> => {
    return prisma.tickets.update({
      where: { id },
      data: { payment_status },
    });
  },

  delete: async (id: number): Promise<tickets> => {
    return prisma.tickets.update({
      where: { id },
      data: {
        is_deleted: true,
      },
    });
  },
};
