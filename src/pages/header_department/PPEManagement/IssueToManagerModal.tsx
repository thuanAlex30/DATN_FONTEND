import React, { useState, useEffect, useMemo } from 'react';
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
  Divider,
  Image,
  Avatar
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
import userService from '../../../services/userService';
import type { User } from '../../../types/user';
import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store';
import { ENV } from '../../../config/env';

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
  const [loadingItems, setLoadingItems] = useState(false);
  const [managers, setManagers] = useState<User[]>([]);
  const [ppeItems, setPpeItems] = useState<ppeService.PPEItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<ppeService.PPEItem | null>(null);
  const [selectedManager, setSelectedManager] = useState<User | null>(null);
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
    if (visible) {
      loadManagers();
      loadPPEItems();
      form.resetFields();
    }
  }, [visible]);

  const loadManagers = async () => {
    try {
      setLoading(true);
      const allUsers = await userService.getAllUsers();
      
      // Filter users with role "manager" or "warehouse_staff" (case-insensitive)
      const managers = allUsers.filter((user: any) => {
        const roleName = user.role?.role_name?.toLowerCase() || '';
        const roleCode = user.role?.role_code?.toLowerCase() || '';
        
        // Check if user has manager or warehouse_staff role
        const isManager = roleName === 'manager' || roleCode === 'manager';
        const isWarehouseStaff = roleName === 'warehouse_staff' || roleCode === 'warehouse_staff' || 
                                 roleName === 'warehouse staff' || roleCode === 'warehouse_staff';
        
        return isManager || isWarehouseStaff;
      });
      
      console.log('[IssueToManagerModal] Total users:', allUsers.length);
      console.log('[IssueToManagerModal] Filtered managers/warehouse_staff:', managers.length);
      console.log('[IssueToManagerModal] Managers data:', managers.map((m: any) => ({
        name: m.full_name,
        role: m.role?.role_name || m.role?.role_code
      })));
      
      setManagers(managers);
      
      if (managers.length === 0) {
        message.warning('Không tìm thấy Manager hoặc Warehouse Staff nào trong hệ thống');
      }
    } catch (error) {
      console.error('Error loading managers:', error);
      message.error('Lỗi khi tải danh sách Manager');
      setManagers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadPPEItems = async () => {
    try {
      setLoadingItems(true);
      console.log('[IssueToManagerModal] Starting to load PPE items...');
      
      const itemsRes = await ppeService.getPPEItems();
      console.log('[IssueToManagerModal] Raw response from getPPEItems:', itemsRes);
      console.log('[IssueToManagerModal] Response type:', typeof itemsRes);
      console.log('[IssueToManagerModal] Is array:', Array.isArray(itemsRes));
      
      // Handle different response formats
      let items: any[] = [];
      
      if (Array.isArray(itemsRes)) {
        items = itemsRes;
        console.log('[IssueToManagerModal] Response is array, length:', items.length);
      } else if (itemsRes && typeof itemsRes === 'object') {
        console.log('[IssueToManagerModal] Response is object, keys:', Object.keys(itemsRes));
        if ('data' in itemsRes && Array.isArray((itemsRes as any).data)) {
          items = (itemsRes as any).data;
          console.log('[IssueToManagerModal] Found items in data, length:', items.length);
        } else if ('items' in itemsRes && Array.isArray((itemsRes as any).items)) {
          items = (itemsRes as any).items;
          console.log('[IssueToManagerModal] Found items in items, length:', items.length);
        } else if ('success' in itemsRes && (itemsRes as any).data) {
          const data = (itemsRes as any).data;
          if (Array.isArray(data)) {
            items = data;
            console.log('[IssueToManagerModal] Found items in success.data, length:', items.length);
          } else if (data && Array.isArray(data.items)) {
            items = data.items;
            console.log('[IssueToManagerModal] Found items in success.data.items, length:', items.length);
          }
        }
      }
      
      console.log('[IssueToManagerModal] Items before normalization:', items);
      
      // Normalize items - ensure id field exists and consistent structure
      items = items.map((item: any) => {
        // Handle category_id as object or string
        const categoryId = typeof item.category_id === 'object' && item.category_id
          ? (item.category_id.id || (item.category_id as any)._id || item.category_id)
          : item.category_id;
        
        const normalizedItem = {
          ...item,
          id: item.id || item._id || (item as any).id,
          item_name: item.item_name || item.name || '',
          item_code: item.item_code || item.code || '',
          category_id: categoryId,
          quantity_available: item.quantity_available || item.available_quantity || item.remaining_quantity || 0,
          quantity_allocated: item.quantity_allocated || item.allocated_quantity || item.actual_allocated_quantity || 0,
          total_quantity: item.total_quantity || item.quantity_available || 0,
          remaining_quantity: item.remaining_quantity || item.quantity_available || 0,
          // Preserve image_url if it exists (don't set to empty string)
          ...(item.image_url || (item as any).image_url ? { image_url: item.image_url || (item as any).image_url } : {}),
        };
        console.log('[IssueToManagerModal] Normalized item:', {
          original: item,
          normalized: normalizedItem
        });
        return normalizedItem;
      });
      
      // Filter out items without id - but log them first
      const itemsWithoutId = items.filter((item: any) => !item.id);
      if (itemsWithoutId.length > 0) {
        console.warn('[IssueToManagerModal] Items without id (will be filtered out):', itemsWithoutId);
      }
      
      items = items.filter((item: any) => item.id);
      
      // If items is still empty, try to get from inventory report as fallback
      if (items.length === 0) {
        console.log('[IssueToManagerModal] No items found, trying inventory report as fallback...');
        try {
          const inventoryReport = await ppeService.getInventoryReport();
          console.log('[IssueToManagerModal] Inventory report response:', inventoryReport);
          if (inventoryReport && (inventoryReport as any).items && Array.isArray((inventoryReport as any).items)) {
            items = (inventoryReport as any).items;
            console.log('[IssueToManagerModal] Using items from inventory report:', items.length);
          } else if (inventoryReport && (inventoryReport as any).inventoryReport && (inventoryReport as any).inventoryReport.items) {
            items = (inventoryReport as any).inventoryReport.items;
            console.log('[IssueToManagerModal] Using items from inventoryReport.items:', items.length);
          }
          
          // Normalize items from inventory report
          if (items.length > 0) {
            items = items.map((item: any) => {
              const categoryId = typeof item.category_id === 'object' && item.category_id
                ? (item.category_id.id || (item.category_id as any)._id || item.category_id)
                : item.category_id;
              
              return {
                ...item,
                id: item.id || item._id || (item as any).id,
                item_name: item.item_name || item.name || '',
                item_code: item.item_code || item.code || '',
                category_id: categoryId,
                quantity_available: item.quantity_available || item.available_quantity || item.remaining_quantity || 0,
                quantity_allocated: item.quantity_allocated || item.allocated_quantity || item.actual_allocated_quantity || 0,
                total_quantity: item.total_quantity || item.quantity_available || 0,
                remaining_quantity: item.remaining_quantity || item.quantity_available || 0,
                // Preserve image_url if it exists (don't set to empty string)
                ...(item.image_url || (item as any).image_url ? { image_url: item.image_url || (item as any).image_url } : {}),
              };
            }).filter((item: any) => item.id);
          }
        } catch (err) {
          console.warn('[IssueToManagerModal] Could not load items from inventory report:', err);
        }
      }
      
      console.log('[IssueToManagerModal] Final PPE items count:', items.length);
      console.log('[IssueToManagerModal] Final PPE items data:', items);
      
      setPpeItems(items);
      
      if (items.length === 0) {
        console.warn('[IssueToManagerModal] No PPE items found after processing');
        message.warning('Không có thiết bị PPE nào trong hệ thống. Vui lòng tạo thiết bị trước.');
      } else {
        console.log('[IssueToManagerModal] Successfully loaded', items.length, 'PPE items');
      }
    } catch (error: any) {
      console.error('[IssueToManagerModal] Error loading PPE items:', error);
      console.error('[IssueToManagerModal] Error details:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status
      });
      const errorMessage = error?.response?.data?.message || error?.message || 'Lỗi khi tải danh sách thiết bị PPE';
      message.error(errorMessage);
      setPpeItems([]);
    } finally {
      setLoadingItems(false);
    }
  };

  const handleItemChange = (itemId: string) => {
    const item = ppeItems.find(i => {
      const currentId = i.id || (i as any)._id;
      return currentId === itemId || currentId?.toString() === itemId?.toString();
    });
    console.log('[IssueToManagerModal] Selected item:', item);
    console.log('[IssueToManagerModal] Selected item image_url:', item ? (item as any).image_url : 'no item');
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
                placeholder="Chọn Manager hoặc Warehouse Staff"
                showSearch
                optionFilterProp="children"
                onChange={handleManagerChange}
                suffixIcon={<UserOutlined />}
                loading={loading}
                notFoundContent={loading ? <span>Đang tải...</span> : <span>Không tìm thấy Manager hoặc Warehouse Staff</span>}
                filterOption={(input, option: any) => {
                  const children = option?.children;
                  if (typeof children === 'string') {
                    return children.toLowerCase().includes(input.toLowerCase());
                  }
                  if (Array.isArray(children)) {
                    const text = children.map((c: any) => 
                      typeof c === 'string' ? c : c?.props?.children || ''
                    ).join(' ').toLowerCase();
                    return text.includes(input.toLowerCase());
                  }
                  return false;
                }}
              >
                {managers.map(manager => {
                  const roleName = manager.role?.role_name || manager.role?.role_code || 'N/A';
                  const roleDisplay = roleName === 'warehouse_staff' || roleName === 'warehouse staff' 
                    ? 'Warehouse Staff' 
                    : 'Manager';
                  
                  return (
                    <Option key={manager.id} value={manager.id}>
                      <Space>
                        <UserOutlined />
                        <span>{manager.full_name}</span>
                        <Text type="secondary">({roleDisplay})</Text>
                        {manager.department?.department_name && (
                          <Text type="secondary">- {manager.department.department_name}</Text>
                        )}
                      </Space>
                    </Option>
                  );
                })}
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
                loading={loadingItems}
                notFoundContent={
                  loadingItems ? (
                    <span>Đang tải...</span>
                  ) : (
                    <span>Không có thiết bị PPE. Vui lòng tạo thiết bị trước.</span>
                  )
                }
                filterOption={(input, option: any) => {
                  const children = option?.children;
                  if (typeof children === 'string') {
                    return children.toLowerCase().includes(input.toLowerCase());
                  }
                  if (Array.isArray(children)) {
                    const text = children.map((c: any) => 
                      typeof c === 'string' ? c : c?.props?.children || ''
                    ).join(' ').toLowerCase();
                    return text.includes(input.toLowerCase());
                  }
                  return false;
                }}
              >
                {ppeItems.map(item => {
                  const itemId = item.id || (item as any)._id;
                  const itemName = item.item_name || 'Không có tên';
                  const itemCode = item.item_code || 'N/A';
                  const availableQty = item.quantity_available || 0;
                  
                  return (
                    <Option key={itemId} value={itemId}>
                      <Space>
                        <SafetyOutlined />
                        <span>{itemName}</span>
                        <Text type="secondary">({itemCode})</Text>
                        <Text type="secondary" style={{ fontSize: '11px' }}>
                          - Còn: {availableQty}
                        </Text>
                      </Space>
                    </Option>
                  );
                })}
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
                    <Space direction="vertical" style={{ width: '100%' }} size="middle">
                      {(selectedItem as any)?.image_url && (selectedItem as any).image_url.trim() ? (
                        <div style={{ textAlign: 'center', marginBottom: 8 }}>
                          <Image
                            src={resolveImageUrl((selectedItem as any).image_url)}
                            width={120}
                            height={120}
                            style={{ objectFit: 'cover', borderRadius: 8 }}
                            preview={{ mask: 'Xem ảnh' }}
                            fallback=""
                          />
                        </div>
                      ) : (
                        <div style={{ textAlign: 'center', marginBottom: 8 }}>
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
