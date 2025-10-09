export interface ProjectTask {
  _id: string;
  id: string;
  project_id: string;
  task_code: string;
  task_name: string;
  description: string;
  planned_start_date: string;
  planned_end_date: string;
  progress_percentage: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  planned_duration_hours: number;
  actual_duration_hours: number;
  task_type: 'CONSTRUCTION' | 'INSPECTION' | 'DOCUMENTATION' | 'PLANNING' | 'COORDINATION' | 'SAFETY' | 'QUALITY';
  area_id: string;
  location_id: string;
  created_at: string;
  updated_at: string;
}

export interface TaskAssignment {
  id: string;
  task_id: string;
  user_id: string;
  user_name?: string;
  assigned_date: string;
  due_date: string;
  status: 'assigned' | 'in_progress' | 'completed' | 'overdue';
  hours_allocated: number;
  hours_worked: number;
  created_at: string;
  updated_at: string;
}

export interface TaskDependency {
  id: string;
  task_id: string;
  depends_on_task_id: string;
  dependency_type: 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish';
  created_at: string;
}

export interface TaskProgressLog {
  id: string;
  task_id: string;
  user_id: string;
  user_name?: string;
  progress_percentage: number;
  hours_worked: number;
  work_description: string;
  log_date: string;
  created_at: string;
}

export interface CreateTaskData {
  project_id: string;
  task_code: string;
  task_name: string;
  description: string;
  planned_start_date: string;
  planned_end_date: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  planned_duration_hours: number;
  task_type: 'CONSTRUCTION' | 'INSPECTION' | 'DOCUMENTATION' | 'PLANNING' | 'COORDINATION' | 'SAFETY' | 'QUALITY';
  area_id: string;
  location_id: string;
  progress_percentage?: number;
}

export interface UpdateTaskData {
  task_code?: string;
  task_name?: string;
  description?: string;
  planned_start_date?: string;
  planned_end_date?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  planned_duration_hours?: number;
  task_type?: 'CONSTRUCTION' | 'INSPECTION' | 'DOCUMENTATION' | 'PLANNING' | 'COORDINATION' | 'SAFETY' | 'QUALITY';
  area_id?: string;
  location_id?: string;
  progress_percentage?: number;
}

export interface CreateAssignmentData {
  task_id: string;
  user_id: string;
  due_date: string;
  hours_allocated: number;
}

export interface UpdateAssignmentData {
  user_id?: string;
  due_date?: string;
  hours_allocated?: number;
  status?: 'assigned' | 'in_progress' | 'completed' | 'overdue';
}

export interface CreateDependencyData {
  task_id: string;
  depends_on_task_id: string;
  dependency_type: 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish';
}

export interface CreateProgressLogData {
  task_id: string;
  progress_percentage: number;
  hours_worked: number;
  work_description: string;
  log_date: string;
}

export interface TaskStats {
  total: number;
  pending: number;
  in_progress: number;
  completed: number;
  on_hold: number;
  cancelled: number;
  overdue: number;
  total_hours: number;
  completed_hours: number;
}
