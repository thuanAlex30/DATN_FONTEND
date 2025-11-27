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
  WarningOutlined, 
  ArrowLeftOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import incidentService from '../../../services/incidentService';

const { Title } = Typography;

const ClassifyIncident: React.FC = () => {
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
      await incidentService.classifyIncident(id, { 
        severity: values.severity
      });
      message.success('Phân loại thành công');
      navigate('/header-department/incident-management');
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Không thể phân loại';
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
          <WarningOutlined /> Phân loại sự cố
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
                name="severity"
                label="Mức độ nghiêm trọng"
                rules={[{ required: true, message: 'Vui lòng chọn mức độ!' }]}
              >
                <Select placeholder="Chọn mức độ">
                  <Select.Option value="low">Thấp</Select.Option>
                  <Select.Option value="medium">Trung bình</Select.Option>
                  <Select.Option value="high">Cao</Select.Option>
                  <Select.Option value="critical">Nghiêm trọng</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="category"
                label="Danh mục"
                rules={[{ required: true, message: 'Vui lòng nhập danh mục!' }]}
              >
                <Input placeholder="Nhập danh mục sự cố" />
              </Form.Item>

              <Form.Item
                name="description"
                label="Mô tả chi tiết"
              >
                <Input.TextArea 
                  rows={4} 
                  placeholder="Mô tả chi tiết về sự cố..." 
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
                    Phân loại
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

export default ClassifyIncident;