import React from 'react';
import { Card, Row, Col, Statistic, Progress, Typography } from 'antd';
import { 
  BarChartOutlined, 
  TrophyOutlined, 
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';

const { Text } = Typography;

interface TrainingChartsProps {
  totalEmployees: number;
  completedEnrollments: number;
  inProgressEnrollments: number;
  failedEnrollments: number;
  completionRate: number;
}

const TrainingCharts: React.FC<TrainingChartsProps> = ({
  totalEmployees,
  completedEnrollments,
  inProgressEnrollments,
  failedEnrollments,
  completionRate
}) => {
  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Báo cáo tiến độ">
            <div style={{ padding: '20px' }}>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Statistic
                    title="Tổng nhân viên"
                    value={totalEmployees}
                    prefix={<UserOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Hoàn thành"
                    value={completedEnrollments}
                    prefix={<CheckCircleOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Đang học"
                    value={inProgressEnrollments}
                    prefix={<ClockCircleOutlined />}
                    valueStyle={{ color: '#fa8c16' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Chưa đạt"
                    value={failedEnrollments}
                    prefix={<ExclamationCircleOutlined />}
                    valueStyle={{ color: '#ff4d4f' }}
                  />
                </Col>
              </Row>
              <div style={{ marginTop: '20px' }}>
                <Text strong>Tỷ lệ hoàn thành tổng thể</Text>
                <Progress 
                  percent={completionRate} 
                  strokeColor={{
                    '0%': '#ff4d4f',
                    '50%': '#fa8c16',
                    '100%': '#52c41a',
                  }}
                  style={{ marginTop: '8px' }}
                />
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Báo cáo kết quả">
            <div style={{ padding: '20px' }}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <TrophyOutlined style={{ fontSize: '48px', color: '#52c41a' }} />
                <div style={{ marginTop: '16px' }}>
                  <Text strong style={{ fontSize: '18px' }}>
                    Tỷ lệ hoàn thành: {completionRate.toFixed(1)}%
                  </Text>
                </div>
              </div>
              
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <div style={{ 
                    background: '#f0f2f5', 
                    padding: '16px', 
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <Text type="secondary" style={{ fontSize: '14px' }}>
                      Thống kê chi tiết
                    </Text>
                    <div style={{ marginTop: '8px' }}>
                      <Text>
                        <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '4px' }} />
                        Hoàn thành: {completedEnrollments} người
                      </Text>
                      <br />
                      <Text>
                        <ClockCircleOutlined style={{ color: '#fa8c16', marginRight: '4px' }} />
                        Đang học: {inProgressEnrollments} người
                      </Text>
                      <br />
                      <Text>
                        <ExclamationCircleOutlined style={{ color: '#ff4d4f', marginRight: '4px' }} />
                        Chưa đạt: {failedEnrollments} người
                      </Text>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default TrainingCharts;
