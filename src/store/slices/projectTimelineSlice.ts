import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import projectTimelineService from '../../services/projectTimelineService';
import type { ProjectTimeline, CreateTimelineEventData, UpdateTimelineEventData } from '../../services/projectTimelineService';

interface ProjectTimelineState {
  timeline: ProjectTimeline[];
  upcomingEvents: ProjectTimeline[];
  loading: boolean;
  error: string | null;
  stats: any;
}

const initialState: ProjectTimelineState = {
  timeline: [],
  upcomingEvents: [],
  loading: false,
  error: null,
  stats: null
};

// Async thunks
export const fetchProjectTimeline = createAsyncThunk(
  'projectTimeline/fetchProjectTimeline',
  async (projectId: string) => {
    const response = await projectTimelineService.getProjectTimeline(projectId);
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to fetch project timeline');
  }
);

export const fetchUpcomingEvents = createAsyncThunk(
  'projectTimeline/fetchUpcomingEvents',
  async ({ projectId, days = 7 }: { projectId: string; days?: number }) => {
    const response = await projectTimelineService.getUpcomingEvents(projectId, days);
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to fetch upcoming events');
  }
);

export const createTimelineEvent = createAsyncThunk(
  'projectTimeline/createTimelineEvent',
  async (data: CreateTimelineEventData) => {
    const response = await projectTimelineService.createTimelineEvent(data);
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to create timeline event');
  }
);

export const updateTimelineEvent = createAsyncThunk(
  'projectTimeline/updateTimelineEvent',
  async ({ id, data }: { id: string; data: UpdateTimelineEventData }) => {
    const response = await projectTimelineService.updateTimelineEvent(id, data);
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to update timeline event');
  }
);

export const deleteTimelineEvent = createAsyncThunk(
  'projectTimeline/deleteTimelineEvent',
  async (id: string) => {
    const response = await projectTimelineService.deleteTimelineEvent(id);
    if (response.success) {
      return id;
    }
    throw new Error(response.message || 'Failed to delete timeline event');
  }
);

export const fetchTimelineStats = createAsyncThunk(
  'projectTimeline/fetchTimelineStats',
  async (projectId: string) => {
    const response = await projectTimelineService.getTimelineStats(projectId);
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to fetch timeline stats');
  }
);

const projectTimelineSlice = createSlice({
  name: 'projectTimeline',
  initialState,
  reducers: {
    clearTimeline: (state) => {
      state.timeline = [];
      state.upcomingEvents = [];
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch project timeline
      .addCase(fetchProjectTimeline.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectTimeline.fulfilled, (state, action) => {
        state.loading = false;
        state.timeline = action.payload;
      })
      .addCase(fetchProjectTimeline.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch project timeline';
      })
      // Fetch upcoming events
      .addCase(fetchUpcomingEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUpcomingEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.upcomingEvents = action.payload;
      })
      .addCase(fetchUpcomingEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch upcoming events';
      })
      // Create timeline event
      .addCase(createTimelineEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTimelineEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.timeline.push(action.payload);
      })
      .addCase(createTimelineEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create timeline event';
      })
      // Update timeline event
      .addCase(updateTimelineEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTimelineEvent.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.timeline.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.timeline[index] = action.payload;
        }
      })
      .addCase(updateTimelineEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update timeline event';
      })
      // Delete timeline event
      .addCase(deleteTimelineEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTimelineEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.timeline = state.timeline.filter(t => t.id !== action.payload);
      })
      .addCase(deleteTimelineEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete timeline event';
      })
      // Fetch timeline stats
      .addCase(fetchTimelineStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTimelineStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchTimelineStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch timeline stats';
      });
  }
});

export const { clearTimeline, clearError } = projectTimelineSlice.actions;
export default projectTimelineSlice.reducer;
