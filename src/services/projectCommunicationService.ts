import api from './api';

const API_BASE = '/project-communications';

export interface ProjectCommunication {
  _id: string;
  id: string;
  project_id: {
    _id: string;
    id: string;
    project_name: string;
  };
  sender_id: {
    _id: string;
    id: string;
    email: string;
    full_name: string;
  };
  recipient_id?: {
    _id: string;
    id: string;
    email: string;
    full_name: string;
  };
  subject: string;
  message: string;
  communication_type: 'EMAIL' | 'MESSAGE' | 'ANNOUNCEMENT' | 'NOTIFICATION';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'DRAFT' | 'SENT' | 'READ' | 'ARCHIVED';
  attachments?: Array<{
    filename: string;
    url: string;
    size: number;
  }>;
  created_at: string;
  updated_at: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface ProjectCommunicationsResponse {
  success: boolean;
  message: string;
  data: ProjectCommunication[];
  timestamp: string;
}

export interface CreateCommunicationData {
  project_id: string;
  recipient_id?: string;
  subject: string;
  message: string;
  communication_type: 'EMAIL' | 'MESSAGE' | 'ANNOUNCEMENT' | 'NOTIFICATION';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  attachments?: Array<{
    filename: string;
    url: string;
    size: number;
  }>;
}

export const projectCommunicationService = {
  // Get all communications for a project
  getProjectCommunications: async (projectId: string): Promise<{ data: ProjectCommunication[]; success: boolean; message?: string }> => {
    try {
      const response = await api.get<ProjectCommunicationsResponse>(`${API_BASE}/project/${projectId}/communications`);
      return { 
        data: response.data.data || [], 
        success: true 
      };
    } catch (error) {
      console.error('Error fetching project communications:', error);
      return { 
        data: [], 
        success: false, 
        message: 'Failed to fetch project communications' 
      };
    }
  },

  // Get communication by ID
  getCommunicationById: async (communicationId: string): Promise<{ data: ProjectCommunication | null; success: boolean; message?: string }> => {
    try {
      const response = await api.get<{ success: boolean; data: ProjectCommunication }>(`${API_BASE}/communications/${communicationId}`);
      return { 
        data: response.data.data || null, 
        success: true 
      };
    } catch (error) {
      console.error('Error fetching communication:', error);
      return { 
        data: null, 
        success: false, 
        message: 'Failed to fetch communication' 
      };
    }
  },

  // Create new communication
  createCommunication: async (communicationData: CreateCommunicationData): Promise<{ data: ProjectCommunication | null; success: boolean; message?: string }> => {
    try {
      const response = await api.post<{ success: boolean; data: ProjectCommunication }>(`${API_BASE}/communications`, communicationData);
      return { 
        data: response.data.data || null, 
        success: true 
      };
    } catch (error) {
      console.error('Error creating communication:', error);
      return { 
        data: null, 
        success: false, 
        message: 'Failed to create communication' 
      };
    }
  },

  // Update communication
  updateCommunication: async (communicationId: string, communicationData: Partial<CreateCommunicationData>): Promise<{ data: ProjectCommunication | null; success: boolean; message?: string }> => {
    try {
      const response = await api.put<{ success: boolean; data: ProjectCommunication }>(`${API_BASE}/communications/${communicationId}`, communicationData);
      return { 
        data: response.data.data || null, 
        success: true 
      };
    } catch (error) {
      console.error('Error updating communication:', error);
      return { 
        data: null, 
        success: false, 
        message: 'Failed to update communication' 
      };
    }
  },

  // Delete communication
  deleteCommunication: async (communicationId: string): Promise<{ success: boolean; message?: string }> => {
    try {
      await api.delete(`${API_BASE}/communications/${communicationId}`);
      return { 
        success: true 
      };
    } catch (error) {
      console.error('Error deleting communication:', error);
      return { 
        success: false, 
        message: 'Failed to delete communication' 
      };
    }
  },

  // Mark communication as read
  markAsRead: async (communicationId: string): Promise<{ data: ProjectCommunication | null; success: boolean; message?: string }> => {
    try {
      const response = await api.put<{ success: boolean; data: ProjectCommunication }>(`${API_BASE}/communications/${communicationId}/read`);
      return { 
        data: response.data.data || null, 
        success: true 
      };
    } catch (error) {
      console.error('Error marking communication as read:', error);
      return { 
        data: null, 
        success: false, 
        message: 'Failed to mark communication as read' 
      };
    }
  },

  // Archive communication
  archiveCommunication: async (communicationId: string): Promise<{ data: ProjectCommunication | null; success: boolean; message?: string }> => {
    try {
      const response = await api.put<{ success: boolean; data: ProjectCommunication }>(`${API_BASE}/communications/${communicationId}/archive`);
      return { 
        data: response.data.data || null, 
        success: true 
      };
    } catch (error) {
      console.error('Error archiving communication:', error);
      return { 
        data: null, 
        success: false, 
        message: 'Failed to archive communication' 
      };
    }
  },

  // Get communications for a specific user
  getUserCommunications: async (userId: string): Promise<{ data: ProjectCommunication[]; success: boolean; message?: string }> => {
    try {
      const response = await api.get<ProjectCommunicationsResponse>(`${API_BASE}/user/${userId}/communications`);
      return { 
        data: response.data.data || [], 
        success: true 
      };
    } catch (error) {
      console.error('Error fetching user communications:', error);
      return { 
        data: [], 
        success: false, 
        message: 'Failed to fetch user communications' 
      };
    }
  }
};

export default projectCommunicationService;

