import React, { useState } from 'react';
import { Modal, Form, Input, Select, InputNumber, Button, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { CreateChangeRequestData } from '../../../../types/projectChangeRequest';

const { TextArea } = Input;
const { Option } = Select;

interface CreateChangeRequestModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (data: CreateChangeRequestData) => void;
  projectId: string;
}

const CreateChangeRequestModal: React.FC<CreateChangeRequestModalProps> = ({
  visible,
  onCancel,
  onSubmit,
  projectId
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      const changeRequestData: CreateChangeRequestData = {
        project_id: projectId,
        request_type: values.request_type,
        title: values.title,
        description: values.description,
        reason: values.reason,
        impact_analysis: values.impact_analysis,
        proposed_solution: values.proposed_solution,
        priority: values.priority,
        estimated_schedule_impact: values.estimated_schedule_impact || 0
      };

      onSubmit(changeRequestData);
      form.resetFields();
      setLoading(false);
      onCancel();
      message.success('Yêu cầu thay đổi đã được tạo thành công!');
    } catch (error) {
      console.error('Error creating change request:', error);
      message.error('Có lỗi xảy ra khi tạo yêu cầu thay đổi');
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <PlusOutlined />
          <span>Tạo Yêu cầu Thay đổi Dự án</span>
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      width={800}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Hủy
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
          Tạo Yêu cầu
        </Button>
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
      >
        <Form.Item
          name="request_type"
          label="Loại Yêu cầu"
          rules={[{ required: true, message: 'Vui lòng chọn loại yêu cầu' }]}
        >
          <Select placeholder="Chọn loại yêu cầu thay đổi">
            <Option value="SCOPE">Thay đổi Phạm vi</Option>
            <Option value="SCHEDULE">Thay đổi Lịch trình</Option>
            <Option value="RESOURCE">Thay đổi Tài nguyên</Option>
            <Option value="QUALITY">Thay đổi Chất lượng</Option>
            <Option value="OTHER">Khác</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="title"
          label="Tiêu đề"
          rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
        >
          <Input placeholder="Nhập tiêu đề yêu cầu thay đổi" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Mô tả Chi tiết"
          rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
        >
          <TextArea 
            rows={4} 
            placeholder="Mô tả chi tiết về yêu cầu thay đổi này..."
          />
        </Form.Item>

        <Form.Item
          name="reason"
          label="Lý do Thay đổi"
          rules={[{ required: true, message: 'Vui lòng nhập lý do thay đổi' }]}
        >
          <TextArea 
            rows={3} 
            placeholder="Giải thích lý do cần thay đổi..."
          />
        </Form.Item>

        <Form.Item
          name="priority"
          label="Mức độ Ưu tiên"
          rules={[{ required: true, message: 'Vui lòng chọn mức độ ưu tiên' }]}
        >
          <Select placeholder="Chọn mức độ ưu tiên">
            <Option value="LOW">Thấp</Option>
            <Option value="MEDIUM">Trung bình</Option>
            <Option value="HIGH">Cao</Option>
            <Option value="URGENT">Khẩn cấp</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="impact_analysis"
          label="Phân tích Tác động"
          rules={[{ required: true, message: 'Vui lòng nhập phân tích tác động' }]}
        >
          <TextArea 
            rows={4} 
            placeholder="Phân tích tác động của thay đổi này đến dự án..."
          />
        </Form.Item>

        <Form.Item
          name="proposed_solution"
          label="Giải pháp Đề xuất"
          rules={[{ required: true, message: 'Vui lòng nhập giải pháp đề xuất' }]}
        >
          <TextArea 
            rows={4} 
            placeholder="Mô tả giải pháp đề xuất để thực hiện thay đổi..."
          />
        </Form.Item>

        <Form.Item
          name="estimated_schedule_impact"
          label="Tác động Lịch trình (Ngày)"
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder="Nhập tác động lịch trình"
            min={0}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateChangeRequestModal;
