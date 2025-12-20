import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  Breadcrumb,
  Dropdown,
  Tabs,
  Badge
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
  InfoCircleOutlined,
  DownloadOutlined,
  FileExcelOutlined,
  BarChartOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import certificateService from '../../../services/certificateService';
import CertificateFormModal from './components/CertificateFormModal';
import RenewCertificateModal from './components/RenewCertificateModal';
import ReminderSettingsModal from './components/ReminderSettingsModal';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

// Helper functions
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
  const { user } = useSelector((state: RootState) => state.auth);
  const isDepartmentHeader = user?.role?.role_code === 'department_header' || (user?.role?.role_level !== undefined && user.role.role_level >= 80);
  
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
  
  // Modal states
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [renewModalVisible, setRenewModalVisible] = useState(false);
  const [reminderModalVisible, setReminderModalVisible] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState<Certificate | null>(null);

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    expired: 0,
    expiringSoon: 0
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: 10
  });
  
  // Expiring certificates state
  const [expiringCertificates, setExpiringCertificates] = useState<Certificate[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [loadingExpiring, setLoadingExpiring] = useState(false);

  // Load statistics from API
  const loadStats = async () => {
    try {
      const statsData = await certificateService.getCertificateStats();
      setStats({
        total: statsData.total || 0,
        active: statsData.active || 0,
        inactive: statsData.inactive || 0,
        expired: statsData.expired || 0,
        expiringSoon: statsData.expiringSoon || 0
      });
    } catch (err) {
      console.error('Error loading stats:', err);
      // Fallback: calculate from local data if API fails
      const total = certificates.length;
      const active = certificates.filter((cert) => cert.status === 'ACTIVE').length;
      const inactive = certificates.filter((cert) => cert.status === 'INACTIVE').length;
      const expired = certificates.filter((cert) => cert.status === 'EXPIRED').length;
      setStats({ total, active, inactive, expired, expiringSoon: 0 });
    }
  };

  // Load certificates with server-side filtering
  const loadCertificates = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Loading certificates with filters...', {
        search: searchTerm,
        category: categoryFilter,
        status: statusFilter,
        priority: priorityFilter,
        page: currentPage,
        limit: pageSize
      });
      
      // Call API with filters for server-side filtering
      // Build params object - only include defined values
      // Backend validation only accepts: q, category, status, priority, page, limit
      const params: any = {
        page: currentPage,
        limit: pageSize
      };
      
      // Backend uses 'q' for search query parameter (not 'search')
      if (searchTerm && searchTerm.trim()) {
        params.q = searchTerm.trim();
      }
      if (categoryFilter) {
        params.category = categoryFilter;
      }
      if (statusFilter) {
        params.status = statusFilter;
      }
      if (priorityFilter) {
        params.priority = priorityFilter;
      }
      // Note: sortBy and sortOrder are not validated by backend, so don't send them
      // Backend defaults to createdAt DESC anyway
      
      const res = await certificateService.getCertificates(params);
      
      console.log('📦 CertificateList API Response:', res);
      
      // Handle response - simplified approach similar to incidentService
      let certificatesData: Certificate[] = [];
      let paginationData = {
        current: currentPage,
        pages: 1,
        total: 0,
        limit: pageSize
      };
      
      if (res?.data) {
        const responseData = res.data;
        
        // Primary format: { success: true, data: { data: [...], pagination: {...} } }
        if (responseData.success && responseData.data) {
          // Check for nested data.data structure (most common)
          if (responseData.data.data && Array.isArray(responseData.data.data)) {
            certificatesData = responseData.data.data;
            if (responseData.data.pagination) {
              paginationData = {
                current: responseData.data.pagination.current || currentPage,
                pages: responseData.data.pagination.pages || 1,
                total: responseData.data.pagination.total || 0,
                limit: responseData.data.pagination.limit || pageSize
              };
            }
          }
          // Fallback: { success: true, data: [...] }
          else if (Array.isArray(responseData.data)) {
            certificatesData = responseData.data;
          }
        }
        // Fallback format: Direct array or { data: [...] }
        else if (Array.isArray(responseData)) {
          certificatesData = responseData;
        }
        else if (responseData.data) {
          if (Array.isArray(responseData.data)) {
            certificatesData = responseData.data;
          } else if (responseData.data.data && Array.isArray(responseData.data.data)) {
            certificatesData = responseData.data.data;
            if (responseData.data.pagination) {
              paginationData = {
                current: responseData.data.pagination.current || currentPage,
                pages: responseData.data.pagination.pages || 1,
                total: responseData.data.pagination.total || 0,
                limit: responseData.data.pagination.limit || pageSize
              };
            }
          }
        }
      }
      
      console.log('📦 Parsed certificates:', certificatesData.length);
      if (certificatesData.length === 0) {
        console.warn('⚠️ No certificates found in response. Full response:', JSON.stringify(res?.data, null, 2));
      }
      
      // Ensure all certificates have required fields with defaults
      // Normalize _id field (backend transforms _id to id, so we need to handle both)
      certificatesData = certificatesData.map((cert: any) => ({
        ...cert,
        _id: cert._id || cert.id, // Normalize: use _id if exists, otherwise use id
        status: cert.status || 'ACTIVE',
        priority: cert.priority || 'MEDIUM',
        cost: cert.cost || 0,
        currency: cert.currency || 'VND',
        validityPeriod: cert.validityPeriod || 12,
        validityPeriodUnit: cert.validityPeriodUnit || 'MONTHS',
        renewalRequired: cert.renewalRequired !== undefined ? cert.renewalRequired : true,
        tags: cert.tags || [],
        reminderSettings: cert.reminderSettings || {
          enabled: true,
          reminderDays: [],
          notificationMethods: [],
          recipients: []
        },
        contactInfo: cert.contactInfo || {},
        attachments: cert.attachments || []
      }));
      
      console.log('✅ Final certificates data:', certificatesData.length, 'items');
      console.log('✅ Pagination data:', paginationData);
      
      // Debug: Log if no certificates found
      if (certificatesData.length === 0 && res?.data) {
        console.warn('⚠️ No certificates found. Full response:', JSON.stringify(res.data, null, 2));
        console.warn('⚠️ Response structure:', {
          hasData: !!res.data,
          hasSuccess: !!res.data?.success,
          dataType: typeof res.data?.data,
          isArray: Array.isArray(res.data?.data),
          dataKeys: res.data?.data ? Object.keys(res.data.data) : []
        });
      }
      
      setCertificates(certificatesData);
      setPagination(paginationData);
      
      // Load stats from API (independent of certificates data)
      loadStats();
    } catch (err: any) {
      console.error('❌ CertificateList fetch error:', err);
      console.error('❌ Error details:', {
        message: err.message,
        response: err.response,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        config: err.config
      });
      
      let errorMessage = 'Không thể tải danh sách chứng chỉ';
      
      if (err.response) {
        // Server responded with error
        if (err.response.status === 404) {
          errorMessage = 'API endpoint không tìm thấy. Vui lòng kiểm tra backend server.';
        } else if (err.response.status === 401) {
          errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
        } else if (err.response.status === 403) {
          errorMessage = 'Bạn không có quyền truy cập chức năng này.';
        } else {
          errorMessage = err.response.data?.message || err.response.statusText || errorMessage;
        }
      } else if (err.request) {
        // Request was made but no response received
        errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra backend server có đang chạy không.';
      } else {
        // Error in request setup
        errorMessage = err.message || errorMessage;
      }
      
      setError(errorMessage);
      message.error(errorMessage);
      // Set empty arrays on error to prevent crashes
      setCertificates([]);
      setPagination({ current: 1, pages: 1, total: 0, limit: pageSize });
    } finally {
      setLoading(false);
    }
  };

  // Load expiring certificates
  const loadExpiringCertificates = async () => {
    try {
      setLoadingExpiring(true);
      const expiring = await certificateService.getExpiringCertificates(30); // 30 days
      const normalizedExpiring = expiring.map((cert: any) => ({
        ...cert,
        _id: cert._id || cert.id,
        status: cert.status || 'ACTIVE',
        priority: cert.priority || 'MEDIUM',
        cost: cert.cost || 0,
        currency: cert.currency || 'VND',
        validityPeriod: cert.validityPeriod || 12,
        validityPeriodUnit: cert.validityPeriodUnit || 'MONTHS',
        renewalRequired: cert.renewalRequired !== undefined ? cert.renewalRequired : true,
        tags: cert.tags || [],
        reminderSettings: cert.reminderSettings || {
          enabled: true,
          reminderDays: [],
          notificationMethods: [],
          recipients: []
        },
        contactInfo: cert.contactInfo || {},
        attachments: cert.attachments || []
      }));
      setExpiringCertificates(normalizedExpiring);
    } catch (err) {
      console.error('Error loading expiring certificates:', err);
      message.error('Không thể tải chứng chỉ sắp hết hạn');
      setExpiringCertificates([]);
    } finally {
      setLoadingExpiring(false);
    }
  };

  // Load data on mount and when filters change
  useEffect(() => {
    if (activeTab === 'all') {
      loadCertificates();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, categoryFilter, statusFilter, priorityFilter, currentPage, pageSize, activeTab]);

  // Load expiring certificates when expiring tab is active
  useEffect(() => {
    if (activeTab === 'expiring') {
      loadExpiringCertificates();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Use certificates directly from API (server-side filtered)
  // Keep filteredCertificates as fallback for client-side filtering if needed
  const filteredCertificates = certificates;
  
  // Debug: Log certificates state
  useEffect(() => {
    console.log('🔍 Certificates state updated:', certificates.length, 'items');
    console.log('🔍 Filtered certificates:', filteredCertificates.length, 'items');
    if (certificates.length > 0) {
      console.log('🔍 First certificate:', certificates[0]);
    }
  }, [certificates, filteredCertificates]);

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
    try {
      // Check for both _id and id (backend transforms _id to id)
      const certificateId = (certificate as any)?._id || (certificate as any)?.id;
      if (!certificate || !certificateId) {
        message.warning('Chứng chỉ không hợp lệ');
        return;
      }
      // Ensure certificate has _id for consistency
      const normalizedCertificate = {
        ...certificate,
        _id: certificateId
      };
      setSelectedCertificate(normalizedCertificate as Certificate);
      setModalVisible(true);
    } catch (err) {
      console.error('Error viewing certificate:', err);
      message.error('Không thể xem chi tiết chứng chỉ');
    }
  };

  // Handle edit certificate
  const handleEditCertificate = (certificate: Certificate) => {
    try {
      // Check for both _id and id (backend transforms _id to id)
      const certificateId = (certificate as any)?._id || (certificate as any)?.id;
      if (!certificate || !certificateId) {
        message.warning('Chứng chỉ không hợp lệ');
        return;
      }
      // Ensure certificate has _id for consistency
      const normalizedCertificate = {
        ...certificate,
        _id: certificateId
      };
      setEditingCertificate(normalizedCertificate as Certificate);
      setEditModalVisible(true);
    } catch (err) {
      console.error('Error editing certificate:', err);
      message.error('Không thể chỉnh sửa chứng chỉ');
    }
  };

  // Handle renew certificate
  const handleRenewCertificate = (certificate: Certificate) => {
    try {
      // Check for both _id and id (backend transforms _id to id)
      const certificateId = (certificate as any)?._id || (certificate as any)?.id;
      if (!certificate || !certificateId) {
        message.warning('Chứng chỉ không hợp lệ');
        return;
      }
      // Ensure certificate has _id for consistency
      const normalizedCertificate = {
        ...certificate,
        _id: certificateId
      };
      setSelectedCertificate(normalizedCertificate as Certificate);
      setRenewModalVisible(true);
    } catch (err) {
      console.error('Error renewing certificate:', err);
      message.error('Không thể gia hạn chứng chỉ');
    }
  };

  // Handle reminder settings
  const handleReminderSettings = (certificate: Certificate) => {
    try {
      // Check for both _id and id (backend transforms _id to id)
      const certificateId = (certificate as any)?._id || (certificate as any)?.id;
      if (!certificate || !certificateId) {
        message.warning('Chứng chỉ không hợp lệ');
        return;
      }
      // Ensure certificate has _id for consistency
      const normalizedCertificate = {
        ...certificate,
        _id: certificateId
      };
      setSelectedCertificate(normalizedCertificate as Certificate);
      setReminderModalVisible(true);
    } catch (err) {
      console.error('Error opening reminder settings:', err);
      message.error('Không thể mở cài đặt nhắc nhở');
    }
  };

  // Handle delete certificate
  const handleDeleteCertificate = async (id: string) => {
    try {
      if (!id) {
        message.warning('ID chứng chỉ không hợp lệ');
        return;
      }
      await certificateService.deleteCertificate(id);
      message.success('Xóa chứng chỉ thành công');
      loadCertificates();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Không thể xóa chứng chỉ';
      message.error(errorMessage);
      console.error('Delete certificate error:', err);
    }
  };

  // Handle modal success
  const handleModalSuccess = () => {
    loadCertificates();
    setCreateModalVisible(false);
    setEditModalVisible(false);
    setRenewModalVisible(false);
    setReminderModalVisible(false);
    setEditingCertificate(null);
    setSelectedCertificate(null);
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
          <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{text || '-'}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.certificateCode || '-'}</div>
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
      render: (status: string) => {
        const safeStatus = status || 'ACTIVE';
        return (
          <Tag color={getStatusColor(safeStatus)} icon={getStatusIcon(safeStatus)}>
            {safeStatus}
          </Tag>
        );
      },
    },
    {
      title: 'Mức độ',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (priority: string) => {
        const safePriority = priority || 'MEDIUM';
        return (
          <Tag color={getPriorityColor(safePriority)}>
            {safePriority}
          </Tag>
        );
      },
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
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewCertificate(record)}
              style={{
                color: '#3b82f6',
                borderRadius: '6px'
              }}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditCertificate(record)}
              style={{
                color: '#10b981',
                borderRadius: '6px'
              }}
            />
          </Tooltip>
          <Tooltip title="Gia hạn">
            <Button
              type="text"
              icon={<ClockCircleOutlined />}
              onClick={() => handleRenewCertificate(record)}
              style={{
                color: '#f59e0b',
                borderRadius: '6px'
              }}
            />
          </Tooltip>
          <Tooltip title="Cài đặt nhắc nhở">
            <Button
              type="text"
              icon={<InfoCircleOutlined />}
              onClick={() => handleReminderSettings(record)}
              style={{
                color: '#6366f1',
                borderRadius: '6px'
              }}
            />
          </Tooltip>
          {isDepartmentHeader && (
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa chứng chỉ này?"
              onConfirm={() => handleDeleteCertificate((record as any)._id || (record as any).id)}
              okText="Xóa"
              cancelText="Hủy"
            >
              <Tooltip title="Xóa">
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  style={{
                    borderRadius: '6px'
                  }}
                />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  // Show loading only on initial load
  if (loading && certificates.length === 0) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        padding: '24px'
      }}>
        <Spin size="large" tip="Đang tải dữ liệu chứng chỉ..." />
      </div>
    );
  }

  return (
    <motion.div 
      style={{ 
        padding: '32px', 
        background: 'linear-gradient(180deg, #f0f9ff 0%, #ffffff 40%, #f8fafc 100%)',
        minHeight: '100vh',
        position: 'relative'
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background decorative elements */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            radial-gradient(circle at 10% 20%, rgba(59, 130, 246, 0.1), transparent 50%),
            radial-gradient(circle at 90% 80%, rgba(99, 102, 241, 0.08), transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.05), transparent 60%)
          `,
          backgroundPosition: '10% 20%, 90% 80%, 50% 50%',
          backgroundSize: 'auto, auto, auto',
          backgroundRepeat: 'no-repeat',
          zIndex: 0,
          pointerEvents: 'none'
        }}
      />
      
      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1600px', margin: '0 auto' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Card
          styles={{ body: { padding: '24px 32px' } }}
          style={{
            marginBottom: 32,
            borderRadius: 20,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(239, 246, 255, 0.8) 100%)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 20px 60px rgba(59, 130, 246, 0.12), 0 0 0 1px rgba(59, 130, 246, 0.05)',
            border: 'none'
          }}
        >
          <Row justify="space-between" align="middle">
            <Col>
              <Space direction="vertical" size={4}>
                <Title 
                  level={2} 
                  style={{ 
                    margin: 0, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 12,
                    background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontWeight: 700,
                    fontSize: '28px'
                  }}
                >
                  <SafetyCertificateOutlined style={{ 
                    color: '#3b82f6',
                    fontSize: '32px',
                    filter: 'drop-shadow(0 2px 4px rgba(59, 130, 246, 0.3))'
                  }} /> 
                  Quản lý chứng chỉ
                </Title>
                <Breadcrumb 
                  style={{ marginTop: '4px' }}
                  separator={<span style={{ color: '#94a3b8' }}>/</span>}
                >
                  <Breadcrumb.Item>
                    <a 
                      href="/header-department/dashboard"
                      style={{ 
                        color: '#64748b',
                        textDecoration: 'none',
                        transition: 'all 0.3s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#3b82f6'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
                    >
                      Dashboard
                    </a>
                  </Breadcrumb.Item>
                  <Breadcrumb.Item>
                    <span style={{ color: '#1e293b', fontWeight: 500 }}>Quản lý chứng chỉ</span>
                  </Breadcrumb.Item>
                </Breadcrumb>
              </Space>
            </Col>
            <Col>
              <Button 
                type="default" 
                icon={<ArrowLeftOutlined />}
                href="/header-department/dashboard"
                size="large"
                style={{
                  borderRadius: '10px',
                  height: '40px',
                  padding: '0 20px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                  border: '1px solid #e2e8f0',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.12)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Quay lại
              </Button>
            </Col>
          </Row>
        </Card>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Row gutter={[20, 20]} style={{ marginBottom: '32px' }}>
          <Col xs={24} sm={12} lg={6}>
            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Card
                styles={{ body: { padding: '24px' } }}
                style={{ 
                  borderRadius: 16, 
                  background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)',
                  boxShadow: '0 4px 20px rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.1)',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                <Statistic
                  title={<span style={{ color: '#64748b', fontSize: '14px', fontWeight: 500 }}>Tổng chứng chỉ</span>}
                  value={stats.total}
                  valueStyle={{ 
                    color: '#3b82f6',
                    fontSize: '32px',
                    fontWeight: 700
                  }}
                  prefix={<SafetyCertificateOutlined style={{ 
                    color: '#3b82f6',
                    fontSize: '24px',
                    marginRight: '8px'
                  }} />}
                />
              </Card>
            </motion.div>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Card
                styles={{ body: { padding: '24px' } }}
                style={{ 
                  borderRadius: 16, 
                  background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
                  boxShadow: '0 4px 20px rgba(34, 197, 94, 0.1)',
                  border: '1px solid rgba(34, 197, 94, 0.1)',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                <Statistic
                  title={<span style={{ color: '#64748b', fontSize: '14px', fontWeight: 500 }}>Đang hoạt động</span>}
                  value={stats.active}
                  valueStyle={{ 
                    color: '#22c55e',
                    fontSize: '32px',
                    fontWeight: 700
                  }}
                  prefix={<CheckCircleOutlined style={{ 
                    color: '#22c55e',
                    fontSize: '24px',
                    marginRight: '8px'
                  }} />}
                />
              </Card>
            </motion.div>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Card
                styles={{ body: { padding: '24px' } }}
                style={{ 
                  borderRadius: 16, 
                  background: 'linear-gradient(135deg, #ffffff 0%, #fffbeb 100%)',
                  boxShadow: '0 4px 20px rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.1)',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                <Statistic
                  title={<span style={{ color: '#64748b', fontSize: '14px', fontWeight: 500 }}>Không hoạt động</span>}
                  value={stats.inactive}
                  valueStyle={{ 
                    color: '#f59e0b',
                    fontSize: '32px',
                    fontWeight: 700
                  }}
                  prefix={<WarningOutlined style={{ 
                    color: '#f59e0b',
                    fontSize: '24px',
                    marginRight: '8px'
                  }} />}
                />
              </Card>
            </motion.div>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Card
                styles={{ body: { padding: '24px' } }}
                style={{ 
                  borderRadius: 16, 
                  background: 'linear-gradient(135deg, #ffffff 0%, #fef2f2 100%)',
                  boxShadow: '0 4px 20px rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.1)',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                <Statistic
                  title={<span style={{ color: '#64748b', fontSize: '14px', fontWeight: 500 }}>Hết hạn</span>}
                  value={stats.expired}
                  valueStyle={{ 
                    color: '#ef4444',
                    fontSize: '32px',
                    fontWeight: 700
                  }}
                  prefix={<ExclamationCircleOutlined style={{ 
                    color: '#ef4444',
                    fontSize: '24px',
                    marginRight: '8px'
                  }} />}
                />
              </Card>
            </motion.div>
          </Col>
        </Row>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Card 
          style={{ 
            marginBottom: 24,
            borderRadius: 16,
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
            border: '1px solid rgba(226, 232, 240, 0.8)'
          }}
        >
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={6}>
              <Search
                placeholder="Tìm kiếm chứng chỉ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onSearch={setSearchTerm}
                enterButton={<SearchOutlined />}
                size="large"
                style={{
                  borderRadius: '10px'
                }}
              />
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Select
                placeholder="Danh mục"
                value={categoryFilter}
                onChange={setCategoryFilter}
                allowClear
                size="large"
                style={{
                  width: '100%',
                  borderRadius: '10px'
                }}
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
            <Col xs={24} sm={12} md={4}>
              <Select
                placeholder="Trạng thái"
                value={statusFilter}
                onChange={setStatusFilter}
                allowClear
                size="large"
                style={{
                  width: '100%',
                  borderRadius: '10px'
                }}
              >
                <Option value="ACTIVE">Đang hoạt động</Option>
                <Option value="INACTIVE">Không hoạt động</Option>
                <Option value="SUSPENDED">Tạm dừng</Option>
                <Option value="EXPIRED">Đã hết hạn</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Select
                placeholder="Mức độ"
                value={priorityFilter}
                onChange={setPriorityFilter}
                allowClear
                size="large"
                style={{
                  width: '100%',
                  borderRadius: '10px'
                }}
              >
                <Option value="LOW">Thấp</Option>
                <Option value="MEDIUM">Trung bình</Option>
                <Option value="HIGH">Cao</Option>
                <Option value="CRITICAL">Nghiêm trọng</Option>
              </Select>
            </Col>
            <Col xs={24} sm={24} md={6}>
              <Space wrap style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={loadCertificates}
                  size="large"
                  style={{
                    borderRadius: '10px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
                  }}
                >
                  Tải lại
                </Button>
                <Dropdown
                  menu={{
                    items: [
                      {
                        key: 'export-json',
                        label: 'Xuất JSON',
                        icon: <DownloadOutlined />,
                        onClick: async () => {
                          try {
                            const data = await certificateService.exportCertificates('json');
                            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `certificates-${new Date().toISOString().split('T')[0]}.json`;
                            a.click();
                            message.success('Xuất dữ liệu thành công');
                          } catch (err) {
                            message.error('Không thể xuất dữ liệu');
                          }
                        }
                      },
                      {
                        key: 'report',
                        label: 'Tạo báo cáo',
                        icon: <BarChartOutlined />,
                        onClick: async () => {
                          try {
                            const report = await certificateService.generateReport({
                              category: categoryFilter || undefined,
                              status: statusFilter || undefined,
                              priority: priorityFilter || undefined
                            });
                            Modal.info({
                              title: 'Báo cáo chứng chỉ',
                              width: 800,
                              content: (
                                <div>
                                  <Descriptions column={2} bordered>
                                    <Descriptions.Item label="Tổng số">{report.summary?.total || 0}</Descriptions.Item>
                                    <Descriptions.Item label="Đang hoạt động">{report.summary?.active || 0}</Descriptions.Item>
                                    <Descriptions.Item label="Không hoạt động">{report.summary?.inactive || 0}</Descriptions.Item>
                                    <Descriptions.Item label="Đã hết hạn">{report.summary?.expired || 0}</Descriptions.Item>
                                    <Descriptions.Item label="Sắp hết hạn">{report.summary?.expiringSoon || 0}</Descriptions.Item>
                                  </Descriptions>
                                </div>
                              )
                            });
                          } catch (err) {
                            message.error('Không thể tạo báo cáo');
                          }
                        }
                      }
                    ]
                  }}
                >
                  <Button 
                    icon={<FileExcelOutlined />}
                    size="large"
                    style={{
                      borderRadius: '10px',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
                    }}
                  >
                    Xuất dữ liệu <DownloadOutlined />
                  </Button>
                </Dropdown>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setCreateModalVisible(true)}
                  size="large"
                  style={{
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
                    fontWeight: 600,
                    height: '40px'
                  }}
                >
                  Tạo mới
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>
      </motion.div>

      {/* Error Alert */}
      {error && (
        <Alert
          message="Lỗi tải dữ liệu"
          description={error}
          type="error"
          showIcon
          closable
          onClose={() => setError(null)}
          action={
            <Button size="small" onClick={loadCertificates}>
              Thử lại
            </Button>
          }
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Table with Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card
          style={{
            borderRadius: 16,
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            overflow: 'hidden'
          }}
        >
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: 'all',
                label: `Tất cả (${stats.total || 0})`,
                children: (
                  <Table
                    columns={columns}
                    dataSource={filteredCertificates}
                    rowKey={(record) => {
                      try {
                        return record._id || (record as any).id || record.certificateCode || `cert-${Math.random()}`;
                      } catch {
                        return `cert-${Math.random()}`;
                      }
                    }}
                    loading={loading}
                    pagination={{
                      current: pagination.current || currentPage,
                      total: pagination.total || 0,
                      pageSize: pagination.limit || pageSize,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total, range) =>
                        `${range[0]}-${range[1]} của ${total} chứng chỉ`,
                      onChange: (page, size) => {
                        setCurrentPage(page);
                        setPageSize(size);
                      },
                      onShowSizeChange: (_current, size) => {
                        setCurrentPage(1);
                        setPageSize(size);
                      },
                      style: {
                        marginTop: '24px',
                        padding: '0 16px'
                      }
                    }}
                    locale={{
                      emptyText: (
                        <Empty
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                          description={error ? 'Không thể tải dữ liệu' : 'Không có chứng chỉ nào'}
                          style={{ padding: '60px 0' }}
                        />
                      ),
                    }}
                    style={{
                      borderRadius: '16px'
                    }}
                    rowClassName={() => 'certificate-table-row'}
                  />
                )
              },
              {
                key: 'expiring',
                label: (
                  <span>
                    <WarningOutlined /> Sắp hết hạn
                    {expiringCertificates.length > 0 && (
                      <Badge count={expiringCertificates.length} style={{ marginLeft: 8 }} />
                    )}
                  </span>
                ),
                children: (
                  <Table
                    columns={columns}
                    dataSource={expiringCertificates}
                    rowKey={(record) => {
                      try {
                        return record._id || (record as any).id || record.certificateCode || `cert-exp-${Math.random()}`;
                      } catch {
                        return `cert-exp-${Math.random()}`;
                      }
                    }}
                    loading={loadingExpiring}
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: true,
                      showTotal: (total, range) =>
                        `${range[0]}-${range[1]} của ${total} chứng chỉ sắp hết hạn`,
                      style: {
                        marginTop: '24px',
                        padding: '0 16px'
                      }
                    }}
                    locale={{
                      emptyText: (
                        <Empty
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                          description="Không có chứng chỉ nào sắp hết hạn"
                          style={{ padding: '60px 0' }}
                        />
                      ),
                    }}
                    style={{
                      borderRadius: '16px'
                    }}
                    rowClassName={() => 'certificate-table-row'}
                  />
                )
              }
            ]}
          />
        </Card>
      </motion.div>
      
      <style>{`
        .certificate-table-row {
          transition: all 0.2s;
        }
        .certificate-table-row:hover {
          background-color: #f8fafc !important;
          transform: scale(1.01);
        }
        .ant-table-thead > tr > th {
          background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%) !important;
          font-weight: 600 !important;
          color: #1e293b !important;
          border-bottom: 2px solid #e2e8f0 !important;
        }
        .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f1f5f9 !important;
        }
        .ant-card {
          transition: all 0.3s ease;
        }
        .ant-card:hover {
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1) !important;
        }
      `}</style>

      {/* Certificate Detail Modal */}
      <Modal
        title={
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            fontSize: '20px',
            fontWeight: 600
          }}>
            <SafetyCertificateOutlined style={{ color: '#3b82f6', fontSize: '24px' }} />
            Chi tiết chứng chỉ
          </div>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button 
            key="close" 
            onClick={() => setModalVisible(false)}
            size="large"
            style={{
              borderRadius: '8px',
              padding: '0 24px'
            }}
          >
            Đóng
          </Button>,
        ]}
        width={900}
        styles={{
          body: {
            padding: '24px'
          }
        }}
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

      {/* Create Certificate Modal */}
      <CertificateFormModal
        visible={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        onSuccess={handleModalSuccess}
        certificate={null}
        mode="create"
      />

      {/* Edit Certificate Modal */}
      <CertificateFormModal
        visible={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setEditingCertificate(null);
        }}
        onSuccess={handleModalSuccess}
        certificate={editingCertificate}
        mode="edit"
      />

      {/* Renew Certificate Modal */}
      <RenewCertificateModal
        visible={renewModalVisible}
        onCancel={() => {
          setRenewModalVisible(false);
          setSelectedCertificate(null);
        }}
        onSuccess={handleModalSuccess}
        certificate={selectedCertificate}
      />

      {/* Reminder Settings Modal */}
      <ReminderSettingsModal
        visible={reminderModalVisible}
        onCancel={() => {
          setReminderModalVisible(false);
          setSelectedCertificate(null);
        }}
        onSuccess={handleModalSuccess}
        certificate={selectedCertificate}
      />
      
      {/* Custom Styles */}
      <style>{`
        .certificate-table-row {
          transition: all 0.2s ease;
        }
        .certificate-table-row:hover {
          background-color: #f8fafc !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04) !important;
        }
        .ant-table-thead > tr > th {
          background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%) !important;
          font-weight: 600 !important;
          color: #1e293b !important;
          border-bottom: 2px solid #e2e8f0 !important;
          font-size: 14px;
        }
        .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f1f5f9 !important;
          padding: 16px !important;
        }
        .ant-table-tbody > tr:hover > td {
          background-color: #f8fafc !important;
        }
        .ant-card {
          transition: all 0.3s ease;
        }
        .ant-card:hover {
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1) !important;
        }
        .ant-btn {
          transition: all 0.3s ease;
        }
        .ant-btn:hover {
          transform: translateY(-2px);
        }
        .ant-tag {
          border-radius: 6px;
          padding: 4px 12px;
          font-weight: 500;
          border: none;
        }
        .ant-statistic-title {
          margin-bottom: 8px !important;
        }
        .ant-statistic-content {
          margin-top: 8px !important;
        }
      `}</style>
      </div>
    </motion.div>
  );
};

export default CertificateManagement;