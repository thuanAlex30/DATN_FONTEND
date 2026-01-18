import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Typography, Space, Spin, Tag, Alert, Button, Popover, Badge, Tabs } from 'antd';
import {
  CloudOutlined,
  SunOutlined,
  ThunderboltOutlined,
  WarningOutlined,
  RedoOutlined,
  EnvironmentOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { fetchWeather, fetchAirQuality } from '../../store/slices/weatherSlice';
import { fetchActiveAlerts } from '../../store/slices/weatherAlertsSlice';
import type { RootState } from '../../store';
import ForecastView from './ForecastView';
import HourlyForecastChart from './HourlyForecastChart';
import UVIndexIndicator from './UVIndexIndicator';
import AirQualityIndicator from './AirQualityIndicator';
import styles from './WeatherWidget.module.css';

const { Text } = Typography;

interface WeatherWidgetProps {
  latitude?: number;
  longitude?: number;
  compact?: boolean;
  enableGeo?: boolean;
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  latitude,
  longitude,
  compact = false,
  enableGeo = true,
}) => {
  const dispatch = useDispatch();
  const { data, status, error, airQuality, forecast } = useSelector((state: RootState) => state.weather);
  const { activeAlerts } = useSelector((state: RootState) => state.weatherAlerts);
  const [coords, setCoords] = useState<{ latitude?: number; longitude?: number }>({
    latitude,
    longitude,
  });
  const [geoError, setGeoError] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [compactOpen, setCompactOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('today');

  // Tự động lấy vị trí khi component mount nếu không có coordinates
  useEffect(() => {
    if (enableGeo && !coords.latitude && !coords.longitude && navigator.geolocation) {
      setIsGettingLocation(true);
      setGeoError(null);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude: lat, longitude: lon } = pos.coords;
          setCoords({ latitude: lat, longitude: lon });
          setIsGettingLocation(false);
        },
        (err) => {
          // Fallback về default location nếu geolocation fail
          console.warn('Geolocation failed, using default location:', err.message);
          setGeoError(null); // Không hiển thị lỗi vì đã có fallback
          setIsGettingLocation(false);
          // Sử dụng default location từ ENV hoặc không truyền (backend sẽ dùng default)
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 600000 } // Cache 10 phút
      );
    }
  }, [enableGeo]); // Chỉ chạy một lần khi mount

  useEffect(() => {
    if (isGettingLocation) return;
    
    // Validate coordinates before making API calls
    const hasValidCoords = 
      coords.latitude != null && 
      coords.longitude != null && 
      !isNaN(coords.latitude) && 
      !isNaN(coords.longitude) &&
      isFinite(coords.latitude) &&
      isFinite(coords.longitude);
    
    if (hasValidCoords) {
      dispatch(fetchWeather({ latitude: coords.latitude, longitude: coords.longitude }) as any);
      dispatch(fetchAirQuality({ latitude: coords.latitude, longitude: coords.longitude }) as any);
    } else {
      // Only fetch weather with default location, skip air quality if no valid coords
      // Backend will use default location for weather
      dispatch(fetchWeather({}) as any);
      // Don't fetch air quality if we don't have valid coordinates
      // This prevents NaN:NaN cacheKey errors
    }
  }, [dispatch, coords.latitude, coords.longitude, isGettingLocation]);

  // Fetch active alerts on mount and when location changes
  useEffect(() => {
    dispatch(fetchActiveAlerts() as any);
  }, [dispatch]);

  const handleUseMyLocation = () => {
    if (!enableGeo || !navigator.geolocation) {
      setGeoError('Thiết bị không hỗ trợ định vị');
      return;
    }
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        setCoords({ latitude: lat, longitude: lon });
        dispatch(fetchWeather({ latitude: lat, longitude: lon }) as any);
      },
      (err) => {
        setGeoError(err.message || 'Không thể lấy vị trí');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const getWeatherIcon = (weatherCode: number) => {
    // WMO Weather interpretation codes
    if (weatherCode === 0) return <SunOutlined className={styles.sunIcon} />;
    if (weatherCode <= 3) return <CloudOutlined className={styles.cloudIcon} />;
    if (weatherCode >= 95) return <ThunderboltOutlined className={styles.thunderIcon} />;
    return <CloudOutlined className={styles.cloudIcon} />;
  };


  const getWeatherDescription = (weatherCode: number): string => {
    const descriptions: Record<number, string> = {
      0: 'Trời quang',
      1: 'Chủ yếu quang',
      2: 'Có mây một phần',
      3: 'U ám',
      45: 'Sương mù',
      48: 'Sương mù đóng băng',
      51: 'Mưa phùn nhẹ',
      53: 'Mưa phùn vừa',
      55: 'Mưa phùn nặng',
      56: 'Mưa phùn lạnh nhẹ',
      57: 'Mưa phùn lạnh nặng',
      61: 'Mưa nhẹ',
      63: 'Mưa vừa',
      65: 'Mưa nặng',
      66: 'Mưa lạnh nhẹ',
      67: 'Mưa lạnh nặng',
      71: 'Tuyết nhẹ',
      73: 'Tuyết vừa',
      75: 'Tuyết nặng',
      77: 'Hạt tuyết',
      80: 'Mưa rào nhẹ',
      81: 'Mưa rào vừa',
      82: 'Mưa rào nặng',
      85: 'Tuyết rào nhẹ',
      86: 'Tuyết rào nặng',
      95: 'Dông',
      96: 'Dông kèm mưa đá nhẹ',
      99: 'Dông kèm mưa đá nặng',
    };
    return descriptions[weatherCode] || 'Không xác định';
  };

  const getTemperatureColor = (temp: number): string => {
    if (temp >= 30) return '#ff4d4f'; // Hot - red
    if (temp <= 15) return '#1890ff'; // Cold - blue
    return '#52c41a'; // Normal - green
  };

  if (status === 'loading' || isGettingLocation) {
    return (
      <Card size="small" className={styles.weatherWidget}>
        <Space size="small">
          <Spin size="small" />
          {isGettingLocation && <Text type="secondary" style={{ fontSize: '12px' }}>Đang lấy vị trí...</Text>}
        </Space>
      </Card>
    );
  }

  if (status === 'failed' || !data) {
    return (
      <Card size="small" className={styles.weatherWidget}>
        <Space direction="vertical" size="small">
          <Space>
            <WarningOutlined className={styles.errorIcon} />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {error || 'Không thể tải thời tiết'}
            </Text>
          </Space>
          <Button
            size="small"
            icon={<RedoOutlined />}
            onClick={() => dispatch(fetchWeather({ latitude, longitude }) as any)}
          >
            Thử lại
          </Button>
          {enableGeo && (
            <Button
              size="small"
              icon={<EnvironmentOutlined />}
              onClick={handleUseMyLocation}
            >
              Dùng vị trí của tôi
            </Button>
          )}
          {geoError && (
            <Text type="danger" style={{ fontSize: 12 }}>
              {geoError}
            </Text>
          )}
        </Space>
      </Card>
    );
  }

  const { current } = data;
  const temperature = Math.round(current.temperature);
  
  // Lấy gió tối đa trong ngày từ forecast nếu có, nếu không thì dùng gió hiện tại
  let windSpeed = Math.round(current.windspeed);
  if (forecast && forecast.daily && forecast.daily.length > 0) {
    const today = forecast.daily[0]; // Ngày đầu tiên là hôm nay
    if (today.windspeed_max != null) {
      windSpeed = Math.round(today.windspeed_max);
    }
  }
  
  const precipitation = current.precipitation ?? 0;

  const alerts: string[] = [];
  if (current.windspeed >= 30) alerts.push('Gió mạnh, hãy kiểm tra PPE chắn gió & mũ/kính');
  if (current.windgusts_10m && current.windgusts_10m >= 40) alerts.push('Gió giật mạnh, cẩn thận khi làm việc trên cao');
  if ([61, 63, 65, 80, 81, 82].includes(current.weathercode)) alerts.push('Có mưa, chuẩn bị đồ chống nước');
  if (current.temperature >= 35) alerts.push('Nhiệt độ cao, lưu ý chống nắng & uống nước');
  if (current.temperature <= 15) alerts.push('Trời lạnh, chuẩn bị giữ ấm');
  if (current.uv_index != null && current.uv_index >= 6) alerts.push(`UV cao (${current.uv_index.toFixed(1)}), cần kem chống nắng & mũ nón`);
  if (current.visibility != null && current.visibility < 1) alerts.push(`Tầm nhìn kém (${current.visibility.toFixed(1)}km), cần áo phản quang`);
  if (airQuality?.current?.us_aqi && airQuality.current.us_aqi > 150) alerts.push(`Chất lượng không khí kém (AQI: ${airQuality.current.us_aqi}), nên đeo khẩu trang N95`);

  if (compact) {
    const todayContent = (
      <Space direction="vertical" size="small" style={{ minWidth: 200 }}>
        <Space align="center">
          {getWeatherIcon(current.weathercode)}
          <Text strong style={{ color: getTemperatureColor(current.temperature) }}>
            {temperature}°C - {getWeatherDescription(current.weathercode)}
          </Text>
        </Space>
        <Text type="secondary" style={{ fontSize: '12px' }}>
          Gió: {windSpeed} km/h
        </Text>
        {current.windgusts_10m != null && current.windgusts_10m > 30 && (
          <Text type="secondary" style={{ fontSize: '12px', color: '#ff4d4f' }}>
            Gió giật: {Math.round(current.windgusts_10m)} km/h
          </Text>
        )}
        {precipitation > 0 && (
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Mưa: {precipitation.toFixed(1)} mm
          </Text>
        )}
        {current.apparent_temperature != null && Math.abs(current.apparent_temperature - current.temperature) > 2 && (
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Cảm nhận: {Math.round(current.apparent_temperature)}°C
          </Text>
        )}
        {current.relativehumidity_2m != null && (
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Độ ẩm: {Math.round(current.relativehumidity_2m)}%
          </Text>
        )}
        <Space wrap size={[4, 4]}>
          {current.uv_index != null && (
            <UVIndexIndicator uvIndex={current.uv_index} size="small" />
          )}
          {airQuality?.current && (airQuality.current.us_aqi != null || airQuality.current.european_aqi != null) && (
            <AirQualityIndicator airQuality={airQuality.current} size="small" showDetails={false} />
          )}
          {current.visibility != null && current.visibility < 5 && (
            <Tag color="orange">
              Tầm nhìn: {current.visibility.toFixed(1)}km
            </Tag>
          )}
        </Space>
        {alerts.length > 0 && (
          <Alert
            type="warning"
            message="Khuyến nghị an toàn"
            description={alerts.join('. ')}
            showIcon
            style={{ fontSize: '11px' }}
          />
        )}
        <Space>
          <Button
            size="small"
            icon={<RedoOutlined />}
            onClick={() => dispatch(fetchWeather(coords.latitude != null && coords.longitude != null ? { latitude: coords.latitude, longitude: coords.longitude } : {}) as any)}
          >
            Làm mới
          </Button>
          {enableGeo && (
            <Button
              size="small"
              icon={<EnvironmentOutlined />}
              onClick={handleUseMyLocation}
            >
              Dùng vị trí của tôi
            </Button>
          )}
        </Space>
        {geoError && (
          <Text type="danger" style={{ fontSize: 12 }}>
            {geoError}
          </Text>
        )}
      </Space>
    );

    const compactContent = (
      <div style={{ maxWidth: '600px', maxHeight: '700px' }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'today',
              label: 'Hôm nay',
              children: todayContent,
            },
            {
              key: 'hourly',
              label: '24h tới',
              children: (
                <HourlyForecastChart
                  latitude={coords.latitude}
                  longitude={coords.longitude}
                  hours={24}
                />
              ),
            },
            {
              key: 'forecast',
              label: '7 ngày tới',
              children: (
                <ForecastView
                  latitude={coords.latitude}
                  longitude={coords.longitude}
                />
              ),
            },
          ]}
        />
      </div>
    );

    return (
      <Popover
        content={compactContent}
        trigger="click"
        open={compactOpen}
        onOpenChange={setCompactOpen}
        placement="bottomRight"
      >
        <Badge
          count={activeAlerts.length > 0 ? activeAlerts.length : (alerts.length > 0 ? alerts.length : 0)}
          size="small"
          offset={[8, 0]}
          style={{ cursor: 'pointer' }}
        >
          <Card
            size="small"
            className={styles.weatherWidgetCompact}
            hoverable
            onClick={() => setCompactOpen(!compactOpen)}
          >
            <Space size="small">
              {alerts.length > 0 && (
                <ExclamationCircleOutlined
                  style={{
                    color: '#ff4d4f',
                    fontSize: '12px',
                  }}
                />
              )}
              {getWeatherIcon(current.weathercode)}
              <Text
                strong
                style={{
                  fontSize: '14px',
                  color: alerts.length > 0 ? '#ff4d4f' : getTemperatureColor(current.temperature),
                }}
              >
                {temperature}°C
              </Text>
            </Space>
          </Card>
        </Badge>
      </Popover>
    );
  }

  return (
    <Card
      size="small"
      className={styles.weatherWidget}
      title={
        <Space>
          {getWeatherIcon(current.weathercode)}
          <span style={{ fontWeight: 600 }}>Thời tiết</span>
        </Space>
      }
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <div className={styles.temperatureDisplay}>
            {temperature}°C
          </div>
          <Tag 
            color="blue" 
            style={{ 
              fontSize: '13px',
              padding: '4px 12px',
              borderRadius: '12px',
              border: 'none',
              fontWeight: 500,
              marginTop: '8px'
            }}
          >
            {getWeatherDescription(current.weathercode)}
          </Tag>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div className={styles.weatherMetric}>
            <Text type="secondary" style={{ fontSize: '13px', fontWeight: 500, minWidth: '80px' }}>
              💨 Gió:
            </Text>
            <Text strong style={{ fontSize: '13px' }}>
              {windSpeed} km/h
            </Text>
            {current.windgusts_10m != null && current.windgusts_10m > 30 && (
              <Tag color="red" style={{ margin: 0, fontSize: '11px', padding: '2px 8px' }}>
                Giật: {Math.round(current.windgusts_10m)} km/h
              </Tag>
            )}
          </div>
          {precipitation > 0 && (
            <div className={styles.weatherMetric}>
              <Text type="secondary" style={{ fontSize: '13px', fontWeight: 500, minWidth: '80px' }}>
                💧 Mưa:
              </Text>
              <Text strong style={{ fontSize: '13px' }}>
                {precipitation.toFixed(1)} mm
              </Text>
            </div>
          )}
          {current.apparent_temperature != null && Math.abs(current.apparent_temperature - current.temperature) > 2 && (
            <div className={styles.weatherMetric}>
              <Text type="secondary" style={{ fontSize: '13px', fontWeight: 500, minWidth: '80px' }}>
                🌡️ Cảm nhận:
              </Text>
              <Text strong style={{ fontSize: '13px' }}>
                {Math.round(current.apparent_temperature)}°C
              </Text>
            </div>
          )}
          {current.relativehumidity_2m != null && (
            <div className={styles.weatherMetric}>
              <Text type="secondary" style={{ fontSize: '13px', fontWeight: 500, minWidth: '80px' }}>
                💧 Độ ẩm:
              </Text>
              <Text strong style={{ fontSize: '13px' }}>
                {Math.round(current.relativehumidity_2m)}%
              </Text>
            </div>
          )}
        </div>
        <div className={styles.indicatorGroup}>
          {current.uv_index != null && (
            <UVIndexIndicator uvIndex={current.uv_index} size="small" />
          )}
          {airQuality?.current && (airQuality.current.us_aqi != null || airQuality.current.european_aqi != null) && (
            <AirQualityIndicator airQuality={airQuality.current} size="small" showDetails={false} />
          )}
          {current.visibility != null && current.visibility < 5 && (
            <Tag color="orange" style={{ margin: 0, fontSize: '12px', padding: '4px 10px', borderRadius: '12px' }}>
              👁️ Tầm nhìn: {current.visibility.toFixed(1)}km
            </Tag>
          )}
        </div>
        <Space size="small">
          <Button
            size="small"
            icon={<RedoOutlined />}
            onClick={() => dispatch(fetchWeather({ latitude: coords.latitude, longitude: coords.longitude }) as any)}
          >
            Làm mới
          </Button>
          {enableGeo && (
            <Button
              size="small"
              icon={<EnvironmentOutlined />}
              onClick={handleUseMyLocation}
            >
              Dùng vị trí của tôi
            </Button>
          )}
        </Space>
        {geoError && (
          <Text type="danger" style={{ fontSize: 12 }}>
            {geoError}
          </Text>
        )}
      </Space>
    </Card>
  );
};

export default WeatherWidget;

