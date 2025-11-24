import React from 'react';
import { Layout, Button, Typography, Space } from 'antd';
import { SafetyOutlined, LoginOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import styles from './MarketingHeader.module.css';

const { Header } = Layout;
const { Title } = Typography;

type NavKey = 'home' | 'about' | 'contact' | 'faq';

interface MarketingHeaderProps {
  activeKey: NavKey;
}

const navItems: Array<{ key: NavKey; label: string; path: string }> = [
  { key: 'home', label: 'Trang chủ', path: '/' },
  { key: 'about', label: 'Giới thiệu', path: '/about' },
  { key: 'contact', label: 'Liên hệ', path: '/contact' },
  { key: 'faq', label: 'FAQ', path: '/faq' }
];

const MarketingHeader: React.FC<MarketingHeaderProps> = ({ activeKey }) => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <Header className={styles.header}>
      <div className={styles.headerTop}>
        <div className={styles.logo} onClick={() => navigate('/')}>
          <SafetyOutlined className={styles.logoIcon} />
          <Title level={4} className={styles.logoText}>
            Hệ Thống Quản Lý An Toàn Lao Động
          </Title>
        </div>
        <Button
          type="primary"
          size="large"
          icon={<LoginOutlined />}
          onClick={handleLogin}
          className={styles.loginBtn}
        >
          Đăng nhập
        </Button>
      </div>
      <div className={styles.navBar}>
        <Space size="large" className={styles.navLinks}>
          {navItems.map((item) => (
            <Button
              key={item.key}
              type="link"
              className={`${styles.navLink} ${activeKey === item.key ? styles.navLinkActive : ''}`}
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </Button>
          ))}
        </Space>
      </div>
    </Header>
  );
};

export default MarketingHeader;

