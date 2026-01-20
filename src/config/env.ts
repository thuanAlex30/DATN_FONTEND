// Environment configuration
export const ENV = {
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  API_TIMEOUT: 30000,
  
  // WebSocket Configuration
  WS_BASE_URL: import.meta.env.VITE_WS_BASE_URL || 'http://localhost:3000',
  
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
  WEATHER_REFRESH_SECONDS: Number(import.meta.env.VITE_WEATHER_REFRESH_SECONDS) || 600,
  DEFAULT_WEATHER_LAT: Number(import.meta.env.VITE_DEFAULT_WEATHER_LAT) || 16.0471,
  DEFAULT_WEATHER_LON: Number(import.meta.env.VITE_DEFAULT_WEATHER_LON) || 108.2068,
  
  // Kafka UI
  KAFKA_UI_URL: import.meta.env.VITE_KAFKA_UI_URL || 'http://localhost:8080',
} as const;

// Environment validation
export const validateEnvironment = () => {
  const requiredVars = ['VITE_API_BASE_URL'];
  const missing = requiredVars.filter(varName => !import.meta.env[varName]);
  
  // Only warn in production, don't throw error during build
  // Vercel build happens before runtime, so we can't validate env vars at build time
  if (missing.length > 0) {
    if (ENV.IS_PRODUCTION && typeof window !== 'undefined') {
      // Only log error in browser runtime, not during build
      console.warn('Missing recommended environment variables:', missing);
      console.warn('Using default values. Please set environment variables in Vercel dashboard.');
    }
  }
  
  return true;
};

export default ENV;