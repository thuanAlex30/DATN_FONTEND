import React from 'react';
import { Card, Row, Col, Typography, Space, Tag, Table, Button, Tooltip } from 'antd';
import {
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useTrainingEnrollments } from '../../../hooks/useTraining';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

const EmployeeTrainingReview: React.FC = () => {
  const { enrollments, loading, fetchEnrollments } = useTrainingEnrollments();
  const user = useSelector((state: RootState) => (state as any).auth.user);
  const userId = (user as any)?._id || (user as any)?.id;

  const myEnrollments = enrollments.filter((e) => e.user_id?._id?.toString() === userId?.toString());

  const columns: ColumnsType<any> = [
    {
      title: 'Phiên',
      dataIndex: ['session_id', 'session_name'],
      key: 'session',
      render: (_: any, record: any) => record.session_id?.session_name || '—',
    },
    {
      title: 'Thời gian',
      key: 'time',
      render: (_: any, record: any) => (
        <Space direction="vertical" size={0}>
          <Text>{record.session_id?.start_time ? new Date(record.session_id.start_time).toLocaleString() : '—'}</Text>
          <Text type="secondary">
            {record.session_id?.end_time ? new Date(record.session_id.end_time).toLocaleString() : '—'}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Điểm',
      dataIndex: 'score',
      key: 'score',
      render: (score: number, record: any) => {
        if (score === null || score === undefined) return <Text type="secondary">Chưa có</Text>;
        const color = record.passed ? 'green' : 'red';
        return <Text style={{ color, fontWeight: 600 }}>{score}</Text>;
      },
    },
    {
      title: 'Kết quả',
      dataIndex: 'passed',
      key: 'passed',
      render: (passed: boolean) =>
        passed === true ? (
          <Tag icon={<CheckCircleOutlined />} color="success">
            Đạt
          </Tag>
        ) : passed === false ? (
          <Tag icon={<CloseCircleOutlined />} color="error">
            Chưa đạt
          </Tag>
        ) : (
          <Tag color="default">Chưa làm</Tag>
        ),
    },
    {
      title: 'Lượt đã làm',
      dataIndex: 'attempt_count',
      key: 'attempt',
      render: (v: number) => v ?? 0,
    },
    {
      title: 'Hoàn thành',
      dataIndex: 'completion_date',
      key: 'completion',
      render: (d: string) => (d ? new Date(d).toLocaleString() : '—'),
    },
  ];

  return (
    <div style={{ padding: 24, background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Card style={{ marginBottom: 16 }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Space direction="vertical" size={4}>
                <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
                  <UserOutlined style={{ marginRight: 8 }} />
                  Bài kiểm tra của tôi
                </Title>
                <Text type="secondary">
                  Ôn tập định kỳ (3 tháng/lần), không cấp chứng chỉ. Xem điểm và trạng thái bài kiểm tra.
                </Text>
              </Space>
            </Col>
            <Col>
              <Tooltip title="Làm mới">
                <Button icon={<ReloadOutlined />} onClick={fetchEnrollments} />
              </Tooltip>
            </Col>
          </Row>
        </Card>

        <Card
          title="Danh sách bài kiểm tra được giao"
          extra={
            <Space>
              <Tag icon={<ClockCircleOutlined />} color="blue">
                Tổng: {myEnrollments.length}
              </Tag>
              <Tag color="green" icon={<CheckCircleOutlined />}>
                Đạt: {myEnrollments.filter((e) => e.passed === true).length}
              </Tag>
              <Tag color="red" icon={<CloseCircleOutlined />}>
                Chưa đạt: {myEnrollments.filter((e) => e.passed === false).length}
              </Tag>
            </Space>
          }
        >
          <Table
            rowKey="_id"
            loading={loading}
            columns={columns}
            dataSource={myEnrollments}
            pagination={{ pageSize: 10 }}
          />
        </Card>
      </div>
    </div>
  );
};

export default EmployeeTrainingReview;

