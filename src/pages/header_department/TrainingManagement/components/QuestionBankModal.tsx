import React, { useState, useEffect } from 'react';
import { Modal, Card, Button, Form, Input, Space, Typography, Spin, Empty, Row, Col, Popconfirm, message } from 'antd';
import { PlusOutlined, EyeOutlined, DeleteOutlined, CloseOutlined } from '@ant-design/icons';
import api from '../../../../services/api';

interface Course {
  _id: string;
  course_name: string;
  description: string;
  duration_hours: number;
  course_set_id: {
    _id: string;
    course_set_name: string;
  };
}

interface QuestionBank {
  _id: string;
  name: string;
  description: string;
  course_id: string | { _id: string; course_name: string };
  questions?: any[];
  questionCount?: number;
  created_at: string;
}

interface QuestionBankModalProps {
  course: Course | null;
  onClose: () => void;
}

const QuestionBankModal: React.FC<QuestionBankModalProps> = ({ course, onClose }) => {
  const [questionBanks, setQuestionBanks] = useState<QuestionBank[]>([]);
  const [loading, setLoading] = useState(false);
  const [newBankName, setNewBankName] = useState('');
  const [newBankDescription, setNewBankDescription] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    if (course) {
      fetchQuestionBanks();
    }
  }, [course]);

  const fetchQuestionBanks = async () => {
    if (!course) return;
    
    setLoading(true);
    try {
      const response = await api.get(`/training/question-banks/course/${course._id}`);
      console.log('Question banks response:', response);
      // Handle different response structures
      let data = [];
      if (response.data) {
        if (response.data.data) {
          data = response.data.data;
        } else if (Array.isArray(response.data)) {
          data = response.data;
        } else if (response.data.success && response.data.data) {
          data = response.data.data;
        }
      }
      setQuestionBanks(Array.isArray(data) ? data : []);
      console.log('Question banks set:', Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Error fetching question banks:', error);
      message.error(error.response?.data?.message || 'Không thể tải danh sách ngân hàng câu hỏi');
      setQuestionBanks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course || !newBankName.trim()) return;

    try {
      await api.post('/training/question-banks', {
        name: newBankName,
        description: newBankDescription,
        course_id: course._id,
      });

      message.success('Tạo ngân hàng câu hỏi thành công');
      setNewBankName('');
      setNewBankDescription('');
      setShowCreateForm(false);
      fetchQuestionBanks();
    } catch (error: any) {
      console.error('Error creating question bank:', error);
      message.error(error.response?.data?.message || 'Không thể tạo ngân hàng câu hỏi');
    }
  };

  const handleDeleteBank = async (bankId: string) => {
    try {
      await api.delete(`/training/question-banks/${bankId}`);
      message.success('Xóa ngân hàng câu hỏi thành công');
      fetchQuestionBanks();
    } catch (error: any) {
      console.error('Error deleting question bank:', error);
      message.error(error.response?.data?.message || 'Không thể xóa ngân hàng câu hỏi');
    }
  };

  if (!course) {
    return null;
  }

  return (
    <Modal
      title={`Ngân hàng câu hỏi - ${course.course_name}`}
      open={true}
      onCancel={onClose}
      footer={null}
      width={900}
      style={{ top: 20 }}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Button 
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? 'Ẩn form tạo mới' : 'Tạo ngân hàng câu hỏi mới'}
          </Button>
        </div>

        {showCreateForm && (
          <Card title="Tạo ngân hàng câu hỏi mới" size="small">
            <Form layout="vertical" onFinish={handleCreateBank}>
              <Form.Item label="Tên ngân hàng câu hỏi" required>
                <Input
                  value={newBankName}
                  onChange={(e) => setNewBankName(e.target.value)}
                  placeholder="Nhập tên ngân hàng câu hỏi"
                  required
                />
              </Form.Item>
              <Form.Item label="Mô tả">
                <Input.TextArea
                  value={newBankDescription}
                  onChange={(e) => setNewBankDescription(e.target.value)}
                  rows={3}
                  placeholder="Nhập mô tả (tùy chọn)"
                />
              </Form.Item>
              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
                    Tạo
                  </Button>
                  <Button onClick={() => setShowCreateForm(false)}>
                    Hủy
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        )}

        <div>
          <Typography.Title level={4}>Danh sách ngân hàng câu hỏi</Typography.Title>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px' }}>
              <Spin size="large" />
              <div style={{ marginTop: '16px' }}>Đang tải...</div>
            </div>
          ) : !Array.isArray(questionBanks) || questionBanks.length === 0 ? (
            <Empty
              description="Chưa có ngân hàng câu hỏi nào"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => setShowCreateForm(true)}
              >
                Tạo ngân hàng câu hỏi đầu tiên
              </Button>
            </Empty>
          ) : (
            <Row gutter={[16, 16]}>
              {questionBanks.map((bank) => (
                <Col xs={24} sm={12} lg={8} key={bank._id}>
                  <Card
                    hoverable
                    style={{ height: '100%' }}
                    actions={[
                      <Button
                        type="text"
                        icon={<EyeOutlined />}
                        onClick={() => {
                          console.log('Preview bank:', bank);
                          message.info(`Xem trước ngân hàng câu hỏi: ${bank.name}\nSố câu hỏi: ${bank.questionCount || 0}`);
                        }}
                      >
                        Xem trước
                      </Button>,
                      <Popconfirm
                        title="Xóa ngân hàng câu hỏi"
                        description="Bạn có chắc chắn muốn xóa ngân hàng câu hỏi này?"
                        onConfirm={() => handleDeleteBank(bank._id)}
                        okText="Xóa"
                        cancelText="Hủy"
                      >
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                        >
                          Xóa
                        </Button>
                      </Popconfirm>
                    ]}
                  >
                    <Card.Meta
                      title={
                        <Typography.Text strong>
                          {bank.name}
                        </Typography.Text>
                      }
                      description={
                        <div>
                          <Typography.Paragraph 
                            ellipsis={{ rows: 2 }} 
                            style={{ marginBottom: '12px', color: '#666' }}
                          >
                            {bank.description || 'Không có mô tả'}
                          </Typography.Paragraph>
                          <Space direction="vertical" size={4}>
                            <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                              Số câu hỏi: {bank.questionCount || bank.questions?.length || 0}
                            </Typography.Text>
                            <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                              Tạo ngày: {bank.created_at ? new Date(bank.created_at).toLocaleDateString('vi-VN') : 'N/A'}
                            </Typography.Text>
                          </Space>
                        </div>
                      }
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </div>
      </Space>
    </Modal>
  );
};

export default QuestionBankModal;
