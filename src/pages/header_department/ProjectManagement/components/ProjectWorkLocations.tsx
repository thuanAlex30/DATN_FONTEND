import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  Button,
  Table,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Space,
  Tag,
  Tooltip,
  Popconfirm,
  message,
  Typography,
  Row,
  Col,
  Statistic,
  Alert,
  Spin
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EnvironmentOutlined,
  SafetyOutlined,
  UserOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import type { RootState, AppDispatch } from '../../../../store';
import { fetchAreasByProject, setCurrentProjectId } from '../../../../store/slices/siteAreaSlice';
import { type WorkLocation } from '../../../../services/workLocationService';
import workLocationService from '../../../../services/workLocationService';
import { getPPEItems } from '../../../../services/ppeService';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface ProjectWorkLocationsProps {
  projectId: string;
}

interface WorkLocationFormData {
  area_id: string;
  location_name: string;
  location_code: string;
  location_type: 'WORKSTATION' | 'MEETING_ROOM' | 'STORAGE' | 'SAFETY_ZONE' | 'EQUIPMENT_AREA';
  access_requirements?: string;
  capacity: number;
  special_instructions?: string;
  safety_equipment_required?: string[];
  project_id?: string;
}

const ProjectWorkLocations: React.FC<ProjectWorkLocationsProps> = ({ projectId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { areas } = useSelector((state: RootState) => state.siteArea);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [workLocations, setWorkLocations] = useState<WorkLocation[]>([]);
  const [ppeItems, setPpeItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingLocation, setEditingLocation] = useState<WorkLocation | null>(null);
  const [form] = Form.useForm();

  // Load PPE items
  const loadPPEItems = useCallback(async () => {
    try {
      const itemsData = await getPPEItems();
      setPpeItems(itemsData || []);
    } catch (error) {
      console.error('Error loading PPE items:', error);
      message.error('Không thể tải danh sách thiết bị PPE');
    }
  }, []);

  // Load areas for the project
  const loadAreas = useCallback(async () => {
    try {
      setLoading(true);
      dispatch(setCurrentProjectId(projectId));
      await dispatch(fetchAreasByProject(projectId)).unwrap();
    } catch (error) {
      console.error('Error loading areas:', error);
      message.error('Không thể tải danh sách khu vực');
    } finally {
      setLoading(false);
    }
  }, [dispatch, projectId]);

  // Load work locations
  const loadWorkLocations = useCallback(async () => {
    try {
      setLoading(true);
      
      // Use the new project-based API instead of area-based
      const locations = await workLocationService.getProjectLocations(projectId);
      setWorkLocations(locations);
      
      console.log('ProjectWorkLocations: Loaded work locations:', locations.length);
    } catch (error) {
      console.error('Error loading work locations:', error);
      message.error('Không thể tải danh sách vị trí làm việc');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Load data on component mount
  useEffect(() => {
    if (projectId) {
      loadAreas();
      loadPPEItems();
      loadWorkLocations(); // Load work locations directly without waiting for areas
    }
  }, [projectId, loadAreas, loadPPEItems, loadWorkLocations]);

  // Handle form submission
  const handleSubmit = async (values: WorkLocationFormData) => {
    try {
      setLoading(true);
      
      // Transform safety_equipment_required from string array to object array
      const transformedValues = {
        ...values,
        safety_equipment_required: values.safety_equipment_required?.map(equipment => ({
          equipment_name: equipment,
          is_mandatory: true
        })) || []
      };
      
      if (editingLocation) {
        // Update existing location
        const updatedLocation = await workLocationService.updateLocation(
          editingLocation._id,
          transformedValues
        );
        setWorkLocations(prev => 
          prev.map(loc => loc._id === editingLocation._id ? updatedLocation : loc)
        );
        message.success('Cập nhật vị trí làm việc thành công');
      } else {
        // Create new location
        const newLocation = await workLocationService.createLocation({
          ...transformedValues,
          project_id: projectId
        });
        // Reload all locations to ensure consistency
        await loadWorkLocations();
        message.success('Tạo vị trí làm việc thành công');
      }
      
      setModalVisible(false);
      setEditingLocation(null);
      form.resetFields();
      form.setFieldsValue({
        capacity: 1,
        location_type: 'WORKSTATION'
      });
    } catch (error: any) {
      console.error('Error saving work location:', error);
      message.error('Không thể lưu vị trí làm việc: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (locationId: string) => {
    try {
      setLoading(true);
      await workLocationService.deleteLocation(locationId);
      // Reload all locations to ensure consistency
      await loadWorkLocations();
      message.success('Xóa vị trí làm việc thành công');
    } catch (error: any) {
      console.error('Error deleting work location:', error);
      message.error('Không thể xóa vị trí làm việc: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Handle edit
  const handleEdit = (location: WorkLocation) => {
    setEditingLocation(location);
    form.setFieldsValue({
      area_id: location.area_id,
      location_name: location.location_name,
      location_code: location.location_code,
      location_type: location.location_type,
      access_requirements: location.access_requirements,
      capacity: location.capacity,
      special_instructions: location.special_instructions,
      safety_equipment_required: location.safety_equipment_required?.map(item => item.equipment_name) || []
    });
    setModalVisible(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setModalVisible(false);
    setEditingLocation(null);
    form.resetFields();
    form.setFieldsValue({
      capacity: 1,
      location_type: 'WORKSTATION'
    });
  };

  // Get area name by ID
  const getAreaName = (areaId: string) => {
    const area = areas.find(a => a._id === areaId);
    return area?.area_name || 'Không xác định';
  };

  // Get location type color
  const getLocationTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'WORKSTATION': 'blue',
      'MEETING_ROOM': 'green',
      'STORAGE': 'orange',
      'SAFETY_ZONE': 'red',
      'EQUIPMENT_AREA': 'purple'
    };
    return colors[type] || 'default';
  };

  // Get location type label
  const getLocationTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'WORKSTATION': 'Vị trí làm việc',
      'MEETING_ROOM': 'Phòng họp',
      'STORAGE': 'Kho bãi',
      'SAFETY_ZONE': 'Khu vực an toàn',
      'EQUIPMENT_AREA': 'Khu vực thiết bị'
    };
    return labels[type] || type;
  };

  // Table columns
  const columns = [
    {
      title: 'Mã vị trí',
      dataIndex: 'location_code',
      key: 'location_code',
      width: 120,
      render: (code: string) => (
        <Text code className="text-xs">{code}</Text>
      )
    },
    {
      title: 'Tên vị trí',
      dataIndex: 'location_name',
      key: 'location_name',
      render: (name: string, record: WorkLocation) => (
        <div>
          <Text strong>{name}</Text>
          <br />
          <Text type="secondary" className="text-xs">
            {getAreaName(record.area_id)}
          </Text>
        </div>
      )
    },
    {
      title: 'Loại vị trí',
      dataIndex: 'location_type',
      key: 'location_type',
      width: 150,
      render: (type: string) => (
        <Tag color={getLocationTypeColor(type)}>
          {getLocationTypeLabel(type)}
        </Tag>
      )
    },
    {
      title: 'Sức chứa',
      dataIndex: 'capacity',
      key: 'capacity',
      width: 100,
      render: (capacity: number) => (
        <div className="text-center">
          <UserOutlined className="mr-1" />
          {capacity}
        </div>
      )
    },
    {
      title: 'Yêu cầu an toàn',
      dataIndex: 'safety_equipment_required',
      key: 'safety_equipment_required',
      width: 200,
      render: (equipment: { equipment_name: string; is_mandatory: boolean }[], record: WorkLocation) => (
        <div key={`equipment-${record._id}`}>
          {equipment && equipment.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {equipment.slice(0, 2).map((item, index) => (
                <Tag key={`${record._id}-equipment-${index}-${item.equipment_name}`} color="red" size="small">
                  <SafetyOutlined className="mr-1" />
                  {item.equipment_name}
                </Tag>
              ))}
              {equipment.length > 2 && (
                <Tag key={`${record._id}-equipment-more`} color="red" size="small">
                  +{equipment.length - 2}
                </Tag>
              )}
            </div>
          ) : (
            <Tag key={`${record._id}-equipment-safe`} color="green" size="small">
              <CheckCircleOutlined className="mr-1" />
              An toàn
            </Tag>
          )}
        </div>
      )
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 120,
      render: (_, record: WorkLocation) => (
        <Space>
          <Tooltip key={`edit-${record._id}`} title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              size="small"
            />
          </Tooltip>
          <Popconfirm
            key={`delete-${record._id}`}
            title="Xóa vị trí làm việc"
            description="Bạn có chắc chắn muốn xóa vị trí làm việc này?"
            onConfirm={() => handleDelete(record._id)}
            okText="Xóa"
            cancelText="Hủy"
            icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
          >
            <Tooltip title="Xóa">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                size="small"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  // Statistics
  const stats = {
    total: workLocations.length,
    workstations: workLocations.filter(loc => loc.location_type === 'WORKSTATION').length,
    meetingRooms: workLocations.filter(loc => loc.location_type === 'MEETING_ROOM').length,
    storage: workLocations.filter(loc => loc.location_type === 'STORAGE').length,
    safetyZones: workLocations.filter(loc => loc.location_type === 'SAFETY_ZONE').length,
    equipmentAreas: workLocations.filter(loc => loc.location_type === 'EQUIPMENT_AREA').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <Title level={3} className="mb-2">
            <EnvironmentOutlined className="mr-2" />
            Vị trí Làm việc
          </Title>
          <Text type="secondary">
            Quản lý các vị trí làm việc trong dự án
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalVisible(true)}
          size="large"
        >
          Thêm Vị trí Làm việc
        </Button>
      </div>

      {/* Statistics */}
      <Row gutter={16}>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card>
            <Statistic
              title="Tổng số vị trí"
              value={stats.total}
              prefix={<EnvironmentOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card>
            <Statistic
              title="Vị trí làm việc"
              value={stats.workstations}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card>
            <Statistic
              title="Phòng họp"
              value={stats.meetingRooms}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card>
            <Statistic
              title="Kho bãi"
              value={stats.storage}
              prefix={<EnvironmentOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card>
            <Statistic
              title="Khu vực an toàn"
              value={stats.safetyZones}
              prefix={<SafetyOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card>
            <Statistic
              title="Khu vực thiết bị"
              value={stats.equipmentAreas}
              prefix={<EnvironmentOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Alert for no areas */}
      {areas.length === 0 && (
        <Alert
          message="Chưa có khu vực nào"
          description="Vui lòng tạo khu vực trước khi thêm vị trí làm việc."
          type="warning"
          showIcon
        />
      )}

      {/* Work Locations Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={workLocations}
          rowKey={(record) => record._id || record.id || `location-${workLocations.indexOf(record)}`}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} vị trí làm việc`
          }}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={editingLocation ? 'Chỉnh sửa Vị trí Làm việc' : 'Thêm Vị trí Làm việc'}
        open={modalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-4"
        >
          <Form.Item
            name="area_id"
            label="Khu vực"
            rules={[{ required: true, message: 'Vui lòng chọn khu vực' }]}
          >
            <Select
              placeholder="Chọn khu vực"
              showSearch
              optionFilterProp="children"
            >
              {areas.map(area => (
                <Select.Option key={area._id} value={area._id}>
                  {area.area_name} ({area.area_type})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="location_name"
                label="Tên vị trí"
                rules={[{ required: true, message: 'Vui lòng nhập tên vị trí' }]}
              >
                <Input placeholder="Nhập tên vị trí" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="location_code"
                label="Mã vị trí"
                rules={[{ required: true, message: 'Vui lòng nhập mã vị trí' }]}
              >
                <Input placeholder="Nhập mã vị trí" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="location_type"
                label="Loại vị trí"
                rules={[{ required: true, message: 'Vui lòng chọn loại vị trí' }]}
              >
                <Select placeholder="Chọn loại vị trí">
                  <Select.Option value="WORKSTATION">Vị trí làm việc</Select.Option>
                  <Select.Option value="MEETING_ROOM">Phòng họp</Select.Option>
                  <Select.Option value="STORAGE">Kho bãi</Select.Option>
                  <Select.Option value="SAFETY_ZONE">Khu vực an toàn</Select.Option>
                  <Select.Option value="EQUIPMENT_AREA">Khu vực thiết bị</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="capacity"
                label="Sức chứa (người)"
                rules={[{ required: true, message: 'Vui lòng nhập sức chứa' }]}
              >
                <InputNumber
                  min={1}
                  max={1000}
                  placeholder="Nhập sức chứa"
                  className="w-full"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="access_requirements"
            label="Yêu cầu truy cập"
          >
            <TextArea
              rows={3}
              placeholder="Nhập yêu cầu truy cập (nếu có)"
            />
          </Form.Item>

          <Form.Item
            name="special_instructions"
            label="Hướng dẫn đặc biệt"
          >
            <TextArea
              rows={3}
              placeholder="Nhập hướng dẫn đặc biệt (nếu có)"
            />
          </Form.Item>

          <Form.Item
            name="safety_equipment_required"
            label="Thiết bị an toàn cần thiết"
          >
            <Select
              mode="multiple"
              placeholder="Chọn thiết bị an toàn cần thiết"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.children as string)?.toLowerCase().includes(input.toLowerCase())
              }
            >
              {ppeItems.map(item => (
                <Select.Option key={item.id || item._id} value={item.item_name}>
                  <Space>
                    <SafetyOutlined />
                    <div>
                      <div>{item.item_name}</div>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {item.item_code} - {item.brand} {item.model}
                      </Text>
                    </div>
                  </Space>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item className="mb-0">
            <Space className="w-full justify-end">
              <Button onClick={handleModalClose}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingLocation ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProjectWorkLocations;
