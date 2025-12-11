import { api } from '../config/axios';

// Types
export interface PPECategory {
  id: string;
  category_name: string;
  description: string;
  lifespan_months?: number;
  image_url?: string;
  createdAt?: string;
  updatedAt?: string;
}


export interface PPEItem {
  id: string;
  category_id: string | PPECategory;
  item_code: string;
  item_name: string;
  brand?: string;
  model?: string;
  status?: 'active' | 'inactive';
  reorder_level: number;
  quantity_available: number;
  quantity_allocated: number;
  image_url?: string;
  total_quantity?: number;
  remaining_quantity?: number;
  actual_allocated_quantity?: number;
  category?: PPECategory; // Additional category info from API
  createdAt: string;
  updatedAt: string;
}

export interface PPEIssuance {
  id: string;
  user_id: string | {
    id: string;
    full_name: string;
    email: string;
    department_id?: {
      department_name: string;
    };
  };
  item_id: string | {
    id: string;
    item_name: string;
    item_code: string;
    category_id: PPECategory;
  };
  quantity: number;
  remaining_quantity?: number;
  issued_date: string;
  expected_return_date: string;
  issued_by: string | {
    id: string;
    full_name: string;
  };
  issuance_level?: 'admin_to_manager' | 'manager_to_employee';
  status: 'pending_confirmation' | 'issued' | 'returned' | 'overdue' | 'damaged' | 'replacement_needed' | 'pending_manager_return';
  actual_return_date?: string;
  return_condition?: 'good' | 'damaged' | 'worn';
  return_notes?: string;
  report_type?: 'damage' | 'replacement' | 'lost';
  report_description?: string;
  report_severity?: 'low' | 'medium' | 'high';
  reported_date?: string;
  confirmed_date?: string;
  confirmation_notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DashboardData {
  totalItems: number;
  totalCategories: number;
  lowStockItems: number;
  overdueIssuances: number;
  totalIssuances: number;
  recentIssuances: PPEIssuance[];
  lowStockAlerts: PPEItem[];
}

export interface CreateItemData {
  category_id: string;
  item_code: string;
  item_name: string;
  brand?: string;
  model?: string;
  reorder_level: number;
  quantity_available: number;
  quantity_allocated?: number;
  imageFile?: File | null;
}

export interface CreateIssuanceData {
  user_id: string;
  item_id: string;
  quantity: number;
  issued_date: string;
  expected_return_date: string;
  issued_by: string;
}

export interface UpdateItemQuantityData {
  quantity_available: number;
  quantity_allocated: number;
}

export interface QuantityStatistics {
  item_id: string;
  item_name: string;
  item_code: string;
  category_name: string;
  total_quantity: number;
  remaining_quantity: number;
  actual_allocated_quantity: number;
  quantity_available: number;
  quantity_allocated: number;
  reorder_level: number;
  stock_status: 'low' | 'good';
}

export interface OverallQuantityStats {
  total_items: number;
  total_quantity: number;
  total_remaining: number;
  total_allocated: number;
  low_stock_items: number;
  out_of_stock_items: number;
}

export interface QuantityStatsResponse {
  items: QuantityStatistics[];
  overall: OverallQuantityStats;
}

export interface UpdateIssuanceData {
  status?: 'issued' | 'returned' | 'overdue' | 'damaged' | 'replacement_needed';
  actual_return_date?: string;
  return_condition?: 'good' | 'damaged' | 'worn';
  return_notes?: string;
  report_type?: 'damage' | 'replacement' | 'lost';
  report_description?: string;
  report_severity?: 'low' | 'medium' | 'high';
  reported_date?: string;
}

export interface ReturnPPEData {
  actual_return_date: string;
  return_condition: 'good' | 'damaged' | 'worn';
  notes: string;
}

export interface ReportPPEData {
  report_type: 'damage' | 'replacement' | 'lost';
  description: string;
  severity: 'low' | 'medium' | 'high';
  reported_date: string;
}

// PPE Categories API
export const getPPECategories = async (): Promise<PPECategory[]> => {
  const response = await api.get('/ppe/categories');
  return response.data.data;
};

export const getPPECategoryById = async (id: string): Promise<PPECategory> => {
  const response = await api.get(`/ppe/categories/${id}`);
  return response.data.data;
};

export const createPPECategory = async (data: Partial<PPECategory> & { imageFile?: File | null }): Promise<PPECategory> => {
  const formData = new FormData();
  if (data.category_name) formData.append('category_name', data.category_name);
  if (data.description !== undefined) formData.append('description', data.description);
  if (data.lifespan_months !== undefined) formData.append('lifespan_months', String(data.lifespan_months));
  if (data.imageFile) formData.append('image', data.imageFile);

  const response = await api.post('/ppe/categories', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data.data;
};

export const updatePPECategory = async (id: string, data: Partial<PPECategory> & { imageFile?: File | null }): Promise<PPECategory> => {
  const formData = new FormData();
  if (data.category_name) formData.append('category_name', data.category_name);
  if (data.description !== undefined) formData.append('description', data.description);
  if (data.lifespan_months !== undefined) formData.append('lifespan_months', String(data.lifespan_months));
  if (data.imageFile) formData.append('image', data.imageFile);

  const response = await api.put(`/ppe/categories/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data.data;
};

export const deletePPECategory = async (id: string): Promise<void> => {
  await api.delete(`/ppe/categories/${id}`);
};

// PPE Items API
export const getPPEItems = async (): Promise<PPEItem[]> => {
  try {
    const response = await api.get('/ppe/items');
    // Handle different response formats
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data && response.data.data) {
      return Array.isArray(response.data.data) ? response.data.data : [];
    } else if (response.data && response.data.items) {
      return Array.isArray(response.data.items) ? response.data.items : [];
    }
    return [];
  } catch (error: any) {
    console.error('Error fetching PPE items:', error);
    // Return empty array on error instead of throwing
    return [];
  }
};

export const getPPEItemById = async (id: string): Promise<PPEItem> => {
  const response = await api.get(`/ppe/items/${id}`);
  return response.data.data;
};

export const createPPEItem = async (data: CreateItemData): Promise<PPEItem> => {
  const formData = new FormData();
  formData.append('category_id', data.category_id);
  formData.append('item_code', data.item_code);
  formData.append('item_name', data.item_name);
  if (data.brand) formData.append('brand', data.brand);
  if (data.model) formData.append('model', data.model);
  formData.append('reorder_level', String(data.reorder_level));
  formData.append('quantity_available', String(data.quantity_available));
  if (data.quantity_allocated !== undefined) {
    formData.append('quantity_allocated', String(data.quantity_allocated));
  }
  if (data.imageFile) formData.append('image', data.imageFile);

  const response = await api.post('/ppe/items', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data.data;
};

export const updatePPEItem = async (id: string, data: Partial<CreateItemData>): Promise<PPEItem> => {
  const formData = new FormData();
  if (data.category_id) formData.append('category_id', data.category_id);
  if (data.item_code) formData.append('item_code', data.item_code);
  if (data.item_name) formData.append('item_name', data.item_name);
  if (data.brand) formData.append('brand', data.brand);
  if (data.model) formData.append('model', data.model);
  if (data.reorder_level !== undefined) formData.append('reorder_level', String(data.reorder_level));
  if (data.quantity_available !== undefined) formData.append('quantity_available', String(data.quantity_available));
  if (data.quantity_allocated !== undefined) formData.append('quantity_allocated', String(data.quantity_allocated));
  if ((data as any).imageFile) formData.append('image', (data as any).imageFile);

  const response = await api.put(`/ppe/items/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data.data;
};

export const deletePPEItem = async (id: string): Promise<void> => {
  await api.delete(`/ppe/items/${id}`);
};

// PPE Items Quantity Management API
export const updatePPEItemQuantity = async (id: string, data: UpdateItemQuantityData): Promise<PPEItem> => {
  const response = await api.put(`/ppe/items/${id}/quantity`, data);
  return response.data.data;
};

// PPE Issuances API
export const getPPEIssuances = async (): Promise<PPEIssuance[]> => {
  const response = await api.get('/ppe/issuances');
  return response.data.data;
};

export const getPPEIssuanceById = async (id: string): Promise<PPEIssuance> => {
  const response = await api.get(`/ppe/issuances/${id}`);
  return response.data.data;
};

export const createPPEIssuance = async (data: CreateIssuanceData): Promise<PPEIssuance> => {
  const response = await api.post('/ppe/issuances', data);
  return response.data.data;
};

export const updatePPEIssuance = async (id: string, data: UpdateIssuanceData): Promise<PPEIssuance> => {
  const response = await api.put(`/ppe/issuances/${id}`, data);
  return response.data.data;
};

export const returnPPEIssuance = async (id: string, data: ReturnPPEData): Promise<PPEIssuance> => {
  const response = await api.post(`/ppe/issuances/${id}/return`, data);
  return response.data.data;
};

// Employee-specific PPE return method
export const returnPPEIssuanceEmployee = async (id: string, data: ReturnPPEData): Promise<PPEIssuance> => {
  const response = await api.post(`/ppe/issuances/${id}/return-employee`, data);
  return response.data.data;
};

// Employee-specific PPE report method
export const reportPPEIssuanceEmployee = async (id: string, data: ReportPPEData): Promise<PPEIssuance> => {
  const response = await api.post(`/ppe/issuances/${id}/report-employee`, data);
  return response.data.data;
};

export const deletePPEIssuance = async (id: string): Promise<void> => {
  await api.delete(`/ppe/issuances/${id}`);
};

// Get PPE issuances for current user (employee)
export const getMyPPEIssuances = async (): Promise<PPEIssuance[]> => {
  const response = await api.get('/ppe/issuances/my');
  return response.data.data;
};

// Get PPE issuances for a specific user
export const getPPEIssuancesByUser = async (userId: string): Promise<PPEIssuance[]> => {
  const response = await api.get(`/ppe/issuances/user/${userId}`);
  return response.data.data;
};

// Get active PPE issuances (not returned)
export const getActivePPEIssuances = async (): Promise<PPEIssuance[]> => {
  const response = await api.get('/ppe/issuances/active');
  return response.data.data;
};

// Get PPE issuances that are expiring soon
export const getExpiringPPEIssuances = async (): Promise<PPEIssuance[]> => {
  const response = await api.get('/ppe/issuances/expiring');
  return response.data.data;
};


// Statistics API
export const getStockStatus = async () => {
  const response = await api.get('/ppe/statistics/stock-status');
  return response.data.data;
};

export const getOverdueIssuances = async () => {
  const response = await api.get('/ppe/statistics/overdue-issuances');
  return response.data.data;
};

export const getLowStockItems = async () => {
  const response = await api.get('/ppe/statistics/low-stock-items');
  return response.data.data;
};

export const getIssuanceStatistics = async () => {
  const response = await api.get('/ppe/statistics/issuance-stats');
  return response.data.data;
};

// Get comprehensive quantity statistics
export const getQuantityStatistics = async (): Promise<QuantityStatsResponse> => {
  const response = await api.get('/ppe/statistics/quantity-stats');
  return response.data.data;
};

// Dashboard API
export const getDashboardData = async (): Promise<DashboardData> => {
  const response = await api.get('/ppe/dashboard');
  return response.data.data;
};

// User API for PPE assignment
export const getAllUsers = async (managerId?: string): Promise<any[]> => {
  const params = managerId ? { managerId } : {};
  const response = await api.get('/ppe/users', { params });
  return response.data.data;
};

// Import categories from Excel
export const importPPECategories = async (file: File): Promise<any> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/ppe/categories/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  
  return response.data;
};

// Import items from Excel
export const importPPEItems = async (file: File): Promise<any> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/ppe/items/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  
  return response.data;
};

// PPE Items Statistics API
export const getPPEItemStats = async (id: string): Promise<any> => {
  const response = await api.get(`/ppe/items/${id}/stats`);
  return response.data.data;
};

// PPE Inventory API
export const getAllInventory = async (): Promise<any[]> => {
  const response = await api.get('/ppe/inventory');
  return response.data.data;
};

export const getInventoryById = async (id: string): Promise<any> => {
  const response = await api.get(`/ppe/inventory/${id}`);
  return response.data.data;
};

export const createInventory = async (data: any): Promise<any> => {
  const response = await api.post('/ppe/inventory', data);
  return response.data.data;
};

export const updateInventory = async (id: string, data: any): Promise<any> => {
  const response = await api.put(`/ppe/inventory/${id}`, data);
  return response.data.data;
};

export const deleteInventory = async (id: string): Promise<void> => {
  await api.delete(`/ppe/inventory/${id}`);
};

export const getInventoryStats = async (): Promise<any> => {
  const response = await api.get('/ppe/inventory/stats');
  return response.data.data;
};

// PPE Assignments API
export const getAllAssignments = async (): Promise<any[]> => {
  const response = await api.get('/ppe/assignments');
  return response.data.data;
};

export const getAssignmentById = async (id: string): Promise<any> => {
  const response = await api.get(`/ppe/assignments/${id}`);
  return response.data.data;
};

export const createAssignment = async (data: any): Promise<any> => {
  const response = await api.post('/ppe/assignments', data);
  return response.data.data;
};

export const updateAssignment = async (id: string, data: any): Promise<any> => {
  const response = await api.put(`/ppe/assignments/${id}`, data);
  return response.data.data;
};

export const deleteAssignment = async (id: string): Promise<void> => {
  await api.delete(`/ppe/assignments/${id}`);
};

export const getUserAssignments = async (userId: string): Promise<any[]> => {
  const response = await api.get(`/ppe/assignments/user/${userId}`);
  return response.data.data;
};

export const returnAssignment = async (id: string, data: any): Promise<any> => {
  const response = await api.post(`/ppe/assignments/${id}/return`, data);
  return response.data.data;
};

// PPE Issuance API
export const createIssuance = async (data: any): Promise<any> => {
  const response = await api.post('/ppe/issuances', data);
  return response.data.data;
};

export const returnIssuance = async (id: string, data: any): Promise<any> => {
  const response = await api.post(`/ppe/issuances/${id}/return`, data);
  return response.data.data;
};

// PPE Maintenance API
export const getAllMaintenance = async (): Promise<any[]> => {
  const response = await api.get('/ppe/maintenance');
  return response.data.data;
};

export const getMaintenanceById = async (id: string): Promise<any> => {
  const response = await api.get(`/ppe/maintenance/${id}`);
  return response.data.data;
};

export const createMaintenance = async (data: any): Promise<any> => {
  const response = await api.post('/ppe/maintenance', data);
  return response.data.data;
};

export const updateMaintenance = async (id: string, data: any): Promise<any> => {
  const response = await api.put(`/ppe/maintenance/${id}`, data);
  return response.data.data;
};

export const deleteMaintenance = async (id: string): Promise<void> => {
  await api.delete(`/ppe/maintenance/${id}`);
};

export const getMaintenanceStats = async (): Promise<any> => {
  const response = await api.get('/ppe/maintenance/stats');
  return response.data.data;
};

// PPE Reports API
export const getInventoryReport = async (): Promise<any> => {
  const response = await api.get('/ppe/reports/inventory');
  return response.data.data;
};

export const getAssignmentReport = async (): Promise<any> => {
  const response = await api.get('/ppe/reports/assignments');
  return response.data.data;
};

export const getMaintenanceReport = async (): Promise<any> => {
  const response = await api.get('/ppe/reports/maintenance');
  return response.data.data;
};

// Dashboard Statistics API
export const getDashboardStats = async (): Promise<any> => {
  const response = await api.get('/ppe/dashboard-stats');
  return response.data.data;
};

// Luồng phân cấp Admin → Manager → Employee

/**
 * Admin phát PPE cho Manager
 */
export const issueToManager = async (issuanceData: {
  user_id: string;
  item_id: string;
  quantity: number;
  issued_date: string;
  expected_return_date: string;
  notes?: string;
}) => {
  try {
    const response = await api.post('/ppe/issuances/to-manager', issuanceData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Lỗi khi phát PPE cho Manager');
  }
};

/**
 * Manager phát PPE cho Employee
 */
export const issueToEmployee = async (issuanceData: {
  user_id: string;
  item_id: string;
  quantity: number;
  issued_date: string;
  expected_return_date: string;
  notes?: string;
}) => {
  try {
    const response = await api.post('/ppe/issuances/to-employee', issuanceData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Lỗi khi phát PPE cho Employee');
  }
};

/**
 * Employee xác nhận nhận PPE từ Manager
 */
export const confirmReceivedPPE = async (issuanceId: string, confirmationData: {
  confirmation_notes?: string;
}) => {
  try {
    const response = await api.post(`/ppe/issuances/${issuanceId}/confirm-received`, confirmationData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Lỗi khi xác nhận nhận PPE');
  }
};

/**
 * Employee trả PPE cho Manager
 */
export const returnToManager = async (issuanceId: string, returnData: {
  actual_return_date: string;
  return_condition: 'good' | 'damaged' | 'worn';
  notes?: string;
}) => {
  try {
    const response = await api.post(`/ppe/issuances/${issuanceId}/return-to-manager`, returnData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Lỗi khi trả PPE cho Manager');
  }
};

/**
 * Manager xác nhận nhận PPE từ Employee
 */
export const confirmEmployeeReturn = async (issuanceId: string) => {
  try {
    const response = await api.post(`/ppe/issuances/${issuanceId}/confirm-employee-return`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Lỗi khi xác nhận nhận PPE từ Employee');
  }
};

/**
 * Manager trả PPE cho Admin
 */
export const returnToAdmin = async (issuanceId: string, returnData: {
  actual_return_date: string;
  return_condition: 'good' | 'damaged' | 'worn';
  quantity?: number;
  notes?: string;
}) => {
  try {
    const response = await api.post(`/ppe/issuances/${issuanceId}/return-to-admin`, returnData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Lỗi khi trả PPE cho Admin');
  }
};

/**
 * Lấy danh sách PPE của Manager
 */
export const getManagerPPE = async () => {
  try {
    const response = await api.get('/ppe/issuances/manager-ppe');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Lỗi khi lấy PPE của Manager');
  }
};

/**
 * Lấy danh sách PPE của Employee
 */
export const getEmployeePPE = async () => {
  try {
    const response = await api.get('/ppe/issuances/employee-ppe');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Lỗi khi lấy PPE của Employee');
  }
};

/**
 * Lấy danh sách PPE của Employees trong department (dành cho manager)
 */
export const getDepartmentEmployeesPPE = async () => {
  try {
    const response = await api.get('/ppe/issuances/department-employees-ppe');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Lỗi khi lấy PPE của Employees trong department');
  }
};

/**
 * Lấy lịch sử PPE của Manager
 */
export const getManagerPPEHistory = async () => {
  try {
    const response = await api.get('/ppe/issuances/manager-history');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Lỗi khi lấy lịch sử PPE của Manager');
  }
};

// ==================== PPE ADVANCED FEATURES ====================

// Types for Advanced Features
export interface PPEItemWithVersion extends PPEItem {
  version: number;
  condition_status?: 'good' | 'damaged' | 'worn' | 'maintenance_required';
}

export interface BatchIssuanceItem {
  user_id: string;
  item_id: string;
  quantity: number;
  expected_return_date: string;
}

export interface BatchIssuance {
  id: string;
  batch_id: string;
  batch_name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  issuance_level: 'admin' | 'manager';
  manager_id?: string;
  items: BatchIssuanceItem[];
  progress: {
    total: number;
    processed: number;
    successful: number;
    failed: number;
  };
  created_at: string;
  processing_started_at?: string;
  processing_completed_at?: string;
  error_summary?: string;
}

export interface PPEExpiryTracking {
  id: string;
  ppe_item_id: string;
  ppe_issuance_id?: string;
  user_id?: string;
  expiry_date: string;
  manufacturing_date: string;
  batch_number: string;
  serial_number: string;
  status: 'active' | 'expiring_soon' | 'expired' | 'replaced' | 'disposed';
  days_until_expiry: number;
  notifications: {
    notify_days_before: number[];
    last_notification_sent?: string;
    notification_status: 'none' | 'sent' | 'acknowledged' | 'dismissed';
  };
  created_at: string;
  updated_at: string;
}

export interface ExpiryReport {
  summary: {
    totalExpiring: number;
    totalExpired: number;
    totalItems: number;
  };
  categoryStats: Record<string, { expiring: number; expired: number }>;
  userStats: Record<string, { expiring: number; expired: number }>;
  expiringItems: PPEExpiryTracking[];
  expiredItems: PPEExpiryTracking[];
}

// ==================== OPTIMISTIC LOCKING APIs ====================

/**
 * Get PPE item with version for optimistic locking
 */
export const getPPEItemWithVersion = async (itemId: string): Promise<PPEItemWithVersion> => {
  const response = await api.get(`/api/ppe-advanced/items/${itemId}/version`);
  return response.data.data;
};

/**
 * Update PPE item quantity with optimistic locking
 */
export const updatePPEItemQuantityWithLocking = async (
  itemId: string, 
  data: {
    quantity: number;
    operation: 'allocate' | 'deallocate' | 'update';
    version: number;
  }
): Promise<PPEItemWithVersion> => {
  const response = await api.put(`/api/ppe-advanced/items/${itemId}/quantity`, data);
  return response.data.data;
};

/**
 * Batch update PPE items with optimistic locking
 */
export const batchUpdatePPEItems = async (data: {
  updates: Array<{
    itemId: string;
    updateData: any;
  }>;
  options?: {
    maxRetries?: number;
    retryDelay?: number;
  };
}): Promise<any> => {
  const response = await api.post('/api/ppe-advanced/items/batch-update', data);
  return response.data.data;
};

// ==================== BATCH OPERATIONS APIs ====================

/**
 * Create batch issuance
 */
export const createBatchIssuance = async (data: {
  batch_name: string;
  issuance_level: 'admin' | 'manager';
  manager_id?: string;
  items: BatchIssuanceItem[];
}): Promise<BatchIssuance> => {
  const response = await api.post('/api/ppe-advanced/batch-issuance', data);
  return response.data.data;
};

/**
 * Get batch issuances
 */
export const getBatchIssuances = async (): Promise<BatchIssuance[]> => {
  const response = await api.get('/api/ppe-advanced/batch-issuance');
  return response.data.data;
};

/**
 * Get batch issuance by ID
 */
export const getBatchIssuanceById = async (batchId: string): Promise<BatchIssuance> => {
  const response = await api.get(`/api/ppe-advanced/batch-issuance/${batchId}`);
  return response.data.data;
};

/**
 * Process batch issuance
 */
export const processBatchIssuance = async (
  batchId: string, 
  options?: { maxConcurrentItems?: number }
): Promise<any> => {
  const response = await api.post(`/api/ppe-advanced/batch-issuance/${batchId}/process`, { options });
  return response.data.data;
};

/**
 * Get batch processing status
 */
export const getBatchProcessingStatus = async (batchId: string): Promise<any> => {
  const response = await api.get(`/api/ppe-advanced/batch-issuance/${batchId}/status`);
  return response.data.data;
};

// ==================== EXPIRY MANAGEMENT APIs ====================

/**
 * Create expiry tracking record
 */
export const createExpiryTracking = async (data: {
  ppe_item_id: string;
  expiry_date: string;
  manufacturing_date: string;
  batch_number: string;
  serial_number: string;
}): Promise<PPEExpiryTracking> => {
  const response = await api.post('/api/ppe-advanced/expiry-tracking', data);
  return response.data.data;
};

/**
 * Auto-create tracking records for PPE item
 */
export const autoCreateExpiryTracking = async (itemId: string): Promise<PPEExpiryTracking[]> => {
  const response = await api.post(`/api/ppe-advanced/items/${itemId}/auto-tracking`);
  return response.data.data;
};

/**
 * Check and send expiry notifications
 */
export const checkExpiryNotifications = async (daysBefore?: number): Promise<any> => {
  const params = daysBefore ? { daysBefore } : {};
  const response = await api.get('/api/ppe-advanced/expiry/check', { params });
  return response.data.data;
};

/**
 * Mark PPE as expired
 */
export const markPPEAsExpired = async (
  trackingId: string, 
  options?: { reason?: string }
): Promise<PPEExpiryTracking> => {
  const response = await api.put(`/api/ppe-advanced/expiry-tracking/${trackingId}/expired`, { options });
  return response.data.data;
};

/**
 * Replace expired PPE
 */
export const replaceExpiredPPE = async (
  trackingId: string, 
  data: {
    replacement_item_id: string;
    expiry_date: string;
    manufacturing_date: string;
    batch_number: string;
    serial_number: string;
    replacement_reason: string;
  }
): Promise<PPEExpiryTracking> => {
  const response = await api.put(`/api/ppe-advanced/expiry-tracking/${trackingId}/replace`, data);
  return response.data.data;
};

/**
 * Dispose expired PPE
 */
export const disposeExpiredPPE = async (
  trackingId: string, 
  data: {
    disposal_method: string;
    disposal_certificate?: string;
  }
): Promise<PPEExpiryTracking> => {
  const response = await api.put(`/api/ppe-advanced/expiry-tracking/${trackingId}/dispose`, data);
  return response.data.data;
};

/**
 * Get expiry report
 */
export const getExpiryReport = async (params?: {
  days?: number;
  status?: string;
}): Promise<ExpiryReport> => {
  const response = await api.get('/api/ppe-advanced/expiry/report', { params });
  return response.data.data;
};

/**
 * Run daily expiry check manually
 */
export const runDailyExpiryCheck = async (): Promise<any> => {
  const response = await api.post('/api/ppe-advanced/expiry/daily-check');
  return response.data.data;
};

// ==================== HEALTH CHECK ====================

/**
 * Check PPE advanced services health
 */
export const checkPPEAdvancedHealth = async (): Promise<any> => {
  const response = await api.get('/api/ppe-advanced/health');
  return response.data.data;
};