import { io, Socket } from 'socket.io-client';
import { ENV } from '../config/env';

interface EventData {
  [key: string]: any;
}

class WebSocketClient {
  private socket: Socket | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;
  private eventListeners: Map<string, Function[]> = new Map();

  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.eventListeners = new Map();
  }

  /**
   * Connect to WebSocket server
   * @param serverUrl - WebSocket server URL
   * @param authToken - JWT authentication token
   */
  connect(serverUrl: string = ENV.WS_BASE_URL, authToken: string): void {
    // Disconnect existing connection first
    if (this.socket) {
      console.log('🔌 Disconnecting existing WebSocket connection...');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }

    console.log(`🔌 Connecting to WebSocket server: ${serverUrl}`);
    
    this.socket = io(serverUrl, {
      auth: {
        token: authToken
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      upgrade: true,
      rememberUpgrade: true,
      withCredentials: true
    });

    this.setupEventListeners();
  }

  /**
   * Setup WebSocket event listeners
   */
  setupEventListeners(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('🔌 WebSocket connected:', this.socket?.id);
      console.log('🔌 Socket transport:', this.socket?.io.engine.transport.name);
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('connection_status', { connected: true });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 WebSocket disconnected:', reason);
      this.isConnected = false;
      this.emit('connection_status', { connected: false, reason });
      
      // Attempt to reconnect
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        setTimeout(() => {
          console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
          this.socket?.connect();
        }, this.reconnectDelay * this.reconnectAttempts);
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔌 WebSocket connection error:', error);
      console.error('🔌 Error details:', {
        message: error.message,
        description: (error as any).description,
        context: (error as any).context,
        type: (error as any).type
      });
      this.isConnected = false;
      this.emit('connection_error', error);
    });

    // Authentication events
    this.socket.on('auth_error', (error) => {
      console.error('🔐 WebSocket authentication error:', error);
      this.emit('auth_error', error);
    });

    // Incident events
    this.socket.on('incident_reported', (data) => {
      console.log('🚨 Incident reported:', data);
      this.emit('incident_reported', data);
    });

    this.socket.on('incident_classified', (data) => {
      console.log('📋 Incident classified:', data);
      this.emit('incident_classified', data);
    });

    this.socket.on('incident_assigned', (data) => {
      console.log('👤 Incident assigned:', data);
      this.emit('incident_assigned', data);
    });

    this.socket.on('incident_progress_updated', (data) => {
      console.log('📈 Incident progress updated:', data);
      this.emit('incident_progress_updated', data);
    });

    this.socket.on('incident_closed', (data) => {
      console.log('✅ Incident closed:', data);
      this.emit('incident_closed', data);
    });

    this.socket.on('incident_reported_confirmation', (data) => {
      console.log('✅ Incident report confirmed:', data);
      this.emit('incident_reported_confirmation', data);
    });

    // PPE events
    this.socket.on('ppe_reported', (data) => {
      console.log('🦺 PPE reported:', data);
      this.emit('ppe_reported', data);
    });

    this.socket.on('ppe_reported_confirmation', (data) => {
      console.log('✅ PPE report confirmed:', data);
      this.emit('ppe_reported_confirmation', data);
    });

    // Training events
    this.socket.on('training_session_created', (data) => {
      console.log('🎓 Training session created:', data);
      this.emit('training_session_created', data);
    });

    this.socket.on('training_enrolled', (data) => {
      console.log('📝 Training enrolled:', data);
      this.emit('training_enrolled', data);
    });

    this.socket.on('training_started', (data) => {
      console.log('▶️ Training started:', data);
      this.emit('training_started', data);
    });

    this.socket.on('training_submitted', (data) => {
      console.log('📤 Training submitted:', data);
      this.emit('training_submitted', data);
    });

    this.socket.on('training_completed', (data) => {
      console.log('🎉 Training completed:', data);
      this.emit('training_completed', data);
    });

    this.socket.on('training_graded', (data) => {
      console.log('✅ Training graded:', data);
      this.emit('training_graded', data);
    });

    // PPE events

    this.socket.on('ppe_returned', (data) => {
      console.log('🔄 PPE returned:', data);
      this.emit('ppe_returned', data);
    });

    this.socket.on('ppe_expiring', (data) => {
      console.log('⚠️ PPE expiring:', data);
      this.emit('ppe_expiring', data);
    });

    this.socket.on('ppe_expiring_bulk', (data) => {
      console.log('⚠️ PPE expiring bulk:', data);
      this.emit('ppe_expiring_bulk', data);
    });

    this.socket.on('ppe_low_stock', (data) => {
      console.log('📉 PPE low stock:', data);
      this.emit('ppe_low_stock', data);
    });

    this.socket.on('ppe_item_created', (data) => {
      console.log('🆕 PPE item created:', data);
      this.emit('ppe_item_created', data);
    });

    this.socket.on('ppe_item_updated', (data) => {
      console.log('📝 PPE item updated:', data);
      this.emit('ppe_item_updated', data);
    });

    // Notification events
    this.socket.on('notification_created', (data) => {
      console.log('🔔 WebSocket received notification_created:', data);
      this.emit('notification_created', data);
    });

    this.socket.on('notification_read', (data) => {
      console.log('👁️ Notification read:', data);
      this.emit('notification_read', data);
    });

    // Project events
    this.socket.on('project_created', (data) => {
      console.log('📋 Project created:', data);
      this.emit('project_created', data);
    });

    this.socket.on('project_progress_updated', (data) => {
      console.log('📊 Project progress updated:', data);
      this.emit('project_progress_updated', data);
    });

    this.socket.on('project_assigned', (data) => {
      console.log('👥 Project assigned:', data);
      this.emit('project_assigned', data);
    });

    this.socket.on('project_updated', (data) => {
      console.log('📝 Project updated:', data);
      this.emit('project_updated', data);
    });

    // Typing indicators
    this.socket.on('user_typing', (data) => {
      this.emit('user_typing', data);
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      console.log('🔌 Disconnecting WebSocket...');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.eventListeners.clear();
    }
  }

  /**
   * Join a specific room
   * @param roomName - Room name to join
   */
  joinRoom(roomName: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_room', roomName);
    }
  }

  /**
   * Leave a specific room
   * @param roomName - Room name to leave
   */
  leaveRoom(roomName: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave_room', roomName);
    }
  }

  /**
   * Send typing start indicator
   * @param room - Room name
   */
  startTyping(room: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing_start', { room });
    }
  }

  /**
   * Send typing stop indicator
   * @param room - Room name
   */
  stopTyping(room: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing_stop', { room });
    }
  }

  /**
   * Add event listener
   * @param event - Event name
   * @param callback - Callback function
   */
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)?.push(callback);
  }

  /**
   * Remove event listener
   * @param event - Event name
   * @param callback - Callback function
   */
  off(event: string, callback: Function): void {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    }
  }

  /**
   * Remove all listeners for a specific event
   * @param event - Event name
   */
  removeAllListeners(event: string): void {
    if (this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
  }

  /**
   * Emit event to local listeners
   * @param event - Event name
   * @param data - Event data
   */
  emit(event: string, data: EventData): void {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event)?.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Get connection status
   * @returns Connection status
   */
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  /**
   * Get socket ID
   * @returns Socket ID
   */
  getSocketId(): string | null {
    return this.socket?.id || null;
  }

  /**
   * Update authentication token
   * @param newToken - New JWT token
   */
  updateAuthToken(newToken: string): void {
    if (this.socket && this.isConnected) {
      if (this.socket.auth && typeof this.socket.auth === 'object') {
        (this.socket.auth as any).token = newToken;
      }
    }
  }

  /**
   * Reconnect with new token
   * @param newToken - New JWT token
   */
  reconnectWithNewToken(newToken: string): void {
    this.disconnect();
    setTimeout(() => {
      this.connect(undefined, newToken);
    }, 1000);
  }

  /**
   * Check if WebSocket is connected
   * @returns Connection status
   */
  checkConnection(): boolean {
    return this.isConnected;
  }
}

// Create singleton instance
const websocketClient = new WebSocketClient();

export default websocketClient;
