import { apiClient } from '../api-client';
import { API_ENDPOINTS } from '../api-config';

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface User {
  id: number;
  username: string;
  email: string;
  phone?: string;
  full_name: string;
  role: 'admin' | 'user';
  create_at?: string;
  is_deleted?: boolean;
}

export interface UserQueryParams {
  page?: number;
  size?: number;
  search?: string;
  role?: string;
  [key: string]: string | number | boolean | undefined;
}

export const userService = {
  getAll: async (params: UserQueryParams = {}): Promise<PaginatedResponse<User>> => {
    return apiClient.get<PaginatedResponse<User>>(API_ENDPOINTS.USERS, params);
  },

  getById: async (id: number): Promise<User> => {
    return apiClient.get<User>(API_ENDPOINTS.USER_BY_ID(id));
  },

  create: async (data: Partial<User>): Promise<User> => {
    return apiClient.post<User>(API_ENDPOINTS.USERS, data);
  },

  update: async (id: number, data: Partial<User>): Promise<User> => {
    return apiClient.put<User>(API_ENDPOINTS.USER_BY_ID(id), data);
  },

  delete: async (id: number): Promise<void> => {
    return apiClient.delete<void>(API_ENDPOINTS.USER_BY_ID(id));
  },
};
