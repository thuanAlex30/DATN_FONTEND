import { io, Socket } from 'socket.io-client';

class PPEWebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(token: string) {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io((window as any).REACT_APP_WS_URL || 'http://localhost:3000', {
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
