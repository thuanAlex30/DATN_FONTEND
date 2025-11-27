import { useCallback, useEffect, useMemo, useState } from 'react';
import weatherService, {
  type WeatherData,
  type WeatherLocation,
  type WeatherForecast,
} from '../services/weatherService';
import {
  getWeatherRegionByCode,
} from '../constants/weatherRegions';
import {
  type WeatherApiOptionParams,
} from '../utils/weatherApiParams';

export interface UseWeatherOptions extends WeatherApiOptionParams {
  refreshIntervalMs?: number;
}

export interface UseWeatherResult {
  weather: WeatherData | null;
  location: WeatherLocation | null;
  forecast: WeatherForecast | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
}

export const useWeather = (options: UseWeatherOptions = {}): UseWeatherResult => {
  const {
    regionCode,
    latitude,
    longitude,
    timezone,
    daily,
    forecast_days,
    temperature_unit,
    wind_speed_unit,
    refreshIntervalMs = 5 * 60 * 1000,
  } = options;

  const region = getWeatherRegionByCode(regionCode);

  const weatherParams: WeatherApiOptionParams = useMemo(
    () => ({
      regionCode: region.code,
      latitude,
      longitude,
      timezone,
      daily,
      forecast_days,
      temperature_unit,
      wind_speed_unit,
    }),
    [
      region.code,
      latitude,
      longitude,
      timezone,
      daily,
      forecast_days,
      temperature_unit,
      wind_speed_unit,
    ],
  );

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [location, setLocation] = useState<WeatherLocation | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [forecast, setForecast] = useState<WeatherForecast | null>(null);

  const fetchWeather = useCallback(async () => {
    setLoading(true);

    try {
      const response = await weatherService.getForecast(weatherParams);

      setWeather(response.data.current_weather);
      setLocation(response.data.location);
      setForecast(response.data.forecast ?? null);

      const timestamp = response.timestamp || response.data.current_weather.time;
      setLastUpdated(timestamp ? new Date(timestamp) : new Date());
      setError(null);
    } catch (err) {
      console.error('Failed to fetch weather data', err);
      setError('Không thể tải dữ liệu thời tiết');
    } finally {
      setLoading(false);
    }
  }, [weatherParams]);

  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  useEffect(() => {
    if (!refreshIntervalMs) {
      return;
    }

    const intervalId = window.setInterval(() => {
      fetchWeather();
    }, refreshIntervalMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [fetchWeather, refreshIntervalMs]);

  const memoizedResult = useMemo<UseWeatherResult>(
    () => ({
      weather,
      location,
      loading,
      error,
      forecast,
      lastUpdated,
      refresh: fetchWeather,
    }),
    [weather, location, forecast, loading, error, lastUpdated, fetchWeather],
  );

  return memoizedResult;
};

export default useWeather;

