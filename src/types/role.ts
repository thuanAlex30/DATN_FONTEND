// Role Management Types
export interface Role {
  id: string;
  role_name: string;
  role_code?: string;
  role_level?: number;
  description: string;
  permissions: Record<string, string[]>;
  is_active: boolean;
  user_count: number;
  created_at: string;
  updated_at: string;
}

export interface RoleFilters {
  page?: number;
  limit?: number;
  search?: string;
  is_active?: boolean;
}

export interface CreateRoleData {
  role_name: string;
  description: string;
  permissions: Record<string, string[]>;
  is_active?: boolean;
}

export interface UpdateRoleData {
  role_name?: string;
  description?: string;
  permissions?: Record<string, string[]>;
  is_active?: boolean;
}

// Aliases for compatibility
export type RoleCreate = CreateRoleData;
export type RoleUpdate = UpdateRoleData;
export type RoleQuery = RoleFilters;

export interface RoleResponse {
  success: boolean;
  message: string;
  data: {
    roles: Role[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
  timestamp: string;
}

export interface SingleRoleResponse {
  success: boolean;
  message: string;
  data: {
    role: Role;
  };
  timestamp: string;
}

// Permission definitions for UI
export interface PermissionDefinition {
  title: string;
  icon: string;
  permissions: {
    [key: string]: {
      name: string;
      desc: string;
    };
  };
}

export interface PermissionGroup {
  [key: string]: PermissionDefinition;
}