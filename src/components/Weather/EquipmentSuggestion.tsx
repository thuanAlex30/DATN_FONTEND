import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Card,
  Typography,
  List,
  Tag,
  Space,
  Spin,
  Alert,
  Button,
  Popover,
  Tooltip,
} from 'antd';
import {
  SafetyOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import { fetchEquipmentSuggestions } from '../../store/slices/weatherSlice';
import type { RootState } from '../../store';
import styles from './EquipmentSuggestion.module.css';

const { Text, Title } = Typography;

interface EquipmentSuggestionProps {
  latitude?: number;
  longitude?: number;
  compact?: boolean;
  enableGeo?: boolean;
}

const EquipmentSuggestion: React.FC<EquipmentSuggestionProps> = ({
  latitude,
  longitude,
  compact = false,
  enableGeo = true,
}) => {
  const dispatch = useDispatch();
  const { suggestions, suggestionsStatus, suggestionsError } = useSelector(
    (state: RootState) => state.weather
  );
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState<{ latitude?: number; longitude?: number }>({
    latitude,
    longitude,
  });
  const [geoError, setGeoError] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Tự động lấy vị trí khi component mount nếu không có coordinates
  useEffect(() => {
    if (enableGeo && !coords.latitude && !coords.longitude && navigator.geolocation) {
      setIsGettingLocation(true);
      setGeoError(null);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude: lat, longitude: lon } = pos.coords;
          setCoords({ latitude: lat, longitude: lon });
          setIsGettingLocation(false);
        },
        (err) => {
          // Fallback về default location nếu geolocation fail
          console.warn('Geolocation failed, using default location:', err.message);
          setGeoError(null); // Không hiển thị lỗi vì đã có fallback
          setIsGettingLocation(false);
          // Sử dụng default location từ ENV hoặc không truyền (backend sẽ dùng default)
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 600000 } // Cache 10 phút
      );
    }
  }, [enableGeo]); // Chỉ chạy một lần khi mount

  useEffect(() => {
    if (visible) {
      if (coords.latitude && coords.longitude) {
        dispatch(fetchEquipmentSuggestions({ latitude: coords.latitude, longitude: coords.longitude }) as any);
      } else if (!isGettingLocation) {
        dispatch(fetchEquipmentSuggestions({ latitude: coords.latitude, longitude: coords.longitude }) as any);
      }
    }
  }, [dispatch, coords.latitude, coords.longitude, visible, isGettingLocation]);

  const handleRefresh = () => {
    dispatch(fetchEquipmentSuggestions({ latitude: coords.latitude, longitude: coords.longitude }) as any);
  };

  const handleUseMyLocation = () => {
    if (!enableGeo || !navigator.geolocation) {
      setGeoError('Thiết bị không hỗ trợ định vị');
      return;
    }
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        setCoords({ latitude: lat, longitude: lon });
        dispatch(fetchEquipmentSuggestions({ latitude: lat, longitude: lon }) as any);
      },
      (err) => {
        setGeoError(err.message || 'Không thể lấy vị trí');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const getPriorityColor = (priority: number): string => {
    if (priority >= 5) return 'red';
    if (priority >= 3) return 'orange';
    return 'blue';
  };

  if (compact) {
    const content = (
      <div style={{ maxWidth: '400px', maxHeight: '500px', overflowY: 'auto' }}>
        {suggestionsStatus === 'loading' && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin />
          </div>
        )}

        {suggestionsStatus === 'failed' && (
          <Alert
            message="Lỗi"
            description={suggestionsError || 'Không thể tải gợi ý'}
            type="error"
            showIcon
            style={{ marginBottom: '16px' }}
          />
        )}

        {suggestionsStatus === 'succeeded' && suggestions && (
          <>
            {suggestions.weather?.stale && (
              <Alert
                message="Đang dùng dữ liệu cache (stale)"
                description="Nhà cung cấp thời tiết tạm thời không phản hồi, dữ liệu có thể cũ."
                type="warning"
                showIcon
                style={{ marginBottom: '12px' }}
              />
            )}
          {geoError && (
            <Alert
              message="Không lấy được vị trí"
              description={geoError}
              type="error"
              showIcon
              style={{ marginBottom: '12px' }}
            />
          )}

            {suggestions.message && (
              <Alert
                message={suggestions.message}
                type="info"
                showIcon
                style={{ marginBottom: '16px' }}
              />
            )}

            {suggestions.suggestions.length === 0 ? (
              <Text type="secondary">Không có gợi ý thiết bị nào</Text>
            ) : (
              <List
                size="small"
                dataSource={suggestions.suggestions}
                renderItem={(item) => (
                  <List.Item>
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      <div>
                        <Text strong>{item.item_name}</Text>
                        <Tag
                          color={getPriorityColor(item.priority)}
                          style={{ marginLeft: '8px' }}
                        >
                          Ưu tiên {item.priority}
                        </Tag>
                      </div>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {item.reason}
                      </Text>
                      <Text type="secondary" style={{ fontSize: '11px' }}>
                        Danh mục: {item.category} | Còn lại: {item.quantity_available}
                      </Text>
                    </Space>
                  </List.Item>
                )}
              />
            )}
          </>
        )}
      </div>
    );

    return (
      <Popover
        content={content}
        title={
          <Space>
            <SafetyOutlined />
            <span>Gợi ý thiết bị bảo hộ</span>
            <Button
              type="text"
              size="small"
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
            />
            {enableGeo && (
              <Button
                type="text"
                size="small"
                icon={<EnvironmentOutlined />}
                onClick={handleUseMyLocation}
              />
            )}
          </Space>
        }
        trigger="click"
        open={visible}
        onOpenChange={setVisible}
        placement="bottomRight"
      >
        <Tooltip title="Xem gợi ý thiết bị bảo hộ theo thời tiết">
          <Button
            type="text"
            icon={<SafetyOutlined />}
            className={styles.suggestionButton}
          >
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Gợi ý PPE
            </Text>
          </Button>
        </Tooltip>
      </Popover>
    );
  }

  return (
    <Card
      size="small"
      className={styles.equipmentSuggestion}
      title={
        <Space>
          <SafetyOutlined />
          <span>Gợi ý thiết bị bảo hộ</span>
          <Button
            type="text"
            size="small"
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
          />
        </Space>
      }
    >
      {suggestionsStatus === 'loading' && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin />
        </div>
      )}

      {suggestionsStatus === 'failed' && (
        <Alert
          message="Lỗi"
          description={suggestionsError || 'Không thể tải gợi ý'}
          type="error"
          showIcon
        />
      )}

      {suggestionsStatus === 'succeeded' && suggestions && (
        <>
          {suggestions.message && (
            <Alert
              message={suggestions.message}
              type="info"
              showIcon
              style={{ marginBottom: '16px' }}
            />
          )}

          {suggestions.suggestions.length === 0 ? (
            <Text type="secondary">Không có gợi ý thiết bị nào</Text>
          ) : (
            <List
              size="small"
              dataSource={suggestions.suggestions}
              renderItem={(item) => (
                <List.Item>
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <div>
                      <Text strong>{item.item_name}</Text>
                      <Tag
                        color={getPriorityColor(item.priority)}
                        style={{ marginLeft: '8px' }}
                      >
                        Ưu tiên {item.priority}
                      </Tag>
                    </div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {item.reason}
                    </Text>
                    <Text type="secondary" style={{ fontSize: '11px' }}>
                      Danh mục: {item.category} | Còn lại: {item.quantity_available}
                    </Text>
                  </Space>
                </List.Item>
              )}
            />
          )}
        </>
      )}

      {suggestionsStatus === 'idle' && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <InfoCircleOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
          <div style={{ marginTop: '8px' }}>
            <Text type="secondary">Nhấn để xem gợi ý thiết bị</Text>
          </div>
        </div>
      )}
    </Card>
  );
};

export default EquipmentSuggestion;

