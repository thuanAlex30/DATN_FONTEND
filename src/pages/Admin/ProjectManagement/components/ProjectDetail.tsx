import React, { useEffect } from 'react';
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
  TeamOutlined
} from '@ant-design/icons';
import type { RootState, AppDispatch } from '../../../../store';
import { fetchProjectById, fetchProjectTimeline, fetchProjectAssignments } from '../../../../store/slices/projectSlice';
import ProjectOverview from './ProjectOverview';
import ProjectPhases from './ProjectPhases';
import ProjectMilestones from './ProjectMilestones';
import ProjectTasks from './ProjectTasks';
import ProjectResources from './ProjectResources';
import ProgressTrackingDashboard from './ProgressTrackingDashboard';

interface ProjectDetailProps {
  projectId: string;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ projectId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  
  const { selectedProject, loading, error, projects } = useSelector((state: RootState) => state.project);

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
      projectsCount: projects.length
    });
  }, [projectId, selectedProject, project, loading, error, projects.length]);

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
    const projectPath = `/admin/project-management/${projectId}`;
    const currentPath = path.replace(projectPath, '') || '';
    return currentPath === '' ? 'overview' : currentPath.replace('/', '');
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
        <Link to="/admin/project-management">
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
        <Link to="/admin/project-management">
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
      className="space-y-6"
    >
      {/* Project Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Card className="shadow-xl border-0 rounded-2xl bg-gradient-to-r from-white to-blue-50/50 backdrop-blur-md">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                <div>
                  <Typography.Title level={1} className="!mb-2 !text-gray-800">
                    {project.project_name}
                  </Typography.Title>
                  <div className="flex flex-wrap gap-2">
                    <Tag 
                      color={project.status === 'ACTIVE' ? 'processing' : 
                             project.status === 'COMPLETED' ? 'success' : 
                             project.status === 'CANCELLED' ? 'error' : 'warning'}
                      className="px-3 py-1 rounded-full font-medium"
                    >
                      {project.status}
                    </Tag>
                    <Tag 
                      color={project.priority === 'HIGH' ? 'red' : 
                             project.priority === 'MEDIUM' ? 'orange' : 
                             project.priority === 'LOW' ? 'green' : 'blue'}
                      className="px-3 py-1 rounded-full font-medium"
                    >
                      {project.priority}
                    </Tag>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link to="/admin/project-management">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        icon={<ArrowLeftOutlined />}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        Quay lại
                      </Button>
                    </motion.div>
                  </Link>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      icon={<EditOutlined />}
                      className="hover:bg-green-50 hover:text-green-600 transition-colors"
                    >
                      Chỉnh sửa
                    </Button>
                  </motion.div>
                </div>
              </div>
              
              <Typography.Text className="text-gray-600 text-base leading-relaxed block mb-6">
                {project.description || 'Không có mô tả'}
              </Typography.Text>
              
              <Row gutter={[24, 16]}>
                <Col xs={24} sm={12} md={6}>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <CalendarOutlined className="text-blue-500" />
                    <div>
                      <div className="text-xs text-gray-500">Thời gian</div>
                      <div className="font-medium">
                        {new Date(project.start_date).toLocaleDateString('vi-VN')} - 
                        {new Date(project.end_date).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <UserOutlined className="text-green-500" />
                    <div>
                      <div className="text-xs text-gray-500">Trưởng dự án</div>
                      <div className="font-medium">
                        {typeof project.leader_id === 'object' ? project.leader_id?.full_name : project.leader_id || 'N/A'}
                      </div>
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <EnvironmentOutlined className="text-orange-500" />
                    <div>
                      <div className="text-xs text-gray-500">Địa điểm</div>
                      <div className="font-medium">
                        {typeof project.site_id === 'object' ? project.site_id?.site_name : project.site_id || 'N/A'}
                      </div>
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <BarChartOutlined className="text-purple-500" />
                    <div>
                      <div className="text-xs text-gray-500">Tiến độ</div>
                      <div className="font-medium">{project.progress}%</div>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Navigation & Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="shadow-xl border-0 rounded-2xl bg-white/80 backdrop-blur-md">
          <Tabs
            activeKey={getCurrentPath() || 'overview'}
            onChange={(key) => {
              const path = key === 'overview' ? '' : `/${key}`;
              window.history.pushState(null, '', `/admin/project-management/${projectId}${path}`);
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
            items={[
              {
                key: 'overview',
                label: (
                  <span className="flex items-center space-x-2">
                    <BarChartOutlined />
                    <span>Tổng quan</span>
                  </span>
                ),
                children: <ProjectOverview projectId={projectId} />
              },
              {
                key: 'progress',
                label: (
                  <span className="flex items-center space-x-2">
                    <BarChartOutlined />
                    <span>Theo dõi Tiến độ</span>
                  </span>
                ),
                children: <ProgressTrackingDashboard projectId={projectId} />
              },
              {
                key: 'phases',
                label: (
                  <span className="flex items-center space-x-2">
                    <TeamOutlined />
                    <span>Giai đoạn</span>
                  </span>
                ),
                children: <ProjectPhases projectId={projectId} />
              },
              {
                key: 'milestones',
                label: (
                  <span className="flex items-center space-x-2">
                    <CalendarOutlined />
                    <span>Milestone</span>
                  </span>
                ),
                children: <ProjectMilestones projectId={projectId} />
              },
              {
                key: 'tasks',
                label: (
                  <span className="flex items-center space-x-2">
                    <TeamOutlined />
                    <span>Nhiệm vụ</span>
                  </span>
                ),
                children: <ProjectTasks projectId={projectId} />
              },
              {
                key: 'resources',
                label: (
                  <span className="flex items-center space-x-2">
                    <EnvironmentOutlined />
                    <span>Tài nguyên</span>
                  </span>
                ),
                children: <ProjectResources projectId={projectId} />
              }
            ]}
            className="project-tabs"
            tabBarStyle={{
              marginBottom: 24,
              borderBottom: '1px solid #f0f0f0'
            }}
          />
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default ProjectDetail;
