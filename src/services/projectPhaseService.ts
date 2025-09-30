import { api } from './api';

export interface ProjectPhase {
  _id: string;
  project_id: string;
  phase_name: string;
  description?: string;
  phase_order: number;
  planned_start_date: string;
  planned_end_date: string;
  actual_start_date?: string;
  actual_end_date?: string;
  planned_budget: number;
  actual_cost: number;
  progress_percentage: number;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateProjectPhaseData {
  project_id: string;
  phase_name: string;
  description?: string;
  phase_order: number;
  planned_start_date: string;
  planned_end_date: string;
  planned_budget?: number;
}

export interface UpdateProjectPhaseData extends Partial<CreateProjectPhaseData> {
  actual_start_date?: string;
  actual_end_date?: string;
  actual_cost?: number;
  progress_percentage?: number;
  status?: string;
  is_active?: boolean;
}

class ProjectPhaseService {
  // Get all phases for a project
  async getProjectPhases(projectId: string): Promise<ProjectPhase[]> {
    const response = await api.get(`/project-phases/project/${projectId}/phases`);
    return response.data.data;
  }

  // Get phase by ID
  async getPhaseById(id: string): Promise<ProjectPhase> {
    const response = await api.get(`/project-phases/phases/${id}`);
    return response.data.data;
  }

  // Create new phase
  async createPhase(data: CreateProjectPhaseData): Promise<ProjectPhase> {
    const response = await api.post('/project-phases/phases', data);
    return response.data.data;
  }

  // Update phase
  async updatePhase(id: string, data: UpdateProjectPhaseData): Promise<ProjectPhase> {
    const response = await api.put(`/project-phases/phases/${id}`, data);
    return response.data.data;
  }

  // Delete phase
  async deletePhase(id: string): Promise<void> {
    await api.delete(`/project-phases/phases/${id}`);
  }

  // Update phase progress
  async updatePhaseProgress(id: string, progress: number): Promise<ProjectPhase> {
    const response = await api.put(`/project-phases/phases/${id}/progress`, { progress });
    return response.data.data;
  }

  // Get phase statistics
  async getPhaseStats(id: string): Promise<any> {
    const response = await api.get(`/project-phases/phases/${id}/stats`);
    return response.data.data;
  }

  // Get phase timeline
  async getPhaseTimeline(id: string): Promise<any> {
    const response = await api.get(`/project-phases/phases/${id}/timeline`);
    return response.data.data;
  }

  // Bulk create phases
  async bulkCreatePhases(phases: CreateProjectPhaseData[]): Promise<ProjectPhase[]> {
    const response = await api.post('/project-phases/bulk-create', { phases });
    return response.data.data;
  }

  // Bulk update phases
  async bulkUpdatePhases(updates: { id: string; data: UpdateProjectPhaseData }[]): Promise<ProjectPhase[]> {
    const response = await api.put('/project-phases/bulk-update', { updates });
    return response.data.data;
  }

  // Reorder phases
  async reorderPhases(projectId: string, phaseOrders: { id: string; order: number }[]): Promise<ProjectPhase[]> {
    const response = await api.put(`/project-phases/project/${projectId}/reorder`, { phaseOrders });
    return response.data.data;
  }
}

export default new ProjectPhaseService();