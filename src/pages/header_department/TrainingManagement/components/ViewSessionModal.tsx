import React from 'react';
import { Modal, Descriptions, Tag, Typography, Space, Divider } from 'antd';
import { 
  CalendarOutlined, 
  ClockCircleOutlined, 
  UserOutlined, 
  TeamOutlined,
  BookOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';

const { Text, Title } = Typography;

interface Session {
  _id: string;
  session_name: string;
  description?: string;
  start_time: string;
  end_time: string;
  max_participants: number;
  location?: string;
  course_id: {
    _id: string;
    course_name: string;
  };
  instructor_id?: {
    _id: string;
    full_name: string;
  };
  status_code?: string;
  created_at?: string;
  updated_at?: string;
}

interface ViewSessionModalProps {
  session: Session | null;
  onClose: () => void;
}

const ViewSessionModal: React.FC<ViewSessionModalProps> = ({ session, onClose }) => {
  if (!session) {
    return null;
  }

  const formatDateTime = (dateTimeString: string): string => {
    try {
      const date = new Date(dateTimeString);
      if (isNaN(date.getTime())) {
        return 'Không hợp lệ';
      }
      return date.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Không hợp lệ';
    }
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Không hợp lệ';
      }
      return date.toLocaleDateString('vi-VN');
    } catch (error) {
      return 'Không hợp lệ';
    }
  };

  const getStatusLabel = (statusCode?: string): string => {
    if (!statusCode) return 'Chưa xác định';
    const statusMap: { [key: string]: string } = {
      'SCHEDULED': 'Đã lên lịch',
      'ONGOING': 'Đang diễn ra',
      'COMPLETED': 'Hoàn thành',
      'CANCELLED': 'Đã hủy'
    };
    return statusMap[statusCode] || statusCode;
  };

  const getStatusColor = (statusCode?: string): string => {
    if (!statusCode) return 'default';
    const colorMap: { [key: string]: string } = {
      'SCHEDULED': 'blue',
      'ONGOING': 'orange',
      'COMPLETED': 'green',
      'CANCELLED': 'red'
    };
    return colorMap[statusCode] || 'default';
  };

  return (
    <Modal
      title={
        <Space>
          <CalendarOutlined style={{ color: '#667eea', fontSize: '24px' }} />
          <Title level={4} style={{ margin: 0, color: '#1a1a1a' }}>
            Chi tiết phiên đào tạo
          </Title>
        </Space>
      }
      open={!!session}
      onCancel={onClose}
      footer={null}
      width={800}
      styles={{
        content: {
          borderRadius: '20px',
          padding: '0'
        },
        header: {
          borderRadius: '20px 20px 0 0',
          padding: '24px 32px',
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
          borderBottom: '1px solid rgba(102, 126, 234, 0.1)'
        },
        body: {
          padding: '32px'
        }
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Descriptions
          column={1}
          bordered
          size="middle"
          labelStyle={{
            fontWeight: 600,
            fontSize: '14px',
            color: '#595959',
            width: '200px',
            background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
            padding: '12px 16px'
          }}
          contentStyle={{
            fontSize: '15px',
            color: '#1a1a1a',
            padding: '12px 16px'
          }}
          style={{
            borderRadius: '12px',
            overflow: 'hidden'
          }}
        >
          <Descriptions.Item
            label={
              <Space>
                <FileTextOutlined style={{ color: '#667eea' }} />
                <span>Tên phiên đào tạo</span>
              </Space>
            }
          >
            <Text strong style={{ fontSize: '16px', color: '#1a1a1a' }}>
              {session.session_name}
            </Text>
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <Space>
                <BookOutlined style={{ color: '#52c41a' }} />
                <span>Khóa học</span>
              </Space>
            }
          >
            <Tag 
              color="green" 
              icon={<BookOutlined />}
              style={{ 
                borderRadius: '8px',
                padding: '4px 12px',
                fontSize: '14px',
                fontWeight: 500
              }}
            >
              {session.course_id?.course_name || 'Chưa xác định'}
            </Tag>
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <Space>
                <InfoCircleOutlined style={{ color: '#1890ff' }} />
                <span>Mô tả</span>
              </Space>
            }
          >
            <Text style={{ color: session.description ? '#1a1a1a' : '#8c8c8c', fontStyle: session.description ? 'normal' : 'italic' }}>
              {session.description || 'Không có mô tả'}
            </Text>
          </Descriptions.Item>

          <Divider style={{ margin: '16px 0' }} />

          <Descriptions.Item
            label={
              <Space>
                <CalendarOutlined style={{ color: '#1890ff' }} />
                <span>Ngày bắt đầu</span>
              </Space>
            }
          >
            <Space>
              <ClockCircleOutlined style={{ color: '#1890ff' }} />
              <Text strong style={{ color: '#1890ff', fontSize: '15px' }}>
                {formatDateTime(session.start_time)}
              </Text>
            </Space>
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <Space>
                <CheckCircleOutlined style={{ color: '#52c41a' }} />
                <span>Ngày kết thúc</span>
              </Space>
            }
          >
            <Space>
              <ClockCircleOutlined style={{ color: '#52c41a' }} />
              <Text strong style={{ color: '#52c41a', fontSize: '15px' }}>
                {formatDateTime(session.end_time)}
              </Text>
            </Space>
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <Space>
                <TeamOutlined style={{ color: '#722ed1' }} />
                <span>Số lượng tối đa</span>
              </Space>
            }
          >
            <Tag 
              color="purple"
              icon={<TeamOutlined />}
              style={{ 
                borderRadius: '8px',
                padding: '4px 12px',
                fontSize: '14px',
                fontWeight: 500
              }}
            >
              {session.max_participants} người
            </Tag>
          </Descriptions.Item>

          {session.location && (
            <Descriptions.Item
              label={
                <Space>
                  <InfoCircleOutlined style={{ color: '#faad14' }} />
                  <span>Địa điểm</span>
                </Space>
              }
            >
              <Text>{session.location}</Text>
            </Descriptions.Item>
          )}

          <Descriptions.Item
            label={
              <Space>
                <UserOutlined style={{ color: '#13c2c2' }} />
                <span>Giảng viên</span>
              </Space>
            }
          >
            {session.instructor_id?.full_name ? (
              <Tag 
                color="cyan"
                icon={<UserOutlined />}
                style={{ 
                  borderRadius: '8px',
                  padding: '4px 12px',
                  fontSize: '14px',
                  fontWeight: 500
                }}
              >
                {session.instructor_id.full_name}
              </Tag>
            ) : (
              <Text type="secondary" style={{ fontStyle: 'italic' }}>
                Chưa phân công
              </Text>
            )}
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <Space>
                <InfoCircleOutlined style={{ color: '#fa8c16' }} />
                <span>Trạng thái</span>
              </Space>
            }
          >
            <Tag 
              color={getStatusColor(session.status_code)}
              style={{ 
                borderRadius: '8px',
                padding: '4px 12px',
                fontSize: '14px',
                fontWeight: 600
              }}
            >
              {getStatusLabel(session.status_code)}
            </Tag>
          </Descriptions.Item>

          {session.created_at && (
            <>
              <Divider style={{ margin: '16px 0' }} />
              <Descriptions.Item
                label={
                  <Space>
                    <CalendarOutlined style={{ color: '#8c8c8c' }} />
                    <span>Ngày tạo</span>
                  </Space>
                }
              >
                <Text type="secondary">{formatDate(session.created_at)}</Text>
              </Descriptions.Item>
            </>
          )}

          {session.updated_at && (
            <Descriptions.Item
              label={
                <Space>
                  <ClockCircleOutlined style={{ color: '#8c8c8c' }} />
                  <span>Cập nhật lần cuối</span>
                </Space>
              }
            >
              <Text type="secondary">{formatDate(session.updated_at)}</Text>
            </Descriptions.Item>
          )}
        </Descriptions>

        <div style={{ 
          marginTop: '24px', 
          textAlign: 'right',
          paddingTop: '16px',
          borderTop: '1px solid #f0f0f0'
        }}>
          <Space>
            <button
              onClick={onClose}
              style={{
                padding: '8px 24px',
                borderRadius: '8px',
                border: '1px solid #d9d9d9',
                background: '#ffffff',
                color: '#595959',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#667eea';
                e.currentTarget.style.color = '#667eea';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#d9d9d9';
                e.currentTarget.style.color = '#595959';
              }}
            >
              Đóng
            </button>
          </Space>
        </div>
      </motion.div>
    </Modal>
  );
};

export default ViewSessionModal;
