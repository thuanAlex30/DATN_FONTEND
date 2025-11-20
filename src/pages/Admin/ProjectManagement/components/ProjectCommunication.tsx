import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Input,
  List,
  Avatar,
  Typography,
  Space,
  Tag,
  Modal,
  Form,
  Select,
  DatePicker,
  message,
  Row,
  Col
} from 'antd';
import {
  PlusOutlined,
  SendOutlined,
  MessageOutlined,
  PhoneOutlined,
  VideoCameraOutlined,
  FileTextOutlined,
  CalendarOutlined,
  UserOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { projectCommunicationService } from '../../../../services/projectCommunicationService';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface ProjectCommunicationProps {
  projectId: string;
}

interface ProjectCommunication {
  id: string;
  communication_type: string;
  subject: string;
  message: string;
  participants: string[];
  scheduled_date?: string;
  priority: string;
  status: string;
  attachments: string[];
  follow_up_required: boolean;
  follow_up_date?: string;
  created_at: string;
}

const ProjectCommunication: React.FC<ProjectCommunicationProps> = ({ projectId }) => {
  const [communications, setCommunications] = useState<ProjectCommunication[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCommunication, setSelectedCommunication] = useState<ProjectCommunication | null>(null);
  const [form] = Form.useForm();
  const [newMessage, setNewMessage] = useState('');

  // Load communications
  const loadCommunications = async () => {
    if (!projectId) return;
    
    try {
      setLoading(true);
      const response = await projectCommunicationService.getProjectMessages(projectId);
      // The service returns { data: array, success: boolean }
      const messages = response?.data || [];
      
      // Map ProjectMessage to ProjectCommunication format
      const mappedCommunications = Array.isArray(messages) ? messages.map((msg: any) => ({
        id: msg.id || msg._id,
        communication_type: 'message',
        subject: `Tin nhắn từ ${msg.sender_name || 'Người dùng'}`,
        message: msg.content || '',
        participants: [msg.sender_name || 'Người dùng'],
        scheduled_date: undefined,
        priority: 'medium',
        status: 'sent',
        attachments: msg.attachments || [],
        follow_up_required: false,
        follow_up_date: undefined,
        created_at: msg.created_at
      })) : [];
      
      setCommunications(mappedCommunications);
    } catch (error: any) {
      console.error('Error loading communications:', error);
      message.error('Không thể tải danh sách giao tiếp');
      // Set empty array on error to prevent filter issues
      setCommunications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCommunications();
  }, [projectId]);

  // Handle create communication
  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      
      const communicationData = {
        project_id: projectId,
        communication_type: values.communication_type,
        subject: values.subject,
        message: values.message,
        participants: values.participants || [],
        scheduled_date: values.scheduled_date 
          ? dayjs(values.scheduled_date).toISOString() 
          : null,
        priority: values.priority,
        status: values.status,
        attachments: values.attachments || [],
        follow_up_required: values.follow_up_required || false,
        follow_up_date: values.follow_up_date 
          ? dayjs(values.follow_up_date).toISOString() 
          : null,
        content: values.message,
        message_type: 'TEXT' as const
      };

      const response = await projectCommunicationService.sendMessage(communicationData);
      if (response.success) {
        message.success('Tạo giao tiếp thành công!');
        setModalVisible(false);
        form.resetFields();
        loadCommunications();
      } else {
        message.error(response.message || 'Có lỗi xảy ra khi tạo giao tiếp');
      }
    } catch (error: any) {
      console.error('Error creating communication:', error);
      message.error(error.response?.data?.message || 'Có lỗi xảy ra khi tạo giao tiếp');
    } finally {
      setLoading(false);
    }
  };

  // Handle send quick message
  const handleSendMessage = async () => {
    if (!newMessage.trim()) {
      message.warning('Vui lòng nhập nội dung tin nhắn');
      return;
    }

    try {
      setLoading(true);
      
      const communicationData = {
        project_id: projectId,
        communication_type: 'message',
        subject: 'Tin nhắn nhanh',
        message: newMessage,
        participants: [],
        priority: 'medium',
        status: 'sent',
        content: newMessage,
        message_type: 'TEXT' as const
      };

      const response = await projectCommunicationService.sendMessage(communicationData);
      if (response.success) {
        message.success('Gửi tin nhắn thành công!');
        setNewMessage('');
        loadCommunications();
      } else {
        message.error(response.message || 'Có lỗi xảy ra khi gửi tin nhắn');
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      message.error('Có lỗi xảy ra khi gửi tin nhắn');
    } finally {
      setLoading(false);
    }
  };

  // Handle view communication
  const handleView = (communication: ProjectCommunication) => {
    setSelectedCommunication(communication);
  };

  // Get communication type icon
  const getCommunicationTypeIcon = (type: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      'meeting': <CalendarOutlined />,
      'email': <MessageOutlined />,
      'phone': <PhoneOutlined />,
      'video': <VideoCameraOutlined />,
      'message': <MessageOutlined />,
      'document': <FileTextOutlined />
    };
    return icons[type] || <MessageOutlined />;
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    const colors: { [key: string]: string } = {
      'low': 'green',
      'medium': 'orange',
      'high': 'red',
      'critical': 'red'
    };
    return colors[priority] || 'default';
  };

  // Get status color
  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'scheduled': 'blue',
      'sent': 'green',
      'delivered': 'green',
      'read': 'green',
      'cancelled': 'red'
    };
    return colors[status] || 'default';
  };

  // Calculate statistics
  const stats = {
    total: Array.isArray(communications) ? communications.length : 0,
    meetings: Array.isArray(communications) ? communications.filter(c => c?.communication_type === 'meeting').length : 0,
    messages: Array.isArray(communications) ? communications.filter(c => c?.communication_type === 'message').length : 0,
    emails: Array.isArray(communications) ? communications.filter(c => c?.communication_type === 'email').length : 0
  };

  return (
    <div>
      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <MessageOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
              <div style={{ marginTop: '8px' }}>
                <Text strong>{stats.total}</Text>
                <br />
                <Text type="secondary">Tổng Giao Tiếp</Text>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <CalendarOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
              <div style={{ marginTop: '8px' }}>
                <Text strong>{stats.meetings}</Text>
                <br />
                <Text type="secondary">Cuộc Họp</Text>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <MessageOutlined style={{ fontSize: '24px', color: '#faad14' }} />
              <div style={{ marginTop: '8px' }}>
                <Text strong>{stats.messages}</Text>
                <br />
                <Text type="secondary">Tin Nhắn</Text>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <FileTextOutlined style={{ fontSize: '24px', color: '#722ed1' }} />
              <div style={{ marginTop: '8px' }}>
                <Text strong>{stats.emails}</Text>
                <br />
                <Text type="secondary">Email</Text>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Quick Message */}
      <Card title="Tin Nhắn Nhanh" style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col span={20}>
            <Input.TextArea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Nhập tin nhắn nhanh..."
              rows={3}
            />
          </Col>
          <Col span={4}>
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSendMessage}
              loading={loading}
              style={{ height: '100%' }}
            >
              Gửi
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Communications List */}
      <Card
        title="Lịch Sử Giao Tiếp"
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setModalVisible(true)}
          >
            Tạo Giao Tiếp
          </Button>
        }
      >
        <List
          dataSource={Array.isArray(communications) ? communications : []}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} của ${total} giao tiếp`
          }}
          renderItem={(communication) => {
            if (!communication) return null;
            
            return (
              <List.Item
                actions={[
                  <Button 
                    type="text" 
                    onClick={() => handleView(communication)}
                  >
                    Xem Chi Tiết
                  </Button>
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar 
                      icon={getCommunicationTypeIcon(communication.communication_type || 'message')}
                      style={{ 
                        backgroundColor: communication.communication_type === 'meeting' ? '#52c41a' : 
                                       communication.communication_type === 'email' ? '#1890ff' : '#faad14'
                      }}
                    />
                  }
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Text strong>{communication.subject || 'Không có tiêu đề'}</Text>
                      <Tag color={getPriorityColor(communication.priority || 'medium')}>
                        {communication.priority === 'low' && 'Thấp'}
                        {communication.priority === 'medium' && 'Trung bình'}
                        {communication.priority === 'high' && 'Cao'}
                        {communication.priority === 'critical' && 'Nghiêm trọng'}
                      </Tag>
                      <Tag color={getStatusColor(communication.status || 'sent')}>
                        {communication.status === 'scheduled' && 'Đã lên lịch'}
                        {communication.status === 'sent' && 'Đã gửi'}
                        {communication.status === 'delivered' && 'Đã giao'}
                        {communication.status === 'read' && 'Đã đọc'}
                        {communication.status === 'cancelled' && 'Đã hủy'}
                      </Tag>
                    </div>
                  }
                  description={
                    <div>
                      <Text>{communication.message || 'Không có nội dung'}</Text>
                      <br />
                      <Space>
                        <Text type="secondary">
                          <ClockCircleOutlined /> {communication.created_at ? dayjs(communication.created_at).format('DD/MM/YYYY HH:mm') : 'Không có ngày'}
                        </Text>
                        {communication.participants && Array.isArray(communication.participants) && communication.participants.length > 0 && (
                          <Text type="secondary">
                            <UserOutlined /> {communication.participants.length} người tham gia
                          </Text>
                        )}
                      </Space>
                    </div>
                  }
                />
              </List.Item>
            );
          }}
        />
      </Card>

      {/* Create Communication Modal */}
      <Modal
        title="Tạo Giao Tiếp Mới"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={800}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            communication_type: 'message',
            priority: 'medium',
            status: 'scheduled',
            follow_up_required: false
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="communication_type"
                label="Loại Giao Tiếp"
                rules={[{ required: true, message: 'Vui lòng chọn loại giao tiếp' }]}
              >
                <Select placeholder="Chọn loại giao tiếp">
                  <Option value="meeting">Cuộc họp</Option>
                  <Option value="email">Email</Option>
                  <Option value="phone">Điện thoại</Option>
                  <Option value="video">Video call</Option>
                  <Option value="message">Tin nhắn</Option>
                  <Option value="document">Tài liệu</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="priority"
                label="Ưu Tiên"
                rules={[{ required: true, message: 'Vui lòng chọn ưu tiên' }]}
              >
                <Select placeholder="Chọn ưu tiên">
                  <Option value="low">Thấp</Option>
                  <Option value="medium">Trung bình</Option>
                  <Option value="high">Cao</Option>
                  <Option value="critical">Nghiêm trọng</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="subject"
            label="Tiêu Đề"
            rules={[
              { required: true, message: 'Vui lòng nhập tiêu đề' },
              { max: 255, message: 'Tiêu đề không được quá 255 ký tự' }
            ]}
          >
            <Input placeholder="Nhập tiêu đề giao tiếp" />
          </Form.Item>

          <Form.Item
            name="message"
            label="Nội Dung"
            rules={[
              { required: true, message: 'Vui lòng nhập nội dung' },
              { max: 2000, message: 'Nội dung không được quá 2000 ký tự' }
            ]}
          >
            <TextArea 
              rows={4} 
              placeholder="Nhập nội dung giao tiếp"
            />
          </Form.Item>

          <Form.Item
            name="participants"
            label="Người Tham Gia"
          >
            <Select
              mode="tags"
              placeholder="Nhập tên người tham gia"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="scheduled_date"
                label="Ngày Lên Lịch"
              >
                <DatePicker 
                  style={{ width: '100%' }} 
                  placeholder="Chọn ngày lên lịch"
                  showTime
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Trạng Thái"
                rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
              >
                <Select placeholder="Chọn trạng thái">
                  <Option value="scheduled">Đã lên lịch</Option>
                  <Option value="sent">Đã gửi</Option>
                  <Option value="delivered">Đã giao</Option>
                  <Option value="read">Đã đọc</Option>
                  <Option value="cancelled">Đã hủy</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="follow_up_required"
            label="Cần Theo Dõi"
            valuePropName="checked"
          >
            <Select placeholder="Chọn cần theo dõi">
              <Option value={true}>Có</Option>
              <Option value={false}>Không</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="follow_up_date"
            label="Ngày Theo Dõi"
            dependencies={['follow_up_required']}
          >
            <DatePicker 
              style={{ width: '100%' }} 
              placeholder="Chọn ngày theo dõi"
            />
          </Form.Item>

          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            gap: '8px',
            marginTop: '24px',
            paddingTop: '16px',
            borderTop: '1px solid #f0f0f0'
          }}>
            <Button onClick={() => setModalVisible(false)}>
              Hủy
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              icon={<PlusOutlined />}
            >
              Tạo Giao Tiếp
            </Button>
          </div>
        </Form>
      </Modal>

      {/* View Communication Modal */}
      <Modal
        title="Chi Tiết Giao Tiếp"
        open={!!selectedCommunication}
        onCancel={() => setSelectedCommunication(null)}
        footer={null}
        width={600}
      >
        {selectedCommunication && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Title level={4}>{selectedCommunication.subject}</Title>
                <Text>{selectedCommunication.message}</Text>
              </Col>
              
              <Col span={12}>
                <Text strong>Loại:</Text>
                <br />
                <Tag color="blue">
                  {selectedCommunication.communication_type === 'meeting' && 'Cuộc họp'}
                  {selectedCommunication.communication_type === 'email' && 'Email'}
                  {selectedCommunication.communication_type === 'phone' && 'Điện thoại'}
                  {selectedCommunication.communication_type === 'video' && 'Video call'}
                  {selectedCommunication.communication_type === 'message' && 'Tin nhắn'}
                  {selectedCommunication.communication_type === 'document' && 'Tài liệu'}
                </Tag>
              </Col>
              
              <Col span={12}>
                <Text strong>Trạng Thái:</Text>
                <br />
                <Tag color={getStatusColor(selectedCommunication.status)}>
                  {selectedCommunication.status === 'scheduled' && 'Đã lên lịch'}
                  {selectedCommunication.status === 'sent' && 'Đã gửi'}
                  {selectedCommunication.status === 'delivered' && 'Đã giao'}
                  {selectedCommunication.status === 'read' && 'Đã đọc'}
                  {selectedCommunication.status === 'cancelled' && 'Đã hủy'}
                </Tag>
              </Col>
              
              <Col span={12}>
                <Text strong>Ưu Tiên:</Text>
                <br />
                <Tag color={getPriorityColor(selectedCommunication.priority)}>
                  {selectedCommunication.priority === 'low' && 'Thấp'}
                  {selectedCommunication.priority === 'medium' && 'Trung bình'}
                  {selectedCommunication.priority === 'high' && 'Cao'}
                  {selectedCommunication.priority === 'critical' && 'Nghiêm trọng'}
                </Tag>
              </Col>
              
              <Col span={12}>
                <Text strong>Ngày Tạo:</Text>
                <br />
                <Text>{dayjs(selectedCommunication.created_at).format('DD/MM/YYYY HH:mm')}</Text>
              </Col>
              
              {selectedCommunication.scheduled_date && (
                <Col span={12}>
                  <Text strong>Ngày Lên Lịch:</Text>
                  <br />
                  <Text>{dayjs(selectedCommunication.scheduled_date).format('DD/MM/YYYY HH:mm')}</Text>
                </Col>
              )}
              
              {selectedCommunication.participants && selectedCommunication.participants.length > 0 && (
                <Col span={24}>
                  <Text strong>Người Tham Gia:</Text>
                  <br />
                  {selectedCommunication.participants.map((participant: string, index: number) => (
                    <Tag key={index} style={{ marginBottom: '4px' }}>
                      {participant}
                    </Tag>
                  ))}
                </Col>
              )}
              
              {selectedCommunication.follow_up_required && (
                <Col span={24}>
                  <Text strong>Theo Dõi:</Text>
                  <br />
                  <Text>Cần theo dõi</Text>
                  {selectedCommunication.follow_up_date && (
                    <Text> - Ngày: {dayjs(selectedCommunication.follow_up_date).format('DD/MM/YYYY')}</Text>
                  )}
                </Col>
              )}
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ProjectCommunication;