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
      
      // Try to get stats from dedicated API first
      try {
        const statsResponse = await incidentService.getIncidentStats();
        if (statsResponse.data && statsResponse.data.success) {
          setStats({
            total: statsResponse.data.data.total || 0,
            inProgress: statsResponse.data.data.inProgress || 0,
            resolved: statsResponse.data.data.resolved || 0,
            critical: statsResponse.data.data.critical || 0
          });
          return;
        }
      } catch (statsError) {
        console.log('Stats API failed, falling back to incidents list');
      }
      
      // Fallback to incidents list
      const response = await incidentService.getIncidents();
      const incidents = Array.isArray(response.data) ? response.data : [];
      
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
    <div style={{ 
      padding: '24px', 
      background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <Card
        styles={{ body: { padding: '20px 24px' } }}
        style={{
          marginBottom: 24,
          borderRadius: 16,
          background: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 10px 30px rgba(24, 144, 255, 0.08)'
        }}
      >
        <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <ExclamationCircleOutlined style={{ color: '#1677ff' }} /> Quản lý sự cố
        </Title>
      </Card>

      {/* Stats Overview */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={6}>
          <Card
            styles={{ body: { padding: 16 } }}
            style={{ borderRadius: 14, boxShadow: '0 6px 18px rgba(22,119,255,0.06)' }}
          >
            <Statistic
              title="Tổng sự cố"
              value={stats.total}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card
            styles={{ body: { padding: 16 } }}
            style={{ borderRadius: 14, boxShadow: '0 6px 18px rgba(24,144,255,0.06)' }}
          >
            <Statistic
              title="Đang xử lý"
              value={stats.inProgress}
              valueStyle={{ color: '#1890ff' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card
            styles={{ body: { padding: 16 } }}
            style={{ borderRadius: 14, boxShadow: '0 6px 18px rgba(82,196,26,0.06)' }}
          >
            <Statistic
              title="Đã giải quyết"
              value={stats.resolved}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card
            styles={{ body: { padding: 16 } }}
            style={{ borderRadius: 14, boxShadow: '0 6px 18px rgba(255,77,79,0.06)' }}
          >
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
