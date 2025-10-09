import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import siteAreaService from '../../services/siteAreaService';
import type { 
  SiteArea, 
  CreateAreaData, 
  UpdateAreaData,
  AreaStats 
} from '../../types/siteArea';

interface SiteAreaState {
  areas: SiteArea[];
  stats: AreaStats | null;
  loading: boolean;
  error: string | null;
  selectedArea: SiteArea | null;
  currentProjectId: string | null;
}

const initialState: SiteAreaState = {
  areas: [],
  stats: null,
  loading: false,
  error: null,
  selectedArea: null,
  currentProjectId: null,
};

// Async thunks
export const fetchSiteAreas = createAsyncThunk(
  'siteArea/fetchSiteAreas',
  async (siteId: string) => {
    const areas = await siteAreaService.getSiteAreas(siteId);
    return areas;
  }
);

export const fetchAreasByProject = createAsyncThunk(
  'siteArea/fetchAreasByProject',
  async (projectId: string, { rejectWithValue }) => {
    try {
      const areas = await siteAreaService.getAllAreas({ project_id: projectId });
      return { areas, projectId };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch areas');
    }
  }
);

export const fetchAreaById = createAsyncThunk(
  'siteArea/fetchAreaById',
  async (id: string) => {
    const area = await siteAreaService.getAreaById(id);
    return area;
  }
);

export const createArea = createAsyncThunk(
  'siteArea/createArea',
  async (data: CreateAreaData) => {
    // Ensure supervisor_id is provided
    if (!data.supervisor_id) {
      throw new Error('Supervisor ID is required');
    }
    const area = await siteAreaService.createArea(data as any);
    return area;
  }
);

export const updateArea = createAsyncThunk(
  'siteArea/updateArea',
  async ({ id, data }: { id: string; data: UpdateAreaData }) => {
    const area = await siteAreaService.updateArea(id, data);
    return area;
  }
);

export const deleteArea = createAsyncThunk(
  'siteArea/deleteArea',
  async (id: string) => {
    await siteAreaService.deleteArea(id);
    return id;
  }
);

// These methods are not implemented in the service yet
// Will be implemented when needed

export const fetchAreaStats = createAsyncThunk(
  'siteArea/fetchAreaStats',
  async (siteId: string) => {
    const response = await siteAreaService.getAreaStats(siteId);
    return response;
  }
);

export const createAreaForProject = createAsyncThunk(
  'siteArea/createAreaForProject',
  async ({ data }: { projectId: string; data: CreateAreaData }, { rejectWithValue }) => {
    try {
      // Ensure supervisor_id is provided
      if (!data.supervisor_id) {
        return rejectWithValue('Supervisor ID is required');
      }
      const area = await siteAreaService.createArea(data as any);
      return area;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create area');
    }
  }
);

export const updateAreaForProject = createAsyncThunk(
  'siteArea/updateAreaForProject',
  async ({ id, data }: { id: string; data: UpdateAreaData }, { rejectWithValue }) => {
    try {
      const area = await siteAreaService.updateArea(id, data);
      return area;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update area');
    }
  }
);

export const deleteAreaForProject = createAsyncThunk(
  'siteArea/deleteAreaForProject',
  async (id: string, { rejectWithValue }) => {
    try {
      await siteAreaService.deleteArea(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete area');
    }
  }
);

const siteAreaSlice = createSlice({
  name: 'siteArea',
  initialState,
  reducers: {
    setSelectedArea: (state, action: PayloadAction<SiteArea | null>) => {
      state.selectedArea = action.payload;
    },
    setCurrentProjectId: (state, action: PayloadAction<string | null>) => {
      state.currentProjectId = action.payload;
      // Clear areas when switching projects
      if (state.currentProjectId !== action.payload) {
        state.areas = [];
        state.selectedArea = null;
      }
    },
    clearAreas: (state) => {
      state.areas = [];
      state.selectedArea = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch site areas
      .addCase(fetchSiteAreas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSiteAreas.fulfilled, (state, action) => {
        state.loading = false;
        state.areas = action.payload;
      })
      .addCase(fetchSiteAreas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch areas';
      })
      
      // Fetch area by ID
      .addCase(fetchAreaById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAreaById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedArea = action.payload;
      })
      .addCase(fetchAreaById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch area';
      })
      
      // Create area
      .addCase(createArea.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createArea.fulfilled, (state, action) => {
        state.loading = false;
        state.areas.push(action.payload);
      })
      .addCase(createArea.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create area';
      })
      
      // Update area
      .addCase(updateArea.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateArea.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.areas.findIndex(area => area._id === action.payload._id);
        if (index !== -1) {
          state.areas[index] = action.payload;
        }
        if (state.selectedArea?._id === action.payload._id) {
          state.selectedArea = action.payload;
        }
      })
      .addCase(updateArea.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update area';
      })
      
      // Delete area
      .addCase(deleteArea.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteArea.fulfilled, (state, action) => {
        state.loading = false;
        state.areas = state.areas.filter(area => area._id !== action.payload);
        if (state.selectedArea?._id === action.payload) {
          state.selectedArea = null;
        }
      })
      .addCase(deleteArea.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete area';
      })
      
      // Fetch area stats
      .addCase(fetchAreaStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      
      // Fetch areas by project
      .addCase(fetchAreasByProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAreasByProject.fulfilled, (state, action) => {
        state.loading = false;
        state.areas = action.payload.areas;
        state.currentProjectId = action.payload.projectId;
      })
      .addCase(fetchAreasByProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create area for project
      .addCase(createAreaForProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAreaForProject.fulfilled, (state, action) => {
        state.loading = false;
        state.areas.push(action.payload);
      })
      .addCase(createAreaForProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update area for project
      .addCase(updateAreaForProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAreaForProject.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.areas.findIndex(area => area._id === action.payload._id);
        if (index !== -1) {
          state.areas[index] = action.payload;
        }
        if (state.selectedArea?._id === action.payload._id) {
          state.selectedArea = action.payload;
        }
      })
      .addCase(updateAreaForProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Delete area for project
      .addCase(deleteAreaForProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAreaForProject.fulfilled, (state, action) => {
        state.loading = false;
        state.areas = state.areas.filter(area => area._id !== action.payload);
        if (state.selectedArea?._id === action.payload) {
          state.selectedArea = null;
        }
      })
      .addCase(deleteAreaForProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  setSelectedArea, 
  setCurrentProjectId, 
  clearAreas, 
  clearError 
} = siteAreaSlice.actions;
export default siteAreaSlice.reducer;
