import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { WeatherService } from '../../services/weatherService';
import type { WeatherResponse, EquipmentSuggestionsResponse, WeatherForecastResponse } from '../../types/weather';

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

interface WeatherState {
  data: WeatherResponse | null;
  suggestions: EquipmentSuggestionsResponse | null;
  forecast: WeatherForecastResponse | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  suggestionsStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  forecastStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  error?: string;
  suggestionsError?: string;
  forecastError?: string;
}

const initialState: WeatherState = {
  data: null,
  suggestions: null,
  forecast: null,
  status: 'idle',
  suggestionsStatus: 'idle',
  forecastStatus: 'idle',
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
      });
  },
});

export const { clearWeather, clearSuggestions } = weatherSlice.actions;
export default weatherSlice.reducer;

