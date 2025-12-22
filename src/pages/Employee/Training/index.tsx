import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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
import { logout } from '../../../store/slices/authSlice';
import { useCourses, useAvailableTrainingSessions, useTrainingEnrollments } from '../../../hooks/useTraining';
import { api } from '../../../services/api';
import { EmployeeLayout } from '../../../components/Employee';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { Search } = Input;

const EmployeeTraining: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'available' | 'enrolled' | 'completed'>('available');
  const [searchTerm, setSearchTerm] = useState('');
  useState('');
  const [isMandatory, setIsMandatory] = useState('');
  

  // API hooks - Employee should always use available courses API
  const { courses, loading: coursesLoading } = useCourses({
    isDeployed: true, // Force use employee-specific API
    isMandatory: isMandatory ? isMandatory === 'true' : undefined,
  });
  
  // Employee enrollments - now directly linked to courses, not sessions
  const { enrollments, loading: enrollmentsLoading, fetchEnrollments } = useTrainingEnrollments();
  
  // Training sessions (used for retake/start mapping) - use employee-specific available sessions
  useAvailableTrainingSessions();

  // Filter courses based on search term
  const filteredCourses = courses.filter(course =>
    course.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get user's enrollments
  const userEnrollments = enrollments.filter(enrollment => 
    user?.id && enrollment.user_id?._id === user.id
  );

  // Get enrolled course IDs (directly from enrollment.course_id)
  const enrolledCourseIds = userEnrollments
    .map(enrollment => enrollment.course_id?._id || enrollment.course_id)
    .filter(Boolean);

  // Get available courses (courses where user hasn't enrolled in any session yet)
  // Note: A course can have multiple sessions, so we check if user has enrolled in any session of that course
  const availableCourses = filteredCourses.filter(course => 
    !enrolledCourseIds.includes(course._id)
  );

  // Get enrolled courses
  const enrolledCourses = filteredCourses.filter(course => 
    enrolledCourseIds.includes(course._id)
  );

  // Get completed courses (directly from enrollment.course_id)
  const completedCourses = userEnrollments
    .filter(enrollment => enrollment.status === 'completed')
    .map(enrollment => {
      const courseId = enrollment.course_id?._id || enrollment.course_id;
      return courses.find(c => c._id === courseId);
    })
    .filter(Boolean);

  const handleEnroll = async (courseId: string) => {
    // Debug: ensure handler invoked and user id present
    console.log('handleEnroll clicked', { courseId, userId: user?.id });
    if (!user?.id) {
      message.error('Người dùng chưa đăng nhập hoặc thiếu thông tin người dùng.');
      return;
    }

    try {
      // Enroll directly into course (no session needed)
      const response = await api.post('/training/enrollments', {
        course_id: courseId,
        user_id: user?.id,
      });

      if (response.data.success) {
        // Backend may return an idempotent response with meta.existing = true
        const payload = response.data.data;
        const isExisting = payload?.meta?.existing === true || Boolean(payload?.enrollment && payload?.meta && payload.meta.existing);

        // Refresh enrollments in local state to reflect change
        try {
          await fetchEnrollments();
        } catch (e) {
          // ignore - we'll still show message
          console.warn('Failed to refresh enrollments after enroll:', e);
        }

        // Switch to enrolled tab so user sees the result
        setActiveTab('enrolled');

        if (isExisting) {
          message.info('Bạn đã đăng ký khóa học này trước đó.');
        } else {
          message.success('Đăng ký thành công!');
        }
      } else {
        message.error(`Lỗi đăng ký: ${response.data.message || 'Có lỗi xảy ra'}`);
      }
    } catch (error: any) {
      console.error('Error enrolling:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi đăng ký';
      
      // Handle specific errors
      if (error.response?.data?.data?.missingPrerequisites) {
        message.error(`Bạn cần hoàn thành ${error.response.data.data.missingPrerequisites.length} khóa học tiên quyết trước`);
      } else if (error.response?.status === 400 && errorMessage.includes('already enrolled')) {
        message.warning('Bạn đã đăng ký khóa học này rồi. Đang làm mới trang...');
        // Refresh to update UI state
        setTimeout(() => window.location.reload(), 1500);
      } else if (error.response?.status === 400 && errorMessage.includes('prerequisite')) {
        message.error('Bạn cần hoàn thành các khóa học tiên quyết trước khi đăng ký');
      } else if (error.response?.status === 400 && errorMessage.includes('not deployed')) {
        message.error('Khóa học chưa được triển khai');
      } else {
        message.error(`Lỗi đăng ký: ${errorMessage}`);
      }
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleStartTraining = async (courseId: string) => {
    try {
      // Check if user is enrolled in this course
      const enrollment = userEnrollments.find(enrollment => {
        const enrolledCourseId = enrollment.course_id?._id || enrollment.course_id;
        return enrolledCourseId === courseId;
      });

      if (!enrollment) {
        message.error('Không tìm thấy đăng ký cho khóa học này');
        return;
      }

      // Call start course quiz API (new endpoint)
      const response = await api.post(`/training/courses/${courseId}/start`);

      if (response.data.success) {
        // Navigate to training page with quiz data
        navigate('/training/session', { 
          state: { 
            trainingData: response.data.data,
            courseId: courseId,
            enrollmentId: enrollment._id
          } 
        });
      } else {
        message.error(`Lỗi: ${response.data.message || 'Không thể bắt đầu làm bài'}`);
      }
    } catch (error: any) {
      console.error('Error starting quiz:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi bắt đầu làm bài';
      message.error(`Lỗi: ${errorMessage}`);
    }
  };

  const handleRetakeTraining = async (courseId: string) => {
    try {
      // For course-based quizzes (new flow) we call the course retake endpoint.
      const enrollment = userEnrollments.find(enrollmentItem => {
        const enrolledCourseId = enrollmentItem.course_id?._id || enrollmentItem.course_id;
        return enrolledCourseId === courseId;
      });

      if (!enrollment) {
        message.error('Không tìm thấy đăng ký cho khóa học này');
        return;
      }

      const confirmed = window.confirm(
        `Bạn có chắc chắn muốn làm lại bài cho khóa "${courseId}"?\n\n` +
        `Điểm trước đó: ${enrollment.score || 0}/100\n` +
        `Lưu ý: Kết quả cũ sẽ bị ghi đè và bạn sẽ phải làm lại từ đầu.`
      );
      if (!confirmed) return;

      // Call course retake endpoint (employee)
      const response = await api.post(`/training/courses/${courseId}/retake`);

      if (response.data.success) {
        message.success('Đã khởi tạo làm lại bài thành công!');
        navigate('/training/session', {
          state: {
            trainingData: response.data.data,
            courseId,
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


  const getEnrollmentStatus = (courseId: string): 'completed' | 'enrolled' | 'in_progress' | 'failed' | 'cancelled' | 'not_enrolled' => {
    const enrollment = userEnrollments.find(enrollment => {
      const enrolledCourseId = enrollment.course_id?._id || enrollment.course_id;
      return enrolledCourseId === courseId;
    });
    
    // Backend tự động chấm điểm và cập nhật status ngay sau khi submit
    // Status: enrolled, in_progress, completed, failed, cancelled
    return (enrollment?.status as 'completed' | 'enrolled' | 'in_progress' | 'failed' | 'cancelled') || 'not_enrolled';
  };

  const getEnrollmentScore = (courseId: string) => {
    const enrollment = userEnrollments.find(enrollment => {
      const enrolledCourseId = enrollment.course_id?._id || enrollment.course_id;
      return enrolledCourseId === courseId;
    });
    return enrollment?.score || null;
  };

  const renderCourseCard = (course: any, showEnrollButton = true) => {
    const enrollmentStatus = getEnrollmentStatus(course._id);
    const score = getEnrollmentScore(course._id);
    
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'enrolled': return 'blue';
        case 'in_progress': return 'orange';
        case 'completed': return 'green';
        case 'failed': return 'red';
        case 'cancelled': return 'default';
        default: return 'default';
      }
    };

    const getStatusText = (status: string) => {
      switch (status) {
        case 'enrolled': return 'Đã đăng ký';
        case 'in_progress': return 'Đang làm bài';
        case 'completed': return 'Hoàn thành';
        case 'failed': return 'Chưa đạt';
        case 'cancelled': return 'Đã hủy';
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

            {/* Action buttons placed inside card content to ensure they are clickable */}
            <div style={{ marginTop: 16, textAlign: 'right' }}>
              {showEnrollButton && enrollmentStatus === 'not_enrolled' && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => handleEnroll(course._id)}
                >
                  Đăng ký
                </Button>
              )}

              {(enrollmentStatus === 'enrolled' || enrollmentStatus === 'in_progress') && (
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  onClick={() => handleStartTraining(course._id)}
                  style={{ marginLeft: 8 }}
                >
                  {enrollmentStatus === 'in_progress' ? 'Tiếp tục làm bài' : 'Làm bài kiểm tra'}
                </Button>
              )}

              {enrollmentStatus === 'completed' && (
                <Button
                  type="default"
                  icon={<CheckCircleOutlined />}
                  disabled
                  style={{ marginLeft: 8 }}
                >
                  Đã hoàn thành
                </Button>
              )}

              {enrollmentStatus === 'failed' && (
                <Button
                  type="primary"
                  danger
                  icon={<RedoOutlined />}
                  onClick={() => handleRetakeTraining(course._id)}
                  style={{ marginLeft: 8 }}
                >
                  Làm lại bài
                </Button>
              )}
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
