import { apiClient } from '../api-client';
import { API_ENDPOINTS } from '../api-config';

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface Product {
  id: number;
  product_name: string;
  category: 'food' | 'drink' | 'combo' | 'voucher';
  description?: string;
  price: number;
  image_url?: string;
  create_at?: string;
  is_deleted?: boolean;
}

export interface ProductQueryParams {
  page?: number;
  size?: number;
  search?: string;
  category?: string;
  [key: string]: string | number | boolean | undefined;
}

export const productService = {
  getAll: async (params: ProductQueryParams = {}): Promise<PaginatedResponse<Product>> => {
    return apiClient.get<PaginatedResponse<Product>>(API_ENDPOINTS.PRODUCTS, params);
  },

  getById: async (id: number): Promise<Product> => {
    return apiClient.get<Product>(API_ENDPOINTS.PRODUCT_BY_ID(id));
  },

  create: async (data: Partial<Product>): Promise<Product> => {
    return apiClient.post<Product>(API_ENDPOINTS.PRODUCTS, data);
  },

  update: async (id: number, data: Partial<Product>): Promise<Product> => {
    return apiClient.put<Product>(API_ENDPOINTS.PRODUCT_BY_ID(id), data);
  },

  delete: async (id: number): Promise<void> => {
    return apiClient.delete<void>(API_ENDPOINTS.PRODUCT_BY_ID(id));
  },
};
