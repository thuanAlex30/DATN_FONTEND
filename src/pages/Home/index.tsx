import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../../store';
import styles from './Home.module.css';

const Home: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  const handleLogout = () => {
    // 这里可以添加登出逻辑
    navigate('/login');
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>An toàn lao động</h1>
        <div className={styles.userInfo}>
          <span>Xin chào, {user?.full_name || 'Người dùng'}</span>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            Đăng xuất
          </button>
        </div>
      </header>
      
      <main className={styles.main}>
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
  );
};

export default Home;
