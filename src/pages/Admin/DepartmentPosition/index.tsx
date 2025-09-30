import React, { useState, useEffect } from 'react';
import { 
  Card, Typography, Button, Space, Table, Tag, Avatar, Row, Col, Statistic, 
  Input, Select, message, Popconfirm, Tabs, Spin, Alert, Drawer, 
  List, Badge, Tooltip, Empty 
} from 'antd';
import { 
  BankOutlined, PlusOutlined, EditOutlined, DeleteOutlined, 
  UserOutlined, TeamOutlined, ReloadOutlined, 
  SettingOutlined, ProjectOutlined, SyncOutlined, CloseOutlined 
} from '@ant-design/icons';
import departmentService from '../../../services/departmentService';
import positionService from '../../../services/positionService';
import userService from '../../../services/userService';
import type { 
  Employee, 
  DepartmentStats
} from './types';
import type { Department as APIDepartment } from '../../../types/department';
import type { Position as APIPosition } from '../../../types/position';

const DepartmentPositionPage: React.FC = () => {
  // State management
  const [activeTab, setActiveTab] = useState<string>('departments');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Data state
  const [departments, setDepartments] = useState<APIDepartment[]>([]);
  const [positions, setPositions] = useState<APIPosition[]>([]);
  const [departmentEmployeeCounts, setDepartmentEmployeeCounts] = useState<Record<string, number>>({});
  const [stats, setStats] = useState<DepartmentStats>({
    totalDepartments: 0,
    totalPositions: 0,
    totalEmployees: 0,
    totalProjects: 0
  });

  // Additional data state
  const [employees, setEmployees] = useState<Employee[]>([]);

  // Department employees state
  const [selectedDepartmentEmployees, setSelectedDepartmentEmployees] = useState<Array<{
    id: string;
    username: string;
    full_name: string;
    email: string;
    phone?: string;
    position: {
      id: string;
      name: string;
      level: number;
    } | null;
    role: {
      id: string;
      name: string;
    } | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  }>>([]);
  const [selectedDepartmentForEmployees, setSelectedDepartmentForEmployees] = useState<string | null>(null);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState<boolean>(false);

  // Filter states
  const [filteredDepartments, setFilteredDepartments] = useState<APIDepartment[]>([]);
  const [filteredPositions, setFilteredPositions] = useState<APIPosition[]>([]);
  
  // Search and filter states
  const [departmentSearch, setDepartmentSearch] = useState<string>('');
  const [departmentStatusFilter, setDepartmentStatusFilter] = useState<string>('');
  const [departmentLevelFilter, setDepartmentLevelFilter] = useState<string>('');
  
  const [positionSearch, setPositionSearch] = useState<string>('');
  const [positionStatusFilter, setPositionStatusFilter] = useState<string>('');
  const [positionLevelFilter, setPositionLevelFilter] = useState<string>('');

  // API functions
  const loadDepartments = async () => {
    try {
      const response = await departmentService.getDepartments({});
      console.log('Departments API response:', response);
      
      const departmentsData = response.data?.departments || [];
      setDepartments(departmentsData);
      setFilteredDepartments(departmentsData);
      
      await loadDepartmentEmployeeCounts(departmentsData);
    } catch (error) {
      console.error('Error loading departments:', error);
      setError('Không thể tải danh sách phòng ban');
    }
  };

  const loadDepartmentEmployeeCounts = async (departmentList: APIDepartment[]) => {
    try {
      const departmentIds = departmentList.map(dept => dept.id);
      const employeeCounts = await departmentService.getDepartmentsWithEmployeeCounts(departmentIds);
      setDepartmentEmployeeCounts(employeeCounts);
    } catch (error) {
      console.error('Error loading department employee counts:', error);
      setDepartmentEmployeeCounts({});
    }
  };

  const loadPositions = async () => {
    try {
      const response = await positionService.getAll({});
      const positionsData = (response.data as any)?.data?.positions || [];
      setPositions(positionsData);
      setFilteredPositions(positionsData);
    } catch (error) {
      console.error('Error loading positions:', error);
      setError('Không thể tải danh sách vị trí');
    }
  };

  const loadStats = async () => {
    try {
      const [deptStats, posStats, userStats] = await Promise.all([
        departmentService.getStats(),
        positionService.getStats(),
        userService.getUserStats()
      ]);
      
      setStats({
        totalDepartments: deptStats.data?.total || 0,
        totalPositions: posStats.data?.totalPositions || 0,
        totalEmployees: userStats.data?.total || 0,
        totalProjects: 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadEmployees = async () => {
    try {
      const response = await userService.getUsers({});
      // Convert User[] to Employee[] format
      const employees = (response.data || []).map((user: any) => ({
        employee_id: user.id,
        user_id: user.id,
        department_id: user.department_id || 0,
        position_id: user.position_id || 0,
        is_active: user.is_active,
        hire_date: user.created_at || new Date().toISOString(),
        contract_type: 'full_time'
      }));
      setEmployees(employees);
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };


  // Load employees for a specific department
  const loadDepartmentEmployees = async (departmentId: string) => {
    setIsLoadingEmployees(true);
    setError('');
    
    try {
      const response = await departmentService.getDepartmentEmployees(departmentId, {
        is_active: true,
        sort_by: 'full_name',
        sort_order: 'asc'
      });
      
      setSelectedDepartmentEmployees(response.data.employees);
      setSelectedDepartmentForEmployees(departmentId);
    } catch (error: any) {
      console.error('Error loading department employees:', error);
      setError('Không thể tải danh sách nhân viên');
    } finally {
      setIsLoadingEmployees(false);
    }
  };

  // Utility functions
  const getDepartmentName = (departmentId: string): string => {
    const dept = departments.find(d => d.id === departmentId);
    return dept ? dept.department_name : 'Không xác định';
  };

  const getEmployeeCountByDepartment = (departmentId: string): number => {
    return departmentEmployeeCounts[departmentId] || 0;
  };

  const getEmployeeCountByPosition = (positionId: string): number => {
    const position = positions.find(p => p.id === positionId);
    if (position && (position as any).employees_count !== undefined) {
      return (position as any).employees_count;
    }
    return employees.filter(e => e.position_id === parseInt(positionId) && e.is_active).length;
  };

  const getLevelName = (level: number): string => {
    const levels: {[key: number]: string} = {
      1: "Cấp 1 (Nhân viên)",
      2: "Cấp 2 (Chuyên viên)", 
      3: "Cấp 3 (Trưởng nhóm)",
      4: "Cấp 4 (Trưởng phòng)",
      5: "Cấp 5 (Giám đốc)"
    };
    return levels[level] || `Cấp ${level}`;
  };

  // Filter and search functions
  const filterDepartments = () => {
    let filtered = [...departments];

    if (departmentSearch.trim()) {
      const searchTerm = departmentSearch.toLowerCase().trim();
      filtered = filtered.filter(dept => 
        dept.department_name.toLowerCase().includes(searchTerm) ||
        dept.description?.toLowerCase().includes(searchTerm) ||
        dept.id.toString().includes(searchTerm)
      );
    }

    if (departmentStatusFilter) {
      if (departmentStatusFilter === 'active') {
        filtered = filtered.filter(dept => dept.is_active);
      } else if (departmentStatusFilter === 'inactive') {
        filtered = filtered.filter(dept => !dept.is_active);
      }
    }

    if (departmentLevelFilter) {
      if (departmentLevelFilter === 'root') {
        filtered = filtered.filter(dept => !dept.manager_id);
      } else if (departmentLevelFilter === 'sub') {
        filtered = filtered.filter(dept => dept.manager_id);
      }
    }

    setFilteredDepartments(filtered);
  };

  const filterPositions = () => {
    let filtered = [...positions];

    if (positionSearch.trim()) {
      const searchTerm = positionSearch.toLowerCase().trim();
      filtered = filtered.filter(pos => 
        pos.position_name.toLowerCase().includes(searchTerm) ||
        pos.id.toString().includes(searchTerm)
      );
    }

    if (positionStatusFilter) {
      if (positionStatusFilter === 'active') {
        filtered = filtered.filter(pos => pos.is_active);
      } else if (positionStatusFilter === 'inactive') {
        filtered = filtered.filter(pos => !pos.is_active);
      }
    }

    if (positionLevelFilter) {
      if (positionLevelFilter === 'junior') {
        filtered = filtered.filter(pos => pos.level <= 2);
      } else if (positionLevelFilter === 'senior') {
        filtered = filtered.filter(pos => pos.level >= 3);
      }
    }

    setFilteredPositions(filtered);
  };

  // Load all data on component mount
  useEffect(() => {
    const loadAllData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        await Promise.all([
          loadDepartments(),
          loadPositions(),
          loadStats(),
          loadEmployees()
        ]);
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Có lỗi xảy ra khi tải dữ liệu');
      } finally {
        setIsLoading(false);
      }
    };

    loadAllData();
  }, []);

  // Initialize filtered data when departments/positions change
  useEffect(() => {
    setFilteredDepartments(departments);
  }, [departments]);

  useEffect(() => {
    setFilteredPositions(positions);
  }, [positions]);

  // Trigger filtering when search/filter values change
  useEffect(() => {
    filterDepartments();
  }, [departmentSearch, departmentStatusFilter, departmentLevelFilter, departments]);

  useEffect(() => {
    filterPositions();
  }, [positionSearch, positionStatusFilter, positionLevelFilter, positions]);

  // Department columns for table
  const departmentColumns = [
    {
      title: 'Tên phòng ban',
      dataIndex: 'department_name',
      key: 'department_name',
      render: (text: string, record: APIDepartment) => (
        <Space>
          <Avatar icon={<BankOutlined />} />
          <div>
            <Typography.Text strong>{text}</Typography.Text>
            <br />
            <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
              {record.description || 'Chưa có mô tả'}
            </Typography.Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Quản lý',
      dataIndex: 'manager_id',
      key: 'manager_id',
      render: (manager: any) => (
        <Space>
          <UserOutlined />
          <span>{manager ? (manager.full_name || manager.username) : 'Chưa có quản lý'}</span>
        </Space>
      ),
    },
    {
      title: 'Nhân viên',
      key: 'employee_count',
      render: (_: any, record: APIDepartment) => (
        <Badge count={getEmployeeCountByDepartment(record.id)} showZero color="#52c41a">
          <UserOutlined />
        </Badge>
      ),
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
      key: 'actions',
      render: (_: any, record: APIDepartment) => (
        <Space>
          <Tooltip title="Xem nhân viên">
            <Button 
              type="link" 
              icon={<TeamOutlined />}
              onClick={() => loadDepartmentEmployees(record.id)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button type="link" icon={<EditOutlined />} />
          </Tooltip>
          <Tooltip title="Xóa">
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa phòng ban này?"
              onConfirm={() => message.info('Chức năng xóa đang được phát triển')}
            >
              <Button 
                type="link" 
                danger 
                icon={<DeleteOutlined />}
                disabled={getEmployeeCountByDepartment(record.id) > 0}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Position columns for table
  const positionColumns = [
    {
      title: 'Tên vị trí',
      dataIndex: 'position_name',
      key: 'position_name',
      render: (text: string) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <Typography.Text strong>{text}</Typography.Text>
        </Space>
      ),
    },
    {
      title: 'Cấp bậc',
      dataIndex: 'level',
      key: 'level',
      render: (level: number) => (
        <Tag color="blue">{getLevelName(level)}</Tag>
      ),
    },
    {
      title: 'Số nhân viên',
      key: 'employee_count',
      render: (_: any, record: APIPosition) => (
        <Badge count={getEmployeeCountByPosition(record.id)} showZero color="#52c41a">
          <UserOutlined />
        </Badge>
      ),
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
      key: 'actions',
      render: (_: any, record: APIPosition) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button type="link" icon={<EditOutlined />} />
          </Tooltip>
          <Tooltip title="Xóa">
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa vị trí này?"
              onConfirm={() => message.info('Chức năng xóa đang được phát triển')}
            >
              <Button 
                type="link" 
                danger 
                icon={<DeleteOutlined />}
                disabled={getEmployeeCountByPosition(record.id) > 0}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="Lỗi tải dữ liệu"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" onClick={() => window.location.reload()}>
              <ReloadOutlined /> Thử lại
            </Button>
          }
        />
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
              <Typography.Title level={2} style={{ margin: 0 }}>
                <BankOutlined /> Quản lý phòng ban và vị trí
              </Typography.Title>
              <Typography.Text type="secondary">
                Dashboard / Phòng ban và vị trí
              </Typography.Text>
            </Space>
          </Col>
          <Col>
            <Space>
              <Button 
                type="primary" 
                icon={<SyncOutlined />}
                onClick={() => loadDepartments()}
                title="Làm mới dữ liệu"
              >
                Làm mới
              </Button>
              <Button href="/admin/dashboard">
                Quay lại
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Stats Grid */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Phòng ban hoạt động"
              value={stats.totalDepartments}
              prefix={<BankOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Vị trí công việc"
              value={stats.totalPositions}
              prefix={<UserOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Nhân viên đang làm"
              value={stats.totalEmployees}
              prefix={<UserOutlined style={{ color: '#faad14' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Dự án đang thực hiện"
              value={stats.totalProjects}
              prefix={<ProjectOutlined style={{ color: '#722ed1' }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* Tabs */}
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'departments',
              label: (
                <span>
                  <BankOutlined />
                  Phòng ban
                </span>
              ),
              children: (
                <div>
                  <Row justify="space-between" align="middle" style={{ marginBottom: '16px' }}>
                    <Col>
                      <Space>
                        <Input.Search
                          placeholder="Tìm kiếm phòng ban..."
                          value={departmentSearch}
                          onChange={(e) => setDepartmentSearch(e.target.value)}
                          style={{ width: 300 }}
                        />
                        <Select
                          placeholder="Trạng thái"
                          value={departmentStatusFilter}
                          onChange={setDepartmentStatusFilter}
                          style={{ width: 150 }}
                        >
                          <Select.Option value="">Tất cả trạng thái</Select.Option>
                          <Select.Option value="active">Đang hoạt động</Select.Option>
                          <Select.Option value="inactive">Không hoạt động</Select.Option>
                        </Select>
                        <Select
                          placeholder="Cấp độ"
                          value={departmentLevelFilter}
                          onChange={setDepartmentLevelFilter}
                          style={{ width: 150 }}
                        >
                          <Select.Option value="">Tất cả cấp độ</Select.Option>
                          <Select.Option value="root">Phòng ban gốc</Select.Option>
                          <Select.Option value="sub">Phòng ban con</Select.Option>
                        </Select>
                      </Space>
                    </Col>
                    <Col>
                      <Button type="primary" icon={<PlusOutlined />}>
                        Thêm phòng ban
                      </Button>
                    </Col>
                  </Row>
                  <Table
                    columns={departmentColumns}
                    dataSource={filteredDepartments}
                    rowKey="id"
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total, range) => 
                        `${range[0]}-${range[1]} của ${total} phòng ban`,
                    }}
                  />
                </div>
              ),
            },
            {
              key: 'positions',
              label: (
                <span>
                  <UserOutlined />
                  Vị trí công việc
                </span>
              ),
              children: (
                <div>
                  <Row justify="space-between" align="middle" style={{ marginBottom: '16px' }}>
                    <Col>
                      <Space>
                        <Input.Search
                          placeholder="Tìm kiếm vị trí..."
                          value={positionSearch}
                          onChange={(e) => setPositionSearch(e.target.value)}
                          style={{ width: 300 }}
                        />
                        <Select
                          placeholder="Trạng thái"
                          value={positionStatusFilter}
                          onChange={setPositionStatusFilter}
                          style={{ width: 150 }}
                        >
                          <Select.Option value="">Tất cả trạng thái</Select.Option>
                          <Select.Option value="active">Đang hoạt động</Select.Option>
                          <Select.Option value="inactive">Không hoạt động</Select.Option>
                        </Select>
                        <Select
                          placeholder="Cấp bậc"
                          value={positionLevelFilter}
                          onChange={setPositionLevelFilter}
                          style={{ width: 150 }}
                        >
                          <Select.Option value="">Tất cả cấp bậc</Select.Option>
                          <Select.Option value="junior">Cấp thấp (1-2)</Select.Option>
                          <Select.Option value="senior">Cấp cao (3-5)</Select.Option>
                        </Select>
                      </Space>
                    </Col>
                    <Col>
                      <Button type="primary" icon={<PlusOutlined />}>
                        Thêm vị trí
                      </Button>
                    </Col>
                  </Row>
                  <Table
                    columns={positionColumns}
                    dataSource={filteredPositions}
                    rowKey="id"
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total, range) => 
                        `${range[0]}-${range[1]} của ${total} vị trí`,
                    }}
                  />
                </div>
              ),
            },
          ]}
        />
      </Card>

      {/* Department Employees Drawer */}
      <Drawer
        title={
          <Space>
            <TeamOutlined />
            Nhân viên - {selectedDepartmentForEmployees ? getDepartmentName(selectedDepartmentForEmployees) : ''}
          </Space>
        }
        placement="right"
        onClose={() => {
          setSelectedDepartmentForEmployees(null);
          setSelectedDepartmentEmployees([]);
        }}
        open={!!selectedDepartmentForEmployees}
        width={600}
        extra={
          <Button 
            icon={<CloseOutlined />}
            onClick={() => {
              setSelectedDepartmentForEmployees(null);
              setSelectedDepartmentEmployees([]);
            }}
          />
        }
      >
        {isLoadingEmployees ? (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <Spin size="large" />
            <div style={{ marginTop: '16px' }}>Đang tải danh sách nhân viên...</div>
          </div>
        ) : (
          <List
            dataSource={selectedDepartmentEmployees}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Không có nhân viên nào trong phòng ban này"
                />
              ),
            }}
            renderItem={(employee) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar icon={<UserOutlined />} />}
                  title={
                    <Space>
                      <Typography.Text strong>{employee.full_name}</Typography.Text>
                      <Tag color={employee.is_active ? 'green' : 'red'}>
                        {employee.is_active ? 'Hoạt động' : 'Không hoạt động'}
                      </Tag>
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size={4}>
                      <Typography.Text type="secondary">@{employee.username}</Typography.Text>
                      <Typography.Text type="secondary">{employee.email}</Typography.Text>
                      {employee.phone && (
                        <Typography.Text type="secondary">{employee.phone}</Typography.Text>
                      )}
                      {employee.position && (
                        <Tag icon={<UserOutlined />}>
                          {employee.position.name} (Cấp {employee.position.level})
                        </Tag>
                      )}
                      {employee.role && (
                        <Tag icon={<SettingOutlined />}>
                          {employee.role.name}
                        </Tag>
                      )}
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Drawer>
    </div>
  );
};

export default DepartmentPositionPage;
