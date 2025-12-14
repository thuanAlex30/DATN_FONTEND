import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Form, 
  Select, 
  InputNumber, 
  Button, 
  message, 
  Space,
  Row,
  Col,
  Typography,
  Alert,
  Table,
  Tag,
  Spin,
  Empty
} from 'antd';
import { DatabaseOutlined, SafetyOutlined, PlusOutlined } from '@ant-design/icons';
import * as ppeService from '../../../services/ppeService';
import type { UpdateItemQuantityData } from '../../../services/ppeService';

interface InventoryUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const { Title, Text } = Typography;
const { Option } = Select;

interface InventoryItem {
  id: string;
  item_name: string;
  item_code: string;
  current_quantity: number;
  new_quantity: number;
  allocated_quantity: number;
  reorder_level: number;
}

const InventoryUpdateModal: React.FC<InventoryUpdateModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const [ppeItems, setPpeItems] = useState<any[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      loadPPEItems();
    } else {
      // Reset when modal closes
      setInventoryItems([]);
      setSelectedItem(null);
      form.resetFields();
    }
  }, [isOpen]);

  const loadPPEItems = async () => {
    try {
      setLoadingItems(true);
      console.log('Loading PPE items for inventory update...');
      
      // Try to get all items including inactive ones
      const itemsData = await ppeService.getPPEItems(true);
      console.log('Raw items data from service:', itemsData);
      
      // Handle different response structures
      let items: any[] = [];
      if (Array.isArray(itemsData)) {
        items = itemsData;
      } else if (itemsData && typeof itemsData === 'object') {
        if (Array.isArray(itemsData.data)) {
          items = itemsData.data;
        } else if (Array.isArray(itemsData.items)) {
          items = itemsData.items;
        }
      }
      
      console.log('Processed items array:', items);
      setPpeItems(items);
      
      // Auto-populate inventory items with all PPE items
      if (items && items.length > 0) {
        const initialInventoryItems: InventoryItem[] = items.map((item: any) => {
          // Calculate current quantity (available)
          const quantityAvailable = item.quantity_available || 0;
          
          // Calculate allocated quantity
          const quantityAllocated = item.quantity_allocated || 
                                   item.actual_allocated_quantity || 
                                   0;
          
          return {
            id: String(item.id || item._id),
            item_name: item.item_name || 'N/A',
            item_code: item.item_code || 'N/A',
            current_quantity: quantityAvailable,
            new_quantity: quantityAvailable, // Start with current quantity
            allocated_quantity: quantityAllocated,
            reorder_level: item.reorder_level || 0
          };
        });
        setInventoryItems(initialInventoryItems);
        console.log('Loaded inventory items:', initialInventoryItems);
        message.success(`Đã tải ${initialInventoryItems.length} thiết bị`);
      } else {
        console.warn('No items found. Items array:', items);
        setInventoryItems([]);
        message.warning('Không tìm thấy thiết bị nào. Vui lòng kiểm tra lại dữ liệu.');
      }
    } catch (err: any) {
      console.error('Error loading PPE items:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Không thể tải danh sách thiết bị';
      message.error(errorMessage);
      setInventoryItems([]);
      setPpeItems([]);
    } finally {
      setLoadingItems(false);
    }
  };

  const handleAddItem = () => {
    if (!selectedItem) {
      message.warning('Vui lòng chọn thiết bị');
      return;
    }

    const selectedItemId = String(selectedItem.id || selectedItem._id);
    const existingItem = inventoryItems.find(item => String(item.id) === selectedItemId);
    if (existingItem) {
      message.warning('Thiết bị này đã có trong danh sách');
      return;
    }

    const quantityAvailable = selectedItem.quantity_available || 0;
    const quantityAllocated = selectedItem.quantity_allocated || 
                             selectedItem.actual_allocated_quantity || 
                             0;

    const newItem: InventoryItem = {
      id: selectedItemId,
      item_name: selectedItem.item_name || 'N/A',
      item_code: selectedItem.item_code || 'N/A',
      current_quantity: quantityAvailable,
      new_quantity: quantityAvailable,
      allocated_quantity: quantityAllocated,
      reorder_level: selectedItem.reorder_level || 0
    };

    setInventoryItems([...inventoryItems, newItem]);
    setSelectedItem(null);
    form.setFieldsValue({ item_id: undefined });
    message.success(`Đã thêm ${newItem.item_name} vào danh sách`);
  };

  const handleQuantityChange = (itemId: string, value: number) => {
    setInventoryItems(items =>
      items.map(item =>
        item.id === itemId ? { ...item, new_quantity: value } : item
      )
    );
  };

  const handleRemoveItem = (itemId: string) => {
    setInventoryItems(items => items.filter(item => item.id !== itemId));
  };

  const handleSubmit = async () => {
    if (inventoryItems.length === 0) {
      message.warning('Vui lòng thêm ít nhất một thiết bị');
      return;
    }

    try {
      setLoading(true);
      
      // Update quantities for each item
      for (const item of inventoryItems) {
        if (item.new_quantity !== item.current_quantity) {
          const updateData: UpdateItemQuantityData = {
            quantity_available: item.new_quantity,
            quantity_allocated: item.allocated_quantity
          };
          
          await ppeService.updatePPEItemQuantity(item.id, updateData);
        }
      }

      message.success('Cập nhật tồn kho thành công');
      setInventoryItems([]);
      onSuccess();
      onClose();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể cập nhật tồn kho');
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (item: InventoryItem) => {
    const remaining = item.new_quantity - item.allocated_quantity;
    if (remaining <= 0) {
      return <Tag color="red">Hết hàng</Tag>;
    } else if (remaining <= (item.reorder_level || 0)) {
      return <Tag color="orange">Cần bổ sung</Tag>;
    } else {
      return <Tag color="green">Còn hàng</Tag>;
    }
  };

  const inventoryColumns = [
    {
      title: 'Thiết bị',
      dataIndex: 'item_name',
      key: 'item_name',
      render: (text: string, record: InventoryItem) => (
        <Space>
          <SafetyOutlined />
          <div>
            <div style={{ fontWeight: 'bold' }}>{text}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{record.item_code}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Số lượng hiện tại',
      dataIndex: 'current_quantity',
      key: 'current_quantity',
      render: (value: number) => <Text strong>{value}</Text>,
    },
    {
      title: 'Số lượng mới',
      key: 'new_quantity',
      render: (_: unknown, record: InventoryItem) => (
        <InputNumber
          min={0}
          value={record.new_quantity}
          onChange={(value) => handleQuantityChange(record.id, value || 0)}
          style={{ width: '100px' }}
        />
      ),
    },
    {
      title: 'Đã phát',
      dataIndex: 'allocated_quantity',
      key: 'allocated_quantity',
      render: (value: number) => <Text>{value}</Text>,
    },
    {
      title: 'Còn lại',
      key: 'remaining',
      render: (_: unknown, record: InventoryItem) => (
        <Text style={{ color: record.new_quantity - record.allocated_quantity > 0 ? '#52c41a' : '#ff4d4f' }}>
          {record.new_quantity - record.allocated_quantity}
        </Text>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_: unknown, record: InventoryItem) => getStockStatus(record),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: unknown, record: InventoryItem) => (
        <Button 
          type="link" 
          danger 
          onClick={() => handleRemoveItem(record.id)}
        >
          Xóa
        </Button>
      ),
    },
  ];

  return (
    <Modal
      title={
        <Space>
          <DatabaseOutlined />
          Cập nhật tồn kho
        </Space>
      }
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={1000}
    >
      <div style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col span={24}>
            <Alert
              message="Danh sách tất cả thiết bị PPE"
              description="Bạn có thể cập nhật số lượng tồn kho cho từng thiết bị. Số lượng mới sẽ thay thế số lượng hiện tại."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
          </Col>
        </Row>
        <Row gutter={16} align="middle">
          <Col span={16}>
            <Form form={form} layout="inline">
              <Form.Item name="item_id" style={{ marginRight: 8 }}>
                <Select
                  placeholder="Tìm kiếm và thêm thiết bị (tùy chọn)"
                  style={{ width: 400 }}
                  showSearch
                  optionFilterProp="children"
                  value={selectedItem ? (selectedItem.id || selectedItem._id) : undefined}
                  onChange={(value) => {
                    if (!value) {
                      setSelectedItem(null);
                      return;
                    }
                    const item = ppeItems.find(i => {
                      const itemId = String(i.id || i._id);
                      const searchId = String(value);
                      return itemId === searchId;
                    });
                    if (item) {
                      setSelectedItem(item);
                    } else {
                      console.warn('Item not found:', value, 'Available items:', ppeItems.map(i => i.id || i._id));
                    }
                  }}
                  allowClear
                  loading={loadingItems}
                  notFoundContent={loadingItems ? 'Đang tải...' : 'Không tìm thấy thiết bị'}
                  filterOption={(input, option) => {
                    const children = option?.children;
                    if (!children) return false;
                    const text = Array.isArray(children) 
                      ? children.map((c: any) => c?.props?.children || c).join(' ')
                      : String(children);
                    return text.toLowerCase().includes(input.toLowerCase());
                  }}
                >
                  {ppeItems.length > 0 ? (
                    ppeItems.map(item => {
                      const itemId = String(item.id || item._id);
                      const itemName = item.item_name || 'N/A';
                      const itemCode = item.item_code || 'N/A';
                      const currentQty = item.remaining_quantity ?? item.quantity_available ?? 0;
                      const isInList = inventoryItems.some(invItem => String(invItem.id) === itemId);
                      
                      return (
                        <Option 
                          key={itemId} 
                          value={itemId}
                          disabled={isInList}
                        >
                          <Space>
                            <SafetyOutlined />
                            <div>
                              <div style={{ fontWeight: 500 }}>
                                {itemName}
                                {isInList && (
                                  <Tag color="green" style={{ marginLeft: 8, fontSize: '10px' }}>
                                    Đã có
                                  </Tag>
                                )}
                              </div>
                              <Text type="secondary" style={{ fontSize: '12px' }}>
                                {itemCode} - Hiện tại: {currentQty}
                              </Text>
                            </div>
                          </Space>
                        </Option>
                      );
                    })
                  ) : (
                    !loadingItems && (
                      <Option disabled value="no-items">
                        <Text type="secondary">Không có thiết bị nào</Text>
                      </Option>
                    )
                  )}
                </Select>
              </Form.Item>
              <Form.Item>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={handleAddItem}
                  disabled={!selectedItem}
                >
                  Thêm thiết bị
                </Button>
              </Form.Item>
            </Form>
          </Col>
        </Row>
      </div>

      {inventoryItems.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <Alert
            message={`Đang hiển thị ${inventoryItems.length} thiết bị`}
            type="success"
            showIcon
          />
        </div>
      )}

      {loadingItems ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>
            <Text type="secondary">Đang tải dữ liệu tồn kho...</Text>
          </div>
        </div>
      ) : inventoryItems.length === 0 ? (
        <div style={{ marginBottom: 16 }}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Không có thiết bị nào để cập nhật"
          />
        </div>
      ) : (
        <Table
          columns={inventoryColumns}
          dataSource={inventoryItems}
          rowKey="id"
          pagination={false}
          size="small"
          style={{ marginBottom: 16 }}
          scroll={{ x: 'max-content' }}
        />
      )}

      <div style={{ textAlign: 'right' }}>
        <Space>
          <Button onClick={onClose}>
            Hủy
          </Button>
          <Button 
            type="primary" 
            onClick={handleSubmit}
            loading={loading}
            disabled={inventoryItems.length === 0}
          >
            Cập nhật tồn kho
          </Button>
        </Space>
      </div>
    </Modal>
  );
};

export default InventoryUpdateModal;
