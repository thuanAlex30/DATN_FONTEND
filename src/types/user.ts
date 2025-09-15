export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  department_id?: string;
  position_id?: string;
  is_active: boolean;
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
  role_id: string;
}

export interface UserUpdate {
  email?: string;
  full_name?: string;
  phone?: string;
  department_id?: string;
  position_id?: string;
}
