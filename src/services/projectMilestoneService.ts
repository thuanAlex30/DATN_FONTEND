import api from './api';

const API_BASE = '/project-milestones';

export interface ProjectMilestone {
  id: string;
  project_id: {
    project_name: string;
    id: string;
  };
  milestone_name: string;
  description: string;
  planned_date: string;
  milestone_type: 'PHASE_COMPLETION' | 'DELIVERY' | 'REVIEW' | 'MILESTONE';
  completion_criteria: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED';
  responsible_user_id: {
    email: string;
    full_name: string;
    id: string;
  };
  is_critical: boolean;
  created_by: {
    email: string;
    full_name: string;
    id: string;
  };
  created_at: string;
  updated_at: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface ProjectMilestonesResponse {
  success: boolean;
  message: string;
  data: ProjectMilestone[];
  timestamp: string;
}

export interface CreateMilestoneData {
  project_id: string;
  phase_id?: string;
  milestone_name: string;
  description?: string;
  planned_date: string;
  milestone_type: string;
  completion_criteria?: string;
  responsible_user_id: string;
  is_critical?: boolean;
}

export const projectMilestoneService = {
  // Get milestones for a specific project
  getProjectMilestones: async (projectId: string): Promise<{ data: ProjectMilestone[]; success: boolean; message?: string }> => {
    try {
      const response = await api.get<ProjectMilestonesResponse>(`${API_BASE}/project/${projectId}/milestones`);
      return { 
        data: response.data.data || [], 
        success: true 
      };
    } catch (error) {
      console.error('Error fetching project milestones:', error);
      return { 
        data: [], 
        success: false, 
        message: 'Failed to fetch project milestones' 
      };
    }
  },

  // Get milestones assigned to a specific user (manager)
  getAssignedMilestones: async (userId: string): Promise<{ data: ProjectMilestone[]; success: boolean; message?: string }> => {
    try {
      const response = await api.get<ProjectMilestonesResponse>(`${API_BASE}/milestones/assigned/${userId}`);
      return { 
        data: response.data.data || [], 
        success: true 
      };
    } catch (error) {
      console.error('Error fetching assigned milestones:', error);
      return { 
        data: [], 
        success: false, 
        message: 'Failed to fetch assigned milestones' 
      };
    }
  },

  // Get milestone by ID
  getMilestoneById: async (milestoneId: string): Promise<{ data: ProjectMilestone | null; success: boolean; message?: string }> => {
    try {
      const response = await api.get<{ success: boolean; data: ProjectMilestone }>(`${API_BASE}/milestones/${milestoneId}`);
      return { 
        data: response.data.data || null, 
        success: true 
      };
    } catch (error) {
      console.error('Error fetching milestone:', error);
      return { 
        data: null, 
        success: false, 
        message: 'Failed to fetch milestone' 
      };
    }
  },

  // Update milestone status
  updateMilestoneStatus: async (milestoneId: string, status: ProjectMilestone['status']): Promise<{ data: ProjectMilestone | null; success: boolean; message?: string }> => {
    try {
      const response = await api.put<{ success: boolean; data: ProjectMilestone }>(`${API_BASE}/milestones/${milestoneId}/status`, { status });
      return { 
        data: response.data.data || null, 
        success: true 
      };
    } catch (error) {
      console.error('Error updating milestone status:', error);
      return { 
        data: null, 
        success: false, 
        message: 'Failed to update milestone status' 
      };
    }
  },

  // Update milestone progress
  updateMilestoneProgress: async (milestoneId: string, progress: string): Promise<{ data: ProjectMilestone | null; success: boolean; message?: string }> => {
    try {
      const response = await api.put<{ success: boolean; data: ProjectMilestone }>(`${API_BASE}/milestones/${milestoneId}/progress`, { progress });
      return { 
        data: response.data.data || null, 
        success: true 
      };
    } catch (error) {
      console.error('Error updating milestone progress:', error);
      return { 
        data: null, 
        success: false, 
        message: 'Failed to update milestone progress' 
      };
    }
  },

  // Create new milestone
  createMilestone: async (milestoneData: CreateMilestoneData): Promise<{ data: ProjectMilestone | null; success: boolean; message?: string }> => {
    try {
      const response = await api.post<{ success: boolean; data: ProjectMilestone }>(`${API_BASE}/milestones`, milestoneData);
      return { 
        data: response.data.data || null, 
        success: true 
      };
    } catch (error) {
      console.error('Error creating milestone:', error);
      return { 
        data: null, 
        success: false, 
        message: 'Failed to create milestone' 
      };
    }
  },

  // Delete milestone
  deleteMilestone: async (milestoneId: string): Promise<{ success: boolean; message?: string }> => {
    try {
      await api.delete(`${API_BASE}/milestones/${milestoneId}`);
      return { 
        success: true 
      };
    } catch (error) {
      console.error('Error deleting milestone:', error);
      return { 
        success: false, 
        message: 'Failed to delete milestone' 
      };
    }
  }
};

export default projectMilestoneService;