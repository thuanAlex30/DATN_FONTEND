import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import projectResourceService from '../../services/projectResourceService';
import type { 
  ProjectResource, 
  ResourceAllocation,
  CreateProjectResourceData, 
  UpdateProjectResourceData
} from '../../services/projectResourceService';

interface ProjectResourceState {
  resources: ProjectResource[];
  allocations: ResourceAllocation[];
  stats: any | null;
  loading: boolean;
  error: string | null;
  selectedResource: ProjectResource | null;
  currentProjectId: string | null;
}

const initialState: ProjectResourceState = {
  resources: [],
  allocations: [],
  stats: null,
  loading: false,
  error: null,
  selectedResource: null,
  currentProjectId: null,
};

// Async thunks
export const fetchProjectResources = createAsyncThunk(
  'projectResource/fetchProjectResources',
  async (projectId: string) => {
    const response = await projectResourceService.getProjectResources(projectId);
    return response;
  }
);

export const fetchResourceById = createAsyncThunk(
  'projectResource/fetchResourceById',
  async (id: string) => {
    const response = await projectResourceService.getResourceById(id);
    return response;
  }
);

export const createResource = createAsyncThunk(
  'projectResource/createResource',
  async (data: CreateProjectResourceData) => {
    const response = await projectResourceService.createResource(data);
    return response;
  }
);

export const updateResource = createAsyncThunk(
  'projectResource/updateResource',
  async ({ id, data }: { id: string; data: UpdateProjectResourceData }) => {
    const response = await projectResourceService.updateResource(id, data);
    return response;
  }
);

export const deleteResource = createAsyncThunk(
  'projectResource/deleteResource',
  async (id: string) => {
    await projectResourceService.deleteResource(id);
    return id;
  }
);

export const fetchResourceAllocations = createAsyncThunk(
  'projectResource/fetchResourceAllocations',
  async (projectId: string) => {
    const response = await projectResourceService.getResourceAllocation(projectId);
    return response;
  }
);

export const updateResourceAllocation = createAsyncThunk(
  'projectResource/updateResourceAllocation',
  async ({ allocationId, data }: { allocationId: string; data: Partial<ResourceAllocation> }) => {
    const response = await projectResourceService.updateResourceAllocation(allocationId, data);
    return response;
  }
);

export const fetchResourceStats = createAsyncThunk(
  'projectResource/fetchResourceStats',
  async (projectId: string) => {
    const response = await projectResourceService.getResourceStats(projectId);
    return response;
  }
);

const projectResourceSlice = createSlice({
  name: 'projectResource',
  initialState,
  reducers: {
    setSelectedResource: (state, action: PayloadAction<ProjectResource | null>) => {
      state.selectedResource = action.payload;
    },
    setCurrentProjectId: (state, action: PayloadAction<string | null>) => {
      // Clear resources when switching projects
      if (state.currentProjectId !== action.payload) {
        state.resources = [];
        state.allocations = [];
        state.stats = null;
        state.selectedResource = null;
      }
      state.currentProjectId = action.payload;
    },
    clearResources: (state) => {
      state.resources = [];
      state.allocations = [];
      state.stats = null;
      state.selectedResource = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch project resources
      .addCase(fetchProjectResources.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectResources.fulfilled, (state, action) => {
        state.loading = false;
        state.resources = action.payload;
      })
      .addCase(fetchProjectResources.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch resources';
      })
      
      // Fetch resource by ID
      .addCase(fetchResourceById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchResourceById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedResource = action.payload;
      })
      .addCase(fetchResourceById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch resource';
      })
      
      // Create resource
      .addCase(createResource.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createResource.fulfilled, (state, action) => {
        state.loading = false;
        state.resources.push(action.payload);
      })
      .addCase(createResource.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create resource';
      })
      
      // Update resource
      .addCase(updateResource.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateResource.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.resources.findIndex(resource => resource._id === action.payload._id);
        if (index !== -1) {
          state.resources[index] = action.payload;
        }
        if (state.selectedResource?._id === action.payload._id) {
          state.selectedResource = action.payload;
        }
      })
      .addCase(updateResource.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update resource';
      })
      
      // Delete resource
      .addCase(deleteResource.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteResource.fulfilled, (state, action) => {
        state.loading = false;
        state.resources = state.resources.filter(resource => resource._id !== action.payload);
        if (state.selectedResource?._id === action.payload) {
          state.selectedResource = null;
        }
      })
      .addCase(deleteResource.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete resource';
      })
      
      // Fetch resource allocations
      .addCase(fetchResourceAllocations.fulfilled, (state, action) => {
        state.allocations = action.payload;
      })
      
      // Update resource allocation
      .addCase(updateResourceAllocation.fulfilled, (state, action) => {
        const index = state.allocations.findIndex(allocation => allocation.resource_id === action.payload.resource_id);
        if (index !== -1) {
          state.allocations[index] = action.payload;
        }
      })
      
      // Fetch resource stats
      .addCase(fetchResourceStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  },
});

export const { setSelectedResource, setCurrentProjectId, clearResources, clearError } = projectResourceSlice.actions;
export default projectResourceSlice.reducer;
