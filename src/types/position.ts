export interface Position {
  id: string;
  position_name: string;
  level: number;
  department_id?: string;
  is_active: boolean;
}

export interface PositionCreate {
  position_name: string;
  level: number;
  department_id?: string;
}

export interface PositionUpdate {
  position_name?: string;
  level?: number;
  department_id?: string;
  is_active?: boolean;
}

export interface PositionQuery {
  search?: string;
  levels?: number | number[];
  is_active?: string;
  has_employees?: string;
  sort_by?: string;
  sort_order?: string;
  limit?: number;
}
