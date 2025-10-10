import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Button, 
  Space, 
  Tabs, 
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
  DatePicker
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
  ArrowLeftOutlined
} from '@ant-design/icons';
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
    <div style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <Card style={{ marginBottom: '24px' }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Space direction="vertical" size={0}>
                <Typography.Title level={2} style={{ margin: 0, color: '#1890ff' }}>
                  <BookOutlined style={{ marginRight: '8px' }} />
                  Quản lý đào tạo
                </Typography.Title>
                <Breadcrumb style={{ marginTop: '8px' }}>
                  <Breadcrumb.Item>
                    <a href="/admin/dashboard">Dashboard</a>
                  </Breadcrumb.Item>
                  <Breadcrumb.Item>Quản lý đào tạo</Breadcrumb.Item>
                </Breadcrumb>
              </Space>
            </Col>
            <Col>
              <Button 
                type="default" 
                icon={<ArrowLeftOutlined />}
                href="/admin/dashboard"
              >
                Quay lại
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Tabs */}
        <Card>
          <Tabs
            activeKey={activeTab}
            onChange={(key) => switchTab(key as any)}
            items={[
              {
                key: 'courses',
                label: (
                  <span>
                    <BookOutlined />
                    Khóa học
                  </span>
                ),
                children: null
              },
              {
                key: 'sessions',
                label: (
                  <span>
                    <CalendarOutlined />
                    Buổi đào tạo
                  </span>
                ),
                children: null
              },
              {
                key: 'enrollments',
                label: (
                  <span>
                    <UserOutlined />
                    Đăng ký tham gia
                  </span>
                ),
                children: null
              },
              {
                key: 'question-banks',
                label: (
                  <span>
                    <QuestionCircleOutlined />
                    Ngân hàng câu hỏi
                  </span>
                ),
                children: null
              }
            ]}
          />

          {/* Courses Tab */}
          {activeTab === 'courses' && (
            <div style={{ marginTop: '16px' }}>
              <Card>
                <Row justify="space-between" align="middle" style={{ marginBottom: '16px' }}>
                  <Col>
                    <Space wrap>
                      <Input
                        placeholder="Tìm kiếm khóa học..."
                        prefix={<SearchOutlined />}
                        style={{ width: 300 }}
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                      />
                      
                      <Select
                        placeholder="Tất cả bộ khóa học"
                        style={{ width: 200 }}
                        value={filters.courseSetId}
                        onChange={(value) => handleFilterChange('courseSetId', value)}
                        allowClear
                      >
                        {courseSets.map(courseSet => (
                          <Select.Option key={courseSet._id} value={courseSet._id}>
                            {courseSet.name}
                          </Select.Option>
                        ))}
                      </Select>
                      
                      <Select
                        placeholder="Tất cả"
                        style={{ width: 150 }}
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
                      onClick={() => openModal('addCourseModal')}
                    >
                      Tạo khóa học
                    </Button>
                  </Col>
                </Row>

                {coursesLoading ? (
                  <div style={{ textAlign: 'center', padding: '50px' }}>
                    <Spin size="large" />
                    <div style={{ marginTop: '16px' }}>Đang tải dữ liệu...</div>
                  </div>
                ) : courses.length === 0 ? (
                  <Empty
                    image={<BookOutlined style={{ fontSize: '64px', color: '#d9d9d9' }} />}
                    description={
                      <div>
                        <Typography.Title level={4}>Chưa có khóa học nào</Typography.Title>
                        <Typography.Text type="secondary">
                          Hãy tạo khóa học đầu tiên để bắt đầu quản lý đào tạo
                        </Typography.Text>
                      </div>
                    }
                  >
                    <Button 
                      type="primary" 
                      icon={<PlusOutlined />}
                      onClick={() => openModal('addCourseModal')}
                    >
                      Tạo khóa học
                    </Button>
                  </Empty>
                ) : (
                  <Row gutter={[16, 16]}>
                    {courses.map(course => (
                      <Col xs={24} sm={12} lg={8} xl={6} key={course._id}>
                        <Card
                          hoverable
                          style={{ height: '100%' }}
                          actions={[
                            <Tooltip title="Sửa">
                              <Button 
                                type="text" 
                                icon={<EditOutlined />}
                                onClick={() => handleEditCourse(course)}
                              />
                            </Tooltip>,
                            <Tooltip title="Xem">
                              <Button 
                                type="text" 
                                icon={<EyeOutlined />}
                                onClick={() => openModalWithData('viewCourseModal', course)}
                              />
                            </Tooltip>,
                            <Tooltip title="Câu hỏi">
                              <Button 
                                type="text" 
                                icon={<QuestionCircleOutlined />}
                                onClick={() => openModalWithData('questionBankModal', course)}
                              />
                            </Tooltip>,
                            <Popconfirm
                              title="Xóa khóa học"
                              description="Bạn có chắc chắn muốn xóa khóa học này?"
                              onConfirm={() => handleDeleteCourse(course._id)}
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
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography.Text strong style={{ fontSize: '16px' }}>
                                  {course.course_name}
                                </Typography.Text>
                                {course.is_mandatory && (
                                  <Tag color="red">Bắt buộc</Tag>
                                )}
                              </div>
                            }
                            description={
                              <div>
                                <Typography.Paragraph 
                                  ellipsis={{ rows: 2 }} 
                                  style={{ marginBottom: '12px', color: '#666' }}
                                >
                                  {course.description}
                                </Typography.Paragraph>
                                
                                <Space direction="vertical" size={4}>
                                  <Space>
                                    <ClockCircleOutlined style={{ color: '#1890ff' }} />
                                    <Typography.Text>{course.duration_hours} giờ</Typography.Text>
                                  </Space>
                                  <Space>
                                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                                    <Typography.Text>
                                      {course.validity_months ? course.validity_months + ' tháng' : 'Vĩnh viễn'}
                                    </Typography.Text>
                                  </Space>
                                  <Space>
                                    <BookOutlined style={{ color: '#722ed1' }} />
                                    <Typography.Text>{course.course_set_id?.name || 'N/A'}</Typography.Text>
                                  </Space>
                                </Space>
                              </div>
                            }
                          />
                        </Card>
                      </Col>
                    ))}
                  </Row>
                )}
              </Card>
            </div>
          )}

          {/* Sessions Tab */}
          {activeTab === 'sessions' && (
            <div style={{ marginTop: '16px' }}>
              <Card>
                <Row justify="space-between" align="middle" style={{ marginBottom: '16px' }}>
                  <Col>
                    <Space wrap>
                      <Input
                        placeholder="Tìm kiếm buổi đào tạo..."
                        prefix={<SearchOutlined />}
                        style={{ width: 300 }}
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                      />
                      
                      <Select
                        placeholder="Tất cả trạng thái"
                        style={{ width: 180 }}
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
                        style={{ width: 200 }}
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
                    >
                      Lên lịch đào tạo
                    </Button>
                  </Col>
                </Row>

                {sessionsLoading ? (
                  <div style={{ textAlign: 'center', padding: '50px' }}>
                    <Spin size="large" />
                    <div style={{ marginTop: '16px' }}>Đang tải dữ liệu...</div>
                  </div>
                ) : sessions.length === 0 ? (
                  <Empty
                    image={<CalendarOutlined style={{ fontSize: '64px', color: '#d9d9d9' }} />}
                    description={
                      <div>
                        <Typography.Title level={4}>Chưa có buổi đào tạo nào</Typography.Title>
                        <Typography.Text type="secondary">
                          Hãy lên lịch buổi đào tạo đầu tiên
                        </Typography.Text>
                      </div>
                    }
                  >
                    <Button 
                      type="primary" 
                      icon={<PlusOutlined />}
                      onClick={() => openModal('addSessionModal')}
                    >
                      Lên lịch đào tạo
                    </Button>
                  </Empty>
                ) : (
                  <Row gutter={[16, 16]}>
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
                        <Col xs={24} sm={12} lg={8} xl={6} key={session._id}>
                          <Card
                            hoverable
                            style={{ height: '100%' }}
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
                              title={
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Typography.Text strong style={{ fontSize: '16px' }}>
                                    {session.session_name}
                                  </Typography.Text>
                                  <Tag color={getStatusColor(session.status_code)}>
                                    {getStatusLabel(session.status_code)}
                                  </Tag>
                                </div>
                              }
                              description={
                                <div>
                                  <Typography.Text type="secondary" style={{ fontSize: '14px' }}>
                                    {session.course_id.course_name}
                                  </Typography.Text>
                                  
                                  <Divider style={{ margin: '12px 0' }} />
                                  
                                  <Space direction="vertical" size={4}>
                                    <Space>
                                      <CalendarOutlined style={{ color: '#1890ff' }} />
                                      <Typography.Text style={{ fontSize: '12px' }}>
                                        {formatDateTime(session.start_time)}
                                      </Typography.Text>
                                    </Space>
                                    <Space>
                                      <CheckCircleOutlined style={{ color: '#52c41a' }} />
                                      <Typography.Text style={{ fontSize: '12px' }}>
                                        {formatDateTime(session.end_time)}
                                      </Typography.Text>
                                    </Space>
                                    <Space>
                                      <InfoCircleOutlined style={{ color: '#722ed1' }} />
                                      <Typography.Text style={{ fontSize: '12px' }}>
                                        {session.location || 'Chưa xác định'}
                                      </Typography.Text>
                                    </Space>
                                  </Space>
                                </div>
                              }
                            />
                          </Card>
                        </Col>
                      );
                    })}
                  </Row>
                )}
              </Card>
            </div>
          )}

          {/* Enrollments Tab */}
          {activeTab === 'enrollments' && (
            <div style={{ marginTop: '16px' }}>
              <Card>
                <Row justify="space-between" align="middle" style={{ marginBottom: '16px' }}>
                  <Col>
                    <Space wrap>
                      <Input
                        placeholder="Tìm kiếm theo tên nhân viên..."
                        prefix={<SearchOutlined />}
                        style={{ width: 300 }}
                      />
                      
                      <Select
                        placeholder="Tất cả trạng thái"
                        style={{ width: 180 }}
                        allowClear
                      >
                        <Select.Option value="enrolled">Đã đăng ký</Select.Option>
                        <Select.Option value="completed">Hoàn thành</Select.Option>
                        <Select.Option value="failed">Chưa đạt</Select.Option>
                      </Select>
                    </Space>
                  </Col>
                  <Col>
                    <Button 
                      type="primary" 
                      icon={<DownloadOutlined />}
                      onClick={() => openModal('exportReportModal')}
                    >
                      Xuất báo cáo
                    </Button>
                  </Col>
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
                  columns={[
                    {
                      title: 'Nhân viên',
                      dataIndex: ['user_id', 'full_name'],
                      key: 'user',
                      render: (text: string, record: any) => (
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
                        const session = sessions.find(s => s._id === record.session_id._id);
                        return session ? session.course_id.course_name : 'Không xác định';
                      }
                    },
                    {
                      title: 'Buổi đào tạo',
                      key: 'session',
                      render: (_, record: any) => {
                        const session = sessions.find(s => s._id === record.session_id._id);
                        return session ? session.session_name : 'Không xác định';
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
                    },
                    {
                      title: 'Thao tác',
                      key: 'actions',
                      render: (_, record: any) => (
                        <Space>
                          <Tooltip title="Chỉnh sửa">
                            <Button 
                              type="text" 
                              icon={<EditOutlined />}
                              onClick={() => {
                                setEditingItem(record);
                                openModal('editEnrollmentModal');
                              }}
                            />
                          </Tooltip>
                        </Space>
                      )
                    }
                  ]}
                />
              </Card>
            </div>
          )}

          {/* Question Banks Tab */}
          {activeTab === 'question-banks' && (
            <div style={{ marginTop: '16px' }}>
              <Card>
                <Row justify="space-between" align="middle" style={{ marginBottom: '16px' }}>
                  <Col>
                    <Space wrap>
                      <Input
                        placeholder="Tìm kiếm ngân hàng câu hỏi..."
                        prefix={<SearchOutlined />}
                        style={{ width: 300 }}
                      />
                      
                      <Select
                        placeholder="Tất cả khóa học"
                        style={{ width: 200 }}
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
                      onClick={() => openModal('addBankModal')}
                    >
                      Tạo ngân hàng câu hỏi
                    </Button>
                  </Col>
                </Row>

                {questionBanksLoading ? (
                  <div style={{ textAlign: 'center', padding: '50px' }}>
                    <Spin size="large" />
                    <div style={{ marginTop: '16px' }}>Đang tải dữ liệu...</div>
                  </div>
                ) : questionBanks.length === 0 ? (
                  <Empty
                    image={<QuestionCircleOutlined style={{ fontSize: '64px', color: '#d9d9d9' }} />}
                    description={
                      <div>
                        <Typography.Title level={4}>Chưa có ngân hàng câu hỏi nào</Typography.Title>
                        <Typography.Text type="secondary">
                          Hãy tạo ngân hàng câu hỏi đầu tiên
                        </Typography.Text>
                      </div>
                    }
                  >
                    <Button 
                      type="primary" 
                      icon={<PlusOutlined />}
                      onClick={() => openModal('addBankModal')}
                    >
                      Tạo ngân hàng câu hỏi
                    </Button>
                  </Empty>
                ) : (
                  <Row gutter={[16, 16]}>
                    {questionBanks.map(bank => (
                      <Col xs={24} sm={12} lg={8} xl={6} key={bank._id}>
                        <Card
                          hoverable
                          style={{ height: '100%' }}
                          actions={[
                            <Tooltip title="Sửa">
                              <Button 
                                type="text" 
                                icon={<EditOutlined />}
                                onClick={() => handleEditQuestionBank(bank)}
                              />
                            </Tooltip>,
                            <Tooltip title="Quản lý câu hỏi">
                              <Button 
                                type="text" 
                                icon={<QuestionCircleOutlined />}
                                onClick={() => openModalWithData('manageQuestionsModal', bank)}
                              />
                            </Tooltip>,
                            <Tooltip title="Xem trước">
                              <Button 
                                type="text" 
                                icon={<EyeOutlined />}
                                onClick={() => openModalWithData('previewBankModal', bank)}
                              />
                            </Tooltip>,
                            <Popconfirm
                              title="Xóa ngân hàng câu hỏi"
                              description="Bạn có chắc chắn muốn xóa ngân hàng câu hỏi này?"
                              onConfirm={() => handleDeleteQuestionBank(bank._id)}
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
                              <Typography.Text strong style={{ fontSize: '16px' }}>
                                {bank.name}
                              </Typography.Text>
                            }
                            description={
                              <div>
                                <Typography.Paragraph 
                                  ellipsis={{ rows: 2 }} 
                                  style={{ marginBottom: '12px', color: '#666' }}
                                >
                                  {bank.description}
                                </Typography.Paragraph>
                                
                                <Space direction="vertical" size={4}>
                                  <Space>
                                    <BookOutlined style={{ color: '#1890ff' }} />
                                    <Typography.Text>{bank.course_id.course_name}</Typography.Text>
                                  </Space>
                                  <Space>
                                    <QuestionCircleOutlined style={{ color: '#52c41a' }} />
                                    <Typography.Text>
                                      {questions.filter(q => q.bank_id === bank._id).length} câu hỏi
                                    </Typography.Text>
                                  </Space>
                                </Space>
                              </div>
                            }
                          />
                        </Card>
                      </Col>
                    ))}
                  </Row>
                )}
              </Card>
            </div>
          )}
        </Card>
      </div>

      {/* Add Course Modal */}
      <Modal
        title={editingItem ? 'Chỉnh sửa khóa học' : 'Tạo khóa học mới'}
        open={showModal === 'addCourseModal'}
        onCancel={closeModal}
        footer={null}
        width={800}
      >
        <Form
          layout="vertical"
          onFinish={handleCourseSubmit}
          initialValues={courseForm}
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
                  value={courseForm.course_name}
                  onChange={(e) => setCourseForm(prev => ({ ...prev, course_name: e.target.value }))}
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
                  value={courseForm.course_set_id}
                  onChange={(value) => setCourseForm(prev => ({ ...prev, course_set_id: value }))}
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
                  value={courseForm.duration_hours}
                  onChange={(e) => setCourseForm(prev => ({ ...prev, duration_hours: e.target.value }))}
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
                  value={courseForm.validity_months}
                  onChange={(e) => setCourseForm(prev => ({ ...prev, validity_months: e.target.value }))}
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
              value={courseForm.description}
              onChange={(e) => setCourseForm(prev => ({ ...prev, description: e.target.value }))}
            />
          </Form.Item>

          <Form.Item name="is_mandatory" valuePropName="checked">
            <Checkbox
              checked={courseForm.is_mandatory}
              onChange={(e) => setCourseForm(prev => ({ ...prev, is_mandatory: e.target.checked }))}
            >
              Khóa học bắt buộc
            </Checkbox>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={closeModal}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
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
          initialValues={sessionForm}
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
                  value={sessionForm.start_time ? new Date(sessionForm.start_time) : null}
                  onChange={(date) => {
                    if (date) {
                      setSessionForm(prev => ({ 
                        ...prev, 
                        start_time: date.toISOString().slice(0, 16)
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
                  value={sessionForm.end_time ? new Date(sessionForm.end_time) : null}
                  onChange={(date) => {
                    if (date) {
                      setSessionForm(prev => ({ 
                        ...prev, 
                        end_time: date.toISOString().slice(0, 16)
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
              <Button onClick={closeModal}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" icon={<CalendarOutlined />}>
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
          layout="vertical"
          onFinish={handleQuestionBankSubmit}
          initialValues={questionBankForm}
        >
          <Form.Item
            label="Tên ngân hàng câu hỏi"
            name="name"
            rules={[{ required: true, message: 'Vui lòng nhập tên ngân hàng câu hỏi' }]}
          >
            <Input 
              placeholder="Nhập tên ngân hàng câu hỏi"
              value={questionBankForm.name}
              onChange={(e) => setQuestionBankForm(prev => ({ ...prev, name: e.target.value }))}
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
                value={questionBankForm.course_id}
                onChange={(value) => setQuestionBankForm(prev => ({ ...prev, course_id: value }))}
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
              value={questionBankForm.description}
              onChange={(e) => setQuestionBankForm(prev => ({ ...prev, description: e.target.value }))}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={closeModal}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
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
                    onClick={() => openModal('addQuestionModal')}
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
                  onClick={() => openModal('addQuestionModal')}
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
          initialValues={questionForm}
        >
          <Form.Item
            label="Nội dung câu hỏi"
            name="content"
            rules={[{ required: true, message: 'Vui lòng nhập nội dung câu hỏi' }]}
          >
            <Input.TextArea 
              rows={3}
              placeholder="Nhập nội dung câu hỏi..."
              value={questionForm.content}
              onChange={(e) => setQuestionForm(prev => ({ ...prev, content: e.target.value }))}
            />
          </Form.Item>

          <Form.Item
            label="Các lựa chọn"
            name="options"
            rules={[{ required: true, message: 'Vui lòng nhập ít nhất 2 lựa chọn' }]}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              {questionForm.options.map((option, index) => (
                <Input
                  key={index}
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
            </Space>
          </Form.Item>

          <Form.Item
            label="Đáp án đúng"
            name="correct_answer"
            rules={[{ required: true, message: 'Vui lòng nhập đáp án đúng' }]}
          >
            <Input 
              placeholder="Nhập đáp án đúng..."
              value={questionForm.correct_answer}
              onChange={(e) => setQuestionForm(prev => ({ ...prev, correct_answer: e.target.value }))}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={closeModal}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
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
    </div>
  );
};

export default TrainingManagement;
