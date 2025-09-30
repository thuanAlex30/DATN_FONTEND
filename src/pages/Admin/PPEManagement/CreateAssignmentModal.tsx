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
import { TeamOutlined, UserOutlined, SafetyOutlined, CalendarOutlined } from '@ant-design/icons';
import * as ppeService from '../../../services/ppeService';

interface CreateAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const CreateAssignmentModal: React.FC<CreateAssignmentModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [ppeItems, setPpeItems] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadUsers();
      loadPPEItems();
    }
  }, [isOpen]);

  const loadUsers = async () => {
    try {
      const usersData = await ppeService.getAllUsers();
      setUsers(usersData || []);
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  const loadPPEItems = async () => {
    try {
      const itemsData = await ppeService.getPPEItems();
      setPpeItems(itemsData || []);
    } catch (err) {
      console.error('Error loading PPE items:', err);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      
      const assignmentData = {
        user_id: values.user_id,
        item_id: values.item_id,
        quantity: values.quantity,
        assignment_type: values.assignment_type,
        start_date: values.start_date.format('YYYY-MM-DD'),
        end_date: values.end_date.format('YYYY-MM-DD'),
        priority: values.priority,
        description: values.description,
        assigned_by: 'current_user_id' // TODO: Get from auth context
      };

      await ppeService.createAssignment(assignmentData);
      message.success('Tạo phân công thành công');
      form.resetFields();
      onSuccess();
      onClose();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể tạo phân công');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <Space>
          <TeamOutlined />
          Tạo phân công mới
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
          assignment_type: 'work',
          priority: 'medium',
          start_date: new Date(),
          end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="user_id"
              label="Nhân viên"
              rules={[{ required: true, message: 'Vui lòng chọn nhân viên' }]}
            >
              <Select
                placeholder="Chọn nhân viên"
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
          <Col span={12}>
            <Form.Item
              name="item_id"
              label="Thiết bị PPE"
              rules={[{ required: true, message: 'Vui lòng chọn thiết bị' }]}
            >
              <Select
                placeholder="Chọn thiết bị PPE"
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
                          {item.item_code}
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
          <Col span={8}>
            <Form.Item
              name="quantity"
              label="Số lượng"
              rules={[
                { required: true, message: 'Vui lòng nhập số lượng' },
                { type: 'number', min: 1, message: 'Số lượng phải lớn hơn 0' }
              ]}
            >
              <InputNumber
                min={1}
                style={{ width: '100%' }}
                placeholder="Nhập số lượng"
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="assignment_type"
              label="Loại phân công"
              rules={[{ required: true, message: 'Vui lòng chọn loại phân công' }]}
            >
              <Select placeholder="Chọn loại phân công">
                <Option value="work">Công việc</Option>
                <Option value="maintenance">Bảo trì</Option>
                <Option value="emergency">Khẩn cấp</Option>
                <Option value="training">Đào tạo</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
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
              name="start_date"
              label="Ngày bắt đầu"
              rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu' }]}
            >
              <DatePicker 
                style={{ width: '100%' }}
                placeholder="Chọn ngày bắt đầu"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="end_date"
              label="Ngày kết thúc"
              rules={[{ required: true, message: 'Vui lòng chọn ngày kết thúc' }]}
            >
              <DatePicker 
                style={{ width: '100%' }}
                placeholder="Chọn ngày kết thúc"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="description"
          label="Mô tả"
        >
          <TextArea
            rows={3}
            placeholder="Nhập mô tả phân công..."
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
          <Space>
            <Button onClick={onClose}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Tạo phân công
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateAssignmentModal;
