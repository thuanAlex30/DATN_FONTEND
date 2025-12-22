import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Typography, Spin, Alert, Tabs } from 'antd';
import {
  Line,
  Bar,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { fetchHourly } from '../../store/slices/weatherSlice';
import type { RootState } from '../../store';
import styles from './HourlyForecastChart.module.css';

const { Text, Title } = Typography;

interface HourlyForecastChartProps {
  latitude?: number;
  longitude?: number;
  hours?: number; // Default 24 hours
}

const HourlyForecastChart: React.FC<HourlyForecastChartProps> = ({
  latitude,
  longitude,
  hours = 24,
}) => {
  const dispatch = useDispatch();
  const { hourly, hourlyStatus, hourlyError } = useSelector(
    (state: RootState) => state.weather
  );

  useEffect(() => {
    if (latitude != null && longitude != null) {
      dispatch(fetchHourly({ latitude, longitude, hours }) as any);
    } else {
      dispatch(fetchHourly({ hours }) as any);
    }
  }, [dispatch, latitude, longitude, hours]);

  const formatTime = (timeString: string): string => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const formatTooltipTime = (timeString: string): string => {
    const date = new Date(timeString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (hourlyStatus === 'loading') {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <Spin />
        <div style={{ marginTop: '10px' }}>
          <Text type="secondary">Đang tải dữ liệu...</Text>
        </div>
      </div>
    );
  }

  if (hourlyStatus === 'failed' || !hourly) {
    return (
      <Alert
        message="Lỗi"
        description={hourlyError || 'Không thể tải dữ liệu'}
        type="error"
        showIcon
      />
    );
  }

  // Prepare chart data
  const chartData = hourly.hourly.map((hour) => ({
    time: formatTime(hour.time),
    fullTime: hour.time,
    temperature: hour.temperature_2m != null ? Math.round(hour.temperature_2m) : null,
    apparentTemperature: hour.apparent_temperature != null ? Math.round(hour.apparent_temperature) : null,
    precipitation: hour.precipitation || 0,
    windspeed: Math.round(hour.windspeed_10m),
    windgusts: hour.windgusts_10m != null ? Math.round(hour.windgusts_10m) : null,
    uvIndex: hour.uv_index != null ? Math.round(hour.uv_index * 10) / 10 : null,
    humidity: hour.relativehumidity_2m,
    visibility: hour.visibility != null && hour.visibility < 100 ? Math.round(hour.visibility * 10) / 10 : null,
    cloudcover: hour.cloudcover,
    isDay: hour.is_day,
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className={styles.tooltip}>
          <Text strong>{formatTooltipTime(data.fullTime)}</Text>
          <div style={{ marginTop: '8px' }}>
            {data.temperature != null && (
              <div>🌡️ Nhiệt độ: <strong>{data.temperature}°C</strong></div>
            )}
            {data.apparentTemperature != null && data.apparentTemperature !== data.temperature && (
              <div>Cảm nhận: <strong>{data.apparentTemperature}°C</strong></div>
            )}
            {data.precipitation > 0 && (
              <div>💧 Mưa: <strong>{data.precipitation.toFixed(1)}mm</strong></div>
            )}
            {data.windspeed != null && (
              <div>💨 Gió: <strong>{data.windspeed}km/h</strong></div>
            )}
            {data.windgusts != null && (
              <div>🌪️ Gió giật: <strong>{data.windgusts}km/h</strong></div>
            )}
            {data.uvIndex != null && (
              <div>☀️ UV: <strong>{data.uvIndex}</strong></div>
            )}
            {data.humidity != null && (
              <div>💧 Độ ẩm: <strong>{data.humidity}%</strong></div>
            )}
            {data.visibility != null && data.visibility < 100 && (
              <div>👁️ Tầm nhìn: <strong>{data.visibility.toFixed(1)}km</strong></div>
            )}
            {data.cloudcover != null && (
              <div>☁️ Mây: <strong>{data.cloudcover}%</strong></div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Temperature chart
  const TemperatureChart = () => (
    <ResponsiveContainer width="100%" height={350}>
      <ComposedChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="time" 
          tick={{ fontSize: 11 }}
          angle={-45}
          textAnchor="end"
          height={70}
          interval="preserveStartEnd"
        />
        <YAxis 
          yAxisId="temp"
          label={{ value: 'Nhiệt độ (°C)', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip 
          content={<CustomTooltip />} 
          wrapperStyle={{ zIndex: 9999 }}
          position={{ y: -10 }}
        />
        <Legend 
          wrapperStyle={{ paddingTop: '20px' }}
          verticalAlign="bottom"
        />
        <Bar 
          yAxisId="temp"
          dataKey="precipitation" 
          fill="#1890ff" 
          name="Mưa (mm)"
          radius={[4, 4, 0, 0]}
        />
        <Line 
          yAxisId="temp"
          type="monotone" 
          dataKey="temperature" 
          stroke="#ff4d4f" 
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
          name="Nhiệt độ (°C)"
        />
        <Line 
          yAxisId="temp"
          type="monotone" 
          dataKey="apparentTemperature" 
          stroke="#faad14" 
          strokeWidth={2}
          strokeDasharray="5 5"
          dot={{ r: 3 }}
          name="Cảm nhận (°C)"
        />
        <ReferenceLine 
          yAxisId="temp" 
          y={30} 
          stroke="#ff4d4f" 
          strokeDasharray="3 3" 
          label={{ value: "Nóng", position: "top", offset: 5 }} 
        />
        <ReferenceLine 
          yAxisId="temp" 
          y={15} 
          stroke="#1890ff" 
          strokeDasharray="3 3" 
          label={{ value: "Lạnh", position: "bottom", offset: 5 }} 
        />
      </ComposedChart>
    </ResponsiveContainer>
  );

  // Wind chart
  const WindChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="time" 
          tick={{ fontSize: 11 }}
          angle={-45}
          textAnchor="end"
          height={70}
          interval="preserveStartEnd"
        />
        <YAxis 
          label={{ value: 'Tốc độ (km/h)', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip 
          content={<CustomTooltip />} 
          wrapperStyle={{ zIndex: 9999 }}
          position={{ y: -10 }}
        />
        <Legend 
          wrapperStyle={{ paddingTop: '20px' }}
          verticalAlign="bottom"
        />
        <Bar 
          dataKey="windspeed" 
          fill="#52c41a" 
          name="Gió (km/h)"
          radius={[4, 4, 0, 0]}
        />
        {chartData.some(d => d.windgusts != null) && (
          <Line 
            type="monotone" 
            dataKey="windgusts" 
            stroke="#ff4d4f" 
            strokeWidth={2}
            dot={{ r: 4 }}
            name="Gió giật (km/h)"
          />
        )}
        <ReferenceLine 
          y={30} 
          stroke="#faad14" 
          strokeDasharray="3 3" 
          label={{ value: "Gió mạnh", position: "top", offset: 5 }} 
        />
        <ReferenceLine 
          y={40} 
          stroke="#ff4d4f" 
          strokeDasharray="3 3" 
          label={{ value: "Rất mạnh", position: "top", offset: 5 }} 
        />
      </ComposedChart>
    </ResponsiveContainer>
  );

  // UV and Humidity chart
  const UVHumidityChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="time" 
          tick={{ fontSize: 11 }}
          angle={-45}
          textAnchor="end"
          height={70}
          interval="preserveStartEnd"
        />
        <YAxis 
          yAxisId="left"
          label={{ value: 'UV Index', angle: -90, position: 'insideLeft' }}
        />
        <YAxis 
          yAxisId="right"
          orientation="right"
          label={{ value: 'Độ ẩm (%)', angle: 90, position: 'insideRight' }}
        />
        <Tooltip 
          content={<CustomTooltip />} 
          wrapperStyle={{ zIndex: 9999 }}
          position={{ y: -10 }}
        />
        <Legend 
          wrapperStyle={{ paddingTop: '20px' }}
          verticalAlign="bottom"
        />
        <Bar 
          yAxisId="right"
          dataKey="humidity" 
          fill="#91d5ff" 
          name="Độ ẩm (%)"
          radius={[4, 4, 0, 0]}
        />
        <Line 
          yAxisId="left"
          type="monotone" 
          dataKey="uvIndex" 
          stroke="#fa8c16" 
          strokeWidth={2}
          dot={{ r: 4 }}
          name="UV Index"
        />
        <ReferenceLine 
          yAxisId="left" 
          y={6} 
          stroke="#faad14" 
          strokeDasharray="3 3" 
          label={{ value: "UV Cao", position: "top", offset: 5 }} 
        />
        <ReferenceLine 
          yAxisId="left" 
          y={8} 
          stroke="#ff4d4f" 
          strokeDasharray="3 3" 
          label={{ value: "Rất cao", position: "top", offset: 5 }} 
        />
      </ComposedChart>
    </ResponsiveContainer>
  );

  // Visibility chart
  const VisibilityChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="time" 
          tick={{ fontSize: 11 }}
          angle={-45}
          textAnchor="end"
          height={70}
          interval="preserveStartEnd"
        />
        <YAxis 
          label={{ value: 'Tầm nhìn (km)', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip 
          content={<CustomTooltip />} 
          wrapperStyle={{ zIndex: 9999 }}
          position={{ y: -10 }}
        />
        <Legend 
          wrapperStyle={{ paddingTop: '20px' }}
          verticalAlign="bottom"
        />
        <Bar 
          dataKey="visibility" 
          fill="#722ed1" 
          name="Tầm nhìn (km)"
          radius={[4, 4, 0, 0]}
        />
        <Bar 
          dataKey="cloudcover" 
          fill="#d9d9d9" 
          name="Mây (%)"
          radius={[4, 4, 0, 0]}
          opacity={0.5}
        />
        <ReferenceLine 
          y={1} 
          stroke="#ff4d4f" 
          strokeDasharray="3 3" 
          label={{ value: "Tầm nhìn kém", position: "top", offset: 5 }} 
        />
        <ReferenceLine 
          y={5} 
          stroke="#faad14" 
          strokeDasharray="3 3" 
          label={{ value: "Tầm nhìn TB", position: "top", offset: 5 }} 
        />
      </ComposedChart>
    </ResponsiveContainer>
  );

  const tabItems = [
    {
      key: 'temperature',
      label: '🌡️ Nhiệt độ & Mưa',
      children: <TemperatureChart />,
    },
    {
      key: 'wind',
      label: '💨 Gió',
      children: <WindChart />,
    },
    {
      key: 'uv',
      label: '☀️ UV & Độ ẩm',
      children: <UVHumidityChart />,
    },
    {
      key: 'visibility',
      label: '👁️ Tầm nhìn & Mây',
      children: <VisibilityChart />,
    },
  ];

  return (
    <div className={styles.hourlyChart}>
      <Title level={5} style={{ marginBottom: '16px' }}>
        Biểu đồ dự báo {hours}h tới
      </Title>
      {hourly.stale && (
        <Alert
          message="Đang dùng dữ liệu cache"
          description="Dữ liệu có thể không cập nhật mới nhất"
          type="warning"
          showIcon
          style={{ marginBottom: '16px' }}
        />
      )}
      <Tabs items={tabItems} defaultActiveKey="temperature" />
    </div>
  );
};

export default HourlyForecastChart;

