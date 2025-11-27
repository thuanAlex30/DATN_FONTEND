import { useState, useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { Layout, Spin, Typography } from 'antd'
import type { RootState } from './store'
import { useDispatch } from 'react-redux'
import type { AppDispatch } from './store'
import { initializeAuth } from './store/slices/authSlice'
import AppRoutes from './routes'
import ErrorBoundary from './components/ErrorBoundary'
import WebSocketStatus from './components/WebSocketStatus'
import Chatbot from './components/Chatbot'
import { useSelector } from 'react-redux'

function AppContent() {
  const [loading, setLoading] = useState<boolean>(true);
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Initialize authentication state from localStorage
    const initializeApp = async () => {
      try {
        // Dispatch initializeAuth action to restore state from localStorage
        dispatch(initializeAuth());
        
        // Small delay to ensure state is updated
        setTimeout(() => {
          setLoading(false);
        }, 100);
      } catch (error) {
        console.error('Error initializing app:', error);
        setLoading(false);
      }
    };

    initializeApp();
  }, [dispatch]);

  if (loading) {
    return (
      <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
        <Layout.Content style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          flexDirection: 'column'
        }}>
          <Spin size="large" />
          <Typography.Text style={{ marginTop: '16px', color: '#666' }}>
            Đang tải...
          </Typography.Text>
        </Layout.Content>
      </Layout>
    );
  }

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Layout style={{ minHeight: '100vh' }}>
          <Layout.Content>
            <AppRoutes />
          </Layout.Content>
        </Layout>
        
        {/* WebSocket Status */}
        {isAuthenticated && (
          <div style={{ 
            position: 'fixed', 
            top: 20, 
            left: 20, 
            zIndex: 9999,
            background: 'rgba(255, 255, 255, 0.9)',
            padding: '8px 12px',
            borderRadius: '6px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}>
            <WebSocketStatus />
          </div>
        )}
        
        {/* Chatbot - Hiển thị luôn (cả landing page) */}
        <Chatbot />
        
      </BrowserRouter>
    </ErrorBoundary>
  );
}

function App() {
  return <AppContent />
}

export default App