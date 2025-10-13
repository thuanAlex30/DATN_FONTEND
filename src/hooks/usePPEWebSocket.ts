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
    showNotifications = true
  } = options;

  const callbacksRef = useRef({
    onPPEDistributed,
    onPPEReturned,
    onPPEReported,
    onPPEOverdue,
    onPPELowStock
  });

  // Update callbacks ref when they change
  useEffect(() => {
    callbacksRef.current = {
      onPPEDistributed,
      onPPEReturned,
      onPPEReported,
      onPPEOverdue,
      onPPELowStock
    };
  }, [onPPEDistributed, onPPEReturned, onPPEReported, onPPEOverdue, onPPELowStock]);

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

      // Leave rooms
      if (isAdmin) {
        ppeWebSocketService.leaveAdminPPERoom();
      } else if (isManager && departmentId) {
        ppeWebSocketService.leaveManagerPPERoom(departmentId);
      } else if (userId) {
        ppeWebSocketService.leavePPERoom(userId);
      }
    };
  }, [token, userId, departmentId, isAdmin, isManager, handlePPEDistributed, handlePPEReturned, handlePPEReported, handlePPEOverdue, handlePPELowStock]);

  // Return connection status and utility functions
  return {
    isConnected: ppeWebSocketService.isConnected(),
    disconnect: ppeWebSocketService.disconnect.bind(ppeWebSocketService)
  };
};
