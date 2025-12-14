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
  Descriptions,
  Tag,
  Timeline
} from 'antd';
import { 
  ArrowUpOutlined, 
  ArrowLeftOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import incidentService from '../../../services/incidentService';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface Escalation {
  _id: string;
  escalation_level: string;
  reason: string;
  status: string;
  created_by: {
    _id: string;
    full_name: string;
    email: string;
    role_id?: {
      _id: string;
      role_name: string;
      role_code: string;
    };
  };
  created_at: string;
  resolved_by?: {
    _id: string;
    full_name: string;
    email: string;
  };
  resolved_at?: string;
}

const EscalateIncident: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [incident, setIncident] = useState<any>(null);
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        // Fetch incident details
        const incidentRes = await incidentService.getIncidentById(id);
        const incidentData = incidentRes.data?.success ? incidentRes.data.data : incidentRes.data;
        setIncident(incidentData);

        // Fetch escalations
        const escalationsRes = await incidentService.getIncidentEscalations(id);
        const escalationsData = escalationsRes.data?.success ? escalationsRes.data.data : (Array.isArray(escalationsRes.data) ? escalationsRes.data : []);
        setEscalations(escalationsData);
      } catch (err: any) {
        console.error('Error fetching data:', err);
      }
    };
    fetchData();
  }, [id]);

  const handleSubmit = async (values: any) => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      await incidentService.escalateIncident(id, {
        escalation_level: values.escalation_level,
        reason: values.reason
      });
      message.success('Báo cáo vượt cấp sự cố thành công');
      navigate('/header-department/incident-management');
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Không thể báo cáo vượt cấp sự cố';
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getEscalationLevelLabel = (level: string) => {
    const labels: Record<string, string> = {
      'SITE': 'Site Level',
      'DEPARTMENT': 'Department Level',
      'COMPANY': 'Company Level',
      'EXTERNAL': 'External Authority'
    };
    return labels[level] || level;
  };

  const getEscalationLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      'SITE': 'blue',
      'DEPARTMENT': 'orange',
      'COMPANY': 'red',
      'EXTERNAL': 'purple'
    };
    return colors[level] || 'default';
  };

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
          background: 'rgba(255,255,255,0.95)',
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
          <ArrowUpOutlined style={{ color: '#ff4d4f' }} /> Báo Cáo Vượt Cấp Sự Cố
        </Title>
      </Card>

      <Row gutter={[24, 24]}>
        {/* Incident Info */}
        {incident && (
          <Col xs={24} lg={12}>
            <Card 
              title={
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <InfoCircleOutlined style={{ color: '#1677ff' }} />
                  Thông tin sự cố
                </span>
              }
              style={{ 
                borderRadius: 16,
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(6px)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
                marginBottom: '24px'
              }}
            >
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="Mã sự cố">
                  {incident.incidentId || incident._id}
                </Descriptions.Item>
                <Descriptions.Item label="Tiêu đề">
                  {incident.title}
                </Descriptions.Item>
                <Descriptions.Item label="Mức độ">
                  <Tag color={incident.severity === 'critical' ? 'red' : 'orange'}>
                    {incident.severity}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <Tag>{incident.status}</Tag>
                </Descriptions.Item>
                {incident.location && (
                  <Descriptions.Item label="Vị trí">
                    {incident.location}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>
          </Col>
        )}

        {/* Escalation Form */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ArrowUpOutlined style={{ color: '#ff4d4f' }} />
                Báo cáo vượt cấp sự cố
              </span>
            }
            style={{ 
              borderRadius: 16,
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(6px)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.04)'
            }}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
            >
              <Form.Item
                name="escalation_level"
                label="Cấp độ báo cáo"
                rules={[{ required: true, message: 'Vui lòng chọn cấp độ báo cáo!' }]}
                tooltip="Chọn cấp độ cao hơn để báo cáo vượt cấp sự cố"
                initialValue="COMPANY"
              >
                <Select placeholder="Chọn cấp độ báo cáo">
                  <Select.Option value="COMPANY">
                    <Tag color="red">Company Level</Tag> - Báo cáo lên Company Admin
                  </Select.Option>
                  <Select.Option value="EXTERNAL">
                    <Tag color="purple">External Authority</Tag> - Báo cáo lên cơ quan bên ngoài
                  </Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="reason"
                label="Lý do báo cáo vượt cấp"
                rules={[
                  { required: true, message: 'Vui lòng nhập lý do báo cáo vượt cấp!' },
                  { min: 10, message: 'Lý do phải có ít nhất 10 ký tự!' }
                ]}
              >
                <TextArea 
                  rows={6} 
                  placeholder="Mô tả chi tiết lý do cần báo cáo vượt cấp sự cố này lên cấp trên..."
                  showCount
                  maxLength={500}
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
                    danger
                  >
                    Báo cáo vượt cấp
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* Escalation History */}
        {escalations.length > 0 && (
          <Col xs={24}>
            <Card 
              title={
                <Space>
                  <InfoCircleOutlined style={{ color: '#1677ff' }} />
                  <span>Lịch sử báo cáo vượt cấp</span>
                </Space>
              }
              style={{ 
                borderRadius: 16,
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(6px)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.04)'
              }}
            >
              <Timeline>
                {escalations.map((escalation) => (
                  <Timeline.Item
                    key={escalation._id}
                    color={getEscalationLevelColor(escalation.escalation_level)}
                  >
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      <div>
                        <Tag color={getEscalationLevelColor(escalation.escalation_level)}>
                          {getEscalationLevelLabel(escalation.escalation_level)}
                        </Tag>
                        <Tag>{escalation.status}</Tag>
                      </div>
                      <Text strong>
                        Báo cáo bởi: {escalation.created_by?.full_name} 
                        {escalation.created_by?.role_id && ` (${escalation.created_by.role_id.role_name})`}
                      </Text>
                      <Text type="secondary">
                        {new Date(escalation.created_at).toLocaleString('vi-VN')}
                      </Text>
                      <Text>{escalation.reason}</Text>
                    </Space>
                  </Timeline.Item>
                ))}
              </Timeline>
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default EscalateIncident;


