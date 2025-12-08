import React from 'react';
import { Layout } from 'antd';
import HeaderDepartmentSidebar from './HeaderDepartmentSidebar';
import HeaderDepartmentHeader from './HeaderDepartmentHeader';
import styles from './HeaderDepartmentLayout.module.css';

const { Content } = Layout;

interface HeaderDepartmentLayoutProps {
  children: React.ReactNode;
  title?: string;
  icon?: React.ReactNode;
  showUserInfo?: boolean;
  onLogout?: () => void;
  headerExtra?: React.ReactNode;
  className?: string;
}

const HeaderDepartmentLayout: React.FC<HeaderDepartmentLayoutProps> = ({
  children,
  title,
  icon,
  showUserInfo = true,
  onLogout,
  headerExtra,
  className
}) => {
  return (
    <Layout className={`${styles.layout} ${className || ''}`}>
      <HeaderDepartmentSidebar onLogout={onLogout} />
      <Layout className={styles.contentLayout}>
        <Content className={styles.content}>
          <HeaderDepartmentHeader
            title={title}
            icon={icon}
            showUserInfo={showUserInfo}
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

export default HeaderDepartmentLayout;


