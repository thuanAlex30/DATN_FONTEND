import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import projectRiskService from '../../services/projectRiskService';
import type { ProjectRisk } from '../../services/projectRiskService';
import type { 
  RiskStats,
  CreateRiskData,
  UpdateRiskData
} from '../../types/projectRisk';

interface ProjectRiskState {
  risks: ProjectRisk[];
  stats: RiskStats | null;
  loading: boolean;
  error: string | null;
  selectedRisk: ProjectRisk | null;
}

const initialState: ProjectRiskState = {
  risks: [],
  stats: null,
  loading: false,
  error: null,
  selectedRisk: null,
};

// Async thunks
export const fetchProjectRisks = createAsyncThunk(
  'projectRisk/fetchProjectRisks',
  async (projectId: string) => {
    const response = await projectRiskService.getProjectRisks(projectId);
    return response.data || [];
  }
);

export const fetchRiskById = createAsyncThunk(
  'projectRisk/fetchRiskById',
  async (id: string) => {
    const response = await projectRiskService.getRiskById(id);
    return response;
  }
);

export const createRisk = createAsyncThunk(
  'projectRisk/createRisk',
  async (data: CreateRiskData) => {
    const response = await projectRiskService.createRisk(data);
    return response.data;
  }
);

export const updateRisk = createAsyncThunk(
  'projectRisk/updateRisk',
  async ({ id, data }: { id: string; data: UpdateRiskData }) => {
    const response = await projectRiskService.updateRisk(id, data);
    return response.data;
  }
);

export const deleteRisk = createAsyncThunk(
  'projectRisk/deleteRisk',
  async (id: string) => {
    const response = await projectRiskService.deleteRisk(id);
    return id;
  }
);

export const updateRiskStatus = createAsyncThunk(
  'projectRisk/updateRiskStatus',
  async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
    const response = await projectRiskService.updateRiskStatus(id, status);
    return response.data;
  }
);

export const fetchRiskStats = createAsyncThunk(
  'projectRisk/fetchRiskStats',
  async () => {
    const response = await projectRiskService.getRiskStats();
    return response.data;
  }
);

export const fetchRisksByCategory = createAsyncThunk(
  'projectRisk/fetchRisksByCategory',
  async (category: string) => {
    const response = await projectRiskService.getRisksByCategory(category);
    return response.data;
  }
);

export const fetchHighPriorityRisks = createAsyncThunk(
  'projectRisk/fetchHighPriorityRisks',
  async () => {
    const response = await projectRiskService.getHighPriorityRisks();
    return response.data;
  }
);

const projectRiskSlice = createSlice({
  name: 'projectRisk',
  initialState,
  reducers: {
    setSelectedRisk: (state, action: PayloadAction<ProjectRisk | null>) => {
      state.selectedRisk = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch project risks
      .addCase(fetchProjectRisks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectRisks.fulfilled, (state, action) => {
        state.loading = false;
        state.risks = action.payload;
      })
      .addCase(fetchProjectRisks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch risks';
      })
      
      // Fetch risk by ID
      .addCase(fetchRiskById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRiskById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedRisk = action.payload;
      })
      .addCase(fetchRiskById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch risk';
      })
      
      // Create risk
      .addCase(createRisk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRisk.fulfilled, (state, action) => {
        state.loading = false;
        state.risks.push(action.payload);
      })
      .addCase(createRisk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create risk';
      })
      
      // Update risk
      .addCase(updateRisk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRisk.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.risks.findIndex(risk => risk._id === action.payload._id);
        if (index !== -1) {
          state.risks[index] = action.payload;
        }
        if (state.selectedRisk?._id === action.payload._id) {
          state.selectedRisk = action.payload;
        }
      })
      .addCase(updateRisk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update risk';
      })
      
      // Delete risk
      .addCase(deleteRisk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteRisk.fulfilled, (state, action) => {
        state.loading = false;
        state.risks = state.risks.filter(risk => risk._id !== action.payload);
        if (state.selectedRisk?._id === action.payload) {
          state.selectedRisk = null;
        }
      })
      .addCase(deleteRisk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete risk';
      })
      
      // Update risk status
      .addCase(updateRiskStatus.fulfilled, (state, action) => {
        const index = state.risks.findIndex(risk => risk._id === action.payload._id);
        if (index !== -1) {
          state.risks[index] = action.payload;
        }
        if (state.selectedRisk?._id === action.payload._id) {
          state.selectedRisk = action.payload;
        }
      })
      
      // Fetch risk stats
      .addCase(fetchRiskStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      
      // Fetch risks by category
      .addCase(fetchRisksByCategory.fulfilled, (state, action) => {
        state.risks = action.payload;
      })
      
      // Fetch high priority risks
      .addCase(fetchHighPriorityRisks.fulfilled, (state, action) => {
        state.risks = action.payload;
      });
  },
});

export const { setSelectedRisk, clearError } = projectRiskSlice.actions;
export default projectRiskSlice.reducer;
