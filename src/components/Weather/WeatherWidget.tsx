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
import { fetchWeather } from '../../store/slices/weatherSlice';
import type { RootState } from '../../store';
import ForecastView from './ForecastView';
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
  const { data, status, error } = useSelector((state: RootState) => state.weather);
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
    if (coords.latitude != null && coords.longitude != null) {
      dispatch(fetchWeather({ latitude: coords.latitude, longitude: coords.longitude }) as any);
    } else {
      // gửi không params để backend dùng default
      dispatch(fetchWeather({}) as any);
    }
  }, [dispatch, coords.latitude, coords.longitude, isGettingLocation]);

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

  // Map coordinates to city names in Vietnam
  const getCityName = (lat?: number, lon?: number): string => {
    if (!lat || !lon) return 'Vị trí mặc định';
    
    // Major cities in Vietnam with approximate coordinates and larger radius
    const cities = [
      { name: 'Hà Nội', lat: 21.0285, lon: 105.8542, radius: 1.0 },
      { name: 'TP. Hồ Chí Minh', lat: 10.8231, lon: 106.6297, radius: 1.0 },
      { name: 'Đà Nẵng', lat: 16.0471, lon: 108.2068, radius: 1.5 }, // Tăng radius cho Đà Nẵng
      { name: 'Hải Phòng', lat: 20.8449, lon: 106.6881, radius: 0.8 },
      { name: 'Cần Thơ', lat: 10.0452, lon: 105.7469, radius: 0.8 },
      { name: 'Nha Trang', lat: 12.2388, lon: 109.1967, radius: 0.8 },
      { name: 'Huế', lat: 16.4637, lon: 107.5909, radius: 0.8 },
      { name: 'Vũng Tàu', lat: 10.3460, lon: 107.0843, radius: 0.5 },
      { name: 'Quy Nhon', lat: 13.7765, lon: 109.2233, radius: 0.5 },
      { name: 'Đà Lạt', lat: 11.9404, lon: 108.4583, radius: 0.5 },
    ];

    // Find closest city by distance
    let closestCity = null;
    let minDistance = Infinity;

    for (const city of cities) {
      const distance = Math.sqrt(
        Math.pow(lat - city.lat, 2) + Math.pow(lon - city.lon, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        closestCity = city;
      }
    }

    // Return city name if within radius, otherwise show coordinates
    if (closestCity && minDistance <= closestCity.radius) {
      return closestCity.name;
    }

    // If very close to Đà Nẵng area (within 2 degrees), assume Đà Nẵng
    if (lat >= 14 && lat <= 17 && lon >= 107 && lon <= 109) {
      return 'Đà Nẵng';
    }

    // If very close to Hà Nội area
    if (lat >= 20 && lat <= 22 && lon >= 105 && lon <= 106) {
      return 'Hà Nội';
    }

    // If very close to TP.HCM area
    if (lat >= 10 && lat <= 11 && lon >= 106 && lon <= 107) {
      return 'TP. Hồ Chí Minh';
    }

    // If no city matches, show coordinates
    return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
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
  const windSpeed = Math.round(current.windspeed);
  const precipitation = current.precipitation ?? 0;

  const alerts: string[] = [];
  if (current.windspeed >= 30) alerts.push('Gió mạnh, hãy kiểm tra PPE chắn gió & mũ/kính');
  if ([61, 63, 65, 80, 81, 82].includes(current.weathercode)) alerts.push('Có mưa, chuẩn bị đồ chống nước');
  if (current.temperature >= 35) alerts.push('Nhiệt độ cao, lưu ý chống nắng & uống nước');
  if (current.temperature <= 15) alerts.push('Trời lạnh, chuẩn bị giữ ấm');

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
        {precipitation > 0 && (
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Mưa: {precipitation.toFixed(1)} mm
          </Text>
        )}
        {data.location && (
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {getCityName(data.location.latitude, data.location.longitude)}
          </Text>
        )}
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
          count={alerts.length > 0 ? alerts.length : 0}
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
          <span>Thời tiết</span>
        </Space>
      }
    >
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        <div>
          <Text strong style={{ fontSize: '16px', color: getTemperatureColor(current.temperature) }}>
            {temperature}°C
          </Text>
        </div>
        <div>
          <Tag color="blue">{getWeatherDescription(current.weathercode)}</Tag>
        </div>
        <div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Gió: {windSpeed} km/h
          </Text>
        </div>
        {precipitation > 0 && (
          <div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Mưa: {precipitation.toFixed(1)} mm
            </Text>
          </div>
        )}
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
        {alerts.length > 0 && (
          <Alert
            type="warning"
            message="Khuyến nghị an toàn"
            description={alerts.join('. ')}
            showIcon
          />
        )}
        {data.location && (
          <Text type="secondary" style={{ fontSize: '10px' }}>
            {getCityName(data.location.latitude, data.location.longitude)}
          </Text>
        )}
      </Space>
    </Card>
  );
};

export default WeatherWidget;

