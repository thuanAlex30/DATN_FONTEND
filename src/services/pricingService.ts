import axios from 'axios';
import { ENV } from '../config/env';

// Tạo axios instance riêng cho pricing (public endpoints - không gửi token)
const pricingApi = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: ENV.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - đảm bảo không gửi token
pricingApi.interceptors.request.use(
  (config) => {
    // Xóa token nếu có (đảm bảo không gửi token cho public endpoints)
    if (config.headers) {
      delete config.headers.Authorization;
    }
    
    // Log để debug
    if (ENV.IS_DEVELOPMENT) {
      console.log('🔓 Pricing API Request (Public):', {
        method: config.method?.toUpperCase(),
        url: config.url,
        hasAuth: !!config.headers?.Authorization,
      });
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - không redirect khi có 401 (vì đây là public endpoint)
pricingApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Không redirect về login cho pricing routes (public endpoints)
    // Chỉ log error và reject
    if (ENV.IS_DEVELOPMENT) {
      console.error('❌ Pricing API Error:', {
        url: error.config?.url,
        status: error.response?.status,
        message: error.message,
        data: error.response?.data,
      });
    }
    
    // Không xử lý 401 đặc biệt - chỉ reject error
    return Promise.reject(error);
  }
);

export interface CompanyInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  taxCode?: string;
}

export interface ContactPerson {
  name: string;
  email: string;
  phone: string;
  position?: string;
}

export interface CreateOrderRequest {
  planType: 'monthly' | 'quarterly' | 'yearly';
  userId?: string;
  companyInfo: CompanyInfo;
  contactPerson: ContactPerson;
}

export interface CreateOrderResponse {
  orderId: string;
  paymentUrl: string;
  contractPath?: string;
  amount: number;
  planType: string;
}

export interface OrderInfo {
  orderId: string;
  planType: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed' | 'cancelled';
  companyInfo: CompanyInfo;
  contactPerson: ContactPerson;
  paymentDate?: string;
  contractId?: string;
  contractPdfUrl?: string;
}

class PricingService {
  /**
   * Tạo đơn hàng và lấy payment URL
   */
  async createOrder(data: CreateOrderRequest): Promise<CreateOrderResponse> {
    try {
      console.log('📦 Creating order with data:', {
        planType: data.planType,
        hasUserId: !!data.userId,
        companyName: data.companyInfo.name,
      });

      const response = await pricingApi.post<{
        success: boolean;
        message: string;
        data: CreateOrderResponse;
      }>('/pricing/orders', data);

      console.log('✅ Order created successfully:', response.data);

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to create order');
      }
    } catch (error: any) {
      console.error('❌ Error creating order:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
      });
      
      // Nếu là 401, có thể do token vẫn được gửi
      if (error.response?.status === 401) {
        console.error('⚠️ 401 Unauthorized - Có thể token vẫn được gửi từ axios config chính');
        console.error('Request headers:', error.config?.headers);
      }
      
      throw error;
    }
  }

  /**
   * Lấy thông tin đơn hàng
   */
  async getOrder(orderId: string): Promise<OrderInfo> {
    try {
      const response = await pricingApi.get<{
        success: boolean;
        message: string;
        data: OrderInfo;
      }>(`/pricing/orders/${orderId}`);

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to get order');
      }
    } catch (error: any) {
      console.error('Error getting order:', error);
      throw error;
    }
  }

  /**
   * Generate contract preview PDF từ thông tin form
   */
  async generateContractPreview(data: {
    planType: 'monthly' | 'quarterly' | 'yearly';
    companyInfo: CompanyInfo;
    contactPerson: ContactPerson;
  }): Promise<{ previewPdfUrl: string }> {
    try {
      const response = await pricingApi.post<{
        success: boolean;
        message: string;
        data: { previewPdfUrl: string };
      }>('/pricing/contract-preview', data);

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to generate contract preview');
      }
    } catch (error: any) {
      console.error('Error generating contract preview:', error);
      throw error;
    }
  }
}

export default new PricingService();

