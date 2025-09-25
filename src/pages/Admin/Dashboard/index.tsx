import React, { useState, useEffect } from 'react';
import styles from './Dashboard.module.css';
import userService from '../../../services/userService';
import QuickAddEmployeeModal from '../../../components/QuickAddEmployeeModal';

interface DashboardStats {
  total: number;
  active: number;
  inactive: number;
}

const DashboardPage: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [isQuickAddModalOpen, setIsQuickAddModalOpen] = useState(false);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await userService.getUserStats();
                setStats(response.data);
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const handleQuickAddSuccess = async () => {
        // Refresh stats after adding new user
        try {
            const response = await userService.getUserStats();
            setStats(response.data);
        } catch (error) {
            console.error('Error refreshing stats:', error);
        }
    };

    return (
        <div className={styles.dashboardContainer}>
            {/* Stats Cards */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <div className={`${styles.statIcon} ${styles.users}`}>
                            <i className="fas fa-users"></i>
                        </div>
                    </div>
                    <div className={styles.statNumber}>
                        {loading ? '...' : stats?.total?.toLocaleString() || '0'}
                    </div>
                    <div className={styles.statLabel}>Tổng số nhân viên</div>
                    <div className={styles.statTrend}>
                        {loading ? '...' : `${stats?.active || 0} đang hoạt động`}
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <div className={`${styles.statIcon} ${styles.projects}`}>
                            <i className="fas fa-project-diagram"></i>
                        </div>
                    </div>
                    <div className={styles.statNumber}>23</div>
                    <div className={styles.statLabel}>Dự án đang hoạt động</div>
                    <div className={styles.statTrend}>↗ +3 dự án mới</div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <div className={`${styles.statIcon} ${styles.training}`}>
                            <i className="fas fa-graduation-cap"></i>
                        </div>
                    </div>
                    <div className={styles.statNumber}>156</div>
                    <div className={styles.statLabel}>Khóa đào tạo hoàn thành</div>
                    <div className={styles.statTrend}>↗ 94% tỷ lệ hoàn thành</div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <div className={`${styles.statIcon} ${styles.safety}`}>
                            <i className="fas fa-exclamation-triangle"></i>
                        </div>
                    </div>
                    <div className={styles.statNumber}>3</div>
                    <div className={styles.statLabel}>Sự cố an toàn tháng này</div>
                    <div className={styles.statTrend}>↘ -67% so với tháng trước</div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className={styles.quickActions}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Thao tác nhanh</h2>
                </div>
                <div className={styles.actionsGrid}>
                    <button 
                        className={styles.actionBtn}
                        onClick={() => setIsQuickAddModalOpen(true)}
                    >
                        <i className="fas fa-user-plus"></i>
                        <h4>Thêm nhân viên</h4>
                        <p>Tạo tài khoản cho nhân viên mới</p>
                    </button>

                    <a href="/admin/projects" className={styles.actionBtn}>
                        <i className="fas fa-plus-circle"></i>
                        <h4>Tạo dự án mới</h4>
                        <p>Khởi tạo dự án và phân công nhân viên</p>
                    </a>

                    <a href="/admin/training" className={styles.actionBtn}>
                        <i className="fas fa-chalkboard-teacher"></i>
                        <h4>Lên lịch đào tạo</h4>
                        <p>Tạo buổi đào tạo an toàn lao động</p>
                    </a>

                    <a href="/admin/ppe" className={styles.actionBtn}>
                        <i className="fas fa-hard-hat"></i>
                        <h4>Nhập PPE</h4>
                        <p>Cập nhật kho thiết bị bảo hộ</p>
                    </a>

                    <a href="/admin/certificates" className={styles.actionBtn}>
                        <i className="fas fa-award"></i>
                        <h4>Tạo chứng chỉ</h4>
                        <p>Định nghĩa gói chứng chỉ mới</p>
                    </a>

                    <a href="/admin/reports" className={styles.actionBtn}>
                        <i className="fas fa-chart-line"></i>
                        <h4>Xem báo cáo</h4>
                        <p>Phân tích hiệu suất và an toàn</p>
                    </a>
                </div>
            </div>

            {/* Recent Activities */}
            <div className={styles.recentActivities}>
                <div className={styles.activitySection}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Hoạt động gần đây</h2>
                    </div>
                    <div className={styles.activityList}>
                        <div className={styles.activityItem}>
                            <div className={styles.activityIcon} style={{background: '#3498db'}}>
                                <i className="fas fa-user-plus"></i>
                            </div>
                            <div className={styles.activityContent}>
                                <div className={styles.activityTitle}>Thêm nhân viên mới</div>
                                <div className={styles.activityDesc}>Nguyễn Văn A đã được thêm vào phòng Kỹ thuật</div>
                                <div className={styles.activityTime}>2 giờ trước</div>
                            </div>
                        </div>
                        <div className={styles.activityItem}>
                            <div className={styles.activityIcon} style={{background: '#2ecc71'}}>
                                <i className="fas fa-graduation-cap"></i>
                            </div>
                            <div className={styles.activityContent}>
                                <div className={styles.activityTitle}>Hoàn thành đào tạo</div>
                                <div className={styles.activityDesc}>25 nhân viên hoàn thành khóa "An toàn điện"</div>
                                <div className={styles.activityTime}>4 giờ trước</div>
                            </div>
                        </div>
                        <div className={styles.activityItem}>
                            <div className={styles.activityIcon} style={{background: '#f39c12'}}>
                                <i className="fas fa-exclamation-triangle"></i>
                            </div>
                            <div className={styles.activityContent}>
                                <div className={styles.activityTitle}>Báo cáo sự cố</div>
                                <div className={styles.activityDesc}>Sự cố nhỏ tại công trường A - Đã xử lý</div>
                                <div className={styles.activityTime}>1 ngày trước</div>
                            </div>
                        </div>
                        <div className={styles.activityItem}>
                            <div className={styles.activityIcon} style={{background: '#e74c3c'}}>
                                <i className="fas fa-hard-hat"></i>
                            </div>
                            <div className={styles.activityContent}>
                                <div className={styles.activityTitle}>Phát PPE</div>
                                <div className={styles.activityDesc}>Phát 50 mũ bảo hiểm cho dự án XYZ</div>
                                <div className={styles.activityTime}>2 ngày trước</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.activitySection}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Thông báo hệ thống</h2>
                    </div>
                    <div className={styles.activityList}>
                        <div className={styles.activityItem}>
                            <div className={styles.activityIcon} style={{background: '#9b59b6'}}>
                                <i className="fas fa-bell"></i>
                            </div>
                            <div className={styles.activityContent}>
                                <div className={styles.activityTitle}>Nhắc nhở đào tạo</div>
                                <div className={styles.activityDesc}>15 nhân viên cần gia hạn chứng chỉ an toàn</div>
                                <div className={styles.activityTime}>Hôm nay</div>
                            </div>
                        </div>
                        <div className={styles.activityItem}>
                            <div className={styles.activityIcon} style={{background: '#34495e'}}>
                                <i className="fas fa-calendar"></i>
                            </div>
                            <div className={styles.activityContent}>
                                <div className={styles.activityTitle}>Lịch kiểm tra định kỳ</div>
                                <div className={styles.activityDesc}>Kiểm tra an toàn công trình B vào tuần tới</div>
                                <div className={styles.activityTime}>Ngày mai</div>
                            </div>
                        </div>
                        <div className={styles.activityItem}>
                            <div className={styles.activityIcon} style={{background: '#1abc9c'}}>
                                <i className="fas fa-sync"></i>
                            </div>
                            <div className={styles.activityContent}>
                                <div className={styles.activityTitle}>Cập nhật hệ thống</div>
                                <div className={styles.activityDesc}>Bảo trì hệ thống vào 2h sáng Chủ nhật</div>
                                <div className={styles.activityTime}>3 ngày nữa</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Add Employee Modal */}
            <QuickAddEmployeeModal
                isOpen={isQuickAddModalOpen}
                onClose={() => setIsQuickAddModalOpen(false)}
                onSuccess={handleQuickAddSuccess}
            />
        </div>
    );
};

export default DashboardPage;
