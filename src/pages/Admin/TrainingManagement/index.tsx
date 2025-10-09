import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Space, Tabs, Table, Tag, Avatar, Row, Col, Statistic, Input, Select, Modal, Form, message, Popconfirm, Upload } from 'antd';
import { BookOutlined, PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, FilterOutlined, UploadOutlined, DownloadOutlined, UserOutlined, CalendarOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { downloadQuestionTemplate } from '../../../utils/questionTemplate';
import {
  useCourses,
  useTrainingSessions,
  useTrainingEnrollments,
  useQuestionBanks,
  useQuestions,
  useCourseSets,
} from '../../../hooks/useTraining';
import ViewCourseModal from './components/ViewCourseModal';
import QuestionBankModal from './components/QuestionBankModal';
import ViewSessionModal from './components/ViewSessionModal';
import EnrollmentModal from './components/EnrollmentModal';

const TrainingManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'courses' | 'sessions' | 'enrollments' | 'question-banks'>('courses');
  const [showModal, setShowModal] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [filters, setFilters] = useState({
    courseSetId: '',
    courseId: '',
    statusCode: '',
    search: '',
    isMandatory: '',
  });

  // Form states
  const [courseForm, setCourseForm] = useState({
    course_name: '',
    description: '',
    duration_hours: '',
    validity_months: '',
    course_set_id: '',
    is_mandatory: false,
  });

  const [sessionForm, setSessionForm] = useState({
    session_name: '',
    course_id: '',
    start_time: '',
    end_time: '',
    max_participants: '',
    location: '',
    status_code: 'SCHEDULED',
  });

  const [questionBankForm, setQuestionBankForm] = useState({
    name: '',
    description: '',
    course_id: '',
  });

  const [questionForm, setQuestionForm] = useState({
    content: '',
    options: ['', '', '', ''],
    correct_answer: '',
  });

  const [excelFile, setExcelFile] = useState<File | null>(null);

  // API hooks
  const { courseSets } = useCourseSets();
  const { courses, loading: coursesLoading, createCourse, updateCourse, deleteCourse } = useCourses({
    courseSetId: filters.courseSetId || undefined,
    isMandatory: filters.isMandatory ? filters.isMandatory === 'true' : undefined,
  });
  
  // Load all courses for session form (without filters)
  const { courses: allCourses } = useCourses({});
  
  // Debug courses
  console.log('Available courses (filtered):', courses);
  console.log('All courses (for session form):', allCourses);
  console.log('Current sessionForm.course_id:', sessionForm.course_id);
  
  // Clear invalid course_id when all courses change
  useEffect(() => {
    if (allCourses && sessionForm.course_id) {
      // If no courses exist, clear course_id
      if (allCourses.length === 0) {
        console.log('No courses available, clearing course_id:', sessionForm.course_id);
        setSessionForm(prev => ({ ...prev, course_id: '' }));
      } else {
        // If courses exist, check if current course_id is valid
        const courseExists = allCourses.some(course => course._id === sessionForm.course_id);
        if (!courseExists) {
          console.log('Clearing invalid course_id:', sessionForm.course_id);
          setSessionForm(prev => ({ ...prev, course_id: '' }));
        }
      }
    }
  }, [allCourses, sessionForm.course_id]);

  // Clear course_id immediately if no courses are available
  useEffect(() => {
    if (allCourses && allCourses.length === 0 && sessionForm.course_id) {
      console.log('Immediately clearing course_id because no courses available:', sessionForm.course_id);
      setSessionForm(prev => ({ ...prev, course_id: '' }));
    }
  }, [allCourses, sessionForm.course_id]);

      // Force clear course_id on component mount if no courses
      useEffect(() => {
        if (allCourses && allCourses.length === 0) {
          console.log('Component mount: No courses available, forcing course_id to empty');
          setSessionForm(prev => ({ ...prev, course_id: '' }));
        }
      }, []); // Run only on mount

      // Debug: Log courses when they change
      useEffect(() => {
        console.log('Courses updated:', allCourses);
        if (allCourses && allCourses.length > 0) {
          console.log('Available courses:');
          allCourses.forEach(course => {
            console.log(`- ID: ${course._id}, Name: ${course.course_name}`);
          });
        }
      }, [allCourses]);
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
    setCourseForm({
      course_name: '',
      description: '',
      duration_hours: '',
      validity_months: '',
      course_set_id: '',
      is_mandatory: false,
    });
    setSessionForm({
      session_name: '',
      course_id: '',
      start_time: '',
      end_time: '',
      max_participants: '',
      location: '',
      status_code: 'SCHEDULED',
    });
    setQuestionBankForm({
      name: '',
      description: '',
      course_id: '',
    });
    setQuestionForm({
      content: '',
      options: ['', '', '', ''],
      correct_answer: '',
    });
    setEditingItem(null);
  };

  const handleCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const courseData = {
        ...courseForm,
        duration_hours: parseInt(courseForm.duration_hours),
        validity_months: courseForm.validity_months ? parseInt(courseForm.validity_months) : undefined,
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
    }
  };

  const handleSessionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
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

      // Debug: Log current state before validation
      console.log('=== FINAL VALIDATION DEBUG ===');
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
    }
  };

  const handleQuestionBankSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await updateQuestionBank(editingItem._id, questionBankForm);
      } else {
        await createQuestionBank(questionBankForm);
      }
      closeModal();
      resetForms();
    } catch (error) {
      console.error('Error saving question bank:', error);
    }
  };

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Filter out empty options
      const validOptions = questionForm.options.filter(option => option.trim() !== '');
      
      if (validOptions.length < 2) {
        alert('Cần ít nhất 2 lựa chọn');
        return;
      }

      if (!validOptions.includes(questionForm.correct_answer)) {
        alert('Đáp án đúng phải là một trong các lựa chọn');
        return;
      }

      const questionData = {
        bank_id: editingItem._id,
        content: questionForm.content,
        options: validOptions,
        correct_answer: questionForm.correct_answer,
      };

      // Create or update question using API
      if (editingItem && editingItem._id && editingItem.content) {
        // Editing existing question
        await updateQuestion(editingItem._id, questionData);
      } else {
        // Creating new question
        await createQuestion(questionData);
      }
      
      closeModal();
      resetForms();
    } catch (error) {
      console.error('Error saving question:', error);
    }
  };

  const handleEditCourse = (course: any) => {
    setEditingItem(course);
    setCourseForm({
      course_name: course.course_name,
      description: course.description || '',
      duration_hours: course.duration_hours.toString(),
      validity_months: course.validity_months ? course.validity_months.toString() : '',
      course_set_id: course.course_set_id._id,
      is_mandatory: course.is_mandatory,
    });
    openModal('addCourseModal');
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
    openModal('addSessionModal');
  };

  const handleEditQuestionBank = (bank: any) => {
    setEditingItem(bank);
    setQuestionBankForm({
      name: bank.name,
      description: bank.description || '',
      course_id: bank.course_id._id,
    });
    openModal('addBankModal');
  };

  // Delete handlers
  const handleDeleteCourse = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa khóa học này?')) {
      try {
        await deleteCourse(id);
      } catch (error) {
        console.error('Error deleting course:', error);
      }
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

  const handleExcelFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setExcelFile(file);
    }
  };

  const handleImportExcel = async () => {
    if (!excelFile || !editingItem) {
      alert('Vui lòng chọn file Excel và ngân hàng câu hỏi');
      return;
    }

    try {
      await importQuestionsFromExcel(editingItem._id, excelFile);
      setExcelFile(null);
      closeModal();
    } catch (error) {
      console.error('Error importing Excel:', error);
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


  const formatDateTime = (dateTimeString: string): string => {
    return new Date(dateTimeString).toLocaleString('vi-VN');
  };

  const switchTab = (tabName: 'courses' | 'sessions' | 'enrollments' | 'question-banks') => {
    setActiveTab(tabName);
  };

  const openModal = (modalId: string) => {
    console.log('Opening modal:', modalId, 'Current editingItem:', editingItem);
    setShowModal(modalId);
    resetForms();
  };

  const openModalWithData = (modalId: string, data: any) => {
    console.log('Opening modal with data:', modalId, 'Data:', data);
    setEditingItem(data);
    setShowModal(modalId);
    // Không gọi resetForms() để không reset editingItem
  };

  const closeModal = () => {
    setShowModal(null);
    resetForms();
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Debug state values
  console.log('Current state - showModal:', showModal, 'editingItem:', editingItem);
  console.log('Courses data:', courses);

  return (
    <div className="training-management">
      <div className="container">
        {/* Header */}
        <div className="header">
          <div>
            <h1><i className="fas fa-graduation-cap"></i> Quản lý đào tạo</h1>
            <div className="breadcrumb">
              <a href="/admin/dashboard">Dashboard</a> / Quản lý đào tạo
            </div>
          </div>
          <a href="/admin/dashboard" className="btn btn-secondary">
            <i className="fas fa-arrow-left"></i> Quay lại
          </a>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <div className="tab-nav">
            <button 
              className={`tab-button ${activeTab === 'courses' ? 'active' : ''}`}
              onClick={() => switchTab('courses')}
            >
              <i className="fas fa-book"></i> Khóa học
            </button>
            <button 
              className={`tab-button ${activeTab === 'sessions' ? 'active' : ''}`}
              onClick={() => switchTab('sessions')}
            >
              <i className="fas fa-calendar-alt"></i> Buổi đào tạo
            </button>
            <button 
              className={`tab-button ${activeTab === 'enrollments' ? 'active' : ''}`}
              onClick={() => switchTab('enrollments')}
            >
              <i className="fas fa-user-graduate"></i> Đăng ký tham gia
            </button>
            <button 
              className={`tab-button ${activeTab === 'question-banks' ? 'active' : ''}`}
              onClick={() => switchTab('question-banks')}
            >
              <i className="fas fa-question-circle"></i> Ngân hàng câu hỏi
            </button>
          </div>

          {/* Courses Tab */}
          {activeTab === 'courses' && (
            <div className="tab-content active">
              <div className="controls">
                <div className="search-filters">
                  <div className="search-box">
                    <i className="fas fa-search"></i>
                    <input 
                      type="text" 
                      placeholder="Tìm kiếm khóa học..." 
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                    />
                  </div>
                  
                  <select 
                    className="filter-select"
                    value={filters.courseSetId}
                    onChange={(e) => handleFilterChange('courseSetId', e.target.value)}
                  >
                    <option value="">Tất cả bộ khóa học</option>
                    {courseSets.map(courseSet => (
                      <option key={courseSet._id} value={courseSet._id}>
                        {courseSet.name}
                      </option>
                    ))}
                  </select>
                  
                  <select 
                    className="filter-select"
                    value={filters.isMandatory}
                    onChange={(e) => handleFilterChange('isMandatory', e.target.value)}
                  >
                    <option value="">Tất cả</option>
                    <option value="true">Bắt buộc</option>
                    <option value="false">Tự chọn</option>
                  </select>
                </div>
                
                <button className="btn btn-primary" onClick={() => openModal('addCourseModal')}>
                  <i className="fas fa-plus"></i> Tạo khóa học
                </button>
              </div>

              <div className="data-grid">
                {coursesLoading ? (
                  <div className="loading-spinner">
                    <i className="fas fa-spinner fa-spin"></i>
                    <span>Đang tải dữ liệu...</span>
                  </div>
                ) : courses.length === 0 ? (
                  <div className="empty-state">
                    <i className="fas fa-graduation-cap"></i>
                    <h3>Chưa có khóa học nào</h3>
                    <p>Hãy tạo khóa học đầu tiên để bắt đầu quản lý đào tạo</p>
                    <button className="btn btn-primary" onClick={() => openModal('addCourseModal')}>
                      <i className="fas fa-plus"></i> Tạo khóa học
                    </button>
                  </div>
                ) : (
                  courses.map(course => (
                    <div key={course._id} className="course-card">
                    <div className="card-header">
                      <div className="card-title">{course.course_name}</div>
                      <div className="card-description">{course.description}</div>
                      {course.is_mandatory && <div className="mandatory-badge">Bắt buộc</div>}
                    </div>
                    
                    <div className="card-body">
                      <div className="course-info">
                        <div className="info-item">
                          <i className="fas fa-clock"></i>
                          <span>{course.duration_hours} giờ</span>
                        </div>
                        <div className="info-item">
                          <i className="fas fa-certificate"></i>
                          <span>{course.validity_months ? course.validity_months + ' tháng' : 'Vĩnh viễn'}</span>
                        </div>
                        <div className="info-item">
                          <i className="fas fa-layer-group"></i>
                            <span>{course.course_set_id?.name || 'N/A'}</span>
                        </div>
                      </div>
                      
                      <div className="card-actions">
                          <button 
                            className="btn btn-warning btn-sm"
                            onClick={() => handleEditCourse(course)}
                          >
                          <i className="fas fa-edit"></i> Sửa
                        </button>
                          <button 
                            className="btn btn-success btn-sm"
                            onClick={() => openModalWithData('viewCourseModal', course)}
                          >
                          <i className="fas fa-eye"></i> Xem
                        </button>
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => openModalWithData('questionBankModal', course)}
                          >
                          <i className="fas fa-question-circle"></i> Câu hỏi
                        </button>
                          <button 
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteCourse(course._id)}
                          >
                            <i className="fas fa-trash"></i> Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Sessions Tab */}
          {activeTab === 'sessions' && (
            <div className="tab-content active">
              <div className="controls">
                <div className="search-filters">
                  <div className="search-box">
                    <i className="fas fa-search"></i>
                    <input 
                      type="text" 
                      placeholder="Tìm kiếm buổi đào tạo..." 
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                    />
                  </div>
                  
                  <select 
                    className="filter-select"
                    value={filters.statusCode}
                    onChange={(e) => handleFilterChange('statusCode', e.target.value)}
                  >
                    <option value="">Tất cả trạng thái</option>
                    <option value="SCHEDULED">Đã lên lịch</option>
                    <option value="ONGOING">Đang diễn ra</option>
                    <option value="COMPLETED">Hoàn thành</option>
                    <option value="CANCELLED">Đã hủy</option>
                  </select>

                  <select 
                    className="filter-select"
                    value={filters.courseId}
                    onChange={(e) => handleFilterChange('courseId', e.target.value)}
                  >
                    <option value="">Tất cả khóa học</option>
                    {courses.map(course => (
                      <option key={course._id} value={course._id}>
                        {course.course_name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <button className="btn btn-primary" onClick={() => openModal('addSessionModal')}>
                  <i className="fas fa-plus"></i> Lên lịch đào tạo
                </button>
              </div>

              <div className="data-grid">
                {sessionsLoading ? (
                  <div className="loading-spinner">
                    <i className="fas fa-spinner fa-spin"></i>
                    <span>Đang tải dữ liệu...</span>
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="empty-state">
                    <i className="fas fa-calendar-alt"></i>
                    <h3>Chưa có buổi đào tạo nào</h3>
                    <p>Hãy lên lịch buổi đào tạo đầu tiên</p>
                    <button className="btn btn-primary" onClick={() => openModal('addSessionModal')}>
                      <i className="fas fa-plus"></i> Lên lịch đào tạo
                    </button>
                  </div>
                ) : (
                  sessions.map(session => (
                    <div key={session._id} className="session-card">
                    <div className="card-header">
                      <div className="card-title">{session.session_name}</div>
                        <div className="card-description">{session.course_id.course_name}</div>
                      <div className={`status-badge status-${session.status_code.toLowerCase()}`}>
                        {getStatusLabel(session.status_code)}
                      </div>
                    </div>
                    
                    <div className="card-body">
                      <div className="session-info">
                        <div className="info-item">
                          <i className="fas fa-calendar-alt"></i>
                          <span>{formatDateTime(session.start_time)}</span>
                        </div>
                        <div className="info-item">
                          <i className="fas fa-calendar-check"></i>
                          <span>{formatDateTime(session.end_time)}</span>
                        </div>
                        <div className="info-item">
                          <i className="fas fa-map-marker-alt"></i>
                          <span>{session.location || 'Chưa xác định'}</span>
                        </div>
                      </div>
                      
                      <div className="card-actions">
                          <button 
                            className="btn btn-warning btn-sm"
                            onClick={() => handleEditSession(session)}
                          >
                          <i className="fas fa-edit"></i> Sửa
                        </button>
                          <button 
                            className="btn btn-success btn-sm"
                            onClick={() => openModalWithData('viewSessionModal', session)}
                          >
                          <i className="fas fa-eye"></i> Chi tiết
                        </button>
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => openModalWithData('enrollmentModal', session)}
                          >
                            <i className="fas fa-user-check"></i> Đăng ký
                          </button>
                          <button 
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteSession(session._id)}
                          >
                            <i className="fas fa-trash"></i> Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Enrollments Tab */}
          {activeTab === 'enrollments' && (
            <div className="tab-content active">
              <div className="controls">
                <div className="search-filters">
                  <div className="search-box">
                    <i className="fas fa-search"></i>
                    <input type="text" placeholder="Tìm kiếm theo tên nhân viên..." />
                  </div>
                  
                  <select className="filter-select">
                    <option value="">Tất cả trạng thái</option>
                    <option value="enrolled">Đã đăng ký</option>
                    <option value="completed">Hoàn thành</option>
                    <option value="failed">Chưa đạt</option>
                  </select>
                </div>
                
                <button className="btn btn-success" onClick={() => openModal('exportReportModal')}>
                  <i className="fas fa-download"></i> Xuất báo cáo
                </button>
              </div>

              <div className="data-table">
                <table>
                  <thead>
                    <tr>
                      <th>Nhân viên</th>
                      <th>Phòng ban</th>
                      <th>Khóa học</th>
                      <th>Buổi đào tạo</th>
                      <th>Ngày đăng ký</th>
                      <th>Trạng thái</th>
                      <th>Điểm số</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrollments.map(enrollment => {
                      const session = sessions.find(s => s._id === enrollment.session_id._id);
                      const courseName = session ? session.course_id.course_name : 'Không xác định';
                      const sessionName = session ? session.session_name : 'Không xác định';
                      
                      return (
                        <tr key={enrollment._id}>
                          <td style={{fontWeight: 600, color: '#2c3e50'}}>{enrollment.user_id.full_name}</td>
                          <td>{enrollment.user_id.email}</td>
                          <td>{courseName}</td>
                          <td>{sessionName}</td>
                          <td>{formatDateTime(enrollment.enrolled_at)}</td>
                          <td>
                            <span className={`status-badge status-${enrollment.status}`}>
                              {enrollment.status === 'enrolled' ? 'Đã đăng ký' : 
                               enrollment.status === 'completed' ? 'Hoàn thành' : 
                               enrollment.status === 'failed' ? 'Chưa đạt' : enrollment.status}
                            </span>
                          </td>
                          <td style={{
                            color: enrollment.score ? (enrollment.passed ? '#27ae60' : '#e74c3c') : '#666',
                            fontWeight: 600
                          }}>
                            {enrollment.score ? `${enrollment.score}/100` : '-'}
                          </td>
                          <td>
                            <button 
                              className="btn btn-warning btn-sm"
                              onClick={() => {
                                setEditingItem(enrollment);
                                openModal('editEnrollmentModal');
                              }}
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Question Banks Tab */}
          {activeTab === 'question-banks' && (
            <div className="tab-content active">
              <div className="controls">
                <div className="search-filters">
                  <div className="search-box">
                    <i className="fas fa-search"></i>
                    <input type="text" placeholder="Tìm kiếm ngân hàng câu hỏi..." />
                  </div>
                  
                  <select className="filter-select">
                    <option value="">Tất cả khóa học</option>
                    {courses.map(course => (
                      <option key={course._id} value={course._id}>
                        {course.course_name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <button className="btn btn-primary" onClick={() => openModal('addBankModal')}>
                  <i className="fas fa-plus"></i> Tạo ngân hàng câu hỏi
                </button>
              </div>

              <div className="data-grid">
                {questionBanksLoading ? (
                  <div className="loading-spinner">
                    <i className="fas fa-spinner fa-spin"></i>
                    <span>Đang tải dữ liệu...</span>
                  </div>
                ) : questionBanks.length === 0 ? (
                  <div className="empty-state">
                    <i className="fas fa-question-circle"></i>
                    <h3>Chưa có ngân hàng câu hỏi nào</h3>
                    <p>Hãy tạo ngân hàng câu hỏi đầu tiên</p>
                    <button className="btn btn-primary" onClick={() => openModal('addBankModal')}>
                      <i className="fas fa-plus"></i> Tạo ngân hàng câu hỏi
                    </button>
                  </div>
                ) : (
                  questionBanks.map(bank => (
                    <div key={bank._id} className="course-card">
                    <div className="card-header">
                      <div className="card-title">{bank.name}</div>
                      <div className="card-description">{bank.description}</div>
                    </div>
                    
                    <div className="card-body">
                      <div className="course-info">
                        <div className="info-item">
                          <i className="fas fa-book"></i>
                            <span>{bank.course_id.course_name}</span>
                        </div>
                        <div className="info-item">
                          <i className="fas fa-question-circle"></i>
                            <span>{questions.filter(q => q.bank_id === bank._id).length} câu hỏi</span>
                        </div>
                      </div>
                      
                      <div className="card-actions">
                          <button 
                            className="btn btn-warning btn-sm"
                            onClick={() => handleEditQuestionBank(bank)}
                          >
                          <i className="fas fa-edit"></i> Sửa
                        </button>
                          <button 
                            className="btn btn-success btn-sm"
                            onClick={() => openModalWithData('manageQuestionsModal', bank)}
                          >
                          <i className="fas fa-list"></i> Quản lý câu hỏi
                        </button>
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => openModalWithData('previewBankModal', bank)}
                          >
                          <i className="fas fa-eye"></i> Xem trước
                        </button>
                          <button 
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteQuestionBank(bank._id)}
                          >
                            <i className="fas fa-trash"></i> Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Course Modal */}
      {showModal === 'addCourseModal' && (
        <div className="modal active">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">{editingItem ? 'Chỉnh sửa khóa học' : 'Tạo khóa học mới'}</h2>
              <span className="close-modal" onClick={closeModal}>&times;</span>
            </div>
            
            <form onSubmit={handleCourseSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Tên khóa học *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    required 
                    value={courseForm.course_name}
                    onChange={(e) => setCourseForm(prev => ({ ...prev, course_name: e.target.value }))}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Bộ khóa học *</label>
                  <select 
                    className="form-input"
                    required
                    value={courseForm.course_set_id}
                    onChange={(e) => setCourseForm(prev => ({ ...prev, course_set_id: e.target.value }))}
                  >
                    <option value="">Chọn bộ khóa học</option>
                    {courseSets.map(courseSet => (
                      <option key={courseSet._id} value={courseSet._id}>
                        {courseSet.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Thời lượng (giờ) *</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    required 
                    min="1" 
                    value={courseForm.duration_hours}
                    onChange={(e) => setCourseForm(prev => ({ ...prev, duration_hours: e.target.value }))}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Hiệu lực (tháng)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    min="1" 
                    value={courseForm.validity_months}
                    onChange={(e) => setCourseForm(prev => ({ ...prev, validity_months: e.target.value }))}
                  />
                </div>
                
                <div className="form-group full-width">
                  <label className="form-label">Mô tả khóa học</label>
                  <textarea 
                    className="form-input" 
                    rows={4}
                    value={courseForm.description}
                    onChange={(e) => setCourseForm(prev => ({ ...prev, description: e.target.value }))}
                  ></textarea>
                </div>
                
                <div className="form-group full-width">
                  <div className="form-checkbox">
                    <input 
                      type="checkbox" 
                      checked={courseForm.is_mandatory}
                      onChange={(e) => setCourseForm(prev => ({ ...prev, is_mandatory: e.target.checked }))}
                    />
                    <label>Khóa học bắt buộc</label>
                  </div>
                </div>
              </div>
              
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  <i className="fas fa-save"></i> {editingItem ? 'Cập nhật' : 'Tạo'} khóa học
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Session Modal */}
      {showModal === 'addSessionModal' && (
        <div className="modal active">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">{editingItem ? 'Chỉnh sửa buổi đào tạo' : 'Lên lịch đào tạo'}</h2>
              <span className="close-modal" onClick={closeModal}>&times;</span>
            </div>
            
            <form onSubmit={handleSessionSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Tên buổi đào tạo *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    required 
                    value={sessionForm.session_name}
                    onChange={(e) => setSessionForm(prev => ({ ...prev, session_name: e.target.value }))}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Khóa học *</label>
                  {sessionForm.course_id && (
                    <div className="mb-2 p-2 bg-blue-100 border border-blue-300 rounded text-sm">
                      <strong>Debug:</strong> Current course_id: <code>{sessionForm.course_id}</code>
                      <button 
                        type="button" 
                        className="ml-2 px-2 py-1 bg-blue-600 text-white rounded text-xs"
                        onClick={() => setSessionForm(prev => ({ ...prev, course_id: '' }))}
                      >
                        Clear
                      </button>
                    </div>
                  )}
                  {!allCourses || allCourses.length === 0 ? (
                    <div className="alert alert-warning">
                      <strong>Không có khóa học nào!</strong><br />
                      Vui lòng tạo khóa học trước khi tạo buổi đào tạo.
                      <br />
                      <div className="mt-2 space-x-2">
                        <button 
                          type="button" 
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => {
                            console.log('Force clearing course_id:', sessionForm.course_id);
                            setSessionForm(prev => ({ ...prev, course_id: '' }));
                          }}
                        >
                          Xóa Course ID (Debug)
                        </button>
                        <button 
                          type="button" 
                          className="btn btn-sm btn-outline-success"
                          onClick={() => {
                            console.log('Setting test course ID');
                            setSessionForm(prev => ({ ...prev, course_id: '68d4036ff00023bc69569527' }));
                          }}
                        >
                          Set Test Course ID
                        </button>
                      </div>
                    </div>
                  ) : (
                    <select 
                      className="form-input" 
                      required
                      value={sessionForm.course_id}
                      onChange={(e) => setSessionForm(prev => ({ ...prev, course_id: e.target.value }))}
                    >
                    <option value="">Chọn khóa học</option>
                      {allCourses.map(course => (
                        <option key={course._id} value={course._id}>
                        {course.course_name}
                      </option>
                    ))}
                  </select>
                  )}
                  {sessionForm.course_id && (
                    <div className="mt-2">
                      <small className="text-muted">
                        Current course_id: <code>{sessionForm.course_id}</code>
                      </small>
                      <button 
                        type="button" 
                        className="btn btn-sm btn-outline-danger ml-2"
                        onClick={() => {
                          console.log('Manual clear course_id:', sessionForm.course_id);
                          setSessionForm(prev => ({ ...prev, course_id: '' }));
                        }}
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="form-group">
                  <label className="form-label">Ngày bắt đầu *</label>
                  <input 
                    type="datetime-local" 
                    className="form-input" 
                    required 
                    value={sessionForm.start_time}
                    onChange={(e) => setSessionForm(prev => ({ ...prev, start_time: e.target.value }))}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Ngày kết thúc *</label>
                  <input 
                    type="datetime-local" 
                    className="form-input" 
                    required 
                    value={sessionForm.end_time}
                    onChange={(e) => setSessionForm(prev => ({ ...prev, end_time: e.target.value }))}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Số lượng tối đa</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    min="1" 
                    defaultValue="20"
                    value={sessionForm.max_participants}
                    onChange={(e) => setSessionForm(prev => ({ ...prev, max_participants: e.target.value }))}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Trạng thái</label>
                  <select 
                    className="form-input"
                    value={sessionForm.status_code}
                    onChange={(e) => setSessionForm(prev => ({ ...prev, status_code: e.target.value }))}
                  >
                    <option value="SCHEDULED">Đã lên lịch</option>
                    <option value="ONGOING">Đang diễn ra</option>
                    <option value="COMPLETED">Hoàn thành</option>
                    <option value="CANCELLED">Đã hủy</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Địa điểm</label>
                  <input 
                    type="text" 
                    className="form-input"
                    value={sessionForm.location}
                    onChange={(e) => setSessionForm(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  <i className="fas fa-calendar-plus"></i> {editingItem ? 'Cập nhật' : 'Tạo'} lịch đào tạo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Question Bank Modal */}
      {showModal === 'addBankModal' && (
        <div className="modal active">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">{editingItem ? 'Chỉnh sửa ngân hàng câu hỏi' : 'Tạo ngân hàng câu hỏi'}</h2>
              <span className="close-modal" onClick={closeModal}>&times;</span>
            </div>
            
            <form onSubmit={handleQuestionBankSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Tên ngân hàng câu hỏi *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    required 
                    value={questionBankForm.name}
                    onChange={(e) => setQuestionBankForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Khóa học *</label>
                  {!allCourses || allCourses.length === 0 ? (
                    <div className="alert alert-warning">
                      <strong>Không có khóa học nào!</strong><br />
                      Vui lòng tạo khóa học trước khi tạo ngân hàng câu hỏi.
                    </div>
                  ) : (
                    <select 
                      className="form-input" 
                      required
                      value={questionBankForm.course_id}
                      onChange={(e) => setQuestionBankForm(prev => ({ ...prev, course_id: e.target.value }))}
                    >
                    <option value="">Chọn khóa học</option>
                      {allCourses.map(course => (
                        <option key={course._id} value={course._id}>
                        {course.course_name}
                      </option>
                    ))}
                  </select>
                  )}
                </div>
                
                <div className="form-group full-width">
                  <label className="form-label">Mô tả</label>
                  <textarea 
                    className="form-input" 
                    rows={3}
                    value={questionBankForm.description}
                    onChange={(e) => setQuestionBankForm(prev => ({ ...prev, description: e.target.value }))}
                  ></textarea>
                </div>
              </div>
              
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  <i className="fas fa-save"></i> {editingItem ? 'Cập nhật' : 'Tạo'} ngân hàng câu hỏi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
      {showModal === 'manageQuestionsModal' && editingItem && (
        <div className="modal active">
          <div className="modal-content large">
            <div className="modal-header">
              <h2 className="modal-title">Quản lý câu hỏi - {editingItem.name}</h2>
              <span className="close-modal" onClick={closeModal}>&times;</span>
            </div>
            
            <div className="questions-management">
              <div className="questions-header">
                <div className="questions-info">
                  <p>Tổng số câu hỏi: {questions.filter(q => q.bank_id === editingItem._id).length}</p>
                </div>
                <div className="questions-actions">
                  <button 
                    className="btn btn-success"
                    onClick={handleDownloadTemplate}
                  >
                    <i className="fas fa-download"></i> Tải template
                  </button>
                  <button 
                    className="btn btn-info"
                    onClick={() => openModalWithData('importExcelModal', editingItem)}
                  >
                    <i className="fas fa-file-excel"></i> Import Excel
                  </button>
                  <button 
                    className="btn btn-primary"
                    onClick={() => openModal('addQuestionModal')}
                  >
                    <i className="fas fa-plus"></i> Thêm câu hỏi
                  </button>
                </div>
              </div>
              
              <div className="questions-list">
                {questions.filter(q => q.bank_id === editingItem._id).length === 0 ? (
                  <div className="empty-state">
                    <i className="fas fa-question-circle"></i>
                    <h3>Chưa có câu hỏi nào</h3>
                    <p>Hãy thêm câu hỏi đầu tiên cho ngân hàng này</p>
                    <button 
                      className="btn btn-primary"
                      onClick={() => openModal('addQuestionModal')}
                    >
                      <i className="fas fa-plus"></i> Thêm câu hỏi
                    </button>
                  </div>
                ) : (
                  questions.filter(q => q.bank_id === editingItem._id).map((question, index) => (
                    <div key={question._id} className="question-item">
                      <div className="question-header">
                        <span className="question-number">Câu {index + 1}</span>
                        <span className="question-type">{(question as any).type || 'Multiple Choice'}</span>
                        <div className="question-actions">
                          <button 
                            className="btn btn-warning btn-sm"
                            onClick={() => handleEditQuestion(question)}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button 
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteQuestion(question._id)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </div>
                      <div className="question-content">
                        <p>{(question as any).content || (question as any).question_text || (question as any).question || 'Nội dung câu hỏi'}</p>
                        {question.options && (
                          <div className="question-options">
                            {(question as any).options?.map((option: string, optIndex: number) => (
                              <div key={optIndex} className={`option ${option === (question as any).correct_answer ? 'correct' : ''}`}>
                                {String.fromCharCode(65 + optIndex)}. {option}
                              </div>
                            )) || []}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={closeModal}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

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
      {showModal === 'addQuestionModal' && (
        <div className="modal active">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">{editingItem && editingItem.content ? 'Chỉnh sửa câu hỏi' : 'Thêm câu hỏi mới'}</h2>
              <span className="close-modal" onClick={closeModal}>&times;</span>
            </div>
            
            <form onSubmit={handleQuestionSubmit}>
              <div className="form-group">
                <label className="form-label">Nội dung câu hỏi</label>
                <textarea 
                  className="form-input" 
                  rows={3}
                  placeholder="Nhập nội dung câu hỏi..."
                  value={questionForm.content}
                  onChange={(e) => setQuestionForm(prev => ({ ...prev, content: e.target.value }))}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Các lựa chọn</label>
                <div className="options-container">
                  {questionForm.options.map((option, index) => (
                    <input 
                      key={index}
                      type="text" 
                      className="form-input" 
                      placeholder={`Lựa chọn ${String.fromCharCode(65 + index)}`}
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...questionForm.options];
                        newOptions[index] = e.target.value;
                        setQuestionForm(prev => ({ ...prev, options: newOptions }));
                      }}
                      required={index < 2}
                    />
                  ))}
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Đáp án đúng</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Nhập đáp án đúng..."
                  value={questionForm.correct_answer}
                  onChange={(e) => setQuestionForm(prev => ({ ...prev, correct_answer: e.target.value }))}
                  required
                />
              </div>
              
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  <i className="fas fa-plus"></i> Thêm câu hỏi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Excel Modal */}
      {showModal === 'importExcelModal' && (
        <div className="modal active">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Import câu hỏi từ Excel</h2>
              <span className="close-modal" onClick={closeModal}>&times;</span>
            </div>
            
            <div className="form-group">
              <label className="form-label">Ngân hàng câu hỏi</label>
              <div className="form-input-static">
                <i className="fas fa-database"></i>
                {editingItem ? editingItem.name : 'Chưa chọn ngân hàng câu hỏi'}
              </div>
              <small className="form-text">
                Câu hỏi sẽ được import vào ngân hàng này
              </small>
            </div>

            <div className="form-group">
              <label className="form-label">Chọn file Excel</label>
              <input 
                type="file" 
                className="form-input" 
                accept=".xlsx,.xls"
                onChange={handleExcelFileChange}
              />
              <small className="form-text">
                Chỉ chấp nhận file Excel (.xlsx, .xls). Tải template mẫu để xem định dạng.
              </small>
            </div>

            {excelFile && (
              <div className="alert alert-info">
                <i className="fas fa-info-circle"></i>
                File đã chọn: {excelFile.name}
              </div>
            )}
            
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={closeModal}>
                Hủy
              </button>
              <button 
                type="button" 
                className="btn btn-success"
                onClick={handleImportExcel}
                disabled={!excelFile || !editingItem}
              >
                <i className="fas fa-upload"></i> Import câu hỏi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingManagement;
