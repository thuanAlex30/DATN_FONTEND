import React, { useState, useEffect } from 'react';
import { EmployeeLayout } from '../../../components/Employee';
import { 
  Card, 
  Table, 
  Tag, 
  Typography, 
  Empty, 
  Alert,
  Tooltip,
  Descriptions,
  Modal,
  Button
} from 'antd';
import styles from './Certificates.module.css';
import {
  IdcardOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import certificateService from '../../../services/certificateService';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store';

const { Text } = Typography;

// Helper functions
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('vi-VN');
};

// Calculate days until expiration
const getDaysUntilExpiration = (expiryDate: string): number | null => {
  if (!expiryDate) return null;
  const expiry = new Date(expiryDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Get renewal reminder status
const getRenewalReminderStatus = (daysUntilExpiration: number | null): { 
  show: boolean; 
  color: string; 
  text: string;
  icon: React.ReactNode;
} => {
  if (daysUntilExpiration === null) {
    return { show: false, color: '', text: '', icon: null };
  }
  
  if (daysUntilExpiration < 0) {
    return { 
      show: true, 
      color: 'red', 
      text: 'Đã hết hạn', 
      icon: <ExclamationCircleOutlined />
    };
  }
  
  if (daysUntilExpiration <= 30) {
    return { 
      show: true, 
      color: 'red', 
      text: `Còn ${daysUntilExpiration} ngày - Cần gia hạn ngay`, 
      icon: <ExclamationCircleOutlined />
    };
  }
  
  if (daysUntilExpiration <= 60) {
    return { 
      show: true, 
      color: 'orange', 
      text: `Còn ${daysUntilExpiration} ngày - Cần gia hạn sớm`, 
      icon: <WarningOutlined />
    };
  }
  
  if (daysUntilExpiration <= 90) {
    return { 
      show: true, 
      color: 'gold', 
      text: `Còn ${daysUntilExpiration} ngày - Nhắc nhở gia hạn`, 
      icon: <ClockCircleOutlined />
    };
  }
  
  return { show: false, color: '', text: '', icon: null };
};

// Get category label
const getCategoryLabel = (category: string): string => {
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

// Get status color and icon
const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    'ACTIVE': 'green',
    'INACTIVE': 'default',
    'EXPIRED': 'red',
    'SUSPENDED': 'orange',
    'PENDING_RENEWAL': 'orange'
  };
  return colors[status] || 'default';
};

const getStatusIcon = (status: string): React.ReactNode => {
  if (status === 'ACTIVE') return <CheckCircleOutlined />;
  if (status === 'EXPIRED') return <ExclamationCircleOutlined />;
  return null;
};

const EmployeeCertificates: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(false);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [selectedCertificate, setSelectedCertificate] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  useEffect(() => {
    if (user?.id) {
      loadCertificates();
    }
  }, [user?.id, pagination.current, pagination.pageSize]);

  const loadCertificates = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const response = await certificateService.getUserCertificates({
        userId: user.id,
        page: pagination.current,
        limit: pagination.pageSize
      });

      let data: any[] = [];
      let paginationData = pagination;

      // Handle different response structures
      if (response) {
        // Case 1: response.data.success && response.data.data.data (nested)
        if (response.data?.success && response.data.data?.data && Array.isArray(response.data.data.data)) {
          data = response.data.data.data;
          paginationData = {
            ...paginationData,
            current: response.data.data.pagination?.currentPage || pagination.current,
            total: response.data.data.pagination?.totalItems || response.data.data.pagination?.total || 0
          };
        }
        // Case 2: response.data.success && response.data.data (array)
        else if (response.data?.success && Array.isArray(response.data.data)) {
          data = response.data.data;
          paginationData = {
            ...paginationData,
            total: response.data.pagination?.totalItems || response.data.pagination?.total || data.length
          };
        }
        // Case 3: response.success && response.data.data (nested)
        else if (response.success && response.data?.data && Array.isArray(response.data.data)) {
          data = response.data.data;
          paginationData = {
            ...paginationData,
            current: response.data.pagination?.currentPage || pagination.current,
            total: response.data.pagination?.totalItems || response.data.pagination?.total || 0
          };
        }
        // Case 4: response.success && response.data (array)
        else if (response.success && Array.isArray(response.data)) {
          data = response.data;
          paginationData = {
            ...paginationData,
            total: response.pagination?.totalItems || response.pagination?.total || data.length
          };
        }
        // Case 5: response is array directly
        else if (Array.isArray(response)) {
          data = response;
        }
        // Case 6: response.data is array
        else if (Array.isArray(response.data)) {
          data = response.data;
        }
      }

      setCertificates(data);
      setPagination(paginationData);
    } catch (error: any) {
      console.error('Error loading certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (record: any) => {
    setSelectedCertificate(record);
    setModalVisible(true);
  };

  const handleRequestRenewal = async (record: any) => {
    try {
      const id = record._id || record.id;
      if (!id) {
        return;
      }

      const now = new Date().toISOString();

      await certificateService.updateUserCertificate(id, {
        renewalStatus: 'PENDING',
        renewalRequestedAt: now,
        renewalRequestedBy: user?.id || undefined,
      });

      setCertificates(prev =>
        prev.map(c =>
          (c._id || c.id) === id
            ? { ...c, renewalStatus: 'PENDING', renewalRequestedAt: now, renewalRequestedBy: user?.id }
            : c,
        ),
      );
    } catch (error: any) {
      console.error('Error requesting renewal:', error);
    }
  };

  const columns = [
    {
      title: 'Chứng chỉ',
      dataIndex: 'certificateName',
      key: 'certificate',
      width: 250,
      render: (_: any, record: any) => {
        const certName = record.certificateName || record.certificate_id?.certificateName;
        const certCode = record.certificateCode || record.certificate_id?.certificateCode;
        const category = record.category || record.certificate_id?.category || 'OTHER';
        return certName ? (
          <div>
            <div className={styles.certificateName}>{certName}</div>
            {certCode && <div className={styles.certificateCode}>{certCode}</div>}
            <Tag color="blue" className={styles.categoryTag}>{getCategoryLabel(category)}</Tag>
          </div>
        ) : '-';
      }
    },
    {
      title: 'Ngày cấp',
      dataIndex: 'issueDate',
      key: 'issueDate',
      width: 120,
      render: (_: any, record: any) => {
        const date = record.issueDate || record.personalIssueDate;
        return date ? formatDate(date) : '-';
      }
    },
    {
      title: 'Ngày hết hạn',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      width: 140,
      render: (_: any, record: any) => {
        const date = record.expiryDate || record.personalExpiryDate;
        if (!date) return '-';
        return <div className={styles.dateText}>{formatDate(date)}</div>;
      }
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 180,
      render: (status: string, record: any) => {
        const safeStatus = status || 'ACTIVE';
        const date = record.expiryDate || record.personalExpiryDate;
        const daysUntilExpiration = date ? getDaysUntilExpiration(date) : null;
        const reminderStatus = getRenewalReminderStatus(daysUntilExpiration);
        const renewalStatus = record.renewalStatus || 'NOT_REQUESTED';
        
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
            <Tag color={getStatusColor(safeStatus)} icon={getStatusIcon(safeStatus)} className={styles.statusTag}>
              {safeStatus}
            </Tag>
            {renewalStatus === 'PENDING' && (
              <Tag color="orange" className={styles.statusTag}>
                Đã gửi đề nghị gia hạn
              </Tag>
            )}
            {reminderStatus.show && (
              <Tag 
                color={reminderStatus.color} 
                icon={reminderStatus.icon}
                className={styles.expiryWarning}
                style={{ margin: 0 }}
              >
                {reminderStatus.text}
              </Tag>
            )}
          </div>
        );
      }
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 160,
      render: (_: any, record: any) => {
        const date = record.expiryDate || record.personalExpiryDate;
        const days = date ? getDaysUntilExpiration(date) : null;
        const renewalStatus = record.renewalStatus || 'NOT_REQUESTED';
        const canRequest =
          (days !== null && days <= 90) &&
          renewalStatus !== 'PENDING' &&
          renewalStatus !== 'COMPLETED';

        return (
          <div style={{ display: 'flex', gap: 8 }}>
            <Tooltip title="Xem chi tiết">
              <Button
                type="text"
                icon={<EyeOutlined />}
                onClick={() => handleViewDetails(record)}
                className={styles.actionButton}
                style={{ color: '#3b82f6' }}
              />
            </Tooltip>
            {canRequest && (
              <Tooltip title="Đề nghị gia hạn">
                <Button
                  type="text"
                  icon={<ReloadOutlined />}
                  onClick={() => handleRequestRenewal(record)}
                  className={styles.actionButton}
                  style={{ color: '#16a34a' }}
                />
              </Tooltip>
            )}
          </div>
        );
      }
    }
  ];

  // Count certificates needing renewal
  const expiringSoonCount = certificates.filter(cert => {
    const date = cert.expiryDate || cert.personalExpiryDate;
    if (!date) return false;
    const days = getDaysUntilExpiration(date);
    return days !== null && days <= 90 && days > 0;
  }).length;

  const expiredCount = certificates.filter(cert => {
    const date = cert.expiryDate || cert.personalExpiryDate;
    if (!date) return false;
    const days = getDaysUntilExpiration(date);
    return days !== null && days < 0;
  }).length;

  return (
    <EmployeeLayout 
      title="Chứng chỉ cá nhân"
      icon={<IdcardOutlined />}
    >
      <div className={styles.container}>
        <Card className={styles.mainCard}>
          <div className={styles.header}>
            <Typography.Title level={2} className={styles.title}>
              <IdcardOutlined className={styles.titleIcon} />
              Chứng chỉ cá nhân
            </Typography.Title>
          </div>

          {certificates.length > 0 && (
            <div className={styles.statsCard}>
              <div className={styles.statItem}>
                <div className={styles.statLabel}>Tổng số chứng chỉ</div>
                <div className={styles.statValue}>{certificates.length}</div>
              </div>
              {expiredCount > 0 && (
                <div className={styles.statItem}>
                  <div className={styles.statLabel}>Đã hết hạn</div>
                  <div className={styles.statValue} style={{ background: 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                    {expiredCount}
                  </div>
                </div>
              )}
              {expiringSoonCount > 0 && (
                <div className={styles.statItem}>
                  <div className={styles.statLabel}>Sắp hết hạn</div>
                  <div className={styles.statValue} style={{ background: 'linear-gradient(135deg, #fa8c16 0%, #ffa940 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                    {expiringSoonCount}
                  </div>
                </div>
              )}
            </div>
          )}

          {(expiringSoonCount > 0 || expiredCount > 0) && (
            <div className={styles.alertWrapper}>
              <Alert
                message="Cảnh báo"
                description={
                  <div>
                    {expiredCount > 0 && (
                      <div style={{ marginBottom: '8px' }}>
                        <Text strong style={{ color: '#ff4d4f', fontSize: '15px' }}>
                          {expiredCount} chứng chỉ đã hết hạn
                        </Text>
                      </div>
                    )}
                    {expiringSoonCount > 0 && (
                      <div>
                        <Text strong style={{ color: '#fa8c16', fontSize: '15px' }}>
                          {expiringSoonCount} chứng chỉ sắp hết hạn (còn dưới 90 ngày)
                        </Text>
                      </div>
                    )}
                  </div>
                }
                type="warning"
                showIcon
                style={{ 
                  marginBottom: 0,
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, rgba(250, 173, 20, 0.1) 0%, rgba(255, 193, 7, 0.1) 100%)'
                }}
              />
            </div>
          )}

          <div className={styles.tableWrapper}>
            <Table
              className={styles.customTable}
              columns={columns}
              dataSource={certificates}
              rowKey={(record) => record._id || record.id || `cert-${Math.random()}`}
              loading={loading}
              pagination={{
                current: pagination.current,
                total: pagination.total,
                pageSize: pagination.pageSize,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} của ${total} chứng chỉ`,
                onChange: (page, size) => {
                  setPagination({
                    ...pagination,
                    current: page,
                    pageSize: size || 10
                  });
                },
                onShowSizeChange: (_current, size) => {
                  setPagination({
                    ...pagination,
                    current: 1,
                    pageSize: size
                  });
                },
                className: styles.paginationWrapper
              }}
              locale={{
                emptyText: (
                  <div className={styles.emptyState}>
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="Chưa có chứng chỉ nào"
                    />
                  </div>
                )
              }}
            />
          </div>
        </Card>

        <Modal
          title={<span className={styles.modalTitle}>Chi tiết chứng chỉ</span>}
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            setSelectedCertificate(null);
          }}
          footer={[
            <Button 
              key="close" 
              type="primary"
              onClick={() => {
                setModalVisible(false);
                setSelectedCertificate(null);
              }}
              style={{
                background: 'linear-gradient(135deg, #0f9b4d 0%, #34d399 100%)',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600
              }}
            >
              Đóng
            </Button>
          ]}
          width={700}
        >
          {selectedCertificate && (
            <Descriptions bordered column={1} className={styles.descriptionsWrapper}>
              <Descriptions.Item label="Tên chứng chỉ">
                {selectedCertificate.certificateName || selectedCertificate.certificate_id?.certificateName || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Mã chứng chỉ">
                {selectedCertificate.certificateCode || selectedCertificate.certificate_id?.certificateCode || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Danh mục">
                <Tag color="blue">
                  {getCategoryLabel(selectedCertificate.category || selectedCertificate.certificate_id?.category || 'OTHER')}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Cơ quan cấp">
                {selectedCertificate.issuingAuthority || selectedCertificate.certificate_id?.issuingAuthority || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày cấp">
                {selectedCertificate.issueDate || selectedCertificate.personalIssueDate 
                  ? formatDate(selectedCertificate.issueDate || selectedCertificate.personalIssueDate)
                  : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày hết hạn">
                {selectedCertificate.expiryDate || selectedCertificate.personalExpiryDate 
                  ? formatDate(selectedCertificate.expiryDate || selectedCertificate.personalExpiryDate)
                  : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={getStatusColor(selectedCertificate.status || 'ACTIVE')} icon={getStatusIcon(selectedCertificate.status || 'ACTIVE')}>
                  {selectedCertificate.status || 'ACTIVE'}
                </Tag>
              </Descriptions.Item>
              {selectedCertificate.description && (
                <Descriptions.Item label="Mô tả">
                  {selectedCertificate.description}
                </Descriptions.Item>
              )}
            </Descriptions>
          )}
        </Modal>
      </div>
    </EmployeeLayout>
  );
};

export default EmployeeCertificates;

