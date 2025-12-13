import api from '../config/axios';
import type { User } from '../types/user';

// Note: This service uses the main apiClient from config/axios.ts
// which already has proper token handling and interceptors

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
      const response = await api.get<AllUsersResponse>(
        `/users/all`
      );

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch users');
      }
    } catch (error: any) {
      console.error('Error fetching all users:', error);
      // Let main axios interceptor handle 401 errors
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

      // Tăng timeout cho API getUsers (60 giây thay vì 30 giây)
      const response = await api.get<UsersResponse>(
        `/users?${params.toString()}`,
        { timeout: 60000 } // 60 giây
      );

      return response.data;
    } catch (error: any) {
      console.error('Error fetching users:', error);
      // Let main axios interceptor handle 401 errors
      throw error;
    }
  }

  // Get user by ID
  async getUserById(id: string): Promise<User> {
    try {
      const response = await api.get<{
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
      // Let main axios interceptor handle 401 errors
      throw error;
    }
  }

  // Get potential managers
  async getPotentialManagers(): Promise<User[]> {
    try {
      const response = await api.get<{
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
      // Let main axios interceptor handle 401 errors
      throw error;
    }
  }

  // Get user statistics for dashboard
  async getUserStats(): Promise<{ data: { total: number; active: number; inactive: number } }> {
    try {
      const response = await api.get<{
        success: boolean;
        message: string;
        data: {
          total: number;
          active: number;
          inactive: number;
        };
      }>('/users/stats');

      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch user stats');
      }
    } catch (error: any) {
      console.error('Error fetching user stats:', error);
      // Let main axios interceptor handle 401 errors
      throw error;
    }
  }

  // Create new user
  async createUser(userData: {
    username: string;
    email: string;
    full_name: string;
    phone?: string;
    role_id?: string;
    department_id?: string;
    position_id?: string;
    password: string;
  }): Promise<User> {
    try {
      const response = await api.post<{
        success: boolean;
        message: string;
        data: User;
      }>('/users', userData);

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to create user');
      }
    } catch (error: any) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Update user
  async updateUser(id: string, userData: {
    username?: string;
    email?: string;
    full_name?: string;
    phone?: string;
    role_id?: string;
    department_id?: string;
    position_id?: string;
    is_active?: boolean;
  }): Promise<User> {
    try {
      const response = await api.put<{
        success: boolean;
        message: string;
        data: User;
      }>(`/users/${id}`, userData);

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to update user');
      }
    } catch (error: any) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Delete user
  async deleteUser(id: string): Promise<void> {
    try {
      const response = await api.delete<{
        success: boolean;
        message: string;
      }>(`/users/${id}`);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete user');
      }
    } catch (error: any) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  // Import users from Excel
  async importUsers(file: File): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post<{
        success: boolean;
        message: string;
        data?: any;
      }>('/users/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error: any) {
      console.error('Error importing users:', error);
      throw error;
    }
  }
}

export default new UserService();