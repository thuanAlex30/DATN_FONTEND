import React from 'react';
import { motion } from 'framer-motion';
import { Card, Row, Col, Statistic, Progress } from 'antd';
import { 
  ProjectOutlined, 
  PlayCircleOutlined, 
  CheckCircleOutlined, 
  HourglassOutlined,
  PauseCircleOutlined,
  RiseOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import type { ProjectStats } from '../../../../types/project';

interface ProjectStatsProps {
  stats: ProjectStats;
}

const ProjectStatsComponent: React.FC<ProjectStatsProps> = ({ stats }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  const progressPercentage = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Card 
        className="shadow-xl border-0 rounded-2xl bg-gradient-to-r from-white to-blue-50/50 backdrop-blur-md"
        title={
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <BarChartOutlined className="text-white text-lg" />
            </div>
            <span className="text-xl font-bold text-gray-800">Thống kê Dự án</span>
          </div>
        }
      >
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} lg={6}>
            <motion.div variants={itemVariants}>
              <Card 
                size="small" 
                className="hover:shadow-lg transition-all duration-300 border-0 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50"
              >
                <Statistic
                  title={
                    <span className="text-gray-600 font-medium">Tổng số dự án</span>
                  }
                  value={stats.total}
                  prefix={
                    <div className="p-2 bg-blue-500 rounded-lg inline-flex items-center justify-center">
                      <ProjectOutlined className="text-white text-lg" />
                    </div>
                  }
                  valueStyle={{ 
                    color: '#1e40af',
                    fontSize: '28px',
                    fontWeight: 'bold'
                  }}
                />
              </Card>
            </motion.div>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <motion.div variants={itemVariants}>
              <Card 
                size="small" 
                className="hover:shadow-lg transition-all duration-300 border-0 rounded-xl bg-gradient-to-br from-green-50 to-green-100/50"
              >
                <Statistic
                  title={
                    <span className="text-gray-600 font-medium">Đang hoạt động</span>
                  }
                  value={stats.active}
                  prefix={
                    <div className="p-2 bg-green-500 rounded-lg inline-flex items-center justify-center">
                      <PlayCircleOutlined className="text-white text-lg" />
                    </div>
                  }
                  valueStyle={{ 
                    color: '#16a34a',
                    fontSize: '28px',
                    fontWeight: 'bold'
                  }}
                />
              </Card>
            </motion.div>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <motion.div variants={itemVariants}>
              <Card 
                size="small" 
                className="hover:shadow-lg transition-all duration-300 border-0 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50"
              >
                <Statistic
                  title={
                    <span className="text-gray-600 font-medium">Hoàn thành</span>
                  }
                  value={stats.completed}
                  prefix={
                    <div className="p-2 bg-emerald-500 rounded-lg inline-flex items-center justify-center">
                      <CheckCircleOutlined className="text-white text-lg" />
                    </div>
                  }
                  valueStyle={{ 
                    color: '#059669',
                    fontSize: '28px',
                    fontWeight: 'bold'
                  }}
                />
              </Card>
            </motion.div>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <motion.div variants={itemVariants}>
              <Card 
                size="small" 
                className="hover:shadow-lg transition-all duration-300 border-0 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/50"
              >
                <Statistic
                  title={
                    <span className="text-gray-600 font-medium">Đang chờ</span>
                  }
                  value={stats.pending}
                  prefix={
                    <div className="p-2 bg-amber-500 rounded-lg inline-flex items-center justify-center">
                      <HourglassOutlined className="text-white text-lg" />
                    </div>
                  }
                  valueStyle={{ 
                    color: '#d97706',
                    fontSize: '28px',
                    fontWeight: 'bold'
                  }}
                />
              </Card>
            </motion.div>
          </Col>
        </Row>

        {/* Progress Section */}
        <motion.div 
          variants={itemVariants}
          className="mt-6"
        >
          <Card 
            size="small" 
            className="border-0 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50/50"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <RiseOutlined className="text-purple-500 text-lg" />
                <span className="text-gray-700 font-semibold">Tiến độ hoàn thành</span>
              </div>
              <span className="text-2xl font-bold text-purple-600">{progressPercentage}%</span>
            </div>
            <Progress 
              percent={progressPercentage} 
              strokeColor={{
                '0%': '#8b5cf6',
                '100%': '#ec4899',
              }}
              trailColor="#e5e7eb"
              strokeWidth={8}
              className="mb-2"
            />
            <div className="text-sm text-gray-500">
              {stats.completed} / {stats.total} dự án đã hoàn thành
            </div>
          </Card>
        </motion.div>

        {stats.cancelled && stats.cancelled > 0 && (
          <motion.div variants={itemVariants}>
            <Row gutter={[24, 24]} className="mt-4">
              <Col xs={24} sm={12} lg={6}>
                <Card 
                  size="small" 
                  className="hover:shadow-lg transition-all duration-300 border-0 rounded-xl bg-gradient-to-br from-red-50 to-red-100/50"
                >
                  <Statistic
                    title={
                      <span className="text-gray-600 font-medium">Đã hủy</span>
                    }
                    value={stats.cancelled}
                    prefix={
                      <div className="p-2 bg-red-500 rounded-lg inline-flex items-center justify-center">
                        <PauseCircleOutlined className="text-white text-lg" />
                      </div>
                    }
                    valueStyle={{ 
                      color: '#dc2626',
                      fontSize: '28px',
                      fontWeight: 'bold'
                    }}
                  />
                </Card>
              </Col>
            </Row>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
};

export default ProjectStatsComponent;