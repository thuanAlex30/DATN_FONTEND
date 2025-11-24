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
      console.log('🚀 Starting login process...');
      const resultAction = await dispatch(login(values));
      console.log('🔍 Login result action:', resultAction);
      
      if (login.fulfilled.match(resultAction)) {
        const user = resultAction.payload.user;
        console.log('✅ Login successful, user:', user);
        console.log('🔍 User role object:', user.role);
        console.log('🔍 User role name:', user.role?.role_name);
        console.log('🔍 User role _id:', user.role?._id);
        console.log('🔍 Full user object keys:', Object.keys(user));
        
        // Small delay to ensure state is updated before redirect
        setTimeout(() => {
          // Check user role and redirect accordingly
          // Priority: role_code > role_name > role_level
          const roleCode = user.role?.role_code;
          const roleName = user.role?.role_name;
          const roleLevel = user.role?.role_level;
          console.log('🔍 Final role check:', { roleCode, roleName, roleLevel, role: user.role });
          
          // Map role_code to dashboard routes
          let redirectPath = '/home'; // Default fallback
          
          if (roleCode) {
            // Use role_code for precise matching (from backend roleMatrix.js)
            switch (roleCode.toLowerCase()) {
              case 'system_admin':
              case 'Company Admin':
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
            // Admin roles
            if (normalizedRoleName === 'company admin' || 
                normalizedRoleName === 'system admin' || 
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
              if (roleLevel !== undefined && roleLevel >= 90) {
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
            if (roleLevel >= 90) {
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
            console.error('❌ No role information found:', { roleCode, roleName, roleLevel, role: user.role });
            if (user.username?.toLowerCase().includes('admin')) {
              redirectPath = '/admin/dashboard';
              console.log('🔀 Fallback: Redirecting to admin dashboard based on username');
            } else if (user.username?.toLowerCase().includes('manager')) {
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
