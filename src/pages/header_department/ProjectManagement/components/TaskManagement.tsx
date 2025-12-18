import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Tag,
  Progress,
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
  Avatar,
  Spin,
  Empty
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  TeamOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import { projectTaskService } from '../../../../services/projectTaskService';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface TaskManagementProps {
  projectId: string;
}

interface ProjectTask {
  id: string;
  task_name: string;
  description: string;
  task_type: string;
  priority: string;
  status: string;
  assigned_to: string;
  start_date: string;
  due_date: string;
  estimated_hours: number;
  actual_hours: number;
  progress_percentage: number;
  dependencies: string[];
  tags: string[];
  notes: string;
  // backend compatibility (optional)
  _id?: string;
  planned_start_date?: string;
  planned_end_date?: string;
  planned_duration_hours?: number;
  actual_duration_hours?: number;
  responsible_user_id?: any;
  responsible_user?: any;
}

const TaskManagement: React.FC<TaskManagementProps> = ({ projectId }) => {
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ProjectTask | null>(null);
  const [form] = Form.useForm();
  const [taskProgressLogs, setTaskProgressLogs] = useState<any[]>([]);
  const [loadingTaskLogs, setLoadingTaskLogs] = useState(false);

  const normalizeStatus = (statusRaw: any): string => {
    const s = String(statusRaw || '').trim();
    const upper = s.toUpperCase();

    // Backend statuses
    if (upper === 'PENDING') return 'not_started';
    if (upper === 'IN_PROGRESS') return 'in_progress';
    if (upper === 'COMPLETED') return 'completed';
    if (upper === 'ON_HOLD') return 'on_hold';
    if (upper === 'CANCELLED') return 'cancelled';

    // Already normalized (frontend)
    return s || 'not_started';
  };

  const normalizePriority = (priorityRaw: any): string => {
    const p = String(priorityRaw || '').trim();
    const upper = p.toUpperCase();

    if (upper === 'LOW') return 'low';
    if (upper === 'MEDIUM') return 'medium';
    if (upper === 'HIGH') return 'high';
    if (upper === 'URGENT') return 'critical';
    if (upper === 'CRITICAL') return 'critical';

    return p || 'medium';
  };

  const normalizeAssignedTo = (task: any): string => {
    const responsible = task?.responsible_user_id || task?.responsible_user;
    if (responsible && typeof responsible === 'object') {
      return responsible.full_name || responsible.name || responsible.email || 'N/A';
    }

    const assigned = task?.assigned_to;
    if (assigned && typeof assigned === 'object') {
      return assigned.full_name || assigned.name || assigned.email || 'N/A';
    }

    if (typeof assigned === 'string' && assigned.trim()) return assigned;
    return 'N/A';
  };

  const normalizeTask = (t: any): ProjectTask => {
    const startDate = t.start_date || t.planned_start_date || t.planned_start || t.plannedStartDate || '';
    const dueDate = t.due_date || t.planned_end_date || t.planned_end || t.plannedEndDate || '';

    return {
      id: t.id || t._id || '',
      _id: t._id,
      task_name: t.task_name || '',
      description: t.description || '',
      task_type: t.task_type || '',
      priority: normalizePriority(t.priority),
      status: normalizeStatus(t.status),
      assigned_to: normalizeAssignedTo(t),
      start_date: startDate,
      due_date: dueDate,
      estimated_hours: Number(t.estimated_hours ?? t.planned_duration_hours ?? 0) || 0,
      actual_hours: Number(t.actual_hours ?? t.actual_duration_hours ?? 0) || 0,
      progress_percentage: Number(t.progress_percentage ?? t.progress ?? 0) || 0,
      dependencies: Array.isArray(t.dependencies) ? t.dependencies : [],
      tags: Array.isArray(t.tags) ? t.tags : [],
      notes: t.notes || '',
      planned_start_date: t.planned_start_date,
      planned_end_date: t.planned_end_date,
      planned_duration_hours: t.planned_duration_hours,
      actual_duration_hours: t.actual_duration_hours,
      responsible_user_id: t.responsible_user_id,
      responsible_user: t.responsible_user
    };
  };

  // Load tasks
  const loadTasks = async () => {
    if (!projectId) return;
    
    try {
      setLoading(true);
      const response = await projectTaskService.getProjectTasks(projectId);
      const raw = response.data || [];
      const normalized = Array.isArray(raw) ? raw.map(normalizeTask) : [];
      setTasks(normalized);
    } catch (error: any) {
      console.error('Error loading tasks:', error);
      message.error('Không thể tải danh sách nhiệm vụ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [projectId]);

  // Handle create/update task
  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      
      const taskData = {
        project_id: projectId,
        task_name: values.task_name,
        description: values.description,
        task_type: values.task_type,
        priority: values.priority,
        status: values.status,
        assigned_to: values.assigned_to,
        start_date: dayjs(values.start_date).toISOString(),
        due_date: dayjs(values.due_date).toISOString(),
        estimated_hours: values.estimated_hours,
        actual_hours: values.actual_hours || 0,
        progress_percentage: values.progress_percentage || 0,
        dependencies: values.dependencies || [],
        tags: values.tags || [],
        notes: values.notes,
        task_code: `TASK-${Date.now()}`,
        planned_start_date: dayjs(values.start_date).toISOString(),
        planned_end_date: dayjs(values.due_date).toISOString(),
        planned_duration_hours: values.estimated_hours,
        created_by: 'current_user',
        area_id: 'default_area',
        location_id: 'default_location',
        severity: 'medium'
      };

      if (selectedTask) {
        await projectTaskService.updateTask(selectedTask.id, taskData);
        message.success('Cập nhật nhiệm vụ thành công!');
      } else {
        await projectTaskService.createTask(taskData);
        message.success('Tạo nhiệm vụ thành công!');
      }

      setModalVisible(false);
      form.resetFields();
      setSelectedTask(null);
      loadTasks();
    } catch (error: any) {
      console.error('Error saving task:', error);
      message.error(error.response?.data?.message || 'Có lỗi xảy ra khi lưu nhiệm vụ');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete task
  const handleDelete = async (taskId: string) => {
    try {
      await projectTaskService.deleteTask(taskId);
      message.success('Xóa nhiệm vụ thành công!');
      loadTasks();
    } catch (error: any) {
      console.error('Error deleting task:', error);
      message.error('Có lỗi xảy ra khi xóa nhiệm vụ');
    }
  };

  // Handle view task
  const handleView = async (task: ProjectTask) => {
    setSelectedTask(task);
    setViewModalVisible(true);
    
    // Load progress logs
    const taskId = (task as any)._id || task.id;
    if (taskId) {
      setLoadingTaskLogs(true);
      try {
        const response = await projectTaskService.getTaskProgressLogs(taskId);
        if (response.success && response.data) {
          setTaskProgressLogs(response.data);
        } else {
          setTaskProgressLogs([]);
        }
      } catch (error: any) {
        console.error('Error loading task progress logs:', error);
        setTaskProgressLogs([]);
      } finally {
        setLoadingTaskLogs(false);
      }
    }
  };

  // Handle edit task
  const handleEdit = (task: ProjectTask) => {
    setSelectedTask(task);
    form.setFieldsValue({
      ...task,
      start_date: task.start_date ? dayjs(task.start_date) : null,
      due_date: task.due_date ? dayjs(task.due_date) : null
    });
    setModalVisible(true);
  };

  // Handle add new task
  const handleAdd = () => {
    setSelectedTask(null);
    form.resetFields();
    setModalVisible(true);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'not_started': 'default',
      'in_progress': 'processing',
      'completed': 'success',
      'on_hold': 'warning',
      'cancelled': 'error'
    };
    return colors[status] || 'default';
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    const colors: { [key: string]: string } = {
      'low': 'green',
      'medium': 'orange',
      'high': 'red',
      'critical': 'red'
    };
    return colors[priority] || 'default';
  };

  // Calculate statistics
  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    overdue: tasks.filter(t => 
      t.status !== 'completed' && 
      t.due_date && 
      dayjs(t.due_date).isBefore(dayjs())
    ).length
  };

  // Table columns
  const columns = [
    {
      title: 'Tên Nhiệm Vụ',
      dataIndex: 'task_name',
      key: 'task_name',
      render: (text: string, record: ProjectTask) => (
        <div>
          <Text strong>{text}</Text>
          {record.tags && record.tags.length > 0 && (
            <div style={{ marginTop: 4 }}>
              {record.tags.map((tag: string, index: number) => (
                <Tag key={index} color="blue">
                  {tag}
                </Tag>
              ))}
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const s = normalizeStatus(status);
        const label =
          s === 'not_started' ? 'Chưa bắt đầu' :
          s === 'in_progress' ? 'Đang thực hiện' :
          s === 'completed' ? 'Hoàn thành' :
          s === 'on_hold' ? 'Tạm dừng' :
          s === 'cancelled' ? 'Hủy bỏ' :
          'Không xác định';

        return (
          <Tag color={getStatusColor(s)}>
            {label}
          </Tag>
        );
      }
    },
    {
      title: 'Ưu Tiên',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => {
        const p = normalizePriority(priority);
        const label =
          p === 'low' ? 'Thấp' :
          p === 'medium' ? 'Trung bình' :
          p === 'high' ? 'Cao' :
          p === 'critical' ? 'Nghiêm trọng' :
          'Không xác định';

        return (
          <Tag color={getPriorityColor(p)}>
            {label}
          </Tag>
        );
      }
    },
    {
      title: 'Người Thực Hiện',
      dataIndex: 'assigned_to',
      key: 'assigned_to',
      render: (assignedTo: string) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Avatar size="small" icon={<UserOutlined />} />
          <Text>{assignedTo}</Text>
        </div>
      )
    },
    {
      title: 'Tiến Độ',
      dataIndex: 'progress_percentage',
      key: 'progress_percentage',
      render: (percentage: number) => (
        <Progress 
          percent={percentage} 
          size="small" 
          status={percentage === 100 ? 'success' : 'active'}
        />
      )
    },
    {
      title: 'Ngày Hết Hạn',
      dataIndex: 'due_date',
      key: 'due_date',
      render: (date: string) => {
        if (!date) return <Text type="secondary">N/A</Text>;
        const isOverdue = dayjs(date).isBefore(dayjs());
        const isToday = dayjs(date).isSame(dayjs(), 'day');
        
        return (
          <div>
            <Text type={isOverdue ? 'danger' : isToday ? 'warning' : undefined}>
              {dayjs(date).format('DD/MM/YYYY')}
            </Text>
            {isOverdue && <ExclamationCircleOutlined style={{ color: '#ff4d4f', marginLeft: 4 }} />}
            {isToday && <ClockCircleOutlined style={{ color: '#faad14', marginLeft: 4 }} />}
          </div>
        );
      }
    },
    {
      title: 'Thao Tác',
      key: 'actions',
      render: (_: any, record: ProjectTask) => (
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
              title="Tổng Nhiệm Vụ"
              value={stats.total}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Hoàn Thành"
              value={stats.completed}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đang Thực Hiện"
              value={stats.inProgress}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Quá Hạn"
              value={stats.overdue}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Task Table */}
      <Card
        title="Quản Lý Nhiệm Vụ"
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            Thêm Nhiệm Vụ
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={tasks}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} của ${total} nhiệm vụ`
          }}
        />
      </Card>

      {/* Add/Edit Task Modal */}
      <Modal
        title={selectedTask ? 'Chỉnh Sửa Nhiệm Vụ' : 'Thêm Nhiệm Vụ Mới'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setSelectedTask(null);
        }}
        footer={null}
        width={800}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            status: 'not_started',
            priority: 'medium',
            progress_percentage: 0,
            estimated_hours: 8
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="task_name"
                label="Tên Nhiệm Vụ"
                rules={[
                  { required: true, message: 'Vui lòng nhập tên nhiệm vụ' },
                  { max: 255, message: 'Tên nhiệm vụ không được quá 255 ký tự' }
                ]}
              >
                <Input placeholder="Nhập tên nhiệm vụ" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="task_type"
                label="Loại Nhiệm Vụ"
                rules={[{ required: true, message: 'Vui lòng chọn loại nhiệm vụ' }]}
              >
                <Select placeholder="Chọn loại nhiệm vụ">
                  <Option value="development">Phát triển</Option>
                  <Option value="testing">Kiểm thử</Option>
                  <Option value="design">Thiết kế</Option>
                  <Option value="documentation">Tài liệu</Option>
                  <Option value="review">Đánh giá</Option>
                  <Option value="meeting">Họp</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Mô Tả"
            rules={[
              { required: true, message: 'Vui lòng nhập mô tả' },
              { max: 1000, message: 'Mô tả không được quá 1000 ký tự' }
            ]}
          >
            <TextArea 
              rows={3} 
              placeholder="Mô tả chi tiết về nhiệm vụ"
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="priority"
                label="Ưu Tiên"
                rules={[{ required: true, message: 'Vui lòng chọn ưu tiên' }]}
              >
                <Select placeholder="Chọn ưu tiên">
                  <Option value="low">Thấp</Option>
                  <Option value="medium">Trung bình</Option>
                  <Option value="high">Cao</Option>
                  <Option value="critical">Nghiêm trọng</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="status"
                label="Trạng Thái"
                rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
              >
                <Select placeholder="Chọn trạng thái">
                  <Option value="not_started">Chưa bắt đầu</Option>
                  <Option value="in_progress">Đang thực hiện</Option>
                  <Option value="completed">Hoàn thành</Option>
                  <Option value="on_hold">Tạm dừng</Option>
                  <Option value="cancelled">Hủy bỏ</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="progress_percentage"
                label="Tiến Độ (%)"
                rules={[
                  { required: true, message: 'Vui lòng nhập tiến độ' },
                  { type: 'number', min: 0, max: 100, message: 'Tiến độ phải từ 0 đến 100' }
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
            <Col span={12}>
              <Form.Item
                name="assigned_to"
                label="Người Thực Hiện"
                rules={[{ required: true, message: 'Vui lòng nhập người thực hiện' }]}
              >
                <Input placeholder="Nhập tên người thực hiện" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="estimated_hours"
                label="Giờ Ước Tính"
                rules={[
                  { required: true, message: 'Vui lòng nhập giờ ước tính' },
                  { type: 'number', min: 0, message: 'Giờ ước tính phải lớn hơn 0' }
                ]}
              >
                <InputNumber 
                  style={{ width: '100%' }} 
                  placeholder="8"
                  min={0}
                  suffix="giờ"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="start_date"
                label="Ngày Bắt Đầu"
                rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu' }]}
              >
                <DatePicker 
                  style={{ width: '100%' }} 
                  placeholder="Chọn ngày bắt đầu"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="due_date"
                label="Ngày Hết Hạn"
                rules={[{ required: true, message: 'Vui lòng chọn ngày hết hạn' }]}
              >
                <DatePicker 
                  style={{ width: '100%' }} 
                  placeholder="Chọn ngày hết hạn"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="notes"
            label="Ghi Chú"
            rules={[{ max: 500, message: 'Ghi chú không được quá 500 ký tự' }]}
          >
            <TextArea 
              rows={3} 
              placeholder="Ghi chú bổ sung về nhiệm vụ"
            />
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
              {selectedTask ? 'Cập Nhật' : 'Tạo Nhiệm Vụ'}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* View Task Modal */}
      <Modal
        title="Chi Tiết Nhiệm Vụ"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedTask && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Title level={4}>{selectedTask.task_name}</Title>
                <Text>{selectedTask.description}</Text>
              </Col>
              
              <Col span={12}>
                <Text strong>Trạng Thái:</Text>
                <br />
                <Tag color={getStatusColor(selectedTask.status)}>
                  {selectedTask.status === 'not_started' && 'Chưa bắt đầu'}
                  {selectedTask.status === 'in_progress' && 'Đang thực hiện'}
                  {selectedTask.status === 'completed' && 'Hoàn thành'}
                  {selectedTask.status === 'on_hold' && 'Tạm dừng'}
                  {selectedTask.status === 'cancelled' && 'Hủy bỏ'}
                </Tag>
              </Col>
              
              <Col span={12}>
                <Text strong>Ưu Tiên:</Text>
                <br />
                <Tag color={getPriorityColor(selectedTask.priority)}>
                  {selectedTask.priority === 'low' && 'Thấp'}
                  {selectedTask.priority === 'medium' && 'Trung bình'}
                  {selectedTask.priority === 'high' && 'Cao'}
                  {selectedTask.priority === 'critical' && 'Nghiêm trọng'}
                </Tag>
              </Col>
              
              <Col span={12}>
                <Text strong>Người Thực Hiện:</Text>
                <br />
                <Text>{selectedTask.assigned_to}</Text>
              </Col>
              
              <Col span={12}>
                <Text strong>Tiến Độ:</Text>
                <br />
                <Progress 
                  percent={selectedTask.progress_percentage} 
                  status={selectedTask.progress_percentage === 100 ? 'success' : 'active'}
                />
              </Col>
              
              <Col span={12}>
                <Text strong>Ngày Bắt Đầu:</Text>
                <br />
                <Text>{dayjs(selectedTask.start_date).format('DD/MM/YYYY')}</Text>
              </Col>
              
              <Col span={12}>
                <Text strong>Ngày Hết Hạn:</Text>
                <br />
                <Text>{dayjs(selectedTask.due_date).format('DD/MM/YYYY')}</Text>
              </Col>
              
              <Col span={12}>
                <Text strong>Giờ Ước Tính:</Text>
                <br />
                <Text>{selectedTask.estimated_hours} giờ</Text>
              </Col>
              
              <Col span={12}>
                <Text strong>Giờ Thực Tế:</Text>
                <br />
                <Text>{selectedTask.actual_hours || 0} giờ</Text>
              </Col>
              
              {selectedTask.notes && (
                <Col span={24}>
                  <Text strong>Ghi Chú:</Text>
                  <br />
                  <Text>{selectedTask.notes}</Text>
                </Col>
              )}
            </Row>
            
            {/* Lịch sử báo cáo từ Manager */}
            <div style={{ marginTop: '24px', borderTop: '1px solid #f0f0f0', paddingTop: '16px' }}>
              <Title level={5}>
                <HistoryOutlined style={{ marginRight: '8px' }} />
                Lịch sử báo cáo từ Manager
              </Title>
              {loadingTaskLogs ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <Spin size="small" />
                </div>
              ) : taskProgressLogs.length === 0 ? (
                <Empty description="Chưa có báo cáo nào từ Manager" size="small" />
              ) : (
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {taskProgressLogs.map((log: any, index: number) => (
                    <Card
                      key={log.id || log._id || index}
                      style={{ marginBottom: '12px', borderRadius: '8px' }}
                      size="small"
                    >
                      <Space direction="vertical" style={{ width: '100%' }} size="small">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Space>
                            <ClockCircleOutlined style={{ color: '#1890ff' }} />
                            <Text strong>
                              {dayjs(log.report_date || log.log_date || log.created_at).format('DD/MM/YYYY HH:mm')}
                            </Text>
                          </Space>
                          <Tag color="blue">{log.progress_percentage || 0}%</Tag>
                        </div>
                        {log.user_id && (
                          <div>
                            <UserOutlined style={{ marginRight: '8px', color: '#8c8c8c' }} />
                            <Text type="secondary">
                              {typeof log.user_id === 'object' 
                                ? log.user_id?.full_name || log.user_id?.email || 'N/A'
                                : 'N/A'}
                            </Text>
                          </div>
                        )}
                        {log.work_description && (
                          <div style={{ marginTop: '8px', padding: '12px', background: '#f5f5f5', borderRadius: '4px' }}>
                            <Text strong style={{ display: 'block', marginBottom: '4px', color: '#1890ff' }}>
                              Ghi chú gửi Header Department:
                            </Text>
                            <Text>{log.work_description}</Text>
                          </div>
                        )}
                        {log.hours_worked > 0 && (
                          <div>
                            <Text type="secondary">Giờ làm việc: {log.hours_worked}h</Text>
                          </div>
                        )}
                      </Space>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TaskManagement;
