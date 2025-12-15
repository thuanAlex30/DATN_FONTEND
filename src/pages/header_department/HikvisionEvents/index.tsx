import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  Table,
  Tag,
  Space,
  Spin,
  Alert,
  Empty,
  Statistic,
  Button,
  DatePicker,
  Typography,
  Segmented,
  Row,
  Col,
  message,
} from 'antd';
import {
  LockOutlined,
  ReloadOutlined,
  DownloadOutlined,
  ApartmentOutlined,
  ClusterOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import hikvisionService, { type AcsEventInfo } from '../../../services/hikvisionService';
import HeaderDepartmentLayout from '../../../components/HeaderDepartment/HeaderDepartmentLayout';
import dayjs, { type Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;
const { Text } = Typography;

const HikvisionEventsPage: React.FC = () => {
  const [events, setEvents] = useState<AcsEventInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quickRange, setQuickRange] = useState<'today' | '3d' | '7d' | 'custom'>('today');
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([
    dayjs().startOf('day'),
    dayjs().endOf('day'),
  ]);

  useEffect(() => {
    loadEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (quickRange === 'today') {
      setDateRange([dayjs().startOf('day'), dayjs().endOf('day')]);
    } else if (quickRange === '3d') {
      setDateRange([dayjs().subtract(2, 'day').startOf('day'), dayjs().endOf('day')]);
    } else if (quickRange === '7d') {
      setDateRange([dayjs().subtract(6, 'day').startOf('day'), dayjs().endOf('day')]);
    }
  }, [quickRange]);

  const formatTime = (timeString: string) => {
    try {
      const date = new Date(timeString);
      return date.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch (error) {
      return timeString;
    }
  };

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      let response;
      if (dateRange[0] && dateRange[1]) {
        const startTime = dateRange[0].startOf('day').format('YYYY-MM-DDTHH:mm:ss');
        const endTime = dateRange[1].endOf('day').format('YYYY-MM-DDTHH:mm:ss');
        response = await hikvisionService.getAccessControlEvents({
          startTime,
          endTime,
          major: 5,
          minor: 38,
          maxResults: 500,
          getAll: true,
        });
      } else {
        response = await hikvisionService.getTodayEvents(true);
      }

      if (response.data?.success === false) {
        const errorMsg =
          typeof response.data?.message === 'string'
            ? response.data.message
            : typeof response.data?.data === 'string'
            ? response.data.data
            : 'Không thể tải dữ liệu kiểm soát truy cập';
        setError(errorMsg);
        setEvents([]);
        return;
      }

      const data = response.data?.data;
      if (data && 'AcsEvent' in data && data.AcsEvent?.InfoList) {
        setEvents(data.AcsEvent.InfoList);
      } else if (data && 'events' in data) {
        setEvents(data.events);
      } else {
        setEvents([]);
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.data ||
        err.message ||
        'Không thể tải dữ liệu kiểm soát truy cập. Vui lòng kiểm tra kết nối đến thiết bị Hikvision.';
      setError(errorMessage);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    if (dates) {
      setQuickRange('custom');
      setDateRange(dates);
    }
  };

  const summary = useMemo(() => {
    return {
      total: events.length,
      doors: new Set(events.map((e) => e.doorNo)).size || 0,
      readers: new Set(events.map((e) => e.cardReaderNo)).size || 0,
      withEmployees: events.filter((e) => e.employeeNoString).length || 0,
    };
  }, [events]);

  const exportCsv = () => {
    if (events.length === 0) {
      message.warning('Không có sự kiện để xuất');
      return;
    }
    const rows = [
      ['time', 'full_name', 'employee_no', 'door', 'reader', 'major', 'minor', 'card_no', 'device_ip'],
      ...events.map((ev) => [
        formatTime(ev.time),
        (ev.user as any)?.full_name || '',
        ev.employeeNoString || '',
        ev.doorNo ?? '',
        ev.cardReaderNo ?? '',
        ev.major ?? '',
        ev.minor ?? '',
        ev.cardNo || '',
        ev.remoteHostAddr || '',
      ]),
    ];
    const csv = rows
      .map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hikvision-events.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const columns = [
    {
      title: 'Thời gian',
      dataIndex: 'time',
      key: 'time',
      render: (t: string) => formatTime(t),
      width: 180,
    },
    {
      title: 'Người quét',
      key: 'user',
      render: (_: any, record: AcsEventInfo) => {
        if (record.user) {
          return (
            <Space direction="vertical" size={2}>
              <Text strong>{record.user.full_name}</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {record.user.username} {record.employeeNoString ? `(${record.employeeNoString})` : ''}
              </Text>
            </Space>
          );
        }
        return record.employeeNoString ? (
          <Tag color="purple">Mã NV: {record.employeeNoString}</Tag>
        ) : (
          <Text type="secondary">N/A</Text>
        );
      },
    },
    {
      title: 'Cửa',
      dataIndex: 'doorNo',
      key: 'doorNo',
      width: 80,
      render: (v: number) => <Tag color="blue">Cửa {v}</Tag>,
    },
    {
      title: 'Đầu đọc',
      dataIndex: 'cardReaderNo',
      key: 'cardReaderNo',
      width: 90,
      render: (v: number) => <Tag color="green">Reader {v}</Tag>,
    },
    {
      title: 'Loại sự kiện',
      key: 'eventType',
      width: 140,
      render: (_: any, record: AcsEventInfo) => (
        <Space wrap size={4}>
          <Tag color="geekblue">Major {record.major}</Tag>
          <Tag color="purple">Minor {record.minor}</Tag>
        </Space>
      ),
    },
    {
      title: 'Thẻ',
      dataIndex: 'cardNo',
      key: 'cardNo',
      width: 120,
      render: (v: string) => (v ? <Tag color="gold">{v}</Tag> : <Text type="secondary">-</Text>),
    },
    {
      title: 'Địa chỉ thiết bị',
      dataIndex: 'remoteHostAddr',
      key: 'remoteHostAddr',
      width: 140,
      render: (v: string) => <Text type="secondary">{v || 'N/A'}</Text>,
    },
  ];

  return (
    <HeaderDepartmentLayout
      title="Kiểm soát truy cập"
      icon={<LockOutlined />}
      headerExtra={
        <Space size={12} wrap>
          <Segmented
            value={quickRange}
            onChange={(val) => setQuickRange(val as any)}
            options={[
              { label: 'Hôm nay', value: 'today' },
              { label: '3 ngày', value: '3d' },
              { label: '7 ngày', value: '7d' },
              { label: 'Tùy chỉnh', value: 'custom' },
            ]}
          />
          <RangePicker
            value={dateRange}
            onChange={handleDateRangeChange}
            format="DD/MM/YYYY"
            allowClear={false}
            disabled={quickRange !== 'custom'}
          />
          <Button icon={<ReloadOutlined />} onClick={loadEvents} loading={loading} type="primary">
            Làm mới
          </Button>
          <Button icon={<DownloadOutlined />} onClick={exportCsv} disabled={events.length === 0}>
            Export CSV
          </Button>
        </Space>
      }
    >
      {/* Full-width wrapper to bù trừ padding mặc định 24px của layout */}
      <div style={{ marginLeft: -24, marginRight: -24 }}>
        <Card
          bordered={false}
          style={{
            borderRadius: 16,
            boxShadow: '0 20px 50px rgba(0,0,0,0.04)',
            background: 'linear-gradient(135deg, #fdfefe 0%, #f4f7fb 100%)',
            marginBottom: 16,
          }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                <Statistic
                  title="Tổng sự kiện"
                  value={summary.total}
                  prefix={<LockOutlined />}
                  valueStyle={{ color: '#1677ff', fontWeight: 700 }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                <Statistic
                  title="Cửa truy cập"
                  value={summary.doors}
                  prefix={<ApartmentOutlined />}
                  valueStyle={{ color: '#fa8c16', fontWeight: 700 }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                <Statistic
                  title="Đầu đọc"
                  value={summary.readers}
                  prefix={<ClusterOutlined />}
                  valueStyle={{ color: '#52c41a', fontWeight: 700 }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                <Statistic
                  title="Sự kiện có nhân viên"
                  value={summary.withEmployees}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: '#722ed1', fontWeight: 700 }}
                />
              </Card>
            </Col>
          </Row>
        </Card>

        <Card
          bordered={false}
          style={{ borderRadius: 16, boxShadow: '0 12px 32px rgba(0,0,0,0.06)' }}
          bodyStyle={{ padding: 0 }}
        >
          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px' }}>
              <Spin size="large" />
            </div>
          ) : error ? (
            <Alert
              message="Lỗi tải dữ liệu"
              description={error}
              type="error"
              showIcon
              action={
                <Button onClick={loadEvents} size="small">
                  Thử lại
                </Button>
              }
            />
          ) : events.length === 0 ? (
            <Empty description="Chưa có sự kiện kiểm soát truy cập nào" style={{ padding: 32 }} />
          ) : (
            <Table
              columns={columns}
              dataSource={events}
              rowKey={(record, idx) => `${record.time}-${idx}`}
              pagination={{ pageSize: 10, showSizeChanger: false }}
              scroll={{ x: 900 }}
              style={{ borderRadius: 16 }}
            />
          )}
        </Card>
      </div>
    </HeaderDepartmentLayout>
  );
};

export default HikvisionEventsPage;

