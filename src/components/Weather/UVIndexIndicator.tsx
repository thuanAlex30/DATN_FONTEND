import React from 'react';
import { Tag, Tooltip, Typography } from 'antd';
import { SunOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface UVIndexIndicatorProps {
  uvIndex: number | null | undefined;
  size?: 'small' | 'default';
  showLabel?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const UVIndexIndicator: React.FC<UVIndexIndicatorProps> = ({
  uvIndex,
  size = 'default',
  showLabel = true,
  className,
  style,
}) => {
  if (uvIndex === null || uvIndex === undefined) {
    return (
      <Tag color="default" icon={<SunOutlined />} className={className} style={style}>
        UV: N/A
      </Tag>
    );
  }

  const getUVInfo = (uv: number) => {
    if (uv <= 2) {
      return {
        level: 'Thấp',
        color: 'success',
        description: 'An toàn. Có thể ở ngoài trời mà không cần bảo vệ.',
        risk: 'Thấp',
      };
    } else if (uv <= 5) {
      return {
        level: 'Trung bình',
        color: 'processing',
        description: 'Nên thoa kem chống nắng và đội mũ nón.',
        risk: 'Trung bình',
      };
    } else if (uv <= 7) {
      return {
        level: 'Cao',
        color: 'warning',
        description: 'Cần thoa kem chống nắng, đội mũ nón, đeo kính râm.',
        risk: 'Cao',
      };
    } else if (uv <= 10) {
      return {
        level: 'Rất cao',
        color: 'error',
        description: 'Tránh ở ngoài trời vào giờ cao điểm (11h-14h). Bắt buộc bảo vệ da.',
        risk: 'Rất cao',
      };
    } else {
      return {
        level: 'Cực kỳ cao',
        color: 'magenta',
        description: 'Nguy hiểm! Tránh hoàn toàn ánh nắng mặt trời. Bảo vệ da tối đa.',
        risk: 'Cực kỳ cao',
      };
    }
  };

  const uvInfo = getUVInfo(uvIndex);
  const uvRounded = Math.round(uvIndex * 10) / 10;

  const tagStyle = {
    fontSize: size === 'small' ? '11px' : '14px',
    ...style,
  };

  const tag = (
    <Tag 
      color={uvInfo.color} 
      icon={<SunOutlined />}
      className={className}
      style={tagStyle}
    >
      UV: {uvRounded} ({uvInfo.level})
    </Tag>
  );

  if (!showLabel) {
    return tag;
  }

  return (
    <Tooltip
      title={
        <div>
          <div><strong>Chỉ số UV: {uvRounded}</strong></div>
          <div>Mức độ: {uvInfo.level}</div>
          <div>Nguy cơ: {uvInfo.risk}</div>
          <div style={{ marginTop: '8px' }}>{uvInfo.description}</div>
        </div>
      }
    >
      {tag}
    </Tooltip>
  );
};

export default UVIndexIndicator;

