import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Card,
  Row,
  Col,
  Button,
  Tabs,
  Input,
  Select,
  message,
  Spin,
  Empty,
  Space,
  Typography,
  Badge,
  Tag
} from 'antd';
import {
  BookOutlined,
  TrophyOutlined,
  SearchOutlined,
  PlusOutlined,
  PlayCircleOutlined,
  RedoOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  GroupOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import type { RootState } from '../../../store';
import { useCourses, useAvailableTrainingSessions, useTrainingEnrollments } from '../../../hooks/useTraining';
import { api } from '../../../services/api';
import { EmployeeLayout } from '../../../components/Employee';

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;

const EmployeeTraining: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'available' | 'enrolled' | 'completed'>('available');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourseSet] = useState('');
  const [isMandatory, setIsMandatory] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  // API hooks
  const { courses, loading: coursesLoading, fetchCourses } = useCourses({
    courseSetId: selectedCourseSet || undefined,
    isMandatory: isMandatory ? isMandatory === 'true' : undefined,
    isDeployed: true, // Only show deployed courses for employees
  });
  
  const { sessions, fetchSessions } = useAvailableTrainingSessions();
  const { enrollments, loading: enrollmentsLoading, fetchEnrollments } = useTrainingEnrollments({
    userId: user?.id
  });

  // Refresh data when component mounts or when coming back from training session
  useEffect(() => {
    console.log('🔄 Refreshing training data...');
    console.log('👤 Current user:', user);
    fetchCourses();
    fetchSessions();
    fetchEnrollments();
  }, [refreshKey, fetchCourses, fetchSessions, fetchEnrollments, user]);

  // Check if we're coming back from a training session completion
  useEffect(() => {
    if (location.state?.trainingCompleted) {
      console.log('✅ Training completed, refreshing data...');
      setRefreshKey(prev => prev + 1);
      // Clear the state to prevent unnecessary refreshes
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  // Filter courses based on search term
  const filteredCourses = courses.filter(course =>
    course.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get user's enrollments
  const userEnrollments = enrollments.filter(enrollment => 
    user?.id && enrollment.user_id?._id === user.id
  );

  // Debug logging
  console.log('📊 Debug Data:');
  console.log('  - All enrollments:', enrollments);
  console.log('  - User enrollments:', userEnrollments);
  console.log('  - All sessions:', sessions);
  console.log('  - All courses:', courses);

  // Get enrolled course IDs - use session data from enrollment if sessions array is empty
  const enrolledCourseIds = userEnrollments.map(enrollment => {
    // First try to find session in sessions array
    let session = sessions.find(s => s._id === enrollment.session_id?._id);
    
    // If not found in sessions array, use the session data from enrollment
    if (!session && enrollment.session_id) {
      session = enrollment.session_id as any;
    }
    
    return session?.course_id?._id;
  }).filter(Boolean);

  // Get available courses (not enrolled)
  const availableCourses = filteredCourses.filter(course => 
    !enrolledCourseIds.includes(course._id)
  );

  // Get enrolled courses - include all courses that user has enrollments for
  const enrolledCourses = userEnrollments.map(enrollment => {
    // First try to find session in sessions array
    let session = sessions.find(s => s._id === enrollment.session_id?._id);
    
    // If not found in sessions array, use the session data from enrollment
    if (!session && enrollment.session_id) {
      session = enrollment.session_id as any;
    }
    
    // Try to find course in filteredCourses first, then in all courses
    let course = filteredCourses.find(c => c._id === session?.course_id?._id);
    if (!course) {
      course = courses.find(c => c._id === session?.course_id?._id);
    }
    
    return course;
  }).filter(Boolean);

  // Get completed courses
  const completedCourses = userEnrollments
    .filter(enrollment => enrollment.status === 'completed')
    .map(enrollment => {
      // First try to find session in sessions array
      let session = sessions.find(s => s._id === enrollment.session_id?._id);
      
      // If not found in sessions array, use the session data from enrollment
      if (!session && enrollment.session_id) {
        session = enrollment.session_id as any;
      }
      
      // Try to find course in filteredCourses first, then in all courses
      let course = session ? filteredCourses.find(c => c._id === session.course_id?._id) : null;
      if (!course && session) {
        course = courses.find(c => c._id === session.course_id?._id);
      }
      return course;
    })
    .filter(Boolean);

  const courseIdToEnrollment = useMemo(() => {
    const map: Record<string, any> = {};
    userEnrollments.forEach(en => {
      const session = sessions.find(s => s._id === en.session_id?._id);
      const cId = session?.course_id?._id;
      if (cId) map[cId] = en;
    });
    return map;
  }, [userEnrollments, sessions]);

  const handleEnroll = async (courseId: string) => {
    try {
      // Find available sessions for this course
      const availableSessions = sessions.filter(session => 
        session.course_id?._id === courseId && 
        session.status_code === 'SCHEDULED' &&
        !userEnrollments.some(enrollment => enrollment.session_id?._id === session._id)
      );

      if (availableSessions.length === 0) {
        message.warning('Không có buổi đào tạo nào khả dụng cho khóa học này');
        return;
      }

      // For now, enroll in the first available session
      const sessionToEnroll = availableSessions[0];
      
      const response = await api.post('/training/enrollments', {
        session_id: sessionToEnroll._id,
        user_id: user?.id,
      });

      if (response.data.success) {
        message.success('Đăng ký thành công!');
        // Refresh all data to show updated enrollments
        handleRefresh();
      } else {
        message.error(`Lỗi: ${response.data.message || 'Không thể đăng ký'}`);
      }
    } catch (error: any) {
      console.error('Error enrolling:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi đăng ký';
      message.error(`Lỗi đăng ký: ${errorMessage}`);
    }
  };

  const handleLogout = () => {
    navigate('/login');
  };

  const handleRefresh = () => {
    console.log('🔄 Manual refresh triggered');
    setRefreshKey(prev => prev + 1);
  };

  const handleStartTraining = async (courseId: string) => {
    try {
      // Find the session for this course that user is enrolled in
      const enrollment = userEnrollments.find(enrollment => {
        // First try to find session in sessions array
        let session = sessions.find(s => s._id === enrollment.session_id?._id);
        
        // If not found in sessions array, use the session data from enrollment
        if (!session && enrollment.session_id) {
          session = enrollment.session_id as any;
        }
        
        return session?.course_id?._id === courseId;
      });

      if (!enrollment) {
        message.error('Không tìm thấy đăng ký cho khóa học này');
        return;
      }

      // First try to find session in sessions array
      let session = sessions.find(s => s._id === enrollment.session_id?._id);
      
      // If not found in sessions array, use the session data from enrollment
      if (!session && enrollment.session_id) {
        session = enrollment.session_id as any;
      }
      
      if (!session) {
        message.error('Không tìm thấy buổi đào tạo');
        return;
      }

      // Call start training API (backend will check and update session status)
      const response = await api.post(`/training/sessions/${session._id}/start`);

      if (response.data.success) {
        // Navigate to training page with training data
        navigate('/training/session', { 
          state: { 
            trainingData: response.data.data,
            sessionId: session._id,
            courseId: courseId
          } 
        });
      } else {
        message.error(`Lỗi: ${response.data.message || 'Không thể bắt đầu học'}`);
      }
    } catch (error: any) {
      console.error('Error starting training:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi bắt đầu học';
      message.error(`Lỗi: ${errorMessage}`);
    }
  };

  const handleRetakeTraining = async (courseId: string) => {
    try {
      // Find the session for this course that user is enrolled in
      const enrollment = userEnrollments.find(enrollment => {
        // First try to find session in sessions array
        let session = sessions.find(s => s._id === enrollment.session_id?._id);
        
        // If not found in sessions array, use the session data from enrollment
        if (!session && enrollment.session_id) {
          session = enrollment.session_id as any;
        }
        
        return session?.course_id?._id === courseId;
      });

      if (!enrollment) {
        message.error('Không tìm thấy đăng ký cho khóa học này');
        return;
      }

      // First try to find session in sessions array
      let session = sessions.find(s => s._id === enrollment.session_id?._id);
      
      // If not found in sessions array, use the session data from enrollment
      if (!session && enrollment.session_id) {
        session = enrollment.session_id as any;
      }
      
      if (!session) {
        message.error('Không tìm thấy buổi đào tạo');
        return;
      }

      // Confirm retake action
      const confirmed = window.confirm(
        `Bạn có chắc chắn muốn làm lại bài "${session.session_name}"?\n\n` +
        `Điểm trước đó: ${enrollment.score || 0}/100\n` +
        `Lưu ý: Kết quả cũ sẽ bị ghi đè và bạn sẽ phải làm lại từ đầu.`
      );

      if (!confirmed) {
        return;
      }

      // Call retake training API
      const response = await api.post(`/training/sessions/${session._id}/retake`);

      if (response.data.success) {
        message.success('Đã khởi tạo làm lại bài thành công!');
        // Navigate to training page with retake data
        navigate('/training/session', { 
          state: { 
            trainingData: response.data.data,
            sessionId: session._id,
            courseId: courseId,
            isRetake: true
          } 
        });
      } else {
        message.error(`Lỗi: ${response.data.message || 'Không thể làm lại bài'}`);
      }
    } catch (error: any) {
      console.error('Error retaking training:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi làm lại bài';
      message.error(`Lỗi: ${errorMessage}`);
    }
  };


  const getEnrollmentStatus = (courseId: string) => {
    const enrollment = userEnrollments.find(enrollment => {
      // First try to find session in sessions array
      let session = sessions.find(s => s._id === enrollment.session_id?._id);
      
      // If not found in sessions array, use the session data from enrollment
      if (!session && enrollment.session_id) {
        session = enrollment.session_id as any;
      }
      
      return session?.course_id?._id === courseId;
    });
    return enrollment?.status || 'not_enrolled';
  };

  const getEnrollmentScore = (courseId: string) => {
    const enrollment = userEnrollments.find(enrollment => {
      // First try to find session in sessions array
      let session = sessions.find(s => s._id === enrollment.session_id?._id);
      
      // If not found in sessions array, use the session data from enrollment
      if (!session && enrollment.session_id) {
        session = enrollment.session_id as any;
      }
      
      return session?.course_id?._id === courseId;
    });
    return enrollment?.score || null;
  };

  const renderCourseCard = (course: any, showEnrollButton = true) => {
    const enrollmentStatus = getEnrollmentStatus(course._id);
    const score = getEnrollmentScore(course._id);
    
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
      <Col xs={24} sm={12} lg={8} key={course._id}>
        <Card
          title={
            <Space direction="vertical" style={{ width: '100%' }}>
              <Title level={4} style={{ margin: 0 }}>{course.course_name}</Title>
              <Text type="secondary">{course.description}</Text>
              <Space wrap>
                {course.is_mandatory && (
                  <Tag color="red">Bắt buộc</Tag>
                )}
                {course.is_deployed && (
                  <Tag color="green">Đã triển khai</Tag>
                )}
              </Space>
            </Space>
          }
          extra={
            enrollmentStatus !== 'not_enrolled' && (
              <Space>
                <Badge 
                  status={getStatusColor(enrollmentStatus) as any} 
                  text={getStatusText(enrollmentStatus)}
                />
                {score && (
                  <Text strong>Điểm: {score}/100</Text>
                )}
              </Space>
            )
          }
          actions={[
            showEnrollButton && enrollmentStatus === 'not_enrolled' && (
              <Button 
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => handleEnroll(course._id)}
              >
                Đăng ký
              </Button>
            ),
            enrollmentStatus === 'enrolled' && (
              <Button 
                type="primary"
                icon={<PlayCircleOutlined />}
                onClick={() => handleStartTraining(course._id)}
              >
                Vào học
              </Button>
            ),
            enrollmentStatus === 'failed' && (
              <Button 
                type="primary"
                danger
                icon={<RedoOutlined />}
                onClick={() => handleRetakeTraining(course._id)}
              >
                Làm lại bài
              </Button>
            )
          ].filter(Boolean)}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <ClockCircleOutlined style={{ marginRight: '8px', color: '#3498db' }} />
              <Text>{course.duration_hours || 0} giờ</Text>
            </div>
            <div>
              <CheckCircleOutlined style={{ marginRight: '8px', color: '#3498db' }} />
              <Text>{course.validity_months ? course.validity_months + ' tháng' : 'Vĩnh viễn'}</Text>
            </div>
            {course.course_set_id?.name && (
              <div>
                <GroupOutlined style={{ marginRight: '8px', color: '#3498db' }} />
                <Text>{course.course_set_id.name}</Text>
              </div>
            )}
          </Space>
        </Card>
      </Col>
    );
  };

  return (
    <EmployeeLayout
      title="Đào tạo an toàn lao động"
      icon={<BookOutlined />}
      onLogout={handleLogout}
    >
      {/* Navigation and Filters */}
      <Card style={{ marginBottom: '20px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <Search
              placeholder="Tìm kiếm khóa học..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              style={{ width: '100%' }}
              value={isMandatory}
              onChange={(value) => setIsMandatory(value)}
              placeholder="Lọc theo loại"
            >
              <Option value="">Tất cả</Option>
              <Option value="true">Bắt buộc</Option>
              <Option value="false">Tự chọn</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Button 
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              style={{ width: '100%' }}
            >
              Làm mới
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Content */}
      <Card>
        <Tabs 
          activeKey={activeTab} 
          onChange={(key) => setActiveTab(key as 'available' | 'enrolled' | 'completed')}
          items={[
            {
              key: 'available',
              label: (
                <span>
                  <BookOutlined />
                  Khóa học có sẵn
                </span>
              ),
              children: (
                <>
                  <Title level={3} style={{ marginBottom: '20px' }}>Khóa học có sẵn</Title>
                  {coursesLoading ? (
                    <div style={{ textAlign: 'center', padding: '60px' }}>
                      <Spin size="large" />
                      <div style={{ marginTop: '16px' }}>Đang tải dữ liệu...</div>
                    </div>
                  ) : availableCourses.length === 0 ? (
                    <Empty
                      image={<BookOutlined style={{ fontSize: '48px', color: '#bdc3c7' }} />}
                      description={
                        <div>
                          <Title level={4}>Không có khóa học nào khả dụng</Title>
                          <Text>Bạn đã đăng ký tất cả các khóa học có sẵn</Text>
                        </div>
                      }
                    />
                  ) : (
                    <Row gutter={[16, 16]}>
                      {availableCourses.map(course => renderCourseCard(course, true))}
                    </Row>
                  )}
                </>
              )
            },
            {
              key: 'enrolled',
              label: (
                <span>
                  <CheckCircleOutlined />
                  Đã đăng ký
                </span>
              ),
              children: (
                <>
                  <Title level={3} style={{ marginBottom: '20px' }}>Khóa học đã đăng ký</Title>
                  {enrollmentsLoading ? (
                    <div style={{ textAlign: 'center', padding: '60px' }}>
                      <Spin size="large" />
                      <div style={{ marginTop: '16px' }}>Đang tải dữ liệu...</div>
                    </div>
                  ) : enrolledCourses.length === 0 ? (
                    <Empty
                      image={<CheckCircleOutlined style={{ fontSize: '48px', color: '#bdc3c7' }} />}
                      description={
                        <div>
                          <Title level={4}>Chưa đăng ký khóa học nào</Title>
                          <Text>Hãy đăng ký khóa học để bắt đầu học tập</Text>
                        </div>
                      }
                    />
                  ) : (
                    <Row gutter={[16, 16]}>
                      {enrolledCourses.map(course => renderCourseCard(course, false))}
                    </Row>
                  )}
                </>
              )
            },
            {
              key: 'completed',
              label: (
                <span>
                  <TrophyOutlined />
                  Đã hoàn thành
                </span>
              ),
              children: (
                <>
                  <Title level={3} style={{ marginBottom: '20px' }}>Khóa học đã hoàn thành</Title>
                  {enrollmentsLoading ? (
                    <div style={{ textAlign: 'center', padding: '60px' }}>
                      <Spin size="large" />
                      <div style={{ marginTop: '16px' }}>Đang tải dữ liệu...</div>
                    </div>
                  ) : completedCourses.length === 0 ? (
                    <Empty
                      image={<TrophyOutlined style={{ fontSize: '48px', color: '#bdc3c7' }} />}
                      description={
                        <div>
                          <Title level={4}>Chưa hoàn thành khóa học nào</Title>
                          <Text>Hoàn thành các khóa học để nhận chứng chỉ</Text>
                        </div>
                      }
                    />
                  ) : (
                    <Row gutter={[16, 16]}>
                      {completedCourses.map(course => renderCourseCard(course, false))}
                    </Row>
                  )}
                </>
              )
            }
          ]}
        />
      </Card>
    </EmployeeLayout>
  );
};

export default EmployeeTraining;
