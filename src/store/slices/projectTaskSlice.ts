import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import projectTaskService from '../../services/projectTaskService';
import type { 
  ProjectTask, 
  TaskAssignment,
  TaskDependency,
  TaskProgressLog,
  CreateTaskData, 
  UpdateTaskData,
  CreateAssignmentData,
  CreateDependencyData,
  CreateProgressLogData,
  TaskStats 
} from '../../types/projectTask';

interface ProjectTaskState {
  tasks: ProjectTask[];
  assignments: TaskAssignment[];
  dependencies: TaskDependency[];
  progressLogs: TaskProgressLog[];
  stats: TaskStats | null;
  loading: boolean;
  error: string | null;
  selectedTask: ProjectTask | null;
}

const initialState: ProjectTaskState = {
  tasks: [],
  assignments: [],
  dependencies: [],
  progressLogs: [],
  stats: null,
  loading: false,
  error: null,
  selectedTask: null,
};

// Async thunks
export const fetchProjectTasks = createAsyncThunk(
  'projectTask/fetchProjectTasks',
  async (projectId: string) => {
    const response = await projectTaskService.getProjectTasks(projectId);
    return response.data;
  }
);

export const fetchPhaseTasks = createAsyncThunk(
  'projectTask/fetchPhaseTasks',
  async (phaseId: string) => {
    const response = await projectTaskService.getPhaseTasks(phaseId);
    return response.data;
  }
);

export const fetchTaskById = createAsyncThunk(
  'projectTask/fetchTaskById',
  async (id: string) => {
    const response = await projectTaskService.getTaskById(id);
    return response.data;
  }
);

export const createTask = createAsyncThunk(
  'projectTask/createTask',
  async (data: CreateTaskData) => {
    const response = await projectTaskService.createTask(data);
    return response.data;
  }
);

export const updateTask = createAsyncThunk(
  'projectTask/updateTask',
  async ({ id, data }: { id: string; data: UpdateTaskData }) => {
    const response = await projectTaskService.updateTask(id, data);
    return response.data;
  }
);

export const deleteTask = createAsyncThunk(
  'projectTask/deleteTask',
  async (id: string) => {
    await projectTaskService.deleteTask(id);
    return id;
  }
);

export const updateTaskProgress = createAsyncThunk(
  'projectTask/updateTaskProgress',
  async ({ id, progress }: { id: string; progress: number }) => {
    const response = await projectTaskService.updateTaskProgress(id, progress);
    return response.data;
  }
);

export const fetchTaskAssignments = createAsyncThunk(
  'projectTask/fetchTaskAssignments',
  async (taskId: string) => {
    const response = await projectTaskService.getTaskAssignments(taskId);
    return response.data;
  }
);

export const addTaskAssignment = createAsyncThunk(
  'projectTask/addTaskAssignment',
  async ({ taskId, data }: { taskId: string; data: CreateAssignmentData }) => {
    const response = await projectTaskService.addTaskAssignment(taskId, data);
    return response.data;
  }
);

export const updateTaskAssignment = createAsyncThunk(
  'projectTask/updateTaskAssignment',
  async ({ assignmentId, data }: { assignmentId: string; data: Partial<TaskAssignment> }) => {
    const response = await projectTaskService.updateTaskAssignment(assignmentId, data);
    return response.data;
  }
);

export const removeTaskAssignment = createAsyncThunk(
  'projectTask/removeTaskAssignment',
  async (assignmentId: string) => {
    await projectTaskService.removeTaskAssignment(assignmentId);
    return assignmentId;
  }
);

export const fetchTaskDependencies = createAsyncThunk(
  'projectTask/fetchTaskDependencies',
  async (taskId: string) => {
    const response = await projectTaskService.getTaskDependencies(taskId);
    return response.data;
  }
);

export const addTaskDependency = createAsyncThunk(
  'projectTask/addTaskDependency',
  async (data: CreateDependencyData) => {
    const response = await projectTaskService.addTaskDependency(data);
    return response.data;
  }
);

export const removeTaskDependency = createAsyncThunk(
  'projectTask/removeTaskDependency',
  async (dependencyId: string) => {
    await projectTaskService.removeTaskDependency(dependencyId);
    return dependencyId;
  }
);

export const fetchTaskProgressLogs = createAsyncThunk(
  'projectTask/fetchTaskProgressLogs',
  async (taskId: string) => {
    const response = await projectTaskService.getTaskProgressLogs(taskId);
    return response.data;
  }
);

export const addProgressLog = createAsyncThunk(
  'projectTask/addProgressLog',
  async ({ taskId, data }: { taskId: string; data: CreateProgressLogData }) => {
    const response = await projectTaskService.addProgressLog(taskId, data);
    return response.data;
  }
);

export const fetchTaskStats = createAsyncThunk(
  'projectTask/fetchTaskStats',
  async (taskId: string) => {
    const response = await projectTaskService.getTaskStats(taskId);
    return response.data;
  }
);

const projectTaskSlice = createSlice({
  name: 'projectTask',
  initialState,
  reducers: {
    setSelectedTask: (state, action: PayloadAction<ProjectTask | null>) => {
      state.selectedTask = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch project tasks
      .addCase(fetchProjectTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchProjectTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch project tasks';
      })
      
      // Fetch phase tasks
      .addCase(fetchPhaseTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPhaseTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchPhaseTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch tasks';
      })
      
      // Fetch task by ID
      .addCase(fetchTaskById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTaskById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedTask = action.payload;
      })
      .addCase(fetchTaskById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch task';
      })
      
      // Create task
      .addCase(createTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks.push(action.payload);
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create task';
      })
      
      // Update task
      .addCase(updateTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.tasks.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        if (state.selectedTask?.id === action.payload.id) {
          state.selectedTask = action.payload;
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update task';
      })
      
      // Delete task
      .addCase(deleteTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = state.tasks.filter(t => t.id !== action.payload);
        if (state.selectedTask?.id === action.payload) {
          state.selectedTask = null;
        }
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete task';
      })
      
      // Update task progress
      .addCase(updateTaskProgress.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        if (state.selectedTask?.id === action.payload.id) {
          state.selectedTask = action.payload;
        }
      })
      
      // Fetch task assignments
      .addCase(fetchTaskAssignments.fulfilled, (state, action) => {
        state.assignments = action.payload;
      })
      
      // Add task assignment
      .addCase(addTaskAssignment.fulfilled, (state, action) => {
        state.assignments.push(action.payload);
      })
      
      // Update task assignment
      .addCase(updateTaskAssignment.fulfilled, (state, action) => {
        const index = state.assignments.findIndex(a => a.id === action.payload.id);
        if (index !== -1) {
          state.assignments[index] = action.payload;
        }
      })
      
      // Remove task assignment
      .addCase(removeTaskAssignment.fulfilled, (state, action) => {
        state.assignments = state.assignments.filter(a => a.id !== action.payload);
      })
      
      // Fetch task dependencies
      .addCase(fetchTaskDependencies.fulfilled, (state, action) => {
        state.dependencies = action.payload;
      })
      
      // Add task dependency
      .addCase(addTaskDependency.fulfilled, (state, action) => {
        state.dependencies.push(action.payload);
      })
      
      // Remove task dependency
      .addCase(removeTaskDependency.fulfilled, (state, action) => {
        state.dependencies = state.dependencies.filter(d => d.id !== action.payload);
      })
      
      // Fetch task progress logs
      .addCase(fetchTaskProgressLogs.fulfilled, (state, action) => {
        state.progressLogs = action.payload;
      })
      
      // Add progress log
      .addCase(addProgressLog.fulfilled, (state, action) => {
        state.progressLogs.push(action.payload);
      })
      
      // Fetch task stats
      .addCase(fetchTaskStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  },
});

export const { setSelectedTask, clearError } = projectTaskSlice.actions;
export default projectTaskSlice.reducer;
