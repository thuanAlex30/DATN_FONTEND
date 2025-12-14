import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  } | null;
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
  const navigate = useNavigate();
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
        // ApiResponse.success() => { success, message, data }
        const incidentData = response.data?.success ? response.data.data : response.data;
        setIncident(incidentData || null);
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

  const handleAddProgress = async (values: any) => {
    if (!id) return;
    try {
      await incidentService.updateIncidentProgress(id, { note: values.note });
      message.success('Thêm tiến độ thành công');
      setIsModalOpen(false);
      form.resetFields();
      // Refresh incident data
      const response = await incidentService.getIncidentById(id);
      const incidentData = response.data?.success ? response.data.data : response.data;
      setIncident(incidentData || null);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Không thể thêm tiến độ';
      message.error(errorMessage);
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
            <Button size="small" danger onClick={() => navigate('/header-department/incident-management')}>
              Quay lại danh sách
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
    <div style={{ 
      padding: '24px', 
      background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <Card
        styles={{ body: { padding: '20px 24px' } }}
        style={{
          marginBottom: 24,
          borderRadius: 16,
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 10px 30px rgba(24, 144, 255, 0.08)'
        }}
      >
        <Space style={{ marginBottom: '16px' }}>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => {
              if (window.history.length > 1) {
                navigate(-1);
              } else {
                navigate('/header-department/incident-management');
              }
            }}
          >
            Quay lại
          </Button>
        </Space>
        <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <ClockCircleOutlined style={{ color: '#1677ff' }} /> Lịch sử tiến độ sự cố
        </Title>
        <Text type="secondary">
          Mã sự cố: {incident.incidentId || incident._id}
        </Text>
      </Card>

      {/* Incident Info */}
      <Card 
        style={{ 
          marginBottom: '24px',
          borderRadius: 16,
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(6px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.04)'
        }}
      >
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
      <Card
        style={{ 
          borderRadius: 16,
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(6px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.04)'
        }}
      >
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <ClockCircleOutlined style={{ color: '#1677ff' }} />
            {incident.status === 'Đã đóng' ? 'Quy trình giải quyết sự cố' : 'Timeline tiến độ'}
          </Title>
          {incident.status !== 'Đã đóng' && (
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => setIsModalOpen(true)}
              shape="round"
            >
              Thêm tiến độ
            </Button>
          )}
        </div>
        
        {incident.status === 'Đã đóng' && (
          <Alert
            message="Sự cố đã được đóng"
            description="Đây là chế độ xem lại. Bạn chỉ có thể xem quy trình giải quyết sự cố, không thể thêm hoặc chỉnh sửa."
            type="info"
            showIcon
            style={{ marginBottom: '16px', borderRadius: 8 }}
          />
        )}

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
                        <Text strong>{entry.performedBy?.full_name || entry.performedBy?.username || 'Người dùng không xác định'}</Text>
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
          onFinish={handleAddProgress}
        >
          <Form.Item
            name="note"
            label="Ghi chú tiến độ"
            rules={[{ required: true, message: 'Vui lòng nhập ghi chú tiến độ!' }]}
          >
            <Input.TextArea rows={6} placeholder="Nhập ghi chú về tiến độ xử lý sự cố..." />
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