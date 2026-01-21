import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Table, 
  Tag, 
  Typography, 
  Space, 
  Card, 
  Row, 
  Col, 
  Input, 
  Select, 
  Tooltip, 
  Image, 
  Modal, 
  Button, 
  Statistic, 
  Spin,
  message
} from 'antd';
import { 
  SearchOutlined, 
  ReloadOutlined, 
  ExclamationCircleOutlined, 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  WarningOutlined,
  ArrowLeftOutlined,
  ArrowUpOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { RootState } from '../../../store';
import incidentService from '../../../services/incidentService';

const { Title, Text } = Typography;

interface IncidentItem {
  _id: string;
  incidentId?: string;
  title: string;
  description?: string;
  status?: string;
  severity?: string;
  location?: string;
  createdAt?: string;
  updatedAt?: string;
  images?: string[];
  assignedTo?: string | { _id: string; full_name?: string; username?: string };
  createdBy?: { _id: string; full_name?: string; username?: string };
}

const AssignedIncidents: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [incidents, setIncidents] = useState<IncidentItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    inProgress: 0,
    resolved: 0,
    critical: 0
  });
  const [refreshing, setRefreshing] = useState(false);

  const fetchAssignedIncidents = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      // Lấy incidents được phân công cho manager hiện tại
      const userId = user.id || (user as any)._id;
      const res = await incidentService.getIncidents(undefined, userId);
      const incidentsData = res.data?.success ? res.data.data : (Array.isArray(res.data) ? res.data : []);
      
      // Filter thêm ở frontend để đảm bảo (nếu backend chưa filter đúng)
      const assignedIncidents = incidentsData.filter((incident: IncidentItem) => {
        const assignedToId = typeof incident.assignedTo === 'object' 
          ? incident.assignedTo?._id 
          : incident.assignedTo;
        return assignedToId === userId;
      });
      
      setIncidents(assignedIncidents);
      
      // Tính stats
      const total = assignedIncidents.length;
      const inProgress = assignedIncidents.filter((i: IncidentItem) => 
        i.status === 'Đang xử lý'
      ).length;
      const resolved = assignedIncidents.filter((i: IncidentItem) => 
        i.status === 'Đã đóng'
      ).length;
      const critical = assignedIncidents.filter((i: IncidentItem) => 
        i.severity === 'rất nghiêm trọng' || i.severity === 'nặng'
      ).length;
      
      setStats({ total, inProgress, resolved, critical });
    } catch (err) {
      console.error('Failed to load assigned incidents', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAssignedIncidents();
    setRefreshing(false);
    message.success('Đã làm mới dữ liệu');
  };

  useEffect(() => {
    fetchAssignedIncidents();
  }, [user]);

  const openModal = (src: string) => {
    setModalImage(src);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalImage(null);
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity?.toLowerCase()) {
      case 'rất nghiêm trọng':
        return '#ff4d4f';
      case 'nặng':
        return '#fa8c16';
      case 'nhẹ':
        return '#52c41a';
      default:
        return '#d9d9d9';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'mới ghi nhận':
        return '#ff4d4f';
      case 'đang xử lý':
        return '#1677ff';
      case 'đã đóng':
        return '#52c41a';
      default:
        return '#d9d9d9';
    }
  };

  const capitalizeFirst = (str?: string) => {
    if (!str) return 'Chưa xác định';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const filteredIncidents = useMemo(() => {
    return incidents.filter((incident) => {
      const matchesSearch = !searchTerm ||
        incident.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.incidentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.location?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || (incident.status || '').toLowerCase() === statusFilter.toLowerCase();
      const matchesSeverity = !severityFilter || (incident.severity || '').toLowerCase() === severityFilter.toLowerCase();
      return matchesSearch && matchesStatus && matchesSeverity;
    });
  }, [incidents, searchTerm, statusFilter, severityFilter]);

  const columns: ColumnsType<IncidentItem> = [
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
        </div>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: unknown, record: IncidentItem) => {
        const isClosed = record.status === 'Đã đóng';
        
        if (isClosed) {
          return (
            <Space wrap>
              <Tooltip title="Xem lại quy trình giải quyết sự cố">
                <Button 
                  type="link" 
                  size="small" 
                  icon={<ClockCircleOutlined />}
                  onClick={() => navigate(`/manager/incidents/${record._id}/progress-history`)}
                >
                  Tiến độ
                </Button>
              </Tooltip>
            </Space>
          );
        }
        
        return (
          <Space wrap>
            <Tooltip title="Điều tra sự cố">
              <Button 
                type="link" 
                size="small" 
                icon={<SearchOutlined />}
                onClick={() => navigate(`/manager/incidents/${record._id}/investigate`)}
              >
                Điều tra
              </Button>
            </Tooltip>
            <Tooltip title="Xem tiến độ">
              <Button 
                type="link" 
                size="small" 
                icon={<ClockCircleOutlined />}
                onClick={() => navigate(`/manager/incidents/${record._id}/progress-history`)}
              >
                Tiến độ
              </Button>
            </Tooltip>
            <Tooltip title="Báo cáo vượt cấp sự cố">
              <Button 
                type="link" 
                size="small" 
                icon={<ArrowUpOutlined />}
                onClick={() => navigate(`/manager/incidents/${record._id}/escalate`)}
                style={{ color: '#ff4d4f' }}
              >
                Báo cáo vượt cấp
              </Button>
            </Tooltip>
          </Space>
        );
      },
    },
  ];

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
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 10px 30px rgba(24, 144, 255, 0.08)'
          }}
        >
          <Space style={{ marginBottom: '16px', width: '100%', justifyContent: 'space-between' }}>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/manager/dashboard')}>
              Quay lại
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={refreshing}
              type="default"
              style={{ borderRadius: 8 }}
            >
              Làm mới
            </Button>
          </Space>
          <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <SearchOutlined style={{ color: '#1677ff' }} /> Điều tra sự cố được phân công
          </Title>
          <Text type="secondary">
            Danh sách các sự cố được phân công cho bạn xử lý
          </Text>
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
                <Select.Option value="Mới ghi nhận">Mới ghi nhận</Select.Option>
                <Select.Option value="Đang xử lý">Đang xử lý</Select.Option>
                <Select.Option value="Đã đóng">Đã đóng</Select.Option>
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
                <Select.Option value="nhẹ">Nhẹ</Select.Option>
                <Select.Option value="nặng">Nặng</Select.Option>
                <Select.Option value="rất nghiêm trọng">Rất nghiêm trọng</Select.Option>
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
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px' }}>
              <Spin size="large" />
            </div>
          ) : filteredIncidents.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <ExclamationCircleOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
              <Text type="secondary">Không có sự cố nào được phân công cho bạn</Text>
            </div>
          ) : (
            <Table
              columns={columns}
              dataSource={filteredIncidents}
              rowKey="_id"
              bordered
              size="middle"
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
          )}
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

export default AssignedIncidents;

