import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Descriptions, Tag, Button, Space, message, Form, Input, Select, Image, Avatar, Card, Divider, Typography } from 'antd';
import { 
  EyeOutlined, 
  CheckOutlined, 
  CloseOutlined, 
  SafetyOutlined,
  UserOutlined,
  ToolOutlined,
  CalendarOutlined,
  NumberOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  IdcardOutlined,
  MailOutlined,
  PhoneOutlined,
  BankOutlined
} from '@ant-design/icons';
import ppeAssignmentService from '../../../../services/ppeAssignmentService';
import type { PPEAssignment, UpdatePPEAssignmentData } from '../../../../services/ppeAssignmentService';
import { ENV } from '../../../../config/env';

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

interface PPEAssignmentDetailsModalProps {
  visible: boolean;
  onCancel: () => void;
  assignmentId: string | null;
  onUpdate: () => void;
}

const PPEAssignmentDetailsModal: React.FC<PPEAssignmentDetailsModalProps> = ({
  visible,
  onCancel,
  assignmentId,
  onUpdate
}) => {
  const [assignment, setAssignment] = useState<PPEAssignment | null>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [form] = Form.useForm();

  // Helper function to resolve image URL
  const apiBaseForImages = useMemo(() => {
    return ENV.API_BASE_URL.replace(/\/api\/?$/, '');
  }, []);

  const resolveImageUrl = (url?: string) => {
    if (!url) return undefined;
    if (url.startsWith('http')) return url;
    return `${apiBaseForImages}${url}`;
  };

  useEffect(() => {
    if (visible && assignmentId) {
      fetchAssignmentDetails();
    }
  }, [visible, assignmentId]);

  const fetchAssignmentDetails = async () => {
    if (!assignmentId) return;
    
    setLoading(true);
    try {
      const response = await ppeAssignmentService.getPPEAssignmentById(assignmentId);
      if (response.success) {
        setAssignment(response.data);
        // Debug: Log image URL
        if (response.data?.item_id && typeof response.data.item_id === 'object') {
          console.log('Item image_url:', (response.data.item_id as any).image_url);
          console.log('Resolved image URL:', resolveImageUrl((response.data.item_id as any).image_url));
        }
      } else {
        message.error(response.message || 'Không thể tải thông tin phân công');
      }
    } catch (error) {
      console.error('Error fetching assignment details:', error);
      message.error('Có lỗi xảy ra khi tải thông tin phân công');
    } finally {
      setLoading(false);
    }
  };

  const handleIssuePPE = async () => {
    if (!assignmentId) return;
    
    setUpdating(true);
    try {
      const response = await ppeAssignmentService.issuePPE(assignmentId);
      if (response.success) {
        message.success('PPE đã được cấp phát thành công!');
        fetchAssignmentDetails();
        onUpdate();
      } else {
        message.error(response.message || 'Không thể cấp phát PPE');
      }
    } catch (error) {
      message.error('Có lỗi xảy ra khi cấp phát PPE');
    } finally {
      setUpdating(false);
    }
  };

  const handleReturnPPE = async (values: any) => {
    if (!assignmentId) return;
    
    setUpdating(true);
    try {
      const response = await ppeAssignmentService.returnPPE(
        assignmentId, 
        values.condition, 
        values.notes
      );
      if (response.success) {
        message.success('PPE đã được trả thành công!');
        setShowReturnForm(false);
        form.resetFields();
        fetchAssignmentDetails();
        onUpdate();
      } else {
        message.error(response.message || 'Không thể trả PPE');
      }
    } catch (error) {
      message.error('Có lỗi xảy ra khi trả PPE');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'issued': return 'green';
      case 'returned': return 'blue';
      case 'overdue': return 'red';
      case 'damaged': return 'orange';
      case 'replacement_needed': return 'purple';
      case 'pending_manager_return': return 'yellow';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'issued': return 'Đã cấp phát';
      case 'returned': return 'Đã trả';
      case 'overdue': return 'Quá hạn';
      case 'damaged': return 'Bị hỏng';
      case 'replacement_needed': return 'Cần thay thế';
      case 'pending_manager_return': return 'Chờ trả';
      default: return status;
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'good': return 'green';
      case 'damaged': return 'red';
      case 'worn': return 'orange';
      case 'NEW': return 'green';
      case 'GOOD': return 'blue';
      case 'FAIR': return 'orange';
      case 'POOR': return 'red';
      default: return 'default';
    }
  };

  const getConditionText = (condition: string) => {
    switch (condition) {
      case 'good': return 'Tốt';
      case 'damaged': return 'Hỏng';
      case 'worn': return 'Mòn';
      case 'NEW': return 'Mới';
      case 'GOOD': return 'Tốt';
      case 'FAIR': return 'Khá';
      case 'POOR': return 'Kém';
      default: return condition || '-';
    }
  };

  if (!assignment) {
    return null;
  }

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <EyeOutlined />
          <span>Chi tiết Phân công PPE</span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      width={800}
      footer={[
        <Button key="close" onClick={onCancel}>
          Đóng
        </Button>
      ]}
    >
      {/* Thông tin thiết bị với ảnh */}
      {typeof assignment.item_id === 'object' && assignment.item_id && (
        <Card 
          size="small" 
          title={
            <Space>
              <ToolOutlined style={{ color: '#1890ff' }} />
              <span style={{ fontWeight: 600 }}>Thông tin thiết bị</span>
            </Space>
          } 
          style={{ marginBottom: 20, borderRadius: 8 }}
        >
          <Space direction="vertical" style={{ width: '100%' }} size="large" align="center">
            {(() => {
              const itemId = assignment.item_id;
              let imageUrl: string | null = null;
              
              if (typeof itemId === 'object' && itemId) {
                imageUrl = (itemId as any).image_url || null;
              }
              
              const resolvedUrl = imageUrl ? resolveImageUrl(imageUrl) : null;
              
              console.log('Image debug:', {
                itemId,
                imageUrl,
                resolvedUrl,
                apiBase: apiBaseForImages
              });
              
              if (resolvedUrl) {
                return (
                  <div style={{ textAlign: 'center' }}>
                    <Image
                      src={resolvedUrl}
                      width={150}
                      height={150}
                      style={{ objectFit: 'cover', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      preview={{ mask: 'Xem ảnh' }}
                      fallback={
                        <div style={{ 
                          width: 150, 
                          height: 150, 
                          borderRadius: 12,
                          backgroundColor: '#1890ff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}>
                          <SafetyOutlined style={{ fontSize: 60, color: 'white' }} />
                        </div>
                      }
                    />
                  </div>
                );
              } else {
                return (
                  <div style={{ textAlign: 'center' }}>
                    <Avatar 
                      icon={<SafetyOutlined />} 
                      size={150}
                      style={{ 
                        backgroundColor: '#1890ff',
                        fontSize: 60,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }} 
                    />
                  </div>
                );
              }
            })()}
            <div style={{ width: '100%', textAlign: 'center' }}>
              <Title level={4} style={{ margin: '8px 0', color: '#1890ff' }}>
                {assignment.item_id.item_name || 'Không xác định'}
              </Title>
              {(assignment.item_id as any)?.item_code && (
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary">
                    <IdcardOutlined style={{ marginRight: 4 }} />
                    Mã: {(assignment.item_id as any).item_code}
                  </Text>
                </div>
              )}
              {(assignment.item_id as any)?.brand && (
                <div style={{ marginTop: 4 }}>
                  <Text type="secondary">
                    Thương hiệu: {(assignment.item_id as any).brand}
                  </Text>
                </div>
              )}
              {(assignment.item_id as any)?.model && (
                <div style={{ marginTop: 4 }}>
                  <Text type="secondary">
                    Model: {(assignment.item_id as any).model}
                  </Text>
                </div>
              )}
            </div>
          </Space>
        </Card>
      )}

      {/* Thông tin nhân viên */}
      {typeof assignment.user_id === 'object' && assignment.user_id && (
        <Card 
          size="small" 
          title={
            <Space>
              <UserOutlined style={{ color: '#52c41a' }} />
              <span style={{ fontWeight: 600 }}>Thông tin nhân viên</span>
            </Space>
          } 
          style={{ marginBottom: 20, borderRadius: 8 }}
        >
          <Space direction="vertical" style={{ width: '100%' }} size="small">
            <div>
              <Text strong style={{ fontSize: 16 }}>
                {assignment.user_id.full_name || 'Không xác định'}
              </Text>
            </div>
            {assignment.user_id.email && (
              <div>
                <MailOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                <Text>{assignment.user_id.email}</Text>
              </div>
            )}
            {assignment.user_id.phone && (
              <div>
                <PhoneOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                <Text>{assignment.user_id.phone}</Text>
              </div>
            )}
            {assignment.user_id.department_id && (
              <div>
                <BankOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                <Text>
                  {typeof assignment.user_id.department_id === 'object' 
                    ? assignment.user_id.department_id.department_name 
                    : assignment.user_id.department_id}
                </Text>
              </div>
            )}
          </Space>
        </Card>
      )}

      <Divider />

      <Descriptions 
        bordered 
        column={2}
        size="middle"
        labelStyle={{ 
          fontWeight: 600, 
          backgroundColor: '#fafafa',
          width: '35%'
        }}
        contentStyle={{ backgroundColor: '#fff' }}
      >
        <Descriptions.Item 
          label={
            <Space>
              <IdcardOutlined />
              <span>Mã phân công</span>
            </Space>
          } 
          span={2}
        >
          <Text code style={{ fontSize: 12 }}>
            {assignment._id || assignment.id}
          </Text>
        </Descriptions.Item>
        
        <Descriptions.Item 
          label={
            <Space>
              <NumberOutlined />
              <span>Số lượng</span>
            </Space>
          }
        >
          <Text strong style={{ fontSize: 16, color: '#1890ff' }}>
            {assignment.quantity}
          </Text>
        </Descriptions.Item>
        
        <Descriptions.Item 
          label={
            <Space>
              <CheckCircleOutlined />
              <span>Trạng thái</span>
            </Space>
          }
        >
          <Tag 
            color={getStatusColor(assignment.status)}
            style={{ fontSize: 13, padding: '4px 12px' }}
          >
            {getStatusText(assignment.status)}
          </Tag>
        </Descriptions.Item>
        
        <Descriptions.Item 
          label={
            <Space>
              <SafetyOutlined />
              <span>Tình trạng</span>
            </Space>
          }
        >
          <Tag 
            color={getConditionColor(assignment.return_condition || assignment.condition)}
            style={{ fontSize: 13, padding: '4px 12px' }}
          >
            {getConditionText(assignment.return_condition || assignment.condition)}
          </Tag>
        </Descriptions.Item>
        
        <Descriptions.Item 
          label={
            <Space>
              <CalendarOutlined />
              <span>Ngày phân công</span>
            </Space>
          }
        >
          {assignment.issued_date ? (
            <Space>
              <Text>{new Date(assignment.issued_date).toLocaleDateString('vi-VN', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</Text>
            </Space>
          ) : (
            <Text type="secondary">Chưa cấp phát</Text>
          )}
        </Descriptions.Item>
        
        {assignment.expected_return_date && (
          <Descriptions.Item 
            label={
              <Space>
                <ClockCircleOutlined />
                <span>Ngày trả dự kiến</span>
              </Space>
            }
          >
            <Space>
              <Text>{new Date(assignment.expected_return_date).toLocaleDateString('vi-VN', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric'
              })}</Text>
              {new Date(assignment.expected_return_date) < new Date() && assignment.status === 'issued' && (
                <Tag color="red" icon={<WarningOutlined />}>
                  Quá hạn
                </Tag>
              )}
            </Space>
          </Descriptions.Item>
        )}
        
        {assignment.actual_return_date && (
          <Descriptions.Item 
            label={
              <Space>
                <CheckCircleOutlined />
                <span>Ngày trả thực tế</span>
              </Space>
            }
            span={2}
          >
            <Text>{new Date(assignment.actual_return_date).toLocaleDateString('vi-VN', { 
              day: '2-digit', 
              month: '2-digit', 
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</Text>
          </Descriptions.Item>
        )}
        
        {assignment.notes && (
          <Descriptions.Item 
            label={
              <Space>
                <FileTextOutlined />
                <span>Ghi chú</span>
              </Space>
            } 
            span={2}
          >
            <div style={{ 
              padding: '8px 12px', 
              backgroundColor: '#f5f5f5', 
              borderRadius: 4,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}>
              {assignment.notes}
            </div>
          </Descriptions.Item>
        )}
      </Descriptions>

      {showReturnForm && (
        <div style={{ marginTop: '24px', padding: '16px', border: '1px solid #d9d9d9', borderRadius: '6px' }}>
          <h4>Trả PPE</h4>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleReturnPPE}
          >
            <Form.Item
              name="condition"
              label="Tình trạng khi trả"
              rules={[{ required: true, message: 'Vui lòng chọn tình trạng' }]}
            >
              <Select placeholder="Chọn tình trạng">
                <Option value="good">Tốt</Option>
                <Option value="damaged">Hỏng</Option>
                <Option value="worn">Mòn</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="notes"
              label="Ghi chú"
            >
              <TextArea 
                rows={3} 
                placeholder="Ghi chú về tình trạng PPE khi trả..."
              />
            </Form.Item>

            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={updating}
                icon={<CheckOutlined />}
              >
                Xác nhận trả
              </Button>
              <Button 
                onClick={() => {
                  setShowReturnForm(false);
                  form.resetFields();
                }}
                icon={<CloseOutlined />}
              >
                Hủy
              </Button>
            </Space>
          </Form>
        </div>
      )}
    </Modal>
  );
};

export default PPEAssignmentDetailsModal;
