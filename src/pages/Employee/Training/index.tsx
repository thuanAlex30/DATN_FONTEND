import React, { useMemo, useState, useEffect } from 'react';
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
  GroupOutlined
} from '@ant-design/icons';
import type { RootState } from '../../../store';
import { useCourses, useTrainingSessions, useTrainingEnrollments } from '../../../hooks/useTraining';
import { api } from '../../../services/api';
import { EmployeeLayout } from '../../../components/Employee';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
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
  
  // Listen for training graded notifications (from WebSocket)
  useEffect(() => {
    // This will be handled by WebSocket notifications
    // When admin grades, user will receive notification
  }, []);
  

  // API hooks
  const { courses, loading: coursesLoading } = useCourses({
    courseSetId: selectedCourseSet || undefined,
    isMandatory: isMandatory ? isMandatory === 'true' : undefined,
  });
  
  const { sessions } = useTrainingSessions();
  const { enrollments, loading: enrollmentsLoading } = useTrainingEnrollments();

  // Filter courses based on search term
  const filteredCourses = courses.filter(course =>
    course.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get user's enrollments
  const userEnrollments = enrollments.filter(enrollment => 
    user?.id && enrollment.user_id?._id === user.id
  );

  // Get enrolled course IDs
  const enrolledCourseIds = userEnrollments.map(enrollment => {
    const session = sessions.find(s => s._id === enrollment.session_id?._id);
    return session?.course_id?._id;
  }).filter(Boolean);

  // Get available courses (not enrolled)
  const availableCourses = filteredCourses.filter(course => 
    !enrolledCourseIds.includes(course._id)
  );

  // Get enrolled courses
  const enrolledCourses = filteredCourses.filter(course => 
    enrolledCourseIds.includes(course._id)
  );

  // Get completed courses
  const completedCourses = userEnrollments
    .filter(enrollment => enrollment.status === 'completed')
    .map(enrollment => {
      const session = sessions.find(s => s._id === enrollment.session_id?._id);
      return session ? courses.find(c => c._id === session.course_id?._id) : null;
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
      // Use new API to get available sessions
      const { trainingHelperApi } = await import('../../../services/trainingApi');
      const availableSessions = await trainingHelperApi.getAvailableSessions(courseId, user?.id);

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
        // Refresh the page or update state
        window.location.reload();
      } else {
        // Check if it's a prerequisites error
        if (response.data.data?.missingPrerequisites) {
          message.error(`Bạn cần hoàn thành ${response.data.data.missingPrerequisites.length} khóa học tiên quyết trước`);
        } else {
          message.error(`Lỗi đăng ký: ${response.data.message || 'Có lỗi xảy ra'}`);
        }
      }
    } catch (error: any) {
      console.error('Error enrolling:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi đăng ký';
      
      // Handle prerequisites error
      if (error.response?.data?.data?.missingPrerequisites) {
        message.error(`Bạn cần hoàn thành ${error.response.data.data.missingPrerequisites.length} khóa học tiên quyết trước`);
      } else if (error.response?.status === 400 && errorMessage.includes('prerequisite')) {
        message.error('Bạn cần hoàn thành các khóa học tiên quyết trước khi đăng ký');
      } else if (error.response?.status === 400 && errorMessage.includes('full')) {
        message.error('Buổi đào tạo đã đầy, vui lòng chọn buổi khác');
      } else {
        message.error(`Lỗi đăng ký: ${errorMessage}`);
      }
    }
  };

  const handleLogout = () => {
    navigate('/login');
  };

  const handleStartTraining = async (courseId: string) => {
    try {
      // Find the session for this course that user is enrolled in
      const enrollment = userEnrollments.find(enrollment => {
        const session = sessions.find(s => s._id === enrollment.session_id?._id);
        return session?.course_id?._id === courseId;
      });

      if (!enrollment) {
        message.error('Không tìm thấy đăng ký cho khóa học này');
        return;
      }

      const session = sessions.find(s => s._id === enrollment.session_id?._id);
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
        const session = sessions.find(s => s._id === enrollment.session_id?._id);
        return session?.course_id?._id === courseId;
      });

      if (!enrollment) {
        message.error('Không tìm thấy đăng ký cho khóa học này');
        return;
      }

      const session = sessions.find(s => s._id === enrollment.session_id?._id);
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
      const session = sessions.find(s => s._id === enrollment.session_id?._id);
      return session?.course_id?._id === courseId;
    });
    
    // If status is 'enrolled' but has no score, might be submitted and waiting for grading
    // We'll check this by looking at enrollment status and score
    if (enrollment?.status === 'enrolled' && enrollment?.score === null || enrollment?.score === undefined) {
      return 'submitted'; // Đã nộp, chờ chấm
    }
    
    return enrollment?.status || 'not_enrolled';
  };

  const getEnrollmentScore = (courseId: string) => {
    const enrollment = userEnrollments.find(enrollment => {
      const session = sessions.find(s => s._id === enrollment.session_id?._id);
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
        case 'submitted': return 'orange'; // Đã nộp, chờ chấm
        case 'completed': return 'green';
        case 'failed': return 'red';
        default: return 'default';
      }
    };

    const getStatusText = (status: string) => {
      switch (status) {
        case 'enrolled': return 'Đã đăng ký';
        case 'submitted': return 'Đã nộp, chờ chấm';
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
              {course.is_mandatory && (
                <Tag color="red">Bắt buộc</Tag>
              )}
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
            enrollmentStatus === 'submitted' && (
              <Button 
                type="default"
                icon={<ClockCircleOutlined />}
                disabled
              >
                Đã nộp, chờ chấm điểm
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
              <Text>{course.duration_hours} giờ</Text>
            </div>
            <div>
              <CheckCircleOutlined style={{ marginRight: '8px', color: '#3498db' }} />
              <Text>{course.validity_months ? course.validity_months + ' tháng' : 'Vĩnh viễn'}</Text>
            </div>
            <div>
              <GroupOutlined style={{ marginRight: '8px', color: '#3498db' }} />
              <Text>{course.course_set_id?.name || 'N/A'}</Text>
            </div>
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
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="Tìm kiếm khóa học..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
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
        </Row>
      </Card>

      {/* Content */}
      <Card>
        <Tabs activeKey={activeTab} onChange={(key) => setActiveTab(key as 'available' | 'enrolled' | 'completed')}>
          <TabPane 
            tab={
              <span>
                <BookOutlined />
                Khóa học có sẵn
              </span>
            } 
            key="available"
          >
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
          </TabPane>

          <TabPane 
            tab={
              <span>
                <CheckCircleOutlined />
                Đã đăng ký
              </span>
            } 
            key="enrolled"
          >
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
          </TabPane>

          <TabPane 
            tab={
              <span>
                <TrophyOutlined />
                Đã hoàn thành
              </span>
            } 
            key="completed"
          >
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
          </TabPane>
        </Tabs>
      </Card>
    </EmployeeLayout>
  );
};

export default EmployeeTraining;
