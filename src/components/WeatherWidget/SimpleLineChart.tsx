import React, { useMemo } from 'react';
import { Empty, Typography } from 'antd';
import styles from './WeatherChartsModal.module.css';

export interface LineChartPoint {
  label: string;
  value: number | null;
}

export interface LineSeries {
  name: string;
  color: string;
  points: LineChartPoint[];
}

interface SimpleLineChartProps {
  series: LineSeries[];
  height?: number;
  showAxis?: boolean;
}

const SimpleLineChart: React.FC<SimpleLineChartProps> = ({
  series,
  height = 200,
  showAxis = true,
}) => {
  const { paths, labels, min, max } = useMemo(() => {
    const values = series
      .flatMap((s) => s.points.map((p) => p.value))
      .filter((value): value is number => typeof value === 'number' && !Number.isNaN(value));

    if (!values.length) {
      return { paths: [], labels: [], min: 0, max: 0 };
    }

    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const range = maxValue - minValue || 1;
    const pointCount = Math.max(...series.map((s) => s.points.length));

    const buildPath = (points: LineChartPoint[]) => {
      if (!points.length) {
        return '';
      }

      return points
        .map((point, index) => {
          if (typeof point.value !== 'number' || Number.isNaN(point.value)) {
            return null;
          }

          const x =
            pointCount > 1 ? (index / (pointCount - 1)) * 100 : 50;
          const normalizedY =
            100 - ((point.value - minValue) / range) * 100;

          return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${normalizedY.toFixed(2)}`;
        })
        .filter(Boolean)
        .join(' ');
    };

    const pathsData = series.map((line) => ({
      color: line.color,
      name: line.name,
      path: buildPath(line.points),
    }));

    const axisLabels = series[0]?.points?.map((point) => point.label) ?? [];

    return {
      paths: pathsData,
      labels: axisLabels,
      min: minValue,
      max: maxValue,
    };
  }, [series]);

  if (!paths.length) {
    return <Empty description="Chưa có dữ liệu biểu đồ" />;
  }

  return (
    <div className={styles.chartWrapper}>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className={styles.chartSvg}
        style={{ height }}
      >
        <rect width="100" height="100" fill="url(#weatherChartBg)" />
        <defs>
          <linearGradient id="weatherChartBg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(24, 144, 255, 0.08)" />
            <stop offset="100%" stopColor="rgba(24, 144, 255, 0.02)" />
          </linearGradient>
        </defs>
        {paths.map((line) => (
          <path
            key={line.name}
            d={line.path}
            fill="none"
            stroke={line.color}
            strokeWidth={1.5}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ))}
      </svg>

      <div className={styles.legend}>
        {paths.map((line) => (
          <div key={line.name} className={styles.legendItem}>
            <span
              className={styles.legendColor}
              style={{ backgroundColor: line.color }}
            />
            <Typography.Text>{line.name}</Typography.Text>
          </div>
        ))}
      </div>

      {showAxis && (
        <div className={styles.axisLabels}>
          {labels.map((label, index) => (
            <span key={`${label}-${index}`}>{label}</span>
          ))}
        </div>
      )}

      <div className={styles.valueRange}>
        <Typography.Text type="secondary">
          Min: {Math.round(min)} • Max: {Math.round(max)}
        </Typography.Text>
      </div>
    </div>
  );
};

export default SimpleLineChart;


