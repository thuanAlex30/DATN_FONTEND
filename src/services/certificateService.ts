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
  validityPeriodUnit: 'MONTHS' | 'YEARS';
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
  issueDate?: string;
  expiryDate?: string;
  lastRenewalDate?: string;
  renewalNotes?: string;
}

export interface CertificateStats {
  total: number;
  active: number;
  inactive: number;
  suspended: number;
  expired: number;
  expiringSoon: number;
  categoryDistribution: Record<string, number>;
  priorityDistribution: Record<string, number>;
  costSummary: {
    total: number;
    average: number;
    currency: string;
  };
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

export const certificateService = {
  // Get all certificates - simplified like incidentService
  getCertificates: (filters: CertificateFilters = {}) => {
    const params: any = {};
    
    // Only add params if they have values
    // Backend uses 'q' for search query parameter
    if (filters.search) params.q = filters.search;
    if (filters.category) params.category = filters.category;
    if (filters.status) params.status = filters.status;
    if (filters.priority) params.priority = filters.priority;
    // Note: sortBy and sortOrder may not be supported by backend validation
    // Remove them if causing 400 errors
    if (filters.page) params.page = filters.page;
    if (filters.limit) params.limit = filters.limit;

    return api.get('/certificates', { params });
  },

  // Get certificate by ID
  async getCertificateById(id: string): Promise<Certificate> {
    try {
      const response = await api.get(`/certificates/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching certificate:', error);
      throw error;
    }
  },

  // Create new certificate
  async createCertificate(certificateData: Partial<Certificate>): Promise<Certificate> {
    try {
      const response = await api.post('/certificates', certificateData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating certificate:', error);
      throw error;
    }
  },

  // Update certificate
  async updateCertificate(id: string, certificateData: Partial<Certificate>): Promise<Certificate> {
    try {
      const response = await api.put(`/certificates/${id}`, certificateData);
      return response.data.data;
    } catch (error) {
      console.error('Error updating certificate:', error);
      throw error;
    }
  },

  // Delete certificate
  async deleteCertificate(id: string): Promise<void> {
    try {
      await api.delete(`/certificates/${id}`);
    } catch (error) {
      console.error('Error deleting certificate:', error);
      throw error;
    }
  },

  // Get certificate statistics
  async getCertificateStats(): Promise<CertificateStats> {
    try {
      console.log('🔍 Fetching certificate stats...');
      const response = await api.get('/certificates/stats/overview');
      console.log('📈 Certificate stats API response:', response.data);
      
      // Backend returns { success, message, data: { overview: {}, byCategory: [] } }
      const backendData = response.data.data;
      const overview = backendData.overview || {};
      
      return {
        total: overview.total || 0,
        active: overview.active || 0,
        inactive: overview.inactive || 0,
        suspended: 0, // Not in backend yet
        expired: overview.expired || 0,
        expiringSoon: overview.expiring || 0,
        categoryDistribution: {},
        priorityDistribution: {},
        costSummary: {
          total: 0,
          average: 0,
          currency: 'VND'
        }
      };
    } catch (error) {
      console.error('❌ Error fetching certificate stats:', error);
      throw error;
    }
  },

  // Update reminder settings
  async updateReminderSettings(id: string, reminderSettings: Partial<Certificate['reminderSettings']>): Promise<Certificate> {
    try {
      const response = await api.put(`/certificates/${id}/reminder-settings`, reminderSettings);
      return response.data.data;
    } catch (error) {
      console.error('Error updating reminder settings:', error);
      throw error;
    }
  },

  // Renew certificate
  async renewCertificate(id: string, renewalData?: { renewalDate?: string; notes?: string }): Promise<Certificate> {
    try {
      const response = await api.post(`/certificates/${id}/renew`, renewalData || {});
      return response.data.data;
    } catch (error) {
      console.error('Error renewing certificate:', error);
      throw error;
    }
  },

  // Check duplicate
  async checkDuplicate(certificateName?: string, certificateCode?: string): Promise<{ isDuplicate: boolean; duplicateInfo?: { field: string; value: string } }> {
    try {
      const params: any = {};
      if (certificateName) params.certificateName = certificateName;
      if (certificateCode) params.certificateCode = certificateCode;
      const response = await api.get('/certificates/check/duplicate', { params });
      return response.data.data;
    } catch (error) {
      console.error('Error checking duplicate:', error);
      throw error;
    }
  },

  // Search certificates
  async searchCertificates(query: string, filters?: CertificateFilters): Promise<Certificate[]> {
    try {
      const params: any = { q: query, ...filters };
      const response = await api.get('/certificates/search/query', { params });
      return response.data.data?.data || response.data.data || [];
    } catch (error) {
      console.error('Error searching certificates:', error);
      throw error;
    }
  },

  // Export certificates
  async exportCertificates(format: string = 'json'): Promise<any> {
    try {
      const response = await api.get('/certificates/export/data', { params: { format } });
      return response.data.data;
    } catch (error) {
      console.error('Error exporting certificates:', error);
      throw error;
    }
  },

  // Generate report
  async generateReport(filters?: CertificateFilters): Promise<any> {
    try {
      const response = await api.get('/certificates/reports/generate', { params: filters });
      return response.data.data;
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  },

  // Get certificates by category
  async getCertificatesByCategory(category: string): Promise<Certificate[]> {
    try {
      const response = await api.get(`/certificates/category/${category}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching certificates by category:', error);
      throw error;
    }
  },

  // Get expiring certificates
  async getExpiringCertificates(days: number = 30): Promise<Certificate[]> {
    try {
      const response = await api.get('/certificates/expiring/soon', { 
        params: { days } 
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching expiring certificates:', error);
      throw error;
    }
  },

  // Get certificate summary
  async getCertificateSummary(id: string): Promise<any> {
    try {
      const response = await api.get(`/certificates/${id}/summary`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching certificate summary:', error);
      throw error;
    }
  },

  // Get certificates by tags
  async getCertificatesByTags(tags: string[]): Promise<Certificate[]> {
    try {
      const response = await api.post('/certificates/tags', { tags });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching certificates by tags:', error);
      throw error;
    }
  },

  // ========== USER CERTIFICATE METHODS ==========

  // Get user certificates by department
  async getUserCertificatesByDepartment(departmentId: string, filters: any = {}) {
    try {
      // Ensure departmentId is a string
      const deptId = typeof departmentId === 'string' ? departmentId : 
                     (departmentId as any)?._id || (departmentId as any)?.id || String(departmentId);
      
      if (!deptId || deptId === '[object Object]' || deptId === 'null' || deptId === 'undefined') {
        throw new Error('Department ID không hợp lệ');
      }
      
      console.log('🔍 API call: getUserCertificatesByDepartment', { departmentId: deptId, filters });
      const params: any = { ...filters };
      const response = await api.get(`/certificates/user-certificates/department/${deptId}`, { params });
      console.log('✅ API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching user certificates by department:', error);
      throw error;
    }
  },

  // Get all user certificates
  async getUserCertificates(filters: any = {}) {
    try {
      const params: any = { ...filters };
      const response = await api.get('/certificates/user-certificates/list', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching user certificates:', error);
      throw error;
    }
  },

  // Assign certificate to users
  async assignCertificate(assignmentData: {
    userIds: string[];
    certificateInfo: {
      certificateName: string;
      certificateCode?: string;
      description?: string;
      category?: string;
      issuingAuthority: string;
      certificateNumber?: string;
      issueDate?: string;
      expiryDate?: string;
    };
  }): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const response = await api.post('/certificates/user-certificates/assign', assignmentData);
      return response.data;
    } catch (error: any) {
      console.error('Error assigning certificate:', error);
      throw error;
    }
  },

  // Get users by department for assignment
  async getUsersByDepartment(departmentId: string) {
    try {
      // Ensure departmentId is a string
      const deptId = typeof departmentId === 'string' ? departmentId : 
                     (departmentId as any)?._id || (departmentId as any)?.id || String(departmentId);
      
      if (!deptId || deptId === '[object Object]' || deptId === 'null' || deptId === 'undefined') {
        throw new Error('Department ID không hợp lệ');
      }
      
      console.log('🔍 API call: getUsersByDepartment', { departmentId: deptId });
      const response = await api.get(`/certificates/users/department/${deptId}`);
      console.log('✅ API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching users by department:', error);
      throw error;
    }
  },

  // Update user certificate
  async updateUserCertificate(id: string, updateData: any) {
    try {
      const response = await api.put(`/certificates/user-certificates/${id}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating user certificate:', error);
      throw error;
    }
  },

  // Delete user certificate (unassign)
  async deleteUserCertificate(id: string) {
    try {
      const response = await api.delete(`/certificates/user-certificates/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting user certificate:', error);
      throw error;
    }
  }
};

export default certificateService;
