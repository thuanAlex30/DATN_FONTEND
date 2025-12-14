import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Row,
  Col,
  Card,
  Statistic,
  Button,
  Space,
  Input,
  Select,
  Table,
  Tag,
  Tooltip,
  Typography,
  Modal,
  Form,
  Switch,
  Divider,
  Drawer,
  Descriptions,
  Avatar,
  List,
  Empty,
  message,
  Alert
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  BankOutlined,
  ReloadOutlined,
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  TeamOutlined,
  UserOutlined,
  ApartmentOutlined,
  SwapOutlined,
  EyeOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import departmentService from '../../../services/departmentService';
import userService from '../../../services/userService';
import type { Department, DepartmentOption } from '../../../types/department';
import type { User } from '../../../types/user';
import type { RootState } from '../../../store';
import styles from './DepartmentManagement.module.css';

const { Title, Text } = Typography;
const { Option } = Select;

interface DepartmentStats {
  total: number;
  active: number;
  inactive: number;
  with_manager: number;
  without_manager: number;
}

interface DepartmentPagination {
  current_page: number;
  total_pages: number;
  total_items: number;
  items_per_page: number;
}

interface DepartmentSummary {
  id: string;
  name: string;
  description?: string;
  manager?: {
    id: string;
    name: string;
    email?: string;
  } | null;
  managers?: Array<{
    id: string;
    name: string;
    email?: string;
  }>;
  employee_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface DepartmentEmployee {
  id: string;
  username: string;
  full_name: string;
  email: string;
  phone?: string;
  role: {
    id: string;
    name: string;
  } | null;
  is_active: boolean;
  created_at: string;
}

const defaultPagination: DepartmentPagination = {
  current_page: 1,
  total_pages: 1,
  total_items: 0,
  items_per_page: 10
};

const defaultStats: DepartmentStats = {
  total: 0,
  active: 0,
  inactive: 0,
  with_manager: 0,
  without_manager: 0
};

const DepartmentManagementPage = () => {
  const { user: currentUser } = useSelector((state: RootState) => state.auth);

  const [rawDepartments, setRawDepartments] = useState<Department[]>([]);
  const [displayDepartments, setDisplayDepartments] = useState<Department[]>([]);
  const [pagination, setPagination] = useState<DepartmentPagination>(defaultPagination);
  const [stats, setStats] = useState<DepartmentStats>(defaultStats);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [hasManagerFilter, setHasManagerFilter] = useState<'all' | 'yes' | 'no'>('all');
  const [hasEmployeesFilter, setHasEmployeesFilter] = useState<'all' | 'yes' | 'no'>('all');
  const [managerFilter, setManagerFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'department_name' | 'created_at' | 'updated_at'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isTransferVisible, setIsTransferVisible] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [departmentOptions, setDepartmentOptions] = useState<DepartmentOption[]>([]);
  const [managers, setManagers] = useState<User[]>([]);
  const [form] = Form.useForm();
  const [transferForm] = Form.useForm();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [departmentSummary, setDepartmentSummary] = useState<DepartmentSummary | null>(null);
  const [employeesModalVisible, setEmployeesModalVisible] = useState(false);
  const [deletePasswordModalVisible, setDeletePasswordModalVisible] = useState(false);
  const [deletingDepartment, setDeletingDepartment] = useState<Department | null>(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [deletePasswordForm] = Form.useForm();
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [employeeList, setEmployeeList] = useState<DepartmentEmployee[]>([]);
  const [employeeModalTitle, setEmployeeModalTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const handler = window.setTimeout(() => setDebouncedSearch(searchValue.trim()), 350);
    return () => window.clearTimeout(handler);
  }, [searchValue]);

  useEffect(() => {
    fetchStats();
    fetchDepartments();
    fetchDepartmentOptions();
    fetchManagers();
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [page, pageSize, debouncedSearch, statusFilter, sortBy, sortOrder]);

  useEffect(() => {
    // client-side filters only
    filterDepartments();
  }, [hasManagerFilter, hasEmployeesFilter, managerFilter]);

  const managerCandidates = useMemo(() => {
    return managers.filter((manager) => {
      const level = manager.role?.role_level ?? 0;
      const code = manager.role?.role_code?.toLowerCase();
      return level >= 70 || code === 'manager' || code === 'department_header';
    });
  }, [managers]);

  const canCreate = useMemo(() => {
    const level = currentUser?.role?.role_level ?? 0;
    const code = currentUser?.role?.role_code?.toLowerCase();
    return level >= 90 || code === 'company_admin' || code === 'system_admin';
  }, [currentUser]);

  const canUpdate = useMemo(() => {
    const level = currentUser?.role?.role_level ?? 0;
    const code = currentUser?.role?.role_code?.toLowerCase();
    return level >= 80 || code === 'company_admin' || code === 'system_admin';
  }, [currentUser]);

  const canDelete = useMemo(() => {
    const level = currentUser?.role?.role_level ?? 0;
    const code = currentUser?.role?.role_code?.toLowerCase();
    return level >= 90 || code === 'company_admin' || code === 'system_admin';
  }, [currentUser]);

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const response = await departmentService.getDepartmentStats();
      const payload = (response as any)?.data ?? response;
      setStats({
        total: payload?.total ?? payload?.data?.total ?? 0,
        active: payload?.active ?? payload?.data?.active ?? 0,
        inactive: payload?.inactive ?? payload?.data?.inactive ?? 0,
        with_manager: payload?.with_manager ?? payload?.data?.with_manager ?? 0,
        without_manager: payload?.without_manager ?? payload?.data?.without_manager ?? 0
      });
    } catch (error) {
      console.error(error);
      message.error('Không thể tải thống kê phòng ban');
    } finally {
      setStatsLoading(false);
    }
  };

  const normalizeDepartmentList = (raw: any) => {
    if (!raw) {
      return { departments: [], pagination: defaultPagination };
    }
    const payload = raw.data ?? raw;
    if (payload.departments) {
      return {
        departments: payload.departments,
        pagination: payload.pagination ?? defaultPagination
      };
    }
    if (payload.data?.departments) {
      return {
        departments: payload.data.departments,
        pagination: payload.data.pagination ?? defaultPagination
      };
    }
    if (Array.isArray(payload)) {
      return {
        departments: payload,
        pagination: defaultPagination
      };
    }
    return { departments: [], pagination: defaultPagination };
  };

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const query = {
        page,
        limit: pageSize,
        search: debouncedSearch || undefined,
        is_active: statusFilter === 'all' ? undefined : statusFilter === 'active',
        sort_by: sortBy,
        sort_order: sortOrder
      };
      const response = await departmentService.getDepartments(query);
      const { departments: fetchedDepartments, pagination: serverPagination } = normalizeDepartmentList(response);
      setRawDepartments(fetchedDepartments);
      setPagination({
        current_page: serverPagination.current_page ?? page,
        total_pages: serverPagination.total_pages ?? 1,
        total_items: serverPagination.total_items ?? fetchedDepartments.length,
        items_per_page: serverPagination.items_per_page ?? pageSize
      });
      // re-apply client filters after data refresh
      filterDepartments(fetchedDepartments);
    } catch (error) {
      console.error(error);
      message.error('Không thể tải danh sách phòng ban');
      setRawDepartments([]);
      setDisplayDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartmentOptions = async () => {
    try {
      const options = await departmentService.getDepartmentOptions();
      setDepartmentOptions(options);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchManagers = async () => {
    try {
      const list = await userService.getAllUsers();
      setManagers(list);
    } catch (error) {
      console.error(error);
    }
  };

  const filterDepartments = (source?: Department[]) => {
    const data = source ?? rawDepartments;
    let filtered = [...data];

    if (hasManagerFilter !== 'all') {
      filtered = filtered.filter((dept) => {
        const hasManagers = Boolean(
          (dept.manager_ids && Array.isArray(dept.manager_ids) && dept.manager_ids.length > 0) ||
          dept.manager_id
        );
        return hasManagerFilter === 'yes' ? hasManagers : !hasManagers;
      });
    }

    if (hasEmployeesFilter !== 'all') {
      filtered = filtered.filter((dept) => {
        const count = dept.employees_count ?? (dept as any).employee_count ?? 0;
        return hasEmployeesFilter === 'yes' ? count > 0 : count === 0;
      });
    }

    if (managerFilter) {
      filtered = filtered.filter((dept) => {
        // Check in manager_ids array
        if (dept.manager_ids && Array.isArray(dept.manager_ids)) {
          const managerIds = dept.manager_ids.map((m: any) => 
            typeof m === 'string' ? m : (m._id || m.id)
          );
          if (managerIds.includes(managerFilter)) {
            return true;
          }
        }
        // Check in manager_id (legacy)
        const managerId =
          (dept.manager_id?._id || (dept.manager_id as any)?.id || (dept.manager_id as any)?._id) ?? '';
        return managerId === managerFilter;
      });
    }

    setDisplayDepartments(filtered);
  };

  const handleTableChange = (tablePagination: any) => {
    if (tablePagination.current) {
      setPage(tablePagination.current);
    }
    if (tablePagination.pageSize) {
      setPageSize(tablePagination.pageSize);
    }
  };

  const openCreateModal = () => {
    setEditingDepartment(null);
    form.resetFields();
    form.setFieldsValue({ 
      is_active: true,
      manager_ids: []
    });
    setSubmitting(false);
    setIsFormVisible(true);
  };

  const openEditModal = (department: Department) => {
    setEditingDepartment(department);
    
    // Get manager_ids from department (support both array and single manager_id)
    let managerIds: string[] = [];
    if (department.manager_ids && Array.isArray(department.manager_ids)) {
      managerIds = department.manager_ids.map((m: any) => 
        typeof m === 'string' ? m : (m._id || m.id)
      ).filter(Boolean);
    } else if (department.manager_id) {
      const managerId = typeof department.manager_id === 'string' 
        ? department.manager_id 
        : (department.manager_id._id || (department.manager_id as any).id);
      if (managerId) {
        managerIds = [managerId];
      }
    }
    
    form.setFieldsValue({
      department_name: department.department_name,
      description: department.description,
      manager_ids: managerIds,
      is_active: department.is_active
    });
    setSubmitting(false);
    setIsFormVisible(true);
  };

  const handleFormSubmit = async () => {
    setSubmitting(true);
    try {
      const values = await form.validateFields();
      if (editingDepartment) {
        await departmentService.updateDepartment(editingDepartment.id, values);
        message.success('Cập nhật phòng ban thành công');
      } else {
        await departmentService.createDepartment(values);
        message.success('Tạo phòng ban thành công');
      }
      setIsFormVisible(false);
      fetchDepartments();
      fetchStats();
      fetchDepartmentOptions();
    } catch (error: any) {
      if (error?.errorFields) {
        setSubmitting(false);
        return;
      }
      const errorMessage = error?.response?.data?.message || 'Không thể lưu phòng ban';
      message.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDeleteDepartment = (department: Department) => {
    const hasEmployees = (department.employees_count ?? 0) > 0;
    const isInactive = !department.is_active;

    // If department is inactive and has employees, show password modal
    if (isInactive && hasEmployees) {
      setDeletingDepartment(department);
      setDeletePassword('');
      deletePasswordForm.resetFields();
      setDeletePasswordModalVisible(true);
    } else {
      // Normal confirmation for departments without employees or active departments
    Modal.confirm({
      title: 'Xóa phòng ban',
      content: `Bạn có chắc chắn muốn xóa phòng ban "${department.department_name}"?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: () => handleDeleteDepartment(department)
    });
    }
  };

  const handleDeleteWithPassword = async () => {
    if (!deletingDepartment) return;
    
    try {
      const values = await deletePasswordForm.validateFields();
      await handleDeleteDepartment(deletingDepartment, values.password);
      setDeletePasswordModalVisible(false);
      setDeletingDepartment(null);
      deletePasswordForm.resetFields();
    } catch (error: any) {
      if (error?.errorFields) {
        // Validation error
        return;
      }
      // API error already handled in handleDeleteDepartment
    }
  };

  const handleDeleteDepartment = async (department: Department, password?: string) => {
    try {
      await departmentService.deleteDepartment(department.id, password);
      message.success('Đã xóa phòng ban thành công');
      fetchDepartments();
      fetchStats();
      fetchDepartmentOptions();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Không thể xóa phòng ban';
      message.error(errorMessage);
      throw error; // Re-throw to prevent modal from closing on error
    }
  };

  const handleToggleStatus = async (department: Department) => {
    try {
      await departmentService.updateDepartment(department.id, { is_active: !department.is_active });
      message.success(`Đã ${department.is_active ? 'ngừng kích hoạt' : 'kích hoạt'} phòng ban`);
      fetchDepartments();
      fetchStats();
    } catch (error) {
      message.error('Không thể thay đổi trạng thái');
    }
  };

  const openSummaryDrawer = async (department: Department) => {
    setDrawerVisible(true);
    setDrawerLoading(true);
    try {
      const summaryResponse = await departmentService.getDepartmentSummary(department.id);
      const summary = (summaryResponse as any)?.data ?? summaryResponse;
      setDepartmentSummary(summary);
    } catch (error) {
      message.error('Không thể tải thông tin phòng ban');
    } finally {
      setDrawerLoading(false);
    }
  };

  const handleViewEmployees = async (department: Department) => {
    setEmployeesModalVisible(true);
    setEmployeeModalTitle(department.department_name);
    setEmployeesLoading(true);
    try {
      const response = await departmentService.getDepartmentEmployees(department.id, {
        include_inactive: true // Lấy cả nhân viên đã ngừng hoạt động
      });
      const payload = (response as any)?.data ?? response;
      setEmployeeList(payload?.employees ?? []);
    } catch (error) {
      message.error('Không thể tải danh sách nhân viên');
      setEmployeeList([]);
    } finally {
      setEmployeesLoading(false);
    }
  };

  const openTransferModal = (fromDepartmentId?: string) => {
    transferForm.resetFields();
    transferForm.setFieldsValue({
      fromDepartmentId: fromDepartmentId || undefined,
      toDepartmentId: undefined
    });
    setIsTransferVisible(true);
  };

  const handleTransferSubmit = async () => {
    try {
      const values = await transferForm.validateFields();
      await departmentService.transferEmployees(values);
      message.success('Đã chuyển nhân viên giữa phòng ban');
      setIsTransferVisible(false);
      fetchDepartments();
      fetchStats();
    } catch (error: any) {
      if (error?.errorFields) return;
      const errorMessage = error?.response?.data?.message || 'Không thể chuyển nhân viên';
      message.error(errorMessage);
    }
  };

  const statCards = [
    {
      title: 'Tổng phòng ban',
      value: stats.total,
      icon: <BankOutlined />,
      color: '#3f51b5'
    },
    {
      title: 'Phòng ban đang hoạt động',
      value: stats.active,
      icon: <TeamOutlined />,
      color: '#52c41a'
    },
    {
      title: 'Đã ngừng hoạt động',
      value: stats.inactive,
      icon: <InfoCircleOutlined />,
      color: '#fa8c16'
    },
    {
      title: 'Có quản lý',
      value: stats.with_manager,
      icon: <UserOutlined />,
      color: '#13c2c2'
    },
    {
      title: 'Chưa có quản lý',
      value: stats.without_manager,
      icon: <ApartmentOutlined />,
      color: '#ff4d4f'
    }
  ];

  const columns: ColumnsType<Department> = [
    {
      title: 'Phòng ban',
      dataIndex: 'department_name',
      key: 'department_name',
      render: (_: string, record: Department) => (
        <div>
          <Text strong>{record.department_name}</Text>
          {record.description && (
            <div className={styles.subText}>{record.description}</div>
          )}
        </div>
      )
    },
    {
      title: 'Quản lý',
      dataIndex: 'manager_ids',
      key: 'managers',
      render: (_: unknown, record: Department) => {
        // Get managers from manager_ids array or fallback to manager_id
        let managers: any[] = [];
        if (record.manager_ids && Array.isArray(record.manager_ids) && record.manager_ids.length > 0) {
          managers = record.manager_ids;
        } else if (record.manager_id) {
          managers = [record.manager_id];
        }
        
        if (managers.length === 0) {
          return <Tag color="volcano">Chưa phân công</Tag>;
        }
        
        return (
          <Space direction="vertical" size={4} style={{ width: '100%' }}>
            {managers.slice(0, 3).map((manager: any, index: number) => {
              const managerId = typeof manager === 'string' ? manager : (manager._id || manager.id);
              const managerName = typeof manager === 'string' ? manager : (manager.full_name || manager.username || 'N/A');
              const managerEmail = typeof manager === 'string' ? '' : (manager.email || '');
              
              return (
                <Space key={managerId || index} size="small">
                  <Avatar size="small" icon={<UserOutlined />} />
                  <div>
                    <div>{managerName}</div>
                    {managerEmail && <div className={styles.subText}>{managerEmail}</div>}
                  </div>
                </Space>
              );
            })}
            {managers.length > 3 && (
              <Tag color="blue">+{managers.length - 3} quản lý khác</Tag>
            )}
          </Space>
        );
      }
    },
    {
      title: 'Nhân sự',
      dataIndex: 'employees_count',
      key: 'employees_count',
      render: (count: number) => count ?? 0
    },
    {
      title: 'Trạng thái',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive: boolean) =>
        isActive ? <Tag color="green">Đang hoạt động</Tag> : <Tag color="red">Ngừng</Tag>
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (value: string) => (value ? dayjs(value).format('DD/MM/YYYY HH:mm') : '-')
    },
    {
      title: 'Thao tác',
      key: 'actions',
      align: 'right',
      render: (_: unknown, record: Department) => (
        <Space size="middle">
          <Tooltip title="Xem tổng quan">
            <Button
              type="text"
              icon={<InfoCircleOutlined />}
              onClick={() => openSummaryDrawer(record)}
            />
          </Tooltip>
          <Tooltip title="Danh sách nhân viên">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewEmployees(record)}
            />
          </Tooltip>
          {canUpdate && (
            <Tooltip title="Chuyển nhân viên">
              <Button
                type="text"
                icon={<SwapOutlined />}
                onClick={() => openTransferModal(record.id)}
              />
            </Tooltip>
          )}
          {canUpdate && (
            <Tooltip title="Chỉnh sửa">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => openEditModal(record)}
              />
            </Tooltip>
          )}
          {canUpdate && (
            <Tooltip title={record.is_active ? 'Ngừng kích hoạt' : 'Kích hoạt'}>
              <Switch
                checked={record.is_active}
                onChange={() => handleToggleStatus(record)}
                size="small"
              />
            </Tooltip>
          )}
          {canDelete && (
            <Tooltip 
              title={
                !record.is_active 
                  ? "Xóa phòng ban đã ngừng hoạt động" 
                  : (record.employees_count ?? 0) > 0 
                    ? "Không thể xóa phòng ban đang hoạt động có nhân viên" 
                    : "Xóa phòng ban"
              }
            >
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                disabled={record.is_active && (record.employees_count ?? 0) > 0}
                onClick={() => confirmDeleteDepartment(record)}
              />
            </Tooltip>
          )}
        </Space>
      )
    }
  ];

  return (
    <div className={styles.wrapper}>
      <div className={styles.pageHeader}>
        <div>
          <Title level={3}>Quản lý phòng ban</Title>
          <Text type="secondary">Theo dõi, phân công và tối ưu cơ cấu phòng ban trong doanh nghiệp</Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => { fetchDepartments(); fetchStats(); }}>
            Làm mới
          </Button>
          {canUpdate && (
            <Button icon={<SwapOutlined />} onClick={() => openTransferModal()}>
              Chuyển nhân viên
            </Button>
          )}
          {canCreate && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
              Thêm phòng ban
            </Button>
          )}
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        {statCards.map((card) => (
          <Col xs={24} sm={12} md={8} lg={6} key={card.title}>
            <Card loading={statsLoading} className={styles.statCard}>
              <Space align="center" size="large">
                <div className={styles.statIcon} style={{ backgroundColor: `${card.color}15` }}>
                  <span style={{ color: card.color }}>{card.icon}</span>
                </div>
                <div>
                  <Text type="secondary">{card.title}</Text>
                  <Statistic value={card.value} />
                </div>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      <Card className={styles.filtersCard}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={8}>
            <Input
              prefix={<SearchOutlined />}
              placeholder="Tìm kiếm theo tên phòng ban"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} md={4}>
            <Select
              value={statusFilter}
              onChange={(value) => {
                setStatusFilter(value);
                setPage(1);
              }}
              style={{ width: '100%' }}
            >
              <Option value="all">Tất cả trạng thái</Option>
              <Option value="active">Đang hoạt động</Option>
              <Option value="inactive">Ngừng</Option>
            </Select>
          </Col>
          <Col xs={24} md={4}>
            <Select
              value={hasManagerFilter}
              onChange={(value) => setHasManagerFilter(value)}
              style={{ width: '100%' }}
            >
              <Option value="all">Quản lý</Option>
              <Option value="yes">Đã phân công</Option>
              <Option value="no">Chưa có</Option>
            </Select>
          </Col>
          <Col xs={24} md={4}>
            <Select
              value={hasEmployeesFilter}
              onChange={(value) => setHasEmployeesFilter(value)}
              style={{ width: '100%' }}
            >
              <Option value="all">Nhân sự</Option>
              <Option value="yes">Có nhân sự</Option>
              <Option value="no">Chưa có</Option>
            </Select>
          </Col>
          <Col xs={24} md={4}>
            <Select
              placeholder="Lọc theo quản lý"
              allowClear
              value={managerFilter ?? undefined}
              onChange={(value) => setManagerFilter(value || null)}
              style={{ width: '100%' }}
              showSearch
              optionFilterProp="children"
            >
              {managerCandidates.map((manager) => (
                <Option key={manager.id} value={manager.id}>
                  {manager.full_name || manager.username}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} md={4}>
            <Select value={sortBy} onChange={(value) => setSortBy(value)} style={{ width: '100%' }}>
              <Option value="created_at">Ngày tạo</Option>
              <Option value="updated_at">Ngày cập nhật</Option>
              <Option value="department_name">Tên phòng ban</Option>
            </Select>
          </Col>
          <Col xs={24} md={4}>
            <Select
              value={sortOrder}
              onChange={(value) => setSortOrder(value)}
              style={{ width: '100%' }}
            >
              <Option value="desc">Giảm dần</Option>
              <Option value="asc">Tăng dần</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      <Card className={styles.tableCard}>
        <Table
          columns={columns}
          dataSource={displayDepartments}
          rowKey={(record) => record.id}
          loading={loading}
          pagination={{
            current: pagination.current_page,
            total: pagination.total_items,
            pageSize: pagination.items_per_page,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100']
          }}
          onChange={handleTableChange}
        />
      </Card>

      <Modal
        title={editingDepartment ? 'Chỉnh sửa phòng ban' : 'Thêm phòng ban mới'}
        open={isFormVisible}
        onCancel={() => {
          setIsFormVisible(false);
          setSubmitting(false);
        }}
        onOk={handleFormSubmit}
        okText={editingDepartment ? 'Cập nhật' : 'Tạo mới'}
        confirmLoading={submitting}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Tên phòng ban"
            name="department_name"
            rules={[
              { required: true, message: 'Vui lòng nhập tên phòng ban' },
              { min: 2, message: 'Tên phòng ban tối thiểu 2 ký tự' }
            ]}
          >
            <Input placeholder="VD: Bộ phận An toàn" />
          </Form.Item>
          <Form.Item label="Mô tả" name="description">
            <Input.TextArea rows={3} placeholder="Mô tả ngắn gọn chức năng phòng ban" />
          </Form.Item>
          <Form.Item 
            label="Quản lý phụ trách (tối đa 5)" 
            name="manager_ids"
            rules={[
              {
                validator: (_, value) => {
                  if (!value || value.length === 0) {
                    return Promise.resolve();
                  }
                  if (value.length > 5) {
                    return Promise.reject(new Error('Một phòng ban chỉ có thể có tối đa 5 quản lý'));
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <Select
              mode="multiple"
              allowClear
              placeholder="Chọn quản lý (tối đa 5)"
              showSearch
              optionFilterProp="children"
              maxTagCount="responsive"
              maxTagTextLength={20}
            >
              {managerCandidates.map((manager) => (
                <Option key={manager.id} value={manager.id}>
                  {manager.full_name || manager.username}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Trạng thái" name="is_active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Chuyển nhân viên giữa phòng ban"
        open={isTransferVisible}
        onCancel={() => setIsTransferVisible(false)}
        onOk={handleTransferSubmit}
        okText="Thực hiện chuyển"
      >
        <Form form={transferForm} layout="vertical">
          <Form.Item
            label="Phòng ban nguồn"
            name="fromDepartmentId"
            rules={[{ required: true, message: 'Vui lòng chọn phòng ban nguồn' }]}
          >
            <Select placeholder="Chọn phòng ban nguồn" showSearch optionFilterProp="children">
              {departmentOptions.map((dept) => (
                <Option key={dept.id} value={dept.id}>
                  {dept.department_name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="Phòng ban đích"
            name="toDepartmentId"
            dependencies={['fromDepartmentId']}
            rules={[
              { required: true, message: 'Vui lòng chọn phòng ban đích' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || value !== getFieldValue('fromDepartmentId')) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Phòng ban đích phải khác phòng ban nguồn'));
                }
              })
            ]}
          >
            <Select placeholder="Chọn phòng ban đích" showSearch optionFilterProp="children">
              {departmentOptions.map((dept) => (
                <Option key={dept.id} value={dept.id}>
                  {dept.department_name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Text type="secondary">
            Tính năng sẽ chuyển toàn bộ nhân viên đang hoạt động từ phòng ban nguồn sang phòng ban
            đích được chọn.
          </Text>
        </Form>
      </Modal>

      <Drawer
        title={departmentSummary?.name || 'Chi tiết phòng ban'}
        width={420}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
      >
        {drawerLoading ? (
          <div className={styles.drawerLoading}>Đang tải...</div>
        ) : departmentSummary ? (
          <>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Tên">{departmentSummary.name}</Descriptions.Item>
              <Descriptions.Item label="Mô tả">
                {departmentSummary.description || 'Chưa cập nhật'}
              </Descriptions.Item>
              <Descriptions.Item label="Quản lý">
                {departmentSummary.manager ? (
                  <>
                    <div>{departmentSummary.manager.name}</div>
                    <Text type="secondary">{departmentSummary.manager.email}</Text>
                  </>
                ) : (
                  <Tag color="volcano">Chưa phân công</Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Nhân sự">
                {departmentSummary.employee_count} người
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                {departmentSummary.is_active ? (
                  <Tag color="green">Đang hoạt động</Tag>
                ) : (
                  <Tag color="red">Ngừng</Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {dayjs(departmentSummary.created_at).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày cập nhật">
                {dayjs(departmentSummary.updated_at).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
            </Descriptions>
            <Divider />
            <Button
              icon={<EyeOutlined />}
              block
              onClick={() =>
                handleViewEmployees({
                  ...(departmentSummary as any),
                  id: departmentSummary.id,
                  department_name: departmentSummary.name,
                  is_active: departmentSummary.is_active
                })
              }
            >
              Xem danh sách nhân viên
            </Button>
          </>
        ) : (
          <Empty description="Không có dữ liệu" />
        )}
      </Drawer>

      <Modal
        title={`Nhân viên - ${employeeModalTitle}`}
        open={employeesModalVisible}
        onCancel={() => setEmployeesModalVisible(false)}
        footer={null}
        width={640}
      >
        {employeesLoading ? (
          <div className={styles.drawerLoading}>Đang tải...</div>
        ) : employeeList.length === 0 ? (
          <Empty description="Chưa có nhân viên" />
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={employeeList}
            renderItem={(employee) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar icon={<UserOutlined />} />}
                  title={
                    <Space>
                      <Text strong>{employee.full_name}</Text>
                      {employee.role && <Tag color="blue">{employee.role.name}</Tag>}
                      <Tag color={employee.is_active ? 'green' : 'red'}>
                        {employee.is_active ? 'Đang làm việc' : 'Ngừng'}
                      </Tag>
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size={0}>
                      <Text>{employee.email}</Text>
                      {employee.phone && <Text>{employee.phone}</Text>}
                      <Text type="secondary">
                        Gia nhập: {dayjs(employee.created_at).format('DD/MM/YYYY')}
                      </Text>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Modal>

      {/* Password confirmation modal for deleting inactive departments with employees */}
      <Modal
        title="⚠️ Xác nhận xóa phòng ban có nhân viên"
        open={deletePasswordModalVisible}
        onOk={handleDeleteWithPassword}
        onCancel={() => {
          setDeletePasswordModalVisible(false);
          setDeletingDepartment(null);
          deletePasswordForm.resetFields();
        }}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
        width={600}
        destroyOnClose
      >
        {deletingDepartment && (
          <div>
            <Alert
              message="Cảnh báo"
              description={
                <div>
                  <p style={{ marginBottom: 8 }}>
                    Phòng ban <strong>"{deletingDepartment.department_name}"</strong> đã ngừng hoạt động nhưng vẫn còn <strong style={{ color: '#ff4d4f', fontSize: '16px' }}>{deletingDepartment.employees_count}</strong> nhân viên.
                  </p>
                  <p style={{ marginBottom: 0, fontWeight: 'bold' }}>
                    ⚠️ Sau khi xóa, tất cả nhân viên trong phòng ban này sẽ bị xóa khỏi phòng ban (chưa có phòng ban nào).
                  </p>
                </div>
              }
              type="warning"
              showIcon
              style={{ marginBottom: 24 }}
            />
            
            <Alert
              message="Yêu cầu xác thực"
              description="Vui lòng nhập mật khẩu của tài khoản đang đăng nhập để xác nhận xóa phòng ban này."
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />

            <Form form={deletePasswordForm} layout="vertical">
              <Form.Item
                label="Mật khẩu"
                name="password"
                rules={[
                  { required: true, message: 'Vui lòng nhập mật khẩu' }
                ]}
              >
                <Input.Password
                  placeholder="Nhập mật khẩu của bạn"
                  autoFocus
                  onPressEnter={handleDeleteWithPassword}
                  size="large"
                />
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DepartmentManagementPage;

