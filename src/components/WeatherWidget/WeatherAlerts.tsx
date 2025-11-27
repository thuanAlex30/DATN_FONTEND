import React, { useMemo } from 'react';
import { Alert, Card } from 'antd';
import type { WeatherForecastDay } from '../../services/weatherService';

interface WeatherAlertsProps {
  days: WeatherForecastDay[];
}

interface AlertConfig {
  key: string;
  type: 'warning' | 'error';
  message: string;
  description: string;
}

const formatDate = (value: string | number) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
  }).format(date);
};

const WeatherAlerts: React.FC<WeatherAlertsProps> = ({ days }) => {
  const alerts: AlertConfig[] = useMemo(() => {
    const results: AlertConfig[] = [];

    days.forEach((day) => {
      const dateLabel = day.date ? formatDate(day.date) : 'Ngày không xác định';
      const maxTemp = day.temperature_2m_max as number | undefined;
      const minTemp = day.temperature_2m_min as number | undefined;
      const precipitation = day.precipitation_sum as number | undefined;
      const wind = (day.wind_speed_10m_max ??
        day.wind_speed_10m_mean) as number | undefined;

      if (typeof maxTemp === 'number' && maxTemp >= 35) {
        results.push({
          key: `${day.date}-heat`,
          type: 'warning',
          message: `Cảnh báo nắng nóng (${dateLabel})`,
          description: `Nhiệt độ cao nhất dự kiến đạt ${Math.round(
            maxTemp,
          )}°C.`,
        });
      }

      if (typeof minTemp === 'number' && minTemp <= 10) {
        results.push({
          key: `${day.date}-cold`,
          type: 'warning',
          message: `Cảnh báo rét (${dateLabel})`,
          description: `Nhiệt độ thấp nhất dự kiến xuống ${Math.round(
            minTemp,
          )}°C.`,
        });
      }

      if (typeof precipitation === 'number' && precipitation >= 30) {
        results.push({
          key: `${day.date}-rain`,
          type: 'warning',
          message: `Cảnh báo mưa lớn (${dateLabel})`,
          description: `Lượng mưa dự kiến ${precipitation.toFixed(1)} mm. `,
        });
      }

      if (typeof wind === 'number' && wind >= 60) {
        results.push({
          key: `${day.date}-wind`,
          type: 'error',
          message: `Cảnh báo gió mạnh (${dateLabel})`,
          description: `Tốc độ gió tối đa dự kiến ${Math.round(
            wind,
          )} km/h.`,
        });
      }
    });

    return results;
  }, [days]);

  if (!alerts.length) {
    return (
      <Alert
        message="Không có cảnh báo thời tiết đáng lo ngại trong 7 ngày tới."
        type="success"
        showIcon
      />
    );
  }

  return (
    <Card
      title="Cảnh báo thời tiết"
      bordered={false}
      bodyStyle={{ display: 'flex', flexDirection: 'column', gap: 12 }}
    >
      {alerts.map((alert) => (
        <Alert
          key={alert.key}
          type={alert.type}
          message={alert.message}
          description={alert.description}
          showIcon
        />
      ))}
    </Card>
  );
};

export default WeatherAlerts;


