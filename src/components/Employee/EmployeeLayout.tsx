import React from 'react';
import { Layout } from 'antd';
import EmployeeSidebar from './EmployeeSidebar';
import EmployeeHeader from './EmployeeHeader';
import styles from './EmployeeLayout.module.css';

const { Content } = Layout;

interface EmployeeLayoutProps {
  children: React.ReactNode;
  title: string;
  icon?: React.ReactNode;
  showUserInfo?: boolean;
  showNotifications?: boolean;
  onLogout?: () => void;
  headerExtra?: React.ReactNode;
  className?: string;
}

const EmployeeLayout: React.FC<EmployeeLayoutProps> = ({
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
      <EmployeeSidebar onLogout={onLogout} />
      <Layout className={styles.contentLayout}>
        <Content className={styles.content}>
          <EmployeeHeader
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

export default EmployeeLayout;
