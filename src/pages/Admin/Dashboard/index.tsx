import React, { useState, useEffect } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Button, 
  Typography, 
  Avatar, 
  Spin
} from 'antd';
import styles from './Dashboard.module.css';
import {
  UserOutlined,
  ProjectOutlined,
  BookOutlined,
  ExclamationCircleOutlined,
  UserAddOutlined,
  FileAddOutlined,
  SafetyOutlined,
  TrophyOutlined,
  BarChartOutlined,
  BellOutlined,
  CalendarOutlined,
  SyncOutlined
} from '@ant-design/icons';
import userService from '../../../services/userService';
import projectService from '../../../services/projectService';
import * as ppeService from '../../../services/ppeService';
import SystemLogService from '../../../services/SystemLogService';
import notificationService from '../../../services/notificationService';
import QuickAddEmployeeModal from '../../../components/QuickAddEmployeeModal';

interface DashboardStats {
  total: number;
  active: number;
  inactive: number;
  projects: {
    total: number;
    active: number;
    completed: number;
  };
  training: {
    total: number;
    completed: number;
    completionRate: number;
  };
  incidents: {
    total: number;
    thisMonth: number;
    lastMonth: number;
  };
  ppe: {
    totalItems: number;
    lowStock: number;
    totalIssuances: number;
  };
}

const DashboardPage: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [isQuickAddModalOpen, setIsQuickAddModalOpen] = useState(false);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                
                // Fetch all dashboard data in parallel
                const [
                    userStats,
                    projects,
                    ppeData
                ] = await Promise.all([
                    userService.getUserStats(),
                    projectService.getAllProjects(),
                    ppeService.getDashboardData()
                ]);

                // Calculate project stats
                const projectsList = projects.data || [];
                const activeProjects = projectsList.filter((p: any) => p.status === 'ACTIVE' || p.status === 'IN_PROGRESS').length;
                const completedProjects = projectsList.filter((p: any) => p.status === 'COMPLETED').length;

                // Calculate training completion rate (mock data)
                const completedTrainings = 25; // Mock data
                const completionRate = 85; // Mock data

                // Calculate incident stats (mock data)
                const thisMonthIncidents = 3; // Mock data
                const lastMonthIncidents = 5; // Mock data

                // Calculate PPE stats
                const lowStockItems = ppeData.lowStockAlerts?.length || 0;
                const totalIssuances = ppeData.totalIssuances || 0;

                setStats({
                    total: userStats.data.total,
                    active: userStats.data.active,
                    inactive: userStats.data.inactive,
                    projects: {
                        total: projectsList.length,
                        active: activeProjects,
                        completed: completedProjects
                    },
                    training: {
                        total: 30, // Mock data
                        completed: completedTrainings,
                        completionRate
                    },
                    incidents: {
                        total: 12, // Mock data
                        thisMonth: thisMonthIncidents,
                        lastMonth: lastMonthIncidents
                    },
                    ppe: {
                        totalItems: ppeData.totalItems || 0,
                        lowStock: lowStockItems,
                        totalIssuances
                    }
                });
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };

        const fetchRecentActivities = async () => {
            try {
                setActivitiesLoading(true);
                const activities = await SystemLogService.getRecentActivities();
                setRecentActivities(activities || []);
            } catch (error) {
                console.error('Error loading recent activities:', error);
                setRecentActivities([]);
            } finally {
                setActivitiesLoading(false);
            }
        };

        const fetchNotifications = async () => {
            try {
                setNotificationsLoading(true);
                const response = await notificationService.getNotifications();
                setNotifications(response.notifications || []);
            } catch (error) {
                console.error('Error loading notifications:', error);
                // Set empty notifications array to prevent rendering issues
                setNotifications([]);
            } finally {
                setNotificationsLoading(false);
            }
        };

        fetchStats();
        fetchRecentActivities();
        fetchNotifications();
    }, []);

    const handleQuickAddSuccess = async () => {
        // Refresh stats after adding new user
        try {
            const response = await userService.getUserStats();
            // Create a partial stats object with the updated user data
            const updatedStats = {
                total: response.data.total,
                active: response.data.active,
                inactive: response.data.inactive,
                projects: stats?.projects || { total: 0, active: 0, completed: 0 },
                training: stats?.training || { total: 0, completed: 0, completionRate: 0 },
                incidents: stats?.incidents || { total: 0, thisMonth: 0, lastMonth: 0 },
                ppe: stats?.ppe || { totalItems: 0, lowStock: 0, totalIssuances: 0 }
            };
            setStats(updatedStats);
        } catch (error) {
            console.error('Error refreshing stats:', error);
        }
    };

    const { Title } = Typography;

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <Spin size="large" className={styles.loadingSpinner} />
            </div>
        );
    }

    return (
        <div className={styles.dashboardContainer}>
            <div className={styles.dashboardContent}>
                {/* Stats Cards */}
                <div className={styles.statsSection}>
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12} lg={6}>
                            <Card className={`${styles.statsCard} ${styles.primary}`}>
                                <div className={styles.statisticContent}>
                                    <UserOutlined className={styles.statisticIcon} style={{ color: '#1890ff' }} />
                                    <div className={styles.statisticTitle}>Tổng số nhân viên</div>
                                    <div className={styles.statisticValue}>{stats?.total || 0}</div>
                                    <div className={styles.statisticSuffix}>
                                        {stats?.active || 0} đang hoạt động
                                    </div>
                                </div>
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                            <Card className={`${styles.statsCard} ${styles.success}`}>
                                <div className={styles.statisticContent}>
                                    <ProjectOutlined className={styles.statisticIcon} style={{ color: '#52c41a' }} />
                                    <div className={styles.statisticTitle}>Dự án đang hoạt động</div>
                                    <div className={styles.statisticValue}>{stats?.projects.active || 0}</div>
                                    <div className={styles.statisticSuffix}>
                                        {stats?.projects.total || 0} tổng dự án
                                    </div>
                                </div>
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                            <Card className={`${styles.statsCard} ${styles.warning}`}>
                                <div className={styles.statisticContent}>
                                    <BookOutlined className={styles.statisticIcon} style={{ color: '#faad14' }} />
                                    <div className={styles.statisticTitle}>Khóa đào tạo hoàn thành</div>
                                    <div className={styles.statisticValue}>{stats?.training.completed || 0}</div>
                                    <div className={styles.statisticSuffix}>
                                        ↗ {stats?.training.completionRate || 0}% tỷ lệ hoàn thành
                                    </div>
                                </div>
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                            <Card className={`${styles.statsCard} ${styles.danger}`}>
                                <div className={styles.statisticContent}>
                                    <ExclamationCircleOutlined className={styles.statisticIcon} style={{ color: '#f5222d' }} />
                                    <div className={styles.statisticTitle}>Sự cố an toàn tháng này</div>
                                    <div className={styles.statisticValue}>{stats?.incidents.thisMonth || 0}</div>
                                    <div className={styles.statisticSuffix}>
                                        {stats?.incidents.lastMonth ? 
                                            (stats.incidents.thisMonth < stats.incidents.lastMonth ? '↘' : '↗') + 
                                            ' ' + Math.round(((stats.incidents.thisMonth - stats.incidents.lastMonth) / stats.incidents.lastMonth) * 100) + '% so với tháng trước' :
                                            'So với tháng trước'
                                        }
                                    </div>
                                </div>
                            </Card>
                        </Col>
                    </Row>
                </div>

                {/* Quick Actions */}
                <div className={styles.quickActionsSection}>
                    <Card className={styles.quickActionsCard}>
                        <div className={styles.quickActionsHeader}>
                            <Title level={3} className={styles.quickActionsTitle}>Thao tác nhanh</Title>
                        </div>
                        <div className={styles.quickActionsGrid}>
                            <Row gutter={[16, 16]}>
                                <Col xs={24} sm={12} md={8} lg={6}>
                                    <Button
                                        type="dashed"
                                        size="large"
                                        block
                                        icon={<UserAddOutlined />}
                                        onClick={() => setIsQuickAddModalOpen(true)}
                                        className={styles.quickActionButton}
                                    >
                                        <UserAddOutlined className={styles.quickActionIcon} />
                                        <div className={styles.quickActionContent}>
                                            <div className={styles.quickActionTitle}>Thêm nhân viên</div>
                                            <div className={styles.quickActionDescription}>Tạo tài khoản cho nhân viên mới</div>
                                        </div>
                                    </Button>
                                </Col>
                                <Col xs={24} sm={12} md={8} lg={6}>
                                    <Button
                                        type="dashed"
                                        size="large"
                                        block
                                        icon={<FileAddOutlined />}
                                        href="/admin/project-management"
                                        className={styles.quickActionButton}
                                    >
                                        <FileAddOutlined className={styles.quickActionIcon} />
                                        <div className={styles.quickActionContent}>
                                            <div className={styles.quickActionTitle}>Tạo dự án mới</div>
                                            <div className={styles.quickActionDescription}>Khởi tạo dự án và phân công nhân viên</div>
                                        </div>
                                    </Button>
                                </Col>
                                <Col xs={24} sm={12} md={8} lg={6}>
                                    <Button
                                        type="dashed"
                                        size="large"
                                        block
                                        icon={<BookOutlined />}
                                        href="/admin/training-management"
                                        className={styles.quickActionButton}
                                    >
                                        <BookOutlined className={styles.quickActionIcon} />
                                        <div className={styles.quickActionContent}>
                                            <div className={styles.quickActionTitle}>Lên lịch đào tạo</div>
                                            <div className={styles.quickActionDescription}>Tạo buổi đào tạo an toàn lao động</div>
                                        </div>
                                    </Button>
                                </Col>
                                <Col xs={24} sm={12} md={8} lg={6}>
                                    <Button
                                        type="dashed"
                                        size="large"
                                        block
                                        icon={<SafetyOutlined />}
                                        href="/admin/ppe-management"
                                        className={styles.quickActionButton}
                                    >
                                        <SafetyOutlined className={styles.quickActionIcon} />
                                        <div className={styles.quickActionContent}>
                                            <div className={styles.quickActionTitle}>Nhập PPE</div>
                                            <div className={styles.quickActionDescription}>Cập nhật kho thiết bị bảo hộ</div>
                                        </div>
                                    </Button>
                                </Col>
                                <Col xs={24} sm={12} md={8} lg={6}>
                                    <Button
                                        type="dashed"
                                        size="large"
                                        block
                                        icon={<TrophyOutlined />}
                                        href="/admin/certificate-management"
                                        className={styles.quickActionButton}
                                    >
                                        <TrophyOutlined className={styles.quickActionIcon} />
                                        <div className={styles.quickActionContent}>
                                            <div className={styles.quickActionTitle}>Tạo chứng chỉ</div>
                                            <div className={styles.quickActionDescription}>Định nghĩa gói chứng chỉ mới</div>
                                        </div>
                                    </Button>
                                </Col>
                                <Col xs={24} sm={12} md={8} lg={6}>
                                    <Button
                                        type="dashed"
                                        size="large"
                                        block
                                        icon={<BarChartOutlined />}
                                        href="/admin/reports"
                                        className={styles.quickActionButton}
                                    >
                                        <BarChartOutlined className={styles.quickActionIcon} />
                                        <div className={styles.quickActionContent}>
                                            <div className={styles.quickActionTitle}>Xem báo cáo</div>
                                            <div className={styles.quickActionDescription}>Phân tích hiệu suất và an toàn</div>
                                        </div>
                                    </Button>
                                </Col>
                            </Row>
                        </div>
                    </Card>
                </div>

                {/* Recent Activities */}
                <div className={styles.activitiesSection}>
                    <Row gutter={[16, 16]}>
                        <Col xs={24} lg={12}>
                            <Card className={styles.activityCard}>
                                <div className={styles.activityCardHeader}>
                                    <Title level={3} className={styles.activityCardTitle}>Hoạt động gần đây</Title>
                                </div>
                                {activitiesLoading ? (
                                    <div className={styles.emptyState}>
                                        <Spin className={styles.loadingSpinner} />
                                    </div>
                                ) : (
                                    <div className={styles.activityList}>
                                        {(recentActivities.length > 0 ? recentActivities : [
                                            {
                                                icon: <UserAddOutlined />,
                                                color: '#1890ff',
                                                title: 'Thêm nhân viên mới',
                                                description: 'Nguyễn Văn A đã được thêm vào phòng Kỹ thuật',
                                                time: '2 giờ trước'
                                            },
                                            {
                                                icon: <BookOutlined />,
                                                color: '#52c41a',
                                                title: 'Hoàn thành đào tạo',
                                                description: '25 nhân viên hoàn thành khóa "An toàn điện"',
                                                time: '4 giờ trước'
                                            },
                                            {
                                                icon: <ExclamationCircleOutlined />,
                                                color: '#faad14',
                                                title: 'Báo cáo sự cố',
                                                description: 'Sự cố nhỏ tại công trường A - Đã xử lý',
                                                time: '1 ngày trước'
                                            },
                                            {
                                                icon: <SafetyOutlined />,
                                                color: '#f5222d',
                                                title: 'Phát PPE',
                                                description: 'Phát 50 mũ bảo hiểm cho dự án XYZ',
                                                time: '2 ngày trước'
                                            }
                                        ]).map((item, index) => (
                                            <div key={index} className={styles.activityItem}>
                                                <Avatar 
                                                    className={styles.activityAvatar}
                                                    style={{ backgroundColor: item.color || '#1890ff' }} 
                                                    icon={item.icon}
                                                />
                                                <div className={styles.activityContent}>
                                                    <div className={styles.activityTitle}>{item.title}</div>
                                                    <div className={styles.activityDescription}>{item.description}</div>
                                                    <div className={styles.activityTime}>{item.time}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Card>
                        </Col>
                        <Col xs={24} lg={12}>
                            <Card className={styles.activityCard}>
                                <div className={styles.activityCardHeader}>
                                    <Title level={3} className={styles.activityCardTitle}>Thông báo hệ thống</Title>
                                </div>
                                {notificationsLoading ? (
                                    <div className={styles.emptyState}>
                                        <Spin className={styles.loadingSpinner} />
                                    </div>
                                ) : (
                                    <div className={styles.activityList}>
                                        {(notifications.length > 0 ? notifications : [
                                            {
                                                icon: <BellOutlined />,
                                                color: '#722ed1',
                                                title: 'Nhắc nhở đào tạo',
                                                description: '15 nhân viên cần gia hạn chứng chỉ an toàn',
                                                time: 'Hôm nay'
                                            },
                                            {
                                                icon: <CalendarOutlined />,
                                                color: '#595959',
                                                title: 'Lịch kiểm tra định kỳ',
                                                description: 'Kiểm tra an toàn công trình B vào tuần tới',
                                                time: 'Ngày mai'
                                            },
                                            {
                                                icon: <SyncOutlined />,
                                                color: '#13c2c2',
                                                title: 'Cập nhật hệ thống',
                                                description: 'Bảo trì hệ thống vào 2h sáng Chủ nhật',
                                                time: '3 ngày nữa'
                                            }
                                        ]).map((item, index) => (
                                            <div key={index} className={styles.activityItem}>
                                                <Avatar 
                                                    className={styles.activityAvatar}
                                                    style={{ backgroundColor: item.color || '#1890ff' }} 
                                                    icon={item.icon}
                                                />
                                                <div className={styles.activityContent}>
                                                    <div className={styles.activityTitle}>{item.title}</div>
                                                    <div className={styles.activityDescription}>{item.description}</div>
                                                    <div className={styles.activityTime}>{item.time}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Card>
                        </Col>
                    </Row>
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
