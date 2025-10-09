import api from './api';
import type { 
  CreateTaskData, 
  UpdateTaskData,
  CreateAssignmentData,
  UpdateAssignmentData,
  CreateDependencyData,
  CreateProgressLogData
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
      // Placeholder - will be implemented when backend adds project-tasks API
      return { data: null, success: false, message: 'Task not found' };
    } catch (error) {
      console.error('Error fetching task:', error);
      return { data: null, success: false, message: 'Task not found' };
    }
  },

  // Create new task
  createTask: async (data: CreateTaskData) => {
    try {
      // Placeholder - will be implemented when backend adds project-tasks API
      return { data: null, success: false, message: 'Task creation not available yet' };
    } catch (error) {
      console.error('Error creating task:', error);
      return { data: null, success: false, message: 'Failed to create task' };
    }
  },

  // Update task
  updateTask: async (id: string, data: UpdateTaskData) => {
    try {
      // Placeholder - will be implemented when backend adds project-tasks API
      return { data: null, success: false, message: 'Task update not available yet' };
    } catch (error) {
      console.error('Error updating task:', error);
      return { data: null, success: false, message: 'Failed to update task' };
    }
  },

  // Delete task
  deleteTask: async (id: string) => {
    try {
      // Placeholder - will be implemented when backend adds project-tasks API
      return { data: null, success: false, message: 'Task deletion not available yet' };
    } catch (error) {
      console.error('Error deleting task:', error);
      return { data: null, success: false, message: 'Failed to delete task' };
    }
  },

  // Update task progress
  updateTaskProgress: async (id: string, progress: number, notes?: string) => {
    try {
      // Placeholder - will be implemented when backend adds project-tasks API
      return { data: null, success: false, message: 'Task progress update not available yet' };
    } catch (error) {
      console.error('Error updating task progress:', error);
      return { data: null, success: false, message: 'Failed to update task progress' };
    }
  },

  // Get task assignments
  getTaskAssignments: async (taskId: string) => {
    try {
      // Placeholder - will be implemented when backend adds project-tasks API
      return { data: [], success: true };
    } catch (error) {
      console.error('Error fetching task assignments:', error);
      return { data: [], success: true };
    }
  },

  // Add task assignment
  addTaskAssignment: async (taskId: string, data: CreateAssignmentData) => {
    try {
      // Placeholder - will be implemented when backend adds project-tasks API
      return { data: null, success: false, message: 'Task assignment not available yet' };
    } catch (error) {
      console.error('Error adding task assignment:', error);
      return { data: null, success: false, message: 'Failed to add task assignment' };
    }
  },

  // Update task assignment
  updateTaskAssignment: async (assignmentId: string, data: UpdateAssignmentData) => {
    try {
      // Placeholder - will be implemented when backend adds project-tasks API
      return { data: null, success: false, message: 'Task assignment update not available yet' };
    } catch (error) {
      console.error('Error updating task assignment:', error);
      return { data: null, success: false, message: 'Failed to update task assignment' };
    }
  },

  // Remove task assignment
  removeTaskAssignment: async (assignmentId: string) => {
    try {
      // Placeholder - will be implemented when backend adds project-tasks API
      return { data: null, success: false, message: 'Task assignment removal not available yet' };
    } catch (error) {
      console.error('Error removing task assignment:', error);
      return { data: null, success: false, message: 'Failed to remove task assignment' };
    }
  },

  // Get task dependencies
  getTaskDependencies: async (taskId: string) => {
    try {
      // Placeholder - will be implemented when backend adds project-tasks API
      return { data: [], success: true };
    } catch (error) {
      console.error('Error fetching task dependencies:', error);
      return { data: [], success: true };
    }
  },

  // Add task dependency
  addTaskDependency: async (data: CreateDependencyData) => {
    try {
      // Placeholder - will be implemented when backend adds project-tasks API
      return { data: null, success: false, message: 'Task dependency not available yet' };
    } catch (error) {
      console.error('Error adding task dependency:', error);
      return { data: null, success: false, message: 'Failed to add task dependency' };
    }
  },

  // Remove task dependency
  removeTaskDependency: async (dependencyId: string) => {
    try {
      // Placeholder - will be implemented when backend adds project-tasks API
      return { data: null, success: false, message: 'Task dependency removal not available yet' };
    } catch (error) {
      console.error('Error removing task dependency:', error);
      return { data: null, success: false, message: 'Failed to remove task dependency' };
    }
  },

  // Get task progress logs
  getTaskProgressLogs: async (taskId: string) => {
    try {
      // Placeholder - will be implemented when backend adds project-tasks API
      return { data: [], success: true };
    } catch (error) {
      console.error('Error fetching task progress logs:', error);
      return { data: [], success: true };
    }
  },

  // Add progress log
  addProgressLog: async (taskId: string, data: CreateProgressLogData) => {
    try {
      // Placeholder - will be implemented when backend adds project-tasks API
      return { data: null, success: false, message: 'Progress log not available yet' };
    } catch (error) {
      console.error('Error adding progress log:', error);
      return { data: null, success: false, message: 'Failed to add progress log' };
    }
  },

  // Get task statistics
  getTaskStats: async (taskId: string) => {
    try {
      // Placeholder - will be implemented when backend adds project-tasks API
      return { data: null, success: false, message: 'Task stats not available yet' };
    } catch (error) {
      console.error('Error fetching task stats:', error);
      return { data: null, success: false, message: 'Failed to fetch task stats' };
    }
  }
};

export default projectTaskService;