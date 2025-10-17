import React from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  SafetyOutlined,
  LogoutOutlined,
  ProjectOutlined,
  BookOutlined
} from '@ant-design/icons';
import styles from './ManagerSidebar.module.css';

const { Sider } = Layout;

interface ManagerSidebarProps {
  onLogout?: () => void;
}

const ManagerSidebar: React.FC<ManagerSidebarProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/manager/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
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
      key: '/manager/training',
      icon: <BookOutlined />,
      label: 'Quản lý đào tạo',
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

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      onLogout?.();
    } else {
      navigate(key);
    }
  };

  return (
    <Sider
      width={200}
      className={styles.sider}
      theme="light"
      collapsible={false}
    >
      <div className={styles.logo}>
        <SafetyOutlined className={styles.logoIcon} />
        <span className={styles.logoText}>Manager Portal</span>
      </div>
      
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={handleMenuClick}
        className={styles.menu}
      />
      
      <div className={styles.footer}>
        <Menu
          mode="inline"
          items={[
            {
              key: 'logout',
              icon: <LogoutOutlined />,
              label: 'Đăng xuất',
            },
          ]}
          onClick={handleMenuClick}
          className={styles.footerMenu}
        />
      </div>
    </Sider>
  );
};

export default ManagerSidebar;
