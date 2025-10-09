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
  message
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
  UnorderedListOutlined
} from '@ant-design/icons';
import type { RootState, AppDispatch } from '../../../../store';
import { fetchProjectMilestones, deleteMilestone } from '../../../../store/slices/projectMilestoneSlice';
import CreateMilestoneModal from './CreateMilestoneModal';

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

  const menu = (milestoneId: string) => [
    {
      key: 'edit',
      label: 'Chỉnh sửa',
      icon: <EditOutlined />,
      disabled: true,
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
                  onClick={() => {}}
                  disabled
                  title="Sắp ra mắt"
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
            const progress = getProgressFromStatus(milestone.status);
            
            return (
              <Col 
                key={milestone._id} 
                xs={24} 
                sm={24} 
                md={selectedView === 'grid' ? 12 : 24} 
                lg={selectedView === 'grid' ? 8 : 24}
                xl={selectedView === 'grid' ? 6 : 24}
              >
                <Card
                  hoverable
                  actions={[
                    <Tooltip key="edit" title="Chỉnh sửa">
                      <Button 
                        type="text" 
                        icon={<EditOutlined />} 
                        disabled
                        title="Sắp ra mắt"
                      />
                    </Tooltip>,
                    <Dropdown key="more" menu={{ items: menu(milestone._id) }} trigger={['click']}>
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
                          <Badge key="critical-badge" status="error" text="Quan trọng" />
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
                          <Space key="planned-date-space">
                            <CalendarOutlined style={{ color: '#1890ff' }} />
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              Ngày dự kiến: {formatDate(milestone.planned_date)}
                            </Text>
                          </Space>
                          
                          {milestone.actual_date && (
                            <Space key="actual-date-space">
                              <CheckCircleOutlined style={{ color: '#52c41a' }} />
                              <Text type="secondary" style={{ fontSize: '12px' }}>
                                Hoàn thành: {formatDate(milestone.actual_date)}
                              </Text>
                            </Space>
                          )}
                          
                          <Space key="responsible-space">
                            <UserOutlined style={{ color: '#1890ff' }} />
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              Phụ trách: {(milestone as any).responsible_user?.full_name || 'Chưa phân công'}
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
                            status={statusInfo.color === 'error' ? 'exception' : 'normal'}
                            strokeColor={statusInfo.color === 'success' ? '#52c41a' : undefined}
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
    </div>
  );
};

export default ProjectMilestones;
