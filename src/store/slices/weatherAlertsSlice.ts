import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { WeatherService } from '../../services/weatherService';
import type {
  WeatherAlert,
  WeatherAlertsResponse,
  WeatherAlertStatistics,
  WeatherCheckResponse,
  WeatherAlertType,
  WeatherAlertSeverity
} from '../../types/weather';

// Async thunks
export const fetchActiveAlerts = createAsyncThunk(
  'weatherAlerts/fetchActive',
  async (params?: { alert_type?: WeatherAlertType; severity?: WeatherAlertSeverity }) =>
    WeatherService.getActiveAlerts(params)
);

export const fetchAllAlerts = createAsyncThunk(
  'weatherAlerts/fetchAll',
  async (params?: {
    page?: number;
    limit?: number;
    alert_type?: WeatherAlertType;
    severity?: WeatherAlertSeverity;
    is_active?: boolean;
    start_date?: string;
    end_date?: string;
  }) => WeatherService.getAllAlerts(params)
);

export const checkWeather = createAsyncThunk(
  'weatherAlerts/checkWeather',
  async (params: { latitude: number; longitude: number; name?: string }) =>
    WeatherService.checkWeather(params)
);

export const resolveAlert = createAsyncThunk(
  'weatherAlerts/resolve',
  async (alertId: string) => WeatherService.resolveAlert(alertId)
);

export const fetchAlertStatistics = createAsyncThunk(
  'weatherAlerts/fetchStatistics',
  async (params?: { days?: number }) => WeatherService.getAlertStatistics(params)
);

interface WeatherAlertsState {
  activeAlerts: WeatherAlert[];
  allAlerts: WeatherAlert[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
  } | null;
  statistics: WeatherAlertStatistics[];
  activeAlertsStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  allAlertsStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  checkWeatherStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  resolveStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  statisticsStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  error?: string;
  activeAlertsError?: string;
  allAlertsError?: string;
  checkWeatherError?: string;
  resolveError?: string;
  statisticsError?: string;
  lastCheckResult: WeatherCheckResponse | null;
}

const initialState: WeatherAlertsState = {
  activeAlerts: [],
  allAlerts: [],
  pagination: null,
  statistics: [],
  activeAlertsStatus: 'idle',
  allAlertsStatus: 'idle',
  checkWeatherStatus: 'idle',
  resolveStatus: 'idle',
  statisticsStatus: 'idle',
  lastCheckResult: null,
};

const weatherAlertsSlice = createSlice({
  name: 'weatherAlerts',
  initialState,
  reducers: {
    clearActiveAlerts: (state) => {
      state.activeAlerts = [];
      state.activeAlertsStatus = 'idle';
      state.activeAlertsError = undefined;
    },
    clearAllAlerts: (state) => {
      state.allAlerts = [];
      state.pagination = null;
      state.allAlertsStatus = 'idle';
      state.allAlertsError = undefined;
    },
    clearErrors: (state) => {
      state.error = undefined;
      state.activeAlertsError = undefined;
      state.allAlertsError = undefined;
      state.checkWeatherError = undefined;
      state.resolveError = undefined;
      state.statisticsError = undefined;
    },
    removeAlert: (state, action: { payload: string }) => {
      state.activeAlerts = state.activeAlerts.filter((alert) => alert._id !== action.payload);
      state.allAlerts = state.allAlerts.filter((alert) => alert._id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch active alerts
      .addCase(fetchActiveAlerts.pending, (state) => {
        state.activeAlertsStatus = 'loading';
        state.activeAlertsError = undefined;
      })
      .addCase(fetchActiveAlerts.fulfilled, (state, action) => {
        state.activeAlertsStatus = 'succeeded';
        state.activeAlerts = action.payload;
      })
      .addCase(fetchActiveAlerts.rejected, (state, action) => {
        state.activeAlertsStatus = 'failed';
        state.activeAlertsError = action.error.message || 'Failed to fetch active alerts';
      })
      // Fetch all alerts
      .addCase(fetchAllAlerts.pending, (state) => {
        state.allAlertsStatus = 'loading';
        state.allAlertsError = undefined;
      })
      .addCase(fetchAllAlerts.fulfilled, (state, action) => {
        state.allAlertsStatus = 'succeeded';
        state.allAlerts = action.payload.alerts;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAllAlerts.rejected, (state, action) => {
        state.allAlertsStatus = 'failed';
        state.allAlertsError = action.error.message || 'Failed to fetch alerts';
      })
      // Check weather
      .addCase(checkWeather.pending, (state) => {
        state.checkWeatherStatus = 'loading';
        state.checkWeatherError = undefined;
      })
      .addCase(checkWeather.fulfilled, (state, action) => {
        state.checkWeatherStatus = 'succeeded';
        state.lastCheckResult = action.payload;
        // Refresh active alerts after check
        if (action.payload.alerts_created > 0) {
          // The component should manually refresh active alerts
        }
      })
      .addCase(checkWeather.rejected, (state, action) => {
        state.checkWeatherStatus = 'failed';
        state.checkWeatherError = action.error.message || 'Failed to check weather';
      })
      // Resolve alert
      .addCase(resolveAlert.pending, (state) => {
        state.resolveStatus = 'loading';
        state.resolveError = undefined;
      })
      .addCase(resolveAlert.fulfilled, (state, action) => {
        state.resolveStatus = 'succeeded';
        // Remove from active alerts
        state.activeAlerts = state.activeAlerts.filter((alert) => alert._id !== action.payload._id);
        // Update in all alerts
        const index = state.allAlerts.findIndex((alert) => alert._id === action.payload._id);
        if (index !== -1) {
          state.allAlerts[index] = action.payload;
        }
      })
      .addCase(resolveAlert.rejected, (state, action) => {
        state.resolveStatus = 'failed';
        state.resolveError = action.error.message || 'Failed to resolve alert';
      })
      // Fetch statistics
      .addCase(fetchAlertStatistics.pending, (state) => {
        state.statisticsStatus = 'loading';
        state.statisticsError = undefined;
      })
      .addCase(fetchAlertStatistics.fulfilled, (state, action) => {
        state.statisticsStatus = 'succeeded';
        state.statistics = action.payload;
      })
      .addCase(fetchAlertStatistics.rejected, (state, action) => {
        state.statisticsStatus = 'failed';
        state.statisticsError = action.error.message || 'Failed to fetch statistics';
      });
  },
});

export const { clearActiveAlerts, clearAllAlerts, clearErrors, removeAlert } =
  weatherAlertsSlice.actions;

export default weatherAlertsSlice.reducer;

