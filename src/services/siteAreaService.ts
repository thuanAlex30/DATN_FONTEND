import { api } from './api';

export interface SiteArea {
  _id: string;
  site_id: string;
  area_code: string;
  area_name: string;
  area_type: 'CONSTRUCTION' | 'STORAGE' | 'OFFICE' | 'SAFETY' | 'EQUIPMENT' | 'MEETING' | 'REST';
  description?: string;
  area_size_sqm: number;
  safety_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  supervisor_id: string;
  supervisor?: {
    _id: string;
    full_name: string;
    email: string;
  };
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  capacity: number;
  special_requirements?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateSiteAreaData {
  site_id: string;
  area_code: string;
  area_name: string;
  area_type: string;
  description?: string;
  area_size_sqm: number;
  safety_level: string;
  supervisor_id: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  capacity?: number;
  special_requirements?: string;
}

export interface UpdateSiteAreaData extends Partial<CreateSiteAreaData> {
  is_active?: boolean;
}

class SiteAreaService {
  // Get all areas for a site
  async getSiteAreas(siteId: string): Promise<SiteArea[]> {
    const response = await api.get(`/site-areas/site/${siteId}/areas`);
    return response.data.data;
  }

  // Get area by ID
  async getAreaById(id: string): Promise<SiteArea> {
    const response = await api.get(`/site-areas/areas/${id}`);
    return response.data.data;
  }

  // Create new area
  async createArea(data: CreateSiteAreaData): Promise<SiteArea> {
    const response = await api.post('/site-areas/areas', data);
    return response.data.data;
  }

  // Update area
  async updateArea(id: string, data: UpdateSiteAreaData): Promise<SiteArea> {
    const response = await api.put(`/site-areas/areas/${id}`, data);
    return response.data.data;
  }

  // Delete area
  async deleteArea(id: string): Promise<void> {
    await api.delete(`/site-areas/areas/${id}`);
  }

  // Get all areas with filters (requires project_id)
  async getAllAreas(filters: {
    project_id: string;
    site_id?: string;
    search?: string;
    is_active?: boolean;
    area_type?: string;
    safety_level?: string;
  }): Promise<SiteArea[]> {
    const response = await api.get('/site-areas/areas', { params: filters });
    return response.data.data;
  }

  // Search areas
  async searchAreas(query: string, filters?: {
    site_id?: string;
    is_active?: boolean;
  }): Promise<SiteArea[]> {
    const response = await api.get('/site-areas/areas/search', {
      params: { q: query, ...filters }
    });
    return response.data.data;
  }

  // Get area hierarchy for a site
  async getAreaHierarchy(siteId: string): Promise<any> {
    const response = await api.get(`/site-areas/site/${siteId}/hierarchy`);
    return response.data.data;
  }

  // Get area map data for a site
  async getAreaMap(siteId: string): Promise<any> {
    const response = await api.get(`/site-areas/site/${siteId}/map`);
    return response.data.data;
  }

  // Get area options for dropdowns
  async getAreaOptions(siteId: string): Promise<{ value: string; label: string }[]> {
    const response = await api.get(`/site-areas/site/${siteId}/options`);
    return response.data.data;
  }

  // Bulk create areas
  async bulkCreateAreas(areas: CreateSiteAreaData[]): Promise<SiteArea[]> {
    const response = await api.post('/site-areas/areas/bulk', { areas });
    return response.data.data;
  }

  // Bulk update areas
  async bulkUpdateAreas(updates: { id: string; data: UpdateSiteAreaData }[]): Promise<SiteArea[]> {
    const response = await api.put('/site-areas/areas/bulk', { updates });
    return response.data.data;
  }

  // Bulk delete areas
  async bulkDeleteAreas(ids: string[]): Promise<void> {
    await api.delete('/site-areas/areas/bulk', { data: { ids } });
  }

  // Get area statistics
  async getAreaStats(siteId: string): Promise<any> {
    const response = await api.get(`/site-areas/site/${siteId}/stats`);
    return response.data.data;
  }

  // Get areas by project
  async getAreasByProject(projectId: string): Promise<SiteArea[]> {
    const response = await api.get(`/site-areas/projects/${projectId}/areas`);
    return response.data.data;
  }
}

export default new SiteAreaService();