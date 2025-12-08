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
  is_deployed?: boolean;
  deployed_at?: string;
  deployed_by?: {
    _id: string;
    full_name: string;
  };
  created_at: string;
  updated_at: string;
  // Assignment fields for department courses
  assignment_id?: string;
  assigned_by?: {
    _id: string;
    full_name: string;
  };
  assigned_at?: string;
  notes?: string;
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

export interface TrainingAssignment {
  _id: string;
  course_id: {
    _id: string;
    course_name: string;
  };
  department_id: {
    _id: string;
    department_name: string;
  };
  assigned_by: {
    _id: string;
    full_name: string;
  };
  assigned_at: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SessionStats {
  _id: string;
  count: number;
}

export interface EnrollmentStats {
  _id: string;
  count: number;
}

// Form Data Types
export interface CourseFormData {
  course_set_id: string;
  course_name: string;
  description: string;
  duration_hours: number;
  is_mandatory: boolean;
  validity_months?: number;
}

export interface SessionFormData {
  course_id: string;
  session_name: string;
  start_time: string;
  end_time: string;
  max_participants: number;
  location?: string;
  status_code?: 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
}

export interface QuestionBankFormData {
  course_id: string;
  name: string;
  description?: string;
}

export interface QuestionFormData {
  bank_id: string;
  content: string;
  options: string[];
  correct_answer: string;
}

export interface EnrollmentFormData {
  session_id: string;
  user_id: string;
}

// Filter Types
export interface CourseFilters {
  courseSetId?: string;
  isMandatory?: boolean;
  isDeployed?: boolean;
  search?: string;
}

export interface SessionFilters {
  courseId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export interface EnrollmentFilters {
  sessionId?: string;
  userId?: string;
  status?: string;
}

export interface QuestionBankFilters {
  courseId?: string;
  search?: string;
}

export interface QuestionFilters {
  bankId?: string;
  questionType?: string;
  search?: string;
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
  getAll: async (filters?: { courseSetId?: string; isMandatory?: boolean; isDeployed?: boolean }): Promise<Course[]> => {
    const params = new URLSearchParams();
    if (filters?.courseSetId) params.append('courseSetId', filters.courseSetId);
    if (filters?.isMandatory !== undefined) params.append('isMandatory', filters.isMandatory.toString());
    if (filters?.isDeployed !== undefined) params.append('isDeployed', filters.isDeployed.toString());
    
    const response = await api.get<ApiResponse<Course[]>>(`/training/courses?${params.toString()}`);
    return response.data.data;
  },

  getAvailableForEmployee: async (filters?: { isMandatory?: boolean }): Promise<Course[]> => {
    const params = new URLSearchParams();
    if (filters?.isMandatory !== undefined) params.append('isMandatory', filters.isMandatory.toString());
    
    const response = await api.get<ApiResponse<Course[]>>(`/training/courses/available?${params.toString()}`);
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

  getAvailableForEmployee: async (filters?: { courseId?: string; statusCode?: string }): Promise<TrainingSession[]> => {
    const params = new URLSearchParams();
    if (filters?.courseId) params.append('courseId', filters.courseId);
    if (filters?.statusCode) params.append('statusCode', filters.statusCode);
    
    const response = await api.get<ApiResponse<TrainingSession[]>>(`/training/sessions/available?${params.toString()}`);
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

// Additional Training APIs
export const trainingHelperApi = {
  // Get available sessions for a course
  getAvailableSessions: async (courseId: string, userId?: string): Promise<TrainingSession[]> => {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    
    const response = await api.get<ApiResponse<TrainingSession[]>>(
      `/training/courses/${courseId}/available-sessions?${params.toString()}`
    );
    return response.data.data;
  },

  // Get user enrollments
  getUserEnrollments: async (userId: string, filters?: { status?: string }): Promise<TrainingEnrollment[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    
    const response = await api.get<ApiResponse<TrainingEnrollment[]>>(
      `/training/users/${userId}/enrollments?${params.toString()}`
    );
    return response.data.data;
  },

  // Get improved course stats
  getImprovedCourseStats: async (courseId: string) => {
    const response = await api.get<ApiResponse<any>>(`/training/courses/${courseId}/stats-improved`);
    return response.data.data;
  },
};

// Training Submission/Grading APIs (Admin)
export interface TrainingSubmission {
  _id: string;
  enrollment_id: string;
  session_id: {
    _id: string;
    session_name: string;
    course_id: {
      _id: string;
      course_name: string;
    };
  };
  user_id: {
    _id: string;
    full_name: string;
    email: string;
  };
  answers: Record<string, string>;
  submitted_at: string;
  status: 'submitted' | 'graded';
  graded_at?: string;
  graded_by?: {
    _id: string;
    full_name: string;
  };
  admin_comments?: string;
  questions?: any[];
}

export const trainingGradingApi = {
  // Get submissions waiting for grading
  getSubmissionsForGrading: async (filters?: { sessionId?: string; userId?: string }): Promise<TrainingSubmission[]> => {
    const params = new URLSearchParams();
    if (filters?.sessionId) params.append('sessionId', filters.sessionId);
    if (filters?.userId) params.append('userId', filters.userId);
    
    const response = await api.get<ApiResponse<TrainingSubmission[]>>(
      `/training/submissions/grading?${params.toString()}`
    );
    return response.data.data;
  },

  // Get submission details for grading
  getSubmissionForGrading: async (submissionId: string): Promise<TrainingSubmission> => {
    const response = await api.get<ApiResponse<TrainingSubmission>>(
      `/training/submissions/${submissionId}/grading`
    );
    return response.data.data;
  },

  // Grade a submission
  gradeSubmission: async (submissionId: string, data: {
    score: number;
    passed: boolean;
    admin_comments?: string;
  }): Promise<any> => {
    const response = await api.post<ApiResponse<any>>(
      `/training/submissions/${submissionId}/grade`,
      data
    );
    return response.data.data;
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

// Training Assignment API
export const trainingAssignmentApi = {
  getAll: async (filters?: { courseId?: string; departmentId?: string }): Promise<TrainingAssignment[]> => {
    const params = new URLSearchParams();
    if (filters?.courseId) params.append('courseId', filters.courseId);
    if (filters?.departmentId) params.append('departmentId', filters.departmentId);
    
    const response = await api.get<ApiResponse<TrainingAssignment[]>>(`/training/assignments?${params.toString()}`);
    return response.data.data;
  },

  getById: async (id: string): Promise<TrainingAssignment> => {
    const response = await api.get<ApiResponse<TrainingAssignment>>(`/training/assignments/${id}`);
    return response.data.data;
  },

  create: async (data: {
    course_id: string;
    department_id: string;
    notes?: string;
  }): Promise<TrainingAssignment> => {
    const response = await api.post<ApiResponse<TrainingAssignment>>('/training/assignments', data);
    return response.data.data;
  },

  update: async (id: string, data: {
    course_id?: string;
    department_id?: string;
    notes?: string;
  }): Promise<TrainingAssignment> => {
    const response = await api.put<ApiResponse<TrainingAssignment>>(`/training/assignments/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/training/assignments/${id}`);
  },

  getByDepartment: async (departmentId: string): Promise<TrainingAssignment[]> => {
    const response = await api.get<ApiResponse<TrainingAssignment[]>>(`/training/assignments/department/${departmentId}`);
    return response.data.data;
  },

  getByCourse: async (courseId: string): Promise<TrainingAssignment[]> => {
    const response = await api.get<ApiResponse<TrainingAssignment[]>>(`/training/assignments/course/${courseId}`);
    return response.data.data;
  },

  getStats: async (): Promise<any> => {
    const response = await api.get<ApiResponse<any>>('/training/assignments/stats');
    return response.data.data;
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
