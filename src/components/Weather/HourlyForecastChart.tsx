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
    // Visibility từ Open-Meteo API (đơn vị: mét), chuyển về km
    visibility: hour.visibility != null && !isNaN(hour.visibility) 
      ? Math.round((hour.visibility / 1000) * 10) / 10  // mét → km, làm tròn 1 chữ số thập phân
      : null,
    cloudcover: hour.cloudcover,
    isDay: hour.is_day,
    // Điểm sương (Dew Point) - quan trọng để xác định nguy cơ sương mù
    dewpoint: hour.dewpoint_2m != null && !isNaN(hour.dewpoint_2m)
      ? Math.round(hour.dewpoint_2m * 10) / 10
      : null,
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
            {data.dewpoint != null && (
              <div>🌫️ Điểm sương: <strong>{data.dewpoint}°C</strong></div>
            )}
            {data.temperature != null && data.dewpoint != null && (
              <div style={{ 
                marginTop: '4px', 
                padding: '4px 8px', 
                borderRadius: '4px',
                backgroundColor: (data.temperature - data.dewpoint) < 2.5 ? '#fff2f0' : '#f6ffed',
                color: (data.temperature - data.dewpoint) < 2.5 ? '#ff4d4f' : '#52c41a',
                fontSize: '11px'
              }}>
                {(data.temperature - data.dewpoint) < 2.5 
                  ? '⚠️ Nguy cơ sương mù cao!' 
                  : '✅ Không có sương mù'}
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Temperature chart
  const TemperatureChart = () => {
    // Tính domain để luôn hiển thị cả 2 đường tham chiếu (Nóng: 30, Lạnh: 15)
    const tempValues = chartData
      .flatMap(d => [d.temperature, d.apparentTemperature])
      .filter(v => v != null) as number[];
    const minTemp = tempValues.length > 0 ? Math.min(...tempValues) : 15;
    const maxTemp = tempValues.length > 0 ? Math.max(...tempValues) : 30;
    // Domain: min(dữ liệu, 15) - 5 đến max(dữ liệu, 30) + 5
    const tempDomain = [Math.min(minTemp, 15) - 5, Math.max(maxTemp, 30) + 5];

    return (
    <div>
      <div style={{ marginBottom: '12px', padding: '8px 12px', backgroundColor: '#f5f5f5', borderRadius: '6px', fontSize: '12px' }}>
        💡 Đường <span style={{ color: '#ff4d4f' }}>đỏ</span> = Nhiệt độ thực, đường <span style={{ color: '#faad14' }}>vàng nét đứt</span> = Nhiệt độ cảm nhận. Cột <span style={{ color: '#1890ff' }}>xanh</span> = Lượng mưa. Khi có mưa (cột xanh cao) → nhiệt độ thường giảm.
      </div>
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
          domain={tempDomain}
          tickFormatter={(value) => Math.round(value).toString()}
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
    </div>
    );
  };

  // Wind chart
  const WindChart = () => {
    // Kiểm tra xem có dữ liệu gió không (windspeed = 0 vẫn là dữ liệu hợp lệ)
    const hasWindData = chartData.some(d => d.windspeed != null && d.windspeed !== undefined);
    const hasWindGustsData = chartData.some(d => d.windgusts != null && d.windgusts !== undefined);
    
    // Domain cố định để luôn hiển thị cả 2 đường tham chiếu (Gió mạnh: 30, Rất mạnh: 40)
    const yAxisDomain = [0, 45];

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
      <div>
        <div style={{ marginBottom: '12px', padding: '8px 12px', backgroundColor: '#f5f5f5', borderRadius: '6px', fontSize: '12px' }}>
          💡 Cột/đường <span style={{ color: '#52c41a' }}>xanh lá</span> = Tốc độ gió trung bình. Đường <span style={{ color: '#ff4d4f' }}>đỏ nét đứt</span> = Gió giật (đột ngột). Vượt ngưỡng <strong>30 km/h</strong> = gió mạnh, <strong>40 km/h</strong> = rất mạnh (nguy hiểm cho công trình).
        </div>
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
              ticks={[0, 10, 20, 30, 40]}
              tickFormatter={(value) => Math.round(value).toString()}
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
      </div>
    );
  };

  // UV and Cloud chart (UV & Mây) - Mây che nắng → giảm UV
  const UVCloudChart = () => {
    const uvValues = chartData
      .map(d => d.uvIndex != null && !isNaN(d.uvIndex) ? d.uvIndex : null)
      .filter(v => v !== null);
    const cloudcoverValues = chartData
      .map(d => d.cloudcover != null && !isNaN(d.cloudcover) ? d.cloudcover : null)
      .filter(v => v !== null);

    const hasUVData = uvValues.length > 0;
    const hasCloudData = cloudcoverValues.length > 0;

    if (!hasUVData && !hasCloudData) {
      return (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Alert
            message="Không có dữ liệu"
            description="Dữ liệu UV và mây không khả dụng cho khoảng thời gian này."
            type="info"
            showIcon
          />
        </div>
      );
    }

    return (
      <div>
        <div style={{ marginBottom: '12px', padding: '8px 12px', backgroundColor: '#f5f5f5', borderRadius: '6px', fontSize: '12px' }}>
          💡 Đường <span style={{ color: '#fa8c16' }}>cam</span> = Chỉ số UV (0-12). Cột <span style={{ color: '#8c8c8c' }}>xám</span> = Độ che phủ mây (%). Khi mây tăng (cột xám cao) → UV giảm (đường cam xuống). UV {">"} 6 = <strong>cao</strong>, {">"} 8 = <strong>rất cao</strong> (cần bảo vệ da).
        </div>
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
              domain={[0, 12]}
              ticks={[0, 2, 4, 6, 8, 10, 12]}
              tickFormatter={(value) => Math.round(value).toString()}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              label={{ value: 'Mây (%)', angle: 90, position: 'insideRight' }}
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              tick={{ fontSize: 11 }}
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
            {hasCloudData && (
              <Bar 
                yAxisId="right"
                dataKey="cloudcover" 
                fill="#d9d9d9" 
                name="Mây (%)"
                radius={[4, 4, 0, 0]}
                opacity={0.5}
              />
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

  // Visibility & Dew Point chart (Tầm nhìn & Điểm sương)
  // Khi Nhiệt độ ≈ Điểm sương → Sương mù hình thành → Tầm nhìn giảm
  const VisibilityChart = () => {
    const visibilityValues = chartData
      .map(d => d.visibility != null ? d.visibility : null)
      .filter(v => v != null);
    const tempValues = chartData
      .map(d => d.temperature != null ? d.temperature : null)
      .filter(v => v != null);
    const dewpointValues = chartData
      .map(d => d.dewpoint != null ? d.dewpoint : null)
      .filter(v => v != null);
    
    // Domain cho visibility (km)
    const maxVisibility = visibilityValues.length > 0 
      ? Math.max(...(visibilityValues as number[])) 
      : 20;
    const visibilityDomain = [0, Math.max(maxVisibility, 20)];

    // Domain cho nhiệt độ (°C)
    const allTempValues = [...(tempValues as number[]), ...(dewpointValues as number[])];
    const minTemp = allTempValues.length > 0 ? Math.min(...allTempValues) : 0;
    const maxTemp = allTempValues.length > 0 ? Math.max(...allTempValues) : 40;
    const tempDomain = [Math.floor(minTemp - 5), Math.ceil(maxTemp + 5)];

    const hasVisibilityData = visibilityValues.length > 0;
    const hasTempData = tempValues.length > 0;
    const hasDewpointData = dewpointValues.length > 0;

    if (!hasVisibilityData && !hasTempData && !hasDewpointData) {
      return (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Alert
            message="Không có dữ liệu"
            description="Dữ liệu tầm nhìn và điểm sương không khả dụng cho khoảng thời gian này."
            type="info"
            showIcon
          />
        </div>
      );
    }

    return (
      <div>
        <div style={{ marginBottom: '12px', padding: '8px 12px', backgroundColor: '#f5f5f5', borderRadius: '6px', fontSize: '12px' }}>
          💡 Khi đường <span style={{ color: '#ff4d4f' }}>Nhiệt độ</span> tiến gần đường <span style={{ color: '#1890ff' }}>Điểm sương</span> (khoảng cách {"<"} 2.5°C) → <strong>Sương mù hình thành</strong> → Tầm nhìn giảm
        </div>
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
              tickCount={6}
              tickFormatter={(value) => Math.round(value).toString()}
              tick={{ fontSize: 11 }}
            />
            <YAxis 
              yAxisId="temp"
              orientation="right"
              label={{ value: 'Nhiệt độ (°C)', angle: 90, position: 'insideRight' }}
              domain={tempDomain}
              tickCount={6}
              tickFormatter={(value) => Math.round(value).toString()}
              tick={{ fontSize: 11 }}
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
              <Line 
                yAxisId="visibility"
                type="monotone" 
                dataKey="visibility" 
                stroke="#722ed1" 
                strokeWidth={3}
                dot={{ r: 4, fill: '#722ed1' }}
                activeDot={{ r: 6 }}
                name="Tầm nhìn (km)"
              />
            )}
            {hasTempData && (
              <Line 
                yAxisId="temp"
                type="monotone" 
                dataKey="temperature" 
                stroke="#ff4d4f" 
                strokeWidth={2}
                dot={{ r: 3, fill: '#ff4d4f' }}
                activeDot={{ r: 5 }}
                name="Nhiệt độ (°C)"
              />
            )}
            {hasDewpointData && (
              <Line 
                yAxisId="temp"
                type="monotone" 
                dataKey="dewpoint" 
                stroke="#1890ff" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 3, fill: '#1890ff' }}
                activeDot={{ r: 5 }}
                name="Điểm sương (°C)"
              />
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
      </div>
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
      label: '☀️ UV & Mây',
      children: <UVCloudChart />,
    },
    {
      key: 'visibility',
      label: '🌫️ Tầm nhìn & Điểm sương',
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

