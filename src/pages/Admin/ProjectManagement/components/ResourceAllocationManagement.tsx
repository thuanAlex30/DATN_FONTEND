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
  DatePicker,
  InputNumber
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  ToolOutlined,
  ReloadOutlined,
  UserOutlined,
  CalendarOutlined,
  FlagOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import type { RootState } from '../../../../store';
import projectResourceService, { type ProjectResource, type CreateProjectResourceData } from '../../../../services/projectResourceService';
import projectPhaseService, { type ProjectPhase } from '../../../../services/projectPhaseService';

interface ResourceAllocationManagementProps {
  projectId: string;
  onComplete: () => void;
}

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const ResourceAllocationManagement: React.FC<ResourceAllocationManagementProps> = ({ projectId, onComplete }) => {
  const [resources, setResources] = useState<ProjectResource[]>([]);
  const [phases, setPhases] = useState<ProjectPhase[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateResource, setShowCreateResource] = useState(false);
  const [editingResource, setEditingResource] = useState<ProjectResource | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [resourcesData, phasesData] = await Promise.all([
        projectResourceService.getProjectResources(projectId),
        projectPhaseService.getProjectPhases(projectId)
      ]);

      setResources(resourcesData);
      setPhases(phasesData);
    } catch (err) {
      setError('Không thể tải dữ liệu phân bổ tài nguyên');
      console.error('Error loading resource allocation data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateResource = async (values: CreateProjectResourceData) => {
    setLoading(true);
    try {
      await projectResourceService.createProjectResource({ ...values, project_id: projectId });
      message.success('Tài nguyên đã được phân bổ thành công');
      await loadData();
      setShowCreateResource(false);
      form.resetFields();
    } catch (err) {
      message.error('Không thể phân bổ tài nguyên');
      console.error('Error creating resource allocation:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateResource = async (values: Partial<ProjectResource>) => {
    if (!editingResource) return;
    
    setLoading(true);
    try {
      await projectResourceService.updateProjectResource(editingResource._id, values);
      message.success('Tài nguyên đã được cập nhật thành công');
      await loadData();
      setShowCreateResource(false);
      setEditingResource(null);
      form.resetFields();
    } catch (err) {
      message.error('Không thể cập nhật tài nguyên');
      console.error('Error updating resource allocation:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResource = async (id: string) => {
    Modal.confirm({
      title: 'Xác nhận xóa tài nguyên',
      content: 'Bạn có chắc chắn muốn xóa tài nguyên này? Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await projectResourceService.deleteProjectResource(id);
          message.success('Tài nguyên đã được xóa thành công');
          await loadData();
        } catch (err) {
          message.error('Không thể xóa tài nguyên');
          console.error('Error deleting resource allocation:', err);
        }
      },
    });
  };

  const handleEditResource = (resource: ProjectResource) => {
    setEditingResource(resource);
    form.setFieldsValue({
      resource_name: resource.resource_name,
      resource_type: resource.resource_type,
      quantity: resource.quantity,
      unit_cost: resource.unit_cost,
      total_cost: resource.total_cost,
      phase_id: resource.phase_id,
      start_date: resource.start_date ? new Date(resource.start_date) : null,
      end_date: resource.end_date ? new Date(resource.end_date) : null,
      description: resource.description,
      status: resource.status
    });
    setShowCreateResource(true);
  };

  const handleModalClose = () => {
    setShowCreateResource(false);
    setEditingResource(null);
    form.resetFields();
  };

  const getResourceTypeColor = (type: string) => {
    switch (type) {
      case 'HUMAN': return 'blue';
      case 'EQUIPMENT': return 'green';
      case 'MATERIAL': return 'orange';
      case 'FINANCIAL': return 'purple';
      default: return 'default';
    }
  };

  const getResourceTypeLabel = (type: string) => {
    switch (type) {
      case 'HUMAN': return 'Nhân lực';
      case 'EQUIPMENT': return 'Thiết bị';
      case 'MATERIAL': return 'Vật liệu';
      case 'FINANCIAL': return 'Tài chính';
      default: return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ALLOCATED': return 'green';
      case 'IN_USE': return 'blue';
      case 'AVAILABLE': return 'orange';
      case 'DEPLETED': return 'red';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ALLOCATED': return 'Đã phân bổ';
      case 'IN_USE': return 'Đang sử dụng';
      case 'AVAILABLE': return 'Có sẵn';
      case 'DEPLETED': return 'Đã hết';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
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
                <ToolOutlined style={{ color: '#1890ff' }} />
                Phân bổ Tài nguyên
              </Title>
              <Text type="secondary">
                Quản lý và phân bổ các tài nguyên cho dự án
              </Text>
            </Space>
          </Col>
          <Col>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => setShowCreateResource(true)}
            >
              Phân bổ tài nguyên
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

      {/* Resources List */}
      <Card>
        <Title level={3} style={{ marginBottom: '16px' }}>Danh sách Tài nguyên</Title>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
            <div style={{ marginTop: '16px' }}>
              <Text>Đang tải danh sách tài nguyên...</Text>
            </div>
          </div>
        ) : resources.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Space direction="vertical" size="middle">
                <Title level={4} style={{ color: '#8c8c8c' }}>
                  Chưa có tài nguyên nào
                </Title>
                <Text type="secondary">
                  Dự án này chưa có tài nguyên nào được phân bổ. Hãy phân bổ tài nguyên đầu tiên để bắt đầu quản lý.
                </Text>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => setShowCreateResource(true)}
                >
                  Phân bổ Tài nguyên Đầu Tiên
                </Button>
              </Space>
            }
          />
        ) : (
          <Row gutter={[16, 16]}>
            {resources.map((resource) => (
              <Col key={resource._id} xs={24} sm={24} md={12} lg={8}>
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
                          onClick={() => handleEditResource(resource)}
                        />
                      </Tooltip>,
                      <Tooltip key="delete" title="Xóa">
                        <Button 
                          type="text" 
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => handleDeleteResource(resource._id)}
                        />
                      </Tooltip>
                    ]}
                    extra={
                      <Space>
                        <Tag color={getResourceTypeColor(resource.resource_type)}>
                          {getResourceTypeLabel(resource.resource_type)}
                        </Tag>
                        <Tag color={getStatusColor(resource.status)}>
                          {getStatusLabel(resource.status)}
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
                          background: '#1890ff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <ToolOutlined style={{ color: 'white', fontSize: '20px' }} />
                        </div>
                      }
                      title={
                        <Text strong style={{ fontSize: '16px' }}>
                          {resource.resource_name}
                        </Text>
                      }
                      description={
                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                          <Paragraph 
                            ellipsis={{ rows: 2 }} 
                            style={{ margin: 0, color: '#8c8c8c' }}
                          >
                            {resource.description || 'Không có mô tả'}
                          </Paragraph>
                          
                          <Space direction="vertical" size="small" style={{ width: '100%' }}>
                            <Space>
                              <Text type="secondary" style={{ fontSize: '12px' }}>
                                Số lượng: {resource.quantity} {resource.unit || 'đơn vị'}
                              </Text>
                            </Space>
                            
                            <Space>
                              <Text type="secondary" style={{ fontSize: '12px' }}>
                                Đơn giá: {formatCurrency(resource.unit_cost || 0)}
                              </Text>
                            </Space>
                            
                            <Space>
                              <Text type="secondary" style={{ fontSize: '12px' }}>
                                Tổng chi phí: {formatCurrency(resource.total_cost || 0)}
                              </Text>
                            </Space>
                            
                            <Space>
                              <FlagOutlined style={{ color: '#1890ff' }} />
                              <Text type="secondary" style={{ fontSize: '12px' }}>
                                Giai đoạn: {resource.phase?.phase_name || 'Chưa gán'}
                              </Text>
                            </Space>
                            
                            {resource.start_date && (
                              <Space>
                                <CalendarOutlined style={{ color: '#1890ff' }} />
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                  Bắt đầu: {formatDate(resource.start_date)}
                                </Text>
                              </Space>
                            )}
                            
                            {resource.end_date && (
                              <Space>
                                <CalendarOutlined style={{ color: '#52c41a' }} />
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                  Kết thúc: {formatDate(resource.end_date)}
                                </Text>
                              </Space>
                            )}
                          </Space>
                        </Space>
                      }
                    />
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
        )}
      </Card>

      {/* Create/Edit Resource Modal */}
      <Modal
        title={editingResource ? 'Chỉnh sửa Tài nguyên' : 'Phân bổ Tài nguyên Mới'}
        open={showCreateResource}
        onCancel={handleModalClose}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={editingResource ? handleUpdateResource : handleCreateResource}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="resource_name"
                label="Tên tài nguyên"
                rules={[{ required: true, message: 'Vui lòng nhập tên tài nguyên' }]}
              >
                <Input placeholder="Nhập tên tài nguyên" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="resource_type"
                label="Loại tài nguyên"
                rules={[{ required: true, message: 'Vui lòng chọn loại tài nguyên' }]}
              >
                <Select placeholder="Chọn loại tài nguyên">
                  <Option value="HUMAN">Nhân lực</Option>
                  <Option value="EQUIPMENT">Thiết bị</Option>
                  <Option value="MATERIAL">Vật liệu</Option>
                  <Option value="FINANCIAL">Tài chính</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="quantity"
                label="Số lượng"
                rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} placeholder="Nhập số lượng" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="unit_cost"
                label="Đơn giá"
                rules={[{ required: true, message: 'Vui lòng nhập đơn giá' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} placeholder="Nhập đơn giá" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="total_cost"
                label="Tổng chi phí"
                rules={[{ required: true, message: 'Vui lòng nhập tổng chi phí' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} placeholder="Nhập tổng chi phí" />
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
            <Col span={12}>
              <Form.Item
                name="status"
                label="Trạng thái"
                rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
              >
                <Select placeholder="Chọn trạng thái">
                  <Option value="ALLOCATED">Đã phân bổ</Option>
                  <Option value="IN_USE">Đang sử dụng</Option>
                  <Option value="AVAILABLE">Có sẵn</Option>
                  <Option value="DEPLETED">Đã hết</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="start_date"
                label="Ngày bắt đầu"
              >
                <DatePicker style={{ width: '100%' }} placeholder="Chọn ngày bắt đầu" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="end_date"
                label="Ngày kết thúc"
              >
                <DatePicker style={{ width: '100%' }} placeholder="Chọn ngày kết thúc" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="description"
                label="Mô tả"
              >
                <TextArea rows={3} placeholder="Nhập mô tả tài nguyên" />
              </Form.Item>
            </Col>
          </Row>
          
          <div style={{ textAlign: 'right', marginTop: '24px' }}>
            <Space>
              <Button onClick={handleModalClose}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingResource ? 'Cập nhật' : 'Tạo mới'}
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
          icon={<ToolOutlined />}
          onClick={onComplete}
        >
          Hoàn thành Phân bổ Tài nguyên
        </Button>
      </div>
    </motion.div>
  );
};

export default ResourceAllocationManagement;