import React, { useState, useEffect, useMemo } from 'react';
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
  Button,
  Image,
  Avatar
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
import { ENV } from '../../../config/env';
import * as ppeService from '../../../services/ppeService';

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
  const [serialsModalVisible, setSerialsModalVisible] = useState(false);
  const [serialsToShow, setSerialsToShow] = useState<string[]>([]);
  const [aggregates, setAggregates] = useState<{ total_quantity: number; total_returned: number; total_remaining: number } | null>(null);

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
    if (visible && issuance) {
      loadHistory();
    }
  }, [visible, issuance]);

  const loadHistory = async () => {
    if (!issuance) return;

    setLoading(true);
    try {
      // Fetch manager history and aggregate entries for this item
      const resp = await ppeService.getManagerPPEHistory();
      // Service already returns an array of history/issuances after normalization
      const hist: any[] = Array.isArray(resp)
        ? resp
        : (resp && Array.isArray((resp as any).history))
          ? (resp as any).history
          : [];
      const itemId = typeof issuance.item_id === 'object'
        ? String((issuance.item_id as any)._id || (issuance.item_id as any).id)
        : String(issuance.item_id);

      // Filter entries for same item (support both populated objects and raw ids)
      const sameItemEntries = hist.filter((h: any) => {
        if (!h || !h.item_id) return false;
        const item = h.item_id;
        const rawId =
          typeof item === 'object'
            ? (item.id || (item as any)._id)
            : item;
        if (!rawId) return false;
        return String(rawId) === itemId;
      });

      // Build history rows mapping to existing PPEHistory type
      const mapped: PPEHistory[] = sameItemEntries.map((h: any, idx: number) => {
        const baseQuantity = Number(h.quantity || 0);
        const remainingQty =
          h.remaining_quantity !== undefined && h.remaining_quantity !== null
            ? Number(h.remaining_quantity || 0)
            : undefined;

        // Ưu tiên dùng quantity_returned từ backend nếu có, sau đó mới fallback theo remaining_quantity / returned_serial_numbers
        let quantityReturned: number;
        if (h.quantity_returned !== undefined && h.quantity_returned !== null) {
          quantityReturned = Number(h.quantity_returned) || 0;
        } else if (Array.isArray(h.returned_serial_numbers) && h.returned_serial_numbers.length > 0) {
          quantityReturned = h.returned_serial_numbers.length;
        } else if (remainingQty !== undefined) {
          quantityReturned = Math.max(0, baseQuantity - remainingQty);
        } else {
          quantityReturned = 0;
        }

        const quantityRemaining =
          remainingQty !== undefined
            ? remainingQty
            : Math.max(0, baseQuantity - quantityReturned);

        return {
          id: h.id || h._id || `h-${idx}`,
          action: h.status === 'returned' ? 'returned' : 'issued',
          action_date: h.createdAt || h.issued_date || new Date().toISOString(),
          performed_by: {
            id:
              (h.issued_by && (h.issued_by._id || h.issued_by.id)) ||
              (h.user_id && (h.user_id._id || h.user_id.id)) ||
              '',
            full_name:
              (h.issued_by && h.issued_by.full_name) ||
              (h.user_id && h.user_id.full_name) ||
              '',
            email:
              (h.issued_by && h.issued_by.email) ||
              (h.user_id && h.user_id.email) ||
              ''
          },
          details: {
            // Thông tin người nhận / người trả (employee)
            employee_full_name: (h.user_id && h.user_id.full_name) || '',
            employee_email: (h.user_id && h.user_id.email) || '',
            quantity: baseQuantity,
            expected_return_date: h.expected_return_date,
            serials: h.assigned_serial_numbers || [],
            remaining_quantity: quantityRemaining,
            return_condition: h.return_condition,
            actual_return_date: h.actual_return_date,
            quantity_returned: quantityReturned,
            quantity_remaining: quantityRemaining,
            returned_serials: h.returned_serial_numbers || []
          },
          notes: h.notes || ''
        };
      });

      // Aggregate totals cho đúng với bản ghi hiện tại (không cộng dồn nhiều lần phát)
      const qty = Number(issuance.quantity || 0);
      const remaining = issuance.remaining_quantity !== undefined && issuance.remaining_quantity !== null
        ? Number(issuance.remaining_quantity)
        : qty;
      const distributed = Math.max(0, qty - remaining);

      setAggregates({
        total_quantity: qty,
        total_returned: distributed,
        total_remaining: remaining
      });

      setHistory(mapped);
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
              {record.details.employee_full_name && (
                <>
                  <Text>
                    Đã phát cho:{' '}
                    <strong>{record.details.employee_full_name}</strong>
                    {record.details.employee_email ? ` (${record.details.employee_email})` : ''}
                  </Text>
                  <br />
                </>
              )}
              <Text>Số lượng: {record.details.quantity}</Text>
              <br />
              <Text>
                Hạn trả:{' '}
                {record.details.expected_return_date
                  ? dayjs(record.details.expected_return_date).format('DD/MM/YYYY')
                  : '-'}
              </Text>
              {record.details.serials && record.details.serials.length > 0 && (
                <>
                  <br />
                  <div style={{ marginTop: 8 }}>
                    <Text strong>Serial Numbers:</Text>
                    <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {record.details.serials.map((s: string, i: number) => (
                        <Tag key={i} color="blue" style={{ fontSize: 12 }}>{s}</Tag>
                      ))}
                    </div>
                  </div>
                </>
              )}
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
              {record.details.employee_full_name && (
                <>
                  <Text>
                    Đã trả bởi:{' '}
                    <strong>{record.details.employee_full_name}</strong>
                    {record.details.employee_email ? ` (${record.details.employee_email})` : ''}
                  </Text>
                  <br />
                </>
              )}
              <Text>
                Tình trạng:{' '}
                {record.details.return_condition || '-'}
              </Text>
              <br />
              <Text>
                Ngày trả:{' '}
                {record.details.actual_return_date
                  ? dayjs(record.details.actual_return_date).format('DD/MM/YYYY')
                  : '-'}
              </Text>
              <br />
              <Text>
                Số lượng trả:{' '}
                {record.details.quantity_returned !== undefined && record.details.quantity_returned !== null
                  ? record.details.quantity_returned
                  : 0}
              </Text>
              {record.details.returned_serials && record.details.returned_serials.length > 0 && (
                <>
                  <br />
                  <div style={{ marginTop: 8 }}>
                    <Text strong>Serial Numbers returned:</Text>
                    <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {record.details.returned_serials.map((s: string, i: number) => (
                        <Tag key={i} color="green" style={{ fontSize: 12 }}>{s}</Tag>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
          {record.action === 'partial_return' && (
            <div>
              {record.details.employee_full_name && (
                <>
                  <Text>
                    Đã trả một phần bởi:{' '}
                    <strong>{record.details.employee_full_name}</strong>
                    {record.details.employee_email ? ` (${record.details.employee_email})` : ''}
                  </Text>
                  <br />
                </>
              )}
              <Text>
                Tình trạng:{' '}
                {record.details.return_condition || '-'}
              </Text>
              <br />
              <Text>
                Ngày trả:{' '}
                {record.details.actual_return_date
                  ? dayjs(record.details.actual_return_date).format('DD/MM/YYYY')
                  : '-'}
              </Text>
              <br />
              <Text>
                Số lượng trả:{' '}
                {record.details.quantity_returned !== undefined && record.details.quantity_returned !== null
                  ? record.details.quantity_returned
                  : 0}
              </Text>
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

  const openSerials = (serials: string[] = []) => {
    setSerialsToShow(serials || []);
    setSerialsModalVisible(true);
  };

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
          {/* Serial numbers display */}
          <Descriptions.Item label="Serial Numbers" span={2}>
            {issuance.assigned_serial_numbers && issuance.assigned_serial_numbers.length > 0 ? (
              <Space>
                {/* show up to 3 */}
                {issuance.assigned_serial_numbers.slice(0,3).map((s, i) => (
                  <Tag key={i} color="blue">{s}</Tag>
                ))}
                {issuance.assigned_serial_numbers.length > 3 && (
                  <Button type="link" onClick={() => openSerials(issuance.assigned_serial_numbers)}>Xem ({issuance.assigned_serial_numbers.length})</Button>
                )}
              </Space>
            ) : (
              <Text type="secondary">Không có</Text>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Thiết bị" span={2}>
            <Space>
              {(item as any)?.image_url ? (
                <Image
                  src={resolveImageUrl((item as any).image_url)}
                  width={80}
                  height={80}
                  style={{ objectFit: 'cover', borderRadius: 8 }}
                  preview={{ mask: 'Xem ảnh' }}
                  fallback=""
                />
              ) : (
                <Avatar icon={<SafetyOutlined />} size={80} />
              )}
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
                    <Tag color="orange">Đã phát: {issuance.quantity - issuance.remaining_quantity}</Tag>
                    <Tag color={issuance.remaining_quantity > 0 ? 'green' : 'red'}>
                      Còn: {issuance.remaining_quantity}
                    </Tag>
                  </>
                )}
              </Space>
              {issuance.remaining_quantity !== undefined && issuance.remaining_quantity !== issuance.quantity && (
                <div style={{ fontSize: '12px', color: '#666' }}>
                  Tỷ lệ phát: {Math.round(((issuance.quantity - issuance.remaining_quantity) / issuance.quantity) * 100)}%
                </div>
              )}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            <Tag color={
              issuance.status === 'returned' ? 'green' : 
              issuance.remaining_quantity !== undefined && issuance.remaining_quantity < issuance.quantity ? 'orange' : 'blue'
            }>
              {issuance.status === 'returned'
                ? 'Đã trả'
                : issuance.remaining_quantity !== undefined && issuance.remaining_quantity < issuance.quantity
                  ? 'Đã phát một phần'
                  : 'Đang sử dụng'}
            </Tag>
          </Descriptions.Item>
        </Descriptions>
      </div>

      <Row gutter={16} style={{ marginBottom: '16px' }}>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="Tổng số lượng"
              value={aggregates ? aggregates.total_quantity : issuance.quantity}
              prefix={<SafetyOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="Đã phát"
              value={aggregates ? aggregates.total_returned : (issuance.remaining_quantity !== undefined && issuance.remaining_quantity !== issuance.quantity 
                ? issuance.quantity - issuance.remaining_quantity 
                : issuance.status === 'returned' ? issuance.quantity : 0)}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="Còn lại"
              value={aggregates ? aggregates.total_remaining : (issuance.remaining_quantity !== undefined ? issuance.remaining_quantity : issuance.quantity)}
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
              title="Tỷ lệ phát"
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

      {/* Serials modal */}
      <Modal
        title="Serial Numbers"
        open={serialsModalVisible}
        onCancel={() => setSerialsModalVisible(false)}
        footer={null}
        width={600}
      >
        <div style={{ maxHeight: 400, overflowY: 'auto', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {serialsToShow && serialsToShow.length > 0 ? serialsToShow.map((s, i) => (
            <Tag key={i} color="blue">{s}</Tag>
          )) : <Text type="secondary">No serials</Text>}
        </div>
      </Modal>

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
