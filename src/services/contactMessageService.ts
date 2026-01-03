import { api } from '../config/axios';

export interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  repliedAt?: string;
  replyMessage?: string;
  repliedBy?: {
    _id: string;
    username: string;
    email: string;
    full_name: string;
  };
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactMessageCreate {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactMessageQuery {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ContactMessageResponse {
  messages: ContactMessage[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class ContactMessageService {
  // Public - Create contact message (no auth required)
  async createMessage(data: ContactMessageCreate): Promise<ContactMessage> {
    try {
      const response = await api.post('/contact-messages', data);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('Error creating contact message:', error);
      throw error;
    }
  }

  // System Admin - Get all messages
  async getMessages(params?: ContactMessageQuery): Promise<ContactMessageResponse> {
    try {
      const response = await api.get('/contact-messages', { params });
      console.log('Contact messages response:', response.data);
      // Backend returns: { success, message, data: { messages, pagination } }
      if (response.data.data) {
        return response.data.data;
      }
      // Fallback if structure is different
      if (response.data.messages) {
        return response.data;
      }
      throw new Error('Unexpected response format');
    } catch (error: any) {
      console.error('Error fetching contact messages:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  }

  // System Admin - Get message by ID
  async getMessageById(id: string): Promise<ContactMessage> {
    try {
      const response = await api.get(`/contact-messages/${id}`);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('Error fetching contact message:', error);
      throw error;
    }
  }

  // System Admin - Mark as read
  async markAsRead(id: string): Promise<ContactMessage> {
    try {
      const response = await api.patch(`/contact-messages/${id}/read`);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('Error marking message as read:', error);
      throw error;
    }
  }

  // System Admin - Reply to message
  async replyToMessage(id: string, replyMessage: string): Promise<ContactMessage> {
    try {
      const response = await api.post(`/contact-messages/${id}/reply`, { replyMessage });
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('Error replying to message:', error);
      throw error;
    }
  }

  // System Admin - Archive message
  async archiveMessage(id: string): Promise<ContactMessage> {
    try {
      const response = await api.patch(`/contact-messages/${id}/archive`);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('Error archiving message:', error);
      throw error;
    }
  }

  // System Admin - Delete message
  async deleteMessage(id: string): Promise<void> {
    try {
      await api.delete(`/contact-messages/${id}`);
    } catch (error: any) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }

  // System Admin - Get unread count
  async getUnreadCount(): Promise<number> {
    try {
      const response = await api.get('/contact-messages/unread-count');
      return response.data.data?.count || 0;
    } catch (error: any) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  }
}

export default new ContactMessageService();

