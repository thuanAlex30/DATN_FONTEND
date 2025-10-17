import React from 'react';
import { Card, Space, Typography, Button, Alert } from 'antd';
import { BugOutlined, ReloadOutlined } from '@ant-design/icons';
import * as ppeService from '../../../../services/ppeService';
import userService from '../../../../services/userService';

const { Text, Title } = Typography;

interface PPEDebugPanelProps {
  onDataLoaded?: (data: any) => void;
}

const PPEDebugPanel: React.FC<PPEDebugPanelProps> = ({ onDataLoaded }) => {
  const [debugData, setDebugData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);

  const testAPIs = async () => {
    setLoading(true);
    try {
      // Test both APIs
      const [ppeUsers, userServiceUsers] = await Promise.allSettled([
        ppeService.getAllUsers(),
        userService.getAllUsers()
      ]);

      const result: any = {
        ppeService: {
          success: ppeUsers.status === 'fulfilled',
          data: ppeUsers.status === 'fulfilled' ? ppeUsers.value : null,
          error: ppeUsers.status === 'rejected' ? ppeUsers.reason : null,
          count: ppeUsers.status === 'fulfilled' ? ppeUsers.value.length : 0
        },
        userService: {
          success: userServiceUsers.status === 'fulfilled',
          data: userServiceUsers.status === 'fulfilled' ? userServiceUsers.value : null,
          error: userServiceUsers.status === 'rejected' ? userServiceUsers.reason : null,
          count: userServiceUsers.status === 'fulfilled' ? userServiceUsers.value.length : 0
        }
      };

      // Filter employees from both sources
      const ppeEmployees = result.ppeService.success ? 
        result.ppeService.data.filter((user: any) => {
          const roleName = user.role?.role_name || user.role?.name || user.role;
          return roleName === 'employee';
        }) : [];

      const userServiceEmployees = result.userService.success ? 
        result.userService.data.filter((user: any) => {
          const roleName = user.role?.role_name || user.role?.name || user.role;
          return roleName === 'employee';
        }) : [];

      result.ppeEmployees = ppeEmployees;
      result.userServiceEmployees = userServiceEmployees;

      setDebugData(result);
      onDataLoaded?.(result);
    } catch (error) {
      console.error('Debug test failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card 
      title={
        <Space>
          <BugOutlined />
          <span>PPE Debug Panel</span>
        </Space>
      }
      extra={
        <Button 
          icon={<ReloadOutlined />} 
          onClick={testAPIs}
          loading={loading}
          size="small"
        >
          Test APIs
        </Button>
      }
      size="small"
      style={{ marginBottom: 16 }}
    >
      {debugData ? (
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Title level={5}>API Test Results</Title>
            
            <div style={{ marginBottom: 8 }}>
              <Text strong>PPE Service:</Text> 
              <Text type={debugData.ppeService.success ? 'success' : 'danger'}>
                {debugData.ppeService.success ? '✅ Success' : '❌ Failed'}
              </Text>
              <Text type="secondary"> ({debugData.ppeService.count} users, {debugData.ppeEmployees.length} employees)</Text>
            </div>

            <div style={{ marginBottom: 8 }}>
              <Text strong>User Service:</Text> 
              <Text type={debugData.userService.success ? 'success' : 'danger'}>
                {debugData.userService.success ? '✅ Success' : '❌ Failed'}
              </Text>
              <Text type="secondary"> ({debugData.userService.count} users, {debugData.userServiceEmployees.length} employees)</Text>
            </div>

            {debugData.ppeService.error && (
              <Alert
                message="PPE Service Error"
                description={debugData.ppeService.error.message || 'Unknown error'}
                type="error"
                style={{ marginBottom: 8 }}
              />
            )}

            {debugData.userService.error && (
              <Alert
                message="User Service Error"
                description={debugData.userService.error.message || 'Unknown error'}
                type="error"
                style={{ marginBottom: 8 }}
              />
            )}

            {debugData.ppeEmployees.length > 0 && (
              <div>
                <Text strong>Sample PPE Employee:</Text>
                <pre style={{ fontSize: '10px', background: '#f5f5f5', padding: '4px', margin: '4px 0' }}>
                  {JSON.stringify(debugData.ppeEmployees[0], null, 2)}
                </pre>
              </div>
            )}

            {debugData.userServiceEmployees.length > 0 && (
              <div>
                <Text strong>Sample User Service Employee:</Text>
                <pre style={{ fontSize: '10px', background: '#f5f5f5', padding: '4px', margin: '4px 0' }}>
                  {JSON.stringify(debugData.userServiceEmployees[0], null, 2)}
                </pre>
              </div>
            )}
          </div>
        </Space>
      ) : (
        <Text type="secondary">Click "Test APIs" to debug the issue</Text>
      )}
    </Card>
  );
};

export default PPEDebugPanel;
