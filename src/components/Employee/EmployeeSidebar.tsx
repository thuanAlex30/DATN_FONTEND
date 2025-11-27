import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Layout, 
  Menu, 
  Typography, 
  Button, 
  Space
} from 'antd';
import type { MenuProps } from 'antd';
import type { RootState } from '../../store';
import {
  HomeOutlined,
  UserOutlined,
  ExclamationCircleOutlined,
  BookOutlined,
  SafetyOutlined,
  LogoutOutlined,
  ProjectOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons';
import styles from './EmployeeSidebar.module.css';

const { Sider } = Layout;
const { Title } = Typography;

interface EmployeeSidebarProps {
  onLogout?: () => void;
}

const EmployeeSidebar: React.FC<EmployeeSidebarProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
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
      key: '/employee/profile',
      icon: <UserOutlined />,
      label: 'Thông tin cá nhân',
    },
    {
      key: '/employee/training',
      icon: <BookOutlined />,
      label: 'Đào tạo',
    },
    {
      key: '/employee/ppe',
      icon: <SafetyOutlined />,
      label: user?.role?.role_name === 'manager' ? 'Quản lý PPE' : 'PPE cá nhân',
    },
    // Only show project management for managers
    ...(user?.role?.role_name === 'manager' ? [{
      key: '/employee/project-management',
      icon: <ProjectOutlined />,
      label: 'Quản lý dự án',
    }] : []),
    {
      key: '/employee/certificates',
      icon: <SafetyCertificateOutlined />,
      label: 'Chứng chỉ',
    },
  ];

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    navigate(key);
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
            Employee Dashboard
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
          defaultSelectedKeys={[window.location.pathname]}
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

export default EmployeeSidebar;
