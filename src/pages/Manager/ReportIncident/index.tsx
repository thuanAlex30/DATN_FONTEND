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
  message,
  Row,
  Col
} from 'antd';
import {
  UploadOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { ManagerLayout } from '../../../components/Manager';
import incidentService from '../../../services/incidentService';

const { Option } = Select;
const { TextArea } = Input;

const ReportIncident: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
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

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Validate required fields
      if (!title || !description || !location) {
        message.error('Vui lòng điền đầy đủ thông tin bắt buộc!');
        setLoading(false);
        return;
      }
      
      const payload = {
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        severity: severity || 'nhẹ',
        images: images || []
      };
      
      const response = await incidentService.reportIncident(payload);
      
      if (response.data?.success) {
        message.success('Ghi nhận sự cố thành công!');
        setTitle('');
        setDescription('');
        setLocation('');
        setSeverity('nhẹ');
        setImages([]);
        form.resetFields();
        // Navigate back after 1 second
        setTimeout(() => {
          navigate('/manager/dashboard');
        }, 1000);
      } else {
        message.error(response.data?.message || 'Không thể ghi nhận sự cố');
      }
    } catch (err: any) {
      console.error('Error reporting incident:', err);
      const errorMessage = err?.response?.data?.message || 
                          err?.response?.data?.errors?.[0]?.message ||
                          err?.message || 
                          'Không thể ghi nhận sự cố. Vui lòng thử lại!';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ManagerLayout
      title="Báo cáo sự cố"
      icon={<ExclamationCircleOutlined />}
    >
      <div style={{ 
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        minHeight: 'calc(100vh - 64px)',
        padding: '24px' 
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>

        {/* Form */}
        <Card>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              severity: 'nhẹ'
            }}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form.Item 
                  name="title"
                  label="Tiêu đề" 
                  required
                  rules={[{ required: true, message: 'Vui lòng nhập tiêu đề sự cố!' }]}
                >
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Nhập tiêu đề sự cố"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item 
                  name="location"
                  label="Vị trí" 
                  required
                  rules={[{ required: true, message: 'Vui lòng nhập vị trí xảy ra sự cố!' }]}
                >
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Nhập vị trí xảy ra sự cố"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item 
              name="severity"
              label="Mức độ nghiêm trọng" 
              required
              rules={[{ required: true, message: 'Vui lòng chọn mức độ nghiêm trọng!' }]}
            >
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

            <Form.Item 
              name="description"
              label="Mô tả chi tiết" 
              required
              rules={[{ required: true, message: 'Vui lòng nhập mô tả chi tiết về sự cố!' }]}
            >
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
    </ManagerLayout>
  );
};

export default ReportIncident;