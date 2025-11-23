import React, { useState } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Button,
  message,
  Row,
  Col,
  Switch,
  Typography
} from 'antd';
import { FlagOutlined } from '@ant-design/icons';
import { projectMilestoneService, type ProjectMilestone } from '../../../../services/projectMilestoneService';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;
const { Title } = Typography;

interface AddMilestoneModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  projectId: string;
}

const AddMilestoneModal: React.FC<AddMilestoneModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  projectId
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      
      const milestoneData: Partial<ProjectMilestone> = {
        project_id: projectId,
        milestone_name: values.milestone_name,
        description: values.description,
        milestone_type: values.milestone_type,
        planned_start_date: dayjs(values.planned_start_date).toISOString(),
        planned_end_date: dayjs(values.planned_end_date).toISOString(),
        actual_start_date: values.actual_start_date 
          ? dayjs(values.actual_start_date).toISOString() 
          : null,
        actual_end_date: values.actual_end_date 
          ? dayjs(values.actual_end_date).toISOString() 
          : null,
        status: values.status,
        priority: values.priority,
        is_critical: values.is_critical || false,
        completion_percentage: values.completion_percentage || 0,
        responsible_person: values.responsible_person,
        dependencies: values.dependencies || [],
        deliverables: values.deliverables,
        success_criteria: values.success_criteria
      };

      await projectMilestoneService.createMilestone(milestoneData);
      message.success('Thêm cột mốc thành công!');
      form.resetFields();
      onSuccess();
    } catch (error: any) {
      console.error('Error creating milestone:', error);
      message.error(error.response?.data?.message || 'Có lỗi xảy ra khi thêm cột mốc');
    } finally {
      setLoading(false);
    }
  };

  const milestoneTypes = [
    { value: 'planning', label: 'Lập kế hoạch' },
    { value: 'execution', label: 'Thực hiện' },
    { value: 'review', label: 'Đánh giá' },
    { value: 'delivery', label: 'Giao hàng' },
    { value: 'approval', label: 'Phê duyệt' },
    { value: 'milestone', label: 'Cột mốc chính' }
  ];

  const statuses = [
    { value: 'not_started', label: 'Chưa bắt đầu', color: 'default' },
    { value: 'in_progress', label: 'Đang thực hiện', color: 'processing' },
    { value: 'completed', label: 'Hoàn thành', color: 'success' },
    { value: 'on_hold', label: 'Tạm dừng', color: 'warning' },
    { value: 'cancelled', label: 'Hủy bỏ', color: 'error' }
  ];

  const priorities = [
    { value: 'low', label: 'Thấp', color: 'green' },
    { value: 'medium', label: 'Trung bình', color: 'orange' },
    { value: 'high', label: 'Cao', color: 'red' },
    { value: 'critical', label: 'Nghiêm trọng', color: 'red' }
  ];

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FlagOutlined style={{ color: '#1890ff' }} />
          <span>Thêm Cột Mốc Mới</span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={800}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          status: 'not_started',
          priority: 'medium',
          is_critical: false,
          completion_percentage: 0
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="milestone_name"
              label="Tên Cột Mốc"
              rules={[
                { required: true, message: 'Vui lòng nhập tên cột mốc' },
                { max: 255, message: 'Tên cột mốc không được quá 255 ký tự' }
              ]}
            >
              <Input placeholder="Nhập tên cột mốc" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="milestone_type"
              label="Loại Cột Mốc"
              rules={[{ required: true, message: 'Vui lòng chọn loại cột mốc' }]}
            >
              <Select placeholder="Chọn loại cột mốc">
                {milestoneTypes.map(type => (
                  <Option key={type.value} value={type.value}>
                    {type.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="description"
          label="Mô Tả Chi Tiết"
          rules={[
            { required: true, message: 'Vui lòng nhập mô tả cột mốc' },
            { max: 1000, message: 'Mô tả không được quá 1000 ký tự' }
          ]}
        >
          <TextArea 
            rows={3} 
            placeholder="Mô tả chi tiết về cột mốc, mục tiêu và kết quả mong đợi"
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="planned_start_date"
              label="Ngày Bắt Đầu Dự Kiến"
              rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu dự kiến' }]}
            >
              <DatePicker 
                style={{ width: '100%' }} 
                placeholder="Chọn ngày bắt đầu"
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="planned_end_date"
              label="Ngày Kết Thúc Dự Kiến"
              rules={[{ required: true, message: 'Vui lòng chọn ngày kết thúc dự kiến' }]}
            >
              <DatePicker 
                style={{ width: '100%' }} 
                placeholder="Chọn ngày kết thúc"
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="status"
              label="Trạng Thái"
              rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
            >
              <Select placeholder="Chọn trạng thái">
                {statuses.map(status => (
                  <Option key={status.value} value={status.value}>
                    {status.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="priority"
              label="Mức Độ Ưu Tiên"
              rules={[{ required: true, message: 'Vui lòng chọn mức độ ưu tiên' }]}
            >
              <Select placeholder="Chọn ưu tiên">
                {priorities.map(priority => (
                  <Option key={priority.value} value={priority.value}>
                    {priority.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="completion_percentage"
              label="Phần Trăm Hoàn Thành"
              rules={[
                { required: true, message: 'Vui lòng nhập phần trăm hoàn thành' },
                { type: 'number', min: 0, max: 100, message: 'Phần trăm phải từ 0 đến 100' }
              ]}
            >
              <InputNumber 
                style={{ width: '100%' }} 
                placeholder="0"
                min={0}
                max={100}
                suffix="%"
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="is_critical"
              label="Cột Mốc Quan Trọng"
              valuePropName="checked"
            >
              <Switch 
                checkedChildren="Có" 
                unCheckedChildren="Không"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="actual_start_date"
              label="Ngày Bắt Đầu Thực Tế"
            >
              <DatePicker 
                style={{ width: '100%' }} 
                placeholder="Chọn ngày bắt đầu thực tế"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="actual_end_date"
              label="Ngày Kết Thúc Thực Tế"
            >
              <DatePicker 
                style={{ width: '100%' }} 
                placeholder="Chọn ngày kết thúc thực tế"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="responsible_person"
          label="Người Chịu Trách Nhiệm"
          rules={[{ required: true, message: 'Vui lòng nhập người chịu trách nhiệm' }]}
        >
          <Input placeholder="Nhập tên người chịu trách nhiệm" />
        </Form.Item>

        <Form.Item
          name="deliverables"
          label="Sản Phẩm Giao Nộp"
          rules={[{ max: 1000, message: 'Sản phẩm không được quá 1000 ký tự' }]}
        >
          <TextArea 
            rows={3} 
            placeholder="Mô tả các sản phẩm, tài liệu hoặc kết quả cần giao nộp"
          />
        </Form.Item>

        <Form.Item
          name="success_criteria"
          label="Tiêu Chí Thành Công"
          rules={[{ max: 1000, message: 'Tiêu chí không được quá 1000 ký tự' }]}
        >
          <TextArea 
            rows={3} 
            placeholder="Mô tả các tiêu chí để đánh giá thành công của cột mốc"
          />
        </Form.Item>

        <Row gutter={16}>
        </Row>

        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          gap: '8px',
          marginTop: '24px',
          paddingTop: '16px',
          borderTop: '1px solid #f0f0f0'
        }}>
          <Button onClick={onCancel}>
            Hủy
          </Button>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading}
            icon={<FlagOutlined />}
          >
            Thêm Cột Mốc
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default AddMilestoneModal;
