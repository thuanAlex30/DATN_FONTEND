import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  Button,
  Row,
  Col,
  message,
  Space,
  Card,
  Typography,
  Divider
} from 'antd';
import { CalendarOutlined, UserOutlined, EnvironmentOutlined, FlagOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

interface ProjectBasicInfoFormProps {
  visible: boolean;
  onClose: () => void;
  onNext: (data: ProjectBasicInfo) => void;
}

export interface ProjectBasicInfo {
  project_name: string;
  description: string;
  start_date: string;
  end_date: string;
  project_type: 'CONSTRUCTION' | 'MAINTENANCE' | 'RENOVATION' | 'INSPECTION';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  leader_id: string;
  site_id: string;
  budget?: number;
}

const ProjectBasicInfoForm: React.FC<ProjectBasicInfoFormProps> = ({
  visible,
  onClose,
  onNext
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [managers, setManagers] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);

  // Mock data - trong thực tế sẽ fetch từ API
  useEffect(() => {
    if (visible) {
      // Mock managers data
      setManagers([
        { id: '68d043e69a5eaf99e6a763af', full_name: 'Test Employee', email: 'employee@safety.com' },
        { id: 'manager2', full_name: 'Nguyễn Văn A', email: 'nguyenvana@company.com' },
        { id: 'manager3', full_name: 'Trần Thị B', email: 'tranthib@company.com' }
      ]);

      // Mock sites data
      setSites([
        { id: '68d982cb51f96af95c4b425b', site_name: 'Đà Nẵng', address: 'Đà Nẵng' },
        { id: 'site2', site_name: 'Hồ Chí Minh', address: 'TP. Hồ Chí Minh' },
        { id: 'site3', site_name: 'Hà Nội', address: 'Hà Nội' }
      ]);
    }
  }, [visible]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const projectData: ProjectBasicInfo = {
        project_name: values.project_name,
        description: values.description,
        start_date: values.start_date.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
        end_date: values.end_date.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
        project_type: values.project_type,
        priority: values.priority,
        leader_id: values.leader_id,
        site_id: values.site_id,
        budget: values.budget || 0
      };

      console.log('Project basic info:', projectData);
      message.success('Thông tin cơ bản đã được lưu!');
      onNext(projectData);
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  const projectTypeOptions = [
    { value: 'CONSTRUCTION', label: 'Xây dựng', icon: '🏗️' },
    { value: 'MAINTENANCE', label: 'Bảo trì', icon: '🔧' },
    { value: 'RENOVATION', label: 'Cải tạo', icon: '🏠' },
    { value: 'INSPECTION', label: 'Kiểm tra', icon: '🔍' }
  ];

  const priorityOptions = [
    { value: 'HIGH', label: 'Cao', color: '#ff4d4f' },
    { value: 'MEDIUM', label: 'Trung bình', color: '#faad14' },
    { value: 'LOW', label: 'Thấp', color: '#52c41a' }
  ];

  return (
    <Modal
      title={
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
            <FlagOutlined style={{ marginRight: 8 }} />
            Thông Tin Cơ Bản Dự Án
          </Title>
          <Text type="secondary">
            Nhập thông tin cơ bản để bắt đầu tạo dự án mới
          </Text>
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      width={800}
      style={{ top: 20 }}
      destroyOnClose
      className="project-basic-info-modal"
      footer={null}
    >
      <div style={{ maxHeight: '70vh', overflowY: 'auto', padding: '0 8px' }}>
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          initialValues={{
            project_type: 'CONSTRUCTION',
            priority: 'MEDIUM',
            start_date: dayjs(),
            end_date: dayjs().add(1, 'year')
          }}
        >
          <Card 
            title={
              <Space>
                <FlagOutlined />
                Thông tin dự án
              </Space>
            }
            style={{ marginBottom: 16 }}
            size="small"
          >
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="project_name"
                  label="Tên dự án"
                  rules={[
                    { required: true, message: 'Vui lòng nhập tên dự án!' },
                    { min: 3, message: 'Tên dự án phải có ít nhất 3 ký tự!' }
                  ]}
                >
                  <Input 
                    placeholder="Nhập tên dự án..."
                    size="large"
                    prefix={<FlagOutlined />}
                  />
                </Form.Item>
              </Col>
              
              <Col span={24}>
                <Form.Item
                  name="description"
                  label="Mô tả dự án"
                  rules={[
                    { required: true, message: 'Vui lòng nhập mô tả dự án!' },
                    { min: 10, message: 'Mô tả phải có ít nhất 10 ký tự!' }
                  ]}
                >
                  <TextArea 
                    placeholder="Mô tả chi tiết về dự án..."
                    rows={3}
                    showCount
                    maxLength={500}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="project_type"
                  label="Loại dự án"
                  rules={[{ required: true, message: 'Vui lòng chọn loại dự án!' }]}
                >
                  <Select size="large" placeholder="Chọn loại dự án">
                    {projectTypeOptions.map(option => (
                      <Option key={option.value} value={option.value}>
                        <Space>
                          <span>{option.icon}</span>
                          <span>{option.label}</span>
                        </Space>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              
              <Col span={12}>
                <Form.Item
                  name="priority"
                  label="Mức độ ưu tiên"
                  rules={[{ required: true, message: 'Vui lòng chọn mức độ ưu tiên!' }]}
                >
                  <Select size="large" placeholder="Chọn mức độ ưu tiên">
                    {priorityOptions.map(option => (
                      <Option key={option.value} value={option.value}>
                        <Space>
                          <div 
                            style={{ 
                              width: 12, 
                              height: 12, 
                              borderRadius: '50%', 
                              backgroundColor: option.color 
                            }} 
                          />
                          <span>{option.label}</span>
                        </Space>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Card 
            title={
              <Space>
                <CalendarOutlined />
                Thời gian dự án
              </Space>
            }
            style={{ marginBottom: 16 }}
            size="small"
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="start_date"
                  label="Ngày bắt đầu"
                  rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu!' }]}
                >
                  <DatePicker 
                    size="large" 
                    style={{ width: '100%' }}
                    placeholder="Chọn ngày bắt đầu"
                    format="DD/MM/YYYY"
                  />
                </Form.Item>
              </Col>
              
              <Col span={12}>
                <Form.Item
                  name="end_date"
                  label="Ngày kết thúc"
                  rules={[
                    { required: true, message: 'Vui lòng chọn ngày kết thúc!' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || !getFieldValue('start_date')) {
                          return Promise.resolve();
                        }
                        if (value.isAfter(getFieldValue('start_date'))) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('Ngày kết thúc phải sau ngày bắt đầu!'));
                      },
                    }),
                  ]}
                >
                  <DatePicker 
                    size="large" 
                    style={{ width: '100%' }}
                    placeholder="Chọn ngày kết thúc"
                    format="DD/MM/YYYY"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Card 
            title={
              <Space>
                <UserOutlined />
                Phụ trách dự án
              </Space>
            }
            style={{ marginBottom: 16 }}
            size="small"
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="leader_id"
                  label="Trưởng dự án"
                  rules={[{ required: true, message: 'Vui lòng chọn trưởng dự án!' }]}
                >
                  <Select 
                    size="large" 
                    placeholder="Chọn trưởng dự án"
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    {managers.map(manager => (
                      <Option key={manager.id} value={manager.id}>
                        <Space>
                          <UserOutlined />
                          <span>{manager.full_name}</span>
                          <Text type="secondary">({manager.email})</Text>
                        </Space>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              
              <Col span={12}>
                <Form.Item
                  name="site_id"
                  label="Địa điểm"
                  rules={[{ required: true, message: 'Vui lòng chọn địa điểm!' }]}
                >
                  <Select 
                    size="large" 
                    placeholder="Chọn địa điểm"
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    {sites.map(site => (
                      <Option key={site.id} value={site.id}>
                        <Space>
                          <EnvironmentOutlined />
                          <span>{site.site_name}</span>
                          <Text type="secondary">({site.address})</Text>
                        </Space>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Card 
            title={
              <Space>
                <FlagOutlined />
                Ngân sách (Tùy chọn)
              </Space>
            }
            size="small"
          >
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="budget"
                  label="Ngân sách dự án"
                >
                  <Input 
                    type="number"
                    placeholder="Nhập ngân sách dự án (VNĐ)"
                    size="large"
                    addonAfter="VNĐ"
                    min={0}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </Form>
      </div>

      <Divider style={{ margin: '16px 0' }} />
      
      <div style={{ textAlign: 'right' }}>
        <Space size="middle">
          <Button size="large" onClick={handleCancel}>
            Hủy
          </Button>
          <Button 
            type="primary" 
            size="large" 
            onClick={handleSubmit}
            loading={loading}
            style={{ minWidth: 120 }}
          >
            Tiếp theo
          </Button>
        </Space>
      </div>
    </Modal>
  );
};

export default ProjectBasicInfoForm;
