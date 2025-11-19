import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  InputNumber, 
  Button, 
  message, 
  Space,
  Row,
  Col,
  Typography,
  Divider,
  Card,
  Progress,
  Tag
} from 'antd';
import dayjs from 'dayjs';
import { 
  EditOutlined, 
  CalendarOutlined, 
  DollarOutlined, 
  FlagOutlined,
  BarChartOutlined,
  TeamOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';
import projectService from '../../../../services/projectService';
import type { Project, UpdateProjectData } from '../../../../types/project';
import type { Site } from '../../../../types/project';

interface EditProjectOverviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  projectId: string;
  project?: Project | null;
}

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const EditProjectOverviewModal: React.FC<EditProjectOverviewModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  projectId,
  project
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [sites, setSites] = useState<Site[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(project || null);

  useEffect(() => {
    if (isOpen) {
      loadSites();
      if (projectId) {
        loadProject();
      }
    }
  }, [isOpen, projectId]);

  useEffect(() => {
    if (currentProject) {
      form.setFieldsValue({
        project_name: currentProject.project_name,
        description: currentProject.description,
        status: currentProject.status,
        priority: currentProject.priority,
        progress: currentProject.progress,
        start_date: currentProject.start_date ? dayjs(currentProject.start_date) : null,
        end_date: currentProject.end_date ? dayjs(currentProject.end_date) : null,
        site_id: currentProject.site_id?.id || currentProject.site_id
      });
    }
  }, [currentProject]);

  const loadSites = async () => {
    try {
      const response = await projectService.getAllSites({ is_active: true });
      if (response.success) {
        setSites(response.data || []);
      }
    } catch (err) {
      console.error('Error loading sites:', err);
    }
  };

  const loadProject = async () => {
    try {
      const response = await projectService.getProjectById(projectId);
      if (response.success) {
        setCurrentProject(response.data);
      }
    } catch (err) {
      console.error('Error loading project:', err);
    }
  };

  const handleSubmit = async (values: any) => {
    if (!currentProject) return;

    try {
      setLoading(true);
      
      const updateData: UpdateProjectData = {
        project_name: values.project_name,
        description: values.description,
        status: values.status,
        priority: values.priority,
        progress: values.progress,
        start_date: values.start_date?.format('YYYY-MM-DD'),
        end_date: values.end_date?.format('YYYY-MM-DD'),
        site_id: values.site_id
      };

      const response = await projectService.updateProject(currentProject.id, updateData);
      
      if (response.success) {
        message.success('Cập nhật tổng quan dự án thành công');
        form.resetFields();
        onSuccess();
        onClose();
      } else {
        message.error(response.message || 'Không thể cập nhật tổng quan dự án');
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể cập nhật tổng quan dự án');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLANNING': return 'blue';
      case 'ACTIVE': return 'green';
      case 'COMPLETED': return 'purple';
      case 'CANCELLED': return 'red';
      case 'ON_HOLD': return 'orange';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW': return 'green';
      case 'MEDIUM': return 'blue';
      case 'HIGH': return 'orange';
      case 'URGENT': return 'red';
      default: return 'default';
    }
  };

  return (
    <Modal
      title={
        <Space>
          <BarChartOutlined />
          Chỉnh sửa tổng quan dự án
        </Space>
      }
      open={isOpen}
      onCancel={handleCancel}
      footer={null}
      width={900}
      destroyOnHidden
    >
      <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        {/* Project Info Card */}
        {currentProject && (
          <Card 
            style={{ marginBottom: '24px', borderRadius: '12px' }}
            bodyStyle={{ padding: '20px' }}
          >
            <Row gutter={[16, 16]} align="middle">
              <Col span={16}>
                <Title level={4} style={{ margin: 0, color: '#1e293b' }}>
                  {currentProject.project_name}
                </Title>
                <Text type="secondary" style={{ fontSize: '14px' }}>
                  {currentProject.description}
                </Text>
              </Col>
              <Col span={8} style={{ textAlign: 'right' }}>
                <Space direction="vertical" size="small">
                  <Tag color={getStatusColor(currentProject.status)} style={{ fontSize: '12px', padding: '4px 12px' }}>
                    {currentProject.status === 'PLANNING' ? 'LẬP KẾ HOẠCH' :
                     currentProject.status === 'ACTIVE' ? 'ĐANG HOẠT ĐỘNG' :
                     currentProject.status === 'COMPLETED' ? 'HOÀN THÀNH' :
                     currentProject.status === 'CANCELLED' ? 'ĐÃ HỦY' :
                     currentProject.status === 'ON_HOLD' ? 'TẠM DỪNG' : currentProject.status}
                  </Tag>
                  <Tag color={getPriorityColor(currentProject.priority)} style={{ fontSize: '12px', padding: '4px 12px' }}>
                    {currentProject.priority === 'URGENT' ? 'KHẨN CẤP' :
                     currentProject.priority === 'HIGH' ? 'CAO' :
                     currentProject.priority === 'MEDIUM' ? 'TRUNG BÌNH' :
                     currentProject.priority === 'LOW' ? 'THẤP' : currentProject.priority}
                  </Tag>
                </Space>
              </Col>
            </Row>
            <Divider style={{ margin: '16px 0' }} />
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <div style={{ textAlign: 'center' }}>
                  <Progress 
                    type="circle" 
                    percent={currentProject.progress} 
                    size={60}
                    strokeColor="#3b82f6"
                  />
                  <div style={{ marginTop: '8px' }}>
                    <Text strong>Tiến độ</Text>
                  </div>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ textAlign: 'center' }}>
                  <CalendarOutlined style={{ fontSize: '24px', color: '#10b981' }} />
                  <div style={{ marginTop: '8px' }}>
                    <Text strong>Thời gian</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {new Date(currentProject.start_date).toLocaleDateString('vi-VN')} - {new Date(currentProject.end_date).toLocaleDateString('vi-VN')}
                    </Text>
                  </div>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ textAlign: 'center' }}>
                  <DollarOutlined style={{ fontSize: '24px', color: '#f59e0b' }} />
                  <div style={{ marginTop: '8px' }}>
                    <Text strong>Ngân sách</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                    </Text>
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        )}

        {/* Edit Form */}
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="project_name"
                label="Tên dự án"
                rules={[
                  { required: true, message: 'Vui lòng nhập tên dự án' },
                  { min: 3, message: 'Tên dự án phải có ít nhất 3 ký tự' }
                ]}
              >
                <Input 
                  placeholder="Nhập tên dự án"
                  size="large"
                  style={{ borderRadius: '8px' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="description"
                label="Mô tả dự án"
                rules={[
                  { required: true, message: 'Vui lòng nhập mô tả dự án' },
                  { min: 10, message: 'Mô tả phải có ít nhất 10 ký tự' }
                ]}
              >
                <TextArea 
                  rows={3}
                  placeholder="Nhập mô tả chi tiết về dự án"
                  style={{ borderRadius: '8px' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="status"
                label="Trạng thái"
                rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
              >
                <Select 
                  placeholder="Chọn trạng thái"
                  size="large"
                  style={{ borderRadius: '8px' }}
                >
                  <Option value="PLANNING">Lập kế hoạch</Option>
                  <Option value="ACTIVE">Đang hoạt động</Option>
                  <Option value="COMPLETED">Hoàn thành</Option>
                  <Option value="CANCELLED">Đã hủy</Option>
                  <Option value="ON_HOLD">Tạm dừng</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="priority"
                label="Độ ưu tiên"
                rules={[{ required: true, message: 'Vui lòng chọn độ ưu tiên' }]}
              >
                <Select 
                  placeholder="Chọn độ ưu tiên"
                  size="large"
                  style={{ borderRadius: '8px' }}
                >
                  <Option value="LOW">Thấp</Option>
                  <Option value="MEDIUM">Trung bình</Option>
                  <Option value="HIGH">Cao</Option>
                  <Option value="URGENT">Khẩn cấp</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="progress"
                label="Tiến độ (%)"
                rules={[
                  { required: true, message: 'Vui lòng nhập tiến độ' },
                  { type: 'number', min: 0, max: 100, message: 'Tiến độ phải từ 0-100%' }
                ]}
              >
                <InputNumber
                  style={{ width: '100%', borderRadius: '8px' }}
                  size="large"
                  placeholder="Nhập tiến độ"
                  min={0}
                  max={100}
                  suffix="%"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="start_date"
                label="Ngày bắt đầu"
                rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu' }]}
              >
                <DatePicker 
                  style={{ width: '100%', borderRadius: '8px' }}
                  size="large"
                  placeholder="Chọn ngày bắt đầu"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="end_date"
                label="Ngày kết thúc"
                rules={[{ required: true, message: 'Vui lòng chọn ngày kết thúc' }]}
              >
                <DatePicker 
                  style={{ width: '100%', borderRadius: '8px' }}
                  size="large"
                  placeholder="Chọn ngày kết thúc"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="budget"
                label="Ngân sách"
              >
                <InputNumber
                  style={{ width: '100%', borderRadius: '8px' }}
                  size="large"
                  placeholder="Nhập ngân sách"
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                  min={0}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="site_id"
                label="Công trường"
                rules={[{ required: true, message: 'Vui lòng chọn công trường' }]}
              >
                <Select 
                  placeholder="Chọn công trường"
                  size="large"
                  style={{ borderRadius: '8px' }}
                  showSearch
                  optionFilterProp="children"
                >
                  {sites.filter(site => site.id).map(site => (
                    <Option key={site.id} value={site.id}>
                      <div>
                        <div>{site.site_name}</div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {site.address}
                        </Text>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button 
                onClick={handleCancel}
                size="large"
                style={{ borderRadius: '8px' }}
              >
                Hủy
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                size="large"
                style={{ 
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  border: 'none'
                }}
              >
                Cập nhật tổng quan
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default EditProjectOverviewModal;
