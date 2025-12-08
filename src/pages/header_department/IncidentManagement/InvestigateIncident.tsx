import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Card, 
  Typography, 
  Button, 
  Space,
  Form,
  Input,
  Select,
  message,
  Alert,
  Row,
  Col,
  Tag,
  Descriptions,
  Spin
} from 'antd';
import { 
  SearchOutlined, 
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  UserOutlined
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
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [incident, setIncident] = useState<Incident | null>(null);
  const [form] = Form.useForm();

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

  const handleSubmit = async (values: any) => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      await incidentService.investigateIncident(id, { 
        investigation: values.findings,
        solution: values.recommendations
      });
      message.success('Cập nhật kết quả điều tra thành công');
      navigate('/header-department/incident-management');
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
            <Button onClick={() => navigate('/header-department/incident-management')}>
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
        <Space style={{ marginBottom: '16px' }}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
            Quay lại
          </Button>
        </Space>
        <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <SearchOutlined style={{ color: '#1677ff' }} /> Điều tra sự cố
        </Title>
        <Text type="secondary">
          Mã sự cố: {incident.incidentId || incident._id}
        </Text>
      </Card>

      <Row gutter={[24, 24]}>
        {/* Left Column - Incident Summary */}
        <Col xs={24} lg={10}>
          <Card
            styles={{ body: { padding: '24px' } }}
            style={{
              borderRadius: 16,
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(6px)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.04)'
            }}
          >
            <Title level={4} style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <ExclamationCircleOutlined style={{ color: '#1677ff' }} />
              Tóm tắt sự cố
            </Title>
            
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Tiêu đề">
                <Text strong>{incident.title}</Text>
              </Descriptions.Item>
              
              {incident.description && (
                <Descriptions.Item label="Mô tả">
                  <Text>{incident.description}</Text>
                </Descriptions.Item>
              )}
              
              {incident.location && (
                <Descriptions.Item label="Vị trí">
                  <Text>{incident.location}</Text>
                </Descriptions.Item>
              )}
              
              <Descriptions.Item label="Mức độ">
                <Tag
                  bordered={false}
                  style={{
                    color: getSeverityColor(incident.severity),
                    background: 'transparent',
                    border: 'none',
                    padding: 0,
                    fontWeight: 600
                  }}
                >
                  {incident.severity ? incident.severity.charAt(0).toUpperCase() + incident.severity.slice(1) : 'Chưa xác định'}
                </Tag>
              </Descriptions.Item>
              
              <Descriptions.Item label="Trạng thái">
                <Tag
                  bordered={false}
                  style={{
                    color: getStatusColor(incident.status),
                    background: 'transparent',
                    border: 'none',
                    padding: 0,
                    fontWeight: 600
                  }}
                >
                  {incident.status ? incident.status.charAt(0).toUpperCase() + incident.status.slice(1) : 'Chưa xác định'}
                </Tag>
              </Descriptions.Item>
              
              {incident.createdAt && (
                <Descriptions.Item label="Ngày tạo">
                  <Text>{new Date(incident.createdAt).toLocaleString('vi-VN')}</Text>
                </Descriptions.Item>
              )}
              
              {incident.createdBy && (
                <Descriptions.Item label="Người báo cáo">
                  <Space>
                    <UserOutlined />
                    <Text>{incident.createdBy.full_name || incident.createdBy.username}</Text>
                  </Space>
                </Descriptions.Item>
              )}
            </Descriptions>

            {incident.images && incident.images.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <Text strong>Hình ảnh:</Text>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: 8 }}>
                  {incident.images.slice(0, 4).map((src, idx) => (
                    <img
                      key={idx}
                      src={src}
                      alt={`img-${idx}`}
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: '8px',
                        objectFit: 'cover',
                        border: '2px solid #f0f0f0'
                      }}
                    />
                  ))}
                  {incident.images.length > 4 && (
                    <div style={{
                      width: 60,
                      height: 60,
                      borderRadius: '8px',
                      background: '#f5f5f5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      color: '#666'
                    }}>
                      +{incident.images.length - 4}
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
            styles={{ body: { padding: '24px' } }}
            style={{
              borderRadius: 16,
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(6px)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.04)'
            }}
          >
            <Title level={4} style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <SearchOutlined style={{ color: '#1677ff' }} />
              Kết quả điều tra
            </Title>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
            >
              <Form.Item
                name="findings"
                label="Kết quả điều tra"
                rules={[{ required: true, message: 'Vui lòng nhập kết quả điều tra!' }]}
              >
                <Input.TextArea 
                  rows={6} 
                  placeholder="Mô tả chi tiết kết quả điều tra, những gì đã phát hiện..." 
                />
              </Form.Item>

              <Form.Item
                name="recommendations"
                label="Giải pháp khắc phục"
                rules={[{ required: true, message: 'Vui lòng nhập giải pháp khắc phục!' }]}
              >
                <Input.TextArea 
                  rows={6} 
                  placeholder="Mô tả giải pháp khắc phục sự cố..." 
                />
              </Form.Item>

              {error && (
                <Alert
                  message="Lỗi"
                  description={error}
                  type="error"
                  showIcon
                  style={{ marginBottom: '16px' }}
                />
              )}

              <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                <Space>
                  <Button onClick={() => navigate(-1)}>
                    Hủy
                  </Button>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={loading}
                    icon={<CheckCircleOutlined />}
                  >
                    Lưu kết quả điều tra
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default InvestigateIncident;