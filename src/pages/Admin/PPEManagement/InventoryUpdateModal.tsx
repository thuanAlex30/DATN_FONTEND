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
  Tag
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
  const [ppeItems, setPpeItems] = useState<any[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      loadPPEItems();
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

  const handleAddItem = () => {
    if (!selectedItem) {
      message.warning('Vui lòng chọn thiết bị');
      return;
    }

    const existingItem = inventoryItems.find(item => item.id === selectedItem.id);
    if (existingItem) {
      message.warning('Thiết bị này đã được thêm vào danh sách');
      return;
    }

    const newItem: InventoryItem = {
      id: selectedItem.id,
      item_name: selectedItem.item_name,
      item_code: selectedItem.item_code,
      current_quantity: selectedItem.quantity_available || 0,
      new_quantity: selectedItem.quantity_available || 0,
      allocated_quantity: selectedItem.quantity_allocated || 0,
      reorder_level: selectedItem.reorder_level || 0
    };

    setInventoryItems([...inventoryItems, newItem]);
    setSelectedItem(null);
    form.resetFields(['item_id']);
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
          <Col span={16}>
            <Form form={form} layout="inline">
              <Form.Item name="item_id" style={{ marginRight: 8 }}>
                <Select
                  placeholder="Chọn thiết bị để thêm"
                  style={{ width: 300 }}
                  showSearch
                  optionFilterProp="children"
                  value={selectedItem?.id}
                  onChange={(value) => {
                    const item = ppeItems.find(i => i.id === value);
                    setSelectedItem(item);
                  }}
                >
                  {ppeItems.map(item => (
                    <Option key={item.id} value={item.id}>
                      <Space>
                        <SafetyOutlined />
                        <div>
                          <div>{item.item_name}</div>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            {item.item_code} - Hiện tại: {item.quantity_available || 0}
                          </Text>
                        </div>
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={handleAddItem}
                  disabled={!selectedItem}
                >
                  Thêm
                </Button>
              </Form.Item>
            </Form>
          </Col>
        </Row>
      </div>

      {inventoryItems.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <Alert
            message={`Đã chọn ${inventoryItems.length} thiết bị để cập nhật`}
            type="info"
          />
        </div>
      )}

      <Table
        columns={inventoryColumns}
        dataSource={inventoryItems}
        rowKey="id"
        pagination={false}
        size="small"
        style={{ marginBottom: 16 }}
      />

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
