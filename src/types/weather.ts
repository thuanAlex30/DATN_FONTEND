export interface WeatherLocation {
  latitude: number;
  longitude: number;
  elevation: number;
  timezone: string;
  utcOffsetSeconds: number;
}

export interface CurrentWeather {
  time: string;
  temperature: number;
  windspeed: number;
  winddirection: number;
  is_day: number;
  weathercode: number;
  precipitation?: number; // Lượng mưa (mm)
  uv_index?: number | null; // Chỉ số UV
  visibility?: number | null; // Tầm nhìn (km)
  relativehumidity_2m?: number | null; // Độ ẩm (%)
  apparent_temperature?: number | null; // Nhiệt độ cảm nhận (°C)
  windgusts_10m?: number | null; // Gió giật (km/h)
  uv_index_max?: number | null; // Chỉ số UV cao nhất trong ngày
  sunrise?: string | null; // Giờ mặt trời mọc
  sunset?: string | null; // Giờ mặt trời lặn
}

export interface WeatherResponse {
  provider: 'open-meteo';
  fetchedAt: string;
  location: WeatherLocation;
  current: CurrentWeather;
}

export interface EquipmentSuggestion {
  id: string;
  item_code: string;
  item_name: string;
  category: string;
  reason: string;
  priority: number;
  quantity_available: number;
}

export interface EquipmentSuggestionsResponse {
  weather: WeatherResponse;
  suggestions: EquipmentSuggestion[];
  message: string;
  conditions: string[];
  weatherSummary: {
    temperature: string;
    windSpeed: string;
    weatherCode: number;
  };
}

export interface DailyForecast {
  date: string;
  weathercode: number;
  temperature_max: number;
  temperature_min: number;
  apparent_temperature_max?: number | null;
  apparent_temperature_min?: number | null;
  windspeed_max: number;
  windgusts_max?: number | null;
  winddirection_dominant?: number | null;
  precipitation_sum: number;
  precipitation_hours?: number;
  precipitation_probability_max?: number | null;
  uv_index_max?: number | null;
  sunrise?: string | null;
  sunset?: string | null;
}

export interface WeatherForecastResponse {
  provider: 'open-meteo';
  fetchedAt: string;
  location: WeatherLocation;
  daily: DailyForecast[];
  stale?: boolean;
}

export interface HourlyWeather {
  time: string;
  temperature_2m: number | null;
  relativehumidity_2m: number | null;
  apparent_temperature: number | null;
  precipitation: number;
  weathercode: number;
  cloudcover: number | null;
  pressure_msl: number | null;
  windspeed_10m: number;
  winddirection_10m: number;
  windgusts_10m: number | null;
  uv_index: number | null;
  visibility: number | null;
  is_day: number;
}

export interface HourlyForecastResponse {
  provider: 'open-meteo';
  fetchedAt: string;
  location: WeatherLocation;
  hourly: HourlyWeather[];
  stale?: boolean;
}

export interface AirQualityCurrent {
  pm2_5: number | null;
  pm10: number | null;
  carbon_monoxide: number | null;
  nitrogen_dioxide: number | null;
  sulphur_dioxide: number | null;
  ozone: number | null;
  european_aqi: number | null;
  us_aqi: number | null;
}

export interface AirQualityHourly {
  time: string[];
  pm2_5: number[];
  pm10: number[];
  european_aqi: number[];
  us_aqi: number[];
}

export interface AirQualityResponse {
  provider: 'open-meteo-air-quality';
  fetchedAt: string;
  location: {
    latitude: number;
    longitude: number;
    timezone: string;
  };
  current: AirQualityCurrent;
  hourly: AirQualityHourly | null;
  stale?: boolean;
  error?: string;
}

