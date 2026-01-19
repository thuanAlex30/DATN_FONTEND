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
import { UserOutlined, LockOutlined, SafetyOutlined, ArrowLeftOutlined, QuestionCircleOutlined } from '@ant-design/icons';
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
        const user = resultAction.payload?.user;
        
        // Validate user object exists
        if (!user) {
          console.error('❌ Login successful but user data is missing');
          message.error('Đăng nhập thành công nhưng thiếu thông tin người dùng. Vui lòng thử lại.');
          return;
        }
        
        console.log('✅ Login successful, user:', user);
        console.log('🔍 User role object:', user.role);
        console.log('🔍 User role name:', user.role?.role_name);
        console.log('🔍 User role _id:', user.role?._id);
        console.log('🔍 Full user object keys:', Object.keys(user));
        
        // Small delay to ensure state is updated before redirect
        setTimeout(() => {
          // Check user role and redirect accordingly
          // Priority: role_code > role_name > role_level
          const roleCode = user?.role?.role_code;
          const roleName = user?.role?.role_name;
          const roleLevel = user?.role?.role_level;
          console.log('🔍 Final role check:', { roleCode, roleName, roleLevel, role: user.role });
          
          // Map role_code to dashboard routes
          let redirectPath = '/home'; // Default fallback
          
          // Normalize roleCode for comparison
          const normalizedRoleCode = roleCode?.toLowerCase().trim();
          
          if (normalizedRoleCode) {
            // Use role_code for precise matching (from backend roleMatrix.js)
            switch (normalizedRoleCode) {
              case 'system_admin':
                redirectPath = '/system-admin/home';
                console.log('🔀 Redirecting to system admin home (role_code:', roleCode, ')');
                break;
              case 'company_admin':
                redirectPath = '/admin/dashboard';
                console.log('🔀 Redirecting to admin dashboard (role_code:', roleCode, ')');
                break;
              case 'department_header':
                redirectPath = '/header-department/dashboard';
                console.log('🔀 Redirecting to header department dashboard (role_code:', roleCode, ')');
                break;
              case 'manager':
                redirectPath = '/manager/dashboard';
                console.log('🔀 Redirecting to manager dashboard (role_code:', roleCode, ')');
                break;
              case 'employee':
                redirectPath = '/employee/dashboard';
                console.log('🔀 Redirecting to employee dashboard (role_code:', roleCode, ')');
                break;
              case 'team_leader':
                // Team leader can use employee dashboard or manager dashboard based on permissions
                redirectPath = '/employee/dashboard';
                console.log('🔀 Redirecting to employee dashboard (role_code:', roleCode, ')');
                break;
              case 'trainer':
              case 'safety_officer':
              case 'warehouse_staff':
              case 'maintenance_staff':
                // Specialized roles default to employee dashboard
                redirectPath = '/employee/dashboard';
                console.log('🔀 Redirecting to employee dashboard (role_code:', roleCode, ')');
                break;
              default:
                console.warn('⚠️ Unknown role_code:', roleCode, '- using role_level fallback');
                // Fallback to role_level-based routing
                if (roleLevel >= 90) {
                  redirectPath = '/admin/dashboard';
                } else if (roleLevel >= 80) {
                  redirectPath = '/header-department/dashboard';
                } else if (roleLevel >= 70) {
                  redirectPath = '/manager/dashboard';
                } else {
                  redirectPath = '/employee/dashboard';
                }
            }
          } else if (roleName) {
            // Fallback to role_name matching (legacy support)
            const normalizedRoleName = roleName.toLowerCase().trim();
            // System Admin
            if (normalizedRoleName === 'system admin' || 
                normalizedRoleName === 'system_admin') {
              redirectPath = '/system-admin/home';
              console.log('🔀 Redirecting to system admin home (role_name:', roleName, ')');
            }
            // Company Admin
            else if (normalizedRoleName === 'company admin' || 
                     normalizedRoleName === 'company_admin' ||
                     normalizedRoleName === 'admin') {
              redirectPath = '/admin/dashboard';
              console.log('🔀 Redirecting to admin dashboard (role_name:', roleName, ')');
            } 
            // Header Department roles
            else if (normalizedRoleName === 'header_department' || 
                     normalizedRoleName === 'department header' ||
                     normalizedRoleName === 'department_header') {
              redirectPath = '/header-department/dashboard';
              console.log('🔀 Redirecting to header department dashboard (role_name:', roleName, ')');
            } 
            // Manager roles
            else if (normalizedRoleName === 'manager' || 
                     normalizedRoleName === 'department manager') {
              redirectPath = '/manager/dashboard';
              console.log('🔀 Redirecting to manager dashboard (role_name:', roleName, ')');
            } 
            // Employee and other roles
            else if (normalizedRoleName === 'employee' ||
                     normalizedRoleName === 'team leader' ||
                     normalizedRoleName === 'team_leader' ||
                     normalizedRoleName === 'trainer' ||
                     normalizedRoleName === 'safety officer' ||
                     normalizedRoleName === 'safety_officer' ||
                     normalizedRoleName === 'warehouse staff' ||
                     normalizedRoleName === 'warehouse_staff' ||
                     normalizedRoleName === 'maintenance staff' ||
                     normalizedRoleName === 'maintenance_staff') {
              redirectPath = '/employee/dashboard';
              console.log('🔀 Redirecting to employee dashboard (role_name:', roleName, ')');
            } 
            else {
              console.warn('⚠️ Unknown role_name:', roleName, '- using role_level fallback');
              // Fallback to role_level
              if (roleLevel !== undefined && roleLevel >= 100) {
                redirectPath = '/system-admin/home';
              } else if (roleLevel !== undefined && roleLevel >= 90) {
                redirectPath = '/admin/dashboard';
              } else if (roleLevel !== undefined && roleLevel >= 80) {
                redirectPath = '/header-department/dashboard';
              } else if (roleLevel !== undefined && roleLevel >= 70) {
                redirectPath = '/manager/dashboard';
              } else {
                redirectPath = '/employee/dashboard';
              }
            }
          } else if (roleLevel !== undefined) {
            // Final fallback: use role_level
            if (roleLevel >= 100) {
              redirectPath = '/system-admin/home';
              console.log('🔀 Redirecting to system admin home (role_level:', roleLevel, ')');
            } else if (roleLevel >= 90) {
              redirectPath = '/admin/dashboard';
              console.log('🔀 Redirecting to admin dashboard (role_level:', roleLevel, ')');
            } else if (roleLevel >= 80) {
              redirectPath = '/header-department/dashboard';
              console.log('🔀 Redirecting to header department dashboard (role_level:', roleLevel, ')');
            } else if (roleLevel >= 70) {
              redirectPath = '/manager/dashboard';
              console.log('🔀 Redirecting to manager dashboard (role_level:', roleLevel, ')');
            } else {
              redirectPath = '/employee/dashboard';
              console.log('🔀 Redirecting to employee dashboard (role_level:', roleLevel, ')');
            }
          } else {
            // Last resort: try username-based fallback
            console.error('❌ No role information found:', { roleCode, roleName, roleLevel, role: user?.role });
            if (user?.username?.toLowerCase().includes('admin')) {
              redirectPath = '/admin/dashboard';
              console.log('🔀 Fallback: Redirecting to admin dashboard based on username');
            } else if (user?.username?.toLowerCase().includes('manager')) {
              redirectPath = '/manager/dashboard';
              console.log('🔀 Fallback: Redirecting to manager dashboard based on username');
            } else {
              redirectPath = '/employee/dashboard';
              console.log('🔀 Fallback: Redirecting to employee dashboard');
            }
          }
          
          safeNavigate(redirectPath, { replace: true });
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
                      message={typeof error === 'string' ? error : 'Sai thông tin tài khoản hoặc mật khẩu'}
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

                {/* Forgot Password Link */}
                <div style={{ textAlign: 'center', marginTop: '-8px', marginBottom: '8px' }}>
                  <Button
                    type="link"
                    onClick={() => safeNavigate('/forgot-password')}
                    icon={<QuestionCircleOutlined />}
                    style={{ 
                      padding: 0,
                      color: '#22c55e',
                      fontWeight: 500
                    }}
                    className={styles.forgotPasswordLink}
                  >
                    Quên mật khẩu?
                  </Button>
                </div>

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