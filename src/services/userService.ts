import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

// Create axios instance with interceptors
const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Add request interceptor to include token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface User {
  id: string;
  username: string;
  email: string;
  full_name: string;
  phone?: string;
  role?: {
    id: string;
    role_name: string;
  };
  department?: {
    id: string;
    department_name: string;
  };
  position?: {
    id: string;
    position_name: string;
  };
  is_active: boolean;
  created_at: string;
}

export interface UsersResponse {
  success: boolean;
  message: string;
  data: {
    users: User[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface AllUsersResponse {
  success: boolean;
  message: string;
  data: User[];
}

class UserService {

  // Get all active users (for dropdowns)
  async getAllUsers(): Promise<User[]> {
    try {
      const response = await apiClient.get<AllUsersResponse>(
        `/users/all`
      );

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch users');
      }
    } catch (error: any) {
      console.error('Error fetching all users:', error);
      if (error.response?.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
      throw error;
    }
  }

  // Get users with pagination and filters
  async getUsers(options: {
    page?: number;
    limit?: number;
    search?: string;
    role_id?: string;
    department_id?: string;
    is_active?: boolean;
  } = {}): Promise<UsersResponse> {
    try {
      const params = new URLSearchParams();
      
      if (options.page) params.append('page', options.page.toString());
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.search) params.append('search', options.search);
      if (options.role_id) params.append('role_id', options.role_id);
      if (options.department_id) params.append('department_id', options.department_id);
      if (options.is_active !== undefined) params.append('is_active', options.is_active.toString());

      const response = await apiClient.get<UsersResponse>(
        `/users?${params.toString()}`
      );

      return response.data;
    } catch (error: any) {
      console.error('Error fetching users:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
      throw error;
    }
  }

  // Get user by ID
  async getUserById(id: string): Promise<User> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        message: string;
        data: User;
      }>(
        `/users/${id}`
      );

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch user');
      }
    } catch (error: any) {
      console.error('Error fetching user:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
      throw error;
    }
  }

  // Get potential managers
  async getPotentialManagers(): Promise<User[]> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        message: string;
        data: User[];
      }>(
        `/ppe/users`
      );

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch users');
      }
    } catch (error: any) {
      console.error('Error fetching users:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
      throw error;
    }
  }
}

export default new UserService();