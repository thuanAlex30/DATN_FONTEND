import {
  type WeatherRegionCode,
  getWeatherRegionByCode,
} from '../constants/weatherRegions';

export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type WindSpeedUnit = 'kmh' | 'ms' | 'mph' | 'kn';

export interface WeatherApiOptionParams {
  regionCode?: WeatherRegionCode;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  daily?: string[];
  hourly?: string[];
  forecast_days?: number;
  past_days?: number;
  hours?: number;
  temperature_unit?: TemperatureUnit;
  wind_speed_unit?: WindSpeedUnit;
}

export interface WeatherApiQuery {
  latitude: number;
  longitude: number;
  timezone: string;
  daily: string;
  hourly?: string;
  forecast_days: number;
  past_days?: number;
  temperature_unit: TemperatureUnit;
  wind_speed_unit: WindSpeedUnit;
  hours?: number;
}

export const DEFAULT_DAILY_PARAMS = [
  'weather_code',
  'temperature_2m_max',
  'temperature_2m_min',
  'precipitation_sum',
  'wind_speed_10m_max',
];

const clampForecastDays = (value?: number) => {
  if (!value) {
    return 7;
  }

  return Math.min(Math.max(value, 1), 16);
};

export const buildWeatherApiQuery = (
  options: WeatherApiOptionParams = {},
): WeatherApiQuery => {
  const region = getWeatherRegionByCode(options.regionCode);
  const latitude = options.latitude ?? region.latitude;
  const longitude = options.longitude ?? region.longitude;
  const timezone = options.timezone ?? region.timezone;
  const daily = (options.daily ?? DEFAULT_DAILY_PARAMS).join(',');
  const hourly = options.hourly?.length ? options.hourly.join(',') : undefined;

  return {
    latitude,
    longitude,
    timezone,
    daily,
    hourly,
    forecast_days: clampForecastDays(options.forecast_days),
    past_days: options.past_days,
    temperature_unit: options.temperature_unit ?? 'celsius',
    wind_speed_unit: options.wind_speed_unit ?? 'kmh',
    hours: options.hours,
  };
};

