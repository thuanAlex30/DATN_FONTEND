import React from 'react';
import { useSelector } from 'react-redux';
import { Card, Typography, Tag } from 'antd';
import type { RootState } from '../store';

const { Title, Text } = Typography;

const DebugUserInfo: React.FC = () => {
  const { user, isAuthenticated, token } = useSelector((state: RootState) => state.auth);

  return (
    <Card 
      title="🔍 Debug User Info" 
      style={{ 
        position: 'fixed', 
        top: 20, 
        right: 20, 
        zIndex: 9999,
        maxWidth: 300,
        background: 'rgba(255, 255, 255, 0.95)'
      }}
    >
      <div style={{ fontSize: '12px' }}>
        <div><strong>Authenticated:</strong> {isAuthenticated ? '✅' : '❌'}</div>
        <div><strong>Token:</strong> {token ? '✅' : '❌'}</div>
        <div><strong>User ID:</strong> {user?.id || 'N/A'}</div>
        <div><strong>Username:</strong> {user?.username || 'N/A'}</div>
        <div><strong>Full Name:</strong> {user?.full_name || 'N/A'}</div>
        <div><strong>Role:</strong> 
          {user?.role?.role_name ? (
            <Tag color="blue" style={{ marginLeft: 4 }}>
              {user.role.role_name}
            </Tag>
          ) : (
            <Tag color="red" style={{ marginLeft: 4 }}>N/A</Tag>
          )}
        </div>
        <div><strong>Active:</strong> {user?.is_active ? '✅' : '❌'}</div>
        <div><strong>Department:</strong> {user?.department?.department_name || 'N/A'}</div>
        <div><strong>Position:</strong> {user?.position?.position_name || 'N/A'}</div>
      </div>
    </Card>
  );
};

export default DebugUserInfo;
