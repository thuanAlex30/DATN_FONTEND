import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Input,
  Select,
  Modal,
  Form,
  message,
  Typography,
  Descriptions,
  Badge,
  Divider,
} from 'antd';
import {
  MessageOutlined,
  EyeOutlined,
  SendOutlined,
  SearchOutlined,
  ReloadOutlined,
  UserOutlined,
  MailOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import contactMessageService, {
  type ContactMessage,
  type ContactMessageQuery,
} from '../../services/contactMessageService';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const SupportMessages: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState<ContactMessageQuery>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Modal states
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [replyForm] = Form.useForm();

  // Load messages
  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await contactMessageService.getMessages(filters);
      console.log('Loaded messages response:', response);
      setMessages(response.messages || []);
      if (response.pagination) {
        setPagination({
          current: response.pagination.page,
          pageSize: response.pagination.limit,
          total: response.pagination.total,
        });
      }
    } catch (error: any) {
      console.error('Error loading messages:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      const errorMsg = error.response?.data?.message || error.message || 'Không thể tải danh sách tin nhắn';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [filters]);

  // Handle view message
  const handleView = async (message: ContactMessage) => {
    setSelectedMessage(message);
    setViewModalVisible(true);
    
    // Mark as read if unread
    if (message.status === 'new') {
      try {
        await contactMessageService.markAsRead(message._id);
        loadMessages(); // Reload to update status
      } catch (error) {
        console.error('Error marking as read:', error);
      }
    }
  };

  // Handle reply
  const handleReply = (message: ContactMessage) => {
    setSelectedMessage(message);
    replyForm.resetFields();
    setReplyModalVisible(true);
  };

  const handleReplySubmit = async (values: { replyMessage: string }) => {
    if (!selectedMessage) return;

    try {
      await contactMessageService.replyToMessage(selectedMessage._id, values.replyMessage);
      message.success('Đã trả lời tin nhắn thành công');
      setReplyModalVisible(false);
      replyForm.resetFields();
      loadMessages();
    } catch (error: any) {
      console.error('Error replying to message:', error);
      message.error(error.response?.data?.message || 'Không thể trả lời tin nhắn');
    }
  };


  // Handle table change
  const handleTableChange = (newPagination: any) => {
    setFilters({
      ...filters,
      page: newPagination.current,
      limit: newPagination.pageSize,
    });
  };

  // Handle filter change
  const handleStatusFilter = (status: string) => {
    setFilters({
      ...filters,
      status: status || undefined,
      page: 1,
    });
  };

  const handleSearch = (value: string) => {
    setFilters({
      ...filters,
      search: value || undefined,
      page: 1,
    });
  };

  // Columns
  const columns: ColumnsType<ContactMessage> = [
    {
      title: 'Người gửi',
      dataIndex: 'name',
      key: 'name',
      width: 250,
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 600, color: '#262626', marginBottom: '4px' }}>{text}</div>
          <Text type="secondary" style={{ fontSize: 13 }}>{record.email}</Text>
        </div>
      ),
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'subject',
      key: 'subject',
      ellipsis: {
        showTitle: false,
      },
      render: (text: string) => (
        <Text strong style={{ color: '#1890ff' }}>{text}</Text>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        const statusConfig: Record<string, { color: string; text: string }> = {
          new: { color: 'blue', text: 'Mới' },
          read: { color: 'default', text: 'Đã đọc' },
          replied: { color: 'green', text: 'Đã trả lời' },
          archived: { color: 'gray', text: 'Đã lưu trữ' },
        };
        const config = statusConfig[status] || { color: 'default', text: status };
        return (
          <Badge
            status={config.color as any}
            text={config.text}
          />
        );
      },
    },
    {
      title: 'Ngày gửi',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
      sorter: true,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 180,
      fixed: 'right' as const,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            Xem
          </Button>
          {record.status !== 'replied' && (
            <Button
              type="link"
              icon={<SendOutlined />}
              onClick={() => handleReply(record)}
            >
              Trả lời
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      <Card 
        style={{ 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderRadius: '8px'
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
              <MessageOutlined style={{ color: '#1890ff', fontSize: '24px' }} /> 
              Tin nhắn hỗ trợ
            </Title>
            <Button
              icon={<ReloadOutlined />}
              onClick={loadMessages}
              loading={loading}
              size="large"
            >
              Làm mới
            </Button>
          </div>

          {/* Search and Filter */}
          <Space size="middle" style={{ width: '100%' }} wrap>
            <Input
              placeholder="Tìm kiếm theo tên, email, tiêu đề..."
              prefix={<SearchOutlined />}
              style={{ width: 400, maxWidth: '100%' }}
              size="large"
              allowClear
              onPressEnter={(e) => handleSearch(e.currentTarget.value)}
              onChange={(e) => !e.target.value && handleSearch('')}
            />
            <Select
              placeholder="Lọc theo trạng thái"
              style={{ width: 200 }}
              size="large"
              allowClear
              onChange={handleStatusFilter}
            >
              <Option value="new">Mới</Option>
              <Option value="read">Đã đọc</Option>
              <Option value="replied">Đã trả lời</Option>
              <Option value="archived">Đã lưu trữ</Option>
            </Select>
          </Space>

          {/* Table */}
          <Table
            columns={columns}
            dataSource={messages}
            rowKey="_id"
            loading={loading}
            pagination={{
              ...pagination,
              showSizeChanger: true,
              showTotal: (total) => `Tổng cộng: ${total} tin nhắn`,
              pageSizeOptions: ['10', '20', '50', '100'],
              showQuickJumper: true,
            }}
            onChange={handleTableChange}
            scroll={{ x: 1000 }}
            style={{ marginTop: '16px' }}
          />
        </Space>
      </Card>

      {/* View Message Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageOutlined style={{ color: '#1890ff' }} />
            <span>Chi tiết tin nhắn</span>
          </div>
        }
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          selectedMessage?.status !== 'replied' && (
            <Button
              key="reply"
              type="primary"
              icon={<SendOutlined />}
              size="large"
              onClick={() => {
                setViewModalVisible(false);
                if (selectedMessage) handleReply(selectedMessage);
              }}
            >
              Trả lời
            </Button>
          ),
          <Button key="close" onClick={() => setViewModalVisible(false)} size="large">
            Đóng
          </Button>,
        ]}
        width={800}
      >
        {selectedMessage && (
          <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            {/* Message Info Card */}
            <Card 
              size="small" 
              style={{ 
                marginBottom: 20,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                color: 'white'
              }}
              bodyStyle={{ padding: '20px' }}
            >
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <UserOutlined style={{ fontSize: '18px' }} />
                  <Text strong style={{ color: 'white', fontSize: '16px' }}>
                    {selectedMessage.name}
                  </Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MailOutlined style={{ fontSize: '16px' }} />
                  <Text copyable style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px' }}>
                    {selectedMessage.email}
                  </Text>
                </div>
              </Space>
            </Card>

            {/* Main Content */}
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {/* Subject */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <FileTextOutlined style={{ color: '#1890ff', fontSize: '16px' }} />
                  <Text strong style={{ fontSize: '14px', color: '#595959' }}>Tiêu đề</Text>
                </div>
                <div style={{
                  padding: '12px 16px',
                  background: '#f0f7ff',
                  borderRadius: '6px',
                  border: '1px solid #bae7ff'
                }}>
                  <Text strong style={{ color: '#1890ff', fontSize: '15px' }}>
                    {selectedMessage.subject}
                  </Text>
                </div>
              </div>

              {/* Message Content */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <MessageOutlined style={{ color: '#52c41a', fontSize: '16px' }} />
                  <Text strong style={{ fontSize: '14px', color: '#595959' }}>Nội dung tin nhắn</Text>
                </div>
                <div style={{
                  padding: '16px',
                  background: '#f6ffed',
                  borderRadius: '6px',
                  border: '1px solid #b7eb8f',
                  minHeight: '80px',
                  whiteSpace: 'pre-wrap',
                  lineHeight: '1.6',
                  color: '#262626'
                }}>
                  {selectedMessage.message}
                </div>
              </div>

              {/* Status and Date */}
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '16px' }} />
                    <Text strong style={{ fontSize: '14px', color: '#595959' }}>Trạng thái</Text>
                  </div>
                  <Tag 
                    color={
                      selectedMessage.status === 'new' ? 'blue' : 
                      selectedMessage.status === 'read' ? 'cyan' :
                      selectedMessage.status === 'replied' ? 'green' : 'default'
                    }
                    style={{ fontSize: '13px', padding: '4px 12px' }}
                  >
                    {selectedMessage.status === 'new' ? 'Mới' : 
                     selectedMessage.status === 'read' ? 'Đã đọc' :
                     selectedMessage.status === 'replied' ? 'Đã trả lời' : 'Đã lưu trữ'}
                  </Tag>
                </div>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <ClockCircleOutlined style={{ color: '#fa8c16', fontSize: '16px' }} />
                    <Text strong style={{ fontSize: '14px', color: '#595959' }}>Ngày gửi</Text>
                  </div>
                  <Text style={{ fontSize: '14px', color: '#8c8c8c' }}>
                    {dayjs(selectedMessage.createdAt).format('DD/MM/YYYY HH:mm:ss')}
                  </Text>
                </div>
              </div>

              {/* Reply Section */}
              {selectedMessage.repliedAt && (
                <Card 
                  size="small"
                  style={{
                    background: '#f0f7ff',
                    border: '2px solid #1890ff',
                    borderRadius: '8px'
                  }}
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <SendOutlined style={{ color: '#1890ff' }} />
                      <Text strong style={{ color: '#1890ff' }}>Phản hồi</Text>
                    </div>
                  }
                >
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <div>
                      <Text type="secondary" style={{ fontSize: '12px' }}>Ngày trả lời:</Text>
                      <div style={{ marginTop: '4px' }}>
                        <Text style={{ fontSize: '14px' }}>
                          {dayjs(selectedMessage.repliedAt).format('DD/MM/YYYY HH:mm:ss')}
                        </Text>
                      </div>
                    </div>
                    <div>
                      <Text type="secondary" style={{ fontSize: '12px' }}>Người trả lời:</Text>
                      <div style={{ marginTop: '4px' }}>
                        <Text strong style={{ fontSize: '14px', color: '#1890ff' }}>
                          {selectedMessage.repliedBy?.full_name || selectedMessage.repliedBy?.username || 'N/A'}
                        </Text>
                      </div>
                    </div>
                    <Divider style={{ margin: '12px 0' }} />
                    <div>
                      <Text type="secondary" style={{ fontSize: '12px', marginBottom: '8px', display: 'block' }}>
                        Nội dung trả lời:
                      </Text>
                      <div style={{
                        padding: '16px',
                        background: '#fff',
                        borderRadius: '6px',
                        border: '1px solid #d9d9d9',
                        whiteSpace: 'pre-wrap',
                        lineHeight: '1.6',
                        color: '#262626',
                        fontSize: '14px'
                      }}>
                        {selectedMessage.replyMessage}
                      </div>
                    </div>
                  </Space>
                </Card>
              )}
            </Space>
          </div>
        )}
      </Modal>

      {/* Reply Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SendOutlined style={{ color: '#1890ff' }} />
            <span>Trả lời tin nhắn</span>
          </div>
        }
        open={replyModalVisible}
        onCancel={() => {
          setReplyModalVisible(false);
          replyForm.resetFields();
        }}
        onOk={() => replyForm.submit()}
        okText="Gửi trả lời"
        cancelText="Hủy"
        width={700}
        okButtonProps={{ size: 'large', icon: <SendOutlined /> }}
        cancelButtonProps={{ size: 'large' }}
      >
        {selectedMessage && (
          <>
            <Card 
              size="small" 
              style={{ 
                marginBottom: 20, 
                background: '#fafafa',
                border: '1px solid #e8e8e8'
              }}
            >
              <Descriptions column={1} size="small">
                <Descriptions.Item label={<strong>Người gửi</strong>}>
                  {selectedMessage.name}
                </Descriptions.Item>
                <Descriptions.Item label={<strong>Email</strong>}>
                  <Text copyable>{selectedMessage.email}</Text>
                </Descriptions.Item>
                <Descriptions.Item label={<strong>Tiêu đề</strong>}>
                  <Text strong style={{ color: '#1890ff' }}>{selectedMessage.subject}</Text>
                </Descriptions.Item>
                <Descriptions.Item label={<strong>Nội dung</strong>}>
                  <div style={{ 
                    whiteSpace: 'pre-wrap', 
                    maxHeight: 150, 
                    overflow: 'auto',
                    padding: '12px',
                    background: '#fff',
                    borderRadius: '4px',
                    border: '1px solid #e8e8e8'
                  }}>
                    {selectedMessage.message}
                  </div>
                </Descriptions.Item>
              </Descriptions>
            </Card>
            <Divider style={{ margin: '20px 0' }} />
            <Form
              form={replyForm}
              layout="vertical"
              onFinish={handleReplySubmit}
            >
              <Form.Item
                name="replyMessage"
                label={<strong>Nội dung trả lời</strong>}
                rules={[{ required: true, message: 'Vui lòng nhập nội dung trả lời' }]}
              >
                <TextArea
                  rows={8}
                  placeholder="Nhập nội dung trả lời..."
                  style={{ fontSize: '14px' }}
                />
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>
    </div>
  );
};

export default SupportMessages;

