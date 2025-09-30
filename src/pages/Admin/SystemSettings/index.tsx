import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Card, Typography, Button, Space, Table, Tag, Avatar, Row, Col, Statistic, Input, Select, Modal, Form, message, Popconfirm, Tabs, Timeline, Alert } from 'antd';
import { SettingOutlined, PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, FilterOutlined, FileTextOutlined, DatabaseOutlined, MonitorOutlined } from '@ant-design/icons';
import SystemLogService from '../../../services/SystemLogService';
import NotificationService from '../../../services/notificationService';
import FrontendLoggingService from '../../../services/frontendLoggingService';
import ReportExportService from '../../../services/ReportExportService';
import type { SystemLog, SystemLogFilters, SystemLogStats, AnalyticsData } from '../../../services/SystemLogService';
import type { Notification, NotificationFilters, NotificationStats } from '../../../services/notificationService';
import type { RootState } from '../../../store/index';

const SystemLogs: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [activeTab, setActiveTab] = useState<'logs' | 'notifications' | 'public-notifications' | 'analytics' | 'settings'>('logs');
    const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [publicNotifications, setPublicNotifications] = useState<Notification[]>([]);
    const [filteredLogs, setFilteredLogs] = useState<SystemLog[]>([]);
    const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
    const [filteredPublicNotifications, setFilteredPublicNotifications] = useState<Notification[]>([]);
    const [currentLogPage, setCurrentLogPage] = useState(1);
    const [currentNotificationPage, setCurrentNotificationPage] = useState(1);
    const [currentPublicNotificationPage, setCurrentPublicNotificationPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [moduleFilter, setModuleFilter] = useState('');
    const [severityFilter, setSeverityFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [notificationSearch, setNotificationSearch] = useState('');
    const [notificationTypeFilter, setNotificationTypeFilter] = useState('');
    const [readStatusFilter, setReadStatusFilter] = useState('');
    const [publicNotificationSearch, setPublicNotificationSearch] = useState('');
    const [publicNotificationTypeFilter, setPublicNotificationTypeFilter] = useState('');
    const [analyticsTimeRange, setAnalyticsTimeRange] = useState('today');
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // New states for enhanced features
    const [realTimeEnabled, setRealTimeEnabled] = useState(true);
    const [autoRefreshInterval, setAutoRefreshInterval] = useState(30); // seconds
    const [selectedLogs, setSelectedLogs] = useState<string[]>([]);
    const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
    const [selectedPublicNotifications, setSelectedPublicNotifications] = useState<string[]>([]);
    const [bulkActionMode, setBulkActionMode] = useState(false);
    const [notificationBulkActionMode, setNotificationBulkActionMode] = useState(false);
    const [publicNotificationBulkActionMode, setPublicNotificationBulkActionMode] = useState(false);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [logDetailModal, setLogDetailModal] = useState<SystemLog | null>(null);
    const [notificationDetailModal, setNotificationDetailModal] = useState<Notification | null>(null);
    const [isCreatingNotification, setIsCreatingNotification] = useState(false);
    const [newNotification, setNewNotification] = useState({
        title: '',
        message: '',
        type: 'info' as 'info' | 'warning' | 'error' | 'success',
        priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
        category: 'system' as 'system' | 'training' | 'safety' | 'ppe' | 'project' | 'user' | 'general'
    });
    
    // Export states
    const [exportProgress, setExportProgress] = useState(0);
    const [isExporting, setIsExporting] = useState(false);
    const [exportStatus, setExportStatus] = useState<string>('');
    
    // Refs for intervals
    const refreshIntervalRef = useRef<number | null>(null);
    const [stats, setStats] = useState<SystemLogStats>({
        total_logs: 0,
        error_logs: 0,
        active_users: 0,
        most_active_module: 'system'
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

    const ITEMS_PER_PAGE = 10;

    // Real-time refresh functionality
    const startRealTimeRefresh = useCallback(() => {
        if (refreshIntervalRef.current) {
            clearInterval(refreshIntervalRef.current);
        }
        
        if (realTimeEnabled) {
            refreshIntervalRef.current = setInterval(() => {
                loadSystemLogs();
                loadNotifications();
                loadPublicNotifications();
                loadStats();
            }, autoRefreshInterval * 1000);
        }
    }, [realTimeEnabled, autoRefreshInterval]);

    const stopRealTimeRefresh = useCallback(() => {
        if (refreshIntervalRef.current) {
            clearInterval(refreshIntervalRef.current);
            refreshIntervalRef.current = null;
        }
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopRealTimeRefresh();
        };
    }, [stopRealTimeRefresh]);

    // Start/stop real-time refresh when settings change
    useEffect(() => {
        if (realTimeEnabled) {
            startRealTimeRefresh();
        } else {
            stopRealTimeRefresh();
        }
    }, [realTimeEnabled, startRealTimeRefresh, stopRealTimeRefresh]);

    // Load system logs
    const loadSystemLogs = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            const filters: SystemLogFilters = {
                page: currentLogPage,
                limit: ITEMS_PER_PAGE,
                module: moduleFilter || undefined,
                severity: severityFilter || undefined,
                search: searchTerm || undefined,
                start_date: dateFilter || undefined,
                end_date: dateFilter || undefined
            };

            const response = await SystemLogService.getLogs(filters);
            console.log('System logs response data:', response);
            setSystemLogs(response.logs || []);
            setFilteredLogs(response.logs || []);
        } catch (err: any) {
            console.error('Error loading system logs:', err);
            if (err.code === 'ECONNABORTED' || err.timeout) {
                setError('Kết nối đến server bị timeout. Vui lòng kiểm tra kết nối mạng.');
            } else if (err.response?.status === 401) {
                setError('Bạn cần đăng nhập để xem nhật ký hệ thống');
            } else if (err.response?.status === 408) {
                setError('Yêu cầu quá thời gian chờ. Vui lòng thử lại.');
            } else if (err.code === 'ECONNABORTED') {
                setError('Kết nối đến server bị timeout. Vui lòng kiểm tra kết nối mạng.');
            } else {
                setError('Lỗi khi tải nhật ký hệ thống: ' + (err.message || 'Lỗi không xác định'));
            }
        } finally {
            setLoading(false);
        }
    }, [currentLogPage, moduleFilter, severityFilter, searchTerm, dateFilter]);

    // Load notifications
    const loadNotifications = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            const filters: NotificationFilters = {
                page: currentNotificationPage,
                limit: ITEMS_PER_PAGE,
                type: notificationTypeFilter || undefined,
                is_read: readStatusFilter ? readStatusFilter === 'read' : undefined,
                search: notificationSearch || undefined
            };

            const response = await NotificationService.getNotifications(filters);
            console.log('Notifications response:', response);
            setNotifications(response.notifications || []);
            setFilteredNotifications(response.notifications || []);
        } catch (err: any) {
            console.error('Error loading notifications:', err);
            if (err.code === 'ECONNABORTED' || err.timeout) {
                setError('Kết nối đến server bị timeout. Vui lòng kiểm tra kết nối mạng.');
            } else if (err.response?.status === 401) {
                setError('Bạn cần đăng nhập để xem thông báo');
            } else if (err.response?.status === 408) {
                setError('Yêu cầu quá thời gian chờ. Vui lòng thử lại.');
            } else if (err.code === 'ECONNABORTED') {
                setError('Kết nối đến server bị timeout. Vui lòng kiểm tra kết nối mạng.');
            } else {
                setError('Lỗi khi tải thông báo: ' + (err.message || 'Lỗi không xác định'));
            }
            // Set empty notifications to prevent UI errors
            setNotifications([]);
            setFilteredNotifications([]);
        } finally {
            setLoading(false);
        }
    }, [currentNotificationPage, notificationTypeFilter, readStatusFilter, notificationSearch]);

    // Load public notifications
    const loadPublicNotifications = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            const filters: NotificationFilters = {
                page: currentPublicNotificationPage,
                limit: ITEMS_PER_PAGE,
                type: publicNotificationTypeFilter || undefined,
                search: publicNotificationSearch || undefined
            };

            const response = await NotificationService.getPublicNotifications(filters);
            console.log('Public notifications response:', response);
            setPublicNotifications(response.notifications || []);
            setFilteredPublicNotifications(response.notifications || []);
        } catch (err: any) {
            console.error('Error loading public notifications:', err);
            if (err.code === 'ECONNABORTED' || err.timeout) {
                setError('Kết nối đến server bị timeout. Vui lòng kiểm tra kết nối mạng.');
            } else if (err.response?.status === 408) {
                setError('Yêu cầu quá thời gian chờ. Vui lòng thử lại.');
            } else if (err.code === 'ECONNABORTED') {
                setError('Kết nối đến server bị timeout. Vui lòng kiểm tra kết nối mạng.');
            } else {
                setError('Lỗi khi tải thông báo công khai: ' + (err.message || 'Lỗi không xác định'));
            }
            setPublicNotifications([]);
            setFilteredPublicNotifications([]);
        } finally {
            setLoading(false);
        }
    }, [currentPublicNotificationPage, publicNotificationTypeFilter, publicNotificationSearch]);

    // Load statistics
    const loadStats = useCallback(async () => {
        try {
            const [systemStats, notificationStatsData, analyticsData] = await Promise.all([
                SystemLogService.getStats(analyticsTimeRange),
                NotificationService.getStats(),
                SystemLogService.getAnalytics(analyticsTimeRange)
            ]);
            console.log('Stats response:', systemStats);
            console.log('Analytics response:', analyticsData);
            setStats(systemStats.data || systemStats);
            setNotificationStats((notificationStatsData as any).data || notificationStatsData);
            setAnalytics(analyticsData.data || analyticsData);
        } catch (err: any) {
            console.error('Error loading stats:', err);
            if (err.code === 'ECONNABORTED' || err.timeout) {
                setError('Kết nối đến server bị timeout. Vui lòng kiểm tra kết nối mạng.');
            } else if (err.response?.status === 401) {
                setError('Bạn cần đăng nhập để xem thống kê');
            } else if (err.response?.status === 408) {
                setError('Yêu cầu quá thời gian chờ. Vui lòng thử lại.');
            } else if (err.code === 'ECONNABORTED') {
                setError('Kết nối đến server bị timeout. Vui lòng kiểm tra kết nối mạng.');
            } else {
                setError('Lỗi khi tải thống kê: ' + (err.message || 'Lỗi không xác định'));
            }
        }
    }, [analyticsTimeRange]);

    // Initialize data with debounce
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            loadSystemLogs();
            loadNotifications();
            loadPublicNotifications();
            loadStats();
            
            // Log page visit
            FrontendLoggingService.logActivity({
                action: 'Truy cập trang System Logs',
                module: 'system',
                details: {
                    page: 'system-logs',
                    component: 'SystemLogs'
                }
            });
        }, 150);
        
        return () => clearTimeout(timeoutId);
    }, []);

    // Utility functions
    const getRelativeTime = (dateTimeString: string) => {
        return SystemLogService.getRelativeTime(dateTimeString);
    };

    const getUserName = (userId: any) => {
        if (!userId) return 'Hệ thống';
        return userId.full_name || userId.username || 'Người dùng';
    };

    const getSeverityIcon = (severity: string) => {
        return SystemLogService.getSeverityIcon(severity);
    };

    const getNotificationIcon = (type: string) => {
        return NotificationService.getNotificationIcon(type);
    };

    // Filter functions
    const filterLogs = useCallback(() => {
        const filtered = systemLogs.filter(log => {
            const matchesSearch = (log.action || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                                (getUserName(log.user_id) || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                                JSON.stringify(log.details || {}).toLowerCase().includes(searchTerm.toLowerCase());
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
            const matchesSearch = (notification.title || '').toLowerCase().includes(notificationSearch.toLowerCase()) ||
                                (notification.message || '').toLowerCase().includes(notificationSearch.toLowerCase());
            const matchesType = !notificationTypeFilter || notification.type === notificationTypeFilter;
            const matchesReadStatus = !readStatusFilter || 
                (readStatusFilter === 'read' && notification.is_read) ||
                (readStatusFilter === 'unread' && !notification.is_read);
            
            return matchesSearch && matchesType && matchesReadStatus;
        });
        setFilteredNotifications(filtered);
        setCurrentNotificationPage(1);
    }, [notifications, notificationSearch, notificationTypeFilter, readStatusFilter]);

    const filterPublicNotifications = useCallback(() => {
        const filtered = publicNotifications.filter(notification => {
            const matchesSearch = (notification.title || '').toLowerCase().includes(publicNotificationSearch.toLowerCase()) ||
                                (notification.message || '').toLowerCase().includes(publicNotificationSearch.toLowerCase());
            const matchesType = !publicNotificationTypeFilter || notification.type === publicNotificationTypeFilter;
            
            return matchesSearch && matchesType;
        });
        setFilteredPublicNotifications(filtered);
        setCurrentPublicNotificationPage(1);
    }, [publicNotifications, publicNotificationSearch, publicNotificationTypeFilter]);

    // Apply filters when dependencies change
    useEffect(() => {
        filterLogs();
    }, [filterLogs]);

    useEffect(() => {
        filterNotifications();
    }, [filterNotifications]);

    useEffect(() => {
        filterPublicNotifications();
    }, [filterPublicNotifications]);

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

    const getPaginatedPublicNotifications = () => {
        const startIndex = (currentPublicNotificationPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return filteredPublicNotifications.slice(startIndex, endIndex);
    };

    const getTotalPages = (items: any[]) => Math.ceil(items.length / ITEMS_PER_PAGE);

    // Export functions
    const exportLogs = async (format: string) => {
        try {
            const filters: SystemLogFilters = {
                module: moduleFilter || undefined,
                severity: severityFilter || undefined,
                start_date: dateFilter || undefined,
                end_date: dateFilter || undefined
            };

            const blob = await SystemLogService.exportLogs(format as 'json' | 'csv', filters);
            const filename = `system_logs_${new Date().toISOString().split('T')[0]}.${format}`;
            SystemLogService.downloadExportedFile(blob, filename);
        } catch (err) {
            console.error('Error exporting logs:', err);
            setError('Lỗi khi xuất nhật ký');
        }
    };

    // Bulk operations for logs
    const handleLogSelection = (logId: string) => {
        setSelectedLogs(prev => 
            prev.includes(logId) 
                ? prev.filter(id => id !== logId)
                : [...prev, logId]
        );
    };

    const selectAllLogs = () => {
        const currentPageLogs = getPaginatedLogs();
        const allCurrentPageIds = currentPageLogs.map(log => log._id);
        setSelectedLogs(allCurrentPageIds);
    };

    const clearLogSelection = () => {
        setSelectedLogs([]);
        setBulkActionMode(false);
    };

    const bulkDeleteLogs = async () => {
        if (selectedLogs.length === 0) return;
        
        if (window.confirm(`Bạn có chắc chắn muốn xóa ${selectedLogs.length} log đã chọn?`)) {
            try {
                setLoading(true);
                const result = await SystemLogService.bulkDeleteLogs(selectedLogs);
                setSystemLogs(prev => prev.filter(log => !selectedLogs.includes(log._id)));
                setSelectedLogs([]);
                setBulkActionMode(false);
                alert(`Đã xóa ${result.deleted_count}/${result.requested_count} log thành công`);
            } catch (err) {
                console.error('Error bulk deleting logs:', err);
                setError('Lỗi khi xóa logs hàng loạt');
            } finally {
                setLoading(false);
            }
        }
    };

    const bulkExportLogs = async (format: 'json' | 'csv') => {
        if (selectedLogs.length === 0) return;
        
        try {
            setLoading(true);
            const blob = await SystemLogService.exportSelectedLogs(selectedLogs, format);
            const filename = `selected_logs_${new Date().toISOString().split('T')[0]}.${format}`;
            SystemLogService.downloadExportedFile(blob, filename);
        } catch (err) {
            console.error('Error bulk exporting logs:', err);
            setError('Lỗi khi xuất logs đã chọn');
        } finally {
            setLoading(false);
        }
    };

    // Enhanced export functions
    const exportLogsToPDF = async () => {
        try {
            setIsExporting(true);
            setExportStatus('Đang chuẩn bị dữ liệu...');
            setExportProgress(10);

            const filters: SystemLogFilters = {
                module: moduleFilter || undefined,
                severity: severityFilter || undefined,
                start_date: dateFilter || undefined,
                end_date: dateFilter || undefined
            };

            setExportStatus('Đang tải dữ liệu logs...');
            setExportProgress(30);
            const logsResponse = await SystemLogService.getLogs(filters);
            
            setExportStatus('Đang tải dữ liệu thống kê...');
            setExportProgress(50);
            const analyticsResponse = await SystemLogService.getDetailedStats();

            setExportStatus('Đang tạo báo cáo PDF...');
            setExportProgress(70);

            const exportData = {
                logs: logsResponse.logs || [],
                analytics: analyticsResponse,
                summary: {
                    'Tổng số logs': analyticsResponse.total_logs || 0,
                    'Logs hôm nay': analyticsResponse.today_logs || 0,
                    'Logs tuần này': analyticsResponse.week_logs || 0,
                    'Logs tháng này': analyticsResponse.month_logs || 0,
                    'Module phổ biến': analyticsResponse.most_active_module || 'N/A',
                    'Mức độ nghiêm trọng': analyticsResponse.most_common_severity || 'N/A'
                }
            };

            const options = {
                title: 'Báo Cáo Nhật Ký Hệ Thống',
                subtitle: 'Chi tiết hoạt động và thống kê',
                dateRange: dateFilter ? {
                    start: dateFilter,
                    end: dateFilter
                } : undefined,
                filters,
                includeAnalytics: true
            };

            setExportStatus('Đang xuất file...');
            setExportProgress(90);
            await ReportExportService.exportToPDF(exportData, options);

            setExportStatus('Hoàn thành!');
            setExportProgress(100);
            
            // Log export activity
            FrontendLoggingService.logExport('system_logs', 'pdf', logsResponse.logs?.length || 0);
            
        } catch (err) {
            console.error('Error exporting to PDF:', err);
            setError('Lỗi khi xuất báo cáo PDF');
        } finally {
            setIsExporting(false);
            setExportStatus('');
            setExportProgress(0);
        }
    };

    const exportLogsToExcel = async () => {
        try {
            setIsExporting(true);
            setExportStatus('Đang chuẩn bị dữ liệu...');
            setExportProgress(10);

            const filters: SystemLogFilters = {
                module: moduleFilter || undefined,
                severity: severityFilter || undefined,
                start_date: dateFilter || undefined,
                end_date: dateFilter || undefined
            };

            setExportStatus('Đang tải dữ liệu logs...');
            setExportProgress(30);
            const logsResponse = await SystemLogService.getLogs(filters);
            
            setExportStatus('Đang tải dữ liệu thống kê...');
            setExportProgress(50);
            const analyticsResponse = await SystemLogService.getDetailedStats();

            setExportStatus('Đang tạo báo cáo Excel...');
            setExportProgress(70);

            const exportData = {
                logs: logsResponse.logs || [],
                analytics: analyticsResponse,
                summary: {
                    'Tổng số logs': analyticsResponse.total_logs || 0,
                    'Logs hôm nay': analyticsResponse.today_logs || 0,
                    'Logs tuần này': analyticsResponse.week_logs || 0,
                    'Logs tháng này': analyticsResponse.month_logs || 0,
                    'Module phổ biến': analyticsResponse.most_active_module || 'N/A',
                    'Mức độ nghiêm trọng': analyticsResponse.most_common_severity || 'N/A'
                }
            };

            const options = {
                title: 'Báo Cáo Nhật Ký Hệ Thống',
                subtitle: 'Chi tiết hoạt động và thống kê',
                dateRange: dateFilter ? {
                    start: dateFilter,
                    end: dateFilter
                } : undefined,
                filters,
                includeAnalytics: true
            };

            setExportStatus('Đang xuất file...');
            setExportProgress(90);
            await ReportExportService.exportToExcel(exportData, options);

            setExportStatus('Hoàn thành!');
            setExportProgress(100);
            
            // Log export activity
            FrontendLoggingService.logExport('system_logs', 'excel', logsResponse.logs?.length || 0);
            
        } catch (err) {
            console.error('Error exporting to Excel:', err);
            setError('Lỗi khi xuất báo cáo Excel');
        } finally {
            setIsExporting(false);
            setExportStatus('');
            setExportProgress(0);
        }
    };

    const exportAnalyticsDashboard = async () => {
        try {
            setIsExporting(true);
            setExportStatus('Đang chuẩn bị dữ liệu thống kê...');
            setExportProgress(20);

            const analyticsResponse = await SystemLogService.getStats(analyticsTimeRange);

            setExportStatus('Đang tạo báo cáo thống kê...');
            setExportProgress(60);

            const options = {
                title: 'Báo Cáo Thống Kê Hệ Thống',
                subtitle: `Khoảng thời gian: ${analyticsTimeRange}`,
                dateRange: analyticsTimeRange !== 'all' ? {
                    start: new Date().toISOString().split('T')[0],
                    end: new Date().toISOString().split('T')[0]
                } : undefined,
                includeAnalytics: true
            };

            setExportStatus('Đang xuất file...');
            setExportProgress(80);
            await ReportExportService.exportAnalyticsDashboard(analyticsResponse, options);

            setExportStatus('Hoàn thành!');
            setExportProgress(100);
            
            // Log export activity
            FrontendLoggingService.logExport('analytics', 'pdf', 1);
            
        } catch (err) {
            console.error('Error exporting analytics dashboard:', err);
            setError('Lỗi khi xuất báo cáo thống kê');
        } finally {
            setIsExporting(false);
            setExportStatus('');
            setExportProgress(0);
        }
    };

    const exportChartsToPDF = async () => {
        try {
            setIsExporting(true);
            setExportStatus('Đang chuẩn bị biểu đồ...');
            setExportProgress(20);

            // Get chart elements
            const chartElements = document.querySelectorAll('.chart-container');
            if (chartElements.length === 0) {
                throw new Error('Không tìm thấy biểu đồ để xuất');
            }

            setExportStatus('Đang tạo báo cáo biểu đồ...');
            setExportProgress(60);

            const options = {
                title: 'Báo Cáo Biểu Đồ Thống Kê',
                subtitle: `Khoảng thời gian: ${analyticsTimeRange}`,
                dateRange: analyticsTimeRange !== 'all' ? {
                    start: new Date().toISOString().split('T')[0],
                    end: new Date().toISOString().split('T')[0]
                } : undefined
            };

            setExportStatus('Đang xuất file...');
            setExportProgress(80);
            await ReportExportService.exportChartsToPDF(Array.from(chartElements) as HTMLElement[], options);

            setExportStatus('Hoàn thành!');
            setExportProgress(100);
            
            // Log export activity
            FrontendLoggingService.logExport('charts', 'pdf', chartElements.length);
            
        } catch (err) {
            console.error('Error exporting charts to PDF:', err);
            setError('Lỗi khi xuất biểu đồ');
        } finally {
            setIsExporting(false);
            setExportStatus('');
            setExportProgress(0);
        }
    };

    // Create notification
    const createNotification = async () => {
        try {
            setLoading(true);
            console.log('Creating notification with user:', user);
            console.log('New notification data:', newNotification);
            
            if (!user?.id) {
                throw new Error('Không tìm thấy thông tin người dùng');
            }
            
            await NotificationService.createNotification({
                user_id: user.id, // Use actual user ID from Redux store
                ...newNotification
            });
            setIsCreatingNotification(false);
            setNewNotification({
                title: '',
                message: '',
                type: 'info',
                priority: 'medium',
                category: 'system'
            });
            loadNotifications();
            alert('Tạo thông báo thành công!');
        } catch (err: any) {
            console.error('Error creating notification:', err);
            setError('Lỗi khi tạo thông báo: ' + (err.message || 'Lỗi không xác định'));
        } finally {
            setLoading(false);
        }
    };

    // Notification actions
    const markAsRead = async (notificationId: string) => {
        try {
            await NotificationService.markAsRead(notificationId);
            setNotifications(prev => 
                prev.map(n => n._id === notificationId ? { ...n, is_read: true } : n)
            );
            setNotificationStats(prev => ({
                ...prev,
                unread_notifications: Math.max(0, prev.unread_notifications - 1)
            }));
        } catch (err) {
            console.error('Error marking notification as read:', err);
            setError('Lỗi khi đánh dấu thông báo đã đọc');
        }
    };

    const markAllAsRead = async () => {
        try {
            await NotificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setNotificationStats(prev => ({
                ...prev,
                unread_notifications: 0
            }));
        } catch (err) {
            console.error('Error marking all notifications as read:', err);
            setError('Lỗi khi đánh dấu tất cả thông báo đã đọc');
        }
    };

    const deleteNotification = async (notificationId: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa thông báo này?')) {
            try {
                await NotificationService.deleteNotification(notificationId);
                setNotifications(prev => prev.filter(n => n._id !== notificationId));
                setNotificationStats(prev => ({
                    ...prev,
                    total_notifications: Math.max(0, prev.total_notifications - 1),
                    unread_notifications: Math.max(0, prev.unread_notifications - 1)
                }));
            } catch (err) {
                console.error('Error deleting notification:', err);
                setError('Lỗi khi xóa thông báo');
            }
        }
    };

    // Bulk operations for notifications
    const handleNotificationSelection = (notificationId: string) => {
        setSelectedNotifications(prev => 
            prev.includes(notificationId) 
                ? prev.filter(id => id !== notificationId)
                : [...prev, notificationId]
        );
    };

    const selectAllNotifications = () => {
        const currentPageNotifications = getPaginatedNotifications();
        const allCurrentPageIds = currentPageNotifications.map(notification => notification._id);
        setSelectedNotifications(allCurrentPageIds);
    };

    const clearNotificationSelection = () => {
        setSelectedNotifications([]);
        setNotificationBulkActionMode(false);
    };

    const bulkDeleteNotifications = async () => {
        if (selectedNotifications.length === 0) return;
        
        if (window.confirm(`Bạn có chắc chắn muốn xóa ${selectedNotifications.length} thông báo đã chọn?`)) {
            try {
                setLoading(true);
                const result = await NotificationService.bulkDeleteNotifications(selectedNotifications);
                setNotifications(prev => prev.filter(notification => !selectedNotifications.includes(notification._id)));
                setSelectedNotifications([]);
                setNotificationBulkActionMode(false);
                alert(`Đã xóa ${result.deleted_count}/${result.requested_count} thông báo thành công`);
            } catch (err) {
                console.error('Error bulk deleting notifications:', err);
                setError('Lỗi khi xóa thông báo hàng loạt');
            } finally {
                setLoading(false);
            }
        }
    };

    // Bulk operations for public notifications
    const handlePublicNotificationSelection = (notificationId: string) => {
        setSelectedPublicNotifications(prev => 
            prev.includes(notificationId) 
                ? prev.filter(id => id !== notificationId)
                : [...prev, notificationId]
        );
    };

    const selectAllPublicNotifications = () => {
        const currentPageNotifications = getPaginatedPublicNotifications();
        const allCurrentPageIds = currentPageNotifications.map(notification => notification._id);
        setSelectedPublicNotifications(allCurrentPageIds);
    };

    const clearPublicNotificationSelection = () => {
        setSelectedPublicNotifications([]);
        setPublicNotificationBulkActionMode(false);
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

            {/* Error Message */}
            {error && (
                <div className="alert alert-danger" style={{ margin: '1rem 0' }}>
                    <i className="fas fa-exclamation-triangle"></i> {error}
                    <button 
                        className="btn btn-sm btn-outline-danger ms-2"
                        onClick={() => setError(null)}
                    >
                        <i className="fas fa-times"></i>
                    </button>
                </div>
            )}

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #3498db, #2980b9)' }}>
                        <i className="fas fa-list"></i>
                    </div>
                    <div className="stat-value">{stats.total_logs}</div>
                    <div className="stat-label">Tổng số log</div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #e74c3c, #c0392b)' }}>
                        <i className="fas fa-exclamation-triangle"></i>
                    </div>
                    <div className="stat-value">{stats.error_logs}</div>
                    <div className="stat-label">Lỗi hôm nay</div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #2ecc71, #27ae60)' }}>
                        <i className="fas fa-users"></i>
                    </div>
                    <div className="stat-value">{stats.active_users}</div>
                    <div className="stat-label">Người dùng hoạt động</div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f39c12, #e67e22)' }}>
                        <i className="fas fa-bell"></i>
                    </div>
                    <div className="stat-value">{notificationStats.unread_notifications}</div>
                    <div className="stat-label">Thông báo mới</div>
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs">
                <div className="tab-nav">
                    <button 
                        className={`tab-button ${activeTab === 'logs' ? 'active' : ''}`}
                        onClick={() => {
                            const previousTab = activeTab;
                            setActiveTab('logs');
                            FrontendLoggingService.logTabSwitch('system', previousTab, 'logs');
                        }}
                    >
                        <i className="fas fa-list-alt"></i> Nhật ký hoạt động
                        {stats.error_logs > 0 && (
                            <span className="badge badge-danger">{stats.error_logs}</span>
                        )}
                    </button>
                    <button 
                        className={`tab-button ${activeTab === 'notifications' ? 'active' : ''}`}
                        onClick={() => {
                            const previousTab = activeTab;
                            setActiveTab('notifications');
                            FrontendLoggingService.logTabSwitch('system', previousTab, 'notifications');
                        }}
                    >
                        <i className="fas fa-bell"></i> Thông báo hệ thống
                        {notificationStats.unread_notifications > 0 && (
                            <span className="badge badge-warning">{notificationStats.unread_notifications}</span>
                        )}
                    </button>
                    <button 
                        className={`tab-button ${activeTab === 'public-notifications' ? 'active' : ''}`}
                        onClick={() => {
                            const previousTab = activeTab;
                            setActiveTab('public-notifications');
                            FrontendLoggingService.logTabSwitch('system', previousTab, 'public-notifications');
                        }}
                    >
                        <i className="fas fa-bullhorn"></i> Thông báo công khai
                        {publicNotifications.length > 0 && (
                            <span className="badge badge-info">{publicNotifications.length}</span>
                        )}
                    </button>
                    <button 
                        className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
                        onClick={() => {
                            const previousTab = activeTab;
                            setActiveTab('analytics');
                            FrontendLoggingService.logTabSwitch('system', previousTab, 'analytics');
                        }}
                    >
                        <i className="fas fa-chart-bar"></i> Thống kê
                    </button>
                    <button 
                        className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
                        onClick={() => {
                            const previousTab = activeTab;
                            setActiveTab('settings');
                            FrontendLoggingService.logTabSwitch('system', previousTab, 'settings');
                        }}
                    >
                        <i className="fas fa-cog"></i> Cài đặt
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
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            if (e.target.value.length > 2) {
                                                FrontendLoggingService.logSearch('system', e.target.value, 0);
                                            }
                                        }}
                                    />
                                </div>
                                
                                <select 
                                    className="filter-select" 
                                    value={moduleFilter}
                                    onChange={(e) => {
                                        setModuleFilter(e.target.value);
                                        FrontendLoggingService.logFilterChange('system', 'module', e.target.value);
                                    }}
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

                                <button 
                                    className="btn btn-outline-secondary"
                                    onClick={() => {
                                        setShowAdvancedFilters(!showAdvancedFilters);
                                        FrontendLoggingService.logButtonClick('Bộ lọc nâng cao', 'system', {
                                            action: showAdvancedFilters ? 'hide' : 'show'
                                        });
                                    }}
                                >
                                    <i className="fas fa-filter"></i> Bộ lọc nâng cao
                                </button>
                            </div>
                            
                            <div className="action-buttons">
                                {selectedLogs.length > 0 && (
                                    <div className="bulk-actions">
                                        <span className="selected-count">
                                            Đã chọn: {selectedLogs.length}
                                        </span>
                                        <button 
                                            className="btn btn-danger btn-sm"
                                            onClick={bulkDeleteLogs}
                                        >
                                            <i className="fas fa-trash"></i> Xóa
                                        </button>
                                        <button 
                                            className="btn btn-info btn-sm"
                                            onClick={() => bulkExportLogs('json')}
                                        >
                                            <i className="fas fa-download"></i> Xuất JSON
                                        </button>
                                        <button 
                                            className="btn btn-secondary btn-sm"
                                            onClick={clearLogSelection}
                                        >
                                            <i className="fas fa-times"></i> Bỏ chọn
                                        </button>
                                    </div>
                                )}
                                
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
                        </div>

                        {/* Advanced Filters */}
                        {showAdvancedFilters && (
                            <div className="advanced-filters">
                                <div className="filter-row">
                                    <div className="filter-group">
                                        <label>Khoảng thời gian:</label>
                                        <input 
                                            type="datetime-local" 
                                            className="filter-input"
                                            placeholder="Từ ngày"
                                        />
                                        <input 
                                            type="datetime-local" 
                                            className="filter-input"
                                            placeholder="Đến ngày"
                                        />
                                    </div>
                                    <div className="filter-group">
                                        <label>IP Address:</label>
                                        <input 
                                            type="text" 
                                            className="filter-input"
                                            placeholder="192.168.1.1"
                                        />
                                    </div>
                                    <div className="filter-group">
                                        <label>User Agent:</label>
                                        <input 
                                            type="text" 
                                            className="filter-input"
                                            placeholder="Chrome, Firefox..."
                                        />
                                    </div>
                                </div>
                                <div className="filter-actions">
                                    <button className="btn btn-primary btn-sm">
                                        <i className="fas fa-search"></i> Áp dụng bộ lọc
                                    </button>
                                    <button 
                                        className="btn btn-secondary btn-sm"
                                        onClick={() => setShowAdvancedFilters(false)}
                                    >
                                        <i className="fas fa-times"></i> Đóng
                                    </button>
                                </div>
                            </div>
                        )}

                        {loading ? (
                            <div className="text-center" style={{ padding: '2rem' }}>
                                <i className="fas fa-spinner fa-spin fa-2x"></i>
                                <p>Đang tải dữ liệu...</p>
                            </div>
                        ) : (
                            <div className="logs-container">
                                {/* Bulk selection header */}
                                {bulkActionMode && (
                                    <div className="bulk-selection-header">
                                        <div className="selection-controls">
                                            <input 
                                                type="checkbox" 
                                                checked={selectedLogs.length === getPaginatedLogs().length && getPaginatedLogs().length > 0}
                                                onChange={selectAllLogs}
                                            />
                                            <span>Chọn tất cả ({getPaginatedLogs().length})</span>
                                        </div>
                                        <div className="bulk-actions">
                                            <button 
                                                className="btn btn-danger btn-sm"
                                                onClick={bulkDeleteLogs}
                                                disabled={selectedLogs.length === 0}
                                            >
                                                <i className="fas fa-trash"></i> Xóa ({selectedLogs.length})
                                            </button>
                                            <button 
                                                className="btn btn-info btn-sm"
                                                onClick={() => bulkExportLogs('json')}
                                                disabled={selectedLogs.length === 0}
                                            >
                                                <i className="fas fa-download"></i> Xuất ({selectedLogs.length})
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {getPaginatedLogs().map(log => (
                                    <div key={log._id} className={`log-entry ${log.severity} ${selectedLogs.includes(log._id) ? 'selected' : ''}`}>
                                        <div className="log-header">
                                            <div className="log-main">
                                                {bulkActionMode && (
                                                    <input 
                                                        type="checkbox" 
                                                        checked={selectedLogs.includes(log._id)}
                                                        onChange={() => handleLogSelection(log._id)}
                                                    />
                                                )}
                                                <div className="log-content">
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
                                            </div>
                                            <div className="log-actions">
                                                <span className={`severity-badge severity-${log.severity}`}>
                                                    {log.severity.toUpperCase()}
                                                </span>
                                                <button 
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={() => setLogDetailModal(log)}
                                                >
                                                    <i className="fas fa-eye"></i>
                                                </button>
                                            </div>
                                        </div>
                                        <div className="log-details">
                                            <strong>Chi tiết:</strong><br />
                                            <pre>{JSON.stringify(log.details, null, 2)}</pre>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

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
                            
                            <div className="action-buttons">
                                {selectedNotifications.length > 0 && (
                                    <div className="bulk-actions">
                                        <span className="selected-count">
                                            Đã chọn: {selectedNotifications.length}
                                        </span>
                                        <button 
                                            className="btn btn-danger btn-sm"
                                            onClick={bulkDeleteNotifications}
                                        >
                                            <i className="fas fa-trash"></i> Xóa
                                        </button>
                                        <button 
                                            className="btn btn-secondary btn-sm"
                                            onClick={clearNotificationSelection}
                                        >
                                            <i className="fas fa-times"></i> Bỏ chọn
                                        </button>
                                    </div>
                                )}
                                
                                <button className="btn btn-warning" onClick={markAllAsRead}>
                                    <i className="fas fa-check"></i> Đánh dấu tất cả đã đọc
                                </button>
                                
                                <button 
                                    className="btn btn-outline-secondary"
                                    onClick={() => setNotificationBulkActionMode(!notificationBulkActionMode)}
                                >
                                    <i className="fas fa-check-square"></i> Chế độ chọn hàng loạt
                                </button>
                            </div>
                        </div>

                        {loading ? (
                            <div className="text-center" style={{ padding: '2rem' }}>
                                <i className="fas fa-spinner fa-spin fa-2x"></i>
                                <p>Đang tải dữ liệu...</p>
                            </div>
                        ) : (
                            <div className="notifications-container">
                                {/* Bulk selection header */}
                                {notificationBulkActionMode && (
                                    <div className="bulk-selection-header">
                                        <div className="selection-controls">
                                            <input 
                                                type="checkbox" 
                                                checked={selectedNotifications.length === getPaginatedNotifications().length && getPaginatedNotifications().length > 0}
                                                onChange={selectAllNotifications}
                                            />
                                            <span>Chọn tất cả ({getPaginatedNotifications().length})</span>
                                        </div>
                                        <div className="bulk-actions">
                                            <button 
                                                className="btn btn-danger btn-sm"
                                                onClick={bulkDeleteNotifications}
                                                disabled={selectedNotifications.length === 0}
                                            >
                                                <i className="fas fa-trash"></i> Xóa ({selectedNotifications.length})
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {getPaginatedNotifications().map(notification => {
                                    const iconData = getNotificationIcon(notification.type);
                                    return (
                                        <div key={notification._id} className={`notification-item ${!notification.is_read ? 'unread' : ''} ${selectedNotifications.includes(notification._id) ? 'selected' : ''}`}>
                                            {notificationBulkActionMode && (
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectedNotifications.includes(notification._id)}
                                                    onChange={() => handleNotificationSelection(notification._id)}
                                                />
                                            )}
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
                                                        onClick={() => markAsRead(notification._id)}
                                                    >
                                                        <i className="fas fa-check"></i>
                                                    </button>
                                                )}
                                                <button 
                                                    className="btn btn-sm btn-danger" 
                                                    onClick={() => deleteNotification(notification._id)}
                                                >
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

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

                {/* Public Notifications Tab */}
                {activeTab === 'public-notifications' && (
                    <div className="tab-content active">
                        <div className="controls">
                            <div className="search-filters">
                                <div className="search-box">
                                    <i className="fas fa-search"></i>
                                    <input 
                                        type="text" 
                                        placeholder="Tìm kiếm thông báo công khai..." 
                                        value={publicNotificationSearch}
                                        onChange={(e) => setPublicNotificationSearch(e.target.value)}
                                    />
                                </div>
                                
                                <select 
                                    className="filter-select" 
                                    value={publicNotificationTypeFilter}
                                    onChange={(e) => setPublicNotificationTypeFilter(e.target.value)}
                                >
                                    <option value="">Tất cả loại</option>
                                    <option value="info">Thông tin</option>
                                    <option value="warning">Cảnh báo</option>
                                    <option value="error">Lỗi</option>
                                    <option value="success">Thành công</option>
                                </select>
                            </div>
                            
                            <div className="action-buttons">
                                {selectedPublicNotifications.length > 0 && (
                                    <div className="bulk-actions">
                                        <span className="selected-count">
                                            Đã chọn: {selectedPublicNotifications.length}
                                        </span>
                                        <button 
                                            className="btn btn-secondary btn-sm"
                                            onClick={clearPublicNotificationSelection}
                                        >
                                            <i className="fas fa-times"></i> Bỏ chọn
                                        </button>
                                    </div>
                                )}
                                
                                <button 
                                    className="btn btn-outline-secondary"
                                    onClick={() => setPublicNotificationBulkActionMode(!publicNotificationBulkActionMode)}
                                >
                                    <i className="fas fa-check-square"></i> Chế độ chọn hàng loạt
                                </button>
                            </div>
                        </div>

                        {loading ? (
                            <div className="text-center" style={{ padding: '2rem' }}>
                                <i className="fas fa-spinner fa-spin fa-2x"></i>
                                <p>Đang tải dữ liệu...</p>
                            </div>
                        ) : (
                            <div className="notifications-container">
                                {/* Bulk selection header */}
                                {publicNotificationBulkActionMode && (
                                    <div className="bulk-selection-header">
                                        <div className="selection-controls">
                                            <input 
                                                type="checkbox" 
                                                checked={selectedPublicNotifications.length === getPaginatedPublicNotifications().length && getPaginatedPublicNotifications().length > 0}
                                                onChange={selectAllPublicNotifications}
                                            />
                                            <span>Chọn tất cả ({getPaginatedPublicNotifications().length})</span>
                                        </div>
                                    </div>
                                )}

                                {getPaginatedPublicNotifications().map(notification => {
                                    const iconData = getNotificationIcon(notification.type);
                                    return (
                                        <div key={notification._id} className={`notification-item ${selectedPublicNotifications.includes(notification._id) ? 'selected' : ''}`}>
                                            {publicNotificationBulkActionMode && (
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectedPublicNotifications.includes(notification._id)}
                                                    onChange={() => handlePublicNotificationSelection(notification._id)}
                                                />
                                            )}
                                            <div className="notification-icon" style={{ background: iconData.color }}>
                                                <i className={iconData.icon}></i>
                                            </div>
                                            <div className="notification-content">
                                                <div className="notification-title">{notification.title}</div>
                                                <div className="notification-message">{notification.message}</div>
                                                <div className="notification-time">
                                                    {notification.relative_time || getRelativeTime(notification.created_at)}
                                                </div>
                                                <div className="notification-meta">
                                                    <span className={`type-badge type-${notification.type}`}>
                                                        {NotificationService.getTypeLabel(notification.type)}
                                                    </span>
                                                    <span className={`priority-badge priority-${notification.priority}`}>
                                                        {notification.priority.toUpperCase()}
                                                    </span>
                                                    <span className="category-badge">
                                                        {NotificationService.getCategoryLabel(notification.category)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {getTotalPages(filteredPublicNotifications) > 1 && (
                            <div className="pagination">
                                {currentPublicNotificationPage > 1 && (
                                    <button onClick={() => setCurrentPublicNotificationPage(currentPublicNotificationPage - 1)}>
                                        <i className="fas fa-chevron-left"></i>
                                    </button>
                                )}
                                
                                {Array.from({ length: getTotalPages(filteredPublicNotifications) }, (_, i) => i + 1).map(page => (
                                    <button 
                                        key={page}
                                        className={page === currentPublicNotificationPage ? 'active' : ''}
                                        onClick={() => setCurrentPublicNotificationPage(page)}
                                    >
                                        {page}
                                    </button>
                                ))}
                                
                                {currentPublicNotificationPage < getTotalPages(filteredPublicNotifications) && (
                                    <button onClick={() => setCurrentPublicNotificationPage(currentPublicNotificationPage + 1)}>
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
                        {/* Analytics Header */}
                        <div className="analytics-header">
                            <div className="analytics-title">
                                <h2><i className="fas fa-chart-line"></i> Bảng Điều Khiển Thống Kê</h2>
                                <p>Phân tích và giám sát hoạt động hệ thống</p>
                            </div>
                            <div className="analytics-controls">
                                <div className="time-range-selector">
                                    <label><i className="fas fa-calendar-alt"></i> Khoảng thời gian:</label>
                                    <select 
                                        className="modern-select" 
                                        value={analyticsTimeRange}
                                        onChange={(e) => setAnalyticsTimeRange(e.target.value)}
                                    >
                                        <option value="today">Hôm nay</option>
                                        <option value="week">7 ngày qua</option>
                                        <option value="month">30 ngày qua</option>
                                        <option value="quarter">3 tháng qua</option>
                                    </select>
                                </div>
                                <div className="refresh-indicator">
                                    <div className={`pulse-dot ${realTimeEnabled ? 'active' : ''}`}></div>
                                    <span>{realTimeEnabled ? 'Đang cập nhật' : 'Tạm dừng'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Key Metrics Dashboard */}
                        <div className="metrics-dashboard">
                            <div className="metric-card primary">
                                <div className="metric-icon">
                                    <i className="fas fa-database"></i>
                                </div>
                                <div className="metric-content">
                                    <div className="metric-value">{stats.total_logs?.toLocaleString() || 0}</div>
                                    <div className="metric-label">Tổng Log Hệ Thống</div>
                                    <div className="metric-trend">
                                        <i className="fas fa-arrow-up"></i>
                                        <span>+12% so với tuần trước</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="metric-card success">
                                <div className="metric-icon">
                                    <i className="fas fa-users"></i>
                                </div>
                                <div className="metric-content">
                                    <div className="metric-value">{stats.active_users || 0}</div>
                                    <div className="metric-label">Người Dùng Hoạt Động</div>
                                    <div className="metric-trend">
                                        <i className="fas fa-arrow-up"></i>
                                        <span>+5% so với tuần trước</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="metric-card warning">
                                <div className="metric-icon">
                                    <i className="fas fa-exclamation-triangle"></i>
                                </div>
                                <div className="metric-content">
                                    <div className="metric-value">{stats.error_logs || 0}</div>
                                    <div className="metric-label">Lỗi Hệ Thống</div>
                                    <div className="metric-trend">
                                        <i className="fas fa-arrow-down"></i>
                                        <span>-8% so với tuần trước</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="metric-card info">
                                <div className="metric-icon">
                                    <i className="fas fa-cogs"></i>
                                </div>
                                <div className="metric-content">
                                    <div className="metric-value">{stats.most_active_module || 'N/A'}</div>
                                    <div className="metric-label">Module Hoạt Động Nhiều Nhất</div>
                                    <div className="metric-trend">
                                        <i className="fas fa-chart-line"></i>
                                        <span>Hoạt động cao</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Charts Section */}
                        {analytics && (
                            <div className="charts-section">
                                {/* Severity Distribution Chart */}
                                <div className="chart-container">
                                    <div className="chart-header">
                                        <h3><i className="fas fa-chart-pie"></i> Phân Bố Mức Độ Nghiêm Trọng</h3>
                                        <div className="chart-actions">
                                            <button className="chart-action-btn" title="Xuất biểu đồ">
                                                <i className="fas fa-download"></i>
                                            </button>
                                            <button className="chart-action-btn" title="Phóng to">
                                                <i className="fas fa-expand"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="chart-content">
                                        <div className="severity-chart">
                                            {analytics.severity_distribution.map((item, index) => {
                                                const percentage = (item.count / analytics.severity_distribution.reduce((sum, i) => sum + i.count, 0)) * 100;
                                                return (
                                                    <div key={index} className="severity-item">
                                                        <div className="severity-bar">
                                                            <div 
                                                                className={`severity-fill ${item._id}`}
                                                                style={{ width: `${percentage}%` }}
                                                            ></div>
                                                        </div>
                                                        <div className="severity-info">
                                                            <span className={`severity-badge ${item._id}`}>
                                                                {item._id.toUpperCase()}
                                                            </span>
                                                            <span className="severity-count">{item.count}</span>
                                                            <span className="severity-percentage">{percentage.toFixed(1)}%</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Module Distribution Chart */}
                                <div className="chart-container">
                                    <div className="chart-header">
                                        <h3><i className="fas fa-chart-bar"></i> Phân Bố Theo Module</h3>
                                        <div className="chart-actions">
                                            <button className="chart-action-btn" title="Xuất biểu đồ">
                                                <i className="fas fa-download"></i>
                                            </button>
                                            <button className="chart-action-btn" title="Phóng to">
                                                <i className="fas fa-expand"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="chart-content">
                                        <div className="module-chart">
                                            {analytics.module_distribution.map((item, index) => {
                                                const maxCount = Math.max(...analytics.module_distribution.map(m => m.count));
                                                const height = (item.count / maxCount) * 100;
                                                return (
                                                    <div key={index} className="module-bar">
                                                        <div className="bar-container">
                                                            <div 
                                                                className="bar-fill"
                                                                style={{ height: `${height}%` }}
                                                            ></div>
                                                        </div>
                                                        <div className="bar-label">{item._id}</div>
                                                        <div className="bar-value">{item.count}</div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Daily Activity Chart */}
                                <div className="chart-container">
                                    <div className="chart-header">
                                        <h3><i className="fas fa-chart-line"></i> Hoạt Động Hàng Ngày</h3>
                                        <div className="chart-actions">
                                            <button className="chart-action-btn" title="Xuất biểu đồ">
                                                <i className="fas fa-download"></i>
                                            </button>
                                            <button className="chart-action-btn" title="Phóng to">
                                                <i className="fas fa-expand"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="chart-content">
                                        <div className="daily-activity-chart">
                                            {analytics.daily_activity.slice(-7).map((item, index) => {
                                                const maxCount = Math.max(...analytics.daily_activity.map(d => d.count));
                                                const height = (item.count / maxCount) * 100;
                                                const date = new Date(item._id.year, item._id.month - 1, item._id.day);
                                                return (
                                                    <div key={index} className="daily-bar">
                                                        <div className="bar-container">
                                                            <div 
                                                                className="bar-fill daily"
                                                                style={{ height: `${height}%` }}
                                                            ></div>
                                                        </div>
                                                        <div className="bar-label">
                                                            {date.getDate()}/{date.getMonth() + 1}
                                                        </div>
                                                        <div className="bar-value">{item.count}</div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Top Users Chart */}
                                <div className="chart-container">
                                    <div className="chart-header">
                                        <h3><i className="fas fa-trophy"></i> Top Người Dùng Hoạt Động</h3>
                                        <div className="chart-actions">
                                            <button className="chart-action-btn" title="Xuất biểu đồ">
                                                <i className="fas fa-download"></i>
                                            </button>
                                            <button className="chart-action-btn" title="Phóng to">
                                                <i className="fas fa-expand"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="chart-content">
                                        <div className="top-users-chart">
                                            {analytics.top_users.map((user, index) => {
                                                const maxCount = Math.max(...analytics.top_users.map(u => u.count));
                                                const width = (user.count / maxCount) * 100;
                                                return (
                                                    <div key={index} className="user-item">
                                                        <div className="user-rank">
                                                            <span className={`rank-badge ${index < 3 ? 'top' : ''}`}>
                                                                #{index + 1}
                                                            </span>
                                                        </div>
                                                        <div className="user-info">
                                                            <div className="user-name">
                                                                {user.user_name || user.username || 'Người dùng ẩn danh'}
                                                            </div>
                                                            <div className="user-bar">
                                                                <div 
                                                                    className="user-bar-fill"
                                                                    style={{ width: `${width}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                        <div className="user-count">{user.count}</div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Export and Actions */}
                        <div className="analytics-footer">
                            <div className="export-section">
                                <h4><i className="fas fa-file-export"></i> Xuất Báo Cáo</h4>
                                <div className="export-buttons">
                                    <button 
                                        className="export-btn pdf"
                                        onClick={exportLogsToPDF}
                                        disabled={isExporting}
                                    >
                                        <i className="fas fa-file-pdf"></i>
                                        Xuất PDF
                                    </button>
                                    <button 
                                        className="export-btn excel"
                                        onClick={exportLogsToExcel}
                                        disabled={isExporting}
                                    >
                                        <i className="fas fa-file-excel"></i>
                                        Xuất Excel
                                    </button>
                                    <button 
                                        className="export-btn csv"
                                        onClick={() => exportLogs('csv')}
                                        disabled={isExporting}
                                    >
                                        <i className="fas fa-file-csv"></i>
                                        Xuất CSV
                                    </button>
                                </div>
                                <div className="export-buttons" style={{ marginTop: '0.5rem' }}>
                                    <button 
                                        className="export-btn pdf"
                                        onClick={exportAnalyticsDashboard}
                                        disabled={isExporting}
                                        style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
                                    >
                                        <i className="fas fa-chart-bar"></i>
                                        Báo Cáo Thống Kê
                                    </button>
                                    <button 
                                        className="export-btn excel"
                                        onClick={exportChartsToPDF}
                                        disabled={isExporting}
                                        style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
                                    >
                                        <i className="fas fa-chart-pie"></i>
                                        Biểu Đồ
                                    </button>
                                </div>
                            </div>
                            <div className="last-updated">
                                <i className="fas fa-clock"></i>
                                Cập nhật lần cuối: {analytics ? new Date().toLocaleString('vi-VN') : 'Chưa có dữ liệu'}
                            </div>
                        </div>
                    </div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                    <div className="tab-content active">
                        <div className="settings-container">
                            <div className="settings-section">
                                <h3><i className="fas fa-sync-alt"></i> Cài đặt Real-time</h3>
                                <div className="setting-item">
                                    <label>
                                        <input 
                                            type="checkbox" 
                                            checked={realTimeEnabled}
                                            onChange={(e) => setRealTimeEnabled(e.target.checked)}
                                        />
                                        Bật cập nhật thời gian thực
                                    </label>
                                </div>
                                <div className="setting-item">
                                    <label>
                                        Tần suất cập nhật (giây):
                                        <select 
                                            value={autoRefreshInterval}
                                            onChange={(e) => setAutoRefreshInterval(Number(e.target.value))}
                                            disabled={!realTimeEnabled}
                                        >
                                            <option value={10}>10 giây</option>
                                            <option value={30}>30 giây</option>
                                            <option value={60}>1 phút</option>
                                            <option value={300}>5 phút</option>
                                        </select>
                                    </label>
                                </div>
                            </div>

                            <div className="settings-section">
                                <h3><i className="fas fa-filter"></i> Cài đặt Bộ lọc</h3>
                                <div className="setting-item">
                                    <label>
                                        <input 
                                            type="checkbox" 
                                            checked={bulkActionMode}
                                            onChange={(e) => setBulkActionMode(e.target.checked)}
                                        />
                                        Bật chế độ chọn hàng loạt
                                    </label>
                                </div>
                                <div className="setting-item">
                                    <label>
                                        <input 
                                            type="checkbox" 
                                            checked={showAdvancedFilters}
                                            onChange={(e) => setShowAdvancedFilters(e.target.checked)}
                                        />
                                        Hiển thị bộ lọc nâng cao mặc định
                                    </label>
                                </div>
                            </div>

                            <div className="settings-section">
                                <h3><i className="fas fa-bell"></i> Cài đặt Thông báo</h3>
                                <div className="setting-item">
                                    <button 
                                        className="btn btn-primary"
                                        onClick={() => setIsCreatingNotification(true)}
                                    >
                                        <i className="fas fa-plus"></i> Tạo thông báo mới
                                    </button>
                                </div>
                            </div>

                            <div className="settings-section">
                                <h3><i className="fas fa-database"></i> Quản lý Dữ liệu</h3>
                                <div className="setting-item">
                                    {(user?.role?.role_name?.toLowerCase() === 'super_admin' || user?.role?.role_name?.toLowerCase() === 'admin') ? (
                                        <button 
                                            className="btn btn-warning"
                                            onClick={async () => {
                                                if (window.confirm('Bạn có chắc chắn muốn dọn dẹp logs cũ? Hành động này không thể hoàn tác.')) {
                                                    try {
                                                        setLoading(true);
                                                        setError(null);
                                                        const result = await SystemLogService.cleanupOldLogs(90);
                                                        const message = result.data.actual_period === '1 giờ' 
                                                            ? `Đã xóa ${result.data.deleted_count} logs cũ hơn ${result.data.actual_period} thành công (không có logs cũ hơn 90 ngày)`
                                                            : `Đã xóa ${result.data.deleted_count} logs cũ hơn ${result.data.actual_period} thành công`;
                                                        alert(message);
                                                        loadSystemLogs();
                                                    } catch (err: any) {
                                                        console.error('Error cleaning up old logs:', err);
                                                        if (err.response?.status === 403) {
                                                            setError('Bạn không có quyền thực hiện hành động này. Chỉ Admin và Super Admin mới có thể dọn dẹp logs cũ.');
                                                        } else if (err.response?.status === 401) {
                                                            setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                                                        } else {
                                                            setError(`Lỗi khi dọn dẹp logs cũ: ${err.response?.data?.message || err.message || 'Lỗi không xác định'}`);
                                                        }
                                                    } finally {
                                                        setLoading(false);
                                                    }
                                                }
                                            }}
                                            disabled={loading}
                                        >
                                            <i className="fas fa-broom"></i> Dọn dẹp logs cũ (90 ngày)
                                        </button>
                                    ) : (
                                        <div className="permission-notice">
                                            <i className="fas fa-lock"></i>
                                            <span>Chỉ Admin và Super Admin mới có thể dọn dẹp logs cũ</span>
                                        </div>
                                    )}
                                </div>
                                <div className="setting-item">
                                    <button 
                                        className="btn btn-info"
                                        onClick={async () => {
                                            if (window.confirm('Bạn có chắc chắn muốn dọn dẹp thông báo hết hạn?')) {
                                                try {
                                                    setLoading(true);
                                                    const result = await NotificationService.cleanupExpiredNotifications();
                                                    alert(`Đã xóa ${result.deleted_count} thông báo hết hạn thành công`);
                                                    loadNotifications();
                                                } catch (err) {
                                                    console.error('Error cleaning up expired notifications:', err);
                                                    setError('Lỗi khi dọn dẹp thông báo hết hạn');
                                                } finally {
                                                    setLoading(false);
                                                }
                                            }
                                        }}
                                    >
                                        <i className="fas fa-trash-alt"></i> Dọn dẹp thông báo hết hạn
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Export Progress Modal */}
            {isExporting && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '400px' }}>
                        <div className="modal-header">
                            <h3><i className="fas fa-download"></i> Đang Xuất Báo Cáo</h3>
                        </div>
                        <div className="modal-body">
                            <div className="export-progress">
                                <div className="progress-info">
                                    <p>{exportStatus}</p>
                                    <span>{exportProgress}%</span>
                                </div>
                                <div className="progress-bar">
                                    <div 
                                        className="progress-fill" 
                                        style={{ width: `${exportProgress}%` }}
                                    ></div>
                                </div>
                                <div className="progress-steps">
                                    <div className={`step ${exportProgress >= 10 ? 'completed' : ''}`}>
                                        <i className="fas fa-check"></i>
                                        Chuẩn bị dữ liệu
                                    </div>
                                    <div className={`step ${exportProgress >= 50 ? 'completed' : ''}`}>
                                        <i className="fas fa-check"></i>
                                        Tạo báo cáo
                                    </div>
                                    <div className={`step ${exportProgress >= 90 ? 'completed' : ''}`}>
                                        <i className="fas fa-check"></i>
                                        Xuất file
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Log Detail Modal */}
            {logDetailModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Chi tiết Log</h3>
                            <button 
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => setLogDetailModal(null)}
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="log-detail-grid">
                                <div className="detail-item">
                                    <label>Hành động:</label>
                                    <span>{logDetailModal.action}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Module:</label>
                                    <span>{logDetailModal.module}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Mức độ:</label>
                                    <span className={`severity-badge severity-${logDetailModal.severity}`}>
                                        {logDetailModal.severity.toUpperCase()}
                                    </span>
                                </div>
                                <div className="detail-item">
                                    <label>Người dùng:</label>
                                    <span>{getUserName(logDetailModal.user_id)}</span>
                                </div>
                                <div className="detail-item">
                                    <label>IP Address:</label>
                                    <span>{logDetailModal.ip_address}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Thời gian:</label>
                                    <span>{SystemLogService.formatDateTime(logDetailModal.timestamp)}</span>
                                </div>
                                {logDetailModal.user_agent && (
                                    <div className="detail-item full-width">
                                        <label>User Agent:</label>
                                        <span>{logDetailModal.user_agent}</span>
                                    </div>
                                )}
                                <div className="detail-item full-width">
                                    <label>Chi tiết:</label>
                                    <pre className="detail-json">{JSON.stringify(logDetailModal.details, null, 2)}</pre>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Notification Detail Modal */}
            {notificationDetailModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Chi tiết Thông báo</h3>
                            <button 
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => setNotificationDetailModal(null)}
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="notification-detail-grid">
                                <div className="detail-item">
                                    <label>Tiêu đề:</label>
                                    <span>{notificationDetailModal.title}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Loại:</label>
                                    <span className={`type-badge type-${notificationDetailModal.type}`}>
                                        {NotificationService.getTypeLabel(notificationDetailModal.type)}
                                    </span>
                                </div>
                                <div className="detail-item">
                                    <label>Mức độ ưu tiên:</label>
                                    <span className={`priority-badge priority-${notificationDetailModal.priority}`}>
                                        {notificationDetailModal.priority.toUpperCase()}
                                    </span>
                                </div>
                                <div className="detail-item">
                                    <label>Danh mục:</label>
                                    <span>{NotificationService.getCategoryLabel(notificationDetailModal.category)}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Trạng thái:</label>
                                    <span className={notificationDetailModal.is_read ? 'text-success' : 'text-warning'}>
                                        {notificationDetailModal.is_read ? 'Đã đọc' : 'Chưa đọc'}
                                    </span>
                                </div>
                                <div className="detail-item">
                                    <label>Thời gian tạo:</label>
                                    <span>{NotificationService.formatDateTime(notificationDetailModal.created_at)}</span>
                                </div>
                                <div className="detail-item full-width">
                                    <label>Nội dung:</label>
                                    <div className="notification-message-detail">
                                        {notificationDetailModal.message}
                                    </div>
                                </div>
                                {notificationDetailModal.action_url && (
                                    <div className="detail-item full-width">
                                        <label>URL hành động:</label>
                                        <a href={notificationDetailModal.action_url} target="_blank" rel="noopener noreferrer">
                                            {notificationDetailModal.action_url}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="modal-footer">
                            {!notificationDetailModal.is_read && (
                                <button 
                                    className="btn btn-primary"
                                    onClick={() => {
                                        markAsRead(notificationDetailModal._id);
                                        setNotificationDetailModal(null);
                                    }}
                                >
                                    <i className="fas fa-check"></i> Đánh dấu đã đọc
                                </button>
                            )}
                            <button 
                                className="btn btn-danger"
                                onClick={() => {
                                    deleteNotification(notificationDetailModal._id);
                                    setNotificationDetailModal(null);
                                }}
                            >
                                <i className="fas fa-trash"></i> Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Notification Modal */}
            {isCreatingNotification && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Tạo Thông báo Mới</h3>
                            <button 
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => setIsCreatingNotification(false)}
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Tiêu đề:</label>
                                <input 
                                    type="text" 
                                    className="form-control"
                                    value={newNotification.title}
                                    onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
                                    placeholder="Nhập tiêu đề thông báo..."
                                />
                            </div>
                            <div className="form-group">
                                <label>Nội dung:</label>
                                <textarea 
                                    className="form-control"
                                    rows={4}
                                    value={newNotification.message}
                                    onChange={(e) => setNewNotification({...newNotification, message: e.target.value})}
                                    placeholder="Nhập nội dung thông báo..."
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Loại:</label>
                                    <select 
                                        className="form-control"
                                        value={newNotification.type}
                                        onChange={(e) => setNewNotification({...newNotification, type: e.target.value as any})}
                                    >
                                        <option value="info">Thông tin</option>
                                        <option value="success">Thành công</option>
                                        <option value="warning">Cảnh báo</option>
                                        <option value="error">Lỗi</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Mức độ ưu tiên:</label>
                                    <select 
                                        className="form-control"
                                        value={newNotification.priority}
                                        onChange={(e) => setNewNotification({...newNotification, priority: e.target.value as any})}
                                    >
                                        <option value="low">Thấp</option>
                                        <option value="medium">Trung bình</option>
                                        <option value="high">Cao</option>
                                        <option value="urgent">Khẩn cấp</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Danh mục:</label>
                                <select 
                                    className="form-control"
                                    value={newNotification.category}
                                    onChange={(e) => setNewNotification({...newNotification, category: e.target.value as any})}
                                >
                                    <option value="system">Hệ thống</option>
                                    <option value="training">Đào tạo</option>
                                    <option value="safety">An toàn</option>
                                    <option value="ppe">PPE</option>
                                    <option value="project">Dự án</option>
                                    <option value="user">Người dùng</option>
                                    <option value="general">Chung</option>
                                </select>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button 
                                className="btn btn-secondary"
                                onClick={() => setIsCreatingNotification(false)}
                            >
                                Hủy
                            </button>
                            <button 
                                className="btn btn-primary"
                                onClick={createNotification}
                                disabled={!newNotification.title || !newNotification.message}
                            >
                                <i className="fas fa-plus"></i> Tạo thông báo
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SystemLogs;