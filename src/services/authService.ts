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
  getProfile: () => api.get<UserProfile>('/auth/profile'),
  updateProfile: (data: Partial<UserProfile>) => api.put('/auth/profile', data),
  changePassword: (data: ChangePasswordRequest) => api.post('/auth/change-password', data),
};

export default authService;
