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

export interface CreateSiteData {
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

export interface UpdateSiteData extends Partial<CreateSiteData> {
  is_active?: boolean;
}

export interface SiteStats {
  site_id: string;
  site_name: string;
  total_areas: number;
  active_areas: number;
  inactive_areas: number;
  created_at: string;
  last_updated: string;
}
