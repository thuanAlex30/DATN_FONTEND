export interface Incident {
  _id?: string;
  id?: string;
  incidentId?: string;
  title: string;
  description?: string;
  images?: string[];
  location?: string;
  severity?: 'nhẹ' | 'nặng' | 'rất nghiêm trọng' | string;
  status?: 'Mới ghi nhận' | 'Đang xử lý' | 'Đã đóng' | string;
  assignedTo?: {
    _id?: string;
    full_name?: string;
    username?: string;
    email?: string;
  };
  createdBy?: {
    _id?: string;
    full_name?: string;
    username?: string;
    email?: string;
  };
  notified?: boolean;
  histories?: IncidentHistory[];
  createdAt?: string;
  updatedAt?: string;
  tenant_id?: string;
}

export interface IncidentHistory {
  _id?: string;
  action: string;
  note?: string;
  performedBy?: {
    _id?: string;
    full_name?: string;
    username?: string;
  };
  timestamp: string;
}

export interface IncidentStats {
  total: number;
  inProgress?: number;
  resolved?: number;
  critical?: number;
  byStatus?: {
    'Mới ghi nhận'?: number;
    'Đang xử lý'?: number;
    'Đã đóng'?: number;
  };
  bySeverity?: {
    'nhẹ'?: number;
    'nặng'?: number;
    'rất nghiêm trọng'?: number;
  };
}
