import React from 'react';
import { Modal, Card, Typography, Space, Row, Col, Statistic, Tag, Button, Divider } from 'antd';
import { SafetyOutlined, ShoppingCartOutlined, CheckCircleOutlined, ExclamationCircleOutlined, EditOutlined } from '@ant-design/icons';
import type { PPEItem } from '../../../services/ppeService';

interface PPEDetailModalProps {
  item: PPEItem | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
}

const { Text } = Typography;

const PPEDetailModal: React.FC<PPEDetailModalProps> = ({
  item,
  isOpen,
  onClose,
  onEdit
}) => {
  if (!isOpen || !item) return null;

  const remaining = (item.remaining_quantity ?? ((item.quantity_available || 0) - (item.quantity_allocated || 0)));
  const reorderLevel = item.reorder_level || 0;
  
  const getStatusInfo = () => {
    if (remaining <= 0) {
      return { color: 'red', text: 'Hết hàng' };
    } else if (remaining <= (reorderLevel || 0)) {
      return { color: 'orange', text: 'Cần bổ sung' };
    } else {
      return { color: 'green', text: 'Còn hàng' };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <Modal
      title={
        <Space>
          <SafetyOutlined />
          {item.item_name}
        </Space>
      }
      open={isOpen}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Đóng
        </Button>,
        <Button key="edit" type="primary" icon={<EditOutlined />} onClick={onEdit}>
          Chỉnh sửa
        </Button>
      ]}
      width={800}
    >
      <div style={{ marginBottom: '24px' }}>
        <Space direction="vertical" size="small">
          <div>
            <Text strong>Mã thiết bị: </Text>
            <Text code>{item.item_code}</Text>
          </div>
          <div>
            <Text strong>Thương hiệu: </Text>
            <Text>{item.brand}</Text>
          </div>
          {item.model && (
            <div>
              <Text strong>Model: </Text>
              <Text>{item.model}</Text>
            </div>
          )}
        </Space>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Tổng số lượng"
              value={item.total_quantity ?? ((item.quantity_available || 0) + (item.quantity_allocated || 0))}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Còn lại"
              value={remaining}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Đã phân phối"
              value={item.quantity_allocated || 0}
              valueStyle={{ color: '#1890ff' }}
              prefix={<SafetyOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Status and Details */}
      <Card>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <Text strong>Trạng thái: </Text>
            <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
          </div>
          
          <Divider />
          
          <div>
            <Text strong>Mức tái đặt hàng: </Text>
            <Text>{reorderLevel}</Text>
          </div>
          
          {remaining <= (reorderLevel || 0) && remaining > 0 && (
            <div style={{ color: '#ff4d4f' }}>
              <ExclamationCircleOutlined /> Cần bổ sung ngay
            </div>
          )}
          
          {remaining <= 0 && (
            <div style={{ color: '#ff4d4f' }}>
              <ExclamationCircleOutlined /> Hết hàng, cần nhập thêm
            </div>
          )}
        </Space>
      </Card>
    </Modal>
  );
};

export default PPEDetailModal;