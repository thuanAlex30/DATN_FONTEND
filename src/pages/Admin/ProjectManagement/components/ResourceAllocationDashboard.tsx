import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Card, 
  Row, 
  Col, 
  Table, 
  Button, 
  Space, 
  Tag, 
  Progress, 
  Statistic, 
  Typography, 
  Modal, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  InputNumber,
  message,
  Tooltip,
  Badge,
  Tabs,
  List,
  Avatar,
  Divider
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  ToolOutlined,
  UserOutlined,
  CalendarOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  BarChartOutlined,
  PieChartOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import type { RootState, AppDispatch } from '../../../../store';
import { fetchProjectResources } from '../../../../store/slices/projectResourceSlice';
import { fetchProjectAssignments } from '../../../../store/slices/projectAssignmentSlice';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

interface ResourceAllocationDashboardProps {
  projectId: string;
}

const ResourceAllocationDashboard: React.FC<ResourceAllocationDashboardProps> = ({ projectId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { resources, loading } = useSelector((state: RootState) => state.projectResource);
  const { assignments } = useSelector((state: RootState) => state.projectAssignment);
  
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedResource, setSelectedResource] = useState<any>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (projectId) {
      dispatch(fetchProjectResources(projectId));
      dispatch(fetchProjectAssignments(projectId));
    }
  }, [dispatch, projectId]);

  // Calculate resource allocation metrics
  const calculateMetrics = () => {
    const totalResources = resources.length;
    const allocatedResources = resources.filter(r => r.status === 'IN_USE').length;
    const plannedResources = resources.filter(r => r.status === 'PLANNED').length;
    const deliveredResources = resources.filter(r => r.status === 'DELIVERED').length;
    

    const utilizationRate = totalResources > 0 ? (allocatedResources / totalResources) * 100 : 0;

    return {
      totalResources,
      allocatedResources,
      plannedResources,
      deliveredResources,
      utilizationRate,
    };
  };

  const metrics = calculateMetrics();

  // Resource analysis by type
  const resourceAnalysis = () => {
    const byType = resources.reduce((acc: any, resource) => {
      if (!acc[resource.resource_type]) {
        acc[resource.resource_type] = {
          total: 0,
          allocated: 0,
        };
      }
      acc[resource.resource_type].total += 1;
      if (resource.status === 'IN_USE') {
        acc[resource.resource_type].allocated += 1;
      }
      return acc;
    }, {});

    return byType;
  };

  const resourceByType = resourceAnalysis();

  // Overdue resources
  const overdueResources = resources.filter(resource => {
    const requiredDate = new Date(resource.required_date);
    const now = new Date();
    return requiredDate < now && resource.status !== 'DELIVERED';
  });

  // Upcoming deliveries
  const upcomingDeliveries = resources.filter(resource => {
    const requiredDate = new Date(resource.required_date);
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    return requiredDate <= threeDaysFromNow && requiredDate > now && resource.status !== 'DELIVERED';
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLANNED': return 'blue';
      case 'ORDERED': return 'orange';
      case 'DELIVERED': return 'green';
      case 'IN_USE': return 'purple';
      case 'CONSUMED': return 'red';
      case 'RETURNED': return 'default';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PLANNED': return 'Đã lên kế hoạch';
      case 'ORDERED': return 'Đã đặt hàng';
      case 'DELIVERED': return 'Đã giao';
      case 'IN_USE': return 'Đang sử dụng';
      case 'CONSUMED': return 'Đã sử dụng hết';
      case 'RETURNED': return 'Đã trả';
      default: return status;
    }
  };

  const getResourceTypeIcon = (type: string) => {
    switch (type) {
      case 'MATERIAL': return '🧱';
      case 'EQUIPMENT': return '🔧';
      case 'TOOL': return '🛠️';
      case 'VEHICLE': return '🚗';
      case 'PERSONNEL': return '👥';
      case 'SUBCONTRACTOR': return '🏢';
      default: return '📦';
    }
  };

  const resourceColumns = [
    {
      title: 'Tài nguyên',
      key: 'resource',
      render: (_: any, record: any) => (
        <Space>
          <Avatar 
            style={{ backgroundColor: '#1890ff' }}
            icon={<ToolOutlined />}
          >
            {getResourceTypeIcon(record.resource_type)}
          </Avatar>
          <div>
            <Text strong>{record.resource_name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.resource_type}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Số lượng',
      dataIndex: 'planned_quantity',
      key: 'quantity',
      render: (quantity: number, record: any) => (
        <Space direction="vertical" size="small">
          <Text>{quantity} {record.unit_measure}</Text>
          <Progress 
            percent={record.planned_quantity > 0 ? (record.actual_quantity / record.planned_quantity) * 100 : 0}
            size="small"
            strokeColor={record.actual_quantity >= record.planned_quantity ? '#52c41a' : '#1890ff'}
          />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Thực tế: {record.actual_quantity}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Chi phí',
      render: (_: any, record: any) => (
        <Space direction="vertical" size="small">
          <Text strong>{record.name}</Text>
        </Space>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Ngày yêu cầu',
      dataIndex: 'required_date',
      key: 'required_date',
      render: (date: string) => (
        <Space direction="vertical" size="small">
          <Text>{dayjs(date).format('DD/MM/YYYY')}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {dayjs(date).fromNow()}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button 
              type="link" 
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedResource(record);
                // Show resource details modal
              }}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button 
              type="link" 
              icon={<EditOutlined />}
              onClick={() => {
                setSelectedResource(record);
                setEditModalVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button 
              type="link" 
              danger
              icon={<DeleteOutlined />}
              onClick={() => {
                // Handle delete
                message.info('Tính năng xóa sẽ được triển khai');
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="resource-allocation-dashboard">
      <Card>
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4} style={{ margin: 0 }}>
            <ToolOutlined /> Phân bổ Tài nguyên
          </Title>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setCreateModalVisible(true)}
          >
            Thêm Tài nguyên
          </Button>
        </div>

        <Tabs defaultActiveKey="overview">
          <TabPane tab="Tổng quan" key="overview">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card>
                    <Statistic
                      title="Tổng Tài nguyên"
                      value={metrics.totalResources}
                      prefix={<ToolOutlined />}
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Card>
                </motion.div>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <Card>
                    <Statistic
                      title="Đang Sử dụng"
                      value={metrics.allocatedResources}
                      prefix={<CheckCircleOutlined />}
                      valueStyle={{ color: '#52c41a' }}
                    />
                    <Progress 
                      percent={metrics.utilizationRate} 
                      size="small"
                      strokeColor="#52c41a"
                    />
                  </Card>
                </motion.div>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                </motion.div>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                >
                </motion.div>
              </Col>
            </Row>

            {/* Alerts */}
            <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
              <Col xs={24} md={12}>
                <Card title="Cảnh báo Tài nguyên">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    {overdueResources.length > 0 && (
                      <Badge count={overdueResources.length} size="small">
                        <Card size="small" style={{ backgroundColor: '#fff2f0', border: '1px solid #ffccc7' }}>
                          <Space>
                            <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
                            <Text strong>Tài nguyên quá hạn giao</Text>
                          </Space>
                        </Card>
                      </Badge>
                    )}
                    {upcomingDeliveries.length > 0 && (
                      <Badge count={upcomingDeliveries.length} size="small">
                        <Card size="small" style={{ backgroundColor: '#fff7e6', border: '1px solid #ffd591' }}>
                          <Space>
                            <ClockCircleOutlined style={{ color: '#faad14' }} />
                            <Text strong>Tài nguyên sắp đến hạn</Text>
                          </Space>
                        </Card>
                      </Badge>
                    )}
                    {overdueResources.length === 0 && upcomingDeliveries.length === 0 && (
                      <Card size="small" style={{ backgroundColor: '#f6ffed', border: '1px solid #b7eb8f' }}>
                        <Space>
                          <CheckCircleOutlined style={{ color: '#52c41a' }} />
                          <Text strong>Tất cả tài nguyên đang hoạt động tốt</Text>
                        </Space>
                      </Card>
                    )}
                  </Space>
                </Card>
              </Col>

              <Col xs={24} md={12}>
                <Card title="Phân bổ theo Loại">
                  <List
                    dataSource={Object.entries(resourceByType)}
                    renderItem={([type, data]: [string, any]) => (
                      <List.Item>
                        <List.Item.Meta
                          title={
                            <Space>
                              <Text>{getResourceTypeIcon(type)}</Text>
                              <Text strong>{type}</Text>
                            </Space>
                          }
                          description={
                            <Space>
                              <Text>{data.allocated}/{data.total} đang sử dụng</Text>
                              <Progress 
                                percent={data.total > 0 ? (data.allocated / data.total) * 100 : 0}
                                size="small"
                                style={{ width: '100px' }}
                              />
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="Danh sách" key="list">
            <Table
              columns={resourceColumns}
              dataSource={resources}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `${range[0]}-${range[1]} của ${total} tài nguyên`
              }}
            />
          </TabPane>

          <TabPane tab="Phân tích" key="analysis">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Card title="Phân bổ Chi phí theo Loại">
                  <List
                    dataSource={Object.entries(resourceByType)}
                    renderItem={([type, data]: [string, any]) => (
                      <List.Item>
                        <List.Item.Meta
                          title={
                            <Space>
                              <Text>{getResourceTypeIcon(type)}</Text>
                              <Text strong>{type}</Text>
                            </Space>
                          }
                          description={
                            <Space>
                              <Text>
                                Số lượng: {data.quantity}
                              </Text>
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>

              <Col xs={24} md={12}>
                <Card title="Hiệu suất Sử dụng">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                      <Text strong>Tỷ lệ sử dụng tài nguyên</Text>
                      <Progress 
                        percent={metrics.utilizationRate}
                        strokeColor={metrics.utilizationRate >= 80 ? '#52c41a' : 
                                   metrics.utilizationRate >= 60 ? '#faad14' : '#ff4d4f'}
                      />
                    </div>
                    <Divider />
                  </Space>
                </Card>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </Card>

      {/* Create Resource Modal */}
      <Modal
        title="Thêm Tài nguyên Mới"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => {
            // Handle create resource
            message.success('Tài nguyên đã được thêm thành công!');
            setCreateModalVisible(false);
            form.resetFields();
          }}
        >
          <Form.Item
            name="resource_name"
            label="Tên Tài nguyên"
            rules={[{ required: true, message: 'Vui lòng nhập tên tài nguyên' }]}
          >
            <Input placeholder="Nhập tên tài nguyên" />
          </Form.Item>

          <Form.Item
            name="resource_type"
            label="Loại Tài nguyên"
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

          <Form.Item
            name="planned_quantity"
            label="Số lượng Dự kiến"
            rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
          >
            <InputNumber 
              style={{ width: '100%' }}
              placeholder="Nhập số lượng"
              min={1}
            />
          </Form.Item>

          <Form.Item
            name="unit_measure"
            label="Đơn vị Đo"
            rules={[{ required: true, message: 'Vui lòng nhập đơn vị đo' }]}
          >
            <Input placeholder="VD: cái, kg, m², giờ..." />
          </Form.Item>


          <Form.Item
            name="required_date"
            label="Ngày Yêu cầu"
            rules={[{ required: true, message: 'Vui lòng chọn ngày yêu cầu' }]}
          >
            <DatePicker 
              style={{ width: '100%' }}
              placeholder="Chọn ngày yêu cầu"
            />
          </Form.Item>

          <Form.Item
            name="location"
            label="Vị trí"
          >
            <Input placeholder="Vị trí sử dụng tài nguyên" />
          </Form.Item>

          <Form.Item
            name="notes"
            label="Ghi chú"
          >
            <TextArea 
              rows={3} 
              placeholder="Ghi chú bổ sung về tài nguyên..." 
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ResourceAllocationDashboard;
