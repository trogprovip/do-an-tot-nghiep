import { prisma } from '../prisma';
import { accounts, accounts_role } from '@prisma/client';

export interface UserQueryParams {
  page?: number;
  size?: number;
  search?: string;
  role?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const dbUserService = {
  getAll: async (params: UserQueryParams = {}): Promise<PaginatedResponse<accounts>> => {
    const { page = 0, size = 10, search = '', role = '' } = params;
    const skip = page * size;

    const where: any = {
      is_deleted: false,
    };

    if (search) {
      where.OR = [
        { username: { contains: search } },
        { email: { contains: search } },
        { full_name: { contains: search } },
      ];
    }

    if (role) {
      where.role = role as accounts_role;
    }

    const [content, totalElements] = await Promise.all([
      prisma.accounts.findMany({
        where,
        skip,
        take: size,
        orderBy: { id: 'desc' },
        select: {
          id: true,
          username: true,
          email: true,
          phone: true,
          full_name: true,
          role: true,
          create_at: true,
          is_deleted: true,
          password_hash: false,
        },
      }),
      prisma.accounts.count({ where }),
    ]);

    return {
      content: content as accounts[],
      totalElements,
      totalPages: Math.ceil(totalElements / size),
      size,
      number: page,
    };
  },

  getById: async (id: number): Promise<accounts | null> => {
    return prisma.accounts.findFirst({
      where: {
        id,
        is_deleted: false,
      },
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        full_name: true,
        role: true,
        create_at: true,
        is_deleted: true,
        password_hash: false,
      },
    }) as Promise<accounts | null>;
  },

  create: async (data: Partial<accounts>): Promise<accounts> => {
    return prisma.accounts.create({
      data: {
        username: data.username!,
        password_hash: data.password_hash!,
        email: data.email!,
        phone: data.phone,
        full_name: data.full_name!,
        role: data.role || 'user',
        create_at: new Date(),
        is_deleted: false,
      },
    });
  },

  update: async (id: number, data: Partial<accounts>): Promise<accounts> => {
    return prisma.accounts.update({
      where: { id },
      data,
    });
  },

  delete: async (id: number): Promise<accounts> => {
    return prisma.accounts.update({
      where: { id },
      data: {
        is_deleted: true,
      },
    });
  },
};
