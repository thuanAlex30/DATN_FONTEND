import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Button,
  Table,
  Space,
  message,
  Row,
  Col,
  Card,
  Typography,
  Divider,
  Alert,
  Spin,
  Tag,
  Tooltip,
  Select,
  InputNumber,
  Progress
} from 'antd';
import {
  LockOutlined,
  InfoCircleOutlined,
  SyncOutlined
} from '@ant-design/icons';
import * as ppeService from '../../services/ppeService';
import type { PPEItemWithVersion } from '../../services/ppeService';

const { Text } = Typography;
const { Option } = Select;

interface OptimisticLockingModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  itemId?: string;
}

interface UpdateOperation {
  itemId: string;
  operation: 'allocate' | 'deallocate' | 'update';
  quantity: number;
  version: number;
}

const OptimisticLockingModal: React.FC<OptimisticLockingModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  itemId
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [item, setItem] = useState<PPEItemWithVersion | null>(null);
  const [updates, setUpdates] = useState<UpdateOperation[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const [maxRetries] = useState(3);

  useEffect(() => {
    if (visible && itemId) {
      loadItemWithVersion();
    }
  }, [visible, itemId]);

  const loadItemWithVersion = async () => {
    if (!itemId) return;
    try {
      setLoading(true);
      const itemData = await ppeService.getPPEItemWithVersion(itemId);
      setItem(itemData);
      form.setFieldsValue({
        quantity: itemData.quantity_available,
        version: itemData.version
      });
    } catch (error) {
      message.error('Lỗi khi tải thông tin item');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async () => {
    if (!item) return;
    try {
      const values = await form.validateFields();
      setLoading(true);
      setRetryCount(0);

      const updateData = {
        quantity: values.quantity,
        operation: values.operation,
        version: values.version
      };

      const updatedItem = await ppeService.updatePPEItemQuantityWithLocking(item.id, updateData);
      setItem(updatedItem);
      message.success('Cập nhật thành công');
      onSuccess();
    } catch (error: any) {
      if (error.message?.includes('concurrent modifications')) {
        handleRetry();
      } else {
        message.error(error.message || 'Lỗi khi cập nhật');
        setLoading(false);
      }
    }
  };

  const handleRetry = async () => {
    if (retryCount >= maxRetries) {
      message.error('Đã vượt quá số lần thử lại tối đa');
      setLoading(false);
      return;
    }

    setRetryCount(prev => prev + 1);
    message.warning(`Thử lại lần ${retryCount + 1}/${maxRetries}...`);

    // Wait before retry with exponential backoff
    const delay = Math.pow(2, retryCount) * 100;
    setTimeout(async () => {
      try {
        await loadItemWithVersion();
        // Auto-retry the update
        const values = form.getFieldsValue();
        const updateData = {
          quantity: values.quantity,
          operation: values.operation,
          version: item?.version || 0
        };
        const updatedItem = await ppeService.updatePPEItemQuantityWithLocking(item!.id, updateData);
        setItem(updatedItem);
        message.success('Cập nhật thành công sau khi thử lại');
        onSuccess();
      } catch (error: any) {
        if (error.message?.includes('concurrent modifications')) {
          handleRetry();
        } else {
          message.error(error.message || 'Lỗi khi cập nhật');
          setLoading(false);
        }
      }
    }, delay);
  };

  const handleBatchUpdate = async () => {
    if (updates.length === 0) {
      message.error('Vui lòng thêm ít nhất một update');
      return;
    }

    try {
      setLoading(true);
      const batchData = {
        updates: updates.map(update => ({
          itemId: update.itemId,
          updateData: {
            $inc: { quantity_available: update.operation === 'allocate' ? -update.quantity : update.quantity }
          }
        })),
        options: {
          maxRetries: 3,
          retryDelay: 100
        }
      };

      await ppeService.batchUpdatePPEItems(batchData);
      message.success('Batch update thành công');
      onSuccess();
    } catch (error: any) {
      message.error(error.message || 'Lỗi khi batch update');
    } finally {
      setLoading(false);
    }
  };

  const addUpdate = () => {
    const newUpdate: UpdateOperation = {
      itemId: item?.id || '',
      operation: 'allocate',
      quantity: 1,
      version: item?.version || 0
    };
    setUpdates([...updates, newUpdate]);
  };

  const removeUpdate = (index: number) => {
    const newUpdates = updates.filter((_, i) => i !== index);
    setUpdates(newUpdates);
  };

  const updateUpdate = (index: number, field: keyof UpdateOperation, value: any) => {
    const newUpdates = [...updates];
    newUpdates[index] = { ...newUpdates[index], [field]: value };
    setUpdates(newUpdates);
  };


  const updateColumns = [
    {
      title: 'Item ID',
      dataIndex: 'itemId',
      key: 'itemId',
      render: (itemId: string) => itemId
    },
    {
      title: 'Operation',
      dataIndex: 'operation',
      key: 'operation',
      render: (operation: string, _: any, index: number) => (
        <Select
          value={operation}
          onChange={(value) => updateUpdate(index, 'operation', value)}
          style={{ width: 120 }}
        >
          <Option value="allocate">Allocate</Option>
          <Option value="deallocate">Deallocate</Option>
          <Option value="update">Update</Option>
        </Select>
      )
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity: number, _: any, index: number) => (
        <InputNumber
          value={quantity}
          onChange={(value) => updateUpdate(index, 'quantity', value || 0)}
          min={1}
          style={{ width: 100 }}
        />
      )
    },
    {
      title: 'Version',
      dataIndex: 'version',
      key: 'version',
      render: (version: number) => (
        <Tag color="blue">{version}</Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, __: any, index: number) => (
        <Button
          type="text"
          danger
          onClick={() => removeUpdate(index)}
        >
          Remove
        </Button>
      )
    }
  ];

  return (
    <Modal
      title="Optimistic Locking - PPE Item Update"
      open={visible}
      onCancel={onCancel}
      width={800}
      footer={null}
      destroyOnClose
    >
      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          {/* Item Information */}
          {item && (
            <Col span={24}>
              <Card title="Item Information" size="small">
                <Row gutter={16}>
                  <Col span={8}>
                    <Text strong>Item Name:</Text> {item.item_name}
                  </Col>
                  <Col span={8}>
                    <Text strong>Current Quantity:</Text> {item.quantity_available}
                  </Col>
                  <Col span={8}>
                    <Text strong>Version:</Text> 
                    <Tag color="blue" style={{ marginLeft: 8 }}>
                      {item.version}
                    </Tag>
                  </Col>
                </Row>
                {retryCount > 0 && (
                  <Alert
                    message={`Retry ${retryCount}/${maxRetries}`}
                    description="Đang thử lại do conflict version..."
                    type="warning"
                    icon={<SyncOutlined spin />}
                    style={{ marginTop: 16 }}
                  />
                )}
              </Card>
            </Col>
          )}

          {/* Single Update */}
          <Col span={24}>
            <Card title="Single Item Update" size="small">
              <Form form={form} layout="vertical">
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item
                      name="operation"
                      label="Operation"
                      rules={[{ required: true, message: 'Vui lòng chọn operation' }]}
                      initialValue="allocate"
                    >
                      <Select>
                        <Option value="allocate">Allocate</Option>
                        <Option value="deallocate">Deallocate</Option>
                        <Option value="update">Update</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="quantity"
                      label="Quantity"
                      rules={[{ required: true, message: 'Vui lòng nhập quantity' }]}
                    >
                      <InputNumber min={1} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label=" ">
                      <Button
                        type="primary"
                        onClick={handleUpdateQuantity}
                        loading={loading}
                        icon={<LockOutlined />}
                      >
                        Update with Locking
                      </Button>
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </Card>
          </Col>

          {/* Batch Update */}
          <Col span={24}>
            <Card 
              title="Batch Update" 
              size="small"
              extra={
                      <Button
                        type="dashed"
                        onClick={addUpdate}
                      >
                        Add Update
                      </Button>
              }
            >
              <Table
                dataSource={updates}
                columns={updateColumns}
                pagination={false}
                size="small"
                rowKey={(_, index) => index?.toString() || ''}
                locale={{ emptyText: 'No updates added' }}
              />
              {updates.length > 0 && (
                <div style={{ marginTop: 16, textAlign: 'right' }}>
                  <Button
                    type="primary"
                    onClick={handleBatchUpdate}
                    loading={loading}
                    icon={<SyncOutlined />}
                  >
                    Execute Batch Update
                  </Button>
                </div>
              )}
            </Card>
          </Col>

          {/* Information */}
          <Col span={24}>
            <Alert
              message="Optimistic Locking Information"
              description={
                <div>
                  <p>• Optimistic locking prevents concurrent modification conflicts</p>
                  <p>• Each update includes a version number that must match the current version</p>
                  <p>• If version conflicts occur, the system will automatically retry with exponential backoff</p>
                  <p>• Maximum retries: {maxRetries} times</p>
                </div>
              }
              type="info"
              icon={<InfoCircleOutlined />}
            />
          </Col>
        </Row>
      </Spin>
    </Modal>
  );
};

export default OptimisticLockingModal;
