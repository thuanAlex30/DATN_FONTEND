import React, { useState, useEffect } from 'react';
import './DepartmentPosition.css';
import departmentService from '../../../services/departmentService';
import positionService from '../../../services/positionService';
import userService from '../../../services/userService';
import type { 
  Employee, 
  Project, 
  DepartmentStats
} from './types';
import type { Department as APIDepartment } from '../../../types/department';
import type { Position as APIPosition } from '../../../types/position';

const DepartmentPositionPage: React.FC = () => {
  // State management
  const [activeTab, setActiveTab] = useState<string>('departments');
  const [notification] = useState<{message: string, type: string} | null>(null);
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

  // Mock data for employees, projects (will be replaced with API calls later)
  const [employees] = useState<Employee[]>([]);
  const [projects] = useState<Project[]>([]);

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
      console.log('Departments data:', response.data);
      
      // Extract departments from response.data.departments (backend returns { departments: [...], pagination: {...} })
      const departmentsData = response.data?.departments || [];
      console.log('Extracted departments:', departmentsData);
      console.log('First department structure:', departmentsData[0]);
      
      setDepartments(departmentsData);
      setFilteredDepartments(departmentsData);
      
      // Load employee counts for all departments
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
      // Set empty counts if error occurs
      setDepartmentEmployeeCounts({});
    }
  };

  const loadPositions = async () => {
    try {
      const response = await positionService.getAll({});
      console.log('Positions API response:', response);
      console.log('Positions data:', response.data);
      
      // Extract positions from response.data.data.positions
      const positionsData = (response.data as any)?.data?.positions || [];
      console.log('Extracted positions:', positionsData);
      
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
        totalEmployees: userStats.data?.totalUsers || 0,
        totalProjects: 0 // Will be implemented when project API is available
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // Load employees for a specific department
  const loadDepartmentEmployees = async (departmentId: string) => {
    setIsLoadingEmployees(true);
    setError('');
    
    try {
      console.log('Loading employees for department:', departmentId);
      console.log('Token in localStorage:', localStorage.getItem('accessToken'));
      
      const response = await departmentService.getDepartmentEmployees(departmentId, {
        is_active: true,
        sort_by: 'full_name',
        sort_order: 'asc'
      });
      
      console.log('Department employees response:', response);
      setSelectedDepartmentEmployees(response.data.employees);
      setSelectedDepartmentForEmployees(departmentId);
    } catch (error: any) {
      console.error('Error loading department employees:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
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
    // First try to get from the position data itself (if it has employees_count)
    const position = positions.find(p => p.id === positionId);
    if (position && (position as any).employees_count !== undefined) {
      return (position as any).employees_count;
    }
    
    // Fallback to mock data calculation
    return employees.filter(e => e.position_id === parseInt(positionId) && e.is_active).length;
  };

  const getProjectCountByDepartment = (departmentId: string): number => {
    const deptEmployees = employees.filter(e => e.department_id === parseInt(departmentId) && e.is_active);
    const deptUserIds = deptEmployees.map(e => e.user_id);
    return projects.filter(p => deptUserIds.includes(p.leader_id) && p.status === "Đang thực hiện").length;
  };

  const getDepartmentHierarchyPath = (departmentId: string): string => {
    // For now, return department name since API doesn't have parent_department_id
    const dept = departments.find(d => d.id === departmentId);
    return dept ? dept.department_name : 'Không xác định';
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

    // Search filter
    if (departmentSearch.trim()) {
      const searchTerm = departmentSearch.toLowerCase().trim();
      filtered = filtered.filter(dept => 
        dept.department_name.toLowerCase().includes(searchTerm) ||
        dept.description?.toLowerCase().includes(searchTerm) ||
        dept.id.toString().includes(searchTerm)
      );
    }

    // Status filter
    if (departmentStatusFilter) {
      if (departmentStatusFilter === 'active') {
        filtered = filtered.filter(dept => dept.is_active);
      } else if (departmentStatusFilter === 'inactive') {
        filtered = filtered.filter(dept => !dept.is_active);
      }
    }

    // Level filter (for departments, we'll use manager_id presence as level indicator)
    if (departmentLevelFilter) {
      if (departmentLevelFilter === 'root') {
        // Root departments are those without manager (top level)
        filtered = filtered.filter(dept => !dept.manager_id);
      } else if (departmentLevelFilter === 'sub') {
        // Sub departments are those with manager
        filtered = filtered.filter(dept => dept.manager_id);
      }
    }

    setFilteredDepartments(filtered);
  };

  const filterPositions = () => {
    let filtered = [...positions];

    // Search filter
    if (positionSearch.trim()) {
      const searchTerm = positionSearch.toLowerCase().trim();
      filtered = filtered.filter(pos => 
        pos.position_name.toLowerCase().includes(searchTerm) ||
        pos.id.toString().includes(searchTerm)
      );
    }

    // Status filter
    if (positionStatusFilter) {
      if (positionStatusFilter === 'active') {
        filtered = filtered.filter(pos => pos.is_active);
      } else if (positionStatusFilter === 'inactive') {
        filtered = filtered.filter(pos => !pos.is_active);
      }
    }

    // Level filter
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
          loadStats()
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

  // Modal management
  const openModal = (modalId: string) => {
    console.log('Opening modal:', modalId);
  };

  // Tab switching
  const switchTab = (tabName: string) => {
    setActiveTab(tabName);
  };

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

  if (isLoading) {
    return (
      <div className="department-position-container">
        <div className="loading-container">
          <div className="loading-spinner">
            <i className="fas fa-spinner fa-spin"></i>
          </div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="department-position-container">
        <div className="error-container">
          <div className="error-icon">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <h3>Lỗi tải dữ liệu</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            <i className="fas fa-refresh"></i> Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="department-position-container">
      {/* Header */}
      <div className="header">
        <div>
          <h1><i className="fas fa-sitemap"></i> Quản lý phòng ban và vị trí</h1>
          <div className="breadcrumb">
            <a href="/admin/dashboard">Dashboard</a> / Phòng ban và vị trí
          </div>
        </div>
        <a href="/admin/dashboard" className="btn btn-secondary">
          <i className="fas fa-arrow-left"></i> Quay lại
        </a>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{background: 'linear-gradient(135deg, #3498db, #2980b9)'}}>
            <i className="fas fa-building"></i>
          </div>
          <div className="stat-value">{stats.totalDepartments}</div>
          <div className="stat-label">Phòng ban hoạt động</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{background: 'linear-gradient(135deg, #2ecc71, #27ae60)'}}>
            <i className="fas fa-user-tie"></i>
          </div>
          <div className="stat-value">{stats.totalPositions}</div>
          <div className="stat-label">Vị trí công việc</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{background: 'linear-gradient(135deg, #f39c12, #e67e22)'}}>
            <i className="fas fa-users"></i>
          </div>
          <div className="stat-value">{stats.totalEmployees}</div>
          <div className="stat-label">Nhân viên đang làm</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{background: 'linear-gradient(135deg, #9b59b6, #8e44ad)'}}>
            <i className="fas fa-project-diagram"></i>
          </div>
          <div className="stat-value">{stats.totalProjects}</div>
          <div className="stat-label">Dự án đang thực hiện</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <div className="tab-nav">
          <button 
            className={`tab-button ${activeTab === 'departments' ? 'active' : ''}`} 
            onClick={() => switchTab('departments')}
          >
            <i className="fas fa-building"></i> Phòng ban
          </button>
          <button 
            className={`tab-button ${activeTab === 'positions' ? 'active' : ''}`} 
            onClick={() => switchTab('positions')}
          >
            <i className="fas fa-user-tie"></i> Vị trí công việc
          </button>
          <button 
            className={`tab-button ${activeTab === 'hierarchy' ? 'active' : ''}`} 
            onClick={() => switchTab('hierarchy')}
          >
            <i className="fas fa-sitemap"></i> Cơ cấu tổ chức
          </button>
          <button 
            className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`} 
            onClick={() => switchTab('analytics')}
          >
            <i className="fas fa-chart-bar"></i> Phân tích
          </button>
        </div>

        {/* Tab content will be rendered here */}
        {activeTab === 'departments' && (
          <div className="tab-content active">
            <div className="controls">
              <div className="search-filters">
                <div className="search-box">
                  <i className="fas fa-search"></i>
                  <input 
                    type="text" 
                    placeholder="Tìm kiếm phòng ban..." 
                    value={departmentSearch}
                    onChange={(e) => setDepartmentSearch(e.target.value)}
                  />
                </div>
                
                <select 
                  className="filter-select"
                  value={departmentStatusFilter}
                  onChange={(e) => setDepartmentStatusFilter(e.target.value)}
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="active">Đang hoạt động</option>
                  <option value="inactive">Không hoạt động</option>
                </select>
                
                <select 
                  className="filter-select"
                  value={departmentLevelFilter}
                  onChange={(e) => setDepartmentLevelFilter(e.target.value)}
                >
                  <option value="">Tất cả cấp độ</option>
                  <option value="root">Phòng ban gốc</option>
                  <option value="sub">Phòng ban con</option>
                </select>
              </div>
              
              <button className="btn btn-primary" onClick={() => openModal('addDepartmentModal')}>
                <i className="fas fa-plus"></i> Thêm phòng ban
              </button>
            </div>

            <div className="data-grid">
              {(Array.isArray(filteredDepartments) ? filteredDepartments : []).map(dept => {
                const employeeCount = getEmployeeCountByDepartment(dept.id);
                const projectCount = getProjectCountByDepartment(dept.id);
                const managerName = dept.manager_id ? 
                  (dept.manager_id.full_name || dept.manager_id.username) : 
                  'Chưa có quản lý';
                const hierarchyPath = getDepartmentHierarchyPath(dept.id);
                
                return (
                  <div key={dept.id} className="card">
                    <div className="card-header">
                      <div className="card-icon">
                        <i className="fas fa-building"></i>
                      </div>
                      <div className="card-title">{dept.department_name}</div>
                      <div className="department-hierarchy-path">{hierarchyPath}</div>
                      <div className="card-description">{dept.description || 'Chưa có mô tả'}</div>
                    </div>
                    <div className="card-body">
                      <div className="info-grid">
                        <div className="info-item">
                          <i className="fas fa-user-crown"></i>
                          <span>Trưởng phòng: {managerName}</span>
                        </div>
                        <div className="info-item">
                          <i className="fas fa-users"></i>
                          <span>Nhân viên: {employeeCount}</span>
                        </div>
                        <div className="info-item">
                          <i className="fas fa-project-diagram"></i>
                          <span>Dự án: {projectCount}</span>
                        </div>
                        <div className="info-item">
                          <i className={`fas fa-circle ${dept.is_active ? 'text-success' : 'text-danger'}`}></i>
                          <span>{dept.is_active ? 'Đang hoạt động' : 'Không hoạt động'}</span>
                        </div>
                      </div>
                      
                      <div className="employee-count">
                        <div className="count-number">{employeeCount}</div>
                        <div className="count-label">Nhân viên hoạt động</div>
                      </div>
                      
                      <div className="card-actions">
                        <button className="btn btn-sm btn-primary">
                          <i className="fas fa-edit"></i> Sửa
                        </button>
                        <button 
                          className="btn btn-sm btn-info"
                          onClick={() => {
                            console.log('Button clicked for department:', dept.id);
                            console.log('Department object:', dept);
                            loadDepartmentEmployees(dept.id);
                          }}
                        >
                          <i className="fas fa-users"></i> Nhân viên
                        </button>
                        <button className="btn btn-sm btn-warning">
                          <i className="fas fa-project-diagram"></i> Dự án
                        </button>
                        <button 
                          className="btn btn-sm btn-danger" 
                          disabled={employeeCount > 0}
                          title={employeeCount > 0 ? "Không thể xóa phòng ban có nhân viên" : ""}
                        >
                          <i className="fas fa-trash"></i> Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Department Employees Modal/Overlay */}
        {selectedDepartmentForEmployees && (
          <div className="employees-overlay">
            <div className="employees-modal">
              <div className="modal-header">
                <h3>
                  <i className="fas fa-users"></i>
                  Nhân viên - {getDepartmentName(selectedDepartmentForEmployees)}
                </h3>
                <button 
                  className="btn btn-sm btn-secondary"
                  onClick={() => {
                    setSelectedDepartmentForEmployees(null);
                    setSelectedDepartmentEmployees([]);
                  }}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              
              <div className="modal-content">
                {isLoadingEmployees ? (
                  <div className="loading-spinner">
                    <i className="fas fa-spinner fa-spin"></i>
                    <span>Đang tải danh sách nhân viên...</span>
                  </div>
                ) : (
                  <div className="employees-list">
                    {selectedDepartmentEmployees.length === 0 ? (
                      <div className="empty-state">
                        <i className="fas fa-user-slash"></i>
                        <p>Không có nhân viên nào trong phòng ban này</p>
                      </div>
                    ) : (
                      selectedDepartmentEmployees.map(employee => (
                        <div key={employee.id} className="employee-card">
                          <div className="employee-avatar">
                            <i className="fas fa-user"></i>
                          </div>
                          <div className="employee-info">
                            <div className="employee-name">{employee.full_name}</div>
                            <div className="employee-username">@{employee.username}</div>
                            <div className="employee-details">
                              <span className="employee-email">
                                <i className="fas fa-envelope"></i>
                                {employee.email}
                              </span>
                              {employee.phone && (
                                <span className="employee-phone">
                                  <i className="fas fa-phone"></i>
                                  {employee.phone}
                                </span>
                              )}
                            </div>
                            <div className="employee-position">
                              {employee.position ? (
                                <span className="position-badge">
                                  <i className="fas fa-briefcase"></i>
                                  {employee.position.name} (Cấp {employee.position.level})
                                </span>
                              ) : (
                                <span className="no-position">Chưa có vị trí</span>
                              )}
                            </div>
                            <div className="employee-role">
                              {employee.role ? (
                                <span className="role-badge">
                                  <i className="fas fa-user-tag"></i>
                                  {employee.role.name}
                                </span>
                              ) : (
                                <span className="no-role">Chưa có vai trò</span>
                              )}
                            </div>
                          </div>
                          <div className="employee-status">
                            <span className={`status-badge ${employee.is_active ? 'active' : 'inactive'}`}>
                              <i className={`fas fa-circle ${employee.is_active ? 'text-success' : 'text-danger'}`}></i>
                              {employee.is_active ? 'Hoạt động' : 'Không hoạt động'}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'positions' && (
          <div className="tab-content active">
            <div className="controls">
              <div className="search-filters">
                <div className="search-box">
                  <i className="fas fa-search"></i>
                  <input 
                    type="text" 
                    placeholder="Tìm kiếm vị trí..." 
                    value={positionSearch}
                    onChange={(e) => setPositionSearch(e.target.value)}
                  />
                </div>
                
                <select 
                  className="filter-select"
                  value={positionStatusFilter}
                  onChange={(e) => setPositionStatusFilter(e.target.value)}
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="active">Đang hoạt động</option>
                  <option value="inactive">Không hoạt động</option>
                </select>
                
                <select 
                  className="filter-select"
                  value={positionLevelFilter}
                  onChange={(e) => setPositionLevelFilter(e.target.value)}
                >
                  <option value="">Tất cả cấp bậc</option>
                  <option value="junior">Cấp thấp (1-2)</option>
                  <option value="senior">Cấp cao (3-5)</option>
                </select>
              </div>
              
              <button className="btn btn-primary" onClick={() => openModal('addPositionModal')}>
                <i className="fas fa-plus"></i> Thêm vị trí
              </button>
            </div>

            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>Tên vị trí</th>
                    <th>Cấp bậc</th>
                    <th>Số nhân viên</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {(Array.isArray(filteredPositions) ? filteredPositions : []).map(pos => {
                    const employeeCount = getEmployeeCountByPosition(pos.id);
                    const levelName = getLevelName(pos.level);
                    
                    return (
                      <tr key={pos.id}>
                        <td>
                          <strong>{pos.position_name}</strong>
                        </td>
                        <td>
                          <span className="level-badge">{levelName}</span>
                        </td>
                        <td>
                          <strong style={{color: '#2ecc71'}}>{employeeCount}</strong>
                          <br/><small>nhân viên</small>
                        </td>
                        <td>
                          <span className={`status-badge ${pos.is_active ? 'status-active' : 'status-inactive'}`}>
                            {pos.is_active ? 'Đang hoạt động' : 'Không hoạt động'}
                          </span>
                        </td>
                        <td>
                          <button className="btn btn-sm btn-primary" title="Chỉnh sửa">
                            <i className="fas fa-edit"></i>
                          </button>
                          <button className="btn btn-sm btn-info" title="Xem nhân viên">
                            <i className="fas fa-users"></i>
                          </button>
                          <button 
                            className="btn btn-sm btn-danger" 
                            disabled={employeeCount > 0}
                            title={employeeCount > 0 ? "Không thể xóa vị trí có nhân viên" : "Xóa vị trí"}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'hierarchy' && (
          <div className="tab-content active">
            <div className="hierarchy-view">
              <h3 style={{marginBottom: '1.5rem', color: '#2c3e50'}}>
                <i className="fas fa-sitemap"></i> Cơ cấu tổ chức công ty
              </h3>
              <div className="tree-view">
                {/* Organization chart will be rendered here */}
                <div className="alert alert-info">
                  Cơ cấu tổ chức sẽ được hiển thị ở đây
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="tab-content active">
            <div className="stats-grid">
              <div className="stat-card">
                <h3 style={{color: '#2c3e50', marginBottom: '1rem'}}>
                  <i className="fas fa-chart-pie"></i> Phân bố nhân viên theo phòng ban
                </h3>
                <div className="alert alert-info">
                  Biểu đồ phân bố nhân viên sẽ được hiển thị ở đây
                </div>
              </div>
              
              <div className="stat-card">
                <h3 style={{color: '#2c3e50', marginBottom: '1rem'}}>
                  <i className="fas fa-chart-bar"></i> Phân bố theo vị trí
                </h3>
                <div className="alert alert-info">
                  Biểu đồ phân bố vị trí sẽ được hiển thị ở đây
                </div>
              </div>
            </div>
            
            <div className="hierarchy-view">
              <h3 style={{marginBottom: '1.5rem', color: '#2c3e50'}}>
                <i className="fas fa-clipboard-list"></i> Báo cáo chi tiết
              </h3>
              <div className="alert alert-info">
                Báo cáo chi tiết sẽ được hiển thị ở đây
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Notification */}
      {notification && (
        <div className={`notification ${notification.type} show`}>
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default DepartmentPositionPage;
