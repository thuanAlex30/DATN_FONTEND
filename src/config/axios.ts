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
    // Các endpoint public - KHÔNG gửi token (pricing routes, forgot password)
    // Note: /contact-messages POST is public, but GET requires auth
    const publicEndpoints = [
      '/pricing/orders',
      '/pricing/payment-return',
      '/pricing/payment-cancel',
      '/pricing/payment-webhook',
      '/auth/forgot-password',
      '/auth/verify-otp',
      '/auth/reset-password'
    ];
    
    // Check if this is a POST to /contact-messages (public) - exact match, not /contact-messages/.../reply
    // URL might be '/contact-messages' or '/api/contact-messages' depending on baseURL
    const isContactMessagePost = config.method?.toLowerCase() === 'post' && 
                                  (config.url === '/contact-messages' || 
                                   config.url?.endsWith('/contact-messages') && 
                                   !config.url?.includes('/contact-messages/'));
    
    // Các endpoint optional auth - có thể gửi token nếu có (chatbot)
    const optionalAuthEndpoints = [
      '/chatbot/session',
      '/chatbot/message',
      '/chatbot/ai-status'
    ];
    
    // Check if URL matches any public endpoint (exact match or contains)
    const url = config.url || '';
    const fullUrl = url.startsWith('/') ? url : `/${url}`;
    
    // Check if URL matches any public endpoint
    const isPublicEndpoint = publicEndpoints.some(endpoint => {
      // Check exact match
      if (url === endpoint || fullUrl === endpoint) {
        return true;
      }
      // Check if URL contains the endpoint (for cases like /api/auth/forgot-password)
      if (url.includes(endpoint) || fullUrl.includes(endpoint)) {
        return true;
      }
      return false;
    }) || isContactMessagePost; // POST to /contact-messages is public
    
    const isOptionalAuthEndpoint = optionalAuthEndpoints.some(endpoint => 
      config.url?.includes(endpoint)
    );
    
    const token = localStorage.getItem(ENV.JWT_STORAGE_KEY);
    
    // QUAN TRỌNG: Xử lý public endpoints TRƯỚC - đảm bảo không gửi token
    if (isPublicEndpoint) {
      // Xóa token hoàn toàn - đảm bảo không gửi token cho public endpoints
      if (config.headers) {
        delete config.headers.Authorization;
        // Set explicitly to undefined để đảm bảo không có giá trị
        config.headers.Authorization = undefined;
      }
      // Log để debug
      console.log(`🔓 [PUBLIC ENDPOINT] ${config.method?.toUpperCase()} ${config.url} - Token removed, isPublicEndpoint: ${isPublicEndpoint}`);
    } 
    // Chỉ thêm token cho non-public endpoints
    else if (token && config.headers && !isPublicEndpoint) {
      // Thêm token cho các endpoint khác (không phải public)
      if (!isOptionalAuthEndpoint || token) {
        // Optional auth endpoints: vẫn thêm token nếu có
        config.headers.Authorization = `Bearer ${token}`;
      }
    } 
    // Nếu không có token và không phải public endpoint - xóa header nếu có
    else if (!token && config.headers && !isPublicEndpoint) {
      delete config.headers.Authorization;
    }
    
    // Add request timestamp for logging
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      isPublicEndpoint,
      isOptionalAuth: isOptionalAuthEndpoint,
      hasToken: !!token,
      hasAuthHeader: !!config.headers?.Authorization,
      publicEndpoints,
      matchedEndpoint: publicEndpoints.find(ep => url.includes(ep)),
      timestamp: new Date().toISOString(),
    });
    
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
      const method = error.config?.method?.toUpperCase() || 'UNKNOWN';
      const url = error.config?.url || 'UNKNOWN_URL';
      const status = error.response?.status;
      const statusText = error.response?.statusText;
      
      console.error(`❌ API Error: ${method} ${url}`, {
        status,
        statusText,
        message: error.message,
        data: error.response?.data,
        code: error.code,
        timestamp: new Date().toISOString(),
      });
      
      // Log additional error details for debugging
      if (status && status >= 500) {
        console.error('❌ Server error details:', {
          url: error.config?.url,
          method: error.config?.method,
          baseURL: error.config?.baseURL,
          headers: error.config?.headers,
          responseData: error.response?.data,
        });
      }
    }
    
    // Handle 401 Unauthorized with token refresh
    // Handle 429 Too Many Requests with simple retry + exponential backoff
    if (error.response?.status === 429) {
      const original = originalRequest as any;
      original._retryCount = original._retryCount || 0;
      const maxRetries = 3;
      if (original._retryCount < maxRetries) {
        original._retryCount += 1;
        const delayMs = Math.pow(2, original._retryCount) * 300; // 300ms, 600ms, 1.2s ...
        console.warn(`⚠️ Received 429, retrying request ${original.url} after ${delayMs}ms (attempt ${original._retryCount}/${maxRetries})`);
        await new Promise(res => setTimeout(res, delayMs));
        return apiClient(original);
      }
      console.error(`❌ Request ${original.url} failed with 429 after ${original._retryCount} retries`);
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Don't logout on timeout errors - only on actual 401 responses
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        console.log('⏰ Request timeout - not logging out user');
        return Promise.reject(error);
      }
      
      // Các endpoint public - không redirect về login khi có 401
      // Note: /contact-messages POST is public, but GET requires auth
      const publicEndpoints = [
        '/pricing/orders',
        '/pricing/payment-return',
        '/pricing/payment-cancel',
        '/pricing/payment-webhook',
        '/auth/forgot-password',
        '/auth/verify-otp',
        '/auth/reset-password'
      ];
      
      // Check if this is a POST to /contact-messages (public) - exact match, not /contact-messages/.../reply
      // URL might be '/contact-messages' or '/api/contact-messages' depending on baseURL
      const isContactMessagePost = originalRequest.method?.toLowerCase() === 'post' && 
                                   (originalRequest.url === '/contact-messages' || 
                                    originalRequest.url?.endsWith('/contact-messages') && 
                                    !originalRequest.url?.includes('/contact-messages/'));
      
      // Các endpoint cho phép optional auth - không redirect về login
      const optionalAuthEndpoints = [
        '/chatbot/session',
        '/chatbot/message',
        '/chatbot/ai-status',
        '/chatbot/history'
      ];
      
      // Check if URL matches any public endpoint (same logic as request interceptor)
      const errorUrl = originalRequest.url || '';
      const errorFullUrl = errorUrl.startsWith('/') ? errorUrl : `/${errorUrl}`;
      
      const isPublicEndpoint = publicEndpoints.some(endpoint => {
        // Check exact match
        if (errorUrl === endpoint || errorFullUrl === endpoint) {
          return true;
        }
        // Check if URL contains the endpoint
        if (errorUrl.includes(endpoint) || errorFullUrl.includes(endpoint)) {
          return true;
        }
        return false;
      }) || isContactMessagePost;
      
      const isOptionalAuthEndpoint = optionalAuthEndpoints.some(endpoint => 
        originalRequest.url?.includes(endpoint)
      );
      
      if (isPublicEndpoint || isOptionalAuthEndpoint) {
        // Đây là endpoint public hoặc optional auth, chỉ reject error, không redirect
        // Không cần refresh token vì endpoint này không yêu cầu authentication
        console.log('ℹ️ Public/Optional auth endpoint - not redirecting to login');
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
    
  // Deduplicate identical non-file POST requests to avoid bursts (coalesce in-flight)
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    // Do not coalesce FormData (file uploads) - they are handled by UI disabling
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
    const key = isFormData ? null : `${url}::${JSON.stringify(data || {})}`;
    if (key) {
      const existing = (api as any)._inflightPosts?.get(key);
      if (existing) return existing as Promise<AxiosResponse<T>>;
    }

    const p = apiClient.post(url, data, config);
    if (key) {
      (api as any)._inflightPosts = (api as any)._inflightPosts || new Map();
      (api as any)._inflightPosts.set(key, p);
      // ensure cleanup
      p.finally(() => {
        try { (api as any)._inflightPosts.delete(key); } catch (e) { /* ignore */ }
      });
    }
    return p;
  },
    
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