import { api } from './api';

export interface ProjectResource {
  _id: string;
  project_id: string;
  resource_type: 'MATERIAL' | 'EQUIPMENT' | 'TOOL' | 'VEHICLE' | 'PERSONNEL' | 'SUBCONTRACTOR';
  resource_name: string;
  description?: string;
  planned_quantity: number;
  actual_quantity: number;
  unit_cost: number;
  unit_measure: string;
  supplier_id?: string;
  supplier?: {
    _id: string;
    supplier_name: string;
    contact_info: any;
  };
  supplier_name?: string;
  required_date: string;
  delivered_date?: string;
  status: 'PLANNED' | 'ORDERED' | 'DELIVERED' | 'IN_USE' | 'CONSUMED' | 'RETURNED';
  location?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProjectResourceData {
  project_id: string;
  resource_type: string;
  resource_name: string;
  description?: string;
  planned_quantity: number;
  unit_cost: number;
  unit_measure: string;
  supplier_id?: string;
  supplier_name?: string;
  required_date: string;
  location?: string;
  notes?: string;
}

export interface UpdateProjectResourceData extends Partial<CreateProjectResourceData> {
  actual_quantity?: number;
  delivered_date?: string;
  status?: string;
}

export interface ResourceAllocation {
  resource_id: string;
  allocated_quantity: number;
  allocated_date: string;
  allocated_to?: string;
  notes?: string;
}

class ProjectResourceService {
  // Get all resources for a project
  async getProjectResources(projectId: string): Promise<ProjectResource[]> {
    const response = await api.get(`/project-resources/project/${projectId}/resources`);
    return response.data.data;
  }

  // Get resource by ID
  async getResourceById(id: string): Promise<ProjectResource> {
    const response = await api.get(`/project-resources/resources/${id}`);
    return response.data.data;
  }

  // Create new resource
  async createResource(data: CreateProjectResourceData): Promise<ProjectResource> {
    const response = await api.post('/project-resources/resources', data);
    return response.data.data;
  }

  // Update resource
  async updateResource(id: string, data: UpdateProjectResourceData): Promise<ProjectResource> {
    const response = await api.put(`/project-resources/resources/${id}`, data);
    return response.data.data;
  }

  // Delete resource
  async deleteResource(id: string): Promise<void> {
    await api.delete(`/project-resources/resources/${id}`);
  }

  // Get all resources with filters
  async getAllResources(filters?: {
    project_id?: string;
    resource_type?: string;
    status?: string;
    search?: string;
  }): Promise<ProjectResource[]> {
    const response = await api.get('/project-resources/resources', { params: filters });
    return response.data.data;
  }

  // Get resource allocation for project
  async getResourceAllocation(projectId: string): Promise<ResourceAllocation[]> {
    const response = await api.get(`/project-resources/project/${projectId}/allocation`);
    return response.data.data;
  }

  // Update resource allocation
  async updateResourceAllocation(allocationId: string, data: Partial<ResourceAllocation>): Promise<ResourceAllocation> {
    const response = await api.put(`/project-resources/allocation/${allocationId}`, data);
    return response.data.data;
  }

  // Get resource statistics
  async getResourceStats(projectId: string): Promise<any> {
    const response = await api.get(`/project-resources/project/${projectId}/stats`);
    return response.data.data;
  }

  // Search resources
  async searchResources(query: string, filters?: {
    project_id?: string;
    resource_type?: string;
  }): Promise<ProjectResource[]> {
    const response = await api.get('/project-resources/resources/search', {
      params: { q: query, ...filters }
    });
    return response.data.data;
  }

  // Get resource options
  async getResourceOptions(projectId: string): Promise<{ value: string; label: string }[]> {
    const response = await api.get(`/project-resources/project/${projectId}/options`);
    return response.data.data;
  }

  // Bulk create resources
  async bulkCreateResources(resources: CreateProjectResourceData[]): Promise<ProjectResource[]> {
    const response = await api.post('/project-resources/resources/bulk', { resources });
    return response.data.data;
  }

  // Bulk update resources
  async bulkUpdateResources(updates: { id: string; data: UpdateProjectResourceData }[]): Promise<ProjectResource[]> {
    const response = await api.put('/project-resources/resources/bulk', { updates });
    return response.data.data;
  }

  // Bulk delete resources
  async bulkDeleteResources(ids: string[]): Promise<void> {
    await api.delete('/project-resources/resources/bulk', { data: { ids } });
  }
}

export default new ProjectResourceService();