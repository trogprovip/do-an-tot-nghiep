import axios from 'axios';

const baseUrl = '/api/auth';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  full_name: string;
  phone: string;
  email: string;
  password: string;
  username: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  phone: string | null;
  full_name: string;
  role: 'admin' | 'user';
  create_at: string | null;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

// ============================================
// ADMIN AUTH SERVICE (Riêng cho Admin)
// ============================================
export const adminAuthService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await axios.post(`${baseUrl}/login`, credentials);
    if (response.data.token && response.data.user?.role === 'admin') {
      // Lưu với prefix "admin_" để tách biệt
      localStorage.setItem('admin_auth_token', response.data.token);
      localStorage.setItem('admin_user', JSON.stringify(response.data.user));
      document.cookie = `admin_auth_token=${response.data.token}; path=/; max-age=${24 * 60 * 60}`;
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('admin_auth_token');
    localStorage.removeItem('admin_user');
    document.cookie = 'admin_auth_token=; path=/; max-age=0';
  },

  getCurrentUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('admin_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('admin_auth_token');
  },

  isAuthenticated: (): boolean => {
    return !!adminAuthService.getToken();
  },

  isAdmin: (): boolean => {
    const user = adminAuthService.getCurrentUser();
    return user?.role === 'admin';
  },
};

// ============================================
// USER AUTH SERVICE (Riêng cho User/CGV)
// ============================================
export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await axios.post(`${baseUrl}/login`, credentials);
    if (response.data.token) {
      // Lưu với tên thông thường cho user
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      document.cookie = `auth_token=${response.data.token}; path=/; max-age=${24 * 60 * 60}`;
    }
    return response.data;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await axios.post(`${baseUrl}/register`, data);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    document.cookie = 'auth_token=; path=/; max-age=0';
  },

  getCurrentUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  },

  isAuthenticated: (): boolean => {
    return !!authService.getToken();
  },

  isAdmin: (): boolean => {
    const user = authService.getCurrentUser();
    return user?.role === 'admin';
  },

  forgotPassword: async (email: string): Promise<{ success: boolean; message: string }> => {
    const response = await axios.post(`${baseUrl}/forgot-password`, { email });
    return response.data;
  },

  resetPassword: async (token: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    const response = await axios.post(`${baseUrl}/reset-password`, { token, newPassword });
    return response.data;
  },
};