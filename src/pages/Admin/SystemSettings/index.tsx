import React, { useState, useEffect, useCallback } from 'react';
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
    DatePicker
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
    ThunderboltOutlined
} from '@ant-design/icons';
import SystemLogService from '../../../services/SystemLogService';
import NotificationService from '../../../services/notificationService';
import FrontendLoggingService from '../../../services/frontendLoggingService';
import type { SystemLog, SystemLogFilters, SystemLogStats } from '../../../services/SystemLogService';
import type { Notification, NotificationStats } from '../../../services/notificationService';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const SystemLogs: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'logs' | 'notifications' | 'public-notifications' | 'analytics' | 'settings'>('logs');
    const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
    const [publicNotifications] = useState<Notification[]>([]);
    const [filteredLogs, setFilteredLogs] = useState<SystemLog[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [moduleFilter, setModuleFilter] = useState('');
    const [severityFilter, setSeverityFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    
    // Pagination
    const [currentLogPage, setCurrentLogPage] = useState(1);
    const [logsPerPage] = useState(10);
    
    // Modals
    const [logDetailModal, setLogDetailModal] = useState<SystemLog | null>(null);
    
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
    const [analyticsTimeRange] = useState<'today' | 'week' | 'month' | 'year'>('today');

    // Load data on component mount
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                await Promise.all([
                    loadSystemLogs(),
                    loadStats()
                ]);
            } catch (err) {
                console.error('Error loading data:', err);
                setError('Lỗi khi tải dữ liệu');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    // Load system logs
    const loadSystemLogs = useCallback(async () => {
        try {
            const filters: SystemLogFilters = {
                search: searchTerm,
                module: moduleFilter,
                severity: severityFilter,
                page: currentLogPage,
                limit: logsPerPage
            };

            const response = await SystemLogService.getLogs(filters);
            console.log('System logs response data:', response);
            setSystemLogs(response.logs || []);
        } catch (err) {
            console.error('Error loading system logs:', err);
            setError('Lỗi khi tải nhật ký hệ thống');
        }
    }, [searchTerm, moduleFilter, severityFilter, currentLogPage, logsPerPage]);


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

    // Filter logs
    useEffect(() => {
        const filtered = systemLogs.filter(log => {
            const matchesSearch = !searchTerm || 
                log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.module.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.ip_address.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesModule = !moduleFilter || log.module === moduleFilter;
            const matchesSeverity = !severityFilter || log.severity === severityFilter;
            const matchesDate = !dateFilter || log.timestamp.startsWith(dateFilter);

            return matchesSearch && matchesModule && matchesSeverity && matchesDate;
        });

        setFilteredLogs(filtered);
    }, [systemLogs, searchTerm, moduleFilter, severityFilter, dateFilter]);

    // Pagination helpers
    const getPaginatedLogs = () => {
        const startIndex = (currentLogPage - 1) * logsPerPage;
        return filteredLogs.slice(startIndex, startIndex + logsPerPage);
    };

    // Helper functions
    const getUserName = (userId: string) => {
        // This would typically fetch from user service
        return `User ${userId}`;
    };

    // Export functions
    const exportLogs = async (format: 'csv' | 'json') => {
        try {
            const filters: SystemLogFilters = {
                search: searchTerm,
                module: moduleFilter,
                severity: severityFilter
            };

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

    // Render functions for each tab
    const renderLogsTab = () => (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
            {/* Filters */}
            <Card title="Bộ lọc" size="small">
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={8}>
                        <Input
                            placeholder="Tìm kiếm trong log..."
                            prefix={<SearchOutlined />}
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
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
                            onChange={setSeverityFilter}
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
                            onChange={(date) => setDateFilter(date ? date.format('YYYY-MM-DD') : '')}
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
            <Card title={`Nhật ký hệ thống (${filteredLogs.length} bản ghi)`}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                        <Spin size="large" />
                        <div style={{ marginTop: '16px' }}>
                            <Text>Đang tải dữ liệu...</Text>
                        </div>
                    </div>
                ) : (
                    <Table
                        dataSource={getPaginatedLogs()}
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
                                render: (userId) => (
                                    <Space>
                                        <Avatar size="small" icon={<UserOutlined />} />
                                        <Text>{getUserName(userId)}</Text>
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
                            total: filteredLogs.length,
                            onChange: setCurrentLogPage,
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

    const renderNotificationsTab = () => (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Card title="Thông báo hệ thống">
                <Text>Nội dung thông báo hệ thống sẽ được hiển thị ở đây...</Text>
            </Card>
        </Space>
    );

    const renderPublicNotificationsTab = () => (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Card title="Thông báo công khai">
                <Text>Nội dung thông báo công khai sẽ được hiển thị ở đây...</Text>
            </Card>
        </Space>
    );

    const renderAnalyticsTab = () => (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Card title="Thống kê">
                <Text>Biểu đồ và thống kê sẽ được hiển thị ở đây...</Text>
            </Card>
        </Space>
    );

    const renderSettingsTab = () => (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Card title="Cài đặt hệ thống">
                <Text>Các cài đặt hệ thống sẽ được hiển thị ở đây...</Text>
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