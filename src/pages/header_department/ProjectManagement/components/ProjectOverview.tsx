import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  Card, 
  Row, 
  Col, 
  Progress, 
  Timeline, 
  Tag, 
  Avatar, 
  Space, 
  Divider, 
  Typography, 
  Badge,
  Button,
  Tooltip
} from 'antd';
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
  LineChartOutlined,
  EditOutlined,
  EyeOutlined,
  RiseOutlined,
  SafetyOutlined,
  ToolOutlined,
  BookOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import type { RootState, AppDispatch } from '../../../../store';
import { fetchProjectStats, fetchProjectById } from '../../../../store/slices/projectSlice';
import { fetchProjectTasks } from '../../../../store/slices/projectTaskSlice';
import { fetchProjectMilestones } from '../../../../store/slices/projectMilestoneSlice';
import { fetchProjectRisks } from '../../../../store/slices/projectRiskSlice';
import { fetchProjectResources, setCurrentProjectId } from '../../../../store/slices/projectResourceSlice';
import { fetchProjectAssignments } from '../../../../store/slices/projectAssignmentSlice';
import { fetchProjectTimeline } from '../../../../store/slices/projectTimelineSlice';
import { clearProjectResourceCache } from '../../../../utils/apiCache';
import EditProjectOverviewModal from './EditProjectOverviewModal';

interface ProjectOverviewProps {
  projectId: string;
}

const ProjectOverview: React.FC<ProjectOverviewProps> = ({ projectId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { selectedProject, projects } = useSelector((state: RootState) => state.project);
  const { tasks } = useSelector((state: RootState) => state.projectTask);
  const { milestones } = useSelector((state: RootState) => state.projectMilestone);
  const { risks } = useSelector((state: RootState) => state.projectRisk);
  const { resources } = useSelector((state: RootState) => state.projectResource);
  const { assignments } = useSelector((state: RootState) => state.projectAssignment);
  const { timeline } = useSelector((state: RootState) => state.projectTimeline);
  const [isEditOverviewModalOpen, setIsEditOverviewModalOpen] = useState(false);
  
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
      dispatch(fetchProjectAssignments(projectId));
      dispatch(fetchProjectTimeline(projectId));
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
    <div className="project-overview" style={{ padding: '24px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header Section */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <Title level={2} style={{ margin: 0, color: '#1e293b', fontWeight: 600 }}>
              Tổng quan dự án
            </Title>
            <Text type="secondary" style={{ fontSize: '16px' }}>
              Quản lý và theo dõi tiến độ dự án một cách hiệu quả
            </Text>
          </div>
          <Space>
            <Tooltip title="Chỉnh sửa dự án">
              <Button 
                type="primary" 
                icon={<EditOutlined />} 
                size="large"
                onClick={() => setIsEditOverviewModalOpen(true)}
              >
                Chỉnh sửa
              </Button>
            </Tooltip>
            <Tooltip title="Xem chi tiết">
              <Button icon={<EyeOutlined />} size="large">
                Xem chi tiết
              </Button>
            </Tooltip>
          </Space>
        </div>
      </div>

      {/* Key Metrics Row */}
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            hoverable
            style={{ 
              borderRadius: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              border: 'none'
            }}
            bodyStyle={{ padding: '24px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ 
                padding: '12px', 
                borderRadius: '10px', 
                backgroundColor: '#dcfce7',
                marginRight: '16px'
              }}>
                <RiseOutlined style={{ fontSize: '20px', color: '#16a34a' }} />
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: '14px', fontWeight: 500 }}>Tiến độ dự án</Text>
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#16a34a' }}>
                  {project.progress}%
                </div>
              </div>
            </div>
            <Progress 
              percent={project.progress} 
              strokeColor={{
                '0%': '#16a34a',
                '100%': '#22c55e',
              }}
              trailColor="#e5e7eb"
              strokeWidth={8}
              showInfo={false}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card 
            hoverable
            style={{ 
              borderRadius: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              border: 'none'
            }}
            bodyStyle={{ padding: '24px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ 
                padding: '12px', 
                borderRadius: '10px', 
                backgroundColor: '#dbeafe',
                marginRight: '16px'
              }}>
                <ToolOutlined style={{ fontSize: '20px', color: '#2563eb' }} />
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: '14px', fontWeight: 500 }}>Giai đoạn</Text>
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#2563eb' }}>
                  {milestones?.length || 0}
                </div>
              </div>
            </div>
            <Text type="secondary" style={{ fontSize: '12px' }}>Đang thực hiện</Text>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card 
            hoverable
            style={{ 
              borderRadius: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              border: 'none'
            }}
            bodyStyle={{ padding: '24px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ 
                padding: '12px', 
                borderRadius: '10px', 
                backgroundColor: '#f3e8ff',
                marginRight: '16px'
              }}>
                <CheckCircleOutlined style={{ fontSize: '20px', color: '#9333ea' }} />
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: '14px', fontWeight: 500 }}>Nhiệm vụ</Text>
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#9333ea' }}>
                  {tasks?.length || 0}
                </div>
              </div>
            </div>
            <Text type="secondary" style={{ fontSize: '12px' }}>Tổng số nhiệm vụ</Text>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card 
            hoverable
            style={{ 
              borderRadius: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              border: 'none'
            }}
            bodyStyle={{ padding: '24px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ 
                padding: '12px', 
                borderRadius: '10px', 
                backgroundColor: risks?.length > 0 ? '#fef2f2' : '#f0fdf4',
                marginRight: '16px'
              }}>
                <AlertOutlined style={{ 
                  fontSize: '20px', 
                  color: risks?.length > 0 ? '#dc2626' : '#16a34a' 
                }} />
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: '14px', fontWeight: 500 }}>Rủi ro</Text>
                <div style={{ 
                  fontSize: '28px', 
                  fontWeight: 700, 
                  color: risks?.length > 0 ? '#dc2626' : '#16a34a' 
                }}>
                  {risks?.length || 0}
                </div>
              </div>
            </div>
            <Text type="secondary" style={{ fontSize: '12px' }}>Cần xử lý</Text>
          </Card>
        </Col>
      </Row>

      {/* Main Content Row */}
      <Row gutter={[24, 24]}>
        {/* Left Column - Project Flow & Details */}
        <Col xs={24} lg={16}>
          {/* Project Flow Timeline */}
          <Card 
            title={
              <Space>
                <div style={{ 
                  padding: '8px', 
                  borderRadius: '8px', 
                  backgroundColor: '#e0f2fe',
                  marginRight: '8px'
                }}>
                  <LineChartOutlined style={{ fontSize: '16px', color: '#0284c7' }} />
                </div>
                <span style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b' }}>
                  Trạng thái Luồng Dự án
                </span>
              </Space>
            }
            style={{ 
              marginBottom: '24px',
              borderRadius: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              border: 'none'
            }}
            bodyStyle={{ padding: '24px' }}
          >
            <Timeline 
              mode="left"
              items={[
                {
                  dot: (
                    <div style={{ 
                      width: '32px', 
                      height: '32px', 
                      borderRadius: '50%', 
                      backgroundColor: projectFlow.currentPhase === 'PLANNING' ? '#3b82f6' : '#e5e7eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: 600
                    }}>
                      1
                    </div>
                  ),
                  color: projectFlow.currentPhase === 'PLANNING' ? 'blue' : 'gray',
                  children: (
                    <div style={{ paddingLeft: '16px' }}>
                      <Title level={5} style={{ margin: 0, color: '#1e293b', fontWeight: 600 }}>
                        Khởi tạo Dự án
                      </Title>
                      <Text type="secondary" style={{ fontSize: '14px' }}>
                        Project Registration → Site Setup → Phase Planning
                      </Text>
                      <div style={{ marginTop: '8px' }}>
                        <Tag color={projectFlow.currentPhase === 'PLANNING' ? 'blue' : 'default'}>
                          {projectFlow.currentPhase === 'PLANNING' ? 'Đang thực hiện' : 'Hoàn thành'}
                        </Tag>
                      </div>
                    </div>
                  )
                },
                {
                  dot: (
                    <div style={{ 
                      width: '32px', 
                      height: '32px', 
                      borderRadius: '50%', 
                      backgroundColor: projectFlow.currentPhase === 'EXECUTION' ? '#3b82f6' : '#e5e7eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: 600
                    }}>
                      2
                    </div>
                  ),
                  color: projectFlow.currentPhase === 'EXECUTION' ? 'blue' : 'gray',
                  children: (
                    <div style={{ paddingLeft: '16px' }}>
                      <Title level={5} style={{ margin: 0, color: '#1e293b', fontWeight: 600 }}>
                        Quản lý Tiến độ
                      </Title>
                      <Text type="secondary" style={{ fontSize: '14px' }}>
                        Task Assignment → Progress Tracking → Milestone Management
                      </Text>
                      <div style={{ marginTop: '8px' }}>
                        <Tag color={projectFlow.currentPhase === 'EXECUTION' ? 'blue' : 'default'}>
                          {projectFlow.currentPhase === 'EXECUTION' ? 'Đang thực hiện' : 'Chờ xử lý'}
                        </Tag>
                      </div>
                    </div>
                  )
                },
                {
                  dot: (
                    <div style={{ 
                      width: '32px', 
                      height: '32px', 
                      borderRadius: '50%', 
                      backgroundColor: projectFlow.currentPhase === 'MONITORING' ? '#3b82f6' : '#e5e7eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: 600
                    }}>
                      3
                    </div>
                  ),
                  color: projectFlow.currentPhase === 'MONITORING' ? 'blue' : 'gray',
                  children: (
                    <div style={{ paddingLeft: '16px' }}>
                      <Title level={5} style={{ margin: 0, color: '#1e293b', fontWeight: 600 }}>
                        Giám sát & Báo cáo
                      </Title>
                      <Text type="secondary" style={{ fontSize: '14px' }}>
                        Status Reporting → Change Management → Quality Control
                      </Text>
                      <div style={{ marginTop: '8px' }}>
                        <Tag color={projectFlow.currentPhase === 'MONITORING' ? 'blue' : 'default'}>
                          {projectFlow.currentPhase === 'MONITORING' ? 'Đang thực hiện' : 'Chờ xử lý'}
                        </Tag>
                      </div>
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
                <div style={{ 
                  padding: '8px', 
                  borderRadius: '8px', 
                  backgroundColor: '#f0f9ff',
                  marginRight: '8px'
                }}>
                  <BookOutlined style={{ fontSize: '16px', color: '#0369a1' }} />
                </div>
                <span style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b' }}>
                  Thông tin dự án
                </span>
              </Space>
            }
            style={{ 
              marginBottom: '24px',
              borderRadius: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              border: 'none'
            }}
            bodyStyle={{ padding: '24px' }}
          >
            <Row gutter={[24, 24]}>
              <Col xs={24} sm={12}>
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <div>
                    <Text strong style={{ fontSize: '14px', color: '#64748b', display: 'block', marginBottom: '8px' }}>
                      Tên dự án
                    </Text>
                    <Text style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b' }}>
                      {project.project_name}
                    </Text>
                  </div>
                  <div>
                    <Text strong style={{ fontSize: '14px', color: '#64748b', display: 'block', marginBottom: '8px' }}>
                      Trạng thái
                    </Text>
                    <Tag 
                      color={project.status === 'ACTIVE' ? 'green' : project.status === 'COMPLETED' ? 'blue' : 'orange'}
                      style={{ fontSize: '12px', padding: '4px 12px', borderRadius: '6px' }}
                    >
                      {project.status}
                    </Tag>
                  </div>
                  <div>
                    <Text strong style={{ fontSize: '14px', color: '#64748b', display: 'block', marginBottom: '8px' }}>
                      Ưu tiên
                    </Text>
                    <Tag 
                      color={project.priority === 'HIGH' ? 'red' : project.priority === 'MEDIUM' ? 'orange' : 'green'}
                      style={{ fontSize: '12px', padding: '4px 12px', borderRadius: '6px' }}
                    >
                      {project.priority}
                    </Tag>
                  </div>
                </Space>
              </Col>
              
              <Col xs={24} sm={12}>
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <div>
                    <Text strong style={{ fontSize: '14px', color: '#64748b', display: 'block', marginBottom: '8px' }}>
                      Trưởng dự án
                    </Text>
                    <Space>
                      <Avatar 
                        icon={<UserOutlined />} 
                        size="small" 
                        style={{ backgroundColor: '#3b82f6' }}
                      />
                      <Text style={{ fontSize: '16px', fontWeight: 500 }}>
                        {project.leader_id && typeof project.leader_id === 'object' ? 
                          project.leader_id.full_name || 'N/A' : 
                          project.leader_id || 'N/A'}
                      </Text>
                    </Space>
                  </div>
                  <div>
                    <Text strong style={{ fontSize: '14px', color: '#64748b', display: 'block', marginBottom: '8px' }}>
                      Địa điểm
                    </Text>
                    <Space>
                      <EnvironmentOutlined style={{ color: '#64748b' }} />
                      <Text style={{ fontSize: '16px', fontWeight: 500 }}>
                        {project.site_id && typeof project.site_id === 'object' ? 
                          project.site_id.site_name || 'N/A' : 
                          project.site_id || 'N/A'}
                      </Text>
                    </Space>
                  </div>
                  <div>
                    <Text strong style={{ fontSize: '14px', color: '#64748b', display: 'block', marginBottom: '8px' }}>
                      Ngân sách
                    </Text>
                    <Space>
                      <DollarOutlined style={{ color: '#16a34a' }} />
                      <Text style={{ fontSize: '16px', fontWeight: 600, color: '#16a34a' }}>
                      </Text>
                    </Space>
                  </div>
                </Space>
              </Col>
            </Row>
            
            <Divider style={{ margin: '24px 0' }} />
            
            <div>
              <Text strong style={{ fontSize: '14px', color: '#64748b', display: 'block', marginBottom: '8px' }}>
                Thời gian thực hiện
              </Text>
              <Space>
                <CalendarOutlined style={{ color: '#64748b' }} />
                <Text style={{ fontSize: '16px', fontWeight: 500 }}>
                  {formatDate(project.start_date)} - {formatDate(project.end_date)}
                </Text>
              </Space>
            </div>
            
            {project.description && project.description.trim() !== '' && 
             !project.description.toLowerCase().includes('ádasdasd') && 
             !project.description.toLowerCase().includes('test') && (
              <>
                <Divider style={{ margin: '24px 0' }} />
                <div>
                  <Text strong style={{ fontSize: '14px', color: '#64748b', display: 'block', marginBottom: '8px' }}>
                    Mô tả dự án
                  </Text>
                  <Paragraph style={{ fontSize: '16px', color: '#374151', lineHeight: '1.6' }}>
                    {project.description}
                  </Paragraph>
                </div>
              </>
            )}
          </Card>

          {/* Team Members */}
          {assignments?.length > 0 && (
            <Card 
              title={
                <Space>
                  <div style={{ 
                    padding: '8px', 
                    borderRadius: '8px', 
                    backgroundColor: '#f0fdf4',
                    marginRight: '8px'
                  }}>
                    <TeamOutlined style={{ fontSize: '16px', color: '#16a34a' }} />
                  </div>
                  <span style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b' }}>
                    Công nhân làm việc trong dự án ({assignments.length})
                  </span>
                </Space>
              }
              style={{ 
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                border: 'none'
              }}
              bodyStyle={{ padding: '24px' }}
            >
              <Row gutter={[16, 16]}>
                {assignments?.map((assignment) => (
                  <Col xs={24} sm={12} md={8} key={assignment.id}>
                    <Card 
                      size="small" 
                      hoverable
                      style={{ 
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                        transition: 'all 0.3s ease'
                      }}
                      bodyStyle={{ padding: '16px' }}
                    >
                      <Space direction="vertical" align="center" style={{ width: '100%' }}>
                        <Avatar 
                          size={48} 
                          icon={<UserOutlined />} 
                          style={{ backgroundColor: '#3b82f6' }}
                        />
                        <div style={{ textAlign: 'center' }}>
                          <Text strong style={{ fontSize: '14px', color: '#1e293b' }}>
                            {typeof assignment.user_id === 'object' ? assignment.user_id?.full_name : assignment.user_id || 'N/A'}
                          </Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            {assignment.role_in_project || 'Công nhân'}
                          </Text>
                          <br />
                          <Tag 
                            color={assignment.status === 'active' ? 'green' : 'orange'}
                            style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '4px' }}
                          >
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
                <div style={{ 
                  padding: '8px', 
                  borderRadius: '8px', 
                  backgroundColor: '#fef3c7',
                  marginRight: '8px'
                }}>
                  <ThunderboltOutlined style={{ fontSize: '16px', color: '#d97706' }} />
                </div>
                <span style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b' }}>
                  Thao tác nhanh
                </span>
              </Space>
            }
            style={{ 
              marginBottom: '24px',
              borderRadius: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              border: 'none'
            }}
            bodyStyle={{ padding: '24px' }}
          >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <Link to={`/header-department/project-management/${projectId}/tasks`} style={{ width: '100%' }}>
                <Card 
                  size="small" 
                  hoverable
                  style={{ 
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    transition: 'all 0.3s ease'
                  }}
                  bodyStyle={{ padding: '16px' }}
                >
                  <Space>
                    <div style={{ 
                      padding: '8px', 
                      borderRadius: '6px', 
                      backgroundColor: '#dbeafe',
                      marginRight: '12px'
                    }}>
                      <CheckCircleOutlined style={{ fontSize: '16px', color: '#2563eb' }} />
                    </div>
                    <div>
                      <Text strong style={{ fontSize: '14px', color: '#1e293b' }}>
                        Quản lý Nhiệm vụ
                      </Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        Task Assignment & Tracking
                      </Text>
                    </div>
                  </Space>
                </Card>
              </Link>
              
              <Link to={`/header-department/project-management/${projectId}/milestones`} style={{ width: '100%' }}>
                <Card 
                  size="small" 
                  hoverable
                  style={{ 
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    transition: 'all 0.3s ease'
                  }}
                  bodyStyle={{ padding: '16px' }}
                >
                  <Space>
                    <div style={{ 
                      padding: '8px', 
                      borderRadius: '6px', 
                      backgroundColor: '#dcfce7',
                      marginRight: '12px'
                    }}>
                      <TrophyOutlined style={{ fontSize: '16px', color: '#16a34a' }} />
                    </div>
                    <div>
                      <Text strong style={{ fontSize: '14px', color: '#1e293b' }}>
                        Quản lý Milestone
                      </Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        Milestone Tracking
                      </Text>
                    </div>
                  </Space>
                </Card>
              </Link>
              
              <Link to={`/header-department/project-management/${projectId}/resources`} style={{ width: '100%' }}>
                <Card 
                  size="small" 
                  hoverable
                  style={{ 
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    transition: 'all 0.3s ease'
                  }}
                  bodyStyle={{ padding: '16px' }}
                >
                  <Space>
                    <div style={{ 
                      padding: '8px', 
                      borderRadius: '6px', 
                      backgroundColor: '#f3e8ff',
                      marginRight: '12px'
                    }}>
                      <TeamOutlined style={{ fontSize: '16px', color: '#9333ea' }} />
                    </div>
                    <div>
                      <Text strong style={{ fontSize: '14px', color: '#1e293b' }}>
                        Quản lý Tài nguyên
                      </Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        Resource Planning
                      </Text>
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
                <div style={{ 
                  padding: '8px', 
                  borderRadius: '8px', 
                  backgroundColor: '#fef2f2',
                  marginRight: '8px'
                }}>
                  <SafetyOutlined style={{ fontSize: '16px', color: '#dc2626' }} />
                </div>
                <span style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b' }}>
                  Đánh giá Rủi ro
                </span>
              </Space>
            }
            style={{ 
              marginBottom: '24px',
              borderRadius: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              border: 'none'
            }}
            styles={{ header: { backgroundColor: '#fef2f2', borderBottom: '1px solid #fecaca' } }}
            bodyStyle={{ padding: '24px' }}
          >
            <Link to={`/header-department/project-management/${projectId}/risks`} style={{ width: '100%' }}>
              <Card 
                size="small" 
                hoverable 
                style={{ 
                  border: '1px solid #fecaca',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease'
                }}
                bodyStyle={{ padding: '16px' }}
              >
                <Space>
                  <div style={{ 
                    padding: '8px', 
                    borderRadius: '6px', 
                    backgroundColor: '#fef2f2',
                    marginRight: '12px'
                  }}>
                    <AlertOutlined style={{ color: '#dc2626', fontSize: '16px' }} />
                  </div>
                  <div>
                    <Text strong style={{ color: '#dc2626', fontSize: '14px' }}>
                      Quản lý Rủi ro
                    </Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Risk Assessment & Management
                    </Text>
                    <br />
                    <Badge 
                      count={risks?.length || 0} 
                      showZero 
                      color="#dc2626" 
                      style={{ marginTop: '4px' }} 
                    />
                  </div>
                </Space>
              </Card>
            </Link>
          </Card>

          {/* Additional Stats */}
          <Card 
            title={
              <Space>
                <div style={{ 
                  padding: '8px', 
                  borderRadius: '8px', 
                  backgroundColor: '#f0f9ff',
                  marginRight: '8px'
                }}>
                  <BarChartOutlined style={{ fontSize: '16px', color: '#0284c7' }} />
                </div>
                <span style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b' }}>
                  Thống kê bổ sung
                </span>
              </Space>
            }
            style={{ 
              marginBottom: '24px',
              borderRadius: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              border: 'none'
            }}
            bodyStyle={{ padding: '24px' }}
          >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '12px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px'
              }}>
                <Text style={{ fontSize: '14px', fontWeight: 500 }}>Tài nguyên:</Text>
                <Badge count={resources?.length || 0} showZero color="#2563eb" />
              </div>  
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '12px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px'
              }}>
                <Text style={{ fontSize: '14px', fontWeight: 500 }}>Milestone:</Text>
                <Badge count={milestones?.length || 0} showZero color="#16a34a" />
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '12px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px'
              }}>
                <Text style={{ fontSize: '14px', fontWeight: 500 }}>Rủi ro:</Text>
                <Badge count={risks?.length || 0} showZero color="#dc2626" />
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '12px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px'
              }}>
                <Text style={{ fontSize: '14px', fontWeight: 500 }}>Nhiệm vụ:</Text>
                <Badge count={tasks?.length || 0} showZero color="#9333ea" />
              </div>
            </Space>
          </Card>

          {/* Recent Activity */}
          <Card 
            title={
              <Space>
                <div style={{ 
                  padding: '8px', 
                  borderRadius: '8px', 
                  backgroundColor: '#f0fdf4',
                  marginRight: '8px'
                }}>
                  <ClockCircleOutlined style={{ fontSize: '16px', color: '#16a34a' }} />
                </div>
                <span style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b' }}>
                  Hoạt động gần đây
                </span>
              </Space>
            }
            style={{ 
              borderRadius: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              border: 'none'
            }}
            bodyStyle={{ padding: '24px' }}
          >
            <Timeline
              items={[
                {
                  dot: (
                    <div style={{ 
                      width: '24px', 
                      height: '24px', 
                      borderRadius: '50%', 
                      backgroundColor: '#16a34a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: 600
                    }}>
                      ✓
                    </div>
                  ),
                  color: "green",
                  children: (
                    <div style={{ paddingLeft: '16px' }}>
                      <Text strong style={{ fontSize: '14px', color: '#1e293b' }}>
                        Dự án được tạo
                      </Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {formatDate(project.created_at)}
                      </Text>
                    </div>
                  )
                },
                {
                  dot: (
                    <div style={{ 
                      width: '24px', 
                      height: '24px', 
                      borderRadius: '50%', 
                      backgroundColor: '#2563eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: 600
                    }}>
                      ↑
                    </div>
                  ),
                  color: "blue",
                  children: (
                    <div style={{ paddingLeft: '16px' }}>
                      <Text strong style={{ fontSize: '14px', color: '#1e293b' }}>
                        Cập nhật tiến độ
                      </Text>
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

      {/* Edit Project Overview Modal */}
      <EditProjectOverviewModal
        isOpen={isEditOverviewModalOpen}
        onClose={() => setIsEditOverviewModalOpen(false)}
        onSuccess={() => {
          // Refresh project data after successful edit
          dispatch(fetchProjectById(projectId));
        }}
        projectId={projectId}
        project={selectedProject}
      />
    </div>
  );
};

export default ProjectOverview;
