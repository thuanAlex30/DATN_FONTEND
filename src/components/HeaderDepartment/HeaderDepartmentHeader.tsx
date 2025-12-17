import React, { useState } from 'react';
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
<<<<<<< HEAD
import ProfileModal from '../ProfileModal/ProfileModal';
import SettingsModal from '../SettingsModal/SettingsModal';
=======
import { WeatherWidget, EquipmentSuggestion } from '../Weather';
>>>>>>> 96f4b44d44d14fb0ec6d82d3fcd665fc6dcd26c8
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
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      dispatch(logout());
      navigate('/login');
    }
  };

  const handleProfile = () => {
    setShowProfileModal(true);
  };

  const handleSettings = () => {
    setShowSettingsModal(true);
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
      handleProfile();
    } else if (key === 'settings') {
      handleSettings();
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

          <WeatherWidget compact />
          <EquipmentSuggestion compact />

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

      {/* Profile Modal */}
      <ProfileModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)} 
      />
      
      {/* Settings Modal */}
      <SettingsModal 
        isOpen={showSettingsModal} 
        onClose={() => setShowSettingsModal(false)} 
      />
    </Header>
  );
};

export default HeaderDepartmentHeader;


