import { useCallback, useEffect, useMemo, useState } from 'react';
import weatherService, {
  type WeatherHourly,
  type WeatherLocation,
} from '../services/weatherService';
import {
  getWeatherRegionByCode,
} from '../constants/weatherRegions';
import {
  type WeatherApiOptionParams,
} from '../utils/weatherApiParams';

export interface UseHourlyWeatherOptions extends WeatherApiOptionParams {
  hours?: number;
  refreshIntervalMs?: number | null;
  enabled?: boolean;
}

export interface UseHourlyWeatherResult {
  location: WeatherLocation | null;
  hourly: WeatherHourly | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
}

export const useHourlyWeather = (
  options: UseHourlyWeatherOptions = {},
): UseHourlyWeatherResult => {
  const {
    regionCode,
    latitude,
    longitude,
    timezone,
    hourly,
    hours,
    past_days,
    temperature_unit,
    wind_speed_unit,
    refreshIntervalMs = 30 * 60 * 1000,
    enabled = true,
  } = options;

  const region = getWeatherRegionByCode(regionCode);

  const requestParams: WeatherApiOptionParams = useMemo(
    () => ({
      regionCode: region.code,
      latitude,
      longitude,
      timezone,
      hourly,
      hours,
      past_days,
      temperature_unit,
      wind_speed_unit,
    }),
    [
      region.code,
      latitude,
      longitude,
      timezone,
      hourly,
      hours,
      past_days,
      temperature_unit,
      wind_speed_unit,
    ],
  );

  const [hourlyData, setHourlyData] = useState<WeatherHourly | null>(null);
  const [location, setLocation] = useState<WeatherLocation | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchHourly = useCallback(async () => {
    if (!enabled) {
      return;
    }
    setLoading(true);
    try {
      const response = await weatherService.getHourlyForecast(requestParams);
      setHourlyData(response.data.hourly ?? null);
      setLocation(response.data.location);
      setLastUpdated(new Date(response.timestamp));
      setError(null);
    } catch (err) {
      console.error('Failed to fetch hourly weather', err);
      setError('Không thể tải dữ liệu thời tiết theo giờ');
    } finally {
      setLoading(false);
    }
  }, [enabled, requestParams]);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    fetchHourly();
  }, [enabled, fetchHourly]);

  useEffect(() => {
    if (!refreshIntervalMs || !enabled) {
      return;
    }

    const id = window.setInterval(() => {
      fetchHourly();
    }, refreshIntervalMs);

    return () => window.clearInterval(id);
  }, [fetchHourly, refreshIntervalMs, enabled]);

  return {
    location,
    hourly: hourlyData,
    loading,
    error,
    lastUpdated,
    refresh: fetchHourly,
  };
};

export default useHourlyWeather;


