import { api } from '../config/axios';
import { ENV } from '../config/env';
import { apiCache } from '../utils/apiCache';
import type { 
  WeatherResponse, 
  EquipmentSuggestionsResponse, 
  WeatherForecastResponse,
  HourlyForecastResponse,
  AirQualityResponse
} from '../types/weather';

const CACHE_TTL_MS = (ENV.WEATHER_REFRESH_SECONDS || 600) * 1000;

export const WeatherService = {
  getCurrent: async (params?: { latitude?: number; longitude?: number; timezone?: string }) => {
    const cacheKey = apiCache.generateKey('/integrations/weather/current', params);
    const cached = apiCache.get(cacheKey);
    if (cached) return cached as WeatherResponse;

    const res = await api.get<{ success: boolean; data: WeatherResponse; message: string }>(
      '/integrations/weather/current',
      { params }
    );
    apiCache.set(cacheKey, res.data.data, CACHE_TTL_MS);
    return res.data.data;
  },

  getEquipmentSuggestions: async (params?: { latitude?: number; longitude?: number; timezone?: string }) => {
    const cacheKey = apiCache.generateKey('/integrations/weather/equipment-suggestions', params);
    const cached = apiCache.get(cacheKey);
    if (cached) return cached as EquipmentSuggestionsResponse;

    const res = await api.get<{ success: boolean; data: EquipmentSuggestionsResponse; message: string }>(
      '/integrations/weather/equipment-suggestions',
      { params }
    );
    apiCache.set(cacheKey, res.data.data, CACHE_TTL_MS);
    return res.data.data;
  },

  getForecast: async (params?: { latitude?: number; longitude?: number; timezone?: string }) => {
    const cacheKey = apiCache.generateKey('/integrations/weather/forecast', params);
    const cached = apiCache.get(cacheKey);
    if (cached) return cached as WeatherForecastResponse;

    const res = await api.get<{ success: boolean; data: WeatherForecastResponse; message: string }>(
      '/integrations/weather/forecast',
      { params }
    );
    apiCache.set(cacheKey, res.data.data, CACHE_TTL_MS * 6); // Cache forecast longer (1 hour)
    return res.data.data;
  },

  getHourly: async (params?: { latitude?: number; longitude?: number; timezone?: string; hours?: number }) => {
    const cacheKey = apiCache.generateKey('/integrations/weather/hourly', params);
    const cached = apiCache.get(cacheKey);
    if (cached) return cached as HourlyForecastResponse;

    const res = await api.get<{ success: boolean; data: HourlyForecastResponse; message: string }>(
      '/integrations/weather/hourly',
      { params }
    );
    apiCache.set(cacheKey, res.data.data, CACHE_TTL_MS * 3); // Cache hourly 30 minutes
    return res.data.data;
  },

  getAirQuality: async (params?: { latitude?: number; longitude?: number; timezone?: string }) => {
    const cacheKey = apiCache.generateKey('/integrations/weather/air-quality', params);
    const cached = apiCache.get(cacheKey);
    if (cached) return cached as AirQualityResponse;

    const res = await api.get<{ success: boolean; data: AirQualityResponse; message: string }>(
      '/integrations/weather/air-quality',
      { params }
    );
    apiCache.set(cacheKey, res.data.data, CACHE_TTL_MS * 3); // Cache air quality 30 minutes
    return res.data.data;
  },
};

