import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
  Progress,
  Image
} from 'antd';
import { projectRiskService } from '../../../../services/projectRiskService';
import dayjs from 'dayjs';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  ExclamationCircleOutlined,
  WarningOutlined,
  UserOutlined,
  CalculatorOutlined,
  ThunderboltOutlined,
  ReloadOutlined,
  EyeOutlined,
  HistoryOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import type { RootState, AppDispatch } from '../../../../store';
import { fetchProjectRisks, createRisk, updateRisk, deleteRisk } from '../../../../store/slices/projectRiskSlice';
import type { ProjectRisk } from '../../../../services/projectRiskService';
import type { CreateRiskData, UpdateRiskData } from '../../../../types/projectRisk';
import RiskFormModal from './RiskFormModal';

interface ProjectRisksProps {
  projectId: string;
}

const { Title, Text, Paragraph } = Typography;

const ProjectRisks: React.FC<ProjectRisksProps> = ({ projectId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { risks, loading, error } = useSelector((state: RootState) => state.projectRisk);
  
  // Modal states
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [editingRisk, setEditingRisk] = useState<ProjectRisk | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedRisk, setSelectedRisk] = useState<ProjectRisk | null>(null);
  const [riskProgressLogs, setRiskProgressLogs] = useState<any[]>([]);
  const [loadingRiskLogs, setLoadingRiskLogs] = useState(false);
  const [confirmingRisk, setConfirmingRisk] = useState(false);

  useEffect(() => {
    if (projectId) {
      console.log('Fetching risks for project:', projectId);
      dispatch(fetchProjectRisks(projectId));
    }
  }, [dispatch, projectId]);

  // Debug logging
  useEffect(() => {
    console.log('Risks state updated:', { risks, loading, error });
  }, [risks, loading, error]);

  const handleCreateRisk = (data: CreateRiskData) => {
    dispatch(createRisk({ ...data, project_id: projectId }));
  };

  const handleUpdateRisk = (id: string, data: UpdateRiskData) => {
    dispatch(updateRisk({ id, data }));
  };

  const handleDeleteRisk = (id: string) => {
    Modal.confirm({
      title: 'Xác nhận xóa rủi ro',
      content: 'Bạn có chắc chắn muốn xóa rủi ro này? Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk() {
        dispatch(deleteRisk(id));
        message.success('Rủi ro đã được xóa thành công');
      },
    });
  };

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setEditingRisk(null);
    setShowRiskModal(true);
  };

  const handleEditRisk = (risk: ProjectRisk) => {
    setModalMode('edit');
    setEditingRisk(risk);
    setShowRiskModal(true);
  };

  const handleModalClose = () => {
    setShowRiskModal(false);
    setEditingRisk(null);
  };

  const handleViewRisk = async (risk: ProjectRisk) => {
    setSelectedRisk(risk);
    setViewModalVisible(true);
    
    // Load progress logs
    const riskId = risk._id || risk.id;
    if (riskId) {
      setLoadingRiskLogs(true);
      try {
        const response = await projectRiskService.getRiskProgressLogs(riskId);
        if (response.success && response.data) {
          setRiskProgressLogs(response.data);
        } else {
          setRiskProgressLogs([]);
        }
      } catch (error: any) {
        console.error('Error loading risk progress logs:', error);
        setRiskProgressLogs([]);
      } finally {
        setLoadingRiskLogs(false);
      }
    }
  };

  const handleConfirmRiskComplete = async () => {
    if (!selectedRisk) return;
    
    const riskId = selectedRisk._id || selectedRisk.id;
    if (!riskId) {
      message.error('Không tìm thấy ID rủi ro');
      return;
    }

    try {
      setConfirmingRisk(true);
      await projectRiskService.updateRiskStatus(riskId, 'RESOLVED');
      message.success('Đã xác nhận hoàn thành rủi ro');
      setViewModalVisible(false);
      setSelectedRisk(null);
      setRiskProgressLogs([]);
      // Refresh risks list
      dispatch(fetchProjectRisks(projectId));
    } catch (error: any) {
      console.error('Error confirming risk complete:', error);
      message.error(error?.response?.data?.message || 'Không thể xác nhận hoàn thành rủi ro');
    } finally {
      setConfirmingRisk(false);
    }
  };

  const getRiskLevelInfo = (level: string) => {
    switch (level) {
      case 'high':
        return { color: 'error', label: 'Cao' };
      case 'medium':
        return { color: 'warning', label: 'Trung bình' };
      case 'low':
        return { color: 'success', label: 'Thấp' };
      default:
        return { color: 'default', label: level };
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'identified':
        return { color: 'blue', label: 'Đã xác định' };
      case 'monitoring':
        return { color: 'orange', label: 'Đang theo dõi' };
      case 'mitigated':
        return { color: 'green', label: 'Đã giảm thiểu' };
      case 'resolved':
        return { color: 'default', label: 'Đã giải quyết' };
      default:
        return { color: 'default', label: status };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <motion.div 
        style={{ 
          padding: '50px', 
          textAlign: 'center',
          minHeight: '300px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <Spin size="large" />
        <Title level={3} style={{ marginTop: '20px' }}>
          Đang tải danh sách rủi ro...
        </Title>
        <Text type="secondary">Vui lòng chờ trong giây lát</Text>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div 
        style={{ padding: '20px' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <Alert
          message="Lỗi tải rủi ro"
          description={error}
          type="error"
          showIcon
          action={
            <Button 
              size="small" 
              danger 
              icon={<ReloadOutlined />}
              onClick={() => dispatch(fetchProjectRisks(projectId))}
            >
              Thử lại
            </Button>
          }
        />
      </motion.div>
    );
  }

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
                <WarningOutlined style={{ color: '#faad14' }} />
                Rủi ro Dự án
              </Title>
              <Text type="secondary">
                Quản lý và theo dõi các rủi ro tiềm ẩn của dự án
              </Text>
            </Space>
          </Col>
          <Col>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleOpenCreateModal}
            >
              Thêm rủi ro
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Content Section */}
      {!risks || risks.length === 0 ? (
        <Card>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Space direction="vertical" size="middle">
                <Title level={4} style={{ color: '#8c8c8c' }}>
                  Chưa có rủi ro nào
                </Title>
                <Text type="secondary">
                  Dự án này chưa có rủi ro nào được xác định. Hãy xác định rủi ro đầu tiên để bắt đầu quản lý.
                </Text>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={handleOpenCreateModal}
                >
                  Xác định rủi ro đầu tiên
                </Button>
              </Space>
            }
          />
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {risks.filter(risk => risk != null).map((risk) => {
            // Convert probability from 0-1 to 1-5 scale for display
            const probabilityValue = risk.probability != null ? Math.round(risk.probability * 5) : 3;
            const probabilityLevel = probabilityValue <= 2 ? 'low' : probabilityValue <= 3 ? 'medium' : 'high';
            const riskLevelInfo = getRiskLevelInfo(probabilityLevel);
            const statusInfo = getStatusInfo(risk.status || '');
            
            return (
              <Col key={risk._id || risk.id} xs={24} sm={24} md={12} lg={8} xl={6}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card
                    hoverable
                    actions={[
                      <Tooltip key="view" title="Xem chi tiết">
                        <Button 
                          type="text" 
                          icon={<EyeOutlined />}
                          onClick={() => handleViewRisk(risk)}
                        />
                      </Tooltip>,
                      <Tooltip key="edit" title="Chỉnh sửa">
                        <Button 
                          type="text" 
                          icon={<EditOutlined />}
                          onClick={() => handleEditRisk(risk)}
                        />
                      </Tooltip>,
                      <Tooltip key="delete" title="Xóa">
                        <Button 
                          type="text" 
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => handleDeleteRisk(risk._id || risk.id)}
                        />
                      </Tooltip>
                    ]}
                    extra={
                      <Space>
                        <Tag color={riskLevelInfo.color}>
                          {riskLevelInfo.label}
                        </Tag>
                        <Tag color={statusInfo.color}>
                          {statusInfo.label}
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
                          background: riskLevelInfo.color === 'error' ? '#ff4d4f' : 
                                     riskLevelInfo.color === 'warning' ? '#faad14' : '#52c41a',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <ExclamationCircleOutlined style={{ color: 'white', fontSize: '20px' }} />
                        </div>
                      }
                      title={
                        <Text strong style={{ fontSize: '16px' }}>
                          {risk.risk_name}
                        </Text>
                      }
                      description={
                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                          <Paragraph 
                            ellipsis={{ rows: 2 }} 
                            style={{ margin: 0, color: '#8c8c8c' }}
                          >
                            {risk.description || 'Không có mô tả'}
                          </Paragraph>
                          
                          <Space direction="vertical" size="small" style={{ width: '100%' }}>
                            <Space>
                              <ExclamationCircleOutlined style={{ color: '#1890ff' }} />
                              <Text type="secondary" style={{ fontSize: '12px' }}>
                                Xác suất: {probabilityValue}/5
                              </Text>
                            </Space>
                            
                            <Space>
                              <ThunderboltOutlined style={{ color: '#faad14' }} />
                              <Text type="secondary" style={{ fontSize: '12px' }}>
                                Tác động: {risk.impact_score != null ? risk.impact_score : 'N/A'}/5
                              </Text>
                            </Space>
                            
                            <Space>
                              <CalculatorOutlined style={{ color: '#52c41a' }} />
                              <Text type="secondary" style={{ fontSize: '12px' }}>
                                Điểm rủi ro: {risk.risk_score != null ? risk.risk_score.toFixed(1) : 'N/A'}/5
                              </Text>
                            </Space>
                            
                            <Space>
                              <UserOutlined style={{ color: '#1890ff' }} />
                              <Text type="secondary" style={{ fontSize: '12px' }}>
                                Người phụ trách: {(risk as any).owner_id?.full_name || (risk.owner_id ? 'Đã phân công' : 'Chưa phân công')}
                              </Text>
                            </Space>
                          </Space>
                          
                          {/* Hiển thị tiến độ */}
                          <div style={{ marginTop: '12px', padding: '8px', background: '#f5f5f5', borderRadius: '4px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                              <Text strong style={{ fontSize: '12px' }}>Tiến độ giải quyết:</Text>
                              <Text strong style={{ fontSize: '12px', color: (risk as any).progress >= 100 ? '#52c41a' : '#1890ff' }}>
                                {(risk as any).progress || 0}%
                              </Text>
                            </div>
                            <Progress 
                              percent={(risk as any).progress || 0} 
                              size="small" 
                              status={(risk as any).progress >= 100 ? 'success' : 'active'}
                              strokeColor={(risk as any).progress >= 100 ? '#52c41a' : '#1890ff'}
                            />
                          </div>
                          
                          {risk.mitigation_plan && (
                            <Card 
                              size="small" 
                              style={{ 
                                marginTop: '8px',
                                background: '#f6ffed',
                                border: '1px solid #b7eb8f'
                              }}
                            >
                              <Text strong style={{ fontSize: '12px', color: '#52c41a' }}>
                                Kế hoạch giảm thiểu:
                              </Text>
                              <Paragraph 
                                style={{ margin: '4px 0 0 0', fontSize: '12px' }}
                                ellipsis={{ rows: 2 }}
                              >
                                {risk.mitigation_plan}
                              </Paragraph>
                            </Card>
                          )}
                          
                          {risk.contingency_plan && (
                            <Card 
                              size="small" 
                              style={{ 
                                marginTop: '8px',
                                background: '#fff7e6',
                                border: '1px solid #ffd591'
                              }}
                            >
                              <Text strong style={{ fontSize: '12px', color: '#fa8c16' }}>
                                Kế hoạch dự phòng:
                              </Text>
                              <Paragraph 
                                style={{ margin: '4px 0 0 0', fontSize: '12px' }}
                                ellipsis={{ rows: 2 }}
                              >
                                {risk.contingency_plan}
                              </Paragraph>
                            </Card>
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

      {/* Risk Form Modal */}
      <RiskFormModal
        visible={showRiskModal}
        onClose={handleModalClose}
        projectId={projectId}
        editingRisk={editingRisk}
        mode={modalMode}
      />

      {/* View Risk Detail Modal with Progress Logs */}
      <Modal
        title={
          <Space>
            <EyeOutlined />
            <span>Chi tiết rủi ro - {selectedRisk?.risk_name}</span>
          </Space>
        }
        open={viewModalVisible}
        onCancel={() => {
          setViewModalVisible(false);
          setSelectedRisk(null);
          setRiskProgressLogs([]);
        }}
        footer={[
          <Button key="close" onClick={() => {
            setViewModalVisible(false);
            setSelectedRisk(null);
            setRiskProgressLogs([]);
          }}>
            Đóng
          </Button>,
          (() => {
            if (!selectedRisk) return null;
            const status = String(selectedRisk.status || '').toUpperCase();
            const isResolved = status === 'RESOLVED' || status === 'ĐÃ GIẢI QUYẾT' || status === 'DA GIAI QUYET';
            
            // Nút luôn hiển thị (không cần check progress)
            return (
              <Button
                key="confirm"
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={handleConfirmRiskComplete}
                loading={confirmingRisk}
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                disabled={isResolved}
              >
                {isResolved ? 'Đã đóng rủi ro' : 'Xác nhận hoàn thành'}
              </Button>
            );
          })()
        ]}
        width={800}
      >
        {selectedRisk && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Title level={5}>{selectedRisk.risk_name}</Title>
                <Text>{selectedRisk.description || 'Không có mô tả'}</Text>
              </Col>
              
              <Col span={12}>
                <Text strong>Trạng thái:</Text>
                <br />
                <Tag color={getStatusInfo(selectedRisk.status || '').color}>
                  {getStatusInfo(selectedRisk.status || '').label}
                </Tag>
              </Col>
              
              <Col span={12}>
                <Text strong>Điểm rủi ro:</Text>
                <br />
                <Tag color={selectedRisk.risk_score >= 15 ? 'red' : selectedRisk.risk_score >= 10 ? 'orange' : 'blue'}>
                  {selectedRisk.risk_score}
                </Tag>
              </Col>
              
              <Col span={12}>
                <Text strong>Người phụ trách:</Text>
                <br />
                <Text>
                  {(selectedRisk as any).owner_id?.full_name || 'Chưa phân công'}
                </Text>
              </Col>
              
              <Col span={12}>
                <Text strong>Hạn giải quyết:</Text>
                <br />
                <Text>{dayjs(selectedRisk.target_resolution_date).format('DD/MM/YYYY')}</Text>
              </Col>
              
              <Col span={24}>
                <Text strong>Tiến độ giải quyết:</Text>
                <br />
                <div style={{ marginTop: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <Text type="secondary" style={{ fontSize: '14px' }}>Tiến độ hiện tại</Text>
                    <Text strong style={{ fontSize: '14px', color: (selectedRisk as any).progress >= 100 ? '#52c41a' : '#1890ff' }}>
                      {(selectedRisk as any).progress || 0}%
                    </Text>
                  </div>
                  <Progress 
                    percent={(selectedRisk as any).progress || 0} 
                    status={(selectedRisk as any).progress >= 100 ? 'success' : 'active'}
                    strokeColor={(selectedRisk as any).progress >= 100 ? '#52c41a' : '#1890ff'}
                  />
                </div>
              </Col>
              
              {selectedRisk.mitigation_plan && (
                <Col span={24}>
                  <Text strong>Kế hoạch giảm thiểu:</Text>
                  <br />
                  <Text>{selectedRisk.mitigation_plan}</Text>
                </Col>
              )}
            </Row>
            
            {/* Lịch sử báo cáo từ Manager */}
            <div style={{ marginTop: '24px', borderTop: '1px solid #f0f0f0', paddingTop: '16px' }}>
              <Title level={5}>
                <HistoryOutlined style={{ marginRight: '8px' }} />
                Lịch sử báo cáo từ Manager
              </Title>
              {loadingRiskLogs ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <Spin size="small" />
                </div>
              ) : riskProgressLogs.length === 0 ? (
                <Empty description="Chưa có báo cáo nào từ Manager" size="small" />
              ) : (
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {riskProgressLogs.map((log: any, index: number) => (
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
    </motion.div>
  );
};

export default ProjectRisks;
