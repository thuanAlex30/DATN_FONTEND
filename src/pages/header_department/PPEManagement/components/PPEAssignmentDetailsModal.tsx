import React, { useState, useEffect } from 'react';
import { Modal, Descriptions, Tag, Button, Space, message, Form, Input, Select } from 'antd';
import { EyeOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import ppeAssignmentService from '../../../../services/ppeAssignmentService';
import type { PPEAssignment, UpdatePPEAssignmentData } from '../../../../services/ppeAssignmentService';

const { TextArea } = Input;
const { Option } = Select;

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
      } else {
        message.error(response.message || 'Không thể tải thông tin phân công');
      }
    } catch (error) {
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
        </Button>,
        assignment.status === 'issued' && (
          <Button 
            key="return" 
            type="default"
            onClick={() => setShowReturnForm(true)}
          >
            Trả PPE
          </Button>
        )
      ]}
    >
      <Descriptions bordered column={2}>
        <Descriptions.Item label="Mã phân công" span={2}>
          {assignment._id || assignment.id}
        </Descriptions.Item>
        
        <Descriptions.Item label="Nhân viên">
          {typeof assignment.user_id === 'object' ? assignment.user_id.full_name : 'Không xác định'}
        </Descriptions.Item>
        
        <Descriptions.Item label="Thiết bị">
          {typeof assignment.item_id === 'object' ? assignment.item_id.item_name : 'Không xác định'}
        </Descriptions.Item>
        
        <Descriptions.Item label="Trạng thái">
          <Tag color={getStatusColor(assignment.status)}>
            {getStatusText(assignment.status)}
          </Tag>
        </Descriptions.Item>
        
        <Descriptions.Item label="Tình trạng">
          <Tag color={getConditionColor(assignment.return_condition || assignment.condition)}>
            {getConditionText(assignment.return_condition || assignment.condition)}
          </Tag>
        </Descriptions.Item>
        
        <Descriptions.Item label="Số lượng">
          {assignment.quantity}
        </Descriptions.Item>
        
        <Descriptions.Item label="Ngày phân công">
          {assignment.issued_date ? new Date(assignment.issued_date).toLocaleDateString('vi-VN') : 'Chưa cấp phát'}
        </Descriptions.Item>
        
        {assignment.expected_return_date && (
          <Descriptions.Item label="Ngày trả dự kiến">
            {new Date(assignment.expected_return_date).toLocaleDateString('vi-VN')}
          </Descriptions.Item>
        )}
        
        {assignment.actual_return_date && (
          <Descriptions.Item label="Ngày trả thực tế">
            {new Date(assignment.actual_return_date).toLocaleDateString('vi-VN')}
          </Descriptions.Item>
        )}
        
        {assignment.notes && (
          <Descriptions.Item label="Ghi chú" span={2}>
            {assignment.notes}
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
