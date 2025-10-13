import { api } from '../config/axios';

// Types
export interface PPECategory {
  id: string;
  category_name: string;
  description: string;
  lifespan_months?: number;
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
  reorder_level: number;
  quantity_available: number;
  quantity_allocated: number;
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
  issued_date: string;
  expected_return_date: string;
  issued_by: string | {
    id: string;
    full_name: string;
  };
  status: 'issued' | 'returned' | 'overdue' | 'damaged' | 'replacement_needed';
  actual_return_date?: string;
  return_condition?: 'good' | 'damaged' | 'worn';
  return_notes?: string;
  report_type?: 'damage' | 'replacement' | 'lost';
  report_description?: string;
  report_severity?: 'low' | 'medium' | 'high';
  reported_date?: string;
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

export const createPPECategory = async (data: Partial<PPECategory>): Promise<PPECategory> => {
  const response = await api.post('/ppe/categories', data);
  return response.data.data;
};

export const updatePPECategory = async (id: string, data: Partial<PPECategory>): Promise<PPECategory> => {
  const response = await api.put(`/ppe/categories/${id}`, data);
  return response.data.data;
};

export const deletePPECategory = async (id: string): Promise<void> => {
  await api.delete(`/ppe/categories/${id}`);
};

// PPE Items API
export const getPPEItems = async (): Promise<PPEItem[]> => {
  const response = await api.get('/ppe/items');
  return response.data.data;
};

export const getPPEItemById = async (id: string): Promise<PPEItem> => {
  const response = await api.get(`/ppe/items/${id}`);
  return response.data.data;
};

export const createPPEItem = async (data: CreateItemData): Promise<PPEItem> => {
  const response = await api.post('/ppe/items', data);
  return response.data.data;
};

export const updatePPEItem = async (id: string, data: Partial<CreateItemData>): Promise<PPEItem> => {
  const response = await api.put(`/ppe/items/${id}`, data);
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
export const getAllUsers = async (): Promise<any[]> => {
  const response = await api.get('/ppe/users');
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