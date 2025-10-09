import api from './api';
import type { 
  ProjectStatusReport,
  CreateStatusReportData, 
  UpdateStatusReportData
} from '../types/projectStatusReport';

const API_BASE = '/project-status-reports';

// Mapping helpers (Admin two-way)
const mapOverallStatusFromBackend = (status?: string): string => {
  const s = (status || '').toUpperCase();
  if (s === 'AT_RISK') return 'at_risk';
  if (s === 'BEHIND_SCHEDULE') return 'behind_schedule';
  if (s === 'COMPLETED') return 'completed';
  return 'on_track';
};

const mapOverallStatusToBackend = (status?: string): string => {
  switch (status) {
    case 'at_risk': return 'AT_RISK';
    case 'behind_schedule': return 'BEHIND_SCHEDULE';
    case 'completed': return 'COMPLETED';
    case 'on_track':
    default: return 'ON_TRACK';
  }
};

const fromBackend = (b: any): ProjectStatusReport => ({
  id: b.id || b._id,
  project_id: b.project_id?.id || b.project_id || '',
  week_number: b.week_number ?? b.week ?? 0,
  report_date: b.report_date || b.created_at,
  reported_by: b.reported_by?.id || b.reported_by || '',
  overall_status: mapOverallStatusFromBackend(b.overall_status || b.status),
  progress_percentage: b.progress_percentage ?? b.progress ?? 0,
  completed_work: b.completed_work,
  planned_work: b.planned_work,
  issues_risks: b.issues_risks,
  notes: b.notes,
  created_at: b.created_at,
  updated_at: b.updated_at
});

const toBackend = (f: Partial<ProjectStatusReport> | CreateStatusReportData | UpdateStatusReportData) => ({
  project_id: (f as any).project_id,
  week_number: (f as any).week_number,
  report_date: (f as any).report_date,
  reported_by: (f as any).reported_by,
  overall_status: mapOverallStatusToBackend((f as any).overall_status),
  progress_percentage: (f as any).progress_percentage,
  completed_work: (f as any).completed_work,
  planned_work: (f as any).planned_work,
  issues_risks: (f as any).issues_risks,
  notes: (f as any).notes,
});

export const projectStatusReportService = {
  // Get all status reports for a project
  getProjectStatusReports: async (projectId: string) => {
    try {
      const response = await api.get(`${API_BASE}/project/${projectId}/status-reports`);
      const payload = response.data;
      const items = Array.isArray(payload?.data) ? payload.data.map(fromBackend) : [];
      return { ...payload, data: items };
    } catch (error) {
      console.error('Error fetching project status reports:', error);
      throw error;
    }
  },

  // Get status report by ID
  getStatusReportById: async (id: string) => {
    try {
      const response = await api.get(`${API_BASE}/status-reports/${id}`);
      const payload = response.data;
      return { ...payload, data: payload?.data ? fromBackend(payload.data) : null };
    } catch (error) {
      console.error('Error fetching status report:', error);
      throw error;
    }
  },

  // Create new status report
  createStatusReport: async (data: CreateStatusReportData) => {
    try {
      const response = await api.post(`${API_BASE}/status-reports`, toBackend(data));
      const payload = response.data;
      return { ...payload, data: payload?.data ? fromBackend(payload.data) : null };
    } catch (error) {
      console.error('Error creating status report:', error);
      throw error;
    }
  },

  // Update status report
  updateStatusReport: async (id: string, data: UpdateStatusReportData) => {
    try {
      const response = await api.put(`${API_BASE}/status-reports/${id}`, toBackend(data));
      const payload = response.data;
      return { ...payload, data: payload?.data ? fromBackend(payload.data) : null };
    } catch (error) {
      console.error('Error updating status report:', error);
      throw error;
    }
  },

  // Delete status report
  deleteStatusReport: async (id: string) => {
    try {
      const response = await api.delete(`${API_BASE}/status-reports/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting status report:', error);
      throw error;
    }
  },

  // Get latest status report for a project
  getLatestStatusReport: async (projectId: string) => {
    try {
      const response = await api.get(`${API_BASE}/project/${projectId}/status-reports/latest`);
      const payload = response.data;
      return { ...payload, data: payload?.data ? fromBackend(payload.data) : null };
    } catch (error) {
      console.error('Error fetching latest status report:', error);
      throw error;
    }
  },

  // Get status report statistics
  getStatusReportStats: async () => {
    try {
      const response = await api.get(`${API_BASE}/status-reports/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching status report stats:', error);
      throw error;
    }
  },

  // Generate status report template
  getStatusReportTemplate: async () => {
    try {
      const response = await api.get(`${API_BASE}/status-reports/template`);
      return response.data;
    } catch (error) {
      console.error('Error fetching status report template:', error);
      throw error;
    }
  }
};

export default projectStatusReportService;