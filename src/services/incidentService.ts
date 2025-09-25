import api from './api';

const incidentService = {
  // List incidents
  getIncidents: () => api.get('/incidents'),

  // Get incident details
  getIncidentById: (id: string) => api.get(`/incidents/${id}`),

  // Employee - report new incident
  reportIncident: (data: {
    title: string;
    description?: string;
    images?: string[];
    location?: string;
    severity?: 'nhẹ' | 'nặng' | 'rất nghiêm trọng';
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
};

export default incidentService;
