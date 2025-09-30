import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { 
  Button, 
  Typography, 
  Spin, 
  Alert, 
  Row, 
  Col, 
  Drawer, 
  Progress, 
  Statistic,
  Card,
  Badge,
  Tooltip
} from 'antd';
import { 
  ProjectOutlined, 
  PlusOutlined, 
  PlayCircleOutlined, 
  FilterOutlined,
  ReloadOutlined,
  ClockCircleOutlined,
  FlagOutlined,
  TrophyOutlined,
  RocketOutlined,
  RiseOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchProjects } from '../../../store/slices/projectSlice';
import { fetchProjectStats } from '../../../store/slices/projectSlice';
import ProjectList from './components/ProjectList';
import ProjectDetail from './components/ProjectDetail';
import ProjectFormModal from './components/ProjectFormModal';
import ProjectFiltersPanel from './components/ProjectFiltersPanel';
import ProjectCreationWizard from './components/ProjectCreationWizard';
import ProjectBasicInfoForm, { type ProjectBasicInfo } from './components/ProjectBasicInfoForm';
import type { RootState } from '../../../store';
import type { Project, ProjectFilters } from '../../../types/project';


const ProjectManagement: React.FC = () => {
  const dispatch = useDispatch();
    const location = useLocation();
  const { projects, loading, error, stats } = useSelector((state: RootState) => state.project);
  
  // State management
  const [isProjectDetailView, setIsProjectDetailView] = useState(false);
  const [urlProjectId, setUrlProjectId] = useState<string | undefined>(undefined);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showBasicInfoForm, setShowBasicInfoForm] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectBasicInfo, setProjectBasicInfo] = useState<ProjectBasicInfo | null>(null);
  const [filters, setFilters] = useState<ProjectFilters>({
    status: '',
    priority: '',
        leader_id: '',
    site_id: '',
    search: ''
  });

  // Extract project ID from URL
    useEffect(() => {
    const pathParts = location.pathname.split('/');
    const projectIndex = pathParts.indexOf('project-management');
    
    if (projectIndex !== -1 && pathParts[projectIndex + 1]) {
      const projectId = pathParts[projectIndex + 1];
      setUrlProjectId(projectId);
      setIsProjectDetailView(true);
            } else {
      setUrlProjectId(undefined);
      setIsProjectDetailView(false);
    }
  }, [location.pathname]);

  // Load data
  useEffect(() => {
    dispatch(fetchProjects({}) as any);
    dispatch(fetchProjectStats() as any);
  }, [dispatch]);

  // Filter projects based on current filters
  const filteredProjects = projects.filter(project => {
    if (filters.status && project.status !== filters.status) return false;
    if (filters.priority && project.priority !== filters.priority) return false;
    if (filters.leader_id && project.leader_id?.id !== filters.leader_id) return false;
    if (filters.site_id && project.site_id?._id !== filters.site_id) return false;
    if (filters.search && !project.project_name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  // Event handlers
  const handleCreateProject = () => {
    setShowBasicInfoForm(true);
  };

  const handleBasicInfoNext = (basicInfo: ProjectBasicInfo) => {
    setProjectBasicInfo(basicInfo);
    setShowBasicInfoForm(false);
    setShowWizard(true);
  };

  const handleWizardSuccess = () => {
    setShowWizard(false);
    setProjectBasicInfo(null);
    dispatch(fetchProjects({}) as any);
  };

  const handleWizardClose = () => {
    setShowWizard(false);
    setProjectBasicInfo(null);
  };

  const handleEditProject = (project: Project) => {
            setEditingProject(project);
    setShowEditModal(true);
  };




  const handleFiltersChange = (newFilters: ProjectFilters) => {
    setFilters(newFilters);
  };


  // Debug logging (only when values change)
  useEffect(() => {
    console.log('ProjectManagement Debug:', {
      projectId: urlProjectId,
      isProjectDetailView,
      pathname: location.pathname,
      projectsCount: projects.length
    });
  }, [urlProjectId, isProjectDetailView, location.pathname, projects.length]);

    if (loading) {
        return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spin size="large" />
            </div>
        );
    }

    if (error) {
        return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Alert
          message="Lỗi tải dữ liệu"
          description={error}
          type="error"
          showIcon
        />
            </div>
        );
    }

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card 
              className="border-0 shadow-xl bg-gradient-to-r from-white to-blue-50/30 backdrop-blur-sm"
              style={{ borderRadius: '24px' }}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-8">
                {/* Left side - Title */}
                <motion.div 
                  className="flex items-center space-x-6"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <motion.div 
                    className="relative"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                      <ProjectOutlined className="text-white text-3xl" />
                    </div>
                    <motion.div
                      className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </motion.div>
                  <div>
                    <Typography.Title 
                      level={1} 
                      className="!mb-2 !text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-gray-600"
                      style={{ fontSize: '2.5rem', fontWeight: '800' }}
                    >
                      Quản lý Dự án
                    </Typography.Title>
                    <Typography.Text className="text-gray-600 text-lg font-medium">
                      Quản lý và theo dõi tất cả các dự án trong hệ thống
                    </Typography.Text>
                  </div>
                </motion.div>

                {/* Right side - Action Buttons */}
                <motion.div 
                  className="flex items-center space-x-4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <Tooltip title="Làm mới dữ liệu">
                    <Button 
                      type="text"
                      icon={<ReloadOutlined />}
                      size="large"
                      className="hover:bg-blue-50 hover:text-blue-600 transition-all duration-300"
                      style={{ 
                        height: '48px',
                        width: '48px',
                        borderRadius: '12px'
                      }}
                    />
                  </Tooltip>
                  
                  <Tooltip title="Bộ lọc dự án">
                    <Button 
                      type="text"
                      icon={<FilterOutlined />}
                      size="large"
                      className="hover:bg-purple-50 hover:text-purple-600 transition-all duration-300"
                      style={{ 
                        height: '48px',
                        width: '48px',
                        borderRadius: '12px'
                      }}
                    />
                  </Tooltip>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={handleCreateProject}
                      size="large"
                      className="shadow-2xl hover:shadow-3xl transition-all duration-300"
                      style={{ 
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        fontWeight: 'bold',
                        height: '56px',
                        paddingLeft: '32px',
                        paddingRight: '32px',
                        fontSize: '16px',
                        borderRadius: '16px',
                        boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)'
                      }}
                    >
                      Tạo dự án mới
                    </Button>
                  </motion.div>
                </motion.div>
              </div>
            </Card>
          </motion.div>

          {/* Stats Section */}
          <AnimatePresence>
            {stats && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <Card 
                  className="border-0 shadow-2xl bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/30 backdrop-blur-sm"
                  style={{ borderRadius: '24px' }}
                >
                  <div className="p-8">
                    <motion.div 
                      className="mb-8 text-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.5 }}
                    >
                      <Typography.Title 
                        level={2} 
                        className="!mb-3 !text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"
                        style={{ fontSize: '2rem', fontWeight: '700' }}
                      >
                        📊 Thống kê Dự án
                      </Typography.Title>
                      <Typography.Text className="text-gray-600 text-lg">
                        Tổng quan về tình hình dự án trong hệ thống
                      </Typography.Text>
                    </motion.div>

                    <Row gutter={[24, 24]}>
                      <Col xs={24} sm={12} md={6}>
                        <motion.div
                          whileHover={{ scale: 1.05, y: -5 }}
                          whileTap={{ scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Card 
                            className="text-center border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100/50"
                            style={{ borderRadius: '20px' }}
                          >
                            <motion.div
                              className="mb-4"
                              animate={{ rotate: [0, 5, -5, 0] }}
                              transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
                            >
                              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                                <ProjectOutlined className="text-white text-2xl" />
                              </div>
                            </motion.div>
                            <Statistic
                              title={
                                <div className="flex items-center justify-center space-x-2 text-gray-700 mb-3 font-semibold">
                                  <span>Tổng số dự án</span>
                                </div>
                              }
                              value={stats.total}
                              valueStyle={{ 
                                color: '#1e40af',
                                fontSize: '2.5rem',
                                fontWeight: '800'
                              }}
                            />
                          </Card>
                        </motion.div>
                      </Col>

                      <Col xs={24} sm={12} md={6}>
                        <motion.div
                          whileHover={{ scale: 1.05, y: -5 }}
                          whileTap={{ scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Card 
                            className="text-center border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-green-50 to-emerald-100/50"
                            style={{ borderRadius: '20px' }}
                          >
                            <motion.div
                              className="mb-4"
                              animate={{ scale: [1, 1.1, 1] }}
                              transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}
                            >
                              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg">
                                <PlayCircleOutlined className="text-white text-2xl" />
                              </div>
                            </motion.div>
                            <Statistic
                              title={
                                <div className="flex items-center justify-center space-x-2 text-gray-700 mb-3 font-semibold">
                                  <span>Đang hoạt động</span>
                                </div>
                              }
                              value={stats.active}
                              valueStyle={{ 
                                color: '#059669',
                                fontSize: '2.5rem',
                                fontWeight: '800'
                              }}
                            />
                          </Card>
                        </motion.div>
                      </Col>

                      <Col xs={24} sm={12} md={6}>
                        <motion.div
                          whileHover={{ scale: 1.05, y: -5 }}
                          whileTap={{ scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Card 
                            className="text-center border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-emerald-50 to-teal-100/50"
                            style={{ borderRadius: '20px' }}
                          >
                            <motion.div
                              className="mb-4"
                              animate={{ rotate: [0, 10, -10, 0] }}
                              transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                            >
                              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg">
                                <TrophyOutlined className="text-white text-2xl" />
                              </div>
                            </motion.div>
                            <Statistic
                              title={
                                <div className="flex items-center justify-center space-x-2 text-gray-700 mb-3 font-semibold">
                                  <span>Hoàn thành</span>
                                </div>
                              }
                              value={stats.completed}
                              valueStyle={{ 
                                color: '#10b981',
                                fontSize: '2.5rem',
                                fontWeight: '800'
                              }}
                            />
                          </Card>
                        </motion.div>
                      </Col>

                      <Col xs={24} sm={12} md={6}>
                        <motion.div
                          whileHover={{ scale: 1.05, y: -5 }}
                          whileTap={{ scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Card 
                            className="text-center border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-orange-50 to-amber-100/50"
                            style={{ borderRadius: '20px' }}
                          >
                            <motion.div
                              className="mb-4"
                              animate={{ scale: [1, 1.05, 1] }}
                              transition={{ duration: 2, repeat: Infinity, delay: 0.8 }}
                            >
                              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl shadow-lg">
                                <ClockCircleOutlined className="text-white text-2xl" />
                              </div>
                            </motion.div>
                            <Statistic
                              title={
                                <div className="flex items-center justify-center space-x-2 text-gray-700 mb-3 font-semibold">
                                  <span>Đang chờ</span>
                                </div>
                              }
                              value={stats.pending}
                              valueStyle={{ 
                                color: '#ea580c',
                                fontSize: '2.5rem',
                                fontWeight: '800'
                              }}
                            />
                          </Card>
                        </motion.div>
                      </Col>
                    </Row>

                    {/* Progress Section */}
                    <motion.div 
                      className="mt-8"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.7 }}
                    >
                      <Card 
                        className="border-0 shadow-xl bg-gradient-to-r from-indigo-50 to-purple-50/50"
                        style={{ borderRadius: '20px' }}
                      >
                        <div className="p-6">
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
                            <div className="flex items-center space-x-4">
                              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                                <RiseOutlined className="text-white text-2xl" />
                              </div>
                              <div>
                                <Typography.Title level={3} className="!mb-1 !text-gray-800">
                                  Tiến độ hoàn thành
                                </Typography.Title>
                                <Typography.Text className="text-gray-600">
                                  Theo dõi tiến độ tổng thể của các dự án
                                </Typography.Text>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <Badge 
                                count={`${stats.completed}/${stats.total}`}
                                style={{ 
                                  backgroundColor: '#667eea',
                                  fontSize: '14px',
                                  fontWeight: 'bold'
                                }}
                              />
                              <Typography.Text className="text-2xl font-bold text-indigo-600">
                                {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                              </Typography.Text>
                            </div>
                          </div>
                          
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 1, delay: 0.8 }}
                          >
                            <Progress
                              percent={stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}
                              strokeColor={{
                                '0%': '#667eea',
                                '50%': '#764ba2',
                                '100%': '#f093fb',
                              }}
                              trailColor="#e2e8f0"
                              strokeWidth={12}
                              className="mb-4"
                              style={{ borderRadius: '10px' }}
                            />
                          </motion.div>
                          
                          <div className="flex justify-between text-sm text-gray-500 font-medium">
                            <span className="flex items-center space-x-1">
                              <FlagOutlined />
                              <span>Bắt đầu</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <RocketOutlined />
                              <span>Hoàn thành</span>
                            </span>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Card 
              className="border-0 shadow-2xl bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30 backdrop-blur-sm"
              style={{ borderRadius: '24px' }}
            >
              <AnimatePresence mode="wait">
                {isProjectDetailView ? (
                  <motion.div
                    key="detail"
                    initial={{ opacity: 0, x: 30, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -30, scale: 0.95 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  >
                    <ProjectDetail projectId={urlProjectId || ''} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="list"
                    initial={{ opacity: 0, x: -30, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 30, scale: 0.95 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  >
                    <ProjectList
                      projects={filteredProjects}
                      loading={loading}
                      viewMode="list"
                      onEditProject={handleEditProject}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Modals */}
      {showEditModal && editingProject && (
        <ProjectFormModal
          project={editingProject}
          onClose={() => {
            setShowEditModal(false);
            setEditingProject(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setEditingProject(null);
            dispatch(fetchProjects({}) as any);
          }}
        />
      )}

      <ProjectBasicInfoForm
        visible={showBasicInfoForm}
        onClose={() => setShowBasicInfoForm(false)}
        onNext={handleBasicInfoNext}
      />

      <ProjectCreationWizard
        visible={showWizard}
        onClose={handleWizardClose}
        onSuccess={handleWizardSuccess}
        projectBasicInfo={projectBasicInfo}
      />

      <Drawer
        title="Bộ lọc dự án"
        placement="right"
        onClose={() => setShowFilters(false)}
        open={showFilters}
        width={400}
      >
        <ProjectFiltersPanel
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={() => setFilters({
            status: '',
            priority: '',
            leader_id: '',
            site_id: '',
            search: ''
          })}
          onClose={() => setShowFilters(false)}
        />
      </Drawer>
    </motion.div>
  );
};

export default ProjectManagement;