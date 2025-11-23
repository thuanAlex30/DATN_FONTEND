import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Progress, 
  Button, 
  Space, 
  Typography, 
  Tag, 
  List, 
  Avatar, 
  Timeline
} from 'antd';
import {
  CheckCircleOutlined,
  PlayCircleOutlined,
  ExclamationCircleOutlined,
  FlagOutlined,
  CalendarOutlined,
  PlusOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  RightOutlined
} from '@ant-design/icons';
import type { RootState, AppDispatch } from '../../../../store';
import { fetchProjectTasks } from '../../../../store/slices/projectTaskSlice';
import { fetchProjectMilestones } from '../../../../store/slices/projectMilestoneSlice';
import { fetchProjectRisks } from '../../../../store/slices/projectRiskSlice';
import { fetchProjectResources, setCurrentProjectId } from '../../../../store/slices/projectResourceSlice';
import { clearProjectResourceCache } from '../../../../utils/apiCache';

interface ProgressTrackingDashboardProps {
  projectId: string;
}

const ProgressTrackingDashboard: React.FC<ProgressTrackingDashboardProps> = ({ projectId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { tasks } = useSelector((state: RootState) => state.projectTask);
  const { milestones } = useSelector((state: RootState) => state.projectMilestone);
  const { risks } = useSelector((state: RootState) => state.projectRisk);
  const { resources } = useSelector((state: RootState) => state.projectResource);
  
  // Use risks and resources for additional dashboard metrics
  const totalRisks = risks?.length || 0;
  const totalResources = resources?.length || 0;
  
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'quarter'>('week');
  const [progressData, setProgressData] = useState({
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    overdueTasks: 0,
    totalMilestones: 0,
    completedMilestones: 0,
    upcomingMilestones: 0,
    overallProgress: 0
  });

  useEffect(() => {
    if (projectId) {
      // Clear resources when switching projects
      dispatch(setCurrentProjectId(projectId));
      // Clear API cache to ensure fresh data
      clearProjectResourceCache();
      
      // Fetch all project-specific data for comprehensive dashboard
      dispatch(fetchProjectTasks(projectId));
      dispatch(fetchProjectMilestones(projectId));
      dispatch(fetchProjectRisks(projectId));
      dispatch(fetchProjectResources(projectId));
    }
  }, [dispatch, projectId]);

  useEffect(() => {
    // Calculate progress data
    const completedTasks = tasks?.filter(task => (task.status || '').toString().toUpperCase() === 'COMPLETED').length || 0;
    const inProgressTasks = tasks?.filter(task => (task.status || '').toString().toUpperCase() === 'IN_PROGRESS').length || 0;
    const overdueTasks = tasks?.filter(task => {
      if ((task.status || '').toString().toUpperCase() === 'COMPLETED') return false;
      const endDate = new Date(task.end_date);
      return endDate < new Date();
    }).length || 0;

    const completedMilestones = milestones?.filter(milestone => (milestone.status || '').toString().toUpperCase() === 'COMPLETED').length || 0;
    const upcomingMilestones = milestones?.filter(milestone => {
      const dueDate = new Date(milestone.planned_date);
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      return (milestone.status || '').toString().toUpperCase() !== 'COMPLETED' && dueDate <= nextWeek;
    }).length || 0;

    const overallProgress = tasks?.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

    setProgressData({
      totalTasks: tasks?.length || 0,
      completedTasks,
      inProgressTasks,
      overdueTasks,
      totalMilestones: milestones?.length || 0,
      completedMilestones,
      upcomingMilestones,
      overallProgress
    });
  }, [tasks, milestones]);

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return '#52c41a';
    if (progress >= 60) return '#faad14';
    if (progress >= 40) return '#fa8c16';
    return '#ff4d4f';
  };

  const getTaskStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'in_progress': return <PlayCircleOutlined style={{ color: '#1890ff' }} />;
      case 'pending': return <ClockCircleOutlined style={{ color: '#faad14' }} />;
      case 'cancelled': return <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />;
      default: return <ClockCircleOutlined style={{ color: '#d9d9d9' }} />;
    }
  };

  const getMilestoneStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <FlagOutlined style={{ color: '#52c41a' }} />;
      case 'IN_PROGRESS': return <FlagOutlined style={{ color: '#1890ff' }} />;
      case 'PLANNED': return <FlagOutlined style={{ color: '#faad14' }} />;
      case 'OVERDUE': return <FlagOutlined style={{ color: '#ff4d4f' }} />;
      case 'CANCELLED': return <FlagOutlined style={{ color: '#d9d9d9' }} />;
      default: return <FlagOutlined style={{ color: '#d9d9d9' }} />;
    }
  };

  const getStatusTag = (status: string) => {
    const statusConfig = {
      'completed': { color: 'success', text: 'Hoàn thành' },
      'in_progress': { color: 'processing', text: 'Đang thực hiện' },
      'pending': { color: 'warning', text: 'Chờ xử lý' },
      'cancelled': { color: 'error', text: 'Đã hủy' },
      'COMPLETED': { color: 'success', text: 'Hoàn thành' },
      'IN_PROGRESS': { color: 'processing', text: 'Đang thực hiện' },
      'PLANNED': { color: 'warning', text: 'Kế hoạch' },
      'OVERDUE': { color: 'error', text: 'Quá hạn' },
      'CANCELLED': { color: 'error', text: 'Đã hủy' }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const { Title } = Typography;

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <Card style={{ marginBottom: '24px' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} style={{ margin: 0 }}>Theo dõi Tiến độ Dự án</Title>
          </Col>
          <Col>
            <Space>
              <Button 
                type={selectedTimeframe === 'week' ? 'primary' : 'default'}
                onClick={() => setSelectedTimeframe('week')}
              >
                Tuần
              </Button>
              <Button 
                type={selectedTimeframe === 'month' ? 'primary' : 'default'}
                onClick={() => setSelectedTimeframe('month')}
              >
                Tháng
              </Button>
              <Button 
                type={selectedTimeframe === 'quarter' ? 'primary' : 'default'}
                onClick={() => setSelectedTimeframe('quarter')}
              >
                Quý
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Progress Overview */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng Nhiệm vụ"
              value={progressData.totalTasks}
              prefix={<CheckCircleOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Đã hoàn thành"
              value={progressData.completedTasks}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Đang thực hiện"
              value={progressData.inProgressTasks}
              prefix={<PlayCircleOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Quá hạn"
              value={progressData.overdueTasks}
              prefix={<ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* Additional Metrics Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng Milestone"
              value={progressData.totalMilestones}
              prefix={<FlagOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Milestone Hoàn thành"
              value={progressData.completedMilestones}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Rủi ro"
              value={totalRisks}
              prefix={<ExclamationCircleOutlined style={{ color: '#fa8c16' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tài nguyên"
              value={totalResources}
              prefix={<FileTextOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* Overall Progress */}
      <Card style={{ marginBottom: '24px' }}>
        <Title level={3}>Tiến độ Tổng thể</Title>
        <Progress
          percent={progressData.overallProgress}
          strokeColor={getProgressColor(progressData.overallProgress)}
          size="default"
        />
      </Card>

      <Row gutter={[16, 16]}>
        {/* Milestones Status */}
        <Col xs={24} lg={12}>
          <Card
            title="Trạng thái Milestone"
            extra={
              <Link to={`/header-department/project-management/${projectId}/milestones`}>
                Xem tất cả <RightOutlined />
              </Link>
            }
            style={{ marginBottom: '24px' }}
          >
            <List
              dataSource={milestones?.slice(0, 6) || []}
              renderItem={(milestone) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={getMilestoneStatusIcon(milestone.status)} />}
                    title={milestone.milestone_name}
                    description={
                      <Space direction="vertical" size={4}>
                        <div>{milestone.description}</div>
                        <Space>
                          {getStatusTag(milestone.status)}
                          <Space>
                            <CalendarOutlined />
                            {new Date(milestone.planned_date).toLocaleDateString('vi-VN')}
                          </Space>
                        </Space>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Recent Tasks */}
        <Col xs={24} lg={12}>
          <Card
            title="Nhiệm vụ Gần đây"
            extra={
              <Link to={`/header-department/project-management/${projectId}/tasks`}>
                Xem tất cả <RightOutlined />
              </Link>
            }
            style={{ marginBottom: '24px' }}
          >
            <List
              dataSource={Array.isArray(tasks) ? tasks.slice(0, 5) : []}
              renderItem={(task) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={getTaskStatusIcon(task.status)} />}
                    title={task.task_name}
                    description={
                      <Space direction="vertical" size={4}>
                        <Space>
                          <Tag color="blue">{task.priority}</Tag>
                          <Space>
                            <CalendarOutlined />
                            {new Date(task.end_date).toLocaleDateString('vi-VN')}
                          </Space>
                        </Space>
                        <Progress
                          percent={task.progress || 0}
                          size="small"
                          showInfo={false}
                        />
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Phase Progress */}
      <Card
        title="Tiến độ Giai đoạn"
        extra={
          <Link to={`/header-department/project-management/${projectId}/overview`}>
            Xem tất cả <RightOutlined />
          </Link>
        }
        style={{ marginBottom: '24px' }}
      >
        <Timeline
          items={[]}
        />
      </Card>

      {/* Quick Actions */}
      <Card title="Hành động Nhanh">
        <Space wrap>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            href={`/header-department/project-management/${projectId}/tasks`}
          >
            Tạo Nhiệm vụ Mới
          </Button>
          <Button
            icon={<FlagOutlined />}
            href={`/header-department/project-management/${projectId}/milestones`}
          >
            Tạo Milestone
          </Button>
          <Button
            icon={<FileTextOutlined />}
            href={`/header-department/project-management/${projectId}/status-reports`}
          >
            Tạo Báo cáo
          </Button>
        </Space>
      </Card>
    </div>
  );
};

export default ProgressTrackingDashboard;
