import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import workLocationService from '../../services/workLocationService';
import type { 
  WorkLocation, 
  LocationAssignment,
  CreateLocationData, 
  UpdateLocationData,
  CreateLocationAssignmentData,
  UpdateLocationAssignmentData,
  LocationStats,
  LocationAvailability 
} from '../../types/workLocation';

interface WorkLocationState {
  locations: WorkLocation[];
  assignments: LocationAssignment[];
  availability: LocationAvailability[];
  stats: LocationStats | null;
  loading: boolean;
  error: string | null;
  selectedLocation: WorkLocation | null;
}

const initialState: WorkLocationState = {
  locations: [],
  assignments: [],
  availability: [],
  stats: null,
  loading: false,
  error: null,
  selectedLocation: null,
};

// Async thunks
export const fetchAreaLocations = createAsyncThunk(
  'workLocation/fetchAreaLocations',
  async (areaId: string) => {
    const response = await workLocationService.getAreaLocations(areaId);
    return response.data;
  }
);

export const fetchLocationById = createAsyncThunk(
  'workLocation/fetchLocationById',
  async (id: string) => {
    const response = await workLocationService.getLocationById(id);
    return response.data;
  }
);

export const createLocation = createAsyncThunk(
  'workLocation/createLocation',
  async (data: CreateLocationData) => {
    const response = await workLocationService.createLocation(data);
    return response.data;
  }
);

export const updateLocation = createAsyncThunk(
  'workLocation/updateLocation',
  async ({ id, data }: { id: string; data: UpdateLocationData }) => {
    const response = await workLocationService.updateLocation(id, data);
    return response.data;
  }
);

export const deleteLocation = createAsyncThunk(
  'workLocation/deleteLocation',
  async (id: string) => {
    await workLocationService.deleteLocation(id);
    return id;
  }
);

export const fetchLocationAssignments = createAsyncThunk(
  'workLocation/fetchLocationAssignments',
  async (locationId: string) => {
    const response = await workLocationService.getLocationAssignments(locationId);
    return response.data;
  }
);

export const addLocationAssignment = createAsyncThunk(
  'workLocation/addLocationAssignment',
  async ({ locationId, data }: { locationId: string; data: CreateLocationAssignmentData }) => {
    const response = await workLocationService.addLocationAssignment(locationId, data);
    return response.data;
  }
);

export const updateLocationAssignment = createAsyncThunk(
  'workLocation/updateLocationAssignment',
  async ({ assignmentId, data }: { assignmentId: string; data: UpdateLocationAssignmentData }) => {
    const response = await workLocationService.updateLocationAssignment(assignmentId, data);
    return response.data;
  }
);

export const removeLocationAssignment = createAsyncThunk(
  'workLocation/removeLocationAssignment',
  async (assignmentId: string) => {
    await workLocationService.removeLocationAssignment(assignmentId);
    return assignmentId;
  }
);

export const fetchLocationAvailability = createAsyncThunk(
  'workLocation/fetchLocationAvailability',
  async ({ locationId, filters }: { locationId: string; filters?: { start_date?: string; end_date?: string } }) => {
    const response = await workLocationService.getLocationAvailability(locationId, filters);
    return response.data;
  }
);

export const fetchLocationStats = createAsyncThunk(
  'workLocation/fetchLocationStats',
  async (locationId: string) => {
    const response = await workLocationService.getLocationStats(locationId);
    return response.data;
  }
);

const workLocationSlice = createSlice({
  name: 'workLocation',
  initialState,
  reducers: {
    setSelectedLocation: (state, action: PayloadAction<WorkLocation | null>) => {
      state.selectedLocation = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch area locations
      .addCase(fetchAreaLocations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAreaLocations.fulfilled, (state, action) => {
        state.loading = false;
        state.locations = action.payload;
      })
      .addCase(fetchAreaLocations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch locations';
      })
      
      // Fetch location by ID
      .addCase(fetchLocationById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLocationById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedLocation = action.payload;
      })
      .addCase(fetchLocationById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch location';
      })
      
      // Create location
      .addCase(createLocation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createLocation.fulfilled, (state, action) => {
        state.loading = false;
        state.locations.push(action.payload);
      })
      .addCase(createLocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create location';
      })
      
      // Update location
      .addCase(updateLocation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateLocation.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.locations.findIndex(location => location.id === action.payload.id);
        if (index !== -1) {
          state.locations[index] = action.payload;
        }
        if (state.selectedLocation?.id === action.payload.id) {
          state.selectedLocation = action.payload;
        }
      })
      .addCase(updateLocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update location';
      })
      
      // Delete location
      .addCase(deleteLocation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteLocation.fulfilled, (state, action) => {
        state.loading = false;
        state.locations = state.locations.filter(location => location.id !== action.payload);
        if (state.selectedLocation?.id === action.payload) {
          state.selectedLocation = null;
        }
      })
      .addCase(deleteLocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete location';
      })
      
      // Fetch location assignments
      .addCase(fetchLocationAssignments.fulfilled, (state, action) => {
        state.assignments = action.payload;
      })
      
      // Add location assignment
      .addCase(addLocationAssignment.fulfilled, (state, action) => {
        state.assignments.push(action.payload);
      })
      
      // Update location assignment
      .addCase(updateLocationAssignment.fulfilled, (state, action) => {
        const index = state.assignments.findIndex(assignment => assignment.id === action.payload.id);
        if (index !== -1) {
          state.assignments[index] = action.payload;
        }
      })
      
      // Remove location assignment
      .addCase(removeLocationAssignment.fulfilled, (state, action) => {
        state.assignments = state.assignments.filter(assignment => assignment.id !== action.payload);
      })
      
      // Fetch location availability
      .addCase(fetchLocationAvailability.fulfilled, (state, action) => {
        state.availability = action.payload;
      })
      
      // Fetch location stats
      .addCase(fetchLocationStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  },
});

export const { setSelectedLocation, clearError } = workLocationSlice.actions;
export default workLocationSlice.reducer;
