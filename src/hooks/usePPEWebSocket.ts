import { useEffect, useCallback, useRef } from 'react';
import { message } from 'antd';
import { ppeWebSocketService } from '../services/ppeWebSocketService';

interface PPEWebSocketHookOptions {
  userId?: string;
  departmentId?: string;
  isAdmin?: boolean;
  isManager?: boolean;
  token?: string;
  onPPEDistributed?: (data: any) => void;
  onPPEReturned?: (data: any) => void;
  onPPEReported?: (data: any) => void;
  onPPEOverdue?: (data: any) => void;
  onPPELowStock?: (data: any) => void;
  // Advanced Features Events
  onPPEQuantityUpdate?: (data: any) => void;
  onPPEConditionUpdate?: (data: any) => void;
  onPPEExpiryWarning?: (data: any) => void;
  onPPEExpired?: (data: any) => void;
  onPPEReplaced?: (data: any) => void;
  onPPEDisposed?: (data: any) => void;
  onBatchProcessingStarted?: (data: any) => void;
  onBatchProcessingProgress?: (data: any) => void;
  onBatchProcessingComplete?: (data: any) => void;
  showNotifications?: boolean;
}

export const usePPEWebSocket = (options: PPEWebSocketHookOptions = {}) => {
  const {
    userId,
    departmentId,
    isAdmin = false,
    isManager = false,
    token,
    onPPEDistributed,
    onPPEReturned,
    onPPEReported,
    onPPEOverdue,
    onPPELowStock,
    // Advanced Features Events
    onPPEQuantityUpdate,
    onPPEConditionUpdate,
    onPPEExpiryWarning,
    onPPEExpired,
    onPPEReplaced,
    onPPEDisposed,
    onBatchProcessingStarted,
    onBatchProcessingProgress,
    onBatchProcessingComplete,
    showNotifications = true
  } = options;

  const callbacksRef = useRef({
    onPPEDistributed,
    onPPEReturned,
    onPPEReported,
    onPPEOverdue,
    onPPELowStock,
    // Advanced Features Events
    onPPEQuantityUpdate,
    onPPEConditionUpdate,
    onPPEExpiryWarning,
    onPPEExpired,
    onPPEReplaced,
    onPPEDisposed,
    onBatchProcessingStarted,
    onBatchProcessingProgress,
    onBatchProcessingComplete
  });

  // Update callbacks ref when they change
  useEffect(() => {
    callbacksRef.current = {
      onPPEDistributed,
      onPPEReturned,
      onPPEReported,
      onPPEOverdue,
      onPPELowStock,
      // Advanced Features Events
      onPPEQuantityUpdate,
      onPPEConditionUpdate,
      onPPEExpiryWarning,
      onPPEExpired,
      onPPEReplaced,
      onPPEDisposed,
      onBatchProcessingStarted,
      onBatchProcessingProgress,
      onBatchProcessingComplete
    };
  }, [
    onPPEDistributed, onPPEReturned, onPPEReported, onPPEOverdue, onPPELowStock,
    onPPEQuantityUpdate, onPPEConditionUpdate, onPPEExpiryWarning, onPPEExpired,
    onPPEReplaced, onPPEDisposed, onBatchProcessingStarted, onBatchProcessingProgress,
    onBatchProcessingComplete
  ]);

  // Default notification handlers
  const handlePPEDistributed = useCallback((data: any) => {
    if (showNotifications) {
      const itemName = data.issuance?.item_id?.item_name || data.item_name || 'Thiết bị';
      const userName = data.recipient?.name || data.user_name || 'Người dùng';
      
      message.success({
        content: `PPE đã được phát: ${itemName} cho ${userName}`,
        duration: 5,
        style: {
          marginTop: '20px',
        },
      });
    }
    callbacksRef.current.onPPEDistributed?.(data);
  }, [showNotifications]);

  const handlePPEReturned = useCallback((data: any) => {
    if (showNotifications) {
      const itemName = data.issuance?.item_id?.item_name || data.item_name || 'Thiết bị';
      const userName = data.returner?.name || data.user_name || 'Người dùng';
      
      message.info({
        content: `PPE đã được trả: ${itemName} bởi ${userName}`,
        duration: 5,
        style: {
          marginTop: '20px',
        },
      });
    }
    callbacksRef.current.onPPEReturned?.(data);
  }, [showNotifications]);

  const handlePPEReported = useCallback((data: any) => {
    if (showNotifications) {
      const itemName = data.issuance?.item_id?.item_name || data.item_name || 'Thiết bị';
      const reportType = data.report_type || 'Sự cố';
      
      message.warning({
        content: `Báo cáo sự cố PPE: ${itemName} - ${reportType}`,
        duration: 8,
        style: {
          marginTop: '20px',
        },
      });
    }
    callbacksRef.current.onPPEReported?.(data);
  }, [showNotifications]);

  const handlePPEOverdue = useCallback((data: any) => {
    if (showNotifications) {
      const itemName = data.issuance?.item_id?.item_name || data.item_name || 'Thiết bị';
      const userName = data.issuance?.user_id?.full_name || data.user_name || 'Người dùng';
      
      message.error({
        content: `PPE quá hạn: ${itemName} của ${userName}`,
        duration: 10,
        style: {
          marginTop: '20px',
        },
      });
    }
    callbacksRef.current.onPPEOverdue?.(data);
  }, [showNotifications]);

  const handlePPELowStock = useCallback((data: any) => {
    if (showNotifications) {
      const itemName = data.item_id?.item_name || data.item_name || 'Thiết bị';
      const remainingQuantity = data.quantity_available || data.remaining_quantity || 0;
      
      message.warning({
        content: `PPE sắp hết: ${itemName} - Còn lại ${remainingQuantity}`,
        duration: 8,
        style: {
          marginTop: '20px',
        },
      });
    }
    callbacksRef.current.onPPELowStock?.(data);
  }, [showNotifications]);

  // Advanced Features Event Handlers
  const handlePPEQuantityUpdate = useCallback((data: any) => {
    if (showNotifications) {
      const itemName = data.item?.item_name || data.item_name || 'Thiết bị';
      const newQuantity = data.new_quantity || data.quantity_available || 0;
      
      message.info({
        content: `Cập nhật số lượng: ${itemName} - ${newQuantity} items`,
        duration: 5,
        style: {
          marginTop: '20px',
        },
      });
    }
    callbacksRef.current.onPPEQuantityUpdate?.(data);
  }, [showNotifications]);

  const handlePPEConditionUpdate = useCallback((data: any) => {
    if (showNotifications) {
      const itemName = data.item?.item_name || data.item_name || 'Thiết bị';
      const condition = data.condition || data.condition_status || 'unknown';
      
      message.info({
        content: `Cập nhật tình trạng: ${itemName} - ${condition}`,
        duration: 5,
        style: {
          marginTop: '20px',
        },
      });
    }
    callbacksRef.current.onPPEConditionUpdate?.(data);
  }, [showNotifications]);

  const handlePPEExpiryWarning = useCallback((data: any) => {
    if (showNotifications) {
      const itemName = data.item?.item_name || data.item_name || 'Thiết bị';
      const daysLeft = data.days_until_expiry || data.daysLeft || 0;
      
      message.warning({
        content: `⚠️ PPE sắp hết hạn: ${itemName} (còn ${daysLeft} ngày)`,
        duration: 10,
        style: {
          marginTop: '20px',
        },
      });
    }
    callbacksRef.current.onPPEExpiryWarning?.(data);
  }, [showNotifications]);

  const handlePPEExpired = useCallback((data: any) => {
    if (showNotifications) {
      const itemName = data.item?.item_name || data.item_name || 'Thiết bị';
      
      message.error({
        content: `🚨 PPE đã hết hạn: ${itemName}`,
        duration: 10,
        style: {
          marginTop: '20px',
        },
      });
    }
    callbacksRef.current.onPPEExpired?.(data);
  }, [showNotifications]);

  const handlePPEReplaced = useCallback((data: any) => {
    if (showNotifications) {
      const itemName = data.item?.item_name || data.item_name || 'Thiết bị';
      
      message.success({
        content: `✅ PPE đã được thay thế: ${itemName}`,
        duration: 5,
        style: {
          marginTop: '20px',
        },
      });
    }
    callbacksRef.current.onPPEReplaced?.(data);
  }, [showNotifications]);

  const handlePPEDisposed = useCallback((data: any) => {
    if (showNotifications) {
      const itemName = data.item?.item_name || data.item_name || 'Thiết bị';
      
      message.info({
        content: `🗑️ PPE đã được xử lý: ${itemName}`,
        duration: 5,
        style: {
          marginTop: '20px',
        },
      });
    }
    callbacksRef.current.onPPEDisposed?.(data);
  }, [showNotifications]);

  const handleBatchProcessingStarted = useCallback((data: any) => {
    if (showNotifications) {
      const batchName = data.batch_name || data.batchName || 'Batch';
      
      message.info({
        content: `🔄 Bắt đầu xử lý batch: ${batchName}`,
        duration: 5,
        style: {
          marginTop: '20px',
        },
      });
    }
    callbacksRef.current.onBatchProcessingStarted?.(data);
  }, [showNotifications]);

  const handleBatchProcessingProgress = useCallback((data: any) => {
    if (showNotifications) {
      const batchName = data.batch_name || data.batchName || 'Batch';
      const progress = data.progress || data.percentage || 0;
      
      message.info({
        content: `📊 Tiến trình batch: ${batchName} - ${progress}%`,
        duration: 3,
        style: {
          marginTop: '20px',
        },
      });
    }
    callbacksRef.current.onBatchProcessingProgress?.(data);
  }, [showNotifications]);

  const handleBatchProcessingComplete = useCallback((data: any) => {
    if (showNotifications) {
      const batchName = data.batch_name || data.batchName || 'Batch';
      const status = data.status || 'completed';
      
      message.success({
        content: `✅ Hoàn thành batch: ${batchName} - ${status}`,
        duration: 5,
        style: {
          marginTop: '20px',
        },
      });
    }
    callbacksRef.current.onBatchProcessingComplete?.(data);
  }, [showNotifications]);

  // Connect and setup WebSocket
  useEffect(() => {
    if (!token) return;

    // Connect to WebSocket
    ppeWebSocketService.connect(token);

    // Subscribe to events
    ppeWebSocketService.subscribeToPPEDistributed(handlePPEDistributed);
    ppeWebSocketService.subscribeToPPEReturned(handlePPEReturned);
    ppeWebSocketService.subscribeToPPEReported(handlePPEReported);
    ppeWebSocketService.subscribeToPPEOverdue(handlePPEOverdue);
    ppeWebSocketService.subscribeToPPELowStock(handlePPELowStock);
    
    // Subscribe to Advanced Features events
    ppeWebSocketService.subscribeToPPEQuantityUpdate(handlePPEQuantityUpdate);
    ppeWebSocketService.subscribeToPPEConditionUpdate(handlePPEConditionUpdate);
    ppeWebSocketService.subscribeToPPEExpiryWarning(handlePPEExpiryWarning);
    ppeWebSocketService.subscribeToPPEExpired(handlePPEExpired);
    ppeWebSocketService.subscribeToPPEReplaced(handlePPEReplaced);
    ppeWebSocketService.subscribeToPPEDisposed(handlePPEDisposed);
    ppeWebSocketService.subscribeToBatchProcessingStarted(handleBatchProcessingStarted);
    ppeWebSocketService.subscribeToBatchProcessingProgress(handleBatchProcessingProgress);
    ppeWebSocketService.subscribeToBatchProcessingComplete(handleBatchProcessingComplete);

    // Join appropriate rooms
    if (isAdmin) {
      ppeWebSocketService.joinAdminPPERoom();
    } else if (isManager && departmentId) {
      ppeWebSocketService.joinManagerPPERoom(departmentId);
    } else if (userId) {
      ppeWebSocketService.joinPPERoom(userId);
    }

    // Cleanup function
    return () => {
      ppeWebSocketService.unsubscribeFromPPEDistributed(handlePPEDistributed);
      ppeWebSocketService.unsubscribeFromPPEReturned(handlePPEReturned);
      ppeWebSocketService.unsubscribeFromPPEReported(handlePPEReported);
      ppeWebSocketService.unsubscribeFromPPEOverdue(handlePPEOverdue);
      ppeWebSocketService.unsubscribeFromPPELowStock(handlePPELowStock);
      
      // Unsubscribe from Advanced Features events
      ppeWebSocketService.unsubscribeFromPPEQuantityUpdate(handlePPEQuantityUpdate);
      ppeWebSocketService.unsubscribeFromPPEConditionUpdate(handlePPEConditionUpdate);
      ppeWebSocketService.unsubscribeFromPPEExpiryWarning(handlePPEExpiryWarning);
      ppeWebSocketService.unsubscribeFromPPEExpired(handlePPEExpired);
      ppeWebSocketService.unsubscribeFromPPEReplaced(handlePPEReplaced);
      ppeWebSocketService.unsubscribeFromPPEDisposed(handlePPEDisposed);
      ppeWebSocketService.unsubscribeFromBatchProcessingStarted(handleBatchProcessingStarted);
      ppeWebSocketService.unsubscribeFromBatchProcessingProgress(handleBatchProcessingProgress);
      ppeWebSocketService.unsubscribeFromBatchProcessingComplete(handleBatchProcessingComplete);

      // Leave rooms
      if (isAdmin) {
        ppeWebSocketService.leaveAdminPPERoom();
      } else if (isManager && departmentId) {
        ppeWebSocketService.leaveManagerPPERoom(departmentId);
      } else if (userId) {
        ppeWebSocketService.leavePPERoom(userId);
      }
    };
  }, [
    token, userId, departmentId, isAdmin, isManager, 
    handlePPEDistributed, handlePPEReturned, handlePPEReported, handlePPEOverdue, handlePPELowStock,
    handlePPEQuantityUpdate, handlePPEConditionUpdate, handlePPEExpiryWarning, handlePPEExpired,
    handlePPEReplaced, handlePPEDisposed, handleBatchProcessingStarted, handleBatchProcessingProgress,
    handleBatchProcessingComplete
  ]);

  // Return connection status and utility functions
  return {
    isConnected: ppeWebSocketService.isConnected(),
    disconnect: ppeWebSocketService.disconnect.bind(ppeWebSocketService)
  };
};
