import { api } from './api';

export interface ProjectRisk {
  _id: string;
  project_id: string;
  phase_id?: string;
  phase?: {
    _id: string;
    phase_name: string;
  };
  risk_name: string;
  description: string;
  risk_category: 'TECHNICAL' | 'FINANCIAL' | 'SCHEDULE' | 'SAFETY' | 'ENVIRONMENTAL' | 'REGULATORY' | 'SUPPLIER' | 'PERSONNEL';
  probability: number;
  impact_score: number;
  risk_score: number;
  mitigation_plan: string;
  owner_id: string;
  owner?: {
    _id: string;
    full_name: string;
    email: string;
  };
  status: 'IDENTIFIED' | 'ANALYZED' | 'MITIGATED' | 'MONITORED' | 'CLOSED';
  identified_date: string;
  target_resolution_date: string;
  actual_resolution_date?: string;
  cost_impact: number;
  schedule_impact_days: number;
  created_at: string;
  updated_at: string;
}

export interface CreateProjectRiskData {
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

export interface UpdateProjectRiskData extends Partial<CreateProjectRiskData> {
  actual_resolution_date?: string;
  status?: string;
}

class ProjectRiskService {
  // Get all risks for a project
  async getProjectRisks(projectId: string): Promise<ProjectRisk[]> {
    const response = await api.get(`/project-risks/project/${projectId}/risks`);
    return response.data.data;
  }

  // Get risk by ID
  async getRiskById(id: string): Promise<ProjectRisk> {
    const response = await api.get(`/project-risks/risks/${id}`);
    return response.data.data;
  }

  // Create new risk
  async createRisk(data: CreateProjectRiskData): Promise<ProjectRisk> {
    const response = await api.post('/project-risks/risks', data);
    return response.data.data;
  }

  // Update risk
  async updateRisk(id: string, data: UpdateProjectRiskData): Promise<ProjectRisk> {
    const response = await api.put(`/project-risks/risks/${id}`, data);
    return response.data.data;
  }

  // Delete risk
  async deleteRisk(id: string): Promise<void> {
    await api.delete(`/project-risks/risks/${id}`);
  }

  // Update risk status
  async updateRiskStatus(id: string, status: string, notes?: string): Promise<ProjectRisk> {
    const response = await api.put(`/project-risks/risks/${id}/status`, { status, notes });
    return response.data.data;
  }

  // Get risk statistics
  async getRiskStats(projectId: string): Promise<any> {
    const response = await api.get(`/project-risks/project/${projectId}/stats`);
    return response.data.data;
  }

  // Get all risks with filters
  async getAllRisks(filters?: {
    project_id?: string;
    risk_category?: string;
    status?: string;
    owner_id?: string;
    search?: string;
  }): Promise<ProjectRisk[]> {
    const response = await api.get('/project-risks/risks', { params: filters });
    return response.data.data;
  }

  // Search risks
  async searchRisks(query: string, filters?: {
    project_id?: string;
    risk_category?: string;
  }): Promise<ProjectRisk[]> {
    const response = await api.get('/project-risks/risks/search', {
      params: { q: query, ...filters }
    });
    return response.data.data;
  }

  // Get risk options
  async getRiskOptions(projectId: string): Promise<{ value: string; label: string }[]> {
    const response = await api.get(`/project-risks/project/${projectId}/options`);
    return response.data.data;
  }

  // Bulk create risks
  async bulkCreateRisks(risks: CreateProjectRiskData[]): Promise<ProjectRisk[]> {
    const response = await api.post('/project-risks/risks/bulk', { risks });
    return response.data.data;
  }

  // Bulk update risks
  async bulkUpdateRisks(updates: { id: string; data: UpdateProjectRiskData }[]): Promise<ProjectRisk[]> {
    const response = await api.put('/project-risks/risks/bulk', { updates });
    return response.data.data;
  }

  // Bulk delete risks
  async bulkDeleteRisks(ids: string[]): Promise<void> {
    await api.delete('/project-risks/risks/bulk', { data: { ids } });
  }

  // Calculate risk score
  calculateRiskScore(probability: number, impactScore: number): number {
    return probability * impactScore;
  }

  // Get risk level based on score
  getRiskLevel(riskScore: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (riskScore <= 1) return 'LOW';
    if (riskScore <= 2.5) return 'MEDIUM';
    if (riskScore <= 4) return 'HIGH';
    return 'CRITICAL';
  }
}

export default new ProjectRiskService();