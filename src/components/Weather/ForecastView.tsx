import React, { useEffect, useState } from 'react';
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
import { fetchEquipmentSuggestions } from '../../store/slices/weatherSlice';
import type { RootState } from '../../store';
import type { DailyForecast } from '../../types/weather';
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
    suggestions.push({ name: 'Mũ nón', reason: 'Nắng nóng', priority: 4 });
    suggestions.push({ name: 'Kính mắt', reason: 'Chống nắng', priority: 3 });
    suggestions.push({ name: 'Áo chống nắng', reason: 'Bảo vệ da', priority: 4 });
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
  const { suggestions } = useSelector((state: RootState) => state.weather);

  useEffect(() => {
    if (latitude != null && longitude != null) {
      dispatch(fetchForecast({ latitude, longitude }) as any);
    } else {
      dispatch(fetchForecast({}) as any);
    }
  }, [dispatch, latitude, longitude]);

  const getWeatherIcon = (weatherCode: number) => {
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
    if (day.precipitation_sum > 5) {
      alerts.push(`Mưa ${day.precipitation_sum.toFixed(1)}mm`);
    }
    if (day.temperature_max >= 35) {
      alerts.push('Nhiệt độ cao');
    }
    if (day.temperature_min <= 15) {
      alerts.push('Trời lạnh');
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

  if (forecastStatus === 'loading') {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <Spin />
        <div style={{ marginTop: '10px' }}>
          <Text type="secondary">Đang tải dự báo thời tiết...</Text>
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
      <Title level={5} style={{ marginBottom: '16px' }}>
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
        items={forecast.daily.map((day, index) => {
          const alerts = getDayAlerts(day);
          const ppeSuggestions = generatePPESuggestions(day);
          const isToday = index === 0;

          return {
            key: index.toString(),
            label: (
              <Card size="small" className={isToday ? styles.todayCard : ''} style={{ marginBottom: '8px' }}>
                <Row gutter={[12, 8]} align="middle">
                  <Col span={4}>
                    <Text strong>{formatDate(day.date)}</Text>
                  </Col>
                  <Col span={4}>
                    <Space direction="vertical" size={0} align="center">
                      {getWeatherIcon(day.weathercode)}
                      <Text type="secondary" style={{ fontSize: '11px' }}>
                        {getWeatherDescription(day.weathercode)}
                      </Text>
                    </Space>
                  </Col>
                  <Col span={4}>
                    <Space direction="vertical" size={0}>
                      <Text>
                        <Text strong>{Math.round(day.temperature_max)}°</Text>
                        <Text type="secondary"> / {Math.round(day.temperature_min)}°</Text>
                      </Text>
                      <Text type="secondary" style={{ fontSize: '11px' }}>
                        Gió: {Math.round(day.windspeed_max)} km/h
                      </Text>
                    </Space>
                  </Col>
                  <Col span={3}>
                    {day.precipitation_sum > 0 ? (
                      <Tag color="blue">
                        {day.precipitation_sum.toFixed(1)} mm
                      </Tag>
                    ) : (
                      <Text type="secondary" style={{ fontSize: '11px' }}>Không mưa</Text>
                    )}
                  </Col>
                  <Col span={4} style={{ minWidth: '90px' }}>
                    {alerts.length > 0 ? (
                      <Tooltip title={alerts.join(', ')}>
                        <Tag color="red" icon={<WarningOutlined />} style={{ whiteSpace: 'nowrap', fontSize: '12px', padding: '2px 8px' }}>
                          {alerts.length} cảnh báo
                        </Tag>
                      </Tooltip>
                    ) : (
                      <Tag color="green" style={{ whiteSpace: 'nowrap', fontSize: '12px' }}>Bình thường</Tag>
                    )}
                  </Col>
                  <Col span={3} style={{ minWidth: '75px' }}>
                    {ppeSuggestions.length > 0 ? (
                      <Tooltip title={`${ppeSuggestions.length} gợi ý thiết bị bảo hộ`}>
                        <Tag color="orange" icon={<SafetyOutlined />} style={{ whiteSpace: 'nowrap', fontSize: '12px', padding: '2px 8px' }}>
                          {ppeSuggestions.length} gợi ý
                        </Tag>
                      </Tooltip>
                    ) : null}
                  </Col>
                </Row>
              </Card>
            ),
            children: (
              <div style={{ padding: '12px', background: '#fafafa', borderRadius: '4px' }}>
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
                    <Title level={5} style={{ marginBottom: '8px' }}>
                      <SafetyOutlined /> Gợi ý thiết bị bảo hộ
                    </Title>
                    <List
                      size="small"
                      dataSource={ppeSuggestions}
                      renderItem={(suggestion) => (
                        <List.Item>
                          <Space>
                            <Tag color={suggestion.priority >= 5 ? 'red' : suggestion.priority >= 4 ? 'orange' : 'blue'}>
                              Ưu tiên {suggestion.priority}
                            </Tag>
                            <Text strong>{suggestion.name}</Text>
                            <Text type="secondary">- {suggestion.reason}</Text>
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

