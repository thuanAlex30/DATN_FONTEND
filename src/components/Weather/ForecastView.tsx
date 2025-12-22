import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Typography, Row, Col, Tag, Alert, Spin, List, Space, Collapse, Tooltip } from 'antd';
import {
  CloudOutlined,
  SunOutlined,
  ThunderboltOutlined,
  WarningOutlined,
  SafetyOutlined,
} from '@ant-design/icons';
import { fetchForecast } from '../../store/slices/weatherSlice';
import type { RootState } from '../../store';
import type { DailyForecast } from '../../types/weather';
import UVIndexIndicator from './UVIndexIndicator';
import styles from './ForecastView.module.css';

const { Text, Title } = Typography;

interface ForecastViewProps {
  latitude?: number;
  longitude?: number;
}

interface PPESuggestion {
  name: string;
  reason: string;
  priority: number;
}

// Helper function to generate PPE suggestions based on daily forecast
const generatePPESuggestions = (day: DailyForecast): PPESuggestion[] => {
  const suggestions: PPESuggestion[] = [];
  
  // Rain conditions
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(day.weathercode) || day.precipitation_sum > 5) {
    suggestions.push({ name: 'Áo mưa', reason: 'Có mưa', priority: 5 });
    suggestions.push({ name: 'Ủng chống nước', reason: 'Đường trơn trượt', priority: 4 });
  }
  
  // Thunderstorm
  if ([95, 96, 99].includes(day.weathercode)) {
    suggestions.push({ name: 'Giày cách điện', reason: 'An toàn điện', priority: 5 });
    suggestions.push({ name: 'Áo mưa', reason: 'Mưa dông', priority: 5 });
  }
  
  // High wind
  if (day.windspeed_max >= 30) {
    suggestions.push({ name: 'Mũ bảo hiểm có quai', reason: 'Gió mạnh', priority: 5 });
    suggestions.push({ name: 'Kính bảo hộ', reason: 'Chống bụi/vật bay', priority: 4 });
  }
  
  // Hot weather
  if (day.temperature_max >= 35) {
    suggestions.push({ name: 'Mũ nón bảo hộ', reason: 'Nắng nóng', priority: 5 });
    suggestions.push({ name: 'Kính bảo hộ', reason: 'Chống nắng chói', priority: 4 });
    suggestions.push({ name: 'Áo bảo hộ lao động chống nắng', reason: 'Bảo vệ da khỏi ánh nắng', priority: 4 });
  }

  // High UV
  if (day.uv_index_max != null && day.uv_index_max >= 6) {
    suggestions.push({ name: 'Mũ nón bảo hộ', reason: `UV cao (${day.uv_index_max.toFixed(1)})`, priority: day.uv_index_max >= 8 ? 5 : 4 });
    suggestions.push({ name: 'Kính bảo hộ chống tia UV', reason: 'Bảo vệ mắt khỏi tia cực tím', priority: day.uv_index_max >= 8 ? 5 : 4 });
    suggestions.push({ name: 'Áo bảo hộ lao động chống nắng', reason: 'Bảo vệ da khỏi UV', priority: 4 });
  }
  
  // Cold weather
  if (day.temperature_min <= 15) {
    suggestions.push({ name: 'Áo ấm', reason: 'Trời lạnh', priority: 5 });
    suggestions.push({ name: 'Găng tay', reason: 'Giữ ấm tay', priority: 4 });
    suggestions.push({ name: 'Mũ len', reason: 'Giữ ấm đầu', priority: 4 });
  }
  
  // Fog/low visibility
  if ([45, 48].includes(day.weathercode)) {
    suggestions.push({ name: 'Áo phản quang', reason: 'Tầm nhìn kém', priority: 5 });
    suggestions.push({ name: 'Đèn pin', reason: 'Tăng khả năng nhìn thấy', priority: 4 });
  }
  
  // Sort by priority (highest first)
  return suggestions.sort((a, b) => b.priority - a.priority);
};

const ForecastView: React.FC<ForecastViewProps> = ({ latitude, longitude }) => {
  const dispatch = useDispatch();
  const { forecast, forecastStatus, forecastError } = useSelector(
    (state: RootState) => state.weather
  );

  useEffect(() => {
    if (latitude != null && longitude != null) {
      dispatch(fetchForecast({ latitude, longitude }) as any);
    } else {
      dispatch(fetchForecast({}) as any);
    }
  }, [dispatch, latitude, longitude]);

  const getWeatherIcon = (weatherCode: number) => {
    // Nắng (0)
    if (weatherCode === 0) return <SunOutlined className={styles.sunIcon} />;
    
    // U ám (3) - mây xám
    if (weatherCode === 3) return <CloudOutlined className={styles.cloudyIcon} />;
    
    // Mưa (51-55, 61-67, 80-82) - mây với mưa
    if ([51, 53, 55, 61, 63, 65, 66, 67, 80, 81, 82].includes(weatherCode)) {
      return (
        <div className={styles.rainIconContainer}>
          <CloudOutlined className={styles.rainCloudIcon} />
          <div className={styles.rainDrops}>
            <span className={styles.rainDrop}></span>
            <span className={styles.rainDrop}></span>
            <span className={styles.rainDrop}></span>
          </div>
        </div>
      );
    }
    
    // Dông (95-99)
    if (weatherCode >= 95) return <ThunderboltOutlined className={styles.thunderIcon} />;
    
    // Các trường hợp khác - mây bình thường
    if (weatherCode <= 2) return <CloudOutlined className={styles.cloudIcon} />;
    
    // Mặc định
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
      61: 'Mưa nhẹ',
      63: 'Mưa vừa',
      65: 'Mưa nặng',
      80: 'Mưa rào nhẹ',
      81: 'Mưa rào vừa',
      82: 'Mưa rào nặng',
      95: 'Dông',
      96: 'Dông kèm mưa đá nhẹ',
      99: 'Dông kèm mưa đá nặng',
    };
    return descriptions[weatherCode] || 'Không xác định';
  };

  const getDayAlerts = (day: DailyForecast): string[] => {
    const alerts: string[] = [];
    if (day.windspeed_max >= 30) {
      alerts.push('Gió mạnh');
    }
    if (day.windgusts_max != null && day.windgusts_max >= 40) {
      alerts.push(`Gió giật mạnh (${Math.round(day.windgusts_max)} km/h)`);
    }
    if (day.precipitation_sum > 5) {
      alerts.push(`Mưa ${day.precipitation_sum.toFixed(1)}mm`);
    }
    if (day.temperature_max >= 35) {
      alerts.push('Nhiệt độ cao');
    }
    if (day.temperature_min <= 15) {
      alerts.push('Trời lạnh');
    }
    if (day.uv_index_max != null && day.uv_index_max >= 8) {
      alerts.push(`UV rất cao (${day.uv_index_max.toFixed(1)})`);
    }
    if ([61, 63, 65, 80, 81, 82, 95, 96, 99].includes(day.weathercode)) {
      alerts.push('Thời tiết xấu');
    }
    return alerts;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hôm nay';
    }
    if (date.toDateString() === tomorrow.toDateString()) {
      return 'Ngày mai';
    }

    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    return `${days[date.getDay()]}, ${date.getDate()}/${date.getMonth() + 1}`;
  };

  const formatTime = (timeString: string): string => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const getWindDirection = (degrees: number): string => {
    const directions = ['Bắc', 'Đông Bắc', 'Đông', 'Đông Nam', 'Nam', 'Tây Nam', 'Tây', 'Tây Bắc'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index] || 'Không xác định';
  };

  if (forecastStatus === 'loading') {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '40px 20px',
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(250, 250, 255, 0.95))',
        borderRadius: '16px',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)'
      }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>
          <Text type="secondary" style={{ fontSize: '14px' }}>Đang tải dự báo thời tiết...</Text>
        </div>
      </div>
    );
  }

  if (forecastStatus === 'failed' || !forecast) {
    return (
      <Alert
        message="Lỗi"
        description={forecastError || 'Không thể tải dự báo thời tiết'}
        type="error"
        showIcon
      />
    );
  }

  return (
    <div className={styles.forecastContainer}>
      <Title 
        level={4} 
        style={{ 
          marginBottom: '24px', 
          fontSize: '20px',
          fontWeight: 700,
          background: 'linear-gradient(135deg, #1890ff, #52c41a)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          letterSpacing: '0.5px'
        }}
      >
        Dự báo 7 ngày tới
      </Title>
      {forecast.stale && (
        <Alert
          message="Đang dùng dữ liệu cache"
          description="Dữ liệu có thể không cập nhật mới nhất"
          type="warning"
          showIcon
          style={{ marginBottom: '16px' }}
        />
      )}
      <Collapse
        ghost
        expandIconPosition="end"
        style={{ background: 'transparent' }}
        items={forecast.daily.map((day, index) => {
          const alerts = getDayAlerts(day);
          const ppeSuggestions = generatePPESuggestions(day);
          const isToday = index === 0;

          return {
            key: index.toString(),
            label: (
              <Card 
                size="small" 
                className={isToday ? styles.todayCard : styles.forecastCard} 
                style={{ marginBottom: '12px' }}
                bodyStyle={{ padding: '16px' }}
              >
                <Row gutter={[16, 10]} align="middle">
                  {/* Ngày tháng */}
                  <Col span={3}>
                    <Text className={styles.dateText}>{formatDate(day.date)}</Text>
                  </Col>
                  
                  {/* Icon và mô tả thời tiết */}
                  <Col span={3}>
                    <Space direction="vertical" size={2} align="center">
                      {getWeatherIcon(day.weathercode)}
                      <Text className={styles.weatherDescription}>
                        {getWeatherDescription(day.weathercode)}
                      </Text>
                    </Space>
                  </Col>
                  
                  {/* Nhiệt độ và gió */}
                  <Col span={5}>
                    <Space direction="vertical" size={4} style={{ width: '100%' }}>
                      <div>
                        <Text className={styles.temperatureText}>{Math.round(day.temperature_max)}°</Text>
                        <Text type="secondary" style={{ fontSize: '13px', marginLeft: '4px' }}> / {Math.round(day.temperature_min)}°</Text>
                      </div>
                      <div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          💨 {Math.round(day.windspeed_max)} km/h
                          {day.windgusts_max != null && day.windgusts_max > 30 && (
                            <Tag color="red" style={{ marginLeft: '6px', fontSize: '10px', padding: '2px 6px', height: '20px', lineHeight: '16px', borderRadius: '4px' }}>
                              Giật: {Math.round(day.windgusts_max)}
                            </Tag>
                          )}
                        </Text>
                      </div>
                      {day.apparent_temperature_max != null && (
                        <Text type="secondary" style={{ fontSize: '11px' }}>
                          Cảm nhận: {Math.round(day.apparent_temperature_max)}°
                        </Text>
                      )}
                    </Space>
                  </Col>
                  
                  {/* Tags - Mưa, UV, Cảnh báo, Gợi ý */}
                  <Col span={13}>
                    <Space wrap size={[6, 6]} style={{ width: '100%', justifyContent: 'flex-end' }}>
                      {day.precipitation_sum > 0 && (
                        <Tag color="blue" className={styles.uniformTag}>
                          💧 {day.precipitation_sum.toFixed(1)} mm
                        </Tag>
                      )}
                      
                      {day.uv_index_max != null && (
                        <UVIndexIndicator 
                          uvIndex={day.uv_index_max} 
                          size="small" 
                          showLabel={true}
                          className={styles.uniformTag}
                        />
                      )}
                      
                      {alerts.length > 0 ? (
                        <Tooltip title={alerts.join(', ')}>
                          <Tag 
                            color="red" 
                            icon={<WarningOutlined />} 
                            className={styles.uniformTag}
                          >
                            {alerts.length} cảnh báo
                          </Tag>
                        </Tooltip>
                      ) : (
                        <Tag color="green" className={styles.uniformTag}>
                          Bình thường
                        </Tag>
                      )}
                      
                      {ppeSuggestions.length > 0 && (
                        <Tooltip title={`${ppeSuggestions.length} gợi ý thiết bị bảo hộ`}>
                          <Tag 
                            color="orange" 
                            icon={<SafetyOutlined />} 
                            className={styles.uniformTag}
                          >
                            {ppeSuggestions.length} gợi ý
                          </Tag>
                        </Tooltip>
                      )}
                    </Space>
                  </Col>
                </Row>
              </Card>
            ),
            children: (
              <div className={styles.detailSection}>
                {/* Chi tiết thời tiết */}
                <div style={{ marginBottom: '20px' }}>
                  <Title level={5} style={{ marginBottom: '16px', fontSize: '16px', fontWeight: 600, color: '#1890ff' }}>
                    Chi tiết thời tiết
                  </Title>
                  <Row gutter={[16, 12]}>
                    <Col span={12}>
                      <Space direction="vertical" size={6} style={{ width: '100%' }}>
                        <div>
                          <Text type="secondary" style={{ fontSize: '12px' }}>Nhiệt độ:</Text>
                          <Text strong style={{ marginLeft: '8px' }}>
                            {Math.round(day.temperature_max)}° / {Math.round(day.temperature_min)}°
                          </Text>
                          {day.apparent_temperature_max != null && day.apparent_temperature_min != null && (
                            <div style={{ marginTop: '4px' }}>
                              <Text type="secondary" style={{ fontSize: '11px' }}>
                                Cảm nhận: {Math.round(day.apparent_temperature_max)}° / {Math.round(day.apparent_temperature_min)}°
                              </Text>
                            </div>
                          )}
                        </div>
                        <div>
                          <Text type="secondary" style={{ fontSize: '12px' }}>Gió:</Text>
                          <Text strong style={{ marginLeft: '8px' }}>
                            {Math.round(day.windspeed_max)} km/h
                          </Text>
                          {day.windgusts_max != null && (
                            <Tag color={day.windgusts_max >= 40 ? 'red' : 'orange'} style={{ marginLeft: '8px', fontSize: '11px', padding: '2px 6px' }}>
                              Giật: {Math.round(day.windgusts_max)} km/h
                            </Tag>
                          )}
                        </div>
                        {day.winddirection_dominant != null && (
                          <div>
                            <Text type="secondary" style={{ fontSize: '12px' }}>Hướng gió:</Text>
                            <Text style={{ marginLeft: '8px' }}>
                              {getWindDirection(day.winddirection_dominant)}
                            </Text>
                          </div>
                        )}
                      </Space>
                    </Col>
                    <Col span={12}>
                      <Space direction="vertical" size={6} style={{ width: '100%' }}>
                        {day.uv_index_max != null && (
                          <div>
                            <Text type="secondary" style={{ fontSize: '12px' }}>UV Index:</Text>
                            <div style={{ marginTop: '4px' }}>
                              <UVIndexIndicator uvIndex={day.uv_index_max} size="small" />
                            </div>
                          </div>
                        )}
                        {day.precipitation_sum > 0 && (
                          <div>
                            <Text type="secondary" style={{ fontSize: '12px' }}>Mưa:</Text>
                            <Text strong style={{ marginLeft: '8px' }}>
                              {day.precipitation_sum.toFixed(1)} mm
                            </Text>
                            {day.precipitation_hours != null && day.precipitation_hours > 0 && (
                              <Text type="secondary" style={{ fontSize: '11px', marginLeft: '8px' }}>
                                (trong {day.precipitation_hours} giờ)
                              </Text>
                            )}
                            {day.precipitation_probability_max != null && (
                              <div style={{ marginTop: '4px' }}>
                                <Text type="secondary" style={{ fontSize: '11px' }}>
                                  Xác suất: {day.precipitation_probability_max}%
                                </Text>
                              </div>
                            )}
                          </div>
                        )}
                        {day.sunrise && day.sunset && (
                          <div>
                            <Text type="secondary" style={{ fontSize: '12px' }}>Mặt trời:</Text>
                            <div style={{ marginTop: '4px' }}>
                              <Text style={{ fontSize: '11px' }}>
                                🌅 {formatTime(day.sunrise)} / 🌇 {formatTime(day.sunset)}
                              </Text>
                            </div>
                          </div>
                        )}
                      </Space>
                    </Col>
                  </Row>
                </div>

                {alerts.length > 0 && (
                  <Alert
                    type="warning"
                    message="Cảnh báo thời tiết"
                    description={
                      <Space direction="vertical" size={4}>
                        {alerts.map((alert, idx) => (
                          <Text key={idx}>• {alert}</Text>
                        ))}
                      </Space>
                    }
                    showIcon
                    style={{ marginBottom: '12px' }}
                  />
                )}
                {ppeSuggestions.length > 0 ? (
                  <div>
                    <Title level={5} style={{ marginBottom: '12px', fontSize: '16px', fontWeight: 600, color: '#fa8c16' }}>
                      <SafetyOutlined style={{ marginRight: '8px' }} /> Gợi ý thiết bị bảo hộ
                    </Title>
                    <List
                      size="small"
                      dataSource={ppeSuggestions}
                      renderItem={(suggestion) => (
                        <List.Item 
                          style={{ 
                            padding: '10px 0',
                            borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                            transition: 'background 0.2s ease'
                          }}
                          className={styles.ppeItem}
                        >
                          <Space>
                            <Tag 
                              color={suggestion.priority >= 5 ? 'red' : suggestion.priority >= 4 ? 'orange' : 'blue'}
                              style={{ 
                                fontSize: '11px', 
                                padding: '2px 8px', 
                                borderRadius: '4px',
                                fontWeight: 500
                              }}
                            >
                              Ưu tiên {suggestion.priority}
                            </Tag>
                            <Text strong style={{ fontSize: '13px' }}>{suggestion.name}</Text>
                            <Text type="secondary" style={{ fontSize: '12px' }}>- {suggestion.reason}</Text>
                          </Space>
                        </List.Item>
                      )}
                    />
                  </div>
                ) : (
                  <Alert
                    message="Thời tiết thuận lợi"
                    description="Không có gợi ý đặc biệt về thiết bị bảo hộ cho ngày này."
                    type="success"
                    showIcon
                    style={{ borderRadius: '8px' }}
                  />
                )}
              </div>
            ),
          };
        })}
      />
    </div>
  );
};

export default ForecastView;

