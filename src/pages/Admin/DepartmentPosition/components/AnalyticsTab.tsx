import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Space,
  Button,
  Spin,
  Empty,
  Progress,
  Tag,
  Table,
  Tooltip,
  Badge
} from 'antd';
import {
  BankOutlined,
  UserOutlined,
  TeamOutlined,
  ProjectOutlined,
  RiseOutlined,
  BarChartOutlined,
  PieChartOutlined,
  ReloadOutlined,
  ExportOutlined
} from '@ant-design/icons';
import type { APIDepartment, APIPosition } from '../../../../types';
import type { AnalyticsData, DepartmentAnalytics, EmployeeDistributionData, PositionAnalytics } from '../types';

const { Title, Text } = Typography;

interface AnalyticsTabProps {
  departments: APIDepartment[];
  positions: APIPosition[];
  departmentEmployeeCounts: Record<string, number>;
  onRefresh: () => void;
}

const AnalyticsTab: React.FC<AnalyticsTabProps> = ({
  departments,
  positions,
  departmentEmployeeCounts,
  onRefresh
}) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    calculateAnalytics();
  }, [departments, positions, departmentEmployeeCounts]);

  const calculateAnalytics = () => {
    setLoading(true);
    
    try {
      // Calculate department analytics
      const departmentStats: DepartmentAnalytics[] = departments.map(dept => ({
        id: dept.id,
        name: dept.department_name,
        employeeCount: departmentEmployeeCounts[dept.id] || 0,
        positionCount: positions.filter(pos => pos.department_id === dept.id).length,
        managerName: dept.manager_id ? 'Có quản lý' : 'Chưa có quản lý',
        status: dept.is_active ? 'Hoạt động' : 'Không hoạt động'
      }));

      // Calculate employee distribution
      const employeeDistribution: EmployeeDistributionData[] = departments.map(dept => ({
        departmentId: dept.id,
        departmentName: dept.department_name,
        employeeCount: departmentEmployeeCounts[dept.id] || 0
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
            level: getLevelName(pos.level)
          }))
        };
      });

      // Calculate overall stats
      const totalEmployees = Object.values(departmentEmployeeCounts).reduce((sum, count) => sum + count, 0);
      const activeDepartments = departments.filter(dept => dept.is_active).length;
      const departmentsWithManagers = departments.filter(dept => dept.manager_id).length;
      const averageEmployeesPerDept = departments.length > 0 ? totalEmployees / departments.length : 0;

      const analytics: AnalyticsData = {
        departmentStats,
        employeeDistribution,
        positionStats,
        overallStats: {
          totalDepartments: departments.length,
          totalPositions: positions.length,
          totalEmployees,
          activeDepartments,
          departmentsWithManagers,
          departmentsWithoutManagers: departments.length - departmentsWithManagers,
          averageEmployeesPerDept: Math.round(averageEmployeesPerDept * 10) / 10
        }
      };

      setAnalyticsData(analytics);
    } catch (error) {
      console.error('Error calculating analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLevelName = (level: number) => {
    const levelNames: { [key: number]: string } = {
      1: 'Thực tập sinh',
      2: 'Nhân viên',
      3: 'Chuyên viên',
      4: 'Trưởng nhóm',
      5: 'Quản lý',
      6: 'Giám đốc',
      7: 'Phó giám đốc',
      8: 'Tổng giám đốc',
      9: 'Chủ tịch',
      10: 'Cố vấn'
    };
    return levelNames[level] || `Cấp ${level}`;
  };

  const getLevelColor = (level: number) => {
    if (level <= 2) return '#52c41a';
    if (level <= 5) return '#1890ff';
    if (level <= 7) return '#faad14';
    return '#722ed1';
  };

  const exportData = () => {
    // TODO: Implement export functionality
    console.log('Export analytics data');
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 0' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>
          <Text type="secondary">Đang tính toán thống kê...</Text>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="Không có dữ liệu để phân tích"
        style={{ padding: '50px 0' }}
      >
        <Button type="primary" icon={<ReloadOutlined />} onClick={onRefresh}>
          Tải lại dữ liệu
        </Button>
      </Empty>
    );
  }

  const { overallStats, departmentStats, employeeDistribution, positionStats } = analyticsData;

  return (
    <div>
      {/* Header */}
      <Card style={{ marginBottom: '16px' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <Title level={4} style={{ margin: 0 }}>
                <BarChartOutlined /> Thống kê và Báo cáo
              </Title>
              <Text type="secondary">
                Phân tích hiệu suất và cấu trúc tổ chức
              </Text>
            </Space>
          </Col>
          <Col>
            <Space>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={onRefresh}
                title="Làm mới dữ liệu"
              >
                Làm mới
              </Button>
              <Button 
                type="primary" 
                icon={<ExportOutlined />} 
                onClick={exportData}
                title="Xuất báo cáo"
              >
                Xuất báo cáo
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Overall Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng phòng ban"
              value={overallStats.totalDepartments}
              prefix={<BankOutlined style={{ color: '#1890ff' }} />}
              suffix={
                <Text type="secondary">
                  ({overallStats.activeDepartments} hoạt động)
                </Text>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng vị trí"
              value={overallStats.totalPositions}
              prefix={<UserOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng nhân viên"
              value={overallStats.totalEmployees}
              prefix={<TeamOutlined style={{ color: '#faad14' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="TB nhân viên/phòng ban"
              value={overallStats.averageEmployeesPerDept}
              prefix={<RiseOutlined style={{ color: '#722ed1' }} />}
              precision={1}
            />
          </Card>
        </Col>
      </Row>

      {/* Department Performance */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={24}>
          <Card title="Hiệu suất phòng ban" extra={<PieChartOutlined />}>
            <Table
              dataSource={departmentStats}
              rowKey="id"
              pagination={false}
              size="small"
              columns={[
                {
                  title: 'Phòng ban',
                  dataIndex: 'name',
                  key: 'name',
                  render: (text) => (
                    <Space>
                      <BankOutlined />
                      <Text strong>{text}</Text>
                    </Space>
                  )
                },
                {
                  title: 'Nhân viên',
                  dataIndex: 'employeeCount',
                  key: 'employeeCount',
                  render: (count) => (
                    <Badge count={count} showZero color="#52c41a" />
                  )
                },
                {
                  title: 'Vị trí',
                  dataIndex: 'positionCount',
                  key: 'positionCount',
                  render: (count) => (
                    <Badge count={count} showZero color="#1890ff" />
                  )
                },
                {
                  title: 'Quản lý',
                  dataIndex: 'managerName',
                  key: 'managerName',
                  render: (text) => (
                    <Tag color={text === 'Có quản lý' ? 'green' : 'red'}>
                      {text}
                    </Tag>
                  )
                },
                {
                  title: 'Trạng thái',
                  dataIndex: 'status',
                  key: 'status',
                  render: (status) => (
                    <Tag color={status === 'Hoạt động' ? 'green' : 'red'}>
                      {status}
                    </Tag>
                  )
                },
                {
                  title: 'Hiệu suất',
                  key: 'efficiency',
                  render: (_, record) => {
                    const efficiency = record.employeeCount > 0 ? 
                      Math.min(100, (record.employeeCount / record.positionCount) * 100) : 0;
                    return (
                      <Progress 
                        percent={Math.round(efficiency)} 
                        size="small"
                        status={efficiency > 80 ? 'success' : efficiency > 50 ? 'normal' : 'exception'}
                      />
                    );
                  }
                }
              ]}
            />
          </Card>
        </Col>
      </Row>

      {/* Employee Distribution */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={24}>
          <Card title="Phân bố nhân viên theo phòng ban" extra={<BarChartOutlined />}>
            <Row gutter={[16, 16]}>
              {employeeDistribution.map((dept) => {
                const percentage = overallStats.totalEmployees > 0 ? 
                  (dept.employeeCount / overallStats.totalEmployees) * 100 : 0;
                return (
                  <Col xs={24} sm={12} md={8} lg={6} key={dept.departmentId}>
                    <Card size="small">
                      <Statistic
                        title={dept.departmentName}
                        value={dept.employeeCount}
                        prefix={<TeamOutlined />}
                        suffix={
                          <Text type="secondary">
                            ({Math.round(percentage)}%)
                          </Text>
                        }
                      />
                      <Progress 
                        percent={Math.round(percentage)} 
                        size="small"
                        showInfo={false}
                        strokeColor="#52c41a"
                      />
                    </Card>
                  </Col>
                );
              })}
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Position Analysis */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="Phân tích vị trí theo phòng ban" extra={<UserOutlined />}>
            <Table
              dataSource={positionStats}
              rowKey="departmentId"
              pagination={false}
              size="small"
              expandable={{
                expandedRowRender: (record) => (
                  <div style={{ margin: 0 }}>
                    {record.positions.map((pos, index) => (
                      <Tag 
                        key={index}
                        color={getLevelColor(parseInt(pos.level.split(' ')[1]) || 1)}
                        style={{ margin: '4px' }}
                      >
                        {pos.name} - {pos.level}
                      </Tag>
                    ))}
                  </div>
                ),
                rowExpandable: (record) => record.positions.length > 0
              }}
              columns={[
                {
                  title: 'Phòng ban',
                  dataIndex: 'departmentName',
                  key: 'departmentName',
                  render: (text) => (
                    <Space>
                      <BankOutlined />
                      <Text strong>{text}</Text>
                    </Space>
                  )
                },
                {
                  title: 'Số vị trí',
                  dataIndex: 'positions',
                  key: 'positionCount',
                  render: (positions) => (
                    <Badge count={positions.length} showZero color="#1890ff" />
                  )
                },
                {
                  title: 'Chi tiết vị trí',
                  key: 'positions',
                  render: (_, record) => (
                    <Text type="secondary">
                      {record.positions.length > 0 ? 
                        `${record.positions.length} vị trí` : 
                        'Chưa có vị trí'
                      }
                    </Text>
                  )
                }
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AnalyticsTab;
