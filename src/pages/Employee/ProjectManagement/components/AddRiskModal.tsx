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
  Typography
} from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { projectRiskService, type ProjectRisk } from '../../../../services/projectRiskService';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;
const { Title } = Typography;

interface AddRiskModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  projectId: string;
}

const AddRiskModal: React.FC<AddRiskModalProps> = ({
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
      
      const riskData: Partial<ProjectRisk> = {
        project_id: projectId,
        risk_name: values.risk_name,
        description: values.description,
        risk_category: values.risk_category,
        probability: values.probability,
        impact: values.impact,
        risk_level: values.risk_level,
        mitigation_strategy: values.mitigation_strategy,
        contingency_plan: values.contingency_plan,
        risk_owner: values.risk_owner,
        status: 'identified',
        identified_date: dayjs(values.identified_date).toISOString(),
        target_resolution_date: values.target_resolution_date 
          ? dayjs(values.target_resolution_date).toISOString() 
          : null
      };

      await projectRiskService.createRisk(riskData);
      message.success('Thêm rủi ro thành công!');
      form.resetFields();
      onSuccess();
    } catch (error: any) {
      console.error('Error creating risk:', error);
      message.error(error.response?.data?.message || 'Có lỗi xảy ra khi thêm rủi ro');
    } finally {
      setLoading(false);
    }
  };

  const riskCategories = [
    { value: 'technical', label: 'Kỹ thuật' },
    { value: 'schedule', label: 'Tiến độ' },
    { value: 'resource', label: 'Tài nguyên' },
    { value: 'external', label: 'Bên ngoài' },
    { value: 'regulatory', label: 'Quy định' }
  ];

  const riskLevels = [
    { value: 'low', label: 'Thấp', color: 'green' },
    { value: 'medium', label: 'Trung bình', color: 'orange' },
    { value: 'high', label: 'Cao', color: 'red' },
    { value: 'critical', label: 'Nghiêm trọng', color: 'red' }
  ];

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
          <span>Thêm Rủi Ro Mới</span>
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
          probability: 1,
          impact: 1,
          risk_level: 'low',
          identified_date: dayjs()
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="risk_name"
              label="Tên Rủi Ro"
              rules={[
                { required: true, message: 'Vui lòng nhập tên rủi ro' },
                { max: 255, message: 'Tên rủi ro không được quá 255 ký tự' }
              ]}
            >
              <Input placeholder="Nhập tên rủi ro" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="risk_category"
              label="Danh Mục Rủi Ro"
              rules={[{ required: true, message: 'Vui lòng chọn danh mục rủi ro' }]}
            >
              <Select placeholder="Chọn danh mục rủi ro">
                {riskCategories.map(category => (
                  <Option key={category.value} value={category.value}>
                    {category.label}
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
            { required: true, message: 'Vui lòng nhập mô tả rủi ro' },
            { max: 1000, message: 'Mô tả không được quá 1000 ký tự' }
          ]}
        >
          <TextArea 
            rows={3} 
            placeholder="Mô tả chi tiết về rủi ro, nguyên nhân và tác động có thể xảy ra"
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="probability"
              label="Khả Năng Xảy Ra"
              rules={[{ required: true, message: 'Vui lòng chọn khả năng xảy ra' }]}
            >
              <Select placeholder="Chọn khả năng">
                <Option value={1}>Rất thấp (1)</Option>
                <Option value={2}>Thấp (2)</Option>
                <Option value={3}>Trung bình (3)</Option>
                <Option value={4}>Cao (4)</Option>
                <Option value={5}>Rất cao (5)</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="impact"
              label="Mức Độ Tác Động"
              rules={[{ required: true, message: 'Vui lòng chọn mức độ tác động' }]}
            >
              <Select placeholder="Chọn tác động">
                <Option value={1}>Rất thấp (1)</Option>
                <Option value={2}>Thấp (2)</Option>
                <Option value={3}>Trung bình (3)</Option>
                <Option value={4}>Cao (4)</Option>
                <Option value={5}>Rất cao (5)</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="risk_level"
              label="Mức Độ Rủi Ro"
              rules={[{ required: true, message: 'Vui lòng chọn mức độ rủi ro' }]}
            >
              <Select placeholder="Chọn mức độ">
                {riskLevels.map(level => (
                  <Option key={level.value} value={level.value}>
                    {level.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="mitigation_strategy"
          label="Chiến Lược Giảm Thiểu"
          rules={[
            { required: true, message: 'Vui lòng nhập chiến lược giảm thiểu' },
            { max: 1000, message: 'Chiến lược không được quá 1000 ký tự' }
          ]}
        >
          <TextArea 
            rows={3} 
            placeholder="Mô tả các biện pháp để giảm thiểu hoặc loại bỏ rủi ro"
          />
        </Form.Item>

        <Form.Item
          name="contingency_plan"
          label="Kế Hoạch Dự Phòng"
          rules={[{ max: 1000, message: 'Kế hoạch không được quá 1000 ký tự' }]}
        >
          <TextArea 
            rows={3} 
            placeholder="Mô tả kế hoạch dự phòng nếu rủi ro xảy ra"
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="risk_owner"
              label="Người Chịu Trách Nhiệm"
              rules={[{ required: true, message: 'Vui lòng nhập người chịu trách nhiệm' }]}
            >
              <Input placeholder="Nhập tên người chịu trách nhiệm" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="identified_date"
              label="Ngày Xác Định"
              rules={[{ required: true, message: 'Vui lòng chọn ngày xác định' }]}
            >
              <DatePicker 
                style={{ width: '100%' }} 
                placeholder="Chọn ngày xác định"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="target_resolution_date"
          label="Ngày Giải Quyết Dự Kiến"
        >
          <DatePicker 
            style={{ width: '100%' }} 
            placeholder="Chọn ngày giải quyết dự kiến"
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
          <Button onClick={onCancel}>
            Hủy
          </Button>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading}
            icon={<ExclamationCircleOutlined />}
          >
            Thêm Rủi Ro
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default AddRiskModal;
