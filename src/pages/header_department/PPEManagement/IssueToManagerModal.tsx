import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Select,
  InputNumber,
  Input,
  DatePicker,
  Button,
  message,
  Space,
  Typography,
  Card,
  Row,
  Col,
  Alert,
  Divider
} from 'antd';
import {
  SafetyOutlined,
  UserOutlined,
  CalendarOutlined,
  NumberOutlined,
  SendOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import * as ppeService from '../../../services/ppeService';
import userService, { type User } from '../../../services/userService';
import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store';

const { Title, Text } = Typography;
const { Option } = Select;

interface IssueToManagerModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const IssueToManagerModal: React.FC<IssueToManagerModalProps> = ({
  visible,
  onCancel,
  onSuccess
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [managers, setManagers] = useState<User[]>([]);
  const [ppeItems, setPpeItems] = useState<ppeService.PPEItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<ppeService.PPEItem | null>(null);
  const [selectedManager, setSelectedManager] = useState<User | null>(null);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (visible) {
      loadManagers();
      loadPPEItems();
      form.resetFields();
    }
  }, [visible]);

  const loadManagers = async () => {
    try {
      const allUsers = await userService.getAllUsers();
      const managers = allUsers.filter((user: any) => user.role?.role_name === 'manager');
      setManagers(managers);
    } catch (error) {
      console.error('Error loading managers:', error);
      message.error('Lỗi khi tải danh sách Manager');
    }
  };

  const loadPPEItems = async () => {
    try {
      const items = await ppeService.getPPEItems();
      setPpeItems(items);
    } catch (error) {
      console.error('Error loading PPE items:', error);
      message.error('Lỗi khi tải danh sách thiết bị PPE');
    }
  };

  const handleItemChange = (itemId: string) => {
    const item = ppeItems.find(i => i.id === itemId);
    setSelectedItem(item || null);
  };

  const handleManagerChange = (managerId: string) => {
    const manager = managers.find(m => m.id === managerId);
    setSelectedManager(manager || null);
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const issuanceData = {
        user_id: values.manager_id,
        item_id: values.item_id,
        quantity: values.quantity,
        issued_date: values.issued_date.toISOString(),
        expected_return_date: values.expected_return_date.toISOString(),
        notes: values.notes || '',
        issued_by: user?.id
      };

      const response = await ppeService.issueToManager(issuanceData);
      
      if (response.success) {
        message.success('Phát PPE cho Manager thành công!');
        form.resetFields();
        setSelectedItem(null);
        setSelectedManager(null);
        onSuccess();
      } else {
        message.error(response.message || 'Lỗi khi phát PPE cho Manager');
      }
    } catch (error) {
      console.error('Error issuing PPE to manager:', error);
      message.error('Lỗi khi phát PPE cho Manager');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setSelectedItem(null);
    setSelectedManager(null);
    onCancel();
  };

  return (
    <Modal
      title={
        <Space>
          <SafetyOutlined style={{ color: '#1890ff' }} />
          <span>Phát PPE cho Manager</span>
        </Space>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={800}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          issued_date: dayjs(),
          expected_return_date: dayjs().add(30, 'day')
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Chọn Manager"
              name="manager_id"
              rules={[{ required: true, message: 'Vui lòng chọn Manager' }]}
            >
              <Select
                placeholder="Chọn Manager"
                showSearch
                optionFilterProp="children"
                onChange={handleManagerChange}
                suffixIcon={<UserOutlined />}
              >
                {managers.map(manager => (
                  <Option key={manager.id} value={manager.id}>
                    <Space>
                      <UserOutlined />
                      <span>{manager.full_name}</span>
                      <Text type="secondary">({manager.department?.department_name || 'N/A'})</Text>
                    </Space>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          
          <Col span={12}>
            <Form.Item
              label="Chọn thiết bị PPE"
              name="item_id"
              rules={[{ required: true, message: 'Vui lòng chọn thiết bị PPE' }]}
            >
              <Select
                placeholder="Chọn thiết bị PPE"
                showSearch
                optionFilterProp="children"
                onChange={handleItemChange}
                suffixIcon={<SafetyOutlined />}
              >
                {ppeItems.map(item => (
                  <Option key={item.id} value={item.id}>
                    <Space>
                      <SafetyOutlined />
                      <span>{item.item_name}</span>
                      <Text type="secondary">({item.item_code})</Text>
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
              label="Số lượng"
              name="quantity"
              rules={[
                { required: true, message: 'Vui lòng nhập số lượng' },
                { type: 'number', min: 1, message: 'Số lượng phải lớn hơn 0' }
              ]}
            >
              <InputNumber
                min={1}
                max={selectedItem?.quantity_available || 1000}
                style={{ width: '100%' }}
                suffix={<NumberOutlined />}
                placeholder="Nhập số lượng"
              />
            </Form.Item>
          </Col>
          
          <Col span={8}>
            <Form.Item
              label="Ngày phát"
              name="issued_date"
              rules={[{ required: true, message: 'Vui lòng chọn ngày phát' }]}
            >
              <DatePicker
                style={{ width: '100%' }}
                suffixIcon={<CalendarOutlined />}
                format="DD/MM/YYYY"
              />
            </Form.Item>
          </Col>
          
          <Col span={8}>
            <Form.Item
              label="Ngày trả dự kiến"
              name="expected_return_date"
              rules={[{ required: true, message: 'Vui lòng chọn ngày trả dự kiến' }]}
            >
              <DatePicker
                style={{ width: '100%' }}
                suffixIcon={<CalendarOutlined />}
                format="DD/MM/YYYY"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Ghi chú"
          name="notes"
        >
          <Input.TextArea
            rows={3}
            placeholder="Nhập ghi chú (tùy chọn)"
            maxLength={500}
            showCount
          />
        </Form.Item>

        {/* Thông tin chi tiết */}
        {(selectedItem || selectedManager) && (
          <>
            <Divider />
            <Title level={5}>
              <InfoCircleOutlined /> Thông tin chi tiết
            </Title>
            
            <Row gutter={16}>
              {selectedManager && (
                <Col span={12}>
                  <Card size="small" title="Thông tin Manager">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div>
                        <Text strong>Tên: </Text>
                        <Text>{selectedManager.full_name}</Text>
                      </div>
                      <div>
                        <Text strong>Email: </Text>
                        <Text>{selectedManager.email}</Text>
                      </div>
                      <div>
                        <Text strong>Phòng ban: </Text>
                        <Text>{selectedManager.department?.department_name || 'N/A'}</Text>
                      </div>
                    </Space>
                  </Card>
                </Col>
              )}
              
              {selectedItem && (
                <Col span={12}>
                  <Card size="small" title="Thông tin thiết bị">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div>
                        <Text strong>Tên thiết bị: </Text>
                        <Text>{selectedItem.item_name}</Text>
                      </div>
                      <div>
                        <Text strong>Mã thiết bị: </Text>
                        <Text>{selectedItem.item_code}</Text>
                      </div>
                      <div>
                        <Text strong>Thương hiệu: </Text>
                        <Text>{selectedItem.brand}</Text>
                      </div>
                      <div>
                        <Text strong>Model: </Text>
                        <Text>{selectedItem.model}</Text>
                      </div>
                      <div>
                        <Text strong>Tồn kho hiện tại: </Text>
                        <Text type="success">{selectedItem.quantity_available}</Text>
                      </div>
                    </Space>
                  </Card>
                </Col>
              )}
            </Row>
          </>
        )}

        {/* Cảnh báo tồn kho thấp */}
        {selectedItem && selectedItem.quantity_available < 10 && (
          <Alert
            message="Cảnh báo tồn kho thấp"
            description={`Thiết bị ${selectedItem.item_name} chỉ còn ${selectedItem.quantity_available} sản phẩm trong kho.`}
            type="warning"
            showIcon
            style={{ marginTop: 16 }}
          />
        )}

        <div style={{ marginTop: 24, textAlign: 'right' }}>
          <Space>
            <Button onClick={handleCancel}>
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<SendOutlined />}
            >
              Phát PPE cho Manager
            </Button>
          </Space>
        </div>
      </Form>
    </Modal>
  );
};

export default IssueToManagerModal;
