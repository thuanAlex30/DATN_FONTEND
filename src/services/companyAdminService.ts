import { api } from '../config/axios';

export interface DepartmentHeader {
  _id: string;
  full_name: string;
  email: string;
  phone?: string;
  role_id?: {
    _id: string;
    role_name: string;
    role_code: string;
  };
  department_id?: {
    _id: string;
    department_name: string;
  };
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

class CompanyAdminService {
  // Get all Department Headers in tenant
  async getDepartmentHeaders(params?: {
    is_active?: boolean;
  }): Promise<{ data: DepartmentHeader[]; success: boolean; message: string }> {
    try {
      const response = await api.get('/company-admin/department-headers', { params });
      return {
        data: response.data.data || [],
        success: response.data.success || true,
        message: response.data.message || 'Department Headers retrieved successfully',
      };
    } catch (error: any) {
      console.error('Error fetching department headers:', error);
      throw error;
    }
  }
}

export default new CompanyAdminService();

