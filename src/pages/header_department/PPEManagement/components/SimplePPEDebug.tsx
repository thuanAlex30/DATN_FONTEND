import React, { useState } from 'react';
import { Card, Button, Space, Typography, Alert } from 'antd';
import { BugOutlined, ReloadOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface SimplePPEDebugProps {
  onTestComplete?: (result: any) => void;
}

const SimplePPEDebug: React.FC<SimplePPEDebugProps> = ({ onTestComplete }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testAPIs = async () => {
    setLoading(true);
    try {
      // Test both APIs
      const [ppeUsers, userServiceUsers] = await Promise.allSettled([
        fetch('/api/ppe/users', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }).then(res => res.json()),
        fetch('/api/users/all', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }).then(res => res.json())
      ]);

      const testResult = {
        ppeService: {
          success: ppeUsers.status === 'fulfilled',
          data: ppeUsers.status === 'fulfilled' ? ppeUsers.value : null,
          error: ppeUsers.status === 'rejected' ? ppeUsers.reason : null,
          count: ppeUsers.status === 'fulfilled' ? (ppeUsers.value.data?.length || 0) : 0
        },
        userService: {
          success: userServiceUsers.status === 'fulfilled',
          data: userServiceUsers.status === 'fulfilled' ? userServiceUsers.value : null,
          error: userServiceUsers.status === 'rejected' ? userServiceUsers.reason : null,
          count: userServiceUsers.status === 'fulfilled' ? (userServiceUsers.value.data?.length || 0) : 0
        }
      };

      setResult(testResult);
      onTestComplete?.(testResult);
    } catch (error) {
      console.error('Debug test failed:', error);
      setResult({ error: error });
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
      {result ? (
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text strong>PPE Service:</Text> 
            <Text type={result.ppeService?.success ? 'success' : 'danger'}>
              {result.ppeService?.success ? '✅ Success' : '❌ Failed'}
            </Text>
            <Text type="secondary"> ({result.ppeService?.count || 0} users)</Text>
          </div>

          <div>
            <Text strong>User Service:</Text> 
            <Text type={result.userService?.success ? 'success' : 'danger'}>
              {result.userService?.success ? '✅ Success' : '❌ Failed'}
            </Text>
            <Text type="secondary"> ({result.userService?.count || 0} users)</Text>
          </div>

          {result.ppeService?.error && (
            <Alert
              message="PPE Service Error"
              description={result.ppeService.error.message || 'Unknown error'}
              type="error"
              style={{ marginBottom: 8 }}
            />
          )}

          {result.userService?.error && (
            <Alert
              message="User Service Error"
              description={result.userService.error.message || 'Unknown error'}
              type="error"
              style={{ marginBottom: 8 }}
            />
          )}

          {result.error && (
            <Alert
              message="Test Error"
              description={result.error.message || 'Unknown error'}
              type="error"
              style={{ marginBottom: 8 }}
            />
          )}
        </Space>
      ) : (
        <Text type="secondary">Click "Test APIs" to debug the issue</Text>
      )}
    </Card>
  );
};

export default SimplePPEDebug;
