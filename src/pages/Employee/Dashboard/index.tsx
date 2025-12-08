import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Card, Statistic, Row, Col, Button, Typography } from 'antd';
import { motion } from 'framer-motion';
import {
  ExclamationCircleOutlined,
  FlagOutlined,
  WarningOutlined,
  StarOutlined,
  BookOutlined,
  SafetyOutlined,
  ExclamationCircleFilled
} from '@ant-design/icons';
import type { RootState } from '../../../store';
import { logout } from '../../../store/slices/authSlice';
import { EmployeeLayout } from '../../../components/Employee';
import { DashboardOutlined } from '@ant-design/icons';
import NotificationPanel from '../../../components/NotificationPanel';
import { projectRiskService } from '../../../services/projectRiskService';
import { projectMilestoneService } from '../../../services/projectMilestoneService';
import styles from './Dashboard.module.css';

const EmployeeDashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { unreadCount } = useSelector((state: RootState) => state.websocket);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
      const [assignedTasks, setAssignedTasks] = useState({
        risks: 0,
        milestones: 0,
        highPriorityRisks: 0,
        criticalMilestones: 0
      });

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  // Fetch assigned tasks for the current user
  const fetchAssignedTasks = async () => {
    if (!user?.id) return;
    
    try {
      const [risksResponse, milestonesResponse] = await Promise.all([
        projectRiskService.getAssignedRisks(user.id),
        projectMilestoneService.getAssignedMilestones(user.id)
      ]);

      const risks = risksResponse.data || [];
      const milestones = milestonesResponse.data || [];

      setAssignedTasks({
        risks: risks.length,
        milestones: milestones.length,
        highPriorityRisks: risks.filter((risk: any) => risk.priority === 'high').length,
        criticalMilestones: milestones.filter((milestone: any) => milestone.priority === 'critical').length
      });
    } catch (error) {
      console.error('Error fetching assigned tasks:', error);
    }
  };

  useEffect(() => {
    fetchAssignedTasks();
  }, [user]);

  return (
    <EmployeeLayout
      title="Dashboard"
      icon={<DashboardOutlined />}
      onLogout={handleLogout}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card
            style={{
              marginBottom: '32px',
              borderRadius: '20px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              border: 'none',
              background: 'linear-gradient(135deg, #ffffff 0%, rgba(219, 234, 254, 0.3) 100%)',
            }}
          >
            <div style={{ padding: '24px' }}>
              <Typography.Title
                level={2}
                style={{
                  margin: 0,
                  marginBottom: '8px',
                  background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontWeight: 700,
                }}
              >
                Xin chào, {user?.full_name || 'Nhân viên'}! 👋
              </Typography.Title>
              <Typography.Text style={{ fontSize: '16px', color: '#64748b' }}>
                Chào mừng bạn đến với hệ thống quản lý an toàn lao động
              </Typography.Text>
            </div>
          </Card>
        </motion.div>

        {/* Quick Stats */}
        <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
          <Col xs={24} sm={12} md={6}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <Card
                style={{
                  borderRadius: '16px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                  border: 'none',
                  background: 'linear-gradient(135deg, #fff5f5 0%, #ffe0e0 100%)',
                }}
              >
                <Statistic
                  title={
                    <span style={{ color: '#64748b', fontWeight: 500 }}>
                      Rủi ro được giao
                    </span>
                  }
                  value={assignedTasks.risks}
                  prefix={<ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />}
                  valueStyle={{ color: '#ff4d4f', fontWeight: 700, fontSize: '28px' }}
                />
              </Card>
            </motion.div>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <Card
                style={{
                  borderRadius: '16px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                  border: 'none',
                  background: 'linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%)',
                }}
              >
                <Statistic
                  title={
                    <span style={{ color: '#64748b', fontWeight: 500 }}>
                      Cột mốc được giao
                    </span>
                  }
                  value={assignedTasks.milestones}
                  prefix={<FlagOutlined style={{ color: '#1890ff' }} />}
                  valueStyle={{ color: '#1890ff', fontWeight: 700, fontSize: '28px' }}
                />
              </Card>
            </motion.div>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <Card
                style={{
                  borderRadius: '16px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                  border: 'none',
                  background: 'linear-gradient(135deg, #fffbe6 0%, #fff1b8 100%)',
                }}
              >
                <Statistic
                  title={
                    <span style={{ color: '#64748b', fontWeight: 500 }}>
                      Rủi ro ưu tiên cao
                    </span>
                  }
                  value={assignedTasks.highPriorityRisks}
                  prefix={<WarningOutlined style={{ color: '#faad14' }} />}
                  valueStyle={{ color: '#faad14', fontWeight: 700, fontSize: '28px' }}
                />
              </Card>
            </motion.div>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <Card
                style={{
                  borderRadius: '16px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                  border: 'none',
                  background: 'linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)',
                }}
              >
                <Statistic
                  title={
                    <span style={{ color: '#64748b', fontWeight: 500 }}>
                      Cột mốc quan trọng
                    </span>
                  }
                  value={assignedTasks.criticalMilestones}
                  prefix={<StarOutlined style={{ color: '#52c41a' }} />}
                  valueStyle={{ color: '#52c41a', fontWeight: 700, fontSize: '28px' }}
                />
              </Card>
            </motion.div>
          </Col>
        </Row>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card
            style={{
              borderRadius: '20px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              border: 'none',
              background: 'linear-gradient(135deg, #ffffff 0%, rgba(248, 250, 252, 0.8) 100%)',
            }}
          >
            <div style={{ padding: '24px' }}>
              <Typography.Title
                level={3}
                style={{
                  margin: 0,
                  marginBottom: '24px',
                  color: '#1e293b',
                  fontWeight: 700,
                }}
              >
                Thao tác nhanh
              </Typography.Title>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={8}>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      type="primary"
                      size="large"
                      icon={<ExclamationCircleFilled />}
                      onClick={() => navigate('/employee/incidents/report')}
                      block
                      style={{
                        height: '64px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)',
                        border: 'none',
                        fontWeight: 600,
                        fontSize: '16px',
                        boxShadow: '0 4px 12px rgba(255, 77, 79, 0.3)',
                      }}
                    >
                      Báo cáo sự cố
                    </Button>
                  </motion.div>
                </Col>
                <Col xs={24} sm={8}>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      type="primary"
                      size="large"
                      icon={<BookOutlined />}
                      onClick={() => navigate('/employee/training')}
                      block
                      style={{
                        height: '64px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)',
                        border: 'none',
                        fontWeight: 600,
                        fontSize: '16px',
                        boxShadow: '0 4px 12px rgba(24, 144, 255, 0.3)',
                      }}
                    >
                      Đào tạo
                    </Button>
                  </motion.div>
                </Col>
                <Col xs={24} sm={8}>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      type="primary"
                      size="large"
                      icon={<SafetyOutlined />}
                      onClick={() => navigate('/employee/ppe')}
                      block
                      style={{
                        height: '64px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                        border: 'none',
                        fontWeight: 600,
                        fontSize: '16px',
                        boxShadow: '0 4px 12px rgba(82, 196, 26, 0.3)',
                      }}
                    >
                      PPE cá nhân
                    </Button>
                  </motion.div>
                </Col>
              </Row>
            </div>
          </Card>
        </motion.div>
      </motion.div>

      {/* Notification Panel */}
      {isNotificationPanelOpen && (
        <NotificationPanel
          isOpen={isNotificationPanelOpen}
          onClose={() => setIsNotificationPanelOpen(false)}
        />
      )}
    </EmployeeLayout>
  );
};

export default EmployeeDashboard;
