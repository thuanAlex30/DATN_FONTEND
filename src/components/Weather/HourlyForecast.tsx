import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Typography, Space, Spin, Alert, List, Tag, Tooltip } from 'antd';
import {
  CloudOutlined,
  SunOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { fetchHourly } from '../../store/slices/weatherSlice';
import type { RootState } from '../../store';
import type { HourlyWeather } from '../../types/weather';
import styles from './HourlyForecast.module.css';

const { Text, Title } = Typography;

interface HourlyForecastProps {
  latitude?: number;
  longitude?: number;
  hours?: number; // Default 24 hours
}

const HourlyForecast: React.FC<HourlyForecastProps> = ({
  latitude,
  longitude,
  hours = 24,
}) => {
  const dispatch = useDispatch();
  const { hourly, hourlyStatus, hourlyError } = useSelector(
    (state: RootState) => state.weather
  );

  useEffect(() => {
    // Skip if coordinates are invalid
    if (latitude == null || longitude == null || isNaN(latitude) || isNaN(longitude)) {
      return;
    }

    // Only fetch if coordinates are valid numbers
    if (isFinite(latitude) && isFinite(longitude)) {
      dispatch(fetchHourly({ latitude, longitude, hours }) as any);
    }
  }, [dispatch, latitude, longitude, hours]);

  const getWeatherIcon = (weatherCode: number, isDay: number) => {
    if (weatherCode === 0) {
      return isDay ? <SunOutlined className={styles.sunIcon} /> : <CloudOutlined className={styles.cloudIcon} />;
    }
    if (weatherCode <= 3) return <CloudOutlined className={styles.cloudIcon} />;
    if (weatherCode >= 95) return <ThunderboltOutlined className={styles.thunderIcon} />;
    if ([61, 63, 65, 80, 81, 82].includes(weatherCode)) {
      return <CloudOutlined className={styles.rainIcon} />;
    }
    return <CloudOutlined className={styles.cloudIcon} />;
  };

  const formatTime = (timeString: string): string => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const formatDate = (timeString: string): string => {
    const date = new Date(timeString);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return 'Hôm nay';
    }
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (date.toDateString() === tomorrow.toDateString()) {
      return 'Ngày mai';
    }
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  };

  const getUVLevel = (uv: number | null): { level: string; color: string } => {
    if (uv === null) return { level: 'N/A', color: 'default' };
    if (uv <= 2) return { level: 'Thấp', color: 'green' };
    if (uv <= 5) return { level: 'TB', color: 'lime' };
    if (uv <= 7) return { level: 'Cao', color: 'orange' };
    if (uv <= 10) return { level: 'Rất cao', color: 'red' };
    return { level: 'Cực cao', color: 'magenta' };
  };

  if (hourlyStatus === 'loading') {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <Spin />
        <div style={{ marginTop: '10px' }}>
          <Text type="secondary">Đang tải dự báo theo giờ...</Text>
        </div>
      </div>
    );
  }

  if (hourlyStatus === 'failed' || !hourly) {
    return (
      <Alert
        message="Lỗi"
        description={hourlyError || 'Không thể tải dự báo theo giờ'}
        type="error"
        showIcon
      />
    );
  }

  // Group by date
  const groupedByDate: Record<string, HourlyWeather[]> = {};
  hourly.hourly.forEach((hour) => {
    const dateKey = hour.time.split('T')[0];
    if (!groupedByDate[dateKey]) {
      groupedByDate[dateKey] = [];
    }
    groupedByDate[dateKey].push(hour);
  });

  return (
    <div className={styles.hourlyForecast}>
      <Title level={5} style={{ marginBottom: '16px' }}>
        Dự báo theo giờ ({hours}h)
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
      
      {Object.entries(groupedByDate).map(([date, hours]) => (
        <Card 
          key={date} 
          size="small" 
          title={formatDate(hours[0].time)}
          style={{ marginBottom: '16px' }}
        >
          <List
            size="small"
            dataSource={hours}
            renderItem={(hour) => {
              const uvLevel = getUVLevel(hour.uv_index);
              return (
                <List.Item>
                  <Space direction="vertical" size={4} style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Space>
                        {getWeatherIcon(hour.weathercode, hour.is_day)}
                        <Text strong>{formatTime(hour.time)}</Text>
                      </Space>
                      <Space>
                        <Text strong style={{ fontSize: '16px' }}>
                          {hour.temperature_2m != null ? `${Math.round(hour.temperature_2m)}°C` : 'N/A'}
                        </Text>
                        {hour.apparent_temperature != null && hour.apparent_temperature !== hour.temperature_2m && (
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            (Cảm nhận: {Math.round(hour.apparent_temperature)}°C)
                          </Text>
                        )}
                      </Space>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {hour.precipitation > 0 && (
                        <Tag color="blue">
                          💧 {hour.precipitation.toFixed(1)}mm
                        </Tag>
                      )}
                      {hour.uv_index != null && (
                        <Tooltip title={`UV Index: ${hour.uv_index.toFixed(1)}`}>
                          <Tag color={uvLevel.color}>
                            UV: {uvLevel.level}
                          </Tag>
                        </Tooltip>
                      )}
                      {hour.visibility != null && hour.visibility < 5 && (
                        <Tag color="orange">
                          Tầm nhìn: {hour.visibility.toFixed(1)}km
                        </Tag>
                      )}
                      {hour.windgusts_10m != null && hour.windgusts_10m > 30 && (
                        <Tag color="red">
                          Gió giật: {Math.round(hour.windgusts_10m)}km/h
                        </Tag>
                      )}
                      {hour.relativehumidity_2m != null && (
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          Độ ẩm: {hour.relativehumidity_2m}%
                        </Text>
                      )}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px', fontSize: '11px' }}>
                      <Text type="secondary">Gió: {Math.round(hour.windspeed_10m)}km/h</Text>
                      {hour.cloudcover != null && (
                        <Text type="secondary">Mây: {hour.cloudcover}%</Text>
                      )}
                    </div>
                  </Space>
                </List.Item>
              );
            }}
          />
        </Card>
      ))}
    </div>
  );
};

export default HourlyForecast;

