import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button, Spin, Card, Row, Col, Statistic } from 'antd';
import { 
  DashboardOutlined, 
  ExclamationCircleOutlined, 
  FlagOutlined, 
  WarningOutlined, 
  ClockCircleOutlined,
  SafetyOutlined,
  ProjectOutlined,
  UserOutlined,
  BookOutlined,
  ThunderboltOutlined,
  SearchOutlined
} from '@ant-design/icons';
import type { RootState } from '../../../store';
import { logout } from '../../../store/slices/authSlice';
import { ManagerLayout } from '../../../components/Manager';
import NotificationPanel from '../../../components/NotificationPanel';
import { projectRiskService } from '../../../services/projectRiskService';
import { projectMilestoneService } from '../../../services/projectMilestoneService';
import styles from './Dashboard.module.css';

const ManagerDashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { unreadCount } = useSelector((state: RootState) => state.websocket);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    totalRisks: 0,
    totalMilestones: 0,
    highPriorityRisks: 0,
    criticalMilestones: 0,
    completedMilestones: 0,
    overdueMilestones: 0
  });

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  // Fetch dashboard statistics for manager
  const fetchDashboardStats = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const [risksResponse, milestonesResponse] = await Promise.all([
        projectRiskService.getAllRisks(),
        projectMilestoneService.getAllMilestones()
      ]);

      const risks = risksResponse.data || [];
      const milestones = milestonesResponse.data || [];

      setDashboardStats({
        totalRisks: risks.length,
        totalMilestones: milestones.length,
        highPriorityRisks: risks.filter((risk: any) => risk.priority === 'high').length,
        criticalMilestones: milestones.filter((milestone: any) => milestone.priority === 'critical').length,
        completedMilestones: milestones.filter((milestone: any) => milestone.status === 'completed').length,
        overdueMilestones: milestones.filter((milestone: any) => 
          new Date(milestone.due_date) < new Date() && milestone.status !== 'completed'
        ).length
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, [user]);


  return (
    <ManagerLayout
      title="Manager Dashboard"
      icon={<DashboardOutlined />}
      onLogout={handleLogout}
      headerExtra={
        <div className={styles.headerActions}>
          <button 
            className={styles.notificationButton}
            onClick={() => setIsNotificationPanelOpen(!isNotificationPanelOpen)}
          >
            <i className="fas fa-bell"></i>
            {unreadCount > 0 && <span className={styles.notificationBadge}>{unreadCount}</span>}
          </button>
        </div>
      }
    >
      <div className={styles.dashboardContent}>
        {/* Welcome Section */}
        <Card className={styles.welcomeCard}>
          <div className={styles.welcomeContent}>
            <div className={styles.welcomeIcon}>
              <ThunderboltOutlined />
            </div>
            <div>
              <h2>Xin chào, {user?.full_name || 'Quản lý'}!</h2>
              <p>Chào mừng bạn đến với bảng điều khiển quản lý</p>
            </div>
          </div>
        </Card>

        {/* Statistics Grid */}
        {loading ? (
          <div className={styles.loadingContainer}>
            <Spin size="large" />
          </div>
        ) : (
          <Row gutter={[16, 16]} className={styles.statsRow}>
            <Col xs={24} sm={12} lg={6}>
              <Card className={styles.statCard} hoverable>
                <Statistic
                  title="Tổng rủi ro"
                  value={dashboardStats.totalRisks}
                  prefix={<ExclamationCircleOutlined />}
                  valueStyle={{ color: '#ff4d4f' }}
                  suffix={
                    dashboardStats.highPriorityRisks > 0 && (
                      <span className={styles.badge}>{dashboardStats.highPriorityRisks} ưu tiên cao</span>
                    )
                  }
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className={styles.statCard} hoverable>
                <Statistic
                  title="Tổng cột mốc"
                  value={dashboardStats.totalMilestones}
                  prefix={<FlagOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                  suffix={
                    <span className={styles.badge}>{dashboardStats.completedMilestones} hoàn thành</span>
                  }
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className={styles.statCard} hoverable>
                <Statistic
                  title="Rủi ro ưu tiên cao"
                  value={dashboardStats.highPriorityRisks}
                  prefix={<WarningOutlined />}
                  valueStyle={{ color: '#faad14' }}
                  suffix={<span className={styles.badge}>Cần xử lý ngay</span>}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className={styles.statCard} hoverable>
                <Statistic
                  title="Cột mốc quá hạn"
                  value={dashboardStats.overdueMilestones}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#ff4d4f' }}
                  suffix={<span className={styles.badge}>Cần theo dõi</span>}
                />
              </Card>
            </Col>
          </Row>
        )}

        {/* Quick Actions */}
        <Card title={<span className={styles.sectionTitle}>Thao tác quản lý</span>} className={styles.quickActionsCard}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <Button
                type="primary"
                size="large"
                icon={<SafetyOutlined />}
                className={styles.actionButton}
                onClick={() => navigate('/manager/ppe')}
                block
              >
                Quản lý PPE
              </Button>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Button
                type="primary"
                size="large"
                icon={<ProjectOutlined />}
                className={styles.actionButton}
                onClick={() => navigate('/manager/project-management')}
                block
              >
                Quản lý dự án
              </Button>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Button
                type="primary"
                size="large"
                icon={<UserOutlined />}
                className={styles.actionButton}
                onClick={() => navigate('/manager/ppe')}
                block
              >
                PPE của tôi
              </Button>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Button
                type="primary"
                size="large"
                icon={<BookOutlined />}
                className={styles.actionButton}
                onClick={() => navigate('/manager/training')}
                block
              >
                Đào tạo
              </Button>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Button
                type="primary"
                size="large"
                icon={<SearchOutlined />}
                className={styles.actionButton}
                onClick={() => navigate('/manager/incidents/assigned')}
                block
                style={{ 
                  background: 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)',
                  borderColor: '#ff4d4f',
                  boxShadow: '0 4px 12px rgba(255, 77, 79, 0.25)'
                }}
              >
                Điều tra sự cố
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Recent Activity */}
        <Card title={<span className={styles.sectionTitle}>Hoạt động gần đây</span>} className={styles.recentActivityCard}>
          <div className={styles.activityList}>
            <div className={styles.activityItem}>
              <div className={`${styles.activityIcon} ${styles.iconAdd}`}>
                <ThunderboltOutlined />
              </div>
              <div className={styles.activityContent}>
                <p>Thêm rủi ro mới</p>
                <span>2 giờ trước</span>
              </div>
            </div>
            <div className={styles.activityItem}>
              <div className={`${styles.activityIcon} ${styles.iconCheck}`}>
                <FlagOutlined />
              </div>
              <div className={styles.activityContent}>
                <p>Hoàn thành cột mốc dự án</p>
                <span>4 giờ trước</span>
              </div>
            </div>
            <div className={styles.activityItem}>
              <div className={`${styles.activityIcon} ${styles.iconUser}`}>
                <UserOutlined />
              </div>
              <div className={styles.activityContent}>
                <p>Phân công nhân viên mới</p>
                <span>1 ngày trước</span>
              </div>
            </div>
          </div>
        </Card>

      </div>

      {/* Notification Panel */}
      {isNotificationPanelOpen && (
        <NotificationPanel 
          isOpen={isNotificationPanelOpen}
          onClose={() => setIsNotificationPanelOpen(false)}
        />
      )}

      {/* Test PPE Access Button */}
      <div style={{ 
        position: 'fixed', 
        bottom: 20, 
        right: 20, 
        zIndex: 9999 
      }}>
        <Button 
          type="primary" 
          onClick={() => navigate('/manager/ppe')}
          style={{ 
            background: '#52c41a',
            borderColor: '#52c41a'
          }}
        >
          🧪 Test PPE Access
        </Button>
      </div>
    </ManagerLayout>
  );
};

export default ManagerDashboard;
