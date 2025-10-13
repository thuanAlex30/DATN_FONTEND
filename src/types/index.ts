// Export all types
export * from './auth';
export * from './department';
export * from './incident';
export * from './position';
export * from './role';

// Explicit re-exports to resolve conflicts
export type { User as TrainingUser } from './training';
export type { User as MainUser } from './user';
export type { CreateAssignmentData as ProjectCreateAssignmentData, UpdateAssignmentData as ProjectUpdateAssignmentData } from './project';
export type { CreateAssignmentData as TaskCreateAssignmentData, UpdateAssignmentData as TaskUpdateAssignmentData } from './projectTask';

// Export specific types to avoid conflicts
export type { 
  Project, 
  CreateProjectData, 
  UpdateProjectData,
  ProjectPhase,
  ProjectMilestone,
  ProjectResource,
  ProjectRisk,
  ProjectTask,
  ProjectStatusReport,
  ProjectChangeRequest,
  QualityCheckpoint
} from './project';

export type { 
  User, 
  UserQuery, 
  CreateUserData, 
  UpdateUserData 
} from './user';

export type { 
  Training, 
  TrainingSession, 
  TrainingRecord,
  CreateTrainingData,
  UpdateTrainingData,
  CreateTrainingSessionData,
  UpdateTrainingSessionData,
  CreateTrainingRecordData,
  UpdateTrainingRecordData
} from './training';

// Project Management Types
export * from './projectChangeRequest';
export * from './projectMilestone';
export * from './projectResource';
export * from './projectRisk';
export * from './qualityCheckpoint';
export * from './projectStatusReport';
export * from './projectTask';
export * from './siteArea';
export * from './workLocation';
