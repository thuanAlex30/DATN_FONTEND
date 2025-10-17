import api from './api';

const API_BASE = '/ppe/assignments';

export interface PPEAssignment {
  _id: string;
  id: string;
  user_id: string;
  ppe_item_id: string;
  assignment_date: string;
  return_date?: string;
  status: 'ASSIGNED' | 'ISSUED' | 'RETURNED' | 'LOST' | 'DAMAGED';
  quantity: number;
  condition: 'NEW' | 'GOOD' | 'FAIR' | 'POOR';
  notes?: string;
  assigned_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePPEAssignmentData {
  user_id: string;
  ppe_item_id: string;
  quantity: number;
  condition: 'NEW' | 'GOOD' | 'FAIR' | 'POOR';
  notes?: string;
}

export interface UpdatePPEAssignmentData {
  status?: 'ASSIGNED' | 'ISSUED' | 'RETURNED' | 'LOST' | 'DAMAGED';
  condition?: 'NEW' | 'GOOD' | 'FAIR' | 'POOR';
  notes?: string;
  return_date?: string;
}

export const ppeAssignmentService = {
  // Get all PPE assignments
  getPPEAssignments: async (filters?: any) => {
    try {
      const response = await api.get(`${API_BASE}`, { params: filters });
      return { data: response.data.data || [], success: true };
    } catch (error) {
      console.error('Error fetching PPE assignments:', error);
      return { data: [], success: false, message: 'Failed to fetch PPE assignments' };
    }
  },

  // Get PPE assignment by ID
  getPPEAssignmentById: async (id: string) => {
    try {
      const response = await api.get(`${API_BASE}/${id}`);
      return { data: response.data.data, success: true };
    } catch (error) {
      console.error('Error fetching PPE assignment:', error);
      return { data: null, success: false, message: 'Failed to fetch PPE assignment' };
    }
  },

  // Get assignments for a user
  getUserPPEAssignments: async (userId: string) => {
    try {
      const response = await api.get(`${API_BASE}/user/${userId}`);
      return { data: response.data.data || [], success: true };
    } catch (error) {
      console.error('Error fetching user PPE assignments:', error);
      return { data: [], success: false, message: 'Failed to fetch user PPE assignments' };
    }
  },

  // Create new PPE assignment
  createPPEAssignment: async (data: CreatePPEAssignmentData) => {
    try {
      const response = await api.post(`${API_BASE}`, data);
      return { data: response.data.data, success: true };
    } catch (error) {
      console.error('Error creating PPE assignment:', error);
      return { data: null, success: false, message: 'Failed to create PPE assignment' };
    }
  },

  // Update PPE assignment
  updatePPEAssignment: async (id: string, data: UpdatePPEAssignmentData) => {
    try {
      const response = await api.put(`${API_BASE}/${id}`, data);
      return { data: response.data.data, success: true };
    } catch (error) {
      console.error('Error updating PPE assignment:', error);
      return { data: null, success: false, message: 'Failed to update PPE assignment' };
    }
  },

  // Delete PPE assignment
  deletePPEAssignment: async (id: string) => {
    try {
      const response = await api.delete(`${API_BASE}/${id}`);
      return { data: response.data.data, success: true };
    } catch (error) {
      console.error('Error deleting PPE assignment:', error);
      return { data: null, success: false, message: 'Failed to delete PPE assignment' };
    }
  },

  // Issue PPE
  issuePPE: async (id: string) => {
    try {
      const response = await api.post(`${API_BASE}/${id}/issue`);
      return { data: response.data.data, success: true };
    } catch (error) {
      console.error('Error issuing PPE:', error);
      return { data: null, success: false, message: 'Failed to issue PPE' };
    }
  },

  // Return PPE
  returnPPE: async (id: string, condition: string, notes?: string) => {
    try {
      const response = await api.post(`${API_BASE}/${id}/return`, { condition, notes });
      return { data: response.data.data, success: true };
    } catch (error) {
      console.error('Error returning PPE:', error);
      return { data: null, success: false, message: 'Failed to return PPE' };
    }
  },

  // Get PPE assignment statistics
  getPPEAssignmentStats: async () => {
    try {
      const response = await api.get(`${API_BASE}/stats`);
      return { data: response.data.data, success: true };
    } catch (error) {
      console.error('Error fetching PPE assignment stats:', error);
      return { data: null, success: false, message: 'Failed to fetch PPE assignment stats' };
    }
  }
};

export default ppeAssignmentService;
