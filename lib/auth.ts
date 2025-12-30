// Hàm để lấy token JWT từ localStorage (chỉ chạy ở client-side)
export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
}

// Hàm để lưu token JWT vào localStorage
export function setAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('authToken', token);
  }
}

// Hàm để xóa token JWT khỏi localStorage
export function removeAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken');
  }
}

// Hàm để kiểm tra xem người dùng đã đăng nhập hay chưa
export function isAuthenticated(): boolean {
  return getAuthToken() !== null;
}

// Hàm để thêm token vào header của request
export function addAuthHeader(headers: HeadersInit = {}): HeadersInit {
  const token = getAuthToken();
  if (token) {
    return {
      ...headers,
      'Authorization': `Bearer ${token}`
    };
  }
  return headers;
}

// Mock login function - Thay thế bằng API thực tế sau
export async function login(username: string, password: string): Promise<string> {
  try {
    const response = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    const token = data.token || data.access_token;
    
    if (!token) {
      throw new Error('No token received');
    }

    setAuthToken(token);
    return token;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

// Mock logout function
export function logout(): void {
  removeAuthToken();
  // Thêm logic khác nếu cần (ví dụ: chuyển hướng đến trang đăng nhập)
}
