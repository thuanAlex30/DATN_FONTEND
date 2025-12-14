import React, { useState, useMemo } from 'react';
import { 
  Modal, 
  Card, 
  Typography, 
  Table, 
  Tag, 
  Space, 
  Row, 
  Col, 
  Statistic, 
  Spin, 
  Alert,
  Button,
  Tooltip,
  Image,
  Avatar
} from 'antd';
import { 
  SafetyOutlined, 
  ShoppingCartOutlined, 
  CheckCircleOutlined, 
  ExclamationCircleOutlined,
  EditOutlined
} from '@ant-design/icons';
import type { PPECategory, PPEItem } from '../../../services/ppeService';
import { ENV } from '../../../config/env';

interface CategoryDetailModalProps {
  category: PPECategory | null;
  items: PPEItem[];
  isOpen: boolean;
  onClose: () => void;
}

const { Title, Text } = Typography;

const CategoryDetailModal: React.FC<CategoryDetailModalProps> = ({
  category,
  items,
  isOpen,
  onClose
}) => {
  const [loading] = useState(false);

  // Helper function to resolve image URL
  const apiBaseForImages = useMemo(() => {
    return ENV.API_BASE_URL.replace(/\/api\/?$/, '');
  }, []);

  const resolveImageUrl = (url?: string) => {
    if (!url) return undefined;
    if (url.startsWith('http')) return url;
    return `${apiBaseForImages}${url}`;
  };

  if (!isOpen || !category) return null;

  // Calculate stats from items
  const totalItems = items.length;
  const totalQuantity = items.reduce((sum, item) => sum + (item.quantity_available || 0), 0);
  const totalAllocated = items.reduce((sum, item) => sum + (item.quantity_allocated || 0), 0);
  const totalRemaining = totalQuantity - totalAllocated;
  const lowStockItems = items.filter(item => {
    const remaining = (item.quantity_available || 0) - (item.quantity_allocated || 0);
    return remaining <= (item.reorder_level || 0);
  }).length;

  // Item columns for table
  const itemColumns = [
    {
      title: 'Thiết bị',
      dataIndex: 'item_name',
      key: 'item_name',
      render: (text: string, record: PPEItem) => (
        <Space>
          {record.image_url ? (
            <Image
              src={resolveImageUrl(record.image_url)}
              width={40}
              height={40}
              style={{ objectFit: 'cover', borderRadius: 8 }}
              preview={{ mask: 'Xem ảnh' }}
              fallback=""
            />
          ) : (
            <Avatar icon={<SafetyOutlined />} />
          )}
          <div>
            <div style={{ fontWeight: 'bold' }}>{text}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {record.item_code} - {record.brand} {record.model}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Số lượng',
      key: 'quantity',
      render: (_: unknown, record: PPEItem) => (
        <Space direction="vertical" size="small">
          <div>Tổng: <Text strong>{record.quantity_available || 0}</Text></div>
          <div>Còn lại: <Text strong style={{ color: '#52c41a' }}>{(record.quantity_available || 0) - (record.quantity_allocated || 0)}</Text></div>
          <div>Đã phát: <Text strong style={{ color: '#1890ff' }}>{record.quantity_allocated || 0}</Text></div>
        </Space>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_: unknown, record: PPEItem) => {
        const remaining = (record.quantity_available || 0) - (record.quantity_allocated || 0);
        const reorderLevel = record.reorder_level || 0;
        
        if (remaining <= 0) {
          return <Tag color="red">Hết hàng</Tag>;
        } else if (remaining <= (reorderLevel || 0)) {
          return <Tag color="orange">Cần bổ sung</Tag>;
        } else {
          return <Tag color="green">Còn hàng</Tag>;
        }
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: unknown) => (
        <Tooltip title="Chỉnh sửa">
          <Button type="link" icon={<EditOutlined />} size="small">
            Sửa
          </Button>
        </Tooltip>
      ),
    },
  ];

  return (
    <Modal
      title={
        <Space>
          <SafetyOutlined />
          {category.category_name}
        </Space>
      }
      open={isOpen}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Đóng
        </Button>
      ]}
      width={1000}
    >
      <div style={{ marginBottom: '24px' }}>
        <Text type="secondary">{category.description}</Text>
        {category.lifespan_months && (
          <div style={{ marginTop: '8px' }}>
            <Text type="secondary">Tuổi thọ: {category.lifespan_months} tháng</Text>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Tổng thiết bị"
              value={totalItems}
              prefix={<SafetyOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Tổng số lượng"
              value={totalQuantity}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Còn lại"
              value={totalRemaining}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Cần bổ sung"
              value={lowStockItems}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Items Table */}
      <div>
        <Title level={4}>Danh sách thiết bị</Title>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" />
          </div>
        ) : items.length === 0 ? (
          <Alert
            message="Chưa có thiết bị"
            description="Danh mục này chưa có thiết bị nào"
            type="info"
            showIcon
          />
        ) : (
          <Table
            columns={itemColumns}
            dataSource={items}
            rowKey={(record) => record.id || (record as any)._id}
            pagination={{
              pageSize: 5,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} của ${total} thiết bị`,
            }}
            size="small"
          />
        )}
      </div>
    </Modal>
  );
};

export default CategoryDetailModal;