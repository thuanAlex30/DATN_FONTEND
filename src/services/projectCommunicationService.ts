import api from './api';

const API_BASE = '/project-communication';

export interface ProjectMessage {
  _id: string;
  id: string;
  project_id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  message_type: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';
  reply_to?: string;
  attachments?: string[];
  created_at: string;
  updated_at: string;
}

export interface ProjectNotification {
  _id: string;
  id: string;
  project_id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'TASK' | 'MILESTONE' | 'RISK' | 'RESOURCE' | 'MEETING' | 'GENERAL';
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProjectMeeting {
  _id: string;
  id: string;
  project_id: string;
  title: string;
  description: string;
  meeting_date: string;
  duration: number;
  location: string;
  meeting_type: 'IN_PERSON' | 'ONLINE' | 'HYBRID';
  attendees: string[];
  agenda: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateMessageData {
  project_id: string;
  content: string;
  message_type: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';
  reply_to?: string;
  attachments?: string[];
}

export interface CreateNotificationData {
  project_id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'TASK' | 'MILESTONE' | 'RISK' | 'RESOURCE' | 'MEETING' | 'GENERAL';
}

export interface CreateMeetingData {
  project_id: string;
  title: string;
  description: string;
  meeting_date: string;
  duration: number;
  location: string;
  meeting_type: 'IN_PERSON' | 'ONLINE' | 'HYBRID';
  attendees: string[];
  agenda: string[];
}

export const projectCommunicationService = {
  // Messages
  getProjectMessages: async (projectId: string, page: number = 1, limit: number = 50) => {
    try {
      const response = await api.get(`${API_BASE}/${projectId}/messages`, {
        params: { page, limit }
      });
      return { data: response.data.data || [], success: true };
    } catch (error) {
      console.error('Error fetching project messages:', error);
      return { data: [], success: false, message: 'Failed to fetch project messages' };
    }
  },

  sendMessage: async (data: CreateMessageData) => {
    try {
      const response = await api.post(`${API_BASE}/messages`, data);
      return { data: response.data.data, success: true };
    } catch (error) {
      console.error('Error sending message:', error);
      return { data: null, success: false, message: 'Failed to send message' };
    }
  },

  deleteMessage: async (messageId: string) => {
    try {
      const response = await api.delete(`${API_BASE}/messages/${messageId}`);
      return { data: response.data.data, success: true };
    } catch (error) {
      console.error('Error deleting message:', error);
      return { data: null, success: false, message: 'Failed to delete message' };
    }
  },

  // Notifications
  getProjectNotifications: async (projectId: string) => {
    try {
      const response = await api.get(`${API_BASE}/${projectId}/notifications`);
      return { data: response.data.data || [], success: true };
    } catch (error) {
      console.error('Error fetching project notifications:', error);
      return { data: [], success: false, message: 'Failed to fetch project notifications' };
    }
  },

  getUserNotifications: async (userId: string, projectId?: string) => {
    try {
      let endpoint = `${API_BASE}/notifications/user/${userId}`;
      if (projectId) {
        endpoint = `${API_BASE}/project/${projectId}/notifications/user/${userId}`;
      }
      const response = await api.get(endpoint);
      return { data: response.data.data || [], success: true };
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      return { data: [], success: false, message: 'Failed to fetch user notifications' };
    }
  },

  createNotification: async (data: CreateNotificationData) => {
    try {
      const response = await api.post(`${API_BASE}/notifications`, data);
      return { data: response.data.data, success: true };
    } catch (error) {
      console.error('Error creating notification:', error);
      return { data: null, success: false, message: 'Failed to create notification' };
    }
  },

  markNotificationAsRead: async (notificationId: string) => {
    try {
      const response = await api.put(`${API_BASE}/notifications/${notificationId}/read`);
      return { data: response.data.data, success: true };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return { data: null, success: false, message: 'Failed to mark notification as read' };
    }
  },

  markAllNotificationsAsRead: async (userId: string, projectId?: string) => {
    try {
      let endpoint = `${API_BASE}/notifications/user/${userId}/read-all`;
      if (projectId) {
        endpoint = `${API_BASE}/project/${projectId}/notifications/user/${userId}/read-all`;
      }
      const response = await api.put(endpoint);
      return { data: response.data.data, success: true };
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return { data: null, success: false, message: 'Failed to mark all notifications as read' };
    }
  },

  // Meetings
  getProjectMeetings: async (projectId: string) => {
    try {
      const response = await api.get(`${API_BASE}/${projectId}/meetings`);
      return { data: response.data.data || [], success: true };
    } catch (error) {
      console.error('Error fetching project meetings:', error);
      return { data: [], success: false, message: 'Failed to fetch project meetings' };
    }
  },

  createMeeting: async (data: CreateMeetingData) => {
    try {
      const response = await api.post(`${API_BASE}/meetings`, data);
      return { data: response.data.data, success: true };
    } catch (error) {
      console.error('Error creating meeting:', error);
      return { data: null, success: false, message: 'Failed to create meeting' };
    }
  },

  updateMeeting: async (meetingId: string, data: Partial<CreateMeetingData>) => {
    try {
      const response = await api.put(`${API_BASE}/meetings/${meetingId}`, data);
      return { data: response.data.data, success: true };
    } catch (error) {
      console.error('Error updating meeting:', error);
      return { data: null, success: false, message: 'Failed to update meeting' };
    }
  },

  deleteMeeting: async (meetingId: string) => {
    try {
      const response = await api.delete(`${API_BASE}/meetings/${meetingId}`);
      return { data: response.data.data, success: true };
    } catch (error) {
      console.error('Error deleting meeting:', error);
      return { data: null, success: false, message: 'Failed to delete meeting' };
    }
  },

  // Statistics
  getCommunicationStats: async (projectId: string) => {
    try {
      const response = await api.get(`${API_BASE}/${projectId}/stats`);
      return { data: response.data.data, success: true };
    } catch (error) {
      console.error('Error fetching communication stats:', error);
      return { data: null, success: false, message: 'Failed to fetch communication stats' };
    }
  }
};

export default projectCommunicationService;
