import React, { useMemo } from 'react';
import { Card, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { WeatherForecastDay } from '../../services/weatherService';
import { getWeatherConditionLabel } from '../../constants/weatherCodes';

interface WeatherForecastDetailsProps {
  days: WeatherForecastDay[];
  units?: Record<string, string> | null;
  loading?: boolean;
  title?: string;
}

interface ForecastRow {
  key: string;
  dateLabel: string;
  condition: string;
  temperatureRange: string;
  precipitation: string;
  wind: string;
}

const formatNumber = (value: unknown, suffix = '') => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return `--${suffix}`;
  }
  return `${Math.round(value)}${suffix}`;
};

const formatPrecipitation = (value: unknown, suffix = 'mm') => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return `-- ${suffix}`;
  }
  return `${value.toFixed(1)} ${suffix}`;
};

const WeatherForecastDetails: React.FC<WeatherForecastDetailsProps> = ({
  days,
  units,
  loading = false,
  title = 'Dự báo 7 ngày tới',
}) => {
  const rows: ForecastRow[] = useMemo(() => {
    return days.map((day) => {
      const date = new Date(day.date);
      const dateLabel = Number.isNaN(date.getTime())
        ? day.date
        : new Intl.DateTimeFormat('vi-VN', {
            weekday: 'long',
            day: '2-digit',
            month: '2-digit',
          }).format(date);

      const max = day.temperature_2m_max as number | undefined;
      const min = day.temperature_2m_min as number | undefined;
      const precipitation = day.precipitation_sum as number | undefined;
      const wind = (day.wind_speed_10m_max ?? day.wind_speed_10m_mean) as
        | number
        | undefined;
      const windUnit =
        units?.wind_speed_10m_max ||
        units?.wind_speed_10m_mean ||
        'km/h';

      return {
        key: day.date ?? dateLabel,
        dateLabel,
        condition: getWeatherConditionLabel(
          (day.weather_code as number | null) ?? null,
        ),
        temperatureRange: `${formatNumber(max, '°C')} / ${formatNumber(
          min,
          '°C',
        )}`,
        precipitation: formatPrecipitation(
          precipitation,
          units?.precipitation_sum ?? 'mm',
        ),
        wind: `${formatNumber(wind, ` ${windUnit}`)}`,
      };
    });
  }, [days, units]);

  const columns: ColumnsType<ForecastRow> = [
    {
      title: 'Ngày',
      dataIndex: 'dateLabel',
      key: 'dateLabel',
      width: 160,
      render: (value) => (
        <Typography.Text strong style={{ textTransform: 'capitalize' }}>
          {value}
        </Typography.Text>
      ),
    },
    {
      title: 'Điều kiện',
      dataIndex: 'condition',
      key: 'condition',
      render: (value) => <Tag color="blue">{value}</Tag>,
    },
    {
      title: 'Nhiệt độ (cao/thấp)',
      dataIndex: 'temperatureRange',
      key: 'temperatureRange',
    },
    {
      title: 'Lượng mưa',
      dataIndex: 'precipitation',
      key: 'precipitation',
    },
    {
      title: 'Gió tối đa',
      dataIndex: 'wind',
      key: 'wind',
    },
  ];

  return (
    <Card
      title={title}
      bordered={false}
      bodyStyle={{ padding: '0 0 12px 0' }}
    >
      <Table<ForecastRow>
        columns={columns}
        dataSource={rows}
        pagination={false}
        loading={loading}
        size="small"
        locale={{
          emptyText: 'Chưa có dữ liệu dự báo',
        }}
      />
    </Card>
  );
};

export default WeatherForecastDetails;


