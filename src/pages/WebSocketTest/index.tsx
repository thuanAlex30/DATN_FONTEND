import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Space, Typography, Alert, Badge, List, Tag } from 'antd';
import { SendOutlined, ClearOutlined, WifiOutlined, DisconnectOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import websocketClient from '../../services/websocketClient';
import { ENV } from '../../config/env';
import { toast } from 'react-toastify';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface TestMessage {
  id: string;
  timestamp: string;
  type: 'sent' | 'received';
  event: string;
  data: any;
}

const WebSocketTest: React.FC = () => {
  const { isConnected, connectionError } = useSelector((state: RootState) => state.websocket);
  const { token } = useSelector((state: RootState) => state.auth);
  
  const [messages, setMessages] = useState<TestMessage[]>([]);
  const [testTitle, setTestTitle] = useState('Test Notification');
  const [testMessage, setTestMessage] = useState('This is a test message');
  const [testType, setTestType] = useState('info');
  const [testCategory, setTestCategory] = useState('general');
  const [testPriority, setTestPriority] = useState('medium');

  useEffect(() => {
    // Listen for test events
    const handleTestNotification = (data: any) => {
      const newMessage: TestMessage = {
        id: `received_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'received',
        event: 'notification_created',
        data: data
      };
      setMessages(prev => [...prev, newMessage]);
      toast.success('Test notification received!');
    };

    const handleConnectionStatus = (data: any) => {
      const newMessage: TestMessage = {
        id: `status_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'received',
        event: 'connection_status',
        data: data
      };
      setMessages(prev => [...prev, newMessage]);
    };

    const handleConnectionError = (data: any) => {
      const newMessage: TestMessage = {
        id: `error_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'received',
        event: 'connection_error',
        data: data
      };
      setMessages(prev => [...prev, newMessage]);
    };

    // Register event listeners
    websocketClient.on('notification_created', handleTestNotification);
    websocketClient.on('connection_status', handleConnectionStatus);
    websocketClient.on('connection_error', handleConnectionError);

    return () => {
      websocketClient.off('notification_created', handleTestNotification);
      websocketClient.off('connection_status', handleConnectionStatus);
      websocketClient.off('connection_error', handleConnectionError);
    };
  }, []);

  const sendTestNotification = () => {
    if (!isConnected) {
      toast.error('WebSocket not connected');
      return;
    }

    const testData = {
      title: testTitle,
      message: testMessage,
      type: testType,
      category: testCategory,
      priority: testPriority
    };

    // Add sent message to list
    const sentMessage: TestMessage = {
      id: `sent_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'sent',
      event: 'test_notification',
      data: testData
    };
    setMessages(prev => [...prev, sentMessage]);

    // Send test notification
    websocketClient.emit('test_notification', testData);
    toast.info('Test notification sent!');
  };

  const clearMessages = () => {
    setMessages([]);
    toast.info('Messages cleared');
  };

  const reconnectWebSocket = () => {
    if (token) {
      websocketClient.connect(ENV.WS_BASE_URL, token);
      toast.info('Attempting to reconnect...');
    } else {
      toast.error('No authentication token available');
    }
  };

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'sent': return 'blue';
      case 'received': return 'green';
      default: return 'default';
    }
  };

  const getEventTypeColor = (event: string) => {
    switch (event) {
      case 'test_notification': return 'orange';
      case 'notification_created': return 'green';
      case 'connection_status': return 'blue';
      case 'connection_error': return 'red';
      default: return 'default';
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Title level={2}>🔌 WebSocket Test Page</Title>
      
      {/* Connection Status */}
      <Card style={{ marginBottom: '24px' }}>
        <Title level={4}>Connection Status</Title>
        <Space size="large">
          <Badge 
            status={isConnected ? 'success' : 'error'} 
            text={
              <Space>
                {isConnected ? <WifiOutlined /> : <DisconnectOutlined />}
                <Text strong={isConnected}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </Text>
              </Space>
            }
          />
          {connectionError && (
            <Alert 
              message="Connection Error" 
              description={connectionError} 
              type="error" 
              showIcon 
            />
          )}
          {!isConnected && (
            <Button 
              type="primary" 
              onClick={reconnectWebSocket}
              icon={<WifiOutlined />}
            >
              Reconnect
            </Button>
          )}
        </Space>
      </Card>

      {/* Test Controls */}
      <Card style={{ marginBottom: '24px' }}>
        <Title level={4}>Test Controls</Title>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Space wrap>
            <Input
              placeholder="Notification Title"
              value={testTitle}
              onChange={(e) => setTestTitle(e.target.value)}
              style={{ width: '200px' }}
            />
            <Input
              placeholder="Type (info, warning, error)"
              value={testType}
              onChange={(e) => setTestType(e.target.value)}
              style={{ width: '150px' }}
            />
            <Input
              placeholder="Category"
              value={testCategory}
              onChange={(e) => setTestCategory(e.target.value)}
              style={{ width: '150px' }}
            />
            <Input
              placeholder="Priority (low, medium, high)"
              value={testPriority}
              onChange={(e) => setTestPriority(e.target.value)}
              style={{ width: '150px' }}
            />
          </Space>
          <TextArea
            placeholder="Test Message"
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            rows={3}
          />
          <Space>
            <Button 
              type="primary" 
              icon={<SendOutlined />}
              onClick={sendTestNotification}
              disabled={!isConnected}
            >
              Send Test Notification
            </Button>
            <Button 
              icon={<ClearOutlined />}
              onClick={clearMessages}
            >
              Clear Messages
            </Button>
          </Space>
        </Space>
      </Card>

      {/* Message Log */}
      <Card>
        <Title level={4}>Message Log ({messages.length})</Title>
        {messages.length === 0 ? (
          <Text type="secondary">No messages yet. Send a test notification to see messages here.</Text>
        ) : (
          <List
            dataSource={messages}
            renderItem={(message) => (
              <List.Item>
                <Card size="small" style={{ width: '100%' }}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Space>
                      <Tag color={getMessageTypeColor(message.type)}>
                        {message.type.toUpperCase()}
                      </Tag>
                      <Tag color={getEventTypeColor(message.event)}>
                        {message.event}
                      </Tag>
                      <Text type="secondary">{message.timestamp}</Text>
                    </Space>
                    <Text code style={{ fontSize: '12px', wordBreak: 'break-all' }}>
                      {JSON.stringify(message.data, null, 2)}
                    </Text>
                  </Space>
                </Card>
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
};

export default WebSocketTest;
