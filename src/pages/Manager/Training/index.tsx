import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
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
  Breadcrumb,
  Tooltip,
  Divider,
  Statistic,
  Progress,
  message
} from 'antd';
import { 
  BookOutlined, 
  UserOutlined, 
  ClockCircleOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  TrophyOutlined,
  TeamOutlined,
  BarChartOutlined,
  DownloadOutlined,
  ArrowLeftOutlined,
  PlayCircleOutlined,
  RocketOutlined,
  StopOutlined
} from '@ant-design/icons';
import type { RootState } from '../../../store';
import { useDepartmentCourses, useTrainingSessions, useTrainingEnrollments, useDepartmentTrainingDashboard } from '../../../hooks/useTraining';
import { ManagerLayout } from '../../../components/Manager';
import AssignTrainingModal from './components/AssignTrainingModal';
import TrainingReportModal from './components/TrainingReportModal';
import ProgressTracker from './components/ProgressTracker';
import TrainingCharts from './components/TrainingCharts';
import { api } from '../../../services/api';

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;

const ManagerTraining: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'employees' | 'reports'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // API hooks
  const departmentId = (user as any)?.data?.department_id?.id || '';
  const { courses, loading: coursesLoading, fetchDepartmentCourses } = useDepartmentCourses(departmentId);
  
  // Force refresh user data if no department info
  useEffect(() => {
    if (user && !user.department && !user.department_id) {
      console.log('⚠️ No department info found, refreshing user data...');
      // You can add logic here to refresh user data if needed
    }
  }, [user]);
  
  // Debug store state
  useEffect(() => {
    console.log('🔍 Store state debug:', {
      user: user,
      hasDepartment: !!user?.department,
      hasDepartmentId: !!user?.department_id,
      departmentId: departmentId
    });
    
    // Check localStorage directly
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      console.log('🔍 Stored user from localStorage:', parsedUser);
      console.log('🔍 Stored user department:', parsedUser.department);
      console.log('🔍 Stored user department_id:', parsedUser.department_id);
    }
  }, [user, departmentId]);
  
  const { sessions, loading: sessionsLoading } = useTrainingSessions();
  const { enrollments, loading: enrollmentsLoading } = useTrainingEnrollments();
  const { dashboard } = useDepartmentTrainingDashboard(departmentId);

  // Filter enrollments for manager's department - use dashboard data if available
  const departmentEnrollments = dashboard?.enrollments || enrollments.filter((enrollment: any) => {
    return enrollment && enrollment.user_id;
  });

  // Get unique employees in department
  const departmentEmployees = Array.from(
    new Map(
      departmentEnrollments
        .filter((enrollment: any) => enrollment.user_id && enrollment.user_id._id)
        .map((enrollment: any) => [
          enrollment.user_id._id, 
          enrollment.user_id
        ])
    ).values()
  );

  // Calculate statistics - use dashboard data if available, otherwise fallback to local calculation
  const totalEmployees = dashboard?.department?.totalEmployees || departmentEmployees.length;
  const totalCourses = dashboard?.department?.totalCourses || courses.length;
  const completedEnrollments = dashboard?.statistics?.completedEnrollments || departmentEnrollments.filter((e: any) => e.status === 'completed').length;
  const inProgressEnrollments = dashboard?.statistics?.inProgressEnrollments || departmentEnrollments.filter((e: any) => e.status === 'enrolled').length;
  const failedEnrollments = dashboard?.statistics?.failedEnrollments || departmentEnrollments.filter((e: any) => e.status === 'failed').length;
  const completionRate = dashboard?.statistics?.completionRate || (totalEmployees > 0 ? (completedEnrollments / totalEmployees) * 100 : 0);

  const handleViewEmployee = (employee: any) => {
    setSelectedEmployee(employee);
    setShowEmployeeModal(true);
  };

  const handleAssignTraining = () => {
    setShowAssignModal(true);
  };

  const handleShowReport = () => {
    setShowReportModal(true);
  };

  const handleDeployCourse = async (courseId: string) => {
    try {
      const response = await api.post(`/training/courses/${courseId}/deploy`);
      if (response.data.success) {
        message.success('Triển khai khóa học thành công!');
        // Update courses data instead of reloading page
        fetchDepartmentCourses();
      } else {
        message.error(`Lỗi: ${response.data.message || 'Không thể triển khai khóa học'}`);
      }
    } catch (error: any) {
      console.error('Error deploying course:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi triển khai khóa học';
      message.error(`Lỗi: ${errorMessage}`);
    }
  };

  const handleUndeployCourse = async (courseId: string) => {
    try {
      const response = await api.post(`/training/courses/${courseId}/undeploy`);
      if (response.data.success) {
        message.success('Hủy triển khai khóa học thành công!');
        // Update courses data instead of reloading page
        fetchDepartmentCourses();
      } else {
        message.error(`Lỗi: ${response.data.message || 'Không thể hủy triển khai khóa học'}`);
      }
    } catch (error: any) {
      console.error('Error undeploying course:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi hủy triển khai khóa học';
      message.error(`Lỗi: ${errorMessage}`);
    }
  };

  const formatDateTime = (dateTimeString: string): string => {
    return new Date(dateTimeString).toLocaleString('vi-VN');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'enrolled': return 'blue';
      case 'completed': return 'green';
      case 'failed': return 'red';
      case 'cancelled': return 'gray';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'enrolled': return 'Đang học';
      case 'completed': return 'Hoàn thành';
      case 'failed': return 'Chưa đạt';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const columns = [
    {
      title: 'Nhân viên',
      dataIndex: ['user_id', 'full_name'],
      key: 'employee',
      render: (text: string, record: any) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          <div>
            <Text strong>{text || 'Tên không xác định'}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.user_id?.email || 'Email không xác định'}
            </Text>
          </div>
        </Space>
      )
    },
    {
      title: 'Khóa học',
      key: 'course',
      render: (_: any, record: any) => {
        const session = sessions.find(s => s._id === record.session_id?._id);
        return session?.course_id?.course_name || 'Khóa học không xác định';
      }
    },
    {
      title: 'Buổi đào tạo',
      key: 'session',
      render: (_: any, record: any) => {
        const session = sessions.find(s => s._id === record.session_id?._id);
        return session?.session_name || 'Buổi đào tạo không xác định';
      }
    },
    {
      title: 'Ngày đăng ký',
      dataIndex: 'enrolled_at',
      key: 'enrolled_at',
      render: (text: string) => text ? formatDateTime(text) : 'Chưa xác định'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      )
    },
    {
      title: 'Điểm số',
      dataIndex: 'score',
      key: 'score',
      render: (score: number, record: any) => {
        if (!score) return <Text type="secondary">-</Text>;
        
        const color = record.passed ? '#52c41a' : '#ff4d4f';
        return (
          <Text style={{ color, fontWeight: 600 }}>
            {score}/100
          </Text>
        );
      }
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button 
              type="text" 
              icon={<EyeOutlined />}
              onClick={() => handleViewEmployee(record.user_id)}
            />
          </Tooltip>
          {record.status === 'failed' && (
            <Tooltip title="Phân công lại">
              <Button 
                type="text" 
                icon={<PlayCircleOutlined />}
                onClick={handleAssignTraining}
              />
            </Tooltip>
          )}
        </Space>
      )
    }
  ];

  return (
    <ManagerLayout
      title="Quản lý đào tạo"
      icon={<BookOutlined />}
    >
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
                      <a href="/manager/dashboard">Dashboard</a>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>Quản lý đào tạo</Breadcrumb.Item>
                  </Breadcrumb>
                </Space>
              </Col>
              <Col>
                <Button 
                  type="default" 
                  icon={<ArrowLeftOutlined />}
                  href="/manager/dashboard"
                >
                  Quay lại
                </Button>
              </Col>
            </Row>
          </Card>

          {/* Statistics Cards */}
          <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Tổng nhân viên"
                  value={totalEmployees}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Khóa học"
                  value={totalCourses}
                  prefix={<BookOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Hoàn thành"
                  value={completedEnrollments}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Tỷ lệ hoàn thành"
                  value={completionRate}
                  suffix="%"
                  prefix={<TrophyOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
                <Progress 
                  percent={completionRate} 
                  size="small" 
                  style={{ marginTop: '8px' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Tabs */}
          <Card>
            <Tabs
              activeKey={activeTab}
              onChange={(key) => setActiveTab(key as any)}
              items={[
                {
                  key: 'overview',
                  label: (
                    <span>
                      <BarChartOutlined />
                      Tổng quan
                    </span>
                  ),
                  children: (
                    <div>
                      <ProgressTracker
                        employees={departmentEmployees}
                        enrollments={departmentEnrollments}
                        onViewDetails={handleViewEmployee}
                      />
                      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
                        <Col xs={24} lg={12}>
                          <Card title="Thống kê trạng thái">
                            <Row gutter={[16, 16]}>
                              <Col span={12}>
                                <Statistic
                                  title="Đang học"
                                  value={inProgressEnrollments}
                                  valueStyle={{ color: '#1890ff' }}
                                />
                              </Col>
                              <Col span={12}>
                                <Statistic
                                  title="Hoàn thành"
                                  value={completedEnrollments}
                                  valueStyle={{ color: '#52c41a' }}
                                />
                              </Col>
                              <Col span={12}>
                                <Statistic
                                  title="Chưa đạt"
                                  value={failedEnrollments}
                                  valueStyle={{ color: '#ff4d4f' }}
                                />
                              </Col>
                              <Col span={12}>
                                <Statistic
                                  title="Tổng đăng ký"
                                  value={departmentEnrollments.length}
                                  valueStyle={{ color: '#722ed1' }}
                                />
                              </Col>
                            </Row>
                          </Card>
                        </Col>
                      </Row>
                    </div>
                  )
                },
                {
                  key: 'courses',
                  label: (
                    <span>
                      <BookOutlined />
                      Khóa học
                    </span>
                  ),
                  children: (
                    <div>
                      {coursesLoading ? (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                          <Text type="secondary">Đang tải khóa học...</Text>
                        </div>
                      ) : courses.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                          <Text type="secondary">Chưa có khóa học nào</Text>
                        </div>
                      ) : (
                        <Row gutter={[16, 16]}>
                          {courses.map(course => (
                          <Col xs={24} sm={12} lg={8} key={course._id}>
                            <Card
                              hoverable
                              style={{ height: '100%' }}
                              actions={[
                                <Tooltip title="Xem chi tiết">
                                  <Button type="text" icon={<EyeOutlined />} />
                                </Tooltip>,
                                course.is_deployed ? (
                                  <Tooltip title="Hủy triển khai">
                                    <Button 
                                      type="text" 
                                      icon={<StopOutlined />} 
                                      danger
                                      onClick={() => handleUndeployCourse(course._id)}
                                    />
                                  </Tooltip>
                                ) : (
                                  <Tooltip title="Triển khai khóa học">
                                    <Button 
                                      type="text" 
                                      icon={<RocketOutlined />} 
                                      onClick={() => handleDeployCourse(course._id)}
                                    />
                                  </Tooltip>
                                )
                              ]}
                            >
                              <Card.Meta
                                title={
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Text strong style={{ fontSize: '16px' }}>
                                      {course.course_name}
                                    </Text>
                                    <Space>
                                      {course.is_mandatory && (
                                        <Tag color="red">Bắt buộc</Tag>
                                      )}
                                      {course.is_deployed ? (
                                        <Tag color="green">Đã triển khai</Tag>
                                      ) : (
                                        <Tag color="orange">Chưa triển khai</Tag>
                                      )}
                                    </Space>
                                  </div>
                                }
                                description={
                                  <div>
                                    <Text type="secondary" style={{ fontSize: '14px' }}>
                                      {course.description}
                                    </Text>
                                    <Divider style={{ margin: '12px 0' }} />
                                    <Space direction="vertical" size={4}>
                                      <Space>
                                        <ClockCircleOutlined style={{ color: '#1890ff' }} />
                                        <Text>{course.duration_hours} giờ</Text>
                                      </Space>
                                      <Space>
                                        <CheckCircleOutlined style={{ color: '#52c41a' }} />
                                        <Text>
                                          {course.validity_months ? course.validity_months + ' tháng' : 'Vĩnh viễn'}
                                        </Text>
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
                    </div>
                  )
                },
                {
                  key: 'employees',
                  label: (
                    <span>
                      <UserOutlined />
                      Nhân viên
                    </span>
                  ),
                  children: (
                    <div>
                      <Row justify="space-between" align="middle" style={{ marginBottom: '16px' }}>
                        <Col>
                          <Space wrap>
                            <Search
                              placeholder="Tìm kiếm nhân viên..."
                              style={{ width: 300 }}
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Select
                              placeholder="Trạng thái"
                              style={{ width: 150 }}
                              value={statusFilter}
                              onChange={(value) => setStatusFilter(value)}
                              allowClear
                            >
                              <Option value="enrolled">Đang học</Option>
                              <Option value="completed">Hoàn thành</Option>
                              <Option value="failed">Chưa đạt</Option>
                            </Select>
                          </Space>
                        </Col>
                        <Col>
                          <Space>
                            <Button 
                              type="primary" 
                              icon={<DownloadOutlined />}
                              onClick={handleShowReport}
                            >
                              Báo cáo chi tiết
                            </Button>
                            <Button 
                              type="default" 
                              icon={<PlayCircleOutlined />}
                              onClick={handleAssignTraining}
                            >
                              Phân công đào tạo
                            </Button>
                          </Space>
                        </Col>
                      </Row>

                      <Table
                        dataSource={departmentEnrollments}
                        rowKey="_id"
                        columns={columns}
                        loading={enrollmentsLoading || coursesLoading || sessionsLoading}
                        locale={{
                          emptyText: 'Chưa có dữ liệu đào tạo'
                        }}
                        pagination={{
                          pageSize: 10,
                          showSizeChanger: true,
                          showQuickJumper: true,
                          showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} mục`
                        }}
                      />
                    </div>
                  )
                },
                {
                  key: 'reports',
                  label: (
                    <span>
                      <BarChartOutlined />
                      Báo cáo
                    </span>
                  ),
                  children: (
                    <TrainingCharts
                      totalEmployees={totalEmployees}
                      completedEnrollments={completedEnrollments}
                      inProgressEnrollments={inProgressEnrollments}
                      failedEnrollments={failedEnrollments}
                      completionRate={completionRate}
                    />
                  )
                }
              ]}
            />
          </Card>
        </div>
      </div>

      {/* Employee Detail Modal */}
      <Modal
        title={`Chi tiết nhân viên - ${selectedEmployee?.full_name || 'Không xác định'}`}
        open={showEmployeeModal}
        onCancel={() => setShowEmployeeModal(false)}
        footer={null}
        width={800}
      >
        {selectedEmployee ? (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Card>
                  <Space>
                    <Avatar size="large" icon={<UserOutlined />} />
                    <div>
                      <Title level={4} style={{ margin: 0 }}>
                        {selectedEmployee.full_name || 'Tên không xác định'}
                      </Title>
                      <Text type="secondary">{selectedEmployee.email || 'Email không xác định'}</Text>
                    </div>
                  </Space>
                </Card>
              </Col>
              <Col span={24}>
                <Card title="Lịch sử đào tạo">
                  <Table
                    dataSource={departmentEnrollments.filter((e: any) => e.user_id?._id === selectedEmployee._id)}
                    rowKey="_id"
                    pagination={false}
                    columns={[
                      {
                        title: 'Khóa học',
                        key: 'course',
                        render: (_, record: any) => {
                          const session = sessions.find(s => s._id === record.session_id?._id);
                          return session?.course_id?.course_name || 'Khóa học không xác định';
                        }
                      },
                      {
                        title: 'Trạng thái',
                        dataIndex: 'status',
                        render: (status: string) => (
                          <Tag color={getStatusColor(status)}>
                            {getStatusText(status)}
                          </Tag>
                        )
                      },
                      {
                        title: 'Điểm số',
                        dataIndex: 'score',
                        render: (score: number) => score ? `${score}/100` : 'Chưa có điểm'
                      },
                      {
                        title: 'Ngày hoàn thành',
                        dataIndex: 'completion_date',
                        render: (text: string) => text ? formatDateTime(text) : 'Chưa hoàn thành'
                      }
                    ]}
                  />
                </Card>
              </Col>
            </Row>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Text type="secondary">Không có thông tin nhân viên</Text>
          </div>
        )}
      </Modal>

      {/* Assign Training Modal */}
      <AssignTrainingModal
        visible={showAssignModal}
        onCancel={() => setShowAssignModal(false)}
        onSuccess={() => {
          setShowAssignModal(false);
          message.success('Phân công đào tạo thành công!');
        }}
        selectedEmployee={selectedEmployee}
      />

      {/* Training Report Modal */}
      <TrainingReportModal
        visible={showReportModal}
        onCancel={() => setShowReportModal(false)}
      />
    </ManagerLayout>
  );
};

export default ManagerTraining;
