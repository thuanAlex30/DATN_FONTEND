import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Card, 
  Typography, 
  Button, 
  Space, 
  Table, 
  Tag, 
  Avatar, 
  Row, 
  Col, 
  Input, 
  Select, 
  Modal, 
  Form, 
  Popconfirm, 
  Upload,
  Breadcrumb,
  Spin,
  Empty,
  Tooltip,
  Divider,
  Alert,
  Checkbox,
  DatePicker,
  message
} from 'antd';
import { 
  BookOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined, 
  UploadOutlined, 
  DownloadOutlined, 
  UserOutlined, 
  CalendarOutlined, 
  ClockCircleOutlined,
  EyeOutlined,
  QuestionCircleOutlined,
  FileExcelOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  ArrowLeftOutlined,
  TeamOutlined,
  FolderOutlined
} from '@ant-design/icons';
import { downloadQuestionTemplate } from '../../../utils/questionTemplate';
import {
  useCourses,
  useTrainingSessions,
  useTrainingEnrollments,
  useQuestionBanks,
  useQuestions,
  useCourseSets,
  useTrainingAssignments,
} from '../../../hooks/useTraining';
import dayjs from 'dayjs';
import ViewCourseModal from './components/ViewCourseModal';
import QuestionBankModal from './components/QuestionBankModal';
import ViewSessionModal from './components/ViewSessionModal';
import EnrollmentModal from './components/EnrollmentModal';
import CourseAssignmentModal from './components/CourseAssignmentModal';

const TrainingManagement: React.FC = () => {
  // Navigation state - hierarchical view
  const [currentView, setCurrentView] = useState<'course-sets' | 'courses' | 'question-banks' | 'sessions' | 'enrollments' | 'assignments'>('course-sets');
  const [selectedCourseSet, setSelectedCourseSet] = useState<any>(null);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  
  const [showModal, setShowModal] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [currentQuestionBankId, setCurrentQuestionBankId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    courseSetId: '',
    courseId: '',
    statusCode: '',
    search: '',
    isMandatory: '',
  });

  // Form states

  const [sessionForm, setSessionForm] = useState({
    session_name: '',
    course_id: '',
    start_time: '',
    end_time: '',
    max_participants: '',
    location: '',
    status_code: 'SCHEDULED',
  });


  const [questionForm, setQuestionForm] = useState({
    content: '',
    options: ['', '', '', ''],
    correct_answer: '',
  });

  const [excelFile, setExcelFile] = useState<File | null>(null);

  // Loading states for form submissions
  const [submittingCourseSet, setSubmittingCourseSet] = useState(false);
  const [submittingCourse, setSubmittingCourse] = useState(false);
  const [submittingSession, setSubmittingSession] = useState(false);
  const [submittingQuestionBank, setSubmittingQuestionBank] = useState(false);
  const [submittingQuestion, setSubmittingQuestion] = useState(false);

  // API hooks
  const { courseSets, loading: courseSetsLoading, createCourseSet, updateCourseSet, deleteCourseSet } = useCourseSets();
  
  // Memoize filters to prevent unnecessary re-renders
  const courseFilters = useMemo(() => ({
    courseSetId: filters.courseSetId || undefined,
    isMandatory: filters.isMandatory ? filters.isMandatory === 'true' : undefined,
  }), [filters.courseSetId, filters.isMandatory]);
  
  const { courses, loading: coursesLoading, createCourse, updateCourse, deleteCourse, deployCourse, undeployCourse } = useCourses(courseFilters);
  
  // Load all courses for session form (without filters) - use empty object that doesn't change
  const emptyFilters = useMemo(() => ({}), []);
  const { courses: allCourses } = useCourses(emptyFilters);
  
  // Training assignments
  const { assignments, loading: assignmentsLoading, deleteAssignment } = useTrainingAssignments();
  
  // Clear invalid course_id when all courses change (only when allCourses changes, not when course_id changes)
  // Use useMemo to create a stable reference for allCourses array
  const allCoursesIds = useMemo(() => {
    if (!allCourses || allCourses.length === 0) return [];
    return allCourses.map(c => c._id);
  }, [allCourses]);

  useEffect(() => {
    if (!allCourses || allCourses.length === 0) {
      setSessionForm(prev => {
        if (prev.course_id) {
          return { ...prev, course_id: '' };
        }
        return prev;
      });
      return;
    }
    
    // If courses exist, check if current course_id is valid
    setSessionForm(prev => {
      if (prev.course_id && !allCoursesIds.includes(prev.course_id)) {
        return { ...prev, course_id: '' };
      }
      return prev;
    });
  }, [allCoursesIds]); // Only depend on allCoursesIds, not allCourses array reference
  const { sessions, loading: sessionsLoading, createSession, updateSession, deleteSession } = useTrainingSessions({
    courseId: filters.courseId || undefined,
    status: filters.statusCode || undefined,
  });
  const { enrollments } = useTrainingEnrollments();
  const { questionBanks, loading: questionBanksLoading, createQuestionBank, updateQuestionBank, deleteQuestionBank } = useQuestionBanks({
    courseId: filters.courseId || undefined,
  });
  const { questions, createQuestion, updateQuestion, deleteQuestion, importQuestionsFromExcel } = useQuestions();

  // Utility functions
  const getStatusLabel = (statusCode: string): string => {
    const statusMap: { [key: string]: string } = {
      'SCHEDULED': 'Đã lên lịch',
      'ONGOING': 'Đang diễn ra',
      'COMPLETED': 'Hoàn thành',
      'CANCELLED': 'Đã hủy'
    };
    return statusMap[statusCode] || statusCode;
  };

  // Form handlers
  const resetForms = () => {
    setSessionForm({
      session_name: '',
      course_id: '',
      start_time: '',
      end_time: '',
      max_participants: '',
      location: '',
      status_code: 'SCHEDULED',
    });
    setQuestionForm({
      content: '',
      options: ['', '', '', ''],
      correct_answer: '',
    });
    setEditingItem(null);
  };

  const handleCourseSetSubmit = async (values: any) => {
    setSubmittingCourseSet(true);
    try {
      const courseSetData = {
        name: values.name,
        description: values.description || undefined,
      };
      
      if (editingItem) {
        await updateCourseSet(editingItem._id, courseSetData);
      } else {
        await createCourseSet(courseSetData);
      }
      closeModal();
      resetForms();
    } catch (error) {
      console.error('Error saving course set:', error);
    } finally {
      setSubmittingCourseSet(false);
    }
  };

  const handleCourseSubmit = async (values: any) => {
    setSubmittingCourse(true);
    try {
      const courseData = {
        ...values,
        duration_hours: parseInt(values.duration_hours),
        validity_months: values.validity_months ? parseInt(values.validity_months) : undefined,
        is_mandatory: values.is_mandatory || false,
      };
      
      if (editingItem) {
        await updateCourse(editingItem._id, courseData);
      } else {
        await createCourse(courseData);
      }
      closeModal();
      resetForms();
    } catch (error) {
      console.error('Error saving course:', error);
    } finally {
      setSubmittingCourse(false);
    }
  };

  const handleSessionSubmit = async () => {
    // Validate required fields
    if (!sessionForm.session_name || !sessionForm.course_id || !sessionForm.start_time || !sessionForm.end_time) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Check if courses are available
    if (!allCourses || allCourses.length === 0) {
      alert('Không có khóa học nào. Vui lòng tạo khóa học trước khi tạo buổi đào tạo.');
      return;
    }
    
    // Check if selected course exists
    const selectedCourseCheck = allCourses.find(course => course._id === sessionForm.course_id);
    if (!selectedCourseCheck) {
      alert('Khóa học được chọn không tồn tại. Vui lòng chọn khóa học hợp lệ.');
      return;
    }

    const maxParticipants = parseInt(sessionForm.max_participants);
    if (isNaN(maxParticipants) || maxParticipants < 1) {
      alert('Please enter a valid number of participants (minimum 1)');
      return;
    }
    
    setSubmittingSession(true);
    try {

      // Debug: Log current state before validation
      // Final validation completed
      console.log('Current sessionForm.course_id:', sessionForm.course_id);
      console.log('All courses available:', allCourses);
      console.log('All courses length:', allCourses?.length);
      
      // Final validation: ensure course_id is valid before sending
      if (!sessionForm.course_id || sessionForm.course_id.trim() === '') {
        console.log('❌ Course ID is empty or null');
        alert('Vui lòng chọn khóa học.');
        return;
      }

      // Double-check that the course exists
      const selectedCourseFinal = allCourses?.find(course => course._id === sessionForm.course_id);
      if (!selectedCourseFinal) {
        console.log('❌ Selected course not found in available courses');
        console.log('Looking for course_id:', sessionForm.course_id);
        console.log('Available course IDs:', allCourses?.map(c => c._id));
        alert('Khóa học được chọn không tồn tại. Vui lòng chọn khóa học hợp lệ.');
        return;
      }
      
      console.log('✅ Course validation passed');
      console.log('Selected course:', selectedCourseFinal);

      const sessionData = {
        ...sessionForm,
        start_time: new Date(sessionForm.start_time).toISOString(),
        end_time: new Date(sessionForm.end_time).toISOString(),
        max_participants: maxParticipants,
        status_code: 'SCHEDULED' as const,
      };
      
      console.log('Sending session data:', sessionData);
      console.log('Course ID:', sessionData.course_id, 'Type:', typeof sessionData.course_id);
      console.log('Start time type:', typeof sessionData.start_time, 'Value:', sessionData.start_time);
      console.log('End time type:', typeof sessionData.end_time, 'Value:', sessionData.end_time);
      console.log('Start time Date object:', new Date(sessionData.start_time));
      console.log('End time Date object:', new Date(sessionData.end_time));
      console.log('Start time timestamp:', new Date(sessionData.start_time).getTime());
      console.log('End time timestamp:', new Date(sessionData.end_time).getTime());
      console.log('Is end time after start time?', new Date(sessionData.end_time) > new Date(sessionData.start_time));
      
      if (editingItem) {
        await updateSession(editingItem._id, sessionData);
      } else {
        await createSession(sessionData);
      }
      closeModal();
      resetForms();
    } catch (error: any) {
      console.error('Error saving session:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
        
        // Log detailed validation errors
        if (error.response.data.errors) {
          console.error('Validation errors:', error.response.data.errors);
          error.response.data.errors.forEach((err: any, index: number) => {
            console.error(`Error ${index + 1}:`, err);
            console.error(`Error ${index + 1} field:`, err.field);
            console.error(`Error ${index + 1} message:`, err.message);
          });
        }
        
        // Show user-friendly error message
        const errorMessage = error.response.data.errors && error.response.data.errors.length > 0 
          ? error.response.data.errors[0].message 
          : error.response.data.message || 'Unknown error occurred';
        alert(`Error: ${errorMessage}`);
      }
    } finally {
      setSubmittingSession(false);
    }
  };

  const handleQuestionBankSubmit = async (values: any) => {
    setSubmittingQuestionBank(true);
    try {
      if (editingItem) {
        await updateQuestionBank(editingItem._id, values);
        // Toast notification đã được hiển thị trong hook
      } else {
        await createQuestionBank(values);
        // Toast notification đã được hiển thị trong hook
      }
      closeModal();
      resetForms();
    } catch (error: any) {
      console.error('Error saving question bank:', error);
      // Error message đã được hiển thị trong toast từ hook
    } finally {
      setSubmittingQuestionBank(false);
    }
  };

  const handleQuestionSubmit = async (values: any) => {
    // Get question bank ID - check if editingItem is a question bank or a question
    let bankId: string | null = null;
    let isEditingQuestion = false;
    let questionId: string | undefined;

    console.log('handleQuestionSubmit - editingItem:', editingItem);
    console.log('handleQuestionSubmit - currentQuestionBankId:', currentQuestionBankId);
    console.log('handleQuestionSubmit - editingItem.content:', editingItem?.content);
    console.log('handleQuestionSubmit - editingItem._id:', editingItem?._id);
    console.log('handleQuestionSubmit - editingItem.name:', editingItem?.name);

    if (editingItem && editingItem.content) {
      // editingItem is a question (editing mode)
      isEditingQuestion = true;
      questionId = editingItem._id;
      bankId = editingItem.bank_id?._id || editingItem.bank_id;
    } else if (currentQuestionBankId) {
      // Use stored question bank ID (most reliable)
      bankId = currentQuestionBankId;
    } else if (editingItem && editingItem._id) {
      // editingItem is a question bank (creating new question)
      // Check if it has 'name' property (question bank) or 'course_name' (course)
      // Question bank should have 'name' property, not 'content'
      if (editingItem.name || (!editingItem.content && !editingItem.course_name)) {
        bankId = editingItem._id;
      } else {
        console.error('Invalid editingItem for question bank:', editingItem);
        message.error('Không tìm thấy ngân hàng câu hỏi. Vui lòng thử lại.');
        return;
      }
    } else {
      console.error('No editingItem or currentQuestionBankId found');
      message.error('Không tìm thấy ngân hàng câu hỏi. Vui lòng đóng modal và thử lại.');
      return;
    }

    if (!bankId) {
      console.error('bankId is empty');
      message.error('Không tìm thấy ID ngân hàng câu hỏi');
      return;
    }

    // Use values from form, but fallback to questionForm state for options (since we're using controlled components)
    const content = values.content || questionForm.content;
    const optionsArray = questionForm.options; // Always use state for options
    const validOptions = optionsArray.filter((option: string) => option && option.trim() !== '');
    
    if (validOptions.length < 2) {
      message.warning('Cần ít nhất 2 lựa chọn');
      return;
    }

    const correctAnswer = values.correct_answer || questionForm.correct_answer;
    if (!correctAnswer || correctAnswer.trim() === '') {
      message.warning('Vui lòng nhập đáp án đúng');
      return;
    }

    if (!validOptions.includes(correctAnswer.trim())) {
      message.warning('Đáp án đúng phải là một trong các lựa chọn');
      return;
    }
    
    if (!content || content.trim() === '') {
      message.warning('Vui lòng nhập nội dung câu hỏi');
      return;
    }
    
    setSubmittingQuestion(true);
    try {
      const questionData = {
        bank_id: bankId,
        content: content.trim(),
        options: validOptions,
        correct_answer: correctAnswer.trim(),
      };

      // Create or update question using API
      if (isEditingQuestion && questionId) {
        // Editing existing question
        await updateQuestion(questionId, questionData);
        message.success('Cập nhật câu hỏi thành công');
      } else {
        // Creating new question
        await createQuestion(questionData);
        message.success('Thêm câu hỏi thành công');
      }
      
      closeModal();
      resetForms();
    } catch (error: any) {
      console.error('Error saving question:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Không thể lưu câu hỏi';
      message.error(errorMessage);
    } finally {
      setSubmittingQuestion(false);
    }
  };

  const handleEditCourseSet = (courseSet: any) => {
    setEditingItem(courseSet);
    openModal('addCourseSetModal', false);
  };

  const handleDeleteCourseSet = async (id: string) => {
    try {
      await deleteCourseSet(id);
    } catch (error) {
      console.error('Error deleting course set:', error);
    }
  };

  const handleEditCourse = (course: any) => {
    setEditingItem(course);
    openModal('addCourseModal', false);
  };

  const handleEditSession = (session: any) => {
    setEditingItem(session);
    setSessionForm({
      session_name: session.session_name,
      course_id: session.course_id._id,
      start_time: new Date(session.start_time).toISOString().slice(0, 16),
      end_time: new Date(session.end_time).toISOString().slice(0, 16),
      max_participants: session.max_participants?.toString() || '',
      location: session.location || '',
      status_code: session.status_code || 'SCHEDULED',
    });
    openModal('addSessionModal', false);
  };

  const handleEditQuestionBank = (bank: any) => {
    setEditingItem(bank);
    openModal('addBankModal', false);
  };

  // Delete handlers
  const handleDeleteCourse = async (id: string) => {
    try {
      await deleteCourse(id);
    } catch (error: any) {
      // Error message đã được hiển thị trong toast từ hook
      console.error('Error deleting course:', error);
    }
  };

  const handleDeleteSession = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa buổi đào tạo này?')) {
      try {
        await deleteSession(id);
      } catch (error) {
        console.error('Error deleting session:', error);
      }
    }
  };

  const handleDeleteQuestionBank = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa ngân hàng câu hỏi này?')) {
      try {
        await deleteQuestionBank(id);
      } catch (error) {
        console.error('Error deleting question bank:', error);
      }
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) {
      try {
        await deleteQuestion(id);
      } catch (error) {
        console.error('Error deleting question:', error);
      }
    }
  };

  const handleEditQuestion = (question: any) => {
    setEditingItem(question);
    setQuestionForm({
      content: question.content,
      options: question.options,
      correct_answer: question.correct_answer,
    });
    openModal('addQuestionModal');
  };

  const handleImportExcel = async () => {
    if (!excelFile || !editingItem) {
      message.warning('Vui lòng chọn file Excel và ngân hàng câu hỏi');
      return;
    }

    try {
      const result: any = await importQuestionsFromExcel(editingItem._id, excelFile);
      console.log('Import result:', result);
      
      // Handle different response formats
      const importedRows = result?.importedRows ?? (Array.isArray(result) ? result.length : (result?.questions?.length ?? 0));
      const failedRows = result?.failedRows ?? 0;
      const errors = result?.errors ?? [];
      
      if (importedRows > 0) {
        if (failedRows > 0 || errors.length > 0) {
          message.warning(
            `Đã import ${importedRows} câu hỏi thành công. Có ${failedRows} dòng bị lỗi.`,
            8
          );
          // Show first few errors if any
          if (errors.length > 0) {
            const errorPreview = errors.slice(0, 3).join('\n');
            if (errors.length > 3) {
              message.info(`${errorPreview}\n... và ${errors.length - 3} lỗi khác`, 10);
            } else {
              message.info(errorPreview, 10);
            }
          }
        } else {
          message.success(`Đã import thành công ${importedRows} câu hỏi`);
        }
      } else {
        // No questions imported
        if (failedRows > 0 || errors.length > 0) {
          const errorMessage = errors.length > 0 
            ? `Không thể import câu hỏi nào. Lỗi:\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? `\n... và ${errors.length - 5} lỗi khác` : ''}`
            : `Không thể import câu hỏi nào. Có ${failedRows} dòng bị lỗi.`;
          message.error(errorMessage, 10);
        } else {
          message.warning('Không có câu hỏi nào được import. Vui lòng kiểm tra lại file Excel.');
        }
      }
      setExcelFile(null);
      closeModal();
    } catch (error: any) {
      console.error('Error importing Excel:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Không thể import câu hỏi từ Excel';
      message.error(errorMessage, 8);
    }
  };

  const handleDownloadTemplate = () => {
    try {
      downloadQuestionTemplate();
    } catch (error) {
      console.error('Error downloading template:', error);
      alert('Có lỗi xảy ra khi tải template. Vui lòng thử lại.');
    }
  };

  // Assignment handlers
  const handleEditAssignment = (assignment: any) => {
    setEditingItem(assignment);
    openModal('editAssignmentModal');
  };

  const handleDeleteAssignment = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa gán khóa học này?')) {
      try {
        await deleteAssignment(id);
      } catch (error) {
        console.error('Error deleting assignment:', error);
      }
    }
  };


  const formatDateTime = (dateTimeString: string): string => {
    return new Date(dateTimeString).toLocaleString('vi-VN');
  };

  // Navigation handlers
  const handleCourseSetClick = (courseSet: any) => {
    setSelectedCourseSet(courseSet);
    setSelectedCourse(null);
    setCurrentView('courses');
    setFilters(prev => ({ ...prev, courseSetId: courseSet._id }));
  };

  const handleCourseClick = (course: any) => {
    setSelectedCourse(course);
    setCurrentView('question-banks');
    setFilters(prev => ({ ...prev, courseId: course._id }));
  };

  const handleBackToCourseSets = () => {
    setCurrentView('course-sets');
    setSelectedCourseSet(null);
    setSelectedCourse(null);
    setFilters(prev => ({ ...prev, courseSetId: '', courseId: '' }));
  };

  const handleBackToCourses = () => {
    setCurrentView('courses');
    setSelectedCourse(null);
    setFilters(prev => ({ ...prev, courseId: '' }));
  };

  const switchTab = (tabName: 'sessions' | 'enrollments' | 'assignments') => {
    setCurrentView(tabName);
    setSelectedCourseSet(null);
    setSelectedCourse(null);
    setFilters(prev => ({ ...prev, courseSetId: '', courseId: '' }));
  };

  const openModal = (modalId: string, shouldReset: boolean = true) => {
    console.log('Opening modal:', modalId, 'Current editingItem:', editingItem);
    setShowModal(modalId);
    if (shouldReset) {
      resetForms();
    }
  };

  const openModalWithData = (modalId: string, data: any) => {
    console.log('Opening modal with data:', modalId, 'Data:', data);
    setEditingItem(data);
    // If opening manage questions modal, store the question bank ID
    if (modalId === 'manageQuestionsModal' && data && data._id) {
      setCurrentQuestionBankId(data._id);
    }
    setShowModal(modalId);
    // Không gọi resetForms() để không reset editingItem
  };

  const closeModal = () => {
    setShowModal(null);
    setEditingItem(null);
    setCurrentQuestionBankId(null);
    resetForms();
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <motion.div 
      style={{ 
        padding: '32px', 
        background: 'linear-gradient(180deg, #f0f9ff 0%, #ffffff 40%, #f8fafc 100%)',
        minHeight: '100vh',
        position: 'relative'
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background decorative elements */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            radial-gradient(circle at 10% 20%, rgba(102, 126, 234, 0.1), transparent 50%),
            radial-gradient(circle at 90% 80%, rgba(118, 75, 162, 0.08), transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.05), transparent 60%)
          `,
          backgroundPosition: '10% 20%, 90% 80%, 50% 50%',
          backgroundSize: 'auto, auto, auto',
          backgroundRepeat: 'no-repeat',
          zIndex: 0,
          pointerEvents: 'none'
        }}
      />
      
      <div style={{ 
        position: 'relative', 
        zIndex: 1, 
        maxWidth: '1600px', 
        margin: '0 auto'
      }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card
            styles={{ body: { padding: '24px 32px' } }}
            style={{ 
              marginBottom: '32px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(239, 246, 255, 0.8) 100%)',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 20px 60px rgba(102, 126, 234, 0.12), 0 0 0 1px rgba(102, 126, 234, 0.05)',
              border: 'none'
            }}
          >
          <Row justify="space-between" align="middle">
            <Col>
              <Space direction="vertical" size={0}>
                <Typography.Title 
                  level={2} 
                  style={{ 
                    margin: 0, 
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontWeight: 700,
                    fontSize: '28px'
                  }}
                >
                  <BookOutlined style={{ 
                    color: '#667eea',
                    fontSize: '32px',
                    filter: 'drop-shadow(0 2px 4px rgba(102, 126, 234, 0.3))'
                  }} />
                  Quản lý đào tạo
                </Typography.Title>
                <Breadcrumb 
                  style={{ marginTop: '4px' }}
                  separator={<span style={{ color: '#94a3b8' }}>/</span>}
                >
                  <Breadcrumb.Item>
                    <a 
                      href="/header-department/dashboard"
                      style={{ 
                        color: '#64748b',
                        textDecoration: 'none',
                        transition: 'all 0.3s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#667eea'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
                    >
                      Dashboard
                    </a>
                  </Breadcrumb.Item>
                  <Breadcrumb.Item>
                    <span style={{ color: '#1e293b', fontWeight: 500 }}>Quản lý đào tạo</span>
                  </Breadcrumb.Item>
                </Breadcrumb>
              </Space>
            </Col>
            <Col>
              <Button 
                type="default" 
                icon={<ArrowLeftOutlined />}
                href="/header-department/dashboard"
                size="large"
                style={{
                  borderRadius: '10px',
                  height: '40px',
                  padding: '0 20px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                  border: '1px solid #e2e8f0',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.12)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Quay lại
              </Button>
            </Col>
          </Row>
        </Card>
        </motion.div>

        {/* Navigation Menu */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card
            styles={{ body: { padding: '16px 24px' } }}
            style={{
              borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(239, 246, 255, 0.8) 100%)',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 20px 60px rgba(102, 126, 234, 0.12), 0 0 0 1px rgba(102, 126, 234, 0.05)',
              border: 'none',
              marginBottom: '24px'
            }}
          >
            <Space wrap size="middle">
              <Button
                type={currentView === 'course-sets' ? 'primary' : 'default'}
                icon={<FolderOutlined />}
                onClick={() => {
                  setCurrentView('course-sets');
                  setSelectedCourseSet(null);
                  setSelectedCourse(null);
                  setFilters(prev => ({ ...prev, courseSetId: '', courseId: '' }));
                }}
                style={{
                  borderRadius: '8px',
                  height: '40px',
                  padding: '0 20px',
                  fontWeight: currentView === 'course-sets' ? 600 : 400
                }}
              >
                Bộ khóa học
              </Button>
              <Button
                type={currentView === 'sessions' ? 'primary' : 'default'}
                icon={<CalendarOutlined />}
                onClick={() => switchTab('sessions')}
                style={{
                  borderRadius: '8px',
                  height: '40px',
                  padding: '0 20px',
                  fontWeight: currentView === 'sessions' ? 600 : 400
                }}
              >
                Buổi đào tạo
              </Button>
              <Button
                type={currentView === 'enrollments' ? 'primary' : 'default'}
                icon={<UserOutlined />}
                onClick={() => switchTab('enrollments')}
                style={{
                  borderRadius: '8px',
                  height: '40px',
                  padding: '0 20px',
                  fontWeight: currentView === 'enrollments' ? 600 : 400
                }}
              >
                Đăng ký tham gia
              </Button>
              <Button
                type={currentView === 'assignments' ? 'primary' : 'default'}
                icon={<TeamOutlined />}
                onClick={() => switchTab('assignments')}
                style={{
                  borderRadius: '8px',
                  height: '40px',
                  padding: '0 20px',
                  fontWeight: currentView === 'assignments' ? 600 : 400
                }}
              >
                Gán khóa học
              </Button>
            </Space>
          </Card>

          {/* Breadcrumb Navigation */}
          {(currentView === 'courses' || currentView === 'question-banks') && (
            <Card
              styles={{ body: { padding: '16px 24px' } }}
              style={{
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.9)',
                marginBottom: '24px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
              }}
            >
              <Breadcrumb
                separator={<span style={{ color: '#94a3b8' }}>/</span>}
                items={[
                  {
                    title: (
                      <Button
                        type="link"
                        icon={<FolderOutlined />}
                        onClick={handleBackToCourseSets}
                        style={{ padding: 0, height: 'auto' }}
                      >
                        Bộ khóa học
                      </Button>
                    )
                  },
                  selectedCourseSet && {
                    title: currentView === 'courses' ? (
                      <span style={{ color: '#1e293b', fontWeight: 500 }}>
                        {selectedCourseSet.name}
                      </span>
                    ) : (
                      <Button
                        type="link"
                        icon={<BookOutlined />}
                        onClick={handleBackToCourses}
                        style={{ padding: 0, height: 'auto' }}
                      >
                        {selectedCourseSet.name}
                      </Button>
                    )
                  },
                  currentView === 'question-banks' && selectedCourse && {
                    title: (
                      <span style={{ color: '#1e293b', fontWeight: 500 }}>
                        {selectedCourse.course_name}
                      </span>
                    )
                  }
                ].filter(Boolean)}
              />
            </Card>
          )}

          {/* Content Card */}
          <Card
            styles={{ body: { padding: '24px' } }}
            style={{
              borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(239, 246, 255, 0.8) 100%)',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 20px 60px rgba(102, 126, 234, 0.12), 0 0 0 1px rgba(102, 126, 234, 0.05)',
              border: 'none',
              overflow: 'hidden'
            }}
          >

          {/* Course Sets View */}
          {currentView === 'course-sets' && (
            <motion.div 
              style={{ marginTop: '24px' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card
                styles={{ body: { padding: '24px' } }}
                style={{
                  borderRadius: '20px',
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(8px)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 4px 16px rgba(0, 0, 0, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.8)',
                  transition: 'all 0.3s ease'
                }}
              >
                <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
                  <Col>
                    <Input
                      placeholder="Tìm kiếm bộ khóa học..."
                      prefix={<SearchOutlined />}
                      style={{ 
                        width: 320,
                        borderRadius: '8px',
                        height: '40px'
                      }}
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                    />
                  </Col>
                  <Col>
                    <Button 
                      type="primary" 
                      icon={<PlusOutlined />}
                      onClick={() => openModal('addCourseSetModal')}
                      style={{
                        borderRadius: '10px',
                        height: '44px',
                        padding: '0 28px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                        fontWeight: 600,
                        fontSize: '15px',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.5)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
                      }}
                    >
                      Tạo bộ khóa học
                    </Button>
                  </Col>
                </Row>

                {courseSetsLoading ? (
                  <div style={{ textAlign: 'center', padding: '100px' }}>
                    <Spin size="large" style={{ color: '#667eea' }} />
                    <div style={{ marginTop: '24px', fontSize: '16px', color: '#666', fontWeight: 500 }}>Đang tải dữ liệu...</div>
                  </div>
                ) : courseSets.length === 0 ? (
                  <Empty
                    image={<BookOutlined style={{ fontSize: '100px', color: '#d9d9d9', opacity: 0.5 }} />}
                    description={
                      <div>
                        <Typography.Title level={4} style={{ color: '#1a1a1a', marginBottom: '12px', fontWeight: 600 }}>
                          Chưa có bộ khóa học nào
                        </Typography.Title>
                        <Typography.Text type="secondary" style={{ fontSize: '15px', color: '#8c8c8c' }}>
                          Hãy tạo bộ khóa học đầu tiên để bắt đầu quản lý đào tạo
                        </Typography.Text>
                      </div>
                    }
                  >
                    <Button 
                      type="primary" 
                      icon={<PlusOutlined />}
                      onClick={() => openModal('addCourseSetModal')}
                      style={{
                        borderRadius: '10px',
                        height: '44px',
                        padding: '0 28px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                        fontWeight: 600,
                        fontSize: '15px',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.5)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
                      }}
                    >
                      Tạo bộ khóa học
                    </Button>
                  </Empty>
                ) : (
                  <Row gutter={[24, 24]} style={{ display: 'flex', alignItems: 'stretch' }}>
                    {courseSets
                      .filter(courseSet => 
                        !filters.search || 
                        courseSet.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                        (courseSet.description && courseSet.description.toLowerCase().includes(filters.search.toLowerCase()))
                      )
                      .map(courseSet => (
                      <Col xs={24} sm={12} lg={8} xl={6} key={courseSet._id} style={{ display: 'flex' }}>
                        <motion.div
                          whileHover={{ y: -8, scale: 1.02 }}
                          transition={{ duration: 0.2 }}
                          style={{ width: '100%', display: 'flex' }}
                        >
                          <Card
                            hoverable
                            onClick={() => handleCourseSetClick(courseSet)}
                            style={{ 
                              height: '100%',
                              width: '100%',
                              borderRadius: '18px',
                              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.04)',
                              border: '1px solid rgba(255, 255, 255, 0.8)',
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              background: 'rgba(255, 255, 255, 0.95)',
                              backdropFilter: 'blur(8px)',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column'
                            }}
                            bodyStyle={{
                              padding: '20px',
                              flex: 1,
                              display: 'flex',
                              flexDirection: 'column'
                            }}
                            actions={[
                            <Tooltip title="Sửa">
                              <Button 
                                type="text" 
                                icon={<EditOutlined />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditCourseSet(courseSet);
                                }}
                              />
                            </Tooltip>,
                            <Popconfirm
                              title="Xóa bộ khóa học"
                              description="Bạn có chắc chắn muốn xóa bộ khóa học này? Tất cả các khóa học trong bộ này sẽ bị ảnh hưởng."
                              onConfirm={(e) => {
                                e?.stopPropagation();
                                handleDeleteCourseSet(courseSet._id);
                              }}
                              okText="Xóa"
                              cancelText="Hủy"
                            >
                              <Tooltip title="Xóa">
                                <Button 
                                  type="text" 
                                  danger
                                  icon={<DeleteOutlined />}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </Tooltip>
                            </Popconfirm>
                          ]}
                        >
                          <Card.Meta
                            avatar={
                              <div style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: '16px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '28px',
                                color: '#fff',
                                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                                transition: 'all 0.3s ease'
                              }}>
                                <FolderOutlined />
                              </div>
                            }
                            title={
                              <Typography.Text strong style={{ fontSize: '18px', color: '#1a1a1a' }}>
                                {courseSet.name}
                              </Typography.Text>
                            }
                            description={
                              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <Typography.Paragraph 
                                  ellipsis={{ rows: 3 }} 
                                  style={{ marginBottom: '12px', color: '#666', fontSize: '14px', lineHeight: '1.6', flex: 1 }}
                                >
                                  {courseSet.description || 'Không có mô tả'}
                                </Typography.Paragraph>
                              </div>
                            }
                          />
                          </Card>
                        </motion.div>
                      </Col>
                    ))}
                  </Row>
                )}
              </Card>
            </motion.div>
          )}

          {/* Courses View */}
          {currentView === 'courses' && (
            <motion.div 
              style={{ marginTop: '24px' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card
                styles={{ body: { padding: '24px' } }}
                style={{
                  borderRadius: '20px',
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(8px)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 4px 16px rgba(0, 0, 0, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.8)',
                  transition: 'all 0.3s ease'
                }}
              >
                {selectedCourseSet && (
                  <div style={{ marginBottom: '20px', padding: '16px', background: 'linear-gradient(135deg, #e6f7ff 0%, #f0f5ff 100%)', borderRadius: '12px', border: '1px solid rgba(24, 144, 255, 0.2)' }}>
                    <Space>
                      <FolderOutlined style={{ color: '#1890ff', fontSize: '20px' }} />
                      <Typography.Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
                        Bộ khóa học: {selectedCourseSet.name}
                      </Typography.Text>
                    </Space>
                  </div>
                )}
                <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
                  <Col>
                    <Space wrap>
                      <Input
                        placeholder="Tìm kiếm khóa học..."
                        prefix={<SearchOutlined />}
                        style={{ 
                          width: 300,
                          borderRadius: '8px',
                          height: '40px'
                        }}
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                      />
                      
                      <Select
                        placeholder="Tất cả"
                        style={{ 
                          width: 150,
                          borderRadius: '8px'
                        }}
                        value={filters.isMandatory}
                        onChange={(value) => handleFilterChange('isMandatory', value)}
                        allowClear
                      >
                        <Select.Option value="true">Bắt buộc</Select.Option>
                        <Select.Option value="false">Tự chọn</Select.Option>
                      </Select>
                    </Space>
                  </Col>
                  <Col>
                    <Button 
                      type="primary" 
                      icon={<PlusOutlined />}
                      onClick={() => {
                        if (selectedCourseSet) {
                          // Pre-fill course_set_id when creating from course set view
                          setEditingItem({ course_set_id: selectedCourseSet._id });
                        }
                        openModal('addCourseModal');
                      }}
                      style={{
                        borderRadius: '8px',
                        height: '40px',
                        padding: '0 24px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                        fontWeight: 600
                      }}
                    >
                      Tạo khóa học
                    </Button>
                  </Col>
                </Row>

                {coursesLoading ? (
                  <div style={{ textAlign: 'center', padding: '80px' }}>
                    <Spin size="large" style={{ color: '#667eea' }} />
                    <div style={{ marginTop: '24px', fontSize: '16px', color: '#666' }}>Đang tải dữ liệu...</div>
                  </div>
                ) : courses.length === 0 ? (
                  <Empty
                    image={<BookOutlined style={{ fontSize: '80px', color: '#d9d9d9' }} />}
                    description={
                      <div>
                        <Typography.Title level={4} style={{ color: '#1a1a1a', marginBottom: '8px' }}>
                          Chưa có khóa học nào
                        </Typography.Title>
                        <Typography.Text type="secondary" style={{ fontSize: '14px' }}>
                          Hãy tạo khóa học đầu tiên để bắt đầu quản lý đào tạo
                        </Typography.Text>
                      </div>
                    }
                  >
                    <Button 
                      type="primary" 
                      icon={<PlusOutlined />}
                      onClick={() => openModal('addCourseModal')}
                      style={{
                        borderRadius: '8px',
                        height: '40px',
                        padding: '0 24px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                        fontWeight: 600
                      }}
                    >
                      Tạo khóa học
                    </Button>
                  </Empty>
                ) : (
                  <Row gutter={[24, 24]} style={{ display: 'flex', alignItems: 'stretch' }}>
                    {courses
                      .filter(course => !selectedCourseSet || course.course_set_id?._id === selectedCourseSet._id || course.course_set_id === selectedCourseSet._id)
                      .map(course => (
                      <Col xs={24} sm={12} lg={8} xl={6} key={course._id} style={{ display: 'flex' }}>
                        <motion.div
                          whileHover={{ y: -8, scale: 1.02 }}
                          transition={{ duration: 0.2 }}
                          style={{ width: '100%', display: 'flex' }}
                        >
                          <Card
                            hoverable
                            onClick={() => handleCourseClick(course)}
                            style={{ 
                              height: '100%',
                              width: '100%',
                              borderRadius: '18px',
                              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.04)',
                              border: '1px solid rgba(255, 255, 255, 0.8)',
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              background: 'rgba(255, 255, 255, 0.95)',
                              backdropFilter: 'blur(8px)',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column'
                            }}
                            bodyStyle={{
                              padding: '20px',
                              flex: 1,
                              display: 'flex',
                              flexDirection: 'column'
                            }}
                            actions={[
                            <Tooltip title="Sửa">
                              <Button 
                                type="text" 
                                icon={<EditOutlined />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditCourse(course);
                                }}
                              />
                            </Tooltip>,
                            <Tooltip title="Xem">
                              <Button 
                                type="text" 
                                icon={<EyeOutlined />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openModalWithData('viewCourseModal', course);
                                }}
                              />
                            </Tooltip>,
                            <Tooltip title="Câu hỏi">
                              <Button 
                                type="text" 
                                icon={<QuestionCircleOutlined />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCourseClick(course);
                                }}
                              />
                            </Tooltip>,
                            course.is_deployed ? (
                              <Popconfirm
                                title="Hủy triển khai khóa học"
                                description="Bạn có chắc chắn muốn hủy triển khai khóa học này? Nhân viên sẽ không thể thấy khóa học này nữa."
                                onConfirm={(e) => {
                                  e?.stopPropagation();
                                  undeployCourse(course._id);
                                }}
                                okText="Hủy triển khai"
                                cancelText="Hủy"
                              >
                                <Tooltip title="Hủy triển khai">
                                  <Button 
                                    type="text" 
                                    icon={<InfoCircleOutlined />}
                                    style={{ color: '#faad14' }}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </Tooltip>
                              </Popconfirm>
                            ) : (
                              <Popconfirm
                                title="Triển khai khóa học"
                                description="Bạn có chắc chắn muốn triển khai khóa học này? Khóa học sẽ hiển thị cho nhân viên sau khi được gán cho phòng ban."
                                onConfirm={(e) => {
                                  e?.stopPropagation();
                                  deployCourse(course._id);
                                }}
                                okText="Triển khai"
                                cancelText="Hủy"
                              >
                                <Tooltip title="Triển khai">
                                  <Button 
                                    type="text" 
                                    icon={<CheckCircleOutlined />}
                                    style={{ color: '#52c41a' }}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </Tooltip>
                              </Popconfirm>
                            ),
                            <Popconfirm
                              title="Xóa khóa học"
                              description="Bạn có chắc chắn muốn xóa khóa học này?"
                              onConfirm={(e) => {
                                e?.stopPropagation();
                                handleDeleteCourse(course._id);
                              }}
                              okText="Xóa"
                              cancelText="Hủy"
                            >
                              <Tooltip title="Xóa">
                                <Button 
                                  type="text" 
                                  danger
                                  icon={<DeleteOutlined />}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </Tooltip>
                            </Popconfirm>
                          ]}
                        >
                          <Card.Meta
                            avatar={
                              <div style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: '16px',
                                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '28px',
                                color: '#fff',
                                boxShadow: '0 4px 12px rgba(240, 147, 251, 0.3)',
                                transition: 'all 0.3s ease'
                              }}>
                                <BookOutlined />
                              </div>
                            }
                            title={
                              <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center', 
                                marginBottom: '8px',
                                gap: '8px',
                                flexWrap: 'wrap'
                              }}>
                                <Typography.Text 
                                  strong 
                                  style={{ 
                                    fontSize: '18px', 
                                    color: '#1a1a1a',
                                    flex: '1 1 auto',
                                    minWidth: 0
                                  }}
                                  ellipsis={{ tooltip: course.course_name }}
                                >
                                  {course.course_name}
                                </Typography.Text>
                                {course.is_mandatory && (
                                  <Tag 
                                    color="red"
                                    style={{
                                      borderRadius: '8px',
                                      padding: '4px 12px',
                                      fontSize: '12px',
                                      fontWeight: 600,
                                      whiteSpace: 'nowrap',
                                      flexShrink: 0,
                                      marginLeft: 'auto'
                                    }}
                                  >
                                    Bắt buộc
                                  </Tag>
                                )}
                              </div>
                            }
                            description={
                              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <Typography.Paragraph 
                                  ellipsis={{ rows: 2 }} 
                                  style={{ marginBottom: '16px', color: '#666', fontSize: '14px', lineHeight: '1.6' }}
                                >
                                  {course.description}
                                </Typography.Paragraph>
                                
                                <Space direction="vertical" size={8} style={{ width: '100%', flex: 1 }}>
                                  <div style={{
                                    padding: '10px 14px',
                                    background: 'linear-gradient(135deg, #e6f7ff 0%, #f0f5ff 100%)',
                                    borderRadius: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    border: '1px solid rgba(24, 144, 255, 0.1)',
                                    transition: 'all 0.2s ease'
                                  }}>
                                    <ClockCircleOutlined style={{ color: '#1890ff', fontSize: '18px' }} />
                                    <Typography.Text style={{ fontSize: '14px', color: '#1890ff', fontWeight: 500 }}>
                                      {course.duration_hours} giờ
                                    </Typography.Text>
                                  </div>
                                  <div style={{
                                    padding: '10px 14px',
                                    background: 'linear-gradient(135deg, #f6ffed 0%, #fcffe6 100%)',
                                    borderRadius: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    border: '1px solid rgba(82, 196, 26, 0.1)',
                                    transition: 'all 0.2s ease'
                                  }}>
                                    <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '18px' }} />
                                    <Typography.Text style={{ fontSize: '14px', color: '#52c41a', fontWeight: 500 }}>
                                      {course.validity_months ? course.validity_months + ' tháng' : 'Vĩnh viễn'}
                                    </Typography.Text>
                                  </div>
                                  <div style={{
                                    padding: '10px 14px',
                                    background: 'linear-gradient(135deg, #f9f0ff 0%, #efdbff 100%)',
                                    borderRadius: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    border: '1px solid rgba(114, 46, 209, 0.1)',
                                    transition: 'all 0.2s ease'
                                  }}>
                                    <BookOutlined style={{ color: '#722ed1', fontSize: '18px' }} />
                                    <Typography.Text style={{ fontSize: '14px', color: '#722ed1', fontWeight: 500 }}>
                                      {course.course_set_id?.name || 'N/A'}
                                    </Typography.Text>
                                  </div>
                                </Space>
                              </div>
                            }
                          />
                          </Card>
                        </motion.div>
                      </Col>
                    ))}
                  </Row>
                )}
              </Card>
            </motion.div>
          )}

          {/* Sessions View */}
          {currentView === 'sessions' && (
            <motion.div 
              style={{ marginTop: '24px' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card
                styles={{ body: { padding: '24px' } }}
                style={{
                  borderRadius: '20px',
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(8px)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 4px 16px rgba(0, 0, 0, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.8)',
                  transition: 'all 0.3s ease'
                }}
              >
                <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
                  <Col>
                    <Space wrap>
                      <Input
                        placeholder="Tìm kiếm buổi đào tạo..."
                        prefix={<SearchOutlined />}
                        style={{ 
                          width: 300,
                          borderRadius: '8px',
                          height: '40px'
                        }}
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                      />
                      
                      <Select
                        placeholder="Tất cả trạng thái"
                        style={{ 
                          width: 180,
                          borderRadius: '8px'
                        }}
                        value={filters.statusCode}
                        onChange={(value) => handleFilterChange('statusCode', value)}
                        allowClear
                      >
                        <Select.Option value="SCHEDULED">Đã lên lịch</Select.Option>
                        <Select.Option value="ONGOING">Đang diễn ra</Select.Option>
                        <Select.Option value="COMPLETED">Hoàn thành</Select.Option>
                        <Select.Option value="CANCELLED">Đã hủy</Select.Option>
                      </Select>

                      <Select
                        placeholder="Tất cả khóa học"
                        style={{ 
                          width: 200,
                          borderRadius: '8px'
                        }}
                        value={filters.courseId}
                        onChange={(value) => handleFilterChange('courseId', value)}
                        allowClear
                      >
                        {courses.map(course => (
                          <Select.Option key={course._id} value={course._id}>
                            {course.course_name}
                          </Select.Option>
                        ))}
                      </Select>
                    </Space>
                  </Col>
                  <Col>
                    <Button 
                      type="primary" 
                      icon={<PlusOutlined />}
                      onClick={() => openModal('addSessionModal')}
                      style={{
                        borderRadius: '8px',
                        height: '40px',
                        padding: '0 24px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                        fontWeight: 600
                      }}
                    >
                      Lên lịch đào tạo
                    </Button>
                  </Col>
                </Row>

                {sessionsLoading ? (
                  <div style={{ textAlign: 'center', padding: '80px' }}>
                    <Spin size="large" style={{ color: '#667eea' }} />
                    <div style={{ marginTop: '24px', fontSize: '16px', color: '#666' }}>Đang tải dữ liệu...</div>
                  </div>
                ) : sessions.length === 0 ? (
                  <Empty
                    image={<CalendarOutlined style={{ fontSize: '80px', color: '#d9d9d9' }} />}
                    description={
                      <div>
                        <Typography.Title level={4} style={{ color: '#1a1a1a', marginBottom: '8px' }}>
                          Chưa có buổi đào tạo nào
                        </Typography.Title>
                        <Typography.Text type="secondary" style={{ fontSize: '14px' }}>
                          Hãy lên lịch buổi đào tạo đầu tiên
                        </Typography.Text>
                      </div>
                    }
                  >
                    <Button 
                      type="primary" 
                      icon={<PlusOutlined />}
                      onClick={() => openModal('addSessionModal')}
                      style={{
                        borderRadius: '8px',
                        height: '40px',
                        padding: '0 24px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                        fontWeight: 600
                      }}
                    >
                      Lên lịch đào tạo
                    </Button>
                  </Empty>
                ) : (
                  <Row gutter={[24, 24]} style={{ display: 'flex', alignItems: 'stretch' }}>
                    {sessions.map(session => {
                      const getStatusColor = (status: string) => {
                        switch (status) {
                          case 'SCHEDULED': return 'blue';
                          case 'ONGOING': return 'orange';
                          case 'COMPLETED': return 'green';
                          case 'CANCELLED': return 'red';
                          default: return 'default';
                        }
                      };

                      return (
                        <Col xs={24} sm={12} lg={8} xl={6} key={session._id} style={{ display: 'flex' }}>
                          <motion.div
                            whileHover={{ y: -8, scale: 1.02 }}
                            transition={{ duration: 0.2 }}
                            style={{ width: '100%', display: 'flex' }}
                          >
                            <Card
                              hoverable
                              style={{ 
                                height: '100%',
                                width: '100%',
                                borderRadius: '18px',
                                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.04)',
                                border: '1px solid rgba(255, 255, 255, 0.8)',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                background: 'rgba(255, 255, 255, 0.95)',
                                backdropFilter: 'blur(8px)',
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column'
                              }}
                              bodyStyle={{
                                padding: '20px',
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column'
                              }}
                            actions={[
                              <Tooltip title="Sửa">
                                <Button 
                                  type="text" 
                                  icon={<EditOutlined />}
                                  onClick={() => handleEditSession(session)}
                                />
                              </Tooltip>,
                              <Tooltip title="Chi tiết">
                                <Button 
                                  type="text" 
                                  icon={<EyeOutlined />}
                                  onClick={() => openModalWithData('viewSessionModal', session)}
                                />
                              </Tooltip>,
                              <Tooltip title="Đăng ký">
                                <Button 
                                  type="text" 
                                  icon={<UserOutlined />}
                                  onClick={() => openModalWithData('enrollmentModal', session)}
                                />
                              </Tooltip>,
                              <Popconfirm
                                title="Xóa buổi đào tạo"
                                description="Bạn có chắc chắn muốn xóa buổi đào tạo này?"
                                onConfirm={() => handleDeleteSession(session._id)}
                                okText="Xóa"
                                cancelText="Hủy"
                              >
                                <Tooltip title="Xóa">
                                  <Button 
                                    type="text" 
                                    danger
                                    icon={<DeleteOutlined />}
                                  />
                                </Tooltip>
                              </Popconfirm>
                            ]}
                          >
                            <Card.Meta
                              avatar={
                                <div style={{
                                  width: '56px',
                                  height: '56px',
                                  borderRadius: '12px',
                                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '24px',
                                  color: '#fff'
                                }}>
                                  <CalendarOutlined />
                                </div>
                              }
                              title={
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                  <Typography.Text strong style={{ fontSize: '18px', color: '#1a1a1a' }}>
                                    {session.session_name}
                                  </Typography.Text>
                                  <Tag 
                                    color={getStatusColor(session.status_code)}
                                    style={{
                                      borderRadius: '6px',
                                      padding: '2px 8px',
                                      fontSize: '12px',
                                      fontWeight: 600
                                    }}
                                  >
                                    {getStatusLabel(session.status_code)}
                                  </Tag>
                                </div>
                              }
                              description={
                                <div>
                                  <Typography.Text type="secondary" style={{ fontSize: '14px', fontWeight: 500 }}>
                                    {session.course_id.course_name}
                                  </Typography.Text>
                                  
                                  <Divider style={{ margin: '16px 0', borderColor: '#f0f0f0' }} />
                                  
                                  <Space direction="vertical" size={8} style={{ width: '100%' }}>
                                    <div style={{
                                      padding: '10px 14px',
                                      background: 'linear-gradient(135deg, #e6f7ff 0%, #f0f5ff 100%)',
                                      borderRadius: '10px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '10px',
                                      border: '1px solid rgba(24, 144, 255, 0.1)'
                                    }}>
                                      <CalendarOutlined style={{ color: '#1890ff', fontSize: '16px' }} />
                                      <Typography.Text style={{ fontSize: '13px', color: '#1890ff', fontWeight: 500 }}>
                                        {formatDateTime(session.start_time)}
                                      </Typography.Text>
                                    </div>
                                    <div style={{
                                      padding: '10px 14px',
                                      background: 'linear-gradient(135deg, #f6ffed 0%, #fcffe6 100%)',
                                      borderRadius: '10px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '10px',
                                      border: '1px solid rgba(82, 196, 26, 0.1)'
                                    }}>
                                      <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '16px' }} />
                                      <Typography.Text style={{ fontSize: '13px', color: '#52c41a', fontWeight: 500 }}>
                                        {formatDateTime(session.end_time)}
                                      </Typography.Text>
                                    </div>
                                    <div style={{
                                      padding: '10px 14px',
                                      background: 'linear-gradient(135deg, #f9f0ff 0%, #efdbff 100%)',
                                      borderRadius: '10px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '10px',
                                      border: '1px solid rgba(114, 46, 209, 0.1)'
                                    }}>
                                      <InfoCircleOutlined style={{ color: '#722ed1', fontSize: '16px' }} />
                                      <Typography.Text style={{ fontSize: '13px', color: '#722ed1', fontWeight: 500 }}>
                                        {session.location || 'Chưa xác định'}
                                      </Typography.Text>
                                    </div>
                                  </Space>
                                </div>
                              }
                            />
                          </Card>
                        </motion.div>
                        </Col>
                      );
                    })}
                  </Row>
                )}
              </Card>
            </motion.div>
          )}

          {/* Enrollments View */}
          {currentView === 'enrollments' && (
            <motion.div 
              style={{ marginTop: '24px' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card
                styles={{ body: { padding: '24px' } }}
                style={{
                  borderRadius: '20px',
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(8px)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 4px 16px rgba(0, 0, 0, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.8)',
                  transition: 'all 0.3s ease'
                }}
              >
                <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
                  <Col>
                    <Space wrap>
                      <Input
                        placeholder="Tìm kiếm theo tên nhân viên..."
                        prefix={<SearchOutlined />}
                        style={{ 
                          width: 320,
                          borderRadius: '10px',
                          height: '44px'
                        }}
                      />
                      
                      <Select
                        placeholder="Tất cả trạng thái"
                        style={{ 
                          width: 200,
                          borderRadius: '10px',
                          height: '44px'
                        }}
                        allowClear
                      >
                        <Select.Option value="enrolled">Đã đăng ký</Select.Option>
                        <Select.Option value="completed">Hoàn thành</Select.Option>
                        <Select.Option value="failed">Chưa đạt</Select.Option>
                      </Select>
                    </Space>
                  </Col>
                  {/* Nút Xuất báo cáo đã được loại bỏ theo yêu cầu */}
                </Row>

                <Table
                  dataSource={enrollments}
                  rowKey="_id"
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} mục`
                  }}
                  style={{
                    borderRadius: '12px',
                    overflow: 'hidden'
                  }}
                  className="training-table"
                  columns={[
                    {
                      title: 'Nhân viên',
                      dataIndex: ['user_id', 'full_name'],
                      key: 'user',
                      render: (text: string) => (
                        <Space>
                          <Avatar size="small" icon={<UserOutlined />} />
                          <Typography.Text strong>{text}</Typography.Text>
                        </Space>
                      )
                    },
                    {
                      title: 'Email',
                      dataIndex: ['user_id', 'email'],
                      key: 'email',
                      render: (text: string) => (
                        <Typography.Text type="secondary">{text}</Typography.Text>
                      )
                    },
                    {
                      title: 'Khóa học',
                      key: 'course',
                      render: (_, record: any) => {
                        const session = record?.session_id?._id
                          ? sessions.find(s => s._id === record.session_id._id)
                          : null;

                        const courseName =
                          session?.course_id?.course_name ||
                          record?.course_id?.course_name ||
                          'Không xác định';

                        return courseName;
                      }
                    },
                    {
                      title: 'Ngày đăng ký',
                      dataIndex: 'enrolled_at',
                      key: 'enrolled_at',
                      render: (text: string) => formatDateTime(text)
                    },
                    {
                      title: 'Trạng thái',
                      dataIndex: 'status',
                      key: 'status',
                      render: (status: string) => {
                        const getStatusColor = (status: string) => {
                          switch (status) {
                            case 'enrolled': return 'blue';
                            case 'completed': return 'green';
                            case 'failed': return 'red';
                            default: return 'default';
                          }
                        };

                        const getStatusText = (status: string) => {
                          switch (status) {
                            case 'enrolled': return 'Đã đăng ký';
                            case 'completed': return 'Hoàn thành';
                            case 'failed': return 'Chưa đạt';
                            default: return status;
                          }
                        };

                        return (
                          <Tag color={getStatusColor(status)}>
                            {getStatusText(status)}
                          </Tag>
                        );
                      }
                    },
                    {
                      title: 'Điểm số',
                      dataIndex: 'score',
                      key: 'score',
                      render: (score: number, record: any) => {
                        if (!score) return <Typography.Text type="secondary">-</Typography.Text>;
                        
                        const color = record.passed ? '#52c41a' : '#ff4d4f';
                        return (
                          <Typography.Text style={{ color, fontWeight: 600 }}>
                            {score}/100
                          </Typography.Text>
                        );
                      }
                    }
                  ]}
                />
              </Card>
            </motion.div>
          )}

          {/* Question Banks View */}
          {currentView === 'question-banks' && (
            <motion.div 
              style={{ marginTop: '24px' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card
                styles={{ body: { padding: '24px' } }}
                style={{
                  borderRadius: '20px',
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(8px)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 4px 16px rgba(0, 0, 0, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.8)',
                  transition: 'all 0.3s ease'
                }}
              >
                <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
                  <Col>
                    <Space wrap>
                      <Input
                        placeholder="Tìm kiếm ngân hàng câu hỏi..."
                        prefix={<SearchOutlined />}
                        style={{ 
                          width: 300,
                          borderRadius: '8px',
                          height: '40px'
                        }}
                      />
                    </Space>
                  </Col>
                  <Col>
                    <Button 
                      type="primary" 
                      icon={<PlusOutlined />}
                      onClick={() => {
                        if (selectedCourse) {
                          // Pre-fill course_id when creating from course view
                          setEditingItem({ course_id: selectedCourse._id });
                        }
                        openModal('addBankModal');
                      }}
                      style={{
                        borderRadius: '8px',
                        height: '40px',
                        padding: '0 24px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                        fontWeight: 600
                      }}
                    >
                      Tạo ngân hàng câu hỏi
                    </Button>
                  </Col>
                </Row>

                {questionBanksLoading ? (
                  <div style={{ textAlign: 'center', padding: '80px' }}>
                    <Spin size="large" style={{ color: '#667eea' }} />
                    <div style={{ marginTop: '24px', fontSize: '16px', color: '#666' }}>Đang tải dữ liệu...</div>
                  </div>
                ) : questionBanks.length === 0 ? (
                  <Empty
                    image={<QuestionCircleOutlined style={{ fontSize: '80px', color: '#d9d9d9' }} />}
                    description={
                      <div>
                        <Typography.Title level={4} style={{ color: '#1a1a1a', marginBottom: '8px' }}>
                          Chưa có ngân hàng câu hỏi nào
                        </Typography.Title>
                        <Typography.Text type="secondary" style={{ fontSize: '14px' }}>
                          Hãy tạo ngân hàng câu hỏi đầu tiên
                        </Typography.Text>
                      </div>
                    }
                  >
                    <Button 
                      type="primary" 
                      icon={<PlusOutlined />}
                      onClick={() => openModal('addBankModal')}
                      style={{
                        borderRadius: '8px',
                        height: '40px',
                        padding: '0 24px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                        fontWeight: 600
                      }}
                    >
                      Tạo ngân hàng câu hỏi
                    </Button>
                  </Empty>
                ) : (
                  <Row gutter={[24, 24]} style={{ display: 'flex', alignItems: 'stretch' }}>
                    {questionBanks
                      .filter(bank => !selectedCourse || bank.course_id?._id === selectedCourse._id || bank.course_id === selectedCourse._id)
                      .map(bank => (
                      <Col xs={24} sm={12} lg={8} xl={6} key={bank._id} style={{ display: 'flex' }}>
                        <motion.div
                          whileHover={{ y: -8, scale: 1.02 }}
                          transition={{ duration: 0.2 }}
                          style={{ width: '100%', display: 'flex' }}
                        >
                          <Card
                            hoverable
                            style={{ 
                              height: '100%',
                              width: '100%',
                              borderRadius: '18px',
                              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.04)',
                              border: '1px solid rgba(255, 255, 255, 0.8)',
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              background: 'rgba(255, 255, 255, 0.95)',
                              backdropFilter: 'blur(8px)',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column'
                            }}
                            bodyStyle={{
                              padding: '20px',
                              flex: 1,
                              display: 'flex',
                              flexDirection: 'column'
                            }}
                            actions={[
                            <Tooltip title="Sửa">
                              <Button 
                                type="text" 
                                icon={<EditOutlined />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditQuestionBank(bank);
                                }}
                              />
                            </Tooltip>,
                            <Tooltip title="Quản lý câu hỏi">
                              <Button 
                                type="text" 
                                icon={<QuestionCircleOutlined />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openModalWithData('manageQuestionsModal', bank);
                                }}
                              />
                            </Tooltip>,
                            <Tooltip title="Xem trước">
                              <Button 
                                type="text" 
                                icon={<EyeOutlined />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openModalWithData('previewBankModal', bank);
                                }}
                              />
                            </Tooltip>,
                            <Popconfirm
                              title="Xóa ngân hàng câu hỏi"
                              description="Bạn có chắc chắn muốn xóa ngân hàng câu hỏi này?"
                              onConfirm={(e) => {
                                e?.stopPropagation();
                                handleDeleteQuestionBank(bank._id);
                              }}
                              okText="Xóa"
                              cancelText="Hủy"
                            >
                              <Tooltip title="Xóa">
                                <Button 
                                  type="text" 
                                  danger
                                  icon={<DeleteOutlined />}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </Tooltip>
                            </Popconfirm>
                          ]}
                        >
                          <Card.Meta
                            avatar={
                              <div style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '24px',
                                color: '#fff'
                              }}>
                                <QuestionCircleOutlined />
                              </div>
                            }
                            title={
                              <Typography.Text strong style={{ fontSize: '18px', color: '#1a1a1a' }}>
                                {bank.name}
                              </Typography.Text>
                            }
                            description={
                              <div>
                                <Typography.Paragraph 
                                  ellipsis={{ rows: 2 }} 
                                  style={{ marginBottom: '16px', color: '#666', fontSize: '14px', lineHeight: '1.6' }}
                                >
                                  {bank.description}
                                </Typography.Paragraph>
                                
                                <Space direction="vertical" size={8} style={{ width: '100%' }}>
                                  <div style={{
                                    padding: '10px 14px',
                                    background: 'linear-gradient(135deg, #e6f7ff 0%, #f0f5ff 100%)',
                                    borderRadius: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    border: '1px solid rgba(24, 144, 255, 0.1)'
                                  }}>
                                    <BookOutlined style={{ color: '#1890ff', fontSize: '18px' }} />
                                    <Typography.Text style={{ fontSize: '14px', color: '#1890ff', fontWeight: 500 }}>
                                      {bank.course_id.course_name}
                                    </Typography.Text>
                                  </div>
                                  <div style={{
                                    padding: '10px 14px',
                                    background: 'linear-gradient(135deg, #f6ffed 0%, #fcffe6 100%)',
                                    borderRadius: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    border: '1px solid rgba(82, 196, 26, 0.1)'
                                  }}>
                                    <QuestionCircleOutlined style={{ color: '#52c41a', fontSize: '18px' }} />
                                    <Typography.Text style={{ fontSize: '14px', color: '#52c41a', fontWeight: 600 }}>
                                      {questions.filter(q => q.bank_id === bank._id).length} câu hỏi
                                    </Typography.Text>
                                  </div>
                                </Space>
                              </div>
                            }
                          />
                          </Card>
                        </motion.div>
                      </Col>
                    ))}
                  </Row>
                )}
              </Card>
            </motion.div>
          )}

          {/* Assignments View */}
          {currentView === 'assignments' && (
            <motion.div 
              style={{ marginTop: '24px' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card
                styles={{ body: { padding: '24px' } }}
                style={{
                  borderRadius: '16px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                  border: 'none',
                  background: '#ffffff',
                  transition: 'all 0.3s ease'
                }}
              >
                <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
                  <Col>
                    <Space wrap>
                      <Input
                        placeholder="Tìm kiếm gán khóa học..."
                        prefix={<SearchOutlined />}
                        style={{ 
                          width: 300,
                          borderRadius: '8px',
                          height: '40px'
                        }}
                      />
                    </Space>
                  </Col>
                  <Col>
                    <Button 
                      type="primary" 
                      icon={<PlusOutlined />}
                      onClick={() => openModal('addAssignmentModal')}
                      style={{
                        borderRadius: '8px',
                        height: '40px',
                        padding: '0 24px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                        fontWeight: 600
                      }}
                    >
                      Gán khóa học cho phòng ban
                    </Button>
                  </Col>
                </Row>

                {assignmentsLoading ? (
                  <div style={{ textAlign: 'center', padding: '50px' }}>
                    <Spin size="large" />
                    <div style={{ marginTop: '16px' }}>Đang tải dữ liệu...</div>
                  </div>
                ) : assignments.length === 0 ? (
                  <Empty
                    image={<TeamOutlined style={{ fontSize: '64px', color: '#d9d9d9' }} />}
                    description={
                      <div>
                        <Typography.Title level={4}>Chưa có gán khóa học nào</Typography.Title>
                        <Typography.Text type="secondary">
                          Hãy gán khóa học cho phòng ban đầu tiên
                        </Typography.Text>
                      </div>
                    }
                  >
                    <Button 
                      type="primary" 
                      icon={<PlusOutlined />}
                      onClick={() => openModal('addAssignmentModal')}
                    >
                      Gán khóa học
                    </Button>
                  </Empty>
                ) : (
                  <Row gutter={[24, 24]} style={{ display: 'flex', alignItems: 'stretch' }}>
                    {assignments.map(assignment => (
                      <Col xs={24} sm={12} lg={8} xl={6} key={assignment._id} style={{ display: 'flex' }}>
                        <motion.div
                          whileHover={{ y: -8, scale: 1.02 }}
                          transition={{ duration: 0.2 }}
                          style={{ width: '100%', display: 'flex' }}
                        >
                          <Card
                            hoverable
                            style={{ 
                              height: '100%',
                              width: '100%',
                              borderRadius: '18px',
                              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.04)',
                              border: '1px solid rgba(255, 255, 255, 0.8)',
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              background: 'rgba(255, 255, 255, 0.95)',
                              backdropFilter: 'blur(8px)',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column'
                            }}
                            bodyStyle={{
                              padding: '20px',
                              flex: 1,
                              display: 'flex',
                              flexDirection: 'column'
                            }}
                            actions={[
                            <Tooltip title="Sửa">
                              <Button 
                                type="text" 
                                icon={<EditOutlined />}
                                onClick={() => handleEditAssignment(assignment)}
                              />
                            </Tooltip>,
                            <Popconfirm
                              title="Xóa gán khóa học"
                              description="Bạn có chắc chắn muốn xóa gán khóa học này?"
                              onConfirm={() => handleDeleteAssignment(assignment._id)}
                              okText="Xóa"
                              cancelText="Hủy"
                            >
                              <Tooltip title="Xóa">
                                <Button 
                                  type="text" 
                                  danger
                                  icon={<DeleteOutlined />}
                                />
                              </Tooltip>
                            </Popconfirm>
                          ]}
                        >
                          <Card.Meta
                            avatar={
                              <div style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '24px',
                                color: '#fff'
                              }}>
                                <TeamOutlined />
                              </div>
                            }
                            title={
                              <Typography.Text strong style={{ fontSize: '18px', color: '#1a1a1a' }}>
                                {assignment.course_id?.course_name}
                              </Typography.Text>
                            }
                            description={
                              <div>
                                <Space direction="vertical" size={8} style={{ width: '100%' }}>
                                  <div style={{
                                    padding: '10px 14px',
                                    background: 'linear-gradient(135deg, #e6f7ff 0%, #f0f5ff 100%)',
                                    borderRadius: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    border: '1px solid rgba(24, 144, 255, 0.1)'
                                  }}>
                                    <TeamOutlined style={{ color: '#1890ff', fontSize: '18px' }} />
                                    <Typography.Text style={{ fontSize: '14px', color: '#1890ff', fontWeight: 500 }}>
                                      {assignment.department_id?.department_name}
                                    </Typography.Text>
                                  </div>
                                  <div style={{
                                    padding: '10px 14px',
                                    background: 'linear-gradient(135deg, #f6ffed 0%, #fcffe6 100%)',
                                    borderRadius: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    border: '1px solid rgba(82, 196, 26, 0.1)'
                                  }}>
                                    <UserOutlined style={{ color: '#52c41a', fontSize: '18px' }} />
                                    <Typography.Text style={{ fontSize: '14px', color: '#52c41a', fontWeight: 500 }}>
                                      Gán bởi: {assignment.assigned_by?.full_name}
                                    </Typography.Text>
                                  </div>
                                  <div style={{
                                    padding: '10px 14px',
                                    background: 'linear-gradient(135deg, #fffbe6 0%, #fff7e6 100%)',
                                    borderRadius: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    border: '1px solid rgba(250, 173, 20, 0.1)'
                                  }}>
                                    <ClockCircleOutlined style={{ color: '#faad14', fontSize: '18px' }} />
                                    <Typography.Text style={{ fontSize: '14px', color: '#faad14', fontWeight: 500 }}>
                                      {new Date(assignment.assigned_at).toLocaleDateString('vi-VN')}
                                    </Typography.Text>
                                  </div>
                                  {assignment.notes && (
                                    <Typography.Text type="secondary" style={{ fontSize: '12px', padding: '8px 12px', background: '#fafafa', borderRadius: '8px' }}>
                                      {assignment.notes}
                                    </Typography.Text>
                                  )}
                                </Space>
                              </div>
                            }
                          />
                          </Card>
                        </motion.div>
                      </Col>
                    ))}
                  </Row>
                )}
              </Card>
            </motion.div>
          )}
        </Card>
        </motion.div>
      </div>

      {/* Add Course Set Modal */}
      <Modal
        title={editingItem ? 'Chỉnh sửa bộ khóa học' : 'Tạo bộ khóa học mới'}
        open={showModal === 'addCourseSetModal'}
        onCancel={closeModal}
        footer={null}
        width={600}
        style={{
          borderRadius: '20px'
        }}
        styles={{
          content: {
            borderRadius: '20px',
            padding: '24px'
          },
          header: {
            borderRadius: '20px 20px 0 0',
            padding: '20px 24px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff',
            borderBottom: 'none'
          }
        }}
      >
        <Form
          key={editingItem?._id || 'new'}
          layout="vertical"
          onFinish={handleCourseSetSubmit}
          initialValues={editingItem ? {
            name: editingItem.name,
            description: editingItem.description || '',
          } : {
            name: '',
            description: '',
          }}
        >
          <Form.Item
            label="Tên bộ khóa học"
            name="name"
            rules={[{ required: true, message: 'Vui lòng nhập tên bộ khóa học' }]}
          >
            <Input 
              placeholder="Nhập tên bộ khóa học"
            />
          </Form.Item>

          <Form.Item
            label="Mô tả"
            name="description"
          >
            <Input.TextArea 
              placeholder="Nhập mô tả bộ khóa học"
              rows={4}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button 
                onClick={closeModal}
                style={{
                  borderRadius: '8px',
                  height: '40px',
                  padding: '0 24px'
                }}
              >
                Hủy
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                icon={<PlusOutlined />} 
                loading={submittingCourseSet}
                style={{
                  borderRadius: '8px',
                  height: '40px',
                  padding: '0 24px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                  fontWeight: 600
                }}
              >
                {editingItem ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Add Course Modal */}
      <Modal
        title={editingItem ? 'Chỉnh sửa khóa học' : 'Tạo khóa học mới'}
        open={showModal === 'addCourseModal'}
        onCancel={closeModal}
        footer={null}
        width={800}
      >
        <Form
          key={editingItem?._id || 'new'}
          layout="vertical"
          onFinish={handleCourseSubmit}
          initialValues={
            editingItem
              ? {
                  course_name: editingItem.course_name,
                  course_set_id: editingItem.course_set_id?._id || editingItem.course_set_id || '',
                  duration_hours: editingItem.duration_hours?.toString() || '',
                  validity_months: editingItem.validity_months?.toString() || '',
                  description: editingItem.description || '',
                  is_mandatory: editingItem.is_mandatory || false,
                }
              : {
                  course_name: '',
                  course_set_id: '',
                  duration_hours: '',
                  validity_months: '',
                  description: '',
                  is_mandatory: false,
                }
          }
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Tên khóa học"
                name="course_name"
                rules={[{ required: true, message: 'Vui lòng nhập tên khóa học' }]}
              >
                <Input 
                  placeholder="Nhập tên khóa học"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Bộ khóa học"
                name="course_set_id"
                rules={[{ required: true, message: 'Vui lòng chọn bộ khóa học' }]}
              >
                <Select
                  placeholder="Chọn bộ khóa học"
                >
                  {courseSets.map(courseSet => (
                    <Select.Option key={courseSet._id} value={courseSet._id}>
                      {courseSet.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Thời lượng (giờ)"
                name="duration_hours"
                rules={[{ required: true, message: 'Vui lòng nhập thời lượng' }]}
              >
                <Input 
                  type="number"
                  min={1}
                  placeholder="Nhập số giờ"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Hiệu lực (tháng)"
                name="validity_months"
              >
                <Input 
                  type="number"
                  min={1}
                  placeholder="Nhập số tháng"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Mô tả khóa học"
            name="description"
          >
            <Input.TextArea 
              rows={4}
              placeholder="Nhập mô tả khóa học"
            />
          </Form.Item>

          <Form.Item name="is_mandatory" valuePropName="checked">
            <Checkbox>
              Khóa học bắt buộc
            </Checkbox>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button 
                onClick={closeModal}
                style={{
                  borderRadius: '8px',
                  height: '40px',
                  padding: '0 24px'
                }}
              >
                Hủy
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                icon={<PlusOutlined />} 
                loading={submittingCourse}
                style={{
                  borderRadius: '8px',
                  height: '40px',
                  padding: '0 24px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                  fontWeight: 600
                }}
              >
                {editingItem ? 'Cập nhật' : 'Tạo'} khóa học
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Add Session Modal */}
      <Modal
        title={editingItem ? 'Chỉnh sửa buổi đào tạo' : 'Lên lịch đào tạo'}
        open={showModal === 'addSessionModal'}
        onCancel={closeModal}
        footer={null}
        width={800}
      >
        <Form
          layout="vertical"
          onFinish={handleSessionSubmit}
          initialValues={{
            ...sessionForm,
            // Form needs dayjs objects for DatePicker to avoid isValid errors
            start_time: sessionForm.start_time ? dayjs(sessionForm.start_time) : null,
            end_time: sessionForm.end_time ? dayjs(sessionForm.end_time) : null,
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Tên buổi đào tạo"
                name="session_name"
                rules={[{ required: true, message: 'Vui lòng nhập tên buổi đào tạo' }]}
              >
                <Input 
                  placeholder="Nhập tên buổi đào tạo"
                  value={sessionForm.session_name}
                  onChange={(e) => setSessionForm(prev => ({ ...prev, session_name: e.target.value }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Khóa học"
                name="course_id"
                rules={[{ required: true, message: 'Vui lòng chọn khóa học' }]}
              >
                {!allCourses || allCourses.length === 0 ? (
                  <Alert
                    message="Không có khóa học nào!"
                    description="Vui lòng tạo khóa học trước khi tạo buổi đào tạo."
                    type="warning"
                    showIcon
                  />
                ) : (
                  <Select
                    placeholder="Chọn khóa học"
                    value={sessionForm.course_id}
                    onChange={(value) => setSessionForm(prev => ({ ...prev, course_id: value }))}
                  >
                    {allCourses.map(course => (
                      <Select.Option key={course._id} value={course._id}>
                        {course.course_name}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Ngày bắt đầu"
                name="start_time"
                rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu' }]}
              >
                <DatePicker
                  showTime
                  format="YYYY-MM-DD HH:mm"
                  placeholder="Chọn ngày bắt đầu"
                  style={{ width: '100%' }}
                  value={sessionForm.start_time ? dayjs(sessionForm.start_time) : null}
                  onChange={(date) => {
                    if (date) {
                      setSessionForm(prev => ({ 
                        ...prev, 
                        start_time: date.format('YYYY-MM-DD HH:mm')
                      }));
                    } else {
                      setSessionForm(prev => ({ 
                        ...prev, 
                        start_time: ''
                      }));
                    }
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Ngày kết thúc"
                name="end_time"
                rules={[{ required: true, message: 'Vui lòng chọn ngày kết thúc' }]}
              >
                <DatePicker
                  showTime
                  format="YYYY-MM-DD HH:mm"
                  placeholder="Chọn ngày kết thúc"
                  style={{ width: '100%' }}
                  value={sessionForm.end_time ? dayjs(sessionForm.end_time) : null}
                  onChange={(date) => {
                    if (date) {
                      setSessionForm(prev => ({ 
                        ...prev, 
                        end_time: date.format('YYYY-MM-DD HH:mm')
                      }));
                    } else {
                      setSessionForm(prev => ({ 
                        ...prev, 
                        end_time: ''
                      }));
                    }
                  }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Số lượng tối đa"
                name="max_participants"
              >
                <Input 
                  type="number"
                  min={1}
                  placeholder="Nhập số lượng"
                  value={sessionForm.max_participants}
                  onChange={(e) => setSessionForm(prev => ({ ...prev, max_participants: e.target.value }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Trạng thái"
                name="status_code"
              >
                <Select
                  value={sessionForm.status_code}
                  onChange={(value) => setSessionForm(prev => ({ ...prev, status_code: value }))}
                >
                  <Select.Option value="SCHEDULED">Đã lên lịch</Select.Option>
                  <Select.Option value="ONGOING">Đang diễn ra</Select.Option>
                  <Select.Option value="COMPLETED">Hoàn thành</Select.Option>
                  <Select.Option value="CANCELLED">Đã hủy</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Địa điểm"
            name="location"
          >
            <Input 
              placeholder="Nhập địa điểm"
              value={sessionForm.location}
              onChange={(e) => setSessionForm(prev => ({ ...prev, location: e.target.value }))}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button 
                onClick={closeModal}
                style={{
                  borderRadius: '8px',
                  height: '40px',
                  padding: '0 24px'
                }}
              >
                Hủy
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                icon={<CalendarOutlined />} 
                loading={submittingSession}
                style={{
                  borderRadius: '8px',
                  height: '40px',
                  padding: '0 24px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                  fontWeight: 600
                }}
              >
                {editingItem ? 'Cập nhật' : 'Tạo'} lịch đào tạo
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Add Question Bank Modal */}
      <Modal
        title={editingItem ? 'Chỉnh sửa ngân hàng câu hỏi' : 'Tạo ngân hàng câu hỏi'}
        open={showModal === 'addBankModal'}
        onCancel={closeModal}
        footer={null}
        width={600}
      >
        <Form
          key={editingItem?._id || 'new'}
          layout="vertical"
          onFinish={handleQuestionBankSubmit}
          initialValues={
            editingItem
              ? {
                  name: editingItem.name,
                  description: editingItem.description || '',
                  course_id: editingItem.course_id?._id || editingItem.course_id || '',
                }
              : {
                  name: '',
                  description: '',
                  course_id: '',
                }
          }
        >
          <Form.Item
            label="Tên ngân hàng câu hỏi"
            name="name"
            rules={[{ required: true, message: 'Vui lòng nhập tên ngân hàng câu hỏi' }]}
          >
            <Input 
              placeholder="Nhập tên ngân hàng câu hỏi"
            />
          </Form.Item>

          <Form.Item
            label="Khóa học"
            name="course_id"
            rules={[{ required: true, message: 'Vui lòng chọn khóa học' }]}
          >
            {!allCourses || allCourses.length === 0 ? (
              <Alert
                message="Không có khóa học nào!"
                description="Vui lòng tạo khóa học trước khi tạo ngân hàng câu hỏi."
                type="warning"
                showIcon
              />
            ) : (
              <Select
                placeholder="Chọn khóa học"
              >
                {allCourses.map(course => (
                  <Select.Option key={course._id} value={course._id}>
                    {course.course_name}
                  </Select.Option>
                ))}
              </Select>
            )}
          </Form.Item>

          <Form.Item
            label="Mô tả"
            name="description"
          >
            <Input.TextArea 
              rows={3}
              placeholder="Nhập mô tả ngân hàng câu hỏi"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button 
                onClick={closeModal}
                style={{
                  borderRadius: '8px',
                  height: '40px',
                  padding: '0 24px'
                }}
              >
                Hủy
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                icon={<PlusOutlined />} 
                loading={submittingQuestionBank}
                style={{
                  borderRadius: '8px',
                  height: '40px',
                  padding: '0 24px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                  fontWeight: 600
                }}
              >
                {editingItem ? 'Cập nhật' : 'Tạo'} ngân hàng câu hỏi
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* View Course Modal */}
      {showModal === 'viewCourseModal' && (
        <ViewCourseModal 
          course={editingItem} 
          onClose={closeModal} 
        />
      )}

      {/* View Session Modal */}
      {showModal === 'viewSessionModal' && (
        <ViewSessionModal 
          session={editingItem} 
          onClose={closeModal} 
        />
      )}

      {/* Manage Questions Modal */}
      <Modal
        title={`Quản lý câu hỏi - ${editingItem?.name || ''}`}
        open={showModal === 'manageQuestionsModal'}
        onCancel={closeModal}
        footer={null}
        width={1000}
      >
        {editingItem && (
          <div>
            <Row justify="space-between" align="middle" style={{ marginBottom: '16px' }}>
              <Col>
                <Typography.Text strong>
                  Tổng số câu hỏi: {questions.filter(q => q.bank_id === editingItem._id).length}
                </Typography.Text>
              </Col>
              <Col>
                <Space>
                  <Button 
                    icon={<DownloadOutlined />}
                    onClick={handleDownloadTemplate}
                  >
                    Tải template
                  </Button>
                  <Button 
                    icon={<FileExcelOutlined />}
                    onClick={() => openModalWithData('importExcelModal', editingItem)}
                  >
                    Import Excel
                  </Button>
                  <Button 
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      // Store the question bank to ensure it's preserved
                      const currentBank = editingItem;
                      if (!currentBank || !currentBank._id) {
                        message.error('Không tìm thấy ngân hàng câu hỏi');
                        return;
                      }
                      // Store question bank ID separately
                      setCurrentQuestionBankId(currentBank._id);
                      // Ensure editingItem is the question bank
                      setEditingItem(currentBank);
                      setQuestionForm({
                        content: '',
                        options: ['', '', '', ''],
                        correct_answer: '',
                      });
                      openModal('addQuestionModal', false);
                    }}
                  >
                    Thêm câu hỏi
                  </Button>
                </Space>
              </Col>
            </Row>

            {questions.filter(q => q.bank_id === editingItem._id).length === 0 ? (
              <Empty
                image={<QuestionCircleOutlined style={{ fontSize: '64px', color: '#d9d9d9' }} />}
                description={
                  <div>
                    <Typography.Title level={4}>Chưa có câu hỏi nào</Typography.Title>
                    <Typography.Text type="secondary">
                      Hãy thêm câu hỏi đầu tiên cho ngân hàng này
                    </Typography.Text>
                  </div>
                }
              >
                <Button 
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    // Store the question bank to ensure it's preserved
                    const currentBank = editingItem;
                    if (!currentBank || !currentBank._id) {
                      message.error('Không tìm thấy ngân hàng câu hỏi');
                      return;
                    }
                    console.log('Opening add question modal with bank:', currentBank);
                    // Store question bank ID separately
                    setCurrentQuestionBankId(currentBank._id);
                    // Set editingItem to question bank for creating new question
                    setEditingItem(currentBank);
                    setQuestionForm({
                      content: '',
                      options: ['', '', '', ''],
                      correct_answer: '',
                    });
                    openModal('addQuestionModal', false);
                  }}
                >
                  Thêm câu hỏi
                </Button>
              </Empty>
            ) : (
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {questions.filter(q => q.bank_id === editingItem._id).map((question, index) => (
                  <Card 
                    key={question._id} 
                    size="small" 
                    style={{ marginBottom: '12px' }}
                    actions={[
                      <Tooltip title="Sửa">
                        <Button 
                          type="text" 
                          icon={<EditOutlined />}
                          onClick={() => handleEditQuestion(question)}
                        />
                      </Tooltip>,
                      <Popconfirm
                        title="Xóa câu hỏi"
                        description="Bạn có chắc chắn muốn xóa câu hỏi này?"
                        onConfirm={() => handleDeleteQuestion(question._id)}
                        okText="Xóa"
                        cancelText="Hủy"
                      >
                        <Tooltip title="Xóa">
                          <Button 
                            type="text" 
                            danger
                            icon={<DeleteOutlined />}
                          />
                        </Tooltip>
                      </Popconfirm>
                    ]}
                  >
                    <Card.Meta
                      title={
                        <Space>
                          <Tag color="blue">Câu {index + 1}</Tag>
                          <Tag color="green">{(question as any).type || 'Multiple Choice'}</Tag>
                        </Space>
                      }
                      description={
                        <div>
                          <Typography.Paragraph style={{ marginBottom: '12px' }}>
                            {(question as any).content || (question as any).question_text || (question as any).question || 'Nội dung câu hỏi'}
                          </Typography.Paragraph>
                          {question.options && (
                            <div>
                              {(question as any).options?.map((option: string, optIndex: number) => (
                                <div 
                                  key={optIndex} 
                                  style={{ 
                                    padding: '4px 8px', 
                                    margin: '2px 0',
                                    backgroundColor: option === (question as any).correct_answer ? '#f6ffed' : '#fafafa',
                                    border: option === (question as any).correct_answer ? '1px solid #b7eb8f' : '1px solid #d9d9d9',
                                    borderRadius: '4px'
                                  }}
                                >
                                  <Typography.Text 
                                    style={{ 
                                      color: option === (question as any).correct_answer ? '#52c41a' : '#666',
                                      fontWeight: option === (question as any).correct_answer ? 600 : 400
                                    }}
                                  >
                                    {String.fromCharCode(65 + optIndex)}. {option}
                                  </Typography.Text>
                                </div>
                              )) || []}
                            </div>
                          )}
                        </div>
                      }
                    />
                  </Card>
                ))}
              </div>
            )}

            <div style={{ textAlign: 'right', marginTop: '16px' }}>
              <Button onClick={closeModal}>
                Đóng
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Preview Question Bank Modal */}
      {showModal === 'previewBankModal' && editingItem && (
        <div className="modal active">
          <div className="modal-content large">
            <div className="modal-header">
              <h2 className="modal-title">Xem trước ngân hàng câu hỏi - {editingItem.name}</h2>
              <span className="close-modal" onClick={closeModal}>&times;</span>
            </div>
            
            <div className="question-preview">
              <div className="preview-header">
                <h3>{editingItem.name}</h3>
                <p>{editingItem.description}</p>
                <div className="preview-stats">
                  <span>Tổng số câu hỏi: {questions.filter(q => q.bank_id === editingItem._id).length}</span>
                  <span>Khóa học: {editingItem.course_id?.course_name || 'N/A'}</span>
                </div>
              </div>
              
              <div className="preview-questions">
                {questions.filter(q => q.bank_id === editingItem._id).map((question, index) => (
                  <div key={question._id} className="preview-question">
                    <div className="preview-question-header">
                      <span className="question-number">Câu {index + 1}</span>
                      <span className="question-type">{(question as any).type || 'Multiple Choice'}</span>
                    </div>
                    <div className="preview-question-content">
                      <p>{(question as any).content || (question as any).question_text || (question as any).question || 'Nội dung câu hỏi'}</p>
                      {question.options && (
                        <div className="preview-options">
                          {(question as any).options?.map((option: string, optIndex: number) => (
                            <div key={optIndex} className={`preview-option ${option === (question as any).correct_answer ? 'correct' : ''}`}>
                              {String.fromCharCode(65 + optIndex)}. {option}
                            </div>
                          )) || []}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={closeModal}>
                Đóng
              </button>
              <button type="button" className="btn btn-primary">
                <i className="fas fa-edit"></i> Chỉnh sửa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Report Modal */}
      {showModal === 'exportReportModal' && (
        <div className="modal active">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Xuất báo cáo đào tạo</h2>
              <span className="close-modal" onClick={closeModal}>&times;</span>
            </div>
            
            <div className="export-options">
              <div className="form-group">
                <label className="form-label">Loại báo cáo</label>
                <select className="form-input">
                  <option value="enrollments">Báo cáo đăng ký tham gia</option>
                  <option value="completion">Báo cáo hoàn thành khóa học</option>
                  <option value="scores">Báo cáo điểm số</option>
                  <option value="summary">Báo cáo tổng hợp</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Khóa học</label>
                <select className="form-input">
                  <option value="">Tất cả khóa học</option>
                  {courses.map(course => (
                    <option key={course._id} value={course._id}>
                      {course.course_name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Từ ngày</label>
                <input type="date" className="form-input" />
              </div>
              
              <div className="form-group">
                <label className="form-label">Đến ngày</label>
                <input type="date" className="form-input" />
              </div>
              
              <div className="form-group">
                <label className="form-label">Định dạng xuất</label>
                <select className="form-input">
                  <option value="excel">Excel (.xlsx)</option>
                  <option value="pdf">PDF (.pdf)</option>
                  <option value="csv">CSV (.csv)</option>
                </select>
              </div>
            </div>
            
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={closeModal}>
                Hủy
              </button>
              <button type="button" className="btn btn-success">
                <i className="fas fa-download"></i> Xuất báo cáo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enrollment Management Modal */}
      {showModal === 'enrollmentModal' && (
        <EnrollmentModal 
          session={editingItem} 
          onClose={closeModal} 
        />
      )}

      {/* Question Bank Modal */}
      {showModal === 'questionBankModal' && (
        <QuestionBankModal 
          course={editingItem} 
          onClose={closeModal} 
        />
      )}

      {/* Add Question Modal */}
      <Modal
        title={editingItem && editingItem.content ? 'Chỉnh sửa câu hỏi' : 'Thêm câu hỏi mới'}
        open={showModal === 'addQuestionModal'}
        onCancel={closeModal}
        footer={null}
        width={600}
      >
        <Form
          layout="vertical"
          onFinish={handleQuestionSubmit}
          initialValues={{
            content: questionForm.content,
            options: questionForm.options,
            correct_answer: questionForm.correct_answer
          }}
          key={`question-form-${editingItem?._id || 'new'}-${showModal === 'addQuestionModal' ? 'add' : 'edit'}`}
        >
          <Form.Item
            label="* Nội dung câu hỏi"
            name="content"
            rules={[{ required: true, message: 'Vui lòng nhập nội dung câu hỏi' }]}
          >
            <Input.TextArea 
              rows={3}
              placeholder="Nhập nội dung câu hỏi..."
            />
          </Form.Item>

          <Form.Item
            label="* Các lựa chọn"
            required
            rules={[
              {
                validator: () => {
                  const validOptions = questionForm.options.filter(opt => opt && opt.trim() !== '');
                  if (validOptions.length < 2) {
                    return Promise.reject(new Error('Cần ít nhất 2 lựa chọn'));
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              {questionForm.options.map((_, index) => (
                <Input
                  key={index}
                  placeholder={`Lựa chọn ${String.fromCharCode(65 + index)}`}
                  value={questionForm.options[index]}
                  onChange={(e) => {
                    const newOptions = [...questionForm.options];
                    newOptions[index] = e.target.value;
                    setQuestionForm(prev => ({ ...prev, options: newOptions }));
                  }}
                  required={index < 2}
                />
              ))}
            </Space>
          </Form.Item>

          <Form.Item
            label="* Đáp án đúng"
            name="correct_answer"
            rules={[
              { required: true, message: 'Vui lòng nhập đáp án đúng' },
              {
                validator: (_, value) => {
                  if (!value || value.trim() === '') {
                    return Promise.reject(new Error('Vui lòng nhập đáp án đúng'));
                  }
                  const validOptions = questionForm.options.filter(opt => opt && opt.trim() !== '');
                  if (validOptions.length > 0 && !validOptions.includes(value.trim())) {
                    return Promise.reject(new Error('Đáp án đúng phải là một trong các lựa chọn'));
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <Input 
              placeholder="Nhập đáp án đúng (phải khớp với một trong các lựa chọn)..."
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={closeModal}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" icon={<PlusOutlined />} loading={submittingQuestion}>
                Thêm câu hỏi
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Import Excel Modal */}
      <Modal
        title="Import câu hỏi từ Excel"
        open={showModal === 'importExcelModal'}
        onCancel={closeModal}
        footer={null}
        width={500}
      >
        <Form layout="vertical">
          <Form.Item label="Ngân hàng câu hỏi">
            <Input 
              value={editingItem ? editingItem.name : 'Chưa chọn ngân hàng câu hỏi'}
              disabled
              prefix={<QuestionCircleOutlined />}
            />
            <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
              Câu hỏi sẽ được import vào ngân hàng này
            </Typography.Text>
          </Form.Item>

          <Form.Item label="Chọn file Excel">
            <Upload
              accept=".xlsx,.xls"
              beforeUpload={(file) => {
                setExcelFile(file);
                return false; // Prevent auto upload
              }}
              onRemove={() => setExcelFile(null)}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Chọn file Excel</Button>
            </Upload>
            <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
              Chỉ chấp nhận file Excel (.xlsx, .xls). Tải template mẫu để xem định dạng.
            </Typography.Text>
          </Form.Item>

          {excelFile && (
            <Alert
              message={`File đã chọn: ${excelFile.name}`}
              type="info"
              showIcon
              style={{ marginBottom: '16px' }}
            />
          )}

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={closeModal}>
                Hủy
              </Button>
              <Button 
                type="primary"
                icon={<UploadOutlined />}
                onClick={handleImportExcel}
                disabled={!excelFile || !editingItem}
              >
                Import câu hỏi
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Course Assignment Modal */}
      <CourseAssignmentModal
        visible={showModal === 'addAssignmentModal'}
        onCancel={closeModal}
        onSuccess={() => {
          closeModal();
          // Refresh assignments
        }}
      />
    </motion.div>
  );
};

export default TrainingManagement;
