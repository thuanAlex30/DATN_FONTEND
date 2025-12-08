import { io, Socket } from 'socket.io-client';
import { ENV } from '../config/env';

class PPEWebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(token: string) {
    if (this.socket?.connected) {
      return;
    }

    const baseUrl = (window as any).REACT_APP_WS_URL || ENV.WS_BASE_URL;
    this.socket = io(baseUrl, {
      auth: {
        token
      },
      transports: ['websocket', 'polling']
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('PPE WebSocket connected');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', () => {
      console.log('PPE WebSocket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('PPE WebSocket connection error:', error);
      this.handleReconnect();
    });

    this.socket.on('ppe_issued', (data) => {
      this.handlePPEDistributed(data);
    });

    this.socket.on('ppe_returned', (data) => {
      this.handlePPEReturned(data);
    });

    this.socket.on('ppe_reported', (data) => {
      this.handlePPEReported(data);
    });

    this.socket.on('ppe_overdue', (data) => {
      this.handlePPEOverdue(data);
    });

    this.socket.on('ppe_low_stock', (data) => {
      this.handlePPELowStock(data);
    });

    // Advanced Features Events
    this.socket.on('ppe_quantity_update', (data) => {
      this.handlePPEQuantityUpdate(data);
    });

    this.socket.on('ppe_condition_update', (data) => {
      this.handlePPEConditionUpdate(data);
    });

    this.socket.on('ppe_expiry_warning', (data) => {
      this.handlePPEExpiryWarning(data);
    });

    this.socket.on('ppe_expired', (data) => {
      this.handlePPEExpired(data);
    });

    this.socket.on('ppe_replaced', (data) => {
      this.handlePPEReplaced(data);
    });

    this.socket.on('ppe_disposed', (data) => {
      this.handlePPEDisposed(data);
    });

    this.socket.on('batch_processing_started', (data) => {
      this.handleBatchProcessingStarted(data);
    });

    this.socket.on('batch_processing_progress', (data) => {
      this.handleBatchProcessingProgress(data);
    });

    this.socket.on('batch_processing_complete', (data) => {
      this.handleBatchProcessingComplete(data);
    });
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        this.socket?.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  private handlePPEDistributed(data: any) {
    // Emit custom event for PPE distributed
    const event = new CustomEvent('ppe-distributed', { detail: data });
    window.dispatchEvent(event);
  }

  private handlePPEReturned(data: any) {
    // Emit custom event for PPE returned
    const event = new CustomEvent('ppe-returned', { detail: data });
    window.dispatchEvent(event);
  }

  private handlePPEReported(data: any) {
    // Emit custom event for PPE reported
    const event = new CustomEvent('ppe-reported', { detail: data });
    window.dispatchEvent(event);
  }

  private handlePPEOverdue(data: any) {
    // Emit custom event for PPE overdue
    const event = new CustomEvent('ppe-overdue', { detail: data });
    window.dispatchEvent(event);
  }

  private handlePPELowStock(data: any) {
    // Emit custom event for PPE low stock
    const event = new CustomEvent('ppe-low-stock', { detail: data });
    window.dispatchEvent(event);
  }

  // Advanced Features Event Handlers
  private handlePPEQuantityUpdate(data: any) {
    const event = new CustomEvent('ppe-quantity-update', { detail: data });
    window.dispatchEvent(event);
  }

  private handlePPEConditionUpdate(data: any) {
    const event = new CustomEvent('ppe-condition-update', { detail: data });
    window.dispatchEvent(event);
  }

  private handlePPEExpiryWarning(data: any) {
    const event = new CustomEvent('ppe-expiry-warning', { detail: data });
    window.dispatchEvent(event);
  }

  private handlePPEExpired(data: any) {
    const event = new CustomEvent('ppe-expired', { detail: data });
    window.dispatchEvent(event);
  }

  private handlePPEReplaced(data: any) {
    const event = new CustomEvent('ppe-replaced', { detail: data });
    window.dispatchEvent(event);
  }

  private handlePPEDisposed(data: any) {
    const event = new CustomEvent('ppe-disposed', { detail: data });
    window.dispatchEvent(event);
  }

  private handleBatchProcessingStarted(data: any) {
    const event = new CustomEvent('batch-processing-started', { detail: data });
    window.dispatchEvent(event);
  }

  private handleBatchProcessingProgress(data: any) {
    const event = new CustomEvent('batch-processing-progress', { detail: data });
    window.dispatchEvent(event);
  }

  private handleBatchProcessingComplete(data: any) {
    const event = new CustomEvent('batch-processing-complete', { detail: data });
    window.dispatchEvent(event);
  }

  // Subscribe to PPE events
  subscribeToPPEDistributed(callback: (data: any) => void) {
    window.addEventListener('ppe-distributed', (event: any) => {
      callback(event.detail);
    });
  }

  subscribeToPPEReturned(callback: (data: any) => void) {
    window.addEventListener('ppe-returned', (event: any) => {
      callback(event.detail);
    });
  }

  subscribeToPPEReported(callback: (data: any) => void) {
    window.addEventListener('ppe-reported', (event: any) => {
      callback(event.detail);
    });
  }

  subscribeToPPEOverdue(callback: (data: any) => void) {
    window.addEventListener('ppe-overdue', (event: any) => {
      callback(event.detail);
    });
  }

  subscribeToPPELowStock(callback: (data: any) => void) {
    window.addEventListener('ppe-low-stock', (event: any) => {
      callback(event.detail);
    });
  }

  // Advanced Features Subscribe Methods
  subscribeToPPEQuantityUpdate(callback: (data: any) => void) {
    window.addEventListener('ppe-quantity-update', (event: any) => {
      callback(event.detail);
    });
  }

  subscribeToPPEConditionUpdate(callback: (data: any) => void) {
    window.addEventListener('ppe-condition-update', (event: any) => {
      callback(event.detail);
    });
  }

  subscribeToPPEExpiryWarning(callback: (data: any) => void) {
    window.addEventListener('ppe-expiry-warning', (event: any) => {
      callback(event.detail);
    });
  }

  subscribeToPPEExpired(callback: (data: any) => void) {
    window.addEventListener('ppe-expired', (event: any) => {
      callback(event.detail);
    });
  }

  subscribeToPPEReplaced(callback: (data: any) => void) {
    window.addEventListener('ppe-replaced', (event: any) => {
      callback(event.detail);
    });
  }

  subscribeToPPEDisposed(callback: (data: any) => void) {
    window.addEventListener('ppe-disposed', (event: any) => {
      callback(event.detail);
    });
  }

  subscribeToBatchProcessingStarted(callback: (data: any) => void) {
    window.addEventListener('batch-processing-started', (event: any) => {
      callback(event.detail);
    });
  }

  subscribeToBatchProcessingProgress(callback: (data: any) => void) {
    window.addEventListener('batch-processing-progress', (event: any) => {
      callback(event.detail);
    });
  }

  subscribeToBatchProcessingComplete(callback: (data: any) => void) {
    window.addEventListener('batch-processing-complete', (event: any) => {
      callback(event.detail);
    });
  }

  // Unsubscribe from events
  unsubscribeFromPPEDistributed(callback: (data: any) => void) {
    window.removeEventListener('ppe-distributed', callback);
  }

  unsubscribeFromPPEReturned(callback: (data: any) => void) {
    window.removeEventListener('ppe-returned', callback);
  }

  unsubscribeFromPPEReported(callback: (data: any) => void) {
    window.removeEventListener('ppe-reported', callback);
  }

  unsubscribeFromPPEOverdue(callback: (data: any) => void) {
    window.removeEventListener('ppe-overdue', callback);
  }

  unsubscribeFromPPELowStock(callback: (data: any) => void) {
    window.removeEventListener('ppe-low-stock', callback);
  }

  // Advanced Features Unsubscribe Methods
  unsubscribeFromPPEQuantityUpdate(callback: (data: any) => void) {
    window.removeEventListener('ppe-quantity-update', callback);
  }

  unsubscribeFromPPEConditionUpdate(callback: (data: any) => void) {
    window.removeEventListener('ppe-condition-update', callback);
  }

  unsubscribeFromPPEExpiryWarning(callback: (data: any) => void) {
    window.removeEventListener('ppe-expiry-warning', callback);
  }

  unsubscribeFromPPEExpired(callback: (data: any) => void) {
    window.removeEventListener('ppe-expired', callback);
  }

  unsubscribeFromPPEReplaced(callback: (data: any) => void) {
    window.removeEventListener('ppe-replaced', callback);
  }

  unsubscribeFromPPEDisposed(callback: (data: any) => void) {
    window.removeEventListener('ppe-disposed', callback);
  }

  unsubscribeFromBatchProcessingStarted(callback: (data: any) => void) {
    window.removeEventListener('batch-processing-started', callback);
  }

  unsubscribeFromBatchProcessingProgress(callback: (data: any) => void) {
    window.removeEventListener('batch-processing-progress', callback);
  }

  unsubscribeFromBatchProcessingComplete(callback: (data: any) => void) {
    window.removeEventListener('batch-processing-complete', callback);
  }

  // Join PPE rooms
  joinPPERoom(userId: string) {
    this.socket?.emit('join-ppe-room', { userId });
  }

  joinAdminPPERoom() {
    this.socket?.emit('join-admin-ppe-room');
  }

  joinManagerPPERoom(departmentId: string) {
    this.socket?.emit('join-manager-ppe-room', { departmentId });
  }

  // Leave rooms
  leavePPERoom(userId: string) {
    this.socket?.emit('leave-ppe-room', { userId });
  }

  leaveAdminPPERoom() {
    this.socket?.emit('leave-admin-ppe-room');
  }

  leaveManagerPPERoom(departmentId: string) {
    this.socket?.emit('leave-manager-ppe-room', { departmentId });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const ppeWebSocketService = new PPEWebSocketService();
