export interface User {
  id: string;
  username: string;
  email: string;
  full_name: string;
  phone?: string;
  role: {
    _id: string;
    role_name: string;
    role_code: string;
    role_level: number;
    scope_rules?: {
      tenant_scope?: 'global' | 'tenant' | 'self';
      department_scope?: 'all' | 'hierarchy' | 'own' | 'none';
      data_scope?: 'full' | 'department' | 'self';
      can_assign_lower_roles?: boolean;
    };
    permissions: Record<string, boolean>;
    is_active: boolean;
  };
  tenant_id?: string;
  department?: {
    _id: string;
    department_name: string;
    is_active: boolean;
  };
  position?: {
    _id: string;
    position_name: string;
    level: number;
    is_active: boolean;
  };
  is_active: boolean;
  created_at: string;
}

export interface UserQuery {
  page?: number;
  limit?: number;
  search?: string;
  is_active?: boolean;
  role?: string;
  role_id?: string;
  department_id?: string;
  position_id?: string;
}

export interface UserCreate {
  username: string;
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  birth_date?: string;
  address?: string;
  department_id?: string;
  position_id?: string;
}

export interface UserUpdate {
  email?: string;
  full_name?: string;
  phone?: string;
  department_id?: string;
  position_id?: string;
}
