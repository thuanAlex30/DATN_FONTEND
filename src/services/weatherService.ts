import api from './api';
import type { WeatherApiOptionParams } from '../utils/weatherApiParams';

export interface WeatherLocation {
  latitude: number;
  longitude: number;
  timezone: string;
  elevation?: number;
  region_code?: string;
  region_name?: string;
}

export interface WeatherData {
  time: string;
  interval: number;
  temperature: number;
  windspeed: number;
  winddirection: number;
  is_day: number;
  weathercode: number;
}

export interface WeatherForecastDay {
  date: string;
  [metric: string]: string | number | null;
}

export interface WeatherForecast {
  days: WeatherForecastDay[];
  units: Record<string, string> | null;
  requested_days: number | null;
  metrics: string[];
}

export interface WeatherHourlyEntry {
  time: string;
  [metric: string]: string | number | null;
}

export interface WeatherHourly {
  hours: WeatherHourlyEntry[];
  units: Record<string, string> | null;
  requested_hours: number | null;
  metrics: string[];
}

export interface WeatherApiResponse {
  success: boolean;
  message: string;
  data: {
    provider: string;
    location: WeatherLocation;
    current_weather: WeatherData;
    forecast?: WeatherForecast;
    hourly?: WeatherHourly;
  };
  timestamp: string;
}

export type WeatherRequestParams = WeatherApiOptionParams;

const weatherService = {
  async getCurrentWeather(params: WeatherRequestParams = {}) {
    const response = await api.get<WeatherApiResponse>('/weather/current', {
      params,
    });

    return response.data;
  },
  async getForecast(params: WeatherRequestParams = {}) {
    const response = await api.get<WeatherApiResponse>('/weather/forecast', {
      params,
    });

    return response.data;
  },
  async getHourlyForecast(params: WeatherRequestParams = {}) {
    const response = await api.get<WeatherApiResponse>('/weather/hourly', {
      params,
    });

    return response.data;
  },
};

export default weatherService;
