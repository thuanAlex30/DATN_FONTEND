import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Upload,
  Image,
  Typography,
  message,
  Row,
  Col,
  Space
} from 'antd';
import {
  ArrowLeftOutlined,
  UploadOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import incidentService from '../../../services/incidentService';
import userService from '../../../services/userService';
import styles from './ReportIncident.module.css';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface User {
  id: string;
  full_name: string;
  username?: string;
}

const ReportIncident: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [severity, setSeverity] = useState<'nhẹ' | 'nặng' | 'rất nghiêm trọng'>('nhẹ');
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Thêm các state mới cho Update Employee Incident
  const [affectedEmployeeId, setAffectedEmployeeId] = useState<string>('');
  const [employeeStatus, setEmployeeStatus] = useState<string>('Không bị thương');
  const [incidentType, setIncidentType] = useState<string>('Tai nạn lao động');
  const [witnesses, setWitnesses] = useState<string>('');
  const [medicalReport, setMedicalReport] = useState<string>('');
  const [users, setUsers] = useState<User[]>([]);

  // Load users khi component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersData = await userService.getAllUsers();
        setUsers(usersData);
      } catch (err) {
        console.error('Failed to load users:', err);
      }
    };

    fetchUsers();
  }, []);

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
      await incidentService.reportIncident({ 
        title, 
        description, 
        location, 
        severity, 
        images,
        ...(affectedEmployeeId && { affectedEmployeeId }),
        ...(employeeStatus && { employeeStatus }),
        ...(incidentType && { incidentType }),
        ...(witnesses && { witnesses: witnesses.split(',').map(w => w.trim()) }),
        ...(medicalReport && { medicalReport })
      } as any);
      message.success('Ghi nhận sự cố thành công!');
      // Reset form
      setTitle('');
      setDescription('');
      setLocation('');
      setSeverity('nhẹ');
      setImages([]);
      setAffectedEmployeeId('');
      setEmployeeStatus('Không bị thương');
      setIncidentType('Tai nạn lao động');
      setWitnesses('');
      setMedicalReport('');
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Không thể ghi nhận sự cố');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <Card className={styles.mainCard}>
          <div className={styles.header}>
            <Row justify="space-between" align="middle">
              <Col>
                <Title level={2} className={styles.title}>
                  <ExclamationCircleOutlined className={styles.titleIcon} />
                  Ghi nhận sự cố
                </Title>
              </Col>
              <Col>
                <Button 
                  type="default"
                  icon={<ArrowLeftOutlined />}
                  onClick={() => navigate('/home')}
                  size="large"
                  style={{
                    borderRadius: '8px',
                    fontWeight: 500
                  }}
                >
                  Về trang Home
                </Button>
              </Col>
            </Row>
          </div>

          <div className={styles.formContent}>
            <Form
              layout="vertical"
              onFinish={handleSubmit}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item label="Tiêu đề" required className={styles.formItem}>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Nhập tiêu đề sự cố"
                      required
                      size="large"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Vị trí" className={styles.formItem}>
                    <Input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Nhập vị trí xảy ra sự cố"
                      size="large"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="Mức độ nghiêm trọng" required className={styles.formItem}>
                <Select
                  value={severity}
                  onChange={(value) => setSeverity(value)}
                  style={{ width: '100%' }}
                  size="large"
                  className={styles.severitySelect}
                >
                  <Option value="nhẹ">Nhẹ</Option>
                  <Option value="nặng">Nặng</Option>
                  <Option value="rất nghiêm trọng">Rất nghiêm trọng</Option>
                </Select>
              </Form.Item>

            {/* Thêm các trường mới cho Update Employee Incident */}
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form.Item label="ID Người gặp sự cố" required>
                  <Select
                    value={affectedEmployeeId}
                    onChange={(value) => setAffectedEmployeeId(value)}
                    placeholder="Chọn nhân viên gặp sự cố"
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    {users.map(user => (
                      <Option key={user.id} value={user.id}>
                        {user.full_name} {user.username && `(${user.username})`}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Tình trạng nhân viên" required>
                  <Select
                    value={employeeStatus}
                    onChange={(value) => setEmployeeStatus(value)}
                    style={{ width: '100%' }}
                  >
                    <Option value="Không bị thương">Không bị thương</Option>
                    <Option value="Bị thương nhẹ">Bị thương nhẹ</Option>
                    <Option value="Bị thương nặng">Bị thương nặng</Option>
                    <Option value="Cần cấp cứu">Cần cấp cứu</Option>
                    <Option value="Tử vong">Tử vong</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form.Item label="Loại sự cố">
                  <Select
                    value={incidentType}
                    onChange={(value) => setIncidentType(value)}
                    style={{ width: '100%' }}
                  >
                    <Option value="Tai nạn lao động">Tai nạn lao động</Option>
                    <Option value="Sự cố thiết bị">Sự cố thiết bị</Option>
                    <Option value="Sự cố môi trường">Sự cố môi trường</Option>
                    <Option value="Sự cố an toàn">Sự cố an toàn</Option>
                    <Option value="Khác">Khác</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Người chứng kiến">
                  <Input
                    value={witnesses}
                    onChange={(e) => setWitnesses(e.target.value)}
                    placeholder="VD: Nguyễn Văn A, Trần Thị B"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label="Báo cáo y tế">
              <TextArea
                value={medicalReport}
                onChange={(e) => setMedicalReport(e.target.value)}
                rows={3}
                placeholder="Nhập báo cáo y tế chi tiết (nếu có)..."
              />
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
                    setAffectedEmployeeId('');
                    setEmployeeStatus('Không bị thương');
                    setIncidentType('Tai nạn lao động');
                    setWitnesses('');
                    setMedicalReport('');
                  }}
                  size="large"
                >
                  Xóa tất cả
                </Button>
              </Space>
            </Form.Item>
            </Form>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ReportIncident;
