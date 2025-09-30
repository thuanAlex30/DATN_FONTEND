import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Form, 
  Select, 
  InputNumber, 
  DatePicker, 
  Button, 
  message, 
  Space,
  Row,
  Col,
  Typography,
  Alert
} from 'antd';
import { UserOutlined, SafetyOutlined } from '@ant-design/icons';
import * as ppeService from '../../../services/ppeService';
import type { CreateIssuanceData } from '../../../services/ppeService';

interface AssignPPEModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedUser?: any;
}

const { Title, Text } = Typography;
const { Option } = Select;

const AssignPPEModal: React.FC<AssignPPEModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  selectedUser
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [ppeItems, setPpeItems] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      loadUsers();
      loadPPEItems();
      if (selectedUser) {
        form.setFieldsValue({ user_id: selectedUser.id || selectedUser._id });
      }
    }
  }, [isOpen, selectedUser]);

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
      
      const issuanceData: CreateIssuanceData = {
        user_id: values.user_id,
        item_id: values.item_id,
        quantity: values.quantity,
        issued_date: values.issued_date.format('YYYY-MM-DD'),
        expected_return_date: values.expected_return_date.format('YYYY-MM-DD'),
        issued_by: 'current_user_id' // TODO: Get from auth context
      };

      await ppeService.createPPEIssuance(issuanceData);
      message.success('Phát PPE thành công');
      form.resetFields();
      onSuccess();
      onClose();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể phát PPE');
    } finally {
      setLoading(false);
    }
  };

  const handleItemChange = (itemId: string) => {
    const item = ppeItems.find(i => i.id === itemId);
    setSelectedItem(item);
  };

  const getAvailableQuantity = () => {
    if (!selectedItem) return 0;
    return (selectedItem.quantity_available || 0) - (selectedItem.quantity_allocated || 0);
  };

  return (
    <Modal
      title={
        <Space>
          <UserOutlined />
          Phát PPE mới
        </Space>
      }
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          issued_date: new Date(),
          expected_return_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
        }}
      >
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="user_id"
              label="Nhân viên"
              rules={[{ required: true, message: 'Vui lòng chọn nhân viên' }]}
            >
              <Select
                placeholder="Chọn nhân viên"
                showSearch
                optionFilterProp="children"
                disabled={!!selectedUser}
              >
                {users.map(user => (
                  <Option key={user.id || user._id} value={user.id || user._id}>
                    <Space>
                      <UserOutlined />
                      <div>
                        <div>{user.full_name}</div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {user.department_name || 'Không xác định'} - {user.position || 'Không xác định'}
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
          <Col span={24}>
            <Form.Item
              name="item_id"
              label="Thiết bị PPE"
              rules={[{ required: true, message: 'Vui lòng chọn thiết bị' }]}
            >
              <Select
                placeholder="Chọn thiết bị PPE"
                showSearch
                optionFilterProp="children"
                onChange={handleItemChange}
              >
                {ppeItems.map(item => (
                  <Option key={item.id} value={item.id}>
                    <Space>
                      <SafetyOutlined />
                      <div>
                        <div>{item.item_name}</div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {item.item_code} - Còn lại: {(item.quantity_available || 0) - (item.quantity_allocated || 0)}
                        </Text>
                      </div>
                    </Space>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {selectedItem && (
          <Alert
            message={`Số lượng có sẵn: ${getAvailableQuantity()}`}
            type="info"
            style={{ marginBottom: 16 }}
          />
        )}

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="quantity"
              label="Số lượng"
              rules={[
                { required: true, message: 'Vui lòng nhập số lượng' },
                { type: 'number', min: 1, message: 'Số lượng phải lớn hơn 0' },
                {
                  validator: (_, value) => {
                    if (value > getAvailableQuantity()) {
                      return Promise.reject(new Error('Số lượng vượt quá tồn kho'));
                    }
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <InputNumber
                min={1}
                max={getAvailableQuantity()}
                style={{ width: '100%' }}
                placeholder="Nhập số lượng"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="issued_date"
              label="Ngày phát"
              rules={[{ required: true, message: 'Vui lòng chọn ngày phát' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="expected_return_date"
              label="Ngày trả dự kiến"
              rules={[{ required: true, message: 'Vui lòng chọn ngày trả dự kiến' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
          <Space>
            <Button onClick={onClose}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Phát PPE
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AssignPPEModal;
