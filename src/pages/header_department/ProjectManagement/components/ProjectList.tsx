import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Card, 
  Avatar, 
  Tag, 
  Button, 
  Space, 
  Typography, 
  Row, 
  Col, 
  Progress, 
  Tooltip,
  Spin,
  Table
} from 'antd';
import { 
  EyeOutlined, 
  CalendarOutlined, 
  UserOutlined,
  EnvironmentOutlined,
  DollarOutlined
} from '@ant-design/icons';
import type { Project } from '../../../../types/project';

interface ProjectListProps {
  projects: Project[];
  loading: boolean;
  viewMode: 'list' | 'grid';
}

const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  loading,
  viewMode,
}) => {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'in_progress':
        return 'processing';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      case 'pending':
      case 'planning':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
        return 'red';
      case 'high':
        return 'orange';
      case 'medium':
        return 'blue';
      case 'low':
        return 'green';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getProgressPercent = (project: Project) => {
    // Simple progress calculation based on status
    switch (project.status?.toLowerCase()) {
      case 'planning':
        return 10;
      case 'in_progress':
        return 50;
      case 'completed':
        return 100;
      case 'cancelled':
        return 0;
      default:
        return 0;
    }
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
          Đang tải danh sách dự án...
        </motion.p>
      </motion.div>
    );
  }

  if (projects.length === 0) {
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
          📋
        </motion.div>
        <Typography.Title level={3} className="text-gray-500">
          Không có dự án nào
        </Typography.Title>
        <Typography.Text className="text-gray-400 text-center max-w-md">
          Chưa có dự án nào được tạo hoặc không tìm thấy dự án phù hợp với bộ lọc.
        </Typography.Text>
      </motion.div>
    );
  }

  if (viewMode === 'grid') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Row gutter={[24, 24]}>
          <AnimatePresence>
            {projects.map((project, index) => (
              <Col key={project.id} xs={24} sm={12} lg={8} xl={6}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ 
                    y: -8,
                    transition: { duration: 0.2 }
                  }}
                >
                  <Card
                    hoverable
                    className="h-full border-0 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm"
                    actions={[
                      <Tooltip title="Xem chi tiết" key="view">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Link to={`/header-department/project-management/${project.id}`}>
                            <Button 
                              type="text" 
                              icon={<EyeOutlined />}
                              className="hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            >
                              Xem chi tiết
                            </Button>
                          </Link>
                        </motion.div>
                      </Tooltip>
                    ]}
                  >
                    <Card.Meta
                      avatar={
                        <motion.div
                          whileHover={{ rotate: 5 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Avatar 
                            size={56}
                            className="shadow-lg"
                            style={{ 
                              background: `linear-gradient(135deg, ${
                                getStatusColor(project.status) === 'success' ? '#10b981, #059669' : 
                                getStatusColor(project.status) === 'processing' ? '#3b82f6, #1d4ed8' : 
                                '#f59e0b, #d97706'
                              })`
                            }}
                          >
                            {project.project_name?.charAt(0)?.toUpperCase()}
                          </Avatar>
                        </motion.div>
                      }
                      title={
                        <Link to={`/header-department/project-management/${project.id}`}>
                          <Typography.Title 
                            level={5} 
                            className="!mb-0 !text-gray-800 hover:text-blue-600 transition-colors"
                          >
                            {project.project_name}
                          </Typography.Title>
                        </Link>
                      }
                      description={
                        <div className="mt-3">
                          <Typography.Text 
                            type="secondary" 
                            ellipsis={{ tooltip: true }}
                            className="block mb-4 text-sm leading-relaxed"
                          >
                            {project.description || 'Không có mô tả'}
                          </Typography.Text>
                    
                            
                            <Space direction="vertical" size={12} className="w-full">
                              <div className="flex justify-between items-center">
                                <Tag 
                                  color={getStatusColor(project.status)}
                                  className="px-3 py-1 rounded-full font-medium"
                                >
                                  {project.status}
                                </Tag>
                                <Tag 
                                  color={getPriorityColor(project.priority)}
                                  className="px-3 py-1 rounded-full font-medium"
                                >
                                  {project.priority}
                                </Tag>
                              </div>
                            </Space>
                          </div>
                }
              />
              
              <div className="mt-4 space-y-3">
                <div className="flex justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <CalendarOutlined />
                    <span>{formatDate(project.start_date)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <CalendarOutlined />
                    <span>{formatDate(project.end_date)}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Tiến độ</span>
                    <span>{getProgressPercent(project)}%</span>
                  </div>
                  <Progress 
                    percent={getProgressPercent(project)} 
                    size="small"
                    strokeColor={{
                      '0%': '#3b82f6',
                      '100%': '#8b5cf6',
                    }}
                    trailColor="#e5e7eb"
                    className="mb-2"
                  />
                </div>
                
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <UserOutlined />
                  <span>Leader: {typeof project.leader_id === 'string' ? project.leader_id : project.leader_id?.full_name || 'N/A'}</span>
                </div>
                
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <EnvironmentOutlined />
                  <span>Site: {typeof project.site_id === 'string' ? project.site_id : project.site_id?.site_name || 'N/A'}</span>
                </div>
                
              </div>
            </Card>
                </motion.div>
              </Col>
            ))}
          </AnimatePresence>
        </Row>
      </motion.div>
    );
  }

  // List view with Table
  const columns = [
    {
      title: 'Tên dự án',
      dataIndex: 'project_name',
      key: 'project_name',
      render: (text: string, record: Project) => (
        <motion.div
          whileHover={{ x: 4 }}
          transition={{ duration: 0.2 }}
        >
          <Link to={`/header-department/project-management/${record.id}`}>
            <Typography.Title 
              level={5} 
              className="!mb-1 !text-gray-800 hover:text-blue-600 transition-colors"
            >
              {text}
            </Typography.Title>
          </Link>
          <Typography.Text 
            type="secondary" 
            ellipsis={{ tooltip: true }}
            className="text-sm"
          >
            {record.description || 'Không có mô tả'}
          </Typography.Text>
        </motion.div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <Tag 
            color={getStatusColor(status)}
            className="px-3 py-1 rounded-full font-medium"
          >
            {status}
          </Tag>
        </motion.div>
      ),
    },
    {
      title: 'Ưu tiên',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => (
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <Tag 
            color={getPriorityColor(priority)}
            className="px-3 py-1 rounded-full font-medium"
          >
            {priority}
          </Tag>
        </motion.div>
      ),
    },
    {
      title: 'Trưởng dự án',
      dataIndex: 'leader_id',
      key: 'leader_id',
      render: (leaderId: any) => (
        <motion.div
          whileHover={{ x: 4 }}
          transition={{ duration: 0.2 }}
          className="flex items-center space-x-2"
        >
          <div className="p-1 bg-blue-100 rounded-full">
            <UserOutlined className="text-blue-500" />
          </div>
          <Typography.Text className="font-medium">
            {typeof leaderId === 'object' ? leaderId?.full_name || leaderId?.email || 'N/A' : leaderId || 'N/A'}
          </Typography.Text>
        </motion.div>
      ),
    },
    {
      title: 'Địa điểm',
      dataIndex: 'site_id',
      key: 'site_id',
      render: (siteId: any) => (
        <motion.div
          whileHover={{ x: 4 }}
          transition={{ duration: 0.2 }}
          className="flex items-center space-x-2"
        >
          <div className="p-1 bg-green-100 rounded-full">
            <EnvironmentOutlined className="text-green-500" />
          </div>
          <Typography.Text className="font-medium">
            {typeof siteId === 'object' ? siteId?.site_name : siteId || 'N/A'}
          </Typography.Text>
        </motion.div>
      ),
    },
    {
      title: 'Tiến độ',
      dataIndex: 'progress',
      key: 'progress',
      render: (_: unknown, record: Project) => (
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
          className="space-y-2 w-24"
        >
          <div className="flex justify-between text-xs text-gray-500">
            <span>Tiến độ</span>
            <span className="font-medium">{getProgressPercent(record)}%</span>
          </div>
          <Progress 
            percent={getProgressPercent(record)} 
            size="small"
            strokeColor={{
              '0%': '#3b82f6',
              '100%': '#8b5cf6',
            }}
            trailColor="#e5e7eb"
          />
        </motion.div>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: unknown, record: Project) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to={`/header-department/project-management/${record.id}`}>
                <Button 
                  type="text" 
                  icon={<EyeOutlined />}
                  className="hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  Xem
                </Button>
              </Link>
            </motion.div>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Table
        columns={columns}
        dataSource={projects}
        rowKey="id"
        className="project-table"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} của ${total} dự án`,
        }}
        scroll={{ x: 1200 }}
        rowClassName="hover:bg-blue-50/50 transition-colors duration-200"
      />
    </motion.div>
  );
};

export default ProjectList;