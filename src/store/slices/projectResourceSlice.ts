import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import projectResourceService from '../../services/projectResourceService';
import type { 
  ProjectResource, 
  ResourceAllocation,
  CreateResourceData, 
  UpdateResourceData,
  CreateAllocationData,
  UpdateAllocationData,
  ResourceStats,
  ResourceAvailability 
} from '../../types/projectResource';

interface ProjectResourceState {
  resources: ProjectResource[];
  allocations: ResourceAllocation[];
  availability: ResourceAvailability[];
  stats: ResourceStats | null;
  loading: boolean;
  error: string | null;
  selectedResource: ProjectResource | null;
}

const initialState: ProjectResourceState = {
  resources: [],
  allocations: [],
  availability: [],
  stats: null,
  loading: false,
  error: null,
  selectedResource: null,
};

// Async thunks
export const fetchProjectResources = createAsyncThunk(
  'projectResource/fetchProjectResources',
  async (projectId: string) => {
    const response = await projectResourceService.getProjectResources(projectId);
    return response.data;
  }
);

export const fetchResourceById = createAsyncThunk(
  'projectResource/fetchResourceById',
  async (id: string) => {
    const response = await projectResourceService.getResourceById(id);
    return response.data;
  }
);

export const createResource = createAsyncThunk(
  'projectResource/createResource',
  async (data: CreateResourceData) => {
    const response = await projectResourceService.createResource(data);
    return response.data;
  }
);

export const updateResource = createAsyncThunk(
  'projectResource/updateResource',
  async ({ id, data }: { id: string; data: UpdateResourceData }) => {
    const response = await projectResourceService.updateResource(id, data);
    return response.data;
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
  async (resourceId: string) => {
    const response = await projectResourceService.getResourceAllocations(resourceId);
    return response.data;
  }
);

export const addResourceAllocation = createAsyncThunk(
  'projectResource/addResourceAllocation',
  async ({ resourceId, data }: { resourceId: string; data: CreateAllocationData }) => {
    const response = await projectResourceService.addResourceAllocation(resourceId, data);
    return response.data;
  }
);

export const updateResourceAllocation = createAsyncThunk(
  'projectResource/updateResourceAllocation',
  async ({ allocationId, data }: { allocationId: string; data: UpdateAllocationData }) => {
    const response = await projectResourceService.updateResourceAllocation(allocationId, data);
    return response.data;
  }
);

export const removeResourceAllocation = createAsyncThunk(
  'projectResource/removeResourceAllocation',
  async (allocationId: string) => {
    await projectResourceService.removeResourceAllocation(allocationId);
    return allocationId;
  }
);

export const fetchResourceAvailability = createAsyncThunk(
  'projectResource/fetchResourceAvailability',
  async (filters?: { start_date?: string; end_date?: string; resource_type?: string }) => {
    const response = await projectResourceService.getResourceAvailability(filters);
    return response.data;
  }
);

export const fetchResourceStats = createAsyncThunk(
  'projectResource/fetchResourceStats',
  async (resourceId: string) => {
    const response = await projectResourceService.getResourceStats(resourceId);
    return response.data;
  }
);

const projectResourceSlice = createSlice({
  name: 'projectResource',
  initialState,
  reducers: {
    setSelectedResource: (state, action: PayloadAction<ProjectResource | null>) => {
      state.selectedResource = action.payload;
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
        const index = state.resources.findIndex(resource => resource.id === action.payload.id);
        if (index !== -1) {
          state.resources[index] = action.payload;
        }
        if (state.selectedResource?.id === action.payload.id) {
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
        state.resources = state.resources.filter(resource => resource.id !== action.payload);
        if (state.selectedResource?.id === action.payload) {
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
      
      // Add resource allocation
      .addCase(addResourceAllocation.fulfilled, (state, action) => {
        state.allocations.push(action.payload);
      })
      
      // Update resource allocation
      .addCase(updateResourceAllocation.fulfilled, (state, action) => {
        const index = state.allocations.findIndex(allocation => allocation.id === action.payload.id);
        if (index !== -1) {
          state.allocations[index] = action.payload;
        }
      })
      
      // Remove resource allocation
      .addCase(removeResourceAllocation.fulfilled, (state, action) => {
        state.allocations = state.allocations.filter(allocation => allocation.id !== action.payload);
      })
      
      // Fetch resource availability
      .addCase(fetchResourceAvailability.fulfilled, (state, action) => {
        state.availability = action.payload;
      })
      
      // Fetch resource stats
      .addCase(fetchResourceStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  },
});

export const { setSelectedResource, clearError } = projectResourceSlice.actions;
export default projectResourceSlice.reducer;
