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
  FallOutlined,
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

  return (
    <HeaderDepartmentLayout title="Dashboard trưởng bộ phận" icon={<TeamOutlined />}>
      <div style={{ padding: '24px' }}>
        {/* Header */}
        <Card style={{ marginBottom: '24px' }}>
          <Title level={4}>Tổng quan an toàn & đào tạo</Title>
          <Paragraph type="secondary">
            Tổng quan nhanh về tình hình đào tạo, chứng chỉ, PPE và sự cố trong bộ phận.
          </Paragraph>
        </Card>

        {/* Alerts */}
        {alerts.length > 0 && (
          <Card title="Cảnh báo & Thông báo" style={{ marginBottom: '24px' }}>
            <List
              dataSource={alerts}
              renderItem={(alert) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={getAlertIcon(alert.type)}
                    title={
                      <Space>
                        <Text strong>{alert.title}</Text>
                        <Tag color={alert.type === 'error' ? 'red' : alert.type === 'warning' ? 'orange' : 'blue'}>
                          {alert.module}
                        </Tag>
                      </Space>
                    }
                    description={alert.message}
                  />
                </List.Item>
              )}
            />
          </Card>
        )}

        {/* Statistics Cards */}
        <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
          {/* Incidents */}
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Tổng số sự cố"
                value={stats?.incidents.total || 0}
                prefix={<ExclamationCircleOutlined />}
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Đang xử lý"
                value={stats?.incidents.inProgress || 0}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Đã giải quyết"
                value={stats?.incidents.resolved || 0}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Tỷ lệ giải quyết"
                value={stats?.incidents.resolutionRate || 0}
                suffix="%"
                prefix={<RiseOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>

          {/* Training */}
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Khóa đào tạo đang mở"
                value={stats?.training.activeCourses || 0}
                prefix={<BookOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Tỷ lệ hoàn thành"
                value={stats?.training.completionRate || 0}
                suffix="%"
                prefix={<RiseOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Nhân viên cần đào tạo"
                value={stats?.training.employeesNeedingTraining || 0}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Chứng chỉ sắp hết hạn"
                value={stats?.certificates.expiringSoon || 0}
                prefix={<SafetyCertificateOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>

          {/* PPE */}
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="PPE tồn kho thấp"
                value={stats?.ppe.lowStock || 0}
                prefix={<WarningOutlined />}
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="PPE sắp hết hạn"
                value={stats?.ppe.expiringSoon || 0}
                prefix={<SafetyOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="PPE phát trong tháng"
                value={stats?.ppe.issuedThisMonth || 0}
                prefix={<RiseOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="PPE đang sử dụng"
                value={stats?.ppe.totalInUse || 0}
                prefix={<SafetyOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>

          {/* Projects */}
          <Col xs={24} sm={12} lg={8}>
            <Card>
              <Statistic
                title="Dự án đang hoạt động"
                value={stats?.projects.active || 0}
                prefix={<ProjectOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card>
              <Statistic
                title="Dự án rủi ro cao"
                value={stats?.projects.highRisk || 0}
                prefix={<WarningOutlined />}
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card>
              <Statistic
                title="Milestone sắp đến hạn"
                value={stats?.projects.milestonesDueSoon || 0}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Progress Indicators */}
        <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
          <Col xs={24} lg={12}>
            <Card title="Tỷ lệ giải quyết sự cố">
              <Progress
                type="dashboard"
                percent={stats?.incidents.resolutionRate || 0}
                format={(percent) => `${percent}%`}
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
              />
              <div style={{ marginTop: '16px', textAlign: 'center' }}>
                <Text type="secondary">
                  {stats?.incidents.resolved || 0} / {stats?.incidents.total || 0} sự cố đã được giải quyết
                </Text>
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="Tỷ lệ hoàn thành đào tạo">
              <Progress
                type="dashboard"
                percent={stats?.training.completionRate || 0}
                format={(percent) => `${percent}%`}
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
              />
              <div style={{ marginTop: '16px', textAlign: 'center' }}>
                <Text type="secondary">
                  {stats?.training.activeCourses || 0} khóa đào tạo đang hoạt động
                </Text>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Recent Activities */}
        <Card title="Hoạt động gần đây">
          {recentActivities.length > 0 ? (
            <List
              dataSource={recentActivities}
              renderItem={(activity) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Tag color={getSeverityColor(activity.severity)}>
                        {activity.severity.toUpperCase()}
                      </Tag>
                    }
                    title={
                      <Space>
                        <Text strong>{activity.action}</Text>
                        <Tag>{activity.module}</Tag>
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        {activity.user_id && (
                          <Text type="secondary">
                            Người thực hiện: {activity.user_id.full_name || activity.user_id.username}
                          </Text>
                        )}
                        <Text type="secondary">
                          {SystemLogService.getRelativeTime(activity.timestamp)}
                        </Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          ) : (
            <Empty description="Chưa có hoạt động nào" />
          )}
        </Card>
      </div>
    </HeaderDepartmentLayout>
  );
};

export default HeaderDepartmentDashboard;


