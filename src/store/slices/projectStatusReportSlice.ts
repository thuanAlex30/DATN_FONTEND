import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import projectStatusReportService from '../../services/projectStatusReportService';
import type { 
  ProjectStatusReport, 
  CreateStatusReportData, 
  UpdateStatusReportData,
  StatusReportStats,
  StatusReportTemplate 
} from '../../types/projectStatusReport';

interface ProjectStatusReportState {
  statusReports: ProjectStatusReport[];
  stats: StatusReportStats | null;
  template: StatusReportTemplate | null;
  loading: boolean;
  error: string | null;
  selectedStatusReport: ProjectStatusReport | null;
}

const initialState: ProjectStatusReportState = {
  statusReports: [],
  stats: null,
  template: null,
  loading: false,
  error: null,
  selectedStatusReport: null,
};

// Async thunks
export const fetchProjectStatusReports = createAsyncThunk(
  'projectStatusReport/fetchProjectStatusReports',
  async (projectId: string) => {
    const response = await projectStatusReportService.getProjectStatusReports(projectId);
    return response.data;
  }
);

export const fetchStatusReportById = createAsyncThunk(
  'projectStatusReport/fetchStatusReportById',
  async (id: string) => {
    const response = await projectStatusReportService.getStatusReportById(id);
    return response.data;
  }
);

export const createStatusReport = createAsyncThunk(
  'projectStatusReport/createStatusReport',
  async (data: CreateStatusReportData) => {
    const response = await projectStatusReportService.createStatusReport(data);
    return response.data;
  }
);

export const updateStatusReport = createAsyncThunk(
  'projectStatusReport/updateStatusReport',
  async ({ id, data }: { id: string; data: UpdateStatusReportData }) => {
    const response = await projectStatusReportService.updateStatusReport(id, data);
    return response.data;
  }
);

export const deleteStatusReport = createAsyncThunk(
  'projectStatusReport/deleteStatusReport',
  async (id: string) => {
    await projectStatusReportService.deleteStatusReport(id);
    return id;
  }
);

export const fetchLatestStatusReport = createAsyncThunk(
  'projectStatusReport/fetchLatestStatusReport',
  async (projectId: string) => {
    const response = await projectStatusReportService.getLatestStatusReport(projectId);
    return response.data;
  }
);

export const fetchStatusReportStats = createAsyncThunk(
  'projectStatusReport/fetchStatusReportStats',
  async () => {
    const response = await projectStatusReportService.getStatusReportStats();
    return response.data;
  }
);

export const fetchStatusReportTemplate = createAsyncThunk(
  'projectStatusReport/fetchStatusReportTemplate',
  async () => {
    const response = await projectStatusReportService.getStatusReportTemplate();
    return response.data;
  }
);

const projectStatusReportSlice = createSlice({
  name: 'projectStatusReport',
  initialState,
  reducers: {
    setSelectedStatusReport: (state, action: PayloadAction<ProjectStatusReport | null>) => {
      state.selectedStatusReport = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch project status reports
      .addCase(fetchProjectStatusReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectStatusReports.fulfilled, (state, action) => {
        state.loading = false;
        state.statusReports = action.payload;
      })
      .addCase(fetchProjectStatusReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch status reports';
      })
      
      // Fetch status report by ID
      .addCase(fetchStatusReportById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStatusReportById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedStatusReport = action.payload;
      })
      .addCase(fetchStatusReportById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch status report';
      })
      
      // Create status report
      .addCase(createStatusReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createStatusReport.fulfilled, (state, action) => {
        state.loading = false;
        state.statusReports.push(action.payload);
      })
      .addCase(createStatusReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create status report';
      })
      
      // Update status report
      .addCase(updateStatusReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateStatusReport.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.statusReports.findIndex(report => report.id === action.payload.id);
        if (index !== -1) {
          state.statusReports[index] = action.payload;
        }
        if (state.selectedStatusReport?.id === action.payload.id) {
          state.selectedStatusReport = action.payload;
        }
      })
      .addCase(updateStatusReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update status report';
      })
      
      // Delete status report
      .addCase(deleteStatusReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteStatusReport.fulfilled, (state, action) => {
        state.loading = false;
        state.statusReports = state.statusReports.filter(report => report.id !== action.payload);
        if (state.selectedStatusReport?.id === action.payload) {
          state.selectedStatusReport = null;
        }
      })
      .addCase(deleteStatusReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete status report';
      })
      
      // Fetch latest status report
      .addCase(fetchLatestStatusReport.fulfilled, (state, action) => {
        state.selectedStatusReport = action.payload;
      })
      
      // Fetch status report stats
      .addCase(fetchStatusReportStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      
      // Fetch status report template
      .addCase(fetchStatusReportTemplate.fulfilled, (state, action) => {
        state.template = action.payload;
      });
  },
});

export const { setSelectedStatusReport, clearError } = projectStatusReportSlice.actions;
export default projectStatusReportSlice.reducer;
