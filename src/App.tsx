import { useState, useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { Layout, Spin, Typography } from 'antd'
import type { RootState } from './store'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch } from './store'
import { initializeAuth } from './store/slices/authSlice'
import AppRoutes from './routes'
import ErrorBoundary from './components/ErrorBoundary'
import Chatbot from './components/Chatbot'

function AppContent() {
  const [authInitialized, setAuthInitialized] = useState<boolean>(false);
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Initialize authentication state from localStorage ONCE on mount
    const initializeApp = () => {
      try {
        console.log('🚀 Initializing app authentication...');
        
        // Dispatch initializeAuth action to restore state from localStorage
        dispatch(initializeAuth());
        
        // Mark auth as initialized immediately
        // The auth state will be properly set by initializeAuth reducer
        setAuthInitialized(true);
        
        console.log('✅ App authentication initialized');
      } catch (error) {
        console.error('❌ Error initializing app:', error);
        setAuthInitialized(true); // Still mark as initialized to prevent infinite loading
      }
    };

    initializeApp();
  }, [dispatch]); // Only run once on mount

  // Show loading spinner only during initial auth check
  if (!authInitialized) {
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