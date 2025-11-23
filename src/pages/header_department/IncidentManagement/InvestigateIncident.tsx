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
  SearchOutlined, 
  ArrowLeftOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import incidentService from '../../../services/incidentService';

const { Title } = Typography;

const InvestigateIncident: React.FC = () => {
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
          <SearchOutlined /> Điều tra sự cố
        </Title>
      </div>

      <Row justify="center">
        <Col xs={24} sm={20} md={16} lg={12}>
          <Card>
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
                name="rootCause"
                label="Nguyên nhân gốc rễ"
                rules={[{ required: true, message: 'Vui lòng nhập nguyên nhân gốc rễ!' }]}
              >
                <Input.TextArea 
                  rows={4} 
                  placeholder="Xác định nguyên nhân gốc rễ của sự cố..." 
                />
              </Form.Item>

              <Form.Item
                name="recommendations"
                label="Khuyến nghị"
                rules={[{ required: true, message: 'Vui lòng nhập khuyến nghị!' }]}
              >
                <Input.TextArea 
                  rows={4} 
                  placeholder="Đưa ra các khuyến nghị để khắc phục và ngăn ngừa sự cố tương tự..." 
                />
              </Form.Item>

              <Form.Item
                name="priority"
                label="Mức độ ưu tiên"
                rules={[{ required: true, message: 'Vui lòng chọn mức độ ưu tiên!' }]}
              >
                <Select placeholder="Chọn mức độ ưu tiên">
                  <Select.Option value="low">Thấp</Select.Option>
                  <Select.Option value="medium">Trung bình</Select.Option>
                  <Select.Option value="high">Cao</Select.Option>
                  <Select.Option value="urgent">Khẩn cấp</Select.Option>
                </Select>
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