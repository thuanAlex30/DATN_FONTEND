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
  Typography,
  Row,
  Col,
  Statistic,
  Badge,
  Popconfirm,
  Progress
} from 'antd';
import {
  UserOutlined,
  PlusOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { projectTaskService } from '../../../../services/projectTaskService';
import userService from '../../../../services/userService';
import type { ProjectTask } from '../../../../types/projectTask';
import dayjs from 'dayjs';

const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// Using imported ProjectTask type from types/projectTask

interface User {
  _id: string;
  full_name: string;
  email: string;
  position: string;
  department: string;
}

interface TaskResponsibleManagementProps {
  projectId?: string;
}

const TaskResponsibleManagement: React.FC<TaskResponsibleManagementProps> = ({ projectId }) => {
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ProjectTask | null>(null);
  const [form] = Form.useForm();

  // Load data
  const loadData = async () => {
    if (!projectId) return;
    
    setLoading(true);
    try {
      const [tasksResult, usersResult] = await Promise.all([
        projectTaskService.getProjectTasks(projectId),
        userService.getAllUsers()
      ]);

      if (tasksResult.success) {
        // Filter out null/undefined tasks and ensure data integrity
        const validTasks = (tasksResult.data || []).filter((task: any) => 
          task && 
          typeof task === 'object' && 
          task._id && 
          task.task_name
        );
        setTasks(validTasks);
      }

      if (Array.isArray(usersResult)) {
        // Allow manager to assign task responsibles to all users
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

  // Handle assign task responsible
  const handleAssignResponsible = async (values: any) => {
    if (!selectedTask) return;

    try {
      const result = await projectTaskService.assignTaskResponsible(
        selectedTask._id,
        values.assigned_to_id
      );

      if (result.success) {
        message.success('Task responsible assigned successfully');
        setModalVisible(false);
        form.resetFields();
        loadData();
      } else {
        message.error(result.message || 'Failed to assign task responsible');
      }
    } catch (error) {
      message.error('Failed to assign task responsible');
    }
  };

  // Handle remove task responsible
  const handleRemoveResponsible = async (taskId: string) => {
    try {
      const result = await projectTaskService.removeTaskResponsible(taskId);
      if (result.success) {
        message.success('Task responsible removed successfully');
        loadData();
      } else {
        message.error(result.message || 'Failed to remove task responsible');
      }
    } catch (error) {
      message.error('Failed to remove task responsible');
    }
  };

  // Task status colors
  const getStatusColor = (status: string) => {
    const colors = {
      PENDING: 'default',
      IN_PROGRESS: 'processing',
      ON_HOLD: 'warning',
      COMPLETED: 'success',
      CANCELLED: 'error'
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  // Task status text
  const getStatusText = (status: string) => {
    const texts = {
      PENDING: 'Chờ thực hiện',
      IN_PROGRESS: 'Đang thực hiện',
      ON_HOLD: 'Tạm dừng',
      COMPLETED: 'Hoàn thành',
      CANCELLED: 'Đã hủy'
    };
    return texts[status as keyof typeof texts] || status;
  };

  // Priority colors
  const getPriorityColor = (priority: string) => {
    const colors = {
      LOW: 'green',
      MEDIUM: 'orange',
      HIGH: 'red',
      URGENT: 'purple'
    };
    return colors[priority as keyof typeof colors] || 'default';
  };

  // Priority text
  const getPriorityText = (priority: string) => {
    const texts = {
      LOW: 'Thấp',
      MEDIUM: 'Trung bình',
      HIGH: 'Cao',
      URGENT: 'Khẩn cấp'
    };
    return texts[priority as keyof typeof texts] || priority;
  };

  // Columns
  const columns = [
    {
      title: 'Tên task',
      dataIndex: 'task_name',
      key: 'task_name',
      render: (text: string, record: ProjectTask) => (
        <div>
          <Text strong>{text || 'N/A'}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record?.task_code || 'N/A'}
          </Text>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status || 'PENDING')}>
          {getStatusText(status || 'PENDING')}
        </Tag>
      ),
    },
    {
      title: 'Độ ưu tiên',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => (
        <Tag color={getPriorityColor(priority || 'MEDIUM')}>
          {getPriorityText(priority || 'MEDIUM')}
        </Tag>
      ),
    },
    {
      title: 'Tiến độ',
      dataIndex: 'progress_percentage',
      key: 'progress_percentage',
      render: (progress: number) => (
        <Progress
          percent={progress || 0}
          size="small"
          status={(progress || 0) === 100 ? 'success' : 'active'}
        />
      ),
    },
    {
      title: 'Người phụ trách',
      key: 'assigned_to',
      render: () => (
        <div>
          <Badge status="default" text="Chưa gán" />
        </div>
      ),
    },
    {
      title: 'Ngày hết hạn',
      dataIndex: 'planned_end_date',
      key: 'planned_end_date',
      render: (date: string) => {
        if (!date) return <Text type="secondary">N/A</Text>;
        return (
          <Text type={dayjs(date).isBefore(dayjs()) ? 'danger' : 'secondary'}>
            {dayjs(date).format('DD/MM/YYYY')}
          </Text>
        );
      },
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (record: ProjectTask) => {
        if (!record || !record._id) return null;
        return (
          <Space>
            <Button
              type="primary"
              icon={<UserOutlined />}
              onClick={() => {
                setSelectedTask(record);
                setModalVisible(true);
              }}
            >
              Gán
            </Button>
            {false && (
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
        );
      },
    },
  ];

  // Statistics
  const stats = {
    total: tasks.length,
    assigned: 0, // Will be updated when assignment functionality is implemented
    unassigned: tasks.length,
    completed: tasks.filter(t => t && t.status === PROJECT_STATUS.COMPLETED).length,
    inProgress: tasks.filter(t => t && t.status === 'IN_PROGRESS').length,
    overdue: tasks.filter(t => t && t.planned_end_date && dayjs(t.planned_end_date).isBefore(dayjs()) && t.status !== PROJECT_STATUS.COMPLETED).length,
  };

  return (
    <div>
      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={4}>
          <Card>
            <Statistic
              title="Tổng task"
              value={stats.total}
              prefix={<CheckCircleOutlined />}
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
              title="Đang thực hiện"
              value={stats.inProgress}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={4}>
          <Card>
            <Statistic
              title="Quá hạn"
              value={stats.overdue}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Tasks Table */}
      <Card
        title={
          <Space>
            <UserOutlined />
            <span>Quản lý người phụ trách Task</span>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setSelectedTask(null);
              setModalVisible(true);
            }}
          >
            Gán người phụ trách
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={tasks}
          rowKey="_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} task`,
          }}
        />
      </Card>

      {/* Assign Responsible Modal */}
      <Modal
        title={selectedTask ? `Gán người phụ trách cho ${selectedTask.task_name || 'N/A'}` : 'Gán người phụ trách Task'}
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
            name="task_id"
            label="Task"
            rules={[{ required: true, message: 'Vui lòng chọn task' }]}
          >
            <Select
              placeholder="Chọn task"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.children as unknown as string)
                  ?.toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              {tasks.filter(task => task && task._id && task.task_name).map(task => (
                <Option key={task._id} value={task._id}>
                  {task.task_name} - {task.task_code || 'N/A'}
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
              {users.filter(user => user && user._id && user.full_name).map(user => (
                <Option key={user._id} value={user._id}>
                  {user.full_name} ({user.department || 'N/A'})
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

export default TaskResponsibleManagement;
