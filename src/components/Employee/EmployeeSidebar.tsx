import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
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
  BookOutlined,
  SafetyOutlined,
  LogoutOutlined,
  IdcardOutlined
} from '@ant-design/icons';
import { logout } from '../../store/slices/authSlice';
import styles from './EmployeeSidebar.module.css';

const { Sider } = Layout;
const { Title } = Typography;

interface EmployeeSidebarProps {
  onLogout?: () => void;
}

const EmployeeSidebar: React.FC<EmployeeSidebarProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);
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
      key: '/employee/certificates',
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

export default EmployeeSidebar;
