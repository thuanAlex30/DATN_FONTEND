import React, { useState, useEffect } from 'react';
import {
  Card,
  List,
  Tag,
  Space,
  Spin,
  Alert,
  Empty,
  Statistic,
  Pagination,
  Button,
  DatePicker,
  Typography,
  Segmented,
  Row,
  Col,
  Tooltip,
} from 'antd';
import { LockOutlined, ReloadOutlined } from '@ant-design/icons';
import hikvisionService, { type AcsEventInfo } from '../../../services/hikvisionService';
import HeaderDepartmentLayout from '../../../components/HeaderDepartment/HeaderDepartmentLayout';
import dayjs, { type Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

const HikvisionEventsPage: React.FC = () => {
  const [hikvisionEvents, setHikvisionEvents] = useState<AcsEventInfo[]>([]);
  const [hikvisionLoading, setHikvisionLoading] = useState(false);
  const [hikvisionError, setHikvisionError] = useState<string | null>(null);
  const [hikvisionCurrentPage, setHikvisionCurrentPage] = useState(1);
  const [hikvisionPageSize] = useState(10);
  const [quickRange, setQuickRange] = useState<'today' | '3d' | '7d' | 'custom'>('today');
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([
    dayjs().startOf('day'),
    dayjs().endOf('day'),
  ]);

  useEffect(() => {
    loadHikvisionEvents();
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

  const formatEventTime = (timeString: string) => {
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

  const loadHikvisionEvents = async () => {
    try {
      setHikvisionLoading(true);
      setHikvisionError(null);
      setHikvisionCurrentPage(1);

      let response;
      if (dateRange[0] && dateRange[1]) {
        // Format timestamp without timezone to match Hikvision API format: "2025-12-13T00:00:00"
        const startTime = dateRange[0].startOf('day').format('YYYY-MM-DDTHH:mm:ss');
        const endTime = dateRange[1].endOf('day').format('YYYY-MM-DDTHH:mm:ss');
        response = await hikvisionService.getAccessControlEvents({
          startTime,
          endTime,
          major: 5,
          minor: 38, // Chỉ lấy events vân tay
          maxResults: 100,
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
        setHikvisionError(errorMsg);
        setHikvisionEvents([]);
        return;
      }

      const data = response.data?.data;

      console.log('📥 Response data structure:', {
        hasData: !!data,
        hasAcsEvent: data && 'AcsEvent' in data,
        hasEvents: data && 'events' in data,
        dataKeys: data ? Object.keys(data) : [],
        eventsCount: data?.events?.length || data?.AcsEvent?.InfoList?.length || 0
      });

      if (data && 'AcsEvent' in data && data.AcsEvent?.InfoList) {
        console.log('✅ Using AcsEvent.InfoList, count:', data.AcsEvent.InfoList.length);
        setHikvisionEvents(data.AcsEvent.InfoList);
      } else if (data && 'events' in data) {
        console.log('✅ Using events array, count:', data.events.length);
        console.log('📋 Sample events:', data.events.slice(0, 3).map(e => ({
          time: e.time,
          employeeNoString: e.employeeNoString
        })));
        setHikvisionEvents(data.events);
      } else {
        console.warn('⚠️ No events found in response data');
        setHikvisionEvents([]);
      }
    } catch (err: any) {
      console.error('Error loading Hikvision events:', err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.data ||
        err.message ||
        'Không thể tải dữ liệu kiểm soát truy cập. Vui lòng kiểm tra kết nối đến thiết bị Hikvision.';
      setHikvisionError(errorMessage);
      setHikvisionEvents([]);
    } finally {
      setHikvisionLoading(false);
    }
  };

  const handleDateRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    if (dates) {
      setQuickRange('custom');
      setDateRange(dates);
    }
  };

  const statCards = [
    {
      title: 'Tổng số sự kiện',
      value: hikvisionEvents.length,
      color: '#1677ff',
      bg: 'linear-gradient(135deg, #e6f4ff 0%, #f0f7ff 100%)',
    },
    {
      title: 'Cửa truy cập',
      value: new Set(hikvisionEvents.map((e) => e.doorNo)).size || 0,
      color: '#fa8c16',
      bg: 'linear-gradient(135deg, #fff7e6 0%, #fff9f0 100%)',
    },
    {
      title: 'Đầu đọc',
      value: new Set(hikvisionEvents.map((e) => e.cardReaderNo)).size || 0,
      color: '#52c41a',
      bg: 'linear-gradient(135deg, #f6ffed 0%, #fbfff3 100%)',
    },
    {
      title: 'Sự kiện có nhân viên',
      value: hikvisionEvents.filter((e) => e.employeeNoString).length || 0,
      color: '#722ed1',
      bg: 'linear-gradient(135deg, #f9f0ff 0%, #fbf5ff 100%)',
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
          <Button
            icon={<ReloadOutlined />}
            onClick={loadHikvisionEvents}
            loading={hikvisionLoading}
            type="primary"
          >
            Làm mới
          </Button>
        </Space>
      }
    >
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          {statCards.map((card) => (
            <Col xs={24} sm={12} md={12} lg={6} key={card.title}>
              <Card
                bordered={false}
                style={{
                  background: card.bg,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                  borderRadius: 12,
                }}
              >
                <Space direction="vertical" size={8}>
                  <Text type="secondary">{card.title}</Text>
                  <Statistic value={card.value} valueStyle={{ color: card.color, fontSize: 26 }} />
                </Space>
              </Card>
            </Col>
          ))}
        </Row>

        <Card
          bordered={false}
          style={{ boxShadow: '0 12px 32px rgba(0,0,0,0.06)', borderRadius: 12 }}
        >
          {hikvisionLoading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Spin size="large" />
            </div>
          ) : hikvisionError ? (
            <Alert
              message="Lỗi"
              description={hikvisionError}
              type="error"
              showIcon
              action={
                <Button onClick={loadHikvisionEvents} size="small">
                  Thử lại
                </Button>
              }
            />
          ) : hikvisionEvents.length > 0 ? (
            <>
              <List
                itemLayout="vertical"
                dataSource={hikvisionEvents.slice(
                  (hikvisionCurrentPage - 1) * hikvisionPageSize,
                  hikvisionCurrentPage * hikvisionPageSize
                )}
                renderItem={(event, index) => {
                  const globalIndex = (hikvisionCurrentPage - 1) * hikvisionPageSize + index;
                  return (
                    <List.Item
                      style={{
                        background: '#f9fbff',
                        borderRadius: 12,
                        padding: 16,
                        border: '1px solid #eef1f7',
                        marginBottom: 12,
                      }}
                    >
                      <List.Item.Meta
                        avatar={
                          <div
                            style={{
                              width: 38,
                              height: 38,
                              borderRadius: 10,
                              display: 'grid',
                              placeItems: 'center',
                              background:
                                'linear-gradient(135deg, rgba(22,119,255,0.15), rgba(99,102,241,0.18))',
                              color: '#1677ff',
                            }}
                          >
                            <LockOutlined />
                          </div>
                        }
                        title={
                          <Space wrap size={8} style={{ fontWeight: 600 }}>
                            <span>Sự kiện #{globalIndex + 1}</span>
                            <Tag color="blue">Cửa {event.doorNo}</Tag>
                            <Tag color="green">Reader {event.cardReaderNo}</Tag>
                            <Tag color="geekblue">Major {event.major}</Tag>
                            <Tag color="purple">Minor {event.minor}</Tag>
                          </Space>
                        }
                        description={
                          <Space direction="vertical" size="small" style={{ width: '100%' }}>
                            <Space align="center" size={12} wrap>
                              <Text type="secondary">
                                <strong>Thời gian:</strong> {formatEventTime(event.time)}
                              </Text>
                              <Tooltip title="Địa chỉ thiết bị">
                                <Tag color="default">
                                  <strong>Địa chỉ:</strong> {event.remoteHostAddr || 'N/A'}
                                </Tag>
                              </Tooltip>
                            </Space>
                            <Space wrap>
                              {event.user ? (
                                <Tag color="purple">
                                  <strong>Người quét:</strong> {event.user.full_name} ({event.user.username})
                                </Tag>
                              ) : event.employeeNoString ? (
                                <Tag color="purple">
                                  <strong>Mã NV:</strong> {event.employeeNoString}
                                </Tag>
                              ) : null}
                              {event.cardNo && (
                                <Tag color="gold">
                                  <strong>Thẻ:</strong> {event.cardNo}
                                </Tag>
                              )}
                              {event.netUser && (
                                <Tag color="cyan">
                                  <strong>Người dùng:</strong> {event.netUser}
                                </Tag>
                              )}
                            </Space>
                          </Space>
                        }
                      />
                    </List.Item>
                  );
                }}
              />
              <div style={{ marginTop: '16px', textAlign: 'right' }}>
                <Pagination
                  current={hikvisionCurrentPage}
                  pageSize={hikvisionPageSize}
                  total={hikvisionEvents.length}
                  onChange={(page) => setHikvisionCurrentPage(page)}
                  showSizeChanger={false}
                  showTotal={(total, range) => `${range[0]}-${range[1]} của ${total} sự kiện`}
                />
              </div>
            </>
          ) : (
            <Empty description="Chưa có sự kiện kiểm soát truy cập nào" />
          )}
        </Card>
    </HeaderDepartmentLayout>
  );
};

export default HikvisionEventsPage;

