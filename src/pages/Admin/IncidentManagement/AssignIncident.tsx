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
  Col
} from 'antd';
import { 
  UserOutlined, 
  ArrowLeftOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import incidentService from '../../../services/incidentService';
import userService from '../../../services/userService';

const { Title } = Typography;

const AssignIncident: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await userService.getUsers();
        setUsers(response.data);
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };
    fetchUsers();
  }, []);

  const handleSubmit = async (values: any) => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      await incidentService.assignIncident(id, { assignedTo: values.assignedTo });
      message.success('Phân công thành công');
      navigate('/admin/incident-management');
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Không thể phân công';
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
          <UserOutlined /> Phân công người phụ trách
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
                name="assignedTo"
                label="Người phụ trách"
                rules={[{ required: true, message: 'Vui lòng chọn người phụ trách!' }]}
              >
                <Select
                  placeholder="Chọn người phụ trách"
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {users.map(user => (
                    <Select.Option key={user.id} value={user.id}>
                      {user.full_name} ({user.username})
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="note"
                label="Ghi chú"
              >
                <Input.TextArea 
                  rows={3} 
                  placeholder="Nhập ghi chú về việc phân công..." 
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
                    Phân công
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

export default AssignIncident;
