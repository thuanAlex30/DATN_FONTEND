import { api } from '../config/axios';
import type {
  SystemStats,
  Tenant,
  TenantCreate,
  TenantUpdate,
  SubscriptionPlan,
  SubscriptionPlanCreate,
  SystemLog,
  SystemLogQuery,
  SystemSettings,
  BackupRecord,
} from '../types/systemAdmin';

class SystemAdminService {
  // ========== DASHBOARD ==========
  async getDashboard(): Promise<SystemStats> {
    try {
      const response = await api.get('/admin/dashboard');
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('Error fetching dashboard:', error);
      throw error;
    }
  }

  async getSystemStats(): Promise<SystemStats> {
    try {
      const response = await api.get('/admin/stats');
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('Error fetching system stats:', error);
      throw error;
    }
  }

  // ========== TENANT MANAGEMENT ==========
  async getTenants(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<{ data: Tenant[]; pagination?: any }> {
    try {
      const response = await api.get('/admin/tenants', { params });
      return {
        data: response.data.data || response.data.tenants || [],
        pagination: response.data.pagination,
      };
    } catch (error: any) {
      console.error('Error fetching tenants:', error);
      throw error;
    }
  }

  async getTenantById(id: string): Promise<Tenant> {
    try {
      const response = await api.get(`/tenants/${id}`);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('Error fetching tenant:', error);
      throw error;
    }
  }

  async createTenant(data: TenantCreate): Promise<Tenant> {
    try {
      const response = await api.post('/tenants', data);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('Error creating tenant:', error);
      throw error;
    }
  }

  async updateTenant(id: string, data: TenantUpdate): Promise<Tenant> {
    try {
      const response = await api.put(`/tenants/${id}`, data);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('Error updating tenant:', error);
      throw error;
    }
  }

  async deleteTenant(id: string): Promise<void> {
    try {
      await api.delete(`/tenants/${id}`);
    } catch (error: any) {
      console.error('Error deleting tenant:', error);
      throw error;
    }
  }

  async updateTenantSubscription(id: string, data: {
    subscription_plan?: string;
    subscription_expires_at?: string;
  }): Promise<Tenant> {
    try {
      const response = await api.put(`/tenants/${id}/subscription`, data);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('Error updating tenant subscription:', error);
      throw error;
    }
  }

  async updateTenantStatus(id: string, status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'): Promise<Tenant> {
    try {
      const response = await api.patch(`/tenants/${id}/status`, { status });
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('Error updating tenant status:', error);
      throw error;
    }
  }

  async getTenantStats(id: string): Promise<any> {
    try {
      const response = await api.get(`/tenants/${id}/stats`);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('Error fetching tenant stats:', error);
      throw error;
    }
  }

  // ========== SUBSCRIPTION PLANS ==========
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    try {
      const response = await api.get('/admin/subscription-plans');
      return response.data.data || response.data || [];
    } catch (error: any) {
      console.error('Error fetching subscription plans:', error);
      throw error;
    }
  }

  async createSubscriptionPlan(data: SubscriptionPlanCreate): Promise<SubscriptionPlan> {
    try {
      const response = await api.post('/admin/subscription-plans', data);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('Error creating subscription plan:', error);
      throw error;
    }
  }

  async updateSubscriptionPlan(id: string, data: Partial<SubscriptionPlanCreate>): Promise<SubscriptionPlan> {
    try {
      const response = await api.put(`/admin/subscription-plans/${id}`, data);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('Error updating subscription plan:', error);
      throw error;
    }
  }

  async deleteSubscriptionPlan(id: string): Promise<void> {
    try {
      await api.delete(`/admin/subscription-plans/${id}`);
    } catch (error: any) {
      console.error('Error deleting subscription plan:', error);
      throw error;
    }
  }

  // ========== SYSTEM LOGS ==========
  async getSystemLogs(params?: SystemLogQuery): Promise<{ data: SystemLog[]; pagination?: any }> {
    try {
      const response = await api.get('/system-logs', { params });
      return {
        data: response.data.data || response.data.logs || [],
        pagination: response.data.pagination,
      };
    } catch (error: any) {
      console.error('Error fetching system logs:', error);
      throw error;
    }
  }

  async exportLogs(params?: SystemLogQuery & { format?: 'json' | 'csv' | 'xlsx' }): Promise<void> {
    try {
      const response = await api.get('/system-logs/export', {
        params,
        responseType: 'blob',
      });
      
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `system-logs-${new Date().toISOString()}.${params?.format || 'json'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      console.error('Error exporting logs:', error);
      throw error;
    }
  }

  // ========== SYSTEM SETTINGS ==========
  async getSystemSettings(): Promise<SystemSettings> {
    try {
      const response = await api.get('/admin/settings');
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('Error fetching system settings:', error);
      throw error;
    }
  }

  async updateSystemSettings(data: Partial<SystemSettings>): Promise<SystemSettings> {
    try {
      const response = await api.put('/admin/settings', data);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('Error updating system settings:', error);
      throw error;
    }
  }

  // ========== BACKUP & RESTORE ==========
  async startBackup(data: {
    backup_type: 'FULL' | 'DATABASE' | 'FILES' | 'CONFIG';
    storage_location: string;
    compress?: boolean;
  }): Promise<BackupRecord> {
    try {
      const response = await api.post('/admin/backup', data);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('Error starting backup:', error);
      throw error;
    }
  }

  async getBackupHistory(): Promise<BackupRecord[]> {
    try {
      const response = await api.get('/admin/backup/history');
      return response.data.data || response.data || [];
    } catch (error: any) {
      console.error('Error fetching backup history:', error);
      throw error;
    }
  }

  async restoreBackup(backupId: string): Promise<void> {
    try {
      await api.post(`/admin/backup/${backupId}/restore`);
    } catch (error: any) {
      console.error('Error restoring backup:', error);
      throw error;
    }
  }
}

export default new SystemAdminService();

