import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Button, 
  Typography, 
  Space,
  Spin,
  Badge
} from 'antd';
import {
  UserOutlined,
  ProjectOutlined,
  BookOutlined,
  ExclamationCircleOutlined,
  SafetyOutlined,
  TrophyOutlined,
  BellOutlined,
  FileTextOutlined,
  TeamOutlined,
  DashboardOutlined,
  SettingOutlined,
  LogoutOutlined,
  HomeOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import type { RootState } from '../../store';
import NotificationPanel from '../../components/NotificationPanel';
import { projectRiskService } from '../../services/projectRiskService';
import { projectMilestoneService } from '../../services/projectMilestoneService';
import { logout } from '../../store/slices/authSlice';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../store';
import styles from './Homepage.module.css';

const { Title, Text } = Typography;

const Homepage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { unreadCount } = useSelector((state: RootState) => state.websocket);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [assignedTasks, setAssignedTasks] = useState({
    risks: 0,
    milestones: 0,
    highPriorityRisks: 0,
    criticalMilestones: 0
  });
  const [loading, setLoading] = useState(false);

  const userRole = user?.role?.role_name || '';

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  // Fetch assigned tasks for manager/leader roles
  useEffect(() => {
    const fetchAssignedTasks = async () => {
      if (!user?.id || !['manager', 'leader'].includes(userRole)) return;
      
      try {
        setLoading(true);
        const [risksResponse, milestonesResponse] = await Promise.all([
          projectRiskService.getAssignedRisks(user.id),
          projectMilestoneService.getAssignedMilestones(user.id)
        ]);

        const risks = risksResponse.data || [];
        const milestones = milestonesResponse.data || [];

        const highPriorityRisks = risks.filter((risk: any) => 
          risk.risk_level >= 4 || risk.status === 'IDENTIFIED'
        ).length;

        const criticalMilestones = milestones.filter((milestone: any) => 
          milestone.is_critical || milestone.status === 'PENDING'
        ).length;

        setAssignedTasks({
          risks: risks.length,
          milestones: milestones.length,
          highPriorityRisks,
          criticalMilestones
        });
      } catch (error) {
        console.error('Error fetching assigned tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignedTasks();
  }, [user, userRole]);

  // Get role-specific quick actions
  const getQuickActions = () => {
    const actions: Array<{ label: string; path: string; icon: React.ReactNode; color: string }> = [];

    if (userRole === 'admin') {
      actions.push(
        { label: 'Dashboard', path: '/admin/dashboard', icon: <DashboardOutlined />, color: '#1890ff' },
        { label: 'Quản lý người dùng', path: '/admin/user-management', icon: <UserOutlined />, color: '#52c41a' },
        { label: 'Vai trò & quyền hạn', path: '/admin/role-management', icon: <SafetyOutlined />, color: '#fa8c16' },
        { label: 'Nhật ký hệ thống', path: '/admin/system-logs', icon: <FileTextOutlined />, color: '#eb2f96' },
      );
    } else if (userRole === 'manager' || userRole === 'leader') {
      actions.push(
        { label: 'Báo cáo sự cố', path: '/manager/incidents/report', icon: <FileTextOutlined />, color: '#eb2f96' },
        { label: 'Xử lý sự cố', path: '/manager/incident-handling', icon: <ExclamationCircleOutlined />, color: '#f5222d' },
        { label: 'Quản lý dự án', path: '/employee/project-management', icon: <ProjectOutlined />, color: '#722ed1' },
        { label: 'Đào tạo', path: '/employee/training', icon: <BookOutlined />, color: '#fa8c16' },
        { label: 'PPE cá nhân', path: '/employee/ppe', icon: <SafetyOutlined />, color: '#13c2c2' }
      );
    } else if (userRole === 'employee') {
      actions.push(
        { label: 'Đào tạo', path: '/employee/training', icon: <BookOutlined />, color: '#fa8c16' },
        { label: 'PPE cá nhân', path: '/employee/ppe', icon: <SafetyOutlined />, color: '#13c2c2' },
        { label: 'Chứng chỉ', path: '#', icon: <TrophyOutlined />, color: '#fadb14' }
      );
    } else if (userRole === 'trainer') {
      actions.push(
        { label: 'Quản lý đào tạo', path: '/admin/training-management', icon: <BookOutlined />, color: '#fa8c16' },
        { label: 'PPE cá nhân', path: '/employee/ppe', icon: <SafetyOutlined />, color: '#13c2c2' }
      );
    } else if (userRole === 'safety_officer') {
      actions.push(
        { label: 'Quản lý sự cố', path: '/admin/incident-management', icon: <ExclamationCircleOutlined />, color: '#eb2f96' },
        { label: 'Quản lý PPE', path: '/admin/ppe-management', icon: <SafetyOutlined />, color: '#13c2c2' },
        { label: 'Đào tạo', path: '/employee/training', icon: <BookOutlined />, color: '#fa8c16' }
      );
    }

    return actions;
  };

  // Get role display name
  const getRoleDisplayName = () => {
    const roleMap: Record<string, string> = {
      'admin': 'Quản trị viên',
      'manager': 'Quản lý',
      'leader': 'Trưởng nhóm',
      'employee': 'Nhân viên',
      'trainer': 'Giảng viên',
      'safety_officer': 'Nhân viên an toàn'
    };
    return roleMap[userRole] || 'Người dùng';
  };

  const quickActions = getQuickActions();

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <SafetyOutlined className={styles.logoIcon} />
          <Title level={3} className={styles.headerTitle}>
            Hệ Thống Quản Lý An Toàn Lao Động
          </Title>
        </div>
        <div className={styles.headerRight}>
          <Space size="large">
            <Badge count={unreadCount} size="small">
              <Button
                type="text"
                icon={<BellOutlined />}
                onClick={() => setIsNotificationPanelOpen(true)}
                className={styles.notificationBtn}
              >
                Thông báo
              </Button>
            </Badge>
            <div className={styles.userInfo}>
              <UserOutlined className={styles.userIcon} />
              <div className={styles.userDetails}>
                <Text strong>{user?.full_name || 'Người dùng'}</Text>
                <Text type="secondary" className={styles.userRole}>
                  {getRoleDisplayName()}
                </Text>
              </div>
            </div>
            <Button
              type="primary"
              danger
              icon={<LogoutOutlined />}
              onClick={handleLogout}
            >
              Đăng xuất
            </Button>
          </Space>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {/* Welcome Section */}
        <Card className={styles.welcomeCard}>
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Title level={2} className={styles.welcomeTitle}>
              Chào mừng trở lại, {user?.full_name || 'Người dùng'}! 👋
            </Title>
            <Text className={styles.welcomeText}>
              Đây là trang chủ của hệ thống quản lý an toàn lao động. 
              Bạn có thể truy cập các chức năng chính từ đây.
            </Text>
          </Space>
        </Card>

        {/* Quick Actions */}
        {quickActions.length > 0 && (
          <Card title={<><HomeOutlined /> Truy cập nhanh</>} className={styles.actionsCard}>
            <Row gutter={[16, 16]}>
              {quickActions.map((action, index) => (
                <Col xs={24} sm={12} md={8} lg={6} key={index}>
                  <Link to={action.path}>
                    <Card
                      hoverable
                      className={styles.actionCard}
                      style={{ borderLeft: `4px solid ${action.color}` }}
                    >
                      <Space direction="vertical" align="center" style={{ width: '100%' }}>
                        <div className={styles.actionIcon} style={{ color: action.color }}>
                          {action.icon}
                        </div>
                        <Text strong>{action.label}</Text>
                      </Space>
                    </Card>
                  </Link>
                </Col>
              ))}
            </Row>
          </Card>
        )}

        {/* Statistics Section for Manager/Leader */}
        {['manager', 'leader'].includes(userRole) && (
          <Card title={<><BarChartOutlined /> Nhiệm vụ được giao</>} className={styles.statsCard}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <Spin size="large" />
              </div>
            ) : (
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="Rủi ro được giao"
                      value={assignedTasks.risks}
                      prefix={<ExclamationCircleOutlined />}
                      valueStyle={{ color: '#cf1322' }}
                    />
                    {assignedTasks.highPriorityRisks > 0 && (
                      <Text type="danger" style={{ fontSize: '12px', display: 'block', marginTop: '8px' }}>
                        ⚠️ {assignedTasks.highPriorityRisks} rủi ro ưu tiên cao
                      </Text>
                    )}
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="Cột mốc được giao"
                      value={assignedTasks.milestones}
                      prefix={<ProjectOutlined />}
                      valueStyle={{ color: '#1890ff' }}
                    />
                    {assignedTasks.criticalMilestones > 0 && (
                      <Text type="warning" style={{ fontSize: '12px', display: 'block', marginTop: '8px' }}>
                        ⚠️ {assignedTasks.criticalMilestones} cột mốc quan trọng
                      </Text>
                    )}
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={12}>
                  <Card>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Text strong>Hành động nhanh</Text>
                      <Button
                        type="primary"
                        icon={<ProjectOutlined />}
                        onClick={() => navigate('/employee/project-management')}
                        block
                      >
                        Xem chi tiết dự án
                      </Button>
                    </Space>
                  </Card>
                </Col>
              </Row>
            )}
          </Card>
        )}

        {/* Information Cards */}
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card 
              title={<><TeamOutlined /> Thông tin hệ thống</>}
              className={styles.infoCard}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text>
                  <strong>Vai trò:</strong> {getRoleDisplayName()}
                </Text>
                {(user as any)?.department && (
                  <Text>
                    <strong>Phòng ban:</strong> {(user as any).department.department_name}
                  </Text>
                )}
              </Space>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card 
              title={<><SettingOutlined /> Hướng dẫn sử dụng</>}
              className={styles.infoCard}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text>• Sử dụng menu "Truy cập nhanh" để điều hướng đến các chức năng chính</Text>
                <Text>• Kiểm tra thông báo thường xuyên để cập nhật thông tin mới nhất</Text>
                <Text>• Liên hệ quản trị viên nếu cần hỗ trợ</Text>
              </Space>
            </Card>
          </Col>
        </Row>
      </main>

      {/* Notification Panel */}
      <NotificationPanel 
        isOpen={isNotificationPanelOpen}
        onClose={() => setIsNotificationPanelOpen(false)}
      />
    </div>
  );
};

export default Homepage;

