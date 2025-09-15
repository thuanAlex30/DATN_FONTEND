export interface Role {
  id: string;
  role_name: string;
  description?: string;
  permissions: Record<string, any>;
  is_active: boolean;
}

export interface RoleCreate {
  role_name: string;
  description?: string;
  permissions?: Record<string, any>;
  is_active?: boolean;
}

export interface RoleUpdate {
  role_name?: string;
  description?: string;
  permissions?: Record<string, any>;
  is_active?: boolean;
}

export interface RoleQuery {
  page?: number;
  limit?: number;
  search?: string;
  is_active?: boolean;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}
