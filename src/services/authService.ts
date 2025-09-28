import api from './api';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  UserProfile,
  ChangePasswordRequest,
} from '../types/auth';

const authService = {
  login: (data: LoginRequest) => api.post<LoginResponse>('/auth/login', data),
  register: (data: RegisterRequest) => api.post('/auth/register', data),
  refreshToken: (refreshToken: string) => api.post('/auth/refresh-token', { refreshToken }),
  logout: () => api.post('/auth/logout'),
  me: () => api.get<UserProfile>('/auth/me'),
  getProfile: () => api.get<UserProfile>('/users/profile/me'),
  updateProfile: (data: Partial<UserProfile>) => api.put('/users/profile/me', data),
  changePassword: (data: ChangePasswordRequest) => api.post('/users/profile/change-password', data),
};

export default authService;
