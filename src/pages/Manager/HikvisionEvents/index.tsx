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
} from 'antd';
import { LockOutlined, ReloadOutlined } from '@ant-design/icons';
import hikvisionService, { type AcsEventInfo } from '../../../services/hikvisionService';
import { ManagerLayout } from '../../../components/Manager';
import dayjs, { type Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;

const HikvisionEventsPage: React.FC = () => {
  const [hikvisionEvents, setHikvisionEvents] = useState<AcsEventInfo[]>([]);
  const [hikvisionLoading, setHikvisionLoading] = useState(false);
  const [hikvisionError, setHikvisionError] = useState<string | null>(null);
  const [hikvisionCurrentPage, setHikvisionCurrentPage] = useState(1);
  const [hikvisionPageSize] = useState(10);
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([
    dayjs().startOf('day'),
    dayjs().endOf('day'),
  ]);

  useEffect(() => {
    loadHikvisionEvents();
  }, []);

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
        const startTime = dateRange[0].startOf('day').toISOString().replace('Z', '+08:00');
        const endTime = dateRange[1].endOf('day').toISOString().replace('Z', '+08:00');
        response = await hikvisionService.getAccessControlEvents({
          startTime,
          endTime,
          major: 5,
          minor: 0,
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

      if (data && 'AcsEvent' in data && data.AcsEvent?.InfoList) {
        setHikvisionEvents(data.AcsEvent.InfoList);
      } else if (data && 'events' in data) {
        setHikvisionEvents(data.events);
      } else {
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
      setDateRange(dates);
    }
  };

  return (
    <ManagerLayout>
      <div style={{ padding: '24px' }}>
        <Card
          title={
            <Space>
              <LockOutlined />
              <span>Sự kiện kiểm soát truy cập (Hikvision)</span>
            </Space>
          }
          extra={
            <Space>
              <RangePicker
                value={dateRange}
                onChange={handleDateRangeChange}
                format="DD/MM/YYYY"
                allowClear={false}
              />
              <Button
                icon={<ReloadOutlined />}
                onClick={loadHikvisionEvents}
                loading={hikvisionLoading}
              >
                Tải lại
              </Button>
            </Space>
          }
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
              <div style={{ marginBottom: '16px' }}>
                <Statistic
                  title="Tổng số sự kiện"
                  value={hikvisionEvents.length}
                  valueStyle={{ fontSize: '24px' }}
                />
              </div>
              <List
                dataSource={hikvisionEvents.slice(
                  (hikvisionCurrentPage - 1) * hikvisionPageSize,
                  hikvisionCurrentPage * hikvisionPageSize
                )}
                renderItem={(event, index) => {
                  const globalIndex = (hikvisionCurrentPage - 1) * hikvisionPageSize + index;
                  return (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<LockOutlined style={{ fontSize: '20px', color: '#1890ff' }} />}
                        title={
                          <Space>
                            <span style={{ fontWeight: 'bold' }}>Sự kiện #{globalIndex + 1}</span>
                            <Tag color="blue">Cửa {event.doorNo}</Tag>
                            <Tag color="green">Reader {event.cardReaderNo}</Tag>
                          </Space>
                        }
                        description={
                          <Space direction="vertical" size="small" style={{ width: '100%' }}>
                            <span style={{ color: '#8c8c8c' }}>
                              <strong>Thời gian:</strong> {formatEventTime(event.time)}
                            </span>
                            <Space wrap>
                              {event.employeeNoString && (
                                <Tag color="purple">
                                  <strong>Mã NV:</strong> {event.employeeNoString}
                                </Tag>
                              )}
                              {event.cardNo && (
                                <Tag>
                                  <strong>Thẻ:</strong> {event.cardNo}
                                </Tag>
                              )}
                              {event.netUser && (
                                <Tag>
                                  <strong>Người dùng:</strong> {event.netUser}
                                </Tag>
                              )}
                              <Tag>
                                <strong>Major:</strong> {event.major}
                              </Tag>
                              <Tag>
                                <strong>Minor:</strong> {event.minor}
                              </Tag>
                            </Space>
                            <span style={{ color: '#8c8c8c', fontSize: '12px' }}>
                              <strong>Địa chỉ:</strong> {event.remoteHostAddr || 'N/A'}
                            </span>
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
      </div>
    </ManagerLayout>
  );
};

export default HikvisionEventsPage;

