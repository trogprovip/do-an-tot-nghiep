import { prisma } from '../prisma';
import { news } from '@prisma/client';

export interface NewsQueryParams {
  page?: number;
  size?: number;
  search?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const dbNewsService = {
  getAll: async (params: NewsQueryParams = {}): Promise<PaginatedResponse<news>> => {
    const { page = 0, size = 10, search = '' } = params;
    const skip = page * size;

    const where: any = {
      is_deleted: false,
    };

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
      ];
    }

    const [content, totalElements] = await Promise.all([
      prisma.news.findMany({
        where,
        skip,
        take: size,
        orderBy: { id: 'desc' },
      }),
      prisma.news.count({ where }),
    ]);

    return {
      content,
      totalElements,
      totalPages: Math.ceil(totalElements / size),
      size,
      number: page,
    };
  },

  getById: async (id: number): Promise<news | null> => {
    return prisma.news.findFirst({
      where: {
        id,
        is_deleted: false,
      },
    });
  },

  create: async (data: Partial<news>): Promise<news> => {
    return prisma.news.create({
      data: {
        title: data.title!,
        content: data.content!,
        image_url: data.image_url,
        create_at: new Date(),
        is_deleted: false,
      },
    });
  },

  update: async (id: number, data: Partial<news>): Promise<news> => {
    return prisma.news.update({
      where: { id },
      data: {
        ...data,
        update_at: new Date(),
      },
    });
  },

  delete: async (id: number): Promise<news> => {
    return prisma.news.update({
      where: { id },
      data: {
        is_deleted: true,
        update_at: new Date(),
      },
    });
  },
};
