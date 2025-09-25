import { useState, useEffect } from 'react'
import './App.css'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppRoutes />
        {/* WebSocket Realtime Notifications */}
        {authToken && (
          <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, maxWidth: 400 }}>
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