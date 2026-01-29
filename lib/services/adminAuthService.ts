import axios from 'axios';

const baseUrl = '/api/auth';

// ============================================
// INTERFACES
// ============================================
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
  /**
   * Đăng nhập Admin - Lưu token riêng với prefix "admin_"
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await axios.post(`${baseUrl}/login`, credentials);
    
    if (response.data.token && response.data.user?.role === 'admin') {
      // Lưu với prefix "admin_" để tách biệt hoàn toàn
      localStorage.setItem('admin_auth_token', response.data.token);
      localStorage.setItem('admin_user', JSON.stringify(response.data.user));
      
      // Set cookie cho middleware check
      document.cookie = `admin_auth_token=${response.data.token}; path=/; max-age=${ 24 * 60 * 60}`;
    }
    
    return response.data;
  },

  /**
   * Đăng xuất Admin - Xóa token admin
   */
  logout: () => {
    localStorage.removeItem('admin_auth_token');
    localStorage.removeItem('admin_user');
    document.cookie = 'admin_auth_token=; path=/; max-age=0';
  },

  /**
   * Lấy thông tin admin hiện tại
   */
  getCurrentUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('admin_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Lấy token admin
   */
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('admin_auth_token');
  },

  /**
   * Kiểm tra admin đã đăng nhập chưa
   */
  isAuthenticated: (): boolean => {
    return !!adminAuthService.getToken();
  },

  /**
   * Kiểm tra có phải admin không
   */
  isAdmin: (): boolean => {
    const user = adminAuthService.getCurrentUser();
    return user?.role === 'admin';
  },
};

// ============================================
// USER AUTH SERVICE (Riêng cho User/CGV)
// ============================================
export const authService = {
  /**
   * Đăng nhập User - Lưu token thông thường
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await axios.post(`${baseUrl}/login`, credentials);
    
    if (response.data.token) {
      // Lưu với tên thông thường cho user
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Set cookie cho middleware check
      document.cookie = `auth_token=${response.data.token}; path=/; max-age=${ 24 * 60 * 60}`;
    }
    
    return response.data;
  },

  /**
   * Đăng ký User mới
   */
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await axios.post(`${baseUrl}/register`, data);
    return response.data;
  },

  /**
   * Đăng xuất User
   */
  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    document.cookie = 'auth_token=; path=/; max-age=0';
  },

  /**
   * Lấy thông tin user hiện tại
   */
  getCurrentUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Lấy token user
   */
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  },

  /**
   * Kiểm tra user đã đăng nhập chưa
   */
  isAuthenticated: (): boolean => {
    return !!authService.getToken();
  },

  /**
   * Kiểm tra có phải admin không (từ user token)
   */
  isAdmin: (): boolean => {
    const user = authService.getCurrentUser();
    return user?.role === 'admin';
  },

  /**
   * Quên mật khẩu
   */
  forgotPassword: async (email: string): Promise<{ success: boolean; message: string }> => {
    const response = await axios.post(`${baseUrl}/forgot-password`, { email });
    return response.data;
  },

  /**
   * Đặt lại mật khẩu
   */
  resetPassword: async (token: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    const response = await axios.post(`${baseUrl}/reset-password`, { token, newPassword });
    return response.data;
  },
};

// ============================================
// UTILITY FUNCTIONS (Optional)
// ============================================

/**
 * Kiểm tra xem có đang đăng nhập ở cả 2 hệ thống không
 */
export const checkBothAuthenticated = () => {
  return {
    adminAuth: adminAuthService.isAuthenticated(),
    userAuth: authService.isAuthenticated(),
  };
};

/**
 * Đăng xuất tất cả (cả admin và user)
 */
export const logoutAll = () => {
  adminAuthService.logout();
  authService.logout();
};