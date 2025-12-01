export interface SystemStats {
  totalTenants: number;
  activeTenants: number;
  totalUsers: number;
  activeUsers: number;
  totalRoles: number;
  systemLogs: number;
  recentActivities: ActivityLog[];
}

export interface ActivityLog {
  id: string;
  tenant_name?: string;
  user_name?: string;
  action: string;
  module: string;
  details?: string;
  ip_address?: string;
  created_at: string;
}

export interface Tenant {
  id: string;
  tenant_name: string;
  tax_code: string;
  contact_name: string;
  contact_email: string;
  contact_phone?: string;
  subscription_plan?: string;
  subscription_expires_at?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  created_at: string;
  updated_at: string;
}

export interface TenantCreate {
  tenant_name: string;
  tax_code: string;
  contact_name: string;
  contact_email: string;
  contact_phone?: string;
  subscription_plan?: string;
  subscription_expires_at?: string;
}

export interface TenantUpdate {
  tenant_name?: string;
  tax_code?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  subscription_plan?: string;
  subscription_expires_at?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

export interface SubscriptionPlan {
  id: string;
  plan_name: string;
  description?: string;
  price: number;
  duration_months: number;
  features?: string[];
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string;
}

export interface SubscriptionPlanCreate {
  plan_name: string;
  description?: string;
  price: number;
  duration_months: number;
  features?: string[];
}

export interface SystemLog {
  id: string;
  user_id?: string;
  user_name?: string;
  tenant_id?: string;
  tenant_name?: string;
  module: string;
  action: string;
  details?: string;
  ip_address?: string;
  created_at: string;
}

export interface SystemLogQuery {
  page?: number;
  limit?: number;
  module?: string;
  action?: string;
  user_id?: string;
  tenant_id?: string;
  start_date?: string;
  end_date?: string;
}

export interface SystemSettings {
  system_name: string;
  system_email: string;
  system_phone: string;
  enable_2fa: boolean;
  enable_logging: boolean;
  enable_auto_backup: boolean;
  session_timeout: number;
  max_login_attempts: number;
}

export interface BackupRecord {
  id: string;
  backup_type: 'FULL' | 'DATABASE' | 'FILES' | 'CONFIG';
  storage_location: string;
  file_size: number;
  status: 'SUCCESS' | 'FAILED' | 'IN_PROGRESS';
  created_at: string;
}

