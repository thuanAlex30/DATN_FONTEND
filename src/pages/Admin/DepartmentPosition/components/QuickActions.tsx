import React from 'react';
import {
  Card,
  Button,
  Space,
  Typography,
  Row,
  Col,
  Statistic,
  Tooltip,
  Badge
} from 'antd';
import {
  PlusOutlined,
  ImportOutlined,
  ExportOutlined,
  SyncOutlined,
  SettingOutlined,
  TeamOutlined,
  BankOutlined,
  UserOutlined
} from '@ant-design/icons';

const { Text } = Typography;

interface QuickActionsProps {
  onQuickCreate: (type: 'department' | 'position') => void;
  onImport: () => void;
  onExport: () => void;
  onRefresh: () => void;
  onSettings: () => void;
  stats: {
    totalDepartments: number;
    totalPositions: number;
    totalEmployees: number;
    activeDepartments: number;
  };
  loading?: boolean;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  onQuickCreate,
  onImport,
  onExport,
  onRefresh,
  onSettings,
  stats,
  loading = false
}) => {
  return (
    <Card style={{ marginBottom: '16px' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card size="small" style={{ textAlign: 'center' }}>
            <Statistic
              title="Phòng ban"
              value={stats.totalDepartments}
              prefix={<BankOutlined style={{ color: '#1890ff' }} />}
              suffix={
                <Badge 
                  count={stats.activeDepartments} 
                  showZero 
                  color="#52c41a"
                  style={{ marginLeft: '8px' }}
                />
              }
            />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {stats.activeDepartments} hoạt động
            </Text>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card size="small" style={{ textAlign: 'center' }}>
            <Statistic
              title="Vị trí"
              value={stats.totalPositions}
              prefix={<UserOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card size="small" style={{ textAlign: 'center' }}>
            <Statistic
              title="Nhân viên"
              value={stats.totalEmployees}
              prefix={<TeamOutlined style={{ color: '#faad14' }} />}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card size="small" style={{ textAlign: 'center' }}>
            <Space direction="vertical" size="small">
              <Text strong>Thao tác nhanh</Text>
              <Space wrap>
                <Tooltip title="Tạo phòng ban mới">
                  <Button
                    type="primary"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={() => onQuickCreate('department')}
                    loading={loading}
                  >
                    Phòng ban
                  </Button>
                </Tooltip>
                <Tooltip title="Tạo vị trí mới">
                  <Button
                    type="default"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={() => onQuickCreate('position')}
                    loading={loading}
                  >
                    Vị trí
                  </Button>
                </Tooltip>
              </Space>
            </Space>
          </Card>
        </Col>
      </Row>
      
      <Row style={{ marginTop: '16px' }}>
        <Col span={24}>
          <Space wrap>
            <Button
              icon={<ImportOutlined />}
              onClick={onImport}
              loading={loading}
            >
              Nhập dữ liệu
            </Button>
            <Button
              icon={<ExportOutlined />}
              onClick={onExport}
              loading={loading}
            >
              Xuất dữ liệu
            </Button>
            <Button
              icon={<SyncOutlined />}
              onClick={onRefresh}
              loading={loading}
            >
              Làm mới
            </Button>
            <Button
              icon={<SettingOutlined />}
              onClick={onSettings}
            >
              Cài đặt
            </Button>
          </Space>
        </Col>
      </Row>
    </Card>
  );
};

export default QuickActions;
