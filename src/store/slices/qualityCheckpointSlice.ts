import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import qualityCheckpointService from '../../services/qualityCheckpointService';
import type { 
  QualityCheckpoint, 
  CreateCheckpointData, 
  UpdateCheckpointData,
  CheckpointStats 
} from '../../types/qualityCheckpoint';

interface QualityCheckpointState {
  checkpoints: QualityCheckpoint[];
  stats: CheckpointStats | null;
  loading: boolean;
  error: string | null;
  selectedCheckpoint: QualityCheckpoint | null;
}

const initialState: QualityCheckpointState = {
  checkpoints: [],
  stats: null,
  loading: false,
  error: null,
  selectedCheckpoint: null,
};

// Async thunks
export const fetchTaskCheckpoints = createAsyncThunk(
  'qualityCheckpoint/fetchTaskCheckpoints',
  async (taskId: string) => {
    const response = await qualityCheckpointService.getTaskCheckpoints(taskId);
    return response.data;
  }
);

export const fetchCheckpointById = createAsyncThunk(
  'qualityCheckpoint/fetchCheckpointById',
  async (id: string) => {
    const response = await qualityCheckpointService.getCheckpointById(id);
    return response.data;
  }
);

export const createCheckpoint = createAsyncThunk(
  'qualityCheckpoint/createCheckpoint',
  async (data: CreateCheckpointData) => {
    const response = await qualityCheckpointService.createCheckpoint(data);
    return response.data;
  }
);

export const updateCheckpoint = createAsyncThunk(
  'qualityCheckpoint/updateCheckpoint',
  async ({ id, data }: { id: string; data: UpdateCheckpointData }) => {
    const response = await qualityCheckpointService.updateCheckpoint(id, data);
    return response.data;
  }
);

export const deleteCheckpoint = createAsyncThunk(
  'qualityCheckpoint/deleteCheckpoint',
  async (id: string) => {
    await qualityCheckpointService.deleteCheckpoint(id);
    return id;
  }
);

export const scheduleCheckpoint = createAsyncThunk(
  'qualityCheckpoint/scheduleCheckpoint',
  async ({ id, scheduledDate, inspectorId }: { id: string; scheduledDate: string; inspectorId: string }) => {
    const response = await qualityCheckpointService.scheduleCheckpoint(id, scheduledDate, inspectorId);
    return response.data;
  }
);

export const completeCheckpoint = createAsyncThunk(
  'qualityCheckpoint/completeCheckpoint',
  async ({ id, inspectionData }: { id: string; inspectionData: {
    passed: boolean;
    notes?: string;
    issues_found?: string[];
    corrective_actions?: string[];
  }}) => {
    const response = await qualityCheckpointService.completeCheckpoint(id, inspectionData);
    return response.data;
  }
);

export const fetchCheckpointStats = createAsyncThunk(
  'qualityCheckpoint/fetchCheckpointStats',
  async () => {
    const response = await qualityCheckpointService.getCheckpointStats();
    return response.data;
  }
);

export const fetchOverdueCheckpoints = createAsyncThunk(
  'qualityCheckpoint/fetchOverdueCheckpoints',
  async () => {
    const response = await qualityCheckpointService.getOverdueCheckpoints();
    return response.data;
  }
);

export const fetchCheckpointsByInspector = createAsyncThunk(
  'qualityCheckpoint/fetchCheckpointsByInspector',
  async (inspectorId: string) => {
    const response = await qualityCheckpointService.getCheckpointsByInspector(inspectorId);
    return response.data;
  }
);

const qualityCheckpointSlice = createSlice({
  name: 'qualityCheckpoint',
  initialState,
  reducers: {
    setSelectedCheckpoint: (state, action: PayloadAction<QualityCheckpoint | null>) => {
      state.selectedCheckpoint = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch task checkpoints
      .addCase(fetchTaskCheckpoints.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTaskCheckpoints.fulfilled, (state, action) => {
        state.loading = false;
        state.checkpoints = action.payload;
      })
      .addCase(fetchTaskCheckpoints.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch checkpoints';
      })
      
      // Fetch checkpoint by ID
      .addCase(fetchCheckpointById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCheckpointById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCheckpoint = action.payload;
      })
      .addCase(fetchCheckpointById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch checkpoint';
      })
      
      // Create checkpoint
      .addCase(createCheckpoint.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCheckpoint.fulfilled, (state, action) => {
        state.loading = false;
        state.checkpoints.push(action.payload);
      })
      .addCase(createCheckpoint.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create checkpoint';
      })
      
      // Update checkpoint
      .addCase(updateCheckpoint.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCheckpoint.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.checkpoints.findIndex(checkpoint => checkpoint.id === action.payload.id);
        if (index !== -1) {
          state.checkpoints[index] = action.payload;
        }
        if (state.selectedCheckpoint?.id === action.payload.id) {
          state.selectedCheckpoint = action.payload;
        }
      })
      .addCase(updateCheckpoint.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update checkpoint';
      })
      
      // Delete checkpoint
      .addCase(deleteCheckpoint.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCheckpoint.fulfilled, (state, action) => {
        state.loading = false;
        state.checkpoints = state.checkpoints.filter(checkpoint => checkpoint.id !== action.payload);
        if (state.selectedCheckpoint?.id === action.payload) {
          state.selectedCheckpoint = null;
        }
      })
      .addCase(deleteCheckpoint.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete checkpoint';
      })
      
      // Schedule checkpoint
      .addCase(scheduleCheckpoint.fulfilled, (state, action) => {
        const index = state.checkpoints.findIndex(checkpoint => checkpoint.id === action.payload.id);
        if (index !== -1) {
          state.checkpoints[index] = action.payload;
        }
        if (state.selectedCheckpoint?.id === action.payload.id) {
          state.selectedCheckpoint = action.payload;
        }
      })
      
      // Complete checkpoint
      .addCase(completeCheckpoint.fulfilled, (state, action) => {
        const index = state.checkpoints.findIndex(checkpoint => checkpoint.id === action.payload.id);
        if (index !== -1) {
          state.checkpoints[index] = action.payload;
        }
        if (state.selectedCheckpoint?.id === action.payload.id) {
          state.selectedCheckpoint = action.payload;
        }
      })
      
      // Fetch checkpoint stats
      .addCase(fetchCheckpointStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      
      // Fetch overdue checkpoints
      .addCase(fetchOverdueCheckpoints.fulfilled, (state, action) => {
        state.checkpoints = action.payload;
      })
      
      // Fetch checkpoints by inspector
      .addCase(fetchCheckpointsByInspector.fulfilled, (state, action) => {
        state.checkpoints = action.payload;
      });
  },
});

export const { setSelectedCheckpoint, clearError } = qualityCheckpointSlice.actions;
export default qualityCheckpointSlice.reducer;
