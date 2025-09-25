import api from './api';

// Types for API responses
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface CourseSet {
  _id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Course {
  _id: string;
  course_set_id: {
    _id: string;
    name: string;
  };
  course_name: string;
  description: string;
  duration_hours: number;
  is_mandatory: boolean;
  validity_months?: number;
  created_at: string;
  updated_at: string;
}

export interface TrainingSession {
  _id: string;
  course_id: {
    _id: string;
    course_name: string;
  };
  session_name: string;
  start_time: string;
  end_time: string;
  max_participants: number;
  location?: string;
  status_code: 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  created_at: string;
  updated_at: string;
}

export interface TrainingEnrollment {
  _id: string;
  session_id: {
    _id: string;
    session_name: string;
    start_time: string;
    end_time: string;
  };
  user_id: {
    _id: string;
    full_name: string;
    email: string;
  };
  enrolled_at: string;
  status: 'enrolled' | 'completed' | 'failed' | 'cancelled';
  score?: number;
  passed?: boolean;
  completion_date?: string;
  created_at: string;
  updated_at: string;
}

export interface QuestionBank {
  _id: string;
  course_id: {
    _id: string;
    course_name: string;
  };
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Question {
  _id: string;
  bank_id: string;
  content: string;
  options: string[];
  correct_answer: string;
  created_at: string;
  updated_at: string;
}

export interface TrainingStats {
  totalCourseSets: number;
  totalCourses: number;
  totalSessions: number;
  totalEnrollments: number;
  totalQuestionBanks: number;
  totalQuestions: number;
}

export interface SessionStats {
  _id: string;
  count: number;
}

export interface EnrollmentStats {
  _id: string;
  count: number;
}

// Course Set API
export const courseSetApi = {
  getAll: async (): Promise<CourseSet[]> => {
    const response = await api.get<ApiResponse<CourseSet[]>>('/training/course-sets');
    return response.data.data;
  },

  getById: async (id: string): Promise<CourseSet> => {
    const response = await api.get<ApiResponse<CourseSet>>(`/training/course-sets/${id}`);
    return response.data.data;
  },

  create: async (data: { name: string; description?: string }): Promise<CourseSet> => {
    const response = await api.post<ApiResponse<CourseSet>>('/training/course-sets', data);
    return response.data.data;
  },

  update: async (id: string, data: { name: string; description?: string }): Promise<CourseSet> => {
    const response = await api.put<ApiResponse<CourseSet>>(`/training/course-sets/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/training/course-sets/${id}`);
  },
};

// Course API
export const courseApi = {
  getAll: async (filters?: { courseSetId?: string; isMandatory?: boolean }): Promise<Course[]> => {
    const params = new URLSearchParams();
    if (filters?.courseSetId) params.append('courseSetId', filters.courseSetId);
    if (filters?.isMandatory !== undefined) params.append('isMandatory', filters.isMandatory.toString());
    
    const response = await api.get<ApiResponse<Course[]>>(`/training/courses?${params.toString()}`);
    return response.data.data;
  },

  getById: async (id: string): Promise<Course> => {
    const response = await api.get<ApiResponse<Course>>(`/training/courses/${id}`);
    return response.data.data;
  },

  create: async (data: {
    course_set_id: string;
    course_name: string;
    description?: string;
    duration_hours: number;
    is_mandatory: boolean;
    validity_months?: number;
  }): Promise<Course> => {
    const response = await api.post<ApiResponse<Course>>('/training/courses', data);
    return response.data.data;
  },

  update: async (id: string, data: {
    course_set_id: string;
    course_name: string;
    description?: string;
    duration_hours: number;
    is_mandatory: boolean;
    validity_months?: number;
  }): Promise<Course> => {
    const response = await api.put<ApiResponse<Course>>(`/training/courses/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/training/courses/${id}`);
  },
};

// Training Session API
export const trainingSessionApi = {
  getAll: async (filters?: { courseId?: string; instructorId?: string; statusCode?: string }): Promise<TrainingSession[]> => {
    const params = new URLSearchParams();
    if (filters?.courseId) params.append('courseId', filters.courseId);
    if (filters?.instructorId) params.append('instructorId', filters.instructorId);
    if (filters?.statusCode) params.append('statusCode', filters.statusCode);
    
    const response = await api.get<ApiResponse<TrainingSession[]>>(`/training/sessions?${params.toString()}`);
    return response.data.data;
  },

  getById: async (id: string): Promise<TrainingSession> => {
    const response = await api.get<ApiResponse<TrainingSession>>(`/training/sessions/${id}`);
    return response.data.data;
  },

  create: async (data: {
    course_id: string;
    session_name: string;
    start_time: string;
    end_time: string;
    max_participants: number;
    location?: string;
    status_code: 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  }): Promise<TrainingSession> => {
    const response = await api.post<ApiResponse<TrainingSession>>('/training/sessions', data);
    return response.data.data;
  },

  update: async (id: string, data: {
    course_id: string;
    session_name: string;
    start_time: string;
    end_time: string;
    max_participants: number;
    location?: string;
    status_code: 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  }): Promise<TrainingSession> => {
    const response = await api.put<ApiResponse<TrainingSession>>(`/training/sessions/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/training/sessions/${id}`);
  },
};

// Training Enrollment API
export const trainingEnrollmentApi = {
  getAll: async (filters?: { sessionId?: string; userId?: string; status?: string }): Promise<TrainingEnrollment[]> => {
    const params = new URLSearchParams();
    if (filters?.sessionId) params.append('sessionId', filters.sessionId);
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.status) params.append('status', filters.status);
    
    const response = await api.get<ApiResponse<TrainingEnrollment[]>>(`/training/enrollments?${params.toString()}`);
    return response.data.data;
  },

  getById: async (id: string): Promise<TrainingEnrollment> => {
    const response = await api.get<ApiResponse<TrainingEnrollment>>(`/training/enrollments/${id}`);
    return response.data.data;
  },

  create: async (data: { session_id: string; user_id: string }): Promise<TrainingEnrollment> => {
    const response = await api.post<ApiResponse<TrainingEnrollment>>('/training/enrollments', data);
    return response.data.data;
  },

  update: async (id: string, data: {
    status?: 'enrolled' | 'completed' | 'failed' | 'cancelled';
    score?: number;
    passed?: boolean;
    completion_date?: string;
  }): Promise<TrainingEnrollment> => {
    const response = await api.put<ApiResponse<TrainingEnrollment>>(`/training/enrollments/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/training/enrollments/${id}`);
  },
};

// Question Bank API
export const questionBankApi = {
  getAll: async (filters?: { courseId?: string }): Promise<QuestionBank[]> => {
    const params = new URLSearchParams();
    if (filters?.courseId) params.append('courseId', filters.courseId);
    
    const response = await api.get<ApiResponse<QuestionBank[]>>(`/training/question-banks?${params.toString()}`);
    return response.data.data;
  },

  getById: async (id: string): Promise<QuestionBank> => {
    const response = await api.get<ApiResponse<QuestionBank>>(`/training/question-banks/${id}`);
    return response.data.data;
  },

  create: async (data: { course_id: string; name: string; description?: string }): Promise<QuestionBank> => {
    const response = await api.post<ApiResponse<QuestionBank>>('/training/question-banks', data);
    return response.data.data;
  },

  update: async (id: string, data: { course_id: string; name: string; description?: string }): Promise<QuestionBank> => {
    const response = await api.put<ApiResponse<QuestionBank>>(`/training/question-banks/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/training/question-banks/${id}`);
  },
};

// Question API
export const questionApi = {
  getAll: async (filters?: { bankId?: string }): Promise<Question[]> => {
    const params = new URLSearchParams();
    if (filters?.bankId) params.append('bankId', filters.bankId);
    
    const response = await api.get<ApiResponse<Question[]>>(`/training/questions?${params.toString()}`);
    return response.data.data;
  },

  getById: async (id: string): Promise<Question> => {
    const response = await api.get<ApiResponse<Question>>(`/training/questions/${id}`);
    return response.data.data;
  },

  create: async (data: {
    bank_id: string;
    content: string;
    options: string[];
    correct_answer: string;
  }): Promise<Question> => {
    const response = await api.post<ApiResponse<Question>>('/training/questions', data);
    return response.data.data;
  },

  update: async (id: string, data: {
    bank_id: string;
    content: string;
    options: string[];
    correct_answer: string;
  }): Promise<Question> => {
    const response = await api.put<ApiResponse<Question>>(`/training/questions/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/training/questions/${id}`);
  },

  importFromExcel: async (bankId: string, file: File): Promise<Question[]> => {
    const formData = new FormData();
    formData.append('excelFile', file);
    formData.append('bank_id', bankId);
    
    const response = await api.post<ApiResponse<Question[]>>('/training/questions/import-excel', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  downloadTemplate: async (): Promise<string> => {
    const response = await api.get<ApiResponse<{ templatePath: string }>>('/training/questions/template');
    return response.data.data.templatePath;
  },
};

// Statistics API
export const trainingStatsApi = {
  getDashboardStats: async (): Promise<TrainingStats> => {
    const response = await api.get<ApiResponse<TrainingStats>>('/training/dashboard/stats');
    return response.data.data;
  },

  getSessionStats: async (): Promise<SessionStats[]> => {
    const response = await api.get<ApiResponse<SessionStats[]>>('/training/sessions/stats');
    return response.data.data;
  },

  getEnrollmentStats: async (): Promise<EnrollmentStats[]> => {
    const response = await api.get<ApiResponse<EnrollmentStats[]>>('/training/enrollments/stats');
    return response.data.data;
  },
};

export default api;
