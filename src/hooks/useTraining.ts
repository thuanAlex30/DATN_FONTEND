import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';
import {
  courseSetApi,
  courseApi,
  trainingSessionApi,
  trainingEnrollmentApi,
  questionBankApi,
  questionApi,
  trainingStatsApi,
  trainingAssignmentApi,
  type CourseSet,
  type Course,
  type TrainingSession,
  type TrainingEnrollment,
  type QuestionBank,
  type Question,
  type TrainingStats,
  type TrainingAssignment,
  type CourseFormData,
  type SessionFormData,
  type QuestionBankFormData,
  type QuestionFormData,
  type EnrollmentFormData,
  type CourseFilters,
  type SessionFilters,
  type EnrollmentFilters,
  type QuestionBankFilters,
  type QuestionFilters,
} from '../services/trainingApi';

// Custom hook for Course Sets
export const useCourseSets = () => {
  const [courseSets, setCourseSets] = useState<CourseSet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCourseSets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await courseSetApi.getAll();
      setCourseSets(data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch course sets';
      setError(errorMessage);
      // Only show toast if it's not a network error (to avoid spam)
      if (!err.code || (err.code !== 'ERR_NETWORK' && err.code !== 'ECONNABORTED')) {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const createCourseSet = useCallback(async (data: { name: string; description?: string }) => {
    try {
      setLoading(true);
      const newCourseSet = await courseSetApi.create(data);
      setCourseSets(prev => [...prev, newCourseSet]);
      toast.success('Course set created successfully');
      return newCourseSet;
    } catch (err: any) {
      setError(err.message || 'Failed to create course set');
      toast.error('Failed to create course set');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCourseSet = useCallback(async (id: string, data: { name: string; description?: string }) => {
    try {
      setLoading(true);
      const updatedCourseSet = await courseSetApi.update(id, data);
      setCourseSets(prev => prev.map(cs => cs._id === id ? updatedCourseSet : cs));
      toast.success('Course set updated successfully');
      return updatedCourseSet;
    } catch (err: any) {
      setError(err.message || 'Failed to update course set');
      toast.error('Failed to update course set');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCourseSet = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await courseSetApi.delete(id);
      setCourseSets(prev => prev.filter(cs => cs._id !== id));
      toast.success('Course set deleted successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to delete course set');
      toast.error('Failed to delete course set');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourseSets();
  }, [fetchCourseSets]);

  return {
    courseSets,
    loading,
    error,
    fetchCourseSets,
    createCourseSet,
    updateCourseSet,
    deleteCourseSet,
  };
};

// Custom hook for Courses
export const useCourses = (filters?: CourseFilters) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoize filters to prevent unnecessary re-renders
  const memoizedFilters = useMemo(() => filters, [
    filters?.courseSetId,
    filters?.isMandatory,
    filters?.isDeployed,
    filters?.search
  ]);

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Check if user is employee and needs available courses
      if (memoizedFilters?.isDeployed === true) {
        // Use employee-specific API
        const employeeFilters: { isMandatory?: boolean } = {};
        if (memoizedFilters?.isMandatory !== undefined) {
          employeeFilters.isMandatory = memoizedFilters.isMandatory;
        }
        const data = await courseApi.getAvailableForEmployee(employeeFilters);
        setCourses(data);
      } else {
        // Use regular API for admin/manager
        const data = await courseApi.getAll(memoizedFilters);
        setCourses(data);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch courses';
      setError(errorMessage);
      // Only show toast if it's not a network error (to avoid spam)
      if (!err.code || (err.code !== 'ERR_NETWORK' && err.code !== 'ECONNABORTED')) {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [memoizedFilters]);

  const createCourse = useCallback(async (data: CourseFormData) => {
    try {
      setLoading(true);
      const newCourse = await courseApi.create(data);
      setCourses(prev => [...prev, newCourse]);
      toast.success('Course created successfully');
      return newCourse;
    } catch (err: any) {
      setError(err.message || 'Failed to create course');
      toast.error('Failed to create course');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCourse = useCallback(async (id: string, data: CourseFormData) => {
    try {
      setLoading(true);
      const updatedCourse = await courseApi.update(id, data);
      setCourses(prev => prev.map(c => c._id === id ? updatedCourse : c));
      toast.success('Course updated successfully');
      return updatedCourse;
    } catch (err: any) {
      setError(err.message || 'Failed to update course');
      toast.error('Failed to update course');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCourse = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await courseApi.delete(id);
      setCourses(prev => prev.filter(c => c._id !== id));
      toast.success('Xóa khóa học thành công');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Không thể xóa khóa học';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deployCourse = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const updatedCourse = await courseApi.deploy(id);
      setCourses(prev => prev.map(c => c._id === id ? updatedCourse : c));
      toast.success('Triển khai khóa học thành công');
      return updatedCourse;
    } catch (err: any) {
      setError(err.message || 'Failed to deploy course');
      toast.error('Không thể triển khai khóa học');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const undeployCourse = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const updatedCourse = await courseApi.undeploy(id);
      setCourses(prev => prev.map(c => c._id === id ? updatedCourse : c));
      toast.success('Hủy triển khai khóa học thành công');
      return updatedCourse;
    } catch (err: any) {
      setError(err.message || 'Failed to undeploy course');
      toast.error('Không thể hủy triển khai khóa học');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return {
    courses,
    loading,
    error,
    fetchCourses,
    createCourse,
    updateCourse,
    deleteCourse,
    deployCourse,
    undeployCourse,
  };
};

// Custom hook for Department Courses
export const useDepartmentCourses = (departmentId: string) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDepartmentCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let response;
      if (!departmentId) {
        console.log('⚠️ No departmentId provided, fetching all courses');
        response = await api.get('/training/courses');
      } else {
        console.log('🔍 Fetching courses for department:', departmentId);
        response = await api.get(`/training/courses/department/${departmentId}`);
      }
      
      console.log('🔍 API Response:', response.data);
      
      const data = response.data?.data || response.data || [];
      console.log('🔍 Extracted data:', data);
      
      // Filter out null values and ensure it's an array
      const validCourses = Array.isArray(data) ? data.filter(course => course && course._id) : [];
      console.log('🔍 Valid courses:', validCourses);
      
      // Debug: Log each course's deployment status
      validCourses.forEach((course, index) => {
        console.log(`🔍 Course ${index + 1}:`, {
          id: course._id,
          name: course.course_name,
          is_deployed: course.is_deployed,
          assignment_id: course.assignment_id,
          deployed_at: course.deployed_at,
          deployed_by: course.deployed_by
        });
      });
      setCourses(validCourses);
    } catch (err: any) {
      console.error('❌ Error fetching courses:', err);
      setError(err.message || 'Failed to fetch courses');
      toast.error('Failed to fetch courses');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [departmentId]);

  useEffect(() => {
    fetchDepartmentCourses();
  }, [fetchDepartmentCourses]);

  return {
    courses,
    loading,
    error,
    fetchDepartmentCourses,
  };
};

// Custom hook for Training Sessions
export const useTrainingSessions = (filters?: SessionFilters) => {
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoize filters to prevent unnecessary re-renders
  const memoizedFilters = useMemo(() => filters, [
    filters?.courseId,
    filters?.status
  ]);

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await trainingSessionApi.getAll(memoizedFilters);
      setSessions(data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch training sessions';
      setError(errorMessage);
      // Only show toast if it's not a network error (to avoid spam)
      if (!err.code || (err.code !== 'ERR_NETWORK' && err.code !== 'ECONNABORTED')) {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [memoizedFilters]);

  const createSession = useCallback(async (data: SessionFormData) => {
    try {
      setLoading(true);
      const sessionData = {
        ...data,
        status_code: data.status_code || 'SCHEDULED'
      };
      const newSession = await trainingSessionApi.create(sessionData);
      setSessions(prev => [...prev, newSession]);
      toast.success('Training session created successfully');
      return newSession;
    } catch (err: any) {
      setError(err.message || 'Failed to create training session');
      toast.error('Failed to create training session');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSession = useCallback(async (id: string, data: SessionFormData) => {
    try {
      setLoading(true);
      const sessionData = {
        ...data,
        status_code: data.status_code || 'SCHEDULED'
      };
      const updatedSession = await trainingSessionApi.update(id, sessionData);
      setSessions(prev => prev.map(s => s._id === id ? updatedSession : s));
      toast.success('Training session updated successfully');
      return updatedSession;
    } catch (err: any) {
      setError(err.message || 'Failed to update training session');
      toast.error('Failed to update training session');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteSession = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await trainingSessionApi.delete(id);
      setSessions(prev => prev.filter(s => s._id !== id));
      toast.success('Training session deleted successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to delete training session');
      toast.error('Failed to delete training session');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return {
    sessions,
    loading,
    error,
    fetchSessions,
    createSession,
    updateSession,
    deleteSession,
  };
};

// Custom hook for Available Training Sessions (Employee)
export const useAvailableTrainingSessions = (filters?: SessionFilters) => {
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await trainingSessionApi.getAvailableForEmployee(filters);
      setSessions(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch available training sessions');
      toast.error('Failed to fetch available training sessions');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return {
    sessions,
    loading,
    error,
    fetchSessions
  };
};

// Custom hook for Training Enrollments
export const useTrainingEnrollments = (filters?: EnrollmentFilters) => {
  const [enrollments, setEnrollments] = useState<TrainingEnrollment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoize filters to prevent unnecessary re-renders
  const memoizedFilters = useMemo(() => filters, [
    filters?.sessionId,
    filters?.userId,
    filters?.status
  ]);

  const fetchEnrollments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await trainingEnrollmentApi.getAll(memoizedFilters);
      setEnrollments(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch training enrollments');
      toast.error('Failed to fetch training enrollments');
    } finally {
      setLoading(false);
    }
  }, [memoizedFilters]);

  const createEnrollment = useCallback(async (data: EnrollmentFormData) => {
    try {
      setLoading(true);
      const newEnrollment = await trainingEnrollmentApi.create(data);
      setEnrollments(prev => [...prev, newEnrollment]);
      toast.success('Enrollment created successfully');
      return newEnrollment;
    } catch (err: any) {
      setError(err.message || 'Failed to create enrollment');
      toast.error('Failed to create enrollment');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateEnrollment = useCallback(async (id: string, data: {
    status?: 'enrolled' | 'completed' | 'failed' | 'cancelled';
    score?: number;
    passed?: boolean;
    completion_date?: string;
  }) => {
    try {
      setLoading(true);
      const updatedEnrollment = await trainingEnrollmentApi.update(id, data);
      setEnrollments(prev => prev.map(e => e._id === id ? updatedEnrollment : e));
      toast.success('Enrollment updated successfully');
      return updatedEnrollment;
    } catch (err: any) {
      setError(err.message || 'Failed to update enrollment');
      toast.error('Failed to update enrollment');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteEnrollment = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await trainingEnrollmentApi.delete(id);
      setEnrollments(prev => prev.filter(e => e._id !== id));
      toast.success('Enrollment deleted successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to delete enrollment');
      toast.error('Failed to delete enrollment');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  return {
    enrollments,
    loading,
    error,
    fetchEnrollments,
    createEnrollment,
    updateEnrollment,
    deleteEnrollment,
  };
};

// Custom hook for Question Banks
export const useQuestionBanks = (filters?: QuestionBankFilters, options?: { autoFetch?: boolean }) => {
  const [questionBanks, setQuestionBanks] = useState<QuestionBank[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoize filters to prevent unnecessary re-renders
  const memoizedFilters = useMemo(() => filters, [
    filters?.courseId,
    filters?.search
  ]);

  const fetchQuestionBanks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await questionBankApi.getAll(memoizedFilters);
      setQuestionBanks(data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch question banks';
      setError(errorMessage);
      // Only show toast if it's not a network error (to avoid spam)
      if (!err.code || (err.code !== 'ERR_NETWORK' && err.code !== 'ECONNABORTED')) {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [memoizedFilters]);

  const createQuestionBank = useCallback(async (data: QuestionBankFormData) => {
    try {
      setLoading(true);
      const newQuestionBank = await questionBankApi.create(data);
      setQuestionBanks(prev => [...prev, newQuestionBank]);
      toast.success('Question bank created successfully');
      return newQuestionBank;
    } catch (err: any) {
      setError(err.message || 'Failed to create question bank');
      toast.error('Failed to create question bank');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateQuestionBank = useCallback(async (id: string, data: QuestionBankFormData) => {
    try {
      setLoading(true);
      const updatedQuestionBank = await questionBankApi.update(id, data);
      setQuestionBanks(prev => prev.map(qb => qb._id === id ? updatedQuestionBank : qb));
      toast.success('Question bank updated successfully');
      return updatedQuestionBank;
    } catch (err: any) {
      setError(err.message || 'Failed to update question bank');
      toast.error('Failed to update question bank');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteQuestionBank = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await questionBankApi.delete(id);
      setQuestionBanks(prev => prev.filter(qb => qb._id !== id));
      toast.success('Question bank deleted successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to delete question bank');
      toast.error('Failed to delete question bank');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Auto-fetch by default; allow callers to pass options.autoFetch = false to lazy-load.
    if (options?.autoFetch === false) return;
    fetchQuestionBanks();
  }, [fetchQuestionBanks, options]);

  return {
    questionBanks,
    loading,
    error,
    fetchQuestionBanks,
    createQuestionBank,
    updateQuestionBank,
    deleteQuestionBank,
  };
};

// Custom hook for Questions
export const useQuestions = (filters?: QuestionFilters) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await questionApi.getAll(filters);
      setQuestions(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch questions');
      toast.error('Failed to fetch questions');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createQuestion = useCallback(async (data: QuestionFormData) => {
    try {
      setLoading(true);
      const newQuestion = await questionApi.create(data);
      setQuestions(prev => [...prev, newQuestion]);
      toast.success('Question created successfully');
      return newQuestion;
    } catch (err: any) {
      setError(err.message || 'Failed to create question');
      toast.error('Failed to create question');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateQuestion = useCallback(async (id: string, data: QuestionFormData) => {
    try {
      setLoading(true);
      const updatedQuestion = await questionApi.update(id, data);
      setQuestions(prev => prev.map(q => q._id === id ? updatedQuestion : q));
      toast.success('Question updated successfully');
      return updatedQuestion;
    } catch (err: any) {
      setError(err.message || 'Failed to update question');
      toast.error('Failed to update question');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteQuestion = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await questionApi.delete(id);
      setQuestions(prev => prev.filter(q => q._id !== id));
      toast.success('Question deleted successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to delete question');
      toast.error('Failed to delete question');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const importQuestionsFromExcel = useCallback(async (bankId: string, file: File) => {
    try {
      setLoading(true);
      const result: any = await questionApi.importFromExcel(bankId, file);
      
      console.log('Import result from API:', result);
      
      // Handle both old format (array) and new format (object with questions, errors, etc.)
      const importedQuestions = Array.isArray(result) ? result : (result.questions || []);
      
      if (importedQuestions.length > 0) {
        setQuestions(prev => [...prev, ...importedQuestions]);
      }
      
      // Don't show toast here - let the component handle it for better control
      // Return full result object for better error handling
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to import questions';
      setError(errorMessage);
      console.error('Import error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const downloadQuestionTemplate = useCallback(async () => {
    try {
      const templatePath = await questionApi.downloadTemplate();
      return templatePath;
    } catch (err: any) {
      setError(err.message || 'Failed to download template');
      toast.error('Failed to download template');
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  return {
    questions,
    loading,
    error,
    fetchQuestions,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    importQuestionsFromExcel,
    downloadQuestionTemplate,
  };
};

// Custom hook for Training Statistics
export const useTrainingStats = () => {
  const [stats, setStats] = useState<TrainingStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await trainingStatsApi.getDashboardStats();
      setStats(data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch training statistics';
      setError(errorMessage);
      // Only show toast if it's not a network error (to avoid spam)
      if (!err.code || (err.code !== 'ERR_NETWORK' && err.code !== 'ECONNABORTED')) {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    fetchStats,
  };
};

// Custom hook for Training Assignments
export const useTrainingAssignments = (filters: { courseId?: string; departmentId?: string } = {}) => {
  const [assignments, setAssignments] = useState<TrainingAssignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoize filters to prevent unnecessary re-renders
  const memoizedFilters = useMemo(() => filters, [
    filters?.courseId,
    filters?.departmentId
  ]);

  const fetchAssignments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await trainingAssignmentApi.getAll(memoizedFilters);
      setAssignments(data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch training assignments';
      setError(errorMessage);
      // Only show toast if it's not a network error (to avoid spam)
      if (!err.code || (err.code !== 'ERR_NETWORK' && err.code !== 'ECONNABORTED')) {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [memoizedFilters]);

  const createAssignment = useCallback(async (data: {
    course_id: string;
    department_id: string;
    notes?: string;
  }) => {
    try {
      setLoading(true);
      const newAssignment = await trainingAssignmentApi.create(data);
      setAssignments(prev => [...prev, newAssignment]);
      toast.success('Training assignment created successfully');
      return newAssignment;
    } catch (err: any) {
      setError(err.message || 'Failed to create training assignment');
      toast.error('Failed to create training assignment');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAssignment = useCallback(async (id: string, data: {
    course_id?: string;
    department_id?: string;
    notes?: string;
  }) => {
    try {
      setLoading(true);
      const updatedAssignment = await trainingAssignmentApi.update(id, data);
      setAssignments(prev => prev.map(assignment => 
        assignment._id === id ? updatedAssignment : assignment
      ));
      toast.success('Training assignment updated successfully');
      return updatedAssignment;
    } catch (err: any) {
      setError(err.message || 'Failed to update training assignment');
      toast.error('Failed to update training assignment');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteAssignment = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await trainingAssignmentApi.delete(id);
      setAssignments(prev => prev.filter(assignment => assignment._id !== id));
      toast.success('Training assignment deleted successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to delete training assignment');
      toast.error('Failed to delete training assignment');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  return {
    assignments,
    loading,
    error,
    fetchAssignments,
    createAssignment,
    updateAssignment,
    deleteAssignment,
  };
};

// Custom hook for Department Training Dashboard
export const useDepartmentTrainingDashboard = (departmentId: string) => {
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    if (!departmentId) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/training/dashboard/department/${departmentId}`);
      setDashboard(response.data.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch department dashboard');
      toast.error('Failed to fetch department dashboard');
    } finally {
      setLoading(false);
    }
  }, [departmentId]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    dashboard,
    loading,
    error,
    fetchDashboard,
  };
};
