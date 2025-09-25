import React, { useState, useEffect } from 'react';
import './DepartmentPosition.css';
import departmentService from '../../../services/departmentService';
import positionService from '../../../services/positionService';
import userService from '../../../services/userService';
import type { 
  Employee, 
  Project, 
  DepartmentStats,
  OrganizationChartProps,
  HierarchyTreeProps,
  HierarchyListProps,
  AnalyticsDashboardProps,
  AnalyticsData,
  DepartmentAnalytics,
  EmployeeDistributionData,
  PositionAnalytics,
  OverallStats
} from './types';
import type { Department as APIDepartment } from '../../../types/department';
import type { Position as APIPosition } from '../../../types/position';

// Organization Chart Component
const OrganizationChart: React.FC<OrganizationChartProps> = ({ 
  departments, 
  departmentEmployeeCounts 
}) => {
  const buildHierarchy = () => {
    // Group departments by manager level
    const departmentsByLevel = departments.reduce((acc, dept) => {
      const level = dept.manager_id ? 2 : 1; // Root level = 1, Managed level = 2
      if (!acc[level]) acc[level] = [];
      acc[level].push(dept);
      return acc;
    }, {} as Record<number, APIDepartment[]>);

    return departmentsByLevel;
  };

  const hierarchy = buildHierarchy();

  return (
    <div className="organization-chart">
      <div className="chart-container">
        {Object.entries(hierarchy).map(([level, depts]) => (
          <div key={level} className={`chart-level level-${level}`}>
            {(depts as APIDepartment[]).map((dept: APIDepartment) => {
              const employeeCount = departmentEmployeeCounts[dept.id] || 0;
              const managerName = dept.manager_id ? 
                (dept.manager_id.full_name || dept.manager_id.username) : 
                'Chưa có quản lý';
              
              return (
                <div key={dept.id} className="chart-node department-node">
                  <div className="node-header">
                    <div className="node-icon">
                      <i className="fas fa-building"></i>
                    </div>
                    <div className="node-title">{dept.department_name}</div>
                  </div>
                  <div className="node-body">
                    <div className="node-manager">
                      <i className="fas fa-user-crown"></i>
                      <span>{managerName}</span>
                    </div>
                    <div className="node-employees">
                      <i className="fas fa-users"></i>
                      <span>{employeeCount} nhân viên</span>
                    </div>
                    <div className="node-status">
                      <i className={`fas fa-circle ${dept.is_active ? 'text-success' : 'text-danger'}`}></i>
                      <span>{dept.is_active ? 'Hoạt động' : 'Không hoạt động'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

// Hierarchy Tree Component
const HierarchyTree: React.FC<HierarchyTreeProps> = ({ 
  departments, 
  positions, 
  departmentEmployeeCounts 
}) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const buildTreeStructure = () => {
    // Create a tree structure based on manager relationships
    const rootDepartments = departments.filter(dept => !dept.manager_id);
    const managedDepartments = departments.filter(dept => dept.manager_id);
    
    return {
      root: rootDepartments,
      managed: managedDepartments
    };
  };

  const treeStructure = buildTreeStructure();

  return (
    <div className="hierarchy-tree">
      <div className="tree-container">
        {/* Root Level */}
        <div className="tree-level root-level">
          <div className="level-label">
            <i className="fas fa-crown"></i>
            <span>Cấp điều hành</span>
          </div>
          <div className="tree-nodes">
            {treeStructure.root.map(dept => {
              const employeeCount = departmentEmployeeCounts[dept.id] || 0;
              const isExpanded = expandedNodes.has(dept.id);
              
              return (
                <div key={dept.id} className="tree-node root-node">
                  <div className="node-content" onClick={() => toggleNode(dept.id)}>
                    <div className="node-icon">
                      <i className="fas fa-building"></i>
                    </div>
                    <div className="node-info">
                      <div className="node-name">{dept.department_name}</div>
                      <div className="node-details">
                        <span className="employee-count">{employeeCount} nhân viên</span>
                        <span className={`status ${dept.is_active ? 'active' : 'inactive'}`}>
                          {dept.is_active ? 'Hoạt động' : 'Không hoạt động'}
                        </span>
                      </div>
                    </div>
                    <div className="expand-icon">
                      <i className={`fas fa-chevron-${isExpanded ? 'down' : 'right'}`}></i>
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="node-children">
                      {/* Show positions in this department */}
                      {positions.filter(pos => pos.is_active).map(pos => (
                        <div key={pos.id} className="tree-node child-node position-node">
                          <div className="node-content">
                            <div className="node-icon">
                              <i className="fas fa-user-tie"></i>
                            </div>
                            <div className="node-info">
                              <div className="node-name">{pos.position_name}</div>
                              <div className="node-details">
                                <span className="level">Cấp {pos.level}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Managed Level */}
        <div className="tree-level managed-level">
          <div className="level-label">
            <i className="fas fa-users"></i>
            <span>Cấp quản lý</span>
          </div>
          <div className="tree-nodes">
            {treeStructure.managed.map(dept => {
              const employeeCount = departmentEmployeeCounts[dept.id] || 0;
              const managerName = dept.manager_id ? 
                (dept.manager_id.full_name || dept.manager_id.username) : 
                'Chưa có quản lý';
              const isExpanded = expandedNodes.has(dept.id);
              
              return (
                <div key={dept.id} className="tree-node managed-node">
                  <div className="node-content" onClick={() => toggleNode(dept.id)}>
                    <div className="node-icon">
                      <i className="fas fa-building"></i>
                    </div>
                    <div className="node-info">
                      <div className="node-name">{dept.department_name}</div>
                      <div className="node-details">
                        <span className="manager">QL: {managerName}</span>
                        <span className="employee-count">{employeeCount} nhân viên</span>
                        <span className={`status ${dept.is_active ? 'active' : 'inactive'}`}>
                          {dept.is_active ? 'Hoạt động' : 'Không hoạt động'}
                        </span>
                      </div>
                    </div>
                    <div className="expand-icon">
                      <i className={`fas fa-chevron-${isExpanded ? 'down' : 'right'}`}></i>
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="node-children">
                      {/* Show positions in this department */}
                      {positions.filter(pos => pos.is_active).map(pos => (
                        <div key={pos.id} className="tree-node child-node position-node">
                          <div className="node-content">
                            <div className="node-icon">
                              <i className="fas fa-user-tie"></i>
                            </div>
                            <div className="node-info">
                              <div className="node-name">{pos.position_name}</div>
                              <div className="node-details">
                                <span className="level">Cấp {pos.level}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// Hierarchy List Component
const HierarchyList: React.FC<HierarchyListProps> = ({ 
  departments, 
  positions, 
  departmentEmployeeCounts 
}) => {
  const groupedData = departments.reduce((acc, dept) => {
    const level = dept.manager_id ? 'managed' : 'root';
    if (!acc[level]) acc[level] = [];
    acc[level].push(dept);
    return acc;
  }, {} as Record<string, APIDepartment[]>);

  return (
    <div className="hierarchy-list">
      <div className="list-container">
        {/* Root Departments */}
        <div className="list-section">
          <div className="section-header">
            <i className="fas fa-crown"></i>
            <h4>Cấp điều hành ({groupedData.root?.length || 0})</h4>
          </div>
          <div className="list-items">
            {groupedData.root?.map((dept: APIDepartment) => {
              const employeeCount = departmentEmployeeCounts[dept.id] || 0;
              return (
                <div key={dept.id} className="list-item root-item">
                  <div className="item-icon">
                    <i className="fas fa-building"></i>
                  </div>
                  <div className="item-content">
                    <div className="item-name">{dept.department_name}</div>
                    <div className="item-description">{dept.description || 'Chưa có mô tả'}</div>
                    <div className="item-stats">
                      <span className="stat">
                        <i className="fas fa-users"></i>
                        {employeeCount} nhân viên
                      </span>
                      <span className={`status ${dept.is_active ? 'active' : 'inactive'}`}>
                        <i className={`fas fa-circle ${dept.is_active ? 'text-success' : 'text-danger'}`}></i>
                        {dept.is_active ? 'Hoạt động' : 'Không hoạt động'}
                      </span>
                    </div>
                  </div>
                  <div className="item-actions">
                    <button className="btn btn-sm btn-primary">
                      <i className="fas fa-eye"></i>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Managed Departments */}
        <div className="list-section">
          <div className="section-header">
            <i className="fas fa-users"></i>
            <h4>Cấp quản lý ({groupedData.managed?.length || 0})</h4>
          </div>
          <div className="list-items">
            {groupedData.managed?.map((dept: APIDepartment) => {
              const employeeCount = departmentEmployeeCounts[dept.id] || 0;
              const managerName = dept.manager_id ? 
                (dept.manager_id.full_name || dept.manager_id.username) : 
                'Chưa có quản lý';
              
              return (
                <div key={dept.id} className="list-item managed-item">
                  <div className="item-icon">
                    <i className="fas fa-building"></i>
                  </div>
                  <div className="item-content">
                    <div className="item-name">{dept.department_name}</div>
                    <div className="item-description">{dept.description || 'Chưa có mô tả'}</div>
                    <div className="item-stats">
                      <span className="stat">
                        <i className="fas fa-user-crown"></i>
                        QL: {managerName}
                      </span>
                      <span className="stat">
                        <i className="fas fa-users"></i>
                        {employeeCount} nhân viên
                      </span>
                      <span className={`status ${dept.is_active ? 'active' : 'inactive'}`}>
                        <i className={`fas fa-circle ${dept.is_active ? 'text-success' : 'text-danger'}`}></i>
                        {dept.is_active ? 'Hoạt động' : 'Không hoạt động'}
                      </span>
                    </div>
                  </div>
                  <div className="item-actions">
                    <button className="btn btn-sm btn-primary">
                      <i className="fas fa-eye"></i>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Positions Summary */}
        <div className="list-section">
          <div className="section-header">
            <i className="fas fa-user-tie"></i>
            <h4>Tổng quan vị trí ({positions.length})</h4>
          </div>
          <div className="positions-summary">
            {positions.filter(pos => pos.is_active).map(pos => (
              <div key={pos.id} className="position-item">
                <div className="position-icon">
                  <i className="fas fa-user-tie"></i>
                </div>
                <div className="position-info">
                  <div className="position-name">{pos.position_name}</div>
                  <div className="position-level">Cấp {pos.level}</div>
                </div>
                <div className="position-status">
                  <span className={`status ${pos.is_active ? 'active' : 'inactive'}`}>
                    {pos.is_active ? 'Hoạt động' : 'Không hoạt động'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Analytics Dashboard Component
const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ 
  departments, 
  positions, 
  departmentEmployeeCounts 
}) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [selectedChart, setSelectedChart] = useState<string>('overview');

  useEffect(() => {
    const generateAnalyticsData = (): AnalyticsData => {
      // Calculate department analytics
      const departmentStats: DepartmentAnalytics[] = departments.map(dept => ({
        id: dept.id,
        name: dept.department_name,
        employeeCount: departmentEmployeeCounts[dept.id] || 0,
        positionCount: positions.filter(pos => pos.department_id === dept.id).length,
        managerName: dept.manager_id ? 
          (dept.manager_id.full_name || dept.manager_id.username) : 
          'Chưa có quản lý',
        status: dept.is_active ? 'Hoạt động' : 'Không hoạt động',
        level: dept.manager_id ? 'managed' : 'root'
      }));

      // Calculate employee distribution
      const totalEmployees = Object.values(departmentEmployeeCounts).reduce((sum, count) => sum + count, 0);
      const employeeDistribution: EmployeeDistributionData[] = departments.map(dept => ({
        departmentId: dept.id,
        departmentName: dept.department_name,
        employeeCount: departmentEmployeeCounts[dept.id] || 0,
        percentage: totalEmployees > 0 ? ((departmentEmployeeCounts[dept.id] || 0) / totalEmployees) * 100 : 0
      }));

      // Calculate position analytics
      const positionStats: PositionAnalytics[] = departments.map(dept => {
        const deptPositions = positions.filter(pos => pos.department_id === dept.id);
        return {
          departmentId: dept.id,
          departmentName: dept.department_name,
          positions: deptPositions.map(pos => ({
            name: pos.position_name,
            count: 1, // Each position is unique
            level: `Cấp ${pos.level}`
          }))
        };
      });

      // Calculate overall stats
      const overallStats: OverallStats = {
        totalDepartments: departments.length,
        totalEmployees: totalEmployees,
        totalPositions: positions.length,
        rootDepartments: departments.filter(dept => !dept.manager_id).length,
        managedDepartments: departments.filter(dept => dept.manager_id).length,
        departmentsWithManagers: departments.filter(dept => dept.manager_id).length,
        departmentsWithoutManagers: departments.filter(dept => !dept.manager_id).length
      };

      return {
        departmentStats,
        employeeDistribution,
        positionStats,
        overallStats
      };
    };

    setAnalyticsData(generateAnalyticsData());
  }, [departments, positions, departmentEmployeeCounts]);

  const exportToCSV = () => {
    if (!analyticsData) return;

    const csvContent = [
      ['Phòng ban', 'Số nhân viên', 'Số vị trí', 'Quản lý', 'Trạng thái', 'Cấp độ'].join(','),
      ...analyticsData.departmentStats.map(dept => [
        dept.name,
        dept.employeeCount,
        dept.positionCount,
        dept.managerName,
        dept.status,
        dept.level === 'root' ? 'Điều hành' : 'Quản lý'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `department_analytics_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!analyticsData) {
    return <div className="analytics-loading">Đang tải dữ liệu phân tích...</div>;
  }

  return (
    <div className="analytics-dashboard">
      <div className="analytics-header">
        <h2><i className="fas fa-chart-bar"></i> Phân tích tổng quan</h2>
        <div className="analytics-actions">
          <button className="export-btn" onClick={exportToCSV}>
            <i className="fas fa-download"></i> Xuất báo cáo
          </button>
        </div>
      </div>

      {/* Overall Statistics Cards */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-building"></i>
          </div>
          <div className="stat-content">
            <div className="stat-number">{analyticsData.overallStats.totalDepartments}</div>
            <div className="stat-label">Tổng phòng ban</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-users"></i>
          </div>
          <div className="stat-content">
            <div className="stat-number">{analyticsData.overallStats.totalEmployees}</div>
            <div className="stat-label">Tổng nhân viên</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-briefcase"></i>
          </div>
          <div className="stat-content">
            <div className="stat-number">{analyticsData.overallStats.totalPositions}</div>
            <div className="stat-label">Tổng vị trí</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-crown"></i>
          </div>
          <div className="stat-content">
            <div className="stat-number">{analyticsData.overallStats.rootDepartments}</div>
            <div className="stat-label">Cấp điều hành</div>
          </div>
        </div>
      </div>

      {/* Chart Selection */}
      <div className="chart-selection">
        <button 
          className={`chart-btn ${selectedChart === 'overview' ? 'active' : ''}`}
          onClick={() => setSelectedChart('overview')}
        >
          <i className="fas fa-chart-pie"></i> Tổng quan
        </button>
        <button 
          className={`chart-btn ${selectedChart === 'departments' ? 'active' : ''}`}
          onClick={() => setSelectedChart('departments')}
        >
          <i className="fas fa-building"></i> Phòng ban
        </button>
        <button 
          className={`chart-btn ${selectedChart === 'employees' ? 'active' : ''}`}
          onClick={() => setSelectedChart('employees')}
        >
          <i className="fas fa-users"></i> Nhân viên
        </button>
        <button 
          className={`chart-btn ${selectedChart === 'positions' ? 'active' : ''}`}
          onClick={() => setSelectedChart('positions')}
        >
          <i className="fas fa-briefcase"></i> Vị trí
        </button>
      </div>

      {/* Charts */}
      <div className="charts-container">
        {selectedChart === 'overview' && (
          <div className="chart-section">
            <h3>Tổng quan cơ cấu tổ chức</h3>
            <div className="overview-charts">
              <div className="chart-card">
                <h4>Phân bố phòng ban theo cấp độ</h4>
                <div className="pie-chart">
                  <div className="pie-slice root">
                    <div className="slice-label">Cấp điều hành</div>
                    <div className="slice-value">{analyticsData.overallStats.rootDepartments}</div>
                  </div>
                  <div className="pie-slice managed">
                    <div className="slice-label">Cấp quản lý</div>
                    <div className="slice-value">{analyticsData.overallStats.managedDepartments}</div>
                  </div>
                </div>
              </div>
              <div className="chart-card">
                <h4>Trạng thái phòng ban</h4>
                <div className="status-chart">
                  <div className="status-item">
                    <div className="status-bar active"></div>
                    <span>Hoạt động: {analyticsData.departmentStats.filter(d => d.status === 'Hoạt động').length}</span>
                  </div>
                  <div className="status-item">
                    <div className="status-bar inactive"></div>
                    <span>Không hoạt động: {analyticsData.departmentStats.filter(d => d.status === 'Không hoạt động').length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedChart === 'departments' && (
          <div className="chart-section">
            <h3>Thống kê phòng ban</h3>
            <div className="department-charts">
              <div className="chart-card">
                <h4>Top phòng ban có nhiều nhân viên</h4>
                <div className="bar-chart">
                  {analyticsData.departmentStats
                    .sort((a, b) => b.employeeCount - a.employeeCount)
                    .slice(0, 5)
                    .map((dept) => (
                      <div key={dept.id} className="bar-item">
                        <div className="bar-label">{dept.name}</div>
                        <div className="bar-container">
                          <div 
                            className="bar-fill" 
                            style={{ width: `${(dept.employeeCount / Math.max(...analyticsData.departmentStats.map(d => d.employeeCount))) * 100}%` }}
                          ></div>
                          <span className="bar-value">{dept.employeeCount}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedChart === 'employees' && (
          <div className="chart-section">
            <h3>Phân bố nhân viên</h3>
            <div className="employee-charts">
              <div className="chart-card">
                <h4>Phân bố nhân viên theo phòng ban</h4>
                <div className="distribution-chart">
                  {analyticsData.employeeDistribution
                    .filter(item => item.employeeCount > 0)
                    .sort((a, b) => b.employeeCount - a.employeeCount)
                    .map(item => (
                      <div key={item.departmentId} className="distribution-item">
                        <div className="distribution-label">{item.departmentName}</div>
                        <div className="distribution-bar">
                          <div 
                            className="distribution-fill" 
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                          <span className="distribution-value">{item.employeeCount} ({item.percentage.toFixed(1)}%)</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedChart === 'positions' && (
          <div className="chart-section">
            <h3>Thống kê vị trí công việc</h3>
            <div className="position-charts">
              <div className="chart-card">
                <h4>Vị trí theo phòng ban</h4>
                <div className="position-grid">
                  {analyticsData.positionStats.map(dept => (
                    <div key={dept.departmentId} className="position-dept">
                      <h5>{dept.departmentName}</h5>
                      <div className="position-list">
                        {dept.positions.map((pos, index) => (
                          <div key={index} className="position-item">
                            <span className="position-name">{pos.name}</span>
                            <span className="position-level">{pos.level}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Detailed Statistics Table */}
      <div className="analytics-table">
        <h3>Bảng thống kê chi tiết</h3>
        <div className="table-container">
          <table className="stats-table">
            <thead>
              <tr>
                <th>Phòng ban</th>
                <th>Số nhân viên</th>
                <th>Số vị trí</th>
                <th>Quản lý</th>
                <th>Trạng thái</th>
                <th>Cấp độ</th>
              </tr>
            </thead>
            <tbody>
              {analyticsData.departmentStats.map(dept => (
                <tr key={dept.id}>
                  <td>{dept.name}</td>
                  <td>{dept.employeeCount}</td>
                  <td>{dept.positionCount}</td>
                  <td>{dept.managerName}</td>
                  <td>
                    <span className={`status-badge ${dept.status === 'Hoạt động' ? 'active' : 'inactive'}`}>
                      {dept.status}
                    </span>
                  </td>
                  <td>
                    <span className={`level-badge ${dept.level}`}>
                      {dept.level === 'root' ? 'Điều hành' : 'Quản lý'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

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
  
  // Hierarchy view state
  const [hierarchyView, setHierarchyView] = useState<'chart' | 'tree' | 'list'>('chart');
  
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


  // Load all data on component mount and when component becomes visible
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

  // Refresh data when component becomes visible (to catch updates from other pages)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Page became visible, refreshing department data...');
        loadDepartments();
      }
    };

    const handleFocus = () => {
      console.log('Window focused, refreshing department data...');
      loadDepartments();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
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
        <div className="header-actions">
          <button 
            className="btn btn-primary" 
            onClick={() => {
              console.log('Manual refresh triggered');
              loadDepartments();
            }}
            title="Làm mới dữ liệu"
          >
            <i className="fas fa-sync-alt"></i> Làm mới
          </button>
          <a href="/admin/dashboard" className="btn btn-secondary">
            <i className="fas fa-arrow-left"></i> Quay lại
          </a>
        </div>
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
              <div className="hierarchy-header">
                <h3>
                  <i className="fas fa-sitemap"></i> Cơ cấu tổ chức công ty
                </h3>
                <div className="hierarchy-controls">
                  <button 
                    className="btn btn-sm btn-secondary"
                    onClick={() => setHierarchyView('chart')}
                  >
                    <i className="fas fa-project-diagram"></i> Sơ đồ
                  </button>
                  <button 
                    className="btn btn-sm btn-secondary"
                    onClick={() => setHierarchyView('tree')}
                  >
                    <i className="fas fa-tree"></i> Cây phân cấp
                  </button>
                  <button 
                    className="btn btn-sm btn-secondary"
                    onClick={() => setHierarchyView('list')}
                  >
                    <i className="fas fa-list"></i> Danh sách
                  </button>
                </div>
              </div>
              
              <div className="organization-chart-container">
                {hierarchyView === 'chart' && (
                  <OrganizationChart 
                    departments={departments}
                    positions={positions}
                    departmentEmployeeCounts={departmentEmployeeCounts}
                  />
                )}
                
                {hierarchyView === 'tree' && (
                  <HierarchyTree 
                    departments={departments}
                    positions={positions}
                    departmentEmployeeCounts={departmentEmployeeCounts}
                  />
                )}
                
                {hierarchyView === 'list' && (
                  <HierarchyList 
                    departments={departments}
                    positions={positions}
                    departmentEmployeeCounts={departmentEmployeeCounts}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="tab-content active">
            <AnalyticsDashboard 
              departments={departments}
              positions={positions}
              departmentEmployeeCounts={departmentEmployeeCounts}
            />
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
