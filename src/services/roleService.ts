import api from './api';
import type { Role, RoleCreate, RoleUpdate, RoleQuery } from '../types/role';

const roleService = {
  getRoles: (params: RoleQuery) => api.get<Role[]>('/roles', { params }),
  getAllActiveRoles: () => api.get<Role[]>('/roles/active'),
  getAllRoles: () => api.get<Role[]>('/roles/all'),
  getRoleStats: () => api.get('/roles/stats'),
  createRole: (data: RoleCreate) => api.post<Role>('/roles', data),
  getRoleById: (id: string) => api.get<Role>(`/roles/${id}`),
  updateRole: (id: string, data: RoleUpdate) => api.put<Role>(`/roles/${id}`, data),
  deleteRole: (id: string) => api.delete(`/roles/${id}`),
  toggleStatus: (id: string) => api.patch(`/roles/${id}/toggle-status`),
};

export default roleService;
