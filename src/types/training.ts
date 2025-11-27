// Training Management Types
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
  instructor_id?: {
    _id: string;
    full_name: string;
  };
  max_participants: number;
  location?: string;
  status_code: 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  created_at: string;
  updated_at: string;
}

export interface User {
  _id: string;
  full_name: string;
  email: string;
  department?: string;
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

// Form data types
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
  instructor_id?: string;
  max_participants: number;
  location: string;
  status_code: 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
}

export interface QuestionBankFormData {
  course_id: string;
  name: string;
  description: string;
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

// Filter types
export interface CourseFilters {
  courseSetId?: string;
  isMandatory?: boolean;
  search?: string;
}

export interface SessionFilters {
  courseId?: string;
  instructorId?: string;
  statusCode?: string;
  search?: string;
}

export interface EnrollmentFilters {
  sessionId?: string;
  userId?: string;
  status?: string;
  search?: string;
}

export interface QuestionBankFilters {
  courseId?: string;
  search?: string;
}

export interface QuestionFilters {
  bankId?: string;
  search?: string;
}

// Loading states
export interface LoadingState {
  courses: boolean;
  courseSets: boolean;
  sessions: boolean;
  enrollments: boolean;
  questionBanks: boolean;
  questions: boolean;
  stats: boolean;
}

// Error state
export interface ErrorState {
  message: string;
  type: 'error' | 'warning' | 'info';
  timestamp: number;
}

// Notification state
export interface NotificationState {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  timestamp: number;
}
