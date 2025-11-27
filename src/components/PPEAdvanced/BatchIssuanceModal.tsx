import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
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
  Progress,
  Tag,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import * as ppeService from '../../services/ppeService';
import userService from '../../services/userService';
import type { BatchIssuance } from '../../services/ppeService';

const { Text } = Typography;
const { Option } = Select;

interface BatchIssuanceModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  issuanceLevel: 'admin' | 'manager';
  managerId?: string;
}

interface BatchItemFormData {
  user_id: string;
  item_id: string;
  quantity: number;
  expected_return_date: string;
}

const BatchIssuanceModal: React.FC<BatchIssuanceModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  issuanceLevel,
  managerId
}) => {
  const [form] = Form.useForm();
  const [batchItemsForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [batchItems, setBatchItems] = useState<BatchItemFormData[]>([]);
  const [ppeItems, setPpeItems] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [currentBatch, setCurrentBatch] = useState<BatchIssuance | null>(null);
  const [processingStatus, setProcessingStatus] = useState<any>(null);

  // Load data
  useEffect(() => {
    if (visible) {
      loadData();
    }
  }, [visible, managerId]);

  // Poll processing status
  useEffect(() => {
    let interval: any;
    if (currentBatch && currentBatch.status === 'processing') {
      interval = setInterval(() => {
        checkProcessingStatus();
      }, 2000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentBatch]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [itemsData, usersData] = await Promise.all([
        ppeService.getPPEItems(),
        userService.getAllUsers()
      ]);
      setPpeItems(itemsData);
      setUsers(usersData);
    } catch (error) {
      message.error('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const checkProcessingStatus = async () => {
    if (!currentBatch) return;
    try {
      const status = await ppeService.getBatchProcessingStatus(currentBatch.id);
      setProcessingStatus(status);
      if (status.status === 'completed' || status.status === 'failed') {
        setProcessing(false);
        message.success('Batch processing completed');
        onSuccess();
      }
    } catch (error) {
      console.error('Error checking processing status:', error);
    }
  };

  const handleAddItem = () => {
    batchItemsForm.validateFields().then((values) => {
      const newItem: BatchItemFormData = {
        user_id: values.user_id,
        item_id: values.item_id,
        quantity: values.quantity,
        expected_return_date: values.expected_return_date.format('YYYY-MM-DD')
      };
      setBatchItems([...batchItems, newItem]);
      batchItemsForm.resetFields();
    });
  };

  const handleRemoveItem = (index: number) => {
    const newItems = batchItems.filter((_, i) => i !== index);
    setBatchItems(newItems);
  };

  const handleCreateBatch = async () => {
    try {
      const values = await form.validateFields();
      if (batchItems.length === 0) {
        message.error('Vui lòng thêm ít nhất một item');
        return;
      }

      setLoading(true);
      const batchData = {
        batch_name: values.batch_name,
        issuance_level: issuanceLevel,
        manager_id: managerId,
        items: batchItems
      };

      const batch = await ppeService.createBatchIssuance(batchData);
      setCurrentBatch(batch);
      message.success('Batch đã được tạo thành công');
    } catch (error: any) {
      message.error(error.message || 'Lỗi khi tạo batch');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessBatch = async () => {
    if (!currentBatch) return;
    try {
      setProcessing(true);
      await ppeService.processBatchIssuance(currentBatch.id, {
        maxConcurrentItems: 10
      });
      message.success('Bắt đầu xử lý batch');
    } catch (error: any) {
      message.error(error.message || 'Lỗi khi xử lý batch');
      setProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'default';
      case 'processing': return 'processing';
      case 'completed': return 'success';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <ExclamationCircleOutlined />;
      case 'processing': return <ReloadOutlined spin />;
      case 'completed': return <CheckCircleOutlined />;
      case 'failed': return <ExclamationCircleOutlined />;
      default: return <InfoCircleOutlined />;
    }
  };

  const columns = [
    {
      title: 'User',
      dataIndex: 'user_id',
      key: 'user_id',
      render: (userId: string) => {
        const user = users.find(u => u.id === userId);
        return user ? user.full_name : userId;
      }
    },
    {
      title: 'PPE Item',
      dataIndex: 'item_id',
      key: 'item_id',
      render: (itemId: string) => {
        const item = ppeItems.find(i => i.id === itemId);
        return item ? item.item_name : itemId;
      }
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity'
    },
    {
      title: 'Expected Return',
      dataIndex: 'expected_return_date',
      key: 'expected_return_date'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, __: any, index: number) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveItem(index)}
        />
      )
    }
  ];

  return (
    <Modal
      title="Batch PPE Issuance"
      open={visible}
      onCancel={onCancel}
      width={1200}
      footer={null}
      destroyOnClose
    >
      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          {/* Batch Information */}
          <Col span={24}>
            <Card title="Batch Information" size="small">
              <Form form={form} layout="vertical">
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="batch_name"
                      label="Batch Name"
                      rules={[{ required: true, message: 'Vui lòng nhập tên batch' }]}
                    >
                      <Input placeholder="Enter batch name" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Issuance Level">
                      <Input value={issuanceLevel} disabled />
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </Card>
          </Col>

          {/* Add Items */}
          <Col span={24}>
            <Card title="Add Items" size="small">
              <Form form={batchItemsForm} layout="vertical">
                <Row gutter={16}>
                  <Col span={6}>
                    <Form.Item
                      name="user_id"
                      label="User"
                      rules={[{ required: true, message: 'Vui lòng chọn user' }]}
                    >
                      <Select placeholder="Select user" showSearch>
                        {users.map(user => (
                          <Option key={user.id} value={user.id}>
                            {user.full_name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item
                      name="item_id"
                      label="PPE Item"
                      rules={[{ required: true, message: 'Vui lòng chọn PPE item' }]}
                    >
                      <Select placeholder="Select PPE item" showSearch>
                        {ppeItems.map(item => (
                          <Option key={item.id} value={item.id}>
                            {item.item_name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={4}>
                    <Form.Item
                      name="quantity"
                      label="Quantity"
                      rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
                    >
                      <Input type="number" min={1} />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item
                      name="expected_return_date"
                      label="Expected Return Date"
                      rules={[{ required: true, message: 'Vui lòng chọn ngày trả' }]}
                    >
                      <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={2}>
                    <Form.Item label=" ">
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAddItem}
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </Card>
          </Col>

          {/* Batch Items Table */}
          <Col span={24}>
            <Card title={`Batch Items (${batchItems.length})`} size="small">
              <Table
                dataSource={batchItems}
                columns={columns}
                pagination={false}
                size="small"
                rowKey={(_, index) => index?.toString() || ''}
              />
            </Card>
          </Col>

          {/* Current Batch Status */}
          {currentBatch && (
            <Col span={24}>
              <Card title="Batch Status" size="small">
                <Row gutter={16}>
                  <Col span={8}>
                    <Space>
                      <Text strong>Status:</Text>
                      <Tag color={getStatusColor(currentBatch.status)} icon={getStatusIcon(currentBatch.status)}>
                        {currentBatch.status.toUpperCase()}
                      </Tag>
                    </Space>
                  </Col>
                  <Col span={8}>
                    <Text strong>Batch ID:</Text> {currentBatch.batch_id}
                  </Col>
                  <Col span={8}>
                    <Text strong>Created:</Text> {dayjs(currentBatch.created_at).format('DD/MM/YYYY HH:mm')}
                  </Col>
                </Row>

                {processingStatus && (
                  <>
                    <Divider />
                    <Row gutter={16}>
                      <Col span={24}>
                        <Text strong>Progress:</Text>
                        <Progress
                          percent={processingStatus.progress?.percentage || 0}
                          status={currentBatch.status === 'failed' ? 'exception' : 'active'}
                        />
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={6}>
                        <Text>Total: {processingStatus.progress?.totalItems || 0}</Text>
                      </Col>
                      <Col span={6}>
                        <Text>Processed: {processingStatus.progress?.processedItems || 0}</Text>
                      </Col>
                      <Col span={6}>
                        <Text>Successful: {processingStatus.progress?.successfulItems || 0}</Text>
                      </Col>
                      <Col span={6}>
                        <Text>Failed: {processingStatus.progress?.failedItems || 0}</Text>
                      </Col>
                    </Row>
                    {processingStatus.errorSummary && (
                      <Alert
                        message="Error Summary"
                        description={processingStatus.errorSummary}
                        type="error"
                        style={{ marginTop: 16 }}
                      />
                    )}
                  </>
                )}
              </Card>
            </Col>
          )}

          {/* Actions */}
          <Col span={24}>
            <Space>
              {!currentBatch ? (
                <Button
                  type="primary"
                  onClick={handleCreateBatch}
                  loading={loading}
                  disabled={batchItems.length === 0}
                >
                  Create Batch
                </Button>
              ) : (
                <>
                  {currentBatch.status === 'pending' && (
                    <Button
                      type="primary"
                      icon={<PlayCircleOutlined />}
                      onClick={handleProcessBatch}
                      loading={processing}
                    >
                      Process Batch
                    </Button>
                  )}
                  {currentBatch.status === 'processing' && (
                    <Button
                      icon={<PauseCircleOutlined />}
                      onClick={() => setProcessing(false)}
                    >
                      Stop Processing
                    </Button>
                  )}
                </>
              )}
              <Button onClick={onCancel}>Cancel</Button>
            </Space>
          </Col>
        </Row>
      </Spin>
    </Modal>
  );
};

export default BatchIssuanceModal;
