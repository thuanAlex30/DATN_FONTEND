import React, { useState, useEffect } from 'react';
import { PROJECT_STATUS } from '../../../../constants/project';
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
  Typography,
  Popconfirm
} from 'antd';
import {
  UserOutlined,
  PlusOutlined,
  FlagOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { projectMilestoneService } from '../../../../services/projectMilestoneService';
import userService from '../../../../services/userService';
import dayjs from 'dayjs';

const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface ProjectMilestone {
  _id: string;
  milestone_name: string;
  description: string;
  status: string;
  milestone_type: string;
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
  planned_date: string;
  is_critical: boolean;
  completion_criteria: string;
}

interface User {
  _id: string;
  full_name: string;
  email: string;
  position: string;
  department: string;
}

interface MilestoneResponsibleManagementProps {
  projectId?: string;
}

const MilestoneResponsibleManagement: React.FC<MilestoneResponsibleManagementProps> = ({ projectId }) => {
  // const { user } = useSelector((state: RootState) => state.auth);
  const [milestones, setMilestones] = useState<ProjectMilestone[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<ProjectMilestone | null>(null);
  const [form] = Form.useForm();

  // Load data
  const loadData = async () => {
    if (!projectId) return;
    
    setLoading(true);
    try {
      const [milestonesResult, usersResult] = await Promise.all([
        projectMilestoneService.getProjectMilestones(projectId),
        userService.getAllUsers()
      ]);

      if (milestonesResult.success) {
        setMilestones(milestonesResult.data as any || []);
      }

      if (Array.isArray(usersResult)) {
        // Allow manager to assign milestone responsibles to all users
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

  // Handle assign milestone responsible
  const handleAssignResponsible = async (values: any) => {
    if (!selectedMilestone) return;

    try {
      const result = await projectMilestoneService.assignMilestoneResponsible(
        selectedMilestone._id,
        values.assigned_to_id
      );

      if (result.success) {
        message.success('Milestone responsible assigned successfully');
        setModalVisible(false);
        form.resetFields();
        loadData();
      } else {
        message.error(result.message || 'Failed to assign milestone responsible');
      }
    } catch (error) {
      message.error('Failed to assign milestone responsible');
    }
  };

  // Handle remove milestone responsible
  const handleRemoveResponsible = async (milestoneId: string) => {
    try {
      const result = await projectMilestoneService.removeMilestoneResponsible(milestoneId);
      if (result.success) {
        message.success('Milestone responsible removed successfully');
        loadData();
      } else {
        message.error(result.message || 'Failed to remove milestone responsible');
      }
    } catch (error) {
      message.error('Failed to remove milestone responsible');
    }
  };

  // Milestone status colors
  const getStatusColor = (status: string) => {
    const colors = {
      PENDING: 'default',
      IN_PROGRESS: 'processing',
      COMPLETED: 'success',
      DELAYED: 'error'
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  // Milestone status text
  const getStatusText = (status: string) => {
    const texts = {
      PENDING: 'Chờ thực hiện',
      IN_PROGRESS: 'Đang thực hiện',
      COMPLETED: 'Hoàn thành',
      DELAYED: 'Bị trễ'
    };
    return texts[status as keyof typeof texts] || status;
  };

  // Milestone type colors
  const getTypeColor = (type: string) => {
    const colors = {
      PHASE_COMPLETION: 'blue',
      DELIVERY: 'green',
      REVIEW: 'orange',
      MILESTONE: 'purple'
    };
    return colors[type as keyof typeof colors] || 'default';
  };

  // Milestone type text
  const getTypeText = (type: string) => {
    const texts = {
      PHASE_COMPLETION: 'Hoàn thành giai đoạn',
      DELIVERY: 'Giao hàng',
      REVIEW: 'Đánh giá',
      MILESTONE: 'Cột mốc'
    };
    return texts[type as keyof typeof texts] || type;
  };

  // Columns
  const columns = [
    {
      title: 'Tên cột mốc',
      dataIndex: 'milestone_name',
      key: 'milestone_name',
      render: (text: string, record: ProjectMilestone) => (
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
      title: 'Loại cột mốc',
      dataIndex: 'milestone_type',
      key: 'milestone_type',
      render: (type: string) => (
        <Tag color={getTypeColor(type)}>
          {getTypeText(type)}
        </Tag>
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
      title: 'Quan trọng',
      dataIndex: 'is_critical',
      key: 'is_critical',
      render: (isCritical: boolean) => (
        <Badge
          status={isCritical ? 'error' : 'default'}
          text={isCritical ? 'Quan trọng' : 'Bình thường'}
        />
      ),
    },
    {
      title: 'Người phụ trách',
      key: 'assigned_to',
      render: (record: ProjectMilestone) => (
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
      title: 'Ngày dự kiến',
      dataIndex: 'planned_date',
      key: 'planned_date',
      render: (date: string) => (
        <Text type={dayjs(date).isBefore(dayjs()) ? 'danger' : 'secondary'}>
          {dayjs(date).format('DD/MM/YYYY')}
        </Text>
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (record: ProjectMilestone) => (
        <Space>
          <Button
            type="primary"
            icon={<UserOutlined />}
            onClick={() => {
              setSelectedMilestone(record);
              setModalVisible(true);
            }}
          >
            {record.assigned_to ? 'Thay đổi' : 'Gán'}
          </Button>
          {record.assigned_to && (
            <Popconfirm
              title="Bạn có chắc muốn gỡ bỏ người phụ trách?"
              onConfirm={() => handleRemoveResponsible(record._id)}
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
    total: milestones.length,
    assigned: milestones.filter(m => m.assigned_to).length,
    unassigned: milestones.filter(m => !m.assigned_to).length,
    completed: milestones.filter(m => m.status === PROJECT_STATUS.COMPLETED).length,
    inProgress: milestones.filter(m => m.status === 'IN_PROGRESS').length,
    critical: milestones.filter(m => m.is_critical).length,
    overdue: milestones.filter(m => dayjs(m.planned_date).isBefore(dayjs()) && m.status !== PROJECT_STATUS.COMPLETED).length,
  };

  return (
    <div>
      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={4}>
          <Card>
            <Statistic
              title="Tổng cột mốc"
              value={stats.total}
              prefix={<FlagOutlined />}
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
              title="Hoàn thành"
              value={stats.completed}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={4}>
          <Card>
            <Statistic
              title="Quan trọng"
              value={stats.critical}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
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

      {/* Milestones Table */}
      <Card
        title={
          <Space>
            <FlagOutlined />
            <span>Quản lý người phụ trách Cột mốc</span>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setSelectedMilestone(null);
              setModalVisible(true);
            }}
          >
            Gán người phụ trách
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={milestones}
          rowKey="_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} cột mốc`,
          }}
        />
      </Card>

      {/* Assign Responsible Modal */}
      <Modal
        title={selectedMilestone ? `Gán người phụ trách cho ${selectedMilestone.milestone_name}` : 'Gán người phụ trách Cột mốc'}
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
          onFinish={handleAssignResponsible}
        >
          <Form.Item
            name="milestone_id"
            label="Cột mốc"
            rules={[{ required: true, message: 'Vui lòng chọn cột mốc' }]}
          >
            <Select
              placeholder="Chọn cột mốc"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.children as unknown as string)
                  ?.toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              {milestones.map(milestone => (
                <Option key={milestone._id} value={milestone._id}>
                  {milestone.milestone_name} - {milestone.project_id.project_name}
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
                  {user.full_name} ({user.department})
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

export default MilestoneResponsibleManagement;
