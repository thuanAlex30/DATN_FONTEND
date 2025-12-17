import React, { useState } from 'react';
import { Layout, Typography, Badge, Button, Dropdown, Avatar } from 'antd';
import {
  BellOutlined,
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
import { WeatherWidget, EquipmentSuggestion } from '../Weather';
>>>>>>> 96f4b44 (save)
import styles from './EmployeeHeader.module.css';

const { Header } = Layout;
const { Title } = Typography;

interface EmployeeHeaderProps {
  title?: string;
  icon?: React.ReactNode;
  showUserInfo?: boolean;
  showNotifications?: boolean;
  onLogout?: () => void;
  extra?: React.ReactNode;
}

const EmployeeHeader: React.FC<EmployeeHeaderProps> = ({
  title,
  icon,
  showUserInfo = true,
  showNotifications = true,
  onLogout,
  extra
}) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { unreadCount } = useSelector((state: RootState) => state.websocket);
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
      label: 'Há»“ sÆ¡ cĂ¡ nhĂ¢n',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'CĂ i Ä‘áº·t',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'ÄÄƒng xuáº¥t',
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
          
          {showNotifications && (
            <Badge count={unreadCount} size="small">
              <Button
                type="text"
                icon={<BellOutlined />}
                className={styles.notificationButton}
              />
            </Badge>
          )}

          {showUserInfo && user && (
            <Dropdown
              menu={{
                items: userMenuItems,
                onClick: handleUserMenuClick,
              }}
              placement="bottomRight"
              trigger={['click']}
            >
              <div className={styles.userInfo}>
                <Avatar
                  size="small"
                  icon={<UserOutlined />}
                  className={styles.userAvatar}
                />
                <span className={styles.userName}>{user.full_name}</span>
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

export default EmployeeHeader;
