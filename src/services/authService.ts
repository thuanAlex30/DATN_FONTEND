import api from './api';

interface User {
  id: string;
  email: string;
  name: string;
  [key: string]: any;
}

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

interface LoginCredentials {
  username: string;
  password: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
  error?: any;
}

interface LoginResponse {
  user: User;
  tokens: Tokens;
}

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

class AuthService {
  // Đăng nhập
  async login(credentials: LoginCredentials): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await api.post('/auth/login', credentials);
      
      if (response.data.success) {
        const { user, tokens } = response.data.data;
        
        // Lưu thông tin user và tokens vào localStorage
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);
        
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Đăng nhập thất bại'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi kết nối server',
        error: error.response?.data
      };
    }
  }

  // Đăng xuất
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Xóa thông tin user khỏi localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }

  // Refresh token
  async refreshToken(): Promise<string | undefined> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token');
      }

      const response = await api.post('/auth/refresh', { refreshToken });
      
      if (response.data.success) {
        const { tokens } = response.data.data;
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);
        return tokens.accessToken;
      }
    } catch (error) {
      this.logout();
      throw error;
    }
  }

  // Kiểm tra user đã đăng nhập chưa
  isAuthenticated(): boolean {
    const token = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');
    return !!(token && user);
  }

  // Lấy thông tin user hiện tại
  getCurrentUser(): User | null {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  // Lấy access token
  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  // Đổi mật khẩu
  async changePassword(data: ChangePasswordData): Promise<ApiResponse<void>> {
    try {
      const response = await api.post('/auth/change-password', data);
      return {
        success: true,
        message: response.data.message
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Đổi mật khẩu thất bại'
      };
    }
  }

  // Quên mật khẩu
  async forgotPassword(email: string): Promise<ApiResponse<void>> {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return {
        success: true,
        message: response.data.message
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Gửi email thất bại'
      };
    }
  }
}

export default new AuthService(); 