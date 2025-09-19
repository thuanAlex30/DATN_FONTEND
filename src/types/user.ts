export interface User {
  id: string;
  username: string;
  email: string;
  full_name: string;
  phone?: string;
  role: {
    _id: string;
    role_name: string;
    permissions: Record<string, boolean>;
    is_active: boolean;
  };
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
