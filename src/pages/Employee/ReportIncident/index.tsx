import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Upload,
  Image,
  Space,
  Typography,
  message,
  Row,
  Col
} from 'antd';
import {
  ArrowLeftOutlined,
  UploadOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import incidentService from '../../../services/incidentService';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const ReportIncident: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [severity, setSeverity] = useState<'nhẹ' | 'nặng' | 'rất nghiêm trọng'>('nhẹ');
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files) return;
    const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    try {
      const selected = Array.from(files).slice(0, 10); // limit to 10 images
      const base64Images = await Promise.all(selected.map((f) => toBase64(f)));
      setImages((prev) => [...prev, ...base64Images]);
    } catch {
      message.error('Không thể đọc file hình ảnh');
    }
  };

  const handleRemoveImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await incidentService.reportIncident({ title, description, location, severity, images });
      message.success('Ghi nhận sự cố thành công!');
      setTitle('');
      setDescription('');
      setLocation('');
      setSeverity('nhẹ');
      setImages([]);
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Không thể ghi nhận sự cố');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
      padding: '24px' 
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <Card style={{ marginBottom: '24px' }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={2} style={{ margin: 0, color: '#2c3e50' }}>
                <ExclamationCircleOutlined style={{ color: '#e74c3c', marginRight: '10px' }} />
                Ghi nhận sự cố
              </Title>
            </Col>
            <Col>
              <Button 
                type="default"
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/home')}
              >
                Về trang Home
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Form */}
        <Card>
          <Form
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form.Item label="Tiêu đề" required>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Nhập tiêu đề sự cố"
                    required
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Vị trí">
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Nhập vị trí xảy ra sự cố"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label="Mức độ nghiêm trọng" required>
              <Select
                value={severity}
                onChange={(value) => setSeverity(value)}
                style={{ width: '100%' }}
              >
                <Option value="nhẹ">Nhẹ</Option>
                <Option value="nặng">Nặng</Option>
                <Option value="rất nghiêm trọng">Rất nghiêm trọng</Option>
              </Select>
            </Form.Item>

            <Form.Item label="Mô tả chi tiết">
              <TextArea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Mô tả chi tiết về sự cố..."
              />
            </Form.Item>

            <Form.Item label="Hình ảnh">
              <Upload
                accept="image/*"
                multiple
                beforeUpload={(file) => {
                  const files = [file];
                  handleFilesSelected(files as any);
                  return false; // Prevent upload
                }}
                showUploadList={false}
              >
                <Button icon={<UploadOutlined />}>
                  Chọn hình ảnh
                </Button>
              </Upload>
              
              {images.length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  <Row gutter={[8, 8]}>
                    {images.map((img, idx) => (
                      <Col key={idx} xs={12} sm={8} md={6}>
                        <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden' }}>
                          <Image
                            src={img}
                            alt={`incident-${idx}`}
                            style={{ width: '100%', height: '100px', objectFit: 'cover' }}
                            preview={false}
                          />
                          <Button
                            type="primary"
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={() => handleRemoveImage(idx)}
                            style={{
                              position: 'absolute',
                              top: '4px',
                              right: '4px',
                              minWidth: '24px',
                              height: '24px',
                              padding: '0'
                            }}
                          />
                        </div>
                      </Col>
                    ))}
                  </Row>
                </div>
              )}
            </Form.Item>

            <Form.Item>
              <Space>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                  size="large"
                >
                  {loading ? 'Đang gửi...' : 'Gửi báo cáo'}
                </Button>
                <Button 
                  type="default"
                  onClick={() => {
                    setTitle('');
                    setDescription('');
                    setLocation('');
                    setSeverity('nhẹ');
                    setImages([]);
                  }}
                  size="large"
                >
                  Xóa tất cả
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default ReportIncident;
