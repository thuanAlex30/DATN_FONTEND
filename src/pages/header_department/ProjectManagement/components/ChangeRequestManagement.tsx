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
  Badge,
  Statistic,
  Progress,
  Avatar,
  Divider,
  Timeline,
  Steps
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  CalendarOutlined,
  FileTextOutlined,
  DollarOutlined,
  WarningOutlined
} from '@ant-design/icons';
import { projectChangeRequestService, type ProjectChangeRequest } from '../../../../services/projectChangeRequestService';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface ChangeRequestManagementProps {
  projectId: string;
}

const ChangeRequestManagement: React.FC<ChangeRequestManagementProps> = ({ projectId }) => {
  const [changeRequests, setChangeRequests] = useState<ProjectChangeRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedChangeRequest, setSelectedChangeRequest] = useState<ProjectChangeRequest | null>(null);
  const [form] = Form.useForm();

  // Load change requests
  const loadChangeRequests = async () => {
    if (!projectId) return;
    
    try {
      setLoading(true);
      const response = await projectChangeRequestService.getChangeRequestsByProject(projectId);
      setChangeRequests(response.data || []);
    } catch (error: any) {
      console.error('Error loading change requests:', error);
      message.error('Không thể tải danh sách yêu cầu thay đổi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChangeRequests();
  }, [projectId]);

  // Handle create/update change request
  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      
      const changeRequestData = {
        project_id: projectId,
        change_title: values.change_title,
        description: values.description,
        change_type: values.change_type,
        priority: values.priority,
        impact_level: values.impact_level,
        requested_by: values.requested_by,
        requested_date: dayjs(values.requested_date).toISOString(),
        target_implementation_date: values.target_implementation_date 
          ? dayjs(values.target_implementation_date).toISOString() 
          : null,
        status: values.status,
        approval_status: values.approval_status,
        approved_by: values.approved_by,
        approved_date: values.approved_date 
          ? dayjs(values.approved_date).toISOString() 
          : null,
        implementation_notes: values.implementation_notes,
        schedule_impact: values.schedule_impact || 0,
        risk_assessment: values.risk_assessment,
        stakeholders: values.stakeholders || [],
        attachments: values.attachments || []
      };

      if (selectedChangeRequest) {
        await projectChangeRequestService.updateChangeRequest(selectedChangeRequest.id, changeRequestData);
        message.success('Cập nhật yêu cầu thay đổi thành công!');
      } else {
        await projectChangeRequestService.createChangeRequest(changeRequestData);
        message.success('Tạo yêu cầu thay đổi thành công!');
      }

      setModalVisible(false);
      form.resetFields();
      setSelectedChangeRequest(null);
      loadChangeRequests();
    } catch (error: any) {
      console.error('Error saving change request:', error);
      message.error(error.response?.data?.message || 'Có lỗi xảy ra khi lưu yêu cầu thay đổi');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete change request
  const handleDelete = async (changeRequestId: string) => {
    try {
      await projectChangeRequestService.deleteChangeRequest(changeRequestId);
      message.success('Xóa yêu cầu thay đổi thành công!');
      loadChangeRequests();
    } catch (error: any) {
      console.error('Error deleting change request:', error);
      message.error('Có lỗi xảy ra khi xóa yêu cầu thay đổi');
    }
  };

  // Handle view change request
  const handleView = (changeRequest: ProjectChangeRequest) => {
    setSelectedChangeRequest(changeRequest);
    setViewModalVisible(true);
  };

  // Handle edit change request
  const handleEdit = (changeRequest: ProjectChangeRequest) => {
    setSelectedChangeRequest(changeRequest);
    form.setFieldsValue({
      ...changeRequest,
      requested_date: changeRequest.requested_date ? dayjs(changeRequest.requested_date) : null,
      target_implementation_date: changeRequest.target_implementation_date ? dayjs(changeRequest.target_implementation_date) : null,
      approved_date: changeRequest.approved_date ? dayjs(changeRequest.approved_date) : null
    });
    setModalVisible(true);
  };

  // Handle add new change request
  const handleAdd = () => {
    setSelectedChangeRequest(null);
    form.resetFields();
    setModalVisible(true);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'draft': 'default',
      'submitted': 'processing',
      'under_review': 'warning',
      'approved': 'success',
      'rejected': 'error',
      'implemented': 'success',
      'cancelled': 'default'
    };
    return colors[status] || 'default';
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    const colors: { [key: string]: string } = {
      'low': 'green',
      'medium': 'orange',
      'high': 'red',
      'critical': 'red'
    };
    return colors[priority] || 'default';
  };

  // Get impact level color
  const getImpactLevelColor = (impact: string) => {
    const colors: { [key: string]: string } = {
      'low': 'green',
      'medium': 'orange',
      'high': 'red',
      'critical': 'red'
    };
    return colors[impact] || 'default';
  };

  // Calculate statistics
  const stats = {
    total: changeRequests.length,
    pending: changeRequests.filter(cr => cr.status === 'submitted' || cr.status === 'under_review').length,
    approved: changeRequests.filter(cr => cr.status === 'approved').length,
    implemented: changeRequests.filter(cr => cr.status === 'implemented').length
  };

  // Table columns
  const columns = [
    {
      title: 'Tiêu Đề',
      dataIndex: 'change_title',
      key: 'change_title',
      render: (text: string, record: ProjectChangeRequest) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.change_type === 'scope' && 'Thay đổi phạm vi'}
            {record.change_type === 'schedule' && 'Thay đổi lịch trình'}
            {record.change_type === 'resource' && 'Thay đổi tài nguyên'}
            {record.change_type === 'quality' && 'Thay đổi chất lượng'}
          </Text>
        </div>
      )
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status === 'draft' && 'Bản nháp'}
          {status === 'submitted' && 'Đã gửi'}
          {status === 'under_review' && 'Đang xem xét'}
          {status === 'approved' && 'Đã phê duyệt'}
          {status === 'rejected' && 'Đã từ chối'}
          {status === 'implemented' && 'Đã triển khai'}
          {status === 'cancelled' && 'Đã hủy'}
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
      title: 'Tác Động',
      dataIndex: 'impact_level',
      key: 'impact_level',
      render: (impact: string) => (
        <Tag color={getImpactLevelColor(impact)}>
          {impact === 'low' && 'Thấp'}
          {impact === 'medium' && 'Trung bình'}
          {impact === 'high' && 'Cao'}
          {impact === 'critical' && 'Nghiêm trọng'}
        </Tag>
      )
    },
    {
      title: 'Người Yêu Cầu',
      dataIndex: 'requested_by',
      key: 'requested_by',
      render: (requestedBy: string) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Avatar size="small" icon={<UserOutlined />} />
          <Text>{requestedBy}</Text>
        </div>
      )
    },
    {
      title: 'Ngày Yêu Cầu',
      dataIndex: 'requested_date',
      key: 'requested_date',
      render: (date: string) => (
        <Text>{dayjs(date).format('DD/MM/YYYY')}</Text>
      )
    },
    {
      title: 'Thao Tác',
      key: 'actions',
      render: (_, record: ProjectChangeRequest) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => handleView(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
              onClick={() => handleDelete(record.id)}
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
              title="Tổng Yêu Cầu"
              value={stats.total}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đang Chờ"
              value={stats.pending}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đã Phê Duyệt"
              value={stats.approved}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đã Triển Khai"
              value={stats.implemented}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Change Requests Table */}
      <Card
        title="Quản Lý Yêu Cầu Thay Đổi"
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            Tạo Yêu Cầu Thay Đổi
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={changeRequests}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} của ${total} yêu cầu thay đổi`
          }}
        />
      </Card>

      {/* Add/Edit Change Request Modal */}
      <Modal
        title={selectedChangeRequest ? 'Chỉnh Sửa Yêu Cầu Thay Đổi' : 'Tạo Yêu Cầu Thay Đổi Mới'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setSelectedChangeRequest(null);
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
            change_type: 'scope',
            priority: 'medium',
            impact_level: 'medium',
            status: 'draft',
            approval_status: 'pending',
            schedule_impact: 0
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="change_title"
                label="Tiêu Đề Thay Đổi"
                rules={[
                  { required: true, message: 'Vui lòng nhập tiêu đề thay đổi' },
                  { max: 255, message: 'Tiêu đề không được quá 255 ký tự' }
                ]}
              >
                <Input placeholder="Nhập tiêu đề thay đổi" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="change_type"
                label="Loại Thay Đổi"
                rules={[{ required: true, message: 'Vui lòng chọn loại thay đổi' }]}
              >
                <Select placeholder="Chọn loại thay đổi">
                  <Option value="scope">Thay đổi phạm vi</Option>
                  <Option value="schedule">Thay đổi lịch trình</Option>
                  <Option value="resource">Thay đổi tài nguyên</Option>
                  <Option value="quality">Thay đổi chất lượng</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Mô Tả Chi Tiết"
            rules={[
              { required: true, message: 'Vui lòng nhập mô tả' },
              { max: 2000, message: 'Mô tả không được quá 2000 ký tự' }
            ]}
          >
            <TextArea 
              rows={4} 
              placeholder="Mô tả chi tiết về yêu cầu thay đổi"
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="priority"
                label="Ưu Tiên"
                rules={[{ required: true, message: 'Vui lòng chọn ưu tiên' }]}
              >
                <Select placeholder="Chọn ưu tiên">
                  <Option value="low">Thấp</Option>
                  <Option value="medium">Trung bình</Option>
                  <Option value="high">Cao</Option>
                  <Option value="critical">Nghiêm trọng</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="impact_level"
                label="Mức Độ Tác Động"
                rules={[{ required: true, message: 'Vui lòng chọn mức độ tác động' }]}
              >
                <Select placeholder="Chọn mức độ tác động">
                  <Option value="low">Thấp</Option>
                  <Option value="medium">Trung bình</Option>
                  <Option value="high">Cao</Option>
                  <Option value="critical">Nghiêm trọng</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="status"
                label="Trạng Thái"
                rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
              >
                <Select placeholder="Chọn trạng thái">
                  <Option value="draft">Bản nháp</Option>
                  <Option value="submitted">Đã gửi</Option>
                  <Option value="under_review">Đang xem xét</Option>
                  <Option value="approved">Đã phê duyệt</Option>
                  <Option value="rejected">Đã từ chối</Option>
                  <Option value="implemented">Đã triển khai</Option>
                  <Option value="cancelled">Đã hủy</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="requested_by"
                label="Người Yêu Cầu"
                rules={[{ required: true, message: 'Vui lòng nhập người yêu cầu' }]}
              >
                <Input placeholder="Nhập tên người yêu cầu" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="requested_date"
                label="Ngày Yêu Cầu"
                rules={[{ required: true, message: 'Vui lòng chọn ngày yêu cầu' }]}
              >
                <DatePicker 
                  style={{ width: '100%' }} 
                  placeholder="Chọn ngày yêu cầu"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="target_implementation_date"
                label="Ngày Triển Khai Dự Kiến"
              >
                <DatePicker 
                  style={{ width: '100%' }} 
                  placeholder="Chọn ngày triển khai dự kiến"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="approved_by"
                label="Người Phê Duyệt"
              >
                <Input placeholder="Nhập tên người phê duyệt" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Tác Động Chi Phí (VNĐ)"
              >
                <InputNumber 
                  style={{ width: '100%' }} 
                  placeholder="0"
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="schedule_impact"
                label="Tác Động Lịch Trình (Ngày)"
              >
                <InputNumber 
                  style={{ width: '100%' }} 
                  placeholder="0"
                  min={0}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="risk_assessment"
            label="Đánh Giá Rủi Ro"
            rules={[{ max: 1000, message: 'Đánh giá rủi ro không được quá 1000 ký tự' }]}
          >
            <TextArea 
              rows={3} 
              placeholder="Đánh giá các rủi ro có thể xảy ra khi thực hiện thay đổi"
            />
          </Form.Item>

          <Form.Item
            name="implementation_notes"
            label="Ghi Chú Triển Khai"
            rules={[{ max: 1000, message: 'Ghi chú không được quá 1000 ký tự' }]}
          >
            <TextArea 
              rows={3} 
              placeholder="Ghi chú về việc triển khai thay đổi"
            />
          </Form.Item>

          <Form.Item
            name="stakeholders"
            label="Các Bên Liên Quan"
          >
            <Select
              mode="tags"
              placeholder="Nhập tên các bên liên quan"
              style={{ width: '100%' }}
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
              {selectedChangeRequest ? 'Cập Nhật' : 'Tạo Yêu Cầu'}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* View Change Request Modal */}
      <Modal
        title="Chi Tiết Yêu Cầu Thay Đổi"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={null}
        width={700}
      >
        {selectedChangeRequest && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Title level={4}>{selectedChangeRequest.change_title}</Title>
                <Text>{selectedChangeRequest.description}</Text>
              </Col>
              
              <Col span={12}>
                <Text strong>Loại Thay Đổi:</Text>
                <br />
                <Tag color="blue">
                  {selectedChangeRequest.change_type === 'scope' && 'Thay đổi phạm vi'}
                  {selectedChangeRequest.change_type === 'schedule' && 'Thay đổi lịch trình'}
                  {selectedChangeRequest.change_type === 'resource' && 'Thay đổi tài nguyên'}
                  {selectedChangeRequest.change_type === 'quality' && 'Thay đổi chất lượng'}
                </Tag>
              </Col>
              
              <Col span={12}>
                <Text strong>Trạng Thái:</Text>
                <br />
                <Tag color={getStatusColor(selectedChangeRequest.status)}>
                  {selectedChangeRequest.status === 'draft' && 'Bản nháp'}
                  {selectedChangeRequest.status === 'submitted' && 'Đã gửi'}
                  {selectedChangeRequest.status === 'under_review' && 'Đang xem xét'}
                  {selectedChangeRequest.status === 'approved' && 'Đã phê duyệt'}
                  {selectedChangeRequest.status === 'rejected' && 'Đã từ chối'}
                  {selectedChangeRequest.status === 'implemented' && 'Đã triển khai'}
                  {selectedChangeRequest.status === 'cancelled' && 'Đã hủy'}
                </Tag>
              </Col>
              
              <Col span={12}>
                <Text strong>Ưu Tiên:</Text>
                <br />
                <Tag color={getPriorityColor(selectedChangeRequest.priority)}>
                  {selectedChangeRequest.priority === 'low' && 'Thấp'}
                  {selectedChangeRequest.priority === 'medium' && 'Trung bình'}
                  {selectedChangeRequest.priority === 'high' && 'Cao'}
                  {selectedChangeRequest.priority === 'critical' && 'Nghiêm trọng'}
                </Tag>
              </Col>
              
              <Col span={12}>
                <Text strong>Mức Độ Tác Động:</Text>
                <br />
                <Tag color={getImpactLevelColor(selectedChangeRequest.impact_level)}>
                  {selectedChangeRequest.impact_level === 'low' && 'Thấp'}
                  {selectedChangeRequest.impact_level === 'medium' && 'Trung bình'}
                  {selectedChangeRequest.impact_level === 'high' && 'Cao'}
                  {selectedChangeRequest.impact_level === 'critical' && 'Nghiêm trọng'}
                </Tag>
              </Col>
              
              <Col span={12}>
                <Text strong>Người Yêu Cầu:</Text>
                <br />
                <Text>{selectedChangeRequest.requested_by}</Text>
              </Col>
              
              <Col span={12}>
                <Text strong>Ngày Yêu Cầu:</Text>
                <br />
                <Text>{dayjs(selectedChangeRequest.requested_date).format('DD/MM/YYYY')}</Text>
              </Col>
              
              {selectedChangeRequest.target_implementation_date && (
                <Col span={12}>
                  <Text strong>Ngày Triển Khai Dự Kiến:</Text>
                  <br />
                  <Text>{dayjs(selectedChangeRequest.target_implementation_date).format('DD/MM/YYYY')}</Text>
                </Col>
              )}
              
              {selectedChangeRequest.approved_by && (
                <Col span={12}>
                  <Text strong>Người Phê Duyệt:</Text>
                  <br />
                  <Text>{selectedChangeRequest.approved_by}</Text>
                </Col>
              )}
              
              <Col span={12}>
                <Text strong>Tác Động Chi Phí:</Text>
                <br />
              </Col>
              
              <Col span={12}>
                <Text strong>Tác Động Lịch Trình:</Text>
                <br />
                <Text type={selectedChangeRequest.schedule_impact > 0 ? 'danger' : selectedChangeRequest.schedule_impact < 0 ? 'success' : undefined}>
                  {selectedChangeRequest.schedule_impact > 0 ? '+' : ''}{selectedChangeRequest.schedule_impact} ngày
                </Text>
              </Col>
              
              {selectedChangeRequest.risk_assessment && (
                <Col span={24}>
                  <Text strong>Đánh Giá Rủi Ro:</Text>
                  <br />
                  <Text>{selectedChangeRequest.risk_assessment}</Text>
                </Col>
              )}
              
              {selectedChangeRequest.implementation_notes && (
                <Col span={24}>
                  <Text strong>Ghi Chú Triển Khai:</Text>
                  <br />
                  <Text>{selectedChangeRequest.implementation_notes}</Text>
                </Col>
              )}
              
              {selectedChangeRequest.stakeholders && selectedChangeRequest.stakeholders.length > 0 && (
                <Col span={24}>
                  <Text strong>Các Bên Liên Quan:</Text>
                  <br />
                  {selectedChangeRequest.stakeholders.map((stakeholder, index) => (
                    <Tag key={index} style={{ marginBottom: '4px' }}>
                      {stakeholder}
                    </Tag>
                  ))}
                </Col>
              )}
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ChangeRequestManagement;
