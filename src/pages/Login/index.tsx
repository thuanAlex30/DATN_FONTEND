import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '../../store';
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Typography, 
  Alert, 
  Space,
  Layout
} from 'antd';
import { UserOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons';
import { login } from '../../store/slices/authSlice';
import type { RootState } from '../../store';
import type { LoginRequest } from '../../types/auth';
import { useSafeNavigate } from '../../hooks/useSafeNavigate';

const { Content } = Layout;
const { Title, Text } = Typography;

const LoginPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const safeNavigate = useSafeNavigate();
  const { loading, error } = useSelector((state: RootState) => state.auth);
  const [form] = Form.useForm();

  const handleSubmit = async (values: LoginRequest) => {
    try {
      const resultAction = await dispatch(login(values));
      
      if (login.fulfilled.match(resultAction)) {
        const user = resultAction.payload.user;
        
        // Check if user is admin
        if (user.role?.role_name === 'admin') {
          safeNavigate('/admin/dashboard', { replace: true });
        } else {
          // Handle non-admin users (redirect to appropriate page)
          safeNavigate('/home', { replace: true });
        }
      } else if (login.rejected.match(resultAction)) {
        // Error is already handled by the slice
        console.error('Login failed:', resultAction.payload);
      }
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Content style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        padding: '20px'
      }}>
        <Card 
          style={{ 
            width: '100%', 
            maxWidth: 400,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            borderRadius: '12px'
          }}
        >
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* Header */}
            <div style={{ textAlign: 'center' }}>
              <SafetyOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
              <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
                Hệ Thống Quản Lý An Toàn
              </Title>
              <Text type="secondary" style={{ fontSize: '16px' }}>
                Đăng nhập quản trị viên
              </Text>
            </div>

            {/* Form */}
            <Form
              form={form}
              name="login"
              onFinish={handleSubmit}
              layout="vertical"
              size="large"
            >
              <Form.Item
                name="username"
                label="Tên đăng nhập"
                rules={[
                  { required: true, message: 'Vui lòng nhập tên đăng nhập!' }
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Nhập tên đăng nhập"
                  autoComplete="username"
                />
              </Form.Item>

              <Form.Item
                name="password"
                label="Mật khẩu"
                rules={[
                  { required: true, message: 'Vui lòng nhập mật khẩu!' }
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Nhập mật khẩu"
                  autoComplete="current-password"
                />
              </Form.Item>

              {error && (
                <Alert
                  message={typeof error === 'string' ? error : 'Đăng nhập thất bại, vui lòng kiểm tra tên đăng nhập và mật khẩu'}
                  type="error"
                  showIcon
                  style={{ marginBottom: '16px' }}
                />
              )}

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  size="large"
                >
                  {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </Button>
              </Form.Item>
            </Form>

            {/* Footer */}
            <div style={{ textAlign: 'center' }}>
              <Text type="secondary" style={{ fontSize: '14px' }}>
                Nếu có vấn đề, vui lòng liên hệ quản trị viên hệ thống
              </Text>
            </div>
          </Space>
        </Card>
      </Content>
    </Layout>
  );
};

export default LoginPage;
