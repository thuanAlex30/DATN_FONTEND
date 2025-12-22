import React, { useState, useEffect } from 'react';
import {
  Modal, 
  Input, 
  Table, 
  Tag, 
  Button, 
  Space, 
  Card, 
  Row, 
  Col, 
  Statistic,
  Avatar,
  Typography,
  Empty,
  Spin,
  message
} from 'antd';
import { 
  UserOutlined, 
  SearchOutlined,
  TeamOutlined,
  MailOutlined,
  CalendarOutlined,
  BookOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { api } from '../../../../services/api';

const { Text, Title } = Typography;
const { Search } = Input;

interface Session {
  _id: string;
  session_name: string;
  course_id: {
    _id: string;
    course_name: string;
  };
  max_participants: number;
}

interface Enrollment {
  _id: string;
  user_id: {
    _id: string;
    full_name: string;
    email: string;
    department?: string;
  };
  course_id?: {
    _id: string;
    course_name: string;
  };
  // Legacy field for session-based enrollments (optional)
  session_id?: string | {
    _id: string;
    session_name: string;
  };
  enrolled_at: string;
  status: 'enrolled' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  score?: number;
  passed?: boolean;
}

interface EnrollmentModalProps {
  session: Session | null;
  onClose: () => void;
}

const EnrollmentModal: React.FC<EnrollmentModalProps> = ({ session, onClose }) => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (session) {
      fetchEnrollments();
    }
  }, [session]);

  const fetchEnrollments = async () => {
    if (!session) return;

    // Hiện tại enrollment được gắn trực tiếp với khóa học, không còn theo session
    const courseId = session.course_id?._id || session.course_id;
    if (!courseId) return;

    setLoading(true);
    try {
      const response = await api.get(`/training/enrollments`, {
        params: { courseId }
      });
      const data = response.data?.data || response.data || [];
      setEnrollments(data);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      message.error('Không thể tải danh sách đăng ký');
    } finally {
      setLoading(false);
    }
  };

  // Hiện trạng thái và điểm số được backend tự xử lý khi nộp bài, modal này chỉ dùng để xem

  const filteredEnrollments = enrollments.filter(enrollment =>
    enrollment.user_id.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    enrollment.user_id.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'enrolled':
        return 'blue';
      case 'in_progress':
        return 'orange';
      case 'completed':
        return 'green';
      case 'failed':
        return 'red';
      case 'cancelled':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'enrolled':
        return 'Đã đăng ký';
      case 'in_progress':
        return 'Đang làm bài';
      case 'completed':
        return 'Hoàn thành';
      case 'failed':
        return 'Chưa đạt';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  if (!session) {
    return null;
  }

  const columns = [
    {
      title: 'Người đăng ký',
      key: 'user',
      render: (_: any, record: Enrollment) => (
        <Space>
          <Avatar 
            icon={<UserOutlined />} 
            style={{ 
              backgroundColor: '#667eea',
              boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
            }}
          />
          <div>
            <Text strong style={{ display: 'block', fontSize: '14px' }}>
              {record.user_id.full_name}
            </Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              <MailOutlined /> {record.user_id.email}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Ngày đăng ký',
      dataIndex: 'enrolled_at',
      key: 'enrolled_at',
      render: (date: string) => (
        <Space>
          <CalendarOutlined style={{ color: '#1890ff' }} />
          <Text>{date ? new Date(date).toLocaleDateString('vi-VN') : '-'}</Text>
        </Space>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag 
          color={getStatusColor(status)}
          style={{ 
            borderRadius: '8px',
            padding: '4px 12px',
            fontSize: '13px',
            fontWeight: 600
          }}
        >
          {getStatusLabel(status)}
        </Tag>
      ),
    },
  ];

  return (
    <Modal
      title={
        <Space direction="vertical" size={0} style={{ width: '100%' }}>
          <Space>
            <UserOutlined style={{ color: '#667eea', fontSize: '24px' }} />
            <Title level={4} style={{ margin: 0, color: '#1a1a1a' }}>
              Quản lý đăng ký
            </Title>
          </Space>
          <Text type="secondary" style={{ fontSize: '13px', marginLeft: '32px' }}>
            {session.session_name}
          </Text>
        </Space>
      }
      open={!!session}
      onCancel={onClose}
      footer={null}
      width={1000}
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
        {/* Session Info Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={8}>
            <Card
              style={{
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #e6f7ff 0%, #f0f5ff 100%)',
                border: '1px solid rgba(24, 144, 255, 0.2)',
                boxShadow: '0 4px 12px rgba(24, 144, 255, 0.1)'
              }}
            >
              <Statistic
                title={
                  <Space>
                    <BookOutlined style={{ color: '#1890ff' }} />
                    <span style={{ color: '#595959', fontSize: '13px' }}>Khóa học</span>
                  </Space>
                }
                value={session.course_id?.course_name || 'Chưa xác định'}
                valueStyle={{ 
                  color: '#1890ff',
                  fontSize: '16px',
                  fontWeight: 600
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card
              style={{
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #f6ffed 0%, #fcffe6 100%)',
                border: '1px solid rgba(82, 196, 26, 0.2)',
                boxShadow: '0 4px 12px rgba(82, 196, 26, 0.1)'
              }}
            >
              <Statistic
                title={
                  <Space>
                    <TeamOutlined style={{ color: '#52c41a' }} />
                    <span style={{ color: '#595959', fontSize: '13px' }}>Số lượng tối đa</span>
                  </Space>
                }
                value={session.max_participants}
                suffix="người"
                valueStyle={{ 
                  color: '#52c41a',
                  fontSize: '20px',
                  fontWeight: 700
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card
              style={{
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #fff7e6 0%, #fffbe6 100%)',
                border: '1px solid rgba(250, 173, 20, 0.2)',
                boxShadow: '0 4px 12px rgba(250, 173, 20, 0.1)'
              }}
            >
              <Statistic
                title={
                  <Space>
                    <UserOutlined style={{ color: '#faad14' }} />
                    <span style={{ color: '#595959', fontSize: '13px' }}>Đã đăng ký</span>
                  </Space>
                }
                value={enrollments.length}
                suffix="người"
                valueStyle={{ 
                  color: '#faad14',
                  fontSize: '20px',
                  fontWeight: 700
                }}
              />
            </Card>
          </Col>
        </Row>

        {/* Search Section */}
        <div style={{ marginBottom: '24px' }}>
          <Search
            placeholder="Tìm kiếm theo tên hoặc email..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              borderRadius: '10px'
            }}
          />
        </div>

        {/* Enrollments Table */}
        <Card
          title={
            <Space>
              <TeamOutlined style={{ color: '#667eea' }} />
              <span style={{ fontSize: '16px', fontWeight: 600 }}>Danh sách đăng ký</span>
              <Tag 
                color="blue"
                style={{ 
                  borderRadius: '6px',
                  padding: '2px 8px',
                  fontSize: '12px'
                }}
              >
                {filteredEnrollments.length} người
              </Tag>
            </Space>
          }
          style={{
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
            border: '1px solid #f0f0f0'
          }}
        >
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px' }}>
              <Spin size="large" />
              <div style={{ marginTop: '16px', color: '#8c8c8c' }}>
                Đang tải danh sách đăng ký...
              </div>
            </div>
          ) : filteredEnrollments.length === 0 ? (
            <Empty
              image={<UserOutlined style={{ fontSize: '64px', color: '#d9d9d9' }} />}
              description={
                <div>
                  <Text type="secondary" style={{ fontSize: '15px' }}>
                    {searchTerm ? 'Không tìm thấy kết quả' : 'Chưa có đăng ký nào'}
                  </Text>
                </div>
              }
              style={{ padding: '40px 0' }}
            />
          ) : (
            <Table
              columns={columns}
              dataSource={filteredEnrollments}
              rowKey="_id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} người`
              }}
              style={{
                borderRadius: '8px'
              }}
            />
          )}
        </Card>

        {/* Footer */}
        <div style={{ 
          marginTop: '24px', 
          textAlign: 'right',
          paddingTop: '16px',
          borderTop: '1px solid #f0f0f0'
        }}>
          <Button
            onClick={onClose}
            size="large"
            style={{
              borderRadius: '8px',
              padding: '0 24px',
              height: '40px',
              fontWeight: 500
            }}
          >
            Đóng
          </Button>
        </div>
      </motion.div>
    </Modal>
  );
};

export default EnrollmentModal;
