import React, { useState } from 'react';
import {
  Card,
  Steps,
  Button,
  Space,
  Typography,
  Alert,
  Row,
  Col,
  Tag,
  Divider
} from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  BookOutlined,
  TrophyOutlined,
  PlayCircleOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Step } = Steps;

interface WorkflowTesterProps {
  onTestWorkflow: (workflow: string) => void;
}

const WorkflowTester: React.FC<WorkflowTesterProps> = ({ onTestWorkflow }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const adminWorkflow = [
    {
      title: 'Tạo Course Set',
      description: 'Admin tạo bộ khóa học mới',
      icon: <BookOutlined />,
      status: 'wait'
    },
    {
      title: 'Tạo Course',
      description: 'Tạo các khóa học trong bộ',
      icon: <BookOutlined />,
      status: 'wait'
    },
    {
      title: 'Tạo Question Bank',
      description: 'Tạo ngân hàng câu hỏi',
      icon: <BookOutlined />,
      status: 'wait'
    },
    {
      title: 'Tạo Training Session',
      description: 'Tạo buổi đào tạo',
      icon: <PlayCircleOutlined />,
      status: 'wait'
    }
  ];

  const managerWorkflow = [
    {
      title: 'Xem danh sách khóa học',
      description: 'Manager xem các khóa học có sẵn',
      icon: <BookOutlined />,
      status: 'wait'
    },
    {
      title: 'Phân công nhân viên',
      description: 'Phân công nhân viên vào khóa học',
      icon: <UserOutlined />,
      status: 'wait'
    },
    {
      title: 'Theo dõi tiến độ',
      description: 'Theo dõi tiến độ học tập của nhân viên',
      icon: <ClockCircleOutlined />,
      status: 'wait'
    },
    {
      title: 'Đánh giá kết quả',
      description: 'Đánh giá kết quả học tập',
      icon: <TrophyOutlined />,
      status: 'wait'
    }
  ];

  const employeeWorkflow = [
    {
      title: 'Xem khóa học',
      description: 'Employee xem danh sách khóa học',
      icon: <BookOutlined />,
      status: 'wait'
    },
    {
      title: 'Đăng ký khóa học',
      description: 'Đăng ký tham gia khóa học',
      icon: <UserOutlined />,
      status: 'wait'
    },
    {
      title: 'Bắt đầu học',
      description: 'Bắt đầu quá trình học tập',
      icon: <PlayCircleOutlined />,
      status: 'wait'
    },
    {
      title: 'Làm bài kiểm tra',
      description: 'Làm bài kiểm tra cuối khóa',
      icon: <BookOutlined />,
      status: 'wait'
    },
    {
      title: 'Nộp bài',
      description: 'Nộp bài kiểm tra',
      icon: <CheckCircleOutlined />,
      status: 'wait'
    },
    {
      title: 'Xem kết quả',
      description: 'Xem kết quả và điểm số',
      icon: <TrophyOutlined />,
      status: 'wait'
    },
    {
      title: 'Nhận chứng chỉ',
      description: 'Nhận chứng chỉ hoàn thành',
      icon: <TrophyOutlined />,
      status: 'wait'
    }
  ];

  const handleTestWorkflow = (workflow: string) => {
    onTestWorkflow(workflow);
    setCurrentStep(0);
  };

  const getWorkflowSteps = (workflow: string) => {
    switch (workflow) {
      case 'admin': return adminWorkflow;
      case 'manager': return managerWorkflow;
      case 'employee': return employeeWorkflow;
      default: return [];
    }
  };

  const getWorkflowTitle = (workflow: string) => {
    switch (workflow) {
      case 'admin': return 'Admin Workflow';
      case 'manager': return 'Manager Workflow';
      case 'employee': return 'Employee Workflow';
      default: return '';
    }
  };

  const getWorkflowDescription = (workflow: string) => {
    switch (workflow) {
      case 'admin':
        return 'Quy trình quản lý đào tạo dành cho Admin: Tạo khóa học, quản lý câu hỏi, tạo buổi đào tạo';
      case 'manager':
        return 'Quy trình quản lý đào tạo dành cho Manager: Phân công, theo dõi, đánh giá nhân viên';
      case 'employee':
        return 'Quy trình học tập dành cho Employee: Đăng ký, học tập, kiểm tra, nhận chứng chỉ';
      default: return '';
    }
  };

  return (
    <div>
      <Title level={3}>Kiểm tra Workflow Đào tạo</Title>
      <Text type="secondary">
        Chọn vai trò để kiểm tra quy trình hoạt động của hệ thống đào tạo
      </Text>

      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col xs={24} lg={8}>
          <Card
            title="Admin Workflow"
            hoverable
            actions={[
              <Button 
                type="primary" 
                onClick={() => handleTestWorkflow('admin')}
              >
                Kiểm tra Admin
              </Button>
            ]}
          >
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              <Text type="secondary">
                Quy trình quản lý đào tạo dành cho Admin
              </Text>
              <div>
                <Tag color="blue">Tạo Course Set</Tag>
                <Tag color="green">Tạo Course</Tag>
                <Tag color="orange">Tạo Question Bank</Tag>
                <Tag color="purple">Tạo Training Session</Tag>
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            title="Manager Workflow"
            hoverable
            actions={[
              <Button 
                type="primary" 
                onClick={() => handleTestWorkflow('manager')}
              >
                Kiểm tra Manager
              </Button>
            ]}
          >
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              <Text type="secondary">
                Quy trình quản lý đào tạo dành cho Manager
              </Text>
              <div>
                <Tag color="blue">Xem khóa học</Tag>
                <Tag color="green">Phân công nhân viên</Tag>
                <Tag color="orange">Theo dõi tiến độ</Tag>
                <Tag color="purple">Đánh giá kết quả</Tag>
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            title="Employee Workflow"
            hoverable
            actions={[
              <Button 
                type="primary" 
                onClick={() => handleTestWorkflow('employee')}
              >
                Kiểm tra Employee
              </Button>
            ]}
          >
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              <Text type="secondary">
                Quy trình học tập dành cho Employee
              </Text>
              <div>
                <Tag color="blue">Xem khóa học</Tag>
                <Tag color="green">Đăng ký</Tag>
                <Tag color="orange">Học tập</Tag>
                <Tag color="purple">Kiểm tra</Tag>
                <Tag color="red">Nhận chứng chỉ</Tag>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      <Divider />

      <Alert
        message="Hướng dẫn sử dụng"
        description="Nhấn vào nút 'Kiểm tra' để xem chi tiết quy trình hoạt động của từng vai trò. Hệ thống sẽ hiển thị các bước cần thực hiện và trạng thái của từng bước."
        type="info"
        showIcon
        style={{ marginBottom: '24px' }}
      />

      <Card title="Tính năng chính của hệ thống">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card size="small">
              <Space direction="vertical" align="center" style={{ width: '100%' }}>
                <BookOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                <Text strong>Quản lý khóa học</Text>
                <Text type="secondary" style={{ fontSize: '12px', textAlign: 'center' }}>
                  Tạo và quản lý các khóa học đào tạo
                </Text>
              </Space>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card size="small">
              <Space direction="vertical" align="center" style={{ width: '100%' }}>
                <UserOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
                <Text strong>Phân công đào tạo</Text>
                <Text type="secondary" style={{ fontSize: '12px', textAlign: 'center' }}>
                  Phân công nhân viên vào các khóa học
                </Text>
              </Space>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card size="small">
              <Space direction="vertical" align="center" style={{ width: '100%' }}>
                <ClockCircleOutlined style={{ fontSize: '24px', color: '#fa8c16' }} />
                <Text strong>Theo dõi tiến độ</Text>
                <Text type="secondary" style={{ fontSize: '12px', textAlign: 'center' }}>
                  Theo dõi tiến độ học tập của nhân viên
                </Text>
              </Space>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card size="small">
              <Space direction="vertical" align="center" style={{ width: '100%' }}>
                <TrophyOutlined style={{ fontSize: '24px', color: '#722ed1' }} />
                <Text strong>Đánh giá kết quả</Text>
                <Text type="secondary" style={{ fontSize: '12px', textAlign: 'center' }}>
                  Đánh giá và cấp chứng chỉ
                </Text>
              </Space>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default WorkflowTester;
