import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  Card, 
  Typography, 
  Button, 
  Space,
  Table,
  Tag,
  Avatar,
  Row,
  Col,
  Statistic,
  Input,
  Select,
  Modal,
  Form,
  message,
  Popconfirm
} from 'antd';
import { 
  UserOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  UploadOutlined as UploadIcon,
  DownloadOutlined as DownloadIcon
} from '@ant-design/icons';
import userService from '../../../services/userService';
import departmentService from '../../../services/departmentService';
import positionService from '../../../services/positionService';
import RoleService from '../../../services/roleService';
import type { User } from '../../../types/user';
import type { RootState } from '../../../store';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

const UserManagement: React.FC = () => {
  // Redux state
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showImportUsers, setShowImportUsers] = useState(false);
  
  // Data for dropdowns
  const [departments, setDepartments] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  
  const [form] = Form.useForm();
  const itemsPerPage = 10;

  // Check if current user has permission to view users
  const hasUserReadPermission = () => {
    if (!currentUser?.role?.permissions) return false;
    return currentUser.role.permissions['user:read'] === true;
  };

  // Check if current user has permission to create users
  const hasUserCreatePermission = () => {
    if (!currentUser?.role?.permissions) return false;
    return currentUser.role.permissions['user:create'] === true;
  };

  // Check if current user has permission to update users
  const hasUserUpdatePermission = () => {
    if (!currentUser?.role?.permissions) return false;
    return currentUser.role.permissions['user:update'] === true;
  };

  // Check if current user has permission to delete users
  const hasUserDeletePermission = () => {
    if (!currentUser?.role?.permissions) return false;
    return currentUser.role.permissions['user:delete'] === true;
  };

  // Load users
  const loadUsers = async () => {
    try {
      setLoading(true);
      const users = await userService.getAllUsers();
      setUsers(users);
      setFilteredUsers(users);
    } catch (err) {
      message.error('Không thể tải danh sách người dùng');
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load dropdown data
  const loadDropdownData = async () => {
    try {
      const [deptResponse, posResponse, roleResponse] = await Promise.all([
        departmentService.getDepartments(),
        positionService.getOptions(),
        RoleService.getRoles()
      ]);
      
      // Ensure data is always an array
      setDepartments(Array.isArray(deptResponse.data.departments) ? deptResponse.data.departments : 
                    Array.isArray(deptResponse.data) ? deptResponse.data : []);
      
      setPositions(Array.isArray(posResponse.data.positions) ? posResponse.data.positions : 
                  Array.isArray(posResponse.data) ? posResponse.data : []);
      
      setRoles(Array.isArray(roleResponse.data.roles) ? roleResponse.data.roles : 
              Array.isArray(roleResponse.data) ? roleResponse.data : []);
    } catch (err) {
      console.error('Error loading dropdown data:', err);
      // Set empty arrays on error
      setDepartments([]);
      setPositions([]);
      setRoles([]);
    }
  };

  useEffect(() => {
    loadUsers();
    loadDropdownData();
  }, []);

  // Filter users
  useEffect(() => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(user => user.is_active === (statusFilter === 'active'));
    }

    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [users, searchTerm, statusFilter]);

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  // Handle status filter
  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
  };

  // Handle add user
  const handleAddUser = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  // Handle edit user
  const handleEditUser = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue({
      username: user.username,
      email: user.email,
      fullName: user.full_name,
      phone: user.phone,
      birthDate: (user as any).birth_date || '',
      departmentId: user.department?._id,
      positionId: user.position?._id,
      roleId: user.role?._id,
      address: (user as any).address || ''
    });
    setIsModalOpen(true);
  };

  // Handle delete user
  const handleDeleteUser = async (user: User) => {
    try {
      await userService.deleteUser(user.id);
      message.success('Xóa người dùng thành công');
      loadUsers();
    } catch (err) {
      message.error('Không thể xóa người dùng');
      console.error('Error deleting user:', err);
    }
  };

  // Handle form submit
  const handleFormSubmit = async (values: any) => {
    try {
      if (editingUser) {
        await userService.updateUser(editingUser.id, values);
        message.success('Cập nhật người dùng thành công');
      } else {
        await userService.createUser(values);
        message.success('Tạo người dùng thành công');
      }
      
      setIsModalOpen(false);
      form.resetFields();
      loadUsers();
    } catch (err) {
      message.error('Có lỗi xảy ra khi lưu người dùng');
      console.error('Error saving user:', err);
    }
  };

  // Table columns
  const columns = [
    {
      title: 'Người dùng',
      dataIndex: 'full_name',
      key: 'full_name',
      render: (text: string, record: User) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 'bold' }}>{text}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>@{record.username}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Vai trò',
      dataIndex: ['role', 'role_name'],
      key: 'role',
      render: (role: string) => (
        <Tag color={role === 'admin' ? 'red' : 'blue'}>
          {role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
        </Tag>
      ),
    },
    {
      title: 'Phòng ban',
      dataIndex: ['department', 'department_name'],
      key: 'department',
    },
    {
      title: 'Vị trí',
      dataIndex: ['position', 'position_name'],
      key: 'position',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Hoạt động' : 'Không hoạt động'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: unknown, record: User) => (
        <Space>
          {hasUserUpdatePermission() && (
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              size="small"
              onClick={() => handleEditUser(record)}
            >
              Sửa
            </Button>
          )}
          {hasUserDeletePermission() && (
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa người dùng này?"
              onConfirm={() => handleDeleteUser(record)}
              okText="Xóa"
              cancelText="Hủy"
            >
              <Button type="text" danger icon={<DeleteOutlined />} size="small">
                Xóa
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  // Pagination
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (!hasUserReadPermission()) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Card>
          <Title level={3}>Không có quyền truy cập</Title>
          <p>Bạn không có quyền xem danh sách người dùng.</p>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>
          <UserOutlined /> Quản lý người dùng
        </Title>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Tổng người dùng"
              value={users.length}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Đang hoạt động"
              value={users.filter(u => u.is_active).length}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Quản trị viên"
              value={users.filter(u => u.role?.role_name === 'admin').length}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters and Actions */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="Tìm kiếm người dùng..."
              onSearch={handleSearch}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="Lọc theo trạng thái"
              style={{ width: '100%' }}
              onChange={handleStatusFilter}
              allowClear
            >
              <Option value="active">Hoạt động</Option>
              <Option value="inactive">Không hoạt động</Option>
            </Select>
          </Col>
          <Col xs={24} sm={24} md={8}>
            <Space>
              {hasUserCreatePermission() && (
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddUser}>
                  Thêm người dùng
                </Button>
              )}
              <Button icon={<UploadIcon />} onClick={() => setShowImportUsers(true)}>
                Import
              </Button>
              <Button icon={<DownloadIcon />}>
                Export
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Users Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={paginatedUsers}
          rowKey="id"
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: itemsPerPage,
            total: filteredUsers.length,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} của ${total} người dùng`,
            onChange: (page) => setCurrentPage(page),
          }}
        />
      </Card>

      {/* Add/Edit User Modal */}
      <Modal
        title={editingUser ? 'Sửa người dùng' : 'Thêm người dùng mới'}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="username"
                label="Tên đăng nhập"
                rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Vui lòng nhập email!' },
                  { type: 'email', message: 'Email không hợp lệ!' }
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="fullName"
                label="Họ và tên"
                rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="Số điện thoại"
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="departmentId"
                label="Phòng ban"
                rules={[{ required: true, message: 'Vui lòng chọn phòng ban!' }]}
              >
                <Select placeholder="Chọn phòng ban">
                  {Array.isArray(departments) && departments.map(dept => (
                    <Option key={dept._id} value={dept._id}>
                      {dept.department_name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="positionId"
                label="Vị trí"
                rules={[{ required: true, message: 'Vui lòng chọn vị trí!' }]}
              >
                <Select placeholder="Chọn vị trí">
                  {Array.isArray(positions) && positions.map(pos => (
                    <Option key={pos._id} value={pos._id}>
                      {pos.position_name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="roleId"
            label="Vai trò"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
          >
            <Select placeholder="Chọn vai trò">
              {Array.isArray(roles) && roles.map(role => (
                <Option key={role._id} value={role._id}>
                  {role.role_name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="address"
            label="Địa chỉ"
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          {!editingUser && (
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="password"
                  label="Mật khẩu"
                  rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                >
                  <Input.Password />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="confirmPassword"
                  label="Xác nhận mật khẩu"
                  dependencies={['password']}
                  rules={[
                    { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                      },
                    }),
                  ]}
                >
                  <Input.Password />
                </Form.Item>
              </Col>
            </Row>
          )}

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsModalOpen(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                {editingUser ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Import Users Modal */}
      {showImportUsers && (
        <div>
          {/* ImportUsers component will be rendered here */}
        </div>
      )}
    </div>
  );
};

export default UserManagement;