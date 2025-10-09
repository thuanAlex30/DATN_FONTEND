import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  Card,
  Button,
  Table,
  Space,
  Tag,
  Tooltip,
  Popconfirm,
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
  UserOutlined,
  ToolOutlined,
  ExperimentOutlined,
  CalendarOutlined,
  NumberOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import type { RootState, AppDispatch } from '../../../../store';
import { fetchProjectResources, deleteResource, setCurrentProjectId } from '../../../../store/slices/projectResourceSlice';
import { clearProjectResourceCache } from '../../../../utils/apiCache';
import CreateResourceModal from './CreateResourceModal';

const { Title, Text } = Typography;

interface ProjectResourcesProps {
  projectId: string;
}

const ProjectResources: React.FC<ProjectResourcesProps> = ({ projectId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { resources, loading, error } = useSelector((state: RootState) => state.projectResource);
  const [createModalVisible, setCreateModalVisible] = useState(false);

  useEffect(() => {
    if (projectId) {
      // Clear resources when switching projects
      dispatch(setCurrentProjectId(projectId));
      // Clear API cache to ensure fresh data
      clearProjectResourceCache();
      dispatch(fetchProjectResources(projectId));
    }
  }, [dispatch, projectId]);



  const handleDeleteResource = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tài nguyên này?')) {
      dispatch(deleteResource(id));
    }
  };

  const handleCreateSuccess = () => {
    // Refresh the resources list
    dispatch(fetchProjectResources(projectId));
  };


  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'PERSONNEL':
        return <UserOutlined className="text-blue-500" />;
      case 'EQUIPMENT':
        return <ToolOutlined className="text-green-500" />;
      case 'MATERIAL':
        return <ExperimentOutlined className="text-orange-500" />;
      case 'TOOL':
        return <ToolOutlined className="text-green-500" />;
      case 'VEHICLE':
        return <EnvironmentOutlined className="text-purple-500" />;
      case 'SUBCONTRACTOR':
        return <UserOutlined className="text-cyan-500" />;
      default:
        return <EnvironmentOutlined className="text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'PERSONNEL':
        return 'blue';
      case 'EQUIPMENT':
        return 'green';
      case 'MATERIAL':
        return 'orange';
      case 'TOOL':
        return 'green';
      case 'VEHICLE':
        return 'purple';
      case 'SUBCONTRACTOR':
        return 'cyan';
      default:
        return 'default';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'PERSONNEL':
        return 'Nhân lực';
      case 'EQUIPMENT':
        return 'Thiết bị';
      case 'MATERIAL':
        return 'Vật liệu';
      case 'TOOL':
        return 'Công cụ';
      case 'VEHICLE':
        return 'Phương tiện';
      case 'SUBCONTRACTOR':
        return 'Nhà thầu phụ';
      default:
        return 'Khác';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLANNED':
        return 'blue';
      case 'ORDERED':
        return 'orange';
      case 'DELIVERED':
        return 'green';
      case 'IN_USE':
        return 'green';
      case 'CONSUMED':
        return 'purple';
      case 'RETURNED':
        return 'cyan';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PLANNED':
        return 'Đã lên kế hoạch';
      case 'ORDERED':
        return 'Đã đặt hàng';
      case 'DELIVERED':
        return 'Đã giao';
      case 'IN_USE':
        return 'Đang sử dụng';
      case 'CONSUMED':
        return 'Đã sử dụng';
      case 'RETURNED':
        return 'Đã trả';
      default:
        return 'Không xác định';
    }
  };

  // Calculate statistics
  const stats = {
    total: resources?.length || 0,
    personnel: resources?.filter(r => r.resource_type === 'PERSONNEL').length || 0,
    equipment: resources?.filter(r => r.resource_type === 'EQUIPMENT').length || 0,
    material: resources?.filter(r => r.resource_type === 'MATERIAL').length || 0,
    tool: resources?.filter(r => r.resource_type === 'TOOL').length || 0,
    vehicle: resources?.filter(r => r.resource_type === 'VEHICLE').length || 0,
    subcontractor: resources?.filter(r => r.resource_type === 'SUBCONTRACTOR').length || 0,
    planned: resources?.filter(r => r.status === 'PLANNED').length || 0,
    inUse: resources?.filter(r => r.status === 'IN_USE').length || 0,
    consumed: resources?.filter(r => r.status === 'CONSUMED').length || 0
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  // Table columns definition
  const columns = [
    {
      title: 'Mã tài nguyên',
      dataIndex: '_id',
      key: '_id',
      width: 120,
      render: (id: string) => (
        <Text code className="text-xs">
          {id.slice(-8).toUpperCase()}
        </Text>
      ),
    },
    {
      title: 'Tên tài nguyên',
      dataIndex: 'resource_name',
      key: 'resource_name',
      width: 200,
      render: (name: string, record: any) => (
        <div>
          <div className="font-medium text-gray-900">{name}</div>
          <div className="text-xs text-gray-500">{record.description || 'Không có mô tả'}</div>
        </div>
      ),
    },
    {
      title: 'Loại tài nguyên',
      dataIndex: 'resource_type',
      key: 'resource_type',
      width: 150,
      render: (type: string) => (
        <Tag color={getTypeColor(type)} icon={getTypeIcon(type)}>
          {getTypeLabel(type)}
        </Tag>
      ),
    },
    {
      title: 'Số lượng',
      dataIndex: 'planned_quantity',
      key: 'planned_quantity',
      width: 120,
      render: (quantity: number, record: any) => (
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1">
            <NumberOutlined className="text-gray-400" />
            <span className="font-medium">{quantity}</span>
          </div>
          <div className="text-xs text-gray-500">{record.unit_measure}</div>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusLabel(status)}
        </Tag>
      ),
    },
    {
      title: 'Ngày yêu cầu',
      dataIndex: 'required_date',
      key: 'required_date',
      width: 130,
      render: (date: string) => (
        <div className="flex items-center space-x-1">
          <CalendarOutlined className="text-gray-400" />
          <span className="text-sm">{formatDate(date)}</span>
        </div>
      ),
    },
    {
      title: 'Vị trí',
      dataIndex: 'location',
      key: 'location',
      width: 150,
      render: (location: string) => (
        <div className="flex items-center space-x-1">
          <EnvironmentOutlined className="text-gray-400" />
          <span className="text-sm">{location || 'N/A'}</span>
        </div>
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 100,
      fixed: 'right' as const,
      render: (_: any, record: any) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              disabled
              className="text-blue-500 hover:text-blue-600"
            />
          </Tooltip>
          <Popconfirm
            title="Xóa tài nguyên"
            description="Bạn có chắc chắn muốn xóa tài nguyên này?"
            onConfirm={() => handleDeleteResource(record._id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Xóa">
              <Button
                type="text"
                icon={<DeleteOutlined />}
                size="small"
                className="text-red-500 hover:text-red-600"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Spin size="large" tip="Đang tải danh sách tài nguyên..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Lỗi tải tài nguyên"
        description={error}
        type="error"
        showIcon
        className="mb-4"
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Title level={2} className="flex items-center space-x-3 m-0">
            <EnvironmentOutlined className="text-blue-600 text-2xl" />
            <span>Tài nguyên Dự án</span>
          </Title>
          <Text type="secondary" className="text-base">
            Quản lý các tài nguyên trong dự án
          </Text>
        </div>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={() => setCreateModalVisible(true)}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          Thêm Tài nguyên
        </Button>
      </div>

      {/* Summary Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card className="text-center hover:shadow-lg transition-shadow duration-200">
            <Statistic
              title="Tổng số tài nguyên"
              value={stats.total}
              prefix={<EnvironmentOutlined className="text-blue-500" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card className="text-center hover:shadow-lg transition-shadow duration-200">
            <Statistic
              title="Nhân lực"
              value={stats.personnel}
              prefix={<UserOutlined className="text-blue-500" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card className="text-center hover:shadow-lg transition-shadow duration-200">
            <Statistic
              title="Thiết bị"
              value={stats.equipment}
              prefix={<ToolOutlined className="text-green-500" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card className="text-center hover:shadow-lg transition-shadow duration-200">
            <Statistic
              title="Vật liệu"
              value={stats.material}
              prefix={<ExperimentOutlined className="text-orange-500" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card className="text-center hover:shadow-lg transition-shadow duration-200">
            <Statistic
              title="Công cụ"
              value={stats.tool}
              prefix={<ToolOutlined className="text-green-500" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card className="text-center hover:shadow-lg transition-shadow duration-200">
            <Statistic
              title="Phương tiện"
              value={stats.vehicle}
              prefix={<EnvironmentOutlined className="text-purple-500" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card className="text-center hover:shadow-lg transition-shadow duration-200">
            <Statistic
              title="Nhà thầu phụ"
              value={stats.subcontractor}
              prefix={<UserOutlined className="text-cyan-500" />}
            />
          </Card>
        </Col>
      </Row>

      {/* Status Summary */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card className="text-center hover:shadow-lg transition-shadow duration-200">
            <Statistic
              title="Đã lên kế hoạch"
              value={stats.planned}
              prefix={<ClockCircleOutlined className="text-blue-500" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="text-center hover:shadow-lg transition-shadow duration-200">
            <Statistic
              title="Đang sử dụng"
              value={stats.inUse}
              prefix={<CheckCircleOutlined className="text-green-500" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="text-center hover:shadow-lg transition-shadow duration-200">
            <Statistic
              title="Đã sử dụng"
              value={stats.consumed}
              prefix={<CheckCircleOutlined className="text-purple-500" />}
            />
          </Card>
        </Col>
      </Row>

      {/* Resources Table */}
      <Card className="shadow-lg">
        {!resources || resources.length === 0 ? (
          <div className="text-center py-20">
            <EnvironmentOutlined className="text-6xl text-gray-300 mb-4" />
            <Title level={3} className="text-gray-500 mb-2">
              Chưa có tài nguyên nào
            </Title>
            <Text type="secondary" className="text-base mb-6 block">
              Dự án này chưa có tài nguyên nào được tạo.
            </Text>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={() => setCreateModalVisible(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Tạo tài nguyên đầu tiên
            </Button>
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={resources}
            rowKey="_id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total} tài nguyên`,
              className: "mt-4"
            }}
            scroll={{ x: 1000 }}
            className="modern-table"
          />
        )}
      </Card>

      <CreateResourceModal
        visible={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        onSuccess={handleCreateSuccess}
        projectId={projectId}
      />
    </motion.div>
  );
};

export default ProjectResources;
