import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import projectMilestoneService from '../../services/projectMilestoneService';
import type { 
  ProjectMilestone, 
  CreateProjectMilestoneData, 
  UpdateProjectMilestoneData
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
    return response || [];
  }
);

export const fetchMilestoneById = createAsyncThunk(
  'projectMilestone/fetchMilestoneById',
  async (id: string) => {
    const response = await projectMilestoneService.getMilestoneById(id);
    return response;
  }
);

export const createMilestone = createAsyncThunk(
  'projectMilestone/createMilestone',
  async (data: CreateProjectMilestoneData) => {
    const response = await projectMilestoneService.createMilestone(data);
    return response;
  }
);

export const updateMilestone = createAsyncThunk(
  'projectMilestone/updateMilestone',
  async ({ id, data }: { id: string; data: UpdateProjectMilestoneData }) => {
    const response = await projectMilestoneService.updateMilestone(id, data);
    return response;
  }
);

export const deleteMilestone = createAsyncThunk(
  'projectMilestone/deleteMilestone',
  async (id: string) => {
    await projectMilestoneService.deleteMilestone(id);
    return id;
  }
);

export const completeMilestone = createAsyncThunk(
  'projectMilestone/completeMilestone',
  async (id: string) => {
    const response = await projectMilestoneService.completeMilestone(id);
    return response;
  }
);

export const fetchMilestoneDeliverables = createAsyncThunk(
  'projectMilestone/fetchMilestoneDeliverables',
  async (milestoneId: string) => {
    const response = await projectMilestoneService.getMilestoneDeliverables(milestoneId);
    return response;
  }
);

export const addMilestoneDeliverable = createAsyncThunk(
  'projectMilestone/addMilestoneDeliverable',
  async ({ milestoneId, data }: { milestoneId: string; data: any }) => {
    const response = await projectMilestoneService.addMilestoneDeliverable(milestoneId, data);
    return response;
  }
);

export const updateMilestoneDeliverable = createAsyncThunk(
  'projectMilestone/updateMilestoneDeliverable',
  async ({ deliverableId, data }: { deliverableId: string; data: any }) => {
    const response = await projectMilestoneService.updateMilestoneDeliverable(deliverableId, data);
    return response;
  }
);

export const submitDeliverable = createAsyncThunk(
  'projectMilestone/submitDeliverable',
  async (deliverableId: string) => {
    const response = await projectMilestoneService.submitDeliverable(deliverableId);
    return response;
  }
);

export const reviewDeliverable = createAsyncThunk(
  'projectMilestone/reviewDeliverable',
  async ({ deliverableId, decision, comments }: { deliverableId: string; decision: 'APPROVED' | 'REJECTED'; comments?: string }) => {
    const response = await projectMilestoneService.reviewDeliverable(deliverableId, decision, comments);
    return response;
  }
);

export const fetchMilestoneStats = createAsyncThunk(
  'projectMilestone/fetchMilestoneStats',
  async (milestoneId: string) => {
    const response = await projectMilestoneService.getMilestoneStats(milestoneId);
    return response;
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
        state.selectedMilestone = action.payload;
      })
      .addCase(fetchMilestoneById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch milestone';
      })
      
      // Create milestone
      .addCase(createMilestone.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMilestone.fulfilled, (state, action) => {
        state.loading = false;
        state.milestones.push(action.payload);
      })
      .addCase(createMilestone.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create milestone';
      })
      
      // Update milestone
      .addCase(updateMilestone.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMilestone.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.milestones.findIndex(m => m._id === action.payload._id);
        if (index !== -1) {
          state.milestones[index] = action.payload;
        }
        if (state.selectedMilestone?._id === action.payload._id) {
          state.selectedMilestone = action.payload;
        }
      })
      .addCase(updateMilestone.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update milestone';
      })
      
      // Delete milestone
      .addCase(deleteMilestone.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMilestone.fulfilled, (state, action) => {
        state.loading = false;
        state.milestones = state.milestones.filter(m => m._id !== action.payload);
        if (state.selectedMilestone?._id === action.payload) {
          state.selectedMilestone = null;
        }
      })
      .addCase(deleteMilestone.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete milestone';
      })
      
      // Complete milestone
      .addCase(completeMilestone.fulfilled, (state, action) => {
        const index = state.milestones.findIndex(m => m._id === action.payload._id);
        if (index !== -1) {
          state.milestones[index] = action.payload;
        }
        if (state.selectedMilestone?._id === action.payload._id) {
          state.selectedMilestone = action.payload;
        }
      })
      
      // Fetch milestone deliverables
      .addCase(fetchMilestoneDeliverables.fulfilled, (state, action) => {
        state.deliverables = action.payload;
      })
      
      // Add milestone deliverable
      .addCase(addMilestoneDeliverable.fulfilled, (state, action) => {
        state.deliverables.push(action.payload);
      })
      
      // Update milestone deliverable
      .addCase(updateMilestoneDeliverable.fulfilled, (state, action) => {
        const index = state.deliverables.findIndex(d => d.id === action.payload.id);
        if (index !== -1) {
          state.deliverables[index] = action.payload;
        }
      })
      
      // Submit deliverable
      .addCase(submitDeliverable.fulfilled, (state, action) => {
        const index = state.deliverables.findIndex(d => d.id === action.payload.id);
        if (index !== -1) {
          state.deliverables[index] = action.payload;
        }
      })
      
      // Review deliverable
      .addCase(reviewDeliverable.fulfilled, (state, action) => {
        const index = state.deliverables.findIndex(d => d.id === action.payload.id);
        if (index !== -1) {
          state.deliverables[index] = action.payload;
        }
      })
      
      // Fetch milestone stats
      .addCase(fetchMilestoneStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  },
});

export const { setSelectedMilestone, clearError } = projectMilestoneSlice.actions;
export default projectMilestoneSlice.reducer;
