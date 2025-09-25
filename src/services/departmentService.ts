import api from './api';
import type { Department, DepartmentQuery, DepartmentCreate, DepartmentUpdate, DepartmentOption } from '../types/department';

// Department service with employee count functionality

const departmentService = {
  // Get all departments with pagination and filters
  async getDepartments(query: DepartmentQuery = {}): Promise<{ 
    success: boolean; 
    message: string; 
    data: { 
      departments: Department[]; 
      pagination: {
        current_page: number;
        total_pages: number;
        total_items: number;
        items_per_page: number;
      }
    }; 
    timestamp: string 
  }> {
    try {
      const response = await api.get('/departments', {
        params: query
      });
      return response.data; 
    } catch (error) {
      console.error('Error fetching departments:', error);
      throw error;
    }
  },

  // Get department by ID
  async getDepartmentById(id: string): Promise<Department> {
    try {
      const response = await api.get(`/departments/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching department:', error);
      throw error;
    }
  },

  // Get department summary with employee count
  async getDepartmentSummary(id: string): Promise<{
    id: string;
    name: string;
    description?: string;
    manager?: {
      id: string;
      name: string;
      email: string;
    };
    employee_count: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  }> {
    try {
      const response = await api.get(`/departments/${id}/summary`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching department summary:', error);
      throw error;
    }
  },

  // Get department options for dropdowns
  async getDepartmentOptions(): Promise<DepartmentOption[]> {
    try {
      const response = await api.get('/departments/options');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching department options:', error);
      throw error;
    }
  },

  // Get active departments
  async getActiveDepartments(): Promise<Department[]> {
    try {
      const response = await api.get('/departments/active');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching active departments:', error);
      throw error;
    }
  },

  // Create new department
  async createDepartment(departmentData: DepartmentCreate): Promise<Department> {
    try {
      const response = await api.post('/departments', departmentData);
      return response.data;
    } catch (error) {
      console.error('Error creating department:', error);
      throw error;
    }
  },

  // Update department
  async updateDepartment(id: string, departmentData: DepartmentUpdate): Promise<Department> {
    try {
      const response = await api.put(`/departments/${id}`, departmentData);
      return response.data;
    } catch (error) {
      console.error('Error updating department:', error);
      throw error;
    }
  },

  // Delete department
  async deleteDepartment(id: string): Promise<void> {
    try {
      await api.delete(`/departments/${id}`);
    } catch (error) {
      console.error('Error deleting department:', error);
      throw error;
    }
  },

  // Get department statistics
  async getStats(): Promise<{
    data: {
      total: number;
      active: number;
      inactive: number;
      with_manager: number;
      without_manager: number;
    }
  }> {
    try {
      const response = await api.get('/departments/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching department stats:', error);
      throw error;
    }
  },

  // Get department statistics (legacy method)
  async getDepartmentStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    with_manager: number;
    without_manager: number;
  }> {
    try {
      const response = await api.get('/departments/stats');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching department stats:', error);
      throw error;
    }
  },

  // Search departments
  async searchDepartments(searchTerm: string, filters: any = {}): Promise<Department[]> {
    try {
      const response = await api.get('/departments/search', {
        params: {
          search: searchTerm,
          ...filters
        }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error searching departments:', error);
      throw error;
    }
  },

  // Get employee counts for multiple departments
  async getDepartmentsWithEmployeeCounts(departmentIds: string[]): Promise<Record<string, number>> {
    try {
      const promises = departmentIds.map(async (id) => {
        try {
          const summary = await this.getDepartmentSummary(id);
          return { id, count: summary.employee_count };
        } catch (error) {
          console.error(`Error fetching employee count for department ${id}:`, error);
          return { id, count: 0 };
        }
      });

      const results = await Promise.all(promises);
      
      return results.reduce((acc, { id, count }) => {
        acc[id] = count;
        return acc;
      }, {} as Record<string, number>);
    } catch (error) {
      console.error('Error fetching departments with employee counts:', error);
      throw error;
    }
  },

  // Get all employees in a department
  async getDepartmentEmployees(departmentId: string, options: {
    is_active?: boolean;
    sort_by?: 'full_name' | 'email' | 'created_at' | 'position_name';
    sort_order?: 'asc' | 'desc';
    include_inactive?: boolean;
  } = {}): Promise<{
    success: boolean;
    message: string;
    data: {
      department: {
        id: string;
        name: string;
      };
      employees: Array<{
        id: string;
        username: string;
        full_name: string;
        email: string;
        phone?: string;
        position: {
          id: string;
          name: string;
          level: number;
        } | null;
        role: {
          id: string;
          name: string;
        } | null;
        is_active: boolean;
        created_at: string;
        updated_at: string;
      }>;
      total: number;
    };
    timestamp: string;
  }> {
    try {
      const queryParams = new URLSearchParams();
      
      if (options.is_active !== undefined) {
        queryParams.append('is_active', options.is_active.toString());
      }
      if (options.sort_by) {
        queryParams.append('sort_by', options.sort_by);
      }
      if (options.sort_order) {
        queryParams.append('sort_order', options.sort_order);
      }
      if (options.include_inactive !== undefined) {
        queryParams.append('include_inactive', options.include_inactive.toString());
      }

      const queryString = queryParams.toString();
      const url = `/departments/${departmentId}/employees${queryString ? `?${queryString}` : ''}`;
      
      console.log('Making request to:', url);
      console.log('Full URL:', `http://localhost:3000/api/v1${url}`);
      
      const response = await api.get(url);
      console.log('API response:', response);
      return response.data;
    } catch (error) {
      console.error('Error fetching department employees:', error);
      throw error;
    }
  }
};

export default departmentService;