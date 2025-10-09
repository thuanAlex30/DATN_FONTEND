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
  Badge
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
  EnvironmentOutlined
} from '@ant-design/icons';
import type { RootState, AppDispatch } from '../../../../store';
import { fetchProjectTasks, deleteTask } from '../../../../store/slices/projectTaskSlice';

interface ProjectTasksProps {
  projectId: string;
}

const { Title, Text } = Typography;

const ProjectTasks: React.FC<ProjectTasksProps> = ({ projectId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { tasks, loading, error } = useSelector((state: RootState) => state.projectTask);
  const [, setCreateModalVisible] = useState(false);

  useEffect(() => {
    if (projectId) {
      dispatch(fetchProjectTasks(projectId));
    }
  }, [dispatch, projectId]);

  const handleDeleteTask = (id: string) => {
    dispatch(deleteTask(id));
  };


  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return { color: 'success', icon: <CheckCircleOutlined />, text: 'Hoàn thành' };
      case 'in_progress':
        return { color: 'processing', icon: <PlayCircleOutlined />, text: 'Đang thực hiện' };
      case 'pending':
        return { color: 'warning', icon: <PauseCircleOutlined />, text: 'Chờ thực hiện' };
      case 'cancelled':
        return { color: 'error', icon: <ExclamationCircleOutlined />, text: 'Đã hủy' };
      default:
        return { color: 'default', icon: <FileTextOutlined />, text: 'Không xác định' };
    }
  };

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'high':
        return { color: 'red', icon: <FlagOutlined />, text: 'Cao' };
      case 'medium':
        return { color: 'orange', icon: <FlagOutlined />, text: 'Trung bình' };
      case 'low':
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
    completed: tasks?.filter(t => t.status === 'completed').length || 0,
    inProgress: tasks?.filter(t => t.status === 'in_progress').length || 0,
    pending: tasks?.filter(t => t.status === 'pending').length || 0,
    highPriority: tasks?.filter(t => t.priority === 'high').length || 0,
    overdue: tasks?.filter(t => {
      if (!t.end_date) return false;
      return new Date(t.end_date) < new Date() && t.status !== 'completed';
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
          onClick={() => setCreateModalVisible(true)}
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
              onClick={() => setCreateModalVisible(true)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 border-0"
            >
              Tạo nhiệm vụ đầu tiên
            </Button>
          </motion.div>
        </Card>
      ) : (
        <div className="space-y-4">
          {tasks.map((task, index) => {
            const statusConfig = getStatusConfig(task.status);
            const priorityConfig = getPriorityConfig(task.priority);
            const isOverdue = task.end_date && new Date(task.end_date) < new Date() && task.status !== 'completed';
            
            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card
                  className={`hover:shadow-lg transition-all duration-300 ${
                    isOverdue ? 'border-red-300 bg-red-50' : ''
                  }`}
                  actions={[
                    <Tooltip title="Chỉnh sửa">
                      <Button
                        type="text"
                        icon={<EditOutlined />}
                        disabled
                        className="text-blue-500 hover:text-blue-700"
                      />
                    </Tooltip>,
                    <Popconfirm
                      title="Xóa nhiệm vụ"
                      description="Bạn có chắc chắn muốn xóa nhiệm vụ này?"
                      onConfirm={() => handleDeleteTask(task.id)}
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
                              {formatDate(task.start_date)} - {formatDate(task.end_date)}
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
                              {task.estimated_hours || 0}h
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
                              {task.phase_id || 'N/A'}
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
                              Chưa phân công
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
                          {task.progress || 0}%
                        </Text>
                      </div>
                      <Progress
                        percent={task.progress || 0}
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
    </motion.div>
  );
};

export default ProjectTasks;
