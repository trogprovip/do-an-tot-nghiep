import { prisma } from '../prisma';
import { products, products_category } from '@prisma/client';

export interface ProductQueryParams {
  page?: number;
  size?: number;
  search?: string;
  category?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const dbProductService = {
  getAll: async (params: ProductQueryParams = {}): Promise<PaginatedResponse<products>> => {
    const { page = 0, size = 10, search = '', category = '' } = params;
    const skip = page * size;

    const where: any = {
      is_deleted: false,
    };

    if (search) {
      where.product_name = { contains: search };
    }

    if (category) {
      where.category = category as products_category;
    }

    const [content, totalElements] = await Promise.all([
      prisma.products.findMany({
        where,
        skip,
        take: size,
        orderBy: { id: 'desc' },
      }),
      prisma.products.count({ where }),
    ]);

    return {
      content,
      totalElements,
      totalPages: Math.ceil(totalElements / size),
      size,
      number: page,
    };
  },

  getById: async (id: number): Promise<products | null> => {
    return prisma.products.findFirst({
      where: {
        id,
        is_deleted: false,
      },
    });
  },

  create: async (data: Partial<products>): Promise<products> => {
    return prisma.products.create({
      data: {
        product_name: data.product_name!,
        category: data.category!,
        description: data.description,
        price: data.price!,
        image_url: data.image_url,
        create_at: new Date(),
        is_deleted: false,
      },
    });
  },

  update: async (id: number, data: Partial<products>): Promise<products> => {
    return prisma.products.update({
      where: { id },
      data,
    });
  },

  delete: async (id: number): Promise<products> => {
    return prisma.products.update({
      where: { id },
      data: {
        is_deleted: true,
      },
    });
  },
};
