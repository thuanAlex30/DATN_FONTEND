import React, { useMemo } from 'react';
import {
  Alert,
  Card,
  Col,
  Modal,
  Row,
  Space,
  Statistic,
  Tabs,
  Typography,
} from 'antd';
import type {
  WeatherForecast,
  WeatherData,
  WeatherLocation,
} from '../../services/weatherService';
import type { UseWeatherOptions } from '../../hooks/useWeather';
import { useHourlyWeather } from '../../hooks/useHourlyWeather';
import SimpleLineChart, {
  type LineSeries,
} from './SimpleLineChart';
import HourlyForecastList from './HourlyForecastList';
import WeatherForecastDetails from './WeatherForecastDetails';
import WeatherAlerts from './WeatherAlerts';
import { getWeatherConditionLabel } from '../../constants/weatherCodes';
import styles from './WeatherChartsModal.module.css';

interface WeatherChartsModalProps {
  open: boolean;
  onClose: () => void;
  forecast: WeatherForecast | null;
  location: WeatherLocation | null;
  currentWeather: WeatherData | null;
  options: UseWeatherOptions;
}

const formatDailyLabel = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const weekday = new Intl.DateTimeFormat('vi-VN', {
    weekday: 'short',
  }).format(date);
  const dayMonth = new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
  }).format(date);

  return `${weekday}\n${dayMonth}`;
};

const formatHourlyLabel = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const time = new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
  const dayMonth = new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
  }).format(date);

  return `${time}\n${dayMonth}`;
};

const WeatherChartsModal: React.FC<WeatherChartsModalProps> = ({
  open,
  onClose,
  forecast,
  location,
  currentWeather,
  options,
}) => {
  const hourlyOptions = useMemo(
    () => ({
      ...options,
      hours: options.hours ?? 24,
      refreshIntervalMs: null,
      enabled: open,
    }),
    [options, open],
  );

  const {
    hourly,
    loading: hourlyLoading,
    error: hourlyError,
    refresh: refreshHourly,
  } = useHourlyWeather(hourlyOptions);

  const dailySeries: LineSeries[] = useMemo(() => {
    if (!forecast?.days?.length) {
      return [];
    }

    const labels = forecast.days.map((day) =>
      formatDailyLabel(day.date),
    );

    const highs: LineSeries = {
      name: 'Nhiệt độ cao nhất',
      color: '#ff4d4f',
      points: forecast.days.map((day, idx) => ({
        label: labels[idx],
        value:
          typeof day.temperature_2m_max === 'number'
            ? day.temperature_2m_max
            : null,
      })),
    };

    const lows: LineSeries = {
      name: 'Nhiệt độ thấp nhất',
      color: '#1890ff',
      points: forecast.days.map((day, idx) => ({
        label: labels[idx],
        value:
          typeof day.temperature_2m_min === 'number'
            ? day.temperature_2m_min
            : null,
      })),
    };

    return [highs, lows];
  }, [forecast]);

  const dailyPrecipSeries: LineSeries[] = useMemo(() => {
    if (!forecast?.days?.length) {
      return [];
    }

    const labels = forecast.days.map((day) => formatDailyLabel(day.date));
    return [
      {
        name: 'Lượng mưa mỗi ngày',
        color: '#52c41a',
        points: forecast.days.map((day, idx) => ({
          label: labels[idx],
          value:
            typeof day.precipitation_sum === 'number'
              ? day.precipitation_sum
              : null,
        })),
      },
    ];
  }, [forecast]);

  const hourlySeries: LineSeries[] = useMemo(() => {
    if (!hourly?.hours?.length) {
      return [];
    }

    const labels = hourly.hours.map((entry) =>
      formatHourlyLabel(entry.time),
    );

    return [
      {
        name: 'Nhiệt độ theo giờ',
        color: '#faad14',
        points: hourly.hours.map((entry, idx) => ({
          label: labels[idx],
          value:
            typeof entry.temperature_2m === 'number'
              ? entry.temperature_2m
              : null,
        })),
      },
    ];
  }, [hourly]);

  const hourlyPrecipSeries: LineSeries[] = useMemo(() => {
    if (!hourly?.hours?.length) {
      return [];
    }

    const labels = hourly.hours.map((entry) =>
      formatHourlyLabel(entry.time),
    );
    return [
      {
        name: 'Lượng mưa theo giờ',
        color: '#13c2c2',
        points: hourly.hours.map((entry, idx) => ({
          label: labels[idx],
          value:
            typeof entry.precipitation === 'number'
              ? entry.precipitation
              : null,
        })),
      },
    ];
  }, [hourly]);

  const overviewMetrics = useMemo(() => {
    const today = forecast?.days?.[0];
    const tomorrow = forecast?.days?.[1];
    const avgHigh =
      forecast?.days && forecast.days.length
        ? forecast.days
            .map((day) => day.temperature_2m_max)
            .filter((v): v is number => typeof v === 'number')
            .reduce((sum, v, _, arr) => sum + v / arr.length, 0)
        : null;

    return [
      {
        title: 'Thời tiết hiện tại',
        value: currentWeather
          ? `${currentWeather.temperature.toFixed(1)}°C`
          : '--°C',
        description: currentWeather
          ? getWeatherConditionLabel(currentWeather.weathercode)
          : 'Chưa có dữ liệu',
      },
      {
        title: 'Hôm nay',
        value:
          today && typeof today.temperature_2m_max === 'number'
            ? `${Math.round(today.temperature_2m_max)}°C / ${Math.round(
                today.temperature_2m_min as number,
              )}°C`
            : '--°C',
        description:
          today && typeof today.precipitation_sum === 'number'
            ? `Mưa ${today.precipitation_sum.toFixed(1)} mm`
            : 'Mưa -- mm',
      },
      {
        title: 'Ngày mai',
        value:
          tomorrow && typeof tomorrow.temperature_2m_max === 'number'
            ? `${Math.round(tomorrow.temperature_2m_max)}°C / ${Math.round(
                tomorrow.temperature_2m_min as number,
              )}°C`
            : '--°C',
        description:
          tomorrow && typeof tomorrow.wind_speed_10m_max === 'number'
            ? `Gió ${Math.round(tomorrow.wind_speed_10m_max)} km/h`
            : 'Gió -- km/h',
      },
      {
        title: 'Trung bình 7 ngày tới',
        value: avgHigh !== null ? `${Math.round(avgHigh)}°C` : '--°C',
        description: 'Nhiệt độ cao nhất trung bình',
      },
    ];
  }, [currentWeather, forecast]);

  const tabItems = [
    {
      key: 'daily',
      label: 'Theo ngày',
      children: forecast?.days?.length ? (
        <div className={styles.tabBody}>
          <Row gutter={[16, 16]}>
            {overviewMetrics.map((metric) => (
              <Col xs={24} sm={12} md={12} lg={6} key={metric.title}>
                <Card size="small">
                  <Statistic
                    title={metric.title}
                    value={metric.value}
                    description={metric.description}
                  />
                </Card>
              </Col>
            ))}
          </Row>
          <WeatherAlerts days={forecast.days} />
          {dailySeries.length > 0 && (
            <SimpleLineChart series={dailySeries} />
          )}
          {dailyPrecipSeries.length > 0 && (
            <SimpleLineChart series={dailyPrecipSeries} showAxis />
          )}
          <WeatherForecastDetails
            days={forecast.days}
            units={forecast.units ?? undefined}
          />
          <Typography.Text type="secondary">
            Dữ liệu dự báo {forecast.days.length} ngày tới.
          </Typography.Text>
        </div>
      ) : (
        <Alert type="info" message="Chưa có dữ liệu dự báo theo ngày." />
      ),
    },
    {
      key: 'hourly',
      label: 'Theo giờ',
      children: (
        <div className={styles.tabBody}>
          {hourlyError && (
            <Alert
              type="error"
              message="Không thể tải dữ liệu theo giờ"
              description={hourlyError}
              showIcon
            />
          )}
          {hourly?.hours?.length ? (
            <>
              {hourlySeries.length > 0 && (
                <SimpleLineChart series={hourlySeries} />
              )}
              {hourlyPrecipSeries.length > 0 && (
                <SimpleLineChart series={hourlyPrecipSeries} />
              )}
              <HourlyForecastList
                hourly={hourly}
                loading={hourlyLoading}
                maxItems={12}
              />
            </>
          ) : (
            <Alert
              type="info"
              message="Chưa có dữ liệu theo giờ"
              showIcon
              action={
                <Typography.Link onClick={refreshHourly}>
                  Thử lại
                </Typography.Link>
              }
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <Modal
      title="Biểu đồ thời tiết"
      open={open}
      onCancel={onClose}
      footer={null}
      width={1080}
      styles={{ body: { padding: 0 } }}
      className={styles.modal}
    >
      <div className={styles.modalContent}>
        <Typography.Title level={5} style={{ marginBottom: 0 }}>
          {location?.region_name || 'Khu vực theo dõi'}
        </Typography.Title>
        <Typography.Text type="secondary">
          Vĩ độ: {location?.latitude?.toFixed(3) ?? '--'} • Kinh độ:{' '}
          {location?.longitude?.toFixed(3) ?? '--'}
        </Typography.Text>

        <Tabs defaultActiveKey="daily" items={tabItems} />
      </div>
    </Modal>
  );
};

export default WeatherChartsModal;


