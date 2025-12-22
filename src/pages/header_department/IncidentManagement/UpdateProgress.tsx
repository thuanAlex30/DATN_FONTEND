import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  Spin,
  Badge,
  Descriptions,
  Divider
} from 'antd';
import { 
  ClockCircleOutlined, 
  ArrowLeftOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  ExclamationCircleOutlined,
  EnvironmentOutlined,
  TagOutlined
} from '@ant-design/icons';
import incidentService from '../../../services/incidentService';

const { Title, Text } = Typography;

interface Incident {
  _id: string;
  incidentId?: string;
  title: string;
  description?: string;
  status?: string;
  location?: string;
  severity?: string;
}

const UpdateProgress: React.FC = () => {
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
      await incidentService.updateIncidentProgress(id, { 
        note: values.note || values.progress
      });
      message.success('Cập nhật tiến độ thành công');
      navigate('/header-department/incident-management');
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Không thể cập nhật tiến độ';
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div style={{ 
        padding: '24px', 
        background: 'linear-gradient(135deg, #f0f2f5 0%, #fafafa 50%, #eef2ff 100%)',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Spin size="large" tip="Đang tải thông tin..." />
      </div>
    );
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Đang xử lý':
        return '#1677ff';
      case 'Đã đóng':
        return '#52c41a';
      case 'Mới ghi nhận':
        return '#faad14';
      default:
        return '#1677ff';
    }
  };

  return (
    <div style={{ 
      padding: '24px', 
      background: 'linear-gradient(135deg, #f0f2f5 0%, #fafafa 50%, #eef2ff 100%)',
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
              paddingRight: 16,
              border: '1px solid #d9d9d9'
            }}
          >
            Quay lại
          </Button>
          {incident?.status && (
            <Badge 
              count={incident.status} 
              style={{ 
                backgroundColor: getStatusColor(incident.status),
                padding: '4px 12px',
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 500
              }}
            />
          )}
        </Space>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            background: 'linear-gradient(135deg, #1677ff 0%, #1890ff 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(22, 119, 255, 0.35)',
            flexShrink: 0
          }}>
            <ClockCircleOutlined style={{ color: '#fff', fontSize: 28 }} />
          </div>
          <div style={{ flex: 1 }}>
            <Title level={2} style={{ margin: 0, fontSize: 28, fontWeight: 600 }}>
              Cập nhật tiến độ
            </Title>
            {incident && (
              <Text type="secondary" style={{ fontSize: 14, display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <FileTextOutlined />
                <span>Mã sự cố: <Text strong style={{ color: '#1677ff' }}>{incident.incidentId || incident._id}</Text></span>
              </Text>
            )}
          </div>
        </div>
      </Card>

      <Row gutter={[24, 24]} justify="center">
        {/* Incident Info Card */}
        {incident && (
          <Col xs={24} lg={8}>
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
                  Thông tin sự cố
                </Title>
              </div>
              
              <Descriptions 
                column={1} 
                size="middle"
                labelStyle={{ 
                  fontWeight: 600, 
                  color: '#595959',
                  width: '120px',
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
                
                {incident.severity && (
                  <Descriptions.Item 
                    label={
                      <Space>
                        <TagOutlined style={{ color: '#1677ff' }} />
                        <span>Mức độ</span>
                      </Space>
                    }
                  >
                    <Badge 
                      color={incident.severity === 'rất nghiêm trọng' ? 'red' : incident.severity === 'nặng' ? 'orange' : 'blue'}
                      text={incident.severity}
                    />
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>
          </Col>
        )}

        {/* Update Form Card */}
        <Col xs={24} lg={incident ? 16 : { span: 16, offset: 4 }}>
          <Card
            styles={{ body: { padding: 32 } }}
            style={{ 
              borderRadius: 16,
              background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(0, 0, 0, 0.06)'
            }}
          >
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(82, 196, 26, 0.25)'
                }}>
                  <FileTextOutlined style={{ color: '#fff', fontSize: 18 }} />
                </div>
                <Title level={4} style={{ margin: 0, fontWeight: 600, fontSize: 18 }}>
                  Ghi chú tiến độ
                </Title>
              </div>
              <Text type="secondary" style={{ fontSize: 13, marginLeft: 52 }}>
                Mô tả chi tiết về tiến độ xử lý sự cố hiện tại
              </Text>
            </div>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              requiredMark={false}
            >
              <Form.Item
                name="note"
                label={
                  <span style={{ fontSize: 15, fontWeight: 500 }}>
                    <Text type="danger">*</Text> Ghi chú tiến độ
                  </span>
                }
                rules={[{ required: true, message: 'Vui lòng nhập ghi chú tiến độ!' }]}
                style={{ marginBottom: 24 }}
              >
                <Input.TextArea 
                  rows={10} 
                  placeholder="Mô tả chi tiết tiến độ xử lý sự cố..." 
                  style={{
                    fontSize: 14,
                    lineHeight: 1.6,
                    padding: '12px 16px',
                    borderRadius: 8,
                    border: '1px solid #d9d9d9',
                    transition: 'all 0.3s'
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

              {error && (
                <Alert
                  message="Lỗi cập nhật"
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

              <Divider style={{ margin: '24px 0' }} />

              <Form.Item style={{ marginBottom: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                  <Button 
                    onClick={() => navigate(-1)}
                    size="large"
                    style={{
                      borderRadius: 8,
                      height: 42,
                      paddingLeft: 24,
                      paddingRight: 24,
                      fontSize: 15,
                      fontWeight: 500,
                      border: '1px solid #d9d9d9'
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
                      height: 42,
                      paddingLeft: 24,
                      paddingRight: 24,
                      fontSize: 15,
                      fontWeight: 500,
                      background: 'linear-gradient(135deg, #1677ff 0%, #1890ff 100%)',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(22, 119, 255, 0.3)',
                      transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(22, 119, 255, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(22, 119, 255, 0.3)';
                    }}
                  >
                    Cập nhật tiến độ
                  </Button>
                </div>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default UpdateProgress;