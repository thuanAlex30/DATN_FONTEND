import api from './api';
import type { 
  CreateTaskData, 
  UpdateTaskData,
  CreateAssignmentData,
  UpdateAssignmentData,
  CreateDependencyData,
  CreateProgressLogData,
  ProjectTask
} from '../types/projectTask';

const API_BASE = '/project-tasks';

export const projectTaskService = {
  // Get all tasks for a project
  getProjectTasks: async (projectId: string) => {
    try {
      const response = await api.get(`${API_BASE}/tasks/project`, {
        params: { project_id: projectId }
      });
      return { data: response.data.data || [], success: true };
    } catch (error) {
      console.error('Error fetching project tasks:', error);
      return { data: [], success: false, message: 'Failed to fetch project tasks' };
    }
  },

  // Get all tasks for a phase
  getPhaseTasks: async (phaseId: string) => {
    try {
      const response = await api.get(`${API_BASE}/tasks`, {
        params: { phase_id: phaseId }
      });
      return { data: response.data.data || [], success: true };
    } catch (error) {
      console.error('Error fetching phase tasks:', error);
      return { data: [], success: false, message: 'Failed to fetch phase tasks' };
    }
  },

  // Get task by ID
  getTaskById: async (id: string) => {
    try {
      const response = await api.get(`${API_BASE}/tasks/${id}`);
      return { data: response.data.data, success: true };
    } catch (error) {
      console.error('Error fetching task:', error);
      return { data: null, success: false, message: 'Task not found' };
    }
  },

  // Create new task
  createTask: async (data: CreateTaskData) => {
    try {
      const response = await api.post(`${API_BASE}/tasks`, data);
      return { data: response.data.data, success: true };
    } catch (error) {
      console.error('Error creating task:', error);
      return { data: null, success: false, message: 'Failed to create task' };
    }
  },

  // Update task
  updateTask: async (id: string, data: UpdateTaskData) => {
    try {
      const response = await api.put(`${API_BASE}/tasks/${id}`, data);
      return { data: response.data.data, success: true };
    } catch (error) {
      console.error('Error updating task:', error);
      return { data: null, success: false, message: 'Failed to update task' };
    }
  },

  // Delete task
  deleteTask: async (id: string) => {
    try {
      const response = await api.delete(`${API_BASE}/tasks/${id}`);
      return { data: response.data.data, success: true };
    } catch (error) {
      console.error('Error deleting task:', error);
      return { data: null, success: false, message: 'Failed to delete task' };
    }
  },

  // Update task progress
  updateTaskProgress: async (id: string, progress: number, notes?: string) => {
    try {
      const response = await api.put(`${API_BASE}/tasks/${id}/progress`, { progress, notes });
      return { data: response.data.data, success: true };
    } catch (error) {
      console.error('Error updating task progress:', error);
      return { data: null, success: false, message: 'Failed to update task progress' };
    }
  },

  // Get task assignments
  getTaskAssignments: async (taskId: string) => {
    try {
      const response = await api.get(`${API_BASE}/tasks/${taskId}/assignments`);
      return { data: response.data.data || [], success: true };
    } catch (error) {
      console.error('Error fetching task assignments:', error);
      return { data: [], success: false, message: 'Failed to fetch task assignments' };
    }
  },

  // Add task assignment
  addTaskAssignment: async (taskId: string, data: CreateAssignmentData) => {
    try {
      const response = await api.post(`${API_BASE}/tasks/${taskId}/assignments`, data);
      return { data: response.data.data, success: true };
    } catch (error) {
      console.error('Error adding task assignment:', error);
      return { data: null, success: false, message: 'Failed to add task assignment' };
    }
  },

  // Update task assignment
  updateTaskAssignment: async (assignmentId: string, data: UpdateAssignmentData) => {
    try {
      const response = await api.put(`${API_BASE}/assignments/${assignmentId}`, data);
      return { data: response.data.data, success: true };
    } catch (error) {
      console.error('Error updating task assignment:', error);
      return { data: null, success: false, message: 'Failed to update task assignment' };
    }
  },

  // Remove task assignment
  removeTaskAssignment: async (assignmentId: string) => {
    try {
      const response = await api.delete(`${API_BASE}/assignments/${assignmentId}`);
      return { data: response.data.data, success: true };
    } catch (error) {
      console.error('Error removing task assignment:', error);
      return { data: null, success: false, message: 'Failed to remove task assignment' };
    }
  },

  // Get task dependencies
  getTaskDependencies: async (taskId: string) => {
    try {
      const response = await api.get(`${API_BASE}/tasks/${taskId}/dependencies`);
      return { data: response.data.data || [], success: true };
    } catch (error) {
      console.error('Error fetching task dependencies:', error);
      return { data: [], success: false, message: 'Failed to fetch task dependencies' };
    }
  },

  // Add task dependency
  addTaskDependency: async (data: CreateDependencyData) => {
    try {
      const response = await api.post(`${API_BASE}/dependencies`, data);
      return { data: response.data.data, success: true };
    } catch (error) {
      console.error('Error adding task dependency:', error);
      return { data: null, success: false, message: 'Failed to add task dependency' };
    }
  },

  // Remove task dependency
  removeTaskDependency: async (dependencyId: string) => {
    try {
      const response = await api.delete(`${API_BASE}/dependencies/${dependencyId}`);
      return { data: response.data.data, success: true };
    } catch (error) {
      console.error('Error removing task dependency:', error);
      return { data: null, success: false, message: 'Failed to remove task dependency' };
    }
  },

  // Get task progress logs
  getTaskProgressLogs: async (taskId: string) => {
    try {
      const response = await api.get(`${API_BASE}/tasks/${taskId}/progress-logs`);
      return { data: response.data.data || [], success: true };
    } catch (error) {
      console.error('Error fetching task progress logs:', error);
      return { data: [], success: false, message: 'Failed to fetch task progress logs' };
    }
  },

  // Add progress log
  addProgressLog: async (taskId: string, data: CreateProgressLogData) => {
    try {
      const response = await api.post(`${API_BASE}/tasks/${taskId}/progress-logs`, data);
      return { data: response.data.data, success: true };
    } catch (error) {
      console.error('Error adding progress log:', error);
      return { data: null, success: false, message: 'Failed to add progress log' };
    }
  },

  // Get task statistics
  getTaskStats: async (taskId: string) => {
    try {
      const response = await api.get(`${API_BASE}/tasks/${taskId}/stats`);
      return { data: response.data.data, success: true };
    } catch (error) {
      console.error('Error fetching task stats:', error);
      return { data: null, success: false, message: 'Failed to fetch task stats' };
    }
  },

  // Get all tasks
  getAllTasks: async (): Promise<{ data: ProjectTask[]; success: boolean; message?: string }> => {
    try {
      const response = await api.get(`${API_BASE}/tasks`);
      return { data: response.data.data || [], success: true };
    } catch (error) {
      console.error('Error fetching all tasks:', error);
      return { data: [], success: false, message: 'Failed to fetch all tasks' };
    }
  },

  // Get tasks assigned to a specific user - Updated to use projectId parameter
  getAssignedTasks: async (userId: string, projectId?: string): Promise<{ data: ProjectTask[]; success: boolean; message?: string }> => {
    try {
      let endpoint = `${API_BASE}/tasks/assigned/${userId}`;
      if (projectId) {
        endpoint = `${API_BASE}/project/${projectId}/tasks/assigned/${userId}`;
      }
      const response = await api.get(endpoint);
      return { data: response.data.data || [], success: true };
    } catch (error) {
      console.error('Error fetching assigned tasks:', error);
      return { data: [], success: false, message: 'Failed to fetch assigned tasks' };
    }
  },

  // Assign task responsible
  assignTaskResponsible: async (taskId: string, responsibleId: string): Promise<{ data: ProjectTask | null; success: boolean; message?: string }> => {
    try {
      const response = await api.put(`${API_BASE}/tasks/${taskId}/responsible`, { responsible_id: responsibleId });
      return { data: response.data.data || null, success: true };
    } catch (error) {
      console.error('Error assigning task responsible:', error);
      return { data: null, success: false, message: 'Failed to assign task responsible' };
    }
  },

  // Remove task responsible
  removeTaskResponsible: async (taskId: string): Promise<{ data: ProjectTask | null; success: boolean; message?: string }> => {
    try {
      const response = await api.put(`${API_BASE}/tasks/${taskId}/responsible`, { responsible_id: null });
      return { data: response.data.data || null, success: true };
    } catch (error) {
      console.error('Error removing task responsible:', error);
      return { data: null, success: false, message: 'Failed to remove task responsible' };
    }
  }
};

export default projectTaskService;