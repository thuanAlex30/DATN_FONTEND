export interface QualityCheckpoint {
  id: string;
  task_id: string;
  checkpoint_name: string;
  quality_criteria: string;
  checkpoint_type: 'INSPECTION' | 'TEST' | 'REVIEW' | 'AUDIT' | 'VALIDATION';
  status: 'PLANNED' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  inspector_id: string;
  scheduled_date?: string;
  actual_date?: string;
  passed: boolean;
  notes?: string;
  issues_found?: string[];
  corrective_actions?: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateCheckpointData {
  task_id: string;
  checkpoint_name: string;
  quality_criteria: string;
  checkpoint_type: 'INSPECTION' | 'TEST' | 'REVIEW' | 'AUDIT' | 'VALIDATION';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  inspector_id: string;
  scheduled_date?: string;
}

export interface UpdateCheckpointData {
  checkpoint_name?: string;
  quality_criteria?: string;
  checkpoint_type?: 'INSPECTION' | 'TEST' | 'REVIEW' | 'AUDIT' | 'VALIDATION';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  inspector_id?: string;
  scheduled_date?: string;
  status?: 'PLANNED' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  actual_date?: string;
  passed?: boolean;
  notes?: string;
  issues_found?: string[];
  corrective_actions?: string[];
}

export interface CheckpointStats {
  total_checkpoints: number;
  completed_checkpoints: number;
  passed_checkpoints: number;
  failed_checkpoints: number;
  overdue_checkpoints: number;
  scheduled_checkpoints: number;
  pass_rate: number;
  average_completion_time: number;
}