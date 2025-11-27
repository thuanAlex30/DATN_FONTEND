import React, { useState, useEffect } from 'react';
import {
  Modal,
  Table,
  Tag,
  Space,
  Typography,
  Descriptions,
  Timeline,
  Card,
  Row,
  Col,
  Statistic,
  Empty,
  Spin,
  message,
  Button
} from 'antd';
import {
  HistoryOutlined,
  SafetyOutlined,
  UserOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import type { PPEIssuance } from '../../../services/ppeService';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface PPEAssignmentHistoryModalProps {
  visible: boolean;
  onCancel: () => void;
  issuance: PPEIssuance | null;
}

interface PPEHistory {
  id: string;
  action: string;
  action_date: string;
  performed_by: {
    id: string;
    full_name: string;
    email: string;
  };
  details: any;
  notes?: string;
}

const PPEAssignmentHistoryModal: React.FC<PPEAssignmentHistoryModalProps> = ({
  visible,
  onCancel,
  issuance
}) => {
  const [history, setHistory] = useState<PPEHistory[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && issuance) {
      loadHistory();
    }
  }, [visible, issuance]);

  const loadHistory = async () => {
    if (!issuance) return;

    setLoading(true);
    try {
      // Mock data for now - replace with actual API call
      const mockHistory: PPEHistory[] = [
        {
          id: '1',
          action: 'issued',
          action_date: issuance.issued_date,
          performed_by: {
            id: 'admin-1',
            full_name: 'Admin User',
            email: 'admin@company.com'
          },
          details: {
            quantity: issuance.quantity,
            expected_return_date: issuance.expected_return_date
          },
          notes: 'Phát PPE cho Manager'
        },
        {
          id: '2',
          action: 'distributed',
          action_date: dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
          performed_by: {
            id: typeof issuance.user_id === 'object' && issuance.user_id ? issuance.user_id.id : 'manager-1',
            full_name: typeof issuance.user_id === 'object' && issuance.user_id ? issuance.user_id.full_name : 'Manager',
            email: typeof issuance.user_id === 'object' && issuance.user_id ? issuance.user_id.email : 'manager@company.com'
          },
          details: {
            distributed_to: 'Employee',
            quantity: issuance.quantity
          },
          notes: 'Phát PPE cho nhân viên'
        }
      ];

      // Thêm lịch sử trả PPE (toàn bộ hoặc một phần)
      if (issuance.status === 'returned' && issuance.actual_return_date) {
        mockHistory.push({
          id: '3',
          action: 'returned',
          action_date: issuance.actual_return_date,
          performed_by: {
            id: typeof issuance.user_id === 'object' && issuance.user_id ? issuance.user_id.id : 'employee-1',
            full_name: typeof issuance.user_id === 'object' && issuance.user_id ? issuance.user_id.full_name : 'Employee',
            email: typeof issuance.user_id === 'object' && issuance.user_id ? issuance.user_id.email : 'employee@company.com'
          },
          details: {
            return_condition: issuance.return_condition,
            actual_return_date: issuance.actual_return_date,
            quantity_returned: issuance.quantity
          },
          notes: issuance.return_notes || 'Trả PPE'
        });
      } else if (issuance.remaining_quantity !== undefined && issuance.remaining_quantity < issuance.quantity) {
        // Partial return - thêm lịch sử trả một phần
        const returnedQuantity = issuance.quantity - issuance.remaining_quantity;
        mockHistory.push({
          id: '3',
          action: 'partial_return',
          action_date: issuance.actual_return_date || dayjs().format('YYYY-MM-DD'),
          performed_by: {
            id: typeof issuance.user_id === 'object' && issuance.user_id ? issuance.user_id.id : 'manager-1',
            full_name: typeof issuance.user_id === 'object' && issuance.user_id ? issuance.user_id.full_name : 'Manager',
            email: typeof issuance.user_id === 'object' && issuance.user_id ? issuance.user_id.email : 'manager@company.com'
          },
          details: {
            return_condition: issuance.return_condition || 'good',
            actual_return_date: issuance.actual_return_date || dayjs().format('YYYY-MM-DD'),
            quantity_returned: returnedQuantity,
            quantity_remaining: issuance.remaining_quantity
          },
          notes: issuance.return_notes || `Trả một phần: ${returnedQuantity}/${issuance.quantity}`
        });
      }

      setHistory(mockHistory);
    } catch (error) {
      console.error('Error loading PPE history:', error);
      message.error('Không thể tải lịch sử PPE');
    } finally {
      setLoading(false);
    }
  };

  const getActionLabel = (action: string) => {
    const labels: { [key: string]: string } = {
      'issued': 'Phát PPE',
      'distributed': 'Phân phối',
      'returned': 'Trả PPE',
      'partial_return': 'Trả một phần',
      'reported': 'Báo cáo sự cố',
      'replaced': 'Thay thế'
    };
    return labels[action] || action;
  };

  const getActionColor = (action: string) => {
    const colors: { [key: string]: string } = {
      'issued': 'blue',
      'distributed': 'green',
      'returned': 'orange',
      'partial_return': 'gold',
      'reported': 'red',
      'replaced': 'purple'
    };
    return colors[action] || 'default';
  };

  const getActionIcon = (action: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      'issued': <SafetyOutlined />,
      'distributed': <UserOutlined />,
      'returned': <CheckCircleOutlined />,
      'partial_return': <ExclamationCircleOutlined />,
      'reported': <ExclamationCircleOutlined />,
      'replaced': <SafetyOutlined />
    };
    return icons[action] || <InfoCircleOutlined />;
  };

  const historyColumns = [
    {
      title: 'Hành động',
      dataIndex: 'action',
      key: 'action',
      render: (action: string) => (
        <Tag color={getActionColor(action)} icon={getActionIcon(action)}>
          {getActionLabel(action)}
        </Tag>
      )
    },
    {
      title: 'Ngày thực hiện',
      dataIndex: 'action_date',
      key: 'action_date',
      render: (date: string) => (
        <Space>
          <CalendarOutlined />
          {dayjs(date).format('DD/MM/YYYY HH:mm')}
        </Space>
      )
    },
    {
      title: 'Người thực hiện',
      dataIndex: 'performed_by',
      key: 'performed_by',
      render: (performedBy: PPEHistory['performed_by']) => (
        <Space>
          <UserOutlined />
          <div>
            <div style={{ fontWeight: 'bold' }}>{performedBy.full_name}</div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {performedBy.email}
            </Text>
          </div>
        </Space>
      )
    },
    {
      title: 'Chi tiết',
      key: 'details',
      render: (record: PPEHistory) => (
        <div>
          {record.action === 'issued' && (
            <div>
              <Text>Số lượng: {record.details.quantity}</Text>
              <br />
              <Text>Hạn trả: {dayjs(record.details.expected_return_date).format('DD/MM/YYYY')}</Text>
            </div>
          )}
          {record.action === 'distributed' && (
            <div>
              <Text>Phân phối cho: {record.details.distributed_to}</Text>
              <br />
              <Text>Số lượng: {record.details.quantity}</Text>
            </div>
          )}
          {record.action === 'returned' && (
            <div>
              <Text>Tình trạng: {record.details.return_condition}</Text>
              <br />
              <Text>Ngày trả: {dayjs(record.details.actual_return_date).format('DD/MM/YYYY')}</Text>
              <br />
              <Text>Số lượng trả: {record.details.quantity_returned}</Text>
            </div>
          )}
          {record.action === 'partial_return' && (
            <div>
              <Text>Tình trạng: {record.details.return_condition}</Text>
              <br />
              <Text>Ngày trả: {dayjs(record.details.actual_return_date).format('DD/MM/YYYY')}</Text>
              <br />
              <Text>Số lượng trả: {record.details.quantity_returned}</Text>
              <br />
              <Text>Còn lại: {record.details.quantity_remaining}</Text>
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Ghi chú',
      dataIndex: 'notes',
      key: 'notes',
      render: (notes: string) => notes || '-'
    }
  ];

  if (!issuance) return null;

  const item = typeof issuance.item_id === 'object' && issuance.item_id ? issuance.item_id : null;

  return (
    <Modal
      title={
        <Space>
          <HistoryOutlined style={{ color: '#1890ff' }} />
          <span>Lịch sử PPE</span>
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={1000}
      destroyOnClose
    >
      <div style={{ marginBottom: '16px' }}>
        <Descriptions
          title="Thông tin PPE"
          bordered
          column={2}
          size="small"
        >
          <Descriptions.Item label="Thiết bị" span={2}>
            <Space>
              <SafetyOutlined />
              <div>
                <div style={{ fontWeight: 'bold' }}>{item?.item_name || 'Không xác định'}</div>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Mã: {item?.item_code || 'N/A'}
                </Text>
              </div>
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="Số lượng">
            <Space direction="vertical" size="small">
              <Space>
                <Tag color="blue">Tổng: {issuance.quantity}</Tag>
                {issuance.remaining_quantity !== undefined && issuance.remaining_quantity !== issuance.quantity && (
                  <>
                    <Tag color="orange">Đã trả: {issuance.quantity - issuance.remaining_quantity}</Tag>
                    <Tag color={issuance.remaining_quantity > 0 ? 'green' : 'red'}>
                      Còn: {issuance.remaining_quantity}
                    </Tag>
                  </>
                )}
              </Space>
              {issuance.remaining_quantity !== undefined && issuance.remaining_quantity !== issuance.quantity && (
                <div style={{ fontSize: '12px', color: '#666' }}>
                  Tỷ lệ trả: {Math.round(((issuance.quantity - issuance.remaining_quantity) / issuance.quantity) * 100)}%
                </div>
              )}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            <Tag color={
              issuance.status === 'returned' ? 'green' : 
              issuance.remaining_quantity !== undefined && issuance.remaining_quantity < issuance.quantity ? 'orange' : 'blue'
            }>
              {issuance.status === 'returned' ? 'Đã trả' : 
               issuance.remaining_quantity !== undefined && issuance.remaining_quantity < issuance.quantity ? 'Đã trả một phần' : 'Đang sử dụng'}
            </Tag>
          </Descriptions.Item>
        </Descriptions>
      </div>

      <Row gutter={16} style={{ marginBottom: '16px' }}>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="Tổng số lượng"
              value={issuance.quantity}
              prefix={<SafetyOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="Đã trả"
              value={
                issuance.remaining_quantity !== undefined && issuance.remaining_quantity !== issuance.quantity 
                  ? issuance.quantity - issuance.remaining_quantity 
                  : issuance.status === 'returned' ? issuance.quantity : 0
              }
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="Còn lại"
              value={issuance.remaining_quantity !== undefined ? issuance.remaining_quantity : issuance.quantity}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ 
                color: issuance.remaining_quantity !== undefined && issuance.remaining_quantity > 0 ? '#faad14' : '#ff4d4f' 
              }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="Tỷ lệ trả"
              value={
                issuance.remaining_quantity !== undefined && issuance.remaining_quantity !== issuance.quantity 
                  ? `${Math.round(((issuance.quantity - issuance.remaining_quantity) / issuance.quantity) * 100)}%`
                  : issuance.status === 'returned' ? '100%' : '0%'
              }
              prefix={<HistoryOutlined />}
              valueStyle={{ 
                color: issuance.status === 'returned' ? '#52c41a' : 
                       issuance.remaining_quantity !== undefined && issuance.remaining_quantity < issuance.quantity ? '#faad14' : '#1890ff' 
              }}
            />
          </Card>
        </Col>
      </Row>

      <div style={{ marginBottom: '16px' }}>
        <Space>
          <Title level={5} style={{ margin: 0 }}>Lịch sử hoạt động</Title>
          <Button
            size="small"
            icon={<ReloadOutlined />}
            onClick={loadHistory}
            loading={loading}
          >
            Làm mới
          </Button>
        </Space>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
          <div style={{ marginTop: '16px' }}>Đang tải lịch sử...</div>
        </div>
      ) : (
        <>
          <Table
            columns={historyColumns}
            dataSource={history}
            rowKey="id"
            pagination={false}
            size="small"
            scroll={{ x: 800 }}
          />

          {history.length === 0 && (
            <Empty
              image={<HistoryOutlined style={{ fontSize: '64px', color: '#d9d9d9' }} />}
              description="Chưa có lịch sử hoạt động"
            />
          )}

          <div style={{ marginTop: '16px' }}>
            <Title level={5}>Timeline</Title>
            <Timeline>
              {history.map((record) => (
                <Timeline.Item
                  key={record.id}
                  color={getActionColor(record.action)}
                  dot={getActionIcon(record.action)}
                >
                  <div>
                    <div style={{ fontWeight: 'bold' }}>
                      {getActionLabel(record.action)}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {dayjs(record.action_date).format('DD/MM/YYYY HH:mm')} - {record.performed_by.full_name}
                    </div>
                    {record.notes && (
                      <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                        {record.notes}
                      </div>
                    )}
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          </div>
        </>
      )}
    </Modal>
  );
};

export default PPEAssignmentHistoryModal;
