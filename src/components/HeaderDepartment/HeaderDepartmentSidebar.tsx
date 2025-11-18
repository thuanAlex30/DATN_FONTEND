import React from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  SafetyOutlined,
  SafetyCertificateOutlined,
  ExclamationCircleOutlined,
  LogoutOutlined,
  BookOutlined,
  ProjectOutlined,
} from '@ant-design/icons';
import styles from './HeaderDepartmentSidebar.module.css';

const { Sider } = Layout;

interface HeaderDepartmentSidebarProps {
  onLogout?: () => void;
}

const HeaderDepartmentSidebar: React.FC<HeaderDepartmentSidebarProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/header-department/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/header-department/training-management',
      icon: <BookOutlined />,
      label: 'Quản lý đào tạo',
    },
    {
      key: '/header-department/project-management',
      icon: <ProjectOutlined />,
      label: 'Quản lý dự án',
    },
    {
      key: '/header-department/certificate-management',
      icon: <SafetyCertificateOutlined />,
      label: 'Quản lý chứng chỉ',
    },
    {
      key: '/header-department/ppe-management',
      icon: <SafetyOutlined />,
      label: 'Quản lý PPE',
    },
    {
      key: '/header-department/incident-management',
      icon: <ExclamationCircleOutlined />,
      label: 'Quản lý sự cố',
    },
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
      width={240}
      className={styles.sider}
      theme="light"
      collapsible={false}
    >
      <div className={styles.logo}>
        <SafetyOutlined className={styles.logoIcon} />
        <span className={styles.logoText}>Header Department</span>
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

export default HeaderDepartmentSidebar;


