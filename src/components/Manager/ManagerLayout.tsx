import React from 'react';
import { Layout } from 'antd';
import ManagerSidebar from './ManagerSidebar';
import ManagerHeader from './ManagerHeader';
import styles from './ManagerLayout.module.css';

const { Content } = Layout;

interface ManagerLayoutProps {
  children: React.ReactNode;
  title?: string;
  icon?: React.ReactNode;
  showUserInfo?: boolean;
  showNotifications?: boolean;
  onLogout?: () => void;
  headerExtra?: React.ReactNode;
  className?: string;
}

const ManagerLayout: React.FC<ManagerLayoutProps> = ({
  children,
  title,
  icon,
  showUserInfo = true,
  showNotifications = true,
  onLogout,
  headerExtra,
  className
}) => {
  return (
    <Layout className={`${styles.layout} ${className || ''}`}>
      <ManagerSidebar onLogout={onLogout} />
      <Layout className={styles.contentLayout}>
        <Content className={styles.content}>
          <ManagerHeader
            title={title}
            icon={icon}
            showUserInfo={showUserInfo}
            showNotifications={showNotifications}
            onLogout={onLogout}
            extra={headerExtra}
          />
          <div className={styles.pageContent}>
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default ManagerLayout;
