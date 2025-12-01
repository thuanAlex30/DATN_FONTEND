import { api } from '../config/axios';

const incidentService = {
  // List incidents
  getIncidents: (project_id?: string) => {
    const params = project_id ? { project_id } : {};
    return api.get('/incidents', { params });
  },

  // Get incidents by project
  getIncidentsByProject: (project_id: string) => api.get('/incidents', { params: { project_id } }),

  // Get incident details
  getIncidentById: (id: string) => api.get(`/incidents/${id}`),

  // Get incident statistics
  getIncidentStats: () => api.get('/incidents/stats/overview'),

  // Search incidents
  searchIncidents: (query: string) => api.get('/incidents/search/query', { params: { q: query } }),

  // Get incidents by user
  getIncidentsByUser: (userId: string) => api.get(`/incidents/user/${userId}`),

  // Get incidents by project ID
  getIncidentsByProjectId: (projectId: string) => api.get(`/incidents/project/${projectId}`),

  // Get incidents by status
  getIncidentsByStatus: (status: string) => api.get(`/incidents/status/${status}`),

  // Get incidents by severity
  getIncidentsBySeverity: (severity: string) => api.get(`/incidents/severity/${severity}`),

  // Employee - report new incident
  reportIncident: (data: {
    title: string;
    description?: string;
    images?: string[];
    location?: string;
    severity?: 'nhẹ' | 'nặng' | 'rất nghiêm trọng';
    project_id?: string;
  }) => api.post('/incidents/report', data),

  // Admin - classify incident
  classifyIncident: (id: string, data: { severity: 'nhẹ' | 'nặng' | 'rất nghiêm trọng' }) =>
    api.put(`/incidents/classify/${id}`, data),

  // Admin - assign responsible user
  assignIncident: (id: string, data: { assignedTo: string }) =>
    api.put(`/incidents/assign/${id}`, data),

  // Admin - investigate and solve
  investigateIncident: (id: string, data: { investigation: string; solution: string }) =>
    api.put(`/incidents/investigate/${id}`, data),

  // Admin - update progress
  updateIncidentProgress: (id: string, data: { progress: string }) =>
    api.put(`/incidents/progress/${id}`, data),

  // Admin - close incident
  closeIncident: (id: string) => api.put(`/incidents/close/${id}`),

  // Admin - update incident
  updateIncident: (id: string, data: any) => api.put(`/incidents/${id}`, data),

  // Admin - delete incident
  deleteIncident: (id: string) => api.delete(`/incidents/${id}`),

  // Department Header - escalate incident
  escalateIncident: (id: string, data: { 
    escalation_level: 'SITE' | 'DEPARTMENT' | 'COMPANY' | 'EXTERNAL';
    reason: string;
  }) => api.post(`/incidents/${id}/escalate`, data),

  // Get incident escalations
  getIncidentEscalations: (id: string) => api.get(`/incidents/${id}/escalations`),
};

export default incidentService;
