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
      
      try {
        // Add timeout wrapper
        const statsPromise = incidentService.getIncidentStats();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 20000)
        );
        
        const statsResponse = await Promise.race([statsPromise, timeoutPromise]) as any;
        
        if (statsResponse?.data && statsResponse.data.success) {
          const statsData = statsResponse.data.data;
          setStats({
            total: statsData.total || 0,
            inProgress: (statsData.byStatus?.['Đang xử lý'] || 0),
            resolved: (statsData.byStatus?.['Đã đóng'] || 0),
            // "Nghiêm trọng" chỉ đếm "rất nghiêm trọng", sử dụng giá trị từ backend
            critical: statsData.critical || (statsData.bySeverity?.['rất nghiêm trọng'] || 0)
          });
          return;
        }
      } catch (statsError: any) {
        if (statsError.code === 'ECONNABORTED' || statsError.message?.includes('timeout') || statsError.message === 'Request timeout') {
          console.error('Stats API timeout');
          // Don't set error, just use default values to allow page to load
          setStats({
            total: 0,
            inProgress: 0,
            resolved: 0,
            critical: 0
          });
          setError('Yêu cầu mất quá nhiều thời gian. Dữ liệu có thể không đầy đủ.');
          return;
        }
        if (statsError.response?.status === 429) {
          console.warn('Rate limit reached for stats API');
          setError('Quá nhiều yêu cầu. Vui lòng thử lại sau vài giây.');
          return;
        }
        console.log('Stats API failed, using default values');
        setStats({
          total: 0,
          inProgress: 0,
          resolved: 0,
          critical: 0
        });
      }
    } catch (err: any) {
      console.error('Error loading incident stats:', err);
      setStats({
        total: 0,
        inProgress: 0,
        resolved: 0,
        critical: 0
      });
      setError(err.message || 'Không thể tải thống kê sự cố');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      if (isMounted) {
        await loadIncidentStats();
      }
    };
    
    loadData();
    
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading && stats.total === 0 && stats.inProgress === 0 && stats.resolved === 0 && stats.critical === 0) {
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
      padding: '24px'
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
