export interface Department {
  id: string;
  department_name: string;
  description?: string;
  manager_id?: string;
  is_active: boolean;
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
