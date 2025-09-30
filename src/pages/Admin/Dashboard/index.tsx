import React, { useState, useEffect } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Statistic, 
  Button, 
  Typography, 
  List, 
  Avatar, 
  Tag,
  Spin
} from 'antd';
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
// import * as incidentService from '../../../services/incidentService';
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
            setStats(response.data);
        } catch (error) {
            console.error('Error refreshing stats:', error);
        }
    };

    const { Title } = Typography;

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div style={{ padding: '24px' }}>
            {/* Stats Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Tổng số nhân viên"
                            value={stats?.total || 0}
                            prefix={<UserOutlined style={{ color: '#1890ff' }} />}
                            suffix={
                                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                                    {stats?.active || 0} đang hoạt động
                                </div>
                            }
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Dự án đang hoạt động"
                            value={stats?.projects.active || 0}
                            prefix={<ProjectOutlined style={{ color: '#52c41a' }} />}
                            suffix={
                                <div style={{ fontSize: '12px', color: '#52c41a', marginTop: '4px' }}>
                                    {stats?.projects.total || 0} tổng dự án
                                </div>
                            }
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Khóa đào tạo hoàn thành"
                            value={stats?.training.completed || 0}
                            prefix={<BookOutlined style={{ color: '#faad14' }} />}
                            suffix={
                                <div style={{ fontSize: '12px', color: '#52c41a', marginTop: '4px' }}>
                                    ↗ {stats?.training.completionRate || 0}% tỷ lệ hoàn thành
                                </div>
                            }
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Sự cố an toàn tháng này"
                            value={stats?.incidents.thisMonth || 0}
                            prefix={<ExclamationCircleOutlined style={{ color: '#f5222d' }} />}
                            suffix={
                                <div style={{ fontSize: '12px', color: '#f5222d', marginTop: '4px' }}>
                                    {stats?.incidents.lastMonth ? 
                                        (stats.incidents.thisMonth < stats.incidents.lastMonth ? '↘' : '↗') + 
                                        ' ' + Math.round(((stats.incidents.thisMonth - stats.incidents.lastMonth) / stats.incidents.lastMonth) * 100) + '% so với tháng trước' :
                                        'So với tháng trước'
                                    }
                                </div>
                            }
                        />
                    </Card>
                </Col>
            </Row>

            {/* Quick Actions */}
            <Card style={{ marginBottom: '24px' }}>
                <Title level={3} style={{ marginBottom: '16px' }}>Thao tác nhanh</Title>
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={8} lg={6}>
                        <Button
                            type="dashed"
                            size="large"
                            block
                            icon={<UserAddOutlined />}
                            onClick={() => setIsQuickAddModalOpen(true)}
                            style={{ height: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <div style={{ marginTop: '8px' }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Thêm nhân viên</div>
                                <div style={{ fontSize: '12px', color: '#666' }}>Tạo tài khoản cho nhân viên mới</div>
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
                            style={{ height: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <div style={{ marginTop: '8px' }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Tạo dự án mới</div>
                                <div style={{ fontSize: '12px', color: '#666' }}>Khởi tạo dự án và phân công nhân viên</div>
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
                            style={{ height: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <div style={{ marginTop: '8px' }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Lên lịch đào tạo</div>
                                <div style={{ fontSize: '12px', color: '#666' }}>Tạo buổi đào tạo an toàn lao động</div>
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
                            style={{ height: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <div style={{ marginTop: '8px' }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Nhập PPE</div>
                                <div style={{ fontSize: '12px', color: '#666' }}>Cập nhật kho thiết bị bảo hộ</div>
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
                            style={{ height: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <div style={{ marginTop: '8px' }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Tạo chứng chỉ</div>
                                <div style={{ fontSize: '12px', color: '#666' }}>Định nghĩa gói chứng chỉ mới</div>
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
                            style={{ height: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <div style={{ marginTop: '8px' }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Xem báo cáo</div>
                                <div style={{ fontSize: '12px', color: '#666' }}>Phân tích hiệu suất và an toàn</div>
                            </div>
                        </Button>
                    </Col>
                </Row>
            </Card>

            {/* Recent Activities */}
            <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                    <Card>
                        <Title level={3} style={{ marginBottom: '16px' }}>Hoạt động gần đây</Title>
                        {activitiesLoading ? (
                            <div style={{ textAlign: 'center', padding: '20px' }}>
                                <Spin />
                            </div>
                        ) : (
                            <List
                                dataSource={recentActivities.length > 0 ? recentActivities : [
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
                                ]}
                                renderItem={(item) => (
                                    <List.Item>
                                        <List.Item.Meta
                                            avatar={
                                                <Avatar 
                                                    style={{ backgroundColor: item.color || '#1890ff' }} 
                                                    icon={item.icon}
                                                />
                                            }
                                            title={item.title}
                                            description={
                                                <div>
                                                    <div style={{ marginBottom: '4px' }}>{item.description}</div>
                                                    <Tag color="default" style={{ fontSize: '11px' }}>{item.time}</Tag>
                                                </div>
                                            }
                                        />
                                    </List.Item>
                                )}
                            />
                        )}
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card>
                        <Title level={3} style={{ marginBottom: '16px' }}>Thông báo hệ thống</Title>
                        {notificationsLoading ? (
                            <div style={{ textAlign: 'center', padding: '20px' }}>
                                <Spin />
                            </div>
                        ) : (
                            <List
                                dataSource={notifications.length > 0 ? notifications : [
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
                                ]}
                                renderItem={(item) => (
                                    <List.Item>
                                        <List.Item.Meta
                                            avatar={
                                                <Avatar 
                                                    style={{ backgroundColor: item.color || '#1890ff' }} 
                                                    icon={item.icon}
                                                />
                                            }
                                            title={item.title}
                                            description={
                                                <div>
                                                    <div style={{ marginBottom: '4px' }}>{item.description}</div>
                                                    <Tag color="default" style={{ fontSize: '11px' }}>{item.time}</Tag>
                                                </div>
                                            }
                                        />
                                    </List.Item>
                                )}
                            />
                        )}
                    </Card>
                </Col>
            </Row>

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
