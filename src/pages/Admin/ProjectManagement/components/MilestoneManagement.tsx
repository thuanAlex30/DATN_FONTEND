import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  Card, 
  Button, 
  Typography, 
  Space, 
  Tag, 
  Spin, 
  Alert, 
  Row, 
  Col,
  Empty,
  Tooltip,
  Modal,
  message,
  Input,
  Select,
  DatePicker
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  FlagOutlined,
  CalendarOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import type { RootState } from '../../../../store';
import projectMilestoneService from '../../../../services/projectMilestoneService';
import projectPhaseService from '../../../../services/projectPhaseService';
import type { ProjectMilestone, CreateProjectMilestoneData } from '../../../../services/projectMilestoneService';
import type { ProjectPhase } from '../../../../services/projectPhaseService';
import userService from '../../../../services/userService';

interface MilestoneManagementProps {
  projectId: string;
  onComplete: () => void;
}

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const MilestoneManagement: React.FC<MilestoneManagementProps> = ({ projectId, onComplete }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [milestones, setMilestones] = useState<ProjectMilestone[]>([]);
  const [phases, setPhases] = useState<ProjectPhase[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateMilestone, setShowCreateMilestone] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<ProjectMilestone | null>(null);
  const [filterPhase, setFilterPhase] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');

  const [newMilestone, setNewMilestone] = useState<CreateProjectMilestoneData>({
    milestone_name: '',
    description: '',
    milestone_type: 'PHASE_COMPLETION',
    planned_date: '',
    phase_id: '',
    responsible_user_id: '',
    is_critical: false,
    completion_criteria: ''
  });

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [milestonesData, phasesData, usersData] = await Promise.all([
        projectMilestoneService.getProjectMilestones(projectId),
        projectPhaseService.getProjectPhases(projectId),
        userService.getUsers()
      ]);

      setMilestones(milestonesData);
      setPhases(phasesData);
      setUsers(usersData);
    } catch (err) {
      setError('Không thể tải dữ liệu milestone');
      console.error('Error loading milestone data:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNewMilestone({
      milestone_name: '',
      description: '',
      milestone_type: 'PHASE_COMPLETION',
      planned_date: '',
      phase_id: '',
      responsible_user_id: '',
      is_critical: false,
      completion_criteria: ''
    });
  };

  const handleCreateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await projectMilestoneService.createMilestone(projectId, newMilestone);
      message.success('Milestone đã được tạo thành công');
      await loadData();
      setShowCreateMilestone(false);
      resetForm();
    } catch (err) {
      message.error('Không thể tạo milestone');
      console.error('Error creating milestone:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMilestone) return;
    
    setLoading(true);
    try {
      await projectMilestoneService.updateMilestone(editingMilestone._id, newMilestone);
      message.success('Milestone đã được cập nhật thành công');
      await loadData();
      setShowCreateMilestone(false);
      setEditingMilestone(null);
      resetForm();
    } catch (err) {
      message.error('Không thể cập nhật milestone');
      console.error('Error updating milestone:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMilestone = async (id: string) => {
    Modal.confirm({
      title: 'Xác nhận xóa milestone',
      content: 'Bạn có chắc chắn muốn xóa milestone này? Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await projectMilestoneService.deleteMilestone(id);
          message.success('Milestone đã được xóa thành công');
          await loadData();
        } catch (err) {
          message.error('Không thể xóa milestone');
          console.error('Error deleting milestone:', err);
        }
      },
    });
  };

  const handleCompleteMilestone = async (id: string) => {
    try {
      await projectMilestoneService.updateMilestone(id, { 
        status: 'COMPLETED',
        actual_date: new Date().toISOString().split('T')[0]
      });
      message.success('Milestone đã được đánh dấu hoàn thành');
      await loadData();
    } catch (err) {
      message.error('Không thể cập nhật milestone');
      console.error('Error completing milestone:', err);
    }
  };

  const handleEditMilestone = (milestone: ProjectMilestone) => {
    setEditingMilestone(milestone);
    setNewMilestone({
      milestone_name: milestone.milestone_name,
      description: milestone.description || '',
      milestone_type: milestone.milestone_type,
      planned_date: milestone.planned_date,
      phase_id: milestone.phase_id || '',
      responsible_user_id: milestone.responsible_user_id || '',
      is_critical: milestone.is_critical,
      completion_criteria: milestone.completion_criteria || ''
    });
    setShowCreateMilestone(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Chờ thực hiện';
      case 'IN_PROGRESS': return 'Đang thực hiện';
      case 'COMPLETED': return 'Hoàn thành';
      case 'CANCELLED': return 'Đã hủy';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'orange';
      case 'IN_PROGRESS': return 'blue';
      case 'COMPLETED': return 'green';
      case 'CANCELLED': return 'red';
      default: return 'default';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'PHASE_COMPLETION': return 'Hoàn thành giai đoạn';
      case 'DELIVERY': return 'Bàn giao';
      case 'APPROVAL': return 'Phê duyệt';
      case 'REVIEW': return 'Đánh giá';
      case 'CHECKPOINT': return 'Điểm kiểm tra';
      default: return type;
    }
  };

  const isOverdue = (plannedDate: string, status: string) => {
    if (status === 'COMPLETED') return false;
    return new Date(plannedDate) < new Date();
  };

  const filteredMilestones = milestones.filter(milestone => {
    if (filterPhase && milestone.phase_id !== filterPhase) return false;
    if (filterStatus && milestone.status !== filterStatus) return false;
    if (filterType && milestone.milestone_type !== filterType) return false;
    return true;
  });

  const milestoneStats = {
    total: milestones.length,
    pending: milestones.filter(m => m.status === 'PENDING').length,
    inProgress: milestones.filter(m => m.status === 'IN_PROGRESS').length,
    completed: milestones.filter(m => m.status === 'COMPLETED').length,
    overdue: milestones.filter(m => isOverdue(m.planned_date, m.status)).length,
    critical: milestones.filter(m => m.is_critical).length
  };

  return (
    <motion.div 
      style={{ padding: '24px' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header Section */}
      <Card style={{ marginBottom: '24px' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space direction="vertical" size={0}>
              <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FlagOutlined style={{ color: '#1890ff' }} />
                Quản lý Milestone
              </Title>
              <Text type="secondary">
                Xác định và theo dõi các milestone quan trọng của dự án
              </Text>
            </Space>
          </Col>
          <Col>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => setShowCreateMilestone(true)}
            >
              Thêm milestone
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert
          message="Lỗi"
          description={error}
          type="error"
          showIcon
          closable
          onClose={() => setError(null)}
          style={{ marginBottom: '24px' }}
        />
      )}

      {/* Statistics Section */}
      <Card style={{ marginBottom: '24px' }}>
        <Title level={3} style={{ marginBottom: '16px' }}>Thống kê Milestone</Title>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card size="small" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', color: '#1890ff', marginBottom: '8px' }}>
                <FlagOutlined />
              </div>
              <Text strong>Tổng milestone</Text>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1890ff' }}>
                {milestoneStats.total}
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card size="small" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', color: '#faad14', marginBottom: '8px' }}>
                <ClockCircleOutlined />
              </div>
              <Text strong>Chờ thực hiện</Text>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#faad14' }}>
                {milestoneStats.pending}
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card size="small" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', color: '#1890ff', marginBottom: '8px' }}>
                <ClockCircleOutlined />
              </div>
              <Text strong>Đang thực hiện</Text>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1890ff' }}>
                {milestoneStats.inProgress}
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card size="small" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', color: '#52c41a', marginBottom: '8px' }}>
                <CheckCircleOutlined />
              </div>
              <Text strong>Hoàn thành</Text>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#52c41a' }}>
                {milestoneStats.completed}
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card size="small" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', color: '#ff4d4f', marginBottom: '8px' }}>
                <ExclamationCircleOutlined />
              </div>
              <Text strong>Quá hạn</Text>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ff4d4f' }}>
                {milestoneStats.overdue}
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card size="small" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', color: '#fa8c16', marginBottom: '8px' }}>
                <FlagOutlined />
              </div>
              <Text strong>Quan trọng</Text>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#fa8c16' }}>
                {milestoneStats.critical}
              </div>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* Filters Section */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <div style={{ marginBottom: '8px' }}>
              <Text strong>Giai đoạn:</Text>
            </div>
            <Select
              value={filterPhase}
              onChange={setFilterPhase}
              style={{ width: '100%' }}
              placeholder="Tất cả giai đoạn"
              allowClear
            >
              {phases.map(phase => (
                <Option key={phase._id} value={phase._id}>
                  {phase.phase_name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={8}>
            <div style={{ marginBottom: '8px' }}>
              <Text strong>Trạng thái:</Text>
            </div>
            <Select
              value={filterStatus}
              onChange={setFilterStatus}
              style={{ width: '100%' }}
              placeholder="Tất cả trạng thái"
              allowClear
            >
              <Option value="PENDING">Chờ thực hiện</Option>
              <Option value="IN_PROGRESS">Đang thực hiện</Option>
              <Option value="COMPLETED">Hoàn thành</Option>
              <Option value="CANCELLED">Đã hủy</Option>
            </Select>
          </Col>
          <Col xs={24} sm={8}>
            <div style={{ marginBottom: '8px' }}>
              <Text strong>Loại:</Text>
            </div>
            <Select
              value={filterType}
              onChange={setFilterType}
              style={{ width: '100%' }}
              placeholder="Tất cả loại"
              allowClear
            >
              <Option value="PHASE_COMPLETION">Hoàn thành giai đoạn</Option>
              <Option value="DELIVERY">Bàn giao</Option>
              <Option value="APPROVAL">Phê duyệt</Option>
              <Option value="REVIEW">Đánh giá</Option>
              <Option value="CHECKPOINT">Điểm kiểm tra</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Milestones List */}
      <Card>
        <Title level={3} style={{ marginBottom: '16px' }}>Danh sách Milestone</Title>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
            <div style={{ marginTop: '16px' }}>
              <Text>Đang tải danh sách milestone...</Text>
            </div>
          </div>
        ) : filteredMilestones.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Space direction="vertical" size="middle">
                <Title level={4} style={{ color: '#8c8c8c' }}>
                  Chưa có milestone nào
                </Title>
                <Text type="secondary">
                  Hãy tạo milestone đầu tiên để bắt đầu theo dõi tiến độ dự án.
                </Text>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => setShowCreateMilestone(true)}
                >
                  Tạo Milestone Đầu Tiên
                </Button>
              </Space>
            }
          />
        ) : (
          <Row gutter={[16, 16]}>
            {filteredMilestones.map((milestone) => {
              const isOverdueMilestone = isOverdue(milestone.planned_date, milestone.status);
              return (
                <Col key={milestone._id} xs={24} sm={24} md={12} lg={8}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card
                      hoverable
                      style={{
                        border: milestone.is_critical ? '2px solid #fa8c16' : 
                               isOverdueMilestone ? '2px solid #ff4d4f' : undefined
                      }}
                      actions={[
                        <Tooltip key="complete" title="Đánh dấu hoàn thành">
                          <Button 
                            type="text" 
                            icon={<CheckCircleOutlined />}
                            onClick={() => handleCompleteMilestone(milestone._id)}
                            disabled={milestone.status !== 'PENDING'}
                          />
                        </Tooltip>,
                        <Tooltip key="edit" title="Chỉnh sửa">
                          <Button 
                            type="text" 
                            icon={<EditOutlined />}
                            onClick={() => handleEditMilestone(milestone)}
                          />
                        </Tooltip>,
                        <Tooltip key="delete" title="Xóa">
                          <Button 
                            type="text" 
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleDeleteMilestone(milestone._id)}
                          />
                        </Tooltip>
                      ]}
                      extra={
                        <Space>
                          <Tag color={milestone.is_critical ? 'orange' : 'default'}>
                            {milestone.is_critical ? 'Quan trọng' : 'Bình thường'}
                          </Tag>
                          <Tag color={getStatusColor(milestone.status)}>
                            {getStatusLabel(milestone.status)}
                          </Tag>
                        </Space>
                      }
                    >
                      <Card.Meta
                        avatar={
                          <div style={{ 
                            width: '40px', 
                            height: '40px', 
                            borderRadius: '50%', 
                            background: milestone.is_critical ? '#fa8c16' : '#1890ff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <FlagOutlined style={{ color: 'white', fontSize: '20px' }} />
                          </div>
                        }
                        title={
                          <Space>
                            <Text strong>{milestone.milestone_name}</Text>
                            {milestone.is_critical && <Tag color="orange">Quan trọng</Tag>}
                          </Space>
                        }
                        description={
                          <Space direction="vertical" size="small" style={{ width: '100%' }}>
                            <Paragraph 
                              ellipsis={{ rows: 2 }} 
                              style={{ margin: 0, color: '#8c8c8c' }}
                            >
                              {milestone.description || 'Không có mô tả'}
                            </Paragraph>
                            
                            <Space direction="vertical" size="small" style={{ width: '100%' }}>
                              <Space>
                                <CalendarOutlined style={{ color: '#1890ff' }} />
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                  Ngày dự kiến: {formatDate(milestone.planned_date)}
                                </Text>
                              </Space>
                              
                              {milestone.actual_date && (
                                <Space>
                                  <CheckCircleOutlined style={{ color: '#52c41a' }} />
                                  <Text type="secondary" style={{ fontSize: '12px' }}>
                                    Hoàn thành: {formatDate(milestone.actual_date)}
                                  </Text>
                                </Space>
                              )}
                              
                              <Space>
                                <UserOutlined style={{ color: '#1890ff' }} />
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                  Phụ trách: {milestone.responsible_user?.full_name || 'Chưa gán'}
                                </Text>
                              </Space>
                              
                              <Space>
                                <FlagOutlined style={{ color: '#1890ff' }} />
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                  Giai đoạn: {milestone.phase?.phase_name || 'Chưa gán'}
                                </Text>
                              </Space>
                            </Space>
                            
                            {milestone.completion_criteria && (
                              <Card 
                                size="small" 
                                style={{ 
                                  marginTop: '8px',
                                  background: '#f6ffed',
                                  border: '1px solid #b7eb8f'
                                }}
                              >
                                <Text strong style={{ fontSize: '12px', color: '#52c41a' }}>
                                  Tiêu chí hoàn thành:
                                </Text>
                                <Paragraph 
                                  style={{ margin: '4px 0 0 0', fontSize: '12px' }}
                                  ellipsis={{ rows: 2 }}
                                >
                                  {milestone.completion_criteria}
                                </Paragraph>
                              </Card>
                            )}
                            
                            {isOverdueMilestone && (
                              <Alert
                                message="Milestone này đã quá hạn!"
                                type="error"
                                size="small"
                                icon={<ExclamationCircleOutlined />}
                              />
                            )}
                          </Space>
                        }
                      />
                    </Card>
                  </motion.div>
                </Col>
              );
            })}
          </Row>
        )}
      </Card>

      {/* Create/Edit Milestone Modal */}
      <Modal
        title={editingMilestone ? 'Chỉnh sửa Milestone' : 'Tạo Milestone Mới'}
        open={showCreateMilestone}
        onCancel={() => {
          setShowCreateMilestone(false);
          setEditingMilestone(null);
          resetForm();
        }}
        footer={null}
        width={800}
      >
        <form onSubmit={editingMilestone ? handleUpdateMilestone : handleCreateMilestone}>
          <Row gutter={16}>
            <Col span={12}>
              <div style={{ marginBottom: '16px' }}>
                <Text strong>Tên Milestone *</Text>
                <Input
                  value={newMilestone.milestone_name}
                  onChange={(e) => setNewMilestone({ ...newMilestone, milestone_name: e.target.value })}
                  required
                />
              </div>
            </Col>
            <Col span={12}>
              <div style={{ marginBottom: '16px' }}>
                <Text strong>Loại Milestone</Text>
                <Select
                  value={newMilestone.milestone_type}
                  onChange={(value) => setNewMilestone({ ...newMilestone, milestone_type: value })}
                  style={{ width: '100%' }}
                >
                  <Option value="PHASE_COMPLETION">Hoàn thành giai đoạn</Option>
                  <Option value="DELIVERY">Bàn giao</Option>
                  <Option value="APPROVAL">Phê duyệt</Option>
                  <Option value="REVIEW">Đánh giá</Option>
                  <Option value="CHECKPOINT">Điểm kiểm tra</Option>
                </Select>
              </div>
            </Col>
            <Col span={12}>
              <div style={{ marginBottom: '16px' }}>
                <Text strong>Giai đoạn</Text>
                <Select
                  value={newMilestone.phase_id}
                  onChange={(value) => setNewMilestone({ ...newMilestone, phase_id: value })}
                  style={{ width: '100%' }}
                  placeholder="Chọn giai đoạn"
                  allowClear
                >
                  {phases.map(phase => (
                    <Option key={phase._id} value={phase._id}>
                      {phase.phase_name}
                    </Option>
                  ))}
                </Select>
              </div>
            </Col>
            <Col span={12}>
              <div style={{ marginBottom: '16px' }}>
                <Text strong>Người phụ trách</Text>
                <Select
                  value={newMilestone.responsible_user_id}
                  onChange={(value) => setNewMilestone({ ...newMilestone, responsible_user_id: value })}
                  style={{ width: '100%' }}
                  placeholder="Chọn người phụ trách"
                  allowClear
                >
                  {users.map(user => (
                    <Option key={user._id} value={user._id}>
                      {user.full_name}
                    </Option>
                  ))}
                </Select>
              </div>
            </Col>
            <Col span={12}>
              <div style={{ marginBottom: '16px' }}>
                <Text strong>Ngày dự kiến hoàn thành *</Text>
                <DatePicker
                  value={newMilestone.planned_date ? new Date(newMilestone.planned_date) : null}
                  onChange={(date) => setNewMilestone({ 
                    ...newMilestone, 
                    planned_date: date ? date.format('YYYY-MM-DD') : '' 
                  })}
                  style={{ width: '100%' }}
                />
              </div>
            </Col>
            <Col span={12}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={newMilestone.is_critical}
                    onChange={(e) => setNewMilestone({ ...newMilestone, is_critical: e.target.checked })}
                  />
                  <Text strong>Milestone quan trọng</Text>
                </label>
              </div>
            </Col>
            <Col span={24}>
              <div style={{ marginBottom: '16px' }}>
                <Text strong>Mô tả</Text>
                <TextArea
                  value={newMilestone.description}
                  onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                  rows={3}
                />
              </div>
            </Col>
            <Col span={24}>
              <div style={{ marginBottom: '16px' }}>
                <Text strong>Tiêu chí hoàn thành</Text>
                <TextArea
                  value={newMilestone.completion_criteria}
                  onChange={(e) => setNewMilestone({ ...newMilestone, completion_criteria: e.target.value })}
                  rows={3}
                />
              </div>
            </Col>
          </Row>
          
          <div style={{ textAlign: 'right', marginTop: '24px' }}>
            <Space>
              <Button
                onClick={() => {
                  setShowCreateMilestone(false);
                  setEditingMilestone(null);
                  resetForm();
                }}
              >
                Hủy
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
              >
                {editingMilestone ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </Space>
          </div>
        </form>
      </Modal>

      {/* Action Buttons */}
      <div style={{ textAlign: 'center', marginTop: '24px' }}>
        <Button 
          type="primary" 
          size="large"
          icon={<CheckCircleOutlined />}
          onClick={onComplete}
        >
          Hoàn thành Quản lý Milestone
        </Button>
      </div>
    </motion.div>
  );
};

export default MilestoneManagement;