import { prisma } from '../prisma';
import { cinemas, cinemas_status } from '@prisma/client';

export interface CinemaQueryParams {
  page?: number;
  size?: number;
  search?: string;
  status?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const dbCinemaService = {
  getAll: async (params: CinemaQueryParams = {}): Promise<PaginatedResponse<cinemas>> => {
    const { page = 0, size = 10, search = '' } = params;
    const skip = page * size;

    const where: any = {
      is_deleted: false,
    };

    if (search) {
      where.OR = [
        { cinema_name: { contains: search } },
        { address: { contains: search } },
      ];
    }

    const [content, totalElements] = await Promise.all([
      prisma.cinemas.findMany({
        where,
        skip,
        take: size,
        orderBy: { id: 'desc' },
        include: {
          provinces: true,
        },
      }),
      prisma.cinemas.count({ where }),
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
    return prisma.cinemas.findFirst({
      where: {
        id,
        is_deleted: false,
      },
      include: {
        provinces: true,
        rooms: true,
      },
    });
  },

  create: async (data: Partial<cinemas>): Promise<cinemas> => {
    return prisma.cinemas.create({
      data: {
        province_id: data.province_id!,
        cinema_name: data.cinema_name!,
        address: data.address!,
        latitude: data.latitude,
        longitude: data.longitude,
        status: data.status || 'active',
        phone: data.phone,
        email: data.email,
        create_at: new Date(),
        is_deleted: false,
      },
    });
  },

  update: async (id: number, data: Partial<cinemas>): Promise<cinemas> => {
    return prisma.cinemas.update({
      where: { id },
      data,
    });
  },

  delete: async (id: number): Promise<cinemas> => {
    return prisma.cinemas.update({
      where: { id },
      data: {
        is_deleted: true,
      },
    });
  },
};
