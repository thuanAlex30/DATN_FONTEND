import axios from 'axios';
import type {
  Project,
  ProjectStats,
  ProjectFilters,
  ProjectAssignment,
  Site,
  ProjectTimeline,
  CreateProjectData,
  UpdateProjectData,
  CreateSiteData,
  UpdateSiteData,
  CreateAssignmentData,
  UpdateAssignmentData,
  ApiResponse
} from '../types/project';
import type { User } from '../types/user';

const API_BASE_URL = 'http://localhost:3000/api/v1';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

class ProjectService {
  // ========== PROJECT MANAGEMENT ==========
  async getAllProjects(filters: ProjectFilters = {}): Promise<ApiResponse<Project[]>> {
    try {
      const response = await api.get('/projects', { params: filters });
      return response.data;
    } catch (error: any) {
      console.error('Error getting projects:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi khi lấy danh sách dự án',
        error: error.message
      };
    }
  }

  async getProjectById(id: string): Promise<ApiResponse<Project>> {
    try {
      const response = await api.get(`/projects/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error getting project:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi khi lấy thông tin dự án',
        error: error.message
      };
    }
  }

  async createProject(projectData: CreateProjectData): Promise<ApiResponse<Project>> {
    try {
      const response = await api.post('/projects', projectData);
      return response.data;
    } catch (error: any) {
      console.error('Error creating project:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi khi tạo dự án',
        error: error.message
      };
    }
  }

  async updateProject(id: string, updateData: UpdateProjectData): Promise<ApiResponse<Project>> {
    try {
      const response = await api.put(`/projects/${id}`, updateData);
      return response.data;
    } catch (error: any) {
      console.error('Error updating project:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi khi cập nhật dự án',
        error: error.message
      };
    }
  }

  async deleteProject(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await api.delete(`/projects/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error deleting project:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi khi xóa dự án',
        error: error.message
      };
    }
  }

  async updateProjectProgress(id: string, progress: number): Promise<ApiResponse<Project>> {
    try {
      const response = await api.put(`/projects/${id}/progress`, { progress });
      return response.data;
    } catch (error: any) {
      console.error('Error updating project progress:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi khi cập nhật tiến độ dự án',
        error: error.message
      };
    }
  }

  // ========== PROJECT STATISTICS ==========
  async getProjectStats(): Promise<ApiResponse<ProjectStats>> {
    try {
      const response = await api.get('/projects/stats');
      return response.data;
    } catch (error: any) {
      console.error('Error getting project stats:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi khi lấy thống kê dự án',
        error: error.message
      };
    }
  }

  // ========== PROJECT SEARCH ==========
  async searchProjects(searchTerm: string, filters: ProjectFilters = {}): Promise<ApiResponse<Project[]>> {
    try {
      const response = await api.get('/projects/search', { 
        params: { q: searchTerm, ...filters } 
      });
      return response.data;
    } catch (error: any) {
      console.error('Error searching projects:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi khi tìm kiếm dự án',
        error: error.message
      };
    }
  }

  // ========== PROJECT ASSIGNMENTS ==========
  async getProjectAssignments(projectId: string): Promise<ApiResponse<ProjectAssignment[]>> {
    try {
      const response = await api.get(`/projects/${projectId}/assignments`);
      return response.data;
    } catch (error: any) {
      console.error('Error getting project assignments:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi khi lấy danh sách thành viên dự án',
        error: error.message
      };
    }
  }

  async addProjectAssignment(assignmentData: CreateAssignmentData): Promise<ApiResponse<ProjectAssignment>> {
    try {
      const response = await api.post(`/projects/${assignmentData.project_id}/assignments`, assignmentData);
      return response.data;
    } catch (error: any) {
      console.error('Error adding project assignment:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi khi thêm thành viên vào dự án',
        error: error.message
      };
    }
  }

  async updateProjectAssignment(id: string, updateData: UpdateAssignmentData): Promise<ApiResponse<ProjectAssignment>> {
    try {
      const response = await api.put(`/projects/assignments/${id}`, updateData);
      return response.data;
    } catch (error: any) {
      console.error('Error updating project assignment:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi khi cập nhật phân công dự án',
        error: error.message
      };
    }
  }

  async removeProjectAssignment(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await api.delete(`/projects/assignments/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error removing project assignment:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi khi xóa phân công dự án',
        error: error.message
      };
    }
  }

  // ========== USER PROJECTS ==========
  async getUserProjects(): Promise<ApiResponse<Project[]>> {
    try {
      const response = await api.get('/projects/user');
      return response.data;
    } catch (error: any) {
      console.error('Error getting user projects:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi khi lấy danh sách dự án của người dùng',
        error: error.message
      };
    }
  }

  // ========== PROJECT TIMELINE ==========
  async getProjectTimeline(projectId: string): Promise<ApiResponse<ProjectTimeline>> {
    try {
      const response = await api.get(`/projects/${projectId}/timeline`);
      return response.data;
    } catch (error: any) {
      console.error('Error getting project timeline:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi khi lấy timeline dự án',
        error: error.message
      };
    }
  }

  // ========== SITE MANAGEMENT ==========
  async getAllSites(filters: { is_active?: boolean; search?: string } = {}): Promise<ApiResponse<Site[]>> {
    try {
      const response = await api.get('/projects/sites', { params: filters });
      return response.data;
    } catch (error: any) {
      console.error('Error getting sites:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi khi lấy danh sách địa điểm',
        error: error.message
      };
    }
  }

  async getSiteById(id: string): Promise<ApiResponse<Site>> {
    try {
      const response = await api.get(`/projects/sites/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error getting site:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi khi lấy thông tin địa điểm',
        error: error.message
      };
    }
  }

  async createSite(siteData: CreateSiteData): Promise<ApiResponse<Site>> {
    try {
      const response = await api.post('/projects/sites', siteData);
      return response.data;
    } catch (error: any) {
      console.error('Error creating site:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi khi tạo địa điểm',
        error: error.message
      };
    }
  }

  async updateSite(id: string, updateData: UpdateSiteData): Promise<ApiResponse<Site>> {
    try {
      const response = await api.put(`/projects/sites/${id}`, updateData);
      return response.data;
    } catch (error: any) {
      console.error('Error updating site:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi khi cập nhật địa điểm',
        error: error.message
      };
    }
  }

  async deleteSite(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await api.delete(`/projects/sites/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error deleting site:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi khi xóa địa điểm',
        error: error.message
      };
    }
  }

  async getAvailableEmployees(): Promise<ApiResponse<User[]>> {
    try {
      const response = await api.get('/projects/available-employees');
      return response.data;
    } catch (error: any) {
      console.error('Error getting available employees:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi khi lấy danh sách nhân viên',
        error: error.message
      };
    }
  }

  async getPositionOptions(): Promise<ApiResponse<any[]>> {
    try {
      const response = await api.get('/positions/options');
      return response.data;
    } catch (error: any) {
      console.error('Error getting position options:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi khi lấy danh sách chức vụ',
        error: error.message
      };
    }
  }
}

export default new ProjectService();
