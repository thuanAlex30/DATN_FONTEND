import api from './api';

const API_BASE = '/projects';

export interface ProjectTimeline {
  _id: string;
  id: string;
  project_id: string;
  event_type: 'MILESTONE' | 'TASK' | 'RISK' | 'RESOURCE' | 'MEETING' | 'DEADLINE';
  title: string;
  description: string;
  event_date: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  related_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTimelineEventData {
  project_id: string;
  event_type: 'MILESTONE' | 'TASK' | 'RISK' | 'RESOURCE' | 'MEETING' | 'DEADLINE';
  title: string;
  description: string;
  event_date: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  related_id?: string;
}

export interface UpdateTimelineEventData {
  title?: string;
  description?: string;
  event_date?: string;
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

export const projectTimelineService = {
  // Get timeline for a project
  getProjectTimeline: async (projectId: string) => {
    try {
      const response = await api.get(`${API_BASE}/${projectId}/timeline`);
      return { data: response.data.data || [], success: true };
    } catch (error) {
      console.error('Error fetching project timeline:', error);
      return { data: [], success: false, message: 'Failed to fetch project timeline' };
    }
  },

  // Get upcoming events
  getUpcomingEvents: async (projectId: string, days: number = 7) => {
    try {
      const response = await api.get(`${API_BASE}/upcoming/${projectId}`, {
        params: { days }
      });
      return { data: response.data.data || [], success: true };
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      return { data: [], success: false, message: 'Failed to fetch upcoming events' };
    }
  },

  // Create timeline event
  createTimelineEvent: async (data: CreateTimelineEventData) => {
    try {
      const response = await api.post(`${API_BASE}`, data);
      return { data: response.data.data, success: true };
    } catch (error) {
      console.error('Error creating timeline event:', error);
      return { data: null, success: false, message: 'Failed to create timeline event' };
    }
  },

  // Update timeline event
  updateTimelineEvent: async (id: string, data: UpdateTimelineEventData) => {
    try {
      const response = await api.put(`${API_BASE}/${id}`, data);
      return { data: response.data.data, success: true };
    } catch (error) {
      console.error('Error updating timeline event:', error);
      return { data: null, success: false, message: 'Failed to update timeline event' };
    }
  },

  // Delete timeline event
  deleteTimelineEvent: async (id: string) => {
    try {
      const response = await api.delete(`${API_BASE}/${id}`);
      return { data: response.data.data, success: true };
    } catch (error) {
      console.error('Error deleting timeline event:', error);
      return { data: null, success: false, message: 'Failed to delete timeline event' };
    }
  },

  // Get timeline statistics
  getTimelineStats: async (projectId: string) => {
    try {
      const response = await api.get(`${API_BASE}/stats/${projectId}`);
      return { data: response.data.data, success: true };
    } catch (error) {
      console.error('Error fetching timeline stats:', error);
      return { data: null, success: false, message: 'Failed to fetch timeline stats' };
    }
  }
};

export default projectTimelineService;
