// Environment configuration
export const ENV = {
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://datn-backend-t3uq.onrender.com/api',
  API_TIMEOUT: 30000,
  
  // WebSocket Configuration
  WS_BASE_URL: import.meta.env.VITE_WS_BASE_URL || 'https://datn-backend-t3uq.onrender.com',
  
  // Authentication
  JWT_STORAGE_KEY: 'safety_management_token',
  REFRESH_TOKEN_KEY: 'safety_management_refresh_token',
  
  // Application
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Safety Management System',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  
  // Features
  ENABLE_WEBSOCKET: import.meta.env.VITE_ENABLE_WEBSOCKET !== 'false',
  ENABLE_NOTIFICATIONS: import.meta.env.VITE_ENABLE_NOTIFICATIONS !== 'false',
  ENABLE_REAL_TIME_UPDATES: import.meta.env.VITE_ENABLE_REAL_TIME_UPDATES !== 'false',
  
  // Development
  IS_DEVELOPMENT: import.meta.env.DEV,
  IS_PRODUCTION: import.meta.env.PROD,
  
  // Logging
  LOG_LEVEL: import.meta.env.VITE_LOG_LEVEL || 'info',
  ENABLE_CONSOLE_LOGS: import.meta.env.VITE_ENABLE_CONSOLE_LOGS !== 'false',
  
  // Kafka UI
  KAFKA_UI_URL: import.meta.env.VITE_KAFKA_UI_URL || 'http://localhost:8080',
} as const;

// Environment validation
export const validateEnvironment = () => {
  const requiredVars = ['VITE_API_BASE_URL'];
  const missing = requiredVars.filter(varName => !import.meta.env[varName]);
  
  if (missing.length > 0 && ENV.IS_PRODUCTION) {
    console.error('Missing required environment variables:', missing);
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  return true;
};

export default ENV;