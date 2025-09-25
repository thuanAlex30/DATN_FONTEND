import React, { useState } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import RealtimeNotifications from '../components/RealtimeNotifications';

const WebSocketTest = () => {
  const [authToken, setAuthToken] = useState('');
  const [testMessage, setTestMessage] = useState('');
  const [messages, setMessages] = useState([]);
  
  const { isConnected, connectionError, socketId, websocketClient } = useWebSocket(authToken, 'http://localhost:3000');

  const handleConnect = () => {
    if (authToken) {
      websocketClient.connect('http://localhost:3000', authToken);
    }
  };

  const handleDisconnect = () => {
    websocketClient.disconnect();
  };

  const handleSendTestMessage = () => {
    if (testMessage && websocketClient.isConnected()) {
      websocketClient.emit('test_message', { message: testMessage });
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        type: 'sent', 
        message: testMessage, 
        timestamp: new Date() 
      }]);
      setTestMessage('');
    }
  };

  const handleJoinRoom = () => {
    if (websocketClient.isConnected()) {
      websocketClient.emit('join_room', { room: 'test_room' });
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        type: 'system', 
        message: 'Joined test_room', 
        timestamp: new Date() 
      }]);
    }
  };

  const handleLeaveRoom = () => {
    if (websocketClient.isConnected()) {
      websocketClient.emit('leave_room', { room: 'test_room' });
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        type: 'system', 
        message: 'Left test_room', 
        timestamp: new Date() 
      }]);
    }
  };

  // Listen for test messages
  React.useEffect(() => {
    const handleTestMessage = (data) => {
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        type: 'received', 
        message: data.message, 
        timestamp: new Date() 
      }]);
    };

    const handleRoomMessage = (data) => {
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        type: 'room', 
        message: `Room message: ${data.message}`, 
        timestamp: new Date() 
      }]);
    };

    if (websocketClient) {
      websocketClient.on('test_message_response', handleTestMessage);
      websocketClient.on('room_message', handleRoomMessage);

      return () => {
        websocketClient.off('test_message_response', handleTestMessage);
        websocketClient.off('room_message', handleRoomMessage);
      };
    }
  }, [websocketClient]);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>WebSocket Test Page</h1>
      
      {/* Connection Controls */}
      <div style={{ 
        padding: '20px', 
        border: '1px solid #ddd', 
        borderRadius: '8px', 
        marginBottom: '20px',
        backgroundColor: '#f9f9f9'
      }}>
        <h2>Connection Controls</h2>
        
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Auth Token:
          </label>
          <input
            type="text"
            value={authToken}
            onChange={(e) => setAuthToken(e.target.value)}
            placeholder="Enter JWT token"
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <button
            onClick={handleConnect}
            disabled={!authToken || isConnected}
            style={{
              padding: '8px 16px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isConnected ? 'not-allowed' : 'pointer',
              opacity: isConnected ? 0.6 : 1
            }}
          >
            Connect
          </button>
          
          <button
            onClick={handleDisconnect}
            disabled={!isConnected}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: !isConnected ? 'not-allowed' : 'pointer',
              opacity: !isConnected ? 0.6 : 1
            }}
          >
            Disconnect
          </button>
        </div>

        <div style={{
          padding: '10px',
          backgroundColor: isConnected ? '#d4edda' : '#f8d7da',
          border: `1px solid ${isConnected ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '4px',
          color: isConnected ? '#155724' : '#721c24'
        }}>
          Status: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
          {socketId && <div>Socket ID: {socketId}</div>}
          {connectionError && <div>Error: {connectionError}</div>}
        </div>
      </div>

      {/* Test Message Controls */}
      <div style={{ 
        padding: '20px', 
        border: '1px solid #ddd', 
        borderRadius: '8px', 
        marginBottom: '20px',
        backgroundColor: '#f9f9f9'
      }}>
        <h2>Test Messages</h2>
        
        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            placeholder="Enter test message"
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              marginBottom: '10px'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <button
            onClick={handleSendTestMessage}
            disabled={!isConnected || !testMessage}
            style={{
              padding: '8px 16px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: (!isConnected || !testMessage) ? 'not-allowed' : 'pointer',
              opacity: (!isConnected || !testMessage) ? 0.6 : 1
            }}
          >
            Send Test Message
          </button>
          
          <button
            onClick={handleJoinRoom}
            disabled={!isConnected}
            style={{
              padding: '8px 16px',
              backgroundColor: '#FF9800',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: !isConnected ? 'not-allowed' : 'pointer',
              opacity: !isConnected ? 0.6 : 1
            }}
          >
            Join Test Room
          </button>
          
          <button
            onClick={handleLeaveRoom}
            disabled={!isConnected}
            style={{
              padding: '8px 16px',
              backgroundColor: '#9C27B0',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: !isConnected ? 'not-allowed' : 'pointer',
              opacity: !isConnected ? 0.6 : 1
            }}
          >
            Leave Test Room
          </button>
        </div>
      </div>

      {/* Messages Display */}
      <div style={{ 
        padding: '20px', 
        border: '1px solid #ddd', 
        borderRadius: '8px',
        backgroundColor: '#f9f9f9'
      }}>
        <h2>Messages</h2>
        <div style={{
          maxHeight: '300px',
          overflowY: 'auto',
          border: '1px solid #ccc',
          borderRadius: '4px',
          padding: '10px',
          backgroundColor: 'white'
        }}>
          {messages.length === 0 ? (
            <div style={{ color: '#666', fontStyle: 'italic' }}>
              No messages yet...
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  padding: '8px',
                  marginBottom: '8px',
                  borderRadius: '4px',
                  backgroundColor: msg.type === 'sent' ? '#e3f2fd' : 
                                  msg.type === 'received' ? '#f3e5f5' : 
                                  msg.type === 'room' ? '#fff3e0' : '#f5f5f5',
                  borderLeft: `4px solid ${
                    msg.type === 'sent' ? '#2196F3' : 
                    msg.type === 'received' ? '#9C27B0' : 
                    msg.type === 'room' ? '#FF9800' : '#666'
                  }`
                }}
              >
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                  {msg.timestamp.toLocaleTimeString()} - {msg.type.toUpperCase()}
                </div>
                <div>{msg.message}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Realtime Notifications Component */}
      <RealtimeNotifications authToken={authToken} />
    </div>
  );
};

export default WebSocketTest;




