import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Row,
  Col,
  Statistic,
  Spin,
  Alert
} from 'antd';
import { 
  ExclamationCircleOutlined, 
  ClockCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined
} from '@ant-design/icons';
import IncidentList from './IncidentList';
import incidentService from '../../../services/incidentService';

const { Title } = Typography;

const IncidentManagement: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    inProgress: 0,
    resolved: 0,
    critical: 0
  });

  const loadIncidentStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await incidentService.getIncidents();
      const incidents = response.data || [];
      
      const total = incidents.length;
      const inProgress = incidents.filter((incident: any) => 
        incident.status === 'in_progress' || incident.status === 'investigating'
      ).length;
      const resolved = incidents.filter((incident: any) => 
        incident.status === 'resolved' || incident.status === 'closed'
      ).length;
      const critical = incidents.filter((incident: any) => 
        incident.severity === 'critical' || incident.priority === 'high'
      ).length;

      setStats({
        total,
        inProgress,
        resolved,
        critical
      });
    } catch (err: any) {
      setError(err.message || 'Không thể tải thống kê sự cố');
      console.error('Error loading incident stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidentStats();
  }, []);

  if (loading) {
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
            <button onClick={loadIncidentStats}>
              Thử lại
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>
          <ExclamationCircleOutlined /> Quản lý sự cố
        </Title>
      </div>

      {/* Stats Overview */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Tổng sự cố"
              value={stats.total}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Đang xử lý"
              value={stats.inProgress}
              valueStyle={{ color: '#1890ff' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Đã giải quyết"
              value={stats.resolved}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Nghiêm trọng"
              value={stats.critical}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Incident List */}
      <IncidentList />
    </div>
  );
};

export default IncidentManagement;
