import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Row,
  Col,
  Button,
  Space,
  Typography,
  Badge
} from 'antd';
import {
  LogoutOutlined,
  BellOutlined,
  UserOutlined
} from '@ant-design/icons';
import type { RootState } from '../../store';
import styles from './EmployeeHeader.module.css';

const { Title, Text } = Typography;

interface EmployeeHeaderProps {
  title: string;
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
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      navigate('/login');
    }
  };

  return (
    <Card className={styles.headerCard}>
      <Row justify="space-between" align="middle">
        <Col>
          <Space>
            {icon && <span className={styles.headerIcon}>{icon}</span>}
            <Title level={2} className={styles.headerTitle}>
              {title}
            </Title>
          </Space>
        </Col>
        <Col>
          <Space size="middle">
            {showNotifications && (
              <Badge count={unreadCount} size="small">
                <Button 
                  type="text" 
                  icon={<BellOutlined />}
                  className={styles.notificationButton}
                  title="Thông báo"
                />
              </Badge>
            )}
            {showUserInfo && (
              <Space>
                <UserOutlined className={styles.userIcon} />
                <Text className={styles.userText}>
                  Xin chào, {user?.full_name || 'Người dùng'}
                </Text>
              </Space>
            )}
            {extra}
            <Button 
              type="primary"
              danger
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              className={styles.logoutButton}
            >
              Đăng xuất
            </Button>
          </Space>
        </Col>
      </Row>
    </Card>
  );
};

export default EmployeeHeader;
