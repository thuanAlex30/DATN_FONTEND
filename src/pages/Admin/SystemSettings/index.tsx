import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import { 
    Card, 
    Typography, 
    Button, 
    Space, 
    Table, 
    Tag, 
    Avatar, 
    Row, 
    Col, 
    Statistic, 
    Input, 
    Select, 
    Modal, 
    message, 
    Tabs, 
    Alert,
    Tooltip,
    Badge,
    Dropdown,
    Spin,
    Divider,
    DatePicker,
    List,
    Switch,
    InputNumber,
    Empty,
    Progress
} from 'antd';
import { 
    SettingOutlined, 
    SearchOutlined, 
    FilterOutlined, 
    FileTextOutlined, 
    DownloadOutlined,
    EyeOutlined,
    ReloadOutlined,
    BellOutlined,
    BarChartOutlined,
    UserOutlined,
    WarningOutlined,
    CheckCircleOutlined,
    InfoCircleOutlined,
    ExclamationCircleOutlined,
    CloseCircleOutlined,
    ExportOutlined,
    ThunderboltOutlined,
    DeleteOutlined
} from '@ant-design/icons';
import type { RootState } from '../../../store';
import SystemLogService, { type AnalyticsData } from '../../../services/SystemLogService';
import NotificationService, { 
    type Notification, 
    type NotificationFilters, 
    type NotificationResponse, 
    type NotificationSettings, 
    type NotificationStats 
} from '../../../services/notificationService';
import FrontendLoggingService from '../../../services/frontendLoggingService';
import type { SystemLog, SystemLogFilters, SystemLogStats, SystemLogPagination } from '../../../services/SystemLogService';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const SystemLogs: React.FC = () => {
    const { user: currentUser } = useSelector((state: RootState) => state.auth);
    const isCompanyAdmin =
        currentUser?.role?.role_code === 'company_admin' ||
        currentUser?.role?.role_name?.toLowerCase() === 'company admin' ||
        (currentUser?.role?.role_level ?? 0) >= 90;
    const [activeTab, setActiveTab] = useState<'logs' | 'notifications' | 'public-notifications' | 'analytics' | 'settings'>('logs');
    const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
    const [logsPagination, setLogsPagination] = useState<SystemLogPagination | null>(null);
    const [logsLoading, setLogsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [moduleFilter, setModuleFilter] = useState('');
    const [severityFilter, setSeverityFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    
    // Pagination
    const [currentLogPage, setCurrentLogPage] = useState(1);
    const [logsPerPage, setLogsPerPage] = useState(10);
    
    // Notifications
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [notificationPagination, setNotificationPagination] = useState<NotificationResponse['pagination'] | null>(null);
    const [notificationFilters, setNotificationFilters] = useState<NotificationFilters>({
        page: 1,
        limit: 10
    });
    const [notificationReadStatus, setNotificationReadStatus] = useState<'all' | 'read' | 'unread'>('all');
    const [notificationSearchTerm, setNotificationSearchTerm] = useState('');
    const [notificationsLoading, setNotificationsLoading] = useState(false);
    
    // Public notifications
    const [publicNotifications, setPublicNotifications] = useState<Notification[]>([]);
    const [publicNotificationPagination, setPublicNotificationPagination] = useState<NotificationResponse['pagination'] | null>(null);
    const [publicNotificationFilters, setPublicNotificationFilters] = useState<NotificationFilters>({
        page: 1,
        limit: 10
    });
    const [publicNotificationReadStatus, setPublicNotificationReadStatus] = useState<'all' | 'read' | 'unread'>('all');
    const [publicNotificationSearchTerm, setPublicNotificationSearchTerm] = useState('');
    const [publicNotificationsLoading, setPublicNotificationsLoading] = useState(false);
    
    // Modals
    const [logDetailModal, setLogDetailModal] = useState<SystemLog | null>(null);
    const [notificationDetail, setNotificationDetail] = useState<Notification | null>(null);
    const [publicNotificationDetail, setPublicNotificationDetail] = useState<Notification | null>(null);
    
    // Stats
    const [stats, setStats] = useState<SystemLogStats>({
        total_logs: 0,
        error_logs: 0,
        active_users: 0,
        most_active_module: ''
    });
    
    const [notificationStats, setNotificationStats] = useState<NotificationStats>({
        total_notifications: 0,
        unread_notifications: 0,
        type_breakdown: {
            info: 0,
            warning: 0,
            error: 0,
            success: 0
        }
    });
    
    // Analytics
    const [analyticsTimeRange, setAnalyticsTimeRange] = useState<'today' | 'week' | 'month' | 'quarter'>('week');
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(false);
    
    // Settings
    const [notificationSettings, setNotificationSettings] = useState<NotificationSettings | null>(null);
    const [settingsLoading, setSettingsLoading] = useState(false);
    const [settingsSaving, setSettingsSaving] = useState(false);
    const [logCleanupDays, setLogCleanupDays] = useState(90);
    const [cleanupLogsLoading, setCleanupLogsLoading] = useState(false);
    const [cleanupNotificationsLoading, setCleanupNotificationsLoading] = useState(false);

    const notificationTypeOptions = [
        { value: 'info', label: 'Thông tin' },
        { value: 'success', label: 'Thành công' },
        { value: 'warning', label: 'Cảnh báo' },
        { value: 'error', label: 'Lỗi' },
        { value: 'critical', label: 'Nghiêm trọng' }
    ];

    const notificationPriorityOptions = [
        { value: 'low', label: 'Thấp' },
        { value: 'medium', label: 'Trung bình' },
        { value: 'high', label: 'Cao' },
        { value: 'urgent', label: 'Khẩn cấp' }
    ];

    const notificationCategoryOptions = [
        { value: 'system', label: 'Hệ thống' },
        { value: 'training', label: 'Đào tạo' },
        { value: 'safety', label: 'An toàn' },
        { value: 'ppe', label: 'PPE' },
        { value: 'project', label: 'Dự án' },
        { value: 'user', label: 'Người dùng' },
        { value: 'general', label: 'Chung' }
    ];

    const analyticsRangeOptions = [
        { label: 'Hôm nay', value: 'today' },
        { label: '7 ngày', value: 'week' },
        { label: '30 ngày', value: 'month' },
        { label: '90 ngày', value: 'quarter' }
    ];

    const notificationRequestFilters = useMemo(() => {
        const filters: NotificationFilters = {
            ...notificationFilters
        };
        if (notificationReadStatus === 'all') {
            delete filters.is_read;
        } else {
            filters.is_read = notificationReadStatus === 'read';
        }
        return filters;
    }, [notificationFilters, notificationReadStatus]);

    const publicNotificationRequestFilters = useMemo(() => {
        const filters: NotificationFilters = {
            ...publicNotificationFilters
        };
        if (publicNotificationReadStatus === 'all') {
            delete filters.is_read;
        } else {
            filters.is_read = publicNotificationReadStatus === 'read';
        }
        return filters;
    }, [publicNotificationFilters, publicNotificationReadStatus]);

    // Load system logs
    const loadSystemLogs = useCallback(async () => {
        try {
            setLogsLoading(true);
            const filters: SystemLogFilters = {
                page: currentLogPage,
                limit: logsPerPage
            };

            if (searchTerm.trim()) {
                filters.search = searchTerm.trim();
            }
            if (moduleFilter) {
                filters.module = moduleFilter;
            }
            if (severityFilter) {
                filters.severity = severityFilter;
            }
            if (dateFilter) {
                const startOfDay = dayjs(dateFilter).startOf('day').toISOString();
                const endOfDay = dayjs(dateFilter).endOf('day').toISOString();
                filters.start_date = startOfDay;
                filters.end_date = endOfDay;
            }

            const response = await SystemLogService.getLogs(filters);
            setSystemLogs(response.logs || []);
            setLogsPagination(response.pagination || null);
            setError(null);
        } catch (err) {
            console.error('Error loading system logs:', err);
            setError('Lỗi khi tải nhật ký hệ thống');
        } finally {
            setLogsLoading(false);
        }
    }, [searchTerm, moduleFilter, severityFilter, dateFilter, currentLogPage, logsPerPage]);


    // Load stats
    const loadStats = useCallback(async () => {
        try {
            const [systemStats, notificationStatsResponse] = await Promise.all([
                SystemLogService.getStats(analyticsTimeRange),
                NotificationService.getStats()
            ]);

            setStats(systemStats);
            setNotificationStats(notificationStatsResponse);
        } catch (err) {
            console.error('Error loading stats:', err);
            setError('Lỗi khi tải thống kê');
        }
    }, [analyticsTimeRange]);

    const loadNotifications = useCallback(async () => {
        try {
            setNotificationsLoading(true);
            const response = await NotificationService.getNotifications(notificationRequestFilters);
            setNotifications(response.notifications || []);
            setNotificationPagination(response.pagination || null);
        } catch (err) {
            console.error('Error loading notifications:', err);
            message.error('Không thể tải thông báo hệ thống');
        } finally {
            setNotificationsLoading(false);
        }
    }, [notificationRequestFilters]);

    const loadPublicNotifications = useCallback(async () => {
        try {
            setPublicNotificationsLoading(true);
            const response = await NotificationService.getPublicNotifications(publicNotificationRequestFilters);
            setPublicNotifications(response.notifications || []);
            setPublicNotificationPagination(response.pagination || null);
        } catch (err) {
            console.error('Error loading public notifications:', err);
            message.error('Không thể tải thông báo công khai');
        } finally {
            setPublicNotificationsLoading(false);
        }
    }, [publicNotificationRequestFilters]);

    const loadAnalytics = useCallback(async () => {
        try {
            setAnalyticsLoading(true);
            const data = await SystemLogService.getAnalytics(analyticsTimeRange);
            setAnalyticsData(data);
        } catch (err) {
            console.error('Error loading analytics:', err);
            message.error('Không thể tải dữ liệu thống kê');
        } finally {
            setAnalyticsLoading(false);
        }
    }, [analyticsTimeRange]);

    const loadNotificationSettings = useCallback(async () => {
        try {
            setSettingsLoading(true);
            const settings = await NotificationService.getNotificationSettings();
            setNotificationSettings(settings);
        } catch (err: any) {
            console.error('Error loading notification settings:', err);
            
            // Nếu API không tồn tại (404), lỗi server, hoặc timeout -> dùng cài đặt mặc định
            const isTimeout = err?.code === 'ECONNABORTED' || err?.message?.includes('timeout');
            if (isTimeout || err?.response?.status === 404 || err?.response?.status >= 500) {
                console.log('API không khả dụng hoặc timeout, sử dụng cài đặt mặc định');
                const defaultSettings: NotificationSettings = {
                    types: [
                        { value: 'info', label: 'Thông tin', color: 'blue', enabled: true },
                        { value: 'success', label: 'Thành công', color: 'green', enabled: true },
                        { value: 'warning', label: 'Cảnh báo', color: 'orange', enabled: true },
                        { value: 'error', label: 'Lỗi', color: 'red', enabled: true }
                    ],
                    categories: [
                        { value: 'system', label: 'Hệ thống', enabled: true },
                        { value: 'training', label: 'Đào tạo', enabled: true },
                        { value: 'safety', label: 'An toàn', enabled: true },
                        { value: 'ppe', label: 'PPE', enabled: true },
                        { value: 'project', label: 'Dự án', enabled: true },
                        { value: 'user', label: 'Người dùng', enabled: true },
                        { value: 'general', label: 'Chung', enabled: true }
                    ],
                    priorities: [
                        { value: 'low', label: 'Thấp', color: 'default', enabled: true },
                        { value: 'medium', label: 'Trung bình', color: 'blue', enabled: true },
                        { value: 'high', label: 'Cao', color: 'orange', enabled: true },
                        { value: 'urgent', label: 'Khẩn cấp', color: 'red', enabled: true }
                    ],
                    auto_cleanup: {
                        enabled: false,
                        days: 90
                    },
                    real_time: {
                        enabled: true,
                        interval: 30
                    }
                };
                setNotificationSettings(defaultSettings);
                message.warning('Sử dụng cài đặt mặc định (API cài đặt thông báo không phản hồi)');
            } else {
            message.error('Không thể tải cài đặt thông báo');
            }
        } finally {
            setSettingsLoading(false);
        }
    }, []);

    const handleMarkNotificationAsRead = useCallback(async (notificationId: string) => {
        try {
            await NotificationService.markAsRead(notificationId);
            message.success('Đã đánh dấu thông báo là đã đọc');
            loadNotifications();
            loadStats();
        } catch (err) {
            console.error('Error marking notification as read:', err);
            message.error('Không thể đánh dấu thông báo');
        }
    }, [loadNotifications, loadStats]);

    const handleApplyNotificationSearch = useCallback(() => {
        setNotificationFilters((prev) => ({
            ...prev,
            search: notificationSearchTerm.trim() ? notificationSearchTerm.trim() : undefined,
            page: 1
        }));
    }, [notificationSearchTerm]);

    const handleApplyPublicNotificationSearch = useCallback(() => {
        setPublicNotificationFilters((prev) => ({
            ...prev,
            search: publicNotificationSearchTerm.trim() ? publicNotificationSearchTerm.trim() : undefined,
            page: 1
        }));
    }, [publicNotificationSearchTerm]);

    const handleResetNotificationFilters = useCallback(() => {
        setNotificationFilters((prev) => ({
            page: 1,
            limit: prev.limit || 10
        }));
        setNotificationReadStatus('all');
        setNotificationSearchTerm('');
    }, []);

    const handleResetPublicNotificationFilters = useCallback(() => {
        setPublicNotificationFilters((prev) => ({
            page: 1,
            limit: prev.limit || 10
        }));
        setPublicNotificationReadStatus('all');
        setPublicNotificationSearchTerm('');
    }, []);

    const handleMarkAllNotifications = useCallback(async () => {
        try {
            await NotificationService.markAllAsRead();
            message.success('Đã đánh dấu toàn bộ thông báo là đã đọc');
            loadNotifications();
            loadStats();
        } catch (err) {
            console.error('Error marking all notifications as read:', err);
            message.error('Không thể đánh dấu tất cả thông báo');
        }
    }, [loadNotifications, loadStats]);

    const handleDeleteNotification = useCallback(async (notificationId: string) => {
        try {
            await NotificationService.deleteNotification(notificationId);
            message.success('Đã xóa thông báo');
            loadNotifications();
            loadStats();
        } catch (err) {
            console.error('Error deleting notification:', err);
            message.error('Không thể xóa thông báo');
        }
    }, [loadNotifications, loadStats]);

    const handleSaveNotificationSettings = useCallback(async () => {
        if (!notificationSettings) return;
        try {
            setSettingsSaving(true);
            const updated = await NotificationService.updateNotificationSettings(notificationSettings);
            setNotificationSettings(updated);
            message.success('Đã cập nhật cài đặt thông báo');
        } catch (err) {
            console.error('Error saving notification settings:', err);
            message.error('Không thể cập nhật cài đặt');
        } finally {
            setSettingsSaving(false);
        }
    }, [notificationSettings]);

    const handleCleanupLogs = useCallback(async () => {
        try {
            setCleanupLogsLoading(true);
            const result = await SystemLogService.cleanupOldLogs(logCleanupDays);
            message.success(`Đã xóa ${result.deleted_count} log cũ`);
            loadSystemLogs();
            loadStats();
        } catch (err: any) {
            console.error('Error cleaning up logs:', err);
            message.error(err?.message || 'Không thể dọn dẹp log');
        } finally {
            setCleanupLogsLoading(false);
        }
    }, [logCleanupDays, loadSystemLogs, loadStats]);

    const handleCleanupExpiredNotifications = useCallback(async () => {
        try {
            setCleanupNotificationsLoading(true);
            const result = await NotificationService.cleanupExpiredNotifications();
            message.success(`Đã xóa ${result.deleted_count} thông báo hết hạn`);
            loadNotifications();
            loadStats();
        } catch (err) {
            console.error('Error cleaning up notifications:', err);
            message.error('Không thể dọn dẹp thông báo hết hạn');
        } finally {
            setCleanupNotificationsLoading(false);
        }
    }, [loadNotifications, loadStats]);

    const toggleNotificationSetting = useCallback((group: 'types' | 'categories' | 'priorities', value: string, enabled: boolean) => {
        setNotificationSettings((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                [group]: prev[group].map((item) =>
                    item.value === value ? { ...item, enabled } : item
                )
            };
        });
    }, []);

    const updateNotificationSettingSection = useCallback((
        section: 'auto_cleanup' | 'real_time',
        key: 'enabled' | 'days' | 'interval',
        value: boolean | number
    ) => {
        setNotificationSettings((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                [section]: {
                    ...prev[section],
                    [key]: value
                }
            };
        });
    }, []);

    useEffect(() => {
        loadSystemLogs();
    }, [loadSystemLogs]);

    useEffect(() => {
        loadStats();
    }, [loadStats]);

    useEffect(() => {
        if (activeTab === 'notifications') {
            loadNotifications();
        }
    }, [activeTab, loadNotifications]);

    useEffect(() => {
        if (activeTab === 'public-notifications') {
            loadPublicNotifications();
        }
    }, [activeTab, loadPublicNotifications]);

    useEffect(() => {
        if (activeTab === 'analytics') {
            loadAnalytics();
        }
    }, [activeTab, loadAnalytics]);

    useEffect(() => {
        if (activeTab === 'settings') {
            loadNotificationSettings();
        }
    }, [activeTab, loadNotificationSettings]);

    const getUserDisplayName = (user?: SystemLog['user_id']) => {
        if (!user) return 'Hệ thống';
        return user.full_name || user.username || user._id || 'Hệ thống';
    };

    // Export functions
    const exportLogs = async (format: 'csv' | 'json') => {
        try {
            const filters: SystemLogFilters = {
                search: searchTerm,
                module: moduleFilter,
                severity: severityFilter
            };

            if (dateFilter) {
                filters.start_date = dayjs(dateFilter).startOf('day').toISOString();
                filters.end_date = dayjs(dateFilter).endOf('day').toISOString();
            }

            const blob = await SystemLogService.exportLogs(format, filters);
            const filename = `system_logs_${new Date().toISOString().split('T')[0]}.${format}`;
            SystemLogService.downloadExportedFile(blob, filename);
            
            message.success(`Đã xuất ${format.toUpperCase()} thành công`);
        } catch (err) {
            console.error('Error exporting logs:', err);
            message.error('Lỗi khi xuất dữ liệu');
        }
    };

    // Helper functions
    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'success': return 'success';
            case 'info': return 'processing';
            case 'warning': return 'warning';
            case 'error': return 'error';
            case 'critical': return 'red';
            default: return 'default';
        }
    };

    const getSeverityIconComponent = (severity: string) => {
        switch (severity) {
            case 'success': return <CheckCircleOutlined />;
            case 'info': return <InfoCircleOutlined />;
            case 'warning': return <ExclamationCircleOutlined />;
            case 'error': return <CloseCircleOutlined />;
            case 'critical': return <WarningOutlined />;
            default: return <InfoCircleOutlined />;
        }
    };

    const formatDailyActivityDate = (entry: { _id: { day: number; month: number; year: number } }) => {
        return dayjs()
            .set('year', entry._id.year)
            .set('month', entry._id.month - 1)
            .set('date', entry._id.day)
            .format('DD/MM/YYYY');
    };

    // Render functions for each tab
    const renderLogsTab = () => {
        const totalLogs = logsPagination?.total ?? systemLogs.length;

        return (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
            {/* Filters */}
            <Card title={
                <Space align="center">
                    <SettingOutlined />
                    <span>Bộ lọc</span>
                    {isCompanyAdmin && (
                        <Tag color="geekblue">
                            Company Admin • Theo dõi hoạt động trong tenant
                        </Tag>
                    )}
                </Space>
            } size="small">
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={8}>
                        <Input
                            placeholder="Tìm kiếm trong log..."
                            prefix={<SearchOutlined />}
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentLogPage(1);
                                if (e.target.value.length > 2) {
                                    FrontendLoggingService.logSearch('system', e.target.value, 0);
                                }
                            }}
                        />
                    </Col>
                    <Col xs={24} sm={12} md={4}>
                        <Select
                            placeholder="Module"
                            style={{ width: '100%' }}
                            value={moduleFilter}
                            onChange={(value) => {
                                setModuleFilter(value);
                                setCurrentLogPage(1);
                                FrontendLoggingService.logFilterChange('system', 'module', value);
                            }}
                        >
                            <Option value="">Tất cả module</Option>
                            <Option value="auth">Xác thực</Option>
                            <Option value="user">Người dùng</Option>
                            <Option value="training">Đào tạo</Option>
                            <Option value="safety">An toàn</Option>
                            <Option value="ppe">PPE</Option>
                            <Option value="project">Dự án</Option>
                            <Option value="system">Hệ thống</Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} md={4}>
                        <Select
                            placeholder="Mức độ"
                            style={{ width: '100%' }}
                            value={severityFilter}
                            onChange={(value) => {
                                setSeverityFilter(value);
                                setCurrentLogPage(1);
                            }}
                        >
                            <Option value="">Tất cả mức độ</Option>
                            <Option value="info">Thông tin</Option>
                            <Option value="success">Thành công</Option>
                            <Option value="warning">Cảnh báo</Option>
                            <Option value="error">Lỗi</Option>
                            <Option value="critical">Nghiêm trọng</Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} md={4}>
                        <DatePicker
                            style={{ width: '100%' }}
                            placeholder="Chọn ngày"
                            value={dateFilter ? dayjs(dateFilter) : null}
                            onChange={(date) => {
                                setDateFilter(date ? date.format('YYYY-MM-DD') : '');
                                setCurrentLogPage(1);
                            }}
                        />
                    </Col>
                    <Col xs={24} sm={12} md={4}>
                        <Space>
                            <Button
                                icon={<FilterOutlined />}
                                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                            >
                                Bộ lọc nâng cao
                            </Button>
                            <Dropdown
                                menu={{
                                    items: [
                                        {
                                            key: 'csv',
                                            label: 'Xuất CSV',
                                            icon: <DownloadOutlined />
                                        },
                                        {
                                            key: 'json',
                                            label: 'Xuất JSON',
                                            icon: <DownloadOutlined />
                                        }
                                    ],
                                    onClick: ({ key }) => exportLogs(key as 'csv' | 'json')
                                }}
                                trigger={['click']}
                            >
                                <Button icon={<ExportOutlined />}>
                                    Xuất dữ liệu
                                </Button>
                            </Dropdown>
                        </Space>
                    </Col>
                </Row>
            </Card>

            {/* Advanced Filters */}
            {showAdvancedFilters && (
                <Card title="Bộ lọc nâng cao" size="small">
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12} md={8}>
                            <Text strong>Khoảng thời gian:</Text>
                            <RangePicker
                                style={{ width: '100%', marginTop: '8px' }}
                                showTime
                            />
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <Text strong>IP Address:</Text>
                            <Input
                                placeholder="192.168.1.1"
                                style={{ marginTop: '8px' }}
                            />
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <Text strong>User Agent:</Text>
                            <Input
                                placeholder="Chrome, Firefox..."
                                style={{ marginTop: '8px' }}
                            />
                        </Col>
                    </Row>
                    <Divider />
                    <Space>
                        <Button type="primary" icon={<SearchOutlined />}>
                            Áp dụng bộ lọc
                        </Button>
                        <Button onClick={() => setShowAdvancedFilters(false)}>
                            Đóng
                        </Button>
                    </Space>
                </Card>
            )}

            {/* Logs Table */}
            <Card title={`Nhật ký hệ thống (${totalLogs} bản ghi)`}>
                {logsLoading ? (
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                        <Spin size="large" />
                        <div style={{ marginTop: '16px' }}>
                            <Text>Đang tải dữ liệu...</Text>
                        </div>
                    </div>
                ) : (
                    <Table
                        dataSource={systemLogs}
                        rowKey="_id"
                        columns={[
                            {
                                title: 'Thời gian',
                                dataIndex: 'timestamp',
                                key: 'timestamp',
                                width: 150,
                                render: (timestamp) => (
                                    <Space direction="vertical" size={0}>
                                        <Text style={{ fontSize: '12px' }}>
                                            {SystemLogService.formatDateTime(timestamp)}
                                        </Text>
                                        <Text type="secondary" style={{ fontSize: '11px' }}>
                                            {SystemLogService.getRelativeTime(timestamp)}
                                        </Text>
                                    </Space>
                                )
                            },
                            {
                                title: 'Mức độ',
                                dataIndex: 'severity',
                                key: 'severity',
                                width: 100,
                                render: (severity) => (
                                    <Tag color={getSeverityColor(severity)} icon={getSeverityIconComponent(severity)}>
                                        {severity.toUpperCase()}
                                    </Tag>
                                )
                            },
                            {
                                title: 'Hành động',
                                dataIndex: 'action',
                                key: 'action',
                                ellipsis: true
                            },
                            {
                                title: 'Module',
                                dataIndex: 'module',
                                key: 'module',
                                width: 100,
                                render: (module) => (
                                    <Tag color="blue">{module}</Tag>
                                )
                            },
                            {
                                title: 'Người dùng',
                                dataIndex: 'user_id',
                                key: 'user_id',
                                width: 120,
                                render: (user) => (
                                    <Space>
                                        <Avatar size="small" icon={<UserOutlined />} />
                                        <Text>{getUserDisplayName(user as SystemLog['user_id'])}</Text>
                                    </Space>
                                )
                            },
                            {
                                title: 'IP',
                                dataIndex: 'ip_address',
                                key: 'ip_address',
                                width: 120,
                                render: (ip) => (
                                    <Text code style={{ fontSize: '11px' }}>{ip}</Text>
                                )
                            },
                            {
                                title: 'Thao tác',
                                key: 'actions',
                                width: 100,
                                render: (_, record) => (
                                    <Space>
                                        <Tooltip title="Xem chi tiết">
                                            <Button
                                                type="text"
                                                icon={<EyeOutlined />}
                                                onClick={() => setLogDetailModal(record)}
                                            />
                                        </Tooltip>
                                    </Space>
                                )
                            }
                        ]}
                        pagination={{
                            current: currentLogPage,
                            pageSize: logsPerPage,
                            total: totalLogs,
                            onChange: (page, pageSize) => {
                                if (pageSize !== logsPerPage) {
                                    setLogsPerPage(pageSize);
                                    setCurrentLogPage(1);
                                    return;
                                }
                                setCurrentLogPage(page);
                            },
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} bản ghi`
                        }}
                        size="small"
                        scroll={{ x: 800 }}
                    />
                )}
            </Card>
        </Space>
    );
    };

    const renderNotificationsTab = () => (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Card
                title="Bộ lọc thông báo"
                size="small"
                extra={
                    <Space>
                        <Button onClick={handleResetNotificationFilters}>
                            Đặt lại
                        </Button>
                        <Button type="primary" onClick={handleApplyNotificationSearch}>
                            Tìm kiếm
                        </Button>
                        <Button icon={<CheckCircleOutlined />} onClick={handleMarkAllNotifications}>
                            Đánh dấu tất cả đã đọc
                        </Button>
                    </Space>
                }
            >
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={6}>
                        <Input
                            placeholder="Tìm kiếm thông báo..."
                            prefix={<SearchOutlined />}
                            value={notificationSearchTerm}
                            onChange={(e) => setNotificationSearchTerm(e.target.value)}
                            onPressEnter={handleApplyNotificationSearch}
                            allowClear
                        />
                    </Col>
                    <Col xs={24} sm={12} md={4}>
                        <Select
                            placeholder="Loại thông báo"
                            style={{ width: '100%' }}
                            value={notificationFilters.type || 'all'}
                            onChange={(value) => {
                                setNotificationFilters((prev) => ({
                                    ...prev,
                                    type: value === 'all' ? undefined : value,
                                    page: 1
                                }));
                            }}
                        >
                            <Option value="all">Tất cả loại</Option>
                            {notificationTypeOptions.map((option) => (
                                <Option key={option.value} value={option.value}>
                                    {option.label}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} md={4}>
                        <Select
                            placeholder="Danh mục"
                            style={{ width: '100%' }}
                            value={notificationFilters.category || 'all'}
                            onChange={(value) => {
                                setNotificationFilters((prev) => ({
                                    ...prev,
                                    category: value === 'all' ? undefined : value,
                                    page: 1
                                }));
                            }}
                        >
                            <Option value="all">Tất cả danh mục</Option>
                            {notificationCategoryOptions.map((option) => (
                                <Option key={option.value} value={option.value}>
                                    {option.label}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} md={4}>
                        <Select
                            placeholder="Mức ưu tiên"
                            style={{ width: '100%' }}
                            value={notificationFilters.priority || 'all'}
                            onChange={(value) => {
                                setNotificationFilters((prev) => ({
                                    ...prev,
                                    priority: value === 'all' ? undefined : value,
                                    page: 1
                                }));
                            }}
                        >
                            <Option value="all">Tất cả mức ưu tiên</Option>
                            {notificationPriorityOptions.map((option) => (
                                <Option key={option.value} value={option.value}>
                                    {option.label}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} md={4}>
                        <Select
                            placeholder="Trạng thái"
                            style={{ width: '100%' }}
                            value={notificationReadStatus}
                            onChange={(value) => {
                                setNotificationReadStatus(value as 'all' | 'read' | 'unread');
                            }}
                        >
                            <Option value="all">Tất cả</Option>
                            <Option value="unread">Chưa đọc</Option>
                            <Option value="read">Đã đọc</Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} md={2}>
                        <Select
                            value={notificationFilters.limit || 10}
                            onChange={(value) => {
                                setNotificationFilters((prev) => ({
                                    ...prev,
                                    limit: value,
                                    page: 1
                                }));
                            }}
                            style={{ width: '100%' }}
                        >
                            {[10, 20, 50].map((size) => (
                                <Option key={size} value={size}>
                                    {size}/trang
                                </Option>
                            ))}
                        </Select>
                    </Col>
                </Row>
            </Card>

            <Card title="Thông báo hệ thống">
                <Table
                    dataSource={notifications}
                    rowKey="_id"
                    loading={notificationsLoading}
                    locale={{
                        emptyText: notificationsLoading ? <Spin /> : <Empty description="Không có thông báo" />
                    }}
                    pagination={{
                        current: notificationPagination?.current_page || notificationFilters.page || 1,
                        pageSize: notificationFilters.limit || 10,
                        total: notificationPagination?.total_items || notifications.length,
                        showSizeChanger: false,
                        onChange: (page, pageSize) => {
                            setNotificationFilters((prev) => ({
                                ...prev,
                                page,
                                limit: pageSize
                            }));
                        },
                        showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} thông báo`
                    }}
                    columns={[
                        {
                            title: 'Tiêu đề',
                            dataIndex: 'title',
                            key: 'title',
                            render: (text: string, record: Notification) => (
                                <Button
                                    type="link"
                                    style={{ padding: 0, textAlign: 'left' }}
                                    onClick={() => setNotificationDetail(record)}
                                >
                                    <Space direction="vertical" size={0} align="start">
                                    <Text strong>{text}</Text>
                                    <Text type="secondary" ellipsis style={{ maxWidth: 320 }}>
                                        {record.message}
                                    </Text>
                                </Space>
                                </Button>
                            )
                        },
                        {
                            title: 'Loại',
                            dataIndex: 'type',
                            key: 'type',
                            width: 140,
                            render: (type: string) => {
                                const { icon, color } = NotificationService.getNotificationIcon(type);
                                return (
                                    <Tag color={color}>
                                        <i className={icon} style={{ marginRight: 6 }} />
                                        {NotificationService.getTypeLabel(type)}
                                    </Tag>
                                );
                            }
                        },
                        {
                            title: 'Mức ưu tiên',
                            dataIndex: 'priority',
                            key: 'priority',
                            width: 130,
                            render: (priority: string) => (
                                <Tag color={NotificationService.getPriorityColor(priority)}>
                                    {priority.toUpperCase()}
                                </Tag>
                            )
                        },
                        {
                            title: 'Danh mục',
                            dataIndex: 'category',
                            key: 'category',
                            width: 140,
                            render: (category: string) => (
                                <Tag color="geekblue">
                                    {NotificationService.getCategoryLabel(category)}
                                </Tag>
                            )
                        },
                        {
                            title: 'Trạng thái',
                            dataIndex: 'is_read',
                            key: 'is_read',
                            width: 130,
                            render: (isRead: boolean) => (
                                <Tag color={isRead ? 'default' : 'red'}>
                                    {isRead ? 'ĐÃ ĐỌC' : 'CHƯA ĐỌC'}
                                </Tag>
                            )
                        },
                        {
                            title: 'Thời gian',
                            dataIndex: 'created_at',
                            key: 'created_at',
                            width: 210,
                            render: (createdAt: string) => (
                                <Space direction="vertical" size={0}>
                                    <Text style={{ fontSize: 12 }}>
                                        {NotificationService.formatDateTime(createdAt)}
                                    </Text>
                                    <Text type="secondary" style={{ fontSize: 11 }}>
                                        {NotificationService.getRelativeTime(createdAt)}
                                    </Text>
                                </Space>
                            )
                        },
                        {
                            title: 'Thao tác',
                            key: 'actions',
                            width: 160,
                            render: (_: any, record: Notification) => (
                                <Space>
                                    {!record.is_read && (
                                        <Tooltip title="Đánh dấu đã đọc">
                                            <Button
                                                type="text"
                                                icon={<CheckCircleOutlined />}
                                                onClick={() => handleMarkNotificationAsRead(record._id)}
                                            />
                                        </Tooltip>
                                    )}
                                    <Tooltip title="Xóa thông báo">
                                        <Button
                                            type="text"
                                            danger
                                            icon={<DeleteOutlined />}
                                            onClick={() => handleDeleteNotification(record._id)}
                                        />
                                    </Tooltip>
                                </Space>
                            )
                        }
                    ]}
                />
            </Card>
        </Space>
    );

    const renderPublicNotificationsTab = () => (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Card
                title="Bộ lọc thông báo công khai"
                size="small"
                extra={
                    <Space>
                        <Button onClick={handleResetPublicNotificationFilters}>
                            Đặt lại
                        </Button>
                        <Button type="primary" onClick={handleApplyPublicNotificationSearch}>
                            Tìm kiếm
                        </Button>
                    </Space>
                }
            >
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={8}>
                        <Input
                            placeholder="Tìm kiếm thông báo công khai..."
                            prefix={<SearchOutlined />}
                            value={publicNotificationSearchTerm}
                            onChange={(e) => setPublicNotificationSearchTerm(e.target.value)}
                            onPressEnter={handleApplyPublicNotificationSearch}
                            allowClear
                        />
                    </Col>
                    <Col xs={24} sm={12} md={4}>
                        <Select
                            placeholder="Loại"
                            style={{ width: '100%' }}
                            value={publicNotificationFilters.type || 'all'}
                            onChange={(value) => {
                                setPublicNotificationFilters((prev) => ({
                                    ...prev,
                                    type: value === 'all' ? undefined : value,
                                    page: 1
                                }));
                            }}
                        >
                            <Option value="all">Tất cả</Option>
                            {notificationTypeOptions.map((option) => (
                                <Option key={option.value} value={option.value}>
                                    {option.label}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} md={4}>
                        <Select
                            placeholder="Mức ưu tiên"
                            style={{ width: '100%' }}
                            value={publicNotificationFilters.priority || 'all'}
                            onChange={(value) => {
                                setPublicNotificationFilters((prev) => ({
                                    ...prev,
                                    priority: value === 'all' ? undefined : value,
                                    page: 1
                                }));
                            }}
                        >
                            <Option value="all">Tất cả</Option>
                            {notificationPriorityOptions.map((option) => (
                                <Option key={option.value} value={option.value}>
                                    {option.label}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} md={4}>
                        <Select
                            placeholder="Trạng thái"
                            style={{ width: '100%' }}
                            value={publicNotificationReadStatus}
                            onChange={(value) => setPublicNotificationReadStatus(value as 'all' | 'read' | 'unread')}
                        >
                            <Option value="all">Tất cả</Option>
                            <Option value="unread">Chưa đọc</Option>
                            <Option value="read">Đã đọc</Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} md={4}>
                        <Select
                            value={publicNotificationFilters.limit || 10}
                            onChange={(value) => {
                                setPublicNotificationFilters((prev) => ({
                                    ...prev,
                                    limit: value,
                                    page: 1
                                }));
                            }}
                            style={{ width: '100%' }}
                        >
                            {[10, 20, 50].map((size) => (
                                <Option key={size} value={size}>
                                    {size}/trang
                                </Option>
                            ))}
                        </Select>
                    </Col>
                </Row>
            </Card>

            <Card title="Thông báo công khai">
                <List
                    loading={publicNotificationsLoading}
                    dataSource={publicNotifications}
                    locale={{
                        emptyText: publicNotificationsLoading ? <Spin /> : <Empty description="Chưa có thông báo" />
                    }}
                    pagination={{
                        current: publicNotificationPagination?.current_page || publicNotificationFilters.page || 1,
                        pageSize: publicNotificationFilters.limit || publicNotificationPagination?.items_per_page || 10,
                        total: publicNotificationPagination?.total_items || publicNotifications.length,
                        showSizeChanger: false,
                        onChange: (page, pageSize) => {
                            setPublicNotificationFilters((prev) => ({
                                ...prev,
                                page,
                                limit: pageSize
                            }));
                        }
                    }}
                    renderItem={(item) => (
                        <List.Item
                            actions={[
                                <Tag color={NotificationService.getNotificationIcon(item.type).color} key="type">
                                    {NotificationService.getTypeLabel(item.type)}
                                </Tag>,
                                <Tag color={NotificationService.getPriorityColor(item.priority)} key="priority">
                                    {item.priority.toUpperCase()}
                                </Tag>
                            ]}
                        >
                            <List.Item.Meta
                                title={
                                    <Button
                                        type="link"
                                        style={{ padding: 0, textAlign: 'left' }}
                                        onClick={() => setPublicNotificationDetail(item)}
                                    >
                                    <Space>
                                        <BellOutlined />
                                        <Text strong>{item.title}</Text>
                                        <Tag>{NotificationService.getCategoryLabel(item.category)}</Tag>
                                    </Space>
                                    </Button>
                                }
                                description={
                                    <Space direction="vertical" size={4}>
                                        <Text>{item.message}</Text>
                                        <Text type="secondary">
                                            {item.user_id && typeof item.user_id === 'object'
                                                ? `Bởi: ${item.user_id.full_name || item.user_id.username}`
                                                : 'Thông báo công khai'}
                                        </Text>
                                    </Space>
                                }
                            />
                            <Space direction="vertical" size={2} align="end">
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    {NotificationService.formatDateTime(item.created_at)}
                                </Text>
                                <Text type="secondary" style={{ fontSize: 11 }}>
                                    {NotificationService.getRelativeTime(item.created_at)}
                                </Text>
                            </Space>
                        </List.Item>
                    )}
                />
            </Card>
        </Space>
    );

    const renderAnalyticsTab = () => {
        const severityData = analyticsData?.severity_distribution || [];
        const moduleData = analyticsData?.module_distribution || [];
        const dailyActivity = analyticsData?.daily_activity || [];
        const topUsers = analyticsData?.top_users || [];
        const totalSeverity = severityData.reduce((sum, item) => sum + item.count, 0) || 1;
        const totalModules = moduleData.reduce((sum, item) => sum + item.count, 0) || 1;

        return (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
                <Card
                    title="Thống kê hệ thống"
                    extra={
                        <Select
                            value={analyticsTimeRange}
                            onChange={(value) => setAnalyticsTimeRange(value as 'today' | 'week' | 'month' | 'quarter')}
                            style={{ width: 160 }}
                            options={analyticsRangeOptions}
                        />
                    }
                >
                    {analyticsLoading ? (
                        <div style={{ textAlign: 'center', padding: 32 }}>
                            <Spin size="large" />
                        </div>
                    ) : analyticsData ? (
                        (() => {
                            const periodStart = analyticsData.period_start ? dayjs(analyticsData.period_start) : dayjs();
                            const periodEnd = analyticsData.period_end ? dayjs(analyticsData.period_end) : dayjs();
                            return (
                        <Space direction="vertical" size="large" style={{ width: '100%' }}>
                            <Alert
                                type="info"
                                showIcon
                                message={`Khoảng thời gian: ${periodStart.format('DD/MM/YYYY HH:mm')} - ${periodEnd.format('DD/MM/YYYY HH:mm')}`}
                            />
                            <Row gutter={[16, 16]}>
                                <Col xs={24} md={12}>
                                    <Card title="Phân bố theo mức độ" size="small">
                                        <List
                                            dataSource={severityData}
                                            renderItem={(item) => (
                                                <List.Item>
                                                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                                                        <Space>
                                                            <Tag color={getSeverityColor(item._id)}>
                                                                {item._id.toUpperCase()}
                                                            </Tag>
                                                            <Text>{item.count} sự kiện</Text>
                                                        </Space>
                                                        <div style={{ width: 160 }}>
                                                            <Progress
                                                                percent={Math.round((item.count / totalSeverity) * 100)}
                                                                showInfo={false}
                                                                size="small"
                                                            />
                                                        </div>
                                                    </Space>
                                                </List.Item>
                                            )}
                                        />
            </Card>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Card title="Phân bố theo module" size="small">
                                        <List
                                            dataSource={moduleData}
                                            renderItem={(item) => (
                                                <List.Item>
                                                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                                                        <Space>
                                                            <Tag color="blue">{item._id}</Tag>
                                                            <Text>{item.count} sự kiện</Text>
                                                        </Space>
                                                        <div style={{ width: 160 }}>
                                                            <Progress
                                                                percent={Math.round((item.count / totalModules) * 100)}
                                                                showInfo={false}
                                                                size="small"
                                                            />
                                                        </div>
                                                    </Space>
                                                </List.Item>
                                            )}
                                        />
                                    </Card>
                                </Col>
                            </Row>
                            <Row gutter={[16, 16]}>
                                <Col xs={24} md={12}>
                                    <Card title="Hoạt động theo ngày" size="small">
                                        <List
                                            dataSource={dailyActivity}
                                            renderItem={(item) => (
                                                <List.Item>
                                                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                                                        <Text>{formatDailyActivityDate(item)}</Text>
                                                        <Tag color="green">{item.count} sự kiện</Tag>
                                                    </Space>
                                                </List.Item>
                                            )}
                                        />
                                    </Card>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Card title="Top người dùng hoạt động" size="small">
                                        <List
                                            dataSource={topUsers}
                                            renderItem={(item, index) => (
                                                <List.Item>
                                                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                                                        <Space>
                                                            <Badge count={index + 1} />
                                                            <Text>{item.user_name || item.username || 'Không rõ'}</Text>
                                                        </Space>
                                                        <Tag color="purple">{item.count} hành động</Tag>
                                                    </Space>
                                                </List.Item>
                                            )}
                                        />
                                    </Card>
                                </Col>
                            </Row>
        </Space>
    );
                        })()
                    ) : (
                        <Empty description="Không có dữ liệu thống kê" />
                    )}
                </Card>
            </Space>
        );
    };

    const renderSettingsTab = () => (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Card
                title="Cài đặt thông báo"
                extra={
                    <Button
                        type="primary"
                        onClick={handleSaveNotificationSettings}
                        loading={settingsSaving}
                        disabled={!notificationSettings}
                    >
                        Lưu cài đặt
                    </Button>
                }
            >
                {settingsLoading ? (
                    <div style={{ textAlign: 'center', padding: 32 }}>
                        <Spin />
                    </div>
                ) : notificationSettings ? (
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                        <div>
                            <Divider orientation="left">Loại thông báo</Divider>
                            <Row gutter={[16, 16]}>
                                {notificationSettings.types.map((item) => (
                                    <Col xs={24} sm={12} md={6} key={item.value}>
                                        <Space>
                                            <Switch
                                                checked={item.enabled}
                                                onChange={(checked) => toggleNotificationSetting('types', item.value, checked)}
                                            />
                                            <Tag color={item.color}>{item.label}</Tag>
                                        </Space>
                                    </Col>
                                ))}
                            </Row>
                        </div>
                        <div>
                            <Divider orientation="left">Danh mục</Divider>
                            <Row gutter={[16, 16]}>
                                {notificationSettings.categories.map((item) => (
                                    <Col xs={24} sm={12} md={6} key={item.value}>
                                        <Space>
                                            <Switch
                                                checked={item.enabled}
                                                onChange={(checked) => toggleNotificationSetting('categories', item.value, checked)}
                                            />
                                            <Text>{item.label}</Text>
                                        </Space>
                                    </Col>
                                ))}
                            </Row>
                        </div>
                        <div>
                            <Divider orientation="left">Mức ưu tiên</Divider>
                            <Row gutter={[16, 16]}>
                                {notificationSettings.priorities.map((item) => (
                                    <Col xs={24} sm={12} md={6} key={item.value}>
                                        <Space>
                                            <Switch
                                                checked={item.enabled}
                                                onChange={(checked) => toggleNotificationSetting('priorities', item.value, checked)}
                                            />
                                            <Tag color={item.color}>{item.label}</Tag>
                                        </Space>
                                    </Col>
                                ))}
                            </Row>
                        </div>
                        <Row gutter={[16, 16]}>
                            <Col xs={24} md={12}>
                                <Card size="small" title="Dọn dẹp tự động">
                                    <Space direction="vertical" style={{ width: '100%' }}>
                                        <Space>
                                            <Switch
                                                checked={notificationSettings.auto_cleanup.enabled}
                                                onChange={(checked) => updateNotificationSettingSection('auto_cleanup', 'enabled', checked)}
                                            />
                                            <Text>Bật dọn dẹp thông báo hết hạn</Text>
                                        </Space>
                                        <InputNumber
                                            style={{ width: '100%' }}
                                            min={1}
                                            value={notificationSettings.auto_cleanup.days}
                                            onChange={(value) => updateNotificationSettingSection('auto_cleanup', 'days', Number(value) || 1)}
                                            addonAfter="ngày"
                                        />
                                    </Space>
                                </Card>
                            </Col>
                            <Col xs={24} md={12}>
                                <Card size="small" title="Thông báo thời gian thực">
                                    <Space direction="vertical" style={{ width: '100%' }}>
                                        <Space>
                                            <Switch
                                                checked={notificationSettings.real_time.enabled}
                                                onChange={(checked) => updateNotificationSettingSection('real_time', 'enabled', checked)}
                                            />
                                            <Text>Bật cập nhật thời gian thực</Text>
                                        </Space>
                                        <InputNumber
                                            style={{ width: '100%' }}
                                            min={5}
                                            value={notificationSettings.real_time.interval}
                                            onChange={(value) => updateNotificationSettingSection('real_time', 'interval', Number(value) || 5)}
                                            addonAfter="giây"
                                        />
                                    </Space>
                                </Card>
                            </Col>
                        </Row>
                    </Space>
                ) : (
                    <Empty description="Không có dữ liệu cài đặt" />
                )}
            </Card>

            <Card title="Bảo trì dữ liệu">
                <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Text strong>Dọn dẹp nhật ký hệ thống</Text>
                            <InputNumber
                                style={{ width: '100%' }}
                                min={1}
                                value={logCleanupDays}
                                onChange={(value) => setLogCleanupDays(Number(value) || 1)}
                                addonAfter="ngày"
                            />
                            <Button type="primary" onClick={handleCleanupLogs} loading={cleanupLogsLoading}>
                                Thực hiện dọn dẹp
                            </Button>
                        </Space>
                    </Col>
                    <Col xs={24} md={12}>
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Text strong>Dọn dẹp thông báo hết hạn</Text>
                            <Text type="secondary">
                                Xóa các thông báo đã quá hạn hiển thị để giải phóng dung lượng lưu trữ.
                            </Text>
                            <Button
                                danger
                                onClick={handleCleanupExpiredNotifications}
                                loading={cleanupNotificationsLoading}
                            >
                                Dọn dẹp thông báo
                            </Button>
                        </Space>
                    </Col>
                </Row>
            </Card>
        </Space>
    );

    return (
        <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
            {/* Header */}
            <Card style={{ marginBottom: '24px' }}>
                <Row justify="space-between" align="middle">
                    <Col>
                        <Space direction="vertical" size={0}>
                            <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <FileTextOutlined style={{ color: '#1890ff' }} />
                                Nhật ký hệ thống
                            </Title>
                            <Text type="secondary">
                                Dashboard / Nhật ký hệ thống
                            </Text>
                        </Space>
                    </Col>
                    <Col>
                        <Space>
                            <Badge dot>
                                <Button 
                                    type="text" 
                                    icon={<ThunderboltOutlined />}
                                    style={{ color: '#52c41a' }}
                                >
                                    Theo dõi thời gian thực
                                </Button>
                            </Badge>
                            <Button 
                                icon={<ReloadOutlined />}
                                onClick={() => window.location.href = '/admin/dashboard'}
                            >
                                Quay lại
                            </Button>
                        </Space>
                    </Col>
                </Row>
            </Card>

            {/* Error Message */}
            {error && (
                <Alert
                    message="Lỗi"
                    description={error}
                    type="error"
                    showIcon
                    closable
                    onClose={() => setError(null)}
                    style={{ marginBottom: '24px' }}
                />
            )}

            {/* Stats Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Tổng số log"
                            value={stats.total_logs}
                            prefix={<FileTextOutlined style={{ color: '#1890ff' }} />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Lỗi hôm nay"
                            value={stats.error_logs}
                            prefix={<WarningOutlined style={{ color: '#ff4d4f' }} />}
                            valueStyle={{ color: '#ff4d4f' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Người dùng hoạt động"
                            value={stats.active_users}
                            prefix={<UserOutlined style={{ color: '#52c41a' }} />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Thông báo mới"
                            value={notificationStats.unread_notifications}
                            prefix={<BellOutlined style={{ color: '#faad14' }} />}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Main Content */}
            <Card>
                <Tabs
                    activeKey={activeTab}
                    onChange={(key) => {
                        const previousTab = activeTab;
                        setActiveTab(key as any);
                        FrontendLoggingService.logTabSwitch('system', previousTab, key);
                    }}
                    items={[
                        {
                            key: 'logs',
                            label: (
                                <Space>
                                    <FileTextOutlined />
                                    Nhật ký hoạt động
                                    {stats.error_logs > 0 && (
                                        <Badge count={stats.error_logs} size="small" />
                                    )}
                                </Space>
                            ),
                            children: renderLogsTab()
                        },
                        {
                            key: 'notifications',
                            label: (
                                <Space>
                                    <BellOutlined />
                                    Thông báo hệ thống
                                    {notificationStats.unread_notifications > 0 && (
                                        <Badge count={notificationStats.unread_notifications} size="small" />
                                    )}
                                </Space>
                            ),
                            children: renderNotificationsTab()
                        },
                        {
                            key: 'public-notifications',
                            label: (
                                <Space>
                                    <BellOutlined />
                                    Thông báo công khai
                                    {publicNotifications.length > 0 && (
                                        <Badge count={publicNotifications.length} size="small" />
                                    )}
                                </Space>
                            ),
                            children: renderPublicNotificationsTab()
                        },
                        {
                            key: 'analytics',
                            label: (
                                <Space>
                                    <BarChartOutlined />
                                    Thống kê
                                </Space>
                            ),
                            children: renderAnalyticsTab()
                        },
                        {
                            key: 'settings',
                            label: (
                                <Space>
                                    <SettingOutlined />
                                    Cài đặt
                                </Space>
                            ),
                            children: renderSettingsTab()
                        }
                    ]}
                />

        {/* Notification detail modal */}
        <Modal
            title={notificationDetail?.title}
            open={!!notificationDetail}
            onCancel={() => setNotificationDetail(null)}
            footer={null}
            width={640}
        >
            {notificationDetail && (
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <Space>
                        <Tag color={NotificationService.getNotificationIcon(notificationDetail.type).color}>
                            {NotificationService.getTypeLabel(notificationDetail.type)}
                        </Tag>
                        <Tag color={NotificationService.getPriorityColor(notificationDetail.priority)}>
                            {notificationDetail.priority.toUpperCase()}
                        </Tag>
                        <Tag>
                            {NotificationService.getCategoryLabel(notificationDetail.category)}
                        </Tag>
                    </Space>
                    <Text>{notificationDetail.message}</Text>
                    <Text type="secondary">
                        Thời gian: {NotificationService.formatDateTime(notificationDetail.created_at)}
                    </Text>
                </Space>
            )}
        </Modal>

        {/* Public notification detail modal */}
        <Modal
            title={publicNotificationDetail?.title}
            open={!!publicNotificationDetail}
            onCancel={() => setPublicNotificationDetail(null)}
            footer={null}
            width={640}
        >
            {publicNotificationDetail && (
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <Space>
                        <Tag color={NotificationService.getNotificationIcon(publicNotificationDetail.type).color}>
                            {NotificationService.getTypeLabel(publicNotificationDetail.type)}
                        </Tag>
                        <Tag color={NotificationService.getPriorityColor(publicNotificationDetail.priority)}>
                            {publicNotificationDetail.priority.toUpperCase()}
                        </Tag>
                        <Tag>
                            {NotificationService.getCategoryLabel(publicNotificationDetail.category)}
                        </Tag>
                    </Space>
                    <Text>{publicNotificationDetail.message}</Text>
                    <Text type="secondary">
                        Thời gian: {NotificationService.formatDateTime(publicNotificationDetail.created_at)}
                    </Text>
                </Space>
            )}
        </Modal>
            </Card>

            {/* Modals */}
            {logDetailModal && (
                <Modal
                    title="Chi tiết log"
                    open={!!logDetailModal}
                    onCancel={() => setLogDetailModal(null)}
                    footer={[
                        <Button key="close" onClick={() => setLogDetailModal(null)}>
                            Đóng
                        </Button>
                    ]}
                    width={800}
                >
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Text strong>Thời gian:</Text>
                                <br />
                                <Text>{SystemLogService.formatDateTime(logDetailModal.timestamp)}</Text>
                            </Col>
                            <Col span={12}>
                                <Text strong>Mức độ:</Text>
                                <br />
                                <Tag color={getSeverityColor(logDetailModal.severity)}>
                                    {logDetailModal.severity.toUpperCase()}
                                </Tag>
                            </Col>
                        </Row>
                        <Divider />
                        <Text strong>Chi tiết:</Text>
                        <pre style={{ background: '#f5f5f5', padding: '12px', borderRadius: '4px' }}>
                            {JSON.stringify(logDetailModal.details, null, 2)}
                        </pre>
                    </Space>
                </Modal>
            )}
        </div>
    );
};

export default SystemLogs;