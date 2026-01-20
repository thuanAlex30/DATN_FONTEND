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
  ExclamationCircleOutlined,
  BookOutlined,
  SafetyOutlined,
  LogoutOutlined,
  ProjectOutlined,
  DashboardOutlined,
  SearchOutlined,
  IdcardOutlined
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
    key: '/manager/dashboard',
    icon: <DashboardOutlined />,
    label: 'Dashboard',
  },
  {
    key: '/manager/incidents/report',
    icon: <ExclamationCircleOutlined />,
    label: 'Báo cáo sự cố',
  },
  {
    key: '/manager/incidents/assigned',
    icon: <SearchOutlined />,
    label: 'Điều tra sự cố',
  },
  {
    key: '/manager/training',
    icon: <BookOutlined />,
    label: 'Quản lý đào tạo',
  },
  {
    key: '/manager/ppe',
    icon: <SafetyOutlined />,
    label: 'Quản lý PPE',
  },
  {
    key: '/manager/project-management',
    icon: <ProjectOutlined />,
    label: 'Quản lý dự án',
  },
  {
    key: '/manager/hikvision-events',
    icon: <LockOutlined />,
    label: 'Kiểm soát truy cập',
  },
  {
    key: '/manager/certificates',
    icon: <IdcardOutlined />,
    label: 'Chứng chỉ cá nhân',
  },
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
          <Title level={3} style={{ margin: 0, background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontWeight: 700, fontSize: '20px' }}>
            <SafetyOutlined style={{ marginRight: '8px', fontSize: '22px' }} /> An toàn lao động
          </Title>
          <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 500, letterSpacing: '0.02em' }}>
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
