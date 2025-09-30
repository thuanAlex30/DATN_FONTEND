export interface ProjectMilestone {
  id: string;
  project_id: string;
  phase_id?: string;
  milestone_name: string;
  description?: string;
  planned_date: string;
  actual_date?: string;
  milestone_type: 'PHASE_COMPLETION' | 'DELIVERY' | 'APPROVAL' | 'REVIEW' | 'TESTING';
  completion_criteria?: string;
  responsible_user_id?: string;
  is_critical: boolean;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE' | 'CANCELLED';
  deliverables?: MilestoneDeliverable[];
  created_at: string;
  updated_at: string;
}

export interface MilestoneDeliverable {
  id: string;
  milestone_id: string;
  deliverable_name: string;
  deliverable_type: 'DOCUMENT' | 'CODE' | 'DESIGN' | 'REPORT' | 'PRESENTATION' | 'DEMO';
  description?: string;
  acceptance_criteria?: string;
  file_path?: string;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  submitted_by?: string;
  reviewer_id?: string;
  submitted_at?: string;
  reviewed_at?: string;
  feedback?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateMilestoneData {
  project_id: string;
  phase_id?: string;
  milestone_name: string;
  description?: string;
  planned_date: string;
  milestone_type: 'PHASE_COMPLETION' | 'DELIVERY' | 'APPROVAL' | 'REVIEW' | 'TESTING';
  completion_criteria?: string;
  responsible_user_id?: string;
  is_critical: boolean;
}

export interface UpdateMilestoneData {
  milestone_name?: string;
  description?: string;
  planned_date?: string;
  actual_date?: string;
  milestone_type?: 'PHASE_COMPLETION' | 'DELIVERY' | 'APPROVAL' | 'REVIEW' | 'TESTING';
  completion_criteria?: string;
  responsible_user_id?: string;
  is_critical?: boolean;
  status?: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE' | 'CANCELLED';
}

export interface CreateDeliverableData {
  milestone_id: string;
  deliverable_name: string;
  deliverable_type: 'DOCUMENT' | 'CODE' | 'DESIGN' | 'REPORT' | 'PRESENTATION' | 'DEMO';
  description?: string;
  acceptance_criteria?: string;
  reviewer_id?: string;
}

export interface MilestoneStats {
  total: number;
  pending: number;
  completed: number;
  overdue: number;
}
