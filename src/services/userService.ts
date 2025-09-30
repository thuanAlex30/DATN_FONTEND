import api from './api';
import type { User, UserQuery, UserCreate, UserUpdate } from '../types/user';

const userService = {
  // Get all users with pagination and filters
  async getUsers(query: UserQuery = {}): Promise<{ success: boolean; message: string; data: User[]; timestamp: string }> {
    try {
      console.log('userService.getUsers called with query:', query);
      const response = await api.get('/users/all', {
        params: query
      });
      console.log('userService.getUsers response:', response);
      console.log('userService.getUsers response.data:', response.data);
      
      // Check if response.data has the expected structure
      if (response.data && typeof response.data === 'object') {
        if (response.data.success !== undefined) {
          // Response has success field (API response format)
          // Check if there's nested data structure
          if (response.data.data && response.data.data.data) {
            // Double nested data structure
            return {
              success: response.data.success,
              message: response.data.message,
              data: response.data.data.data,
              timestamp: response.data.timestamp
            };
          }
          return response.data;
        } else if (Array.isArray(response.data)) {
          // Response is directly an array
          return {
            success: true,
            message: 'Users retrieved successfully',
            data: response.data,
            timestamp: new Date().toISOString()
          };
        }
      }
      
      // Fallback
      return {
        success: true,
        message: 'Users retrieved successfully',
        data: response.data || [],
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Get user by ID
  async getUserById(id: string): Promise<User> {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  // Create new user
  async createUser(userData: UserCreate): Promise<User> {
    try {
      const response = await api.post('/users', userData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Update user
  async updateUser(id: string, userData: UserUpdate): Promise<User> {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return response.data.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // Delete user
  async deleteUser(id: string): Promise<void> {
    try {
      await api.delete(`/users/${id}`);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  // Toggle user active status
  async toggleUserStatus(id: string): Promise<User> {
    try {
      const response = await api.patch(`/users/${id}/toggle-status`);
      return response.data;
    } catch (error) {
      console.error('Error toggling user status:', error);
      throw error;
    }
  },

  // Import users from Excel
  async importUsers(formData: FormData): Promise<{ success: boolean; message: string; data: any }> {
    try {
      const response = await api.post('/users/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 300000, // 5 minutes timeout for file upload
      });
      return response.data;
    } catch (error) {
      console.error('Error importing users:', error);
      throw error;
    }
  },

  // Get user statistics
  async getUserStats(): Promise<any> {
    try {
      const response = await api.get('/users/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  }
};

export default userService;