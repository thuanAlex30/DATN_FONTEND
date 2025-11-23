import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import projectCommunicationService from '../../services/projectCommunicationService';
import type { 
  ProjectMessage, 
  ProjectNotification, 
  ProjectMeeting,
  CreateMessageData,
  CreateNotificationData,
  CreateMeetingData
} from '../../services/projectCommunicationService';

interface ProjectCommunicationState {
  messages: ProjectMessage[];
  notifications: ProjectNotification[];
  meetings: ProjectMeeting[];
  loading: boolean;
  error: string | null;
  stats: any;
}

const initialState: ProjectCommunicationState = {
  messages: [],
  notifications: [],
  meetings: [],
  loading: false,
  error: null,
  stats: null
};

// Async thunks
export const fetchProjectMessages = createAsyncThunk(
  'projectCommunication/fetchProjectMessages',
  async ({ projectId, page = 1, limit = 50 }: { projectId: string; page?: number; limit?: number }) => {
    const response = await projectCommunicationService.getProjectMessages(projectId, page, limit);
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to fetch project messages');
  }
);

export const sendMessage = createAsyncThunk(
  'projectCommunication/sendMessage',
  async (data: CreateMessageData) => {
    const response = await projectCommunicationService.sendMessage(data);
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to send message');
  }
);

export const deleteMessage = createAsyncThunk(
  'projectCommunication/deleteMessage',
  async (messageId: string) => {
    const response = await projectCommunicationService.deleteMessage(messageId);
    if (response.success) {
      return messageId;
    }
    throw new Error(response.message || 'Failed to delete message');
  }
);

export const fetchProjectNotifications = createAsyncThunk(
  'projectCommunication/fetchProjectNotifications',
  async (projectId: string) => {
    const response = await projectCommunicationService.getProjectNotifications(projectId);
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to fetch project notifications');
  }
);

export const fetchUserNotifications = createAsyncThunk(
  'projectCommunication/fetchUserNotifications',
  async (userId: string) => {
    const response = await projectCommunicationService.getUserNotifications(userId);
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to fetch user notifications');
  }
);

export const createNotification = createAsyncThunk(
  'projectCommunication/createNotification',
  async (data: CreateNotificationData) => {
    const response = await projectCommunicationService.createNotification(data);
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to create notification');
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'projectCommunication/markNotificationAsRead',
  async (notificationId: string) => {
    const response = await projectCommunicationService.markNotificationAsRead(notificationId);
    if (response.success) {
      return notificationId;
    }
    throw new Error(response.message || 'Failed to mark notification as read');
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  'projectCommunication/markAllNotificationsAsRead',
  async (userId: string) => {
    const response = await projectCommunicationService.markAllNotificationsAsRead(userId);
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to mark all notifications as read');
  }
);

export const fetchProjectMeetings = createAsyncThunk(
  'projectCommunication/fetchProjectMeetings',
  async (projectId: string) => {
    const response = await projectCommunicationService.getProjectMeetings(projectId);
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to fetch project meetings');
  }
);

export const createMeeting = createAsyncThunk(
  'projectCommunication/createMeeting',
  async (data: CreateMeetingData) => {
    const response = await projectCommunicationService.createMeeting(data);
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to create meeting');
  }
);

export const updateMeeting = createAsyncThunk(
  'projectCommunication/updateMeeting',
  async ({ meetingId, data }: { meetingId: string; data: Partial<CreateMeetingData> }) => {
    const response = await projectCommunicationService.updateMeeting(meetingId, data);
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to update meeting');
  }
);

export const deleteMeeting = createAsyncThunk(
  'projectCommunication/deleteMeeting',
  async (meetingId: string) => {
    const response = await projectCommunicationService.deleteMeeting(meetingId);
    if (response.success) {
      return meetingId;
    }
    throw new Error(response.message || 'Failed to delete meeting');
  }
);

export const fetchCommunicationStats = createAsyncThunk(
  'projectCommunication/fetchCommunicationStats',
  async (projectId: string) => {
    const response = await projectCommunicationService.getCommunicationStats(projectId);
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to fetch communication stats');
  }
);

const projectCommunicationSlice = createSlice({
  name: 'projectCommunication',
  initialState,
  reducers: {
    clearMessages: (state) => {
      state.messages = [];
      state.error = null;
    },
    clearNotifications: (state) => {
      state.notifications = [];
      state.error = null;
    },
    clearMeetings: (state) => {
      state.meetings = [];
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    addMessage: (state, action: PayloadAction<ProjectMessage>) => {
      state.messages.push(action.payload);
    },
    addNotification: (state, action: PayloadAction<ProjectNotification>) => {
      state.notifications.unshift(action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch project messages
      .addCase(fetchProjectMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload;
      })
      .addCase(fetchProjectMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch project messages';
      })
      // Send message
      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading = false;
        state.messages.push(action.payload);
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to send message';
      })
      // Delete message
      .addCase(deleteMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMessage.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = state.messages.filter(m => m.id !== action.payload);
      })
      .addCase(deleteMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete message';
      })
      // Fetch project notifications
      .addCase(fetchProjectNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload;
      })
      .addCase(fetchProjectNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch project notifications';
      })
      // Fetch user notifications
      .addCase(fetchUserNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload;
      })
      .addCase(fetchUserNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch user notifications';
      })
      // Create notification
      .addCase(createNotification.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNotification.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications.unshift(action.payload);
      })
      .addCase(createNotification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create notification';
      })
      // Mark notification as read
      .addCase(markNotificationAsRead.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        state.loading = false;
        const notification = state.notifications.find(n => n.id === action.payload);
        if (notification) {
          notification.is_read = true;
        }
      })
      .addCase(markNotificationAsRead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to mark notification as read';
      })
      // Mark all notifications as read
      .addCase(markAllNotificationsAsRead.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.loading = false;
        state.notifications.forEach(notification => {
          notification.is_read = true;
        });
      })
      .addCase(markAllNotificationsAsRead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to mark all notifications as read';
      })
      // Fetch project meetings
      .addCase(fetchProjectMeetings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectMeetings.fulfilled, (state, action) => {
        state.loading = false;
        state.meetings = action.payload;
      })
      .addCase(fetchProjectMeetings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch project meetings';
      })
      // Create meeting
      .addCase(createMeeting.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMeeting.fulfilled, (state, action) => {
        state.loading = false;
        state.meetings.push(action.payload);
      })
      .addCase(createMeeting.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create meeting';
      })
      // Update meeting
      .addCase(updateMeeting.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMeeting.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.meetings.findIndex(m => m.id === action.payload.id);
        if (index !== -1) {
          state.meetings[index] = action.payload;
        }
      })
      .addCase(updateMeeting.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update meeting';
      })
      // Delete meeting
      .addCase(deleteMeeting.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMeeting.fulfilled, (state, action) => {
        state.loading = false;
        state.meetings = state.meetings.filter(m => m.id !== action.payload);
      })
      .addCase(deleteMeeting.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete meeting';
      })
      // Fetch communication stats
      .addCase(fetchCommunicationStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCommunicationStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchCommunicationStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch communication stats';
      });
  }
});

export const { 
  clearMessages, 
  clearNotifications, 
  clearMeetings, 
  clearError, 
  addMessage, 
  addNotification 
} = projectCommunicationSlice.actions;
export default projectCommunicationSlice.reducer;
