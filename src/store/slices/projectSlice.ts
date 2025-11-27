import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import projectService from '../../services/projectService';
import siteService from '../../services/siteService';
import type { 
  Project, 
  ProjectStats, 
  ProjectFilters, 
  ProjectAssignment, 
  Site, 
  ProjectTimeline,
  CreateProjectData, 
  UpdateProjectData, 
  CreateSiteData, 
  UpdateSiteData, 
  CreateAssignmentData, 
  UpdateAssignmentData 
} from '../../types/project';

interface ProjectState {
  projects: Project[];
  filteredProjects: Project[];
  sites: Site[];
  assignments: ProjectAssignment[];
  stats: ProjectStats | null;
  timeline: ProjectTimeline | null;
  loading: boolean;
  error: string | null;
  selectedProject: Project | null;
  filters: ProjectFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const initialState: ProjectState = {
  projects: [],
  filteredProjects: [],
  sites: [],
  assignments: [],
  stats: null,
  timeline: null,
  loading: false,
  error: null,
  selectedProject: null,
  filters: {
    status: undefined,
    priority: undefined,
    leader_id: undefined,
    site_id: undefined,
    search: '',
    start_date_from: undefined,
    start_date_to: undefined,
    end_date_from: undefined,
    end_date_to: undefined,
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
};

// Async thunks
export const fetchProjects = createAsyncThunk(
  'project/fetchProjects',
  async (filters: ProjectFilters = {}, { rejectWithValue }) => {
    try {
      const response = await projectService.getAllProjects(filters);
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.message || 'Failed to fetch projects');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch projects');
    }
  }
);

export const fetchProjectById = createAsyncThunk(
  'project/fetchProjectById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await projectService.getProjectById(id);
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.message || 'Failed to fetch project');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch project');
    }
  }
);

export const createProject = createAsyncThunk(
  'project/createProject',
  async (data: CreateProjectData, { rejectWithValue }) => {
    try {
      const response = await projectService.createProject(data);
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.message || 'Failed to create project');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create project');
    }
  }
);

export const updateProject = createAsyncThunk(
  'project/updateProject',
  async ({ id, data }: { id: string; data: UpdateProjectData }, { rejectWithValue }) => {
    try {
      const response = await projectService.updateProject(id, data);
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.message || 'Failed to update project');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update project');
    }
  }
);

export const deleteProject = createAsyncThunk(
  'project/deleteProject',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await projectService.deleteProject(id);
      if (response.success) {
        return id;
      } else {
        return rejectWithValue(response.message || 'Failed to delete project');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete project');
    }
  }
);

export const fetchProjectStats = createAsyncThunk(
  'project/fetchProjectStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await projectService.getProjectStats();
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.message || 'Failed to fetch project stats');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch project stats');
    }
  }
);

export const fetchSitesByProject = createAsyncThunk(
  'project/fetchSitesByProject',
  async (projectId: string, { rejectWithValue }) => {
    try {
      const response = await siteService.getSitesByProject(projectId);
      if (response.success) {
        return { sites: response.data, projectId };
      } else {
        return rejectWithValue(response.message || 'Failed to fetch sites');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch sites');
    }
  }
);

export const fetchProjectTimeline = createAsyncThunk(
  'project/fetchProjectTimeline',
  async (projectId: string, { rejectWithValue }) => {
    try {
      const response = await projectService.getProjectTimeline(projectId);
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.message || 'Failed to fetch project timeline');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch project timeline');
    }
  }
);

export const fetchProjectAssignments = createAsyncThunk(
  'project/fetchProjectAssignments',
  async (projectId: string, { rejectWithValue }) => {
    try {
      const response = await projectService.getProjectAssignments(projectId);
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.message || 'Failed to fetch project assignments');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch project assignments');
    }
  }
);

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    setSelectedProject: (state, action: PayloadAction<Project | null>) => {
      state.selectedProject = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<ProjectFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setPagination: (state, action: PayloadAction<Partial<typeof initialState.pagination>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedProject: (state) => {
      state.selectedProject = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch projects
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.projects = action.payload;
          state.filteredProjects = action.payload;
          state.pagination.total = action.payload.length;
          state.pagination.totalPages = Math.ceil(action.payload.length / state.pagination.limit);
        }
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch project by ID
      .addCase(fetchProjectById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectById.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.selectedProject = action.payload;
        }
      })
      .addCase(fetchProjectById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create project
      .addCase(createProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.projects.unshift(action.payload);
          state.filteredProjects.unshift(action.payload);
          state.pagination.total += 1;
        }
      })
      .addCase(createProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update project
      .addCase(updateProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          const project = action.payload;
          const index = state.projects.findIndex(p => p.id === project.id);
          if (index !== -1) {
            state.projects[index] = project;
            state.filteredProjects[index] = project;
          }
          if (state.selectedProject?.id === project.id) {
            state.selectedProject = project;
          }
        }
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete project
      .addCase(deleteProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = state.projects.filter(p => p.id !== action.payload);
        state.filteredProjects = state.filteredProjects.filter(p => p.id !== action.payload);
        state.pagination.total -= 1;
        if (state.selectedProject?.id === action.payload) {
          state.selectedProject = null;
        }
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch project stats
      .addCase(fetchProjectStats.fulfilled, (state, action) => {
        if (action.payload) {
          state.stats = action.payload;
        }
      })
      // Fetch sites by project
      .addCase(fetchSitesByProject.fulfilled, (state, action) => {
        if (action.payload?.sites) {
          state.sites = action.payload.sites;
        }
      })
      // Fetch project timeline
      .addCase(fetchProjectTimeline.fulfilled, (state, action) => {
        if (action.payload) {
          state.timeline = action.payload;
        }
      })
      // Fetch project assignments
      .addCase(fetchProjectAssignments.fulfilled, (state, action) => {
        if (action.payload) {
          state.assignments = action.payload;
        }
      });
  },
});

export const {
  setSelectedProject,
  setFilters,
  clearFilters,
  setPagination,
  clearError,
  clearSelectedProject,
} = projectSlice.actions;

export default projectSlice.reducer;
