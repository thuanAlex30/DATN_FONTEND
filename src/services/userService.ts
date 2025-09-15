import api from './api';
import type { User, UserQuery, UserCreate, UserUpdate } from '../types/user';

const userService = {
  getUsers: (params: UserQuery) => api.get<User[]>('/users', { params }),
  getAllUsers: () => api.get<User[]>('/users/all'),
  getUserStats: () => api.get('/users/stats'),
  getUserById: (id: string) => api.get<User>(`/users/${id}`),
  createUser: (data: UserCreate) => api.post<User>('/users', data),
  updateUser: (id: string, data: UserUpdate) => api.put<User>(`/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/users/${id}`),
  resetPassword: (id: string) => api.post(`/users/${id}/reset-password`),
  toggleStatus: (id: string) => api.patch(`/users/${id}/toggle-status`),
};

export default userService;
