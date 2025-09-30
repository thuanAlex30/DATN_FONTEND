import api from './api';
import type { 
  CreateCheckpointData, 
  UpdateCheckpointData
} from '../types/qualityCheckpoint';

const API_BASE = '/quality-checkpoints';

export const qualityCheckpointService = {
  // Get all checkpoints for a task
  getTaskCheckpoints: async (taskId: string) => {
    try {
      const response = await api.get(`${API_BASE}/task/${taskId}/checkpoints`);
      return response.data;
    } catch (error) {
      console.error('Error fetching task checkpoints:', error);
      throw error;
    }
  },

  // Get checkpoint by ID
  getCheckpointById: async (id: string) => {
    try {
      const response = await api.get(`${API_BASE}/checkpoints/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching checkpoint:', error);
      throw error;
    }
  },

  // Create new checkpoint
  createCheckpoint: async (data: CreateCheckpointData) => {
    try {
      const response = await api.post(`${API_BASE}/checkpoints`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating checkpoint:', error);
      throw error;
    }
  },

  // Update checkpoint
  updateCheckpoint: async (id: string, data: UpdateCheckpointData) => {
    try {
      const response = await api.put(`${API_BASE}/checkpoints/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating checkpoint:', error);
      throw error;
    }
  },

  // Delete checkpoint
  deleteCheckpoint: async (id: string) => {
    try {
      const response = await api.delete(`${API_BASE}/checkpoints/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting checkpoint:', error);
      throw error;
    }
  },

  // Schedule checkpoint
  scheduleCheckpoint: async (id: string, scheduledDate: string, inspectorId: string) => {
    try {
      const response = await api.put(`${API_BASE}/checkpoints/${id}/schedule`, {
        scheduled_date: scheduledDate,
        inspector_id: inspectorId
      });
      return response.data;
    } catch (error) {
      console.error('Error scheduling checkpoint:', error);
      throw error;
    }
  },

  // Complete checkpoint inspection
  completeCheckpoint: async (id: string, inspectionData: {
    passed: boolean;
    notes?: string;
    issues_found?: string[];
    corrective_actions?: string[];
  }) => {
    try {
      const response = await api.put(`${API_BASE}/checkpoints/${id}/complete`, inspectionData);
      return response.data;
    } catch (error) {
      console.error('Error completing checkpoint:', error);
      throw error;
    }
  },

  // Get checkpoint statistics
  getCheckpointStats: async () => {
    try {
      const response = await api.get(`${API_BASE}/checkpoints/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching checkpoint stats:', error);
      throw error;
    }
  },

  // Get overdue checkpoints
  getOverdueCheckpoints: async () => {
    try {
      const response = await api.get(`${API_BASE}/checkpoints/overdue`);
      return response.data;
    } catch (error) {
      console.error('Error fetching overdue checkpoints:', error);
      throw error;
    }
  },

  // Get checkpoints by inspector
  getCheckpointsByInspector: async (inspectorId: string) => {
    try {
      const response = await api.get(`${API_BASE}/checkpoints/inspector/${inspectorId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching checkpoints by inspector:', error);
      throw error;
    }
  }
};

export default qualityCheckpointService;