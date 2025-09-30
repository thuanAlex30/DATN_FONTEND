import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import siteAreaService from '../../services/siteAreaService';
import type { 
  SiteArea, 
  AreaAccessControl,
  AreaSafetyChecklist,
  AreaInspection,
  CreateAreaData, 
  UpdateAreaData,
  CreateAccessControlData,
  UpdateAccessControlData,
  CreateSafetyChecklistData,
  CreateInspectionData,
  UpdateInspectionData,
  AreaStats 
} from '../../types/siteArea';

interface SiteAreaState {
  areas: SiteArea[];
  accessControls: AreaAccessControl[];
  safetyChecklists: AreaSafetyChecklist[];
  inspections: AreaInspection[];
  stats: AreaStats | null;
  loading: boolean;
  error: string | null;
  selectedArea: SiteArea | null;
}

const initialState: SiteAreaState = {
  areas: [],
  accessControls: [],
  safetyChecklists: [],
  inspections: [],
  stats: null,
  loading: false,
  error: null,
  selectedArea: null,
};

// Async thunks
export const fetchSiteAreas = createAsyncThunk(
  'siteArea/fetchSiteAreas',
  async (siteId: string) => {
    const response = await siteAreaService.getSiteAreas(siteId);
    return response.data;
  }
);

export const fetchAreaById = createAsyncThunk(
  'siteArea/fetchAreaById',
  async (id: string) => {
    const response = await siteAreaService.getAreaById(id);
    return response.data;
  }
);

export const createArea = createAsyncThunk(
  'siteArea/createArea',
  async (data: CreateAreaData) => {
    const response = await siteAreaService.createArea(data);
    return response.data;
  }
);

export const updateArea = createAsyncThunk(
  'siteArea/updateArea',
  async ({ id, data }: { id: string; data: UpdateAreaData }) => {
    const response = await siteAreaService.updateArea(id, data);
    return response.data;
  }
);

export const deleteArea = createAsyncThunk(
  'siteArea/deleteArea',
  async (id: string) => {
    await siteAreaService.deleteArea(id);
    return id;
  }
);

export const fetchAreaAccessControls = createAsyncThunk(
  'siteArea/fetchAreaAccessControls',
  async (areaId: string) => {
    const response = await siteAreaService.getAreaAccessControls(areaId);
    return response.data;
  }
);

export const addAreaAccessControl = createAsyncThunk(
  'siteArea/addAreaAccessControl',
  async ({ areaId, data }: { areaId: string; data: CreateAccessControlData }) => {
    const response = await siteAreaService.addAreaAccessControl(areaId, data);
    return response.data;
  }
);

export const updateAreaAccessControl = createAsyncThunk(
  'siteArea/updateAreaAccessControl',
  async ({ accessControlId, data }: { accessControlId: string; data: UpdateAccessControlData }) => {
    const response = await siteAreaService.updateAreaAccessControl(accessControlId, data);
    return response.data;
  }
);

export const removeAreaAccessControl = createAsyncThunk(
  'siteArea/removeAreaAccessControl',
  async (accessControlId: string) => {
    await siteAreaService.removeAreaAccessControl(accessControlId);
    return accessControlId;
  }
);

export const fetchAreaSafetyChecklists = createAsyncThunk(
  'siteArea/fetchAreaSafetyChecklists',
  async (areaId: string) => {
    const response = await siteAreaService.getAreaSafetyChecklists(areaId);
    return response.data;
  }
);

export const createAreaSafetyChecklist = createAsyncThunk(
  'siteArea/createAreaSafetyChecklist',
  async ({ areaId, data }: { areaId: string; data: CreateSafetyChecklistData }) => {
    const response = await siteAreaService.createAreaSafetyChecklist(areaId, data);
    return response.data;
  }
);

export const fetchAreaInspections = createAsyncThunk(
  'siteArea/fetchAreaInspections',
  async (areaId: string) => {
    const response = await siteAreaService.getAreaInspections(areaId);
    return response.data;
  }
);

export const createAreaInspection = createAsyncThunk(
  'siteArea/createAreaInspection',
  async ({ areaId, data }: { areaId: string; data: CreateInspectionData }) => {
    const response = await siteAreaService.createAreaInspection(areaId, data);
    return response.data;
  }
);

export const updateAreaInspection = createAsyncThunk(
  'siteArea/updateAreaInspection',
  async ({ inspectionId, data }: { inspectionId: string; data: UpdateInspectionData }) => {
    const response = await siteAreaService.updateAreaInspection(inspectionId, data);
    return response.data;
  }
);

export const fetchAreaStats = createAsyncThunk(
  'siteArea/fetchAreaStats',
  async (areaId: string) => {
    const response = await siteAreaService.getAreaStats(areaId);
    return response.data;
  }
);

const siteAreaSlice = createSlice({
  name: 'siteArea',
  initialState,
  reducers: {
    setSelectedArea: (state, action: PayloadAction<SiteArea | null>) => {
      state.selectedArea = action.payload;
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
        const index = state.areas.findIndex(area => area.id === action.payload.id);
        if (index !== -1) {
          state.areas[index] = action.payload;
        }
        if (state.selectedArea?.id === action.payload.id) {
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
        state.areas = state.areas.filter(area => area.id !== action.payload);
        if (state.selectedArea?.id === action.payload) {
          state.selectedArea = null;
        }
      })
      .addCase(deleteArea.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete area';
      })
      
      // Fetch area access controls
      .addCase(fetchAreaAccessControls.fulfilled, (state, action) => {
        state.accessControls = action.payload;
      })
      
      // Add area access control
      .addCase(addAreaAccessControl.fulfilled, (state, action) => {
        state.accessControls.push(action.payload);
      })
      
      // Update area access control
      .addCase(updateAreaAccessControl.fulfilled, (state, action) => {
        const index = state.accessControls.findIndex(control => control.id === action.payload.id);
        if (index !== -1) {
          state.accessControls[index] = action.payload;
        }
      })
      
      // Remove area access control
      .addCase(removeAreaAccessControl.fulfilled, (state, action) => {
        state.accessControls = state.accessControls.filter(control => control.id !== action.payload);
      })
      
      // Fetch area safety checklists
      .addCase(fetchAreaSafetyChecklists.fulfilled, (state, action) => {
        state.safetyChecklists = action.payload;
      })
      
      // Create area safety checklist
      .addCase(createAreaSafetyChecklist.fulfilled, (state, action) => {
        state.safetyChecklists.push(action.payload);
      })
      
      // Fetch area inspections
      .addCase(fetchAreaInspections.fulfilled, (state, action) => {
        state.inspections = action.payload;
      })
      
      // Create area inspection
      .addCase(createAreaInspection.fulfilled, (state, action) => {
        state.inspections.push(action.payload);
      })
      
      // Update area inspection
      .addCase(updateAreaInspection.fulfilled, (state, action) => {
        const index = state.inspections.findIndex(inspection => inspection.id === action.payload.id);
        if (index !== -1) {
          state.inspections[index] = action.payload;
        }
      })
      
      // Fetch area stats
      .addCase(fetchAreaStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  },
});

export const { setSelectedArea, clearError } = siteAreaSlice.actions;
export default siteAreaSlice.reducer;
