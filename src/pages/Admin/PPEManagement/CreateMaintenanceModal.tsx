import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Form, 
  Select, 
  Input, 
  DatePicker, 
  Button, 
  message, 
  Space,
  Row,
  Col,
  Typography,
  Alert,
  InputNumber
} from 'antd';
import { ToolOutlined, SafetyOutlined, CalendarOutlined, UserOutlined } from '@ant-design/icons';
import * as ppeService from '../../../services/ppeService';

interface CreateMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const CreateMaintenanceModal: React.FC<CreateMaintenanceModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [ppeItems, setPpeItems] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadPPEItems();
      loadUsers();
    }
  }, [isOpen]);

  const loadPPEItems = async () => {
    try {
      const itemsData = await ppeService.getPPEItems();
      setPpeItems(itemsData || []);
    } catch (err) {
      console.error('Error loading PPE items:', err);
    }
  };

  const loadUsers = async () => {
    try {
      const usersData = await ppeService.getAllUsers();
      setUsers(usersData || []);
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      
      const maintenanceData = {
        item_id: values.item_id,
        maintenance_type: values.maintenance_type,
        scheduled_date: values.scheduled_date.format('YYYY-MM-DD'),
        assigned_to: values.assigned_to,
        priority: values.priority,
        estimated_duration: values.estimated_duration,
        description: values.description,
        notes: values.notes,
        created_by: 'current_user_id' // TODO: Get from auth context
      };

      await ppeService.createMaintenance(maintenanceData);
      message.success('Tạo lịch bảo trì thành công');
      form.resetFields();
      onSuccess();
      onClose();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể tạo lịch bảo trì');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <Space>
          <ToolOutlined />
          Tạo lịch bảo trì
        </Space>
      }
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          maintenance_type: 'preventive',
          priority: 'medium',
          scheduled_date: new Date(Date.now() + 24 * 60 * 60 * 1000) // Tomorrow
        }}
      >
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="item_id"
              label="Thiết bị PPE"
              rules={[{ required: true, message: 'Vui lòng chọn thiết bị' }]}
            >
              <Select
                placeholder="Chọn thiết bị cần bảo trì"
                showSearch
                optionFilterProp="children"
              >
                {ppeItems.map(item => (
                  <Option key={item.id} value={item.id}>
                    <Space>
                      <SafetyOutlined />
                      <div>
                        <div>{item.item_name}</div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {item.item_code} - {item.brand} {item.model}
                        </Text>
                      </div>
                    </Space>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="maintenance_type"
              label="Loại bảo trì"
              rules={[{ required: true, message: 'Vui lòng chọn loại bảo trì' }]}
            >
              <Select placeholder="Chọn loại bảo trì">
                <Option value="preventive">Phòng ngừa</Option>
                <Option value="corrective">Sửa chữa</Option>
                <Option value="emergency">Khẩn cấp</Option>
                <Option value="inspection">Kiểm tra</Option>
                <Option value="calibration">Hiệu chuẩn</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="priority"
              label="Độ ưu tiên"
              rules={[{ required: true, message: 'Vui lòng chọn độ ưu tiên' }]}
            >
              <Select placeholder="Chọn độ ưu tiên">
                <Option value="low">Thấp</Option>
                <Option value="medium">Trung bình</Option>
                <Option value="high">Cao</Option>
                <Option value="urgent">Khẩn cấp</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="scheduled_date"
              label="Ngày bảo trì"
              rules={[{ required: true, message: 'Vui lòng chọn ngày bảo trì' }]}
            >
              <DatePicker 
                style={{ width: '100%' }}
                placeholder="Chọn ngày bảo trì"
                showTime
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="assigned_to"
              label="Người thực hiện"
              rules={[{ required: true, message: 'Vui lòng chọn người thực hiện' }]}
            >
              <Select
                placeholder="Chọn người thực hiện"
                showSearch
                optionFilterProp="children"
              >
                {users.map(user => (
                  <Option key={user.id || user._id} value={user.id || user._id}>
                    <Space>
                      <UserOutlined />
                      <div>
                        <div>{user.full_name}</div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {user.department_name || 'Không xác định'}
                        </Text>
                      </div>
                    </Space>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="estimated_duration"
              label="Thời gian dự kiến (giờ)"
              rules={[
                { required: true, message: 'Vui lòng nhập thời gian dự kiến' },
                { type: 'number', min: 0.5, message: 'Thời gian phải lớn hơn 0.5 giờ' }
              ]}
            >
              <InputNumber
                min={0.5}
                step={0.5}
                style={{ width: '100%' }}
                placeholder="Nhập thời gian dự kiến"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="description"
          label="Mô tả bảo trì"
          rules={[{ required: true, message: 'Vui lòng nhập mô tả bảo trì' }]}
        >
          <TextArea
            rows={3}
            placeholder="Nhập mô tả chi tiết về công việc bảo trì..."
          />
        </Form.Item>

        <Form.Item
          name="notes"
          label="Ghi chú"
        >
          <TextArea
            rows={2}
            placeholder="Nhập ghi chú bổ sung..."
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
          <Space>
            <Button onClick={onClose}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Tạo lịch bảo trì
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateMaintenanceModal;
