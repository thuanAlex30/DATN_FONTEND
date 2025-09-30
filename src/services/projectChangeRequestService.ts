import api from './api';
import type { 
  ProjectChangeRequest, 
  CreateChangeRequestData, 
  UpdateChangeRequestData, 
  ChangeRequestStats 
} from '../types/projectChangeRequest';

const API_BASE = '/project-change-requests';

// Mapping helpers: backend <-> frontend field names and enum casing
const mapStatusFromBackend = (status?: string): ProjectChangeRequest['status'] => {
  switch ((status || '').toUpperCase()) {
    case 'PENDING':
      return 'submitted';
    case 'UNDER_REVIEW':
      return 'under_review';
    case 'APPROVED':
      return 'approved';
    case 'REJECTED':
      return 'rejected';
    case 'IMPLEMENTED':
      return 'implemented';
    default:
      return 'submitted';
  }
};

const mapStatusToBackend = (status?: ProjectChangeRequest['status']): string => {
  switch (status) {
    case 'under_review':
      return 'UNDER_REVIEW';
    case 'approved':
      return 'APPROVED';
    case 'rejected':
      return 'REJECTED';
    case 'implemented':
      return 'IMPLEMENTED';
    case 'submitted':
    default:
      return 'PENDING';
  }
};

const mapChangeTypeFromBackend = (type?: string): ProjectChangeRequest['change_type'] => {
  switch ((type || '').toUpperCase()) {
    case 'SCOPE': return 'scope';
    case 'SCHEDULE': return 'schedule';
    case 'BUDGET': return 'budget';
    case 'RESOURCE': return 'resource';
    case 'QUALITY': return 'quality';
    case 'RISK': return 'risk';
    default: return 'scope';
  }
};

const mapChangeTypeToBackend = (type?: ProjectChangeRequest['change_type']): string => {
  return (type || 'scope').toUpperCase();
};

const fromBackend = (b: any): ProjectChangeRequest => ({
  id: b.id || b._id,
  project_id: b.project_id?.id || b.project_id || '',
  change_type: mapChangeTypeFromBackend(b.change_type),
  title: b.change_title,
  description: b.description,
  impact_assessment: b.justification,
  implementation_plan: b.implementation_plan,
  estimated_cost: b.cost_impact,
  estimated_duration_days: b.schedule_impact_days,
  status: mapStatusFromBackend(b.status),
  priority: (b.priority || 'medium').toLowerCase() as any,
  requested_by: b.requested_by?.id || b.requested_by || '',
  reviewed_by: b.reviewed_by?.id || b.reviewed_by,
  approved_by: b.approved_by?.id || b.approved_by,
  submitted_at: b.requested_at,
  reviewed_at: b.reviewed_at,
  approved_at: b.approved_at,
  implemented_at: b.implementation_date,
  created_at: b.created_at,
  updated_at: b.updated_at
});

const toBackend = (f: Partial<ProjectChangeRequest>) => ({
  project_id: f.project_id,
  change_type: mapChangeTypeToBackend(f.change_type),
  change_title: f.title,
  description: f.description,
  justification: f.impact_assessment,
  implementation_plan: f.implementation_plan,
  cost_impact: f.estimated_cost,
  schedule_impact_days: f.estimated_duration_days,
  status: mapStatusToBackend(f.status),
  requested_by: f.requested_by,
  reviewed_by: f.reviewed_by,
  approved_by: f.approved_by,
});

export const projectChangeRequestService = {
  // Get all change requests for a project
  getProjectChangeRequests: async (projectId: string) => {
    try {
      const response = await api.get(`${API_BASE}/project/${projectId}/change-requests`);
      const payload = response.data;
      const items = Array.isArray(payload?.data) ? payload.data.map(fromBackend) : [];
      return { ...payload, data: items };
    } catch (error) {
      console.error('Error fetching project change requests:', error);
      throw error;
    }
  },

  // Get change request by ID
  getChangeRequestById: async (id: string) => {
    try {
      const response = await api.get(`${API_BASE}/change-requests/${id}`);
      const payload = response.data;
      return { ...payload, data: payload?.data ? fromBackend(payload.data) : null };
    } catch (error) {
      console.error('Error fetching change request:', error);
      throw error;
    }
  },

  // Create new change request
  createChangeRequest: async (data: CreateChangeRequestData) => {
    try {
      const response = await api.post(`${API_BASE}/change-requests`, toBackend(data));
      const payload = response.data;
      return { ...payload, data: payload?.data ? fromBackend(payload.data) : null };
    } catch (error) {
      console.error('Error creating change request:', error);
      throw error;
    }
  },

  // Update change request
  updateChangeRequest: async (id: string, data: UpdateChangeRequestData) => {
    try {
      const response = await api.put(`${API_BASE}/change-requests/${id}`, toBackend(data));
      const payload = response.data;
      return { ...payload, data: payload?.data ? fromBackend(payload.data) : null };
    } catch (error) {
      console.error('Error updating change request:', error);
      throw error;
    }
  },

  // Delete change request
  deleteChangeRequest: async (id: string) => {
    try {
      const response = await api.delete(`${API_BASE}/change-requests/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting change request:', error);
      throw error;
    }
  },

  // Submit change request for review
  submitChangeRequest: async (id: string) => {
    try {
      const response = await api.put(`${API_BASE}/change-requests/${id}/submit`);
      return response.data;
    } catch (error) {
      console.error('Error submitting change request:', error);
      throw error;
    }
  },

  // Approve change request
  approveChangeRequest: async (id: string) => {
    try {
      const response = await api.put(`${API_BASE}/change-requests/${id}/approve`);
      return response.data;
    } catch (error) {
      console.error('Error approving change request:', error);
      throw error;
    }
  },

  // Reject change request
  rejectChangeRequest: async (id: string) => {
    try {
      const response = await api.put(`${API_BASE}/change-requests/${id}/reject`);
      return response.data;
    } catch (error) {
      console.error('Error rejecting change request:', error);
      throw error;
    }
  },

  // Implement change request
  implementChangeRequest: async (id: string) => {
    try {
      const response = await api.put(`${API_BASE}/change-requests/${id}/implement`);
      return response.data;
    } catch (error) {
      console.error('Error implementing change request:', error);
      throw error;
    }
  },

  // Get change request statistics
  getChangeRequestStats: async () => {
    try {
      const response = await api.get(`${API_BASE}/change-requests/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching change request stats:', error);
      throw error;
    }
  },

  // Get pending change requests
  getPendingChangeRequests: async () => {
    try {
      const response = await api.get(`${API_BASE}/change-requests/pending`);
      return response.data;
    } catch (error) {
      console.error('Error fetching pending change requests:', error);
      throw error;
    }
  }
};

export default projectChangeRequestService;
