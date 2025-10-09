import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import siteService from '../../services/siteService';
import type { 
  Site, 
  CreateSiteData, 
  UpdateSiteData,
  SiteStats 
} from '../../types/site';

interface SiteState {
  sites: Site[];
  stats: SiteStats | null;
  loading: boolean;
  error: string | null;
  selectedSite: Site | null;
  currentProjectId: string | null;
}

const initialState: SiteState = {
  sites: [],
  stats: null,
  loading: false,
  error: null,
  selectedSite: null,
  currentProjectId: null,
};

// Async thunks
export const fetchSitesByProject = createAsyncThunk(
  'site/fetchSitesByProject',
  async (projectId: string, { rejectWithValue }) => {
    try {
      const response = await siteService.getSites({ project_id: projectId });
      if (response.success) {
        return { sites: response.data?.sites || [], projectId };
      } else {
        return rejectWithValue(response.message || 'Failed to fetch sites');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch sites');
    }
  }
);

export const fetchSiteById = createAsyncThunk(
  'site/fetchSiteById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await siteService.getSiteById(id);
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.message || 'Failed to fetch site');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch site');
    }
  }
);

export const createSite = createAsyncThunk(
  'site/createSite',
  async (data: CreateSiteData, { rejectWithValue }) => {
    try {
      const response = await siteService.createSite(data);
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.message || 'Failed to create site');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create site');
    }
  }
);

export const updateSite = createAsyncThunk(
  'site/updateSite',
  async ({ id, data }: { id: string; data: UpdateSiteData }, { rejectWithValue }) => {
    try {
      const response = await siteService.updateSite(id, data);
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.message || 'Failed to update site');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update site');
    }
  }
);

export const deleteSite = createAsyncThunk(
  'site/deleteSite',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await siteService.deleteSite(id);
      if (response.success) {
        return id;
      } else {
        return rejectWithValue(response.message || 'Failed to delete site');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete site');
    }
  }
);

export const fetchSiteStats = createAsyncThunk(
  'site/fetchSiteStats',
  async (siteId: string, { rejectWithValue }) => {
    try {
      const response = await siteService.getSiteStats(siteId);
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.message || 'Failed to fetch site stats');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch site stats');
    }
  }
);

// Note: validateSiteName method not implemented in service yet

export const createSiteForProject = createAsyncThunk(
  'site/createSiteForProject',
  async ({ projectId, data }: { projectId: string; data: CreateSiteData }, { rejectWithValue }) => {
    try {
      const response = await siteService.createSite({ ...data, project_id: projectId });
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.message || 'Failed to create site');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create site');
    }
  }
);

const siteSlice = createSlice({
  name: 'site',
  initialState,
  reducers: {
    setSelectedSite: (state, action: PayloadAction<Site | null>) => {
      state.selectedSite = action.payload;
    },
    setCurrentProjectId: (state, action: PayloadAction<string | null>) => {
      state.currentProjectId = action.payload;
      // Clear sites when switching projects
      if (state.currentProjectId !== action.payload) {
        state.sites = [];
        state.selectedSite = null;
      }
    },
    clearSites: (state) => {
      state.sites = [];
      state.selectedSite = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedSite: (state) => {
      state.selectedSite = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch sites by project
      .addCase(fetchSitesByProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSitesByProject.fulfilled, (state, action) => {
        state.loading = false;
        state.sites = action.payload.sites;
        state.currentProjectId = action.payload.projectId;
      })
      .addCase(fetchSitesByProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch site by ID
      .addCase(fetchSiteById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSiteById.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.selectedSite = action.payload;
        }
      })
      .addCase(fetchSiteById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create site
      .addCase(createSite.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSite.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.sites.push(action.payload);
        }
      })
      .addCase(createSite.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update site
      .addCase(updateSite.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSite.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          const site = action.payload;
          const index = state.sites.findIndex(s => s._id === site._id);
          if (index !== -1) {
            state.sites[index] = site;
          }
          if (state.selectedSite?._id === site._id) {
            state.selectedSite = site;
          }
        }
      })
      .addCase(updateSite.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Delete site
      .addCase(deleteSite.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSite.fulfilled, (state, action) => {
        state.loading = false;
        state.sites = state.sites.filter(site => site._id !== action.payload);
        if (state.selectedSite?._id === action.payload) {
          state.selectedSite = null;
        }
      })
      .addCase(deleteSite.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch site stats
      .addCase(fetchSiteStats.fulfilled, (state, action) => {
        if (action.payload) {
          state.stats = action.payload;
        }
      })
      
      // Create site for project
      .addCase(createSiteForProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSiteForProject.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.sites.push(action.payload);
        }
      })
      .addCase(createSiteForProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setSelectedSite,
  setCurrentProjectId,
  clearSites,
  clearError,
  clearSelectedSite,
} = siteSlice.actions;

export default siteSlice.reducer;
