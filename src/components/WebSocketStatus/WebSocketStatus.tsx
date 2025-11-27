import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { Badge } from 'antd';
import { 
  WifiOutlined, 
  DisconnectOutlined, 
  ExclamationCircleOutlined 
} from '@ant-design/icons';

const WebSocketStatus: React.FC = () => {
  const { isConnected, connectionError } = useSelector((state: RootState) => state.websocket);

  const getStatusColor = () => {
    if (connectionError) return 'red';
    if (isConnected) return 'green';
    return 'orange';
  };

  const getStatusIcon = () => {
    if (connectionError) return <ExclamationCircleOutlined />;
    if (isConnected) return <WifiOutlined />;
    return <DisconnectOutlined />;
  };

  const getStatusText = () => {
    if (connectionError) return 'Lỗi kết nối';
    if (isConnected) return 'Đã kết nối';
    return 'Đang kết nối...';
  };

  const getTooltipTitle = () => {
    if (connectionError) return `Lỗi: ${connectionError}`;
    if (isConnected) return 'Kết nối real-time hoạt động bình thường';
    return 'Đang thiết lập kết nối real-time...';
  };

  return (
    <div 
      title={getTooltipTitle()}
      style={{ cursor: 'help' }}
    >
      <Badge 
        status={getStatusColor() as any}
        text={
          <span style={{ 
            fontSize: '12px', 
            color: getStatusColor() === 'green' ? '#52c41a' : 
                   getStatusColor() === 'red' ? '#ff4d4f' : '#faad14'
          }}>
            {getStatusIcon()} {getStatusText()}
          </span>
        }
      />
    </div>
  );
};

export default WebSocketStatus;
