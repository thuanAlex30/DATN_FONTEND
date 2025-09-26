import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import type { RootState } from '../../store';
import styles from './Profile.module.css';

const ProfilePage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);

  console.log('ProfilePage - user:', user);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.profileContainer}>
      {/* Header */}
      <header className={styles.profileHeader}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <Link to="/home" className={styles.backButton}>
              <i className="fas fa-arrow-left"></i>
              <span>Quay lại</span>
            </Link>
            <h1 className={styles.headerTitle}>Thông tin cá nhân</h1>
          </div>
          <div className={styles.headerRight}>
            <button 
              className={styles.notificationButton}
              onClick={() => setIsNotificationPanelOpen(!isNotificationPanelOpen)}
            >
              <i className="fas fa-bell"></i>
              <span className={styles.notificationBadge}>3</span>
            </button>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user.full_name}</span>
              <span className={styles.userRole}>{user.role?.role_name}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className={styles.profileContent}>
        <div className={styles.profileCard}>
          {/* Avatar Section */}
          <div className={styles.avatarSection}>
            <Link to="/profile/change-avatar" className={styles.avatarContainer}>
              <img 
                src={'https://via.placeholder.com/150/4F46E5/FFFFFF?text=' + user.full_name?.charAt(0)} 
                alt="Avatar" 
                className={styles.avatar}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://via.placeholder.com/150/4F46E5/FFFFFF?text=' + user.full_name?.charAt(0);
                }}
              />
              <div className={styles.avatarOverlay}>
                <i className="fas fa-camera"></i>
              </div>
            </Link>
            <h2 className={styles.userFullName}>{user.full_name}</h2>
            <p className={styles.userPosition}>{user.role?.role_name}</p>
            <p className={styles.userDepartment}>Nhân viên</p>
          </div>

          {/* Profile Information */}
          <div className={styles.profileInfo}>
            <div className={styles.infoSection}>
              <h3 className={styles.sectionTitle}>
                <i className="fas fa-user"></i>
                Thông tin cơ bản
              </h3>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <label className={styles.infoLabel}>Họ và tên</label>
                  <span className={styles.infoValue}>{user.full_name}</span>
                </div>
                <div className={styles.infoItem}>
                  <label className={styles.infoLabel}>Email</label>
                  <span className={styles.infoValue}>{user.email}</span>
                </div>
                <div className={styles.infoItem}>
                  <label className={styles.infoLabel}>Số điện thoại</label>
                  <span className={styles.infoValue}>{user.phone || 'Chưa cập nhật'}</span>
                </div>
                <div className={styles.infoItem}>
                  <label className={styles.infoLabel}>Username</label>
                  <span className={styles.infoValue}>{user.username}</span>
                </div>
                <div className={styles.infoItem}>
                  <label className={styles.infoLabel}>ID</label>
                  <span className={styles.infoValue}>{user.id}</span>
                </div>
                <div className={styles.infoItem}>
                  <label className={styles.infoLabel}>Lần đăng nhập cuối</label>
                  <span className={styles.infoValue}>
                    {user.last_login ? new Date(user.last_login).toLocaleDateString('vi-VN') : 'Chưa có'}
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.infoSection}>
              <h3 className={styles.sectionTitle}>
                <i className="fas fa-briefcase"></i>
                Thông tin công việc
              </h3>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <label className={styles.infoLabel}>Vai trò</label>
                  <span className={styles.infoValue}>{user.role?.role_name || 'Chưa cập nhật'}</span>
                </div>
                <div className={styles.infoItem}>
                  <label className={styles.infoLabel}>Quyền hạn</label>
                  <span className={styles.infoValue}>
                    {user.role?.permissions ? Object.keys(user.role.permissions).length + ' quyền' : 'Chưa có'}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <label className={styles.infoLabel}>Trạng thái vai trò</label>
                  <span className={`${styles.statusBadge} ${user.role?.is_active ? styles.active : styles.inactive}`}>
                    {user.role?.is_active ? 'Hoạt động' : 'Không hoạt động'}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <label className={styles.infoLabel}>Trạng thái tài khoản</label>
                  <span className={`${styles.statusBadge} ${user.is_active ? styles.active : styles.inactive}`}>
                    {user.is_active ? 'Hoạt động' : 'Không hoạt động'}
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.infoSection}>
              <h3 className={styles.sectionTitle}>
                <i className="fas fa-certificate"></i>
                Chứng chỉ và đào tạo
              </h3>
              <div className={styles.certificatesList}>
                <div className={styles.certificateItem}>
                  <div className={styles.certificateIcon}>
                    <i className="fas fa-certificate"></i>
                  </div>
                  <div className={styles.certificateInfo}>
                    <h4>Chứng chỉ An toàn Lao động</h4>
                    <p>Ngày cấp: 15/03/2024</p>
                    <p>Hết hạn: 15/03/2025</p>
                  </div>
                  <div className={styles.certificateStatus}>
                    <span className={styles.statusValid}>Còn hiệu lực</span>
                  </div>
                </div>
                <div className={styles.certificateItem}>
                  <div className={styles.certificateIcon}>
                    <i className="fas fa-certificate"></i>
                  </div>
                  <div className={styles.certificateInfo}>
                    <h4>Chứng chỉ PCCC</h4>
                    <p>Ngày cấp: 20/02/2024</p>
                    <p>Hết hạn: 20/02/2025</p>
                  </div>
                  <div className={styles.certificateStatus}>
                    <span className={styles.statusValid}>Còn hiệu lực</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className={styles.actionButtons}>
            <Link 
              to="/profile/edit"
              className={styles.editButton}
            >
              <i className="fas fa-edit"></i>
              Chỉnh sửa thông tin
            </Link>
            <Link 
              to="/profile/change-password"
              className={styles.changePasswordButton}
            >
              <i className="fas fa-key"></i>
              Đổi mật khẩu
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ProfilePage;
