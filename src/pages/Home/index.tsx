import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import type { RootState } from '../../store';
// WebSocket notifications are handled by RealtimeNotifications component
import NotificationPanel from '../../components/NotificationPanel';
import styles from './Home.module.css';

const Home: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { unreadCount } = useSelector((state: RootState) => state.websocket);
  const navigate = useNavigate();
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);

  const handleLogout = () => {
    navigate('/login');
  };

  // WebSocket connection is handled by RealtimeNotifications component in App.tsx
  // No need to duplicate WebSocket connection here

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>An toàn lao động</h1>
        <div className={styles.headerActions}>
          <button 
            className={styles.notificationBtn}
            onClick={() => setIsNotificationPanelOpen(true)}
            title="Thông báo"
          >
            <i className="fas fa-bell"></i>
            {unreadCount > 0 && (
              <span className={styles.notificationBadge}>{unreadCount}</span>
            )}
          </button>
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
