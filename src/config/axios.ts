import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { ENV } from './env';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: ENV.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Các endpoint chatbot cho phép không cần token
    const optionalAuthEndpoints = [
      '/chatbot/session',
      '/chatbot/message',
      '/chatbot/ai-status'
    ];
    
    const isOptionalAuthEndpoint = optionalAuthEndpoints.some(endpoint => 
      config.url?.includes(endpoint)
    );
    
    // Chỉ thêm token nếu có và không phải là optional auth endpoint
    // Hoặc nếu là optional auth endpoint, vẫn thêm token nếu có (để lấy thông tin user nếu đã đăng nhập)
    const token = localStorage.getItem(ENV.JWT_STORAGE_KEY);
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request timestamp for logging
    if (ENV.IS_DEVELOPMENT) {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        data: config.data,
        params: config.params,
        isOptionalAuth: isOptionalAuthEndpoint,
        hasToken: !!token,
        timestamp: new Date().toISOString(),
      });
    }
    
    return config;
  },
  (error: AxiosError) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    if (ENV.IS_DEVELOPMENT) {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
        timestamp: new Date().toISOString(),
      });
    }
    
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    if (ENV.IS_DEVELOPMENT) {
      console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
        status: error.response?.status,
        message: error.message,
        data: error.response?.data,
        timestamp: new Date().toISOString(),
      });
    }
    
    // Handle 401 Unauthorized with token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Don't logout on timeout errors - only on actual 401 responses
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        console.log('⏰ Request timeout - not logging out user');
        return Promise.reject(error);
      }
      
      // Các endpoint cho phép optional auth - không redirect về login
      const optionalAuthEndpoints = [
        '/chatbot/session',
        '/chatbot/message',
        '/chatbot/ai-status',
        '/chatbot/history'
      ];
      
      const isOptionalAuthEndpoint = optionalAuthEndpoints.some(endpoint => 
        originalRequest.url?.includes(endpoint)
      );
      
      if (isOptionalAuthEndpoint) {
        // Đây là endpoint optional auth, chỉ reject error, không redirect
        // Không cần refresh token vì endpoint này không yêu cầu authentication
        console.log('ℹ️ Optional auth endpoint - not redirecting to login');
        return Promise.reject(error);
      }
      
      // Try to refresh token first
      const refreshToken = localStorage.getItem(ENV.REFRESH_TOKEN_KEY);
      if (refreshToken) {
        try {
          console.log('🔄 Attempting token refresh...');
          const response = await axios.post(
            `${ENV.API_BASE_URL}/auth/refresh-token`,
            { refreshToken },
            { withCredentials: true }
          );
          
          const { data } = response.data;
          const { data: innerData } = data;
          const { accessToken } = innerData.tokens;
          
          // Update token in localStorage
          localStorage.setItem(ENV.JWT_STORAGE_KEY, accessToken);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
          
        } catch (refreshError) {
          console.log('❌ Token refresh failed, logging out user');
          // Refresh failed, clear tokens and redirect to login
          localStorage.removeItem(ENV.JWT_STORAGE_KEY);
          localStorage.removeItem(ENV.REFRESH_TOKEN_KEY);
          localStorage.removeItem('user');
          
          // Redirect to login page
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
      } else {
        // No refresh token, clear tokens and redirect to login
        localStorage.removeItem(ENV.JWT_STORAGE_KEY);
        localStorage.removeItem(ENV.REFRESH_TOKEN_KEY);
        localStorage.removeItem('user');
        
        // Redirect to login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    
    // Handle other errors
    if (error.response?.status === 403) {
      console.error('❌ Access forbidden');
      // Redirect to unauthorized page
      window.location.href = '/unauthorized';
    }
    
    if (error.response?.status && error.response.status >= 500) {
      console.error('❌ Server error');
      // Show server error notification
    }
    
    return Promise.reject(error);
  }
);

// API methods
export const api = {
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    apiClient.get(url, config),
    
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    apiClient.post(url, data, config),
    
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    apiClient.put(url, data, config),
    
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    apiClient.patch(url, data, config),
    
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    apiClient.delete(url, config),
    
  upload: <T = any>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    apiClient.post(url, formData, {
      ...config,
      headers: {
        ...config?.headers,
        'Content-Type': 'multipart/form-data',
      },
    }),
};

export default apiClient;