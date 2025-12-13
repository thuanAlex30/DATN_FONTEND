import { api } from '../config/axios';

// Types
export interface Certificate {
  _id: string;
  certificateName: string;
  certificateCode: string;
  description?: string;
  category: 'SAFETY' | 'TECHNICAL' | 'MANAGEMENT' | 'QUALITY' | 'ENVIRONMENTAL' | 'HEALTH' | 'OTHER';
  subCategory?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  issuingAuthority: string;
  legalBasis?: string;
  applicableRegulations?: string[];
  validityPeriod: number;
  validityPeriodUnit: 'DAYS' | 'MONTHS' | 'YEARS';
  renewalRequired: boolean;
  renewalProcess?: string;
  renewalDocuments?: string[];
  cost: number;
  currency: string;
  contactInfo: {
    organization?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
  };
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'EXPIRED';
  reminderSettings: {
    enabled: boolean;
    reminderDays: number[];
    notificationMethods: ('EMAIL' | 'SMS' | 'SYSTEM')[];
    recipients: string[];
  };
  attachments: Array<{
    _id: string;
    fileName: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
    uploadedAt: string;
    uploadedBy: string;
  }>;
  createdBy: string;
  updatedBy?: string;
  tags: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CertificateStats {
  overview?: {
    total?: number;
    active?: number;
    inactive?: number;
    expired?: number;
    expiring?: number;
  };
  byCategory?: Array<{ _id: string; count: number }>;
  byPriority?: Record<string, number>;
  byExpiryStatus?: Record<string, number>;
}

export interface CertificateFilters {
  search?: string;
  category?: string;
  status?: string;
  priority?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ReminderSettingsPayload {
  enabled?: boolean;
  reminderDays?: number[];
  notificationMethods?: Array<'EMAIL' | 'SMS' | 'SYSTEM'>;
  recipients?: string[];
}

export interface CertificatePayload {
  certificateName: string;
  certificateCode?: string;
  description?: string;
  category: 'SAFETY' | 'TECHNICAL' | 'MANAGEMENT' | 'QUALITY' | 'ENVIRONMENTAL' | 'HEALTH' | 'OTHER';
  subCategory?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  issuingAuthority: string;
  legalBasis?: string;
  applicableRegulations?: string[];
  validityPeriod: number;
  validityPeriodUnit?: 'DAYS' | 'MONTHS' | 'YEARS';
  issueDate?: string;
  expiryDate?: string;
  renewalRequired?: boolean;
  renewalProcess?: string;
  renewalDocuments?: string[];
  cost?: number;
  currency?: string;
  tenant_id?: string;
  contactInfo?: {
    organization?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
  };
  reminderSettings?: ReminderSettingsPayload;
  tags?: string[];
  notes?: string;
}

export interface CertificateSearchParams {
  q?: string;
  category?: string;
  status?: string;
  priority?: string;
  tags?: string[] | string;
  page?: number;
  limit?: number;
  dateFrom?: string;
  dateTo?: string;
  expiryDateFrom?: string;
  expiryDateTo?: string;
  costMin?: number;
  costMax?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

const basePath = '/certificates';

export const certificateService = {
  getCertificates(filters: CertificateFilters = {}) {
    const params: Record<string, unknown> = {};
    if (filters.search) params.search = filters.search;
    if (filters.category) params.category = filters.category;
    if (filters.status) params.status = filters.status;
    if (filters.priority) params.priority = filters.priority;
    if (filters.sortBy) params.sortBy = filters.sortBy;
    if (filters.sortOrder) params.sortOrder = filters.sortOrder;
    if (filters.page) params.page = filters.page;
    if (filters.limit) params.limit = filters.limit;
    return api.get(`${basePath}`, { params }).then((res) => {
      // Backend shape: { success, message, data: { data: [], pagination } }
      const payload: any = res.data;
      return payload?.data?.data || payload?.data || [];
    });
  },

  createCertificate(certificateData: CertificatePayload): Promise<Certificate> {
    return api.post(`${basePath}`, certificateData).then(res => {
      if (res.data.success && res.data.data) {
        return res.data.data;
      }
      throw new Error(res.data.message || 'Tạo chứng chỉ thất bại');
    }).catch(error => {
      console.error('Create certificate error:', error);
      throw error;
    });
  },

  updateCertificate(id: string, certificateData: Partial<CertificatePayload>): Promise<Certificate> {
    return api.put(`${basePath}/${id}`, certificateData).then(res => res.data.data);
  },

  deleteCertificate(id: string): Promise<void> {
    return api.delete(`${basePath}/${id}`).then(() => undefined);
  },

  getCertificateById(id: string): Promise<Certificate> {
    return api.get(`${basePath}/${id}`).then(res => res.data.data);
  },

  getCertificateStats(): Promise<CertificateStats> {
    return api.get(`${basePath}/stats/overview`).then(res => res.data.data);
  },

  updateReminderSettings(id: string, reminderSettings: ReminderSettingsPayload): Promise<Certificate> {
    return api.put(`${basePath}/${id}/reminder-settings`, { reminderSettings }).then(res => res.data.data);
  },

  renewCertificate(id: string, data?: { renewalDate?: string; notes?: string }): Promise<Certificate> {
    return api.post(`${basePath}/${id}/renew`, data).then(res => res.data.data);
  },

  getCertificatesByCategory(category: string): Promise<Certificate[]> {
    return api.get(`${basePath}/category/${category}`).then(res => res.data.data);
  },

  getExpiringCertificates(days = 30): Promise<Certificate[]> {
    return api.get(`${basePath}/expiring/soon`, { params: { days } }).then(res => {
      const payload: any = res.data;
      return payload?.data || [];
    });
  },

  getStats() {
    return api.get(`${basePath}/stats/overview`);
  },

  searchCertificates(params: CertificateSearchParams) {
    return api.get(`${basePath}/search/query`, { params });
  },
};

export default certificateService;
