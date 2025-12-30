import { prisma } from '../prisma';
import { movies, movies_status } from '@prisma/client';

export interface MovieQueryParams {
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

export const dbMovieService = {
  getAll: async (params: MovieQueryParams = {}): Promise<PaginatedResponse<movies>> => {
    const { page = 0, size = 10, search = '', status = '' } = params;
    const skip = page * size;

    const where: any = {
      is_deleted: false,
    };

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { director: { contains: search } },
      ];
    }

    if (status) {
      where.status = status as movies_status;
    }

    const [content, totalElements] = await Promise.all([
      prisma.movies.findMany({
        where,
        skip,
        take: size,
        orderBy: { id: 'desc' },
      }),
      prisma.movies.count({ where }),
    ]);

    return {
      content,
      totalElements,
      totalPages: Math.ceil(totalElements / size),
      size,
      number: page,
    };
  },

  getById: async (id: number): Promise<movies | null> => {
    return prisma.movies.findFirst({
      where: {
        id,
        is_deleted: false,
      },
    });
  },

  create: async (data: Partial<movies>): Promise<movies> => {
    return prisma.movies.create({
      data: {
        title: data.title!,
        description: data.description,
        duration: data.duration!,
        release_date: data.release_date,
        director: data.director,
        cast: data.cast,
        genre: data.genre,
        language: data.language,
        poster_url: data.poster_url,
        trailer_url: data.trailer_url,
        status: data.status || 'coming_soon',
        create_at: new Date(),
        is_deleted: false,
      },
    });
  },

  update: async (id: number, data: Partial<movies>): Promise<movies> => {
    return prisma.movies.update({
      where: { id },
      data: {
        ...data,
        update_at: new Date(),
      },
    });
  },

  delete: async (id: number): Promise<movies> => {
    return prisma.movies.update({
      where: { id },
      data: {
        is_deleted: true,
        update_at: new Date(),
      },
    });
  },
};
