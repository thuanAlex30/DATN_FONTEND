export interface ProjectChangeRequest {
  id: string;
  project_id: string;
  change_type: 'scope' | 'schedule' | 'budget' | 'resource' | 'quality' | 'risk';
  title: string;
  description: string;
  impact_assessment?: string;
  implementation_plan?: string;
  estimated_cost?: number;
  estimated_duration_days?: number;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'implemented';
  priority: 'low' | 'medium' | 'high' | 'critical';
  requested_by: string;
  reviewed_by?: string;
  approved_by?: string;
  submitted_at?: string;
  reviewed_at?: string;
  approved_at?: string;
  implemented_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateChangeRequestData {
  project_id: string;
  change_type: 'scope' | 'schedule' | 'budget' | 'resource' | 'quality' | 'risk';
  title: string;
  description: string;
  impact_assessment?: string;
  implementation_plan?: string;
  estimated_cost?: number;
  estimated_duration_days?: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface UpdateChangeRequestData {
  change_type?: 'scope' | 'schedule' | 'budget' | 'resource' | 'quality' | 'risk';
  title?: string;
  description?: string;
  impact_assessment?: string;
  implementation_plan?: string;
  estimated_cost?: number;
  estimated_duration_days?: number;
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

export interface ChangeRequestStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  implemented: number;
}
