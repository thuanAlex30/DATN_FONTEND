import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Card, Row, Col, Progress, Statistic, Timeline, Tag, Avatar, Space, Divider, Typography, Badge } from 'antd';
import { 
  CalendarOutlined, 
  UserOutlined, 
  EnvironmentOutlined, 
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  BarChartOutlined,
  TrophyOutlined,
  AlertOutlined,
  SettingOutlined,
  FileTextOutlined,
  PlayCircleOutlined,
  LineChartOutlined
} from '@ant-design/icons';
import type { RootState, AppDispatch } from '../../../../store';
import { fetchProjectStats } from '../../../../store/slices/projectSlice';
import { fetchProjectTasks } from '../../../../store/slices/projectTaskSlice';
import { fetchProjectMilestones } from '../../../../store/slices/projectMilestoneSlice';
import { fetchProjectRisks } from '../../../../store/slices/projectRiskSlice';
import { fetchProjectResources, setCurrentProjectId } from '../../../../store/slices/projectResourceSlice';
import { clearProjectResourceCache } from '../../../../utils/apiCache';

interface ProjectOverviewProps {
  projectId: string;
}

const ProjectOverview: React.FC<ProjectOverviewProps> = ({ projectId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { selectedProject, assignments, projects } = useSelector((state: RootState) => state.project);
  const { tasks } = useSelector((state: RootState) => state.projectTask);
  const { milestones } = useSelector((state: RootState) => state.projectMilestone);
  const { risks } = useSelector((state: RootState) => state.projectRisk);
  const { resources } = useSelector((state: RootState) => state.projectResource);
  
  const [projectFlow] = useState({
    currentPhase: 'PLANNING',
    completedSteps: [] as string[],
    nextSteps: [] as string[]
  });

  const { Title, Text, Paragraph } = Typography;

  useEffect(() => {
    dispatch(fetchProjectStats());
    if (projectId) {
      // Clear resources when switching projects
      dispatch(setCurrentProjectId(projectId));
      // Clear API cache to ensure fresh data
      clearProjectResourceCache();
      
      // Fetch all project-specific data
      dispatch(fetchProjectTasks(projectId));
      dispatch(fetchProjectMilestones(projectId));
      dispatch(fetchProjectRisks(projectId));
      dispatch(fetchProjectResources(projectId));
      
      // Note: fetchProjectAssignments and fetchProjectTimeline are not available yet
      // They will be implemented when backend adds these endpoints
    }
  }, [dispatch, projectId]);

  // Fallback: use project from list if selectedProject not yet populated
  const project = selectedProject || projects?.find((p: any) => p.id === projectId);

  if (!project) {
    return (
      <div className="project-overview-loading">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Đang tải thông tin dự án...</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  // const getDaysRemaining = () => {
  //   const endDate = new Date(selectedProject.end_date);
  //   const today = new Date();
  //   const diffTime = endDate.getTime() - today.getTime();
  //   const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  //   return diffDays;
  // };

  // const daysRemaining = getDaysRemaining();

  return (
    <div className="project-overview" style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header Section */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
          Tổng quan dự án
        </Title>
        <Text type="secondary">
          Quản lý và theo dõi tiến độ dự án một cách hiệu quả
        </Text>
      </div>

      {/* Key Metrics Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tiến độ dự án"
              value={project.progress}
              suffix="%"
              valueStyle={{ color: '#3f8600' }}
              prefix={<BarChartOutlined />}
            />
            <Progress 
              percent={project.progress} 
              size="small" 
              status={project.progress >= 80 ? 'success' : project.progress >= 50 ? 'active' : 'normal'}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Giai đoạn"
              value={0}
              prefix={<SettingOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            <Text type="secondary">Đang thực hiện</Text>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Nhiệm vụ"
              value={tasks?.length || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
            <Text type="secondary">Tổng số nhiệm vụ</Text>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Rủi ro"
              value={risks?.length || 0}
              prefix={<AlertOutlined />}
              valueStyle={{ color: risks?.length > 0 ? '#cf1322' : '#52c41a' }}
            />
            <Text type="secondary">Cần xử lý</Text>
          </Card>
        </Col>
      </Row>

      {/* Main Content Row */}
      <Row gutter={[16, 16]}>
        {/* Left Column - Project Flow & Details */}
        <Col xs={24} lg={16}>
          {/* Project Flow Timeline */}
          <Card 
            title={
              <Space>
                <LineChartOutlined />
                Trạng thái Luồng Dự án
              </Space>
            }
            style={{ marginBottom: '16px' }}
          >
            <Timeline 
              mode="left"
              items={[
                {
                  dot: <FileTextOutlined style={{ fontSize: '16px' }} />,
                  color: projectFlow.currentPhase === 'PLANNING' ? 'blue' : 'gray',
                  children: (
                    <div>
                      <Title level={5} style={{ margin: 0 }}>Khởi tạo Dự án</Title>
                      <Text type="secondary">Project Registration → Site Setup → Phase Planning</Text>
                    </div>
                  )
                },
                {
                  dot: <PlayCircleOutlined style={{ fontSize: '16px' }} />,
                  color: projectFlow.currentPhase === 'EXECUTION' ? 'blue' : 'gray',
                  children: (
                    <div>
                      <Title level={5} style={{ margin: 0 }}>Quản lý Tiến độ</Title>
                      <Text type="secondary">Task Assignment → Progress Tracking → Milestone Management</Text>
                    </div>
                  )
                },
                {
                  dot: <LineChartOutlined style={{ fontSize: '16px' }} />,
                  color: projectFlow.currentPhase === 'MONITORING' ? 'blue' : 'gray',
                  children: (
                    <div>
                      <Title level={5} style={{ margin: 0 }}>Giám sát & Báo cáo</Title>
                      <Text type="secondary">Status Reporting → Change Management → Quality Control</Text>
                    </div>
                  )
                }
              ]}
            />
          </Card>

          {/* Project Details */}
          <Card 
            title={
              <Space>
                <FileTextOutlined />
                Thông tin dự án
              </Space>
            }
            style={{ marginBottom: '16px' }}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <div>
                    <Text strong>Tên dự án:</Text>
                    <br />
                    <Text>{project.project_name}</Text>
                  </div>
                  <div>
                    <Text strong>Trạng thái:</Text>
                    <br />
                    <Tag color={project.status === 'ACTIVE' ? 'green' : project.status === 'COMPLETED' ? 'blue' : 'orange'}>
                      {project.status}
                    </Tag>
                  </div>
                  <div>
                    <Text strong>Ưu tiên:</Text>
                    <br />
                    <Tag color={project.priority === 'HIGH' ? 'red' : project.priority === 'MEDIUM' ? 'orange' : 'green'}>
                      {project.priority}
                    </Tag>
                  </div>
                </Space>
              </Col>
              
              <Col xs={24} sm={12}>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <div>
                    <Text strong>Trưởng dự án:</Text>
                    <br />
                    <Space>
                      <Avatar icon={<UserOutlined />} size="small" />
                      <Text>{project.leader_id && typeof project.leader_id === 'object' ? 
                        project.leader_id.full_name || 'N/A' : 
                        project.leader_id || 'N/A'}</Text>
                    </Space>
                  </div>
                  <div>
                    <Text strong>Địa điểm:</Text>
                    <br />
                    <Space>
                      <EnvironmentOutlined />
                      <Text>{project.site_id && typeof project.site_id === 'object' ? 
                        project.site_id.site_name || 'N/A' : 
                        project.site_id || 'N/A'}</Text>
                    </Space>
                  </div>
                  <div>
                    <Text strong>Ngân sách:</Text>
                    <br />
                    <Space>
                      <DollarOutlined />
                      <Text>{formatCurrency(project.budget)}</Text>
                    </Space>
                  </div>
                </Space>
              </Col>
            </Row>
            
            <Divider />
            
            <div>
              <Text strong>Thời gian thực hiện:</Text>
              <br />
              <Space>
                <CalendarOutlined />
                <Text>{formatDate(project.start_date)} - {formatDate(project.end_date)}</Text>
              </Space>
            </div>
            
            {project.description && project.description.trim() !== '' && 
             !project.description.toLowerCase().includes('ádasdasd') && 
             !project.description.toLowerCase().includes('test') && (
              <>
                <Divider />
                <div>
                  <Text strong>Mô tả dự án:</Text>
                  <br />
                  <Paragraph>{project.description}</Paragraph>
                </div>
              </>
            )}
          </Card>

          {/* Team Members */}
          {assignments?.length > 0 && (
            <Card 
              title={
                <Space>
                  <TeamOutlined />
                  Thành viên dự án ({assignments.length})
                </Space>
              }
            >
              <Row gutter={[16, 16]}>
                {assignments?.map((assignment) => (
                  <Col xs={24} sm={12} md={8} key={assignment.id}>
                    <Card size="small" hoverable>
                      <Space direction="vertical" align="center" style={{ width: '100%' }}>
                        <Avatar size={48} icon={<UserOutlined />} />
                        <div style={{ textAlign: 'center' }}>
                          <Text strong>
                            {typeof assignment.user_id === 'object' ? assignment.user_id?.full_name : assignment.user_id || 'N/A'}
                          </Text>
                          <br />
                          <Text type="secondary">{assignment.role_in_project || 'Thành viên'}</Text>
                          <br />
                          <Tag color={assignment.status === 'active' ? 'green' : 'orange'}>
                            {assignment.status}
                          </Tag>
                        </div>
                      </Space>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>
          )}
        </Col>

        {/* Right Column - Quick Actions & Stats */}
        <Col xs={24} lg={8}>
          {/* Quick Actions */}
          <Card 
            title={
              <Space>
                <SettingOutlined />
                Thao tác nhanh
              </Space>
            }
            style={{ marginBottom: '16px' }}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Link to={`/admin/project-management/${projectId}/tasks`} style={{ width: '100%' }}>
                <Card size="small" hoverable>
                  <Space>
                    <CheckCircleOutlined style={{ color: '#1890ff' }} />
                    <div>
                      <Text strong>Quản lý Nhiệm vụ</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: '12px' }}>Task Assignment & Tracking</Text>
                    </div>
                  </Space>
                </Card>
              </Link>
              
              <Link to={`/admin/project-management/${projectId}/milestones`} style={{ width: '100%' }}>
                <Card size="small" hoverable>
                  <Space>
                    <TrophyOutlined style={{ color: '#52c41a' }} />
                    <div>
                      <Text strong>Quản lý Milestone</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: '12px' }}>Milestone Tracking</Text>
                    </div>
                  </Space>
                </Card>
              </Link>
              
              <Link to={`/admin/project-management/${projectId}/resources`} style={{ width: '100%' }}>
                <Card size="small" hoverable>
                  <Space>
                    <TeamOutlined style={{ color: '#722ed1' }} />
                    <div>
                      <Text strong>Quản lý Tài nguyên</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: '12px' }}>Resource Planning</Text>
                    </div>
                  </Space>
                </Card>
              </Link>
            </Space>
          </Card>

          {/* Risk Assessment - Separate Card */}
          <Card 
            title={
              <Space>
                <AlertOutlined style={{ color: '#f5222d' }} />
                Đánh giá Rủi ro
              </Space>
            }
            style={{ marginBottom: '16px' }}
            styles={{ header: { backgroundColor: '#fff2f0', borderBottom: '1px solid #ffccc7' } }}
          >
            <Link to={`/admin/project-management/${projectId}/risks`} style={{ width: '100%' }}>
              <Card size="small" hoverable style={{ border: '1px solid #ffccc7' }}>
                <Space>
                  <AlertOutlined style={{ color: '#f5222d', fontSize: '20px' }} />
                  <div>
                    <Text strong style={{ color: '#f5222d' }}>Quản lý Rủi ro</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>Risk Assessment & Management</Text>
                    <br />
                    <Badge count={risks?.length || 0} showZero color="#f5222d" style={{ marginTop: '4px' }} />
                  </div>
                </Space>
              </Card>
            </Link>
          </Card>

          {/* Additional Stats */}
          <Card 
            title={
              <Space>
                <BarChartOutlined />
                Thống kê bổ sung
              </Space>
            }
            style={{ marginBottom: '16px' }}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text>Tài nguyên:</Text>
                <Badge count={resources?.length || 0} showZero color="#1890ff" />
              </div>  
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text>Milestone:</Text>
                <Badge count={milestones?.length || 0} showZero color="#52c41a" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text>Rủi ro:</Text>
                <Badge count={risks?.length || 0} showZero color="#f5222d" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text>Nhiệm vụ:</Text>
                <Badge count={tasks?.length || 0} showZero color="#722ed1" />
              </div>
            </Space>
          </Card>

          {/* Recent Activity */}
          <Card 
            title={
              <Space>
                <ClockCircleOutlined />
                Hoạt động gần đây
              </Space>
            }
          >
            <Timeline
              items={[
                {
                  color: "green",
                  children: (
                    <div>
                      <Text strong>Dự án được tạo</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {formatDate(project.created_at)}
                      </Text>
                    </div>
                  )
                },
                {
                  color: "blue",
                  children: (
                    <div>
                      <Text strong>Cập nhật tiến độ</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        Tiến độ: {project.progress}% - {formatDate(project.updated_at)}
                      </Text>
                    </div>
                  )
                }
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ProjectOverview;
