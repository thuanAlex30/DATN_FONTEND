export interface WorkLocation {
  id: string;
  area_id: string;
  location_code: string;
  location_name: string;
  location_type: 'WORKSTATION' | 'EQUIPMENT_AREA' | 'MEETING_POINT' | 'STORAGE' | 'SAFETY_ZONE' | 'ACCESS_POINT';
  coordinates_within_area?: { x: number; y: number; z: number };
  access_requirements: string[];
  capacity?: number;
  safety_equipment_required: string[];
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LocationAssignment {
  id: string;
  location_id: string;
  user_id: string;
  project_id: string;
  work_type: 'CONSTRUCTION' | 'INSPECTION' | 'MAINTENANCE' | 'SUPERVISION' | 'ADMINISTRATION';
  start_time: string;
  end_time: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateLocationData {
  area_id: string;
  location_code: string;
  location_name: string;
  location_type: 'WORKSTATION' | 'EQUIPMENT_AREA' | 'MEETING_POINT' | 'STORAGE' | 'SAFETY_ZONE' | 'ACCESS_POINT';
  coordinates_within_area?: { x: number; y: number; z: number };
  access_requirements: string[];
  capacity?: number;
  safety_equipment_required: string[];
  description?: string;
}

export interface UpdateLocationData {
  location_code?: string;
  location_name?: string;
  location_type?: 'WORKSTATION' | 'EQUIPMENT_AREA' | 'MEETING_POINT' | 'STORAGE' | 'SAFETY_ZONE' | 'ACCESS_POINT';
  coordinates_within_area?: { x: number; y: number; z: number };
  access_requirements?: string[];
  capacity?: number;
  safety_equipment_required?: string[];
  description?: string;
  is_active?: boolean;
}

export interface CreateLocationAssignmentData {
  location_id: string;
  user_id: string;
  project_id: string;
  work_type: 'CONSTRUCTION' | 'INSPECTION' | 'MAINTENANCE' | 'SUPERVISION' | 'ADMINISTRATION';
  start_time: string;
  end_time: string;
  notes?: string;
}

export interface UpdateLocationAssignmentData {
  work_type?: 'CONSTRUCTION' | 'INSPECTION' | 'MAINTENANCE' | 'SUPERVISION' | 'ADMINISTRATION';
  start_time?: string;
  end_time?: string;
  status?: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
}

export interface LocationStats {
  total_locations: number;
  active_locations: number;
  workstation_locations: number;
  equipment_areas: number;
  meeting_points: number;
  storage_locations: number;
  safety_zones: number;
  total_assignments: number;
  active_assignments: number;
  completed_assignments: number;
  utilization_rate: number;
}

export interface LocationAvailability {
  location_id: string;
  location_name: string;
  available_slots: TimeSlot[];
  total_capacity: number;
  current_occupancy: number;
  availability_percentage: number;
}

export interface TimeSlot {
  start_time: string;
  end_time: string;
  is_available: boolean;
  assigned_user?: string;
  work_type?: string;
}