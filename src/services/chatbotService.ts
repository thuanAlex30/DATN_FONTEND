import { api } from '../config/axios';

export interface NavigationAction {
  label: string;
  path: string;
  icon?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
  actions?: NavigationAction[];
}

export interface ChatHistoryResponse {
  success: boolean;
  data: {
    messages: ChatMessage[];
    sessionId: string;
  };
  message: string;
}

export interface SendMessageRequest {
  message: string;
  sessionId?: string;
}

export interface SendMessageResponse {
  success: boolean;
  data: {
    response: string;
    sessionId: string;
  };
  message: string;
}

export interface CreateSessionResponse {
  success: boolean;
  data: {
    sessionId: string;
  };
  message: string;
}

const chatbotService = {
  // Gửi tin nhắn
  sendMessage: (data: SendMessageRequest) =>
    api.post<SendMessageResponse>('/chatbot/message', data),

  // Lấy lịch sử chat
  getChatHistory: (sessionId: string) =>
    api.get<ChatHistoryResponse>('/chatbot/history', {
      params: { sessionId }
    }),

  // Xóa lịch sử chat
  clearChatHistory: (sessionId: string) =>
    api.delete('/chatbot/history', {
      data: { sessionId }
    }),

  // Tạo session mới
  createSession: () =>
    api.post<CreateSessionResponse>('/chatbot/session'),
};

export default chatbotService;

