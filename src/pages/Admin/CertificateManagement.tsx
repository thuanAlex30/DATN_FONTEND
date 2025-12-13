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
  Empty,
  Form,
  DatePicker,
  InputNumber,
  Switch
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
import { certificateService } from '../../services/certificateService';
import dayjs, { Dayjs } from 'dayjs';

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
  validityPeriodUnit: 'DAYS' | 'MONTHS' | 'YEARS';
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
  tenant_id?: string;
}

const AdminCertificateManagement: React.FC = () => {
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
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState<Certificate | null>(null);
  const [renewModalVisible, setRenewModalVisible] = useState(false);
  const [renewTarget, setRenewTarget] = useState<Certificate | null>(null);
  const [renewalDate, setRenewalDate] = useState<Dayjs | null>(null);
  const [renewalNotes, setRenewalNotes] = useState('');
  const [form] = Form.useForm();

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
      let certificatesData: Certificate[] = [];
      
      if (Array.isArray(res)) {
        certificatesData = res;
      } else if (res?.data && Array.isArray(res.data)) {
        certificatesData = res.data;
      } else if (res?.data?.data && Array.isArray(res.data.data)) {
        certificatesData = res.data.data;
      }
      
      setCertificates(certificatesData);
      
      const total = certificatesData.length;
      const active = certificatesData.filter((cert) => cert.status === 'ACTIVE').length;
      const inactive = certificatesData.filter((cert) => cert.status === 'INACTIVE').length;
      const expired = certificatesData.filter((cert) => cert.status === 'EXPIRED').length;
      
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

  // Filter certificates
  const filteredCertificates = certificates.filter(certificate => {
    const matchesSearch = !searchTerm || 
      certificate.certificateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      certificate.certificateCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      certificate.issuingAuthority.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !categoryFilter || certificate.category === categoryFilter;
    const matchesStatus = !statusFilter || certificate.status === statusFilter;
    const matchesPriority = !priorityFilter || certificate.priority === priorityFilter;
    
    return matchesSearch && matchesCategory && matchesStatus && matchesPriority;
  });

  // Open create modal
  const openCreateModal = () => {
    setEditingCertificate(null);
    form.resetFields();
    form.setFieldsValue({
      validityPeriodUnit: 'MONTHS',
      priority: 'MEDIUM',
      status: 'ACTIVE',
      renewalRequired: true,
      cost: 0,
      currency: 'VND'
    });
    setFormModalVisible(true);
  };

  // Open edit modal
  const openEditModal = (record: Certificate) => {
    setEditingCertificate(record);
    form.resetFields();
    form.setFieldsValue({
      ...record,
      issueDate: record.issueDate ? dayjs(record.issueDate) : null,
      expiryDate: record.expiryDate ? dayjs(record.expiryDate) : null
    });
    setFormModalVisible(true);
  };

  const handleFormSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload: any = {
        ...values,
        issueDate: values.issueDate ? values.issueDate.toISOString() : undefined,
        expiryDate: values.expiryDate ? values.expiryDate.toISOString() : undefined
      };

      setLoading(true);
      if (editingCertificate?._id) {
        await certificateService.updateCertificate(editingCertificate._id, payload);
        message.success('Cập nhật chứng chỉ thành công');
      } else {
        await certificateService.createCertificate(payload);
        message.success('Tạo chứng chỉ thành công');
      }
      setFormModalVisible(false);
      setEditingCertificate(null);
      await loadCertificates();
    } catch (err: any) {
      if (!err?.errorFields) {
        message.error('Không thể lưu chứng chỉ');
        console.error('Save certificate error:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const openRenewModal = (record: Certificate) => {
    setRenewTarget(record);
    setRenewalDate(dayjs());
    setRenewalNotes('');
    setRenewModalVisible(true);
  };

  const handleRenewSubmit = async () => {
    if (!renewTarget) return;
    try {
      setLoading(true);
      await certificateService.renewCertificate(renewTarget._id, {
        renewalDate: renewalDate ? renewalDate.toISOString() : undefined,
        notes: renewalNotes || undefined
      });
      message.success('Gia hạn chứng chỉ thành công');
      setRenewModalVisible(false);
      setRenewTarget(null);
      await loadCertificates();
    } catch (err) {
      message.error('Không thể gia hạn chứng chỉ');
      console.error('Renew certificate error:', err);
    } finally {
      setLoading(false);
    }
  };

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

  // Handle view certificate
  const handleViewCertificate = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
    setModalVisible(true);
  };

  // Handle delete certificate
  const handleDeleteCertificate = async (id: string) => {
    try {
      setLoading(true);
      await certificateService.deleteCertificate(id);
      message.success('Xóa chứng chỉ thành công');
      await loadCertificates();
    } catch (err: any) {
      message.error('Không thể xóa chứng chỉ');
      console.error('Delete certificate error:', err);
    } finally {
      setLoading(false);
    }
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
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
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
      width: 150,
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
              onClick={() => openEditModal(record)}
            />
          </Tooltip>
          <Tooltip title="Gia hạn">
            <Button
              type="text"
              icon={<ReloadOutlined />}
              onClick={() => openRenewModal(record)}
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

  if (loading && certificates.length === 0) {
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
            <Button onClick={loadCertificates}>
              Thử lại
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <Card style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <SafetyCertificateOutlined style={{ color: '#1677ff' }} /> Quản lý chứng chỉ
        </Title>
      </Card>

      {/* Stats Overview */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Tổng chứng chỉ"
              value={stats.total}
              prefix={<SafetyCertificateOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Đang hoạt động"
              value={stats.active}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Không hoạt động"
              value={stats.inactive}
              valueStyle={{ color: '#8c8c8c' }}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
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
                onClick={loadCertificates}
              >
                Tải lại
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={openCreateModal}
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
          rowKey={(record) => record._id}
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

      {/* Create / Update Modal */}
      <Modal
        title={editingCertificate ? 'Chỉnh sửa chứng chỉ' : 'Tạo mới chứng chỉ'}
        open={formModalVisible}
        onCancel={() => {
          setFormModalVisible(false);
          setEditingCertificate(null);
        }}
        onOk={handleFormSubmit}
        confirmLoading={loading}
        width={720}
      >
        <Form layout="vertical" form={form}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Tên chứng chỉ"
                name="certificateName"
                rules={[{ required: true, message: 'Vui lòng nhập tên chứng chỉ' }]}
              >
                <Input placeholder="Ví dụ: An toàn lao động" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Mã chứng chỉ"
                name="certificateCode"
              >
                <Input placeholder="Tự tạo nếu bỏ trống" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Danh mục"
                name="category"
                rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
              >
                <Select placeholder="Chọn danh mục">
                  <Option value="SAFETY">An toàn lao động</Option>
                  <Option value="TECHNICAL">Kỹ thuật</Option>
                  <Option value="MANAGEMENT">Quản lý</Option>
                  <Option value="QUALITY">Chất lượng</Option>
                  <Option value="ENVIRONMENTAL">Môi trường</Option>
                  <Option value="HEALTH">Sức khỏe</Option>
                  <Option value="OTHER">Khác</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Cơ quan cấp"
                name="issuingAuthority"
                rules={[{ required: true, message: 'Vui lòng nhập cơ quan cấp' }]}
              >
                <Input placeholder="Tên cơ quan cấp" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Thời hạn"
                name="validityPeriod"
                rules={[{ required: true, message: 'Nhập thời hạn' }]}
              >
                <InputNumber min={1} max={36} style={{ width: '100%' }} placeholder="1-36" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Đơn vị"
                name="validityPeriodUnit"
                rules={[{ required: true, message: 'Chọn đơn vị' }]}
              >
                <Select>
                  <Option value="DAYS">Ngày</Option>
                  <Option value="MONTHS">Tháng</Option>
                  <Option value="YEARS">Năm</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Ngày cấp" name="issueDate">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="Mức độ" name="priority">
                <Select>
                  <Option value="LOW">Thấp</Option>
                  <Option value="MEDIUM">Trung bình</Option>
                  <Option value="HIGH">Cao</Option>
                  <Option value="CRITICAL">Nghiêm trọng</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Trạng thái" name="status">
                <Select>
                  <Option value="ACTIVE">ACTIVE</Option>
                  <Option value="INACTIVE">INACTIVE</Option>
                  <Option value="SUSPENDED">SUSPENDED</Option>
                  <Option value="EXPIRED">EXPIRED</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Chi phí" name="cost">
                <InputNumber min={0} style={{ width: '100%' }} addonAfter="VND" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Tiền tệ" name="currency">
                <Input placeholder="VND" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Yêu cầu gia hạn" name="renewalRequired" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Mô tả" name="description">
            <Input.TextArea rows={3} placeholder="Mô tả ngắn" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Renew Modal */}
      <Modal
        title="Gia hạn chứng chỉ"
        open={renewModalVisible}
        onCancel={() => setRenewModalVisible(false)}
        onOk={handleRenewSubmit}
        confirmLoading={loading}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <DatePicker
            style={{ width: '100%' }}
            value={renewalDate}
            onChange={setRenewalDate}
            placeholder="Chọn ngày gia hạn"
          />
          <Input.TextArea
            rows={3}
            placeholder="Ghi chú gia hạn (tùy chọn)"
            value={renewalNotes}
            onChange={(e) => setRenewalNotes(e.target.value)}
          />
        </Space>
      </Modal>

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
        )}
      </Modal>
    </div>
  );
};

export default AdminCertificateManagement;


