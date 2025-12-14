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
  Avatar,
  Typography
} from 'antd';
import {
  UserOutlined,
  PlusOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CrownOutlined
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
  project_members?: Array<{
    _id: string;
    full_name: string;
    email: string;
    position: string;
    department: string;
    role_in_project: string;
    joined_date: string;
  }>;
}

interface User {
  _id: string;
  full_name: string;
  email: string;
  position: string;
  department: string;
}

interface ProjectMemberManagementProps {
  projectId?: string;
}

const ProjectMemberManagement: React.FC<ProjectMemberManagementProps> = ({ projectId }) => {
  // const { user } = useSelector((state: RootState) => state.auth);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [form] = Form.useForm();

  // Load data
  const loadData = async () => {
    if (!projectId) return;
    
    setLoading(true);
    try {
      const [projectResult, usersResult] = await Promise.all([
        projectService.getProjectById(projectId),
        userService.getAllUsers()
      ]);

      if (projectResult.success && projectResult.data) {
        setProjects([projectResult.data as any]);
      }

      if (Array.isArray(usersResult)) {
        // Allow manager to see all users for project member management
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
    if (projectId) {
      loadData();
    }
  }, [projectId]);

  // Handle add project member
  const handleAddMember = async (values: any) => {
    if (!selectedProject) return;

    setLoading(true);
    try {
      const result = await projectService.addProjectMember(
        selectedProject._id,
        values.user_id,
        values.role_in_project
      );

      if (result.success) {
        message.success('Project member added successfully');
        setModalVisible(false);
        form.resetFields();
        loadData();
      } else {
        message.error(result.message || 'Failed to add project member');
      }
    } catch (error) {
      console.error('Error adding project member:', error);
      message.error('Không thể thêm thành viên dự án. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Handle remove project member
  // const handleRemoveMember = async (projectId: string, memberId: string) => {
  //   try {
  //     const result = await projectService.removeProjectMember(projectId, memberId);
  //     if (result.success) {
  //       message.success('Project member removed successfully');
  //       loadData();
  //     } else {
  //       message.error(result.message || 'Failed to remove project member');
  //     }
  //   } catch (error) {
  //     message.error('Failed to remove project member');
  //   }
  // };

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

  // Role colors
  const getRoleColor = (role: string) => {
    const colors = {
      LEADER: 'red',
      MANAGER: 'orange',
      DEVELOPER: 'blue',
      ANALYST: 'green',
      TESTER: 'purple',
      MEMBER: 'default'
    };
    return colors[role as keyof typeof colors] || 'default';
  };

  // Role text
  const getRoleText = (role: string) => {
    const texts = {
      LEADER: 'Trưởng dự án',
      MANAGER: 'Quản lý',
      DEVELOPER: 'Phát triển',
      ANALYST: 'Phân tích',
      TESTER: 'Kiểm thử',
      MEMBER: 'Thành viên'
    };
    return texts[role as keyof typeof texts] || role;
  };

  // Columns
  const columns = [
    {
      title: 'Tên dự án',
      dataIndex: 'project_name',
      key: 'project_name',
      render: (text: string, record: Project) => {
        if (!record || !record._id) return null;
        return (
          <div>
            <Text strong>{text || 'N/A'}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.project_code || 'N/A'}
            </Text>
          </div>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        if (!status) return <Tag color="default">N/A</Tag>;
        return (
          <Tag color={getStatusColor(status)}>
            {getStatusText(status)}
          </Tag>
        );
      },
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
                <Avatar size="small" icon={<CrownOutlined />} />
                <Text style={{ marginLeft: 8 }}>{record.project_leader.full_name || 'N/A'}</Text>
              </div>
            ) : (
              <Badge status="default" text="Chưa gán" />
            )}
          </div>
        );
      },
    },
    {
      title: 'Thành viên',
      key: 'project_members',
      render: (record: Project) => (
        <div>
          <Text strong>{record.project_members?.length || 0} thành viên</Text>
          {record.project_members && record.project_members.length > 0 && (
            <div style={{ marginTop: 8 }}>
              {record.project_members.slice(0, 3).map((member, index) => (
                <div key={index} style={{ marginBottom: 4 }}>
                  <Avatar size="small" icon={<UserOutlined />} />
                  <Text style={{ marginLeft: 8, fontSize: '12px' }}>
                    {member.full_name}
                  </Text>
                  <Tag color={getRoleColor(member.role_in_project)}>
                    {getRoleText(member.role_in_project)}
                  </Tag>
                </div>
              ))}
              {record.project_members.length > 3 && (
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  +{record.project_members.length - 3} thành viên khác
                </Text>
              )}
            </div>
          )}
        </div>
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
      title: 'Hành động',
      key: 'actions',
      render: (record: Project) => (
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setSelectedProject(record);
              setModalVisible(true);
            }}
          >
            Thêm thành viên
          </Button>
          <Button
            type="default"
            icon={<TeamOutlined />}
            onClick={() => {
              // Open member list modal
              setSelectedProject(record);
            }}
          >
            Xem danh sách
          </Button>
        </Space>
      ),
    },
  ];

  // Statistics
  const stats = {
    total: projects.length,
    withMembers: projects.filter(p => p.project_members && p.project_members.length > 0).length,
    totalMembers: projects.reduce((sum, p) => sum + (p.project_members?.length || 0), 0),
    active: projects.filter(p => p.status === 'IN_PROGRESS').length,
    withLeader: projects.filter(p => p.project_leader).length,
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
              title="Có thành viên"
              value={stats.withMembers}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Tổng thành viên"
              value={stats.totalMembers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Dự án đang chạy"
              value={stats.active}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Projects Table */}
      <Card
        title={
          <Space>
            <TeamOutlined />
            <span>Quản lý thành viên dự án</span>
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
            Thêm thành viên
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

      {/* Add Member Modal */}
      <Modal
        title={selectedProject ? `Thêm thành viên cho ${selectedProject.project_name}` : 'Thêm thành viên dự án'}
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
          onFinish={handleAddMember}
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
            name="user_id"
            label="Thành viên"
            rules={[{ required: true, message: 'Vui lòng chọn thành viên' }]}
          >
            <Select
              placeholder="Chọn thành viên"
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
            name="role_in_project"
            label="Vai trò trong dự án"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
          >
            <Select placeholder="Chọn vai trò">
              <Option value="LEADER">Trưởng dự án</Option>
              <Option value="MANAGER">Quản lý</Option>
              <Option value="DEVELOPER">Phát triển</Option>
              <Option value="ANALYST">Phân tích</Option>
              <Option value="TESTER">Kiểm thử</Option>
              <Option value="MEMBER">Thành viên</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="notes"
            label="Ghi chú"
          >
            <TextArea
              rows={3}
              placeholder="Ghi chú về việc thêm thành viên..."
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProjectMemberManagement;
