import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { 
  setConnectionStatus, 
  setConnectionError, 
  addNotification,
  updateLastActivity 
} from '../../store/slices/websocketSlice';
import websocketClient from '../../services/websocketClient';
import { ENV } from '../../config/env';
import { toast } from 'react-toastify';

interface WebSocketProviderProps {
  children: React.ReactNode;
}

const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const dispatch = useDispatch();
  const { token, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { isConnected } = useSelector((state: RootState) => state.websocket);
  const initialized = useRef(false);
  const currentToken = useRef<string | null>(null);

  useEffect(() => {
    if (!ENV.ENABLE_WEBSOCKET) {
      console.log('🔌 WebSocket disabled in environment');
      return;
    }

    if (!isAuthenticated || !token) {
      console.log('🔌 Not authenticated, skipping WebSocket connection');
      // Disconnect if not authenticated
      if (initialized.current) {
        websocketClient.disconnect();
        initialized.current = false;
        currentToken.current = null;
      }
      return;
    }

    // Check if token changed or not initialized
    if (initialized.current && currentToken.current === token) {
      console.log('🔌 WebSocket already initialized with same token');
      return;
    }

    console.log('🔌 Initializing WebSocket connection...');
    initialized.current = true;
    currentToken.current = token;

    // Connect to WebSocket
    websocketClient.connect(ENV.WS_BASE_URL, token);

    // Connection status events
    websocketClient.on('connection_status', (data: { connected: boolean; reason?: string }) => {
      console.log('🔌 Connection status changed:', data);
      dispatch(setConnectionStatus(data.connected));
      
      if (data.connected) {
        toast.success('🔌 Connected to real-time updates');
      } else {
        toast.warning(`🔌 Disconnected: ${data.reason || 'Unknown reason'}`);
      }
    });

    websocketClient.on('connection_error', (error: any) => {
      console.error('🔌 Connection error:', error);
      dispatch(setConnectionError(error.message || 'Connection failed'));
      toast.error('🔌 Connection error: ' + (error.message || 'Unknown error'));
    });

    websocketClient.on('auth_error', (error: any) => {
      console.error('🔐 Authentication error:', error);
      dispatch(setConnectionError('Authentication failed'));
      toast.error('🔐 Authentication failed');
    });

    // Incident events
    websocketClient.on('incident_reported', (data: any) => {
      console.log('🚨 Incident reported:', data);
      dispatch(updateLastActivity());
      
      dispatch(addNotification({
        id: `incident_reported_${Date.now()}`,
        title: 'Sự cố mới được báo cáo',
        message: `Sự cố "${data.incident?.title || 'Không có tiêu đề'}" đã được báo cáo bởi ${data.reporter?.name || 'Người dùng'}`,
        type: 'warning',
        category: 'safety',
        priority: 'high',
        created_at: new Date().toISOString(),
        action_url: `/admin/incident-management/${data.incident?._id}`
      }));

      toast.warning('🚨 Sự cố mới được báo cáo');
    });

    websocketClient.on('incident_classified', (data: any) => {
      console.log('📋 Incident classified:', data);
      dispatch(updateLastActivity());
      
      dispatch(addNotification({
        id: `incident_classified_${Date.now()}`,
        title: 'Sự cố đã được phân loại',
        message: `Sự cố "${data.incident?.title || 'Không có tiêu đề'}" đã được phân loại bởi ${data.classifier?.name || 'Người dùng'}`,
        type: 'info',
        category: 'safety',
        priority: 'medium',
        created_at: new Date().toISOString(),
        action_url: `/admin/incident-management/${data.incident?._id}`
      }));
    });

    websocketClient.on('incident_assigned', (data: any) => {
      console.log('👤 Incident assigned:', data);
      dispatch(updateLastActivity());
      
      dispatch(addNotification({
        id: `incident_assigned_${Date.now()}`,
        title: 'Sự cố được phân công',
        message: `Sự cố "${data.incident?.title || 'Không có tiêu đề'}" đã được phân công cho ${data.assignee?.name || 'Người dùng'}`,
        type: 'info',
        category: 'safety',
        priority: 'medium',
        created_at: new Date().toISOString(),
        action_url: `/admin/incident-management/${data.incident?._id}`
      }));
    });

    websocketClient.on('incident_closed', (data: any) => {
      console.log('✅ Incident closed:', data);
      dispatch(updateLastActivity());
      
      dispatch(addNotification({
        id: `incident_closed_${Date.now()}`,
        title: 'Sự cố đã được đóng',
        message: `Sự cố "${data.incident?.title || 'Không có tiêu đề'}" đã được đóng bởi ${data.closer?.name || 'Người dùng'}`,
        type: 'success',
        category: 'safety',
        priority: 'medium',
        created_at: new Date().toISOString(),
        action_url: `/admin/incident-management/${data.incident?._id}`
      }));

      toast.success('✅ Sự cố đã được đóng');
    });

    // PPE events
    websocketClient.on('ppe_issued', (data: any) => {
      console.log('🦺 PPE issued:', data);
      dispatch(updateLastActivity());
      
      const itemName = data.issuance?.item_id?.item_name || data.issuance?.item_name || 'Thiết bị';
      const recipientName = data.recipient?.name || 'Người dùng';
      
      dispatch(addNotification({
        id: `ppe_issued_${Date.now()}`,
        title: 'PPE được cấp phát',
        message: `PPE "${itemName}" đã được cấp phát cho ${recipientName}`,
        type: 'info',
        category: 'ppe',
        priority: 'medium',
        created_at: new Date().toISOString(),
        action_url: `/admin/ppe-management`
      }));
    });

    websocketClient.on('ppe_returned', (data: any) => {
      console.log('🔄 PPE returned:', data);
      dispatch(updateLastActivity());
      
      const itemName = data.issuance?.item_id?.item_name || data.issuance?.item_name || 'Thiết bị';
      const returnerName = data.returner?.name || 'Người dùng';
      
      dispatch(addNotification({
        id: `ppe_returned_${Date.now()}`,
        title: 'PPE được trả về',
        message: `PPE "${itemName}" đã được trả về bởi ${returnerName}`,
        type: 'info',
        category: 'ppe',
        priority: 'medium',
        created_at: new Date().toISOString(),
        action_url: `/admin/ppe-management`
      }));
    });

    websocketClient.on('ppe_expiring', (data: any) => {
      console.log('⚠️ PPE expiring:', data);
      dispatch(updateLastActivity());
      
      dispatch(addNotification({
        id: `ppe_expiring_${Date.now()}`,
        title: 'PPE sắp hết hạn',
        message: `PPE "${data.issuance?.item_name || 'Thiết bị'}" sắp hết hạn sử dụng`,
        type: 'warning',
        category: 'ppe',
        priority: 'high',
        created_at: new Date().toISOString(),
        action_url: `/admin/ppe-management`
      }));

      toast.warning('⚠️ PPE sắp hết hạn');
    });

    websocketClient.on('ppe_low_stock', (data: any) => {
      console.log('📉 PPE low stock:', data);
      dispatch(updateLastActivity());
      
      dispatch(addNotification({
        id: `ppe_low_stock_${Date.now()}`,
        title: 'PPE sắp hết hàng',
        message: `PPE "${data.items?.[0]?.name || 'Thiết bị'}" sắp hết hàng trong kho`,
        type: 'warning',
        category: 'ppe',
        priority: 'high',
        created_at: new Date().toISOString(),
        action_url: `/admin/ppe-management`
      }));

      toast.warning('📉 PPE sắp hết hàng');
    });

    // Training events
    websocketClient.on('training_session_created', (data: any) => {
      console.log('🎓 Training session created:', data);
      dispatch(updateLastActivity());
      
      dispatch(addNotification({
        id: `training_session_created_${Date.now()}`,
        title: 'Khóa đào tạo mới',
        message: `Khóa đào tạo "${data.session?.title || 'Không có tiêu đề'}" đã được tạo bởi ${data.creator?.name || 'Người dùng'}`,
        type: 'info',
        category: 'training',
        priority: 'medium',
        created_at: new Date().toISOString(),
        action_url: `/admin/training-management`
      }));
    });

    websocketClient.on('training_completed', (data: any) => {
      console.log('🎉 Training completed:', data);
      dispatch(updateLastActivity());
      
      dispatch(addNotification({
        id: `training_completed_${Date.now()}`,
        title: 'Hoàn thành đào tạo',
        message: `${data.user?.name || 'Người dùng'} đã hoàn thành khóa đào tạo`,
        type: 'success',
        category: 'training',
        priority: 'medium',
        created_at: new Date().toISOString(),
        action_url: `/admin/training-management`
      }));

      toast.success('🎉 Hoàn thành đào tạo');
    });

    // Project events
    websocketClient.on('project_created', (data: any) => {
      console.log('📋 Project created:', data);
      dispatch(updateLastActivity());
      
      dispatch(addNotification({
        id: `project_created_${Date.now()}`,
        title: 'Dự án mới',
        message: `Dự án "${data.project?.name || 'Không có tên'}" đã được tạo bởi ${data.creator?.name || 'Người dùng'}`,
        type: 'info',
        category: 'project',
        priority: 'medium',
        created_at: new Date().toISOString(),
        action_url: `/admin/project-management`
      }));
    });

    websocketClient.on('project_progress_updated', (data: any) => {
      console.log('📊 Project progress updated:', data);
      dispatch(updateLastActivity());
      
      dispatch(addNotification({
        id: `project_progress_updated_${Date.now()}`,
        title: 'Cập nhật tiến độ dự án',
        message: `Dự án "${data.project?.name || 'Không có tên'}" đã được cập nhật tiến độ bởi ${data.updater?.name || 'Người dùng'}`,
        type: 'info',
        category: 'project',
        priority: 'low',
        created_at: new Date().toISOString(),
        action_url: `/admin/project-management`
      }));
    });

    // Notification events
    websocketClient.on('notification_created', (data: any) => {
      console.log('🔔 Notification created:', data);
      dispatch(updateLastActivity());
      
      if (data.notification) {
        dispatch(addNotification({
          id: data.notification._id || `notification_${Date.now()}`,
          title: data.notification.title || 'Thông báo mới',
          message: data.notification.message || 'Bạn có thông báo mới',
          type: data.notification.type || 'info',
          category: data.notification.category || 'general',
          priority: data.notification.priority || 'medium',
          created_at: data.notification.created_at || new Date().toISOString(),
          action_url: data.notification.action_url,
          isRead: data.notification.isRead || false
        }));
      }
    });

    // Cleanup function
    return () => {
      console.log('🔌 Cleaning up WebSocket connection...');
      websocketClient.disconnect();
      initialized.current = false;
      currentToken.current = null;
    };
  }, [isAuthenticated, token, dispatch]);


  return <>{children}</>;
};

export default WebSocketProvider;
