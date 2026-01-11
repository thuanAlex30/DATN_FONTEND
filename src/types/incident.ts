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
  // Thời gian xử lý
  estimatedCompletionTime?: string | Date; // Thời gian dự kiến hoàn thành
  actualStartTime?: string | Date; // Thời gian bắt đầu xử lý thực tế
  actualCompletionTime?: string | Date; // Thời gian hoàn thành thực tế
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
  // Minh chứng - Evidence
  evidenceImages?: string[]; // Hình ảnh minh chứng (tổng quát)
  findingsImages?: string[]; // Hình ảnh minh chứng cho action "Điều tra" (backward compatible)
  evidenceType?: 'photo' | 'document' | 'video' | 'other'; // Loại minh chứng
  evidenceDescription?: string; // Mô tả về minh chứng
}

// Interface cho conflict error response (deprecated - giữ lại cho backward compatibility)
export interface LocationConflictError {
  hasConflict: boolean;
  conflictingIncidents?: Array<{
    _id: string;
    incidentId: string;
    title: string;
    location: string;
    status: string;
    createdAt: string;
  }>;
}

// Interface cho active incident error response
export interface ActiveIncidentError {
  hasActiveIncident: boolean;
  activeIncident?: {
    _id: string;
    incidentId: string;
    title: string;
    location: string;
    status: string;
    createdAt: string;
    actualStartTime?: string;
    estimatedCompletionTime?: string;
  };
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
