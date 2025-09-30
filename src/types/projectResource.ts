export interface ProjectResource {
  id: string;
  project_id: string;
  resource_name: string;
  resource_type: 'HUMAN' | 'EQUIPMENT' | 'MATERIAL' | 'FACILITY' | 'TECHNOLOGY';
  description?: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  availability_start: string;
  availability_end: string;
  status: 'AVAILABLE' | 'ALLOCATED' | 'UNAVAILABLE' | 'MAINTENANCE';
  created_at: string;
  updated_at: string;
}

export interface ResourceAllocation {
  id: string;
  resource_id: string;
  project_id: string;
  allocated_quantity: number;
  allocation_start: string;
  allocation_end: string;
  allocated_by: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateResourceData {
  project_id: string;
  resource_name: string;
  resource_type: 'HUMAN' | 'EQUIPMENT' | 'MATERIAL' | 'FACILITY' | 'TECHNOLOGY';
  description?: string;
  quantity: number;
  unit_cost: number;
  availability_start: string;
  availability_end: string;
}

export interface UpdateResourceData {
  resource_name?: string;
  resource_type?: 'HUMAN' | 'EQUIPMENT' | 'MATERIAL' | 'FACILITY' | 'TECHNOLOGY';
  description?: string;
  quantity?: number;
  unit_cost?: number;
  availability_start?: string;
  availability_end?: string;
  status?: 'AVAILABLE' | 'ALLOCATED' | 'UNAVAILABLE' | 'MAINTENANCE';
}

export interface CreateAllocationData {
  resource_id: string;
  project_id: string;
  allocated_quantity: number;
  allocation_start: string;
  allocation_end: string;
  notes?: string;
}

export interface UpdateAllocationData {
  allocated_quantity?: number;
  allocation_start?: string;
  allocation_end?: string;
  status?: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
}

export interface ResourceStats {
  total_resources: number;
  allocated_resources: number;
  available_resources: number;
  total_cost: number;
  allocated_cost: number;
  utilization_rate: number;
}

export interface ResourceAvailability {
  resource_id: string;
  resource_name: string;
  available_quantity: number;
  allocated_quantity: number;
  availability_percentage: number;
  next_available_date?: string;
}