import React, { useState, useEffect, useMemo } from 'react';
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
import * as XLSX from 'xlsx';
import userService from '../../../services/userService';
import departmentService from '../../../services/departmentService';
import RoleService from '../../../services/roleService';
import ImportUsers from '../../../components/ImportUsers';
import type { User } from '../../../types/user';
import type { RootState } from '../../../store';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

// Helper function to remove Vietnamese diacritics
const removeVietnameseDiacritics = (str: string): string => {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
};

type CreateUserPayload = {
  username: string;
  email: string;
  full_name: string;
  phone?: string;
  department_id?: string;
  role_id?: string;
  address?: string;
  password: string;
};

type UpdateUserPayload = Omit<CreateUserPayload, 'password'>;

const UserManagement: React.FC = () => {
  // Redux state
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const isCompanyAdmin =
    currentUser?.role?.role_code === 'company_admin' ||
    currentUser?.role?.role_name?.toLowerCase() === 'company admin' ||
    (currentUser?.role?.role_level ?? 0) >= 90;

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [departmentAssignmentFilter, setDepartmentAssignmentFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showImportUsers, setShowImportUsers] = useState(false);
  
  // Data for dropdowns
  const [departments, setDepartments] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const assignableRoles = useMemo(() => {
    if (!Array.isArray(roles)) return [];

    const blockedCodes = new Set(['system_admin', 'company_admin']);

    return roles.filter(role => {
      const levelRaw = role?.role_level ?? role?.roleLevel ?? role?.level;
      const level = typeof levelRaw === 'number' ? levelRaw : Number(levelRaw ?? 0);
      const code = (role?.role_code || role?.roleCode || '').toString().toLowerCase();
      const name = (role?.role_name || role?.name || '').toString().toLowerCase();

      // Chặn tuyệt đối 2 vai trò System Admin & Company Admin theo cả code, name và role_level
      if (blockedCodes.has(code)) {
        return false;
      }
      if (name === 'system admin' || name === 'company admin' || name === 'system_admin' || name === 'company_admin') {
        return false;
      }

      // Không cho chọn các vai trò admin cấp cao (>= 90)
      return level < 90;
    });
  }, [roles]);
  
  const [form] = Form.useForm();
  const itemsPerPage = 10;

  // Check if current user has permission to view users
  const hasUserReadPermission = () => {
    if (!currentUser?.role) return false;
    
    // Allow Company Admin and System Admin (role_level >= 90) to access
    if (currentUser.role.role_level && currentUser.role.role_level >= 90) {
      return true;
    }
    
    // Fallback: Check role_name for Company Admin or System Admin
    const roleName = currentUser.role.role_name?.toLowerCase() || '';
    if (roleName === 'company admin' || roleName === 'system admin' || roleName === 'company_admin' || roleName === 'system_admin') {
      return true;
    }
    
    // Check specific permission in user_management array
    if (currentUser.role.permissions) {
      // Handle both formats: object with arrays or flat object
      const userManagement = (currentUser.role.permissions as any).user_management;
      if (Array.isArray(userManagement) && userManagement.includes('read_user')) {
        return true;
      }
      // Fallback: check flat format
      if ((currentUser.role.permissions as any)['user:read'] === true) {
        return true;
      }
    }
    
    return false;
  };

  // Check if current user has permission to create users
  const hasUserCreatePermission = () => {
    if (!currentUser?.role) return false;
    
    // Allow Company Admin and System Admin (role_level >= 90) to create
    if (currentUser.role.role_level && currentUser.role.role_level >= 90) {
      return true;
    }
    
    // Fallback: Check role_name for Company Admin or System Admin
    const roleName = currentUser.role.role_name?.toLowerCase() || '';
    if (roleName === 'company admin' || roleName === 'system admin' || roleName === 'company_admin' || roleName === 'system_admin') {
      return true;
    }
    
    // Check specific permission in user_management array
    if (currentUser.role.permissions) {
      const userManagement = (currentUser.role.permissions as any).user_management;
      if (Array.isArray(userManagement) && userManagement.includes('create_user')) {
        return true;
      }
      // Fallback: check flat format
      if ((currentUser.role.permissions as any)['user:create'] === true) {
        return true;
      }
    }
    
    return false;
  };

  // Check if current user has permission to update users
  const hasUserUpdatePermission = () => {
    if (!currentUser?.role) return false;
    
    // Allow Company Admin and System Admin (role_level >= 90) to update
    if (currentUser.role.role_level && currentUser.role.role_level >= 90) {
      return true;
    }
    
    // Fallback: Check role_name for Company Admin or System Admin
    const roleName = currentUser.role.role_name?.toLowerCase() || '';
    if (roleName === 'company admin' || roleName === 'system admin' || roleName === 'company_admin' || roleName === 'system_admin') {
      return true;
    }
    
    // Check specific permission in user_management array
    if (currentUser.role.permissions) {
      const userManagement = (currentUser.role.permissions as any).user_management;
      if (Array.isArray(userManagement) && userManagement.includes('update_user')) {
        return true;
      }
      // Fallback: check flat format
      if ((currentUser.role.permissions as any)['user:update'] === true) {
        return true;
      }
    }
    
    return false;
  };

  // Check if current user has permission to delete users
  const hasUserDeletePermission = () => {
    if (!currentUser?.role) return false;
    
    // Allow Company Admin and System Admin (role_level >= 90) to delete
    if (currentUser.role.role_level && currentUser.role.role_level >= 90) {
      return true;
    }
    
    // Fallback: Check role_name for Company Admin or System Admin
    const roleName = currentUser.role.role_name?.toLowerCase() || '';
    if (roleName === 'company admin' || roleName === 'system admin' || roleName === 'company_admin' || roleName === 'system_admin') {
      return true;
    }
    
    // Check specific permission in user_management array
    if (currentUser.role.permissions) {
      const userManagement = (currentUser.role.permissions as any).user_management;
      if (Array.isArray(userManagement) && userManagement.includes('delete_user')) {
        return true;
      }
      // Fallback: check flat format
      if ((currentUser.role.permissions as any)['user:delete'] === true) {
        return true;
      }
    }
    
    return false;
  };

  // Load users
  const loadUsers = async () => {
    try {
      setLoading(true);
      const users = await userService.getAllUsers();
      // Transform users to match expected type structure
      const transformedUsers = users.map(user => ({
        ...user,
        // Ensure is_active is properly set (default to true if not provided)
        is_active: user.is_active !== undefined ? user.is_active : true,
        // Ensure phone and address are included
        phone: (user as any).phone || '',
        address: (user as any).address || '',
        // Ensure tenant is properly mapped
        tenant: (user as any).tenant || undefined,
        tenant_id: (user as any).tenant_id || user.tenant_id || undefined,
        role: user.role ? {
          _id: (user.role as any)._id || (user.role as any).id || '',
          role_name: user.role.role_name,
          role_code: (user.role as any).role_code,
          role_level: (user.role as any).role_level,
          scope_rules: (user.role as any).scope_rules,
          permissions: (user.role as any).permissions || {},
          is_active: (user.role as any).is_active
        } : undefined,
        // Ensure department is properly mapped
        department: user.department ? {
          _id: (user.department as any)._id || (user.department as any).id || '',
          department_name: (user.department as any).department_name || (user.department as any).name || '',
          is_active: (user.department as any).is_active !== undefined ? (user.department as any).is_active : true
        } : undefined
      })) as User[];

      // Ẩn các user có cấp vai trò >= 90 (chỉ hiển thị user có role_level < 90)
      const visibleUsers = transformedUsers
        .filter(u => (u.role?.role_level ?? 0) < 90)
        // Sắp xếp: level cao hơn hiển thị trước, cùng level thì theo tên
        .sort((a, b) => {
          const levelA = a.role?.role_level ?? 0;
          const levelB = b.role?.role_level ?? 0;
          if (levelA !== levelB) {
            return levelB - levelA; // desc
          }
          return (a.full_name || a.username || '').localeCompare(b.full_name || b.username || '');
        });

      setUsers(visibleUsers);
      setFilteredUsers(visibleUsers);
    } catch (err) {
      message.error('Không thể tải danh sách người dùng');
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load dropdown data
  const loadDropdownData = async () => {
    const normalizeDepartments = (response: any) => {
      const payload = response?.data ?? response;
      if (Array.isArray(payload?.departments)) return payload.departments;
      if (Array.isArray(payload?.data?.departments)) return payload.data.departments;
      if (Array.isArray(payload?.data)) return payload.data;
      if (Array.isArray(payload)) return payload;
      return [];
    };

    const normalizeRoles = (response: any) => {
      const payload = response?.data ?? response;
      if (Array.isArray(payload?.roles)) return payload.roles;
      if (Array.isArray(payload?.data?.roles)) return payload.data.roles;
      if (Array.isArray(payload?.data)) return payload.data;
      if (Array.isArray(payload)) return payload;
      return [];
    };

    try {
      const [deptResponse, roleResponse] = await Promise.all([
        departmentService.getDepartments(),
        RoleService.getRoles()
      ]);

      setDepartments(normalizeDepartments(deptResponse));
      setRoles(normalizeRoles(roleResponse));
    } catch (err) {
      console.error('Error loading dropdown data:', err);
      setDepartments([]);
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
      if (statusFilter === 'active') {
        filtered = filtered.filter(user => user.is_active === true);
      } else if (statusFilter === 'inactive') {
        filtered = filtered.filter(user => {
          // Check both is_active field and ensure it's explicitly false
          const isInactive = user.is_active === false || user.is_active === undefined || user.is_active === null;
          return isInactive;
        });
      }
    }

    if (departmentAssignmentFilter) {
      if (departmentAssignmentFilter === 'no_department') {
        // Check both department object and department_id
        filtered = filtered.filter(user => {
          const hasDepartment = user.department?._id || (user as any).department_id;
          return !hasDepartment;
        });
      } else if (departmentAssignmentFilter === 'has_department') {
        // Check both department object and department_id
        filtered = filtered.filter(user => {
          const hasDepartment = user.department?._id || (user as any).department_id;
          return !!hasDepartment;
        });
      }
    }

    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [users, searchTerm, statusFilter, departmentAssignmentFilter]);

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  // Handle status filter
  const handleStatusFilter = (value: string | null) => {
    setStatusFilter(value || '');
  };

  // Handle add user
  const handleAddUser = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  // Handle edit user
  const handleEditUser = async (user: User) => {
    try {
      setLoading(true);
      // Fetch full user details to get phone and address
      const userDetails = await userService.getUserById(user.id);
      setEditingUser(userDetails);
    form.setFieldsValue({
        username: userDetails.username,
        email: userDetails.email,
        fullName: userDetails.full_name,
        phone: userDetails.phone || '',
        birthDate: (userDetails as any).birth_date || '',
        departmentId: userDetails.department?._id,
        roleId: userDetails.role?._id,
        address: userDetails.address || ''
    });
    setIsModalOpen(true);
    } catch (err) {
      message.error('Không thể tải thông tin người dùng');
      console.error('Error loading user details:', err);
    } finally {
      setLoading(false);
    }
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

  // Handle export users to Excel
  const handleExportUsers = () => {
    try {
      // Use filteredUsers to export only visible/filtered users
      const dataToExport = filteredUsers.map(user => {
        // Get tenant name - check multiple possible locations
        let tenantName = '';
        if ((user as any).tenant) {
          if (typeof (user as any).tenant === 'string') {
            tenantName = (user as any).tenant;
          } else if ((user as any).tenant?.tenant_name) {
            tenantName = (user as any).tenant.tenant_name;
          } else if ((user as any).tenant?.name) {
            tenantName = (user as any).tenant.name;
          }
        } else if ((user as any).tenant_id) {
          const tenantId = (user as any).tenant_id;
          if (typeof tenantId === 'object' && (tenantId.tenant_name || tenantId.name)) {
            tenantName = tenantId.tenant_name || tenantId.name || '';
          }
        }

        // Get gender - check if user has gender field, otherwise leave empty
        const gender = (user as any).gender || '';

        return {
          'ID người dùng': (user as any).user_id || user.id || '',
          'Tên công ty': tenantName,
          'Họ và tên': removeVietnameseDiacritics(user.full_name || ''),
          'Giới tính': gender,
          'Điện thoại': user.phone || (user as any).phone || '',
          'Email': user.email || ''
        };
      });

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(dataToExport);

      // Set column widths
      const columnWidths = [
        { wch: 20 }, // ID người dùng
        { wch: 30 }, // Tên công ty
        { wch: 25 }, // Họ và tên
        { wch: 12 }, // Giới tính
        { wch: 15 }, // Điện thoại
        { wch: 30 }  // Email
      ];
      worksheet['!cols'] = columnWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách người dùng');

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `danh_sach_nguoi_dung_${timestamp}.xlsx`;

      // Write file
      XLSX.writeFile(workbook, filename);
      message.success(`Đã xuất ${filteredUsers.length} người dùng ra file Excel`);
    } catch (error) {
      console.error('Error exporting users:', error);
      message.error('Lỗi khi xuất file Excel');
    }
  };

  // Handle toggle user active status (Company Admin quyền quản lý trạng thái tài khoản)
  const handleToggleUserStatus = async (user: User) => {
    if (!hasUserUpdatePermission()) return;
    try {
      await userService.updateUser(user.id, { is_active: !user.is_active } as any);
      message.success(
        `Đã ${user.is_active ? 'ngừng kích hoạt' : 'kích hoạt'} tài khoản cho ${user.full_name || user.username}`
      );
      loadUsers();
    } catch (err) {
      console.error('Error toggling user status:', err);
      message.error('Không thể thay đổi trạng thái người dùng');
    }
  };

  const buildCreatePayload = (values: any): CreateUserPayload => {
    const payload: CreateUserPayload = {
      username: values.username?.trim(),
      email: values.email?.trim(),
      full_name: values.fullName?.trim(),
      phone: values.phone?.trim(),
      department_id: values.departmentId || undefined,
      role_id: values.roleId || undefined,
      address: values.address?.trim(),
      password: values.password
    };

    if (!payload.department_id) delete payload.department_id;
    if (!payload.role_id) delete payload.role_id;
    if (!payload.phone) delete payload.phone;
    if (!payload.address) delete payload.address;

    return payload;
  };

  const buildUpdatePayload = (values: any): UpdateUserPayload => {
    const payload: UpdateUserPayload = {
      username: values.username?.trim(),
      email: values.email?.trim(),
      full_name: values.fullName?.trim(),
      phone: values.phone?.trim(),
      department_id: values.departmentId || undefined,
      role_id: values.roleId || undefined,
      address: values.address?.trim()
    };

    if (!payload.department_id) delete payload.department_id;
    if (!payload.role_id) delete payload.role_id;
    if (!payload.phone) delete payload.phone;
    if (!payload.address) delete payload.address;

    return payload;
  };

  // Handle form submit
  const handleFormSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      if (editingUser) {
        await userService.updateUser(
          editingUser.id,
          buildUpdatePayload(values)
        );
        message.success('Cập nhật người dùng thành công');
      } else {
        await userService.createUser(buildCreatePayload(values));
        message.success('Tạo người dùng thành công');
      }
      
      setIsModalOpen(false);
      form.resetFields();
      loadUsers();
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Có lỗi xảy ra khi lưu người dùng';
      message.error(errorMessage);
      console.error('Error saving user:', err);
    } finally {
      setSubmitting(false);
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
      title: 'Trạng thái',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive: boolean, record: User) => (
        <Space>
          <Tag color={isActive ? 'green' : 'red'}>
            {isActive ? 'Hoạt động' : 'Không hoạt động'}
          </Tag>
          {hasUserUpdatePermission() && (
            <Button
              size="small"
              type="link"
              onClick={() => handleToggleUserStatus(record)}
            >
              {isActive ? 'Ngừng kích hoạt' : 'Kích hoạt'}
            </Button>
          )}
        </Space>
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
      <Card style={{ marginBottom: '24px' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space direction="vertical" size={4}>
              <Title level={2} style={{ margin: 0 }}>
                <UserOutlined /> Quản lý người dùng
              </Title>
              {isCompanyAdmin && (
                <Tag color="geekblue">
                  Company Admin • Quản lý tài khoản, phòng ban, vai trò trong tenant
                </Tag>
              )}
            </Space>
          </Col>
          <Col>
            {hasUserCreatePermission() && (
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddUser}>
                Thêm người dùng
              </Button>
            )}
          </Col>
        </Row>
      </Card>

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
              value={statusFilter || undefined}
              onChange={handleStatusFilter}
              allowClear
            >
              <Option value="active">Hoạt động</Option>
              <Option value="inactive">Không hoạt động</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="Lọc theo phòng ban"
              style={{ width: '100%' }}
              value={departmentAssignmentFilter || undefined}
              onChange={(value) => setDepartmentAssignmentFilter(value || '')}
              allowClear
            >
              <Option value="has_department">Đã có phòng ban</Option>
              <Option value="no_department">Chưa phân phòng ban</Option>
            </Select>
          </Col>
          <Col xs={24} sm={24} md={8}>
            <Space>
              <Button icon={<UploadIcon />} onClick={() => setShowImportUsers(true)}>
                Import
              </Button>
              <Button icon={<DownloadIcon />} onClick={handleExportUsers}>
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
                <Input disabled={!!editingUser} />
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
              >
                <Select placeholder="Chọn phòng ban (tùy chọn)" allowClear>
                  {Array.isArray(departments) && departments.map(dept => {
                    const value = dept?._id || dept?.id;
                    if (!value) return null;
                    return (
                      <Option key={value} value={value}>
                        {dept.department_name}
                      </Option>
                    );
                  })}
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
              {assignableRoles.map(role => {
                const value = role?._id || role?.id;
                if (!value) return null;
                return (
                  <Option key={value} value={value}>
                    {role.role_name}
                  </Option>
                );
              })}
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
                  rules={[
                    { required: true, message: 'Vui lòng nhập mật khẩu!' },
                    {
                      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/,
                      message: 'Mật khẩu phải >= 8 ký tự và gồm chữ hoa, chữ thường, số và ký tự đặc biệt'
                    }
                  ]}
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
              <Button type="primary" htmlType="submit" loading={submitting}>
                {editingUser ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Import Users Modal */}
      <Modal
        title="Import Users từ Excel"
        open={showImportUsers}
        onCancel={() => {
          setShowImportUsers(false);
        }}
        footer={null}
        width={800}
        destroyOnClose
      >
        <ImportUsers 
          onSuccess={() => {
            setShowImportUsers(false);
            loadUsers();
            message.success('Import users thành công!');
          }}
          onClose={() => {
            setShowImportUsers(false);
          }}
        />
      </Modal>
    </div>
  );
};

export default UserManagement;