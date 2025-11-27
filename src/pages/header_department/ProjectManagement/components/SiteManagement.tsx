import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
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
import type { AppDispatch } from '../../../../store';
import { type SiteArea } from '../../../../services/siteAreaService';
import { type CreateAreaData, type UpdateAreaData } from '../../../../types/siteArea';
import { 
  fetchAreasByProject,
  createAreaForProject,
  updateAreaForProject,
  deleteAreaForProject,
  setCurrentProjectId
} from '../../../../store/slices/siteAreaSlice';
import projectService from '../../../../services/projectService';

interface SiteManagementProps {
  projectId: string;
  onComplete: () => void;
}

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const SiteManagement: React.FC<SiteManagementProps> = ({ projectId, onComplete }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { areas, loading, error } = useSelector((state: RootState) => state.siteArea);
  const [showCreateArea, setShowCreateArea] = useState(false);
  const [editingArea, setEditingArea] = useState<SiteArea | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (projectId) {
      dispatch(setCurrentProjectId(projectId));
      dispatch(fetchAreasByProject(projectId));
    }
  }, [dispatch, projectId]);

  const handleCreateArea = async (values: CreateAreaData) => {
    try {
      await dispatch(createAreaForProject({ projectId, data: values })).unwrap();
      message.success('Khu vực đã được tạo thành công');
      setShowCreateArea(false);
      form.resetFields();
    } catch (err) {
      message.error('Không thể tạo khu vực');
      console.error('Error creating area:', err);
    }
  };

  const handleUpdateArea = async (values: UpdateAreaData) => {
    if (!editingArea) return;
    
    try {
      await dispatch(updateAreaForProject({ 
        id: editingArea._id, 
        data: values 
      })).unwrap();
      message.success('Khu vực đã được cập nhật thành công');
      setShowCreateArea(false);
      setEditingArea(null);
      form.resetFields();
    } catch (err) {
      message.error('Không thể cập nhật khu vực');
      console.error('Error updating area:', err);
    }
  };

  const handleDeleteArea = async (areaId: string) => {
    Modal.confirm({
      title: 'Xác nhận xóa khu vực',
      content: 'Bạn có chắc chắn muốn xóa khu vực này? Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await dispatch(deleteAreaForProject(areaId)).unwrap();
          message.success('Khu vực đã được xóa thành công');
        } catch (err) {
          message.error('Không thể xóa khu vực');
          console.error('Error deleting area:', err);
        }
      },
    });
  };

  const handleEditArea = (area: SiteArea) => {
    setEditingArea(area);
    form.setFieldsValue({
      area_name: area.area_name,
      description: area.description,
      area_type: area.area_type,
      is_active: area.is_active
    });
    setShowCreateArea(true);
  };

  const handleModalClose = () => {
    setShowCreateArea(false);
    setEditingArea(null);
    form.resetFields();
  };

  const getAreaTypeColor = (type: string) => {
    switch (type) {
      case 'WORK_AREA': return 'blue';
      case 'STORAGE_AREA': return 'green';
      case 'OFFICE_AREA': return 'purple';
      case 'SAFETY_AREA': return 'red';
      default: return 'default';
    }
  };

  const getAreaTypeLabel = (type: string) => {
    switch (type) {
      case 'WORK_AREA': return 'Khu vực làm việc';
      case 'STORAGE_AREA': return 'Khu vực lưu trữ';
      case 'OFFICE_AREA': return 'Khu vực văn phòng';
      case 'SAFETY_AREA': return 'Khu vực an toàn';
      default: return type;
    }
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
                <EnvironmentOutlined style={{ color: '#52c41a' }} />
                Quản lý Khu vực
              </Title>
              <Text type="secondary">
                Quản lý các khu vực làm việc trong dự án
              </Text>
            </Space>
          </Col>
          <Col>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => setShowCreateArea(true)}
            >
              Thêm khu vực
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
          action={
            <Button 
              size="small" 
              danger 
              icon={<ReloadOutlined />}
              onClick={() => dispatch(fetchAreasByProject(projectId))}
            >
              Thử lại
            </Button>
          }
          style={{ marginBottom: '24px' }}
        />
      )}

      {/* Areas List */}
      <Card>
        <Title level={3} style={{ marginBottom: '16px' }}>Danh sách Khu vực</Title>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
            <div style={{ marginTop: '16px' }}>
              <Text>Đang tải danh sách khu vực...</Text>
            </div>
          </div>
        ) : areas.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Space direction="vertical" size="middle">
                <Title level={4} style={{ color: '#8c8c8c' }}>
                  Chưa có khu vực nào
                </Title>
                <Text type="secondary">
                  Dự án này chưa có khu vực nào được tạo. Hãy tạo khu vực đầu tiên để bắt đầu quản lý.
                </Text>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => setShowCreateArea(true)}
                >
                  Tạo Khu vực Đầu Tiên
                </Button>
              </Space>
            }
          />
        ) : (
          <Row gutter={[16, 16]}>
            {areas.map((area) => (
              <Col key={area._id} xs={24} sm={24} md={12} lg={8}>
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
                          onClick={() => handleEditArea(area as any)}
                        />
                      </Tooltip>,
                      <Tooltip key="delete" title="Xóa">
                        <Button 
                          type="text" 
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => handleDeleteArea(area._id)}
                        />
                      </Tooltip>
                    ]}
                    extra={
                      <Space>
                        <Tag color={getAreaTypeColor(area.area_type)}>
                          {getAreaTypeLabel(area.area_type)}
                        </Tag>
                        <Tag color={getStatusColor(area.is_active ? 'ACTIVE' : 'INACTIVE')}>
                          {getStatusLabel(area.is_active ? 'ACTIVE' : 'INACTIVE')}
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
                          background: '#52c41a',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <EnvironmentOutlined style={{ color: 'white', fontSize: '20px' }} />
                        </div>
                      }
                      title={
                        <Text strong style={{ fontSize: '16px' }}>
                          {area.area_name}
                        </Text>
                      }
                      description={
                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                          <Paragraph 
                            ellipsis={{ rows: 2 }} 
                            style={{ margin: 0, color: '#8c8c8c' }}
                          >
                            {area.description || 'Không có mô tả'}
                          </Paragraph>
                          
                          <Space direction="vertical" size="small" style={{ width: '100%' }}>
                            <Space>
                              <EnvironmentOutlined style={{ color: '#1890ff' }} />
                              <Text type="secondary" style={{ fontSize: '12px' }}>
                                Loại: {getAreaTypeLabel(area.area_type)}
                              </Text>
                            </Space>
                            
                            <Space>
                              <Tag color={getStatusColor(area.is_active ? 'ACTIVE' : 'INACTIVE')} style={{ fontSize: '12px' }}>
                                {getStatusLabel(area.is_active ? 'ACTIVE' : 'INACTIVE')}
                              </Tag>
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

      {/* Create/Edit Area Modal */}
      <Modal
        title={editingArea ? 'Chỉnh sửa Khu vực' : 'Tạo Khu vực Mới'}
        open={showCreateArea}
        onCancel={handleModalClose}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={editingArea ? handleUpdateArea : handleCreateArea}
        >
          <Form.Item
            name="area_name"
            label="Tên khu vực"
            rules={[{ required: true, message: 'Vui lòng nhập tên khu vực' }]}
          >
            <Input placeholder="Nhập tên khu vực" />
          </Form.Item>

          <Form.Item
            name="area_type"
            label="Loại khu vực"
            rules={[{ required: true, message: 'Vui lòng chọn loại khu vực' }]}
          >
            <Select placeholder="Chọn loại khu vực">
              <Option value="WORK_AREA">Khu vực làm việc</Option>
              <Option value="STORAGE_AREA">Khu vực lưu trữ</Option>
              <Option value="OFFICE_AREA">Khu vực văn phòng</Option>
              <Option value="SAFETY_AREA">Khu vực an toàn</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="is_active"
            label="Trạng thái"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
          >
            <Select placeholder="Chọn trạng thái">
              <Option value={true}>Hoạt động</Option>
              <Option value={false}>Không hoạt động</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
          >
            <TextArea rows={3} placeholder="Nhập mô tả khu vực" />
          </Form.Item>

          <div style={{ textAlign: 'right', marginTop: '24px' }}>
            <Space>
              <Button onClick={handleModalClose}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingArea ? 'Cập nhật' : 'Tạo mới'}
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
          Hoàn thành Quản lý Khu vực
        </Button>
      </div>
    </motion.div>
  );
};

export default SiteManagement;