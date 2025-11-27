import React, { useMemo } from 'react';
import { Alert, Button, Card, Col, Row, Skeleton, Space, Typography } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { useWeather } from '../../../../hooks/useWeather';
import { useHourlyWeather } from '../../../../hooks/useHourlyWeather';
import WeatherForecastDetails from '../../../../components/WeatherWidget/WeatherForecastDetails';
import WeatherAlerts from '../../../../components/WeatherWidget/WeatherAlerts';
import HourlyForecastList from '../../../../components/WeatherWidget/HourlyForecastList';
import {
  DEFAULT_DAILY_PARAMS,
  type WeatherApiOptionParams,
} from '../../../../utils/weatherApiParams';

interface ProjectWeatherPanelProps {
  projectName: string;
  siteName?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  regionCode?: WeatherApiOptionParams['regionCode'];
}

const DAILY_FIELDS = Array.from(
  new Set([
    ...DEFAULT_DAILY_PARAMS,
    'precipitation_sum',
    'wind_speed_10m_max',
    'wind_speed_10m_mean',
  ]),
);

const ProjectWeatherPanel: React.FC<ProjectWeatherPanelProps> = ({
  projectName,
  siteName,
  latitude,
  longitude,
  timezone,
  regionCode = 'dn',
}) => {
  const baseOptions: WeatherApiOptionParams = useMemo(
    () => ({
      regionCode,
      latitude,
      longitude,
      timezone,
      daily: DAILY_FIELDS,
      forecast_days: 7,
    }),
    [regionCode, latitude, longitude, timezone],
  );

  const {
    forecast,
    location,
    loading: forecastLoading,
    error: forecastError,
    lastUpdated,
    refresh: refreshForecast,
  } = useWeather(baseOptions);

  const {
    hourly,
    loading: hourlyLoading,
    error: hourlyError,
    refresh: refreshHourly,
  } = useHourlyWeather({
    ...baseOptions,
    hours: 24,
    refreshIntervalMs: null,
  });

  const combinedError = forecastError || hourlyError;
  const hasForecast = forecast && forecast.days.length > 0;

  const handleRefresh = () => {
    refreshForecast();
    refreshHourly();
  };

  return (
    <Card
      title="Thời tiết công trường"
      style={{ borderRadius: 16 }}
      extra={
        <Space>
          {lastUpdated && (
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              Cập nhật: {new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit' }).format(lastUpdated)}
            </Typography.Text>
          )}
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={forecastLoading || hourlyLoading}
          >
            Làm mới
          </Button>
        </Space>
      }
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div>
          <Typography.Title level={5} style={{ marginBottom: 4 }}>
            {siteName || location?.region_name || 'Khu vực dự án'}
          </Typography.Title>
          <Typography.Text type="secondary">
            {projectName} • {location?.timezone || timezone || 'Múi giờ mặc định'}
          </Typography.Text>
        </div>

        {combinedError && (
          <Alert
            type="error"
            message="Không thể tải dữ liệu thời tiết"
            description={combinedError}
            showIcon
          />
        )}

        {(forecastLoading && !hasForecast) ? (
          <Skeleton active paragraph={{ rows: 4 }} />
        ) : hasForecast ? (
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <WeatherAlerts days={forecast.days} />
            </Col>
            <Col xs={24} lg={12}>
              <WeatherForecastDetails
                days={forecast.days}
                units={forecast.units ?? undefined}
                loading={forecastLoading}
              />
            </Col>
          </Row>
        ) : (
          <Alert
            type="info"
            message="Chưa có dữ liệu dự báo cho dự án này."
            showIcon
          />
        )}

        <HourlyForecastList
          hourly={hourly}
          loading={hourlyLoading}
          error={hourlyError}
        />
      </Space>
    </Card>
  );
};

export default ProjectWeatherPanel;


