import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  message,
  Row,
  Col,
  Typography,
  Space,
  Tooltip,
  Statistic,
  Progress
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  DollarOutlined,
  TeamOutlined,
  ToolOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import projectResourceService, { type ProjectResource } from '../../../../services/projectResourceService';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface ResourceManagementProps {
  projectId: string;
}

const ResourceManagement: React.FC<ResourceManagementProps> = ({ projectId }) => {
  const [resources, setResources] = useState<ProjectResource[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedResource, setSelectedResource] = useState<ProjectResource | null>(null);
  const [form] = Form.useForm();

  // Load resources
  const loadResources = async () => {
    if (!projectId) return;
    
    try {
      setLoading(true);
      const response = await projectResourceService.getProjectResources(projectId);
      setResources(response || []);
    } catch (error: any) {
      console.error('Error loading resources:', error);
      message.error('Không thể tải danh sách tài nguyên');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, [projectId]);

  // Handle create/update resource
  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      
      const resourceData = {
        project_id: projectId,
        resource_name: values.resource_name,
        resource_type: values.resource_type,
        description: values.description,
        planned_quantity: values.quantity_required,
        unit_measure: values.unit,
        supplier_name: values.supplier,
        required_date: dayjs(values.required_date).toISOString(),
        location: values.location,
        notes: values.notes
      };

      if (selectedResource) {
        await projectResourceService.updateResource(selectedResource._id, resourceData);
        message.success('Cập nhật tài nguyên thành công!');
      } else {
        await projectResourceService.createResource(resourceData);
        message.success('Tạo tài nguyên thành công!');
      }

      setModalVisible(false);
      form.resetFields();
      setSelectedResource(null);
      loadResources();
    } catch (error: any) {
      console.error('Error saving resource:', error);
      message.error(error.response?.data?.message || 'Có lỗi xảy ra khi lưu tài nguyên');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete resource
  const handleDelete = async (resourceId: string) => {
    try {
      await projectResourceService.deleteResource(resourceId);
      message.success('Xóa tài nguyên thành công!');
      loadResources();
    } catch (error: any) {
      console.error('Error deleting resource:', error);
      message.error('Có lỗi xảy ra khi xóa tài nguyên');
    }
  };

  // Handle view resource
  const handleView = (resource: ProjectResource) => {
    setSelectedResource(resource);
    setViewModalVisible(true);
  };

  // Handle edit resource
  const handleEdit = (resource: ProjectResource) => {
    setSelectedResource(resource);
    form.setFieldsValue({
      ...resource,
      quantity_required: resource.planned_quantity,
      quantity_allocated: resource.actual_quantity,
      unit: resource.unit_measure,
      supplier: resource.supplier_name,
      required_date: resource.required_date ? dayjs(resource.required_date) : null,
      allocated_date: resource.delivered_date ? dayjs(resource.delivered_date) : null
    });
    setModalVisible(true);
  };

  // Handle add new resource
  const handleAdd = () => {
    setSelectedResource(null);
    form.resetFields();
    setModalVisible(true);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'PLANNED': 'default',
      'ORDERED': 'processing',
      'DELIVERED': 'processing',
      'IN_USE': 'success',
      'CONSUMED': 'success',
      'RETURNED': 'success'
    };
    return colors[status] || 'default';
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    const colors: { [key: string]: string } = {
      'LOW': 'green',
      'MEDIUM': 'orange',
      'HIGH': 'red',
      'CRITICAL': 'red'
    };
    return colors[priority] || 'default';
  };

  // Get resource type icon
  const getResourceTypeIcon = (type: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      'MATERIAL': <ToolOutlined />,
      'EQUIPMENT': <ToolOutlined />,
      'TOOL': <ToolOutlined />,
      'VEHICLE': <ToolOutlined />,
      'PERSONNEL': <TeamOutlined />,
      'SUBCONTRACTOR': <TeamOutlined />
    };
    return icons[type] || <ToolOutlined />;
  };

  // Calculate statistics
  const stats = {
    total: resources.length,
    allocated: resources.filter(r => r.status === 'DELIVERED' || r.status === 'IN_USE').length,
    planned: resources.filter(r => r.status === 'PLANNED').length
  };

  // Table columns
  const columns = [
    {
      title: 'Tên Tài Nguyên',
      dataIndex: 'resource_name',
      key: 'resource_name',
      render: (text: string, record: ProjectResource) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {getResourceTypeIcon(record.resource_type)}
            <Text strong>{text}</Text>
          </div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.resource_type}
          </Text>
        </div>
      )
    },
    {
      title: 'Loại',
      dataIndex: 'resource_type',
      key: 'resource_type',
      render: (type: string) => (
        <Tag color="blue">
          {type === 'MATERIAL' && 'Vật liệu'}
          {type === 'EQUIPMENT' && 'Thiết bị'}
          {type === 'TOOL' && 'Công cụ'}
          {type === 'VEHICLE' && 'Phương tiện'}
          {type === 'PERSONNEL' && 'Nhân lực'}
          {type === 'SUBCONTRACTOR' && 'Nhà thầu phụ'}
        </Tag>
      )
    },
    {
      title: 'Số Lượng',
      key: 'quantity',
      render: (_: any, record: ProjectResource) => (
        <div>
          <Text>{record.actual_quantity || 0} / {record.planned_quantity}</Text>
          <Progress 
            percent={Math.round(((record.actual_quantity || 0) / record.planned_quantity) * 100)} 
            size="small"
            status={record.actual_quantity >= record.planned_quantity ? 'success' : 'active'}
          />
        </div>
      )
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status === 'PLANNED' && 'Đã lập kế hoạch'}
          {status === 'ORDERED' && 'Đã đặt hàng'}
          {status === 'DELIVERED' && 'Đã giao'}
          {status === 'IN_USE' && 'Đang sử dụng'}
          {status === 'CONSUMED' && 'Đã sử dụng'}
          {status === 'RETURNED' && 'Đã trả'}
        </Tag>
      )
    },
    {
      title: 'Ưu Tiên',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => (
        <Tag color={getPriorityColor(priority)}>
          {priority === 'low' && 'Thấp'}
          {priority === 'medium' && 'Trung bình'}
          {priority === 'high' && 'Cao'}
          {priority === 'critical' && 'Nghiêm trọng'}
        </Tag>
      )
    },
    {
      title: 'Nhà Cung Cấp',
      dataIndex: 'supplier',
      key: 'supplier',
      render: (_: any, record: ProjectResource) => (
        <Text>{record.supplier_name || record.supplier?.supplier_name || 'Chưa xác định'}</Text>
      )
    },
    {
      title: 'Thao Tác',
      key: 'actions',
      render: (_: any, record: ProjectResource) => (
        <Space>
          <Tooltip key="view" title="Xem chi tiết">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => handleView(record)}
            />
          </Tooltip>
          <Tooltip key="edit" title="Chỉnh sửa">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip key="delete" title="Xóa">
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
              onClick={() => handleDelete(record._id || record.id)}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <div>
      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng Tài Nguyên"
              value={stats.total}
              prefix={<ToolOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đã Phân Bổ"
              value={stats.allocated}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đã Lập Kế Hoạch"
              value={stats.planned}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Resource Table */}
      <Card
        title="Quản Lý Tài Nguyên"
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            Thêm Tài Nguyên
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={resources}
          rowKey={(record) => record._id || record.id || `resource-${Math.random()}`}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} của ${total} tài nguyên`
          }}
        />
      </Card>

      {/* Add/Edit Resource Modal */}
      <Modal
        title={selectedResource ? 'Chỉnh Sửa Tài Nguyên' : 'Thêm Tài Nguyên Mới'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setSelectedResource(null);
        }}
        footer={null}
        width={800}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            resource_type: 'MATERIAL',
            status: 'PLANNED',
            priority: 'MEDIUM',
            quantity_allocated: 0
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="resource_name"
                label="Tên Tài Nguyên"
                rules={[
                  { required: true, message: 'Vui lòng nhập tên tài nguyên' },
                  { max: 255, message: 'Tên tài nguyên không được quá 255 ký tự' }
                ]}
              >
                <Input placeholder="Nhập tên tài nguyên" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="resource_type"
                label="Loại Tài Nguyên"
                rules={[{ required: true, message: 'Vui lòng chọn loại tài nguyên' }]}
              >
                <Select placeholder="Chọn loại tài nguyên">
                  <Option value="MATERIAL">Vật liệu</Option>
                  <Option value="EQUIPMENT">Thiết bị</Option>
                  <Option value="TOOL">Công cụ</Option>
                  <Option value="VEHICLE">Phương tiện</Option>
                  <Option value="PERSONNEL">Nhân lực</Option>
                  <Option value="SUBCONTRACTOR">Nhà thầu phụ</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="category"
                label="Danh Mục"
                rules={[{ required: true, message: 'Vui lòng nhập danh mục' }]}
              >
                <Input placeholder="Nhập vị trí lưu trữ" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="unit"
                label="Đơn Vị"
                rules={[{ required: true, message: 'Vui lòng nhập đơn vị' }]}
              >
                <Input placeholder="Nhập đơn vị đo (cái, kg, giờ, v.v.)" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Mô Tả"
            rules={[
              { required: true, message: 'Vui lòng nhập mô tả' },
              { max: 1000, message: 'Mô tả không được quá 1000 ký tự' }
            ]}
          >
            <TextArea 
              rows={3} 
              placeholder="Mô tả chi tiết về tài nguyên"
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="quantity_required"
                label="Số Lượng Yêu Cầu"
                rules={[
                  { required: true, message: 'Vui lòng nhập số lượng yêu cầu' },
                  { type: 'number', min: 1, message: 'Số lượng phải lớn hơn 0' }
                ]}
              >
                <InputNumber 
                  style={{ width: '100%' }} 
                  placeholder="0"
                  min={1}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="quantity_allocated"
                label="Số Lượng Đã Phân Bổ"
                rules={[
                  { type: 'number', min: 0, message: 'Số lượng không được âm' }
                ]}
              >
                <InputNumber 
                  style={{ width: '100%' }} 
                  placeholder="0"
                  min={0}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="status"
                label="Trạng Thái"
                rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
              >
                <Select placeholder="Chọn trạng thái">
                  <Option value="PLANNED">Đã lập kế hoạch</Option>
                  <Option value="ORDERED">Đã đặt hàng</Option>
                  <Option value="DELIVERED">Đã giao</Option>
                  <Option value="IN_USE">Đang sử dụng</Option>
                  <Option value="CONSUMED">Đã sử dụng</Option>
                  <Option value="RETURNED">Đã trả</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="priority"
                label="Ưu Tiên"
                rules={[{ required: true, message: 'Vui lòng chọn ưu tiên' }]}
              >
                <Select placeholder="Chọn ưu tiên">
                  <Option value="LOW">Thấp</Option>
                  <Option value="MEDIUM">Trung bình</Option>
                  <Option value="HIGH">Cao</Option>
                  <Option value="CRITICAL">Nghiêm trọng</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="supplier"
                label="Nhà Cung Cấp"
              >
                <Input placeholder="Nhập tên nhà cung cấp" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="required_date"
                label="Ngày Yêu Cầu"
                rules={[{ required: true, message: 'Vui lòng chọn ngày yêu cầu' }]}
              >
                <DatePicker 
                  style={{ width: '100%' }} 
                  placeholder="Chọn ngày yêu cầu"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="allocated_date"
                label="Ngày Phân Bổ"
              >
                <DatePicker 
                  style={{ width: '100%' }} 
                  placeholder="Chọn ngày phân bổ"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="notes"
            label="Ghi Chú"
            rules={[{ max: 500, message: 'Ghi chú không được quá 500 ký tự' }]}
          >
            <TextArea 
              rows={3} 
              placeholder="Ghi chú bổ sung về tài nguyên"
            />
          </Form.Item>

          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            gap: '8px',
            marginTop: '24px',
            paddingTop: '16px',
            borderTop: '1px solid #f0f0f0'
          }}>
            <Button onClick={() => setModalVisible(false)}>
              Hủy
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              icon={<PlusOutlined />}
            >
              {selectedResource ? 'Cập Nhật' : 'Tạo Tài Nguyên'}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* View Resource Modal */}
      <Modal
        title="Chi Tiết Tài Nguyên"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedResource && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Title level={4}>{selectedResource.resource_name}</Title>
                <Text>{selectedResource.description}</Text>
              </Col>
              
              <Col span={12}>
                <Text strong>Loại:</Text>
                <br />
                <Tag color="blue">
                  {selectedResource.resource_type === 'MATERIAL' && 'Vật liệu'}
                  {selectedResource.resource_type === 'EQUIPMENT' && 'Thiết bị'}
                  {selectedResource.resource_type === 'TOOL' && 'Công cụ'}
                  {selectedResource.resource_type === 'VEHICLE' && 'Phương tiện'}
                  {selectedResource.resource_type === 'PERSONNEL' && 'Nhân lực'}
                  {selectedResource.resource_type === 'SUBCONTRACTOR' && 'Nhà thầu phụ'}
                </Tag>
              </Col>
              
              <Col span={12}>
                <Text strong>Trạng Thái:</Text>
                <br />
                <Tag color={getStatusColor(selectedResource.status)}>
                  {selectedResource.status === 'PLANNED' && 'Đã lập kế hoạch'}
                  {selectedResource.status === 'ORDERED' && 'Đã đặt hàng'}
                  {selectedResource.status === 'DELIVERED' && 'Đã giao'}
                  {selectedResource.status === 'IN_USE' && 'Đang sử dụng'}
                  {selectedResource.status === 'CONSUMED' && 'Đã sử dụng'}
                  {selectedResource.status === 'RETURNED' && 'Đã trả'}
                </Tag>
              </Col>
              
              <Col span={12}>
                <Text strong>Số Lượng:</Text>
                <br />
                <Text>{selectedResource.actual_quantity || 0} / {selectedResource.planned_quantity} {selectedResource.unit_measure}</Text>
                <Progress 
                  percent={Math.round(((selectedResource.actual_quantity || 0) / selectedResource.planned_quantity) * 100)} 
                  status={selectedResource.actual_quantity >= selectedResource.planned_quantity ? 'success' : 'active'}
                />
              </Col>
              
              
              <Col span={12}>
                <Text strong>Nhà Cung Cấp:</Text>
                <br />
                <Text>{selectedResource.supplier_name || selectedResource.supplier?.supplier_name || 'Chưa xác định'}</Text>
              </Col>
              
              <Col span={12}>
                <Text strong>Ngày Yêu Cầu:</Text>
                <br />
                <Text>{dayjs(selectedResource.required_date).format('DD/MM/YYYY')}</Text>
              </Col>
              
              {selectedResource.delivered_date && (
                <Col span={12}>
                  <Text strong>Ngày Giao:</Text>
                  <br />
                  <Text>{dayjs(selectedResource.delivered_date).format('DD/MM/YYYY')}</Text>
                </Col>
              )}
              
              {selectedResource.notes && (
                <Col span={24}>
                  <Text strong>Ghi Chú:</Text>
                  <br />
                  <Text>{selectedResource.notes}</Text>
                </Col>
              )}
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ResourceManagement;
