export interface ProjectPhase {
  id: string;
  project_id: string;
  phase_name: string;
  phase_order: number;
  description?: string;
  planned_start_date: string;
  planned_end_date: string;
  actual_start_date?: string;
  actual_end_date?: string;
  planned_budget?: number;
  actual_budget?: number;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  progress_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface CreatePhaseData {
  project_id: string;
  phase_name: string;
  phase_order: number;
  description?: string;
  planned_start_date: string;
  planned_end_date: string;
  planned_budget?: number;
}

export interface UpdatePhaseData {
  phase_name?: string;
  phase_order?: number;
  description?: string;
  planned_start_date?: string;
  planned_end_date?: string;
  planned_budget?: number;
  actual_start_date?: string;
  actual_end_date?: string;
  actual_budget?: number;
  status?: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  progress_percentage?: number;
}

export interface PhaseStats {
  total_phases: number;
  completed_phases: number;
  in_progress_phases: number;
  planned_phases: number;
  average_progress: number;
  total_budget: number;
  spent_budget: number;
}

export interface PhaseTimeline {
  phase_id: string;
  phase_name: string;
  events: PhaseEvent[];
}

export interface PhaseEvent {
  id: string;
  event_type: 'START' | 'MILESTONE' | 'COMPLETION' | 'DELAY' | 'BUDGET_CHANGE';
  title: string;
  description: string;
  event_date: string;
  created_by: string;
}