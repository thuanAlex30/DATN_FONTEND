import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { apiCache } from '../utils/apiCache';
import { ENV } from '../config/env';

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second base delay

// Helper function for exponential backoff
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Tạo instance axios
const api: AxiosInstance = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: ENV.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 启用跨域凭证
});

// Request interceptor - Thêm token vào header và check cache
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(ENV.JWT_STORAGE_KEY);
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
    
    // Handle 401 (Unauthorized) - let main axios interceptor handle this
    // This prevents duplicate handling and conflicts
    if (error.response?.status === 401) {
      console.log('401 error detected - main interceptor will handle');
      return Promise.reject(error);
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

export { api };
export default api; 