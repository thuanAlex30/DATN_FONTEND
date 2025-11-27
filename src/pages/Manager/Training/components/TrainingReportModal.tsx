import React, { useState, useEffect } from 'react';
import {
  Modal,
  Table,
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Typography,
  Space,
  Tag,
  Button,
  DatePicker,
  Select,
  message
} from 'antd';
import {
  TrophyOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  DownloadOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import { api } from '../../../../services/api';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

interface TrainingReportModalProps {
  visible: boolean;
  onCancel: () => void;
  departmentId?: string;
}

const TrainingReportModal: React.FC<TrainingReportModalProps> = ({
  visible,
  onCancel,
  departmentId
}) => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [dateRange, setDateRange] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    if (visible) {
      fetchReportData();
    }
  }, [visible, dateRange, statusFilter]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (dateRange && dateRange.length === 2) {
        params.start_date = dateRange[0].format('YYYY-MM-DD');
        params.end_date = dateRange[1].format('YYYY-MM-DD');
      }
      if (statusFilter) {
        params.status = statusFilter;
      }
      if (departmentId) {
        params.department_id = departmentId;
      }

      const response = await api.get('/training/reports', { params });
      setReportData(response.data);
    } catch (error) {
      message.error('Không thể tải dữ liệu báo cáo');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const params: any = {};
      if (dateRange && dateRange.length === 2) {
        params.start_date = dateRange[0].format('YYYY-MM-DD');
        params.end_date = dateRange[1].format('YYYY-MM-DD');
      }
      if (statusFilter) {
        params.status = statusFilter;
      }
      if (departmentId) {
        params.department_id = departmentId;
      }

      const response = await api.get('/training/reports/export', { 
        params,
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `training-report-${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      message.success('Xuất báo cáo thành công!');
    } catch (error) {
      message.error('Không thể xuất báo cáo');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'green';
      case 'enrolled': return 'blue';
      case 'failed': return 'red';
      case 'cancelled': return 'gray';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'enrolled': return 'Đang học';
      case 'completed': return 'Hoàn thành';
      case 'failed': return 'Chưa đạt';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const columns = [
    {
      title: 'Nhân viên',
      dataIndex: ['user_id', 'full_name'],
      key: 'employee',
      render: (text: string, record: any) => (
        <Space>
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.user_id?.email}
          </Text>
        </Space>
      )
    },
    {
      title: 'Khóa học',
      key: 'course',
      render: (_, record: any) => record.session_id?.course_id?.course_name || 'N/A'
    },
    {
      title: 'Buổi đào tạo',
      key: 'session',
      render: (_, record: any) => record.session_id?.session_name || 'N/A'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      )
    },
    {
      title: 'Điểm số',
      dataIndex: 'score',
      key: 'score',
      render: (score: number, record: any) => {
        if (!score) return <Text type="secondary">-</Text>;
        const color = record.passed ? '#52c41a' : '#ff4d4f';
        return (
          <Text style={{ color, fontWeight: 600 }}>
            {score}/100
          </Text>
        );
      }
    },
    {
      title: 'Ngày đăng ký',
      dataIndex: 'enrolled_at',
      key: 'enrolled_at',
      render: (text: string) => new Date(text).toLocaleDateString('vi-VN')
    },
    {
      title: 'Ngày hoàn thành',
      dataIndex: 'completion_date',
      key: 'completion_date',
      render: (text: string) => text ? new Date(text).toLocaleDateString('vi-VN') : '-'
    }
  ];

  return (
    <Modal
      title="Báo cáo đào tạo"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={1200}
    >
      <div style={{ marginBottom: '16px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col>
            <Space>
              <RangePicker
                placeholder={['Từ ngày', 'Đến ngày']}
                value={dateRange}
                onChange={setDateRange}
              />
              <Select
                placeholder="Trạng thái"
                style={{ width: 150 }}
                value={statusFilter}
                onChange={setStatusFilter}
                allowClear
              >
                <Option value="enrolled">Đang học</Option>
                <Option value="completed">Hoàn thành</Option>
                <Option value="failed">Chưa đạt</Option>
                <Option value="cancelled">Đã hủy</Option>
              </Select>
              <Button 
                type="primary" 
                icon={<DownloadOutlined />}
                onClick={handleExport}
              >
                Xuất Excel
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {reportData && (
        <>
          {/* Statistics */}
          <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Tổng đăng ký"
                  value={reportData.total_enrollments || 0}
                  prefix={<BarChartOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Hoàn thành"
                  value={reportData.completed_enrollments || 0}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Đang học"
                  value={reportData.in_progress_enrollments || 0}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Tỷ lệ hoàn thành"
                  value={reportData.completion_rate || 0}
                  suffix="%"
                  prefix={<TrophyOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
                <Progress 
                  percent={reportData.completion_rate || 0} 
                  size="small" 
                  style={{ marginTop: '8px' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Detailed Table */}
          <Card title="Chi tiết đào tạo">
            <Table
              dataSource={reportData.enrollments || []}
              rowKey="_id"
              columns={columns}
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} mục`
              }}
            />
          </Card>
        </>
      )}
    </Modal>
  );
};

export default TrainingReportModal;
