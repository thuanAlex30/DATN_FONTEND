import { api } from './api';

export interface ProjectMilestone {
  _id: string;
  project_id: string;
  phase_id: string;
  phase?: {
    _id: string;
    phase_name: string;
  };
  milestone_name: string;
  description?: string;
  planned_date: string;
  actual_date?: string;
  milestone_type: 'PHASE_COMPLETION' | 'DELIVERY' | 'APPROVAL' | 'REVIEW' | 'CHECKPOINT';
  completion_criteria: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE' | 'CANCELLED';
  responsible_user_id: string;
  responsible_user?: {
    _id: string;
    full_name: string;
    email: string;
  };
  is_critical: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateProjectMilestoneData {
  project_id: string;
  phase_id: string;
  milestone_name: string;
  description?: string;
  planned_date: string;
  milestone_type: string;
  completion_criteria: string;
  responsible_user_id: string;
  is_critical?: boolean;
}

export interface UpdateProjectMilestoneData extends Partial<CreateProjectMilestoneData> {
  actual_date?: string;
  status?: string;
}

class ProjectMilestoneService {
  // Get all milestones for a project
  async getProjectMilestones(projectId: string): Promise<ProjectMilestone[]> {
    const response = await api.get(`/project-milestones/project/${projectId}/milestones`);
    return response.data.data;
  }

  // Get milestone by ID
  async getMilestoneById(id: string): Promise<ProjectMilestone> {
    const response = await api.get(`/project-milestones/milestones/${id}`);
    return response.data.data;
  }

  // Create new milestone
  async createMilestone(data: CreateProjectMilestoneData): Promise<ProjectMilestone> {
    const response = await api.post('/project-milestones/milestones', data);
    return response.data.data;
  }

  // Update milestone
  async updateMilestone(id: string, data: UpdateProjectMilestoneData): Promise<ProjectMilestone> {
    const response = await api.put(`/project-milestones/milestones/${id}`, data);
    return response.data.data;
  }

  // Delete milestone
  async deleteMilestone(id: string): Promise<void> {
    await api.delete(`/project-milestones/milestones/${id}`);
  }

  // Mark milestone as completed
  async completeMilestone(id: string, actualDate?: string): Promise<ProjectMilestone> {
    const response = await api.put(`/project-milestones/milestones/${id}/complete`, { actual_date: actualDate });
    return response.data.data;
  }

  // Get milestone deliverables
  async getMilestoneDeliverables(milestoneId: string): Promise<any[]> {
    const response = await api.get(`/project-milestones/milestones/${milestoneId}/deliverables`);
    return response.data.data;
  }

  // Add milestone deliverable
  async addMilestoneDeliverable(milestoneId: string, data: any): Promise<any> {
    const response = await api.post(`/project-milestones/milestones/${milestoneId}/deliverables`, data);
    return response.data.data;
  }

  // Update milestone deliverable
  async updateMilestoneDeliverable(deliverableId: string, data: any): Promise<any> {
    const response = await api.put(`/project-milestones/deliverables/${deliverableId}`, data);
    return response.data.data;
  }

  // Submit deliverable for review
  async submitDeliverable(deliverableId: string): Promise<any> {
    const response = await api.put(`/project-milestones/deliverables/${deliverableId}/submit`);
    return response.data.data;
  }

  // Approve/reject deliverable
  async reviewDeliverable(deliverableId: string, decision: 'APPROVED' | 'REJECTED', comments?: string): Promise<any> {
    const response = await api.put(`/project-milestones/deliverables/${deliverableId}/review`, {
      decision,
      comments
    });
    return response.data.data;
  }

  // Get milestone statistics
  async getMilestoneStats(milestoneId: string): Promise<any> {
    const response = await api.get(`/project-milestones/milestones/${milestoneId}/stats`);
    return response.data.data;
  }

  // Bulk create milestones
  async bulkCreateMilestones(milestones: CreateProjectMilestoneData[]): Promise<ProjectMilestone[]> {
    const response = await api.post('/project-milestones/bulk-create', { milestones });
    return response.data.data;
  }

  // Bulk update milestones
  async bulkUpdateMilestones(updates: { id: string; data: UpdateProjectMilestoneData }[]): Promise<ProjectMilestone[]> {
    const response = await api.put('/project-milestones/bulk-update', { updates });
    return response.data.data;
  }
}

export default new ProjectMilestoneService();