export interface Department {
  id: string;
  department_name: string;
  description?: string;
  manager_id?: {
    _id?: string;
    id?: string;
    username: string;
    full_name: string;
    email: string;
  };
  is_active: boolean;
  employees_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface DepartmentOption {
  id: string;
  department_name: string;
}

export interface DepartmentCreate {
  department_name: string;
  description?: string;
  manager_id?: string;
}

export interface DepartmentUpdate {
  department_name?: string;
  description?: string;
  manager_id?: string;
  is_active?: boolean;
}

export interface DepartmentQuery {
  page?: number;
  limit?: number;
  search?: string;
  is_active?: boolean;
}
