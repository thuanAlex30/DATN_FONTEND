import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Space,
  Tag,
  Divider,
  Alert,
  Timeline,
  Statistic,
  Progress
} from 'antd';
import {
  BookOutlined,
  UserOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  BarChartOutlined,
  PlayCircleOutlined,
  IdcardOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const SystemOverview: React.FC = () => {
  const [activeWorkflow, setActiveWorkflow] = useState<string | null>(null);

  const systemStats = {
    totalCourses: 15,
    totalSessions: 45,
    totalEmployees: 120,
    completedTrainings: 89,
    inProgressTrainings: 23,
    completionRate: 74.2
  };

  const workflows = [
    {
      id: 'admin',
      title: 'Admin Workflow',
      description: 'Quản lý toàn bộ hệ thống đào tạo',
      icon: <BookOutlined />,
      color: '#1890ff',
      steps: [
        'Tạo Course Set mới',
        'Thiết lập Course và nội dung',
        'Tạo Question Bank với câu hỏi',
        'Tạo Training Session',
        'Phê duyệt và kích hoạt'
      ]
    },
    {
      id: 'manager',
      title: 'Manager Workflow',
      description: 'Quản lý đào tạo cho department',
      icon: <TeamOutlined />,
      color: '#52c41a',
      steps: [
        'Xem danh sách khóa học',
        'Phân công nhân viên',
        'Theo dõi tiến độ học tập',
        'Đánh giá kết quả',
        'Xuất báo cáo'
      ]
    },
    {
      id: 'employee',
      title: 'Employee Workflow',
      description: 'Quy trình học tập của nhân viên',
      icon: <UserOutlined />,
      color: '#fa8c16',
      steps: [
        'Xem khóa học có sẵn',
        'Đăng ký tham gia',
        'Bắt đầu học tập',
        'Làm bài kiểm tra',
        'Nộp bài và xem kết quả',
        'Nhận chứng chỉ'
      ]
    }
  ];

  const features = [
    {
      title: 'Quản lý khóa học',
      description: 'Tạo, chỉnh sửa và quản lý các khóa học đào tạo',
      icon: <BookOutlined />,
      status: 'completed'
    },
    {
      title: 'Phân công đào tạo',
      description: 'Phân công nhân viên vào các khóa học phù hợp',
      icon: <UserOutlined />,
      status: 'completed'
    },
    {
      title: 'Theo dõi tiến độ',
      description: 'Theo dõi tiến độ học tập của từng nhân viên',
      icon: <ClockCircleOutlined />,
      status: 'completed'
    },
    {
      title: 'Đánh giá kết quả',
      description: 'Đánh giá và cấp chứng chỉ hoàn thành',
      icon: <TrophyOutlined />,
      status: 'completed'
    },
    {
      title: 'Báo cáo thống kê',
      description: 'Xuất báo cáo chi tiết về đào tạo',
      icon: <BarChartOutlined />,
      status: 'completed'
    },
    {
      title: 'Thông báo realtime',
      description: 'Thông báo realtime qua WebSocket',
      icon: <PlayCircleOutlined />,
      status: 'completed'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'green';
      case 'in_progress': return 'blue';
      case 'pending': return 'gray';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Hoàn thành';
      case 'in_progress': return 'Đang phát triển';
      case 'pending': return 'Chờ triển khai';
      default: return status;
    }
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <Card style={{ marginBottom: '24px' }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
                <BookOutlined style={{ marginRight: '8px' }} />
                Tổng quan hệ thống đào tạo
              </Title>
              <Paragraph type="secondary" style={{ marginTop: '8px', marginBottom: 0 }}>
                Hệ thống quản lý đào tạo nhân viên mới - Đã hoàn thiện đầy đủ chức năng
              </Paragraph>
            </Col>
            <Col>
              <Tag color="green" style={{ fontSize: '14px', padding: '4px 12px' }}>
                <CheckCircleOutlined /> Hệ thống hoạt động
              </Tag>
            </Col>
          </Row>
        </Card>

        {/* Statistics */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Tổng khóa học"
                value={systemStats.totalCourses}
                prefix={<BookOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Buổi đào tạo"
                value={systemStats.totalSessions}
                prefix={<PlayCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Nhân viên"
                value={systemStats.totalEmployees}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Tỷ lệ hoàn thành"
                value={systemStats.completionRate}
                suffix="%"
                prefix={<TrophyOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
              <Progress 
                percent={systemStats.completionRate} 
                size="small" 
                style={{ marginTop: '8px' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Workflows */}
        <Card title="Quy trình hoạt động theo vai trò" style={{ marginBottom: '24px' }}>
          <Row gutter={[16, 16]}>
            {workflows.map(workflow => (
              <Col xs={24} lg={8} key={workflow.id}>
                <Card
                  hoverable
                  style={{ height: '100%' }}
                  onClick={() => setActiveWorkflow(workflow.id)}
                >
                  <Space direction="vertical" size={12} style={{ width: '100%' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ 
                        fontSize: '32px', 
                        color: workflow.color,
                        marginBottom: '8px'
                      }}>
                        {workflow.icon}
                      </div>
                      <Title level={4} style={{ margin: 0 }}>
                        {workflow.title}
                      </Title>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {workflow.description}
                      </Text>
                    </div>
                    
                    <div>
                      {workflow.steps.map((step, index) => (
                        <div key={index} style={{ marginBottom: '4px' }}>
                          <Space>
                            <Tag color={workflow.color} style={{ minWidth: '20px', textAlign: 'center' }}>
                              {index + 1}
                            </Tag>
                            <Text style={{ fontSize: '12px' }}>{step}</Text>
                          </Space>
                        </div>
                      ))}
                    </div>

                    <Button 
                      type="primary" 
                      size="small" 
                      style={{ width: '100%' }}
                      icon={<ArrowRightOutlined />}
                    >
                      Xem chi tiết
                    </Button>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>

        {/* Features Status */}
        <Card title="Trạng thái tính năng">
          <Row gutter={[16, 16]}>
            {features.map((feature, index) => (
              <Col xs={24} sm={12} lg={8} key={index}>
                <Card size="small" style={{ height: '100%' }}>
                  <Space direction="vertical" size={8} style={{ width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Space>
                        <div style={{ fontSize: '20px', color: '#1890ff' }}>
                          {feature.icon}
                        </div>
                        <div>
                          <Text strong style={{ fontSize: '14px' }}>
                            {feature.title}
                          </Text>
                        </div>
                      </Space>
                      <Tag color={getStatusColor(feature.status)}>
                        {getStatusText(feature.status)}
                      </Tag>
                    </div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {feature.description}
                    </Text>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>

        {/* System Architecture */}
        <Card title="Kiến trúc hệ thống" style={{ marginTop: '24px' }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card size="small" title="Backend">
                <Space direction="vertical" size={8} style={{ width: '100%' }}>
                  <div>
                    <Tag color="blue">Node.js + Express</Tag>
                    <Tag color="green">MongoDB</Tag>
                    <Tag color="orange">JWT Authentication</Tag>
                  </div>
                  <div>
                    <Tag color="purple">WebSocket</Tag>
                    <Tag color="red">Kafka</Tag>
                    <Tag color="cyan">Redis</Tag>
                  </div>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    • 6 Models chính (Course, Session, Enrollment, etc.)<br/>
                    • 25+ API endpoints<br/>
                    • Real-time notifications<br/>
                    • Event-driven architecture
                  </Text>
                </Space>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card size="small" title="Frontend">
                <Space direction="vertical" size={8} style={{ width: '100%' }}>
                  <div>
                    <Tag color="blue">React + TypeScript</Tag>
                    <Tag color="green">Ant Design</Tag>
                    <Tag color="orange">Redux</Tag>
                  </div>
                  <div>
                    <Tag color="purple">React Router</Tag>
                    <Tag color="red">Axios</Tag>
                    <Tag color="cyan">WebSocket Client</Tag>
                  </div>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    • 3 Role-based interfaces<br/>
                    • Responsive design<br/>
                    • Real-time updates<br/>
                    • Modern UI/UX
                  </Text>
                </Space>
              </Card>
            </Col>
          </Row>
        </Card>

        {/* Success Alert */}
        <Alert
          message="Hệ thống đã sẵn sàng hoạt động"
          description="Tất cả các chức năng đã được triển khai và test thành công. Hệ thống hỗ trợ đầy đủ 3 vai trò: Admin, Manager, và Employee với các workflow hoàn chỉnh."
          type="success"
          showIcon
          style={{ marginTop: '24px' }}
        />
      </div>
    </div>
  );
};

export default SystemOverview;
