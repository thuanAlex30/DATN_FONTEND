import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../../../store';
import { logout } from '../../../store/slices/authSlice';
import { EmployeeLayout } from '../../../components/Employee';
import { HomeOutlined } from '@ant-design/icons';
import NotificationPanel from '../../../components/NotificationPanel';
import { projectRiskService } from '../../../services/projectRiskService';
import { projectMilestoneService } from '../../../services/projectMilestoneService';
import styles from './Dashboard.module.css';

const EmployeeDashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { unreadCount } = useSelector((state: RootState) => state.websocket);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
      const [assignedTasks, setAssignedTasks] = useState({
        risks: 0,
        milestones: 0,
        highPriorityRisks: 0,
        criticalMilestones: 0
      });

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  // Fetch assigned tasks for the current user
  const fetchAssignedTasks = async () => {
    if (!user?.id) return;
    
    try {
      const [risksResponse, milestonesResponse] = await Promise.all([
        projectRiskService.getAssignedRisks(user.id),
        projectMilestoneService.getAssignedMilestones(user.id)
      ]);

      const risks = risksResponse.data || [];
      const milestones = milestonesResponse.data || [];

      setAssignedTasks({
        risks: risks.length,
        milestones: milestones.length,
        highPriorityRisks: risks.filter((risk: any) => risk.priority === 'high').length,
        criticalMilestones: milestones.filter((milestone: any) => milestone.priority === 'critical').length
      });
    } catch (error) {
      console.error('Error fetching assigned tasks:', error);
    }
  };

  useEffect(() => {
    fetchAssignedTasks();
  }, [user]);

  return (
    <EmployeeLayout
      title="Employee Dashboard"
      icon={<HomeOutlined />}
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
          <h2>Xin chào, {user?.full_name || 'Nhân viên'}!</h2>
          <p>Chào mừng bạn đến với hệ thống quản lý an toàn lao động</p>
        </div>

        {/* Quick Stats */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <div className={styles.statContent}>
              <h3>{assignedTasks.risks}</h3>
              <p>Rủi ro được giao</p>
            </div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <i className="fas fa-flag-checkered"></i>
            </div>
            <div className={styles.statContent}>
              <h3>{assignedTasks.milestones}</h3>
              <p>Cột mốc được giao</p>
            </div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <i className="fas fa-exclamation-circle"></i>
            </div>
            <div className={styles.statContent}>
              <h3>{assignedTasks.highPriorityRisks}</h3>
              <p>Rủi ro ưu tiên cao</p>
            </div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <i className="fas fa-star"></i>
            </div>
            <div className={styles.statContent}>
              <h3>{assignedTasks.criticalMilestones}</h3>
              <p>Cột mốc quan trọng</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className={styles.quickActions}>
          <h3>Thao tác nhanh</h3>
          <div className={styles.actionButtons}>
            <button 
              className={styles.actionButton}
              onClick={() => navigate('/employee/incidents/report')}
            >
              <i className="fas fa-exclamation-circle"></i>
              Báo cáo sự cố
            </button>
            <button 
              className={styles.actionButton}
              onClick={() => navigate('/employee/training')}
            >
              <i className="fas fa-book"></i>
              Đào tạo
            </button>
            <button 
              className={styles.actionButton}
              onClick={() => navigate('/employee/ppe')}
            >
              <i className="fas fa-hard-hat"></i>
              PPE cá nhân
            </button>
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
    </EmployeeLayout>
  );
};

export default EmployeeDashboard;
