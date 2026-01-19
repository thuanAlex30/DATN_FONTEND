import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Typography, Spin, Alert, Tabs } from 'antd';
import {
  Line,
  Bar,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { fetchHourly } from '../../store/slices/weatherSlice';
import type { RootState } from '../../store';
import styles from './HourlyForecastChart.module.css';

const { Text, Title } = Typography;

interface HourlyForecastChartProps {
  latitude?: number;
  longitude?: number;
  hours?: number; // Default 24 hours
}

const HourlyForecastChart: React.FC<HourlyForecastChartProps> = ({
  latitude,
  longitude,
  hours = 24,
}) => {
  const dispatch = useDispatch();
  const { hourly, hourlyStatus, hourlyError } = useSelector(
    (state: RootState) => state.weather
  );

  useEffect(() => {
    // Skip if coordinates are invalid
    if (latitude == null || longitude == null || isNaN(latitude) || isNaN(longitude)) {
      // Only fetch with default location if coordinates are explicitly missing
      // Don't fetch on initial mount with invalid coordinates
      return;
    }

    // Only fetch if coordinates are valid numbers
    if (isFinite(latitude) && isFinite(longitude)) {
      dispatch(fetchHourly({ latitude, longitude, hours }) as any);
    }
  }, [dispatch, latitude, longitude, hours]);

  const formatTime = (timeString: string): string => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const formatTooltipTime = (timeString: string): string => {
    const date = new Date(timeString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (hourlyStatus === 'loading') {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <Spin />
        <div style={{ marginTop: '10px' }}>
          <Text type="secondary">Đang tải dữ liệu...</Text>
        </div>
      </div>
    );
  }

  if (hourlyStatus === 'failed' || !hourly) {
    return (
      <Alert
        message="Lỗi"
        description={hourlyError || 'Không thể tải dữ liệu'}
        type="error"
        showIcon
      />
    );
  }

  // Kiểm tra dữ liệu hourly
  if (!hourly.hourly || hourly.hourly.length === 0) {
    return (
      <Alert
        message="Không có dữ liệu"
        description="Không có dữ liệu thời tiết theo giờ để hiển thị"
        type="warning"
        showIcon
      />
    );
  }

  // Prepare chart data
  const chartData = hourly.hourly.map((hour) => ({
    time: formatTime(hour.time),
    fullTime: hour.time,
    temperature: hour.temperature_2m != null ? Math.round(hour.temperature_2m) : null,
    apparentTemperature: hour.apparent_temperature != null ? Math.round(hour.apparent_temperature) : null,
    precipitation: hour.precipitation || 0,
    // Xử lý windspeed: 0 là giá trị hợp lệ, chỉ null/undefined mới không có dữ liệu
    windspeed: hour.windspeed_10m != null && !isNaN(hour.windspeed_10m) 
      ? Math.round(hour.windspeed_10m) 
      : (hour.windspeed_10m === 0 ? 0 : null), // Giữ 0 nếu là 0, null nếu thực sự không có
    windgusts: hour.windgusts_10m != null && !isNaN(hour.windgusts_10m) 
      ? Math.round(hour.windgusts_10m) 
      : null,
    uvIndex: hour.uv_index != null && !isNaN(hour.uv_index) 
      ? Math.round(hour.uv_index * 10) / 10 
      : null,
    humidity: hour.relativehumidity_2m != null && !isNaN(hour.relativehumidity_2m)
      ? hour.relativehumidity_2m
      : null,
    visibility: hour.visibility != null && hour.visibility < 100 ? Math.round(hour.visibility * 10) / 10 : null,
    cloudcover: hour.cloudcover,
    isDay: hour.is_day,
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className={styles.tooltip}>
          <Text strong>{formatTooltipTime(data.fullTime)}</Text>
          <div style={{ marginTop: '8px' }}>
            {data.temperature != null && (
              <div>🌡️ Nhiệt độ: <strong>{data.temperature}°C</strong></div>
            )}
            {data.apparentTemperature != null && data.apparentTemperature !== data.temperature && (
              <div>Cảm nhận: <strong>{data.apparentTemperature}°C</strong></div>
            )}
            {data.precipitation > 0 && (
              <div>💧 Mưa: <strong>{data.precipitation.toFixed(1)}mm</strong></div>
            )}
            {data.windspeed != null && (
              <div>💨 Gió: <strong>{data.windspeed}km/h</strong></div>
            )}
            {data.windgusts != null && (
              <div>🌪️ Gió giật: <strong>{data.windgusts}km/h</strong></div>
            )}
            {data.uvIndex != null && (
              <div>☀️ UV: <strong>{data.uvIndex}</strong></div>
            )}
            {data.humidity != null && (
              <div>💧 Độ ẩm: <strong>{data.humidity}%</strong></div>
            )}
            {data.visibility != null && data.visibility < 100 && (
              <div>👁️ Tầm nhìn: <strong>{data.visibility.toFixed(1)}km</strong></div>
            )}
            {data.cloudcover != null && (
              <div>☁️ Mây: <strong>{data.cloudcover}%</strong></div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Temperature chart
  const TemperatureChart = () => (
    <ResponsiveContainer width="100%" height={350}>
      <ComposedChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="time" 
          tick={{ fontSize: 11 }}
          angle={-45}
          textAnchor="end"
          height={70}
          interval="preserveStartEnd"
        />
        <YAxis 
          yAxisId="temp"
          label={{ value: 'Nhiệt độ (°C)', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip 
          content={<CustomTooltip />} 
          wrapperStyle={{ zIndex: 9999 }}
          position={{ y: -10 }}
        />
        <Legend 
          wrapperStyle={{ paddingTop: '20px' }}
          verticalAlign="bottom"
        />
        <Bar 
          yAxisId="temp"
          dataKey="precipitation" 
          fill="#1890ff" 
          name="Mưa (mm)"
          radius={[4, 4, 0, 0]}
        />
        <Line 
          yAxisId="temp"
          type="monotone" 
          dataKey="temperature" 
          stroke="#ff4d4f" 
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
          name="Nhiệt độ (°C)"
        />
        <Line 
          yAxisId="temp"
          type="monotone" 
          dataKey="apparentTemperature" 
          stroke="#faad14" 
          strokeWidth={2}
          strokeDasharray="5 5"
          dot={{ r: 3 }}
          name="Cảm nhận (°C)"
        />
        <ReferenceLine 
          yAxisId="temp" 
          y={30} 
          stroke="#ff4d4f" 
          strokeDasharray="3 3" 
          label={{ value: "Nóng", position: "top", offset: 5 }} 
        />
        <ReferenceLine 
          yAxisId="temp" 
          y={15} 
          stroke="#1890ff" 
          strokeDasharray="3 3" 
          label={{ value: "Lạnh", position: "bottom", offset: 5 }} 
        />
      </ComposedChart>
    </ResponsiveContainer>
  );

  // Wind chart
  const WindChart = () => {
    // Kiểm tra xem có dữ liệu gió không (windspeed = 0 vẫn là dữ liệu hợp lệ)
    const hasWindData = chartData.some(d => d.windspeed != null && d.windspeed !== undefined);
    const hasWindGustsData = chartData.some(d => d.windgusts != null && d.windgusts !== undefined);
    
    // Tính toán max values, bao gồm cả 0
    const windSpeeds = chartData.map(d => d.windspeed != null ? d.windspeed : 0);
    const windGusts = chartData.map(d => d.windgusts != null ? d.windgusts : 0);
    const maxWindSpeed = Math.max(...windSpeeds, 0);
    const maxWindGusts = Math.max(...windGusts, 0);
    
    // Domain tối thiểu là 10 để hiển thị rõ hơn, hoặc dựa trên max value
    const maxValue = Math.max(maxWindSpeed, maxWindGusts, 10);
    const yAxisDomain = [0, maxValue * 1.1]; // Thêm 10% padding

    // Chỉ báo không có dữ liệu khi thực sự không có field (null/undefined)
    if (!hasWindData && !hasWindGustsData) {
      return (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Alert
            message="Không có dữ liệu gió"
            description="Dữ liệu tốc độ gió không khả dụng cho khoảng thời gian này."
            type="info"
            showIcon
          />
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 11 }}
            angle={-45}
            textAnchor="end"
            height={70}
            interval="preserveStartEnd"
          />
          <YAxis 
            label={{ value: 'Tốc độ (km/h)', angle: -90, position: 'insideLeft' }}
            domain={yAxisDomain}
          />
          <Tooltip 
            content={<CustomTooltip />} 
            wrapperStyle={{ zIndex: 9999 }}
            position={{ y: -10 }}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            verticalAlign="bottom"
          />
          {hasWindData && (
            <>
              <Bar 
                dataKey="windspeed" 
                fill="#52c41a" 
                name="Gió (km/h)"
                radius={[4, 4, 0, 0]}
                opacity={0.6}
              />
              <Line 
                type="monotone" 
                dataKey="windspeed" 
                stroke="#52c41a" 
                strokeWidth={3}
                dot={{ r: 5, fill: '#52c41a' }}
                activeDot={{ r: 7 }}
                name="Gió (km/h)"
              />
            </>
          )}
          {hasWindGustsData && (
            <Line 
              type="monotone" 
              dataKey="windgusts" 
              stroke="#ff4d4f" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 4, fill: '#ff4d4f' }}
              activeDot={{ r: 6 }}
              name="Gió giật (km/h)"
            />
          )}
          <ReferenceLine 
            y={30} 
            stroke="#faad14" 
            strokeDasharray="3 3" 
            label={{ value: "Gió mạnh", position: "top", offset: 5 }} 
          />
          <ReferenceLine 
            y={40} 
            stroke="#ff4d4f" 
            strokeDasharray="3 3" 
            label={{ value: "Rất mạnh", position: "top", offset: 5 }} 
          />
        </ComposedChart>
      </ResponsiveContainer>
    );
  };

  // UV and Humidity chart
  const UVHumidityChart = () => {
    // Kiểm tra và tính toán domain
    // Filter để loại bỏ null/undefined, nhưng giữ 0 (0% độ ẩm hoặc UV = 0 là hợp lệ)
    const uvValues = chartData
      .map(d => d.uvIndex != null && d.uvIndex !== undefined && !isNaN(d.uvIndex) ? d.uvIndex : null)
      .filter(v => v !== null && v !== undefined);
    const humidityValues = chartData
      .map(d => d.humidity != null && d.humidity !== undefined && !isNaN(d.humidity) ? d.humidity : null)
      .filter(v => v !== null && v !== undefined);
    
    // Debug log để kiểm tra dữ liệu (chỉ log khi không có dữ liệu)
    if (uvValues.length === 0 && humidityValues.length === 0) {
      console.warn('UVHumidityChart: No UV or Humidity data found', {
        chartDataLength: chartData.length,
        sampleChartData: chartData.slice(0, 3).map(d => ({ 
          time: d.time, 
          uvIndex: d.uvIndex, 
          humidity: d.humidity 
        })),
        sampleRawData: hourly.hourly?.slice(0, 3).map(h => ({
          time: h.time,
          uv_index: h.uv_index,
          relativehumidity_2m: h.relativehumidity_2m
        })),
        allUVValues: chartData.map(d => d.uvIndex),
        allHumidityValues: chartData.map(d => d.humidity)
      });
    }
    
    const maxUV = uvValues.length > 0 ? Math.max(...uvValues) : 11;
    const maxHumidity = humidityValues.length > 0 ? Math.max(...humidityValues, 100) : 100;
    
    // Domain cho UV Index (thường 0-11)
    const uvDomain = [0, Math.max(maxUV, 11) * 1.1];
    // Domain cho Humidity (%)
    const humidityDomain = [0, 100];

    const hasUVData = uvValues.length > 0;
    const hasHumidityData = humidityValues.length > 0;

    // Hiển thị cảnh báo nếu không có cả 2 metrics
    if (!hasUVData && !hasHumidityData) {
      return (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Alert
            message="Không có dữ liệu"
            description={
              <div>
                <div>Dữ liệu UV và độ ẩm không khả dụng cho khoảng thời gian này.</div>
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#8c8c8c' }}>
                  Có thể do API không trả về dữ liệu cho vị trí này. Vui lòng thử lại sau.
                </div>
              </div>
            }
            type="info"
            showIcon
          />
        </div>
      );
    }

    // Hiển thị cảnh báo nếu thiếu 1 trong 2 metrics
    const missingDataWarning = (!hasUVData || !hasHumidityData) ? (
      <div style={{ marginBottom: '16px' }}>
        <Alert
          message={!hasUVData ? "Thiếu dữ liệu UV Index" : "Thiếu dữ liệu Độ ẩm"}
          description={`Chỉ hiển thị ${hasUVData ? 'UV Index' : ''}${hasUVData && hasHumidityData ? ' và ' : ''}${hasHumidityData ? 'Độ ẩm' : ''}.`}
          type="warning"
          showIcon
          closable
        />
      </div>
    ) : null;

    return (
      <div>
        {missingDataWarning}
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 11 }}
              angle={-45}
              textAnchor="end"
              height={70}
              interval="preserveStartEnd"
            />
            <YAxis 
              yAxisId="left"
              label={{ value: 'UV Index', angle: -90, position: 'insideLeft' }}
              domain={uvDomain}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              label={{ value: 'Độ ẩm (%)', angle: 90, position: 'insideRight' }}
              domain={humidityDomain}
            />
            <Tooltip 
              content={<CustomTooltip />} 
              wrapperStyle={{ zIndex: 9999 }}
              position={{ y: -10 }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              verticalAlign="bottom"
            />
          {hasHumidityData && (
            <>
              <Bar 
                yAxisId="right"
                dataKey="humidity" 
                fill="#91d5ff" 
                name="Độ ẩm (%)"
                radius={[4, 4, 0, 0]}
                opacity={0.6}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="humidity" 
                stroke="#1890ff" 
                strokeWidth={2}
                strokeDasharray="3 3"
                dot={{ r: 4, fill: '#1890ff' }}
                activeDot={{ r: 6 }}
                name="Độ ẩm (%)"
              />
            </>
          )}
          {hasUVData && (
            <>
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="uvIndex" 
                stroke="#fa8c16" 
                strokeWidth={3}
                dot={{ r: 5, fill: '#fa8c16' }}
                activeDot={{ r: 7 }}
                name="UV Index"
              />
              <ReferenceLine 
                yAxisId="left" 
                y={6} 
                stroke="#faad14" 
                strokeDasharray="3 3" 
                label={{ value: "UV Cao", position: "top", offset: 5 }} 
              />
              <ReferenceLine 
                yAxisId="left" 
                y={8} 
                stroke="#ff4d4f" 
                strokeDasharray="3 3" 
                label={{ value: "Rất cao", position: "top", offset: 5 }} 
              />
            </>
          )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    );
  };

  // Visibility chart
  const VisibilityChart = () => {
    // Kiểm tra và tính toán domain cho Y-axis
    const visibilityValues = chartData
      .map(d => d.visibility != null ? d.visibility : null)
      .filter(v => v != null);
    const cloudcoverValues = chartData
      .map(d => d.cloudcover != null ? d.cloudcover : null)
      .filter(v => v != null);
    
    const maxVisibility = visibilityValues.length > 0 ? Math.max(...visibilityValues) : 10;
    const maxCloudcover = cloudcoverValues.length > 0 ? Math.max(...cloudcoverValues, 100) : 100;
    
    // Domain cho visibility (km) - thường từ 0-20km
    const visibilityDomain = [0, Math.max(maxVisibility, 20) * 1.1];
    
    // Domain cho cloudcover (%) - từ 0-100
    const cloudcoverDomain = [0, 100];

    const hasVisibilityData = visibilityValues.length > 0;
    const hasCloudcoverData = cloudcoverValues.length > 0;

    if (!hasVisibilityData && !hasCloudcoverData) {
      return (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Alert
            message="Không có dữ liệu"
            description="Dữ liệu tầm nhìn và mây không khả dụng cho khoảng thời gian này."
            type="info"
            showIcon
          />
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 11 }}
            angle={-45}
            textAnchor="end"
            height={70}
            interval="preserveStartEnd"
          />
          <YAxis 
            yAxisId="visibility"
            label={{ value: 'Tầm nhìn (km)', angle: -90, position: 'insideLeft' }}
            domain={visibilityDomain}
          />
          <YAxis 
            yAxisId="cloudcover"
            orientation="right"
            label={{ value: 'Mây (%)', angle: 90, position: 'insideRight' }}
            domain={cloudcoverDomain}
          />
        <Tooltip 
          content={<CustomTooltip />} 
          wrapperStyle={{ zIndex: 9999 }}
          position={{ y: -10 }}
        />
        <Legend 
          wrapperStyle={{ paddingTop: '20px' }}
          verticalAlign="bottom"
        />
          {hasVisibilityData && (
            <>
              <Bar 
                yAxisId="visibility"
                dataKey="visibility" 
                fill="#722ed1" 
                name="Tầm nhìn (km)"
                radius={[4, 4, 0, 0]}
                opacity={0.6}
              />
              <Line 
                yAxisId="visibility"
                type="monotone" 
                dataKey="visibility" 
                stroke="#722ed1" 
                strokeWidth={3}
                dot={{ r: 5, fill: '#722ed1' }}
                activeDot={{ r: 7 }}
                name="Tầm nhìn (km)"
              />
            </>
          )}
          {hasCloudcoverData && (
            <>
              <Bar 
                yAxisId="cloudcover"
                dataKey="cloudcover" 
                fill="#d9d9d9" 
                name="Mây (%)"
                radius={[4, 4, 0, 0]}
                opacity={0.4}
              />
              <Line 
                yAxisId="cloudcover"
                type="monotone" 
                dataKey="cloudcover" 
                stroke="#8c8c8c" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 4, fill: '#8c8c8c' }}
                activeDot={{ r: 6 }}
                name="Mây (%)"
              />
            </>
          )}
          {hasVisibilityData && (
            <>
              <ReferenceLine 
                yAxisId="visibility"
                y={1} 
                stroke="#ff4d4f" 
                strokeDasharray="3 3" 
                label={{ value: "Tầm nhìn kém", position: "top", offset: 5 }} 
              />
              <ReferenceLine 
                yAxisId="visibility"
                y={5} 
                stroke="#faad14" 
                strokeDasharray="3 3" 
                label={{ value: "Tầm nhìn TB", position: "top", offset: 5 }} 
              />
            </>
          )}
        </ComposedChart>
      </ResponsiveContainer>
    );
  };

  const tabItems = [
    {
      key: 'temperature',
      label: '🌡️ Nhiệt độ & Mưa',
      children: <TemperatureChart />,
    },
    {
      key: 'wind',
      label: '💨 Gió',
      children: <WindChart />,
    },
    {
      key: 'uv',
      label: '☀️ UV & Độ ẩm',
      children: <UVHumidityChart />,
    },
    {
      key: 'visibility',
      label: '👁️ Tầm nhìn & Mây',
      children: <VisibilityChart />,
    },
  ];

  return (
    <div className={styles.hourlyChart}>
      <Title level={5} style={{ marginBottom: '16px' }}>
        Biểu đồ dự báo {hours}h tới
      </Title>
      {hourly.stale && (
        <Alert
          message="Đang dùng dữ liệu cache"
          description="Dữ liệu có thể không cập nhật mới nhất"
          type="warning"
          showIcon
          style={{ marginBottom: '16px' }}
        />
      )}
      <Tabs items={tabItems} defaultActiveKey="temperature" />
    </div>
  );
};

export default HourlyForecastChart;

