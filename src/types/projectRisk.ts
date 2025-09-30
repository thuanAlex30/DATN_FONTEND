export interface ProjectRisk {
  id: string;
  project_id: string;
  phase_id?: string;
  risk_name: string;
  risk_description: string;
  risk_category: 'TECHNICAL' | 'FINANCIAL' | 'SCHEDULE' | 'RESOURCE' | 'QUALITY' | 'EXTERNAL' | 'OPERATIONAL';
  probability: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  impact_score: number;
  risk_score: number;
  status: 'IDENTIFIED' | 'ANALYZED' | 'MITIGATED' | 'ACCEPTED' | 'CLOSED';
  mitigation_plan?: string;
  contingency_plan?: string;
  owner_id: string;
  identified_by: string;
  identified_date: string;
  last_reviewed?: string;
  next_review?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateRiskData {
  project_id: string;
  phase_id?: string;
  risk_name: string;
  risk_description: string;
  risk_category: 'TECHNICAL' | 'FINANCIAL' | 'SCHEDULE' | 'RESOURCE' | 'QUALITY' | 'EXTERNAL' | 'OPERATIONAL';
  probability: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  impact_score: number;
  mitigation_plan?: string;
  contingency_plan?: string;
  owner_id: string;
}

export interface UpdateRiskData {
  risk_name?: string;
  risk_description?: string;
  risk_category?: 'TECHNICAL' | 'FINANCIAL' | 'SCHEDULE' | 'RESOURCE' | 'QUALITY' | 'EXTERNAL' | 'OPERATIONAL';
  probability?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  impact_score?: number;
  status?: 'IDENTIFIED' | 'ANALYZED' | 'MITIGATED' | 'ACCEPTED' | 'CLOSED';
  mitigation_plan?: string;
  contingency_plan?: string;
  owner_id?: string;
  last_reviewed?: string;
  next_review?: string;
}

export interface RiskStats {
  total_risks: number;
  identified_risks: number;
  mitigated_risks: number;
  accepted_risks: number;
  closed_risks: number;
  high_priority_risks: number;
  critical_risks: number;
  average_risk_score: number;
}