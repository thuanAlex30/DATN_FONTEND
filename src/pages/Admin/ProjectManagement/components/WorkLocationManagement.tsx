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
  Form
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EnvironmentOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import type { RootState } from '../../../../store';
import workLocationService, { type WorkLocation, type CreateWorkLocationData } from '../../../../services/workLocationService';
import siteAreaService, { type SiteArea } from '../../../../services/siteAreaService';

interface WorkLocationManagementProps {
  projectId: string;
  onComplete: () => void;
}

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const WorkLocationManagement: React.FC<WorkLocationManagementProps> = ({ projectId, onComplete }) => {
  const [workLocations, setWorkLocations] = useState<WorkLocation[]>([]);
  const [siteAreas, setSiteAreas] = useState<SiteArea[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateLocation, setShowCreateLocation] = useState(false);
  const [editingLocation, setEditingLocation] = useState<WorkLocation | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [locationsData, areasData] = await Promise.all([
        workLocationService.getWorkLocationsByProject(projectId),
        siteAreaService.getAreasByProject(projectId)
      ]);

      setWorkLocations(locationsData);
      setSiteAreas(areasData);
    } catch (err) {
      setError('Không thể tải dữ liệu vị trí làm việc');
      console.error('Error loading work location data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLocation = async (values: CreateWorkLocationData) => {
    setLoading(true);
    try {
      await workLocationService.createLocation({ ...values, project_id: projectId });
      message.success('Vị trí làm việc đã được tạo thành công');
      await loadData();
      setShowCreateLocation(false);
      form.resetFields();
    } catch (err) {
      message.error('Không thể tạo vị trí làm việc');
      console.error('Error creating work location:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLocation = async (values: Partial<WorkLocation>) => {
    if (!editingLocation) return;
    
    setLoading(true);
    try {
      await workLocationService.updateLocation(editingLocation._id, values);
      message.success('Vị trí làm việc đã được cập nhật thành công');
      await loadData();
      setShowCreateLocation(false);
      setEditingLocation(null);
      form.resetFields();
    } catch (err) {
      message.error('Không thể cập nhật vị trí làm việc');
      console.error('Error updating work location:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLocation = async (id: string) => {
    Modal.confirm({
      title: 'Xác nhận xóa vị trí làm việc',
      content: 'Bạn có chắc chắn muốn xóa vị trí làm việc này? Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await workLocationService.deleteLocation(id);
          message.success('Vị trí làm việc đã được xóa thành công');
          await loadData();
        } catch (err) {
          message.error('Không thể xóa vị trí làm việc');
          console.error('Error deleting work location:', err);
        }
      },
    });
  };

  const handleEditLocation = (location: WorkLocation) => {
    setEditingLocation(location);
    form.setFieldsValue({
      location_name: location.location_name,
      description: location.description,
      area_id: location.area_id,
      capacity: location.capacity,
      status: location.status
    });
    setShowCreateLocation(true);
  };

  const handleModalClose = () => {
    setShowCreateLocation(false);
    setEditingLocation(null);
    form.resetFields();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'green';
      case 'INACTIVE': return 'red';
      case 'MAINTENANCE': return 'orange';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Hoạt động';
      case 'INACTIVE': return 'Không hoạt động';
      case 'MAINTENANCE': return 'Bảo trì';
      default: return status;
    }
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
                <EnvironmentOutlined style={{ color: '#1890ff' }} />
                Quản lý Vị trí Làm việc
              </Title>
              <Text type="secondary">
                Quản lý các vị trí làm việc cụ thể trong dự án
              </Text>
            </Space>
          </Col>
          <Col>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => setShowCreateLocation(true)}
            >
              Thêm vị trí
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

      {/* Work Locations List */}
      <Card>
        <Title level={3} style={{ marginBottom: '16px' }}>Danh sách Vị trí Làm việc</Title>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
            <div style={{ marginTop: '16px' }}>
              <Text>Đang tải danh sách vị trí làm việc...</Text>
            </div>
          </div>
        ) : workLocations.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Space direction="vertical" size="middle">
                <Title level={4} style={{ color: '#8c8c8c' }}>
                  Chưa có vị trí làm việc nào
                </Title>
                <Text type="secondary">
                  Dự án này chưa có vị trí làm việc nào được tạo. Hãy tạo vị trí đầu tiên để bắt đầu quản lý.
                </Text>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => setShowCreateLocation(true)}
                >
                  Tạo Vị trí Đầu Tiên
                </Button>
              </Space>
            }
          />
        ) : (
          <Row gutter={[16, 16]}>
            {workLocations.map((location) => (
              <Col key={location._id} xs={24} sm={24} md={12} lg={8}>
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
                          onClick={() => handleEditLocation(location)}
                        />
                      </Tooltip>,
                      <Tooltip key="delete" title="Xóa">
                        <Button 
                          type="text" 
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => handleDeleteLocation(location._id)}
                        />
                      </Tooltip>
                    ]}
                    extra={
                      <Tag color={getStatusColor(location.status)}>
                        {getStatusLabel(location.status)}
                      </Tag>
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
                          <EnvironmentOutlined style={{ color: 'white', fontSize: '20px' }} />
                        </div>
                      }
                      title={
                        <Text strong style={{ fontSize: '16px' }}>
                          {location.location_name}
                        </Text>
                      }
                      description={
                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                          <Paragraph 
                            ellipsis={{ rows: 2 }} 
                            style={{ margin: 0, color: '#8c8c8c' }}
                          >
                            {location.description || 'Không có mô tả'}
                          </Paragraph>
                          
                          <Space direction="vertical" size="small" style={{ width: '100%' }}>
                            <Space>
                              <EnvironmentOutlined style={{ color: '#1890ff' }} />
                              <Text type="secondary" style={{ fontSize: '12px' }}>
                                Khu vực: {location.area?.area_name || 'Chưa gán'}
                              </Text>
                            </Space>
                            
                            <Space>
                              <Text type="secondary" style={{ fontSize: '12px' }}>
                                Sức chứa: {location.capacity} người
                              </Text>
                            </Space>
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

      {/* Create/Edit Location Modal */}
      <Modal
        title={editingLocation ? 'Chỉnh sửa Vị trí Làm việc' : 'Tạo Vị trí Làm việc Mới'}
        open={showCreateLocation}
        onCancel={handleModalClose}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={editingLocation ? handleUpdateLocation : handleCreateLocation}
        >
          <Form.Item
            name="location_name"
            label="Tên vị trí"
            rules={[{ required: true, message: 'Vui lòng nhập tên vị trí' }]}
          >
            <Input placeholder="Nhập tên vị trí làm việc" />
          </Form.Item>

          <Form.Item
            name="area_id"
            label="Khu vực"
            rules={[{ required: true, message: 'Vui lòng chọn khu vực' }]}
          >
            <Select placeholder="Chọn khu vực">
              {siteAreas.map(area => (
                <Option key={area._id} value={area._id}>
                  {area.area_name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="capacity"
            label="Sức chứa"
            rules={[{ required: true, message: 'Vui lòng nhập sức chứa' }]}
          >
            <Input type="number" placeholder="Nhập sức chứa (người)" />
          </Form.Item>

          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
          >
            <Select placeholder="Chọn trạng thái">
              <Option value="ACTIVE">Hoạt động</Option>
              <Option value="INACTIVE">Không hoạt động</Option>
              <Option value="MAINTENANCE">Bảo trì</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
          >
            <TextArea rows={3} placeholder="Nhập mô tả vị trí làm việc" />
          </Form.Item>

          <div style={{ textAlign: 'right', marginTop: '24px' }}>
            <Space>
              <Button onClick={handleModalClose}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingLocation ? 'Cập nhật' : 'Tạo mới'}
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
          icon={<EnvironmentOutlined />}
          onClick={onComplete}
        >
          Hoàn thành Quản lý Vị trí Làm việc
        </Button>
      </div>
    </motion.div>
  );
};

export default WorkLocationManagement;