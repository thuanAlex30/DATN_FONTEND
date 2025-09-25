import api from './api';
import type {
    Position,
    PositionCreate,
    PositionUpdate,
    PositionQuery,
} from '../types/position';

const positionService = {
  getStats: () => api.get('/positions/stats'),
  getHierarchy: () => api.get('/positions/hierarchy'),
  getOptions: () => api.get('/positions/options'),
  search: (params: PositionQuery) => api.get<Position[]>('/positions/search', { params }),
  getManagementPositions: (minLevel: number = 7) =>
    api.get('/positions/management', { params: { minLevel } }),
  getGroupedByLevel: () => api.get('/positions/grouped-by-level'),
  getByLevel: (minLevel: number, maxLevel: number) =>
    api.get('/positions/by-level', { params: { minLevel, maxLevel } }),
  getPromotionOptions: (currentLevel: number) =>
    api.get('/positions/promotion-options', { params: { currentLevel } }),
  getByMultipleLevels: (levels: number[]) =>
    api.post('/positions/by-multiple-levels', { levels }),
  clone: (id: string, data: { position_name: string; level?: number }) =>
    api.post(`/positions/${id}/clone`, data),
  bulkDelete: (ids: string[]) => api.post('/positions/bulk-delete', { ids }),
  getAll: (params: PositionQuery) => api.get<Position[]>('/positions', { params }),
  getById: (id: string) => api.get<Position>(`/positions/${id}`),
  create: (data: PositionCreate) => api.post<Position>('/positions', data),
  update: (id: string, data: PositionUpdate) => api.put<Position>(`/positions/${id}`, data),
  delete: (id: string) => api.delete(`/positions/${id}`),
};

export default positionService;
