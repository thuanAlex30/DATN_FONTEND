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
  Form,
  Slider
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  WarningOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined,
  ThunderboltOutlined,
  CalculatorOutlined,
  UserOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import type { RootState } from '../../../../store';
import projectRiskService, { type ProjectRisk, type CreateProjectRiskData } from '../../../../services/projectRiskService';
import projectPhaseService, { type ProjectPhase } from '../../../../services/projectPhaseService';
import userService from '../../../../services/userService';

interface RiskAssessmentManagementProps {
  projectId: string;
  onComplete: () => void;
}

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const RiskAssessmentManagement: React.FC<RiskAssessmentManagementProps> = ({ projectId, onComplete }) => {
  const [risks, setRisks] = useState<ProjectRisk[]>([]);
  const [phases, setPhases] = useState<ProjectPhase[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateRisk, setShowCreateRisk] = useState(false);
  const [editingRisk, setEditingRisk] = useState<ProjectRisk | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [risksData, phasesData, usersData] = await Promise.all([
        projectRiskService.getProjectRisks(projectId),
        projectPhaseService.getProjectPhases(projectId),
        userService.getUsers()
      ]);

      setRisks(risksData);
      setPhases(phasesData);
      setUsers(usersData);
    } catch (err) {
      setError('Không thể tải dữ liệu đánh giá rủi ro');
      console.error('Error loading risk assessment data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRisk = async (values: CreateProjectRiskData) => {
    setLoading(true);
    try {
      await projectRiskService.createRisk({ ...values, project_id: projectId });
      message.success('Rủi ro đã được tạo thành công');
      await loadData();
      setShowCreateRisk(false);
      form.resetFields();
    } catch (err) {
      message.error('Không thể tạo rủi ro');
      console.error('Error creating risk:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRisk = async (values: Partial<ProjectRisk>) => {
    if (!editingRisk) return;
    
    setLoading(true);
    try {
      await projectRiskService.updateRisk(editingRisk.id, values);
      message.success('Rủi ro đã được cập nhật thành công');
      await loadData();
      setShowCreateRisk(false);
      setEditingRisk(null);
      form.resetFields();
    } catch (err) {
      message.error('Không thể cập nhật rủi ro');
      console.error('Error updating risk:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRisk = async (id: string) => {
    Modal.confirm({
      title: 'Xác nhận xóa rủi ro',
      content: 'Bạn có chắc chắn muốn xóa rủi ro này? Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await projectRiskService.deleteRisk(id);
          message.success('Rủi ro đã được xóa thành công');
          await loadData();
        } catch (err) {
          message.error('Không thể xóa rủi ro');
          console.error('Error deleting risk:', err);
        }
      },
    });
  };

  const handleEditRisk = (risk: ProjectRisk) => {
    setEditingRisk(risk);
    form.setFieldsValue({
      risk_name: risk.risk_name,
      description: risk.description,
      probability: typeof risk.probability === 'object' ? 'medium' : risk.probability,
      impact_score: typeof risk.impact_score === 'object' ? 'medium' : risk.impact_score,
      risk_score: typeof risk.risk_score === 'object' ? 'medium' : risk.risk_score,
      owner_id: typeof risk.owner_id === 'object' ? risk.owner_id._id : risk.owner_id,
      phase_id: risk.phase_id,
      status: risk.status,
      mitigation_plan: risk.mitigation_plan,
      contingency_plan: risk.contingency_plan
    });
    setShowCreateRisk(true);
  };

  const handleModalClose = () => {
    setShowCreateRisk(false);
    setEditingRisk(null);
    form.resetFields();
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

  const calculateRiskScore = (probability: string, impact: string) => {
    const probScore = probability === 'high' ? 3 : probability === 'medium' ? 2 : 1;
    const impactScore = impact === 'high' ? 3 : impact === 'medium' ? 2 : 1;
    const totalScore = probScore * impactScore;
    
    if (totalScore >= 7) return 'high';
    if (totalScore >= 4) return 'medium';
    return 'low';
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
                <WarningOutlined style={{ color: '#faad14' }} />
                Đánh giá Rủi ro
              </Title>
              <Text type="secondary">
                Xác định và đánh giá các rủi ro tiềm ẩn trong dự án
              </Text>
            </Space>
          </Col>
          <Col>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => setShowCreateRisk(true)}
            >
              Thêm rủi ro
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
          action={
            <Button 
              size="small" 
              danger 
              icon={<ReloadOutlined />}
              onClick={loadData}
            >
              Thử lại
            </Button>
          }
          style={{ marginBottom: '24px' }}
        />
      )}

      {/* Risks List */}
      <Card>
        <Title level={3} style={{ marginBottom: '16px' }}>Danh sách Rủi ro</Title>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
            <div style={{ marginTop: '16px' }}>
              <Text>Đang tải danh sách rủi ro...</Text>
            </div>
          </div>
        ) : risks.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Space direction="vertical" size="middle">
                <Title level={4} style={{ color: '#8c8c8c' }}>
                  Chưa có rủi ro nào
                </Title>
                <Text type="secondary">
                  Dự án này chưa có rủi ro nào được xác định. Hãy xác định rủi ro đầu tiên để bắt đầu đánh giá.
                </Text>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => setShowCreateRisk(true)}
                >
                  Xác định Rủi ro Đầu Tiên
                </Button>
              </Space>
            }
          />
        ) : (
          <Row gutter={[16, 16]}>
            {risks.map((risk) => {
              const riskLevelInfo = getRiskLevelInfo(typeof risk.probability === 'object' ? 'medium' : risk.probability.toString());
              const statusInfo = getStatusInfo(risk.status);
              
              return (
                <Col key={risk.id} xs={24} sm={24} md={12} lg={8}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card
                      hoverable
                      actions={[
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
                            onClick={() => handleDeleteRisk(risk.id)}
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
                                  Xác suất: {typeof risk.probability === 'object' ? 'Trung bình' : risk.probability}
                                </Text>
                              </Space>
                              
                              <Space>
                                <ThunderboltOutlined style={{ color: '#faad14' }} />
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                  Tác động: {typeof risk.impact_score === 'object' ? 'Trung bình' : risk.impact_score}
                                </Text>
                              </Space>
                              
                              <Space>
                                <CalculatorOutlined style={{ color: '#52c41a' }} />
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                  Điểm rủi ro: {typeof risk.risk_score === 'object' ? 'Trung bình' : risk.risk_score}
                                </Text>
                              </Space>
                              
                              <Space>
                                <UserOutlined style={{ color: '#1890ff' }} />
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                  Người phụ trách: {typeof risk.owner_id === 'object' && risk.owner_id ? risk.owner_id.full_name : (risk.owner_id || 'N/A')}
                                </Text>
                              </Space>
                            </Space>
                            
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
      </Card>

      {/* Create/Edit Risk Modal */}
      <Modal
        title={editingRisk ? 'Chỉnh sửa Rủi ro' : 'Tạo Rủi ro Mới'}
        open={showCreateRisk}
        onCancel={handleModalClose}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={editingRisk ? handleUpdateRisk : handleCreateRisk}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="risk_name"
                label="Tên rủi ro"
                rules={[{ required: true, message: 'Vui lòng nhập tên rủi ro' }]}
              >
                <Input placeholder="Nhập tên rủi ro" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Trạng thái"
                rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
              >
                <Select placeholder="Chọn trạng thái">
                  <Option value="identified">Đã xác định</Option>
                  <Option value="monitoring">Đang theo dõi</Option>
                  <Option value="mitigated">Đã giảm thiểu</Option>
                  <Option value="resolved">Đã giải quyết</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="probability"
                label="Xác suất xảy ra"
                rules={[{ required: true, message: 'Vui lòng chọn xác suất' }]}
              >
                <Select placeholder="Chọn xác suất">
                  <Option value="low">Thấp</Option>
                  <Option value="medium">Trung bình</Option>
                  <Option value="high">Cao</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="impact_score"
                label="Mức độ tác động"
                rules={[{ required: true, message: 'Vui lòng chọn mức độ tác động' }]}
              >
                <Select placeholder="Chọn mức độ tác động">
                  <Option value="low">Thấp</Option>
                  <Option value="medium">Trung bình</Option>
                  <Option value="high">Cao</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="owner_id"
                label="Người phụ trách"
              >
                <Select placeholder="Chọn người phụ trách" allowClear>
                  {users.map(user => (
                    <Option key={user._id} value={user._id}>
                      {user.full_name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phase_id"
                label="Giai đoạn"
              >
                <Select placeholder="Chọn giai đoạn" allowClear>
                  {phases.map(phase => (
                    <Option key={phase._id} value={phase._id}>
                      {phase.phase_name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="description"
                label="Mô tả"
              >
                <TextArea rows={3} placeholder="Nhập mô tả rủi ro" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="mitigation_plan"
                label="Kế hoạch giảm thiểu"
              >
                <TextArea rows={3} placeholder="Nhập kế hoạch giảm thiểu rủi ro" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="contingency_plan"
                label="Kế hoạch dự phòng"
              >
                <TextArea rows={3} placeholder="Nhập kế hoạch dự phòng" />
              </Form.Item>
            </Col>
          </Row>
          
          <div style={{ textAlign: 'right', marginTop: '24px' }}>
            <Space>
              <Button onClick={handleModalClose}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingRisk ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* Action Buttons */}
      <div style={{ textAlign: 'center', marginTop: '24px' }}>
        <Button 
          type="primary" 
          size="large"
          icon={<WarningOutlined />}
          onClick={onComplete}
        >
          Hoàn thành Đánh giá Rủi ro
        </Button>
      </div>
    </motion.div>
  );
};

export default RiskAssessmentManagement;