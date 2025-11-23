import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Card, 
  Typography, 
  Button, 
  Space,
  Timeline,
  Tag,
  Avatar,
  Row,
  Col,
  Input,
  Select,
  Modal,
  Form,
  message,
  Spin,
  Alert,
  Badge
} from 'antd';
import { 
  ClockCircleOutlined, 
  UserOutlined, 
  PlusOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import incidentService from '../../../services/incidentService';

interface ProgressEntry {
  _id: string;
  action: string;
  note: string;
  performedBy: {
    _id: string;
    full_name: string;
    username: string;
  };
  timestamp: string;
}

interface Incident {
  _id: string;
  incidentId?: string;
  title: string;
  description?: string;
  status?: string;
  histories?: ProgressEntry[];
}

const { Title, Text } = Typography;

const ProgressHistory: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchIncident = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await incidentService.getIncidentById(id);
        setIncident(response.data);
      } catch (err: any) {
        setError('Không thể tải thông tin sự cố');
        message.error('Không thể tải thông tin sự cố');
        console.error('Error fetching incident:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchIncident();
  }, [id]);

  const handleAddProgress = async () => {
    try {
      // Add progress entry logic here
      message.success('Thêm tiến độ thành công');
      setIsModalOpen(false);
      form.resetFields();
      // Refresh incident data
    } catch (err) {
      message.error('Không thể thêm tiến độ');
    }
  };

  const getActionColor = (action: string) => {
    switch (action?.toLowerCase()) {
      case 'ghi nhận':
        return 'blue';
      case 'phân loại':
        return 'orange';
      case 'phân công':
        return 'purple';
      case 'điều tra':
        return 'cyan';
      case 'khắc phục':
        return 'green';
      case 'cập nhật tiến độ':
        return 'volcano';
      case 'đóng sự cố':
        return 'red';
      default:
        return 'default';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action?.toLowerCase()) {
      case 'ghi nhận':
        return <ExclamationCircleOutlined />;
      case 'phân loại':
        return <InfoCircleOutlined />;
      case 'phân công':
        return <UserOutlined />;
      case 'điều tra':
        return <InfoCircleOutlined />;
      case 'khắc phục':
        return <CheckCircleOutlined />;
      case 'cập nhật tiến độ':
        return <ClockCircleOutlined />;
      case 'đóng sự cố':
        return <CheckCircleOutlined />;
      default:
        return <ClockCircleOutlined />;
    }
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
          action={
            <Button size="small" danger>
              <Link to="/header-department/incident-management">Quay lại danh sách</Link>
            </Button>
          }
        />
      </div>
    );
  }

  if (!incident) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Alert
          message="Không tìm thấy sự cố"
          description="Sự cố không tồn tại hoặc đã bị xóa"
          type="warning"
          showIcon
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Space style={{ marginBottom: '16px' }}>
          <Button icon={<ArrowLeftOutlined />}>
            <Link to="/header-department/incident-management">Quay lại</Link>
          </Button>
        </Space>
        <Title level={2}>
          <ClockCircleOutlined /> Lịch sử tiến độ sự cố
        </Title>
        <Text type="secondary">
          Mã sự cố: {incident.incidentId || incident._id}
        </Text>
      </div>

      {/* Incident Info */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Title level={4}>{incident.title}</Title>
            {incident.description && (
              <Text type="secondary">{incident.description}</Text>
            )}
          </Col>
          <Col xs={24} md={12}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Trạng thái: </Text>
                <Tag color={incident.status === 'closed' ? 'green' : 'blue'}>
                  {incident.status || 'Chưa xác định'}
                </Tag>
              </div>
              <div>
                <Text strong>Tổng số bước: </Text>
                <Badge count={incident.histories?.length || 0} showZero />
              </div>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Progress Timeline */}
      <Card>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4}>Timeline tiến độ</Title>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setIsModalOpen(true)}
          >
            Thêm tiến độ
          </Button>
        </div>

        {incident.histories && incident.histories.length > 0 ? (
          <Timeline
            items={incident.histories
              .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
              .map((entry) => ({
                dot: getActionIcon(entry.action),
                color: getActionColor(entry.action),
                children: (
                  <Card size="small" style={{ marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <Space>
                        <Tag color={getActionColor(entry.action)}>
                          {entry.action}
                        </Tag>
                        <Text type="secondary">
                          {new Date(entry.timestamp).toLocaleString('vi-VN')}
                        </Text>
                      </Space>
                      <Space>
                        <Avatar size="small" icon={<UserOutlined />} />
                        <Text strong>{entry.performedBy.full_name}</Text>
                      </Space>
                    </div>
                    {entry.note && (
                      <div>
                        <Text>{entry.note}</Text>
                      </div>
                    )}
                  </Card>
                ),
              }))}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <ClockCircleOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
            <div>
              <Text type="secondary">Chưa có lịch sử tiến độ nào</Text>
            </div>
          </div>
        )}
      </Card>

      {/* Add Progress Modal */}
      <Modal
        title="Thêm tiến độ mới"
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
            onFinish={() => handleAddProgress()}
        >
          <Form.Item
            name="action"
            label="Hành động"
            rules={[{ required: true, message: 'Vui lòng chọn hành động!' }]}
          >
            <Select placeholder="Chọn hành động">
              <Select.Option value="ghi nhận">Ghi nhận</Select.Option>
              <Select.Option value="phân loại">Phân loại</Select.Option>
              <Select.Option value="phân công">Phân công</Select.Option>
              <Select.Option value="điều tra">Điều tra</Select.Option>
              <Select.Option value="khắc phục">Khắc phục</Select.Option>
              <Select.Option value="cập nhật tiến độ">Cập nhật tiến độ</Select.Option>
              <Select.Option value="đóng sự cố">Đóng sự cố</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="note"
            label="Ghi chú"
            rules={[{ required: true, message: 'Vui lòng nhập ghi chú!' }]}
          >
            <Input.TextArea rows={4} placeholder="Nhập ghi chú về tiến độ..." />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsModalOpen(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                Thêm tiến độ
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProgressHistory;