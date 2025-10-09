import api from './api';

export interface Site {
  _id: string;
  project_id: string;
  site_name: string;
  address: string;
  coordinates?: {
    latitude?: number;
    longitude?: number;
  };
  description?: string;
  contact_person?: string;
  contact_phone?: string;
  contact_email?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateSiteRequest {
  project_id: string;
  site_name: string;
  address: string;
  coordinates?: {
    latitude?: number;
    longitude?: number;
  };
  description?: string;
  contact_person?: string;
  contact_phone?: string;
  contact_email?: string;
}

export interface UpdateSiteRequest extends Partial<CreateSiteRequest> {
  is_active?: boolean;
}

export interface SiteFilters {
  project_id: string;
  search?: string;
  is_active?: boolean;
  page?: number;
  limit?: number;
}

class SiteService {
  // Get all sites for a project
  async getSites(filters: SiteFilters): Promise<{
    success: boolean;
    data?: {
      sites: Site[];
      pagination: {
        current: number;
        pages: number;
        total: number;
      };
    };
    message?: string;
    statusCode?: number;
  }> {
    try {
      const params = new URLSearchParams();
      
      // Required project_id
      params.append('project_id', filters.project_id);
      
      if (filters.search) {
        params.append('search', filters.search);
      }
      
      if (filters.is_active !== undefined) {
        params.append('is_active', filters.is_active.toString());
      }
      
      if (filters.page) {
        params.append('page', filters.page.toString());
      }
      
      if (filters.limit) {
        params.append('limit', filters.limit.toString());
      }

      const response = await api.get(`/sites?${params.toString()}`);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
        statusCode: response.status
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch sites',
        statusCode: error.response?.status || 500
      };
    }
  }

  // Get site by ID
  async getSiteById(id: string): Promise<{
    success: boolean;
    data?: Site;
    message?: string;
    statusCode?: number;
  }> {
    try {
      const response = await api.get(`/sites/${id}`);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
        statusCode: response.status
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch site',
        statusCode: error.response?.status || 500
      };
    }
  }

  // Create new site
  async createSite(siteData: CreateSiteRequest): Promise<{
    success: boolean;
    data?: Site;
    message?: string;
    statusCode?: number;
  }> {
    try {
      const response = await api.post('/sites', siteData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
        statusCode: response.status
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create site',
        statusCode: error.response?.status || 500
      };
    }
  }

  // Update site
  async updateSite(id: string, siteData: UpdateSiteRequest): Promise<{
    success: boolean;
    data?: Site;
    message?: string;
    statusCode?: number;
  }> {
    try {
      const response = await api.put(`/sites/${id}`, siteData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
        statusCode: response.status
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update site',
        statusCode: error.response?.status || 500
      };
    }
  }

  // Delete site
  async deleteSite(id: string): Promise<{
    success: boolean;
    message?: string;
    statusCode?: number;
  }> {
    try {
      const response = await api.delete(`/sites/${id}`);
      return {
        success: true,
        message: response.data.message,
        statusCode: response.status
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete site',
        statusCode: error.response?.status || 500
      };
    }
  }

  // Toggle site status
  async toggleSiteStatus(id: string, isActive: boolean): Promise<{
    success: boolean;
    data?: Site;
    message?: string;
    statusCode?: number;
  }> {
    try {
      const response = await api.patch(`/sites/${id}/status`, { is_active: isActive });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
        statusCode: response.status
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to toggle site status',
        statusCode: error.response?.status || 500
      };
    }
  }

  // Get site statistics
  async getSiteStats(id: string): Promise<{
    success: boolean;
    data?: {
      site_id: string;
      site_name: string;
      total_areas: number;
      active_areas: number;
      inactive_areas: number;
      created_at: string;
      last_updated: string;
    };
    message?: string;
    statusCode?: number;
  }> {
    try {
      const response = await api.get(`/sites/${id}/stats`);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
        statusCode: response.status
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch site statistics',
        statusCode: error.response?.status || 500
      };
    }
  }
}

export default new SiteService();


