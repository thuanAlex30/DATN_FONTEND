import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Card, 
  Typography, 
  Button, 
  Space,
  Table,
  Tag,
  Avatar,
  Row,
  Col,
  Statistic,
  Spin,
  Alert,
  Badge,
  Tooltip
} from 'antd';
import { 
  ArrowLeftOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  UserOutlined,
  EyeOutlined
} from '@ant-design/icons';
import incidentService from '../../../../services/incidentService';
import projectService from '../../../../services/projectService';

const { Title, Text } = Typography;

interface Incident {
  _id: string;
  incidentId: string;
  title: string;
  description?: string;
  severity: 'nhẹ' | 'nặng' | 'rất nghiêm trọng';
  status: 'Mới ghi nhận' | 'Đang xử lý' | 'Đã đóng';
  location?: string;
  createdBy: {
    _id: string;
    full_name: string;
    username: string;
  };
  assignedTo?: {
    _id: string;
    full_name: string;
    username: string;
  };
  createdAt: string;
  histories?: Array<{
    action: string;
    performedBy: {
      _id: string;
      full_name: string;
      username: string;
    } | null;
    timestamp: string;
    note: string;
  }>;
}

interface ProjectIncidentsProps {
  projectId: string;
}

const ProjectIncidents: React.FC<ProjectIncidentsProps> = ({ projectId }) => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [incidentsResponse, projectResponse] = await Promise.all([
          incidentService.getIncidentsByProject(projectId),
          projectService.getProjectById(projectId)
        ]);
        
        setIncidents(incidentsResponse.data);
        setProject(projectResponse.data);
      } catch (err: any) {
        setError('Không thể tải dữ liệu sự cố');
        console.error('Error fetching incidents:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'nhẹ': return 'green';
      case 'nặng': return 'orange';
      case 'rất nghiêm trọng': return 'red';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Mới ghi nhận': return 'blue';
      case 'Đang xử lý': return 'orange';
      case 'Đã đóng': return 'green';
      default: return 'default';
    }
  };

  const columns = [
    {
      title: 'Mã sự cố',
      dataIndex: 'incidentId',
      key: 'incidentId',
      width: 120,
      render: (incidentId: string) => (
        <Text strong style={{ color: '#1890ff' }}>
          {incidentId}
        </Text>
      ),
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (title: string, record: Incident) => (
        <div>
          <Text strong>{title}</Text>
          {record.description && (
            <div>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {record.description.length > 50 
                  ? `${record.description.substring(0, 50)}...` 
                  : record.description}
              </Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Mức độ',
      dataIndex: 'severity',
      key: 'severity',
      width: 120,
      render: (severity: string) => (
        <Tag color={getSeverityColor(severity)}>
          {severity}
        </Tag>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Người báo cáo',
      dataIndex: 'createdBy',
      key: 'createdBy',
      width: 150,
      render: (createdBy: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Avatar size="small" icon={<UserOutlined />} />
          <div>
            <div style={{ fontSize: '12px', fontWeight: 500 }}>
              {createdBy?.full_name || 'N/A'}
            </div>
            <div style={{ fontSize: '11px', color: '#666' }}>
              {createdBy?.username || 'N/A'}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Người phụ trách',
      dataIndex: 'assignedTo',
      key: 'assignedTo',
      width: 150,
      render: (assignedTo: any) => (
        assignedTo ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Avatar size="small" icon={<UserOutlined />} />
            <div>
              <div style={{ fontSize: '12px', fontWeight: 500 }}>
                {assignedTo.full_name}
              </div>
              <div style={{ fontSize: '11px', color: '#666' }}>
                {assignedTo.username}
              </div>
            </div>
          </div>
        ) : (
          <Text type="secondary">Chưa phân công</Text>
        )
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date: string) => (
        <div>
          <div style={{ fontSize: '12px' }}>
            {new Date(date).toLocaleDateString('vi-VN')}
          </div>
          <div style={{ fontSize: '11px', color: '#666' }}>
            {new Date(date).toLocaleTimeString('vi-VN', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 100,
      render: (_: unknown, record: Incident) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button 
              type="link" 
              icon={<EyeOutlined />}
              onClick={() => window.open(`/admin/incident-management/${record._id}`, '_blank')}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Calculate statistics
  const stats = {
    total: incidents.length,
    new: incidents.filter(i => i.status === 'Mới ghi nhận').length,
    processing: incidents.filter(i => i.status === 'Đang xử lý').length,
    closed: incidents.filter(i => i.status === 'Đã đóng').length,
    critical: incidents.filter(i => i.severity === 'rất nghiêm trọng').length,
  };

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
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Space style={{ marginBottom: '16px' }}>
          <Button icon={<ArrowLeftOutlined />}>
            <Link to={`/admin/project-management/${projectId}`}>Quay lại dự án</Link>
          </Button>
        </Space>
        <Title level={2}>
          <ExclamationCircleOutlined /> Sự cố của dự án
        </Title>
        {project && (
          <Text type="secondary">
            Dự án: {project.project_name}
          </Text>
        )}
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Tổng sự cố"
              value={stats.total}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Mới ghi nhận"
              value={stats.new}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Đang xử lý"
              value={stats.processing}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Đã đóng"
              value={stats.closed}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Incidents Table */}
      <Card>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4}>Danh sách sự cố</Title>
          <Space>
            <Badge count={stats.critical} showZero>
              <Tag color="red">Nghiêm trọng: {stats.critical}</Tag>
            </Badge>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={incidents}
          rowKey="_id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} của ${total} sự cố`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>
    </div>
  );
};

export default ProjectIncidents;
