import { api } from './api';

export interface WorkLocation {
  _id: string;
  area_id: string;
  area?: {
    _id: string;
    area_name: string;
    area_code: string;
  };
  location_code: string;
  location_name: string;
  location_type: 'WORKSTATION' | 'EQUIPMENT_AREA' | 'MEETING_POINT' | 'STORAGE' | 'SAFETY_ZONE' | 'REST_AREA';
  coordinates_within_area?: {
    x: number;
    y: number;
    z: number;
  };
  access_requirements?: string;
  capacity: number;
  safety_equipment_required: {
    equipment_name: string;
    is_mandatory: boolean;
  }[];
  special_instructions?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateWorkLocationData {
  area_id: string;
  location_code: string;
  location_name: string;
  location_type: string;
  coordinates_within_area?: {
    x: number;
    y: number;
    z: number;
  };
  access_requirements?: string;
  capacity?: number;
  safety_equipment_required?: {
    equipment_name: string;
    is_mandatory: boolean;
  }[];
  special_instructions?: string;
}

export interface UpdateWorkLocationData extends Partial<CreateWorkLocationData> {
  is_active?: boolean;
}

class WorkLocationService {
  // Get all locations
  async getAllLocations(): Promise<{ data: WorkLocation[] }> {
    const response = await api.get('/work-locations/locations');
    return response.data;
  }

  // Get all locations for an area
  async getAreaLocations(areaId: string): Promise<WorkLocation[]> {
    const response = await api.get(`/work-locations/area/${areaId}/locations`);
    return response.data.data;
  }

  // Get location by ID
  async getLocationById(id: string): Promise<WorkLocation> {
    const response = await api.get(`/work-locations/locations/${id}`);
    return response.data.data;
  }

  // Create new location
  async createLocation(data: CreateWorkLocationData): Promise<WorkLocation> {
    const response = await api.post('/work-locations/locations', data);
    return response.data.data;
  }

  // Update location
  async updateLocation(id: string, data: UpdateWorkLocationData): Promise<WorkLocation> {
    const response = await api.put(`/work-locations/locations/${id}`, data);
    return response.data.data;
  }

  // Delete location
  async deleteLocation(id: string): Promise<void> {
    await api.delete(`/work-locations/locations/${id}`);
  }

  // Get location assignments
  async getLocationAssignments(locationId: string): Promise<any[]> {
    const response = await api.get(`/work-locations/locations/${locationId}/assignments`);
    return response.data.data;
  }

  // Add location assignment
  async addLocationAssignment(locationId: string, data: any): Promise<any> {
    const response = await api.post(`/work-locations/locations/${locationId}/assignments`, data);
    return response.data.data;
  }

  // Update location assignment
  async updateLocationAssignment(assignmentId: string, data: any): Promise<any> {
    const response = await api.put(`/work-locations/location-assignments/${assignmentId}`, data);
    return response.data.data;
  }

  // Remove location assignment
  async removeLocationAssignment(assignmentId: string): Promise<void> {
    await api.delete(`/work-locations/location-assignments/${assignmentId}`);
  }

  // Get location availability
  async getLocationAvailability(locationId: string): Promise<any> {
    const response = await api.get(`/work-locations/locations/${locationId}/availability`);
    return response.data.data;
  }

  // Get location statistics
  async getLocationStats(locationId: string): Promise<any> {
    const response = await api.get(`/work-locations/locations/${locationId}/stats`);
    return response.data.data;
  }
}

export default new WorkLocationService();