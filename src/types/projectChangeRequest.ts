export interface ProjectChangeRequest {
  _id: string;
  id: string;
  project_id: string;
  request_type: 'SCOPE' | 'SCHEDULE' | 'RESOURCE' | 'QUALITY' | 'OTHER';
  title: string;
  description: string;
  reason: string;
  impact_analysis: string;
  proposed_solution: string;
  requested_by: string;
  requested_date: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'IMPLEMENTED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  estimated_schedule_impact: number;
  approved_by?: string;
  approved_date?: string;
  implementation_date?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateChangeRequestData {
  project_id: string;
  request_type: 'SCOPE' | 'SCHEDULE' | 'RESOURCE' | 'QUALITY' | 'OTHER';
  title: string;
  description: string;
  reason: string;
  impact_analysis: string;
  proposed_solution: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  estimated_schedule_impact: number;
}

export interface UpdateChangeRequestData {
  title?: string;
  description?: string;
  reason?: string;
  impact_analysis?: string;
  proposed_solution?: string;
  status?: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'IMPLEMENTED';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  estimated_schedule_impact?: number;
}