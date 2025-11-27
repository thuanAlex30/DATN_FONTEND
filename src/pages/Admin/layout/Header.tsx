import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Layout, 
  Typography, 
  Input, 
  Button, 
  Space, 
  Dropdown, 
  Badge, 
  Avatar,
  Popover
} from 'antd';
import type { MenuProps } from 'antd';
import { 
  SearchOutlined, 
  BellOutlined, 
  UserOutlined, 
  LogoutOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { logout } from '../../../store/slices/authSlice';
import type { RootState } from '../../../store';
import ProfileModal from '../../../components/ProfileModal/ProfileModal';
import { useWebSocket } from '../../../hooks/useWebSocket';
import websocketClient from '../../../services/websocketClient';
import { 
  markNotificationAsRead, 
  clearAllNotifications,
  addNotification,
  setConnectionStatus,
  setConnectionError
} from '../../../store/slices/websocketSlice';
import type { NotificationData } from '../../../store/slices/websocketSlice';
import NotificationService from '../../../services/notificationService';
import WeatherWidget from '../../../components/WeatherWidget/WeatherWidget';

const { Header: AntHeader } = Layout;
const { Title, Text } = Typography;
const { Search } = Input;

const Header = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, token } = useSelector((state: RootState) => state.auth);
    const { notifications, unreadCount } = useSelector((state: RootState) => state.websocket);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [hasUserInteracted, setHasUserInteracted] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    // Use WebSocket hook to get connection status
    useWebSocket(token, 'http://localhost:3000');

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const handleProfileInfo = () => {
        setShowProfileModal(true);
    };

    const handleCloseProfileModal = () => {
        setShowProfileModal(false);
    };

    // Setup WebSocket event listeners
    useEffect(() => {
        if (!token) {
            console.log('No auth token, skipping WebSocket setup');
            return;
        }
        
        // Prevent duplicate listeners by removing existing ones first
        websocketClient.removeAllListeners('connection_status');
        websocketClient.removeAllListeners('connection_error');
        websocketClient.removeAllListeners('ppe_returned');
        websocketClient.removeAllListeners('ppe_reported');
        websocketClient.removeAllListeners('ppe_expiring');
        websocketClient.removeAllListeners('ppe_low_stock');
        websocketClient.removeAllListeners('notification_created');
        websocketClient.removeAllListeners('incident_reported');
        websocketClient.removeAllListeners('incident_classified');
        websocketClient.removeAllListeners('incident_assigned');
        websocketClient.removeAllListeners('incident_progress_updated');
        websocketClient.removeAllListeners('incident_closed');
        websocketClient.removeAllListeners('incident_reported_confirmation');
        websocketClient.removeAllListeners('ppe_reported_confirmation');

        // Connection status handlers
        const handleConnectionStatus = (data: any) => {
            dispatch(setConnectionStatus(data.connected));
        };

        const handleConnectionError = (error: string) => {
            dispatch(setConnectionError(error));
        };

        // Notification handlers
        const handlePPEReturned = (data: any) => {
            const issuanceId = data.issuance?.id || data.issuance?._id;
            const returnerId = data.returner?.id || data.returner?._id;
            const timestamp = performance.now();
            const uniqueId = `ppe_returned_${issuanceId}_${returnerId}_${timestamp}`;
            
            dispatch(addNotification({
                id: uniqueId,
                title: 'PPE đã được trả lại',
                message: `PPE ${data.issuance?.item_id?.item_name || 'không xác định'} đã được trả lại bởi ${data.returner?.name || 'người dùng không xác định'}`,
                type: 'success',
                category: 'ppe',
                priority: 'low',
                created_at: new Date().toISOString(),
                action_url: '/ppe/issuances'
            }));
        };

        const handlePPEReported = (data: any) => {
            console.log('📢 Header received ppe_reported:', data);
            const issuanceId = data.issuance?.id || data.issuance?._id;
            const reporterId = data.reporter?.id || data.reporter?._id;
            const timestamp = performance.now();
            const uniqueId = `ppe_reported_${issuanceId}_${reporterId}_${timestamp}`;
            
            dispatch(addNotification({
                id: uniqueId,
                title: 'PPE có vấn đề được báo cáo',
                message: `PPE ${data.issuance?.item_id?.item_name || 'không xác định'} có vấn đề được báo cáo bởi ${data.reporter?.name || 'người dùng không xác định'}`,
                type: 'warning',
                category: 'ppe',
                priority: 'high',
                created_at: new Date().toISOString(),
                action_url: '/ppe/issuances'
            }));
        };

        const handlePPEExpiring = (data: any) => {
            dispatch(addNotification({
                id: `ppe_expiring_${Date.now()}`,
                title: 'PPE sắp hết hạn',
                message: `PPE ${data.item?.name || 'không xác định'} sẽ hết hạn vào ${data.expiry_date || 'ngày không xác định'}`,
                type: 'warning',
                category: 'ppe',
                priority: 'high',
                created_at: new Date().toISOString(),
                action_url: '/ppe/items'
            }));
        };

        const handlePPELowStock = (data: any) => {
            dispatch(addNotification({
                id: `ppe_low_stock_${Date.now()}`,
                title: 'PPE sắp hết hàng',
                message: `PPE ${data.item?.name || 'không xác định'} chỉ còn ${data.quantity || 0} sản phẩm`,
                type: 'warning',
                category: 'ppe',
                priority: 'high',
                created_at: new Date().toISOString(),
                action_url: '/ppe/items'
            }));
        };

        const handleNotificationCreated = (data: any) => {
            console.log('📨 Header received notification:', data);
            if (data.notification) {
                dispatch(addNotification({
                    id: data.notification._id || `notification_${Date.now()}`,
                    title: data.notification.title || 'Thông báo mới',
                    message: data.notification.message || 'Bạn có thông báo mới',
                    type: data.notification.type || 'info',
                    category: data.notification.category || 'general',
                    priority: data.notification.priority || 'medium',
                    created_at: data.notification.created_at || new Date().toISOString(),
                    action_url: data.notification.action_url
                }));
            }
        };

        // Incident event handlers
        const handleIncidentReported = (data: any) => {
            console.log('🚨 Header received incident_reported:', data);
            dispatch(addNotification({
                id: `incident_reported_${data.incident?._id || Date.now()}`,
                title: 'Sự cố mới được báo cáo',
                message: `Sự cố "${data.incident?.title || 'Không có tiêu đề'}" đã được báo cáo bởi ${data.reporter?.name || 'Người dùng'}`,
                type: 'warning',
                category: 'safety',
                priority: 'high',
                created_at: new Date().toISOString(),
                action_url: `/incidents/${data.incident?._id}`
            }));
        };

        const handleIncidentClassified = (data: any) => {
            console.log('📋 Header received incident_classified:', data);
            dispatch(addNotification({
                id: `incident_classified_${data.incident?._id || Date.now()}`,
                title: 'Sự cố đã được phân loại',
                message: `Sự cố "${data.incident?.title || 'Không có tiêu đề'}" đã được phân loại bởi ${data.classifier?.name || 'Người dùng'}`,
                type: 'info',
                category: 'safety',
                priority: 'medium',
                created_at: new Date().toISOString(),
                action_url: `/incidents/${data.incident?._id}`
            }));
        };

        const handleIncidentAssigned = (data: any) => {
            console.log('👤 Header received incident_assigned:', data);
            dispatch(addNotification({
                id: `incident_assigned_${data.incident?._id || Date.now()}`,
                title: 'Sự cố đã được phân công',
                message: `Sự cố "${data.incident?.title || 'Không có tiêu đề'}" đã được phân công cho ${data.assignee?.name || 'Người dùng'}`,
                type: 'info',
                category: 'safety',
                priority: 'medium',
                created_at: new Date().toISOString(),
                action_url: `/incidents/${data.incident?._id}`
            }));
        };

        const handleIncidentProgressUpdated = (data: any) => {
            console.log('📈 Header received incident_progress_updated:', data);
            dispatch(addNotification({
                id: `incident_progress_${data.incident?._id || Date.now()}`,
                title: 'Tiến độ sự cố được cập nhật',
                message: `Tiến độ sự cố "${data.incident?.title || 'Không có tiêu đề'}" đã được cập nhật bởi ${data.updater?.name || 'Người dùng'}`,
                type: 'info',
                category: 'safety',
                priority: 'low',
                created_at: new Date().toISOString(),
                action_url: `/incidents/${data.incident?._id}`
            }));
        };

        const handleIncidentClosed = (data: any) => {
            console.log('✅ Header received incident_closed:', data);
            dispatch(addNotification({
                id: `incident_closed_${data.incident?._id || Date.now()}`,
                title: 'Sự cố đã được đóng',
                message: `Sự cố "${data.incident?.title || 'Không có tiêu đề'}" đã được đóng bởi ${data.closer?.name || 'Người dùng'}`,
                type: 'success',
                category: 'safety',
                priority: 'medium',
                created_at: new Date().toISOString(),
                action_url: `/incidents/${data.incident?._id}`
            }));
        };

        const handleIncidentReportedConfirmation = (data: any) => {
            console.log('✅ Header received incident_reported_confirmation:', data);
            dispatch(addNotification({
                id: `incident_confirmation_${data.incidentId || Date.now()}`,
                title: 'Xác nhận báo cáo sự cố',
                message: data.message || 'Sự cố đã được báo cáo thành công',
                type: 'success',
                category: 'safety',
                priority: 'low',
                created_at: new Date().toISOString(),
                action_url: `/incidents/${data.incidentId}`
            }));
        };

        const handlePPEReportedConfirmation = (data: any) => {
            console.log('✅ Header received ppe_reported_confirmation:', data);
            dispatch(addNotification({
                id: `ppe_confirmation_${data.issuanceId || Date.now()}`,
                title: 'Xác nhận báo cáo PPE',
                message: data.message || 'Báo cáo PPE thành công',
                type: 'success',
                category: 'ppe',
                priority: 'low',
                created_at: new Date().toISOString(),
                action_url: '/ppe/issuances'
            }));
        };

        // Add event listeners
        console.log('Adding WebSocket event listeners to Header...');
        websocketClient.on('connection_status', handleConnectionStatus);
        websocketClient.on('connection_error', handleConnectionError);
        websocketClient.on('ppe_returned', handlePPEReturned);
        websocketClient.on('ppe_reported', handlePPEReported);
        websocketClient.on('ppe_expiring', handlePPEExpiring);
        websocketClient.on('ppe_low_stock', handlePPELowStock);
        websocketClient.on('notification_created', handleNotificationCreated);
        
        // Incident event listeners
        websocketClient.on('incident_reported', handleIncidentReported);
        websocketClient.on('incident_classified', handleIncidentClassified);
        websocketClient.on('incident_assigned', handleIncidentAssigned);
        websocketClient.on('incident_progress_updated', handleIncidentProgressUpdated);
        websocketClient.on('incident_closed', handleIncidentClosed);
        websocketClient.on('incident_reported_confirmation', handleIncidentReportedConfirmation);
        websocketClient.on('ppe_reported_confirmation', handlePPEReportedConfirmation);
        
        console.log('WebSocket event listeners added to Header successfully');

        // Cleanup
        return () => {
            websocketClient.off('connection_status', handleConnectionStatus);
            websocketClient.off('connection_error', handleConnectionError);
            websocketClient.off('ppe_returned', handlePPEReturned);
            websocketClient.off('ppe_expiring', handlePPEExpiring);
            websocketClient.off('ppe_low_stock', handlePPELowStock);
            websocketClient.off('notification_created', handleNotificationCreated);
            
            // Incident event cleanup
            websocketClient.off('incident_reported', handleIncidentReported);
            websocketClient.off('incident_classified', handleIncidentClassified);
            websocketClient.off('incident_assigned', handleIncidentAssigned);
            websocketClient.off('incident_progress_updated', handleIncidentProgressUpdated);
            websocketClient.off('incident_closed', handleIncidentClosed);
            websocketClient.off('incident_reported_confirmation', handleIncidentReportedConfirmation);
            websocketClient.off('ppe_reported_confirmation', handlePPEReportedConfirmation);
        };
    }, [token, dispatch]);

    // Load initial notifications from API
    useEffect(() => {
        const loadInitialNotifications = async () => {
            if (!token) {
                console.log('No auth token, skipping initial notifications load');
                return;
            }

            try {
                console.log('Loading initial notifications from API...');
                const response = await NotificationService.getNotifications({
                    limit: 20,
                    sort: 'created_at',
                    order: 'desc'
                });
                
                if (response.notifications && response.notifications.length > 0) {
                    console.log(`Loaded ${response.notifications.length} initial notifications`);
                    
                    // Add each notification to the store
                    response.notifications.forEach((notification: any) => {
                        dispatch(addNotification({
                            id: notification._id || `notification_${Date.now()}_${Math.random()}`,
                            title: notification.title || 'Thông báo',
                            message: notification.message || 'Bạn có thông báo mới',
                            type: notification.type || 'info',
                            category: notification.category || 'general',
                            priority: notification.priority || 'medium',
                            created_at: notification.created_at || new Date().toISOString(),
                            action_url: notification.action_url,
                            isRead: notification.isRead || false
                        }));
                    });
                } else {
                    console.log('No initial notifications found');
                }
            } catch (error) {
                console.error('Error loading initial notifications:', error);
            }
        };

        loadInitialNotifications();
    }, [token, dispatch]);

    // Track user interaction for audio permission
    useEffect(() => {
        const handleUserInteraction = () => {
            setHasUserInteracted(true);
            // Remove listeners after first interaction
            document.removeEventListener('click', handleUserInteraction);
            document.removeEventListener('keydown', handleUserInteraction);
            document.removeEventListener('touchstart', handleUserInteraction);
        };

        document.addEventListener('click', handleUserInteraction);
        document.addEventListener('keydown', handleUserInteraction);
        document.addEventListener('touchstart', handleUserInteraction);

        return () => {
            document.removeEventListener('click', handleUserInteraction);
            document.removeEventListener('keydown', handleUserInteraction);
            document.removeEventListener('touchstart', handleUserInteraction);
        };
    }, []);

    // Play notification sound when new notification arrives (only after user interaction)
    useEffect(() => {
        if (notifications.length > 0 && audioRef.current && hasUserInteracted) {
            audioRef.current.play().catch(error => {
                console.log('Audio play failed (user interaction required):', error.message);
            });
        }
    }, [notifications.length, hasUserInteracted]);

    const markAsRead = (notificationId: string) => {
        dispatch(markNotificationAsRead(notificationId));
    };

    const handleClearAllNotifications = () => {
        dispatch(clearAllNotifications());
    };

    const handleNotificationItemClick = (notification: NotificationData) => {
        markAsRead(notification.id);
        setShowNotifications(false);
        
        if (notification.action_url) {
            // Navigate to the action URL
            window.location.href = notification.action_url;
        }
    };

    const getNotificationIcon = (type: string) => {
        const icons = {
            info: 'fas fa-info-circle',
            success: 'fas fa-check-circle',
            warning: 'fas fa-exclamation-triangle',
            error: 'fas fa-times-circle'
        };
        return icons[type as keyof typeof icons] || 'fas fa-bell';
    };

    const getPriorityColor = (priority: string) => {
        const colors = {
            low: '#95a5a6',
            medium: '#3498db',
            high: '#f39c12',
            urgent: '#e74c3c'
        };
        return colors[priority as keyof typeof colors] || '#6c757d';
    };

    const getCategoryLabel = (category: string) => {
        const labels = {
            system: 'Hệ thống',
            training: 'Đào tạo',
            safety: 'An toàn',
            ppe: 'PPE',
            project: 'Dự án',
            user: 'Người dùng',
            general: 'Chung'
        };
        return labels[category as keyof typeof labels] || category;
    };

    const profileMenuItems: MenuProps['items'] = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: 'Thông tin tài khoản',
            onClick: handleProfileInfo,
        },
        {
            key: 'settings',
            icon: <SettingOutlined />,
            label: 'Cài đặt',
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Đăng xuất',
            onClick: handleLogout,
            danger: true,
        },
    ];

    return (
        <AntHeader 
            style={{
                background: 'rgba(255, 255, 255, 0.95)',
                padding: '1.5rem 2rem',
                margin: '0',
                borderRadius: '0',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'relative',
                zIndex: 10000,
                height: 'auto',
                lineHeight: 'normal',
            }}
        >
            <div>
                <Title level={2} style={{ margin: 0, color: '#2c3e50', fontSize: '1.8rem', lineHeight: 1.3 }}>
                    Chào mừng, {user?.full_name || 'Admin'}!
                </Title>
                <Text style={{ color: '#666', fontSize: '0.95rem', lineHeight: 1.4 }}>
                    Hôm nay là ngày tốt để đảm bảo an toàn lao động
                </Text>
            </div>
            
            <Space size="middle" align="center">
                <WeatherWidget />
                <Search
                    placeholder="Tìm kiếm..."
                    style={{ width: 220 }}
                    prefix={<SearchOutlined style={{ color: '#6c5ce7' }} />}
                />
                
                <Popover
                    content={
                        <div style={{ width: 400, maxHeight: 500 }}>
                            {/* Notification Sound */}
                            <audio ref={audioRef} preload="auto">
                                <source src="/notification-sound.mp3" type="audio/mpeg" />
                            </audio>
                            
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                padding: '12px 16px',
                                borderBottom: '1px solid #f0f0f0',
                                marginBottom: '8px'
                            }}>
                                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Thông báo mới</h3>
                                <Button 
                                    type="text" 
                                    size="small"
                                    onClick={handleClearAllNotifications}
                                    disabled={notifications.length === 0}
                                    style={{ color: '#ff4d4f' }}
                                >
                                    <i className="fas fa-trash" style={{ marginRight: '4px' }}></i>
                                    Xóa tất cả
                                </Button>
                            </div>

                            <div style={{ maxHeight: 350, overflowY: 'auto' }}>
                                {notifications.length === 0 ? (
                                    <div style={{ 
                                        textAlign: 'center', 
                                        padding: '40px 20px',
                                        color: '#999'
                                    }}>
                                        <i className="fas fa-bell-slash" style={{ fontSize: '24px', marginBottom: '8px' }}></i>
                                        <p style={{ margin: 0 }}>Không có thông báo mới</p>
                                    </div>
                                ) : (
                                    notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            onClick={() => handleNotificationItemClick(notification)}
                                            style={{
                                                padding: '12px 16px',
                                                borderBottom: '1px solid #f0f0f0',
                                                cursor: 'pointer',
                                                borderLeft: `4px solid ${getPriorityColor(notification.priority)}`,
                                                backgroundColor: notification.isRead ? '#fff' : '#f8f9fa'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = '#f0f0f0';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = notification.isRead ? '#fff' : '#f8f9fa';
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                                <div style={{ 
                                                    color: getPriorityColor(notification.priority),
                                                    fontSize: '16px',
                                                    marginTop: '2px'
                                                }}>
                                                    <i className={getNotificationIcon(notification.type)}></i>
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ 
                                                        display: 'flex', 
                                                        justifyContent: 'space-between', 
                                                        alignItems: 'flex-start',
                                                        marginBottom: '4px'
                                                    }}>
                                                        <h4 style={{ 
                                                            margin: 0, 
                                                            fontSize: '14px', 
                                                            fontWeight: '600',
                                                            color: '#333'
                                                        }}>
                                                            {notification.title}
                                                        </h4>
                                                        <span style={{ 
                                                            fontSize: '11px',
                                                            color: '#999',
                                                            backgroundColor: '#f0f0f0',
                                                            padding: '2px 6px',
                                                            borderRadius: '4px'
                                                        }}>
                                                            {getCategoryLabel(notification.category)}
                                                        </span>
                                                    </div>
                                                    <p style={{ 
                                                        margin: '0 0 8px 0', 
                                                        fontSize: '13px', 
                                                        color: '#666',
                                                        lineHeight: '1.4'
                                                    }}>
                                                        {notification.message}
                                                    </p>
                                                    <div style={{ 
                                                        display: 'flex', 
                                                        justifyContent: 'space-between', 
                                                        alignItems: 'center'
                                                    }}>
                                                        <span style={{ 
                                                            fontSize: '11px', 
                                                            color: '#999'
                                                        }}>
                                                            {NotificationService.getRelativeTime(notification.created_at)}
                                                        </span>
                                                        <span style={{ 
                                                            fontSize: '10px',
                                                            color: getPriorityColor(notification.priority),
                                                            fontWeight: '600',
                                                            textTransform: 'uppercase'
                                                        }}>
                                                            {notification.priority}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div style={{ 
                                padding: '12px 16px',
                                borderTop: '1px solid #f0f0f0',
                                textAlign: 'center'
                            }}>
                                <Button 
                                    type="link" 
                                    size="small"
                                    onClick={() => {
                                        setShowNotifications(false);
                                        window.location.href = '/notifications';
                                    }}
                                    style={{ color: '#6c5ce7' }}
                                >
                                    <i className="fas fa-list" style={{ marginRight: '4px' }}></i>
                                    Xem tất cả thông báo
                                </Button>
                            </div>
                        </div>
                    }
                    title={null}
                    trigger="click"
                    open={showNotifications}
                    onOpenChange={setShowNotifications}
                    placement="bottomRight"
                    overlayStyle={{ zIndex: 10001 }}
                >
                    <Badge count={unreadCount} size="small">
                        <Button
                            type="text"
                            icon={<BellOutlined />}
                            style={{
                                padding: '0.8rem',
                                borderRadius: '12px',
                                background: 'rgba(108, 92, 231, 0.1)',
                                color: '#6c5ce7',
                                border: 'none',
                            }}
                        />
                    </Badge>
                </Popover>
                
                <Dropdown
                    menu={{ items: profileMenuItems }}
                    placement="bottomRight"
                    trigger={['click']}
                >
                    <Button
                        type="text"
                        style={{
                            padding: '0.8rem',
                            borderRadius: '12px',
                            background: 'rgba(108, 92, 231, 0.1)',
                            color: '#6c5ce7',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                        }}
                    >
                        <Avatar 
                            icon={<UserOutlined />} 
                            size="small"
                            style={{ background: '#6c5ce7' }}
                        />
                    </Button>
                </Dropdown>
            </Space>
            
            {/* Profile Modal */}
            <ProfileModal 
                isOpen={showProfileModal} 
                onClose={handleCloseProfileModal} 
            />
        </AntHeader>
    );
};

export default Header;