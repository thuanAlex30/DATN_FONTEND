import api from '../config/axios';

export interface SystemDashboardData {
  tenants: {
    tenants: number;
    active_tenants: number;
    suspended_tenants: number;
    inactive_tenants: number;
    total_users: number;
    total_active_users: number;
    total_departments: number;
    total_projects: number;
    total_tasks: number;
  };
  tasks: {
    total: number;
    pending: number;
    in_progress: number;
    completed: number;
    on_hold: number;
    cancelled: number;
    overdue: number;
  };
  permission_alerts: {
    errors: Array<{
      _id: string;
      message: string;
      created_at: string;
      user_id?: {
        username: string;
        full_name: string;
      };
      tenant_id?: string;
    }>;
    warnings: Array<{
      _id: string;
      message: string;
      created_at: string;
      user_id?: {
        username: string;
        full_name: string;
      };
      tenant_id?: string;
    }>;
    total_errors: number;
    total_warnings: number;
  };
  summary: {
    total_tenants: number;
    active_tenants: number;
    total_users: number;
    total_active_users: number;
    total_projects: number;
    total_tasks: number;
    permission_issues: number;
  };
}

export interface SystemStats {
  tenants: {
    total: number;
    active: number;
    inactive: number;
  };
  users: {
    total: number;
    active: number;
    inactive: number;
  };
  departments: number;
  projects: number;
  tasks: number;
}

class AdminService {
  // Get system dashboard data (System Admin only)
  async getSystemDashboard(): Promise<SystemDashboardData> {
    try {
      const response = await api.get<{
        success: boolean;
        message: string;
        data: SystemDashboardData;
      }>('/admin/dashboard');

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch system dashboard');
      }
    } catch (error: any) {
      console.error('Error fetching system dashboard:', error);
      throw error;
    }
  }

  // Get system statistics
  async getSystemStats(): Promise<SystemStats> {
    try {
      const response = await api.get<{
        success: boolean;
        message: string;
        data: SystemStats;
      }>('/admin/stats');

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch system stats');
      }
    } catch (error: any) {
      console.error('Error fetching system stats:', error);
      throw error;
    }
  }

  // Get permission alerts
  async getPermissionAlerts(options: {
    type?: 'all' | 'error' | 'warning';
    limit?: number;
    tenant_id?: string;
  } = {}): Promise<{
    alerts: Array<{
      _id: string;
      log_type: string;
      message: string;
      user_id?: any;
      tenant_id?: any;
      created_at: string;
    }>;
    statistics: {
      total: number;
      errors: number;
      warnings: number;
    };
  }> {
    try {
      const params = new URLSearchParams();
      if (options.type) params.append('type', options.type);
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.tenant_id) params.append('tenant_id', options.tenant_id);

      const response = await api.get<{
        success: boolean;
        message: string;
        data: {
          alerts: any[];
          statistics: {
            total: number;
            errors: number;
            warnings: number;
          };
        };
      }>(`/admin/permission-alerts?${params.toString()}`);

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch permission alerts');
      }
    } catch (error: any) {
      console.error('Error fetching permission alerts:', error);
      throw error;
    }
  }
}

export default new AdminService();

