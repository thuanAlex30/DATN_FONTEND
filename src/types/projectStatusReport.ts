export interface ProjectStatusReport {
  id: string;
  project_id: string;
  report_date: string;
  reporting_period_start: string;
  reporting_period_end: string;
  week_number?: number; // Add this property
  overall_progress: number;
  overall_status?: string; // Add this property
  progress_percentage?: number; // Add this property
  budget_utilization: number;
  tasks_completed: number;
  tasks_in_progress: number;
  tasks_overdue: number;
  completed_work?: string; // Add this property
  planned_work?: string; // Add this property
  issues_risks?: string; // Add this property
  notes?: string; // Add this property
  status_summary: string;
  key_achievements: string[];
  challenges_faced: string[];
  next_period_goals: string[];
  risks_identified: string[];
  budget_variance?: number;
  schedule_variance?: number;
  quality_metrics?: Record<string, any>;
  reported_by: string;
  approved_by?: string;
  approval_date?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateStatusReportData {
  project_id: string;
  report_date: string;
  reporting_period_start: string;
  reporting_period_end: string;
  overall_progress: number;
  budget_utilization: number;
  tasks_completed: number;
  tasks_in_progress: number;
  tasks_overdue: number;
  status_summary: string;
  key_achievements: string[];
  challenges_faced: string[];
  next_period_goals: string[];
  risks_identified: string[];
  budget_variance?: number;
  schedule_variance?: number;
  quality_metrics?: Record<string, any>;
}

export interface UpdateStatusReportData {
  report_date?: string;
  reporting_period_start?: string;
  reporting_period_end?: string;
  overall_progress?: number;
  budget_utilization?: number;
  tasks_completed?: number;
  tasks_in_progress?: number;
  tasks_overdue?: number;
  status_summary?: string;
  key_achievements?: string[];
  challenges_faced?: string[];
  next_period_goals?: string[];
  risks_identified?: string[];
  budget_variance?: number;
  schedule_variance?: number;
  quality_metrics?: Record<string, any>;
}

export interface StatusReportStats {
  total_reports: number;
  reports_this_month: number;
  average_progress: number;
  average_budget_utilization: number;
  projects_on_track: number;
  projects_at_risk: number;
  overdue_tasks_total: number;
}

export interface StatusReportTemplate {
  id: string;
  template_name: string;
  sections: ReportSection[];
  is_default: boolean;
  created_by: string;
  created_at: string;
}

export interface ReportSection {
  id: string;
  section_name: string;
  section_order: number;
  is_required: boolean;
  fields: ReportField[];
}

export interface ReportField {
  id: string;
  field_name: string;
  field_type: 'TEXT' | 'NUMBER' | 'DATE' | 'BOOLEAN' | 'SELECT' | 'MULTI_SELECT';
  is_required: boolean;
  options?: string[];
  validation_rules?: Record<string, any>;
}