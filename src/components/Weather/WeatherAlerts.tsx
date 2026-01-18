import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Card,
  List,
  Tag,
  Button,
  Space,
  Typography,
  Empty,
  Spin,
  Alert,
  Select,
  Badge,
  Modal,
  Tooltip,
  Divider,
} from 'antd';
import {
  WarningOutlined,
  ThunderboltOutlined,
  CloudOutlined,
  SunOutlined,
  FireOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import {
  fetchActiveAlerts,
  fetchAllAlerts,
  resolveAlert,
} from '../../store/slices/weatherAlertsSlice';
import type { RootState } from '../../store';
import type { WeatherAlert, WeatherAlertType, WeatherAlertSeverity } from '../../types/weather';

const { Text, Title } = Typography;
const { Option } = Select;

interface WeatherAlertsProps {
  compact?: boolean;
  showOnlyActive?: boolean;
}

const WeatherAlerts: React.FC<WeatherAlertsProps> = ({
  compact = false,
  showOnlyActive = false,
}) => {
  const dispatch = useDispatch();
  const { activeAlerts, allAlerts, pagination, activeAlertsStatus, allAlertsStatus, resolveStatus } =
    useSelector((state: RootState) => state.weatherAlerts);

  const [filters, setFilters] = useState<{
    alert_type?: WeatherAlertType;
    severity?: WeatherAlertSeverity;
    is_active?: boolean;
  }>({});
  const [selectedAlert, setSelectedAlert] = useState<WeatherAlert | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    if (showOnlyActive) {
      dispatch(fetchActiveAlerts(filters) as any);
    } else {
      dispatch(
        fetchAllAlerts({
          ...filters,
          page,
          limit,
        }) as any
      );
    }
  }, [dispatch, showOnlyActive, filters, page]);

  const getAlertIcon = (alertType: WeatherAlertType) => {
    switch (alertType) {
      case 'thunderstorm':
        return <ThunderboltOutlined />;
      case 'high_temperature':
        return <FireOutlined />;
      case 'low_temperature':
        return <CloudOutlined />;
      case 'high_wind':
        return <WarningOutlined />;
      case 'high_uv':
        return <SunOutlined />;
      case 'poor_air_quality':
        return <WarningOutlined />;
      case 'low_visibility':
        return <EyeOutlined />;
      default:
        return <WarningOutlined />;
    }
  };

  const getAlertTypeLabel = (alertType: WeatherAlertType): string => {
    const labels: Record<WeatherAlertType, string> = {
      high_temperature: 'Nhiệt độ cao',
      low_temperature: 'Nhiệt độ thấp',
      high_wind: 'Gió mạnh',
      heavy_rain: 'Mưa lớn',
      thunderstorm: 'Dông bão',
      high_uv: 'UV cao',
      poor_air_quality: 'Chất lượng không khí kém',
      low_visibility: 'Tầm nhìn thấp',
      extreme_weather: 'Thời tiết cực đoan',
    };
    return labels[alertType] || alertType;
  };

  const getSeverityColor = (severity: WeatherAlertSeverity): string => {
    switch (severity) {
      case 'critical':
        return 'red';
      case 'high':
        return 'orange';
      case 'medium':
        return 'gold';
      case 'low':
        return 'blue';
      default:
        return 'default';
    }
  };

  const handleResolve = async (alertId: string) => {
    try {
      await dispatch(resolveAlert(alertId) as any).unwrap();
      if (showOnlyActive) {
        dispatch(fetchActiveAlerts(filters) as any);
      } else {
        dispatch(
          fetchAllAlerts({
            ...filters,
            page,
            limit,
          }) as any
        );
      }
    } catch (error) {
      console.error('Failed to resolve alert:', error);
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const alerts = showOnlyActive ? activeAlerts : allAlerts;
  const isLoading = showOnlyActive ? activeAlertsStatus === 'loading' : allAlertsStatus === 'loading';

  if (compact) {
    return (
      <div>
        <Space style={{ marginBottom: 12 }}>
          <FilterOutlined />
          <Select
            placeholder="Loại cảnh báo"
            allowClear
            style={{ width: 150 }}
            onChange={(value) => handleFilterChange('alert_type', value)}
          >
            <Option value="high_temperature">Nhiệt độ cao</Option>
            <Option value="low_temperature">Nhiệt độ thấp</Option>
            <Option value="high_wind">Gió mạnh</Option>
            <Option value="heavy_rain">Mưa lớn</Option>
            <Option value="thunderstorm">Dông bão</Option>
            <Option value="high_uv">UV cao</Option>
            <Option value="poor_air_quality">Chất lượng không khí kém</Option>
            <Option value="low_visibility">Tầm nhìn thấp</Option>
          </Select>
          <Select
            placeholder="Mức độ"
            allowClear
            style={{ width: 120 }}
            onChange={(value) => handleFilterChange('severity', value)}
          >
            <Option value="critical">Nghiêm trọng</Option>
            <Option value="high">Cao</Option>
            <Option value="medium">Trung bình</Option>
            <Option value="low">Thấp</Option>
          </Select>
        </Space>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin />
          </div>
        ) : alerts.length === 0 ? (
          <Empty description="Không có cảnh báo nào" />
        ) : (
          <List
            dataSource={alerts}
            renderItem={(alert) => (
              <List.Item
                actions={[
                  <Button
                    key="detail"
                    type="link"
                    size="small"
                    onClick={() => {
                      setSelectedAlert(alert);
                      setDetailModalVisible(true);
                    }}
                  >
                    Chi tiết
                  </Button>,
                  alert.is_active && (
                    <Button
                      key="resolve"
                      type="link"
                      size="small"
                      icon={<CheckCircleOutlined />}
                      onClick={() => handleResolve(alert._id)}
                      loading={resolveStatus === 'loading'}
                    >
                      Giải quyết
                    </Button>
                  ),
                ].filter(Boolean)}
              >
                <List.Item.Meta
                  avatar={
                    <Badge
                      count={alert.is_active ? 1 : 0}
                      size="small"
                      offset={[-5, 5]}
                    >
                      <Tag
                        icon={getAlertIcon(alert.alert_type)}
                        color={getSeverityColor(alert.severity)}
                      >
                        {getAlertTypeLabel(alert.alert_type)}
                      </Tag>
                    </Badge>
                  }
                  title={
                    <Space>
                      <Text strong>{alert.title}</Text>
                      <Tag color={getSeverityColor(alert.severity)} size="small">
                        {alert.severity.toUpperCase()}
                      </Tag>
                      {!alert.is_active && <Tag color="default">Đã giải quyết</Tag>}
                    </Space>
                  }
                  description={
                    <div>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {alert.message}
                      </Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: '11px' }}>
                        {formatDate(alert.triggered_at)} • {alert.location.name}
                      </Text>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}

        <Modal
          title="Chi tiết cảnh báo"
          open={detailModalVisible}
          onCancel={() => setDetailModalVisible(false)}
          footer={[
            selectedAlert?.is_active && (
              <Button
                key="resolve"
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => {
                  if (selectedAlert) {
                    handleResolve(selectedAlert._id);
                    setDetailModalVisible(false);
                  }
                }}
                loading={resolveStatus === 'loading'}
              >
                Giải quyết
              </Button>
            ),
            <Button key="close" onClick={() => setDetailModalVisible(false)}>
              Đóng
            </Button>,
          ].filter(Boolean)}
          width={600}
        >
          {selectedAlert && (
            <div>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div>
                  <Title level={5}>Loại cảnh báo</Title>
                  <Tag
                    icon={getAlertIcon(selectedAlert.alert_type)}
                    color={getSeverityColor(selectedAlert.severity)}
                  >
                    {getAlertTypeLabel(selectedAlert.alert_type)}
                  </Tag>
                  <Tag color={getSeverityColor(selectedAlert.severity)}>
                    {selectedAlert.severity.toUpperCase()}
                  </Tag>
                </div>

                <div>
                  <Title level={5}>Tiêu đề</Title>
                  <Text>{selectedAlert.title}</Text>
                </div>

                <div>
                  <Title level={5}>Nội dung</Title>
                  <Text>{selectedAlert.message}</Text>
                </div>

                <Divider />

                <div>
                  <Title level={5}>Vị trí</Title>
                  <Text>{selectedAlert.location.name}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {selectedAlert.location.latitude.toFixed(4)}, {selectedAlert.location.longitude.toFixed(4)}
                  </Text>
                </div>

                {selectedAlert.weather_data && (
                  <div>
                    <Title level={5}>Dữ liệu thời tiết</Title>
                    <Space wrap>
                      {selectedAlert.weather_data.temperature !== undefined && (
                        <Tag>Nhiệt độ: {selectedAlert.weather_data.temperature.toFixed(1)}°C</Tag>
                      )}
                      {selectedAlert.weather_data.windspeed !== undefined && (
                        <Tag>Gió: {selectedAlert.weather_data.windspeed.toFixed(1)} km/h</Tag>
                      )}
                      {selectedAlert.weather_data.uv_index !== undefined && (
                        <Tag>UV: {selectedAlert.weather_data.uv_index.toFixed(1)}</Tag>
                      )}
                      {selectedAlert.weather_data.air_quality_aqi !== undefined && (
                        <Tag>AQI: {selectedAlert.weather_data.air_quality_aqi}</Tag>
                      )}
                    </Space>
                  </div>
                )}

                <Divider />

                <div>
                  <Title level={5}>Thời gian</Title>
                  <Text>Kích hoạt: {formatDate(selectedAlert.triggered_at)}</Text>
                  {selectedAlert.resolved_at && (
                    <>
                      <br />
                      <Text>Giải quyết: {formatDate(selectedAlert.resolved_at)}</Text>
                    </>
                  )}
                </div>

                {selectedAlert.notifications_sent !== undefined && (
                  <div>
                    <Title level={5}>Thông báo</Title>
                    <Text>Đã gửi: {selectedAlert.notifications_sent} lần</Text>
                  </div>
                )}
              </Space>
            </div>
          )}
        </Modal>
      </div>
    );
  }

  return (
    <Card
      title={
        <Space>
          <WarningOutlined />
          <span>Cảnh báo thời tiết</span>
          <Badge count={activeAlerts.length} showZero />
        </Space>
      }
      extra={
        <Button
          icon={<ReloadOutlined />}
          onClick={() => {
            if (showOnlyActive) {
              dispatch(fetchActiveAlerts(filters) as any);
            } else {
              dispatch(
                fetchAllAlerts({
                  ...filters,
                  page,
                  limit,
                }) as any
              );
            }
          }}
          loading={isLoading}
        >
          Làm mới
        </Button>
      }
    >
      <Space style={{ marginBottom: 16 }}>
        <FilterOutlined />
        <Select
          placeholder="Loại cảnh báo"
          allowClear
          style={{ width: 180 }}
          onChange={(value) => handleFilterChange('alert_type', value)}
        >
          <Option value="high_temperature">Nhiệt độ cao</Option>
          <Option value="low_temperature">Nhiệt độ thấp</Option>
          <Option value="high_wind">Gió mạnh</Option>
          <Option value="heavy_rain">Mưa lớn</Option>
          <Option value="thunderstorm">Dông bão</Option>
          <Option value="high_uv">UV cao</Option>
          <Option value="poor_air_quality">Chất lượng không khí kém</Option>
          <Option value="low_visibility">Tầm nhìn thấp</Option>
        </Select>
        <Select
          placeholder="Mức độ"
          allowClear
          style={{ width: 140 }}
          onChange={(value) => handleFilterChange('severity', value)}
        >
          <Option value="critical">Nghiêm trọng</Option>
          <Option value="high">Cao</Option>
          <Option value="medium">Trung bình</Option>
          <Option value="low">Thấp</Option>
        </Select>
        {!showOnlyActive && (
          <Select
            placeholder="Trạng thái"
            allowClear
            style={{ width: 140 }}
            onChange={(value) => handleFilterChange('is_active', value)}
          >
            <Option value={true}>Đang hoạt động</Option>
            <Option value={false}>Đã giải quyết</Option>
          </Select>
        )}
      </Space>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
        </div>
      ) : alerts.length === 0 ? (
        <Empty description="Không có cảnh báo nào" />
      ) : (
        <>
          <List
            dataSource={alerts}
            renderItem={(alert) => (
              <List.Item
                actions={[
                  <Button
                    key="detail"
                    type="link"
                    onClick={() => {
                      setSelectedAlert(alert);
                      setDetailModalVisible(true);
                    }}
                  >
                    Chi tiết
                  </Button>,
                  alert.is_active && (
                    <Button
                      key="resolve"
                      type="link"
                      icon={<CheckCircleOutlined />}
                      onClick={() => handleResolve(alert._id)}
                      loading={resolveStatus === 'loading'}
                    >
                      Giải quyết
                    </Button>
                  ),
                ].filter(Boolean)}
              >
                <List.Item.Meta
                  avatar={
                    <Badge count={alert.is_active ? 1 : 0} size="small" offset={[-5, 5]}>
                      <Tag
                        icon={getAlertIcon(alert.alert_type)}
                        color={getSeverityColor(alert.severity)}
                      >
                        {getAlertTypeLabel(alert.alert_type)}
                      </Tag>
                    </Badge>
                  }
                  title={
                    <Space>
                      <Text strong>{alert.title}</Text>
                      <Tag color={getSeverityColor(alert.severity)} size="small">
                        {alert.severity.toUpperCase()}
                      </Tag>
                      {!alert.is_active && <Tag color="default">Đã giải quyết</Tag>}
                    </Space>
                  }
                  description={
                    <div>
                      <Text type="secondary">{alert.message}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {formatDate(alert.triggered_at)} • {alert.location.name}
                      </Text>
                    </div>
                  }
                />
              </List.Item>
            )}
          />

          {!showOnlyActive && pagination && pagination.total_pages > 1 && (
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <Text type="secondary">
                Trang {pagination.current_page} / {pagination.total_pages} ({pagination.total_items} cảnh báo)
              </Text>
              <Space style={{ marginTop: 8 }}>
                <Button
                  disabled={pagination.current_page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Trước
                </Button>
                <Button
                  disabled={pagination.current_page === pagination.total_pages}
                  onClick={() => setPage(page + 1)}
                >
                  Sau
                </Button>
              </Space>
            </div>
          )}

          <Modal
            title="Chi tiết cảnh báo"
            open={detailModalVisible}
            onCancel={() => setDetailModalVisible(false)}
            footer={[
              selectedAlert?.is_active && (
                <Button
                  key="resolve"
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={() => {
                    if (selectedAlert) {
                      handleResolve(selectedAlert._id);
                      setDetailModalVisible(false);
                    }
                  }}
                  loading={resolveStatus === 'loading'}
                >
                  Giải quyết
                </Button>
              ),
              <Button key="close" onClick={() => setDetailModalVisible(false)}>
                Đóng
              </Button>,
            ].filter(Boolean)}
            width={600}
          >
            {selectedAlert && (
              <div>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <div>
                    <Title level={5}>Loại cảnh báo</Title>
                    <Tag
                      icon={getAlertIcon(selectedAlert.alert_type)}
                      color={getSeverityColor(selectedAlert.severity)}
                    >
                      {getAlertTypeLabel(selectedAlert.alert_type)}
                    </Tag>
                    <Tag color={getSeverityColor(selectedAlert.severity)}>
                      {selectedAlert.severity.toUpperCase()}
                    </Tag>
                  </div>

                  <div>
                    <Title level={5}>Tiêu đề</Title>
                    <Text>{selectedAlert.title}</Text>
                  </div>

                  <div>
                    <Title level={5}>Nội dung</Title>
                    <Text>{selectedAlert.message}</Text>
                  </div>

                  <Divider />

                  <div>
                    <Title level={5}>Vị trí</Title>
                    <Text>{selectedAlert.location.name}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {selectedAlert.location.latitude.toFixed(4)}, {selectedAlert.location.longitude.toFixed(4)}
                    </Text>
                  </div>

                  {selectedAlert.weather_data && (
                    <div>
                      <Title level={5}>Dữ liệu thời tiết</Title>
                      <Space wrap>
                        {selectedAlert.weather_data.temperature !== undefined && (
                          <Tag>Nhiệt độ: {selectedAlert.weather_data.temperature.toFixed(1)}°C</Tag>
                        )}
                        {selectedAlert.weather_data.windspeed !== undefined && (
                          <Tag>Gió: {selectedAlert.weather_data.windspeed.toFixed(1)} km/h</Tag>
                        )}
                        {selectedAlert.weather_data.uv_index !== undefined && (
                          <Tag>UV: {selectedAlert.weather_data.uv_index.toFixed(1)}</Tag>
                        )}
                        {selectedAlert.weather_data.air_quality_aqi !== undefined && (
                          <Tag>AQI: {selectedAlert.weather_data.air_quality_aqi}</Tag>
                        )}
                      </Space>
                    </div>
                  )}

                  <Divider />

                  <div>
                    <Title level={5}>Thời gian</Title>
                    <Text>Kích hoạt: {formatDate(selectedAlert.triggered_at)}</Text>
                    {selectedAlert.resolved_at && (
                      <>
                        <br />
                        <Text>Giải quyết: {formatDate(selectedAlert.resolved_at)}</Text>
                      </>
                    )}
                  </div>

                  {selectedAlert.notifications_sent !== undefined && (
                    <div>
                      <Title level={5}>Thông báo</Title>
                      <Text>Đã gửi: {selectedAlert.notifications_sent} lần</Text>
                    </div>
                  )}
                </Space>
              </div>
            )}
          </Modal>
        </>
      )}
    </Card>
  );
};

export default WeatherAlerts;

