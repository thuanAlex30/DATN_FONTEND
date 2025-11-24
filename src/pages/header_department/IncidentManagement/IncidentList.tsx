import React, { useEffect, useState, useCallback } from 'react';
import { 
  Card, 
  Typography, 
  Button, 
  Space,
  Table,
  Tag,
  Row,
  Col,
  Statistic,
  Input,
  Select,
  Modal,
  message,
  Image,
  Spin,
  Alert,
  Tooltip
} from 'antd';
import { 
  ExclamationCircleOutlined, 
  SearchOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  ArrowUpOutlined
} from '@ant-design/icons';
import incidentService from '../../../services/incidentService';

interface IncidentItem {
  _id: string;
  incidentId?: string;
  title: string;
  description?: string;
  location?: string;
  severity?: string;
  status?: string;
  createdAt?: string;
  images?: string[];
}

const { Title } = Typography;

const IncidentList: React.FC = () => {
  const [incidents, setIncidents] = useState<IncidentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState<string | null>(null);

  const openModal = (src: string) => {
    setModalImage(src);
    setIsModalOpen(true);
  };

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setModalImage(null);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await incidentService.getIncidents();
        setIncidents(res.data);
      } catch (err: any) {
        setError('Không thể tải danh sách sự cố');
        message.error('Không thể tải danh sách sự cố');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter incidents
  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = !searchTerm || 
      incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.incidentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || incident.status === statusFilter;
    const matchesSeverity = !severityFilter || incident.severity === severityFilter;
    
    return matchesSearch && matchesStatus && matchesSeverity;
  });

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'yellow';
      case 'low': return 'green';
      default: return 'default';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'open': return 'red';
      case 'in_progress': return 'blue';
      case 'resolved': return 'green';
      case 'closed': return 'gray';
      default: return 'default';
    }
  };

  // Table columns
  const columns = [
    {
      title: 'Mã sự cố',
      dataIndex: 'incidentId',
      key: 'incidentId',
      render: (text: string) => text || '-',
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: IncidentItem) => (
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{text}</div>
          {record.description && (
            <div style={{ fontSize: '12px', color: '#666', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {record.description}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Vị trí',
      dataIndex: 'location',
      key: 'location',
      render: (text: string) => text || '-',
    },
    {
      title: 'Mức độ',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity: string) => (
        <Tag color={getSeverityColor(severity)}>
          {severity || 'Chưa xác định'}
        </Tag>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status || 'Chưa xác định'}
        </Tag>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => date ? new Date(date).toLocaleString('vi-VN') : '-',
    },
    {
      title: 'Hình ảnh',
      dataIndex: 'images',
      key: 'images',
      render: (images: string[]) => (
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {Array.isArray(images) && images.length > 0 ? (
            images.slice(0, 3).map((src, idx) => (
              <Image
                key={idx}
                src={src}
                alt={`img-${idx}`}
                width={40}
                height={40}
                style={{ borderRadius: '4px', cursor: 'pointer' }}
                preview={{
                  src: src,
                  onVisibleChange: (visible) => {
                    if (visible) openModal(src);
                  }
                }}
              />
            ))
          ) : (
            <span style={{ color: '#94a3b8' }}>—</span>
          )}
          {images && images.length > 3 && (
            <Tooltip title={`+${images.length - 3} hình khác`}>
              <div style={{ 
                width: 40, 
                height: 40, 
                background: '#f5f5f5', 
                borderRadius: '4px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '12px',
                color: '#666'
              }}>
                +{images.length - 3}
              </div>
            </Tooltip>
          )}
        </div>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: unknown, record: IncidentItem) => (
        <Space wrap>
          <Tooltip title="Phân loại sự cố">
            <Button 
              type="link" 
              size="small" 
              icon={<WarningOutlined />}
              href={`/header-department/incident-management/${record._id}/classify`}
            >
              Phân loại
            </Button>
          </Tooltip>
          <Tooltip title="Phân công xử lý">
            <Button 
              type="link" 
              size="small" 
              icon={<InfoCircleOutlined />}
              href={`/header-department/incident-management/${record._id}/assign`}
            >
              Phân công
            </Button>
          </Tooltip>
          <Tooltip title="Điều tra sự cố">
            <Button 
              type="link" 
              size="small" 
              icon={<SearchOutlined />}
              href={`/header-department/incident-management/${record._id}/investigate`}
            >
              Điều tra
            </Button>
          </Tooltip>
          <Tooltip title="Xem tiến độ">
            <Button 
              type="link" 
              size="small" 
              icon={<ClockCircleOutlined />}
              href={`/header-department/incident-management/${record._id}/progress-history`}
            >
              Tiến độ
            </Button>
          </Tooltip>
          <Tooltip title="Escalate sự cố">
            <Button 
              type="link" 
              size="small" 
              danger
              icon={<ArrowUpOutlined />}
              href={`/header-department/incident-management/${record._id}/escalate`}
            >
              Escalate
            </Button>
          </Tooltip>
          <Tooltip title="Đóng sự cố">
            <Button 
              type="link" 
              size="small" 
              danger
              icon={<CloseCircleOutlined />}
              href={`/header-department/incident-management/${record._id}/close`}
            >
              Đóng
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

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
        <Title level={2}>
          <ExclamationCircleOutlined /> Danh sách sự cố
        </Title>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Tổng sự cố"
              value={incidents.length}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Đang xử lý"
              value={incidents.filter(i => i.status === 'in_progress').length}
              valueStyle={{ color: '#1890ff' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Đã đóng"
              value={incidents.filter(i => i.status === 'closed').length}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8}>
            <Input
              placeholder="Tìm kiếm sự cố..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} sm={8}>
            <Select
              placeholder="Lọc theo trạng thái"
              style={{ width: '100%' }}
              value={statusFilter}
              onChange={setStatusFilter}
              allowClear
            >
              <Select.Option value="open">Mở</Select.Option>
              <Select.Option value="in_progress">Đang xử lý</Select.Option>
              <Select.Option value="resolved">Đã giải quyết</Select.Option>
              <Select.Option value="closed">Đã đóng</Select.Option>
            </Select>
          </Col>
          <Col xs={24} sm={8}>
            <Select
              placeholder="Lọc theo mức độ"
              style={{ width: '100%' }}
              value={severityFilter}
              onChange={setSeverityFilter}
              allowClear
            >
              <Select.Option value="critical">Nghiêm trọng</Select.Option>
              <Select.Option value="high">Cao</Select.Option>
              <Select.Option value="medium">Trung bình</Select.Option>
              <Select.Option value="low">Thấp</Select.Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Incidents Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredIncidents}
          rowKey="_id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} của ${total} sự cố`,
          }}
        />
      </Card>

      {/* Image Preview Modal */}
      <Modal
        title="Xem hình ảnh"
        open={isModalOpen}
        onCancel={closeModal}
        footer={null}
        width="auto"
        centered
      >
        {modalImage && (
          <Image
            src={modalImage}
            alt="preview"
            style={{ maxWidth: '100%', maxHeight: '80vh' }}
          />
        )}
      </Modal>
    </div>
  );
};

export default IncidentList;
