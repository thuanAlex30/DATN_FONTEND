export interface ProjectRisk {
  id: string;
  project_id: string;
  phase_id?: string;
  risk_name: string;
  description: string;
  risk_category: 'TECHNICAL' | 'FINANCIAL' | 'SCHEDULE' | 'SAFETY' | 'ENVIRONMENTAL' | 'REGULATORY' | 'SUPPLIER' | 'PERSONNEL';
  probability: number;
  impact_score: number;
  risk_score: number;
  mitigation_plan: string;
  owner_id: string;
  status: 'IDENTIFIED' | 'ANALYZED' | 'MITIGATED' | 'MONITORED' | 'CLOSED';
  identified_date: string;
  target_resolution_date: string;
  actual_resolution_date?: string;
  cost_impact: number;
  schedule_impact_days: number;
  created_at: string;
  updated_at: string;
}

export interface CreateRiskData {
  project_id: string;
  phase_id?: string;
  risk_name: string;
  description: string;
  risk_category: string;
  probability: number;
  impact_score: number;
  mitigation_plan: string;
  owner_id: string;
  target_resolution_date: string;
  cost_impact?: number;
  schedule_impact_days?: number;
}

export interface UpdateRiskData {
  risk_name?: string;
  description?: string;
  risk_category?: string;
  probability?: number;
  impact_score?: number;
  status?: string;
  mitigation_plan?: string;
  owner_id?: string;
  actual_resolution_date?: string;
  cost_impact?: number;
  schedule_impact_days?: number;
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