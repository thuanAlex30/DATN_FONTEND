import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import projectChangeRequestService from '../../services/projectChangeRequestService';
import type { 
  ProjectChangeRequest, 
  CreateChangeRequestData, 
  UpdateChangeRequestData,
  ChangeRequestStats 
} from '../../types/projectChangeRequest';

interface ProjectChangeRequestState {
  changeRequests: ProjectChangeRequest[];
  stats: ChangeRequestStats | null;
  loading: boolean;
  error: string | null;
  selectedChangeRequest: ProjectChangeRequest | null;
}

const initialState: ProjectChangeRequestState = {
  changeRequests: [],
  stats: null,
  loading: false,
  error: null,
  selectedChangeRequest: null,
};

// Async thunks
export const fetchProjectChangeRequests = createAsyncThunk(
  'projectChangeRequest/fetchProjectChangeRequests',
  async (projectId: string) => {
    const response = await projectChangeRequestService.getProjectChangeRequests(projectId);
    return response.data;
  }
);

export const fetchChangeRequestById = createAsyncThunk(
  'projectChangeRequest/fetchChangeRequestById',
  async (id: string) => {
    const response = await projectChangeRequestService.getChangeRequestById(id);
    return response.data;
  }
);

export const createChangeRequest = createAsyncThunk(
  'projectChangeRequest/createChangeRequest',
  async (data: CreateChangeRequestData) => {
    const response = await projectChangeRequestService.createChangeRequest(data);
    return response.data;
  }
);

export const updateChangeRequest = createAsyncThunk(
  'projectChangeRequest/updateChangeRequest',
  async ({ id, data }: { id: string; data: UpdateChangeRequestData }) => {
    const response = await projectChangeRequestService.updateChangeRequest(id, data);
    return response.data;
  }
);

export const deleteChangeRequest = createAsyncThunk(
  'projectChangeRequest/deleteChangeRequest',
  async (id: string) => {
    await projectChangeRequestService.deleteChangeRequest(id);
    return id;
  }
);

export const submitChangeRequest = createAsyncThunk(
  'projectChangeRequest/submitChangeRequest',
  async (id: string) => {
    const response = await projectChangeRequestService.submitChangeRequest(id);
    return response.data;
  }
);

export const approveChangeRequest = createAsyncThunk(
  'projectChangeRequest/approveChangeRequest',
  async (id: string) => {
    const response = await projectChangeRequestService.approveChangeRequest(id);
    return response.data;
  }
);

export const rejectChangeRequest = createAsyncThunk(
  'projectChangeRequest/rejectChangeRequest',
  async (id: string) => {
    const response = await projectChangeRequestService.rejectChangeRequest(id);
    return response.data;
  }
);

export const implementChangeRequest = createAsyncThunk(
  'projectChangeRequest/implementChangeRequest',
  async (id: string) => {
    const response = await projectChangeRequestService.implementChangeRequest(id);
    return response.data;
  }
);

export const fetchChangeRequestStats = createAsyncThunk(
  'projectChangeRequest/fetchChangeRequestStats',
  async () => {
    const response = await projectChangeRequestService.getChangeRequestStats();
    return response.data;
  }
);

export const fetchPendingChangeRequests = createAsyncThunk(
  'projectChangeRequest/fetchPendingChangeRequests',
  async () => {
    const response = await projectChangeRequestService.getPendingChangeRequests();
    return response.data;
  }
);

const projectChangeRequestSlice = createSlice({
  name: 'projectChangeRequest',
  initialState,
  reducers: {
    setSelectedChangeRequest: (state, action: PayloadAction<ProjectChangeRequest | null>) => {
      state.selectedChangeRequest = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch project change requests
      .addCase(fetchProjectChangeRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectChangeRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.changeRequests = action.payload;
      })
      .addCase(fetchProjectChangeRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch change requests';
      })
      
      // Fetch change request by ID
      .addCase(fetchChangeRequestById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChangeRequestById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedChangeRequest = action.payload;
      })
      .addCase(fetchChangeRequestById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch change request';
      })
      
      // Create change request
      .addCase(createChangeRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createChangeRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.changeRequests.push(action.payload);
      })
      .addCase(createChangeRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create change request';
      })
      
      // Update change request
      .addCase(updateChangeRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateChangeRequest.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.changeRequests.findIndex(cr => cr.id === action.payload.id);
        if (index !== -1) {
          state.changeRequests[index] = action.payload;
        }
        if (state.selectedChangeRequest?.id === action.payload.id) {
          state.selectedChangeRequest = action.payload;
        }
      })
      .addCase(updateChangeRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update change request';
      })
      
      // Delete change request
      .addCase(deleteChangeRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteChangeRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.changeRequests = state.changeRequests.filter(cr => cr.id !== action.payload);
        if (state.selectedChangeRequest?.id === action.payload) {
          state.selectedChangeRequest = null;
        }
      })
      .addCase(deleteChangeRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete change request';
      })
      
      // Submit change request
      .addCase(submitChangeRequest.fulfilled, (state, action) => {
        const index = state.changeRequests.findIndex(cr => cr.id === action.payload.id);
        if (index !== -1) {
          state.changeRequests[index] = action.payload;
        }
        if (state.selectedChangeRequest?.id === action.payload.id) {
          state.selectedChangeRequest = action.payload;
        }
      })
      
      // Approve change request
      .addCase(approveChangeRequest.fulfilled, (state, action) => {
        const index = state.changeRequests.findIndex(cr => cr.id === action.payload.id);
        if (index !== -1) {
          state.changeRequests[index] = action.payload;
        }
        if (state.selectedChangeRequest?.id === action.payload.id) {
          state.selectedChangeRequest = action.payload;
        }
      })
      
      // Reject change request
      .addCase(rejectChangeRequest.fulfilled, (state, action) => {
        const index = state.changeRequests.findIndex(cr => cr.id === action.payload.id);
        if (index !== -1) {
          state.changeRequests[index] = action.payload;
        }
        if (state.selectedChangeRequest?.id === action.payload.id) {
          state.selectedChangeRequest = action.payload;
        }
      })
      
      // Implement change request
      .addCase(implementChangeRequest.fulfilled, (state, action) => {
        const index = state.changeRequests.findIndex(cr => cr.id === action.payload.id);
        if (index !== -1) {
          state.changeRequests[index] = action.payload;
        }
        if (state.selectedChangeRequest?.id === action.payload.id) {
          state.selectedChangeRequest = action.payload;
        }
      })
      
      // Fetch change request stats
      .addCase(fetchChangeRequestStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      
      // Fetch pending change requests
      .addCase(fetchPendingChangeRequests.fulfilled, (state, action) => {
        state.changeRequests = action.payload;
      });
  },
});

export const { setSelectedChangeRequest, clearError } = projectChangeRequestSlice.actions;
export default projectChangeRequestSlice.reducer;
