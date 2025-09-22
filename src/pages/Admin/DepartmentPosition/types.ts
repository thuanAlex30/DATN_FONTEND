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

export interface HierarchyNode {
  id: string;
  name: string;
  type: 'department' | 'position' | 'employee';
  level: number;
  children: HierarchyNode[];
  data: any;
  employeeCount?: number;
  isExpanded?: boolean;
}

export interface OrganizationChartProps {
  departments: any[];
  positions: any[];
  departmentEmployeeCounts: Record<string, number>;
}

export interface HierarchyTreeProps {
  departments: any[];
  positions: any[];
  departmentEmployeeCounts: Record<string, number>;
}

export interface HierarchyListProps {
  departments: any[];
  positions: any[];
  departmentEmployeeCounts: Record<string, number>;
}

export interface DepartmentEfficiency {
  name: string;
  employees: number;
  projects: number;
  efficiency: string;
}

// Analytics Types
export interface AnalyticsData {
  departmentStats: DepartmentAnalytics[];
  employeeDistribution: EmployeeDistributionData[];
  positionStats: PositionAnalytics[];
  overallStats: OverallStats;
}

export interface DepartmentAnalytics {
  id: string;
  name: string;
  employeeCount: number;
  positionCount: number;
  managerName: string;
  status: string;
  level: 'root' | 'managed';
}

export interface EmployeeDistributionData {
  departmentId: string;
  departmentName: string;
  employeeCount: number;
  percentage: number;
}

export interface PositionAnalytics {
  departmentId: string;
  departmentName: string;
  positions: {
    name: string;
    count: number;
    level: string;
  }[];
}

export interface OverallStats {
  totalDepartments: number;
  totalEmployees: number;
  totalPositions: number;
  rootDepartments: number;
  managedDepartments: number;
  departmentsWithManagers: number;
  departmentsWithoutManagers: number;
}

export interface AnalyticsDashboardProps {
  departments: any[];
  positions: any[];
  departmentEmployeeCounts: Record<string, number>;
}
