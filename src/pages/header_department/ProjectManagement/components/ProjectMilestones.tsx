import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Card,
  Row,
  Col,
  Button,
  Typography,
  Space,
  Tag,
  Progress,
  Avatar,
  Tooltip,
  Dropdown,
  Empty,
  Spin,
  Alert,
  Select,
  Statistic,
  Badge,
  Modal,
  message,
  Image
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
  ExclamationCircleOutlined,
  MoreOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  EyeOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import type { RootState, AppDispatch } from '../../../../store';
import { fetchProjectMilestones, deleteMilestone } from '../../../../store/slices/projectMilestoneSlice';
import CreateMilestoneModal from './CreateMilestoneModal';
import { projectMilestoneService } from '../../../../services/projectMilestoneService';
import dayjs from 'dayjs';

interface ProjectMilestonesProps {
  projectId: string;
}

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const ProjectMilestones: React.FC<ProjectMilestonesProps> = ({ projectId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { milestones, loading, error } = useSelector((state: RootState) => state.projectMilestone);
  const [selectedView, setSelectedView] = useState<'grid' | 'list'>('grid');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<any>(null);
  const [milestoneProgressLogs, setMilestoneProgressLogs] = useState<any[]>([]);
  const [loadingMilestoneLogs, setLoadingMilestoneLogs] = useState(false);

  useEffect(() => {
    if (projectId) {
      dispatch(fetchProjectMilestones(projectId));
    }
  }, [dispatch, projectId]);



  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return { 
          color: 'success',
          label: 'Hoàn thành', 
          icon: <CheckCircleOutlined />
        };
      case 'IN_PROGRESS':
        return { 
          color: 'processing',
          label: 'Đang thực hiện', 
          icon: <ClockCircleOutlined />
        };
      case 'PENDING':
        return { 
          color: 'warning',
          label: 'Chờ thực hiện', 
          icon: <ClockCircleOutlined />
        };
      case 'CANCELLED':
        return { 
          color: 'error',
          label: 'Đã hủy', 
          icon: <ExclamationCircleOutlined />
        };
      case 'OVERDUE':
        return { 
          color: 'error',
          label: 'Quá hạn', 
          icon: <ExclamationCircleOutlined />
        };
      default:
        return { 
          color: 'default',
          label: status, 
          icon: <ClockCircleOutlined />
        };
    }
  };

  const getProgressFromStatus = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 100;
      case 'IN_PROGRESS':
        return 50;
      case 'PLANNED':
        return 0;
      case 'CANCELLED':
        return 0;
      case 'OVERDUE':
        return 75;
      default:
        return 0;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getMilestoneTypeInfo = (type: string) => {
    switch (type) {
      case 'PHASE_COMPLETION':
        return { label: 'Hoàn thành giai đoạn', icon: <FlagOutlined />, color: '#8b5cf6' };
      case 'DELIVERY':
        return { label: 'Bàn giao', icon: <FlagOutlined />, color: '#06b6d4' };
      case 'APPROVAL':
        return { label: 'Phê duyệt', icon: <CheckCircleOutlined />, color: '#10b981' };
      case 'REVIEW':
        return { label: 'Đánh giá', icon: <FlagOutlined />, color: '#f59e0b' };
      case 'CHECKPOINT':
        return { label: 'Điểm kiểm tra', icon: <FlagOutlined />, color: '#ef4444' };
      default:
        return { label: type, icon: <FlagOutlined />, color: '#6b7280' };
    }
  };

  const filteredMilestones = milestones?.filter(milestone => 
    filterStatus === 'all' || milestone.status === filterStatus
  ) || [];

  if (loading) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <Spin size="large" />
        <Title level={3} style={{ marginTop: '20px' }}>
          Đang tải danh sách milestone...
        </Title>
        <Text type="secondary">Vui lòng chờ trong giây lát</Text>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px' }}>
        <Alert
          message="Không thể tải milestone"
          description={error}
          type="error"
          showIcon
          action={
            <Button 
              size="small" 
              danger 
              onClick={() => dispatch(fetchProjectMilestones(projectId))}
            >
              Thử lại
            </Button>
          }
        />
      </div>
    );
  }

  const handleDeleteConfirm = (id: string) => {
    Modal.confirm({
      title: 'Xác nhận xóa milestone',
      content: 'Bạn có chắc chắn muốn xóa milestone này? Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk() {
        dispatch(deleteMilestone(id));
        message.success('Milestone đã được xóa thành công');
      },
    });
  };

  const handleViewMilestone = async (milestone: any) => {
    setSelectedMilestone(milestone);
    setViewModalVisible(true);
    
    // Load progress logs
    const milestoneId = milestone.id || milestone._id;
    if (milestoneId) {
      setLoadingMilestoneLogs(true);
      try {
        const response = await projectMilestoneService.getMilestoneProgressLogs(milestoneId);
        if (response.success && response.data) {
          setMilestoneProgressLogs(response.data);
        } else {
          setMilestoneProgressLogs([]);
        }
      } catch (error: any) {
        console.error('Error loading milestone progress logs:', error);
        setMilestoneProgressLogs([]);
      } finally {
        setLoadingMilestoneLogs(false);
      }
    }
  };

  const handleEditMilestone = (milestone: any) => {
    // TODO: Implement edit milestone functionality
    // For now, show a message that editing is not yet fully implemented
    message.info('Chức năng chỉnh sửa milestone đang được phát triển. Vui lòng sử dụng chức năng xem chi tiết.');
    // Alternatively, you can open the view modal for now
    // handleViewMilestone(milestone);
  };

  const menu = (milestoneId: string, milestone: any) => [
    {
      key: 'view',
      label: 'Xem chi tiết',
      icon: <EyeOutlined />,
      onClick: () => handleViewMilestone(milestone),
    },
    {
      key: 'edit',
      label: 'Chỉnh sửa',
      icon: <EditOutlined />,
      onClick: () => handleEditMilestone(milestone),
    },
    {
      key: 'delete',
      label: 'Xóa',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => handleDeleteConfirm(milestoneId),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* Header Section */}
      <div style={{ marginBottom: '24px' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space direction="vertical" size={0}>
              <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FlagOutlined style={{ color: '#1890ff' }} />
                Milestone Dự án
              </Title>
              <Text type="secondary">
                Quản lý và theo dõi các mốc quan trọng của dự án
              </Text>
            </Space>
          </Col>
          <Col>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => setShowCreateModal(true)}
            >
              Thêm milestone
            </Button>
          </Col>
        </Row>
      </div>

      {/* Controls Section */}
      <Card style={{ marginBottom: '24px' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space size="large">
              <Space.Compact>
                <Button 
                  type={selectedView === 'grid' ? 'primary' : 'default'}
                  icon={<AppstoreOutlined />}
                  onClick={() => setSelectedView('grid')}
                >
                  Lưới
                </Button>
                <Button 
                  type={selectedView === 'list' ? 'primary' : 'default'}
                  icon={<UnorderedListOutlined />}
                  onClick={() => setSelectedView('list')}
                >
                  Danh sách
                </Button>
              </Space.Compact>
              
              <Select
                value={filterStatus}
                onChange={setFilterStatus}
                style={{ width: 200 }}
                placeholder="Lọc theo trạng thái"
              >
                <Option value="all">Tất cả trạng thái</Option>
                <Option value="PENDING">Chờ thực hiện</Option>
                <Option value="IN_PROGRESS">Đang thực hiện</Option>
                <Option value="COMPLETED">Hoàn thành</Option>
                <Option value="OVERDUE">Quá hạn</Option>
                <Option value="CANCELLED">Đã hủy</Option>
              </Select>
            </Space>
          </Col>
          
          <Col>
            <Space size="large">
              <Statistic 
                title="Tổng milestone" 
                value={filteredMilestones.length} 
                prefix={<FlagOutlined />}
              />
              <Statistic 
                title="Đã hoàn thành" 
                value={filteredMilestones.filter(m => m.status === 'COMPLETED').length}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Content Section */}
      {milestones?.length === 0 ? (
        <Card>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Space direction="vertical" size="middle">
                <Title level={4} style={{ color: '#8c8c8c' }}>
                  Chưa có milestone nào
                </Title>
                <Text type="secondary">
                  Dự án này chưa có milestone nào được tạo. Hãy tạo milestone đầu tiên để bắt đầu theo dõi tiến độ.
                </Text>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setShowCreateModal(true)}
                  title="Tạo milestone mới"
                >
                  Tạo milestone đầu tiên
                </Button>
              </Space>
            }
          />
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {filteredMilestones.map((milestone) => {
            const statusInfo = getStatusInfo(milestone.status);
            const typeInfo = getMilestoneTypeInfo(milestone.milestone_type);
            const progress = milestone.progress || getProgressFromStatus(milestone.status);
            
            const milestoneId = milestone.id || (milestone as any)._id;
            
            return (
              <Col 
                key={milestoneId} 
                xs={24} 
                sm={24} 
                md={selectedView === 'grid' ? 12 : 24} 
                lg={selectedView === 'grid' ? 8 : 24}
                xl={selectedView === 'grid' ? 6 : 24}
              >
                <Card
                  hoverable
                  actions={[
                    <Tooltip key={`edit-${milestoneId}`} title="Chỉnh sửa">
                      <Button 
                        type="text" 
                        icon={<EditOutlined />} 
                        onClick={() => handleEditMilestone(milestone)}
                        title="Chỉnh sửa milestone"
                      />
                    </Tooltip>,
                    <Dropdown key={`more-${milestoneId}`} menu={{ items: menu(milestoneId, milestone) }} trigger={['click']}>
                      <Button type="text" icon={<MoreOutlined />} />
                    </Dropdown>
                  ]}
                  extra={
                    <Tag color={statusInfo.color} icon={statusInfo.icon}>
                      {statusInfo.label}
                    </Tag>
                  }
                >
                  <Card.Meta
                    avatar={
                      <Avatar 
                        icon={typeInfo.icon} 
                        style={{ backgroundColor: typeInfo.color }}
                      />
                    }
                    title={
                      <Space>
                        <Text strong>{milestone.milestone_name}</Text>
                        {milestone.is_critical && (
                          <Badge status="error" text="Quan trọng" />
                        )}
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        <Paragraph 
                          ellipsis={{ rows: 2 }} 
                          style={{ margin: 0, color: '#8c8c8c' }}
                        >
                          {milestone.description || 'Không có mô tả chi tiết'}
                        </Paragraph>
                        
                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                          <Space>
                            <CalendarOutlined style={{ color: '#1890ff' }} />
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              Ngày dự kiến: {formatDate(milestone.planned_date)}
                            </Text>
                          </Space>
                          
                          {(milestone as any).actual_date && (
                            <Space>
                              <CheckCircleOutlined style={{ color: '#52c41a' }} />
                              <Text type="secondary" style={{ fontSize: '12px' }}>
                                Hoàn thành: {formatDate((milestone as any).actual_date)}
                              </Text>
                            </Space>
                          )}
                          
                          <Space>
                            <UserOutlined style={{ color: '#1890ff' }} />
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              Phụ trách: {
                                typeof (milestone as any).responsible_user_id === 'object'
                                  ? (milestone as any).responsible_user_id?.full_name || 'Chưa phân công'
                                  : (milestone as any).responsible_user?.full_name || 'Chưa phân công'
                              }
                            </Text>
                          </Space>
                        </Space>
                        
                        <div style={{ marginTop: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              Tiến độ
                            </Text>
                            <Text strong style={{ fontSize: '12px' }}>
                              {progress}%
                            </Text>
                          </div>
                          <Progress 
                            percent={progress} 
                            size="small" 
                            status={progress >= 100 ? 'success' : (statusInfo.color === 'error' ? 'exception' : 'active')}
                            strokeColor={progress >= 100 ? '#52c41a' : (statusInfo.color === 'success' ? '#52c41a' : undefined)}
                          />
                        </div>
                      </Space>
                    }
                  />
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      {/* Create Milestone Modal */}
      <CreateMilestoneModal
        visible={showCreateModal}
        onCancel={() => setShowCreateModal(false)}
        projectId={projectId}
      />

      {/* View Milestone Detail Modal with Progress Logs */}
      <Modal
        title={
          <Space>
            <EyeOutlined />
            <span>Chi tiết cột mốc - {selectedMilestone?.milestone_name}</span>
          </Space>
        }
        open={viewModalVisible}
        onCancel={() => {
          setViewModalVisible(false);
          setSelectedMilestone(null);
          setMilestoneProgressLogs([]);
        }}
        footer={[
          <Button key="close" onClick={() => {
            setViewModalVisible(false);
            setSelectedMilestone(null);
            setMilestoneProgressLogs([]);
          }}>
            Đóng
          </Button>
        ]}
        width={800}
      >
        {selectedMilestone && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Title level={5}>{selectedMilestone.milestone_name}</Title>
                <Text>{selectedMilestone.description || 'Không có mô tả'}</Text>
              </Col>
              
              <Col span={12}>
                <Text strong>Trạng thái:</Text>
                <br />
                <Tag color={getStatusInfo(selectedMilestone.status || '').color}>
                  {getStatusInfo(selectedMilestone.status || '').label}
                </Tag>
              </Col>
              
              <Col span={12}>
                <Text strong>Ngày dự kiến:</Text>
                <br />
                <Text>{dayjs(selectedMilestone.planned_date).format('DD/MM/YYYY')}</Text>
              </Col>
              
              <Col span={12}>
                <Text strong>Người phụ trách:</Text>
                <br />
                <Text>
                  {typeof selectedMilestone.responsible_user_id === 'object'
                    ? selectedMilestone.responsible_user_id?.full_name || 'Chưa phân công'
                    : 'Chưa phân công'}
                </Text>
              </Col>
              
              <Col span={12}>
                <Text strong>Tiến độ:</Text>
                <br />
                <div style={{ marginTop: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <Text type="secondary" style={{ fontSize: '14px' }}>Tiến độ hiện tại</Text>
                    <Text strong style={{ fontSize: '14px', color: (selectedMilestone.progress || 0) >= 100 ? '#52c41a' : '#1890ff' }}>
                      {(selectedMilestone.progress || 0)}%
                    </Text>
                  </div>
                  <Progress 
                    percent={selectedMilestone.progress || 0} 
                    status={(selectedMilestone.progress || 0) >= 100 ? 'success' : 'active'}
                    strokeColor={(selectedMilestone.progress || 0) >= 100 ? '#52c41a' : '#1890ff'}
                  />
                </div>
              </Col>
              
              {selectedMilestone.completion_criteria && (
                <Col span={24}>
                  <Text strong>Tiêu chí hoàn thành:</Text>
                  <br />
                  <Text>{selectedMilestone.completion_criteria}</Text>
                </Col>
              )}
            </Row>
            
            {/* Lịch sử báo cáo từ Manager */}
            <div style={{ marginTop: '24px', borderTop: '1px solid #f0f0f0', paddingTop: '16px' }}>
              <Title level={5}>
                <HistoryOutlined style={{ marginRight: '8px' }} />
                Lịch sử báo cáo từ Manager
              </Title>
              {loadingMilestoneLogs ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <Spin size="small" />
                </div>
              ) : milestoneProgressLogs.length === 0 ? (
                <Empty description="Chưa có báo cáo nào từ Manager" />
              ) : (
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {milestoneProgressLogs.map((log: any, index: number) => (
                    <Card
                      key={log.id || log._id || index}
                      style={{ marginBottom: '12px', borderRadius: '8px' }}
                      size="small"
                    >
                      <Space direction="vertical" style={{ width: '100%' }} size="small">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Space>
                            <ClockCircleOutlined style={{ color: '#1890ff' }} />
                            <Text strong>
                              {dayjs(log.report_date || log.log_date || log.created_at).format('DD/MM/YYYY HH:mm')}
                            </Text>
                          </Space>
                          <Tag color="blue">{log.progress_percentage || 0}%</Tag>
                        </div>
                        {log.user_id && (
                          <div>
                            <UserOutlined style={{ marginRight: '8px', color: '#8c8c8c' }} />
                            <Text type="secondary">
                              {typeof log.user_id === 'object' 
                                ? log.user_id?.full_name || log.user_id?.email || 'N/A'
                                : 'N/A'}
                            </Text>
                          </div>
                        )}
                        {log.work_description && (
                          <div style={{ marginTop: '8px', padding: '12px', background: '#f5f5f5', borderRadius: '4px' }}>
                            <Text strong style={{ display: 'block', marginBottom: '4px', color: '#1890ff' }}>
                              Ghi chú gửi Header Department:
                            </Text>
                            <Text>{log.work_description}</Text>
                          </div>
                        )}
                        {log.hours_worked > 0 && (
                          <div>
                            <Text type="secondary">Giờ làm việc: {log.hours_worked}h</Text>
                          </div>
                        )}
                        {log.images && Array.isArray(log.images) && log.images.length > 0 && (
                          <div style={{ marginTop: '12px' }}>
                            <Text strong style={{ display: 'block', marginBottom: '8px', color: '#1890ff' }}>
                              Hình ảnh báo cáo:
                            </Text>
                            <Row gutter={[8, 8]}>
                              {log.images.map((imageUrl: string, imgIdx: number) => (
                                <Col key={imgIdx} xs={12} sm={8} md={6}>
                                  <Image
                                    src={imageUrl}
                                    alt={`report-${index}-${imgIdx}`}
                                    style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '4px' }}
                                    preview={{
                                      mask: 'Xem ảnh'
                                    }}
                                  />
                                </Col>
                              ))}
                            </Row>
                          </div>
                        )}
                      </Space>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ProjectMilestones;
