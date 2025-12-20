import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { 
  Card, 
  Typography, 
  Button, 
  Space,
  Form,
  Input,
  message,
  Alert,
  Row,
  Col,
  Tag,
  Descriptions,
  Spin,
  Divider,
  Avatar,
  Image,
  Modal,
  Badge,
  Upload
} from 'antd';
import { 
  SearchOutlined, 
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  FileTextOutlined,
  SafetyCertificateOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  UploadOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import incidentService from '../../../services/incidentService';

const { Title, Text } = Typography;

interface Incident {
  _id: string;
  incidentId?: string;
  title: string;
  description?: string;
  location?: string;
  severity?: string;
  status?: string;
  createdAt?: string;
  images?: string[];
  createdBy?: {
    full_name: string;
    username: string;
  };
}

const InvestigateIncident: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [incident, setIncident] = useState<Incident | null>(null);
  const [form] = Form.useForm();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [findingsImages, setFindingsImages] = useState<string[]>([]);

  // Detect if user is Manager or Department Head based on current route
  const isManagerRoute = location.pathname.includes('/manager/incidents');

  useEffect(() => {
    const fetchIncident = async () => {
      if (!id) return;
      
      try {
        setFetchLoading(true);
        const response = await incidentService.getIncidentById(id);
        const incidentData = response.data?.success ? response.data.data : response.data;
        setIncident(incidentData || null);
      } catch (err: any) {
        setError('Không thể tải thông tin sự cố');
        message.error('Không thể tải thông tin sự cố');
        console.error('Error fetching incident:', err);
      } finally {
        setFetchLoading(false);
      }
    };

    fetchIncident();
  }, [id]);

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files) return;
    const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    try {
      const selected = Array.from(files).slice(0, 5); // limit to 5 images
      const base64Images = await Promise.all(selected.map((f) => toBase64(f)));
      setFindingsImages((prev) => {
        const updated = [...prev, ...base64Images];
        return updated.slice(0, 5); // Max 5 images
      });
    } catch {
      message.error('Không thể đọc file hình ảnh');
    }
  };

  const handleRemoveImage = (idx: number) => {
    setFindingsImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (values: any) => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      await incidentService.investigateIncident(id, { 
        investigation: values.findings,
        solution: values.recommendations,
        findingsImages: findingsImages.length > 0 ? findingsImages : undefined
      });
      message.success('Cập nhật kết quả điều tra thành công');
      // Redirect based on user role (Manager or Department Head)
      if (isManagerRoute) {
        navigate('/manager/incidents/assigned');
      } else {
        navigate('/header-department/incident-management');
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Không thể cập nhật kết quả điều tra';
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
      case 'rất nghiêm trọng':
        return '#ff4d4f';
      case 'high':
      case 'nghiêm trọng':
      case 'nặng':
        return '#fa8c16';
      case 'medium':
      case 'trung bình':
        return '#fadb14';
      case 'low':
      case 'nhẹ':
        return '#52c41a';
      default:
        return '#d9d9d9';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'open':
      case 'mới ghi nhận':
        return '#ff4d4f';
      case 'in_progress':
      case 'đang xử lý':
        return '#1677ff';
      case 'resolved':
      case 'đã giải quyết':
        return '#52c41a';
      case 'closed':
      case 'đã đóng':
        return '#8c8c8c';
      default:
        return '#d9d9d9';
    }
  };

  if (fetchLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error || !incident) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="Lỗi tải dữ liệu"
          description={error || 'Không tìm thấy sự cố'}
          type="error"
          showIcon
          action={
            <Button onClick={() => {
              if (isManagerRoute) {
                navigate('/manager/incidents/assigned');
              } else {
                navigate('/header-department/incident-management');
              }
            }}>
              Quay lại danh sách
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '24px', 
      background: 'linear-gradient(135deg, #f0f2f5 0%, #fafafa 50%, #f0f2f5 100%)',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <Card
        styles={{ body: { padding: '24px 28px' } }}
        style={{
          marginBottom: 24,
          borderRadius: 16,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 4px 16px rgba(0, 0, 0, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.8)'
        }}
      >
        <Space style={{ marginBottom: '20px', width: '100%', justifyContent: 'space-between' }}>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate(-1)}
            style={{
              borderRadius: 8,
              height: 36,
              paddingLeft: 16,
              paddingRight: 16
            }}
          >
            Quay lại
          </Button>
          <Badge 
            count={incident.status === 'Đang xử lý' ? 'Đang xử lý' : 0} 
            style={{ backgroundColor: '#1677ff' }}
          />
        </Space>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: 'linear-gradient(135deg, #1677ff 0%, #1890ff 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(22, 119, 255, 0.3)'
          }}>
            <SearchOutlined style={{ color: '#fff', fontSize: 24 }} />
          </div>
          <div>
            <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8, fontSize: 28 }}>
              Điều tra sự cố
            </Title>
            <Text type="secondary" style={{ fontSize: 14 }}>
              <FileTextOutlined style={{ marginRight: 6 }} />
              Mã sự cố: <Text strong style={{ color: '#1677ff' }}>{incident.incidentId || incident._id}</Text>
            </Text>
          </div>
        </div>
      </Card>

      <Row gutter={[24, 24]}>
        {/* Left Column - Incident Summary */}
        <Col xs={24} lg={10}>
          <Card
            styles={{ body: { padding: 28 } }}
            style={{
              borderRadius: 16,
              background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(0, 0, 0, 0.06)',
              height: '100%'
            }}
          >
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 12, 
              marginBottom: 24,
              paddingBottom: 20,
              borderBottom: '2px solid #f0f0f0'
            }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(255, 77, 79, 0.25)'
              }}>
                <ExclamationCircleOutlined style={{ color: '#fff', fontSize: 22 }} />
              </div>
              <Title level={4} style={{ margin: 0, fontWeight: 600, fontSize: 20 }}>
                Tóm tắt sự cố
              </Title>
            </div>
            
            <Descriptions 
              column={1} 
              size="middle"
              labelStyle={{ 
                fontWeight: 600, 
                color: '#595959',
                width: '140px',
                fontSize: 14
              }}
              contentStyle={{ fontSize: 14 }}
            >
              <Descriptions.Item 
                label={
                  <Space>
                    <FileTextOutlined style={{ color: '#1677ff' }} />
                    <span>Tiêu đề</span>
                  </Space>
                }
              >
                <Text strong style={{ fontSize: 15, color: '#262626' }}>{incident.title}</Text>
              </Descriptions.Item>
              
              {incident.description && (
                <Descriptions.Item 
                  label={
                    <Space>
                      <FileTextOutlined style={{ color: '#1677ff' }} />
                      <span>Mô tả</span>
                    </Space>
                  }
                >
                  <Text style={{ color: '#595959', lineHeight: 1.6 }}>{incident.description}</Text>
                </Descriptions.Item>
              )}
              
              {incident.location && (
                <Descriptions.Item 
                  label={
                    <Space>
                      <EnvironmentOutlined style={{ color: '#1677ff' }} />
                      <span>Vị trí</span>
                    </Space>
                  }
                >
                  <Text style={{ color: '#595959' }}>{incident.location}</Text>
                </Descriptions.Item>
              )}
              
              <Descriptions.Item 
                label={
                  <Space>
                    <SafetyCertificateOutlined style={{ color: '#1677ff' }} />
                    <span>Mức độ</span>
                  </Space>
                }
              >
                <Tag
                  style={{
                    color: '#fff',
                    backgroundColor: getSeverityColor(incident.severity),
                    border: 'none',
                    padding: '4px 12px',
                    borderRadius: 6,
                    fontWeight: 600,
                    fontSize: 13,
                    boxShadow: `0 2px 8px ${getSeverityColor(incident.severity)}40`
                  }}
                >
                  {incident.severity ? incident.severity.charAt(0).toUpperCase() + incident.severity.slice(1) : 'Chưa xác định'}
                </Tag>
              </Descriptions.Item>
              
              <Descriptions.Item 
                label={
                  <Space>
                    <ClockCircleOutlined style={{ color: '#1677ff' }} />
                    <span>Trạng thái</span>
                  </Space>
                }
              >
                <Tag
                  style={{
                    color: '#fff',
                    backgroundColor: getStatusColor(incident.status),
                    border: 'none',
                    padding: '4px 12px',
                    borderRadius: 6,
                    fontWeight: 600,
                    fontSize: 13,
                    boxShadow: `0 2px 8px ${getStatusColor(incident.status)}40`
                  }}
                >
                  {incident.status ? incident.status.charAt(0).toUpperCase() + incident.status.slice(1) : 'Chưa xác định'}
                </Tag>
              </Descriptions.Item>
              
              {incident.createdAt && (
                <Descriptions.Item 
                  label={
                    <Space>
                      <CalendarOutlined style={{ color: '#1677ff' }} />
                      <span>Ngày tạo</span>
                    </Space>
                  }
                >
                  <Text style={{ color: '#595959' }}>{new Date(incident.createdAt).toLocaleString('vi-VN')}</Text>
                </Descriptions.Item>
              )}
              
              {incident.createdBy && (
                <Descriptions.Item 
                  label={
                    <Space>
                      <UserOutlined style={{ color: '#1677ff' }} />
                      <span>Người báo cáo</span>
                    </Space>
                  }
                >
                  <Space>
                    <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: '#1677ff' }} />
                    <Text strong style={{ color: '#262626' }}>
                      {incident.createdBy.full_name || incident.createdBy.username}
                    </Text>
                  </Space>
                </Descriptions.Item>
              )}
            </Descriptions>

            {incident.images && incident.images.length > 0 && (
              <div style={{ marginTop: 28, paddingTop: 20, borderTop: '2px solid #f0f0f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <EyeOutlined style={{ color: '#1677ff', fontSize: 16 }} />
                  <Text strong style={{ fontSize: 15, color: '#262626' }}>Hình ảnh đính kèm</Text>
                  <Badge count={incident.images.length} style={{ backgroundColor: '#1677ff' }} />
                </div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {incident.images.slice(0, 6).map((src, idx) => (
                    <div
                      key={idx}
                      onClick={() => setPreviewImage(src)}
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: 12,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        border: '2px solid #e8e8e8',
                        transition: 'all 0.3s ease',
                        position: 'relative'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#1677ff';
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(22, 119, 255, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e8e8e8';
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <img
                        src={src}
                        alt={`img-${idx}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                      <div style={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        width: 20,
                        height: 20,
                        borderRadius: 4,
                        background: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <EyeOutlined style={{ color: '#fff', fontSize: 12 }} />
                      </div>
                    </div>
                  ))}
                  {incident.images.length > 6 && (
                    <div style={{
                      width: 80,
                      height: 80,
                      borderRadius: 12,
                      background: 'linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                      color: '#666',
                      fontWeight: 600,
                      border: '2px solid #e8e8e8'
                    }}>
                      +{incident.images.length - 6}
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card>
        </Col>

        {/* Right Column - Investigation Form */}
        <Col xs={24} lg={14}>
          <Card
            styles={{ body: { padding: 28 } }}
            style={{
              borderRadius: 16,
              background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(0, 0, 0, 0.06)'
            }}
          >
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 12, 
              marginBottom: 28,
              paddingBottom: 20,
              borderBottom: '2px solid #f0f0f0'
            }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(82, 196, 26, 0.25)'
              }}>
                <SearchOutlined style={{ color: '#fff', fontSize: 22 }} />
              </div>
              <div>
                <Title level={4} style={{ margin: 0, fontWeight: 600, fontSize: 20 }}>
                  Kết quả điều tra
                </Title>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  Điền thông tin chi tiết về kết quả điều tra và giải pháp khắc phục
                </Text>
              </div>
            </div>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              requiredMark={false}
            >
              <Form.Item
                name="findings"
                label={
                  <Space>
                    <FileTextOutlined style={{ color: '#1677ff' }} />
                    <Text strong style={{ fontSize: 15, color: '#262626' }}>Kết quả điều tra</Text>
                  </Space>
                }
                rules={[{ required: true, message: 'Vui lòng nhập kết quả điều tra!' }]}
                style={{ marginBottom: 24 }}
              >
                <Input.TextArea 
                  rows={7} 
                  placeholder="Mô tả chi tiết kết quả điều tra, những gì đã phát hiện, nguyên nhân gây ra sự cố..."
                  style={{
                    borderRadius: 8,
                    fontSize: 14,
                    padding: '12px 16px',
                    border: '1px solid #d9d9d9',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#1677ff';
                    e.target.style.boxShadow = '0 0 0 2px rgba(22, 119, 255, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d9d9d9';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </Form.Item>

              <Form.Item
                label={
                  <Space>
                    <UploadOutlined style={{ color: '#1677ff', fontSize: 16 }} />
                    <Text strong style={{ fontSize: 15, color: '#262626' }}>Hình ảnh minh chứng kết quả điều tra</Text>
                    {findingsImages.length > 0 && (
                      <Badge 
                        count={findingsImages.length} 
                        style={{ 
                          backgroundColor: '#1677ff',
                          boxShadow: '0 2px 8px rgba(22, 119, 255, 0.3)'
                        }} 
                      />
                    )}
                  </Space>
                }
                style={{ marginBottom: 24 }}
              >
                <Upload
                  accept="image/*"
                  multiple
                  beforeUpload={(file) => {
                    const files = [file];
                    handleFilesSelected(files as any);
                    return false; // Prevent upload
                  }}
                  showUploadList={false}
                  disabled={findingsImages.length >= 5}
                >
                  <div
                    style={{
                      border: '2px dashed #d9d9d9',
                      borderRadius: 12,
                      padding: findingsImages.length === 0 ? '20px 16px' : '12px',
                      textAlign: 'center',
                      background: findingsImages.length === 0 
                        ? 'linear-gradient(135deg, rgba(24, 144, 255, 0.03) 0%, rgba(64, 169, 255, 0.03) 100%)'
                        : 'transparent',
                      cursor: findingsImages.length >= 5 ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      if (findingsImages.length < 5) {
                        e.currentTarget.style.borderColor = '#1677ff';
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(24, 144, 255, 0.08) 0%, rgba(64, 169, 255, 0.08) 100%)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(22, 119, 255, 0.15)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (findingsImages.length === 0) {
                        e.currentTarget.style.borderColor = '#d9d9d9';
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(24, 144, 255, 0.03) 0%, rgba(64, 169, 255, 0.03) 100%)';
                        e.currentTarget.style.boxShadow = 'none';
                      } else {
                        e.currentTarget.style.borderColor = '#d9d9d9';
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.boxShadow = 'none';
                      }
                    }}
                  >
                    {findingsImages.length === 0 ? (
                      <Space direction="vertical" size={6} style={{ width: '100%' }}>
                        <div style={{
                          width: 40,
                          height: 40,
                          borderRadius: 10,
                          background: 'linear-gradient(135deg, #1677ff 0%, #40a9ff 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto',
                          boxShadow: '0 2px 8px rgba(22, 119, 255, 0.3)'
                        }}>
                          <UploadOutlined style={{ color: '#fff', fontSize: 18 }} />
                        </div>
                        <Text style={{ fontSize: 14, color: '#595959', display: 'block' }}>
                          Kéo thả hoặc click để chọn hình ảnh
                        </Text>
                        <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                          Hỗ trợ JPG, PNG, GIF
                        </Text>
                      </Space>
                    ) : (
                      <Button 
                        type="default"
                        icon={<UploadOutlined />}
                        size="small"
                        style={{
                          borderRadius: 8,
                          border: '1px solid #1677ff',
                          color: '#1677ff',
                          background: '#fff',
                          fontWeight: 500
                        }}
                        disabled={findingsImages.length >= 5}
                      >
                        {findingsImages.length >= 5 ? 'Đã đạt giới hạn' : 'Thêm hình ảnh'}
                      </Button>
                    )}
                  </div>
                </Upload>
                
                {findingsImages.length > 0 && (
                  <div style={{ marginTop: '20px' }}>
                    <Row gutter={[12, 12]}>
                      {findingsImages.map((img, idx) => (
                        <Col key={idx} xs={12} sm={8} md={6}>
                          <div 
                            style={{ 
                              position: 'relative', 
                              borderRadius: 12, 
                              overflow: 'hidden',
                              border: '2px solid #f0f0f0',
                              background: '#fff',
                              transition: 'all 0.3s ease',
                              cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = '#1677ff';
                              e.currentTarget.style.boxShadow = '0 4px 12px rgba(22, 119, 255, 0.2)';
                              e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = '#f0f0f0';
                              e.currentTarget.style.boxShadow = 'none';
                              e.currentTarget.style.transform = 'translateY(0)';
                            }}
                            onClick={() => setPreviewImage(img)}
                          >
                            <Image
                              src={img}
                              alt={`findings-${idx}`}
                              style={{ 
                                width: '100%', 
                                height: '120px', 
                                objectFit: 'cover',
                                display: 'block'
                              }}
                              preview={false}
                            />
                            <div style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 100%)',
                              padding: '8px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}>
                              <Badge 
                                count={idx + 1} 
                                style={{ 
                                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                  color: '#1677ff',
                                  fontWeight: 600,
                                  minWidth: '24px',
                                  height: '24px',
                                  lineHeight: '24px'
                                }} 
                              />
                            </div>
                            <Button
                              type="primary"
                              danger
                              size="small"
                              icon={<DeleteOutlined />}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveImage(idx);
                              }}
                              style={{
                                position: 'absolute',
                                bottom: '8px',
                                right: '8px',
                                minWidth: '32px',
                                height: '32px',
                                padding: '0',
                                borderRadius: 8,
                                boxShadow: '0 2px 8px rgba(255, 77, 79, 0.4)',
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            />
                            <div style={{
                              position: 'absolute',
                              bottom: 0,
                              left: 0,
                              right: 0,
                              height: '30px',
                              background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.1) 100%)',
                              pointerEvents: 'none'
                            }} />
                          </div>
                        </Col>
                      ))}
                    </Row>
                  </div>
                )}
              </Form.Item>

              <Divider style={{ margin: '24px 0' }} />

              <Form.Item
                name="recommendations"
                label={
                  <Space>
                    <SafetyCertificateOutlined style={{ color: '#52c41a' }} />
                    <Text strong style={{ fontSize: 15, color: '#262626' }}>Giải pháp khắc phục</Text>
                  </Space>
                }
                rules={[{ required: true, message: 'Vui lòng nhập giải pháp khắc phục!' }]}
                style={{ marginBottom: 24 }}
              >
                <Input.TextArea 
                  rows={7} 
                  placeholder="Mô tả giải pháp khắc phục sự cố, các biện pháp đã thực hiện hoặc đề xuất..."
                  style={{
                    borderRadius: 8,
                    fontSize: 14,
                    padding: '12px 16px',
                    border: '1px solid #d9d9d9',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#52c41a';
                    e.target.style.boxShadow = '0 0 0 2px rgba(82, 196, 26, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d9d9d9';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </Form.Item>

              {error && (
                <Alert
                  message="Lỗi"
                  description={error}
                  type="error"
                  showIcon
                  style={{ 
                    marginBottom: 24,
                    borderRadius: 8,
                    border: '1px solid #ffccc7'
                  }}
                />
              )}

              <Divider style={{ margin: '28px 0 24px 0' }} />

              <Form.Item style={{ marginBottom: 0 }}>
                <Space style={{ width: '100%', justifyContent: 'flex-end' }} size="middle">
                  <Button 
                    onClick={() => navigate(-1)}
                    size="large"
                    style={{
                      borderRadius: 8,
                      height: 44,
                      paddingLeft: 24,
                      paddingRight: 24,
                      fontSize: 15,
                      fontWeight: 500
                    }}
                  >
                    Hủy
                  </Button>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={loading}
                    icon={<CheckCircleOutlined />}
                    size="large"
                    style={{
                      borderRadius: 8,
                      height: 44,
                      paddingLeft: 32,
                      paddingRight: 32,
                      fontSize: 15,
                      fontWeight: 600,
                      background: 'linear-gradient(135deg, #1677ff 0%, #1890ff 100%)',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(22, 119, 255, 0.3)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(22, 119, 255, 0.4)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(22, 119, 255, 0.3)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    Lưu kết quả điều tra
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>

      {/* Image Preview Modal */}
      <Modal
        open={!!previewImage}
        footer={null}
        onCancel={() => setPreviewImage(null)}
        centered
        width="auto"
        style={{ maxWidth: '90vw' }}
      >
        {previewImage && (
          <Image
            src={previewImage}
            alt="preview"
            style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: 8 }}
          />
        )}
      </Modal>
    </div>
  );
};

export default InvestigateIncident;