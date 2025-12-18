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
  SafetyOutlined,
  BellOutlined,
  BankOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store';
import userService from '../../../services/userService';
import projectService from '../../../services/projectService';
import * as ppeService from '../../../services/ppeService';
import SystemLogService from '../../../services/SystemLogService';
import notificationService from '../../../services/notificationService';
import { trainingStatsApi } from '../../../services/trainingApi';
import incidentService from '../../../services/incidentService';
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
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const isCompanyAdmin =
    currentUser?.role?.role_code === 'company_admin' ||
    currentUser?.role?.role_name?.toLowerCase() === 'company admin' ||
    (currentUser?.role?.role_level ?? 0) >= 90;

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                
                // Fetch all dashboard data in parallel with error handling
                const results = await Promise.allSettled([
                    userService.getUserStats(),
                    projectService.getAllProjects(),
                    ppeService.getDashboardData(),
                    trainingStatsApi.getDashboardStats(),
                    incidentService.getIncidents()
                ]);

                // Parse user stats
                let userStatsData = { total: 0, active: 0, inactive: 0 };
                if (results[0].status === 'fulfilled') {
                    const userStats = results[0].value as any; // Cast to any to handle nested structure
                    console.log('📊 [Dashboard] User stats response (full):', JSON.stringify(userStats, null, 2));
                    // Response structure from backend:
                    // UserService.getUserStats() returns: { success, statusCode, message, data: { total, active, inactive } }
                    // UserController wraps it: ApiResponse.success(res, result, ...)
                    // Final response: { success: true, message: '...', data: { success: true, statusCode: 200, message: '...', data: { total, active, inactive } } }
                    // So we need: userStats.data.data.data or userStats.data.data
                    let statsData: any = {};
                    if (userStats?.data?.data?.data) {
                        // Nested structure: controller wrapped service response
                        statsData = userStats.data.data.data;
                    } else if (userStats?.data?.data) {
                        // Service response directly
                        statsData = userStats.data.data;
                    } else if (userStats?.data) {
                        // Already parsed
                        statsData = userStats.data;
                    } else {
                        statsData = userStats || {};
                    }
                    console.log('📊 [Dashboard] Parsed stats data:', statsData);
                    userStatsData = {
                        total: Number(statsData.total) || 0,
                        active: Number(statsData.active) || 0,
                        inactive: Number(statsData.inactive) || 0
                    };
                    console.log('📊 [Dashboard] Final user stats:', userStatsData);
                } else {
                    console.error('❌ [Dashboard] Error fetching user stats:', results[0].reason);
                }

                // Parse project stats
                let projectsList: any[] = [];
                if (results[1].status === 'fulfilled') {
                    const projects = results[1].value;
                    // projects is ApiResponse<Project[]> with { success, data, message }
                    projectsList = Array.isArray(projects?.data) ? projects.data : [];
                    console.log('📊 [Dashboard] Projects loaded:', {
                        total: projectsList.length,
                        projects: projectsList.map((p: any) => ({
                            id: p.id || p._id,
                            name: p.project_name,
                            status: p.status
                        }))
                    });
                } else {
                    console.error('Error fetching projects:', results[1].reason);
                }
                // Backend enum: ['PLANNING', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'ON_HOLD']
                const activeProjects = projectsList.filter((p: any) => {
                    const status = p.status?.toUpperCase();
                    return status === 'ACTIVE';
                }).length;
                const completedProjects = projectsList.filter((p: any) => {
                    const status = p.status?.toUpperCase();
                    return status === 'COMPLETED';
                }).length;

                // Parse training stats from API
                let trainingData = { total: 0, completed: 0, completionRate: 0 };
                if (results[3].status === 'fulfilled') {
                    const trainingStats = results[3].value;
                    // TrainingStats structure: { totalCourseSets, totalCourses, totalSessions, totalEnrollments, totalQuestionBanks, totalQuestions }
                    const totalCourses = trainingStats?.totalCourses ?? 0;
                    const totalEnrollments = trainingStats?.totalEnrollments ?? 0;
                    
                    // Try to get completion rate from enrollment stats
                    let completedEnrollments = 0;
                    let completionRate = 0;
                    try {
                        const enrollmentStats = await trainingStatsApi.getEnrollmentStats();
                        if (Array.isArray(enrollmentStats)) {
                            // EnrollmentStats is array of { _id: status, count: number }
                            const completedStat = enrollmentStats.find((stat: any) => 
                                stat._id === 'completed' || stat._id === 'COMPLETED'
                            );
                            completedEnrollments = completedStat?.count ?? 0;
                            completionRate = totalEnrollments > 0 
                                ? Math.round((completedEnrollments / totalEnrollments) * 100) 
                                : 0;
                        }
                    } catch (err) {
                        console.warn('Could not fetch enrollment stats, using defaults:', err);
                        // Fallback: assume some completion rate
                        completionRate = totalEnrollments > 0 ? Math.round((totalEnrollments * 0.7) / totalEnrollments * 100) : 0;
                        completedEnrollments = Math.round(totalEnrollments * 0.7);
                    }
                    
                    trainingData = {
                        total: totalCourses,
                        completed: completedEnrollments,
                        completionRate
                    };
                } else {
                    console.error('Error fetching training stats:', results[3].reason);
                }

                // Parse incident stats from API
                let incidentData = { total: 0, thisMonth: 0, lastMonth: 0 };
                if (results[4].status === 'fulfilled') {
                    const incidentsResponse = results[4].value;
                    // incidentsResponse structure: { data: { data: [] } } or { data: [] }
                    const incidentsList = incidentsResponse?.data?.data ?? incidentsResponse?.data ?? [];
                    
                    const now = new Date();
                    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
                    
                    const thisMonthIncidents = incidentsList.filter((inc: any) => {
                        const incidentDate = new Date(inc.created_at || inc.createdAt || inc.reported_at || inc.reportedAt);
                        return incidentDate >= thisMonthStart;
                    }).length;
                    
                    const lastMonthIncidents = incidentsList.filter((inc: any) => {
                        const incidentDate = new Date(inc.created_at || inc.createdAt || inc.reported_at || inc.reportedAt);
                        return incidentDate >= lastMonthStart && incidentDate <= lastMonthEnd;
                    }).length;
                    
                    incidentData = {
                        total: incidentsList.length,
                        thisMonth: thisMonthIncidents,
                        lastMonth: lastMonthIncidents
                    };
                } else {
                    console.error('Error fetching incidents:', results[4].reason);
                }

                // Parse PPE stats
                let ppeData: any = {};
                if (results[2].status === 'fulfilled') {
                    ppeData = results[2].value || {};
                } else {
                    console.error('Error fetching PPE data:', results[2].reason);
                }
                const lowStockItems = ppeData.lowStockAlerts?.length ?? ppeData.low_stock_items ?? 0;
                const totalIssuances = ppeData.totalIssuances ?? ppeData.total_issuances ?? 0;
                const totalItems = ppeData.totalItems ?? ppeData.total_items ?? 0;

                setStats({
                    total: userStatsData.total,
                    active: userStatsData.active,
                    inactive: userStatsData.inactive,
                    projects: {
                        total: projectsList.length,
                        active: activeProjects,
                        completed: completedProjects
                    },
                    training: {
                        total: trainingData.total,
                        completed: trainingData.completed,
                        completionRate: trainingData.completionRate
                    },
                    incidents: {
                        total: incidentData.total,
                        thisMonth: incidentData.thisMonth,
                        lastMonth: incidentData.lastMonth
                    },
                    ppe: {
                        totalItems,
                        lowStock: lowStockItems,
                        totalIssuances
                    }
                });
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
                // Set default stats on error
                setStats({
                    total: 0,
                    active: 0,
                    inactive: 0,
                    projects: { total: 0, active: 0, completed: 0 },
                    training: { total: 0, completed: 0, completionRate: 0 },
                    incidents: { total: 0, thisMonth: 0, lastMonth: 0 },
                    ppe: { totalItems: 0, lowStock: 0, totalIssuances: 0 }
                });
            } finally {
                setLoading(false);
            }
        };

        const fetchRecentActivities = async () => {
            try {
                setActivitiesLoading(true);
                const response = await SystemLogService.getRecentActivities(10);
                console.log('📋 [Dashboard] Recent activities response:', response);
                // Handle different response structures
                // response might be { data: { logs: [] } } or { logs: [] } or [] directly
                let activities: any[] = [];
                if (Array.isArray(response)) {
                    activities = response;
                } else if (response?.data) {
                    if (Array.isArray(response.data)) {
                        activities = response.data;
                    } else if (Array.isArray(response.data.logs)) {
                        activities = response.data.logs;
                    } else if (response.data.data && Array.isArray(response.data.data)) {
                        activities = response.data.data;
                    }
                } else if (response?.logs && Array.isArray(response.logs)) {
                    activities = response.logs;
                }
                
                console.log('📋 [Dashboard] Parsed activities:', activities);
                
                // Transform activities to match UI format
                const formattedActivities = activities.map((activity: any) => {
                    // Handle different activity structures
                    const action = activity.action || activity.title || 'Hoạt động hệ thống';
                    const module = activity.module || 'system';
                    const severity = activity.severity || 'info';
                    const details = activity.details || {};
                    const description = details.message || 
                                      details.description || 
                                      activity.description || 
                                      `${module}: ${action}`;
                    const timestamp = activity.timestamp || 
                                    activity.created_at || 
                                    activity.time || 
                                    new Date().toISOString();
                    
                    return {
                        icon: getActivityIcon(module),
                        color: getActivityColor(severity),
                        title: action,
                        description,
                        time: formatRelativeTime(timestamp)
                    };
                });
                
                console.log('📋 [Dashboard] Formatted activities:', formattedActivities);
                setRecentActivities(formattedActivities);
            } catch (error) {
                console.error('❌ [Dashboard] Error loading recent activities:', error);
                setRecentActivities([]);
            } finally {
                setActivitiesLoading(false);
            }
        };

        const fetchNotifications = async () => {
            try {
                setNotificationsLoading(true);
                const response = await notificationService.getNotifications({ limit: 5 });
                // NotificationResponse has structure { notifications: [], pagination: {} }
                const notifications = response?.notifications ?? [];
                // Transform notifications to match UI format if needed
                const formattedNotifications = Array.isArray(notifications) ? notifications.map((notif: any) => ({
                    icon: getNotificationIcon(notif.type || 'info'),
                    color: getNotificationColor(notif.type || 'info'),
                    title: notif.title || 'Thông báo hệ thống',
                    description: notif.message || notif.description || '',
                    time: notif.created_at ? formatRelativeTime(notif.created_at) : notif.time || 'Vừa xong'
                })) : [];
                setNotifications(formattedNotifications);
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
            // response is { data: { total, active, inactive } }
            const userData = response?.data || {};
            const updatedStats = {
                total: userData.total ?? stats?.total ?? 0,
                active: userData.active ?? stats?.active ?? 0,
                inactive: userData.inactive ?? stats?.inactive ?? 0,
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

    // Helper functions for formatting
    const getActivityIcon = (module: string) => {
        const iconMap: Record<string, React.ReactNode> = {
            user: <UserOutlined />,
            training: <BookOutlined />,
            incident: <ExclamationCircleOutlined />,
            ppe: <SafetyOutlined />,
            project: <ProjectOutlined />
        };
        return iconMap[module?.toLowerCase()] || <BellOutlined />;
    };

    const getActivityColor = (severity: string) => {
        const colorMap: Record<string, string> = {
            info: '#1890ff',
            success: '#52c41a',
            warning: '#faad14',
            error: '#f5222d',
            critical: '#ff4d4f'
        };
        return colorMap[severity?.toLowerCase()] || '#1890ff';
    };

    const getNotificationIcon = (type: string) => {
        const iconMap: Record<string, React.ReactNode> = {
            info: <BellOutlined />,
            success: <BellOutlined />,
            warning: <ExclamationCircleOutlined />,
            error: <ExclamationCircleOutlined />
        };
        return iconMap[type?.toLowerCase()] || <BellOutlined />;
    };

    const getNotificationColor = (type: string) => {
        const colorMap: Record<string, string> = {
            info: '#722ed1',
            success: '#52c41a',
            warning: '#faad14',
            error: '#f5222d'
        };
        return colorMap[type?.toLowerCase()] || '#722ed1';
    };

    const formatRelativeTime = (timestamp: string) => {
        try {
            const date = new Date(timestamp);
            const now = new Date();
            const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
            
            if (diffInSeconds < 60) return 'Vừa xong';
            if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
            if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
            if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
            return date.toLocaleDateString('vi-VN');
        } catch {
            return 'Vừa xong';
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

                {/* Quick Actions - chỉ dành cho Company Admin / Admin */}
                {isCompanyAdmin && (
                <div className={styles.quickActionsSection}>
                    <Card className={styles.quickActionsCard}>
                        <div className={styles.quickActionsHeader}>
                            <Title level={3} className={styles.quickActionsTitle}>
                              Thao tác nhanh cho Company Admin
                            </Title>
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
                                        icon={<UserOutlined />}
                                        href="/admin/user-management"
                                        className={styles.quickActionButton}
                                    >
                                        <UserOutlined className={styles.quickActionIcon} />
                                        <div className={styles.quickActionContent}>
                                            <div className={styles.quickActionTitle}>Quản lý người dùng</div>
                                            <div className={styles.quickActionDescription}>Xem và quản lý tài khoản người dùng</div>
                                        </div>
                                    </Button>
                                </Col>
                                <Col xs={24} sm={12} md={8} lg={6}>
                                    <Button
                                        type="dashed"
                                        size="large"
                                        block
                                        icon={<SafetyOutlined />}
                                        href="/admin/role-management"
                                        className={styles.quickActionButton}
                                    >
                                        <SafetyOutlined className={styles.quickActionIcon} />
                                        <div className={styles.quickActionContent}>
                                            <div className={styles.quickActionTitle}>Vai trò & quyền hạn</div>
                                            <div className={styles.quickActionDescription}>Thiết lập phân quyền cho hệ thống</div>
                                        </div>
                                    </Button>
                                </Col>
                                <Col xs={24} sm={12} md={8} lg={6}>
                                    <Button
                                        type="dashed"
                                        size="large"
                                        block
                                        icon={<BankOutlined />}
                                        href="/admin/department-management"
                                        className={styles.quickActionButton}
                                    >
                                        <BankOutlined className={styles.quickActionIcon} />
                                        <div className={styles.quickActionContent}>
                                            <div className={styles.quickActionTitle}>Quản lý người dùng</div>
                                            <div className={styles.quickActionDescription}>Quản lý tài khoản và phòng ban</div>
                                        </div>
                                    </Button>
                                </Col>
                                <Col xs={24} sm={12} md={8} lg={6}>
                                    <Button
                                        type="dashed"
                                        size="large"
                                        block
                                        icon={<FileTextOutlined />}
                                        href="/admin/system-logs"
                                        className={styles.quickActionButton}
                                    >
                                        <FileTextOutlined className={styles.quickActionIcon} />
                                        <div className={styles.quickActionContent}>
                                            <div className={styles.quickActionTitle}>Nhật ký hệ thống</div>
                                            <div className={styles.quickActionDescription}>Theo dõi hoạt động và sự kiện trong hệ thống</div>
                                        </div>
                                    </Button>
                                </Col>
                            </Row>
                        </div>
                    </Card>
                </div>
                )}

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
                                ) : recentActivities.length > 0 ? (
                                    <div className={styles.activityList}>
                                        {recentActivities.map((item, index) => (
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
                                ) : (
                                    <div className={styles.emptyState}>
                                        <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                                            Chưa có hoạt động gần đây
                                        </div>
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
                                ) : notifications.length > 0 ? (
                                    <div className={styles.activityList}>
                                        {notifications.map((item, index) => (
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
                                ) : (
                                    <div className={styles.emptyState}>
                                        <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                                            Chưa có thông báo
                                        </div>
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
