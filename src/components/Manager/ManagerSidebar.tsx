import React from 'react';
import { useNavigate } from 'react-router-dom';
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
  ToolOutlined
} from '@ant-design/icons';
import styles from './ManagerSidebar.module.css';

const { Sider } = Layout;
const { Title } = Typography;

interface ManagerSidebarProps {
  onLogout?: () => void;
}

const ManagerSidebar: React.FC<ManagerSidebarProps> = ({ onLogout }) => {
  const navigate = useNavigate();

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
      key: '/manager/incident-handling',
      icon: <ToolOutlined />,
      label: 'Xử lý sự cố',
    },
    {
      key: '/employee/training',
      icon: <BookOutlined />,
      label: 'Đào tạo',
    },
    {
      key: '/employee/ppe',
      icon: <SafetyOutlined />,
      label: 'PPE cá nhân',
    },
    {
      key: '/employee/project-management',
      icon: <ProjectOutlined />,
      label: 'Quản lý dự án',
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

export default ManagerSidebar;
