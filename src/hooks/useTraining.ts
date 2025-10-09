import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import {
  courseSetApi,
  courseApi,
  trainingSessionApi,
  trainingEnrollmentApi,
  questionBankApi,
  questionApi,
  trainingStatsApi,
  type CourseSet,
  type Course,
  type TrainingSession,
  type TrainingEnrollment,
  type QuestionBank,
  type Question,
  type TrainingStats,
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
      setError(err.message || 'Failed to fetch course sets');
      toast.error('Failed to fetch course sets');
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

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await courseApi.getAll(filters);
      setCourses(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch courses');
      toast.error('Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  }, [filters]);

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
      toast.success('Course deleted successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to delete course');
      toast.error('Failed to delete course');
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
  };
};

// Custom hook for Training Sessions
export const useTrainingSessions = (filters?: SessionFilters) => {
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await trainingSessionApi.getAll(filters);
      setSessions(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch training sessions');
      toast.error('Failed to fetch training sessions');
    } finally {
      setLoading(false);
    }
  }, [filters]);

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

// Custom hook for Training Enrollments
export const useTrainingEnrollments = (filters?: EnrollmentFilters) => {
  const [enrollments, setEnrollments] = useState<TrainingEnrollment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEnrollments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await trainingEnrollmentApi.getAll(filters);
      setEnrollments(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch training enrollments');
      toast.error('Failed to fetch training enrollments');
    } finally {
      setLoading(false);
    }
  }, [filters]);

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
export const useQuestionBanks = (filters?: QuestionBankFilters) => {
  const [questionBanks, setQuestionBanks] = useState<QuestionBank[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestionBanks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await questionBankApi.getAll(filters);
      setQuestionBanks(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch question banks');
      toast.error('Failed to fetch question banks');
    } finally {
      setLoading(false);
    }
  }, [filters]);

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
    fetchQuestionBanks();
  }, [fetchQuestionBanks]);

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
      const importedQuestions = await questionApi.importFromExcel(bankId, file);
      setQuestions(prev => [...prev, ...importedQuestions]);
      toast.success('Questions imported successfully');
      return importedQuestions;
    } catch (err: any) {
      setError(err.message || 'Failed to import questions');
      toast.error('Failed to import questions');
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
      setError(err.message || 'Failed to fetch training statistics');
      toast.error('Failed to fetch training statistics');
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
