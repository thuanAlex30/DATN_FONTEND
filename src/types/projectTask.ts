export interface ProjectTask {
  _id: string;
  id: string;
  phase_id: string;
  task_name: string;
  description: string;
  start_date: string;
  end_date: string;
  progress: number;
  status: 'pending' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimated_hours: number;
  actual_hours: number;
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
  phase_id: string;
  task_name: string;
  description: string;
  start_date: string;
  end_date: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimated_hours: number;
}

export interface UpdateTaskData {
  task_name?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  estimated_hours?: number;
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
