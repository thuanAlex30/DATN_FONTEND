import React from 'react';
import {
  Button,
  Space,
  Dropdown,
  Menu,
  Modal,
  message,
  Typography,
  Tag
} from 'antd';
import {
  DeleteOutlined,
  MoreOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExportOutlined,
  DownloadOutlined
} from '@ant-design/icons';

const { Text } = Typography;

interface BulkActionsProps {
  selectedRowKeys: React.Key[];
  onBulkDelete: () => void;
  onBulkActivate: (activate: boolean) => void;
  onBulkExport: () => void;
  loading?: boolean;
  type: 'departments' | 'positions';
}

const BulkActions: React.FC<BulkActionsProps> = ({
  selectedRowKeys,
  onBulkDelete,
  onBulkActivate,
  onBulkExport,
  loading = false,
  type
}) => {
  const selectedCount = selectedRowKeys.length;
  const typeName = type === 'departments' ? 'phòng ban' : 'vị trí';

  const handleBulkDelete = () => {
    Modal.confirm({
      title: `Xóa ${selectedCount} ${typeName} đã chọn?`,
      content: (
        <div>
          <Text type="warning">
            Bạn có chắc chắn muốn xóa {selectedCount} {typeName} đã chọn?
          </Text>
          <br />
          <Text type="secondary">
            Hành động này không thể hoàn tác và có thể ảnh hưởng đến dữ liệu liên quan.
          </Text>
        </div>
      ),
      okText: 'Xóa',
      cancelText: 'Hủy',
      okType: 'danger',
      onOk: onBulkDelete,
    });
  };

  const handleBulkActivate = (activate: boolean) => {
    const action = activate ? 'kích hoạt' : 'vô hiệu hóa';
    Modal.confirm({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} ${selectedCount} ${typeName} đã chọn?`,
      content: (
        <div>
          <Text>
            Bạn có chắc chắn muốn {action} {selectedCount} {typeName} đã chọn?
          </Text>
        </div>
      ),
      okText: activate ? 'Kích hoạt' : 'Vô hiệu hóa',
      cancelText: 'Hủy',
      okType: activate ? 'primary' : 'default',
      onOk: () => onBulkActivate(activate),
    });
  };

  const menu = (
    <Menu>
      <Menu.Item 
        key="activate" 
        icon={<CheckCircleOutlined />}
        onClick={() => handleBulkActivate(true)}
      >
        Kích hoạt hàng loạt
      </Menu.Item>
      <Menu.Item 
        key="deactivate" 
        icon={<CloseCircleOutlined />}
        onClick={() => handleBulkActivate(false)}
      >
        Vô hiệu hóa hàng loạt
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item 
        key="export" 
        icon={<ExportOutlined />}
        onClick={onBulkExport}
      >
        Xuất dữ liệu
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item 
        key="delete" 
        icon={<DeleteOutlined />}
        danger
        onClick={handleBulkDelete}
      >
        Xóa hàng loạt
      </Menu.Item>
    </Menu>
  );

  if (selectedCount === 0) {
    return null;
  }

  return (
    <Space>
      <Tag color="blue">
        Đã chọn: {selectedCount} {typeName}
      </Tag>
      <Button
        type="primary"
        danger
        icon={<DeleteOutlined />}
        onClick={handleBulkDelete}
        loading={loading}
        size="small"
      >
        Xóa ({selectedCount})
      </Button>
      <Button
        icon={<CheckCircleOutlined />}
        onClick={() => handleBulkActivate(true)}
        loading={loading}
        size="small"
      >
        Kích hoạt
      </Button>
      <Button
        icon={<CloseCircleOutlined />}
        onClick={() => handleBulkActivate(false)}
        loading={loading}
        size="small"
      >
        Vô hiệu hóa
      </Button>
      <Dropdown overlay={menu} trigger={['click']}>
        <Button icon={<MoreOutlined />} size="small">
          Thêm
        </Button>
      </Dropdown>
    </Space>
  );
};

export default BulkActions;
