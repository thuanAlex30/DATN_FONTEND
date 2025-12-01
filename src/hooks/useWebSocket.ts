import { useEffect, useRef, useState } from 'react';
import websocketClient from '../services/websocketClient';
import { ENV } from '../config/env';

/**
 * Custom hook for WebSocket functionality
 * @param {string} authToken - JWT authentication token
 * @param {string} serverUrl - WebSocket server URL
 * @returns {Object} WebSocket hook data and methods
 */
export const useWebSocket = (authToken: string | null, serverUrl = ENV.WS_BASE_URL) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [socketId, setSocketId] = useState<string | null>(null);
  const eventListenersRef = useRef(new Map());

  useEffect(() => {
    if (!authToken) {
      console.log('No auth token provided, skipping WebSocket connection');
      return;
    }

    // Connect to WebSocket
    websocketClient.connect(serverUrl, authToken);

    // Setup connection status listeners
    const handleConnectionStatus = (data: any) => {
      setIsConnected(data.connected);
      if (data.connected) {
        setConnectionError(null);
        setSocketId(websocketClient.getSocketId() || null);
      } else {
        setSocketId(null);
      }
    };

    const handleConnectionError = (error: any) => {
      setConnectionError(error);
      setIsConnected(false);
    };

    const handleAuthError = (error: any) => {
      setConnectionError(error);
      setIsConnected(false);
    };

    // Add event listeners
    websocketClient.on('connection_status', handleConnectionStatus);
    websocketClient.on('connection_error', handleConnectionError);
    websocketClient.on('auth_error', handleAuthError);

    // Store listeners for cleanup
    eventListenersRef.current.set('connection_status', handleConnectionStatus);
    eventListenersRef.current.set('connection_error', handleConnectionError);
    eventListenersRef.current.set('auth_error', handleAuthError);

    // Cleanup on unmount
    return () => {
      eventListenersRef.current.forEach((listener, event) => {
        websocketClient.off(event, listener);
      });
      eventListenersRef.current.clear();
    };
  }, [authToken, serverUrl]);

  // Update auth token when it changes
  useEffect(() => {
    if (authToken) {
      websocketClient.updateAuthToken(authToken);
    }
  }, [authToken]);

  return {
    isConnected,
    connectionError,
    socketId,
    websocketClient
  };
};

/**
 * Hook for incident-related WebSocket events
 * @param {Function} onIncidentReported - Callback for incident reported
 * @param {Function} onIncidentClassified - Callback for incident classified
 * @param {Function} onIncidentAssigned - Callback for incident assigned
 * @param {Function} onIncidentProgressUpdated - Callback for incident progress updated
 * @param {Function} onIncidentClosed - Callback for incident closed
 * @param {Function} onIncidentReportedConfirmation - Callback for incident reported confirmation
 */
export const useIncidentEvents = ({
  onIncidentReported,
  onIncidentClassified,
  onIncidentAssigned,
  onIncidentProgressUpdated,
  onIncidentClosed,
  onIncidentReportedConfirmation
}: {
  onIncidentReported?: (data: any) => void;
  onIncidentClassified?: (data: any) => void;
  onIncidentAssigned?: (data: any) => void;
  onIncidentProgressUpdated?: (data: any) => void;
  onIncidentClosed?: (data: any) => void;
  onIncidentReportedConfirmation?: (data: any) => void;
}) => {
  const eventListenersRef = useRef(new Map());

  useEffect(() => {
    const listeners = {
      incident_reported: onIncidentReported,
      incident_classified: onIncidentClassified,
      incident_assigned: onIncidentAssigned,
      incident_progress_updated: onIncidentProgressUpdated,
      incident_closed: onIncidentClosed,
      incident_reported_confirmation: onIncidentReportedConfirmation
    };

    // Add event listeners
    Object.entries(listeners).forEach(([event, callback]) => {
      if (callback) {
        websocketClient.on(event, callback);
        eventListenersRef.current.set(event, callback);
      }
    });

    // Cleanup on unmount
    return () => {
      eventListenersRef.current.forEach((listener, event) => {
        websocketClient.off(event, listener);
      });
      eventListenersRef.current.clear();
    };
  }, [
    onIncidentReported,
    onIncidentClassified,
    onIncidentAssigned,
    onIncidentProgressUpdated,
    onIncidentClosed,
    onIncidentReportedConfirmation
  ]);
};

/**
 * Hook for training-related WebSocket events
 * @param {Function} onTrainingSessionCreated - Callback for training session created
 * @param {Function} onTrainingEnrolled - Callback for training enrolled
 * @param {Function} onTrainingStarted - Callback for training started
 * @param {Function} onTrainingSubmitted - Callback for training submitted
 * @param {Function} onTrainingCompleted - Callback for training completed
 */
export const useTrainingEvents = ({
  onTrainingSessionCreated,
  onTrainingEnrolled,
  onTrainingStarted,
  onTrainingSubmitted,
  onTrainingCompleted
}: {
  onTrainingSessionCreated?: (data: any) => void;
  onTrainingEnrolled?: (data: any) => void;
  onTrainingStarted?: (data: any) => void;
  onTrainingSubmitted?: (data: any) => void;
  onTrainingCompleted?: (data: any) => void;
}) => {
  const eventListenersRef = useRef(new Map());

  useEffect(() => {
    const listeners = {
      training_session_created: onTrainingSessionCreated,
      training_enrolled: onTrainingEnrolled,
      training_started: onTrainingStarted,
      training_submitted: onTrainingSubmitted,
      training_completed: onTrainingCompleted
    };

    // Add event listeners
    Object.entries(listeners).forEach(([event, callback]) => {
      if (callback) {
        websocketClient.on(event, callback);
        eventListenersRef.current.set(event, callback);
      }
    });

    // Cleanup on unmount
    return () => {
      eventListenersRef.current.forEach((listener, event) => {
        websocketClient.off(event, listener);
      });
      eventListenersRef.current.clear();
    };
  }, [
    onTrainingSessionCreated,
    onTrainingEnrolled,
    onTrainingStarted,
    onTrainingSubmitted,
    onTrainingCompleted
  ]);
};

/**
 * Hook for PPE-related WebSocket events
 * @param {Function} onPPEIssued - Callback for PPE issued
 * @param {Function} onPPEReturned - Callback for PPE returned
 * @param {Function} onPPEExpiring - Callback for PPE expiring
 * @param {Function} onPPEExpiringBulk - Callback for PPE expiring bulk
 * @param {Function} onPPELowStock - Callback for PPE low stock
 */
export const usePPEEvents = ({
  onPPEIssued,
  onPPEReturned,
  onPPEExpiring,
  onPPEExpiringBulk,
  onPPELowStock
}: {
  onPPEIssued?: (data: any) => void;
  onPPEReturned?: (data: any) => void;
  onPPEExpiring?: (data: any) => void;
  onPPEExpiringBulk?: (data: any) => void;
  onPPELowStock?: (data: any) => void;
}) => {
  const eventListenersRef = useRef(new Map());

  useEffect(() => {
    const listeners = {
      ppe_issued: onPPEIssued,
      ppe_returned: onPPEReturned,
      ppe_expiring: onPPEExpiring,
      ppe_expiring_bulk: onPPEExpiringBulk,
      ppe_low_stock: onPPELowStock
    };

    // Add event listeners
    Object.entries(listeners).forEach(([event, callback]) => {
      if (callback) {
        websocketClient.on(event, callback);
        eventListenersRef.current.set(event, callback);
      }
    });

    // Cleanup on unmount
    return () => {
      eventListenersRef.current.forEach((listener, event) => {
        websocketClient.off(event, listener);
      });
      eventListenersRef.current.clear();
    };
  }, [
    onPPEIssued,
    onPPEReturned,
    onPPEExpiring,
    onPPEExpiringBulk,
    onPPELowStock
  ]);
};

/**
 * Hook for notification-related WebSocket events
 * @param {Function} onNotificationCreated - Callback for notification created
 * @param {Function} onNotificationRead - Callback for notification read
 */
export const useNotificationEvents = ({
  onNotificationCreated,
  onNotificationRead
}: {
  onNotificationCreated?: (data: any) => void;
  onNotificationRead?: (data: any) => void;
}) => {
  const eventListenersRef = useRef(new Map());

  useEffect(() => {
    const listeners = {
      notification_created: onNotificationCreated,
      notification_read: onNotificationRead
    };

    // Add event listeners
    Object.entries(listeners).forEach(([event, callback]) => {
      if (callback) {
        websocketClient.on(event, callback);
        eventListenersRef.current.set(event, callback);
      }
    });

    // Cleanup on unmount
    return () => {
      eventListenersRef.current.forEach((listener, event) => {
        websocketClient.off(event, listener);
      });
      eventListenersRef.current.clear();
    };
  }, [onNotificationCreated, onNotificationRead]);
};

/**
 * Hook for project-related WebSocket events
 * @param {Function} onProjectCreated - Callback for project created
 * @param {Function} onProjectProgressUpdated - Callback for project progress updated
 * @param {Function} onProjectAssigned - Callback for project assigned
 */
export const useProjectEvents = ({
  onProjectCreated,
  onProjectProgressUpdated,
  onProjectAssigned
}: {
  onProjectCreated?: (data: any) => void;
  onProjectProgressUpdated?: (data: any) => void;
  onProjectAssigned?: (data: any) => void;
}) => {
  const eventListenersRef = useRef(new Map());

  useEffect(() => {
    const listeners = {
      project_created: onProjectCreated,
      project_progress_updated: onProjectProgressUpdated,
      project_assigned: onProjectAssigned
    };

    // Add event listeners
    Object.entries(listeners).forEach(([event, callback]) => {
      if (callback) {
        websocketClient.on(event, callback);
        eventListenersRef.current.set(event, callback);
      }
    });

    // Cleanup on unmount
    return () => {
      eventListenersRef.current.forEach((listener, event) => {
        websocketClient.off(event, listener);
      });
      eventListenersRef.current.clear();
    };
  }, [onProjectCreated, onProjectProgressUpdated, onProjectAssigned]);
};

/**
 * Hook for typing indicators
 * @param {Function} onUserTyping - Callback for user typing
 */
export const useTypingEvents = ({ onUserTyping }: { onUserTyping?: (data: any) => void }) => {
  const eventListenersRef = useRef(new Map());

  useEffect(() => {
    if (onUserTyping) {
      websocketClient.on('user_typing', onUserTyping);
      eventListenersRef.current.set('user_typing', onUserTyping);
    }

    // Cleanup on unmount
    return () => {
      eventListenersRef.current.forEach((listener, event) => {
        websocketClient.off(event, listener);
      });
      eventListenersRef.current.clear();
    };
  }, [onUserTyping]);
};

export default websocketClient;
