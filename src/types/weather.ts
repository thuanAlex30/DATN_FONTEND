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
  windspeed_max: number;
  precipitation_sum: number;
}

export interface WeatherForecastResponse {
  provider: 'open-meteo';
  fetchedAt: string;
  location: WeatherLocation;
  daily: DailyForecast[];
  stale?: boolean;
}

