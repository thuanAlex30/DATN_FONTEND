import api from './api';

const API_BASE = '/projects';

export interface ProjectAssignment {
  _id: string;
  id: string;
  project_id: string;
  user_id: string;
  role: string;
  assigned_date: string;
  status: 'ACTIVE' | 'INACTIVE' | 'COMPLETED';
  allocated_hours: number;
  actual_hours: number;
  created_at: string;
  updated_at: string;
}

export interface CreateProjectAssignmentData {
  project_id: string;
  user_id: string;
  role: string;
  allocated_hours: number;
}

export interface UpdateProjectAssignmentData {
  role?: string;
  allocated_hours?: number;
  status?: 'ACTIVE' | 'INACTIVE' | 'COMPLETED';
}

export const projectAssignmentService = {
  // Get all assignments for a project
  getProjectAssignments: async (projectId: string) => {
    try {
      const response = await api.get(`${API_BASE}/${projectId}/assignments`);
      return { data: response.data.data || [], success: true };
    } catch (error) {
      console.error('Error fetching project assignments:', error);
      return { data: [], success: false, message: 'Failed to fetch project assignments' };
    }
  },

  // Get assignments for a user
  getUserAssignments: async (userId: string) => {
    try {
      const response = await api.get(`${API_BASE}/user/${userId}`);
      return { data: response.data.data || [], success: true };
    } catch (error) {
      console.error('Error fetching user assignments:', error);
      return { data: [], success: false, message: 'Failed to fetch user assignments' };
    }
  },

  // Create new assignment
  createAssignment: async (data: CreateProjectAssignmentData) => {
    try {
      const response = await api.post(`${API_BASE}/${data.project_id}/assignments`, data);
      return { data: response.data.data, success: true };
    } catch (error) {
      console.error('Error creating assignment:', error);
      return { data: null, success: false, message: 'Failed to create assignment' };
    }
  },

  // Update assignment
  updateAssignment: async (id: string, data: UpdateProjectAssignmentData) => {
    try {
      const response = await api.put(`${API_BASE}/assignments/${id}`, data);
      return { data: response.data.data, success: true };
    } catch (error) {
      console.error('Error updating assignment:', error);
      return { data: null, success: false, message: 'Failed to update assignment' };
    }
  },

  // Delete assignment
  deleteAssignment: async (id: string) => {
    try {
      const response = await api.delete(`${API_BASE}/assignments/${id}`);
      return { data: response.data.data, success: true };
    } catch (error) {
      console.error('Error deleting assignment:', error);
      return { data: null, success: false, message: 'Failed to delete assignment' };
    }
  },

  // Get assignment statistics
  getAssignmentStats: async (projectId: string) => {
    try {
      const response = await api.get(`${API_BASE}/stats/${projectId}`);
      return { data: response.data.data, success: true };
    } catch (error) {
      console.error('Error fetching assignment stats:', error);
      return { data: null, success: false, message: 'Failed to fetch assignment stats' };
    }
  }
};

export default projectAssignmentService;
