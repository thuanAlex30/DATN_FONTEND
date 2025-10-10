import api from './api';

const API_BASE = '/project-risks';

export interface ProjectRisk {
  _id: string;
  project_id: {
    _id: string;
    project_name: string;
  };
  risk_name: string;
  description: string;
  risk_category: 'SAFETY' | 'FINANCIAL' | 'SCHEDULE' | 'TECHNICAL' | 'ENVIRONMENTAL';
  probability: number;
  impact_score: number;
  risk_score: number;
  mitigation_plan: string;
  contingency_plan?: string;
  owner_id: {
    _id: string;
    email: string;
    full_name: string;
    id: string;
  };
  status: 'IDENTIFIED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  identified_date: string;
  target_resolution_date: string;
  cost_impact: number;
  schedule_impact_days: number;
  created_at: string;
  updated_at: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface ProjectRisksResponse {
  success: boolean;
  message: string;
  data: ProjectRisk[];
  timestamp: string;
}

export const projectRiskService = {
  // Get risks assigned to a specific user (manager)
  getAssignedRisks: async (userId: string): Promise<{ data: ProjectRisk[]; success: boolean; message?: string }> => {
    try {
      const response = await api.get<ProjectRisksResponse>(`${API_BASE}/risks/assigned/${userId}`);
      return { 
        data: response.data.data || [], 
        success: true 
      };
    } catch (error) {
      console.error('Error fetching assigned risks:', error);
    return {
        data: [], 
        success: false, 
        message: 'Failed to fetch assigned risks' 
    };
  }
  },

  // Get all risks for a project
  getProjectRisks: async (projectId: string): Promise<{ data: ProjectRisk[]; success: boolean; message?: string }> => {
    try {
      const response = await api.get<ProjectRisksResponse>(`${API_BASE}/project/${projectId}/risks`);
      return { 
        data: response.data.data || [], 
        success: true 
      };
    } catch (error) {
      console.error('Error fetching project risks:', error);
      return { 
        data: [], 
        success: false, 
        message: 'Failed to fetch project risks' 
      };
    }
  },

  // Get risk by ID
  getRiskById: async (riskId: string): Promise<{ data: ProjectRisk | null; success: boolean; message?: string }> => {
    try {
      const response = await api.get<{ success: boolean; data: ProjectRisk }>(`${API_BASE}/risks/${riskId}`);
      return { 
        data: response.data.data || null, 
        success: true 
      };
    } catch (error) {
      console.error('Error fetching risk:', error);
      return { 
        data: null, 
        success: false, 
        message: 'Failed to fetch risk' 
      };
    }
  },

  // Update risk status
  updateRiskStatus: async (riskId: string, status: ProjectRisk['status']): Promise<{ data: ProjectRisk | null; success: boolean; message?: string }> => {
    try {
      const response = await api.put<{ success: boolean; data: ProjectRisk }>(`${API_BASE}/risks/${riskId}/status`, { status });
      return { 
        data: response.data.data || null, 
        success: true 
      };
    } catch (error) {
      console.error('Error updating risk status:', error);
      return { 
        data: null, 
        success: false, 
        message: 'Failed to update risk status' 
      };
    }
  },

  // Update risk progress
  updateRiskProgress: async (riskId: string, progress: string): Promise<{ data: ProjectRisk | null; success: boolean; message?: string }> => {
    try {
      const response = await api.put<{ success: boolean; data: ProjectRisk }>(`${API_BASE}/risks/${riskId}/progress`, { progress });
      return { 
        data: response.data.data || null, 
        success: true 
      };
    } catch (error) {
      console.error('Error updating risk progress:', error);
      return { 
        data: null, 
        success: false, 
        message: 'Failed to update risk progress' 
      };
    }
  },

  // Create risk
  createRisk: async (data: any): Promise<{ data: ProjectRisk | null; success: boolean; message?: string }> => {
    try {
      const response = await api.post<{ success: boolean; data: ProjectRisk }>(`${API_BASE}/risks`, data);
      return { 
        data: response.data.data || null, 
        success: true 
      };
    } catch (error) {
      console.error('Error creating risk:', error);
      return { 
        data: null, 
        success: false, 
        message: 'Failed to create risk' 
      };
    }
  },

  // Update risk
  updateRisk: async (riskId: string, data: any): Promise<{ data: ProjectRisk | null; success: boolean; message?: string }> => {
    try {
      const response = await api.put<{ success: boolean; data: ProjectRisk }>(`${API_BASE}/risks/${riskId}`, data);
      return { 
        data: response.data.data || null, 
        success: true 
      };
    } catch (error) {
      console.error('Error updating risk:', error);
      return { 
        data: null, 
        success: false, 
        message: 'Failed to update risk' 
      };
    }
  },

  // Delete risk
  deleteRisk: async (riskId: string): Promise<{ success: boolean; message?: string }> => {
    try {
      await api.delete(`${API_BASE}/risks/${riskId}`);
      return { 
        success: true 
      };
    } catch (error) {
      console.error('Error deleting risk:', error);
      return { 
        success: false, 
        message: 'Failed to delete risk' 
      };
    }
  },

  // Get risk stats
  getRiskStats: async (): Promise<{ data: any; success: boolean; message?: string }> => {
    try {
      const response = await api.get(`${API_BASE}/stats`);
      return { 
        data: response.data.data || {}, 
        success: true 
      };
    } catch (error) {
      console.error('Error fetching risk stats:', error);
      return { 
        data: {}, 
        success: false, 
        message: 'Failed to fetch risk stats' 
      };
    }
  },

  // Get risks by category
  getRisksByCategory: async (category: string): Promise<{ data: ProjectRisk[]; success: boolean; message?: string }> => {
    try {
      const response = await api.get(`${API_BASE}/risks/category/${category}`);
      return { 
        data: response.data.data || [], 
        success: true 
      };
    } catch (error) {
      console.error('Error fetching risks by category:', error);
      return { 
        data: [], 
        success: false, 
        message: 'Failed to fetch risks by category' 
      };
    }
  }
};

export default projectRiskService;