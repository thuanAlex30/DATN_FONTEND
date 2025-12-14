import React, { useState, useEffect } from 'react';
import {
  Layout,
  Menu,
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  Space,
  Typography,
  message,
  Popconfirm,
  Switch,
  DatePicker,
  Spin,
  Alert,
} from 'antd';
import {
  DashboardOutlined,
  BankOutlined,
  UserOutlined,
  CreditCardOutlined,
  SafetyOutlined,
  FileTextOutlined,
  SaveOutlined,
  SettingOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  ExportOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import systemAdminService from '../../services/systemAdminService';
import userService from '../../services/userService';
import roleService from '../../services/roleService';
import type {
  SystemStats,
  Tenant,
  TenantCreate,
  TenantUpdate,
  SubscriptionPlan,
  SubscriptionPlanCreate,
  SystemLog,
  SystemSettings,
  BackupRecord,
} from '../../types/systemAdmin';
import type { User } from '../../types/user';
import type { Role } from '../../types/role';
import dayjs from 'dayjs';

const { Content, Sider } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const SystemAdmin: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);

  // Dashboard state
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [systemStatus, setSystemStatus] = useState({
    server: 'checking',
    database: 'checking',
    api: 'checking',
  });

  // Companies/Tenants state
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [tenantsLoading, setTenantsLoading] = useState(false);
  const [tenantModalVisible, setTenantModalVisible] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [tenantForm] = Form.useForm();

  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm] = Form.useForm();

  // Subscriptions state
  const [subscriptions, setSubscriptions] = useState<SubscriptionPlan[]>([]);
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(false);
  const [subscriptionModalVisible, setSubscriptionModalVisible] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<SubscriptionPlan | null>(null);
  const [subscriptionForm] = Form.useForm();

  // Roles state
  const [roles, setRoles] = useState<Role[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleForm] = Form.useForm();

  // System Logs state
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsPagination, setLogsPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Settings state
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsForm] = Form.useForm();

  // Backup state
  const [backups, setBackups] = useState<BackupRecord[]>([]);
  const [backupsLoading, setBackupsLoading] = useState(false);
  const [backupModalVisible, setBackupModalVisible] = useState(false);
  const [backupForm] = Form.useForm();
  const [submittingBackup, setSubmittingBackup] = useState(false);
  const [submittingTenant, setSubmittingTenant] = useState(false);
  const [submittingSubscription, setSubmittingSubscription] = useState(false);
  const [submittingSettings, setSubmittingSettings] = useState(false);

  // Load dashboard data
  useEffect(() => {
    if (activeTab === 'dashboard') {
      loadDashboard();
    }
  }, [activeTab]);

  // Load data based on active tab
  useEffect(() => {
    switch (activeTab) {
      case 'companies':
        loadTenants();
        break;
      case 'users':
        loadUsers();
        break;
      case 'subscriptions':
        loadSubscriptions();
        break;
      case 'roles':
        loadRoles();
        break;
      case 'logs':
        loadLogs();
        break;
      case 'settings':
        loadSettings();
        break;
      case 'backup':
        loadBackups();
        break;
    }
  }, [activeTab]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await systemAdminService.getDashboard();
      setStats(data);
      
      // Check system status
      setSystemStatus({
        server: 'active',
        database: 'active',
        api: 'active',
      });
    } catch (error: any) {
      message.error('Không thể tải dữ liệu dashboard: ' + (error.message || 'Lỗi không xác định'));
    } finally {
      setLoading(false);
    }
  };

  const loadTenants = async () => {
    try {
      setTenantsLoading(true);
      const result = await systemAdminService.getTenants();
      setTenants(result.data);
    } catch (error: any) {
      message.error('Không thể tải danh sách công ty: ' + (error.message || 'Lỗi không xác định'));
    } finally {
      setTenantsLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setUsersLoading(true);
      const result = await userService.getUsers({ page: 1, limit: 100 });
      setUsers(result.data?.users || []);
    } catch (error: any) {
      message.error('Không thể tải danh sách người dùng: ' + (error.message || 'Lỗi không xác định'));
    } finally {
      setUsersLoading(false);
    }
  };

  const loadSubscriptions = async () => {
    try {
      setSubscriptionsLoading(true);
      const data = await systemAdminService.getSubscriptionPlans();
      setSubscriptions(data);
    } catch (error: any) {
      message.error('Không thể tải danh sách gói dịch vụ: ' + (error.message || 'Lỗi không xác định'));
    } finally {
      setSubscriptionsLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      setRolesLoading(true);
      const result = await roleService.getRoles({});
      setRoles(result.data?.roles || []);
    } catch (error: any) {
      message.error('Không thể tải danh sách vai trò: ' + (error.message || 'Lỗi không xác định'));
    } finally {
      setRolesLoading(false);
    }
  };

  const loadLogs = async (page = 1) => {
    try {
      setLogsLoading(true);
      const result = await systemAdminService.getSystemLogs({
        page,
        limit: logsPagination.pageSize,
      });
      setLogs(result.data);
      if (result.pagination) {
        setLogsPagination({
          current: result.pagination.page || page,
          pageSize: result.pagination.limit || 10,
          total: result.pagination.total || 0,
        });
      }
    } catch (error: any) {
      message.error('Không thể tải system logs: ' + (error.message || 'Lỗi không xác định'));
    } finally {
      setLogsLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      setSettingsLoading(true);
      const data = await systemAdminService.getSystemSettings();
      setSettings(data);
      settingsForm.setFieldsValue(data);
    } catch (error: any) {
      message.error('Không thể tải cấu hình: ' + (error.message || 'Lỗi không xác định'));
    } finally {
      setSettingsLoading(false);
    }
  };

  const loadBackups = async () => {
    try {
      setBackupsLoading(true);
      const data = await systemAdminService.getBackupHistory();
      setBackups(data);
    } catch (error: any) {
      message.error('Không thể tải lịch sử backup: ' + (error.message || 'Lỗi không xác định'));
    } finally {
      setBackupsLoading(false);
    }
  };

  // Tenant handlers
  const handleCreateTenant = async (values: TenantCreate) => {
    setSubmittingTenant(true);
    try {
      await systemAdminService.createTenant(values);
      message.success('Tạo công ty thành công');
      setTenantModalVisible(false);
      tenantForm.resetFields();
      loadTenants();
    } catch (error: any) {
      message.error('Không thể tạo công ty: ' + (error.message || 'Lỗi không xác định'));
    } finally {
      setSubmittingTenant(false);
    }
  };

  const handleUpdateTenant = async (values: TenantUpdate) => {
    if (!editingTenant) return;
    setSubmittingTenant(true);
    try {
      await systemAdminService.updateTenant(editingTenant.id, values);
      message.success('Cập nhật công ty thành công');
      setTenantModalVisible(false);
      setEditingTenant(null);
      tenantForm.resetFields();
      loadTenants();
    } catch (error: any) {
      message.error('Không thể cập nhật công ty: ' + (error.message || 'Lỗi không xác định'));
    } finally {
      setSubmittingTenant(false);
    }
  };

  const handleDeleteTenant = async (id: string) => {
    try {
      await systemAdminService.deleteTenant(id);
      message.success('Xóa công ty thành công');
      loadTenants();
    } catch (error: any) {
      message.error('Không thể xóa công ty: ' + (error.message || 'Lỗi không xác định'));
    }
  };

  const showTenantModal = (tenant?: Tenant) => {
    if (tenant) {
      setEditingTenant(tenant);
      tenantForm.setFieldsValue({
        ...tenant,
        subscription_expires_at: tenant.subscription_expires_at ? dayjs(tenant.subscription_expires_at) : undefined,
      });
    } else {
      setEditingTenant(null);
      tenantForm.resetFields();
    }
    setTenantModalVisible(true);
  };

  // User handlers
  const showUserModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      userForm.setFieldsValue(user);
    } else {
      setEditingUser(null);
      userForm.resetFields();
    }
    setUserModalVisible(true);
  };

  // Subscription handlers
  const handleCreateSubscription = async (values: SubscriptionPlanCreate) => {
    setSubmittingSubscription(true);
    try {
      await systemAdminService.createSubscriptionPlan(values);
      message.success('Tạo gói dịch vụ thành công');
      setSubscriptionModalVisible(false);
      subscriptionForm.resetFields();
      loadSubscriptions();
    } catch (error: any) {
      message.error('Không thể tạo gói dịch vụ: ' + (error.message || 'Lỗi không xác định'));
    } finally {
      setSubmittingSubscription(false);
    }
  };

  const handleUpdateSubscription = async (values: Partial<SubscriptionPlanCreate>) => {
    if (!editingSubscription) return;
    setSubmittingSubscription(true);
    try {
      await systemAdminService.updateSubscriptionPlan(editingSubscription.id, values);
      message.success('Cập nhật gói dịch vụ thành công');
      setSubscriptionModalVisible(false);
      setEditingSubscription(null);
      subscriptionForm.resetFields();
      loadSubscriptions();
    } catch (error: any) {
      message.error('Không thể cập nhật gói dịch vụ: ' + (error.message || 'Lỗi không xác định'));
    } finally {
      setSubmittingSubscription(false);
    }
  };

  const showSubscriptionModal = (subscription?: SubscriptionPlan) => {
    if (subscription) {
      setEditingSubscription(subscription);
      subscriptionForm.setFieldsValue(subscription);
    } else {
      setEditingSubscription(null);
      subscriptionForm.resetFields();
    }
    setSubscriptionModalVisible(true);
  };

  // Settings handlers
  const handleSaveSettings = async (values: SystemSettings) => {
    try {
      await systemAdminService.updateSystemSettings(values);
      message.success('Lưu cấu hình thành công');
      loadSettings();
    } catch (error: any) {
      message.error('Không thể lưu cấu hình: ' + (error.message || 'Lỗi không xác định'));
    }
  };

  // Backup handlers
  const handleStartBackup = async (values: any) => {
    setSubmittingBackup(true);
    try {
      await systemAdminService.startBackup(values);
      message.success('Backup đã được bắt đầu');
      setBackupModalVisible(false);
      backupForm.resetFields();
      loadBackups();
    } catch (error: any) {
      message.error('Không thể bắt đầu backup: ' + (error.message || 'Lỗi không xác định'));
    } finally {
      setSubmittingBackup(false);
    }
  };

  const handleExportLogs = async () => {
    try {
      await systemAdminService.exportLogs({ format: 'json' });
      message.success('Xuất logs thành công');
    } catch (error: any) {
      message.error('Không thể xuất logs: ' + (error.message || 'Lỗi không xác định'));
    }
  };

  // Table columns
  const tenantColumns: ColumnsType<Tenant> = [
    {
      title: 'Tên công ty',
      dataIndex: 'tenant_name',
      key: 'tenant_name',
    },
    {
      title: 'Mã thuế',
      dataIndex: 'tax_code',
      key: 'tax_code',
    },
    {
      title: 'Người liên hệ',
      dataIndex: 'contact_name',
      key: 'contact_name',
    },
    {
      title: 'Gói dịch vụ',
      dataIndex: 'subscription_plan',
      key: 'subscription_plan',
    },
    {
      title: 'Hết hạn',
      dataIndex: 'subscription_expires_at',
      key: 'subscription_expires_at',
      render: (date: string) => date ? dayjs(date).format('DD/MM/YYYY') : '-',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const color = status === 'ACTIVE' ? 'green' : status === 'SUSPENDED' ? 'red' : 'default';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => showTenantModal(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa công ty này?"
            onConfirm={() => handleDeleteTenant(record.id)}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const userColumns: ColumnsType<User> = [
    {
      title: 'Tên người dùng',
      dataIndex: 'username',
      key: 'username',
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
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => showUserModal(record)}
          >
            Sửa
          </Button>
        </Space>
      ),
    },
  ];

  const subscriptionColumns: ColumnsType<SubscriptionPlan> = [
    {
      title: 'Tên gói',
      dataIndex: 'plan_name',
      key: 'plan_name',
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Giá (VNĐ)',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => price.toLocaleString('vi-VN'),
    },
    {
      title: 'Kỳ hạn (tháng)',
      dataIndex: 'duration_months',
      key: 'duration_months',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'ACTIVE' ? 'green' : 'default'}>{status}</Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => showSubscriptionModal(record)}
          >
            Sửa
          </Button>
        </Space>
      ),
    },
  ];

  const logColumns: ColumnsType<SystemLog> = [
    {
      title: 'Thời gian',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm:ss'),
    },
    {
      title: 'Người dùng',
      dataIndex: 'user_name',
      key: 'user_name',
    },
    {
      title: 'Module',
      dataIndex: 'module',
      key: 'module',
    },
    {
      title: 'Hành động',
      dataIndex: 'action',
      key: 'action',
    },
    {
      title: 'Chi tiết',
      dataIndex: 'details',
      key: 'details',
      ellipsis: true,
    },
    {
      title: 'IP Address',
      dataIndex: 'ip_address',
      key: 'ip_address',
    },
  ];

  const backupColumns: ColumnsType<BackupRecord> = [
    {
      title: 'Thời gian',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm:ss'),
    },
    {
      title: 'Loại',
      dataIndex: 'backup_type',
      key: 'backup_type',
    },
    {
      title: 'Dung lượng',
      dataIndex: 'file_size',
      key: 'file_size',
      render: (size: number) => `${(size / 1024 / 1024).toFixed(2)} MB`,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const color = status === 'SUCCESS' ? 'green' : status === 'FAILED' ? 'red' : 'orange';
        return <Tag color={color}>{status}</Tag>;
      },
    },
  ];

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: 'companies',
      icon: <BankOutlined />,
      label: 'Công ty',
    },
    {
      key: 'users',
      icon: <UserOutlined />,
      label: 'Người dùng',
    },
    {
      key: 'subscriptions',
      icon: <CreditCardOutlined />,
      label: 'Gói dịch vụ',
    },
    {
      key: 'roles',
      icon: <SafetyOutlined />,
      label: 'Vai trò & Quyền',
    },
    {
      key: 'logs',
      icon: <FileTextOutlined />,
      label: 'System Log',
    },
    {
      key: 'backup',
      icon: <SaveOutlined />,
      label: 'Backup & Restore',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Cấu hình',
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={280}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div style={{ padding: '20px', color: 'white', fontSize: '20px', fontWeight: 'bold' }}>
          {collapsed ? '⚙️' : '⚙️ System Admin'}
        </div>
        <Menu
          theme="dark"
          selectedKeys={[activeTab]}
          mode="inline"
          items={menuItems}
          onClick={({ key }) => setActiveTab(key)}
        />
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 280 }}>
        <Content style={{ margin: '24px', padding: '24px', background: '#fff', minHeight: 'calc(100vh - 48px)' }}>
          {activeTab === 'dashboard' && (
            <div>
              <Title level={2}>Dashboard</Title>
              {loading ? (
                <Spin size="large" />
              ) : (
                <>
                  <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                    <Col xs={24} sm={12} lg={6}>
                      <Card>
                        <Statistic
                          title="Tổng số công ty"
                          value={stats?.totalTenants || 0}
                          prefix={<BankOutlined />}
                        />
                      </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                      <Card>
                        <Statistic
                          title="Công ty hoạt động"
                          value={stats?.activeTenants || 0}
                          prefix={<CheckCircleOutlined />}
                          valueStyle={{ color: '#3f8600' }}
                        />
                      </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                      <Card>
                        <Statistic
                          title="Tổng số người dùng"
                          value={stats?.totalUsers || 0}
                          prefix={<UserOutlined />}
                        />
                      </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                      <Card>
                        <Statistic
                          title="Người dùng hoạt động"
                          value={stats?.activeUsers || 0}
                          prefix={<CheckCircleOutlined />}
                          valueStyle={{ color: '#3f8600' }}
                        />
                      </Card>
                    </Col>
                  </Row>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} lg={12}>
                      <Card title="Hoạt động gần đây">
                        <Table
                          dataSource={stats?.recentActivities || []}
                          columns={[
                            { title: 'Công ty', dataIndex: 'tenant_name', key: 'tenant_name' },
                            { title: 'Hành động', dataIndex: 'action', key: 'action' },
                            {
                              title: 'Thời gian',
                              dataIndex: 'created_at',
                              key: 'created_at',
                              render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
                            },
                          ]}
                          pagination={false}
                          size="small"
                        />
                      </Card>
                    </Col>
                    <Col xs={24} lg={12}>
                      <Card title="Trạng thái hệ thống">
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <div>
                            <Text strong>Server: </Text>
                            <Tag color={systemStatus.server === 'active' ? 'green' : 'red'}>
                              {systemStatus.server === 'active' ? 'Hoạt động' : 'Lỗi'}
                            </Tag>
                          </div>
                          <div>
                            <Text strong>Database: </Text>
                            <Tag color={systemStatus.database === 'active' ? 'green' : 'red'}>
                              {systemStatus.database === 'active' ? 'Hoạt động' : 'Lỗi'}
                            </Tag>
                          </div>
                          <div>
                            <Text strong>API: </Text>
                            <Tag color={systemStatus.api === 'active' ? 'green' : 'red'}>
                              {systemStatus.api === 'active' ? 'Hoạt động' : 'Lỗi'}
                            </Tag>
                          </div>
                        </Space>
                      </Card>
                    </Col>
                  </Row>
                </>
              )}
            </div>
          )}

          {activeTab === 'companies' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <Title level={2}>Quản lý Công ty</Title>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => showTenantModal()}
                >
                  Thêm công ty
                </Button>
              </div>
              <Table
                columns={tenantColumns}
                dataSource={tenants}
                loading={tenantsLoading}
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <Title level={2}>Quản lý Người dùng Hệ thống</Title>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => showUserModal()}
                >
                  Thêm người dùng
                </Button>
              </div>
              <Table
                columns={userColumns}
                dataSource={users}
                loading={usersLoading}
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
            </div>
          )}

          {activeTab === 'subscriptions' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <Title level={2}>Quản lý Gói Dịch vụ</Title>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => showSubscriptionModal()}
                >
                  Thêm gói dịch vụ
                </Button>
              </div>
              <Table
                columns={subscriptionColumns}
                dataSource={subscriptions}
                loading={subscriptionsLoading}
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
            </div>
          )}

          {activeTab === 'roles' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <Title level={2}>Vai trò & Quyền</Title>
                <Button type="primary" icon={<PlusOutlined />}>
                  Thêm vai trò
                </Button>
              </div>
              <Table
                columns={[
                  { title: 'Mã vai trò', dataIndex: 'role_code', key: 'role_code' },
                  { title: 'Tên vai trò', dataIndex: 'role_name', key: 'role_name' },
                  { title: 'Mức độ', dataIndex: 'role_level', key: 'role_level' },
                  {
                    title: 'Hành động',
                    key: 'action',
                    render: () => (
                      <Button type="link" icon={<EditOutlined />}>
                        Sửa
                      </Button>
                    ),
                  },
                ]}
                dataSource={roles}
                loading={rolesLoading}
                rowKey="_id"
                pagination={{ pageSize: 10 }}
              />
            </div>
          )}

          {activeTab === 'logs' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <Title level={2}>System Log - Nhật ký hoạt động hệ thống</Title>
                <Button
                  icon={<ExportOutlined />}
                  onClick={handleExportLogs}
                >
                  Xuất Log
                </Button>
              </div>
              <Table
                columns={logColumns}
                dataSource={logs}
                loading={logsLoading}
                rowKey="id"
                pagination={{
                  current: logsPagination.current,
                  pageSize: logsPagination.pageSize,
                  total: logsPagination.total,
                  onChange: (page) => loadLogs(page),
                }}
              />
            </div>
          )}

          {activeTab === 'backup' && (
            <div>
              <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                  <Card title="Thực hiện Backup">
                    <Form
                      form={backupForm}
                      layout="vertical"
                      onFinish={handleStartBackup}
                    >
                      <Form.Item
                        name="backup_type"
                        label="Loại Backup"
                        rules={[{ required: true }]}
                      >
                        <Select>
                          <Option value="FULL">Toàn bộ hệ thống</Option>
                          <Option value="DATABASE">Chỉ Database</Option>
                          <Option value="FILES">Chỉ Files</Option>
                          <Option value="CONFIG">Cấu hình hệ thống</Option>
                        </Select>
                      </Form.Item>
                      <Form.Item
                        name="storage_location"
                        label="Lưu trữ tại"
                        rules={[{ required: true }]}
                      >
                        <Select>
                          <Option value="local">Server cục bộ</Option>
                          <Option value="cloud">Cloud Storage</Option>
                          <Option value="external">External Drive</Option>
                        </Select>
                      </Form.Item>
                      <Form.Item name="compress" valuePropName="checked">
                        <Switch /> Nén dữ liệu
                      </Form.Item>
                      <Form.Item>
                        <Button type="primary" htmlType="submit" block loading={submittingBackup}>
                          Bắt đầu Backup
                        </Button>
                      </Form.Item>
                    </Form>
                  </Card>
                </Col>
                <Col xs={24} lg={12}>
                  <Card title="Lịch sử Backup">
                    <Table
                      columns={backupColumns}
                      dataSource={backups}
                      loading={backupsLoading}
                      rowKey="id"
                      pagination={{ pageSize: 5 }}
                    />
                  </Card>
                </Col>
              </Row>
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <Title level={2}>Cài đặt chung hệ thống</Title>
              {settingsLoading ? (
                <Spin />
              ) : (
                <Form
                  form={settingsForm}
                  layout="vertical"
                  onFinish={handleSaveSettings}
                  style={{ maxWidth: 800 }}
                >
                  <Card title="Cài đặt chung" style={{ marginBottom: 16 }}>
                    <Row gutter={16}>
                      <Col xs={24} sm={12}>
                        <Form.Item name="system_name" label="Tên hệ thống">
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="system_email" label="Email hệ thống">
                          <Input type="email" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="system_phone" label="Điện thoại hỗ trợ">
                          <Input />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                  <Card title="Cấu hình bảo mật" style={{ marginBottom: 16 }}>
                    <Form.Item name="enable_2fa" valuePropName="checked">
                      <Switch /> Yêu cầu xác thực 2 lớp (2FA)
                    </Form.Item>
                    <Form.Item name="enable_logging" valuePropName="checked">
                      <Switch /> Ghi log tất cả các hoạt động
                    </Form.Item>
                    <Form.Item name="enable_auto_backup" valuePropName="checked">
                      <Switch /> Backup tự động hàng ngày
                    </Form.Item>
                    <Row gutter={16}>
                      <Col xs={24} sm={12}>
                        <Form.Item name="session_timeout" label="Thời gian session hết hạn (phút)">
                          <Input type="number" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="max_login_attempts" label="Số lần đăng nhập sai tối đa">
                          <Input type="number" />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                  <Form.Item>
                    <Space>
                      <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={submittingSettings}>
                        Lưu cấu hình
                      </Button>
                      <Button onClick={() => loadSettings()}>
                        Khôi phục mặc định
                      </Button>
                    </Space>
                  </Form.Item>
                </Form>
              )}
            </div>
          )}
        </Content>
      </Layout>

      {/* Tenant Modal */}
      <Modal
        title={editingTenant ? 'Sửa công ty' : 'Thêm công ty'}
        open={tenantModalVisible}
        onCancel={() => {
          setTenantModalVisible(false);
          setEditingTenant(null);
          tenantForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={tenantForm}
          layout="vertical"
          onFinish={editingTenant ? handleUpdateTenant : handleCreateTenant}
        >
          <Form.Item
            name="tenant_name"
            label="Tên công ty"
            rules={[{ required: true, message: 'Vui lòng nhập tên công ty' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="tax_code"
            label="Mã thuế"
            rules={[{ required: true, message: 'Vui lòng nhập mã thuế' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="contact_name"
            label="Người liên hệ"
            rules={[{ required: true, message: 'Vui lòng nhập tên người liên hệ' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="contact_email"
            label="Email liên hệ"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="contact_phone" label="Điện thoại">
            <Input />
          </Form.Item>
          <Form.Item name="subscription_plan" label="Gói dịch vụ">
            <Input />
          </Form.Item>
          <Form.Item name="subscription_expires_at" label="Hết hạn">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={submittingTenant}>
                {editingTenant ? 'Cập nhật' : 'Tạo'}
              </Button>
              <Button onClick={() => {
                setTenantModalVisible(false);
                setEditingTenant(null);
                tenantForm.resetFields();
              }}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Subscription Modal */}
      <Modal
        title={editingSubscription ? 'Sửa gói dịch vụ' : 'Thêm gói dịch vụ'}
        open={subscriptionModalVisible}
        onCancel={() => {
          setSubscriptionModalVisible(false);
          setEditingSubscription(null);
          subscriptionForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={subscriptionForm}
          layout="vertical"
          onFinish={editingSubscription ? handleUpdateSubscription : handleCreateSubscription}
        >
          <Form.Item
            name="plan_name"
            label="Tên gói"
            rules={[{ required: true, message: 'Vui lòng nhập tên gói' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <TextArea rows={3} />
          </Form.Item>
          <Form.Item
            name="price"
            label="Giá (VNĐ)"
            rules={[{ required: true, message: 'Vui lòng nhập giá' }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            name="duration_months"
            label="Kỳ hạn (tháng)"
            rules={[{ required: true, message: 'Vui lòng nhập kỳ hạn' }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={submittingSubscription}>
                {editingSubscription ? 'Cập nhật' : 'Tạo'}
              </Button>
              <Button onClick={() => {
                setSubscriptionModalVisible(false);
                setEditingSubscription(null);
                subscriptionForm.resetFields();
              }}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default SystemAdmin;

