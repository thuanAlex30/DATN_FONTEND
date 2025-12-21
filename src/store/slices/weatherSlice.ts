import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { WeatherService } from '../../services/weatherService';
import type { 
  WeatherResponse, 
  EquipmentSuggestionsResponse, 
  WeatherForecastResponse,
  HourlyForecastResponse,
  AirQualityResponse
} from '../../types/weather';

export const fetchWeather = createAsyncThunk(
  'weather/fetchCurrent',
  async (params?: { latitude?: number; longitude?: number; timezone?: string }) => 
    WeatherService.getCurrent(params)
);

export const fetchEquipmentSuggestions = createAsyncThunk(
  'weather/fetchEquipmentSuggestions',
  async (params?: { latitude?: number; longitude?: number; timezone?: string }) =>
    WeatherService.getEquipmentSuggestions(params)
);

export const fetchForecast = createAsyncThunk(
  'weather/fetchForecast',
  async (params?: { latitude?: number; longitude?: number; timezone?: string }) =>
    WeatherService.getForecast(params)
);

export const fetchHourly = createAsyncThunk(
  'weather/fetchHourly',
  async (params?: { latitude?: number; longitude?: number; timezone?: string; hours?: number }) =>
    WeatherService.getHourly(params)
);

export const fetchAirQuality = createAsyncThunk(
  'weather/fetchAirQuality',
  async (params?: { latitude?: number; longitude?: number; timezone?: string }) =>
    WeatherService.getAirQuality(params)
);

interface WeatherState {
  data: WeatherResponse | null;
  suggestions: EquipmentSuggestionsResponse | null;
  forecast: WeatherForecastResponse | null;
  hourly: HourlyForecastResponse | null;
  airQuality: AirQualityResponse | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  suggestionsStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  forecastStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  hourlyStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  airQualityStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  error?: string;
  suggestionsError?: string;
  forecastError?: string;
  hourlyError?: string;
  airQualityError?: string;
}

const initialState: WeatherState = {
  data: null,
  suggestions: null,
  forecast: null,
  hourly: null,
  airQuality: null,
  status: 'idle',
  suggestionsStatus: 'idle',
  forecastStatus: 'idle',
  hourlyStatus: 'idle',
  airQualityStatus: 'idle',
};

const weatherSlice = createSlice({
  name: 'weather',
  initialState,
  reducers: {
    clearWeather: (state) => {
      state.data = null;
      state.status = 'idle';
      state.error = undefined;
    },
    clearSuggestions: (state) => {
      state.suggestions = null;
      state.suggestionsStatus = 'idle';
      state.suggestionsError = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      // Weather data
      .addCase(fetchWeather.pending, (state) => {
        state.status = 'loading';
        state.error = undefined;
      })
      .addCase(fetchWeather.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchWeather.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch weather';
      })
      // Equipment suggestions
      .addCase(fetchEquipmentSuggestions.pending, (state) => {
        state.suggestionsStatus = 'loading';
        state.suggestionsError = undefined;
      })
      .addCase(fetchEquipmentSuggestions.fulfilled, (state, action) => {
        state.suggestionsStatus = 'succeeded';
        state.suggestions = action.payload;
      })
      .addCase(fetchEquipmentSuggestions.rejected, (state, action) => {
        state.suggestionsStatus = 'failed';
        state.suggestionsError = action.error.message || 'Failed to fetch equipment suggestions';
      })
      // Forecast
      .addCase(fetchForecast.pending, (state) => {
        state.forecastStatus = 'loading';
        state.forecastError = undefined;
      })
      .addCase(fetchForecast.fulfilled, (state, action) => {
        state.forecastStatus = 'succeeded';
        state.forecast = action.payload;
      })
      .addCase(fetchForecast.rejected, (state, action) => {
        state.forecastStatus = 'failed';
        state.forecastError = action.error.message || 'Failed to fetch forecast';
      })
      // Hourly forecast
      .addCase(fetchHourly.pending, (state) => {
        state.hourlyStatus = 'loading';
        state.hourlyError = undefined;
      })
      .addCase(fetchHourly.fulfilled, (state, action) => {
        state.hourlyStatus = 'succeeded';
        state.hourly = action.payload;
      })
      .addCase(fetchHourly.rejected, (state, action) => {
        state.hourlyStatus = 'failed';
        state.hourlyError = action.error.message || 'Failed to fetch hourly forecast';
      })
      // Air quality
      .addCase(fetchAirQuality.pending, (state) => {
        state.airQualityStatus = 'loading';
        state.airQualityError = undefined;
      })
      .addCase(fetchAirQuality.fulfilled, (state, action) => {
        state.airQualityStatus = 'succeeded';
        state.airQuality = action.payload;
      })
      .addCase(fetchAirQuality.rejected, (state, action) => {
        state.airQualityStatus = 'failed';
        state.airQualityError = action.error.message || 'Failed to fetch air quality';
      });
  },
});

export const { clearWeather, clearSuggestions } = weatherSlice.actions;
export default weatherSlice.reducer;

