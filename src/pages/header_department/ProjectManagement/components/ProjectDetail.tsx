import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Card, 
  Button, 
  Typography, 
  Spin, 
  Tabs,
  Tag,
  Row,
  Col
} from 'antd';
import { 
  ArrowLeftOutlined,
  EditOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  UserOutlined,
  BarChartOutlined,
  TeamOutlined,
  AimOutlined,
  ExclamationCircleOutlined,
  MessageOutlined,
  DollarOutlined
} from '@ant-design/icons';
import type { RootState, AppDispatch } from '../../../../store';
import { fetchProjectById, fetchProjectTimeline, fetchProjectAssignments } from '../../../../store/slices/projectSlice';
import ProjectOverview from './ProjectOverview';
import ProjectMilestones from './ProjectMilestones';
import ProjectTasks from './ProjectTasks';
import ProjectWorkLocations from './ProjectWorkLocations';
import ProjectRisks from './ProjectRisks';
import ProgressTrackingDashboard from './ProgressTrackingDashboard';
import EditProjectModal from './EditProjectModal';
import TaskManagement from './TaskManagement';
import ProjectCommunication from './ProjectCommunication';
import StatusReportManagement from './StatusReportManagement';

interface ProjectDetailProps {
  projectId: string;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ projectId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  
  const { selectedProject, loading, error, projects } = useSelector((state: RootState) => state.project);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Fallback: Use project from list if selectedProject is not available
  const project = selectedProject || projects.find(p => p.id === projectId);

  // Debug logging (only when values change)
  useEffect(() => {
    console.log('ProjectDetail Debug:', {
      projectId,
      selectedProject: selectedProject ? 'exists' : 'null',
      project: project ? 'exists' : 'null',
      loading,
      error,
      projectsCount: projects.length,
      projectData: project ? {
        id: project.id,
        project_name: project.project_name,
        status: project.status,
        priority: project.priority,
        leader_id: project.leader_id,
        site_id: project.site_id,
        start_date: project.start_date,
        end_date: project.end_date,
        progress: project.progress,
      } : null
    });
  }, [projectId, selectedProject, project, loading, error, projects.length]);

  // Sync activeTab with URL
  useEffect(() => {
    const currentPath = getCurrentPath();
    console.log('Syncing activeTab with URL:', currentPath);
    setActiveTab(currentPath || 'overview');
  }, [location.pathname]);

  useEffect(() => {
    if (projectId && !selectedProject && !project) {
      console.log('ProjectDetail: Fetching project with ID:', projectId);
      dispatch(fetchProjectById(projectId));
      dispatch(fetchProjectTimeline(projectId));
      dispatch(fetchProjectAssignments(projectId));
    }
  }, [dispatch, projectId, selectedProject, project]);


  const getCurrentPath = () => {
    const path = location.pathname;
    const projectPath = `/header-department/project-management/${projectId}`;
    const currentPath = path.replace(projectPath, '') || '';
    const result = currentPath === '' ? 'overview' : currentPath.replace('/', '');
    console.log('ProjectDetail getCurrentPath:', { path, projectPath, currentPath, result, projectId });
    return result;
  };

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-20"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Spin size="large" />
        </motion.div>
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4 text-gray-500 text-lg"
        >
          Đang tải thông tin dự án...
        </motion.p>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center py-20"
      >
        <div className="text-6xl mb-4">⚠️</div>
        <Typography.Title level={3} className="text-red-500">
          Lỗi tải dự án
        </Typography.Title>
        <Typography.Text className="text-gray-400 mb-4">
          {error}
        </Typography.Text>
        <Link to="/header-department/project-management">
          <Button 
            type="primary" 
            className="bg-gradient-to-r from-blue-500 to-purple-600 border-0"
          >
            Quay lại danh sách
          </Button>
        </Link>
      </motion.div>
    );
  }

  if (!project) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center py-20"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="text-6xl mb-4"
        >
          🔍
        </motion.div>
        <Typography.Title level={3} className="text-gray-500">
          Không tìm thấy dự án
        </Typography.Title>
        <Typography.Text className="text-gray-400 mb-4 text-center max-w-md">
          Dự án bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
        </Typography.Text>
        <Link to="/header-department/project-management">
          <Button 
            type="primary" 
            className="bg-gradient-to-r from-blue-500 to-purple-600 border-0"
          >
            Quay lại danh sách
          </Button>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}
    >
      {/* Project Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Card 
          style={{ 
            borderRadius: '16px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            border: 'none',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
          }}
          bodyStyle={{ padding: '32px' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Title and Tags Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <Typography.Title 
                  level={1} 
                  style={{ 
                    margin: 0, 
                    color: '#1e293b', 
                    fontWeight: 700,
                    fontSize: '32px',
                    lineHeight: '1.2'
                  }}
                >
                  {project.project_name}
                </Typography.Title>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                  <Tag 
                    color={project.status === 'ACTIVE' ? 'green' : 
                           project.status === 'COMPLETED' ? 'blue' : 
                           project.status === 'CANCELLED' ? 'red' : 
                           project.status === 'ON_HOLD' ? 'orange' : 'default'}
                    style={{ 
                      fontSize: '12px', 
                      padding: '6px 16px', 
                      borderRadius: '20px',
                      fontWeight: 600,
                      border: 'none'
                    }}
                  >
                    {project.status === 'PLANNING' ? 'LẬP KẾ HOẠCH' :
                     project.status === 'ACTIVE' ? 'ĐANG HOẠT ĐỘNG' :
                     project.status === 'COMPLETED' ? 'HOÀN THÀNH' :
                     project.status === 'CANCELLED' ? 'ĐÃ HỦY' :
                     project.status === 'ON_HOLD' ? 'TẠM DỪNG' : project.status}
                  </Tag>
                  <Tag 
                    color={project.priority === 'URGENT' ? 'red' :
                           project.priority === 'HIGH' ? 'orange' : 
                           project.priority === 'MEDIUM' ? 'blue' : 
                           project.priority === 'LOW' ? 'green' : 'default'}
                    style={{ 
                      fontSize: '12px', 
                      padding: '6px 16px', 
                      borderRadius: '20px',
                      fontWeight: 600,
                      border: 'none'
                    }}
                  >
                    {project.priority === 'URGENT' ? 'KHẨN CẤP' :
                     project.priority === 'HIGH' ? 'CAO' :
                     project.priority === 'MEDIUM' ? 'TRUNG BÌNH' :
                     project.priority === 'LOW' ? 'THẤP' : project.priority}
                  </Tag>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <Link to="/header-department/project-management">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      icon={<ArrowLeftOutlined />}
                      size="large"
                      style={{ 
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                        fontWeight: 500
                      }}
                    >
                      Quay lại
                    </Button>
                  </motion.div>
                </Link>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    type="primary"
                    icon={<EditOutlined />}
                    size="large"
                    onClick={() => setIsEditModalOpen(true)}
                    style={{ 
                      borderRadius: '8px',
                      fontWeight: 500,
                      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                      border: 'none'
                    }}
                  >
                    Chỉnh sửa
                  </Button>
                </motion.div>
              </div>
            </div>
            
            {/* Description */}
            <Typography.Text 
              style={{ 
                fontSize: '16px', 
                color: '#64748b', 
                lineHeight: '1.6',
                display: 'block'
              }}
            >
              {project.description && project.description.trim() !== '' && 
               !project.description.toLowerCase().includes('ádasdasd') && 
               !project.description.toLowerCase().includes('test') 
               ? project.description 
               : 'Không có mô tả'}
            </Typography.Text>
            
            {/* Project Info Grid */}
            <Row gutter={[24, 16]}>
              <Col xs={24} sm={12} md={6}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  padding: '16px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ 
                    padding: '8px', 
                    borderRadius: '8px', 
                    backgroundColor: '#dbeafe'
                  }}>
                    <CalendarOutlined style={{ fontSize: '16px', color: '#2563eb' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Thời gian</div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
                      {new Date(project.start_date).toLocaleDateString('vi-VN')} - 
                      {new Date(project.end_date).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  padding: '16px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ 
                    padding: '8px', 
                    borderRadius: '8px', 
                    backgroundColor: '#dcfce7'
                  }}>
                    <UserOutlined style={{ fontSize: '16px', color: '#16a34a' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Trưởng dự án</div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
                      {project.leader_id && typeof project.leader_id === 'object' ? 
                        project.leader_id.full_name || 'N/A' : 
                        project.leader_id || 'N/A'}
                    </div>
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  padding: '16px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ 
                    padding: '8px', 
                    borderRadius: '8px', 
                    backgroundColor: '#fef3c7'
                  }}>
                    <EnvironmentOutlined style={{ fontSize: '16px', color: '#d97706' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Địa điểm</div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
                      {project.site_id && typeof project.site_id === 'object' ? 
                        project.site_id.site_name || 'N/A' : 
                        project.site_id || 'N/A'}
                    </div>
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  padding: '16px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ 
                    padding: '8px', 
                    borderRadius: '8px', 
                    backgroundColor: '#f3e8ff'
                  }}>
                    <BarChartOutlined style={{ fontSize: '16px', color: '#9333ea' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Tiến độ</div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{project.progress}%</div>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </Card>
      </motion.div>

      {/* Navigation & Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card 
          className="shadow-xl border-0 rounded-2xl bg-white/80 backdrop-blur-md"
          style={{ position: 'relative', zIndex: 1 }}
        >
          <Tabs
            activeKey={activeTab}
            onChange={(key) => {
              console.log('Tab clicked:', key);
              console.log('Setting activeTab to:', key);
              setActiveTab(key);
              // Cập nhật URL để đồng bộ với state
              const path = key === 'overview' ? '' : `/${key}`;
              window.history.replaceState(null, '', `/header-department/project-management/${projectId}${path}`);
            }}
            items={[
              {
                key: 'overview',
                label: (
                  <span className="flex items-center space-x-2" style={{ pointerEvents: 'auto' }}>
                    <BarChartOutlined />
                    <span>Tổng quan</span>
                  </span>
                ),
                children: (() => {
                  try {
                    return <ProjectOverview projectId={projectId} />;
                  } catch (error) {
                    console.error('Error rendering ProjectOverview:', error);
                    return <div>Lỗi tải tab Tổng quan</div>;
                  }
                })()
              },
              {
                key: 'progress',
                label: (
                  <span className="flex items-center space-x-2" style={{ pointerEvents: 'auto' }}>
                    <BarChartOutlined />
                    <span>Theo dõi Tiến độ</span>
                  </span>
                ),
                children: (() => {
                  try {
                    return <ProgressTrackingDashboard projectId={projectId} />;
                  } catch (error) {
                    console.error('Error rendering ProgressTrackingDashboard:', error);
                    return <div>Lỗi tải tab Theo dõi Tiến độ</div>;
                  }
                })()
              },
              {
                key: 'milestones',
                label: (
                  <span className="flex items-center space-x-2" style={{ pointerEvents: 'auto' }}>
                    <CalendarOutlined />
                    <span>Milestone</span>
                  </span>
                ),
                children: (() => {
                  try {
                    return <ProjectMilestones projectId={projectId} />;
                  } catch (error) {
                    console.error('Error rendering ProjectMilestones:', error);
                    return <div>Lỗi tải tab Milestone</div>;
                  }
                })()
              },
              {
                key: 'tasks',
                label: (
                  <span className="flex items-center space-x-2" style={{ pointerEvents: 'auto' }}>
                    <TeamOutlined />
                    <span>Nhiệm vụ</span>
                  </span>
                ),
                children: (() => {
                  try {
                    return <ProjectTasks projectId={projectId} />;
                  } catch (error) {
                    console.error('Error rendering ProjectTasks:', error);
                    return <div>Lỗi tải tab Nhiệm vụ</div>;
                  }
                })()
              },
              {
                key: 'work-locations',
                label: (
                  <span className="flex items-center space-x-2" style={{ pointerEvents: 'auto' }}>
                    <AimOutlined />
                    <span>Vị trí Làm việc</span>
                  </span>
                ),
                children: (() => {
                  try {
                    return <ProjectWorkLocations projectId={projectId} />;
                  } catch (error) {
                    console.error('Error rendering ProjectWorkLocations:', error);
                    return <div>Lỗi tải tab Vị trí Làm việc</div>;
                  }
                })()
              },
              {
                key: 'risks',
                label: (
                  <span className="flex items-center space-x-2" style={{ pointerEvents: 'auto' }}>
                    <ExclamationCircleOutlined />
                    <span>Rủi ro</span>
                  </span>
                ),
                children: (() => {
                  try {
                    return <ProjectRisks projectId={projectId} />;
                  } catch (error) {
                    console.error('Error rendering ProjectRisks:', error);
                    return <div>Lỗi tải tab Rủi ro</div>;
                  }
                })()
              },
              {
                key: 'task-management',
                label: (
                  <span className="flex items-center space-x-2" style={{ pointerEvents: 'auto' }}>
                    <TeamOutlined />
                    <span>Quản lý Nhiệm vụ</span>
                  </span>
                ),
                children: (() => {
                  try {
                    return <TaskManagement projectId={projectId} />;
                  } catch (error) {
                    console.error('Error rendering TaskManagement:', error);
                    return <div>Lỗi tải tab Quản lý Nhiệm vụ</div>;
                  }
                })()
              },
              {
                key: 'communication',
                label: (
                  <span className="flex items-center space-x-2" style={{ pointerEvents: 'auto' }}>
                    <MessageOutlined />
                    <span>Giao tiếp</span>
                  </span>
                ),
                children: (() => {
                  try {
                    return <ProjectCommunication projectId={projectId} />;
                  } catch (error) {
                    console.error('Error rendering ProjectCommunication:', error);
                    return <div>Lỗi tải tab Giao tiếp</div>;
                  }
                })()
              },
              {
                key: 'status-reports',
                label: (
                  <span className="flex items-center space-x-2" style={{ pointerEvents: 'auto' }}>
                    <DollarOutlined />
                    <span>Báo cáo Trạng thái</span>
                  </span>
                ),
                children: (() => {
                  try {
                    return <StatusReportManagement projectId={projectId} />;
                  } catch (error) {
                    console.error('Error rendering StatusReportManagement:', error);
                    return <div>Lỗi tải tab Báo cáo Trạng thái</div>;
                  }
                })()
              }
            ]}
            style={{
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
            }}
            tabBarStyle={{
              marginBottom: 24,
              borderBottom: '1px solid #f0f0f0',
              padding: '0 24px',
              background: '#fafafa',
              borderRadius: '12px 12px 0 0',
              position: 'relative',
              zIndex: 1
            }}
          />
        </Card>
      </motion.div>

      {/* Edit Project Modal */}
      <EditProjectModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={() => {
          // Refresh project data after successful edit
          dispatch(fetchProjectById(projectId));
        }}
        project={project}
      />
    </motion.div>
  );
};

export default ProjectDetail;
