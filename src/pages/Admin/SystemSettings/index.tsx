import React, { useState, useEffect, useCallback } from 'react';
import './SystemLogs.css';

interface SystemLog {
    log_id: number;
    user_id: number | null;
    action: string;
    module: string;
    details: Record<string, any>;
    ip_address: string;
    timestamp: string;
    severity: 'info' | 'success' | 'warning' | 'error' | 'critical';
}

interface Notification {
    notification_id: number;
    user_id: number;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
    is_read: boolean;
    created_at: string;
}

interface User {
    full_name: string;
    username: string;
}

const SystemLogs: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'logs' | 'notifications' | 'analytics'>('logs');
    const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [filteredLogs, setFilteredLogs] = useState<SystemLog[]>([]);
    const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
    const [currentLogPage, setCurrentLogPage] = useState(1);
    const [currentNotificationPage, setCurrentNotificationPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [moduleFilter, setModuleFilter] = useState('');
    const [severityFilter, setSeverityFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [notificationSearch, setNotificationSearch] = useState('');
    const [notificationTypeFilter, setNotificationTypeFilter] = useState('');
    const [readStatusFilter, setReadStatusFilter] = useState('');
    const [analyticsTimeRange, setAnalyticsTimeRange] = useState('today');
    const [showExportMenu, setShowExportMenu] = useState(false);

    const ITEMS_PER_PAGE = 10;

    // Mock user data
    const users: Record<number, User> = {
        1: { full_name: "Nguyễn Văn Admin", username: "admin" },
        3: { full_name: "Trần Thị Hoa", username: "hoa.tran" },
        5: { full_name: "Lê Minh Tùng", username: "tung.le" },
        8: { full_name: "Phạm Văn Đức", username: "duc.pham" },
        12: { full_name: "Hoàng Thị Lan", username: "lan.hoang" },
        15: { full_name: "Vũ Minh Khoa", username: "khoa.vu" },
        22: { full_name: "Đỗ Thành Nam", username: "nam.do" }
    };

    // Sample data
    const initialLogs: SystemLog[] = [
        {
            log_id: 1,
            user_id: 1,
            action: "Đăng nhập hệ thống",
            module: "auth",
            details: {
                user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                session_id: "sess_123456789",
                login_method: "username_password"
            },
            ip_address: "192.168.1.100",
            timestamp: "2024-12-17T08:30:15Z",
            severity: "info"
        },
        {
            log_id: 2,
            user_id: 15,
            action: "Tạo khóa học mới",
            module: "training",
            details: {
                course_id: 25,
                course_name: "An toàn lao động cơ bản",
                duration_hours: 8
            },
            ip_address: "192.168.1.105",
            timestamp: "2024-12-17T09:15:22Z",
            severity: "success"
        },
        {
            log_id: 3,
            user_id: 8,
            action: "Cập nhật thông tin PPE",
            module: "ppe",
            details: {
                item_id: 150,
                item_name: "Mũ bảo hiểm ABC-123",
                quantity_change: -5,
                reason: "Cấp phát cho dự án XYZ"
            },
            ip_address: "192.168.1.108",
            timestamp: "2024-12-17T10:45:33Z",
            severity: "info"
        },
        {
            log_id: 4,
            user_id: 22,
            action: "Báo cáo sự cố an toàn",
            module: "safety",
            details: {
                incident_id: 45,
                severity: "medium",
                location: "Công trường A - Tầng 5",
                injury_count: 1
            },
            ip_address: "192.168.1.112",
            timestamp: "2024-12-17T11:20:18Z",
            severity: "warning"
        },
        {
            log_id: 5,
            user_id: null,
            action: "Lỗi kết nối cơ sở dữ liệu",
            module: "system",
            details: {
                error_code: "DB_CONNECTION_TIMEOUT",
                database: "safety_pro_main",
                retry_count: 3,
                error_message: "Connection timeout after 30 seconds"
            },
            ip_address: "127.0.0.1",
            timestamp: "2024-12-17T11:45:55Z",
            severity: "error"
        }
    ];

    const initialNotifications: Notification[] = [
        {
            notification_id: 1,
            user_id: 1,
            title: "Khóa học sắp hết hạn",
            message: "Khóa học 'An toàn lao động cơ bản' của bạn sẽ hết hạn vào ngày 25/12/2024",
            type: "warning",
            is_read: false,
            created_at: "2024-12-17T08:00:00Z"
        },
        {
            notification_id: 2,
            user_id: 1,
            title: "Báo cáo tháng đã sẵn sàng",
            message: "Báo cáo an toàn lao động tháng 12/2024 đã được tạo thành công",
            type: "success",
            is_read: true,
            created_at: "2024-12-17T07:30:00Z"
        },
        {
            notification_id: 3,
            user_id: 1,
            title: "Cập nhật hệ thống",
            message: "Hệ thống sẽ được bảo trì từ 22:00 hôm nay đến 02:00 sáng mai",
            type: "info",
            is_read: false,
            created_at: "2024-12-16T16:45:00Z"
        }
    ];

    // Initialize data
    useEffect(() => {
        setSystemLogs(initialLogs);
        setFilteredLogs(initialLogs);
        setNotifications(initialNotifications);
        setFilteredNotifications(initialNotifications);
    }, []);

    // Utility functions
    const formatDateTime = (dateTimeString: string) => {
        const date = new Date(dateTimeString);
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const getRelativeTime = (dateTimeString: string) => {
        const now = new Date();
        const date = new Date(dateTimeString);
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
        
        if (diffInSeconds < 60) return `${diffInSeconds} giây trước`;
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
        return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
    };

    const getUserName = (userId: number | null) => {
        return userId && users[userId] ? users[userId].full_name : 'Hệ thống';
    };

    const getSeverityIcon = (severity: string) => {
        const icons: Record<string, string> = {
            info: 'fas fa-info-circle',
            success: 'fas fa-check-circle',
            warning: 'fas fa-exclamation-triangle',
            error: 'fas fa-times-circle',
            critical: 'fas fa-skull-crossbones'
        };
        return icons[severity] || 'fas fa-circle';
    };

    const getNotificationIcon = (type: string) => {
        const icons: Record<string, string> = {
            info: 'fas fa-info-circle',
            success: 'fas fa-check-circle',
            warning: 'fas fa-exclamation-triangle',
            error: 'fas fa-times-circle'
        };
        const colors: Record<string, string> = {
            info: 'linear-gradient(135deg, #3498db, #2980b9)',
            success: 'linear-gradient(135deg, #2ecc71, #27ae60)',
            warning: 'linear-gradient(135deg, #f39c12, #e67e22)',
            error: 'linear-gradient(135deg, #e74c3c, #c0392b)'
        };
        return { icon: icons[type] || 'fas fa-bell', color: colors[type] || '#6c757d' };
    };

    // Filter functions
    const filterLogs = useCallback(() => {
        const filtered = systemLogs.filter(log => {
            const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                getUserName(log.user_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
                                JSON.stringify(log.details).toLowerCase().includes(searchTerm.toLowerCase());
            const matchesModule = !moduleFilter || log.module === moduleFilter;
            const matchesSeverity = !severityFilter || log.severity === severityFilter;
            const matchesDate = !dateFilter || 
                new Date(log.timestamp).toDateString() === new Date(dateFilter).toDateString();
            
            return matchesSearch && matchesModule && matchesSeverity && matchesDate;
        });
        setFilteredLogs(filtered);
        setCurrentLogPage(1);
    }, [systemLogs, searchTerm, moduleFilter, severityFilter, dateFilter]);

    const filterNotifications = useCallback(() => {
        const filtered = notifications.filter(notification => {
            const matchesSearch = notification.title.toLowerCase().includes(notificationSearch.toLowerCase()) ||
                                notification.message.toLowerCase().includes(notificationSearch.toLowerCase());
            const matchesType = !notificationTypeFilter || notification.type === notificationTypeFilter;
            const matchesReadStatus = !readStatusFilter || 
                (readStatusFilter === 'read' && notification.is_read) ||
                (readStatusFilter === 'unread' && !notification.is_read);
            
            return matchesSearch && matchesType && matchesReadStatus;
        });
        setFilteredNotifications(filtered);
        setCurrentNotificationPage(1);
    }, [notifications, notificationSearch, notificationTypeFilter, readStatusFilter]);

    // Apply filters when dependencies change
    useEffect(() => {
        filterLogs();
    }, [filterLogs]);

    useEffect(() => {
        filterNotifications();
    }, [filterNotifications]);

    // Statistics calculation
    const getStats = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todayLogs = systemLogs.filter(log => new Date(log.timestamp) >= today);
        const errorLogs = todayLogs.filter(log => log.severity === 'error' || log.severity === 'critical');
        const activeUsers = new Set(todayLogs.filter(log => log.user_id).map(log => log.user_id)).size;
        const unreadNotifications = notifications.filter(n => !n.is_read).length;
        
        return {
            totalLogs: systemLogs.length,
            errorLogs: errorLogs.length,
            activeUsers,
            unreadNotifications
        };
    };

    const stats = getStats();

    // Pagination
    const getPaginatedLogs = () => {
        const startIndex = (currentLogPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return filteredLogs.slice(startIndex, endIndex);
    };

    const getPaginatedNotifications = () => {
        const startIndex = (currentNotificationPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return filteredNotifications.slice(startIndex, endIndex);
    };

    const getTotalPages = (items: any[]) => Math.ceil(items.length / ITEMS_PER_PAGE);

    // Export functions
    const exportLogs = (format: string) => {
        const data = filteredLogs.map(log => ({
            timestamp: formatDateTime(log.timestamp),
            user: getUserName(log.user_id),
            action: log.action,
            module: log.module,
            severity: log.severity,
            ip_address: log.ip_address,
            details: JSON.stringify(log.details)
        }));

        let content = '';
        let filename = '';
        let mimeType = '';

        switch(format) {
            case 'csv':
                const headers = ['Thời gian', 'Người dùng', 'Hành động', 'Module', 'Mức độ', 'IP', 'Chi tiết'];
                content = [
                    headers.join(','),
                    ...data.map(row => [
                        `"${row.timestamp}"`,
                        `"${row.user}"`,
                        `"${row.action}"`,
                        `"${row.module}"`,
                        `"${row.severity}"`,
                        `"${row.ip_address}"`,
                        `"${row.details.replace(/"/g, '""')}"`
                    ].join(','))
                ].join('\n');
                filename = `system_logs_${new Date().toISOString().split('T')[0]}.csv`;
                mimeType = 'text/csv';
                break;
            case 'json':
                content = JSON.stringify(data, null, 2);
                filename = `system_logs_${new Date().toISOString().split('T')[0]}.json`;
                mimeType = 'application/json';
                break;
        }

        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    // Notification actions
    const markAsRead = (notificationId: number) => {
        setNotifications(prev => 
            prev.map(n => n.notification_id === notificationId ? { ...n, is_read: true } : n)
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    };

    const deleteNotification = (notificationId: number) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa thông báo này?')) {
            setNotifications(prev => prev.filter(n => n.notification_id !== notificationId));
        }
    };

    return (
        <div className="system-logs-container">
            {/* Header */}
            <div className="header">
                <div>
                    <h1><i className="fas fa-clipboard-list"></i> Nhật ký hệ thống</h1>
                    <div className="breadcrumb">
                        <a href="/admin/dashboard">Dashboard</a> / Nhật ký hệ thống
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div className="real-time-indicator">
                        <div className="pulse"></div>
                        <span>Theo dõi thời gian thực</span>
                    </div>
                    <a href="/admin/dashboard" className="btn btn-secondary">
                        <i className="fas fa-arrow-left"></i> Quay lại
                    </a>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #3498db, #2980b9)' }}>
                        <i className="fas fa-list"></i>
                    </div>
                    <div className="stat-value">{stats.totalLogs}</div>
                    <div className="stat-label">Tổng số log</div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #e74c3c, #c0392b)' }}>
                        <i className="fas fa-exclamation-triangle"></i>
                    </div>
                    <div className="stat-value">{stats.errorLogs}</div>
                    <div className="stat-label">Lỗi hôm nay</div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #2ecc71, #27ae60)' }}>
                        <i className="fas fa-users"></i>
                    </div>
                    <div className="stat-value">{stats.activeUsers}</div>
                    <div className="stat-label">Người dùng hoạt động</div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f39c12, #e67e22)' }}>
                        <i className="fas fa-bell"></i>
                    </div>
                    <div className="stat-value">{stats.unreadNotifications}</div>
                    <div className="stat-label">Thông báo mới</div>
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs">
                <div className="tab-nav">
                    <button 
                        className={`tab-button ${activeTab === 'logs' ? 'active' : ''}`}
                        onClick={() => setActiveTab('logs')}
                    >
                        <i className="fas fa-list-alt"></i> Nhật ký hoạt động
                    </button>
                    <button 
                        className={`tab-button ${activeTab === 'notifications' ? 'active' : ''}`}
                        onClick={() => setActiveTab('notifications')}
                    >
                        <i className="fas fa-bell"></i> Thông báo hệ thống
                    </button>
                    <button 
                        className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
                        onClick={() => setActiveTab('analytics')}
                    >
                        <i className="fas fa-chart-bar"></i> Thống kê
                    </button>
                </div>

                {/* System Logs Tab */}
                {activeTab === 'logs' && (
                    <div className="tab-content active">
                        <div className="controls">
                            <div className="search-filters">
                                <div className="search-box">
                                    <i className="fas fa-search"></i>
                                    <input 
                                        type="text" 
                                        placeholder="Tìm kiếm trong log..." 
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                
                                <select 
                                    className="filter-select" 
                                    value={moduleFilter}
                                    onChange={(e) => setModuleFilter(e.target.value)}
                                >
                                    <option value="">Tất cả module</option>
                                    <option value="auth">Xác thực</option>
                                    <option value="user">Người dùng</option>
                                    <option value="training">Đào tạo</option>
                                    <option value="safety">An toàn</option>
                                    <option value="ppe">PPE</option>
                                    <option value="project">Dự án</option>
                                    <option value="system">Hệ thống</option>
                                </select>
                                
                                <select 
                                    className="filter-select" 
                                    value={severityFilter}
                                    onChange={(e) => setSeverityFilter(e.target.value)}
                                >
                                    <option value="">Tất cả mức độ</option>
                                    <option value="info">Thông tin</option>
                                    <option value="success">Thành công</option>
                                    <option value="warning">Cảnh báo</option>
                                    <option value="error">Lỗi</option>
                                    <option value="critical">Nghiêm trọng</option>
                                </select>

                                <input 
                                    type="date" 
                                    className="filter-select" 
                                    value={dateFilter}
                                    onChange={(e) => setDateFilter(e.target.value)}
                                />
                            </div>
                            
                            <div className="export-menu">
                                <button className="btn btn-success" onClick={() => setShowExportMenu(!showExportMenu)}>
                                    <i className="fas fa-download"></i> Xuất dữ liệu
                                </button>
                                {showExportMenu && (
                                    <div className="export-dropdown show">
                                        <button onClick={() => exportLogs('csv')}>
                                            <i className="fas fa-file-csv"></i> Xuất CSV
                                        </button>
                                        <button onClick={() => exportLogs('json')}>
                                            <i className="fas fa-file-code"></i> Xuất JSON
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="logs-container">
                            {getPaginatedLogs().map(log => (
                                <div key={log.log_id} className={`log-entry ${log.severity}`}>
                                    <div className="log-header">
                                        <div>
                                            <div className="log-action">
                                                <i className={getSeverityIcon(log.severity)}></i>
                                                {log.action}
                                            </div>
                                            <div className="log-meta">
                                                <span><i className="fas fa-user"></i> {getUserName(log.user_id)}</span>
                                                <span><i className="fas fa-cube"></i> {log.module}</span>
                                                <span><i className="fas fa-network-wired"></i> {log.ip_address}</span>
                                                <span><i className="fas fa-clock"></i> {getRelativeTime(log.timestamp)}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <span className={`severity-badge severity-${log.severity}`}>
                                                {log.severity.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="log-details">
                                        <strong>Chi tiết:</strong><br />
                                        <pre>{JSON.stringify(log.details, null, 2)}</pre>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {getTotalPages(filteredLogs) > 1 && (
                            <div className="pagination">
                                {currentLogPage > 1 && (
                                    <button onClick={() => setCurrentLogPage(currentLogPage - 1)}>
                                        <i className="fas fa-chevron-left"></i>
                                    </button>
                                )}
                                
                                {Array.from({ length: getTotalPages(filteredLogs) }, (_, i) => i + 1).map(page => (
                                    <button 
                                        key={page}
                                        className={page === currentLogPage ? 'active' : ''}
                                        onClick={() => setCurrentLogPage(page)}
                                    >
                                        {page}
                                    </button>
                                ))}
                                
                                {currentLogPage < getTotalPages(filteredLogs) && (
                                    <button onClick={() => setCurrentLogPage(currentLogPage + 1)}>
                                        <i className="fas fa-chevron-right"></i>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                    <div className="tab-content active">
                        <div className="controls">
                            <div className="search-filters">
                                <div className="search-box">
                                    <i className="fas fa-search"></i>
                                    <input 
                                        type="text" 
                                        placeholder="Tìm kiếm thông báo..." 
                                        value={notificationSearch}
                                        onChange={(e) => setNotificationSearch(e.target.value)}
                                    />
                                </div>
                                
                                <select 
                                    className="filter-select" 
                                    value={notificationTypeFilter}
                                    onChange={(e) => setNotificationTypeFilter(e.target.value)}
                                >
                                    <option value="">Tất cả loại</option>
                                    <option value="info">Thông tin</option>
                                    <option value="warning">Cảnh báo</option>
                                    <option value="error">Lỗi</option>
                                    <option value="success">Thành công</option>
                                </select>
                                
                                <select 
                                    className="filter-select" 
                                    value={readStatusFilter}
                                    onChange={(e) => setReadStatusFilter(e.target.value)}
                                >
                                    <option value="">Tất cả trạng thái</option>
                                    <option value="unread">Chưa đọc</option>
                                    <option value="read">Đã đọc</option>
                                </select>
                            </div>
                            
                            <button className="btn btn-warning" onClick={markAllAsRead}>
                                <i className="fas fa-check"></i> Đánh dấu tất cả đã đọc
                            </button>
                        </div>

                        <div className="notifications-container">
                            {getPaginatedNotifications().map(notification => {
                                const iconData = getNotificationIcon(notification.type);
                                return (
                                    <div key={notification.notification_id} className={`notification-item ${!notification.is_read ? 'unread' : ''}`}>
                                        <div className="notification-icon" style={{ background: iconData.color }}>
                                            <i className={iconData.icon}></i>
                                        </div>
                                        <div className="notification-content">
                                            <div className="notification-title">{notification.title}</div>
                                            <div className="notification-message">{notification.message}</div>
                                            <div className="notification-time">{getRelativeTime(notification.created_at)}</div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            {!notification.is_read && (
                                                <button 
                                                    className="btn btn-sm btn-primary" 
                                                    onClick={() => markAsRead(notification.notification_id)}
                                                >
                                                    <i className="fas fa-check"></i>
                                                </button>
                                            )}
                                            <button 
                                                className="btn btn-sm btn-danger" 
                                                onClick={() => deleteNotification(notification.notification_id)}
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {getTotalPages(filteredNotifications) > 1 && (
                            <div className="pagination">
                                {currentNotificationPage > 1 && (
                                    <button onClick={() => setCurrentNotificationPage(currentNotificationPage - 1)}>
                                        <i className="fas fa-chevron-left"></i>
                                    </button>
                                )}
                                
                                {Array.from({ length: getTotalPages(filteredNotifications) }, (_, i) => i + 1).map(page => (
                                    <button 
                                        key={page}
                                        className={page === currentNotificationPage ? 'active' : ''}
                                        onClick={() => setCurrentNotificationPage(page)}
                                    >
                                        {page}
                                    </button>
                                ))}
                                
                                {currentNotificationPage < getTotalPages(filteredNotifications) && (
                                    <button onClick={() => setCurrentNotificationPage(currentNotificationPage + 1)}>
                                        <i className="fas fa-chevron-right"></i>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Analytics Tab */}
                {activeTab === 'analytics' && (
                    <div className="tab-content active">
                        <div className="controls">
                            <div className="search-filters">
                                <select 
                                    className="filter-select" 
                                    value={analyticsTimeRange}
                                    onChange={(e) => setAnalyticsTimeRange(e.target.value)}
                                >
                                    <option value="today">Hôm nay</option>
                                    <option value="week">7 ngày qua</option>
                                    <option value="month">30 ngày qua</option>
                                    <option value="quarter">3 tháng qua</option>
                                </select>
                            </div>
                        </div>

                        <div className="analytics-container">
                            <div className="stats-grid">
                                <div className="stat-card">
                                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #3498db, #2980b9)' }}>
                                        <i className="fas fa-chart-line"></i>
                                    </div>
                                    <div className="stat-value">{filteredLogs.length}</div>
                                    <div className="stat-label">Tổng log</div>
                                </div>
                                
                                <div className="stat-card">
                                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #2ecc71, #27ae60)' }}>
                                        <i className="fas fa-user-check"></i>
                                    </div>
                                    <div className="stat-value">{stats.activeUsers}</div>
                                    <div className="stat-label">Người dùng hoạt động</div>
                                </div>
                                
                                <div className="stat-card">
                                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #e74c3c, #c0392b)' }}>
                                        <i className="fas fa-exclamation-triangle"></i>
                                    </div>
                                    <div className="stat-value">{stats.errorLogs}</div>
                                    <div className="stat-label">Lỗi</div>
                                </div>
                                
                                <div className="stat-card">
                                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #9b59b6, #8e44ad)' }}>
                                        <i className="fas fa-cube"></i>
                                    </div>
                                    <div className="stat-value">system</div>
                                    <div className="stat-label">Module hoạt động nhiều nhất</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SystemLogs;
