import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import projectMilestoneService from '../../services/projectMilestoneService';
import type { CreateMilestoneData } from '../../services/projectMilestoneService';
import type { 
  ProjectMilestone
} from '../../services/projectMilestoneService';

interface ProjectMilestoneState {
  milestones: ProjectMilestone[];
  deliverables: any[];
  stats: any | null;
  loading: boolean;
  error: string | null;
  selectedMilestone: ProjectMilestone | null;
}

const initialState: ProjectMilestoneState = {
  milestones: [],
  deliverables: [],
  stats: null,
  loading: false,
  error: null,
  selectedMilestone: null,
};

// Async thunks
export const fetchProjectMilestones = createAsyncThunk(
  'projectMilestone/fetchProjectMilestones',
  async (projectId: string) => {
    const response = await projectMilestoneService.getProjectMilestones(projectId);
    return response.data || [];
  }
);

export const fetchMilestoneById = createAsyncThunk(
  'projectMilestone/fetchMilestoneById',
  async (id: string) => {
    const response = await projectMilestoneService.getMilestoneById(id);
    return response.data;
  }
);

export const updateMilestoneStatus = createAsyncThunk(
  'projectMilestone/updateMilestoneStatus',
  async ({ milestoneId, status }: { milestoneId: string; status: ProjectMilestone['status'] }) => {
    const response = await projectMilestoneService.updateMilestoneStatus(milestoneId, status);
    return response.data;
  }
);

export const updateMilestoneProgress = createAsyncThunk(
  'projectMilestone/updateMilestoneProgress',
  async ({ milestoneId, progress }: { milestoneId: string; progress: string }) => {
    const response = await projectMilestoneService.updateMilestoneProgress(milestoneId, progress);
    return response.data;
  }
);

export const createMilestone = createAsyncThunk(
  'projectMilestone/createMilestone',
  async (milestoneData: CreateMilestoneData) => {
    const response = await projectMilestoneService.createMilestone(milestoneData);
    return response.data;
  }
);

export const deleteMilestone = createAsyncThunk(
  'projectMilestone/deleteMilestone',
  async (milestoneId: string) => {
    const response = await projectMilestoneService.deleteMilestone(milestoneId);
    return { milestoneId, success: response.success };
  }
);

const projectMilestoneSlice = createSlice({
  name: 'projectMilestone',
  initialState,
  reducers: {
    setSelectedMilestone: (state, action: PayloadAction<ProjectMilestone | null>) => {
      state.selectedMilestone = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch project milestones
      .addCase(fetchProjectMilestones.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectMilestones.fulfilled, (state, action) => {
        state.loading = false;
        state.milestones = action.payload;
      })
      .addCase(fetchProjectMilestones.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch milestones';
      })
      
      // Fetch milestone by ID
      .addCase(fetchMilestoneById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMilestoneById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedMilestone = action.payload || null;
      })
      .addCase(fetchMilestoneById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch milestone';
      })
      
      // Update milestone status
      .addCase(updateMilestoneStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMilestoneStatus.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          const index = state.milestones.findIndex(m => m.id === action.payload!.id);
          if (index !== -1) {
            state.milestones[index] = action.payload!;
          }
          if (state.selectedMilestone?.id === action.payload!.id) {
            state.selectedMilestone = action.payload!;
          }
        }
      })
      .addCase(updateMilestoneStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update milestone status';
      })
      
      // Update milestone progress
      .addCase(updateMilestoneProgress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMilestoneProgress.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          const index = state.milestones.findIndex(m => m.id === action.payload!.id);
          if (index !== -1) {
            state.milestones[index] = action.payload!;
          }
          if (state.selectedMilestone?.id === action.payload!.id) {
            state.selectedMilestone = action.payload!;
          }
        }
      })
      .addCase(updateMilestoneProgress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update milestone progress';
      })
      
      // Create milestone
      .addCase(createMilestone.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMilestone.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.milestones.push(action.payload);
        }
      })
      .addCase(createMilestone.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create milestone';
      })
      
      // Delete milestone
      .addCase(deleteMilestone.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMilestone.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.milestones = state.milestones.filter(milestone => milestone.id !== action.payload.milestoneId);
          if (state.selectedMilestone?.id === action.payload.milestoneId) {
            state.selectedMilestone = null;
          }
        }
      })
      .addCase(deleteMilestone.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete milestone';
      });
  }
});

export const { setSelectedMilestone, clearError } = projectMilestoneSlice.actions;
export default projectMilestoneSlice.reducer;