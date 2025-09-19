// DepartmentPosition types
export interface Department {
  department_id: number;
  department_name: string;
  description: string;
  parent_department_id: number | null;
  manager_id: number | null;
  is_active: boolean;
}

export interface Position {
  position_id: number;
  position_name: string;
  description: string;
  level: number;
  is_active: boolean;
}

export interface User {
  full_name: string;
  username: string;
  email: string;
  phone: string;
}

export interface Employee {
  employee_id: number;
  user_id: number;
  department_id: number;
  position_id: number;
  hire_date: string;
  contract_type: string;
  is_active: boolean;
}

export interface Project {
  project_id: number;
  project_name: string;
  status: string;
  leader_id: number;
  site_id: number | null;
}

export interface ProjectAssignment {
  assignment_id: number;
  project_id: number;
  user_id: number;
  role_in_project: string;
}

export interface DepartmentStats {
  totalDepartments: number;
  totalPositions: number;
  totalEmployees: number;
  totalProjects: number;
}

export interface DepartmentEfficiency {
  name: string;
  employees: number;
  projects: number;
  efficiency: string;
}
