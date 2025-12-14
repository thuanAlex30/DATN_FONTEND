import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  DatePicker,
  Button,
  Table,
  Space,
  message,
  Row,
  Col,
  Card,
  Typography,
  Alert,
  Spin,
  Tag,
  Select,
  Statistic,
  Tabs
} from 'antd';
import {
  WarningOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
  DeleteOutlined,
  SwapOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import * as ppeService from '../../services/ppeService';
import type { PPEExpiryTracking, ExpiryReport } from '../../services/ppeService';

const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

interface ExpiryManagementModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  ppeItemId?: string;
}

const ExpiryManagementModal: React.FC<ExpiryManagementModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  ppeItemId
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submittingTracking, setSubmittingTracking] = useState(false);
  const [submittingReplace, setSubmittingReplace] = useState(false);
  const [submittingDispose, setSubmittingDispose] = useState(false);
  const [activeTab, setActiveTab] = useState('tracking');
  const [expiryReport, setExpiryReport] = useState<ExpiryReport | null>(null);
  const [expiringItems, setExpiringItems] = useState<PPEExpiryTracking[]>([]);
  const [expiredItems, setExpiredItems] = useState<PPEExpiryTracking[]>([]);
  const [selectedItem, setSelectedItem] = useState<PPEExpiryTracking | null>(null);
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [showDisposeModal, setShowDisposeModal] = useState(false);

  useEffect(() => {
    if (visible) {
      loadExpiryReport();
      if (ppeItemId) {
        loadItemTracking(ppeItemId);
      }
    }
  }, [visible, ppeItemId]);

  const loadExpiryReport = async () => {
    try {
      setLoading(true);
      const report = await ppeService.getExpiryReport({ days: 30 });
      setExpiryReport(report);
      setExpiringItems(report.expiringItems);
      setExpiredItems(report.expiredItems);
    } catch (error) {
      message.error('Lỗi khi tải báo cáo expiry');
    } finally {
      setLoading(false);
    }
  };

  const loadItemTracking = async (itemId: string) => {
    try {
      const tracking = await ppeService.autoCreateExpiryTracking(itemId);
      message.success(`Created ${tracking.length} tracking records`);
    } catch (error) {
      message.error('Lỗi khi tạo tracking records');
    }
  };

  const handleCreateTracking = async () => {
    setSubmittingTracking(true);
    try {
      const values = await form.validateFields();
      await ppeService.createExpiryTracking({
        ppe_item_id: values.ppe_item_id,
        expiry_date: values.expiry_date.format('YYYY-MM-DD'),
        manufacturing_date: values.manufacturing_date.format('YYYY-MM-DD'),
        batch_number: values.batch_number,
        serial_number: values.serial_number
      });
      message.success('Tracking record created successfully');
      form.resetFields();
      loadExpiryReport();
    } catch (error: any) {
      message.error(error.message || 'Lỗi khi tạo tracking record');
    } finally {
      setSubmittingTracking(false);
    }
  };

  const handleCheckNotifications = async () => {
    try {
      setLoading(true);
      const result = await ppeService.checkExpiryNotifications(30);
      message.success(`Sent ${result.length} notifications`);
    } catch (error) {
      message.error('Lỗi khi gửi thông báo');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkExpired = async (trackingId: string) => {
    try {
      await ppeService.markPPEAsExpired(trackingId, { reason: 'expired' });
      message.success('PPE marked as expired');
      loadExpiryReport();
    } catch (error: any) {
      message.error(error.message || 'Lỗi khi đánh dấu hết hạn');
    }
  };

  const handleReplace = async (values: any) => {
    if (!selectedItem) return;
    setSubmittingReplace(true);
    try {
      await ppeService.replaceExpiredPPE(selectedItem.id, {
        replacement_item_id: values.replacement_item_id,
        expiry_date: values.expiry_date.format('YYYY-MM-DD'),
        manufacturing_date: values.manufacturing_date.format('YYYY-MM-DD'),
        batch_number: values.batch_number,
        serial_number: values.serial_number,
        replacement_reason: values.replacement_reason
      });
      message.success('PPE replaced successfully');
      setShowReplaceModal(false);
      setSelectedItem(null);
      loadExpiryReport();
    } catch (error: any) {
      message.error(error.message || 'Lỗi khi thay thế PPE');
    } finally {
      setSubmittingReplace(false);
    }
  };

  const handleDispose = async (values: any) => {
    if (!selectedItem) return;
    setSubmittingDispose(true);
    try {
      await ppeService.disposeExpiredPPE(selectedItem.id, {
        disposal_method: values.disposal_method,
        disposal_certificate: values.disposal_certificate
      });
      message.success('PPE disposed successfully');
      setShowDisposeModal(false);
      setSelectedItem(null);
      loadExpiryReport();
    } catch (error: any) {
      message.error(error.message || 'Lỗi khi xử lý PPE');
    } finally {
      setSubmittingDispose(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'expiring_soon': return 'orange';
      case 'expired': return 'red';
      case 'replaced': return 'blue';
      case 'disposed': return 'gray';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircleOutlined />;
      case 'expiring_soon': return <WarningOutlined />;
      case 'expired': return <ExclamationCircleOutlined />;
      case 'replaced': return <SwapOutlined />;
      case 'disposed': return <DeleteOutlined />;
      default: return <InfoCircleOutlined />;
    }
  };

  const expiringColumns = [
    {
      title: 'PPE Item',
      dataIndex: 'ppe_item_id',
      key: 'ppe_item_id',
      render: (itemId: string) => itemId
    },
    {
      title: 'Batch Number',
      dataIndex: 'batch_number',
      key: 'batch_number'
    },
    {
      title: 'Serial Number',
      dataIndex: 'serial_number',
      key: 'serial_number'
    },
    {
      title: 'Expiry Date',
      dataIndex: 'expiry_date',
      key: 'expiry_date',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY')
    },
    {
      title: 'Days Until Expiry',
      dataIndex: 'days_until_expiry',
      key: 'days_until_expiry',
      render: (days: number) => (
        <Tag color={days <= 7 ? 'red' : days <= 30 ? 'orange' : 'green'}>
          {days} days
        </Tag>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
          {status.replace('_', ' ').toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: PPEExpiryTracking) => (
        <Space>
          <Button
            type="link"
            size="small"
            onClick={() => {
              setSelectedItem(record);
              setShowReplaceModal(true);
            }}
          >
            Replace
          </Button>
          <Button
            type="link"
            size="small"
            danger
            onClick={() => {
              setSelectedItem(record);
              setShowDisposeModal(true);
            }}
          >
            Dispose
          </Button>
        </Space>
      )
    }
  ];

  const expiredColumns = [
    ...expiringColumns,
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: PPEExpiryTracking) => (
        <Space>
          <Button
            type="link"
            size="small"
            onClick={() => {
              setSelectedItem(record);
              setShowReplaceModal(true);
            }}
          >
            Replace
          </Button>
          <Button
            type="link"
            size="small"
            danger
            onClick={() => {
              setSelectedItem(record);
              setShowDisposeModal(true);
            }}
          >
            Dispose
          </Button>
        </Space>
      )
    }
  ];

  return (
    <Modal
      title="PPE Expiry Management"
      open={visible}
      onCancel={onCancel}
      width={1400}
      footer={null}
      destroyOnClose
    >
      <Spin spinning={loading}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          {/* Summary Tab */}
          <TabPane tab="Summary" key="summary">
            {expiryReport && (
              <Row gutter={[16, 16]}>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title="Total Items"
                      value={expiryReport.summary.totalItems}
                      prefix={<InfoCircleOutlined />}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title="Expiring Soon"
                      value={expiryReport.summary.totalExpiring}
                      prefix={<WarningOutlined />}
                      valueStyle={{ color: '#faad14' }}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title="Expired"
                      value={expiryReport.summary.totalExpired}
                      prefix={<ExclamationCircleOutlined />}
                      valueStyle={{ color: '#ff4d4f' }}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <Button
                      type="primary"
                      icon={<ReloadOutlined />}
                      onClick={handleCheckNotifications}
                      loading={loading}
                      style={{ width: '100%' }}
                    >
                      Check Notifications
                    </Button>
                  </Card>
                </Col>
              </Row>
            )}
          </TabPane>

          {/* Create Tracking Tab */}
          <TabPane tab="Create Tracking" key="tracking">
            <Card title="Create New Tracking Record">
              <Form form={form} layout="vertical" onFinish={handleCreateTracking}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="ppe_item_id"
                      label="PPE Item ID"
                      rules={[{ required: true, message: 'Vui lòng nhập PPE Item ID' }]}
                    >
                      <Input placeholder="Enter PPE Item ID" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="batch_number"
                      label="Batch Number"
                      rules={[{ required: true, message: 'Vui lòng nhập batch number' }]}
                    >
                      <Input placeholder="Enter batch number" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="serial_number"
                      label="Serial Number"
                      rules={[{ required: true, message: 'Vui lòng nhập serial number' }]}
                    >
                      <Input placeholder="Enter serial number" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="manufacturing_date"
                      label="Manufacturing Date"
                      rules={[{ required: true, message: 'Vui lòng chọn manufacturing date' }]}
                    >
                      <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="expiry_date"
                      label="Expiry Date"
                      rules={[{ required: true, message: 'Vui lòng chọn expiry date' }]}
                    >
                      <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label=" ">
                      <Button type="primary" htmlType="submit" loading={submittingTracking}>
                        Create Tracking
                      </Button>
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </Card>
          </TabPane>

          {/* Expiring Items Tab */}
          <TabPane tab="Expiring Items" key="expiring">
            <Table
              dataSource={expiringItems}
              columns={expiringColumns}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>

          {/* Expired Items Tab */}
          <TabPane tab="Expired Items" key="expired">
            <Table
              dataSource={expiredItems}
              columns={expiredColumns}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
        </Tabs>

        {/* Replace Modal */}
        <Modal
          title="Replace PPE"
          open={showReplaceModal}
          onCancel={() => setShowReplaceModal(false)}
          footer={null}
        >
          <Form onFinish={handleReplace}>
            <Form.Item
              name="replacement_item_id"
              label="Replacement Item ID"
              rules={[{ required: true, message: 'Vui lòng nhập replacement item ID' }]}
            >
              <Input placeholder="Enter replacement item ID" />
            </Form.Item>
            <Form.Item
              name="expiry_date"
              label="New Expiry Date"
              rules={[{ required: true, message: 'Vui lòng chọn expiry date' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              name="manufacturing_date"
              label="Manufacturing Date"
              rules={[{ required: true, message: 'Vui lòng chọn manufacturing date' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              name="batch_number"
              label="Batch Number"
              rules={[{ required: true, message: 'Vui lòng nhập batch number' }]}
            >
              <Input placeholder="Enter batch number" />
            </Form.Item>
            <Form.Item
              name="serial_number"
              label="Serial Number"
              rules={[{ required: true, message: 'Vui lòng nhập serial number' }]}
            >
              <Input placeholder="Enter serial number" />
            </Form.Item>
            <Form.Item
              name="replacement_reason"
              label="Replacement Reason"
              rules={[{ required: true, message: 'Vui lòng nhập replacement reason' }]}
            >
              <TextArea placeholder="Enter replacement reason" />
            </Form.Item>
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={submittingReplace}>
                  Replace PPE
                </Button>
                <Button onClick={() => setShowReplaceModal(false)} disabled={submittingReplace}>
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* Dispose Modal */}
        <Modal
          title="Dispose PPE"
          open={showDisposeModal}
          onCancel={() => setShowDisposeModal(false)}
          footer={null}
        >
          <Form onFinish={handleDispose}>
            <Form.Item
              name="disposal_method"
              label="Disposal Method"
              rules={[{ required: true, message: 'Vui lòng chọn disposal method' }]}
            >
              <Select placeholder="Select disposal method">
                <Option value="recycled">Recycled</Option>
                <Option value="destroyed">Destroyed</Option>
                <Option value="donated">Donated</Option>
                <Option value="returned_to_supplier">Returned to Supplier</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="disposal_certificate"
              label="Disposal Certificate"
            >
              <Input placeholder="Enter disposal certificate number" />
            </Form.Item>
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" danger loading={submittingDispose}>
                  Dispose PPE
                </Button>
                <Button onClick={() => setShowDisposeModal(false)} disabled={submittingDispose}>
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </Spin>
    </Modal>
  );
};

export default ExpiryManagementModal;
