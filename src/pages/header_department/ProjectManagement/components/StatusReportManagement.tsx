import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  message,
  Row,
  Col,
  Typography,
  Space,
  Tooltip,
  Statistic,
  Progress,
  Avatar,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  UserOutlined,
  RiseOutlined,
  WarningOutlined
} from '@ant-design/icons';
import { projectStatusReportService } from '../../../../services/projectStatusReportService';
import type { ProjectStatusReport } from '../../../../types/projectStatusReport';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface StatusReportManagementProps {
  projectId: string;
}

const StatusReportManagement: React.FC<StatusReportManagementProps> = ({ projectId }) => {
  const [statusReports, setStatusReports] = useState<ProjectStatusReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedStatusReport, setSelectedStatusReport] = useState<ProjectStatusReport | null>(null);
  const [form] = Form.useForm();

  // Load status reports
  const loadStatusReports = async () => {
    if (!projectId) return;
    
    try {
      setLoading(true);
      const response = await projectStatusReportService.getProjectStatusReports(projectId);
      setStatusReports(response.data || []);
    } catch (error: any) {
      console.error('Error loading status reports:', error);
      message.error('Không thể tải danh sách báo cáo trạng thái');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatusReports();
  }, [projectId]);

  // Handle create/update status report
  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      
      const statusReportData = {
        project_id: projectId,
        report_date: dayjs(values.report_date).toISOString(),
        reporting_period_start: dayjs(values.reporting_period_start).toISOString(),
        reporting_period_end: dayjs(values.reporting_period_end).toISOString(),
        overall_progress: values.overall_progress || 0,
        tasks_completed: values.tasks_completed || 0,
        tasks_in_progress: values.tasks_in_progress || 0,
        tasks_overdue: values.tasks_overdue || 0,
        status_summary: values.status_summary || '',
        key_achievements: values.key_achievements || [],
        challenges_faced: values.challenges_faced || [],
        next_period_goals: values.next_period_goals || [],
        risks_identified: values.risks_identified || [],
        schedule_variance: values.schedule_variance,
        quality_metrics: values.quality_metrics
      };

      if (selectedStatusReport) {
        await projectStatusReportService.updateStatusReport(selectedStatusReport.id, statusReportData);
        message.success('Cập nhật báo cáo trạng thái thành công!');
      } else {
        await projectStatusReportService.createStatusReport(statusReportData);
        message.success('Tạo báo cáo trạng thái thành công!');
      }

      setModalVisible(false);
      form.resetFields();
      setSelectedStatusReport(null);
      loadStatusReports();
    } catch (error: any) {
      console.error('Error saving status report:', error);
      message.error(error.response?.data?.message || 'Có lỗi xảy ra khi lưu báo cáo trạng thái');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete status report
  const handleDelete = async (statusReportId: string) => {
    try {
      await projectStatusReportService.deleteStatusReport(statusReportId);
      message.success('Xóa báo cáo trạng thái thành công!');
      loadStatusReports();
    } catch (error: any) {
      console.error('Error deleting status report:', error);
      message.error('Có lỗi xảy ra khi xóa báo cáo trạng thái');
    }
  };

  // Handle view status report
  const handleView = (statusReport: ProjectStatusReport) => {
    setSelectedStatusReport(statusReport);
    setViewModalVisible(true);
  };

  // Handle edit status report
  const handleEdit = (statusReport: ProjectStatusReport) => {
    setSelectedStatusReport(statusReport);
    form.setFieldsValue({
      ...statusReport,
      report_date: statusReport.report_date ? dayjs(statusReport.report_date) : null
    });
    setModalVisible(true);
  };

  // Handle add new status report
  const handleAdd = () => {
    setSelectedStatusReport(null);
    form.resetFields();
    setModalVisible(true);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'on_track': 'success',
      'at_risk': 'warning',
      'behind_schedule': 'error',
      'on_hold': 'default',
      'completed': 'success'
    };
    return colors[status] || 'default';
  };

  // Get progress color
  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return '#52c41a';
    if (percentage >= 70) return '#1890ff';
    if (percentage >= 50) return '#faad14';
    return '#ff4d4f';
  };

  // Calculate statistics
  const stats = {
    total: statusReports.length,
    onTrack: statusReports.filter(sr => sr.overall_status === 'on_track').length,
    atRisk: statusReports.filter(sr => sr.overall_status === 'at_risk').length,
    behindSchedule: statusReports.filter(sr => sr.overall_status === 'behind_schedule').length,
    averageProgress: statusReports.length > 0 
      ? Math.round(statusReports.reduce((sum, sr) => sum + (sr.progress_percentage || 0), 0) / statusReports.length)
      : 0
  };

  // Table columns
  const columns = [
    {
      title: 'Ngày Báo Cáo',
      dataIndex: 'report_date',
      key: 'report_date',
      render: (date: string, record: ProjectStatusReport) => (
        <div>
          <Text strong>{dayjs(date).format('DD/MM/YYYY')}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {dayjs(record.reporting_period_start).format('DD/MM')} - {dayjs(record.reporting_period_end).format('DD/MM/YYYY')}
          </Text>
        </div>
      )
    },
    {
      title: 'Trạng Thái Tổng Thể',
      dataIndex: 'overall_status',
      key: 'overall_status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status === 'on_track' && 'Đúng tiến độ'}
          {status === 'at_risk' && 'Có rủi ro'}
          {status === 'behind_schedule' && 'Chậm tiến độ'}
          {status === 'on_hold' && 'Tạm dừng'}
          {status === 'completed' && 'Hoàn thành'}
        </Tag>
      )
    },
    {
      title: 'Tiến Độ',
      dataIndex: 'progress_percentage',
      key: 'progress_percentage',
      render: (percentage: number) => (
        <div>
          <Progress 
            percent={percentage} 
            size="small" 
            strokeColor={getProgressColor(percentage)}
            status={percentage === 100 ? 'success' : 'active'}
          />
          <Text style={{ fontSize: '12px' }}>{percentage}%</Text>
        </div>
      )
    },
    {
      title: 'Người Báo Cáo',
      dataIndex: 'reported_by',
      key: 'reported_by',
      render: (reportedBy: string) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Avatar size="small" icon={<UserOutlined />} />
          <Text>{reportedBy}</Text>
        </div>
      )
    },
    {
      title: 'Ngày Báo Cáo',
      dataIndex: 'report_date',
      key: 'report_date',
      render: (date: string) => (
        <Text>{dayjs(date).format('DD/MM/YYYY')}</Text>
      )
    },
    {
      title: 'Thao Tác',
      key: 'actions',
      render: (_: any, record: ProjectStatusReport) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => handleView(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <div>
      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng Báo Cáo"
              value={stats.total}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đúng Tiến Độ"
              value={stats.onTrack}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Có Rủi Ro"
              value={stats.atRisk}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tiến Độ Trung Bình"
              value={stats.averageProgress}
              prefix={<RiseOutlined />}
              valueStyle={{ color: '#1890ff' }}
              suffix="%"
            />
          </Card>
        </Col>
      </Row>

      {/* Status Reports Table */}
      <Card
        title="Quản Lý Báo Cáo Trạng Thái"
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            Tạo Báo Cáo Trạng Thái
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={statusReports}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} của ${total} báo cáo trạng thái`
          }}
        />
      </Card>

      {/* Add/Edit Status Report Modal */}
      <Modal
        title={selectedStatusReport ? 'Chỉnh Sửa Báo Cáo Trạng Thái' : 'Tạo Báo Cáo Trạng Thái Mới'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setSelectedStatusReport(null);
        }}
        footer={null}
        width={900}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            overall_status: 'on_track',
            overall_progress: 0,
            tasks_completed: 0,
            tasks_in_progress: 0,
            tasks_overdue: 0,
            schedule_variance: 0
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="reporting_period_start"
                label="Bắt Đầu Kỳ Báo Cáo"
                rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu kỳ báo cáo' }]}
              >
                <DatePicker 
                  style={{ width: '100%' }} 
                  placeholder="Chọn ngày bắt đầu"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="reporting_period_end"
                label="Kết Thúc Kỳ Báo Cáo"
                rules={[{ required: true, message: 'Vui lòng chọn ngày kết thúc kỳ báo cáo' }]}
              >
                <DatePicker 
                  style={{ width: '100%' }} 
                  placeholder="Chọn ngày kết thúc"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="report_date"
                label="Ngày Báo Cáo"
                rules={[{ required: true, message: 'Vui lòng chọn ngày báo cáo' }]}
              >
                <DatePicker 
                  style={{ width: '100%' }} 
                  placeholder="Chọn ngày báo cáo"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="overall_status"
                label="Trạng Thái Tổng Thể"
                rules={[{ required: true, message: 'Vui lòng chọn trạng thái tổng thể' }]}
              >
                <Select placeholder="Chọn trạng thái">
                  <Option value="on_track">Đúng tiến độ</Option>
                  <Option value="at_risk">Có rủi ro</Option>
                  <Option value="behind_schedule">Chậm tiến độ</Option>
                  <Option value="on_hold">Tạm dừng</Option>
                  <Option value="completed">Hoàn thành</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="progress_percentage"
                label="Phần Trăm Hoàn Thành"
                rules={[
                  { required: true, message: 'Vui lòng nhập phần trăm hoàn thành' },
                  { type: 'number', min: 0, max: 100, message: 'Phần trăm phải từ 0 đến 100' }
                ]}
              >
                <InputNumber 
                  style={{ width: '100%' }} 
                  placeholder="0"
                  min={0}
                  max={100}
                  suffix="%"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="tasks_completed"
                label="Nhiệm Vụ Hoàn Thành"
                rules={[
                  { type: 'number', min: 0, message: 'Số nhiệm vụ không được âm' }
                ]}
              >
                <InputNumber 
                  style={{ width: '100%' }} 
                  placeholder="0"
                  min={0}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="tasks_in_progress"
                label="Nhiệm Vụ Đang Thực Hiện"
                rules={[
                  { type: 'number', min: 0, message: 'Số nhiệm vụ không được âm' }
                ]}
              >
                <InputNumber 
                  style={{ width: '100%' }} 
                  placeholder="0"
                  min={0}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="tasks_overdue"
                label="Nhiệm Vụ Quá Hạn"
                rules={[
                  { type: 'number', min: 0, message: 'Số nhiệm vụ không được âm' }
                ]}
              >
                <InputNumber 
                  style={{ width: '100%' }} 
                  placeholder="0"
                  min={0}
                />
              </Form.Item>
            </Col>
          </Row>


          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="schedule_variance"
                label="Chênh Lệch Lịch Trình (Ngày)"
              >
                <InputNumber 
                  style={{ width: '100%' }} 
                  placeholder="0"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status_summary"
                label="Tóm Tắt Trạng Thái"
                rules={[
                  { required: true, message: 'Vui lòng nhập tóm tắt trạng thái' },
                  { max: 1000, message: 'Tóm tắt không được quá 1000 ký tự' }
                ]}
              >
                <TextArea 
                  rows={3} 
                  placeholder="Mô tả tóm tắt trạng thái dự án"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="key_achievements"
            label="Thành Tựu Chính"
            rules={[
              { required: true, message: 'Vui lòng nhập thành tựu chính' },
              { max: 2000, message: 'Thành tựu không được quá 2000 ký tự' }
            ]}
          >
            <TextArea 
              rows={4} 
              placeholder="Mô tả các thành tựu chính trong kỳ báo cáo"
            />
          </Form.Item>

          <Form.Item
            name="challenges_faced"
            label="Thách Thức Đã Gặp"
            rules={[{ max: 2000, message: 'Thách thức không được quá 2000 ký tự' }]}
          >
            <TextArea 
              rows={4} 
              placeholder="Mô tả các thách thức đã gặp phải"
            />
          </Form.Item>

          <Form.Item
            name="risks_identified"
            label="Rủi Ro Đã Xác Định"
            rules={[{ max: 2000, message: 'Rủi ro không được quá 2000 ký tự' }]}
          >
            <TextArea 
              rows={4} 
              placeholder="Mô tả các rủi ro đã xác định"
            />
          </Form.Item>

          <Form.Item
            name="next_period_goals"
            label="Mục Tiêu Kỳ Tiếp Theo"
            rules={[{ max: 2000, message: 'Mục tiêu không được quá 2000 ký tự' }]}
          >
            <TextArea 
              rows={4} 
              placeholder="Mô tả các mục tiêu cho kỳ báo cáo tiếp theo"
            />
          </Form.Item>


          <Form.Item
            name="reported_by"
            label="Người Báo Cáo"
            rules={[{ required: true, message: 'Vui lòng nhập người báo cáo' }]}
          >
            <Input placeholder="Nhập tên người báo cáo" />
          </Form.Item>

          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            gap: '8px',
            marginTop: '24px',
            paddingTop: '16px',
            borderTop: '1px solid #f0f0f0'
          }}>
            <Button onClick={() => setModalVisible(false)}>
              Hủy
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              icon={<PlusOutlined />}
            >
              {selectedStatusReport ? 'Cập Nhật' : 'Tạo Báo Cáo'}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* View Status Report Modal */}
      <Modal
        title="Chi Tiết Báo Cáo Trạng Thái"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedStatusReport && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Title level={4}>Báo Cáo Trạng Thái Dự Án</Title>
                <Text type="secondary">
                  {dayjs(selectedStatusReport.reporting_period_start).format('DD/MM/YYYY')} - {dayjs(selectedStatusReport.reporting_period_end).format('DD/MM/YYYY')}
                </Text>
              </Col>
              
              <Col span={12}>
                <Text strong>Trạng Thái Tổng Thể:</Text>
                <br />
                <Tag color={getStatusColor(selectedStatusReport.overall_status || 'on_track')}>
                  {selectedStatusReport.overall_status === 'on_track' && 'Đúng tiến độ'}
                  {selectedStatusReport.overall_status === 'at_risk' && 'Có rủi ro'}
                  {selectedStatusReport.overall_status === 'behind_schedule' && 'Chậm tiến độ'}
                  {selectedStatusReport.overall_status === 'on_hold' && 'Tạm dừng'}
                  {selectedStatusReport.overall_status === 'completed' && 'Hoàn thành'}
                </Tag>
              </Col>
              
              <Col span={12}>
                <Text strong>Tiến Độ:</Text>
                <br />
                <Progress 
                  percent={selectedStatusReport.progress_percentage || selectedStatusReport.overall_progress} 
                  strokeColor={getProgressColor(selectedStatusReport.progress_percentage || selectedStatusReport.overall_progress)}
                  status={(selectedStatusReport.progress_percentage || selectedStatusReport.overall_progress) === 100 ? 'success' : 'active'}
                />
                <Text>{selectedStatusReport.progress_percentage || selectedStatusReport.overall_progress}%</Text>
              </Col>
              
              <Col span={12}>
                <Text strong>Nhiệm Vụ:</Text>
                <br />
                <Text>Hoàn thành: {selectedStatusReport.tasks_completed}</Text>
                <br />
                <Text>Đang thực hiện: {selectedStatusReport.tasks_in_progress}</Text>
                <br />
                <Text>Quá hạn: {selectedStatusReport.tasks_overdue}</Text>
              </Col>
              
              
              {selectedStatusReport.schedule_variance && (
                <Col span={12}>
                  <Text strong>Chênh Lệch Lịch Trình:</Text>
                  <br />
                  <Text type={selectedStatusReport.schedule_variance > 0 ? 'danger' : selectedStatusReport.schedule_variance < 0 ? 'success' : undefined}>
                    {selectedStatusReport.schedule_variance > 0 ? '+' : ''}{selectedStatusReport.schedule_variance} ngày
                  </Text>
                </Col>
              )}
              
              <Col span={24}>
                <Text strong>Tóm Tắt Trạng Thái:</Text>
                <br />
                <Text>{selectedStatusReport.status_summary}</Text>
              </Col>
              
              {selectedStatusReport.key_achievements && selectedStatusReport.key_achievements.length > 0 && (
                <Col span={24}>
                  <Text strong>Thành Tựu Chính:</Text>
                  <br />
                  <Text>{Array.isArray(selectedStatusReport.key_achievements) ? selectedStatusReport.key_achievements.join(', ') : selectedStatusReport.key_achievements}</Text>
                </Col>
              )}
              
              {selectedStatusReport.challenges_faced && selectedStatusReport.challenges_faced.length > 0 && (
                <Col span={24}>
                  <Text strong>Thách Thức Đã Gặp:</Text>
                  <br />
                  <Text>{Array.isArray(selectedStatusReport.challenges_faced) ? selectedStatusReport.challenges_faced.join(', ') : selectedStatusReport.challenges_faced}</Text>
                </Col>
              )}
              
              {selectedStatusReport.risks_identified && selectedStatusReport.risks_identified.length > 0 && (
                <Col span={24}>
                  <Text strong>Rủi Ro Đã Xác Định:</Text>
                  <br />
                  <Text>{Array.isArray(selectedStatusReport.risks_identified) ? selectedStatusReport.risks_identified.join(', ') : selectedStatusReport.risks_identified}</Text>
                </Col>
              )}
              
              {selectedStatusReport.next_period_goals && selectedStatusReport.next_period_goals.length > 0 && (
                <Col span={24}>
                  <Text strong>Mục Tiêu Kỳ Tiếp Theo:</Text>
                  <br />
                  <Text>{Array.isArray(selectedStatusReport.next_period_goals) ? selectedStatusReport.next_period_goals.join(', ') : selectedStatusReport.next_period_goals}</Text>
                </Col>
              )}
              
              <Col span={12}>
                <Text strong>Người Báo Cáo:</Text>
                <br />
                <Text>{selectedStatusReport.reported_by}</Text>
              </Col>
              
              <Col span={12}>
                <Text strong>Ngày Báo Cáo:</Text>
                <br />
                <Text>{dayjs(selectedStatusReport.report_date).format('DD/MM/YYYY')}</Text>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StatusReportManagement;
