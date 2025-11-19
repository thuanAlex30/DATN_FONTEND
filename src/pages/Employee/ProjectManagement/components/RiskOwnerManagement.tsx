import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Select,
  Input,
  message,
  Tag,
  Space,
  Row,
  Col,
  Statistic,
  Badge,
  Progress,
  Typography,
  Popconfirm
} from 'antd';
import {
  UserOutlined,
  PlusOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  SafetyOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { projectRiskService } from '../../../../services/projectRiskService';
import userService from '../../../../services/userService';
import dayjs from 'dayjs';

const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface ProjectRisk {
  _id: string;
  risk_name: string;
  description: string;
  status: string;
  risk_category: string;
  risk_score: number;
  assigned_to?: {
    _id: string;
    full_name: string;
    email: string;
  };
  project_id: {
    _id: string;
    project_name: string;
    project_code: string;
  };
  identified_date: string;
  target_resolution_date: string;
  schedule_impact_days: number;
}

interface User {
  _id: string;
  full_name: string;
  email: string;
  position: string;
  department: string;
}

interface RiskOwnerManagementProps {
  projectId?: string;
}

const RiskOwnerManagement: React.FC<RiskOwnerManagementProps> = ({ projectId }) => {
  // const { user } = useSelector((state: RootState) => state.auth);
  const [risks, setRisks] = useState<ProjectRisk[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRisk, setSelectedRisk] = useState<ProjectRisk | null>(null);
  const [form] = Form.useForm();

  // Load data
  const loadData = async () => {
    if (!projectId) return;
    
    setLoading(true);
    try {
      const [risksResult, usersResult] = await Promise.all([
        projectRiskService.getProjectRisks(projectId),
        userService.getAllUsers()
      ]);

      if (risksResult.success) {
        setRisks(risksResult.data as any || []);
      }

      if (Array.isArray(usersResult)) {
        // Allow manager to assign risk owners to all users
        setUsers(usersResult as any);
      }
    } catch (error) {
      message.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      loadData();
    }
  }, [projectId]);

  // Handle assign risk owner
  const handleAssignOwner = async (values: any) => {
    if (!selectedRisk) return;

    try {
      const result = await projectRiskService.assignRiskOwner(
        selectedRisk._id,
        values.assigned_to_id
      );

      if (result.success) {
        message.success('Risk owner assigned successfully');
        setModalVisible(false);
        form.resetFields();
        loadData();
      } else {
        message.error(result.message || 'Failed to assign risk owner');
      }
    } catch (error) {
      message.error('Failed to assign risk owner');
    }
  };

  // Handle remove risk owner
  const handleRemoveOwner = async (riskId: string) => {
    try {
      const result = await projectRiskService.removeRiskOwner(riskId);
      if (result.success) {
        message.success('Risk owner removed successfully');
        loadData();
      } else {
        message.error(result.message || 'Failed to remove risk owner');
      }
    } catch (error) {
      message.error('Failed to remove risk owner');
    }
  };

  // Risk status colors
  const getStatusColor = (status: string) => {
    const colors = {
      IDENTIFIED: 'default',
      IN_PROGRESS: 'processing',
      RESOLVED: 'success',
      CLOSED: 'default'
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  // Risk status text
  const getStatusText = (status: string) => {
    const texts = {
      IDENTIFIED: 'Đã xác định',
      IN_PROGRESS: 'Đang xử lý',
      RESOLVED: 'Đã giải quyết',
      CLOSED: 'Đã đóng'
    };
    return texts[status as keyof typeof texts] || status;
  };

  // Risk category colors
  const getCategoryColor = (category: string) => {
    const colors = {
      SAFETY: 'red',
      SCHEDULE: 'blue',
      TECHNICAL: 'purple',
      ENVIRONMENTAL: 'green'
    };
    return colors[category as keyof typeof colors] || 'default';
  };

  // Risk category icons
  const getCategoryIcon = (category: string) => {
    const icons = {
      SAFETY: <SafetyOutlined />,
      SCHEDULE: <ClockCircleOutlined />,
      TECHNICAL: <ExclamationCircleOutlined />,
      ENVIRONMENTAL: <ExclamationCircleOutlined />
    };
    return icons[category as keyof typeof icons] || <ExclamationCircleOutlined />;
  };

  // Risk score colors
  // const getRiskScoreColor = (score: number) => {
  //   if (score >= 4) return 'red';
  //   if (score >= 3) return 'orange';
  //   if (score >= 2) return 'yellow';
  //   return 'green';
  // };

  // Columns
  const columns = [
    {
      title: 'Tên rủi ro',
      dataIndex: 'risk_name',
      key: 'risk_name',
      render: (text: string, record: ProjectRisk) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.project_id.project_name}
          </Text>
        </div>
      ),
    },
    {
      title: 'Loại rủi ro',
      dataIndex: 'risk_category',
      key: 'risk_category',
      render: (category: string) => (
        <Tag color={getCategoryColor(category)} icon={getCategoryIcon(category)}>
          {category}
        </Tag>
      ),
    },
    {
      title: 'Điểm rủi ro',
      dataIndex: 'risk_score',
      key: 'risk_score',
      render: (score: number) => (
        <div>
          <Progress
            percent={Math.round(score * 20)} // Convert to percentage (0-5 scale to 0-100%)
            size="small"
            status={score > 3 ? 'exception' : score > 2 ? 'active' : 'success'}
            format={() => score.toFixed(1)}
          />
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Người phụ trách',
      key: 'assigned_to',
      render: (record: ProjectRisk) => (
        <div>
          {record.assigned_to ? (
            <div>
              <Badge 
                status="success" 
                text={
                  <div>
                    <Text strong>{record.assigned_to.full_name}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {record.assigned_to.email}
                    </Text>
                  </div>
                }
              />
            </div>
          ) : (
            <Badge status="default" text="Chưa gán" />
          )}
        </div>
      ),
    },
    {
      title: 'Tác động',
      key: 'impact',
      render: (record: ProjectRisk) => (
        <div>
          <div>
            <Text type="secondary">Chi phí: </Text>
          </div>
          <div>
            <Text type="secondary">Tiến độ: </Text>
            <Text>{record.schedule_impact_days} ngày</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Ngày đích',
      dataIndex: 'target_resolution_date',
      key: 'target_resolution_date',
      render: (date: string) => (
        <Text type={dayjs(date).isBefore(dayjs()) ? 'danger' : 'secondary'}>
          {dayjs(date).format('DD/MM/YYYY')}
        </Text>
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (record: ProjectRisk) => (
        <Space>
          <Button
            type="primary"
            icon={<UserOutlined />}
            onClick={() => {
              setSelectedRisk(record);
              setModalVisible(true);
            }}
          >
            {record.assigned_to ? 'Thay đổi' : 'Gán'}
          </Button>
          {record.assigned_to && (
            <Popconfirm
              title="Bạn có chắc muốn gỡ bỏ người phụ trách?"
              onConfirm={() => handleRemoveOwner(record._id)}
              okText="Có"
              cancelText="Không"
            >
              <Button
                type="default"
                icon={<DeleteOutlined />}
                danger
              >
                Gỡ bỏ
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  // Statistics
  const stats = {
    total: risks.length,
    assigned: risks.filter(r => r.assigned_to).length,
    unassigned: risks.filter(r => !r.assigned_to).length,
    highRisk: risks.filter(r => r.risk_score >= 4).length,
    mediumRisk: risks.filter(r => r.risk_score >= 2 && r.risk_score < 4).length,
    lowRisk: risks.filter(r => r.risk_score < 2).length,
    overdue: risks.filter(r => dayjs(r.target_resolution_date).isBefore(dayjs()) && r.status !== 'RESOLVED' && r.status !== 'CLOSED').length,
  };

  return (
    <div>
      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={4}>
          <Card>
            <Statistic
              title="Tổng rủi ro"
              value={stats.total}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={4}>
          <Card>
            <Statistic
              title="Đã gán"
              value={stats.assigned}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={4}>
          <Card>
            <Statistic
              title="Chưa gán"
              value={stats.unassigned}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={4}>
          <Card>
            <Statistic
              title="Rủi ro cao"
              value={stats.highRisk}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={4}>
          <Card>
            <Statistic
              title="Rủi ro trung bình"
              value={stats.mediumRisk}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={4}>
          <Card>
            <Statistic
              title="Quá hạn"
              value={stats.overdue}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Risks Table */}
      <Card
        title={
          <Space>
            <ExclamationCircleOutlined />
            <span>Quản lý người phụ trách Rủi ro</span>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setSelectedRisk(null);
              setModalVisible(true);
            }}
          >
            Gán người phụ trách
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={risks}
          rowKey="_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} rủi ro`,
          }}
        />
      </Card>

      {/* Assign Owner Modal */}
      <Modal
        title={selectedRisk ? `Gán người phụ trách cho ${selectedRisk.risk_name}` : 'Gán người phụ trách Rủi ro'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAssignOwner}
        >
          <Form.Item
            name="risk_id"
            label="Rủi ro"
            rules={[{ required: true, message: 'Vui lòng chọn rủi ro' }]}
          >
            <Select
              placeholder="Chọn rủi ro"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.children as unknown as string)
                  ?.toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              {risks.map(risk => (
                <Option key={risk._id} value={risk._id}>
                  {risk.risk_name} - {risk.project_id.project_name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="assigned_to_id"
            label="Người phụ trách"
            rules={[{ required: true, message: 'Vui lòng chọn người phụ trách' }]}
          >
            <Select
              placeholder="Chọn người phụ trách"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.children as unknown as string)
                  ?.toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              {users.map(user => (
                <Option key={user._id} value={user._id}>
                  {user.full_name} - {user.position} ({user.department})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="notes"
            label="Ghi chú"
          >
            <TextArea
              rows={3}
              placeholder="Ghi chú về việc gán người phụ trách..."
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RiskOwnerManagement;
