import api from './api';
import type {
  Role,
  RoleFilters,
  CreateRoleData,
  UpdateRoleData,
  RoleResponse,
  SingleRoleResponse
} from '../types/role';

class RoleService {
  /**
   * Get all roles with pagination and filters
   */
  static async getRoles(filters: RoleFilters = {}): Promise<RoleResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.search) params.append('search', filters.search);
      if (filters.is_active !== undefined) params.append('is_active', filters.is_active.toString());

      const response = await api.get(`/roles?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching roles:', error);
      throw error;
    }
  }

  /**
   * Get a single role by ID
   */
  static async getRoleById(id: string): Promise<SingleRoleResponse> {
    try {
      const response = await api.get(`/roles/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching role:', error);
      throw error;
    }
  }

  /**
   * Create a new role
   */
  static async createRole(roleData: CreateRoleData): Promise<SingleRoleResponse> {
    try {
      const response = await api.post('/roles', roleData);
      return response.data;
    } catch (error) {
      console.error('Error creating role:', error);
      throw error;
    }
  }

  /**
   * Update an existing role
   */
  static async updateRole(id: string, roleData: UpdateRoleData): Promise<SingleRoleResponse> {
    try {
      const response = await api.put(`/roles/${id}`, roleData);
      return response.data;
    } catch (error) {
      console.error('Error updating role:', error);
      throw error;
    }
  }

  /**
   * Delete a role
   */
  static async deleteRole(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete(`/roles/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting role:', error);
      throw error;
    }
  }

  /**
   * Update role permissions
   */
  static async updateRolePermissions(id: string, permissions: Record<string, string[]>): Promise<SingleRoleResponse> {
    try {
      const response = await api.patch(`/roles/${id}/permissions`, { permissions });
      return response.data;
    } catch (error) {
      console.error('Error updating role permissions:', error);
      throw error;
    }
  }

  /**
   * Toggle role active status
   */
  static async toggleRoleStatus(id: string, isActive: boolean): Promise<SingleRoleResponse> {
    try {
      const response = await api.put(`/roles/${id}/status`, { is_active: isActive });
      return response.data;
    } catch (error) {
      console.error('Error toggling role status:', error);
      throw error;
    }
  }

  /**
   * Get all active roles (for dropdowns)
   */
  static async getAllActiveRoles(): Promise<{
    success: boolean;
    data: Role[];
  }> {
    try {
      const response = await api.get('/roles/active');
      return response.data;
    } catch (error) {
      console.error('Error fetching active roles:', error);
      throw error;
    }
  }

  /**
   * Get role statistics
   */
  static async getRoleStats(): Promise<{
    success: boolean;
    data: {
      total_roles: number;
      active_roles: number;
      inactive_roles: number;
      total_users: number;
    };
  }> {
    try {
      const response = await api.get('/roles/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching role stats:', error);
      throw error;
    }
  }
}

export default RoleService;