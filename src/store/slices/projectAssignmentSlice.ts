import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import projectAssignmentService from '../../services/projectAssignmentService';
import type { ProjectAssignment, CreateProjectAssignmentData, UpdateProjectAssignmentData } from '../../services/projectAssignmentService';

interface ProjectAssignmentState {
  assignments: ProjectAssignment[];
  loading: boolean;
  error: string | null;
  stats: any;
}

const initialState: ProjectAssignmentState = {
  assignments: [],
  loading: false,
  error: null,
  stats: null
};

// Async thunks
export const fetchProjectAssignments = createAsyncThunk(
  'projectAssignment/fetchProjectAssignments',
  async (projectId: string) => {
    const response = await projectAssignmentService.getProjectAssignments(projectId);
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to fetch project assignments');
  }
);

export const fetchUserAssignments = createAsyncThunk(
  'projectAssignment/fetchUserAssignments',
  async (userId: string) => {
    const response = await projectAssignmentService.getUserAssignments(userId);
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to fetch user assignments');
  }
);

export const createAssignment = createAsyncThunk(
  'projectAssignment/createAssignment',
  async (data: CreateProjectAssignmentData) => {
    const response = await projectAssignmentService.createAssignment(data);
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to create assignment');
  }
);

export const updateAssignment = createAsyncThunk(
  'projectAssignment/updateAssignment',
  async ({ id, data }: { id: string; data: UpdateProjectAssignmentData }) => {
    const response = await projectAssignmentService.updateAssignment(id, data);
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to update assignment');
  }
);

export const deleteAssignment = createAsyncThunk(
  'projectAssignment/deleteAssignment',
  async (id: string) => {
    const response = await projectAssignmentService.deleteAssignment(id);
    if (response.success) {
      return id;
    }
    throw new Error(response.message || 'Failed to delete assignment');
  }
);

export const fetchAssignmentStats = createAsyncThunk(
  'projectAssignment/fetchAssignmentStats',
  async (projectId: string) => {
    const response = await projectAssignmentService.getAssignmentStats(projectId);
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to fetch assignment stats');
  }
);

const projectAssignmentSlice = createSlice({
  name: 'projectAssignment',
  initialState,
  reducers: {
    clearAssignments: (state) => {
      state.assignments = [];
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch project assignments
      .addCase(fetchProjectAssignments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectAssignments.fulfilled, (state, action) => {
        state.loading = false;
        state.assignments = action.payload;
      })
      .addCase(fetchProjectAssignments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch project assignments';
      })
      // Fetch user assignments
      .addCase(fetchUserAssignments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserAssignments.fulfilled, (state, action) => {
        state.loading = false;
        state.assignments = action.payload;
      })
      .addCase(fetchUserAssignments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch user assignments';
      })
      // Create assignment
      .addCase(createAssignment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAssignment.fulfilled, (state, action) => {
        state.loading = false;
        state.assignments.push(action.payload);
      })
      .addCase(createAssignment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create assignment';
      })
      // Update assignment
      .addCase(updateAssignment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAssignment.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.assignments.findIndex(a => a.id === action.payload.id);
        if (index !== -1) {
          state.assignments[index] = action.payload;
        }
      })
      .addCase(updateAssignment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update assignment';
      })
      // Delete assignment
      .addCase(deleteAssignment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAssignment.fulfilled, (state, action) => {
        state.loading = false;
        state.assignments = state.assignments.filter(a => a.id !== action.payload);
      })
      .addCase(deleteAssignment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete assignment';
      })
      // Fetch assignment stats
      .addCase(fetchAssignmentStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssignmentStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchAssignmentStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch assignment stats';
      });
  }
});

export const { clearAssignments, clearError } = projectAssignmentSlice.actions;
export default projectAssignmentSlice.reducer;
