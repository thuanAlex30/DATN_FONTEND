import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Card,
  Row,
  Col,
  Button,
  Tabs,
  Table,
  Tag,
  Progress,
  Statistic,
  message,
  Spin,
  Empty,
  Typography,
  Badge,
  Modal,
  Select
} from 'antd';
import {
  ProjectOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined,
  FlagOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  SafetyOutlined,
  EnvironmentOutlined,
  ToolOutlined,
  CrownOutlined,
  UserOutlined,
  TeamOutlined
} from '@ant-design/icons';
import type { RootState } from '../../../store';
import { EmployeeLayout } from '../../../components/Employee';
import { projectRiskService, type ProjectRisk } from '../../../services/projectRiskService';
import { projectMilestoneService, type ProjectMilestone } from '../../../services/projectMilestoneService';
// import { projectTaskService } from '../../../services/projectTaskService';
// import { projectCommunicationService } from '../../../services/projectCommunicationService';
import projectService from '../../../services/projectService';
import ProjectLeaderManagement from './components/ProjectLeaderManagement';
import TaskResponsibleManagement from './components/TaskResponsibleManagement';
import MilestoneResponsibleManagement from './components/MilestoneResponsibleManagement';
import RiskOwnerManagement from './components/RiskOwnerManagement';
import ProjectMemberManagement from './components/ProjectMemberManagement';
import AddRiskModal from './components/AddRiskModal';
import AddMilestoneModal from './components/AddMilestoneModal';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const EmployeeProjectManagement: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  
  console.log('🔍 EmployeeProjectManagement - User role:', user?.role?.role_name);
  const [activeTab, setActiveTab] = useState<'risks' | 'milestones' | 'project-leaders' | 'task-responsibles' | 'milestone-responsibles' | 'risk-owners' | 'project-members'>('risks');
  const [loading, setLoading] = useState(false);
  const [risks, setRisks] = useState<ProjectRisk[]>([]);
  const [milestones, setMilestones] = useState<ProjectMilestone[]>([]);
  const [selectedRisk, setSelectedRisk] = useState<ProjectRisk | null>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<ProjectMilestone | null>(null);
  const [riskModalVisible, setRiskModalVisible] = useState(false);
  const [milestoneModalVisible, setMilestoneModalVisible] = useState(false);
  const [addRiskModalVisible, setAddRiskModalVisible] = useState(false);
  const [addMilestoneModalVisible, setAddMilestoneModalVisible] = useState(false);
  
  // Project selection state
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [projectLoading, setProjectLoading] = useState(false);

  // Load projects
  const loadProjects = async () => {
    setProjectLoading(true);
    try {
      const result = await projectService.getAllProjects();
      if (result.success) {
        setProjects(result.data || []);
        // Auto-select first project if available
        if (result.data && result.data.length > 0) {
          setSelectedProjectId(result.data[0].id);
        }
      } else {
        message.error(result.message || 'Failed to load projects');
      }
    } catch (error) {
      message.error('Failed to load projects');
    } finally {
      setProjectLoading(false);
    }
  };

  // Load data
  const loadData = async () => {
    if (!user?.id || !selectedProjectId) return;
    
    setLoading(true);
    try {
      // For employee: load assigned risks and milestones for selected project
      if (user.role?.role_name === 'employee') {
        const [risksResult, milestonesResult] = await Promise.all([
          projectRiskService.getAssignedRisks(user.id, selectedProjectId),
          projectMilestoneService.getAssignedMilestones(user.id, selectedProjectId)
        ]);

        if (risksResult.success) {
          setRisks(risksResult.data);
        } else {
          message.error(risksResult.message || 'Failed to load risks');
        }

        if (milestonesResult.success) {
          setMilestones(milestonesResult.data);
        } else {
          message.error(milestonesResult.message || 'Failed to load milestones');
        }
      }
      // For manager: load all risks and milestones for full management access
      else if (user.role?.role_name === 'manager') {
        const [risksResult, milestonesResult] = await Promise.all([
          projectRiskService.getProjectRisks(selectedProjectId), // Get risks for selected project
          projectMilestoneService.getProjectMilestones(selectedProjectId) // Get milestones for selected project
        ]);

        if (risksResult.success) {
          setRisks(risksResult.data);
        } else {
          message.error(risksResult.message || 'Failed to load risks');
        }

        if (milestonesResult.success) {
          setMilestones(milestonesResult.data);
        } else {
          message.error(milestonesResult.message || 'Failed to load milestones');
        }
      }
    } catch (error) {
      message.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      loadData();
    }
  }, [user?.id, selectedProjectId]);

  // Risk category colors
  const getRiskCategoryColor = (category: ProjectRisk['risk_category']) => {
    const colors = {
      SAFETY: 'red',
      SCHEDULE: 'blue',
      TECHNICAL: 'purple',
      ENVIRONMENTAL: 'green'
    };
    return colors[category] || 'default';
  };

  // Risk category icons
  const getRiskCategoryIcon = (category: ProjectRisk['risk_category']) => {
    const icons = {
      SAFETY: <SafetyOutlined />,
      SCHEDULE: <ClockCircleOutlined />,
      TECHNICAL: <ToolOutlined />,
      ENVIRONMENTAL: <EnvironmentOutlined />
    };
    return icons[category] || <ExclamationCircleOutlined />;
  };


  // Handle risk status update
  const handleRiskStatusUpdate = async (riskId: string, status: ProjectRisk['status']) => {
    try {
      const result = await projectRiskService.updateRiskStatus(riskId, status);
      if (result.success) {
        message.success('Risk status updated successfully');
        loadData();
      } else {
        message.error(result.message || 'Failed to update risk status');
      }
    } catch (error) {
      message.error('Failed to update risk status');
    }
  };

  // Handle milestone status update
  const handleMilestoneStatusUpdate = async (milestoneId: string, status: ProjectMilestone['status']) => {
    try {
      const result = await projectMilestoneService.updateMilestoneStatus(milestoneId, status);
      if (result.success) {
        message.success('Milestone status updated successfully');
        loadData();
      } else {
        message.error(result.message || 'Failed to update milestone status');
      }
    } catch (error) {
      message.error('Failed to update milestone status');
    }
  };

  // Manager functions
  const handleDeleteRisk = async (riskId: string) => {
    Modal.confirm({
      title: 'Xác nhận xóa rủi ro',
      content: 'Bạn có chắc chắn muốn xóa rủi ro này?',
      onOk: async () => {
        try {
          const result = await projectRiskService.deleteRisk(riskId);
          if (result.success) {
            message.success('Risk deleted successfully');
            loadData();
          } else {
            message.error(result.message || 'Failed to delete risk');
          }
        } catch (error) {
          message.error('Failed to delete risk');
        }
      },
    });
  };

  const handleDeleteMilestone = async (milestoneId: string) => {
    Modal.confirm({
      title: 'Xác nhận xóa cột mốc',
      content: 'Bạn có chắc chắn muốn xóa cột mốc này?',
      onOk: async () => {
        try {
          const result = await projectMilestoneService.deleteMilestone(milestoneId);
          if (result.success) {
            message.success('Milestone deleted successfully');
            loadData();
          } else {
            message.error(result.message || 'Failed to delete milestone');
          }
        } catch (error) {
          message.error('Failed to delete milestone');
        }
      },
    });
  };

  // Risk columns
  const riskColumns = [
    {
      title: 'Tên rủi ro',
      dataIndex: 'risk_name',
      key: 'risk_name',
      render: (text: string, record: ProjectRisk) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.project_id.project_name}
          </Text>
        </div>
      ),
    },
    {
      title: 'Loại rủi ro',
      dataIndex: 'risk_category',
      key: 'risk_category',
      render: (category: ProjectRisk['risk_category']) => (
        <Tag color={getRiskCategoryColor(category)} icon={getRiskCategoryIcon(category)}>
          {category}
        </Tag>
      ),
    },
    {
      title: 'Điểm rủi ro',
      dataIndex: 'risk_score',
      key: 'risk_score',
      render: (score: number) => (
        <Progress
          percent={Math.round(score * 20)} // Convert to percentage (0-5 scale to 0-100%)
          size="small"
          status={score > 3 ? 'exception' : score > 2 ? 'active' : 'success'}
          format={() => score.toFixed(1)}
        />
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: ProjectRisk['status']) => (
        <Select
          value={status}
          onChange={(newStatus) => handleRiskStatusUpdate(selectedRisk?._id || '', newStatus)}
          style={{ width: 120 }}
        >
          <Option value="IDENTIFIED">Đã xác định</Option>
          <Option value="IN_PROGRESS">Đang xử lý</Option>
          <Option value="RESOLVED">Đã giải quyết</Option>
          <Option value="CLOSED">Đã đóng</Option>
        </Select>
      ),
    },
    {
      title: 'Tác động',
      key: 'impact',
      render: (record: ProjectRisk) => (
        <div>
          <div>
            <DollarOutlined style={{ color: '#ff4d4f' }} />
            <Text style={{ marginLeft: 4 }}>
            </Text>
          </div>
          <div style={{ marginTop: 4 }}>
            <ClockCircleOutlined style={{ color: '#1890ff' }} />
            <Text style={{ marginLeft: 4 }}>
              {record.schedule_impact_days} ngày
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Ngày đích',
      dataIndex: 'target_resolution_date',
      key: 'target_resolution_date',
      render: (date: string) => (
        <Text type={dayjs(date).isBefore(dayjs()) ? 'danger' : 'secondary'}>
          {dayjs(date).format('DD/MM/YYYY')}
        </Text>
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (record: ProjectRisk) => (
        <div>
          <Button
            type="link"
            onClick={() => {
              setSelectedRisk(record);
              setRiskModalVisible(true);
            }}
          >
            Xem chi tiết
          </Button>
          {user?.role?.role_name === 'manager' && (
            <>
              <Button
                type="link"
                danger
                onClick={() => handleDeleteRisk(record._id)}
              >
                Xóa
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  // Milestone columns
  const milestoneColumns = [
    {
      title: 'Tên cột mốc',
      dataIndex: 'milestone_name',
      key: 'milestone_name',
      render: (text: string, record: ProjectMilestone) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.project_id.project_name}
          </Text>
        </div>
      ),
    },
    {
      title: 'Loại cột mốc',
      dataIndex: 'milestone_type',
      key: 'milestone_type',
      render: (type: ProjectMilestone['milestone_type']) => (
        <Tag color="blue">
          {type === 'PHASE_COMPLETION' ? 'Hoàn thành giai đoạn' :
           type === 'DELIVERY' ? 'Giao hàng' :
           type === 'REVIEW' ? 'Đánh giá' : 'Cột mốc'}
        </Tag>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: ProjectMilestone['status']) => (
        <Select
          value={status}
          onChange={(newStatus) => handleMilestoneStatusUpdate(selectedMilestone?.id || '', newStatus)}
          style={{ width: 120 }}
        >
          <Option value="PENDING">Chờ xử lý</Option>
          <Option value="IN_PROGRESS">Đang thực hiện</Option>
          <Option value="COMPLETED">Hoàn thành</Option>
          <Option value="DELAYED">Bị trễ</Option>
        </Select>
      ),
    },
    {
      title: 'Ngày dự kiến',
      dataIndex: 'planned_date',
      key: 'planned_date',
      render: (date: string) => (
        <Text type={dayjs(date).isBefore(dayjs()) ? 'danger' : 'secondary'}>
          {dayjs(date).format('DD/MM/YYYY')}
        </Text>
      ),
    },
    {
      title: 'Quan trọng',
      dataIndex: 'is_critical',
      key: 'is_critical',
      render: (isCritical: boolean) => (
        <Badge
          status={isCritical ? 'error' : 'default'}
          text={isCritical ? 'Quan trọng' : 'Bình thường'}
        />
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (record: ProjectMilestone) => (
        <div>
          <Button
            type="link"
            onClick={() => {
              setSelectedMilestone(record);
              setMilestoneModalVisible(true);
            }}
          >
            Xem chi tiết
          </Button>
          {user?.role?.role_name === 'manager' && (
            <>
              <Button
                type="link"
                danger
                onClick={() => handleDeleteMilestone(record.id)}
              >
                Xóa
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  // Statistics
  const riskStats = {
    total: risks.length,
    identified: risks.filter(r => r.status === 'IDENTIFIED').length,
    inProgress: risks.filter(r => r.status === 'IN_PROGRESS').length,
    resolved: risks.filter(r => r.status === 'RESOLVED').length,
    highRisk: risks.filter(r => r.risk_score > 3).length,
  };

  const milestoneStats = {
    total: milestones.length,
    pending: milestones.filter(m => m.status === 'PENDING').length,
    inProgress: milestones.filter(m => m.status === 'IN_PROGRESS').length,
    completed: milestones.filter(m => m.status === 'COMPLETED').length,
    critical: milestones.filter(m => m.is_critical).length,
  };

  // Test simple render first
  if (!user) {
    return <div>Loading user...</div>;
  }

  // Debug: Show user info
  console.log('🔍 User info:', {
    id: user.id,
    username: user.username,
    role: user.role?.role_name,
    isActive: user.is_active
  });

  // Allow access for manager, leader, and employee roles
  if (!user.role?.role_name || !['manager', 'leader', 'employee'].includes(user.role.role_name)) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Không có quyền truy cập</h2>
        <p>Bạn cần có quyền manager, leader hoặc employee để truy cập trang này.</p>
        <p>Role hiện tại: {user.role?.role_name}</p>
        <p>User ID: {user.id}</p>
        <p>Username: {user.username}</p>
      </div>
    );
  }

  return (
    <EmployeeLayout
      title="Quản lý dự án"
      icon={<ProjectOutlined />}
      headerExtra={
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Select
            placeholder="Chọn dự án"
            value={selectedProjectId}
            onChange={setSelectedProjectId}
            loading={projectLoading}
            style={{ minWidth: 200 }}
            showSearch
            filterOption={(input, option) =>
              (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
            }
          >
            {projects.map(project => (
              <Option key={project.id} value={project.id}>
                {project.project_name}
              </Option>
            ))}
          </Select>
          {user?.role?.role_name === 'manager' && (
            <>
              <Button 
                type="primary"
                icon={<ExclamationCircleOutlined />}
                onClick={() => setAddRiskModalVisible(true)}
              >
                Thêm rủi ro
              </Button>
              <Button 
                type="primary"
                icon={<FlagOutlined />}
                onClick={() => setAddMilestoneModalVisible(true)}
              >
                Thêm cột mốc
              </Button>
            </>
          )}
          <Button 
            type="default"
            icon={<ReloadOutlined />}
            onClick={loadData}
            loading={loading}
          >
            Làm mới
          </Button>
        </div>
      }
    >
      <Spin spinning={loading}>
        <Tabs activeKey={activeTab} onChange={(key) => setActiveTab(key as typeof activeTab)}>
          <TabPane 
            tab={
              <span>
                <ExclamationCircleOutlined />
                Rủi ro dự án ({riskStats.total})
              </span>
            } 
            key="risks"
          >
            {/* Risk Statistics */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
              <Col xs={24} sm={6}>
                <Card>
                  <Statistic
                    title="Tổng rủi ro"
                    value={riskStats.total}
                    prefix={<ExclamationCircleOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={6}>
                <Card>
                  <Statistic
                    title="Đã xác định"
                    value={riskStats.identified}
                    prefix={<WarningOutlined />}
                    valueStyle={{ color: '#faad14' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={6}>
                <Card>
                  <Statistic
                    title="Đang xử lý"
                    value={riskStats.inProgress}
                    prefix={<ClockCircleOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={6}>
                <Card>
                  <Statistic
                    title="Rủi ro cao"
                    value={riskStats.highRisk}
                    prefix={<ExclamationCircleOutlined />}
                    valueStyle={{ color: '#ff4d4f' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* Risk Table */}
            <Card>
              <Table
                columns={riskColumns}
                dataSource={risks}
                rowKey="_id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} rủi ro`,
                }}
                locale={{
                  emptyText: <Empty description="Không có rủi ro nào được giao" />
                }}
              />
            </Card>
          </TabPane>

          <TabPane 
            tab={
              <span>
                <FlagOutlined />
                Cột mốc dự án ({milestoneStats.total})
              </span>
            } 
            key="milestones"
          >
            {/* Milestone Statistics */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
              <Col xs={24} sm={6}>
                <Card>
                  <Statistic
                    title="Tổng cột mốc"
                    value={milestoneStats.total}
                    prefix={<FlagOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={6}>
                <Card>
                  <Statistic
                    title="Chờ xử lý"
                    value={milestoneStats.pending}
                    prefix={<ClockCircleOutlined />}
                    valueStyle={{ color: '#faad14' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={6}>
                <Card>
                  <Statistic
                    title="Đang thực hiện"
                    value={milestoneStats.inProgress}
                    prefix={<ClockCircleOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={6}>
                <Card>
                  <Statistic
                    title="Quan trọng"
                    value={milestoneStats.critical}
                    prefix={<ExclamationCircleOutlined />}
                    valueStyle={{ color: '#ff4d4f' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* Milestone Table */}
            <Card>
              <Table
                columns={milestoneColumns}
                dataSource={milestones}
                rowKey="id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} cột mốc`,
                }}
                locale={{
                  emptyText: <Empty description="Không có cột mốc nào được giao" />
                }}
              />
            </Card>
          </TabPane>

          {/* Manager-only tabs */}
          {user?.role?.role_name === 'manager' && (
            <>
              <TabPane 
                tab={
                  <span>
                    <CrownOutlined />
                    Trưởng dự án
                  </span>
                } 
                key="project-leaders"
              >
                <ProjectLeaderManagement />
              </TabPane>

              <TabPane 
                tab={
                  <span>
                    <UserOutlined />
                    Người phụ trách Task
                  </span>
                } 
                key="task-responsibles"
              >
                <TaskResponsibleManagement projectId={selectedProjectId} />
              </TabPane>

              <TabPane 
                tab={
                  <span>
                    <FlagOutlined />
                    Người phụ trách Cột mốc
                  </span>
                } 
                key="milestone-responsibles"
              >
                <MilestoneResponsibleManagement projectId={selectedProjectId} />
              </TabPane>

              <TabPane 
                tab={
                  <span>
                    <ExclamationCircleOutlined />
                    Người phụ trách Rủi ro
                  </span>
                } 
                key="risk-owners"
              >
                <RiskOwnerManagement projectId={selectedProjectId} />
              </TabPane>

              <TabPane 
                tab={
                  <span>
                    <TeamOutlined />
                    Thành viên dự án
                  </span>
                } 
                key="project-members"
              >
                <ProjectMemberManagement projectId={selectedProjectId} />
              </TabPane>
            </>
          )}
        </Tabs>
      </Spin>

      {/* Risk Detail Modal */}
      <Modal
        title="Chi tiết rủi ro"
        open={riskModalVisible}
        onCancel={() => setRiskModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedRisk && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Title level={4}>{selectedRisk.risk_name}</Title>
                <Text type="secondary">{selectedRisk.project_id.project_name}</Text>
              </Col>
              <Col span={12}>
                <Text strong>Loại rủi ro:</Text>
                <br />
                <Tag color={getRiskCategoryColor(selectedRisk.risk_category)}>
                  {selectedRisk.risk_category}
                </Tag>
              </Col>
              <Col span={12}>
                <Text strong>Điểm rủi ro:</Text>
                <br />
                <Progress
                  percent={Math.round(selectedRisk.risk_score * 20)}
                  status={selectedRisk.risk_score > 3 ? 'exception' : 'success'}
                  format={() => selectedRisk.risk_score.toFixed(1)}
                />
              </Col>
              <Col span={24}>
                <Text strong>Mô tả:</Text>
                <br />
                <Text>{selectedRisk.description}</Text>
              </Col>
              <Col span={24}>
                <Text strong>Kế hoạch giảm thiểu:</Text>
                <br />
                <Text>{selectedRisk.mitigation_plan}</Text>
              </Col>
              <Col span={12}>
                <Text strong>Tác động chi phí:</Text>
                <br />
              </Col>
              <Col span={12}>
                <Text strong>Tác động tiến độ:</Text>
                <br />
                <Text>{selectedRisk.schedule_impact_days} ngày</Text>
              </Col>
              <Col span={12}>
                <Text strong>Ngày xác định:</Text>
                <br />
                <Text>{dayjs(selectedRisk.identified_date).format('DD/MM/YYYY')}</Text>
              </Col>
              <Col span={12}>
                <Text strong>Ngày đích giải quyết:</Text>
                <br />
                <Text type={dayjs(selectedRisk.target_resolution_date).isBefore(dayjs()) ? 'danger' : 'secondary'}>
                  {dayjs(selectedRisk.target_resolution_date).format('DD/MM/YYYY')}
                </Text>
              </Col>
            </Row>
          </div>
        )}
      </Modal>

      {/* Milestone Detail Modal */}
      <Modal
        title="Chi tiết cột mốc"
        open={milestoneModalVisible}
        onCancel={() => setMilestoneModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedMilestone && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Title level={4}>{selectedMilestone.milestone_name}</Title>
                <Text type="secondary">{selectedMilestone.project_id.project_name}</Text>
              </Col>
              <Col span={12}>
                <Text strong>Loại cột mốc:</Text>
                <br />
                <Tag color="blue">
                  {selectedMilestone.milestone_type === 'PHASE_COMPLETION' ? 'Hoàn thành giai đoạn' :
                   selectedMilestone.milestone_type === 'DELIVERY' ? 'Giao hàng' :
                   selectedMilestone.milestone_type === 'REVIEW' ? 'Đánh giá' : 'Cột mốc'}
                </Tag>
              </Col>
              <Col span={12}>
                <Text strong>Quan trọng:</Text>
                <br />
                <Badge
                  status={selectedMilestone.is_critical ? 'error' : 'default'}
                  text={selectedMilestone.is_critical ? 'Quan trọng' : 'Bình thường'}
                />
              </Col>
              <Col span={24}>
                <Text strong>Mô tả:</Text>
                <br />
                <Text>{selectedMilestone.description}</Text>
              </Col>
              <Col span={24}>
                <Text strong>Tiêu chí hoàn thành:</Text>
                <br />
                <Text>{selectedMilestone.completion_criteria}</Text>
              </Col>
              <Col span={12}>
                <Text strong>Ngày dự kiến:</Text>
                <br />
                <Text type={dayjs(selectedMilestone.planned_date).isBefore(dayjs()) ? 'danger' : 'secondary'}>
                  {dayjs(selectedMilestone.planned_date).format('DD/MM/YYYY')}
                </Text>
              </Col>
              <Col span={12}>
                <Text strong>Người tạo:</Text>
                <br />
                <Text>{selectedMilestone.created_by.full_name}</Text>
              </Col>
            </Row>
          </div>
        )}
      </Modal>

      {/* Add Risk Modal */}
      <AddRiskModal
        visible={addRiskModalVisible}
        onCancel={() => setAddRiskModalVisible(false)}
        onSuccess={() => {
          setAddRiskModalVisible(false);
          loadData();
        }}
        projectId={selectedProjectId}
      />

      {/* Add Milestone Modal */}
      <AddMilestoneModal
        visible={addMilestoneModalVisible}
        onCancel={() => setAddMilestoneModalVisible(false)}
        onSuccess={() => {
          setAddMilestoneModalVisible(false);
          loadData();
        }}
        projectId={selectedProjectId}
      />
    </EmployeeLayout>
  );
};

export default EmployeeProjectManagement;
