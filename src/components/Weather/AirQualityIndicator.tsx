import React from 'react';
import { Tag, Tooltip, Typography, Space } from 'antd';
import { CloudOutlined, WarningOutlined } from '@ant-design/icons';
import type { AirQualityCurrent } from '../../types/weather';

const { Text } = Typography;

interface AirQualityIndicatorProps {
  airQuality: AirQualityCurrent | null | undefined;
  size?: 'small' | 'default';
  showDetails?: boolean;
}

const AirQualityIndicator: React.FC<AirQualityIndicatorProps> = ({
  airQuality,
  size = 'default',
  showDetails = true,
}) => {
  if (!airQuality) {
    return (
      <Tag color="default" icon={<CloudOutlined />}>
        AQI: N/A
      </Tag>
    );
  }

  // Use US AQI if available, fallback to European AQI
  const aqi = airQuality.us_aqi ?? airQuality.european_aqi;
  const pm25 = airQuality.pm2_5;
  const pm10 = airQuality.pm10;

  const getAQIInfo = (aqiValue: number | null) => {
    if (aqiValue === null) {
      return {
        level: 'Không xác định',
        color: 'default',
        description: 'Không có dữ liệu chất lượng không khí',
        healthAdvice: '',
      };
    }

    if (aqiValue <= 50) {
      return {
        level: 'Tốt',
        color: 'success',
        description: 'Chất lượng không khí tốt, phù hợp cho mọi người.',
        healthAdvice: 'Có thể hoạt động ngoài trời bình thường.',
      };
    } else if (aqiValue <= 100) {
      return {
        level: 'Trung bình',
        color: 'processing',
        description: 'Chất lượng không khí chấp nhận được. Một số nhóm nhạy cảm có thể bị ảnh hưởng nhẹ.',
        healthAdvice: 'Nhóm nhạy cảm nên hạn chế hoạt động ngoài trời.',
      };
    } else if (aqiValue <= 150) {
      return {
        level: 'Không tốt cho nhóm nhạy cảm',
        color: 'warning',
        description: 'Nhóm nhạy cảm có thể gặp vấn đề về hô hấp.',
        healthAdvice: 'Nhóm nhạy cảm nên tránh hoạt động ngoài trời. Người khác nên hạn chế.',
      };
    } else if (aqiValue <= 200) {
      return {
        level: 'Không tốt',
        color: 'error',
        description: 'Mọi người có thể bị ảnh hưởng. Nhóm nhạy cảm bị ảnh hưởng nghiêm trọng hơn.',
        healthAdvice: 'Tất cả mọi người nên hạn chế hoạt động ngoài trời. Nhóm nhạy cảm nên ở trong nhà.',
      };
    } else if (aqiValue <= 300) {
      return {
        level: 'Rất không tốt',
        color: 'magenta',
        description: 'Cảnh báo sức khỏe: Mọi người có thể gặp vấn đề về sức khỏe.',
        healthAdvice: 'Tránh hoạt động ngoài trời. Đeo khẩu trang N95 nếu bắt buộc phải ra ngoài.',
      };
    } else {
      return {
        level: 'Nguy hiểm',
        color: 'red',
        description: 'Cảnh báo khẩn cấp: Toàn bộ dân số có thể bị ảnh hưởng.',
        healthAdvice: 'Ở trong nhà. Đeo khẩu trang N95 và kính bảo hộ nếu bắt buộc phải ra ngoài.',
      };
    }
  };

  const aqiInfo = getAQIInfo(aqi);

  const tooltipContent = (
    <div>
      <div><strong>Chỉ số AQI: {aqi ?? 'N/A'}</strong></div>
      <div>Mức độ: {aqiInfo.level}</div>
      {pm25 != null && <div>PM2.5: {pm25.toFixed(1)} µg/m³</div>}
      {pm10 != null && <div>PM10: {pm10.toFixed(1)} µg/m³</div>}
      <div style={{ marginTop: '8px' }}>{aqiInfo.description}</div>
      {aqiInfo.healthAdvice && (
        <div style={{ marginTop: '8px', color: '#ff4d4f' }}>
          <WarningOutlined /> {aqiInfo.healthAdvice}
        </div>
      )}
    </div>
  );

  const tag = (
    <Tag 
      color={aqiInfo.color} 
      icon={<CloudOutlined />}
      style={{ fontSize: size === 'small' ? '12px' : '14px' }}
    >
      AQI: {aqi ?? 'N/A'} ({aqiInfo.level})
      {pm25 != null && pm25 > 35 && <WarningOutlined style={{ marginLeft: '4px' }} />}
    </Tag>
  );

  if (!showDetails) {
    return tag;
  }

  return (
    <Tooltip title={tooltipContent}>
      <Space>
        {tag}
        {pm25 != null && (
          <Text type="secondary" style={{ fontSize: size === 'small' ? '11px' : '12px' }}>
            PM2.5: {pm25.toFixed(1)}
          </Text>
        )}
        {pm10 != null && (
          <Text type="secondary" style={{ fontSize: size === 'small' ? '11px' : '12px' }}>
            PM10: {pm10.toFixed(1)}
          </Text>
        )}
      </Space>
    </Tooltip>
  );
};

export default AirQualityIndicator;

