import api from './api';
import type {
    Department,
    DepartmentCreate,
    DepartmentUpdate,
    DepartmentQuery,
    DepartmentOption,
} from '../types/department';

const departmentService = {
  getStats: () => api.get('/departments/stats'),
  getOptions: () => api.get<DepartmentOption[]>('/departments/options'),
  search: (params: DepartmentQuery) => api.get<Department[]>('/departments/search', { params }),
  getActiveDepartments: () => api.get<Department[]>('/departments/active'),
  bulkDelete: (ids: string[]) => api.post('/departments/bulk-delete', { ids }),
  transferEmployees: (fromId: string, toId: string) =>
    api.post('/departments/transfer-employees', { fromDepartmentId: fromId, toDepartmentId: toId }),
  getAll: (params: DepartmentQuery) => api.get<Department[]>('/departments', { params }),
  getById: (id: string) => api.get<Department>(`/departments/${id}`),
  getSummary: (id: string) => api.get(`/departments/${id}/summary`),
  create: (data: DepartmentCreate) => api.post<Department>('/departments', data),
  update: (id: string, data: DepartmentUpdate) => api.put<Department>(`/departments/${id}`, data),
  delete: (id: string) => api.delete(`/departments/${id}`),
};

export default departmentService;
