import api from './api';

const API_BASE = '/project-change-requests';

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

export const projectChangeRequestService = {
  // Get all change requests for a project
  getProjectChangeRequests: async (projectId: string) => {
    try {
      const response = await api.get(`${API_BASE}/project/${projectId}`);
      return { data: response.data.data || [], success: true };
    } catch (error) {
      console.error('Error fetching project change requests:', error);
      return { data: [], success: false, message: 'Failed to fetch project change requests' };
    }
  },

  // Get change request by ID
  getChangeRequestById: async (id: string) => {
    try {
      const response = await api.get(`${API_BASE}/${id}`);
      return { data: response.data.data, success: true };
    } catch (error) {
      console.error('Error fetching change request:', error);
      return { data: null, success: false, message: 'Failed to fetch change request' };
    }
  },

  // Create new change request
  createChangeRequest: async (data: CreateChangeRequestData) => {
    try {
      const response = await api.post(`${API_BASE}`, data);
      return { data: response.data.data, success: true };
    } catch (error) {
      console.error('Error creating change request:', error);
      return { data: null, success: false, message: 'Failed to create change request' };
    }
  },

  // Update change request
  updateChangeRequest: async (id: string, data: UpdateChangeRequestData) => {
    try {
      const response = await api.put(`${API_BASE}/${id}`, data);
      return { data: response.data.data, success: true };
    } catch (error) {
      console.error('Error updating change request:', error);
      return { data: null, success: false, message: 'Failed to update change request' };
    }
  },

  // Delete change request
  deleteChangeRequest: async (id: string) => {
    try {
      const response = await api.delete(`${API_BASE}/${id}`);
      return { data: response.data.data, success: true };
    } catch (error) {
      console.error('Error deleting change request:', error);
      return { data: null, success: false, message: 'Failed to delete change request' };
    }
  },

  // Approve change request
  approveChangeRequest: async (id: string, approvedBy: string) => {
    try {
      const response = await api.post(`${API_BASE}/${id}/approve`, { approved_by: approvedBy });
      return { data: response.data.data, success: true };
    } catch (error) {
      console.error('Error approving change request:', error);
      return { data: null, success: false, message: 'Failed to approve change request' };
    }
  },

  // Reject change request
  rejectChangeRequest: async (id: string, reason: string) => {
    try {
      const response = await api.post(`${API_BASE}/${id}/reject`, { reason });
      return { data: response.data.data, success: true };
    } catch (error) {
      console.error('Error rejecting change request:', error);
      return { data: null, success: false, message: 'Failed to reject change request' };
    }
  },

  // Get change request statistics
  getChangeRequestStats: async (projectId: string) => {
    try {
      const response = await api.get(`${API_BASE}/stats/${projectId}`);
      return { data: response.data.data, success: true };
    } catch (error) {
      console.error('Error fetching change request stats:', error);
      return { data: null, success: false, message: 'Failed to fetch change request stats' };
    }
  }
};

export default projectChangeRequestService;