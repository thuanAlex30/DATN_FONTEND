import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import type { RootState } from '../../../store';
import { ManagerLayout } from '../../../components/Manager';
import { DashboardOutlined } from '@ant-design/icons';
import NotificationPanel from '../../../components/NotificationPanel';
import DebugUserInfo from '../../../components/DebugUserInfo';
import { projectRiskService } from '../../../services/projectRiskService';
import { projectMilestoneService } from '../../../services/projectMilestoneService';
import styles from './Dashboard.module.css';

const ManagerDashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { unreadCount } = useSelector((state: RootState) => state.websocket);
  const navigate = useNavigate();
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    totalRisks: 0,
    totalMilestones: 0,
    highPriorityRisks: 0,
    criticalMilestones: 0,
    completedMilestones: 0,
    overdueMilestones: 0
  });

  const handleLogout = () => {
    navigate('/login');
  };

  // Fetch dashboard statistics for manager
  const fetchDashboardStats = async () => {
    if (!user?.id) return;
    
    try {
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
        <div className={styles.welcomeSection}>
          <h2>Xin chào, {user?.full_name || 'Quản lý'}!</h2>
          <p>Chào mừng bạn đến với bảng điều khiển quản lý</p>
        </div>

        {/* Statistics Grid */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <div className={styles.statContent}>
              <h3>{dashboardStats.totalRisks}</h3>
              <p>Tổng rủi ro</p>
              <span className={styles.statSubtext}>
                {dashboardStats.highPriorityRisks} ưu tiên cao
              </span>
            </div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <i className="fas fa-flag-checkered"></i>
            </div>
            <div className={styles.statContent}>
              <h3>{dashboardStats.totalMilestones}</h3>
              <p>Tổng cột mốc</p>
              <span className={styles.statSubtext}>
                {dashboardStats.completedMilestones} hoàn thành
              </span>
            </div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <i className="fas fa-exclamation-circle"></i>
            </div>
            <div className={styles.statContent}>
              <h3>{dashboardStats.highPriorityRisks}</h3>
              <p>Rủi ro ưu tiên cao</p>
              <span className={styles.statSubtext}>
                Cần xử lý ngay
              </span>
            </div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <i className="fas fa-clock"></i>
            </div>
            <div className={styles.statContent}>
              <h3>{dashboardStats.overdueMilestones}</h3>
              <p>Cột mốc quá hạn</p>
              <span className={styles.statSubtext}>
                Cần theo dõi
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className={styles.quickActions}>
          <h3>Thao tác quản lý</h3>
          <div className={styles.actionButtons}>
            <button 
              className={styles.actionButton}
              onClick={() => navigate('/manager/ppe')}
            >
              <i className="fas fa-hard-hat"></i>
              Quản lý PPE
            </button>
            <button 
              className={styles.actionButton}
              onClick={() => navigate('/manager/project-management')}
            >
              <i className="fas fa-project-diagram"></i>
              Quản lý dự án
            </button>
            <button 
              className={styles.actionButton}
              onClick={() => navigate('/manager/ppe')}
            >
              <i className="fas fa-user-hard-hat"></i>
              PPE của tôi
            </button>
            <button 
              className={styles.actionButton}
              onClick={() => navigate('/manager/training')}
            >
              <i className="fas fa-book"></i>
              Đào tạo
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className={styles.recentActivity}>
          <h3>Hoạt động gần đây</h3>
          <div className={styles.activityList}>
            <div className={styles.activityItem}>
              <div className={styles.activityIcon}>
                <i className="fas fa-plus"></i>
              </div>
              <div className={styles.activityContent}>
                <p>Thêm rủi ro mới</p>
                <span>2 giờ trước</span>
              </div>
            </div>
            <div className={styles.activityItem}>
              <div className={styles.activityIcon}>
                <i className="fas fa-check"></i>
              </div>
              <div className={styles.activityContent}>
                <p>Hoàn thành cột mốc dự án</p>
                <span>4 giờ trước</span>
              </div>
            </div>
            <div className={styles.activityItem}>
              <div className={styles.activityIcon}>
                <i className="fas fa-user"></i>
              </div>
              <div className={styles.activityContent}>
                <p>Phân công nhân viên mới</p>
                <span>1 ngày trước</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Notification Panel */}
      {isNotificationPanelOpen && (
        <NotificationPanel 
          isOpen={isNotificationPanelOpen}
          onClose={() => setIsNotificationPanelOpen(false)}
        />
      )}

      {/* Debug User Info */}
      <DebugUserInfo />

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
