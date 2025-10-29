import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Row,
  Col,
  Statistic,
  Spin,
  Alert,
  Table,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Modal,
  message,
  Tooltip,
  Popconfirm,
  Image,
  Descriptions,
  Empty
} from 'antd';
import { 
  SafetyCertificateOutlined, 
  CheckCircleOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import certificateService from '../../../services/certificateService';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

// Helper functions
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('vi-VN');
};

interface Certificate {
  _id: string;
  certificateName: string;
  certificateCode: string;
  description?: string;
  category: 'SAFETY' | 'TECHNICAL' | 'MANAGEMENT' | 'QUALITY' | 'ENVIRONMENTAL' | 'HEALTH' | 'OTHER';
  subCategory?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  issuingAuthority: string;
  legalBasis?: string;
  applicableRegulations?: string[];
  validityPeriod: number;
  validityPeriodUnit: 'MONTHS' | 'YEARS';
  renewalRequired: boolean;
  renewalProcess?: string;
  renewalDocuments?: string[];
  cost: number;
  currency: string;
  contactInfo: {
    organization?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
  };
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'EXPIRED';
  reminderSettings: {
    enabled: boolean;
    reminderDays: number[];
    notificationMethods: ('EMAIL' | 'SMS' | 'SYSTEM')[];
    recipients: string[];
  };
  attachments: Array<{
    _id: string;
    fileName: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
    uploadedAt: string;
    uploadedBy: string;
  }>;
  createdBy: string;
  updatedBy?: string;
  tags: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  issueDate?: string;
  expiryDate?: string;
  lastRenewalDate?: string;
  renewalNotes?: string;
}

const CertificateManagement: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalImage, setModalImage] = useState<string | null>(null);

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    expired: 0
  });

  // Load certificates
  const loadCertificates = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await certificateService.getCertificates();
      console.log('CertificateList API Response:', res);
      
      // Handle response like IncidentList does
      let certificatesData = [];
      
      if (res.data?.success && res.data?.data) {
        if (Array.isArray(res.data.data)) {
          // Direct array: data.data (like incident)
          certificatesData = res.data.data;
        } else if (res.data.data && typeof res.data.data === 'object' && Array.isArray(res.data.data.data)) {
          // Nested array: data.data.data (certificate with pagination)
          certificatesData = res.data.data.data;
        } else {
          certificatesData = [];
        }
      } else {
        certificatesData = [];
      }
      
      console.log('Final certificates data:', certificatesData);
      console.log('Certificates data type:', typeof certificatesData);
      console.log('Certificates data is array:', Array.isArray(certificatesData));
      console.log('Certificates data length:', Array.isArray(certificatesData) ? certificatesData.length : 'Not array');
      if (Array.isArray(certificatesData) && certificatesData.length > 0) {
        console.log('First certificate structure:', certificatesData[0]);
        console.log('First certificate keys:', Object.keys(certificatesData[0]));
      }
      setCertificates(certificatesData);
      
      // Calculate stats - ensure certificatesData is array
      const total = Array.isArray(certificatesData) ? certificatesData.length : 0;
      const active = Array.isArray(certificatesData) ? certificatesData.filter((cert: any) => cert.status === 'ACTIVE').length : 0;
      const inactive = Array.isArray(certificatesData) ? certificatesData.filter((cert: any) => cert.status === 'INACTIVE').length : 0;
      const expired = Array.isArray(certificatesData) ? certificatesData.filter((cert: any) => cert.status === 'EXPIRED').length : 0;
      
      setStats({ total, active, inactive, expired });
    } catch (err: any) {
      console.error('CertificateList fetch error:', err);
      setError('Không thể tải danh sách chứng chỉ');
      message.error('Không thể tải danh sách chứng chỉ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCertificates();
  }, []);

  // Filter certificates - ensure certificates is an array
  const filteredCertificates = Array.isArray(certificates) ? certificates.filter(certificate => {
    const matchesSearch = !searchTerm || 
      certificate.certificateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      certificate.certificateCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      certificate.issuingAuthority.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !categoryFilter || certificate.category === categoryFilter;
    const matchesStatus = !statusFilter || certificate.status === statusFilter;
    const matchesPriority = !priorityFilter || certificate.priority === priorityFilter;
    
    return matchesSearch && matchesCategory && matchesStatus && matchesPriority;
  }) : [];

  // Get category label
  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'SAFETY': 'An toàn lao động',
      'TECHNICAL': 'Kỹ thuật',
      'MANAGEMENT': 'Quản lý',
      'QUALITY': 'Chất lượng',
      'ENVIRONMENTAL': 'Môi trường',
      'HEALTH': 'Sức khỏe',
      'OTHER': 'Khác'
    };
    return labels[category] || category;
  };

  // Get status color
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'ACTIVE': 'green',
      'INACTIVE': 'default',
      'SUSPENDED': 'orange',
      'EXPIRED': 'red'
    };
    return colors[status] || 'default';
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      'LOW': 'green',
      'MEDIUM': 'blue',
      'HIGH': 'orange',
      'CRITICAL': 'red'
    };
    return colors[priority] || 'default';
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    const icons: Record<string, React.ReactNode> = {
      'ACTIVE': <CheckCircleOutlined />,
      'INACTIVE': <ClockCircleOutlined />,
      'SUSPENDED': <WarningOutlined />,
      'EXPIRED': <ExclamationCircleOutlined />
    };
    return icons[status] || <InfoCircleOutlined />;
  };

  // Handle view certificate
  const handleViewCertificate = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
    setModalVisible(true);
  };

  // Handle delete certificate
  const handleDeleteCertificate = async (id: string) => {
    try {
      await certificateService.deleteCertificate(id);
      message.success('Xóa chứng chỉ thành công');
      setCertificates(certificates.filter(cert => cert._id !== id));
    } catch (err: any) {
      message.error('Không thể xóa chứng chỉ');
      console.error('Delete certificate error:', err);
    }
  };

  // Close image modal
  const closeImageModal = () => {
    setModalImage(null);
  };

  // Columns definition
  const columns = [
    {
      title: 'Tên chứng chỉ',
      dataIndex: 'certificateName',
      key: 'certificateName',
      width: 200,
      render: (text: string, record: Certificate) => (
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.certificateCode}</div>
        </div>
      ),
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (category: string) => (
        <Tag color="blue">{getCategoryLabel(category)}</Tag>
      ),
    },
    {
      title: 'Cơ quan cấp',
      dataIndex: 'issuingAuthority',
      key: 'issuingAuthority',
      width: 150,
      render: (text: string) => (
        <div style={{ fontSize: '12px' }}>{text}</div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Mức độ',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (priority: string) => (
        <Tag color={getPriorityColor(priority)}>
          {priority}
        </Tag>
      ),
    },
    {
      title: 'Chi phí',
      dataIndex: 'cost',
      key: 'cost',
      width: 120,
      render: (cost: number, record: Certificate) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{formatCurrency(cost)}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.currency}</div>
        </div>
      ),
    },
    {
      title: 'Ngày cấp',
      dataIndex: 'issueDate',
      key: 'issueDate',
      width: 120,
      render: (date: string) => date ? formatDate(date) : '-',
    },
    {
      title: 'Ngày hết hạn',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      width: 120,
      render: (date: string) => date ? formatDate(date) : '-',
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      render: (_: any, record: Certificate) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewCertificate(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => {
                message.info('Chức năng chỉnh sửa đang phát triển');
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa chứng chỉ này?"
            onConfirm={() => handleDeleteCertificate(record._id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Tooltip title="Xóa">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
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
          action={
            <button onClick={loadCertificates}>
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
          <SafetyCertificateOutlined style={{ color: '#1677ff' }} /> Quản lý chứng chỉ
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
              title="Tổng chứng chỉ"
              value={stats.total}
              prefix={<SafetyCertificateOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card
            styles={{ body: { padding: 16 } }}
            style={{ borderRadius: 14, boxShadow: '0 6px 18px rgba(24,144,255,0.06)' }}
          >
            <Statistic
              title="Đang hoạt động"
              value={stats.active}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card
            styles={{ body: { padding: 16 } }}
            style={{ borderRadius: 14, boxShadow: '0 6px 18px rgba(82,196,26,0.06)' }}
          >
            <Statistic
              title="Không hoạt động"
              value={stats.inactive}
              valueStyle={{ color: '#8c8c8c' }}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card
            styles={{ body: { padding: 16 } }}
            style={{ borderRadius: 14, boxShadow: '0 6px 18px rgba(255,77,79,0.06)' }}
          >
            <Statistic
              title="Hết hạn"
              value={stats.expired}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col span={6}>
            <Search
              placeholder="Tìm kiếm chứng chỉ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onSearch={setSearchTerm}
              enterButton={<SearchOutlined />}
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="Danh mục"
              value={categoryFilter}
              onChange={setCategoryFilter}
              style={{ width: '100%' }}
              allowClear
            >
              <Option value="SAFETY">An toàn lao động</Option>
              <Option value="TECHNICAL">Kỹ thuật</Option>
              <Option value="MANAGEMENT">Quản lý</Option>
              <Option value="QUALITY">Chất lượng</Option>
              <Option value="ENVIRONMENTAL">Môi trường</Option>
              <Option value="HEALTH">Sức khỏe</Option>
              <Option value="OTHER">Khác</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Select
              placeholder="Trạng thái"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: '100%' }}
              allowClear
            >
              <Option value="ACTIVE">Đang hoạt động</Option>
              <Option value="INACTIVE">Không hoạt động</Option>
              <Option value="SUSPENDED">Tạm dừng</Option>
              <Option value="EXPIRED">Đã hết hạn</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Select
              placeholder="Mức độ"
              value={priorityFilter}
              onChange={setPriorityFilter}
              style={{ width: '100%' }}
              allowClear
            >
              <Option value="LOW">Thấp</Option>
              <Option value="MEDIUM">Trung bình</Option>
              <Option value="HIGH">Cao</Option>
              <Option value="CRITICAL">Nghiêm trọng</Option>
            </Select>
          </Col>
          <Col span={6}>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => window.location.reload()}
              >
                Tải lại
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  message.info('Chức năng tạo chứng chỉ đang phát triển');
                }}
              >
                Tạo mới
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredCertificates}
          rowKey={(record) => record._id || (record as any).id || record.certificateCode || Math.random().toString()}
          loading={loading}
          pagination={{
            total: filteredCertificates.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} chứng chỉ`,
          }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Không có chứng chỉ nào"
              />
            ),
          }}
        />
      </Card>

      {/* Certificate Detail Modal */}
      <Modal
        title="Chi tiết chứng chỉ"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={800}
      >
        {selectedCertificate && (
          <div>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="Tên chứng chỉ" span={2}>
                {selectedCertificate.certificateName}
              </Descriptions.Item>
              <Descriptions.Item label="Mã chứng chỉ">
                {selectedCertificate.certificateCode}
              </Descriptions.Item>
              <Descriptions.Item label="Danh mục">
                <Tag color="blue">{getCategoryLabel(selectedCertificate.category)}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Cơ quan cấp">
                {selectedCertificate.issuingAuthority}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={getStatusColor(selectedCertificate.status)}>
                  {selectedCertificate.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Mức độ">
                <Tag color={getPriorityColor(selectedCertificate.priority)}>
                  {selectedCertificate.priority}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Chi phí">
                {formatCurrency(selectedCertificate.cost)} {selectedCertificate.currency}
              </Descriptions.Item>
              <Descriptions.Item label="Thời hạn">
                {selectedCertificate.validityPeriod} {selectedCertificate.validityPeriodUnit}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày cấp">
                {selectedCertificate.issueDate ? formatDate(selectedCertificate.issueDate) : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày hết hạn">
                {selectedCertificate.expiryDate ? formatDate(selectedCertificate.expiryDate) : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Mô tả" span={2}>
                {selectedCertificate.description || '-'}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>

      {/* Image Preview Modal */}
      <Modal
        title="Xem trước hình ảnh"
        open={!!modalImage}
        onCancel={closeImageModal}
        footer={[
          <Button key="close" onClick={closeImageModal}>
            Đóng
          </Button>,
        ]}
      >
        {modalImage && (
          <Image
            src={modalImage}
            alt="Preview"
            style={{ width: '100%' }}
          />
        )}
      </Modal>
    </div>
  );
};

export default CertificateManagement;