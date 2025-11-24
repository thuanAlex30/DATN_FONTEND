import React, { useEffect, useState, useCallback } from 'react';
import { 
  Card, 
  Button, 
  Space,
  Table,
  Tag,
  Row,
  Col,
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
  SearchOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  ReloadOutlined
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

// const { Title } = Typography; // Title không còn dùng ở component con

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
        console.log('IncidentList API Response:', res);
        
        // ApiResponse.success() returns { success: true, data: [...], message: "...", timestamp: "..." }
        const incidentsData = res.data?.success ? res.data.data : (Array.isArray(res.data) ? res.data : []);
        
        console.log('Final incidents data:', incidentsData);
        setIncidents(incidentsData);
      } catch (err: any) {
        console.error('IncidentList fetch error:', err);
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

  // Get severity color (supports both EN and VI labels)
  const getSeverityColor = (severity: string) => {
    const value = (severity || '').toLowerCase();
    switch (value) {
      // English labels
      case 'critical':
        return '#ff4d4f';
      case 'high':
        return '#fa8c16';
      case 'medium':
        return '#fadb14';
      case 'low':
        return '#52c41a';
      // Vietnamese labels
      case 'rất nghiêm trọng':
        return '#ff4d4f';
      case 'nghiêm trọng':
        return '#fa541c';
      case 'nặng':
        return '#fa8c16';
      case 'trung bình':
        return '#fadb14';
      case 'nhẹ':
        return '#52c41a';
      default:
        return '#d9d9d9';
    }
  };

  // Get status color (supports both EN and VI labels)
  const getStatusColor = (status: string) => {
    const value = (status || '').toLowerCase();
    switch (value) {
      // English labels
      case 'open':
        return '#ff4d4f';
      case 'in_progress':
        return '#1677ff';
      case 'resolved':
        return '#52c41a';
      case 'closed':
        return '#8c8c8c';
      // Vietnamese labels
      case 'mới ghi nhận':
        return '#ff4d4f';
      case 'đang xử lý':
        return '#1677ff';
      case 'đã giải quyết':
        return '#52c41a';
      case 'đã đóng':
        return '#8c8c8c';
      default:
        return '#d9d9d9';
    }
  };

  // Capitalize first letter for display
  const capitalizeFirst = (text?: string) => {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
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
        <Tag
          bordered={false}
          style={{
            color: getSeverityColor(severity),
            background: 'transparent',
            border: 'none',
            padding: 0,
            fontWeight: 600
          }}
        >
          {capitalizeFirst(severity) || 'Chưa xác định'}
        </Tag>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag
          bordered={false}
          style={{
            color: getStatusColor(status),
            background: 'transparent',
            border: 'none',
            padding: 0,
            fontWeight: 600
          }}
        >
          {capitalizeFirst(status) || 'Chưa xác định'}
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
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {Array.isArray(images) && images.length > 0 ? (
            images.slice(0, 3).map((src, idx) => (
              <div
                key={idx}
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: '2px solid #f0f0f0',
                  cursor: 'pointer',
                  position: 'relative',
                  background: '#fafafa',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onClick={() => openModal(src)}
              >
                <img
                  src={src}
                  alt={`img-${idx}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                  loading="lazy"
                />
              </div>
            ))
          ) : (
            <span style={{ color: '#94a3b8' }}>—</span>
          )}
          {images && images.length > 3 && (
            <Tooltip title={`+${images.length - 3} hình khác`}>
              <div style={{ 
                width: 60, 
                height: 60, 
                background: 'linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%)', 
                borderRadius: '8px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '14px',
                color: '#666',
                fontWeight: '600',
                border: '2px solid #f0f0f0',
                cursor: 'pointer'
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
      {/* Filters */}
      <Card 
        styles={{ body: { padding: 16 } }}
        style={{ 
          marginBottom: 24,
          borderRadius: 16,
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(6px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.04)'
        }}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={8}>
            <Input
              placeholder="Tìm kiếm sự cố..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%' }}
              allowClear
              size="large"
            />
          </Col>
          <Col xs={24} md={6}>
            <Select
              placeholder="Lọc theo trạng thái"
              style={{ width: '100%' }}
              value={statusFilter || undefined}
              onChange={setStatusFilter}
              allowClear
              size="large"
            >
              <Select.Option value="open">Mở</Select.Option>
              <Select.Option value="in_progress">Đang xử lý</Select.Option>
              <Select.Option value="resolved">Đã giải quyết</Select.Option>
              <Select.Option value="closed">Đã đóng</Select.Option>
            </Select>
          </Col>
          <Col xs={24} md={6}>
            <Select
              placeholder="Lọc theo mức độ"
              style={{ width: '100%' }}
              value={severityFilter || undefined}
              onChange={setSeverityFilter}
              allowClear
              size="large"
            >
              <Select.Option value="critical">Nghiêm trọng</Select.Option>
              <Select.Option value="high">Cao</Select.Option>
              <Select.Option value="medium">Trung bình</Select.Option>
              <Select.Option value="low">Thấp</Select.Option>
            </Select>
          </Col>
          <Col xs={24} md={4} style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
                setSeverityFilter('');
              }}
              size="middle"
              shape="round"
            >
              Đặt lại
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Incidents Table */}
      <Card 
        styles={{ body: { padding: 0 } }}
        style={{ borderRadius: 16, overflow: 'hidden', boxShadow: '0 10px 26px rgba(0,0,0,0.05)' }}
      >
        <Table
          columns={columns}
          dataSource={filteredIncidents}
          rowKey="_id"
          bordered
          size="middle"
          sticky
          scroll={{ x: true }}
          locale={{
            emptyText: (
              <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                Không có sự cố nào phù hợp
              </div>
            )
          }}
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
