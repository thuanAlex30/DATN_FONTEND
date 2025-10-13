import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import type { RootState } from '../../store';
// WebSocket notifications are handled by NotificationPanel component
import NotificationPanel from '../../components/NotificationPanel';
import { projectRiskService } from '../../services/projectRiskService';
import { projectMilestoneService } from '../../services/projectMilestoneService';
import styles from './Home.module.css';

const Home: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { unreadCount } = useSelector((state: RootState) => state.websocket);
  const navigate = useNavigate();
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [assignedTasks, setAssignedTasks] = useState({
    risks: 0,
    milestones: 0,
    highPriorityRisks: 0,
    criticalMilestones: 0
  });
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    navigate('/login');
  };

  // Fetch assigned tasks for the current user
  useEffect(() => {
    const fetchAssignedTasks = async () => {
      if (!user?.id || user?.role?.role_name !== 'manager') return;
      
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
  }, [user]);

  // WebSocket connection is handled by RealtimeNotifications component in App.tsx
  // No need to duplicate WebSocket connection here

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>An toàn lao động</h1>
        <div className={styles.headerActions}>
          <div className={styles.userInfo}>
            <span>Xin chào, {user?.full_name || 'Người dùng'}</span>
          </div>
        </div>
      </header>

      {/* New layout: Sidebar + Content */}
      <div className={styles.layout}>
        <aside className={styles.homeSidebar}>
          <div className={styles.homeSidebarHeader}>
            <h3 className={styles.homeSidebarTitle}>Menu</h3>
          </div>
          <nav className={styles.homeSidebarNav}>
            <Link to="/home" className={styles.homeNavItem}>
              <i className="fas fa-home"></i> Trang chủ
            </Link>
            <Link to="#" className={styles.homeNavItem}>
              <i className="fas fa-id-card"></i> Thông tin cá nhân
            </Link>
            {user?.role?.role_name === 'employee' && (
              <Link to="/employee/incidents/report" className={styles.homeNavItem}>
                <i className="fas fa-exclamation-circle"></i> Báo cáo sự cố
              </Link>
            )}
            <Link to="/employee/training" className={styles.homeNavItem}>
              <i className="fas fa-book"></i> Đào tạo
            </Link>
            <Link to="/employee/ppe" className={styles.homeNavItem}>
              <i className="fas fa-hard-hat"></i> PPE cá nhân
            </Link>
            {user?.role?.role_name === 'manager' && (
              <Link to="/employee/project-management" className={styles.homeNavItem}>
                <i className="fas fa-project-diagram"></i> Quản lý dự án
              </Link>
            )}
            <Link to="#" className={styles.homeNavItem}>
              <i className="fas fa-award"></i> Chứng chỉ
            </Link>
          </nav>
          <div className={styles.homeSidebarFooter}>
            <button onClick={handleLogout} className={styles.homeLogoutBtn}>
              <i className="fas fa-sign-out-alt"></i> Đăng xuất
            </button>
          </div>
        </aside>

        <main className={styles.homeContent}>
          <div className={styles.welcome}>
            <h2>Chào mừng đến với hệ thống quản lý an toàn lao động</h2>
            <p>Đây là trang chủ dành cho người dùng thông thường.</p>
          </div>

          <div className={styles.features}>
            <div className={styles.featureCard}>
              <h3>Thông tin cá nhân</h3>
              <p>Xem và cập nhật thông tin cá nhân của bạn</p>
            </div>

            <div className={styles.featureCard}>
              <h3>Lịch sử đào tạo</h3>
              <p>Xem lịch sử các khóa đào tạo an toàn lao động</p>
            </div>

            <div className={styles.featureCard}>
              <h3>Chứng chỉ</h3>
              <p>Xem các chứng chỉ an toàn lao động của bạn</p>
            </div>
          </div>

          {/* Assigned Tasks Section */}
          {user?.role?.role_name === 'manager' && (
            <div className={styles.assignedTasks}>
              <h3>Nhiệm vụ được giao</h3>
              {loading ? (
                <div className={styles.loading}>Đang tải thông tin nhiệm vụ...</div>
              ) : (
                <div className={styles.taskStats}>
                  <div className={styles.taskStatItem}>
                    <div className={styles.taskStatNumber}>{assignedTasks.risks}</div>
                    <div className={styles.taskStatLabel}>Rủi ro được giao</div>
                    {assignedTasks.highPriorityRisks > 0 && (
                      <div className={styles.taskStatAlert}>
                        {assignedTasks.highPriorityRisks} rủi ro ưu tiên cao
                      </div>
                    )}
                  </div>
                  <div className={styles.taskStatItem}>
                    <div className={styles.taskStatNumber}>{assignedTasks.milestones}</div>
                    <div className={styles.taskStatLabel}>Cột mốc được giao</div>
                    {assignedTasks.criticalMilestones > 0 && (
                      <div className={styles.taskStatAlert}>
                        {assignedTasks.criticalMilestones} cột mốc quan trọng
                      </div>
                    )}
                  </div>
                  <div className={styles.taskActions}>
                    <button 
                      className={styles.taskActionBtn}
                      onClick={() => navigate('/employee/project-management')}
                    >
                      <i className="fas fa-project-diagram"></i>
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Notification Panel */}
      <NotificationPanel 
        isOpen={isNotificationPanelOpen}
        onClose={() => setIsNotificationPanelOpen(false)}
      />
    </div>
  );
};

export default Home;
