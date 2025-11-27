import React, { useEffect, useMemo, useState } from 'react';
import { Button, Form, Input, InputNumber, Modal, Select, Switch, Tooltip, Typography } from 'antd';
import { EnvironmentOutlined, SettingOutlined } from '@ant-design/icons';
import WeatherWidget from './WeatherWidget';
import { DEFAULT_WEATHER_REGION, WEATHER_REGION_OPTIONS } from '../../constants/weatherRegions';
import { DEFAULT_DAILY_PARAMS, type TemperatureUnit, type WindSpeedUnit } from '../../utils/weatherApiParams';
import type { UseWeatherOptions } from '../../hooks/useWeather';
import { useBrowserLocation } from '../../hooks/useBrowserLocation';
import styles from './WeatherWidgetControls.module.css';

const TEMPERATURE_UNIT_OPTIONS: { label: string; value: TemperatureUnit }[] = [
  { label: '°C - Celsius', value: 'celsius' },
  { label: '°F - Fahrenheit', value: 'fahrenheit' },
];

const WIND_SPEED_UNIT_OPTIONS: { label: string; value: WindSpeedUnit }[] = [
  { label: 'Km/h', value: 'kmh' },
  { label: 'm/s', value: 'ms' },
  { label: 'Mile/h', value: 'mph' },
  { label: 'Knots', value: 'kn' },
];

const DAILY_FIELD_OPTIONS = [
  { label: 'Mã thời tiết', value: 'weather_code' },
  { label: 'Nhiệt độ cao nhất', value: 'temperature_2m_max' },
  { label: 'Nhiệt độ thấp nhất', value: 'temperature_2m_min' },
  { label: 'Lượng mưa', value: 'precipitation_sum' },
  { label: 'Tốc độ gió tối đa', value: 'wind_speed_10m_max' },
  { label: 'Gió giật tối đa', value: 'wind_gusts_10m_max' },
  { label: 'Xác suất mưa tối đa', value: 'precipitation_probability_max' },
  { label: 'Chỉ số UV tối đa', value: 'uv_index_max' },
  { label: 'Bình minh', value: 'sunrise' },
  { label: 'Hoàng hôn', value: 'sunset' },
];

const buildInitialOptions = (): UseWeatherOptions => ({
  regionCode: DEFAULT_WEATHER_REGION.code,
  forecast_days: 7,
  temperature_unit: 'celsius',
  wind_speed_unit: 'kmh',
  daily: DEFAULT_DAILY_PARAMS,
});

const WeatherWidgetControls: React.FC = () => {
  const [options, setOptions] = useState<UseWeatherOptions>(buildInitialOptions);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const useCustomCoordinates = Form.useWatch<boolean>('useCustomCoordinates', form);
  const {
    coords,
    loading: locating,
    error: locationError,
    requestLocation,
    permission,
  } = useBrowserLocation();

  const hasCustomCoordinates = useMemo(() => options.latitude !== undefined || options.longitude !== undefined, [options.latitude, options.longitude]);

  const coordinateRule = (message: string) => ({
    validator(_: unknown, value: number | undefined) {
      if (!form.getFieldValue('useCustomCoordinates')) {
        return Promise.resolve();
      }

      if (typeof value === 'number') {
        return Promise.resolve();
      }

      return Promise.reject(new Error(message));
    },
  });

  const handleOpen = () => {
    form.setFieldsValue({
      ...options,
      useCustomCoordinates: hasCustomCoordinates,
    });
    setOpen(true);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const nextOptions: UseWeatherOptions = {
      regionCode: values.regionCode,
      daily: values.daily && values.daily.length > 0 ? values.daily : DEFAULT_DAILY_PARAMS,
      forecast_days: values.forecast_days ?? 7,
      temperature_unit: values.temperature_unit,
      wind_speed_unit: values.wind_speed_unit,
    };

    if (values.useCustomCoordinates) {
      nextOptions.latitude = values.latitude;
      nextOptions.longitude = values.longitude;
      nextOptions.timezone = values.timezone;
    } else {
      nextOptions.latitude = undefined;
      nextOptions.longitude = undefined;
      nextOptions.timezone = undefined;
    }

    setOptions(nextOptions);
    setOpen(false);
  };

  useEffect(() => {
    if (!coords) {
      return;
    }

    form.setFieldsValue({
      useCustomCoordinates: true,
      latitude: Number(coords.latitude.toFixed(4)),
      longitude: Number(coords.longitude.toFixed(4)),
      timezone: coords.timezone ?? DEFAULT_WEATHER_REGION.timezone,
    });
  }, [coords, form]);

  return (
    <div className={styles.wrapper}>
      <WeatherWidget {...options} />
      <Tooltip title="Tùy chỉnh dữ liệu thời tiết">
        <Button
          type="default"
          icon={<SettingOutlined />}
          className={styles.settingsButton}
          onClick={handleOpen}
        />
      </Tooltip>

      <Modal
        title="Tùy chỉnh widget thời tiết"
        open={open}
        onCancel={handleCancel}
        onOk={handleSubmit}
        okText="Lưu"
        cancelText="Hủy"
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            regionCode: options.regionCode,
            daily: options.daily ?? DEFAULT_DAILY_PARAMS,
            forecast_days: options.forecast_days ?? 7,
            temperature_unit: options.temperature_unit ?? 'celsius',
            wind_speed_unit: options.wind_speed_unit ?? 'kmh',
            useCustomCoordinates: hasCustomCoordinates,
            latitude: options.latitude,
            longitude: options.longitude,
            timezone: options.timezone ?? DEFAULT_WEATHER_REGION.timezone,
          }}
        >
          <Form.Item label="Khu vực" name="regionCode">
            <Select options={WEATHER_REGION_OPTIONS} placeholder="Chọn khu vực" />
          </Form.Item>

          <Form.Item label="Trường daily" name="daily">
            <Select
              mode="multiple"
              allowClear
              options={DAILY_FIELD_OPTIONS}
              placeholder="Chọn các trường cần lấy"
            />
          </Form.Item>

          <Form.Item label="Số ngày dự báo" name="forecast_days" rules={[{ type: 'number', min: 1, max: 16 }]}>
            <InputNumber min={1} max={16} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item label="Đơn vị nhiệt độ" name="temperature_unit">
            <Select options={TEMPERATURE_UNIT_OPTIONS} />
          </Form.Item>

          <Form.Item label="Đơn vị tốc độ gió" name="wind_speed_unit">
            <Select options={WIND_SPEED_UNIT_OPTIONS} />
          </Form.Item>

          <Form.Item
            label="Sử dụng tọa độ tùy chỉnh"
            name="useCustomCoordinates"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          <div className={styles.locationActions}>
            <Button
              type="default"
              icon={<EnvironmentOutlined />}
              onClick={requestLocation}
              loading={locating}
              disabled={permission === 'denied'}
            >
              Dùng vị trí hiện tại
            </Button>
            {locationError && (
              <Typography.Text type="danger" className={styles.locationError}>
                {locationError}
              </Typography.Text>
            )}
          </div>

          <div className={styles.advancedFields}>
            <Form.Item label="Vĩ độ" name="latitude" rules={[coordinateRule('Vui lòng nhập vĩ độ')]}>
              <InputNumber
                min={-90}
                max={90}
                precision={4}
                style={{ width: '100%' }}
                disabled={!useCustomCoordinates}
              />
            </Form.Item>
            <Form.Item label="Kinh độ" name="longitude" rules={[coordinateRule('Vui lòng nhập kinh độ')]}>
              <InputNumber
                min={-180}
                max={180}
                precision={4}
                style={{ width: '100%' }}
                disabled={!useCustomCoordinates}
              />
            </Form.Item>
            <Form.Item
              label="Múi giờ"
              name="timezone"
              rules={[
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!getFieldValue('useCustomCoordinates')) {
                      return Promise.resolve();
                    }

                    if (value) {
                      return Promise.resolve();
                    }

                    return Promise.reject(new Error('Vui lòng nhập múi giờ'));
                  },
                }),
              ]}
            >
              <Input placeholder="Ví dụ: Asia/Bangkok" disabled={!useCustomCoordinates} />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default WeatherWidgetControls;

