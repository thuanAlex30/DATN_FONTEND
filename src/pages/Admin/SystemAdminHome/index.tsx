import React, { useState, useEffect } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Button, 
  Typography, 
  Spin,
  Tag,
  Alert,
  Table,
  Modal,
  List,
  message
} from 'antd';
import styles from './SystemAdminHome.module.css';
import {
  DatabaseOutlined,
  TeamOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  GlobalOutlined,
  UserOutlined,
  BarChartOutlined,
  SecurityScanOutlined
} from '@ant-design/icons';
import adminService from '../../../services/adminService';
import systemAdminService from '../../../services/systemAdminService';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store';

const { Title, Text } = Typography;

interface SystemDashboardData {
  tenants: {
    tenants: number;
    active_tenants: number;
    suspended_tenants: number;
    inactive_tenants: number;
    total_users: number;
    total_active_users: number;
    total_departments: number;
    total_projects: number;
    total_tasks: number;
  };
  tasks: {
    total: number;
    pending: number;
    in_progress: number;
    completed: number;
    on_hold: number;
    cancelled: number;
    overdue: number;
  };
  permission_alerts: {
    errors: Array<{
      _id: string;
      message: string;
      created_at: string;
      user_id?: {
        username: string;
        full_name: string;
      };
      tenant_id?: string;
    }>;
    warnings: Array<{
      _id: string;
      message: string;
      created_at: string;
      user_id?: {
        username: string;
        full_name: string;
      };
      tenant_id?: string;
    }>;
    total_errors: number;
    total_warnings: number;
  };
  summary: {
    total_tenants: number;
    active_tenants: number;
    total_users: number;
    total_active_users: number;
    total_projects: number;
    total_tasks: number;
    permission_issues: number;
  };
}

const SystemAdminHome: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<SystemDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tenantsModalVisible, setTenantsModalVisible] = useState(false);
  const [tenantsList, setTenantsList] = useState<any[]>([]);
  const [tenantsLoadingModal, setTenantsLoadingModal] = useState(false);
  const [permissionModalVisible, setPermissionModalVisible] = useState(false);
  const [permissionAlertsList, setPermissionAlertsList] = useState<any[]>([]);
  const [permissionLoading, setPermissionLoading] = useState(false);
  const [plansModalVisible, setPlansModalVisible] = useState(false);
  const [plansList, setPlansList] = useState<any[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [backupModalVisible, setBackupModalVisible] = useState(false);
  const [backupSubmitting, setBackupSubmitting] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await adminService.getSystemDashboard();
        setDashboardData(data);
      } catch (err: any) {
        console.error('Error fetching system dashboard:', err);
        setError(err.message || 'Không thể tải dữ liệu hệ thống');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Modal data loaders
  const loadTenantsModal = async () => {
    try {
      setTenantsLoadingModal(true);
      const res: any = await systemAdminService.getTenants({ page: 1, limit: 50 });

      // Normalize possible response shapes:
      // - { data: Tenant[] }
      // - { tenants: Tenant[], pagination: ... }
      // - direct array Tenant[]
      let tenantsArray: any[] = [];
      if (Array.isArray(res?.data)) {
        tenantsArray = res.data;
      } else if (Array.isArray(res?.tenants)) {
        tenantsArray = res.tenants;
      } else if (Array.isArray(res)) {
        tenantsArray = res;
      } else if (Array.isArray(res?.data?.tenants)) {
        tenantsArray = res.data.tenants;
      }

      setTenantsList(tenantsArray);
    } catch (err: any) {
      console.error('Error loading tenants for modal:', err);
      message.error('Không thể tải tenants');
    } finally {
      setTenantsLoadingModal(false);
    }
  };

  const loadPermissionAlerts = async () => {
    try {
      setPermissionLoading(true);
      const res = await adminService.getPermissionAlerts({ type: 'all', limit: 50 });
      // adminService returns { alerts, statistics } per implementation
      setPermissionAlertsList(res.alerts || res.alerts || res.statistics ? res.alerts : (res.alerts || []));
    } catch (err: any) {
      console.error('Error loading permission alerts:', err);
      message.error('Không thể tải cảnh báo quyền');
    } finally {
      setPermissionLoading(false);
    }
  };

  const loadPlans = async () => {
    try {
      setPlansLoading(true);
      const res = await systemAdminService.getSubscriptionPlans();
      setPlansList(res || []);
    } catch (err: any) {
      console.error('Error loading plans:', err);
      message.error('Không thể tải gói dịch vụ');
    } finally {
      setPlansLoading(false);
    }
  };

  const handleStartBackup = async () => {
    try {
      setBackupSubmitting(true);
      await systemAdminService.startBackup({ backup_type: 'FULL', storage_location: 'local', compress: false });
      message.success('Backup đã được bắt đầu');
      setBackupModalVisible(false);
    } catch (err: any) {
      console.error('Start backup error:', err);
      message.error('Không thể bắt đầu backup');
    } finally {
      setBackupSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spin size="large" className={styles.loadingSpinner} />
        <Text style={{ marginTop: 16, display: 'block', textAlign: 'center' }}>
          Đang tải dữ liệu hệ thống...
        </Text>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <Alert
          message="Lỗi tải dữ liệu"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" onClick={() => window.location.reload()}>
              Tải lại
            </Button>
          }
        />
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  const { tenants, permission_alerts } = dashboardData;

  // Safe defaults for all data fields
  const tenantsData = tenants || {
    tenants: 0,
    active_tenants: 0,
    suspended_tenants: 0,
    inactive_tenants: 0,
    total_users: 0,
    total_active_users: 0,
    total_departments: 0,
    total_projects: 0,
    total_tasks: 0
  };

  // tasks data intentionally not shown on this page

  const permissionAlerts = permission_alerts || {
    errors: [],
    warnings: [],
    total_errors: 0,
    total_warnings: 0
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <Title level={2} className={styles.welcomeTitle}>
            <GlobalOutlined className={styles.headerIcon} />
            Trang chủ Quản trị Hệ thống
          </Title>
          <Text className={styles.welcomeSubtitle}>
            Xin chào, {user?.full_name || 'System Admin'} - Quản lý toàn bộ hệ thống
          </Text>
        </div>
      </div>

      {/* Permission Alerts */}
      {permissionAlerts.total_errors > 0 || permissionAlerts.total_warnings > 0 ? (
        <Alert
          message="Cảnh báo quyền truy cập"
          description={
            <div>
              <Text>
                Có {permissionAlerts.total_errors} lỗi và {permissionAlerts.total_warnings} cảnh báo về quyền truy cập.
              </Text>
              <Button 
                type="link" 
                size="small" 
                onClick={() => navigate('/admin/system-settings')}
                style={{ padding: 0, marginLeft: 8 }}
              >
                Xem chi tiết
              </Button>
            </div>
          }
          type="warning"
          showIcon
          closable
          style={{ marginBottom: 24 }}
        />
      ) : null}

      {/* System Overview Stats */}
      <div className={styles.statsSection}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card
              className={`${styles.statsCard} ${styles.primary}`}
              onClick={() => navigate('/system-admin/customers')}
              style={{ cursor: 'pointer' }}
            >
              <div className={styles.statisticContent}>
                <DatabaseOutlined className={styles.statisticIcon} style={{ color: '#1890ff' }} />
                <div className={styles.statisticTitle}>Tổng số Tenants</div>
                <div className={styles.statisticValue}>{tenantsData.tenants}</div>
                <div className={styles.statisticSuffix}>
                  {tenantsData.active_tenants} đang hoạt động
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className={`${styles.statsCard} ${styles.success}`}>
              <div className={styles.statisticContent}>
                <TeamOutlined className={styles.statisticIcon} style={{ color: '#52c41a' }} />
                <div className={styles.statisticTitle}>Tổng số Người dùng</div>
                <div className={styles.statisticValue}>{tenantsData.total_users}</div>
                <div className={styles.statisticSuffix}>
                  {tenantsData.total_active_users} đang hoạt động
                </div>
              </div>
            </Card>
          </Col>
          {/* Removed project and task overview cards per request */}
        </Row>
      </div>

      {/* Task statistics removed per request */}

      {/* Quick Actions */}
      <div className={styles.quickActionsSection}>
        <Card className={styles.quickActionsCard}>
          <div className={styles.quickActionsHeader}>
            <Title level={3} className={styles.quickActionsTitle}>Thao tác nhanh</Title>
          </div>
          <div className={styles.quickActionsGrid}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Button
                  type="dashed"
                  size="large"
                  block
                  icon={<DatabaseOutlined />}
                  onClick={() => { setTenantsModalVisible(true); loadTenantsModal(); }}
                  className={styles.quickActionButton}
                >
                  <DatabaseOutlined className={styles.quickActionIcon} />
                  <div className={styles.quickActionContent}>
                    <div className={styles.quickActionTitle}>Quản lý Tenants</div>
                    <div className={styles.quickActionDescription}>Xem và quản lý tất cả tenants</div>
                  </div>
                </Button>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Button
                  type="dashed"
                  size="large"
                  block
                  icon={<UserOutlined />}
                  onClick={() => navigate('/admin/user-management')}
                  className={styles.quickActionButton}
                >
                  <UserOutlined className={styles.quickActionIcon} />
                  <div className={styles.quickActionContent}>
                    <div className={styles.quickActionTitle}>Quản lý Người dùng</div>
                    <div className={styles.quickActionDescription}>Quản lý tất cả người dùng hệ thống</div>
                  </div>
                </Button>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Button
                  type="dashed"
                  size="large"
                  block
                  icon={<SecurityScanOutlined />}
                  onClick={() => { setPermissionModalVisible(true); loadPermissionAlerts(); }}
                  className={styles.quickActionButton}
                >
                  <SecurityScanOutlined className={styles.quickActionIcon} />
                  <div className={styles.quickActionContent}>
                    <div className={styles.quickActionTitle}>Cảnh báo Quyền</div>
                    <div className={styles.quickActionDescription}>Xem lỗi và cảnh báo quyền truy cập</div>
                  </div>
                </Button>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Button
                  type="dashed"
                  size="large"
                  block
                  icon={<BarChartOutlined />}
                  onClick={() => { setPlansModalVisible(true); loadPlans(); }}
                  className={styles.quickActionButton}
                >
                  <BarChartOutlined className={styles.quickActionIcon} />
                  <div className={styles.quickActionContent}>
                    <div className={styles.quickActionTitle}>Báo cáo Hệ thống</div>
                    <div className={styles.quickActionDescription}>Xem báo cáo và thống kê chi tiết</div>
                  </div>
                </Button>
              </Col>
            </Row>
          </div>
        </Card>
      </div>

      {/* Permission Alerts */}
      {(permissionAlerts.errors.length > 0 || permissionAlerts.warnings.length > 0) && (
        <div className={styles.alertsSection}>
          <Row gutter={[16, 16]}>
            {permissionAlerts.errors.length > 0 && (
              <Col xs={24} lg={12}>
                <Card className={styles.alertCard}>
                  <div className={styles.alertCardHeader}>
                    <Title level={4} className={styles.alertCardTitle}>
                      <ExclamationCircleOutlined style={{ color: '#f5222d', marginRight: 8 }} />
                      Lỗi Quyền Truy cập ({permissionAlerts.total_errors})
                    </Title>
                  </div>
                  <div className={styles.alertList}>
                    {permissionAlerts.errors.slice(0, 5).map((alert) => (
                      <div key={alert._id} className={styles.alertItem}>
                        <Tag color="red">Lỗi</Tag>
                        <div className={styles.alertContent}>
                          <div className={styles.alertMessage}>{alert.message}</div>
                          {alert.user_id && (
                            <div className={styles.alertUser}>
                              Người dùng: {alert.user_id.full_name || alert.user_id.username}
                            </div>
                          )}
                          <div className={styles.alertTime}>{formatDate(alert.created_at)}</div>
                        </div>
                      </div>
                    ))}
                    {permissionAlerts.errors.length > 5 && (
                      <Button 
                        type="link" 
                        block 
                        onClick={() => navigate('/admin/system-settings')}
                      >
                        Xem tất cả ({permissionAlerts.errors.length})
                      </Button>
                    )}
                  </div>
                </Card>
              </Col>
            )}
            {permissionAlerts.warnings.length > 0 && (
              <Col xs={24} lg={12}>
                <Card className={styles.alertCard}>
                  <div className={styles.alertCardHeader}>
                    <Title level={4} className={styles.alertCardTitle}>
                      <WarningOutlined style={{ color: '#faad14', marginRight: 8 }} />
                      Cảnh báo Quyền ({permissionAlerts.total_warnings})
                    </Title>
                  </div>
                  <div className={styles.alertList}>
                    {permissionAlerts.warnings.slice(0, 5).map((alert) => (
                      <div key={alert._id} className={styles.alertItem}>
                        <Tag color="orange">Cảnh báo</Tag>
                        <div className={styles.alertContent}>
                          <div className={styles.alertMessage}>{alert.message}</div>
                          {alert.user_id && (
                            <div className={styles.alertUser}>
                              Người dùng: {alert.user_id.full_name || alert.user_id.username}
                            </div>
                          )}
                          <div className={styles.alertTime}>{formatDate(alert.created_at)}</div>
                        </div>
                      </div>
                    ))}
                    {permissionAlerts.warnings.length > 5 && (
                      <Button 
                        type="link" 
                        block 
                        onClick={() => navigate('/admin/system-settings')}
                      >
                        Xem tất cả ({permissionAlerts.warnings.length})
                      </Button>
                    )}
                  </div>
                </Card>
              </Col>
            )}
          </Row>
        </div>
      )}
      {/* Tenants Modal */}
      <Modal
        title="Danh sách Tenants"
        open={tenantsModalVisible}
        onCancel={() => setTenantsModalVisible(false)}
        footer={null}
        width={900}
      >
        {tenantsLoadingModal ? (
          <div style={{ textAlign: 'center', padding: 24 }}><Spin /></div>
        ) : (
          <Table
            dataSource={tenantsList}
            rowKey={(r) => r._id || r.id}
            pagination={{ pageSize: 10 }}
            columns={[
              { title: 'Tên', dataIndex: 'tenant_name', key: 'tenant_name' },
              { title: 'Mã', dataIndex: 'tenant_code', key: 'tenant_code' },
              { title: 'Email', key: 'contact_email', render: (_: any, rec: any) => rec.contact?.email || rec.contact_email || '-' },
              { title: 'SĐT', key: 'contact_phone', render: (_: any, rec: any) => rec.contact?.phone || rec.contact_phone || '-' },
              { title: 'Gói', key: 'plan', render: (_: any, rec: any) => rec.subscription?.plan || rec.subscription_plan || '-' },
              { title: 'Hết hạn', key: 'expires_at', render: (_: any, rec: any) => (rec.subscription?.expires_at || rec.subscription_expires_at) ? formatDate(rec.subscription?.expires_at || rec.subscription_expires_at) : '-' },
            ]}
          />
        )}
      </Modal>

      {/* Permission Alerts Modal */}
      <Modal
        title="Cảnh báo Quyền truy cập"
        open={permissionModalVisible}
        onCancel={() => setPermissionModalVisible(false)}
        footer={null}
        width={800}
      >
        {permissionLoading ? (
          <div style={{ textAlign: 'center', padding: 24 }}><Spin /></div>
        ) : permissionAlertsList.length === 0 ? (
          <div>Không có cảnh báo</div>
        ) : (
          <List
            dataSource={permissionAlertsList}
            renderItem={(alert: any) => (
              <List.Item>
                <List.Item.Meta
                  title={<Text strong>{alert.message}</Text>}
                  description={<div><div>{alert.user_id?.full_name || alert.user_id?.username}</div><div style={{ color: '#999' }}>{formatDate(alert.created_at)}</div></div>}
                />
              </List.Item>
            )}
          />
        )}
      </Modal>

      {/* Subscription Plans Modal */}
      <Modal
        title="Gói dịch vụ"
        open={plansModalVisible}
        onCancel={() => setPlansModalVisible(false)}
        footer={null}
        width={700}
      >
        {plansLoading ? (
          <div style={{ textAlign: 'center', padding: 24 }}><Spin /></div>
        ) : plansList.length === 0 ? (
          <div>Chưa có gói dịch vụ</div>
        ) : (
          <Table
            dataSource={plansList}
            rowKey={(r) => r._id || r.id}
            pagination={{ pageSize: 10 }}
            columns={[
              { title: 'Tên gói', dataIndex: 'plan_name', key: 'plan_name' },
              { title: 'Mô tả', dataIndex: 'description', key: 'description' },
              { title: 'Giá', dataIndex: 'price', key: 'price', render: (p: number) => p?.toLocaleString('vi-VN') },
              { title: 'Kỳ hạn (tháng)', dataIndex: 'duration_months', key: 'duration_months' }
            ]}
          />
        )}
      </Modal>

      {/* Backup Modal */}
      <Modal
        title="Thực hiện Backup"
        open={backupModalVisible}
        onCancel={() => setBackupModalVisible(false)}
        onOk={handleStartBackup}
        okText="Bắt đầu"
        confirmLoading={backupSubmitting}
      >
        <div>
          <Text>Thực hiện backup toàn bộ hệ thống lên server cục bộ. (Mô phỏng)</Text>
        </div>
      </Modal>
    </div>
  );
};

export default SystemAdminHome;

