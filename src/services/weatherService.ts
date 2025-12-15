import { api } from '../config/axios';
import { ENV } from '../config/env';
import { apiCache } from '../utils/apiCache';
import type { WeatherResponse, EquipmentSuggestionsResponse, WeatherForecastResponse } from '../types/weather';

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
};

