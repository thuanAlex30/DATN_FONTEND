import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { apiCache } from '../utils/apiCache';

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second base delay

// Helper function for exponential backoff
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Tạo instance axios
const api: AxiosInstance = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  timeout: 60000, // Increased to 60 seconds
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 启用跨域凭证
});

// Request interceptor - Thêm token vào header và check cache
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Check cache for GET requests
    if (config.method === 'get') {
      const cacheKey = apiCache.generateKey(config.url || '', config.params);
      const cachedData = apiCache.get(cacheKey);
      
      if (cachedData) {
        // Return cached data instead of making request
        return Promise.reject({
          isCached: true,
          data: cachedData,
          config
        });
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Xử lý response và refresh token với retry logic
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Cache successful GET responses
    if (response.config.method === 'get') {
      const cacheKey = apiCache.generateKey(response.config.url || '', response.config.params);
      apiCache.set(cacheKey, response.data, 5 * 60 * 1000); // Cache for 5 minutes
    }
    
    return response;
  },
  async (error: AxiosError | any) => {
    // Handle cached responses
    if (error.isCached) {
      return Promise.resolve({ data: error.data });
    }
    
    const originalRequest = error.config as InternalAxiosRequestConfig & { 
      _retry?: boolean; 
      _retryCount?: number;
    };
    
    // Handle 429 (Too Many Requests) with exponential backoff
    if (error.response?.status === 429) {
      const retryCount = originalRequest._retryCount || 0;
      
      if (retryCount < MAX_RETRIES) {
        originalRequest._retryCount = retryCount + 1;
        const delayTime = RETRY_DELAY * Math.pow(2, retryCount); // Exponential backoff
        
        console.log(`Rate limited. Retrying in ${delayTime}ms... (attempt ${retryCount + 1}/${MAX_RETRIES})`);
        await delay(delayTime);
        
        return api(originalRequest);
      } else {
        console.error('Max retries reached for rate limit');
        return Promise.reject(error);
      }
    }
    
    // Handle 401 (Unauthorized) with token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(
            'http://localhost:3000/api/v1/auth/refresh-token',
            { refreshToken },
            { withCredentials: true }
          );
          
          const { accessToken } = response.data.data.tokens;
          localStorage.setItem('accessToken', accessToken);
          
          // Retry request với token mới
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token hết hạn, đăng xuất user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    
    // Handle timeout errors specifically
    if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
      console.error('Request timeout:', error.config?.url);
      return Promise.reject({
        ...error,
        message: 'Kết nối đến server bị timeout. Vui lòng kiểm tra kết nối mạng.',
        timeout: true
      });
    }
    
    return Promise.reject(error);
  }
);

export default api; 