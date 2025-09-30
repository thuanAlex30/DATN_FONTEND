import React, { useState } from 'react';
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
  Col
} from 'antd';
import { 
  CloseCircleOutlined, 
  ArrowLeftOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import incidentService from '../../../services/incidentService';

const { Title } = Typography;

const CloseIncident: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      await incidentService.closeIncident(id);
      message.success('Đóng sự cố thành công');
      navigate('/admin/incident-management');
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Không thể đóng sự cố';
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Space style={{ marginBottom: '16px' }}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
            Quay lại
          </Button>
        </Space>
        <Title level={2}>
          <CloseCircleOutlined /> Đóng sự cố
        </Title>
      </div>

      <Row justify="center">
        <Col xs={24} sm={16} md={12} lg={8}>
          <Card>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
            >
              <Form.Item
                name="resolution"
                label="Giải pháp khắc phục"
                rules={[{ required: true, message: 'Vui lòng nhập giải pháp khắc phục!' }]}
              >
                <Input.TextArea 
                  rows={6} 
                  placeholder="Mô tả chi tiết giải pháp đã thực hiện để khắc phục sự cố..." 
                />
              </Form.Item>

              <Form.Item
                name="notes"
                label="Ghi chú bổ sung"
              >
                <Input.TextArea 
                  rows={3} 
                  placeholder="Ghi chú bổ sung (nếu có)..." 
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
                    Đóng sự cố
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

export default CloseIncident;