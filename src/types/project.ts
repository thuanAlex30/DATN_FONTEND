// Project Management Types
export interface ProjectLeader {
  id: string;
  full_name: string;
  email: string;
  phone: string;
}

export interface ProjectSite {
  _id: string;
  site_name: string;
  address: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  contact_person?: string;
  contact_phone?: string;
  contact_email?: string;
}

export interface TeamMember {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role_in_project: string;
  start_date: string;
  end_date?: string;
  status: 'active' | 'inactive' | 'completed';
  responsibilities?: string;
}

export interface Project {
  id: string;
  project_name: string;
  description: string;
  status: 'PLANNING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'ON_HOLD';
  start_date: string;
  end_date: string;
  progress: number;
  budget?: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  leader_id: ProjectLeader;
  site_id: ProjectSite;
  assignments?: TeamMember[];
  created_at: string;
  updated_at: string;
}

export interface ProjectStats {
  total: number;
  active: number;
  completed: number;
  pending: number;
  cancelled: number;
}

export interface ProjectFilters {
  status?: string;
  priority?: string;
  site_id?: string;
  leader_id?: string;
  search?: string;
  start_date_from?: string;
  start_date_to?: string;
  end_date_from?: string;
  end_date_to?: string;
}

export interface ProjectAssignment {
  id: string;
  project_id: string;
  user_id: ProjectLeader;
  role_in_project: string;
  start_date: string;
  end_date?: string;
  status: 'active' | 'inactive' | 'completed';
  responsibilities?: string;
  created_at: string;
  updated_at: string;
}

export interface Site {
  id: string;
  site_name: string;
  address: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  description?: string;
  contact_person?: string;
  contact_phone?: string;
  contact_email?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProjectTimeline {
  project: Project;
  assignments: ProjectAssignment[];
  timeline: {
    start_date: string;
    end_date: string;
    current_progress: number;
    status: string;
  };
}

export interface CreateProjectData {
  project_name: string;
  description: string;
  start_date: string;
  end_date: string;
  status?: 'PLANNING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'ON_HOLD';
  leader_id: string;
  site_name: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

export interface UpdateProjectData {
  project_name?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  status?: 'pending' | 'active' | 'completed' | 'cancelled';
  leader_id?: string;
  site_name?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  progress?: number;
}

export interface CreateSiteData {
  site_name: string;
  address: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  description?: string;
  contact_person?: string;
  contact_phone?: string;
  contact_email?: string;
}

export interface UpdateSiteData {
  site_name?: string;
  address?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  description?: string;
  contact_person?: string;
  contact_phone?: string;
  contact_email?: string;
  is_active?: boolean;
}

export interface CreateAssignmentData {
  project_id: string;
  user_id: string;
  role_in_project: string;
  start_date: string;
  end_date?: string;
  responsibilities?: string;
}

export interface UpdateAssignmentData {
  role_in_project?: string;
  start_date?: string;
  end_date?: string;
  status?: 'active' | 'inactive' | 'completed';
  responsibilities?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
  error?: string;
}
