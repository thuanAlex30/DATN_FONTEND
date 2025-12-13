import axios from 'axios';
import { ENV } from '../config/env';

const contractApi = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: ENV.API_TIMEOUT,
});

contractApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

contractApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface Contract {
  _id: string;
  contractId: string;
  tenantId: string;
  userId: string;
  orderId: string;
  planType: 'monthly' | 'quarterly' | 'yearly';
  amount: number;
  startDate: string;
  endDate: string;
  companyInfo: {
    name: string;
    address: string;
    phone: string;
    email: string;
    taxCode?: string;
  };
  contactPerson: {
    name: string;
    email: string;
    phone: string;
    position: string;
  };
  status: 'active' | 'expired' | 'cancelled';
  pdfFileUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContractListResponse {
  contracts: Contract[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

class ContractService {
  async getContractById(contractId: string): Promise<Contract> {
    try {
      const response = await contractApi.get<{
        success: boolean;
        message: string;
        data: Contract;
      }>(`/contracts/${contractId}`);

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to get contract');
      }
    } catch (error: any) {
      console.error('Error getting contract:', error);
      throw error;
    }
  }

  async getContractByOrderId(orderId: string): Promise<Contract> {
    try {
      const response = await contractApi.get<{
        success: boolean;
        message: string;
        data: Contract;
      }>(`/contracts/order/${orderId}`);

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to get contract');
      }
    } catch (error: any) {
      console.error('Error getting contract by order ID:', error);
      throw error;
    }
  }

  async getContractsByTenant(
    tenantId: string,
    options?: {
      page?: number;
      limit?: number;
      status?: 'active' | 'expired' | 'cancelled';
    }
  ): Promise<ContractListResponse> {
    try {
      const response = await contractApi.get<{
        success: boolean;
        message: string;
        data: ContractListResponse;
      }>(`/contracts/tenant/${tenantId}`, { params: options });

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to get contracts');
      }
    } catch (error: any) {
      console.error('Error getting contracts by tenant:', error);
      throw error;
    }
  }

  async getLatestContract(tenantId: string): Promise<Contract> {
    try {
      const response = await contractApi.get<{
        success: boolean;
        message: string;
        data: Contract;
      }>(`/contracts/tenant/${tenantId}/latest`);

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to get latest contract');
      }
    } catch (error: any) {
      console.error('Error getting latest contract:', error);
      throw error;
    }
  }

  downloadPdf(pdfUrl: string): void {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    } else {
      console.error('PDF URL is not available');
    }
  }

  downloadPdfByContractId(contractId: string): void {
    const pdfUrl = `${ENV.API_BASE_URL}/contracts/${contractId}/pdf`;
    window.open(pdfUrl, '_blank');
  }
}

export default new ContractService();

