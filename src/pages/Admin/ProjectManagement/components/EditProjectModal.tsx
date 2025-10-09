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
  Divider
} from 'antd';
import dayjs from 'dayjs';
import { EditOutlined, CalendarOutlined, DollarOutlined, FlagOutlined } from '@ant-design/icons';
import projectService from '../../../../services/projectService';
import type { Project, UpdateProjectData } from '../../../../types/project';
import type { Site } from '../../../../types/project';

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  project: Project | null;
}

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const EditProjectModal: React.FC<EditProjectModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  project
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [sites, setSites] = useState<Site[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadSites();
      if (project) {
        form.setFieldsValue({
          project_name: project.project_name,
          description: project.description,
          status: project.status,
          priority: project.priority,
          budget: project.budget,
          start_date: project.start_date ? dayjs(project.start_date) : null,
          end_date: project.end_date ? dayjs(project.end_date) : null,
          site_id: project.site_id?._id || project.site_id
        });
      }
    }
  }, [isOpen, project]);

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

  const handleSubmit = async (values: any) => {
    if (!project) return;

    try {
      setLoading(true);
      
      const updateData: UpdateProjectData = {
        project_name: values.project_name,
        description: values.description,
        status: values.status,
        priority: values.priority,
        budget: values.budget,
        start_date: values.start_date?.format('YYYY-MM-DD'),
        end_date: values.end_date?.format('YYYY-MM-DD'),
        site_id: values.site_id
      };

      const response = await projectService.updateProject(project.id, updateData);
      
      if (response.success) {
        message.success('Cập nhật dự án thành công');
        form.resetFields();
        onSuccess();
        onClose();
      } else {
        message.error(response.message || 'Không thể cập nhật dự án');
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể cập nhật dự án');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={
        <Space>
          <EditOutlined />
          Chỉnh sửa dự án
        </Space>
      }
      open={isOpen}
      onCancel={handleCancel}
      footer={null}
      width={800}
      destroyOnClose
    >
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
                rows={4}
                placeholder="Nhập mô tả chi tiết về dự án"
                style={{ borderRadius: '8px' }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
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
          <Col span={12}>
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
              label="Ngân sách (VNĐ)"
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
                {sites.filter(site => site._id).map(site => (
                  <Option key={site._id} value={site._id}>
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
              Cập nhật dự án
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditProjectModal;
