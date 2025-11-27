import React, { useMemo } from 'react';
import { Alert, Card, List, Tag, Typography } from 'antd';
import type { WeatherHourly } from '../../services/weatherService';
import { getWeatherConditionLabel } from '../../constants/weatherCodes';

interface HourlyForecastListProps {
  hourly: WeatherHourly | null;
  loading?: boolean;
  error?: string | null;
  title?: string;
  maxItems?: number;
}

const HourlyForecastList: React.FC<HourlyForecastListProps> = ({
  hourly,
  loading = false,
  error = null,
  title = 'Dự báo theo giờ',
  maxItems = 12,
}) => {
  const entries = useMemo(() => {
    if (!hourly?.hours?.length) {
      return [];
    }

    return hourly.hours.slice(0, maxItems).map((entry) => {
      const date = new Date(entry.time);
      const timeLabel = Number.isNaN(date.getTime())
        ? entry.time
        : new Intl.DateTimeFormat('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
          }).format(date);

      const temperature = entry.temperature_2m as number | undefined;
      const feelsLike = entry.apparent_temperature as number | undefined;
      const precipitation = entry.precipitation as number | undefined;
      const wind = entry.wind_speed_10m as number | undefined;
      const weatherCode = entry.weather_code as number | undefined;

      return {
        key: `${entry.time}`,
        timeLabel,
        temperature:
          typeof temperature === 'number'
            ? `${Math.round(temperature)}°C`
            : '--°C',
        apparent:
          typeof feelsLike === 'number'
            ? `${Math.round(feelsLike)}°C`
            : null,
        precipitation:
          typeof precipitation === 'number'
            ? `${precipitation.toFixed(1)} mm`
            : '-- mm',
        wind:
          typeof wind === 'number'
            ? `${Math.round(wind)} ${hourly.units?.wind_speed_10m ?? 'km/h'}`
            : `-- ${hourly.units?.wind_speed_10m ?? 'km/h'}`,
        condition: getWeatherConditionLabel(weatherCode ?? null),
      };
    });
  }, [hourly, maxItems]);

  return (
    <Card
      title={title}
      bordered={false}
      bodyStyle={{ padding: 0 }}
      extra={
        hourly?.requested_hours
          ? `${hourly.requested_hours} giờ sắp tới`
          : undefined
      }
    >
      {error && (
        <Alert
          type="error"
          message="Không thể tải dữ liệu theo giờ"
          description={error}
          showIcon
          style={{ margin: '0 16px 16px' }}
        />
      )}
      <List
        loading={loading}
        dataSource={entries}
        locale={{ emptyText: 'Chưa có dữ liệu theo giờ' }}
        renderItem={(item) => (
          <List.Item
            style={{
              display: 'grid',
              gridTemplateColumns: '120px 1fr 1fr',
              gap: '12px',
              padding: '12px 16px',
            }}
          >
            <div>
              <Typography.Text strong>{item.timeLabel}</Typography.Text>
              <div>{item.condition}</div>
            </div>
            <div>
              <div>Nhiệt độ: {item.temperature}</div>
              {item.apparent && (
                <Typography.Text type="secondary">
                  Cảm giác: {item.apparent}
                </Typography.Text>
              )}
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
            >
              <Tag color="blue">Mưa: {item.precipitation}</Tag>
              <Tag color="geekblue">Gió: {item.wind}</Tag>
            </div>
          </List.Item>
        )}
      />
    </Card>
  );
};

export default HourlyForecastList;


