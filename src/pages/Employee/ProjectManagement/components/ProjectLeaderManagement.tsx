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
  Typography,
  Popconfirm
} from 'antd';
import {
  UserOutlined,
  PlusOutlined,
  CrownOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import projectService from '../../../../services/projectService';
import userService from '../../../../services/userService';
import dayjs from 'dayjs';

const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface Project {
  _id: string;
  project_name: string;
  project_code: string;
  status: string;
  start_date: string;
  end_date: string;
  project_leader?: {
    _id: string;
    full_name: string;
    email: string;
  };
}

interface User {
  _id: string;
  full_name: string;
  email: string;
  position: string;
  department: string;
}

const ProjectLeaderManagement: React.FC = () => {
  // const { user } = useSelector((state: RootState) => state.auth);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [form] = Form.useForm();

  // Load data
  const loadData = async () => {
    setLoading(true);
    try {
      const [projectsResult, usersResult] = await Promise.all([
        projectService.getAllProjects(),
        userService.getAllUsers()
      ]);

      if (projectsResult.success && projectsResult.data) {
        setProjects(Array.isArray(projectsResult.data) ? projectsResult.data as any : []);
      }

      if (Array.isArray(usersResult)) {
        // Allow manager to assign project leaders to all users
        setUsers(usersResult.filter((user: any) => user && user._id && user.full_name) as any);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      message.error('Không thể tải dữ liệu. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle assign project leader
  const handleAssignLeader = async (values: any) => {
    if (!selectedProject) return;

    setLoading(true);
    try {
      const result = await projectService.assignProjectLeader(
        selectedProject._id,
        values.project_leader_id
      );

      if (result.success) {
        message.success('Project leader assigned successfully');
        setModalVisible(false);
        form.resetFields();
        loadData();
      } else {
        message.error(result.message || 'Failed to assign project leader');
      }
    } catch (error) {
      console.error('Error assigning project leader:', error);
      message.error('Không thể phân công trưởng dự án. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Handle remove project leader
  const handleRemoveLeader = async (projectId: string) => {
    setLoading(true);
    try {
      const result = await projectService.removeProjectLeader(projectId);
      if (result.success) {
        message.success('Project leader removed successfully');
        loadData();
      } else {
        message.error(result.message || 'Failed to remove project leader');
      }
    } catch (error) {
      console.error('Error removing project leader:', error);
      message.error('Không thể xóa trưởng dự án. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Project status colors
  const getStatusColor = (status: string) => {
    const colors = {
      PLANNING: 'blue',
      IN_PROGRESS: 'green',
      ON_HOLD: 'orange',
      COMPLETED: 'purple',
      CANCELLED: 'red'
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  // Project status text
  const getStatusText = (status: string) => {
    const texts = {
      PLANNING: 'Lập kế hoạch',
      IN_PROGRESS: 'Đang thực hiện',
      ON_HOLD: 'Tạm dừng',
      COMPLETED: 'Hoàn thành',
      CANCELLED: 'Đã hủy'
    };
    return texts[status as keyof typeof texts] || status;
  };

  // Columns
  const columns = [
    {
      title: 'Tên dự án',
      dataIndex: 'project_name',
      key: 'project_name',
      render: (text: string, record: Project) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.project_code}
          </Text>
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
      title: 'Thời gian',
      key: 'duration',
      render: (record: Project) => (
        <div>
          <div>
            <Text type="secondary">Bắt đầu: </Text>
            <Text>{dayjs(record.start_date).format('DD/MM/YYYY')}</Text>
          </div>
          <div>
            <Text type="secondary">Kết thúc: </Text>
            <Text>{dayjs(record.end_date).format('DD/MM/YYYY')}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Trưởng dự án',
      key: 'project_leader',
      render: (record: Project) => {
        if (!record || !record._id) return null;
        return (
          <div>
            {record.project_leader ? (
              <div>
                <Badge 
                  status="success" 
                  text={
                    <div>
                      <Text strong>{record.project_leader.full_name || 'N/A'}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {record.project_leader.email || 'N/A'}
                      </Text>
                    </div>
                  }
                />
              </div>
            ) : (
              <Badge status="default" text="Chưa gán" />
            )}
          </div>
        );
      },
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (record: Project) => {
        if (!record || !record._id) return null;
        return (
          <Space>
            <Button
              type="primary"
              icon={<CrownOutlined />}
              onClick={() => {
                setSelectedProject(record);
                setModalVisible(true);
              }}
            >
              {record.project_leader ? 'Thay đổi' : 'Gán'}
            </Button>
            {record.project_leader && (
              <Popconfirm
                title="Bạn có chắc muốn gỡ bỏ trưởng dự án?"
                onConfirm={() => handleRemoveLeader(record._id)}
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
    total: projects.length,
    withLeader: projects.filter(p => p.project_leader).length,
    withoutLeader: projects.filter(p => !p.project_leader).length,
    active: projects.filter(p => p.status === 'IN_PROGRESS').length,
  };

  return (
    <div>
      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Tổng dự án"
              value={stats.total}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Có trưởng dự án"
              value={stats.withLeader}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Chưa có trưởng"
              value={stats.withoutLeader}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Dự án đang chạy"
              value={stats.active}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Projects Table */}
      <Card
        title={
          <Space>
            <CrownOutlined />
            <span>Quản lý trưởng dự án</span>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setSelectedProject(null);
              setModalVisible(true);
            }}
          >
            Gán trưởng dự án
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={projects}
          rowKey="_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} dự án`,
          }}
        />
      </Card>

      {/* Assign Leader Modal */}
      <Modal
        title={selectedProject ? `Gán trưởng dự án cho ${selectedProject.project_name}` : 'Gán trưởng dự án'}
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
          onFinish={handleAssignLeader}
        >
          <Form.Item
            name="project_id"
            label="Dự án"
            rules={[{ required: true, message: 'Vui lòng chọn dự án' }]}
          >
            <Select
              placeholder="Chọn dự án"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.children as unknown as string)
                  ?.toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              {projects.map(project => (
                <Option key={project._id} value={project._id}>
                  {project.project_name} ({project.project_code})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="project_leader_id"
            label="Trưởng dự án"
            rules={[{ required: true, message: 'Vui lòng chọn trưởng dự án' }]}
          >
            <Select
              placeholder="Chọn trưởng dự án"
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
              placeholder="Ghi chú về việc gán trưởng dự án..."
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProjectLeaderManagement;
