import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Select,
  Button,
  Space,
  message,
  Row,
  Col,
  Typography,
  Card,
  Tag,
  Avatar,
  Divider
} from 'antd';
import {
  UserOutlined,
  BookOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { api } from '../../../../services/api';

const { Title, Text } = Typography;
const { Option } = Select;

interface AssignTrainingModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  selectedEmployee?: any;
}

const AssignTrainingModal: React.FC<AssignTrainingModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  selectedEmployee
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedSession, setSelectedSession] = useState<any>(null);

  useEffect(() => {
    if (visible) {
      fetchEmployees();
      fetchSessions();
    }
  }, [visible]);

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/users');
      setEmployees(response.data.data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchSessions = async () => {
    try {
      const response = await api.get('/training-sessions');
      setSessions(response.data.data || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      await api.post('/training-enrollments', {
        user_id: values.employee_id,
        session_id: values.session_id,
        enrolled_at: new Date().toISOString()
      });
      
      message.success('Phân công đào tạo thành công!');
      onSuccess();
      form.resetFields();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra khi phân công đào tạo');
    } finally {
      setLoading(false);
    }
  };

  const handleSessionChange = (sessionId: string) => {
    const session = sessions.find(s => s._id === sessionId);
    setSelectedSession(session);
  };

  const getSessionInfo = () => {
    if (!selectedSession) return null;

    return (
      <Card size="small" style={{ marginTop: '16px' }}>
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <div>
            <Text strong>Thông tin buổi đào tạo:</Text>
          </div>
          <Row gutter={[8, 8]}>
            <Col span={24}>
              <Space>
                <BookOutlined style={{ color: '#1890ff' }} />
                <Text>{selectedSession.course_id?.course_name}</Text>
              </Space>
            </Col>
            <Col span={24}>
              <Space>
                <CalendarOutlined style={{ color: '#52c41a' }} />
                <Text>
                  {new Date(selectedSession.start_time).toLocaleString('vi-VN')}
                </Text>
              </Space>
            </Col>
            <Col span={24}>
              <Space>
                <ClockCircleOutlined style={{ color: '#fa8c16' }} />
                <Text>
                  {selectedSession.duration_hours || 'N/A'} giờ
                </Text>
              </Space>
            </Col>
            <Col span={24}>
              <Space>
                <TeamOutlined style={{ color: '#722ed1' }} />
                <Text>
                  Tối đa {selectedSession.max_participants || 'N/A'} người
                </Text>
              </Space>
            </Col>
          </Row>
        </Space>
      </Card>
    );
  };

  return (
    <Modal
      title="Phân công đào tạo"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          employee_id: selectedEmployee?._id
        }}
      >
        <Form.Item
          name="employee_id"
          label="Nhân viên"
          rules={[{ required: true, message: 'Vui lòng chọn nhân viên' }]}
        >
          <Select
            placeholder="Chọn nhân viên"
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              (option?.children as unknown as string)
                ?.toLowerCase()
                .includes(input.toLowerCase())
            }
          >
            {employees.map(employee => (
              <Option key={employee._id} value={employee._id}>
                <Space>
                  <Avatar size="small" icon={<UserOutlined />} />
                  <span>{employee.full_name}</span>
                  <Text type="secondary">({employee.email})</Text>
                </Space>
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="session_id"
          label="Buổi đào tạo"
          rules={[{ required: true, message: 'Vui lòng chọn buổi đào tạo' }]}
        >
          <Select
            placeholder="Chọn buổi đào tạo"
            onChange={handleSessionChange}
            showSearch
            optionFilterProp="children"
          >
            {sessions.map(session => (
              <Option key={session._id} value={session._id}>
                <Space direction="vertical" size={0}>
                  <Text strong>{session.session_name}</Text>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {session.course_id?.course_name} - {new Date(session.start_time).toLocaleString('vi-VN')}
                  </Text>
                </Space>
              </Option>
            ))}
          </Select>
        </Form.Item>

        {getSessionInfo()}

        <Divider />

        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
          <Space>
            <Button onClick={onCancel}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Phân công
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AssignTrainingModal;
