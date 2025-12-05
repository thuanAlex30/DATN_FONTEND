import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Spin,
  Alert,
  Progress,
  List,
  Tag,
  Empty,
  Space,
  Divider,
  Button,
  Badge,
} from 'antd';
import {
  TeamOutlined,
  SafetyCertificateOutlined,
  SafetyOutlined,
  ExclamationCircleOutlined,
  BookOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ProjectOutlined,
  InfoCircleOutlined,
  RiseOutlined,
  ArrowUpOutlined,
  ThunderboltOutlined,
  FireOutlined,
  TrophyOutlined,
  BarChartOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import HeaderDepartmentLayout from '../../components/HeaderDepartment/HeaderDepartmentLayout';
import headerDepartmentDashboardService from '../../services/headerDepartmentDashboardService';
import type { HeaderDepartmentDashboardStats, RecentActivity } from '../../services/headerDepartmentDashboardService';
import SystemLogService from '../../services/SystemLogService';

const { Title, Paragraph, Text } = Typography;

const HeaderDepartmentDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<HeaderDepartmentDashboardStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [alerts, setAlerts] = useState<Array<{
    id: string;
    type: 'warning' | 'error' | 'info';
    title: string;
    message: string;
    module: string;
    timestamp: string;
  }>>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [dashboardStats, activities, dashboardAlerts] = await Promise.all([
        headerDepartmentDashboardService.getDashboardStats(),
        headerDepartmentDashboardService.getRecentActivities(10),
        headerDepartmentDashboardService.getAlerts(),
      ]);

      setStats(dashboardStats);
      setRecentActivities(activities);
      setAlerts(dashboardAlerts);
    } catch (err: any) {
      console.error('Error loading dashboard:', err);
      setError(err.message || 'Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };


  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error':
      case 'critical':
        return 'red';
      case 'warning':
        return 'orange';
      case 'success':
        return 'green';
      default:
        return 'blue';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />;
      case 'warning':
        return <WarningOutlined style={{ color: '#faad14' }} />;
      default:
        return <InfoCircleOutlined style={{ color: '#1890ff' }} />;
    }
  };

  if (loading) {
    return (
      <HeaderDepartmentLayout title="Dashboard trưởng bộ phận" icon={<TeamOutlined />}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <Spin size="large" />
        </div>
      </HeaderDepartmentLayout>
    );
  }

  if (error) {
    return (
      <HeaderDepartmentLayout title="Dashboard trưởng bộ phận" icon={<TeamOutlined />}>
        <Alert
          message="Lỗi tải dữ liệu"
          description={error}
          type="error"
          showIcon
          action={
            <button onClick={loadDashboardData} style={{ padding: '4px 8px', cursor: 'pointer' }}>
              Thử lại
            </button>
          }
        />
      </HeaderDepartmentLayout>
    );
  }

  const cardStyle = {
    background: 'rgba(255, 255, 255, 0.95)',
    border: '1px solid rgba(15, 155, 77, 0.12)',
    borderRadius: '24px',
    boxShadow: '0 20px 50px rgba(15, 155, 77, 0.08)',
    backdropFilter: 'blur(6px)',
    transition: 'all 0.3s ease',
    height: '100%'
  };

  const statCardStyle = {
    ...cardStyle,
    borderRadius: '18px',
    boxShadow: '0 18px 35px rgba(15, 155, 77, 0.08)',
    background: 'rgba(255, 255, 255, 0.9)',
  };

  return (
    <HeaderDepartmentLayout title="Dashboard trưởng bộ phận" icon={<TeamOutlined />}>
      <div 
        style={{ 
          padding: '32px',
          minHeight: 'calc(100vh - 64px)',
          background: 'linear-gradient(180deg, #f8fff9 0%, #ffffff 60%, #f0fdf4 100%)',
          position: 'relative',
          overflow: 'auto'
        }}
      >
        {/* Background decorative elements */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              radial-gradient(circle at 15% 25%, rgba(163, 230, 53, 0.15), transparent 55%),
              radial-gradient(circle at 85% 20%, rgba(52, 211, 153, 0.2), transparent 60%),
              radial-gradient(circle at 60% 80%, rgba(16, 185, 129, 0.15), transparent 55%),
              linear-gradient(120deg, rgba(255, 255, 255, 0.9), rgba(240, 253, 244, 0.8))
            `,
            backgroundPosition: '15% 25%, 85% 20%, 60% 80%, center',
            backgroundSize: 'auto, auto, auto, cover',
            backgroundRepeat: 'no-repeat',
            zIndex: 0,
            pointerEvents: 'none'
          }}
        />
        
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1600px', margin: '0 auto' }}>
          {/* Header Section */}
          <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
            <Col xs={24} lg={16}>
              <Card style={cardStyle}>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <Title level={2} style={{ color: '#0f9b4f', margin: 0, fontWeight: 700 }}>
                        Tổng quan An toàn & Đào tạo
                      </Title>
                      <Paragraph style={{ color: 'rgba(15, 29, 23, 0.75)', marginTop: '8px', marginBottom: 0, fontSize: '16px' }}>
                        Theo dõi và quản lý toàn diện các hoạt động an toàn, đào tạo, PPE và dự án trong bộ phận
                      </Paragraph>
                    </div>
                    <Button 
                      icon={<ReloadOutlined />} 
                      onClick={loadDashboardData}
                      style={{
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #34d399, #16a34a)',
                        border: 'none',
                        color: '#052e16',
                        fontWeight: 600,
                        boxShadow: '0 8px 20px rgba(52, 211, 153, 0.3)'
                      }}
                    >
                      Làm mới
                    </Button>
                  </div>
                </Space>
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card style={cardStyle}>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <div>
                    <Text type="secondary" style={{ fontSize: '14px' }}>Tổng số sự cố</Text>
                    <Title level={3} style={{ margin: '8px 0 0 0', color: '#0f9b4f' }}>
                      {stats?.incidents.total || 0}
                    </Title>
                  </div>
                  <Divider style={{ margin: '12px 0' }} />
                  <div>
                    <Text type="secondary" style={{ fontSize: '14px' }}>Tỷ lệ giải quyết</Text>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                      <Title level={3} style={{ margin: 0, color: '#16a34a' }}>
                        {stats?.incidents.resolutionRate || 0}%
                      </Title>
                      <Badge 
                        count={<ArrowUpOutlined style={{ color: '#16a34a' }} />} 
                        style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}
                      />
                    </div>
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>

          {/* Alerts Section */}
          {alerts.length > 0 && (
            <Card 
              title={
                <Space>
                  <FireOutlined style={{ color: '#faad14' }} />
                  <span style={{ color: '#0f9b4f', fontWeight: 600, fontSize: '18px' }}>Cảnh báo & Thông báo</span>
                  <Badge count={alerts.length} style={{ backgroundColor: '#faad14' }} />
                </Space>
              }
              style={{ 
                ...cardStyle,
                marginBottom: '32px'
              }}
            >
              <List
                dataSource={alerts}
                renderItem={(alert) => (
                  <List.Item
                    style={{
                      padding: '16px',
                      marginBottom: '12px',
                      background: 'rgba(240, 253, 244, 0.5)',
                      borderRadius: '12px',
                      border: '1px solid rgba(15, 155, 77, 0.1)'
                    }}
                  >
                    <List.Item.Meta
                      avatar={
                        <div style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '12px',
                          background: alert.type === 'error' 
                            ? 'rgba(255, 77, 79, 0.1)' 
                            : alert.type === 'warning' 
                            ? 'rgba(250, 173, 20, 0.1)' 
                            : 'rgba(34, 197, 94, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {getAlertIcon(alert.type)}
                        </div>
                      }
                      title={
                        <Space>
                          <Text strong style={{ fontSize: '16px', color: '#0f1c3f' }}>{alert.title}</Text>
                          <Tag 
                            color={alert.type === 'error' ? 'red' : alert.type === 'warning' ? 'orange' : '#16a34a'}
                            style={{
                              background: alert.type === 'error' ? undefined : alert.type === 'warning' ? undefined : 'rgba(34, 197, 94, 0.12)',
                              border: alert.type === 'error' ? undefined : alert.type === 'warning' ? undefined : '1px solid rgba(15, 155, 77, 0.15)',
                              color: alert.type === 'error' ? undefined : alert.type === 'warning' ? undefined : '#0f9b4f',
                              borderRadius: '8px',
                              padding: '4px 12px'
                            }}
                          >
                            {alert.module}
                          </Tag>
                        </Space>
                      }
                      description={
                        <Text style={{ color: 'rgba(15, 29, 23, 0.65)', fontSize: '14px' }}>{alert.message}</Text>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          )}

          {/* Main Statistics - Incidents Section */}
          <Card
            title={
              <Space>
                <ExclamationCircleOutlined style={{ color: '#cf1322', fontSize: '20px' }} />
                <span style={{ color: '#0f9b4f', fontWeight: 600, fontSize: '18px' }}>Quản lý Sự cố</span>
              </Space>
            }
            style={{ ...cardStyle, marginBottom: '32px' }}
          >
            <Row gutter={[24, 24]}>
              <Col xs={24} sm={12} lg={6}>
                <Card
                  style={{
                    ...statCardStyle,
                    background: 'linear-gradient(135deg, rgba(255, 77, 79, 0.1) 0%, rgba(255, 255, 255, 0.9) 100%)',
                    border: '1px solid rgba(255, 77, 79, 0.2)'
                  }}
                  hoverable
                  bodyStyle={{ padding: '20px' }}
                >
                  <Statistic
                    title={<span style={{ color: 'rgba(15, 29, 23, 0.65)', fontSize: '14px' }}>Tổng số sự cố</span>}
                    value={stats?.incidents.total || 0}
                    prefix={<ExclamationCircleOutlined style={{ fontSize: '24px', color: '#cf1322' }} />}
                    valueStyle={{ color: '#cf1322', fontSize: '28px', fontWeight: 700 }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card
                  style={{
                    ...statCardStyle,
                    background: 'linear-gradient(135deg, rgba(250, 173, 20, 0.1) 0%, rgba(255, 255, 255, 0.9) 100%)',
                    border: '1px solid rgba(250, 173, 20, 0.2)'
                  }}
                  hoverable
                  bodyStyle={{ padding: '20px' }}
                >
                  <Statistic
                    title={<span style={{ color: 'rgba(15, 29, 23, 0.65)', fontSize: '14px' }}>Đang xử lý</span>}
                    value={stats?.incidents.inProgress || 0}
                    prefix={<ClockCircleOutlined style={{ fontSize: '24px', color: '#faad14' }} />}
                    valueStyle={{ color: '#faad14', fontSize: '28px', fontWeight: 700 }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card
                  style={{
                    ...statCardStyle,
                    background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(255, 255, 255, 0.9) 100%)',
                    border: '1px solid rgba(34, 197, 94, 0.2)'
                  }}
                  hoverable
                  bodyStyle={{ padding: '20px' }}
                >
                  <Statistic
                    title={<span style={{ color: 'rgba(15, 29, 23, 0.65)', fontSize: '14px' }}>Đã giải quyết</span>}
                    value={stats?.incidents.resolved || 0}
                    prefix={<CheckCircleOutlined style={{ fontSize: '24px', color: '#16a34a' }} />}
                    valueStyle={{ color: '#16a34a', fontSize: '28px', fontWeight: 700 }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card
                  style={{
                    ...statCardStyle,
                    background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(255, 255, 255, 0.9) 100%)',
                    border: '1px solid rgba(34, 197, 94, 0.3)'
                  }}
                  hoverable
                  bodyStyle={{ padding: '20px' }}
                >
                  <Statistic
                    title={<span style={{ color: 'rgba(15, 29, 23, 0.65)', fontSize: '14px' }}>Tỷ lệ giải quyết</span>}
                    value={stats?.incidents.resolutionRate || 0}
                    suffix="%"
                    prefix={<RiseOutlined style={{ fontSize: '24px', color: '#16a34a' }} />}
                    valueStyle={{ color: '#16a34a', fontSize: '28px', fontWeight: 700 }}
                  />
                </Card>
              </Col>
            </Row>
          </Card>

          {/* Training & Certificates Section */}
          <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
            <Col xs={24} lg={12}>
              <Card
                title={
                  <Space>
                    <BookOutlined style={{ color: '#16a34a', fontSize: '20px' }} />
                    <span style={{ color: '#0f9b4f', fontWeight: 600, fontSize: '18px' }}>Đào tạo & Chứng chỉ</span>
                  </Space>
                }
                style={cardStyle}
              >
                <Row gutter={[16, 16]}>
                  <Col xs={12}>
                    <Card
                      style={{
                        ...statCardStyle,
                        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(255, 255, 255, 0.9) 100%)',
                        border: '1px solid rgba(34, 197, 94, 0.2)',
                        margin: 0
                      }}
                      hoverable
                      bodyStyle={{ padding: '16px' }}
                    >
                      <Statistic
                        title={<span style={{ color: 'rgba(15, 29, 23, 0.65)', fontSize: '13px' }}>Khóa đào tạo</span>}
                        value={stats?.training.activeCourses || 0}
                        prefix={<BookOutlined style={{ fontSize: '20px', color: '#16a34a' }} />}
                        valueStyle={{ color: '#16a34a', fontSize: '24px', fontWeight: 700 }}
                      />
                    </Card>
                  </Col>
                  <Col xs={12}>
                    <Card
                      style={{
                        ...statCardStyle,
                        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(255, 255, 255, 0.9) 100%)',
                        border: '1px solid rgba(34, 197, 94, 0.3)',
                        margin: 0
                      }}
                      hoverable
                      bodyStyle={{ padding: '16px' }}
                    >
                      <Statistic
                        title={<span style={{ color: 'rgba(15, 29, 23, 0.65)', fontSize: '13px' }}>Tỷ lệ hoàn thành</span>}
                        value={stats?.training.completionRate || 0}
                        suffix="%"
                        prefix={<TrophyOutlined style={{ fontSize: '20px', color: '#16a34a' }} />}
                        valueStyle={{ color: '#16a34a', fontSize: '24px', fontWeight: 700 }}
                      />
                    </Card>
                  </Col>
                  <Col xs={12}>
                    <Card
                      style={{
                        ...statCardStyle,
                        background: 'linear-gradient(135deg, rgba(250, 173, 20, 0.1) 0%, rgba(255, 255, 255, 0.9) 100%)',
                        border: '1px solid rgba(250, 173, 20, 0.2)',
                        margin: 0
                      }}
                      hoverable
                      bodyStyle={{ padding: '16px' }}
                    >
                      <Statistic
                        title={<span style={{ color: 'rgba(15, 29, 23, 0.65)', fontSize: '13px' }}>Cần đào tạo</span>}
                        value={stats?.training.employeesNeedingTraining || 0}
                        prefix={<TeamOutlined style={{ fontSize: '20px', color: '#faad14' }} />}
                        valueStyle={{ color: '#faad14', fontSize: '24px', fontWeight: 700 }}
                      />
                    </Card>
                  </Col>
                  <Col xs={12}>
                    <Card
                      style={{
                        ...statCardStyle,
                        background: 'linear-gradient(135deg, rgba(250, 173, 20, 0.1) 0%, rgba(255, 255, 255, 0.9) 100%)',
                        border: '1px solid rgba(250, 173, 20, 0.2)',
                        margin: 0
                      }}
                      hoverable
                      bodyStyle={{ padding: '16px' }}
                    >
                      <Statistic
                        title={<span style={{ color: 'rgba(15, 29, 23, 0.65)', fontSize: '13px' }}>Chứng chỉ hết hạn</span>}
                        value={stats?.certificates.expiringSoon || 0}
                        prefix={<SafetyCertificateOutlined style={{ fontSize: '20px', color: '#faad14' }} />}
                        valueStyle={{ color: '#faad14', fontSize: '24px', fontWeight: 700 }}
                      />
                    </Card>
                  </Col>
                </Row>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card
                title={
                  <Space>
                    <SafetyOutlined style={{ color: '#16a34a', fontSize: '20px' }} />
                    <span style={{ color: '#0f9b4f', fontWeight: 600, fontSize: '18px' }}>Thiết bị Bảo hộ (PPE)</span>
                  </Space>
                }
                style={cardStyle}
              >
                <Row gutter={[16, 16]}>
                  <Col xs={12}>
                    <Card
                      style={{
                        ...statCardStyle,
                        background: 'linear-gradient(135deg, rgba(255, 77, 79, 0.1) 0%, rgba(255, 255, 255, 0.9) 100%)',
                        border: '1px solid rgba(255, 77, 79, 0.2)',
                        margin: 0
                      }}
                      hoverable
                      bodyStyle={{ padding: '16px' }}
                    >
                      <Statistic
                        title={<span style={{ color: 'rgba(15, 29, 23, 0.65)', fontSize: '13px' }}>Tồn kho thấp</span>}
                        value={stats?.ppe.lowStock || 0}
                        prefix={<WarningOutlined style={{ fontSize: '20px', color: '#cf1322' }} />}
                        valueStyle={{ color: '#cf1322', fontSize: '24px', fontWeight: 700 }}
                      />
                    </Card>
                  </Col>
                  <Col xs={12}>
                    <Card
                      style={{
                        ...statCardStyle,
                        background: 'linear-gradient(135deg, rgba(250, 173, 20, 0.1) 0%, rgba(255, 255, 255, 0.9) 100%)',
                        border: '1px solid rgba(250, 173, 20, 0.2)',
                        margin: 0
                      }}
                      hoverable
                      bodyStyle={{ padding: '16px' }}
                    >
                      <Statistic
                        title={<span style={{ color: 'rgba(15, 29, 23, 0.65)', fontSize: '13px' }}>Sắp hết hạn</span>}
                        value={stats?.ppe.expiringSoon || 0}
                        prefix={<ClockCircleOutlined style={{ fontSize: '20px', color: '#faad14' }} />}
                        valueStyle={{ color: '#faad14', fontSize: '24px', fontWeight: 700 }}
                      />
                    </Card>
                  </Col>
                  <Col xs={12}>
                    <Card
                      style={{
                        ...statCardStyle,
                        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(255, 255, 255, 0.9) 100%)',
                        border: '1px solid rgba(34, 197, 94, 0.2)',
                        margin: 0
                      }}
                      hoverable
                      bodyStyle={{ padding: '16px' }}
                    >
                      <Statistic
                        title={<span style={{ color: 'rgba(15, 29, 23, 0.65)', fontSize: '13px' }}>Phát trong tháng</span>}
                        value={stats?.ppe.issuedThisMonth || 0}
                        prefix={<RiseOutlined style={{ fontSize: '20px', color: '#16a34a' }} />}
                        valueStyle={{ color: '#16a34a', fontSize: '24px', fontWeight: 700 }}
                      />
                    </Card>
                  </Col>
                  <Col xs={12}>
                    <Card
                      style={{
                        ...statCardStyle,
                        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(255, 255, 255, 0.9) 100%)',
                        border: '1px solid rgba(34, 197, 94, 0.2)',
                        margin: 0
                      }}
                      hoverable
                      bodyStyle={{ padding: '16px' }}
                    >
                      <Statistic
                        title={<span style={{ color: 'rgba(15, 29, 23, 0.65)', fontSize: '13px' }}>Đang sử dụng</span>}
                        value={stats?.ppe.totalInUse || 0}
                        prefix={<SafetyOutlined style={{ fontSize: '20px', color: '#16a34a' }} />}
                        valueStyle={{ color: '#16a34a', fontSize: '24px', fontWeight: 700 }}
                      />
                    </Card>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>

          {/* Projects Section */}
          <Card
            title={
              <Space>
                <ProjectOutlined style={{ color: '#16a34a', fontSize: '20px' }} />
                <span style={{ color: '#0f9b4f', fontWeight: 600, fontSize: '18px' }}>Quản lý Dự án</span>
              </Space>
            }
            style={{ ...cardStyle, marginBottom: '32px' }}
          >
            <Row gutter={[24, 24]}>
              <Col xs={24} sm={8}>
                <Card
                  style={{
                    ...statCardStyle,
                    background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(255, 255, 255, 0.9) 100%)',
                    border: '1px solid rgba(34, 197, 94, 0.2)'
                  }}
                  hoverable
                  bodyStyle={{ padding: '20px' }}
                >
                  <Statistic
                    title={<span style={{ color: 'rgba(15, 29, 23, 0.65)', fontSize: '14px' }}>Dự án đang hoạt động</span>}
                    value={stats?.projects.active || 0}
                    prefix={<ProjectOutlined style={{ fontSize: '24px', color: '#16a34a' }} />}
                    valueStyle={{ color: '#16a34a', fontSize: '28px', fontWeight: 700 }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card
                  style={{
                    ...statCardStyle,
                    background: 'linear-gradient(135deg, rgba(255, 77, 79, 0.1) 0%, rgba(255, 255, 255, 0.9) 100%)',
                    border: '1px solid rgba(255, 77, 79, 0.2)'
                  }}
                  hoverable
                  bodyStyle={{ padding: '20px' }}
                >
                  <Statistic
                    title={<span style={{ color: 'rgba(15, 29, 23, 0.65)', fontSize: '14px' }}>Dự án rủi ro cao</span>}
                    value={stats?.projects.highRisk || 0}
                    prefix={<WarningOutlined style={{ fontSize: '24px', color: '#cf1322' }} />}
                    valueStyle={{ color: '#cf1322', fontSize: '28px', fontWeight: 700 }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card
                  style={{
                    ...statCardStyle,
                    background: 'linear-gradient(135deg, rgba(250, 173, 20, 0.1) 0%, rgba(255, 255, 255, 0.9) 100%)',
                    border: '1px solid rgba(250, 173, 20, 0.2)'
                  }}
                  hoverable
                  bodyStyle={{ padding: '20px' }}
                >
                  <Statistic
                    title={<span style={{ color: 'rgba(15, 29, 23, 0.65)', fontSize: '14px' }}>Milestone sắp đến hạn</span>}
                    value={stats?.projects.milestonesDueSoon || 0}
                    prefix={<ClockCircleOutlined style={{ fontSize: '24px', color: '#faad14' }} />}
                    valueStyle={{ color: '#faad14', fontSize: '28px', fontWeight: 700 }}
                  />
                </Card>
              </Col>
            </Row>
          </Card>

          {/* Progress Charts Section */}
          <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
            <Col xs={24} lg={12}>
              <Card 
                title={
                  <Space>
                    <BarChartOutlined style={{ color: '#16a34a', fontSize: '20px' }} />
                    <span style={{ color: '#0f9b4f', fontWeight: 600, fontSize: '18px' }}>Tỷ lệ giải quyết sự cố</span>
                  </Space>
                }
                style={cardStyle}
                bodyStyle={{ padding: '32px' }}
              >
                <div style={{ textAlign: 'center' }}>
                  <Progress
                    type="dashboard"
                    percent={stats?.incidents.resolutionRate || 0}
                    format={(percent) => `${percent}%`}
                    strokeColor={{
                      '0%': '#34d399',
                      '100%': '#16a34a',
                    }}
                    strokeWidth={10}
                    size={200}
                  />
                  <div style={{ marginTop: '24px' }}>
                    <Space direction="vertical" size="small">
                      <Text strong style={{ fontSize: '16px', color: '#0f1c3f' }}>
                        {stats?.incidents.resolved || 0} / {stats?.incidents.total || 0} sự cố đã được giải quyết
                      </Text>
                      <Text type="secondary" style={{ color: 'rgba(15, 29, 23, 0.65)', fontSize: '14px' }}>
                        Hiệu quả xử lý sự cố trong bộ phận
                      </Text>
                    </Space>
                  </div>
                </div>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card 
                title={
                  <Space>
                    <TrophyOutlined style={{ color: '#16a34a', fontSize: '20px' }} />
                    <span style={{ color: '#0f9b4f', fontWeight: 600, fontSize: '18px' }}>Tỷ lệ hoàn thành đào tạo</span>
                  </Space>
                }
                style={cardStyle}
                bodyStyle={{ padding: '32px' }}
              >
                <div style={{ textAlign: 'center' }}>
                  <Progress
                    type="dashboard"
                    percent={stats?.training.completionRate || 0}
                    format={(percent) => `${percent}%`}
                    strokeColor={{
                      '0%': '#34d399',
                      '100%': '#16a34a',
                    }}
                    strokeWidth={10}
                    size={200}
                  />
                  <div style={{ marginTop: '24px' }}>
                    <Space direction="vertical" size="small">
                      <Text strong style={{ fontSize: '16px', color: '#0f1c3f' }}>
                        {stats?.training.activeCourses || 0} khóa đào tạo đang hoạt động
                      </Text>
                      <Text type="secondary" style={{ color: 'rgba(15, 29, 23, 0.65)', fontSize: '14px' }}>
                        Tỷ lệ hoàn thành đào tạo của nhân viên
                      </Text>
                    </Space>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>

          {/* Recent Activities & Quick Actions */}
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={16}>
              <Card 
                title={
                  <Space>
                    <ThunderboltOutlined style={{ color: '#16a34a', fontSize: '20px' }} />
                    <span style={{ color: '#0f9b4f', fontWeight: 600, fontSize: '18px' }}>Hoạt động gần đây</span>
                  </Space>
                }
                style={cardStyle}
              >
                {recentActivities.length > 0 ? (
                  <List
                    dataSource={recentActivities}
                    renderItem={(activity, index) => (
                      <List.Item
                        style={{
                          padding: '16px',
                          marginBottom: index < recentActivities.length - 1 ? '12px' : 0,
                          background: index % 2 === 0 ? 'rgba(240, 253, 244, 0.3)' : 'transparent',
                          borderRadius: '12px',
                          border: '1px solid rgba(15, 155, 77, 0.08)',
                          transition: 'all 0.2s ease'
                        }}
                        className="activity-item"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(240, 253, 244, 0.5)';
                          e.currentTarget.style.transform = 'translateX(4px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = index % 2 === 0 ? 'rgba(240, 253, 244, 0.3)' : 'transparent';
                          e.currentTarget.style.transform = 'translateX(0)';
                        }}
                      >
                        <List.Item.Meta
                          avatar={
                            <div style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '10px',
                              background: activity.severity === 'success' 
                                ? 'rgba(34, 197, 94, 0.15)' 
                                : activity.severity === 'warning'
                                ? 'rgba(250, 173, 20, 0.15)'
                                : 'rgba(255, 77, 79, 0.15)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <Tag 
                                color={getSeverityColor(activity.severity)}
                                style={{
                                  background: activity.severity === 'success' ? 'rgba(34, 197, 94, 0.12)' : undefined,
                                  border: activity.severity === 'success' ? '1px solid rgba(15, 155, 77, 0.15)' : undefined,
                                  color: activity.severity === 'success' ? '#0f9b4f' : undefined,
                                  margin: 0,
                                  borderRadius: '6px',
                                  padding: '2px 8px',
                                  fontSize: '11px',
                                  fontWeight: 600
                                }}
                              >
                                {activity.severity.toUpperCase()}
                              </Tag>
                            </div>
                          }
                          title={
                            <Space>
                              <Text strong style={{ color: '#0f1c3f', fontSize: '15px' }}>{activity.action}</Text>
                              <Tag 
                                style={{
                                  background: 'rgba(34, 197, 94, 0.12)',
                                  border: '1px solid rgba(15, 155, 77, 0.15)',
                                  color: '#0f9b4f',
                                  borderRadius: '8px',
                                  padding: '4px 12px',
                                  fontSize: '12px'
                                }}
                              >
                                {activity.module}
                              </Tag>
                            </Space>
                          }
                          description={
                            <Space direction="vertical" size="small" style={{ width: '100%', marginTop: '8px' }}>
                              {activity.user_id && (
                                <Text type="secondary" style={{ color: 'rgba(15, 29, 23, 0.65)', fontSize: '13px' }}>
                                  👤 {activity.user_id.full_name || activity.user_id.username}
                                </Text>
                              )}
                              <Text type="secondary" style={{ color: 'rgba(15, 29, 23, 0.65)', fontSize: '13px' }}>
                                🕐 {SystemLogService.getRelativeTime(activity.timestamp)}
                              </Text>
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <Empty 
                    description="Chưa có hoạt động nào" 
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    style={{ padding: '40px 0' }}
                  />
                )}
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card 
                title={
                  <Space>
                    <ThunderboltOutlined style={{ color: '#16a34a', fontSize: '20px' }} />
                    <span style={{ color: '#0f9b4f', fontWeight: 600, fontSize: '18px' }}>Tổng quan nhanh</span>
                  </Space>
                }
                style={cardStyle}
              >
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <div style={{
                    padding: '20px',
                    background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(255, 255, 255, 0.9) 100%)',
                    borderRadius: '16px',
                    border: '1px solid rgba(34, 197, 94, 0.2)'
                  }}>
                    <Statistic
                      title={<span style={{ color: 'rgba(15, 29, 23, 0.65)', fontSize: '14px' }}>Tổng sự cố</span>}
                      value={stats?.incidents.total || 0}
                      valueStyle={{ color: '#16a34a', fontSize: '32px', fontWeight: 700 }}
                    />
                    <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: '8px' }}>
                      {stats?.incidents.resolved || 0} đã giải quyết
                    </Text>
                  </div>
                  <div style={{
                    padding: '20px',
                    background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(255, 255, 255, 0.9) 100%)',
                    borderRadius: '16px',
                    border: '1px solid rgba(34, 197, 94, 0.2)'
                  }}>
                    <Statistic
                      title={<span style={{ color: 'rgba(15, 29, 23, 0.65)', fontSize: '14px' }}>Khóa đào tạo</span>}
                      value={stats?.training.activeCourses || 0}
                      valueStyle={{ color: '#16a34a', fontSize: '32px', fontWeight: 700 }}
                    />
                    <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: '8px' }}>
                      {stats?.training.completionRate || 0}% hoàn thành
                    </Text>
                  </div>
                  <div style={{
                    padding: '20px',
                    background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(255, 255, 255, 0.9) 100%)',
                    borderRadius: '16px',
                    border: '1px solid rgba(34, 197, 94, 0.2)'
                  }}>
                    <Statistic
                      title={<span style={{ color: 'rgba(15, 29, 23, 0.65)', fontSize: '14px' }}>Dự án hoạt động</span>}
                      value={stats?.projects.active || 0}
                      valueStyle={{ color: '#16a34a', fontSize: '32px', fontWeight: 700 }}
                    />
                    <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: '8px' }}>
                      {stats?.projects.highRisk || 0} rủi ro cao
                    </Text>
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>

        </div>
      </div>
    </HeaderDepartmentLayout>
  );
};

export default HeaderDepartmentDashboard;


