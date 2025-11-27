import React, { useEffect, useMemo, useState } from 'react';
import { Tooltip } from 'antd';
import { EnvironmentOutlined, ReloadOutlined } from '@ant-design/icons';
import { useWeather, type UseWeatherOptions } from '../../hooks/useWeather';
import { useBrowserLocation } from '../../hooks/useBrowserLocation';
import { getWeatherRegionByCode } from '../../constants/weatherRegions';
import {
  WEATHER_CODE_LABELS,
  getWeatherConditionLabel,
} from '../../constants/weatherCodes';
import type { WeatherData } from '../../services/weatherService';
import WeatherChartsModal from './WeatherChartsModal';
import styles from './WeatherWidget.module.css';

const TEMPERATURE_UNIT_SYMBOLS: Record<NonNullable<UseWeatherOptions['temperature_unit']>, string> = {
  celsius: '°C',
  fahrenheit: '°F',
};

const WIND_SPEED_UNIT_LABELS: Record<NonNullable<UseWeatherOptions['wind_speed_unit']>, string> = {
  kmh: 'km/h',
  ms: 'm/s',
  mph: 'mph',
  kn: 'kn',
};

type WeatherWidgetProps = UseWeatherOptions & {
  className?: string;
  showLocation?: boolean;
  showRefresh?: boolean;
  showForecastSummary?: boolean;
  forecastPreviewCount?: number;
  enableLocationSharing?: boolean;
  enableDetailsModal?: boolean;
};

const formatTime = (date: Date | null) => {
  if (!date) {
    return '';
  }

  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
  }).format(date);
};

const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  className,
  showLocation = true,
  showRefresh = true,
  showForecastSummary = true,
  forecastPreviewCount = 3,
  enableLocationSharing = true,
  enableDetailsModal = true,
  ...options
}) => {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [cachedWeather, setCachedWeather] = useState<WeatherData | null>(null);
  const {
    coords,
    loading: locating,
    error: locationError,
    permission,
    requestLocation,
    hasLocation,
  } = useBrowserLocation();

  const resolvedOptions = useMemo(() => {
    if (!coords) {
      return options;
    }

    return {
      ...options,
      latitude: coords.latitude,
      longitude: coords.longitude,
      timezone: coords.timezone ?? options.timezone,
    };
  }, [coords, options]);

  const { weather, location, forecast, loading, error, lastUpdated, refresh } = useWeather(resolvedOptions);
  useEffect(() => {
    if (weather) {
      setCachedWeather(weather);
    }
  }, [weather]);

  const region = getWeatherRegionByCode(options.regionCode);
  const temperatureUnit = options.temperature_unit ?? 'celsius';
  const windSpeedUnit = options.wind_speed_unit ?? 'kmh';
  const temperatureSuffix = TEMPERATURE_UNIT_SYMBOLS[temperatureUnit];
  const windSpeedSuffix = WIND_SPEED_UNIT_LABELS[windSpeedUnit];

  const conditionLabel = getWeatherConditionLabel(weather?.weathercode);
  const locationLabel =
    location?.timezone?.split('/')?.pop()?.replace('_', ' ') ?? region.name ?? 'Đà Nẵng';
  const tempLabel = weather ? `${weather.temperature.toFixed(1)}${temperatureSuffix}` : `--${temperatureSuffix}`;
  const windLabel = weather ? `${Math.round(weather.windspeed)} ${windSpeedSuffix}` : `-- ${windSpeedSuffix}`;
  const combinedError = error || locationError;
  const tooltip = combinedError
    ? `${combinedError}. Nhấp để thử lại.`
    : `Cập nhật: ${formatTime(lastUpdated) || 'Đang cập nhật'}`;

  const combinedClassName = [styles.widget, error ? styles.error : '', className].filter(Boolean).join(' ');

  const forecastDays = forecast?.days ?? [];
  const previewCount = Math.max(1, forecastPreviewCount);
  const previewDays = showForecastSummary ? forecastDays.slice(0, previewCount) : [];

  const locationButtonTitle = hasLocation
    ? 'Đang sử dụng vị trí hiện tại'
    : permission === 'denied'
      ? 'Bạn đã chặn quyền truy cập vị trí'
      : 'Sử dụng vị trí hiện tại để dự báo chính xác hơn';

  const locationStatusLabel = (() => {
    if (!enableLocationSharing) return null;
    if (hasLocation) return 'Đang dùng vị trí hiện tại của bạn';
    if (permission === 'denied') return 'Bạn đã từ chối chia sẻ vị trí';
    if (permission === 'unsupported') return 'Trình duyệt không hỗ trợ định vị';
    return 'Chia sẻ vị trí để nhận dự báo chính xác tại nơi bạn đang đứng';
  })();

  const handleRequestLocation = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    requestLocation();
  };

  const handleOpenDetails = () => {
    if (!enableDetailsModal) return;
    setDetailsOpen(true);
  };

  const chartOptions: UseWeatherOptions = useMemo(
    () => ({
      regionCode: resolvedOptions.regionCode,
      latitude: resolvedOptions.latitude,
      longitude: resolvedOptions.longitude,
      timezone: resolvedOptions.timezone,
      daily: resolvedOptions.daily,
      forecast_days: resolvedOptions.forecast_days,
      temperature_unit: resolvedOptions.temperature_unit,
      wind_speed_unit: resolvedOptions.wind_speed_unit,
    }),
    [
      resolvedOptions.regionCode,
      resolvedOptions.latitude,
      resolvedOptions.longitude,
      resolvedOptions.timezone,
      resolvedOptions.daily,
      resolvedOptions.forecast_days,
      resolvedOptions.temperature_unit,
      resolvedOptions.wind_speed_unit,
    ],
  );

  const getNumericMetric = (day: { [key: string]: string | number | null }, key: string): number | null => {
    const value = day[key];
    return typeof value === 'number' ? value : null;
  };

  const getForecastTempLabel = (day: { [key: string]: string | number | null }) => {
    const max = getNumericMetric(day, 'temperature_2m_max');
    const min = getNumericMetric(day, 'temperature_2m_min');

    if (max !== null && min !== null) {
      return `${Math.round(max)}/${Math.round(min)}${temperatureSuffix}`;
    }
    if (max !== null) {
      return `${Math.round(max)}${temperatureSuffix}`;
    }
    if (min !== null) {
      return `${Math.round(min)}${temperatureSuffix}`;
    }
    return `--${temperatureSuffix}`;
  };

  const getForecastCondition = (day: { [key: string]: string | number | null }) => {
    const code = getNumericMetric(day, 'weather_code');
    if (code === null) {
      return 'Đang cập nhật';
    }
    return getWeatherConditionLabel(code);
  };

  const formatForecastDate = (value?: string | number | null) => {
    if (!value) {
      return '--';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return new Intl.DateTimeFormat('vi-VN', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
    }).format(date);
  };

  const handleRefresh = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    refresh();
  };

  return (
    <>
      <Tooltip title={tooltip}>
        <div
          className={combinedClassName}
          role={enableDetailsModal ? 'button' : undefined}
          tabIndex={enableDetailsModal ? 0 : undefined}
          onClick={handleOpenDetails}
          onKeyDown={(event) => {
            if (!enableDetailsModal) return;
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              handleOpenDetails();
            }
          }}
        >
        <div className={styles.topRow}>
          <div className={styles.primary}>
            <span className={styles.temperature}>{tempLabel}</span>
            <div className={styles.details}>
              <span className={styles.condition}>{conditionLabel}</span>
              {showLocation && <span className={styles.location}>{locationLabel}</span>}
            </div>
          </div>
          <div className={styles.secondary}>
            <span className={styles.wind}>Gió {windLabel}</span>
            {showRefresh && (
              <button
                type="button"
                className={styles.refreshButton}
                onClick={handleRefresh}
                aria-label="Làm mới dữ liệu thời tiết"
                disabled={loading}
              >
                <ReloadOutlined spin={loading} />
              </button>
            )}
            {enableLocationSharing && (
              <button
                type="button"
                className={[
                  styles.locationButton,
                  hasLocation ? styles.locationButtonActive : '',
                ].join(' ')}
                onClick={handleRequestLocation}
                aria-label="Sử dụng vị trí hiện tại"
                disabled={locating || permission === 'denied'}
              >
                <EnvironmentOutlined spin={locating} />
              </button>
            )}
          </div>
        </div>
        {enableLocationSharing && locationStatusLabel && (
          <div className={styles.locationStatus}>
            {locationStatusLabel}
            {permission === 'denied' && ' (hãy bật lại quyền vị trí trong trình duyệt)'}
          </div>
        )}
        {previewDays.length > 0 && (
          <div className={styles.forecastStrip}>
            {previewDays.map((day, index) => (
              <div className={styles.forecastItem} key={day.date ?? index}>
                <span className={styles.forecastDay}>{formatForecastDate(day.date)}</span>
                <span className={styles.forecastCondition}>{getForecastCondition(day)}</span>
                <span className={styles.forecastTemp}>{getForecastTempLabel(day)}</span>
              </div>
            ))}
          </div>
        )}
        </div>
      </Tooltip>
      {enableDetailsModal && (
        <WeatherChartsModal
          open={detailsOpen}
          onClose={() => setDetailsOpen(false)}
          forecast={forecast ?? null}
          location={location ?? null}
          currentWeather={cachedWeather}
          options={chartOptions}
        />
      )}
    </>
  );
};

export default WeatherWidget;

