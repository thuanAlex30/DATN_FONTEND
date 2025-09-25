import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface WebSocketState {
  isConnected: boolean;
  connectionError: string | null;
  notifications: NotificationData[];
  unreadCount: number;
  lastActivity: string | null;
}

export interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  category: 'system' | 'training' | 'safety' | 'ppe' | 'project' | 'user' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  action_url?: string;
  isRead?: boolean;
}

const initialState: WebSocketState = {
  isConnected: false,
  connectionError: null,
  notifications: [],
  unreadCount: 0,
  lastActivity: null,
};

const websocketSlice = createSlice({
  name: 'websocket',
  initialState,
  reducers: {
    setConnectionStatus: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
      if (action.payload) {
        state.connectionError = null;
      }
    },
    setConnectionError: (state, action: PayloadAction<string>) => {
      state.connectionError = action.payload;
      state.isConnected = false;
    },
    addNotification: (state, action: PayloadAction<NotificationData>) => {
      const notification = action.payload;
      
      // Check if notification already exists by ID
      const existingById = state.notifications.findIndex(n => n.id === notification.id);
      if (existingById !== -1) {
        return; // Don't add duplicate
      }
      
      // Check if notification already exists by content (title + message + category)
      const existingByContent = state.notifications.findIndex(n => 
        n.title === notification.title && 
        n.message === notification.message && 
        n.category === notification.category &&
        // Check if created within last 5 seconds to prevent rapid duplicates
        new Date().getTime() - new Date(n.created_at).getTime() < 5000
      );
      
      if (existingByContent !== -1) {
        return; // Don't add duplicate
      }
      
      // Add to beginning of array and limit to 50 notifications
      state.notifications.unshift(notification);
      if (state.notifications.length > 50) {
        state.notifications = state.notifications.slice(0, 50);
      }
      state.unreadCount += 1;
      state.lastActivity = new Date().toISOString();
    },
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notificationId = action.payload;
      const notification = state.notifications.find(n => n.id === notificationId);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllNotificationsAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.isRead = true;
      });
      state.unreadCount = 0;
    },
    clearAllNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      const notificationId = action.payload;
      const notification = state.notifications.find(n => n.id === notificationId);
      if (notification && !notification.isRead) {
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
      state.notifications = state.notifications.filter(n => n.id !== notificationId);
    },
    updateLastActivity: (state) => {
      state.lastActivity = new Date().toISOString();
    },
  },
});

export const {
  setConnectionStatus,
  setConnectionError,
  addNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearAllNotifications,
  removeNotification,
  updateLastActivity,
} = websocketSlice.actions;

export default websocketSlice.reducer;
