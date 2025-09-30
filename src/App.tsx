import { useState, useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { Layout, Spin, Typography } from 'antd'
import { store, persistor } from './store'
import type { RootState } from './store'
import AppRoutes from './routes'
import ErrorBoundary from './components/ErrorBoundary'
import RealtimeNotifications from './components/RealtimeNotifications'
import { useSelector } from 'react-redux'

function AppContent() {
  const [loading, setLoading] = useState<boolean>(true);
  const authToken = useSelector((state: RootState) => state.auth.accessToken);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = () => {
      // Authentication logic can be added here if needed
      setLoading(false);
    };

    checkAuth();
  }, []);

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
        {/* WebSocket Realtime Notifications */}
        {authToken && (
          <div style={{ 
            position: 'fixed', 
            top: 20, 
            right: 20, 
            zIndex: 9999, 
            maxWidth: 400 
          }}>
            <RealtimeNotifications authToken={authToken} />
          </div>
        )}
      </BrowserRouter>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppContent />
      </PersistGate>
    </Provider>
  )
}

export default App