import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store';
import { useWebSocket } from '../../hooks/useWebSocket';
import websocketClient from '../../services/websocketClient';
import { 
  markNotificationAsRead, 
  clearAllNotifications,
  addNotification,
  setConnectionStatus,
  setConnectionError
} from '../../store/slices/websocketSlice';
import type { NotificationData } from '../../store/slices/websocketSlice';
import NotificationService from '../../services/notificationService';
import './RealtimeNotifications.css';

interface RealtimeNotificationsProps {
  authToken: string | null;
}

const RealtimeNotifications: React.FC<RealtimeNotificationsProps> = ({ authToken }) => {
  const dispatch = useDispatch();
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Use WebSocket hook to get connection status
  const { isConnected } = useWebSocket(authToken, 'http://localhost:3000');
  
  // Get notifications from Redux store
  const { notifications, unreadCount } = useSelector((state: RootState) => state.websocket);
  

  // Setup WebSocket event listeners
  useEffect(() => {
    if (!authToken) {
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
      console.log('📢 RealtimeNotifications received ppe_reported:', data);
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
      console.log('📨 RealtimeNotifications received notification:', data);
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
      console.log('🚨 RealtimeNotifications received incident_reported:', data);
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
      console.log('📋 RealtimeNotifications received incident_classified:', data);
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
      console.log('👤 RealtimeNotifications received incident_assigned:', data);
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
      console.log('📈 RealtimeNotifications received incident_progress_updated:', data);
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
      console.log('✅ RealtimeNotifications received incident_closed:', data);
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
      console.log('✅ RealtimeNotifications received incident_reported_confirmation:', data);
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
      console.log('✅ RealtimeNotifications received ppe_reported_confirmation:', data);
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
    console.log('Adding WebSocket event listeners...');
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
    
    console.log('WebSocket event listeners added successfully');

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
  }, [authToken, dispatch]);

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

  const handleNotificationClick = (notification: NotificationData) => {
    markAsRead(notification.id);
    
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

  if (!authToken) return null;

  return (
    <div className="realtime-notifications" ref={notificationRef}>
      {/* Notification Sound */}
      <audio ref={audioRef} preload="auto">
        <source src="/notification-sound.mp3" type="audio/mpeg" />
      </audio>

      {/* Connection Status Indicator */}
      <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
        <i className={`fas ${isConnected ? 'fa-wifi' : 'fa-wifi-slash'}`}></i>
        <span>{isConnected ? 'Đã kết nối' : 'Mất kết nối'}</span>
      </div>

      {/* Notification Bell */}
      <div 
        className="notification-bell"
        onClick={() => setShowNotifications(!showNotifications)}
      >
        <i className="fas fa-bell"></i>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </div>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="notifications-dropdown">
          <div className="notifications-header">
            <h3>Thông báo mới</h3>
            <div className="notifications-actions">
              <button 
                className="clear-all-btn"
                onClick={handleClearAllNotifications}
                disabled={notifications.length === 0}
              >
                <i className="fas fa-trash"></i>
                Xóa tất cả
              </button>
            </div>
          </div>

          <div className="notifications-list">
            {notifications.length === 0 ? (
              <div className="no-notifications">
                <i className="fas fa-bell-slash"></i>
                <p>Không có thông báo mới</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${notification.priority}`}
                  onClick={() => handleNotificationClick(notification)}
                  style={{ borderLeftColor: getPriorityColor(notification.priority) }}
                >
                  <div className="notification-icon">
                    <i className={getNotificationIcon(notification.type)}></i>
                  </div>
                  <div className="notification-content">
                    <div className="notification-header">
                      <h4 className="notification-title">{notification.title}</h4>
                      <span className="notification-category">
                        {getCategoryLabel(notification.category)}
                      </span>
                    </div>
                    <p className="notification-message">{notification.message}</p>
                    <div className="notification-meta">
                      <span className="notification-time">
                        {NotificationService.getRelativeTime(notification.created_at)}
                      </span>
                      <span className="notification-priority">
                        {notification.priority.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="notifications-footer">
            <button 
              className="view-all-btn"
              onClick={() => {
                setShowNotifications(false);
                window.location.href = '/notifications';
              }}
            >
              <i className="fas fa-list"></i>
              Xem tất cả thông báo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealtimeNotifications;
