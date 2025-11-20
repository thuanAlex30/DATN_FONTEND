import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import projectChangeRequestService from '../../services/projectChangeRequestService';
import type { 
  ProjectChangeRequest, 
  CreateChangeRequestData, 
  UpdateChangeRequestData 
} from '../../services/projectChangeRequestService';

interface ProjectChangeRequestState {
  changeRequests: ProjectChangeRequest[];
  loading: boolean;
  error: string | null;
  stats: any;
}

const initialState: ProjectChangeRequestState = {
  changeRequests: [],
  loading: false,
  error: null,
  stats: null
};

// Async thunks
export const fetchProjectChangeRequests = createAsyncThunk(
  'projectChangeRequest/fetchProjectChangeRequests',
  async (projectId: string) => {
    const response = await projectChangeRequestService.getProjectChangeRequests(projectId);
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to fetch project change requests');
  }
);

export const fetchChangeRequestById = createAsyncThunk(
  'projectChangeRequest/fetchChangeRequestById',
  async (id: string) => {
    const response = await projectChangeRequestService.getChangeRequestById(id);
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to fetch change request');
  }
);

export const createChangeRequest = createAsyncThunk(
  'projectChangeRequest/createChangeRequest',
  async (data: CreateChangeRequestData) => {
    const response = await projectChangeRequestService.createChangeRequest(data);
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to create change request');
  }
);

export const updateChangeRequest = createAsyncThunk(
  'projectChangeRequest/updateChangeRequest',
  async ({ id, data }: { id: string; data: UpdateChangeRequestData }) => {
    const response = await projectChangeRequestService.updateChangeRequest(id, data);
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to update change request');
  }
);

export const deleteChangeRequest = createAsyncThunk(
  'projectChangeRequest/deleteChangeRequest',
  async (id: string) => {
    const response = await projectChangeRequestService.deleteChangeRequest(id);
    if (response.success) {
      return id;
    }
    throw new Error(response.message || 'Failed to delete change request');
  }
);

export const approveChangeRequest = createAsyncThunk(
  'projectChangeRequest/approveChangeRequest',
  async ({ id, approvedBy }: { id: string; approvedBy: string }) => {
    const response = await projectChangeRequestService.approveChangeRequest(id, approvedBy);
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to approve change request');
  }
);

export const rejectChangeRequest = createAsyncThunk(
  'projectChangeRequest/rejectChangeRequest',
  async ({ id, reason }: { id: string; reason: string }) => {
    const response = await projectChangeRequestService.rejectChangeRequest(id, reason);
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to reject change request');
  }
);

export const fetchChangeRequestStats = createAsyncThunk(
  'projectChangeRequest/fetchChangeRequestStats',
  async (projectId: string) => {
    const response = await projectChangeRequestService.getChangeRequestStats(projectId);
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to fetch change request stats');
  }
);

const projectChangeRequestSlice = createSlice({
  name: 'projectChangeRequest',
  initialState,
  reducers: {
    clearChangeRequests: (state) => {
      state.changeRequests = [];
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    }
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
        state.error = action.error.message || 'Failed to fetch project change requests';
      })
      // Fetch change request by ID
      .addCase(fetchChangeRequestById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChangeRequestById.fulfilled, (state, action) => {
        state.loading = false;
        // Update existing or add new
        const index = state.changeRequests.findIndex(cr => cr.id === action.payload.id);
        if (index !== -1) {
          state.changeRequests[index] = action.payload;
        } else {
          state.changeRequests.push(action.payload);
        }
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
      })
      .addCase(deleteChangeRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete change request';
      })
      // Approve change request
      .addCase(approveChangeRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approveChangeRequest.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.changeRequests.findIndex(cr => cr.id === action.payload.id);
        if (index !== -1) {
          state.changeRequests[index] = action.payload;
        }
      })
      .addCase(approveChangeRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to approve change request';
      })
      // Reject change request
      .addCase(rejectChangeRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rejectChangeRequest.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.changeRequests.findIndex(cr => cr.id === action.payload.id);
        if (index !== -1) {
          state.changeRequests[index] = action.payload;
        }
      })
      .addCase(rejectChangeRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to reject change request';
      })
      // Fetch change request stats
      .addCase(fetchChangeRequestStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChangeRequestStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchChangeRequestStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch change request stats';
      });
  }
});

export const { clearChangeRequests, clearError } = projectChangeRequestSlice.actions;
export default projectChangeRequestSlice.reducer;