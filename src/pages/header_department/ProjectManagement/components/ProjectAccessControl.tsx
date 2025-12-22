import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Table,
  Space,
  Tag,
  Tooltip,
  message,
  Typography,
  Row,
  Col,
  Statistic,
  Alert,
  Spin,
  Button,
  DatePicker,
  Segmented,
  Empty,
  Tabs
} from 'antd';
import {
  LockOutlined,
  ReloadOutlined,
  UserOutlined,
  SafetyOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import hikvisionService, { type AcsEventInfo } from '../../../../services/hikvisionService';
import projectService from '../../../../services/projectService';
import dayjs, { type Dayjs } from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface ProjectAccessControlProps {
  projectId: string;
}

interface LateWorker {
  key: string;
  employeeNo?: string;
  name?: string;
  firstEventTime: string;
  lastEventTime: string;
}

interface AttendanceRow {
  key: string;
  employeeNo: string;
  name: string;
  checkIn: string;
  checkOut: string;
  eventCount: number;
}

const ProjectAccessControl: React.FC<ProjectAccessControlProps> = ({ projectId }) => {
  const [filteredEvents, setFilteredEvents] = useState<AcsEventInfo[]>([]);
  const [projectUserIds, setProjectUserIds] = useState<Set<string>>(new Set());
  const [totalWorkers, setTotalWorkers] = useState<number>(0);
  const [lateWorkers, setLateWorkers] = useState<LateWorker[]>([]);
  const [attendanceSummary, setAttendanceSummary] = useState<AttendanceRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [quickRange, setQuickRange] = useState<'today' | '3d' | '7d' | '30d' | 'custom'>('today');
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([
    dayjs().startOf('day'),
    dayjs().endOf('day'),
  ]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Load project assignments to get user IDs (for display purposes)
  const loadProjectAssignments = useCallback(async () => {
    try {
      const response = await projectService.getProjectAssignments(projectId);
      if (response.success && response.data) {
        const userIds = new Set<string>();
        const assignments = Array.isArray(response.data) ? response.data : [];
        setTotalWorkers(assignments.length);

        // Get user IDs from assignments
        assignments.forEach((assignment: any) => {
          if (assignment.user_id) {
            const userId = typeof assignment.user_id === 'object' 
              ? (assignment.user_id._id || assignment.user_id.id || assignment.user_id.user_id)
              : assignment.user_id;
            if (userId) {
              userIds.add(String(userId));
            }
          }
        });

        // Also get project leader if exists
        const projectResponse = await projectService.getProjectById(projectId);
        if (projectResponse.success && projectResponse.data) {
          const project = projectResponse.data as any;
          if (project.leader_id) {
            const leaderId = typeof project.leader_id === 'object'
              ? (project.leader_id._id || project.leader_id.id || project.leader_id.user_id)
              : project.leader_id;
            if (leaderId) {
              userIds.add(String(leaderId));
            }
          }
        }

        setProjectUserIds(userIds);
        console.log('📋 Project user IDs:', Array.from(userIds));
      }
    } catch (error) {
      console.error('Error loading project assignments:', error);
    }
  }, [projectId]);

  // Phân tích công nhân chỉ có 1 lần quét trong ngày (coi là chưa quét ra)
  const analyzeLateWorkers = useCallback((events: AcsEventInfo[]): LateWorker[] => {
    if (!events || events.length === 0) return [];

    const byEmployee: Record<string, AcsEventInfo[]> = {};
    events.forEach(e => {
      const emp = e.employeeNoString || (e.user as any)?.user_id?.toString();
      if (!emp) return;
      if (!byEmployee[emp]) byEmployee[emp] = [];
      byEmployee[emp].push(e);
    });

    const result: LateWorker[] = [];

    Object.entries(byEmployee).forEach(([employeeNo, empEvents]) => {
      empEvents.sort(
        (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
      );

      const first = new Date(empEvents[0].time);
      const last = new Date(empEvents[empEvents.length - 1].time);

      // Nếu chỉ có 1 lần quét trong ngày => cảnh báo chưa ra ngoài
      if (empEvents.length === 1) {
        const name =
          (empEvents[0].user && (empEvents[0].user as any).full_name) || undefined;

        const fmt = (d: Date) =>
          d.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          });

        result.push({
          key: employeeNo,
          employeeNo,
          name,
          firstEventTime: fmt(first),
          lastEventTime: fmt(last),
        });
      }
    });

    return result;
  }, []);

  // Tạo bảng vào/ra trong ngày: lần quét đầu là vào, lần quét cuối là ra
  const buildAttendanceSummary = useCallback((events: AcsEventInfo[]): AttendanceRow[] => {
    if (!events || events.length === 0) return [];

    const byEmployee: Record<string, AcsEventInfo[]> = {};
    events.forEach(e => {
      const emp = e.employeeNoString || (e.user as any)?.user_id?.toString();
      if (!emp) return;
      if (!byEmployee[emp]) byEmployee[emp] = [];
      byEmployee[emp].push(e);
    });

    const summary: AttendanceRow[] = [];
    Object.entries(byEmployee).forEach(([employeeNo, empEvents]) => {
      empEvents.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
      const first = empEvents[0];
      const last = empEvents[empEvents.length - 1];

      const fmt = (t: string) =>
        new Date(t).toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });

      summary.push({
        key: employeeNo,
        employeeNo,
        name:
          (first.user && (first.user as any).full_name) ||
          (last.user && (last.user as any).full_name) ||
          `Mã NV: ${employeeNo}`,
        checkIn: fmt(first.time),
        checkOut: fmt(last.time),
        eventCount: empEvents.length
      });
    });

    return summary;
  }, []);

  // Load Hikvision events filtered by project
  const loadHikvisionEvents = useCallback(async () => {
    try {
      setLoading(true);
      setCurrentPage(1);

      let response;
      if (dateRange[0] && dateRange[1]) {
        const startTime = dateRange[0].startOf('day').format('YYYY-MM-DDTHH:mm:ss');
        const endTime = dateRange[1].endOf('day').format('YYYY-MM-DDTHH:mm:ss');
        // Use new endpoint that filters by project
        response = await hikvisionService.getAccessControlEventsByProject(projectId, {
          startTime,
          endTime,
          major: 5,
          minor: 38, // Chỉ lấy events vân tay
          maxResults: 100,
          getAll: true,
        });
      } else {
        // Use today's date range
        const todayStart = dayjs().startOf('day').format('YYYY-MM-DDTHH:mm:ss');
        const todayEnd = dayjs().endOf('day').format('YYYY-MM-DDTHH:mm:ss');
        response = await hikvisionService.getAccessControlEventsByProject(projectId, {
          startTime: todayStart,
          endTime: todayEnd,
          major: 5,
          minor: 38,
          maxResults: 100,
          getAll: true,
        });
      }

      if (response.data?.success === false) {
        const errorMsg =
          typeof response.data?.message === 'string'
            ? response.data.message
            : typeof response.data?.data === 'string'
            ? response.data.data
            : 'Không thể tải dữ liệu kiểm soát truy cập';
        message.error(errorMsg);
        setFilteredEvents([]);
        return;
      }

      const data = response.data?.data;
      let events: AcsEventInfo[] = [];

      // Backend returns events already filtered by project
      if (data && 'events' in data && Array.isArray(data.events)) {
        events = data.events;
      } else if (data && 'AcsEvent' in data && data.AcsEvent?.InfoList) {
        events = data.AcsEvent.InfoList;
      }

      setFilteredEvents(events);
      setAttendanceSummary(buildAttendanceSummary(events));
      setLateWorkers(analyzeLateWorkers(events));
      console.log(`✅ Loaded ${events.length} events for project ${projectId}`);
    } catch (err: any) {
      console.error('Error loading Hikvision events:', err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.data ||
        err.message ||
        'Không thể tải dữ liệu kiểm soát truy cập. Vui lòng kiểm tra kết nối đến thiết bị Hikvision.';
      message.error(errorMessage);
      setFilteredEvents([]);
    } finally {
      setLoading(false);
    }
  }, [dateRange, projectId]);

  // Update date range when quick range changes
  useEffect(() => {
    if (quickRange === 'today') {
      setDateRange([dayjs().startOf('day'), dayjs().endOf('day')]);
    } else if (quickRange === '3d') {
      setDateRange([dayjs().subtract(2, 'day').startOf('day'), dayjs().endOf('day')]);
    } else if (quickRange === '7d') {
      setDateRange([dayjs().subtract(6, 'day').startOf('day'), dayjs().endOf('day')]);
    } else if (quickRange === '30d') {
      setDateRange([dayjs().subtract(29, 'day').startOf('day'), dayjs().endOf('day')]);
    }
  }, [quickRange]);

  // Load data on mount and when projectId changes
  useEffect(() => {
    if (projectId) {
      loadProjectAssignments();
    }
  }, [projectId, loadProjectAssignments]);

  // Load events when date range or projectId changes
  useEffect(() => {
    if (projectId) {
      loadHikvisionEvents();
    }
  }, [projectId, dateRange, loadHikvisionEvents]);

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

  const handleDateRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    if (dates) {
      setQuickRange('custom');
      setDateRange(dates);
    }
  };

  const handleExportEvents = () => {
    if (filteredEvents.length === 0) {
      message.warning('Không có sự kiện để xuất');
      return;
    }

    const rows = [
      ['time', 'full_name', 'employee_no', 'door', 'reader', 'major', 'minor', 'card_no', 'device_ip'],
      ...filteredEvents.map(ev => [
        new Date(ev.time).toLocaleString('vi-VN'),
        (ev.user as any)?.full_name || '',
        ev.employeeNoString || '',
        ev.doorNo ?? '',
        ev.cardReaderNo ?? '',
        ev.major ?? '',
        ev.minor ?? '',
        ev.cardNo || '',
        ev.remoteHostAddr || ''
      ])
    ];

    const csv = rows
      .map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `access-events-${projectId}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // Statistics
  const stats = {
    total: filteredEvents.length,
    uniqueUsers: new Set(filteredEvents.map(e => e.employeeNoString).filter(Boolean))
      .size,
    totalWorkers,
    checkedOut: attendanceSummary.filter(a => a.eventCount > 1).length,
    missingCheckout: attendanceSummary.filter(a => a.eventCount === 1).length,
    uniqueDoors: new Set(filteredEvents.map(e => e.doorNo)).size,
    uniqueReaders: new Set(filteredEvents.map(e => e.cardReaderNo)).size,
    lateWorkers: lateWorkers.length,
    latePercent:
      lateWorkers.length > 0 && new Set(filteredEvents.map(e => e.employeeNoString).filter(Boolean)).size > 0
        ? Math.round(
            (lateWorkers.length /
              new Set(
                filteredEvents.map(e => e.employeeNoString).filter(Boolean)
              ).size) *
              100
          )
        : 0
  };

  // Table columns
  const columns = [
    {
      title: 'Thời gian',
      dataIndex: 'time',
      key: 'time',
      width: 180,
      render: (time: string) => (
        <Space>
          <ClockCircleOutlined style={{ color: '#1677ff' }} />
          <Text>{formatEventTime(time)}</Text>
        </Space>
      ),
      sorter: (a: AcsEventInfo, b: AcsEventInfo) => 
        new Date(a.time).getTime() - new Date(b.time).getTime(),
      defaultSortOrder: 'descend' as const,
    },
    {
      title: 'Người quét',
      key: 'user',
      width: 200,
      render: (_: any, record: AcsEventInfo) => {
        if (record.user) {
          return (
            <Space>
              <UserOutlined style={{ color: '#52c41a' }} />
              <div>
                <Text strong>{record.user.full_name}</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {record.user.username} ({record.employeeNoString})
                </Text>
              </div>
            </Space>
          );
        } else if (record.employeeNoString) {
          return (
            <Space>
              <UserOutlined style={{ color: '#faad14' }} />
              <Text>Mã NV: {record.employeeNoString}</Text>
            </Space>
          );
        }
        return <Text type="secondary">Không xác định</Text>;
      },
    },
    {
      title: 'Cửa',
      dataIndex: 'doorNo',
      key: 'doorNo',
      width: 100,
      render: (doorNo: number) => (
        <Tag color="blue">Cửa {doorNo}</Tag>
      ),
    },
    {
      title: 'Đầu đọc',
      dataIndex: 'cardReaderNo',
      key: 'cardReaderNo',
      width: 120,
      render: (readerNo: number) => (
        <Tag color="green">Reader {readerNo}</Tag>
      ),
    },
    {
      title: 'Loại sự kiện',
      key: 'eventType',
      width: 150,
      render: (_: any, record: AcsEventInfo) => (
        <Space>
          <Tag color="purple">Major: {record.major}</Tag>
          <Tag color="cyan">Minor: {record.minor}</Tag>
        </Space>
      ),
    },
    {
      title: 'Thẻ',
      dataIndex: 'cardNo',
      key: 'cardNo',
      width: 120,
      render: (cardNo: string) => cardNo ? (
        <Text code>{cardNo}</Text>
      ) : (
        <Text type="secondary">-</Text>
      ),
    },
    {
      title: 'Địa chỉ thiết bị',
      dataIndex: 'remoteHostAddr',
      key: 'remoteHostAddr',
      width: 150,
      render: (addr: string) => (
        <Tooltip title="Địa chỉ IP thiết bị">
          <Text type="secondary" style={{ fontSize: '12px' }}>{addr || '-'}</Text>
        </Tooltip>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <Title level={3} className="mb-2">
            <LockOutlined className="mr-2" />
            Kiểm soát Ra vào
          </Title>
          <Text type="secondary">
            Theo dõi và quản lý kiểm soát ra vào của nhân viên trong dự án
          </Text>
        </div>
        <Space size="middle" wrap>
          <Segmented
            value={quickRange}
            onChange={(val) => setQuickRange(val as any)}
            options={[
              { label: 'Hôm nay', value: 'today' },
              { label: '3 ngày', value: '3d' },
              { label: '7 ngày', value: '7d' },
              { label: '30 ngày', value: '30d' },
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
            loading={loading}
            type="primary"
          >
            Làm mới
          </Button>
          <Button
            icon={<DownloadOutlined />}
            onClick={handleExportEvents}
            disabled={filteredEvents.length === 0}
          >
            Export sự kiện
          </Button>
        </Space>
      </div>

      {/* Statistics */}
      <Row gutter={16}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng số sự kiện"
              value={stats.total}
              prefix={<LockOutlined />}
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Số người dùng"
              value={stats.uniqueUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
            {stats.totalWorkers > 0 && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                {stats.uniqueUsers}/{stats.totalWorkers} công nhân đã quét
              </Text>
            )}
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Đã vào & ra"
              value={stats.checkedOut}
              suffix={stats.totalWorkers > 0 ? ` / ${stats.totalWorkers}` : undefined}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#16a34a' }}
            />
            {stats.missingCheckout > 0 && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                {stats.missingCheckout} công nhân chưa có log ra
              </Text>
            )}
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Số cửa"
              value={stats.uniqueDoors}
              prefix={<SafetyOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Số đầu đọc"
              value={stats.uniqueReaders}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Chưa ra ngoài sau 11h"
              value={stats.lateWorkers}
              suffix={stats.uniqueUsers > 0 ? ` / ${stats.uniqueUsers}` : undefined}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: stats.lateWorkers > 0 ? '#ff4d4f' : '#16a34a' }}
            />
            {stats.uniqueUsers > 0 && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                {stats.latePercent}% công nhân đã vào ca sáng nhưng chưa có log sau 11h
              </Text>
            )}
          </Card>
        </Col>
      </Row>

      {/* Alert for no project users */}
      {projectUserIds.size === 0 && (
        <Alert
          message="Chưa có nhân viên trong dự án"
          description="Vui lòng thêm nhân viên vào dự án để theo dõi kiểm soát ra vào."
          type="warning"
          showIcon
        />
      )}

      {/* Attendance summary */}
      {attendanceSummary.length > 0 && (
        <Card title="Trạng thái vào/ra trong ngày" className="border-0 shadow-sm">
          <Table
            size="small"
            dataSource={attendanceSummary}
            rowKey={(r) => r.key}
            pagination={{ pageSize: 10 }}
            columns={[
              {
                title: 'Họ tên',
                dataIndex: 'name',
                key: 'name'
              },
              {
                title: 'Mã NV',
                dataIndex: 'employeeNo',
                key: 'employeeNo',
                width: 100
              },
              {
                title: 'Vào',
                dataIndex: 'checkIn',
                key: 'checkIn',
                width: 140
              },
              {
                title: 'Ra',
                dataIndex: 'checkOut',
                key: 'checkOut',
                width: 140,
                render: (v: string, r: AttendanceRow) =>
                  r.eventCount > 1 ? v : <Text type="warning">Chưa ghi nhận</Text>
              },
              {
                title: 'Số lần quét',
                dataIndex: 'eventCount',
                key: 'eventCount',
                width: 110
              }
            ]}
          />
        </Card>
      )}

      {/* Events & Morning shift analysis */}
      <Card>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" />
          </div>
        ) : (
          <Tabs
            defaultActiveKey={lateWorkers.length > 0 ? 'warnings' : 'logs'}
            items={[
              {
                key: 'warnings',
                label: 'Cảnh báo ca sáng',
                children:
                  filteredEvents.length === 0 ? (
                    <Empty description="Chưa có dữ liệu để phân tích ca sáng trong khoảng thời gian này" />
                  ) : lateWorkers.length === 0 ? (
                    <Alert
                      type="success"
                      showIcon
                      message="Tất cả công nhân đã có từ 2 log trở lên trong ngày (không có cảnh báo)."
                    />
                  ) : (
                    <>
                      <Alert
                        type="warning"
                        showIcon
                        message={`Có ${lateWorkers.length} công nhân chỉ có 1 lần quét trong ngày (chưa ghi nhận ra ngoài).`}
                        description="Danh sách dưới đây giúp bạn theo dõi các trường hợp chưa có log ra ngoài trong ngày."
                        style={{ marginBottom: 12 }}
                      />
                      <Table
                        size="small"
                        dataSource={lateWorkers}
                        rowKey={(r) => r.key}
                        pagination={false}
                        columns={[
                          {
                            title: 'Họ tên',
                            dataIndex: 'name',
                            key: 'name',
                            render: (v: string, r: LateWorker) =>
                              v || (r.employeeNo ? `Mã NV: ${r.employeeNo}` : '-'),
                          },
                          {
                            title: 'Mã nhân viên',
                            dataIndex: 'employeeNo',
                            key: 'employeeNo',
                          },
                          {
                            title: 'Giờ quét đầu tiên (>= 7h)',
                            dataIndex: 'firstEventTime',
                            key: 'firstEventTime',
                          },
                          {
                            title: 'Giờ quét gần nhất',
                            dataIndex: 'lastEventTime',
                            key: 'lastEventTime',
                          },
                        ]}
                      />
                    </>
                  ),
              },
              {
                key: 'logs',
                label: 'Log sự kiện chi tiết',
                children:
                  filteredEvents.length > 0 ? (
                    <Table
                      columns={columns}
                      dataSource={filteredEvents}
                      rowKey={(record, index) =>
                        `${record.time}-${record.employeeNoString}-${record.doorNo}-${index}`
                      }
                      loading={loading}
                      pagination={{
                        current: currentPage,
                        pageSize: pageSize,
                        total: filteredEvents.length,
                        onChange: (page) => setCurrentPage(page),
                        showSizeChanger: false,
                        showTotal: (total, range) =>
                          `${range[0]}-${range[1]} của ${total} sự kiện`,
                      }}
                      scroll={{ x: 1000 }}
                    />
                  ) : (
                    <Empty
                      description={
                        projectUserIds.size === 0
                          ? 'Chưa có nhân viên trong dự án'
                          : 'Chưa có sự kiện kiểm soát ra vào trong khoảng thời gian đã chọn'
                      }
                    />
                  ),
              },
            ]}
          />
        )}
      </Card>
    </div>
  );
};

export default ProjectAccessControl;

