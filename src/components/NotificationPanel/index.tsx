import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store';
import { markNotificationAsRead, removeNotification, markAllNotificationsAsRead } from '../../store/slices/websocketSlice';
import styles from './NotificationPanel.module.css';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { notifications, unreadCount } = useSelector((state: RootState) => state.websocket);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') {
      return !notification.isRead;
    }
    return true;
  });

  const handleMarkAsRead = (notificationId: string) => {
    dispatch(markNotificationAsRead(notificationId));
  };

  const handleRemoveNotification = (notificationId: string) => {
    dispatch(removeNotification(notificationId));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllNotificationsAsRead());
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return 'fas fa-check-circle';
      case 'warning':
        return 'fas fa-exclamation-triangle';
      case 'error':
        return 'fas fa-times-circle';
      case 'info':
      default:
        return 'fas fa-info-circle';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return '#28a745';
      case 'warning':
        return '#ffc107';
      case 'error':
        return '#dc3545';
      case 'info':
      default:
        return '#17a2b8';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'Vừa xong';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} phút trước`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} giờ trước`;
    } else {
      return date.toLocaleDateString('vi-VN');
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.title}>
            <i className="fas fa-bell"></i>
            Thông báo
            {unreadCount > 0 && (
              <span className={styles.badge}>{unreadCount}</span>
            )}
          </h3>
          <button className={styles.closeBtn} onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className={styles.filters}>
          <button 
            className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
            onClick={() => setFilter('all')}
          >
            Tất cả ({notifications.length})
          </button>
          <button 
            className={`${styles.filterBtn} ${filter === 'unread' ? styles.active : ''}`}
            onClick={() => setFilter('unread')}
          >
            Chưa đọc ({unreadCount})
          </button>
          {unreadCount > 0 && (
            <button className={styles.markAllBtn} onClick={handleMarkAllAsRead}>
              Đánh dấu tất cả đã đọc
            </button>
          )}
        </div>

        <div className={styles.content}>
          {filteredNotifications.length === 0 ? (
            <div className={styles.empty}>
              <i className="fas fa-bell-slash"></i>
              <p>Không có thông báo nào</p>
            </div>
          ) : (
            <div className={styles.notifications}>
              {filteredNotifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`${styles.notification} ${!notification.isRead ? styles.unread : ''}`}
                >
                  <div className={styles.notificationIcon}>
                    <i 
                      className={getNotificationIcon(notification.type)}
                      style={{ color: getNotificationColor(notification.type) }}
                    ></i>
                  </div>
                  
                  <div className={styles.notificationContent}>
                    <div className={styles.notificationHeader}>
                      <h4 className={styles.notificationTitle}>{notification.title}</h4>
                      <span className={styles.notificationTime}>
                        {formatTime(notification.created_at)}
                      </span>
                    </div>
                    
                    <p className={styles.notificationMessage}>{notification.message}</p>
                    
                    <div className={styles.notificationMeta}>
                      <span className={styles.notificationCategory}>
                        {notification.category}
                      </span>
                      {notification.priority === 'urgent' && (
                        <span className={styles.urgentBadge}>Khẩn cấp</span>
                      )}
                    </div>
                  </div>

                  <div className={styles.notificationActions}>
                    {!notification.isRead && (
                      <button 
                        className={styles.markReadBtn}
                        onClick={() => handleMarkAsRead(notification.id)}
                        title="Đánh dấu đã đọc"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                    )}
                    <button 
                      className={styles.removeBtn}
                      onClick={() => handleRemoveNotification(notification.id)}
                      title="Xóa thông báo"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationPanel;






