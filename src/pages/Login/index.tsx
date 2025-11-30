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
import { UserOutlined, LockOutlined, SafetyOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { login } from '../../store/slices/authSlice';
import type { RootState } from '../../store';
import type { LoginRequest } from '../../types/auth';
import { useSafeNavigate } from '../../hooks/useSafeNavigate';
import styles from './Login.module.css';

const { Content } = Layout;
const { Title, Text } = Typography;

const LoginPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const safeNavigate = useSafeNavigate();
  const { loading, error } = useSelector((state: RootState) => state.auth);
  const [form] = Form.useForm();

  const handleSubmit = async (values: LoginRequest) => {
    try {
      console.log('🚀 Starting login process...');
      const resultAction = await dispatch(login(values));
      console.log('🔍 Login result action:', resultAction);
      
      if (login.fulfilled.match(resultAction)) {
        const user = resultAction.payload.user;
        console.log('✅ Login successful, user:', user);
        console.log('🔍 User role:', user.role?.role_name);
        
        // Small delay to ensure state is updated before redirect
        setTimeout(() => {
          // Check user role and redirect accordingly
          if (user.role?.role_name === 'admin') {
            console.log('🔀 Redirecting to admin dashboard...');
            safeNavigate('/admin/dashboard', { replace: true });
          } else if (user.role?.role_name === 'manager') {
            console.log('🔀 Redirecting to manager dashboard...');
            safeNavigate('/manager/dashboard', { replace: true });
          } else if (user.role?.role_name === 'employee') {
            console.log('🔀 Redirecting to employee dashboard...');
            safeNavigate('/employee/dashboard', { replace: true });
          } else {
            console.log('🔀 Redirecting to home page...');
            // Fallback for other roles
            safeNavigate('/home', { replace: true });
          }
        }, 100);
      } else if (login.rejected.match(resultAction)) {
        // Error is already handled by the slice
        console.error('❌ Login failed:', resultAction.payload);
      }
    } catch (err) {
      console.error('❌ Login error:', err);
    }
  };

  const constructionImage = 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1920&q=80';

  return (
    <Layout className={styles.loginLayout}>
      {/* Full Screen Background Image */}
      <img 
        src={constructionImage} 
        alt="Xây dựng an toàn" 
        className={styles.loginBackgroundImage}
        onError={(e) => {
          // Fallback nếu ảnh lỗi
          (e.target as HTMLImageElement).src = 'https://hbcg.vn/laravel-filemanager/app/public/media/image/an-toan-lao-dong-trong-xay-dung-4.jpg';
        }}
      />

      {/* Back Button */}
      <div 
        className={styles.backButton}
        onClick={() => safeNavigate('/')}
      >
        <ArrowLeftOutlined className={styles.backButtonIcon} />
        <span>Về trang chủ</span>
      </div>

      <Content className={styles.loginContent}>
        <div className={styles.loginContainer}>
          {/* Form Section - Overlay trên hình ảnh */}
          <div className={styles.loginFormSection}>
            <Card className={styles.loginCard}>
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                {/* Header */}
                <div className={styles.loginHeader}>
                  <SafetyOutlined className={styles.loginIcon} />
                  <Title level={2} className={styles.loginTitle}>
                    Hệ Thống Quản Lý An Toàn
                  </Title>
                  <Text className={styles.loginSubtitle}>
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
                  className={styles.loginForm}
                >
                  <Form.Item
                    name="username"
                    label="* Tên đăng nhập"
                    className={styles.loginFormItem}
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
                    label="* Mật khẩu"
                    className={styles.loginFormItem}
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
                      className={styles.loginButton}
                    >
                      {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </Button>
                  </Form.Item>
                </Form>

                {/* Footer */}
                <div className={styles.loginFooter}>
                  <Text className={styles.loginFooterText}>
                    Nếu có vấn đề, vui lòng liên hệ quản trị viên hệ thống
                  </Text>
                </div>
              </Space>
            </Card>
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export default LoginPage;
