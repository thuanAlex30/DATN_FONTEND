import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Progress, 
  Table, 
  Tag, 
  Typography, 
  Space, 
  Select, 
  DatePicker, 
  Button,
  Tabs,
  List,
  Tooltip,
  Alert
} from 'antd';
import { 
  BarChartOutlined, 
  LineChartOutlined, 
  PieChartOutlined, 
  RiseOutlined, 
  FallOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  TeamOutlined,
  AlertOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import type { RootState, AppDispatch } from '../../../../store';
import { fetchProjectStats } from '../../../../store/slices/projectSlice';
import { fetchProjectTasks } from '../../../../store/slices/projectTaskSlice';
import { fetchProjectMilestones } from '../../../../store/slices/projectMilestoneSlice';
import { fetchProjectRisks } from '../../../../store/slices/projectRiskSlice';
import { fetchProjectResources } from '../../../../store/slices/projectResourceSlice';
import { fetchProjectAssignments } from '../../../../store/slices/projectAssignmentSlice';
import { fetchCommunicationStats } from '../../../../store/slices/projectCommunicationSlice';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Option } = Select;

interface ProjectAnalyticsProps {
  projectId: string;
}

const ProjectAnalytics: React.FC<ProjectAnalyticsProps> = ({ projectId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { stats } = useSelector((state: RootState) => state.project);
  const { tasks } = useSelector((state: RootState) => state.projectTask);
  const { milestones } = useSelector((state: RootState) => state.projectMilestone);
  const { risks } = useSelector((state: RootState) => state.projectRisk);
  const { resources } = useSelector((state: RootState) => state.projectResource);
  const { assignments } = useSelector((state: RootState) => state.projectAssignment);
  const { stats: communicationStats } = useSelector((state: RootState) => state.projectCommunication);
  
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(30, 'days'),
    dayjs()
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (projectId) {
      loadAnalyticsData();
    }
  }, [projectId, dateRange]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        dispatch(fetchProjectStats()),
        dispatch(fetchProjectTasks(projectId)),
        dispatch(fetchProjectMilestones(projectId)),
        dispatch(fetchProjectRisks(projectId)),
        dispatch(fetchProjectResources(projectId)),
        dispatch(fetchProjectAssignments(projectId)),
        dispatch(fetchCommunicationStats(projectId))
      ]);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate analytics metrics
  const calculateMetrics = () => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'COMPLETED').length;
    const inProgressTasks = tasks.filter(task => task.status === 'IN_PROGRESS').length;
    const pendingTasks = tasks.filter(task => task.status === 'PENDING').length;
    
    const totalMilestones = milestones.length;
    const completedMilestones = milestones.filter(milestone => milestone.status === 'COMPLETED').length;
    
    const totalRisks = risks.length;
    const highRisks = risks.filter(risk => risk.priority === 'HIGH' || risk.priority === 'URGENT').length;
    const mitigatedRisks = risks.filter(risk => risk.status === 'MITIGATED').length;
    
    const totalResources = resources.length;
    const allocatedResources = resources.filter(resource => resource.status === 'IN_USE').length;
    
    const totalAssignments = assignments.length;
    const activeAssignments = assignments.filter(assignment => assignment.status === 'ACTIVE').length;
    
    const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    const milestoneCompletionRate = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;
    const riskMitigationRate = totalRisks > 0 ? (mitigatedRisks / totalRisks) * 100 : 0;
    const resourceUtilizationRate = totalResources > 0 ? (allocatedResources / totalResources) * 100 : 0;
    const assignmentUtilizationRate = totalAssignments > 0 ? (activeAssignments / totalAssignments) * 100 : 0;

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks,
      totalMilestones,
      completedMilestones,
      totalRisks,
      highRisks,
      mitigatedRisks,
      totalResources,
      allocatedResources,
      totalAssignments,
      activeAssignments,
      taskCompletionRate,
      milestoneCompletionRate,
      riskMitigationRate,
      resourceUtilizationRate,
      assignmentUtilizationRate
    };
  };

  const metrics = calculateMetrics();

  // Performance indicators
  const getPerformanceColor = (rate: number) => {
    if (rate >= 80) return '#52c41a';
    if (rate >= 60) return '#faad14';
    return '#ff4d4f';
  };

  const getPerformanceText = (rate: number) => {
    if (rate >= 80) return 'Tốt';
    if (rate >= 60) return 'Khá';
    return 'Cần cải thiện';
  };

  // Risk analysis
  const riskAnalysis = () => {
    const riskByCategory = risks.reduce((acc: any, risk) => {
      acc[risk.risk_category] = (acc[risk.risk_category] || 0) + 1;
      return acc;
    }, {});

    const riskByPriority = risks.reduce((acc: any, risk) => {
      acc[risk.priority] = (acc[risk.priority] || 0) + 1;
      return acc;
    }, {});

    return { riskByCategory, riskByPriority };
  };

  const { riskByCategory, riskByPriority } = riskAnalysis();

  // Resource analysis
  const resourceAnalysis = () => {
    const resourceByType = resources.reduce((acc: any, resource) => {
      acc[resource.resource_type] = (acc[resource.resource_type] || 0) + 1;
      return acc;
    }, {});

    return { resourceByType };
  };

  const { resourceByType } = resourceAnalysis();

  // Task timeline analysis
  const taskTimelineAnalysis = () => {
    const overdueTasks = tasks.filter(task => {
      const endDate = new Date(task.planned_end_date);
      const now = new Date();
      return endDate < now && task.status !== 'COMPLETED';
    }).length;

    const upcomingDeadlines = tasks.filter(task => {
      const endDate = new Date(task.planned_end_date);
      const now = new Date();
      const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
      return endDate <= threeDaysFromNow && endDate > now && task.status !== 'COMPLETED';
    }).length;

    return { overdueTasks, upcomingDeadlines };
  };

  const { overdueTasks, upcomingDeadlines } = taskTimelineAnalysis();

  return (
    <div className="project-analytics">
      <Card>
        <div style={{ marginBottom: '24px' }}>
          <Space>
            <RangePicker
              value={dateRange}
              onChange={(dates) => dates && setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
            />
            <Button onClick={loadAnalyticsData} loading={loading}>
              Làm mới
            </Button>
          </Space>
        </div>

        <Tabs defaultActiveKey="overview">
          <TabPane tab="Tổng quan" key="overview">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card>
                    <Statistic
                      title="Tiến độ Nhiệm vụ"
                      value={metrics.taskCompletionRate}
                      precision={1}
                      suffix="%"
                      valueStyle={{ color: getPerformanceColor(metrics.taskCompletionRate) }}
                      prefix={<CheckCircleOutlined />}
                    />
                    <Progress 
                      percent={metrics.taskCompletionRate} 
                      strokeColor={getPerformanceColor(metrics.taskCompletionRate)}
                      size="small"
                    />
                    <Text type="secondary">
                      {metrics.completedTasks}/{metrics.totalTasks} nhiệm vụ hoàn thành
                    </Text>
                  </Card>
                </motion.div>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <Card>
                    <Statistic
                      title="Tiến độ Milestone"
                      value={metrics.milestoneCompletionRate}
                      precision={1}
                      suffix="%"
                      valueStyle={{ color: getPerformanceColor(metrics.milestoneCompletionRate) }}
                      prefix={<TrophyOutlined />}
                    />
                    <Progress 
                      percent={metrics.milestoneCompletionRate} 
                      strokeColor={getPerformanceColor(metrics.milestoneCompletionRate)}
                      size="small"
                    />
                    <Text type="secondary">
                      {metrics.completedMilestones}/{metrics.totalMilestones} milestone hoàn thành
                    </Text>
                  </Card>
                </motion.div>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <Card>
                    <Statistic
                      title="Giảm thiểu Rủi ro"
                      value={metrics.riskMitigationRate}
                      precision={1}
                      suffix="%"
                      valueStyle={{ color: getPerformanceColor(metrics.riskMitigationRate) }}
                      prefix={<AlertOutlined />}
                    />
                    <Progress 
                      percent={metrics.riskMitigationRate} 
                      strokeColor={getPerformanceColor(metrics.riskMitigationRate)}
                      size="small"
                    />
                    <Text type="secondary">
                      {metrics.mitigatedRisks}/{metrics.totalRisks} rủi ro đã giảm thiểu
                    </Text>
                  </Card>
                </motion.div>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                >
                  <Card>
                    <Statistic
                      title="Sử dụng Tài nguyên"
                      value={metrics.resourceUtilizationRate}
                      precision={1}
                      suffix="%"
                      valueStyle={{ color: getPerformanceColor(metrics.resourceUtilizationRate) }}
                      prefix={<TeamOutlined />}
                    />
                    <Progress 
                      percent={metrics.resourceUtilizationRate} 
                      strokeColor={getPerformanceColor(metrics.resourceUtilizationRate)}
                      size="small"
                    />
                    <Text type="secondary">
                      {metrics.allocatedResources}/{metrics.totalResources} tài nguyên đang sử dụng
                    </Text>
                  </Card>
                </motion.div>
              </Col>
            </Row>

            {/* Performance Summary */}
            <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
              <Col xs={24} md={12}>
                <Card title="Phân tích Hiệu suất">
                  <List
                    dataSource={[
                      {
                        title: 'Nhiệm vụ',
                        rate: metrics.taskCompletionRate,
                        status: getPerformanceText(metrics.taskCompletionRate)
                      },
                      {
                        title: 'Milestone',
                        rate: metrics.milestoneCompletionRate,
                        status: getPerformanceText(metrics.milestoneCompletionRate)
                      },
                      {
                        title: 'Rủi ro',
                        rate: metrics.riskMitigationRate,
                        status: getPerformanceText(metrics.riskMitigationRate)
                      },
                      {
                        title: 'Tài nguyên',
                        rate: metrics.resourceUtilizationRate,
                        status: getPerformanceText(metrics.resourceUtilizationRate)
                      }
                    ]}
                    renderItem={(item) => (
                      <List.Item>
                        <List.Item.Meta
                          title={item.title}
                          description={
                            <Space>
                              <Progress 
                                percent={item.rate} 
                                size="small" 
                                strokeColor={getPerformanceColor(item.rate)}
                                style={{ width: '100px' }}
                              />
                              <Tag color={getPerformanceColor(item.rate) === '#52c41a' ? 'green' : 
                                         getPerformanceColor(item.rate) === '#faad14' ? 'orange' : 'red'}>
                                {item.status}
                              </Tag>
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>

              <Col xs={24} md={12}>
                <Card title="Cảnh báo & Thông báo">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    {overdueTasks > 0 && (
                      <Alert
                        message={`${overdueTasks} nhiệm vụ quá hạn`}
                        type="error"
                        icon={<ExclamationCircleOutlined />}
                        showIcon
                      />
                    )}
                    {upcomingDeadlines > 0 && (
                      <Alert
                        message={`${upcomingDeadlines} nhiệm vụ sắp đến hạn`}
                        type="warning"
                        icon={<ClockCircleOutlined />}
                        showIcon
                      />
                    )}
                    {metrics.highRisks > 0 && (
                      <Alert
                        message={`${metrics.highRisks} rủi ro mức độ cao`}
                        type="error"
                        icon={<AlertOutlined />}
                        showIcon
                      />
                    )}
                    {overdueTasks === 0 && upcomingDeadlines === 0 && metrics.highRisks === 0 && (
                      <Alert
                        message="Dự án đang hoạt động tốt"
                        type="success"
                        icon={<CheckCircleOutlined />}
                        showIcon
                      />
                    )}
                  </Space>
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="Rủi ro" key="risks">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Card title="Phân bổ Rủi ro theo Danh mục">
                  <List
                    dataSource={Object.entries(riskByCategory)}
                    renderItem={([category, count]) => (
                      <List.Item>
                        <List.Item.Meta
                          title={category}
                          description={`${count} rủi ro`}
                        />
                        <Progress 
                          percent={(count as number / metrics.totalRisks) * 100} 
                          size="small"
                          style={{ width: '100px' }}
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>

              <Col xs={24} md={12}>
                <Card title="Phân bổ Rủi ro theo Mức độ">
                  <List
                    dataSource={Object.entries(riskByPriority)}
                    renderItem={([priority, count]) => (
                      <List.Item>
                        <List.Item.Meta
                          title={
                            <Tag color={
                              priority === 'URGENT' ? 'red' :
                              priority === 'HIGH' ? 'orange' :
                              priority === 'MEDIUM' ? 'blue' : 'green'
                            }>
                              {priority}
                            </Tag>
                          }
                          description={`${count} rủi ro`}
                        />
                        <Progress 
                          percent={(count as number / metrics.totalRisks) * 100} 
                          size="small"
                          style={{ width: '100px' }}
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="Tài nguyên" key="resources">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Card title="Phân bổ Tài nguyên theo Loại">
                  <List
                    dataSource={Object.entries(resourceByType)}
                    renderItem={([type, count]) => (
                      <List.Item>
                        <List.Item.Meta
                          title={type}
                          description={`${count} tài nguyên`}
                        />
                        <Progress 
                          percent={(count as number / metrics.totalResources) * 100} 
                          size="small"
                          style={{ width: '100px' }}
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>

              <Col xs={24} md={12}>
                <Card title="Phân tích Chi phí">
                  <Statistic
                    title="Tổng chi phí dự kiến"
                    precision={0}
                    prefix={<DollarOutlined />}
                    suffix="VNĐ"
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="Nhiệm vụ" key="tasks">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <Card>
                  <Statistic
                    title="Đang thực hiện"
                    value={metrics.inProgressTasks}
                    prefix={<ClockCircleOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card>
                  <Statistic
                    title="Chờ thực hiện"
                    value={metrics.pendingTasks}
                    prefix={<ExclamationCircleOutlined />}
                    valueStyle={{ color: '#faad14' }}
                  />
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card>
                  <Statistic
                    title="Hoàn thành"
                    value={metrics.completedTasks}
                    prefix={<CheckCircleOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default ProjectAnalytics;
