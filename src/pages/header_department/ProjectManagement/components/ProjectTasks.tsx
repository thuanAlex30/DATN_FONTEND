import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  Card,
  Row,
  Col,
  Button,
  Typography,
  Tag,
  Progress,
  Statistic,
  Tooltip,
  Popconfirm,
  Alert,
  Spin,
  Divider,
  Badge,
  Modal,
  Space,
  Empty,
  Image
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CheckCircleOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  ExclamationCircleOutlined,
  FlagOutlined,
  FileTextOutlined,
  TeamOutlined,
  EnvironmentOutlined,
  EyeOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import type { RootState, AppDispatch } from '../../../../store';
import { fetchProjectTasks, deleteTask } from '../../../../store/slices/projectTaskSlice';
import TaskFormModal from './TaskFormModal';
import { projectTaskService } from '../../../../services/projectTaskService';
import dayjs from 'dayjs';

interface ProjectTasksProps {
  projectId: string;
}

const { Title, Text } = Typography;

const ProjectTasks: React.FC<ProjectTasksProps> = ({ projectId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { tasks, loading, error } = useSelector((state: RootState) => state.projectTask);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [taskProgressLogs, setTaskProgressLogs] = useState<any[]>([]);
  const [loadingTaskLogs, setLoadingTaskLogs] = useState(false);
  const [confirmingTask, setConfirmingTask] = useState(false);

  useEffect(() => {
    if (projectId) {
      dispatch(fetchProjectTasks(projectId));
    }
  }, [dispatch, projectId]);

  const handleDeleteTask = (id: string) => {
    dispatch(deleteTask(id));
  };

  const handleCreateTask = () => {
    setEditingTask(null);
    setCreateModalVisible(true);
  };

  const handleEditTask = (task: any) => {
    setEditingTask(task);
    setCreateModalVisible(true);
  };

  const handleModalClose = () => {
    setCreateModalVisible(false);
    setEditingTask(null);
  };

  const handleTaskSuccess = () => {
    // Refresh tasks list
    dispatch(fetchProjectTasks(projectId));
  };

  const handleConfirmTaskComplete = async () => {
    if (!selectedTask) return;
    
    const taskId = selectedTask._id || selectedTask.id;
    if (!taskId) {
      message.error('Không tìm thấy ID nhiệm vụ');
      return;
    }

    try {
      setConfirmingTask(true);
      await projectTaskService.updateTask(taskId, {
        status: 'COMPLETED',
        progress_percentage: 100
      });
      message.success('Đã xác nhận hoàn thành nhiệm vụ');
      setViewModalVisible(false);
      setSelectedTask(null);
      setTaskProgressLogs([]);
      // Refresh tasks list
      dispatch(fetchProjectTasks(projectId));
    } catch (error: any) {
      console.error('Error confirming task complete:', error);
      message.error(error?.response?.data?.message || 'Không thể xác nhận hoàn thành nhiệm vụ');
    } finally {
      setConfirmingTask(false);
    }
  };

  const handleViewTask = async (task: any) => {
    setSelectedTask(task);
    setViewModalVisible(true);
    
    // Load progress logs
    const taskId = task._id || task.id;
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


  const getStatusConfig = (status: string) => {
    const statusUpper = status?.toUpperCase();
    switch (statusUpper) {
      case 'COMPLETED':
        return { color: 'success', icon: <CheckCircleOutlined />, text: 'Hoàn thành' };
      case 'IN_PROGRESS':
        return { color: 'processing', icon: <PlayCircleOutlined />, text: 'Đang thực hiện' };
      case 'PENDING':
        return { color: 'warning', icon: <PauseCircleOutlined />, text: 'Chờ thực hiện' };
      case 'ON_HOLD':
        return { color: 'default', icon: <PauseCircleOutlined />, text: 'Tạm dừng' };
      case 'CANCELLED':
        return { color: 'error', icon: <ExclamationCircleOutlined />, text: 'Đã hủy' };
      default:
        return { color: 'default', icon: <FileTextOutlined />, text: 'Không xác định' };
    }
  };

  const getPriorityConfig = (priority: string) => {
    const priorityUpper = priority?.toUpperCase();
    switch (priorityUpper) {
      case 'URGENT':
      case 'HIGH':
        return { color: 'red', icon: <FlagOutlined />, text: priorityUpper === 'URGENT' ? 'Khẩn cấp' : 'Cao' };
      case 'MEDIUM':
        return { color: 'orange', icon: <FlagOutlined />, text: 'Trung bình' };
      case 'LOW':
        return { color: 'green', icon: <FlagOutlined />, text: 'Thấp' };
      default:
        return { color: 'default', icon: <FlagOutlined />, text: 'Không xác định' };
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Chưa xác định';
    try {
      return new Date(dateString).toLocaleDateString('vi-VN');
    } catch {
      return 'Ngày không hợp lệ';
    }
  };

  // Calculate statistics
  const stats = {
    total: tasks?.length || 0,
    completed: tasks?.filter(t => t.status?.toUpperCase() === 'COMPLETED').length || 0,
    inProgress: tasks?.filter(t => t.status?.toUpperCase() === 'IN_PROGRESS').length || 0,
    pending: tasks?.filter(t => t.status?.toUpperCase() === 'PENDING').length || 0,
    highPriority: tasks?.filter(t => {
      const priority = t.priority?.toUpperCase();
      return priority === 'HIGH' || priority === 'URGENT';
    }).length || 0,
    overdue: tasks?.filter(t => {
      if (!t.planned_end_date) return false;
      const status = t.status?.toUpperCase();
      return new Date(t.planned_end_date) < new Date() && status !== 'COMPLETED';
    }).length || 0
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" tip="Đang tải danh sách nhiệm vụ..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Lỗi tải nhiệm vụ"
        description={error}
        type="error"
        showIcon
        className="mb-4"
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <Title level={2} className="mb-2 flex items-center gap-3">
            <FileTextOutlined className="text-blue-500" />
            Nhiệm vụ Dự án
          </Title>
          <Text type="secondary" className="text-lg">
            Quản lý và theo dõi tiến độ các nhiệm vụ trong dự án
          </Text>
        </div>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={handleCreateTask}
          className="bg-gradient-to-r from-blue-500 to-blue-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          Thêm nhiệm vụ
        </Button>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card className="text-center hover:shadow-lg transition-shadow duration-200">
            <Statistic
              title="Tổng số"
              value={stats.total}
              prefix={<FileTextOutlined className="text-blue-500" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card className="text-center hover:shadow-lg transition-shadow duration-200">
            <Statistic
              title="Hoàn thành"
              value={stats.completed}
              prefix={<CheckCircleOutlined className="text-green-500" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card className="text-center hover:shadow-lg transition-shadow duration-200">
            <Statistic
              title="Đang thực hiện"
              value={stats.inProgress}
              prefix={<PlayCircleOutlined className="text-blue-500" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card className="text-center hover:shadow-lg transition-shadow duration-200">
            <Statistic
              title="Chờ thực hiện"
              value={stats.pending}
              prefix={<PauseCircleOutlined className="text-orange-500" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card className="text-center hover:shadow-lg transition-shadow duration-200">
            <Statistic
              title="Ưu tiên cao"
              value={stats.highPriority}
              prefix={<FlagOutlined className="text-red-500" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card className="text-center hover:shadow-lg transition-shadow duration-200">
            <Statistic
              title="Quá hạn"
              value={stats.overdue}
              prefix={<ExclamationCircleOutlined className="text-red-500" />}
            />
          </Card>
        </Col>
      </Row>

      {/* Tasks List */}
      {!tasks || tasks.length === 0 ? (
        <Card className="text-center py-16">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <EnvironmentOutlined className="text-6xl text-gray-300 mb-4" />
            <Title level={3} className="text-gray-500 mb-2">
              Chưa có nhiệm vụ nào
            </Title>
            <Text type="secondary" className="text-lg mb-6 block">
              Dự án này chưa có nhiệm vụ nào được tạo. Hãy tạo nhiệm vụ đầu tiên để bắt đầu.
            </Text>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={handleCreateTask}
              className="bg-gradient-to-r from-blue-500 to-blue-600 border-0"
            >
              Tạo nhiệm vụ đầu tiên
            </Button>
          </motion.div>
        </Card>
      ) : (
        <div className="space-y-4">
          {tasks.map((task, index) => {
            const statusConfig = getStatusConfig(task.status || '');
            const priorityConfig = getPriorityConfig(task.priority || '');
            const statusUpper = task.status?.toUpperCase();
            const isOverdue = task.planned_end_date && new Date(task.planned_end_date) < new Date() && statusUpper !== 'COMPLETED';
            
            return (
              <motion.div
                key={task.id || task._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card
                  className={`hover:shadow-lg transition-all duration-300 ${
                    isOverdue ? 'border-red-300 bg-red-50' : ''
                  }`}
                  actions={[
                    <Tooltip title="Xem chi tiết">
                      <Button
                        type="text"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewTask(task)}
                        className="text-green-500 hover:text-green-700"
                      />
                    </Tooltip>,
                    <Tooltip title="Chỉnh sửa">
                      <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handleEditTask(task)}
                        className="text-blue-500 hover:text-blue-700"
                      />
                    </Tooltip>,
                    <Popconfirm
                      title="Xóa nhiệm vụ"
                      description="Bạn có chắc chắn muốn xóa nhiệm vụ này?"
                      onConfirm={() => handleDeleteTask(task.id || task._id)}
                      okText="Xóa"
                      cancelText="Hủy"
                    >
                      <Tooltip title="Xóa">
                        <Button
                          type="text"
                          icon={<DeleteOutlined />}
                          className="text-red-500 hover:text-red-700"
                        />
                      </Tooltip>
                    </Popconfirm>
                  ]}
                >
                  <div className="space-y-4">
                    {/* Task Header */}
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Title level={4} className="mb-0">
                            {task.task_name}
                          </Title>
                          {isOverdue && (
                            <Badge status="error" text="Quá hạn" />
                          )}
                        </div>
                        <Text type="secondary" className="text-base">
                          {task.description || 'Không có mô tả'}
                        </Text>
                      </div>
                      <div className="flex gap-2">
                        <Tag
                          color={statusConfig.color}
                          icon={statusConfig.icon}
                          className="text-sm px-3 py-1"
                        >
                          {statusConfig.text}
                        </Tag>
                        <Tag
                          color={priorityConfig.color}
                          icon={priorityConfig.icon}
                          className="text-sm px-3 py-1"
                        >
                          {priorityConfig.text}
                        </Tag>
                      </div>
                    </div>

                    <Divider className="my-3" />

                    {/* Task Details */}
                    <Row gutter={[16, 16]}>
                      <Col xs={24} sm={12} md={6}>
                        <div className="flex items-center gap-2">
                          <CalendarOutlined className="text-blue-500" />
                          <div>
                            <Text type="secondary" className="text-xs">
                              Thời gian
                            </Text>
                            <div className="text-sm">
                              {formatDate(task.planned_start_date)} - {formatDate(task.planned_end_date)}
                            </div>
                          </div>
                        </div>
                      </Col>
                      <Col xs={24} sm={12} md={6}>
                        <div className="flex items-center gap-2">
                          <ClockCircleOutlined className="text-green-500" />
                          <div>
                            <Text type="secondary" className="text-xs">
                              Ước tính
                            </Text>
                            <div className="text-sm">
                              {task.planned_duration_hours || 0}h
                            </div>
                          </div>
                        </div>
                      </Col>
                      <Col xs={24} sm={12} md={6}>
                        <div className="flex items-center gap-2">
                          <UserOutlined className="text-purple-500" />
                          <div>
                            <Text type="secondary" className="text-xs">
                              Giai đoạn
                            </Text>
                            <div className="text-sm">
                              {(task as any).phase_id?.phase_name || (task as any).phase_name || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </Col>
                      <Col xs={24} sm={12} md={6}>
                        <div className="flex items-center gap-2">
                          <TeamOutlined className="text-orange-500" />
                          <div>
                            <Text type="secondary" className="text-xs">
                              Người phụ trách
                            </Text>
                            <div className="text-sm">
                              {(task as any).responsible_user_id?.full_name || 
                               (task as any).responsible_user?.full_name || 
                               (task.responsible_user_id ? 'Đã phân công' : 'Chưa phân công')}
                            </div>
                          </div>
                        </div>
                      </Col>
                    </Row>

                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Text type="secondary" className="text-sm">
                          Tiến độ
                        </Text>
                        <Text className="text-sm font-medium">
                          {task.progress_percentage || 0}%
                        </Text>
                      </div>
                      <Progress
                        percent={task.progress_percentage || 0}
                        strokeColor={{
                          '0%': '#108ee9',
                          '100%': '#87d068',
                        }}
                        trailColor="#f0f0f0"
                        size="small"
                      />
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Task Form Modal */}
      <TaskFormModal
        visible={createModalVisible}
        onClose={handleModalClose}
        onSuccess={handleTaskSuccess}
        projectId={projectId}
        task={editingTask}
      />

      {/* View Task Detail Modal with Progress Logs */}
      <Modal
        title={
          <Space>
            <EyeOutlined />
            <span>Chi tiết nhiệm vụ - {selectedTask?.task_name}</span>
          </Space>
        }
        open={viewModalVisible}
        onCancel={() => {
          setViewModalVisible(false);
          setSelectedTask(null);
          setTaskProgressLogs([]);
        }}
        footer={[
          <Button key="close" onClick={() => {
            setViewModalVisible(false);
            setSelectedTask(null);
            setTaskProgressLogs([]);
          }}>
            Đóng
          </Button>,
          (() => {
            if (!selectedTask) return null;
            const status = String(selectedTask.status || '').toUpperCase();
            const isCompleted = status === 'COMPLETED' || status === 'HOÀN THÀNH' || status === 'HOAN THANH';
            
            // Nút luôn hiển thị (không cần check progress)
            return (
              <Button
                key="confirm"
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={handleConfirmTaskComplete}
                loading={confirmingTask}
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                disabled={isCompleted}
              >
                {isCompleted ? 'Đã đóng nhiệm vụ' : 'Xác nhận hoàn thành'}
              </Button>
            );
          })()
        ]}
        width={800}
      >
        {selectedTask && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Title level={5}>{selectedTask.task_name}</Title>
                <Text>{selectedTask.description || 'Không có mô tả'}</Text>
              </Col>
              
              <Col span={12}>
                <Text strong>Trạng thái:</Text>
                <br />
                <Tag color={getStatusConfig(selectedTask.status || '').color}>
                  {getStatusConfig(selectedTask.status || '').text}
                </Tag>
              </Col>
              
              <Col span={12}>
                <Text strong>Ưu tiên:</Text>
                <br />
                <Tag color={getPriorityConfig(selectedTask.priority || '').color}>
                  {getPriorityConfig(selectedTask.priority || '').text}
                </Tag>
              </Col>
              
              <Col span={12}>
                <Text strong>Người phụ trách:</Text>
                <br />
                <Text>
                  {(selectedTask as any).responsible_user_id?.full_name || 
                   (selectedTask as any).responsible_user?.full_name || 
                   'Chưa phân công'}
                </Text>
              </Col>
              
              <Col span={12}>
                <Text strong>Tiến độ:</Text>
                <br />
                <Progress 
                  percent={selectedTask.progress_percentage || 0} 
                  status={selectedTask.progress_percentage === 100 ? 'success' : 'active'}
                />
              </Col>
              
              <Col span={12}>
                <Text strong>Ngày bắt đầu:</Text>
                <br />
                <Text>{dayjs(selectedTask.planned_start_date).format('DD/MM/YYYY')}</Text>
              </Col>
              
              <Col span={12}>
                <Text strong>Ngày hết hạn:</Text>
                <br />
                <Text>{dayjs(selectedTask.planned_end_date).format('DD/MM/YYYY')}</Text>
              </Col>
              
              <Col span={12}>
                <Text strong>Giờ ước tính:</Text>
                <br />
                <Text>{selectedTask.planned_duration_hours || 0} giờ</Text>
              </Col>
              
              <Col span={12}>
                <Text strong>Giờ thực tế:</Text>
                <br />
                <Text>{selectedTask.actual_duration_hours || 0} giờ</Text>
              </Col>
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
                        {log.images && Array.isArray(log.images) && log.images.length > 0 && (
                          <div style={{ marginTop: '12px' }}>
                            <Text strong style={{ display: 'block', marginBottom: '8px', color: '#1890ff' }}>
                              Hình ảnh báo cáo:
                            </Text>
                            <Row gutter={[8, 8]}>
                              {log.images.map((imageUrl: string, imgIdx: number) => (
                                <Col key={imgIdx} xs={12} sm={8} md={6}>
                                  <Image
                                    src={imageUrl}
                                    alt={`report-${index}-${imgIdx}`}
                                    style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '4px' }}
                                    preview={{
                                      mask: 'Xem ảnh'
                                    }}
                                  />
                                </Col>
                              ))}
                            </Row>
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
    </motion.div>
  );
};

export default ProjectTasks;
