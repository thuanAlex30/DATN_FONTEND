import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Layout,
  Button,
  Avatar,
  Badge
} from 'antd';
import {
  SafetyOutlined,
  LoginOutlined,
  HomeOutlined,
  UserOutlined,
  MessageOutlined,
  BellOutlined,
  QuestionCircleOutlined,
  BookOutlined,
  SettingOutlined,
  LogoutOutlined,
  Menu
} from '@ant-design/icons';
import type { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../store';
import styles from './LandingLayout.module.css';

const { Sider, Header } = Layout;

interface LandingLayoutProps {
  children: React.ReactNode;
}

const LandingLayout: React.FC<LandingLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { unreadCount } = useSelector((state: RootState) => state.websocket);

  const handleLogin = () => {
    navigate('/login');
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const handleMenuClick = (key: string) => {
    const routeMap: Record<string, string> = {
      'home': '/',
      'profile': isAuthenticated ? '/homepage' : '/login',
      'support': isAuthenticated ? '/homepage' : '/login',
      'notifications': isAuthenticated ? '/homepage' : '/login',
      'help': '/help',
      'faq': '/faq'
    };
    
    const route = routeMap[key] || '/';
    navigate(route);
  };

  const menuItems = [
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: 'Trang chủ'
    },
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Hồ sơ'
    },
    {
      key: 'support',
      icon: <MessageOutlined />,
      label: 'Vé hỗ trợ'
    },
    {
      key: 'notifications',
      icon: <BellOutlined />,
      label: 'Thông báo'
    },
    {
      key: 'help',
      icon: <QuestionCircleOutlined />,
      label: 'Trung tâm trợ giúp'
    },
    {
      key: 'faq',
      icon: <BookOutlined />,
      label: 'Câu hỏi thường gặp'
    }
  ];

  const getSelectedKey = () => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path === '/help') return 'help';
    if (path === '/faq') return 'faq';
    if (path === '/contact') return 'contact';
    if (path === '/about') return 'about';
    return 'home';
  };

  return (
    <Layout className={styles.layout}>
      {/* Sidebar */}
      <Sider width={260} className={styles.sidebar} theme="light">
        <div className={styles.sidebarContent}>
          {/* Logo */}
          <div className={styles.logo}>
            <SafetyOutlined className={styles.logoIcon} />
            <span className={styles.logoText}>Hệ Thống An Toàn</span>
          </div>

          {/* Navigation Menu */}
          <Menu
            mode="vertical"
            selectedKeys={[getSelectedKey()]}
            className={styles.sidebarMenu}
            items={menuItems}
            onClick={({ key }) => handleMenuClick(key)}
          />

          {/* Bottom Actions */}
          <div className={styles.sidebarFooter}>
            <Button
              type="text"
              icon={<SettingOutlined />}
              className={styles.settingsBtn}
              block
            >
              Cài đặt
            </Button>
            {isAuthenticated ? (
              <Button
                type="primary"
                danger
                icon={<LogoutOutlined />}
                onClick={handleLogout}
                className={styles.logoutBtn}
                block
              >
                Đăng xuất
              </Button>
            ) : (
              <Button
                type="primary"
                icon={<LoginOutlined />}
                onClick={handleLogin}
                className={styles.loginBtn}
                block
              >
                Đăng nhập
              </Button>
            )}
          </div>
        </div>
      </Sider>

      {/* Main Content */}
      <Layout className={styles.mainLayout}>
        {/* Top Header */}
        <Header className={styles.topHeader}>
          <div className={styles.headerNav}>
            <Button
              type="text"
              className={location.pathname === '/' ? styles.activeNavLink : styles.navLink}
              onClick={() => navigate('/')}
            >
              Trang chủ
            </Button>
            <Button
              type="text"
              className={location.pathname === '/about' ? styles.activeNavLink : styles.navLink}
              onClick={() => navigate('/about')}
            >
              Giới thiệu
            </Button>
            <Button
              type="text"
              className={location.pathname === '/help' ? styles.activeNavLink : styles.navLink}
              onClick={() => navigate('/help')}
            >
              Trung tâm trợ giúp
            </Button>
            <Button
              type="text"
              className={location.pathname === '/contact' ? styles.activeNavLink : styles.navLink}
              onClick={() => navigate('/contact')}
            >
              Liên hệ
            </Button>
            <Button
              type="text"
              className={location.pathname === '/faq' ? styles.activeNavLink : styles.navLink}
              onClick={() => navigate('/faq')}
            >
              Câu hỏi thường gặp
            </Button>
          </div>

          <div className={styles.headerActions}>
            {isAuthenticated ? (
              <>
                <Badge count={unreadCount} size="small">
                  <Button
                    type="text"
                    icon={<BellOutlined />}
                    className={styles.headerIconBtn}
                  />
                </Badge>
                <Button
                  type="text"
                  icon={<UserOutlined />}
                  className={styles.headerIconBtn}
                />
                <Avatar
                  src={user?.full_name?.[0] || 'U'}
                  className={styles.userAvatar}
                >
                  {user?.full_name?.[0] || 'U'}
                </Avatar>
              </>
            ) : (
              <Button
                type="primary"
                icon={<LoginOutlined />}
                onClick={handleLogin}
              >
                Đăng nhập
              </Button>
            )}
          </div>
        </Header>

        {/* Children Content */}
        {children}
      </Layout>
    </Layout>
  );
};

export default LandingLayout;

