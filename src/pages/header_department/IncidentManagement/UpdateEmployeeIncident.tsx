import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Row,
  Col,
  message,
  Spin,
  Alert,
  Typography,
  Space,
  Divider
} from 'antd';
import {
  UserOutlined,
  ExclamationCircleOutlined,
  SaveOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import incidentService from '../../../services/incidentService';
import userService from '../../../services/userService';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface IncidentData {
  _id: string;
  title: string;
  description?: string;
  location?: string;
  severity?: string;
  status?: string;
  affectedEmployeeId?: string;
  employeeStatus?: string;
  medicalReport?: string;
  witnesses?: string[];
  incidentType?: string;
  additionalNotes?: string;
}

interface User {
  id: string;
  full_name: string;
  username?: string;
}

const UpdateEmployeeIncident: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [incident, setIncident] = useState<IncidentData | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load incident data
  useEffect(() => {
    const fetchIncident = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await incidentService.getIncidentById(id);
        const incidentData = response.data?.success ? response.data.data : response.data;
        setIncident(incidentData);
        
        // Set form values (if these fields exist in the incident model)
        form.setFieldsValue({
          affectedEmployeeId: incidentData?.affectedEmployeeId,
          employeeStatus: incidentData?.employeeStatus,
          medicalReport: incidentData?.medicalReport,
          witnesses: incidentData?.witnesses,
          incidentType: incidentData?.incidentType,
          additionalNotes: incidentData?.additionalNotes
        });
      } catch (err: any) {
        setError('Không thể tải thông tin sự cố');
        message.error('Không thể tải thông tin sự cố');
      } finally {
        setLoading(false);
      }
    };

    fetchIncident();
  }, [id, form]);

  // Load users for employee selection
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await userService.getAllUsers();
        setUsers(users);
      } catch (err) {
        console.error('Failed to load users:', err);
      }
    };

    fetchUsers();
  }, []);

  const handleSubmit = async (values: any) => {
    if (!id) return;

    try {
      setSubmitting(true);
      // Use updateIncident to update employee-related fields
      await incidentService.updateIncident(id, values);
      message.success('Cập nhật thông tin nhân viên thành công!');
      navigate('/header-department/incident-management');
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err.message || 'Cập nhật thất bại';
      message.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate('/header-department/incident-management');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="Lỗi tải dữ liệu"
          description={error}
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Space>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={handleBack}
            type="text"
          >
            Quay lại
          </Button>
          <Title level={2} style={{ margin: 0 }}>
            <UserOutlined /> Cập nhật thông tin nhân viên trong sự cố
          </Title>
        </Space>
      </div>

      {/* Incident Info Card */}
      {incident && (
        <Card style={{ marginBottom: '24px' }}>
          <Title level={4}>
            <ExclamationCircleOutlined /> Thông tin sự cố
          </Title>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <strong>Tiêu đề:</strong> {incident.title}
            </Col>
            <Col span={12}>
              <strong>Vị trí:</strong> {incident.location || 'Chưa xác định'}
            </Col>
            <Col span={12}>
              <strong>Mức độ:</strong> {incident.severity || 'Chưa xác định'}
            </Col>
            <Col span={12}>
              <strong>Trạng thái:</strong> {incident.status || 'Chưa xác định'}
            </Col>
            {incident.description && (
              <Col span={24}>
                <strong>Mô tả:</strong> {incident.description}
              </Col>
            )}
          </Row>
        </Card>
      )}

      {/* Update Form */}
      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            employeeStatus: 'Không bị thương',
            incidentType: 'Tai nạn lao động'
          }}
        >
          <Title level={4}>Thông tin nhân viên gặp sự cố</Title>
          
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item
                label="ID Nhân viên gặp sự cố"
                name="affectedEmployeeId"
                rules={[
                  { required: true, message: 'Vui lòng chọn nhân viên gặp sự cố!' }
                ]}
              >
                <Select
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

            <Col span={12}>
              <Form.Item
                label="Tình trạng nhân viên"
                name="employeeStatus"
                rules={[
                  { required: true, message: 'Vui lòng chọn tình trạng nhân viên!' }
                ]}
              >
                <Select placeholder="Chọn tình trạng nhân viên">
                  <Option value="Không bị thương">Không bị thương</Option>
                  <Option value="Bị thương nhẹ">Bị thương nhẹ</Option>
                  <Option value="Bị thương nặng">Bị thương nặng</Option>
                  <Option value="Cần cấp cứu">Cần cấp cứu</Option>
                  <Option value="Tử vong">Tử vong</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Loại sự cố"
                name="incidentType"
              >
                <Select placeholder="Chọn loại sự cố">
                  <Option value="Tai nạn lao động">Tai nạn lao động</Option>
                  <Option value="Sự cố thiết bị">Sự cố thiết bị</Option>
                  <Option value="Sự cố môi trường">Sự cố môi trường</Option>
                  <Option value="Sự cố an toàn">Sự cố an toàn</Option>
                  <Option value="Khác">Khác</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Người chứng kiến"
                name="witnesses"
                tooltip="Nhập danh sách người chứng kiến, cách nhau bởi dấu phẩy"
              >
                <Input placeholder="VD: Nguyễn Văn A, Trần Thị B" />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label="Báo cáo y tế"
                name="medicalReport"
              >
                <TextArea
                  rows={4}
                  placeholder="Nhập báo cáo y tế chi tiết (nếu có)..."
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label="Ghi chú bổ sung"
                name="additionalNotes"
              >
                <TextArea
                  rows={3}
                  placeholder="Nhập các ghi chú bổ sung về sự cố..."
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={submitting}
                size="large"
              >
                Cập nhật thông tin
              </Button>
              <Button
                onClick={handleBack}
                size="large"
              >
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default UpdateEmployeeIncident;
