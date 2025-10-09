export interface SiteArea {
  _id: string;
  site_id: string;
  area_code: string;
  area_name: string;
  area_type: 'CONSTRUCTION' | 'STORAGE' | 'OFFICE' | 'SAFETY' | 'EQUIPMENT' | 'MEETING' | 'REST';
  area_size_sqm: number;
  safety_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description?: string;
  supervisor_id?: string;
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

export interface AreaAccessControl {
  id: string;
  area_id: string;
  access_type: 'PUBLIC' | 'RESTRICTED' | 'AUTHORIZED_ONLY' | 'EMERGENCY_ONLY';
  required_permissions: string[];
  access_hours: string;
  max_capacity?: number;
  safety_requirements: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AreaSafetyChecklist {
  id: string;
  area_id: string;
  checklist_name: string;
  checklist_type: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
  items: SafetyChecklistItem[];
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface SafetyChecklistItem {
  id: string;
  item_name: string;
  item_description: string;
  is_required: boolean;
  item_order: number;
}

export interface AreaInspection {
  id: string;
  area_id: string;
  inspection_type: 'SAFETY' | 'QUALITY' | 'COMPLIANCE' | 'MAINTENANCE';
  inspector_id: string;
  inspection_date: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  findings: InspectionFinding[];
  recommendations: string[];
  overall_rating: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'CRITICAL';
  created_at: string;
  updated_at: string;
}

export interface InspectionFinding {
  id: string;
  finding_type: 'SAFETY_HAZARD' | 'QUALITY_ISSUE' | 'COMPLIANCE_VIOLATION' | 'MAINTENANCE_NEEDED';
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  assigned_to?: string;
  due_date?: string;
  resolution_notes?: string;
}

export interface CreateAreaData {
  site_id: string;
  area_code: string;
  area_name: string;
  area_type: 'CONSTRUCTION' | 'STORAGE' | 'OFFICE' | 'SAFETY' | 'EQUIPMENT' | 'MEETING' | 'REST';
  area_size_sqm: number;
  safety_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description?: string;
  supervisor_id?: string;
  capacity?: number;
  special_requirements?: string;
}

export interface UpdateAreaData {
  area_code?: string;
  area_name?: string;
  area_type?: 'CONSTRUCTION' | 'STORAGE' | 'OFFICE' | 'SAFETY' | 'EQUIPMENT' | 'MEETING' | 'REST';
  area_size_sqm?: number;
  safety_level?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description?: string;
  supervisor_id?: string;
  capacity?: number;
  special_requirements?: string;
  is_active?: boolean;
}

export interface CreateAccessControlData {
  area_id: string;
  access_type: 'PUBLIC' | 'RESTRICTED' | 'AUTHORIZED_ONLY' | 'EMERGENCY_ONLY';
  required_permissions: string[];
  access_hours: string;
  max_capacity?: number;
  safety_requirements: string[];
}

export interface UpdateAccessControlData {
  access_type?: 'PUBLIC' | 'RESTRICTED' | 'AUTHORIZED_ONLY' | 'EMERGENCY_ONLY';
  required_permissions?: string[];
  access_hours?: string;
  max_capacity?: number;
  safety_requirements?: string[];
  is_active?: boolean;
}

export interface CreateSafetyChecklistData {
  area_id: string;
  checklist_name: string;
  checklist_type: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
  items: Omit<SafetyChecklistItem, 'id'>[];
}

export interface CreateInspectionData {
  area_id: string;
  inspection_type: 'SAFETY' | 'QUALITY' | 'COMPLIANCE' | 'MAINTENANCE';
  inspector_id: string;
  inspection_date: string;
}

export interface UpdateInspectionData {
  inspection_type?: 'SAFETY' | 'QUALITY' | 'COMPLIANCE' | 'MAINTENANCE';
  inspector_id?: string;
  inspection_date?: string;
  status?: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  findings?: InspectionFinding[];
  recommendations?: string[];
  overall_rating?: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'CRITICAL';
}

export interface AreaStats {
  total_areas: number;
  active_areas: number;
  construction_areas: number;
  storage_areas: number;
  office_areas: number;
  high_safety_areas: number;
  critical_safety_areas: number;
  total_inspections: number;
  pending_inspections: number;
  overdue_inspections: number;
}