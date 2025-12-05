import React from 'react';
import { Layout, Typography, Button, Dropdown, Avatar } from 'antd';
import {
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  MenuOutlined
} from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../store/slices/authSlice';
import type { RootState } from '../../store';
import styles from './HeaderDepartmentHeader.module.css';

const { Header } = Layout;
const { Title } = Typography;

interface HeaderDepartmentHeaderProps {
  title?: string;
  icon?: React.ReactNode;
  showUserInfo?: boolean;
  onLogout?: () => void;
  extra?: React.ReactNode;
}

const HeaderDepartmentHeader: React.FC<HeaderDepartmentHeaderProps> = ({
  title,
  icon,
  showUserInfo = true,
  onLogout,
  extra
}) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      dispatch(logout());
      navigate('/login');
    }
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Hồ sơ cá nhân',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Cài đặt',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      danger: true,
    },
  ];

  const handleUserMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      handleLogout();
    } else if (key === 'profile') {
    } else if (key === 'settings') {
    }
  };

  return (
    <Header className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.headerLeft}>
          <Button
            type="text"
            icon={<MenuOutlined />}
            className={styles.mobileMenuButton}
          />
          {title && (
            <div className={styles.titleSection}>
              {icon && <span className={styles.titleIcon}>{icon}</span>}
              <Title level={4} className={styles.title}>
                {title}
              </Title>
            </div>
          )}
        </div>

        <div className={styles.headerRight}>
          {extra && <div className={styles.headerExtra}>{extra}</div>}

          {showUserInfo && user && (
            <Dropdown
              menu={{
                items: userMenuItems,
                onClick: handleUserMenuClick,
              }}
              placement="bottomRight"
              trigger={['click']}
            >
              <div className={styles.userInfo} style={{ cursor: 'pointer' }}>
                <Avatar
                  size="small"
                  icon={<UserOutlined />}
                  className={styles.userAvatar}
                />
              </div>
            </Dropdown>
          )}
        </div>
      </div>
    </Header>
  );
};

export default HeaderDepartmentHeader;


