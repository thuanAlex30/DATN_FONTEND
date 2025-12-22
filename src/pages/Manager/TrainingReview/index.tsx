import React, { useMemo } from 'react';
import { Card, Row, Col, Typography, Space, Tag, Table, Button, Tooltip } from 'antd';
import {
  CalendarOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
  QuestionCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { useTrainingSessions, useTrainingEnrollments, useQuestionBanks } from '../../../hooks/useTraining';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

const ManagerTrainingReview: React.FC = () => {
  const { sessions, loading: sessionsLoading, fetchSessions } = useTrainingSessions();
  const { enrollments, loading: enrollmentsLoading, fetchEnrollments } = useTrainingEnrollments();
  const { questionBanks, loading: banksLoading, fetchQuestionBanks } = useQuestionBanks();

  const sessionColumns: ColumnsType<any> = [
    {
      title: 'Phiên',
      dataIndex: 'session_name',
      key: 'session_name',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Khóa học',
      dataIndex: ['course_id', 'course_name'],
      key: 'course',
      render: (_: any, record: any) => record.course_id?.course_name || '—',
    },
    {
      title: 'Thời gian',
      key: 'time',
      render: (_: any, record: any) => (
        <Space direction="vertical" size={0}>
          <Text>{new Date(record.start_time).toLocaleString()}</Text>
          <Text type="secondary">{new Date(record.end_time).toLocaleString()}</Text>
        </Space>
      ),
    },
    {
      title: 'Ngưỡng đạt',
      dataIndex: 'pass_threshold',
      key: 'threshold',
      render: (v: number) => <Tag color="blue">{v ?? 70}%</Tag>,
    },
    {
      title: 'Lượt tối đa',
      dataIndex: 'max_attempts',
      key: 'attempts',
      render: (v: number) => v ?? 1,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status_code',
      key: 'status',
      render: (s: string) => {
        const color =
          s === 'SCHEDULED'
            ? 'blue'
            : s === 'ONGOING'
            ? 'green'
            : s === 'COMPLETED'
            ? 'success'
            : 'red';
        return <Tag color={color}>{s}</Tag>;
      },
    },
  ];

  const enrollmentColumns: ColumnsType<any> = [
    {
      title: 'Nhân viên',
      dataIndex: ['user_id', 'full_name'],
      key: 'user',
      render: (text: string, record: any) => (
        <Space>
          <UserOutlined />
          <Space direction="vertical" size={0}>
            <Text strong>{text || '—'}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.user_id?.email || '—'}
            </Text>
          </Space>
        </Space>
      ),
    },
    {
      title: 'Phiên',
      dataIndex: ['session_id', 'session_name'],
      key: 'session',
      render: (_: any, record: any) => record.session_id?.session_name || '—',
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

  const summary = useMemo(() => {
    const total = enrollments.length;
    const passed = enrollments.filter((e) => e.passed === true).length;
    const failed = enrollments.filter((e) => e.passed === false).length;
    return { total, passed, failed };
  }, [enrollments]);

  return (
    <div style={{ padding: 24, background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <Card style={{ marginBottom: 16 }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Space direction="vertical" size={4}>
                <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
                  <CalendarOutlined style={{ marginRight: 8 }} />
                  Bài kiểm tra định kỳ (Manager)
                </Title>
                <Text type="secondary">
                  Ôn tập theo quý (3 tháng/lần), không cấp chứng chỉ. Theo dõi phiên kiểm tra và kết quả.
                </Text>
              </Space>
            </Col>
            <Col>
              <Space>
                <Tooltip title="Làm mới dữ liệu">
                  <Button icon={<ReloadOutlined />} onClick={() => { fetchSessions(); fetchEnrollments(); fetchQuestionBanks(); }} />
                </Tooltip>
                <Tooltip title="Ngân hàng câu hỏi">
                  <Tag icon={<QuestionCircleOutlined />} color="blue">
                    {banksLoading ? '...' : `${questionBanks.length} bank`}
                  </Tag>
                </Tooltip>
              </Space>
            </Col>
          </Row>
        </Card>

        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card title="Phiên kiểm tra (quý)">
              <div style={{ marginBottom: 8 }}>
                <Tag color="blue">Tổng: {sessions.length}</Tag>
                <Tag color="success">Đang/Sắp: {sessions.filter((s) => s.status_code === 'SCHEDULED' || s.status_code === 'ONGOING').length}</Tag>
                <Tag color="default">Hoàn thành: {sessions.filter((s) => s.status_code === 'COMPLETED').length}</Tag>
              </div>
              <Table
                rowKey="_id"
                loading={sessionsLoading}
                columns={sessionColumns}
                dataSource={sessions}
                pagination={{ pageSize: 5 }}
              />
            </Card>
          </Col>

          <Col span={24}>
            <Card
              title="Kết quả nhân viên"
              extra={
                <Space>
                  <Tag color="green" icon={<CheckCircleOutlined />}>
                    Đạt: {summary.passed}
                  </Tag>
                  <Tag color="red" icon={<CloseCircleOutlined />}>
                    Chưa đạt: {summary.failed}
                  </Tag>
                  <Tag>{summary.total} lượt nộp</Tag>
                </Space>
              }
            >
              <Table
                rowKey="_id"
                loading={enrollmentsLoading}
                columns={enrollmentColumns}
                dataSource={enrollments}
                pagination={{ pageSize: 10 }}
              />
            </Card>
          </Col>

          <Col span={24}>
            <Card title="Ngân hàng câu hỏi" extra={<InfoCircleOutlined />}>
              <Table
                rowKey="_id"
                loading={banksLoading}
                dataSource={questionBanks}
                pagination={{ pageSize: 5 }}
                columns={[
                  { title: 'Tên bank', dataIndex: 'name', key: 'name' },
                  { title: 'Khóa học', dataIndex: ['course_id', 'course_name'], key: 'course' },
                  { title: 'Mô tả', dataIndex: 'description', key: 'desc' },
                  { title: 'Cập nhật', dataIndex: 'updated_at', key: 'updated', render: (d: string) => (d ? new Date(d).toLocaleDateString() : '—') },
                ]}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default ManagerTrainingReview;

