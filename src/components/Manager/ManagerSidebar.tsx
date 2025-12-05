import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { 
  Layout, 
  Menu, 
  Typography, 
  Button, 
  Space
} from 'antd';
import type { MenuProps } from 'antd';
import {
  HomeOutlined,
  UserOutlined,
  ExclamationCircleOutlined,
  BookOutlined,
  SafetyOutlined,
  LogoutOutlined,
  ProjectOutlined,
  LockOutlined,
  DashboardOutlined
} from '@ant-design/icons';
import { logout } from '../../store/slices/authSlice';
import styles from './ManagerSidebar.module.css';

const { Sider } = Layout;
const { Title } = Typography;

interface ManagerSidebarProps {
  onLogout?: () => void;
}

const ManagerSidebar: React.FC<ManagerSidebarProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      dispatch(logout());
      navigate('/login');
    }
  };

  const menuItems: MenuProps['items'] = [
    {
      key: '/home',
      icon: <HomeOutlined />,
      label: 'Trang chủ',
    },
    {
      key: '/manager/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/manager/profile',
      icon: <UserOutlined />,
      label: 'Thông tin cá nhân',
    },
    {
      key: '/manager/incidents/report',
      icon: <ExclamationCircleOutlined />,
      label: 'Báo cáo sự cố',
    },
    {
      key: '/manager/training',
      icon: <BookOutlined />,
      label: 'Quản lý đào tạo',
    },
    {
      key: '/employee/training',
      icon: <BookOutlined />,
      label: 'Đào tạo',
    },
    {
      key: '/manager/ppe',
      icon: <SafetyOutlined />,
      label: 'Quản lý PPE',
    },
    {
      key: '/employee/ppe',
      icon: <SafetyOutlined />,
      label: 'PPE cá nhân',
    },
    {
      key: '/manager/project-management',
      icon: <ProjectOutlined />,
      label: 'Quản lý dự án',
    },
    {
      key: '/employee/project-management',
      icon: <ProjectOutlined />,
      label: 'Quản lý dự án',
    },
    {
      key: '/manager/hikvision-events',
      icon: <LockOutlined />,
      label: 'Kiểm soát truy cập',
    },
    // Các tính năng sẽ được thêm sau
    // {
    //   key: '/manager/employees',
    //   icon: <TeamOutlined />,
    //   label: 'Quản lý nhân viên',
    // },
    // {
    //   key: '/manager/reports',
    //   icon: <FileTextOutlined />,
    //   label: 'Báo cáo',
    // },
    // {
    //   key: '/manager/analytics',
    //   icon: <BarChartOutlined />,
    //   label: 'Phân tích',
    // },
    // {
    //   key: '/manager/schedule',
    //   icon: <CalendarOutlined />,
    //   label: 'Lịch trình',
    // },
    // {
    //   key: '/manager/settings',
    //   icon: <SettingOutlined />,
    //   label: 'Cài đặt',
    // },
  ];

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    navigate(key as string);
  };

  return (
    <Sider 
      width={280} 
      className={styles.sidebar}
    >
      {/* Header */}
      <div className={styles.sidebarHeader}>
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
            <SafetyOutlined /> An toàn lao động
          </Title>
          <div style={{ fontSize: '12px', color: '#666' }}>
            Manager Dashboard
          </div>
        </Space>
      </div>

      {/* Navigation Menu */}
      <div className={styles.sidebarNav}>
        <Menu
          mode="inline"
          items={menuItems}
          onClick={handleMenuClick}
          className={styles.menu}
          selectedKeys={[location.pathname]}
        />
      </div>

      {/* Footer with Logout */}
      <div className={styles.sidebarFooter}>
        <Button 
          type="primary"
          danger
          icon={<LogoutOutlined />}
          onClick={handleLogout}
          className={styles.logoutButton}
          block
        >
          Đăng xuất
        </Button>
      </div>
    </Sider>
  );
};

export default ManagerSidebar;
