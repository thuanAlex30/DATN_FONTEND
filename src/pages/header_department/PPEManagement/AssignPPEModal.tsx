import React, { useState, useEffect, useMemo } from 'react';
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
  Alert,
  Image,
  Avatar,
  Card
} from 'antd';
import { UserOutlined, SafetyOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store';
import * as ppeService from '../../../services/ppeService';
import type { CreateIssuanceData } from '../../../services/ppeService';
import dayjs from 'dayjs';
import { ENV } from '../../../config/env';

interface AssignPPEModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedUser?: any;
}

const { Text } = Typography;
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
  const { user } = useSelector((state: RootState) => state.auth);

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
    if (isOpen) {
      loadUsers();
      loadPPEItems();
      if (selectedUser) {
        form.setFieldsValue({ user_id: selectedUser.id || selectedUser._id });
      } else {
        form.resetFields();
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
        issued_date: dayjs(values.issued_date).format('YYYY-MM-DD'),
        expected_return_date: dayjs(values.expected_return_date).format('YYYY-MM-DD'),
        issued_by: user?.id || ''
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
          issued_date: dayjs(),
          expected_return_date: dayjs().add(30, 'day') // 30 days from now
        }}
      >
        {selectedUser && (
          <Alert
            message={`Đang phát PPE cho: ${selectedUser.full_name}`}
            description={`${selectedUser.department_name || 'Không xác định'}`}
            type="info"
            style={{ marginBottom: 16 }}
            showIcon
          />
        )}

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
                {ppeItems.map(item => {
                  const available = (item.quantity_available || 0) - (item.quantity_allocated || 0);
                  const inactive = item.status === 'inactive';
                  return (
                    <Option key={item.id} value={item.id} disabled={inactive}>
                      <Space>
                        <SafetyOutlined />
                        <div>
                          <div>
                            {item.item_name}{' '}
                            {inactive && <Text type="danger">(Inactive)</Text>}
                          </div>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            {item.item_code} - Còn lại: {available}
                          </Text>
                        </div>
                      </Space>
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {selectedItem && (
          <>
            <Card size="small" title="Thông tin thiết bị" style={{ marginBottom: 16 }}>
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                {selectedItem.image_url ? (
                  <div style={{ textAlign: 'center' }}>
                    <Image
                      src={resolveImageUrl(selectedItem.image_url)}
                      width={120}
                      height={120}
                      style={{ objectFit: 'cover', borderRadius: 8 }}
                      preview={{ mask: 'Xem ảnh' }}
                      fallback=""
                    />
                  </div>
                ) : (
                  <div style={{ textAlign: 'center' }}>
                    <Avatar icon={<SafetyOutlined />} size={120} />
                  </div>
                )}
                <div>
                  <Text strong>Tên thiết bị: </Text>
                  <Text>{selectedItem.item_name}</Text>
                </div>
                <div>
                  <Text strong>Mã thiết bị: </Text>
                  <Text>{selectedItem.item_code}</Text>
                </div>
                {selectedItem.brand && (
                  <div>
                    <Text strong>Thương hiệu: </Text>
                    <Text>{selectedItem.brand}</Text>
                  </div>
                )}
                {selectedItem.model && (
                  <div>
                    <Text strong>Model: </Text>
                    <Text>{selectedItem.model}</Text>
                  </div>
                )}
                <div>
                  <Text strong>Số lượng có sẵn: </Text>
                  <Text type="success">{getAvailableQuantity()}</Text>
                </div>
              </Space>
            </Card>
          </>
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
              rules={[
                { required: true, message: 'Vui lòng chọn ngày trả dự kiến' },
                {
                  validator: (_, value) => {
                    const issuedDate = form.getFieldValue('issued_date');
                    if (issuedDate && value && !dayjs(value).isAfter(dayjs(issuedDate), 'day')) {
                      return Promise.reject(new Error('Ngày trả dự kiến phải sau ngày phát'));
                    }
                    return Promise.resolve();
                  }
                }
              ]}
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
