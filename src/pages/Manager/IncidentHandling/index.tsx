import React, { useEffect, useMemo, useState } from 'react';
import { Table, Tag, Typography, Space, Card, Row, Col, Input, Select, Tooltip, Image, Modal, Button, Statistic, Alert, Layout } from 'antd';
import { SearchOutlined, ReloadOutlined, ExclamationCircleOutlined, ClockCircleOutlined, CheckCircleOutlined, WarningOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import incidentService from '../../../services/incidentService';
import ManagerSidebar from '../../../components/Manager/ManagerSidebar';

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
}

const statusColorMap: Record<string, string> = {
  new: 'blue',
  identified: 'blue',
  investigating: 'gold',
  in_progress: 'orange',
  resolved: 'green',
  closed: 'green'
};

const severityColorMap: Record<string, string> = {
  low: 'green',
  medium: 'orange',
  high: 'volcano',
  critical: 'red'
};

// SLA time limits per ISO 45001-inspired standards (configurable)
// Values are in minutes
const SLA_LIMITS_MINUTES: Record<string, number> = {
  // English labels
  critical: 8 * 60, // 8 hours
  high: 24 * 60,    // 24 hours
  medium: 48 * 60,  // 2 days
  low: 72 * 60,     // 3 days
  // Vietnamese labels mapping
  'rất nghiêm trọng': 8 * 60,
  'nghiêm trọng': 24 * 60,
  'nặng': 24 * 60,
  'trung bình': 48 * 60,
  'nhẹ': 72 * 60
};

const ManagerIncidentHandling: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [incidents, setIncidents] = useState<IncidentItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        setLoading(true);
        const res = await incidentService.getIncidents();
        const data = res.data?.success ? res.data.data : (Array.isArray(res.data) ? res.data : []);
        setIncidents(data);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to load incidents', err);
      } finally {
        setLoading(false);
      }
    };

    fetchIncidents();
  }, []);

  const openModal = (src: string) => {
    setModalImage(src);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalImage(null);
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

  const stats = useMemo(() => {
    const incidentsArray = Array.isArray(incidents) ? incidents : [];
    const toLower = (v?: string) => (v || '').toLowerCase();
    const total = incidentsArray.length;
    const inProgress = incidentsArray.filter((i) => {
      const s = toLower(i.status);
      return s === 'in_progress' || s === 'investigating' || s === 'đang xử lý';
    }).length;
    const resolved = incidentsArray.filter((i) => {
      const s = toLower(i.status);
      return s === 'resolved' || s === 'closed' || s === 'đã giải quyết' || s === 'đã đóng';
    }).length;
    const critical = incidentsArray.filter((i) => {
      const sev = toLower(i.severity);
      return sev === 'critical' || sev === 'rất nghiêm trọng' || sev === 'nghiêm trọng';
    }).length;
    // Overdue unresolved incidents based on SLA
    const overdueUnresolved = incidentsArray.filter((i) => {
      const s = toLower(i.status);
      const isClosed = s === 'resolved' || s === 'closed' || s === 'đã giải quyết' || s === 'đã đóng';
      if (isClosed) return false;
      const created = i.createdAt ? new Date(i.createdAt).getTime() : NaN;
      const slaMin = SLA_LIMITS_MINUTES[toLower(i.severity || '')] ?? 0;
      if (!Number.isFinite(created) || !slaMin) return false;
      const deadline = created + slaMin * 60 * 1000;
      return Date.now() > deadline;
    }).length;
    return { total, inProgress, resolved, critical, overdueUnresolved };
  }, [incidents]);

  const formatDuration = (ms: number) => {
    if (!Number.isFinite(ms) || ms < 0) return '-';
    const minutes = Math.floor(ms / 60000);
    const days = Math.floor(minutes / (60 * 24));
    const hours = Math.floor((minutes % (60 * 24)) / 60);
    const mins = minutes % 60;
    const parts: string[] = [];
    if (days) parts.push(`${days} ngày`);
    if (hours) parts.push(`${hours} giờ`);
    parts.push(`${mins} phút`);
    return parts.join(' ');
  };

  const computeProcessingTimeMs = (record: IncidentItem) => {
    const start = record.createdAt ? new Date(record.createdAt).getTime() : NaN;
    const normalizedStatus = (record.status || '').toLowerCase();
    const isClosed = ['đã đóng', 'closed', 'đã giải quyết', 'resolved'].includes(normalizedStatus);
    const end = isClosed
      ? (record.updatedAt ? new Date(record.updatedAt).getTime() : Date.now())
      : Date.now();
    if (!Number.isFinite(start) || !Number.isFinite(end)) return NaN;
    return Math.max(0, end - start);
  };

  const getSlaMinutesForRecord = (record: IncidentItem) => {
    const key = (record.severity || '').toLowerCase();
    return SLA_LIMITS_MINUTES[key] ?? 0;
  };

  const renderProcessingTimeCell = (record: IncidentItem) => {
    const elapsedMs = computeProcessingTimeMs(record);
    const slaMin = getSlaMinutesForRecord(record);
    const slaMs = slaMin * 60 * 1000;
    const remainingMs = slaMs ? slaMs - elapsedMs : NaN;
    const status = (record.status || '').toLowerCase();
    const isClosed = ['đã đóng', 'closed', 'đã giải quyết', 'resolved'].includes(status);

    const durationText = formatDuration(elapsedMs);

    if (isClosed) {
      return (
        <Space size={6}>
          <span>{durationText}</span>
          {slaMs ? (
            remainingMs >= 0 ? (
              <Tag color="green">Hoàn tất trong SLA</Tag>
            ) : (
              <Tag color="gold">Hoàn tất quá SLA</Tag>
            )
          ) : null}
        </Space>
      );
    }

    if (!slaMs || !Number.isFinite(remainingMs)) {
      return <span>{durationText}</span>;
    }

    return (
      <Space size={6}>
        <span>{durationText}</span>
        {remainingMs >= 0 ? (
          <Tooltip title={`Còn lại ${formatDuration(remainingMs)}`}>
            <Tag color="blue">Trong SLA</Tag>
          </Tooltip>
        ) : (
          <Tooltip title={`Quá hạn ${formatDuration(Math.abs(remainingMs))}`}>
            <Tag color="red">Quá hạn</Tag>
          </Tooltip>
        )}
      </Space>
    );
  };

  const columns: ColumnsType<IncidentItem> = [
    {
      title: 'Mã sự cố',
      dataIndex: 'incidentId',
      key: 'incidentId',
      width: 160,
      render: (val: string, record) => val || record._id
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (text: string, record) => (
        <div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>{text}</div>
          {record.description && (
            <div style={{ fontSize: 12, color: '#666', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {record.description}
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Vị trí',
      dataIndex: 'location',
      key: 'location',
      ellipsis: true
    },
    {
      title: 'Mức độ',
      dataIndex: 'severity',
      key: 'severity',
      width: 140,
      render: (severity?: string) => (
        <Tag color={severity ? severityColorMap[severity] || 'default' : 'default'}>
          {severity ? severity.charAt(0).toUpperCase() + severity.slice(1) : 'Chưa rõ'}
        </Tag>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 160,
      render: (status?: string) => (
        <Tag color={status ? statusColorMap[status] || 'default' : 'default'}>
          {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Chưa rõ'}
        </Tag>
      )
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 200,
      render: (val?: string) => (val ? new Date(val).toLocaleString('vi-VN') : '-')
    },
    {
      title: 'Hình ảnh',
      dataIndex: 'images',
      key: 'images',
      width: 180,
      render: (images?: string[]) => (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {Array.isArray(images) && images.length > 0 ? (
            images.slice(0, 3).map((src, idx) => (
              <div
                key={idx}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 6,
                  overflow: 'hidden',
                  border: '1px solid #f0f0f0',
                  cursor: 'pointer',
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
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
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
                width: 40,
                height: 40,
                background: 'linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%)',
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                color: '#666',
                fontWeight: 600,
                border: '1px solid #f0f0f0',
                cursor: 'default'
              }}>
                +{images.length - 3}
              </div>
            </Tooltip>
          )}
        </div>
      )
    },
    {
      title: 'Thời gian xử lý (ISO 45001)',
      key: 'processingTime',
      width: 220,
      render: (_: unknown, record) => renderProcessingTimeCell(record),
      sorter: (a, b) => computeProcessingTimeMs(a) - computeProcessingTimeMs(b)
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)' }}>
      <ManagerSidebar />
      <Layout.Content 
        style={{ 
          padding: 24, 
          marginLeft: 280, // keep in sync with ManagerSidebar width
          transition: 'margin-left .2s ease'
        }}
      >
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card
        styles={{ body: { padding: '20px 24px' } }}
        style={{
          marginBottom: 16,
          borderRadius: 16,
          background: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 10px 30px rgba(24, 144, 255, 0.08)'
        }}
      >
        <Typography.Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <ExclamationCircleOutlined style={{ color: '#1677ff' }} /> Xử lý sự cố
        </Typography.Title>
      </Card>

      {/* Stats Overview */}
      <Row gutter={[16, 16]} style={{ marginBottom: 8 }}>
        <Col xs={24} sm={6}>
          <Card styles={{ body: { padding: 16 } }} style={{ borderRadius: 14 }}>
            <Statistic title="Tổng sự cố" value={stats.total} prefix={<ExclamationCircleOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card styles={{ body: { padding: 16 } }} style={{ borderRadius: 14 }}>
            <Statistic title="Đang xử lý" value={stats.inProgress} valueStyle={{ color: '#1677ff' }} prefix={<ClockCircleOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card styles={{ body: { padding: 16 } }} style={{ borderRadius: 14 }}>
            <Statistic title="Đã giải quyết" value={stats.resolved} valueStyle={{ color: '#52c41a' }} prefix={<CheckCircleOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card styles={{ body: { padding: 16 } }} style={{ borderRadius: 14 }}>
            <Statistic title="Nghiêm trọng" value={stats.critical} valueStyle={{ color: '#ff4d4f' }} prefix={<WarningOutlined />} />
          </Card>
        </Col>
      </Row>

      {stats.overdueUnresolved > 0 && (
        <Alert
          type="warning"
          showIcon
          message={`Có ${stats.overdueUnresolved} sự cố chưa được xử lý đúng hạn (quá SLA).`}
          description="Vui lòng ưu tiên xử lý các sự cố quá hạn để tuân thủ tiêu chuẩn ISO 45001."
          style={{ marginTop: -8 }}
        />
      )}

      <Card styles={{ body: { padding: 16 } }} style={{ borderRadius: 12 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={10}>
            <Input
              placeholder="Tìm kiếm sự cố..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
              size="middle"
            />
          </Col>
          <Col xs={24} md={7}>
            <Select
              placeholder="Lọc theo trạng thái"
              style={{ width: '100%' }}
              value={statusFilter || undefined}
              onChange={setStatusFilter}
              allowClear
              size="middle"
              options={[
                { value: 'open', label: 'Mở' },
                { value: 'in_progress', label: 'Đang xử lý' },
                { value: 'resolved', label: 'Đã giải quyết' },
                { value: 'closed', label: 'Đã đóng' },
                { value: 'mới ghi nhận', label: 'Mới ghi nhận' },
                { value: 'đang xử lý', label: 'Đang xử lý (VI)' },
                { value: 'đã giải quyết', label: 'Đã giải quyết (VI)' },
                { value: 'đã đóng', label: 'Đã đóng (VI)' }
              ]}
            />
          </Col>
          <Col xs={24} md={5}>
            <Select
              placeholder="Lọc theo mức độ"
              style={{ width: '100%' }}
              value={severityFilter || undefined}
              onChange={setSeverityFilter}
              allowClear
              size="middle"
              options={[
                { value: 'critical', label: 'Nghiêm trọng' },
                { value: 'high', label: 'Cao' },
                { value: 'medium', label: 'Trung bình' },
                { value: 'low', label: 'Thấp' },
                { value: 'rất nghiêm trọng', label: 'Rất nghiêm trọng (VI)' },
                { value: 'nghiêm trọng', label: 'Nghiêm trọng (VI)' },
                { value: 'nặng', label: 'Nặng (VI)' },
                { value: 'trung bình', label: 'Trung bình (VI)' },
                { value: 'nhẹ', label: 'Nhẹ (VI)' }
              ]}
            />
          </Col>
          <Col xs={24} md={2} style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => { setSearchTerm(''); setStatusFilter(''); setSeverityFilter(''); }}
            >
              Đặt lại
            </Button>
          </Col>
        </Row>
      </Card>

      <Card styles={{ body: { padding: 0 } }} style={{ borderRadius: 12, overflow: 'hidden' }}>
        <Table
          rowKey={(r) => r._id}
          loading={loading}
          columns={columns}
          dataSource={filteredIncidents}
          pagination={{ pageSize: 10, showSizeChanger: true }}
        />
      </Card>

      <Modal
        title="Xem hình ảnh"
        open={isModalOpen}
        onCancel={closeModal}
        footer={null}
        width="auto"
        centered
      >
        {modalImage && (
          <Image src={modalImage} alt="preview" style={{ maxWidth: '100%', maxHeight: '80vh' }} />
        )}
      </Modal>
    </Space>
      </Layout.Content>
    </Layout>
  );
};

export default ManagerIncidentHandling;


