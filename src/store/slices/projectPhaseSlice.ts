import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import projectPhaseService from '../../services/projectPhaseService';
import type { 
  ProjectPhase, 
  CreatePhaseData, 
  UpdatePhaseData,
  PhaseStats,
  PhaseTimeline 
} from '../../types/projectPhase';

interface ProjectPhaseState {
  phases: ProjectPhase[];
  stats: PhaseStats | null;
  timeline: PhaseTimeline | null;
  loading: boolean;
  error: string | null;
  selectedPhase: ProjectPhase | null;
}

const initialState: ProjectPhaseState = {
  phases: [],
  stats: null,
  timeline: null,
  loading: false,
  error: null,
  selectedPhase: null,
};

// Async thunks
export const fetchProjectPhases = createAsyncThunk(
  'projectPhase/fetchProjectPhases',
  async (projectId: string) => {
    const response = await projectPhaseService.getProjectPhases(projectId);
    return response.data;
  }
);

export const fetchPhaseById = createAsyncThunk(
  'projectPhase/fetchPhaseById',
  async (id: string) => {
    const response = await projectPhaseService.getPhaseById(id);
    return response.data;
  }
);

export const createPhase = createAsyncThunk(
  'projectPhase/createPhase',
  async (data: CreatePhaseData) => {
    const response = await projectPhaseService.createPhase(data);
    return response.data;
  }
);

export const updatePhase = createAsyncThunk(
  'projectPhase/updatePhase',
  async ({ id, data }: { id: string; data: UpdatePhaseData }) => {
    const response = await projectPhaseService.updatePhase(id, data);
    return response.data;
  }
);

export const deletePhase = createAsyncThunk(
  'projectPhase/deletePhase',
  async (id: string) => {
    await projectPhaseService.deletePhase(id);
    return id;
  }
);

export const updatePhaseProgress = createAsyncThunk(
  'projectPhase/updatePhaseProgress',
  async ({ id, progress }: { id: string; progress: number }) => {
    const response = await projectPhaseService.updatePhaseProgress(id, progress);
    return response.data;
  }
);

export const fetchPhaseStats = createAsyncThunk(
  'projectPhase/fetchPhaseStats',
  async (id: string) => {
    const response = await projectPhaseService.getPhaseStats(id);
    return response.data;
  }
);

export const fetchPhaseTimeline = createAsyncThunk(
  'projectPhase/fetchPhaseTimeline',
  async (id: string) => {
    const response = await projectPhaseService.getPhaseTimeline(id);
    return response.data;
  }
);

const projectPhaseSlice = createSlice({
  name: 'projectPhase',
  initialState,
  reducers: {
    setSelectedPhase: (state, action: PayloadAction<ProjectPhase | null>) => {
      state.selectedPhase = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch project phases
      .addCase(fetchProjectPhases.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectPhases.fulfilled, (state, action) => {
        state.loading = false;
        state.phases = action.payload;
      })
      .addCase(fetchProjectPhases.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch phases';
      })
      
      // Fetch phase by ID
      .addCase(fetchPhaseById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPhaseById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedPhase = action.payload;
      })
      .addCase(fetchPhaseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch phase';
      })
      
      // Create phase
      .addCase(createPhase.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPhase.fulfilled, (state, action) => {
        state.loading = false;
        state.phases.push(action.payload);
      })
      .addCase(createPhase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create phase';
      })
      
      // Update phase
      .addCase(updatePhase.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePhase.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.phases.findIndex(phase => phase.id === action.payload.id);
        if (index !== -1) {
          state.phases[index] = action.payload;
        }
        if (state.selectedPhase?.id === action.payload.id) {
          state.selectedPhase = action.payload;
        }
      })
      .addCase(updatePhase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update phase';
      })
      
      // Delete phase
      .addCase(deletePhase.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePhase.fulfilled, (state, action) => {
        state.loading = false;
        state.phases = state.phases.filter(phase => phase.id !== action.payload);
        if (state.selectedPhase?.id === action.payload) {
          state.selectedPhase = null;
        }
      })
      .addCase(deletePhase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete phase';
      })
      
      // Update phase progress
      .addCase(updatePhaseProgress.fulfilled, (state, action) => {
        const index = state.phases.findIndex(phase => phase.id === action.payload.id);
        if (index !== -1) {
          state.phases[index] = action.payload;
        }
        if (state.selectedPhase?.id === action.payload.id) {
          state.selectedPhase = action.payload;
        }
      })
      
      // Fetch phase stats
      .addCase(fetchPhaseStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      
      // Fetch phase timeline
      .addCase(fetchPhaseTimeline.fulfilled, (state, action) => {
        state.timeline = action.payload;
      });
  },
});

export const { setSelectedPhase, clearError } = projectPhaseSlice.actions;
export default projectPhaseSlice.reducer;