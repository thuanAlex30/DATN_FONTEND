import React, { useState } from 'react';
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
  Col
} from 'antd';
import { 
  ClockCircleOutlined, 
  ArrowLeftOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import incidentService from '../../../services/incidentService';

const { Title } = Typography;

const UpdateProgress: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form] = Form.useForm();

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
          <ClockCircleOutlined /> Cập nhật tiến độ
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
                name="note"
                label="Ghi chú tiến độ"
                rules={[{ required: true, message: 'Vui lòng nhập ghi chú tiến độ!' }]}
              >
                <Input.TextArea 
                  rows={8} 
                  placeholder="Mô tả chi tiết tiến độ xử lý sự cố..." 
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
                    Cập nhật tiến độ
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

export default UpdateProgress;