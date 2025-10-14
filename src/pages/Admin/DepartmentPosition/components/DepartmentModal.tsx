import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Button,
  Space,
  message,
  Spin,
  Row,
  Col,
  Typography,
  Divider
} from 'antd';
import { BankOutlined, UserOutlined, InfoCircleOutlined } from '@ant-design/icons';
import userService from '../../../../services/userService';
import departmentService from '../../../../services/departmentService';
import type { Department as APIDepartment } from '../../../../types/department';

const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

interface DepartmentModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  department?: APIDepartment | null;
  mode: 'create' | 'edit';
}

interface Manager {
  id: string;
  username: string;
  full_name: string;
  email: string;
  role?: {
    id: string;
    role_name: string;
  };
}

const DepartmentModal: React.FC<DepartmentModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  department,
  mode
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loadingManagers, setLoadingManagers] = useState(false);

  const isEdit = mode === 'edit';
  const title = isEdit ? 'Chỉnh sửa phòng ban' : 'Thêm phòng ban mới';

  // Load managers for dropdown
  useEffect(() => {
    if (visible) {
      loadManagers();
    }
  }, [visible]);

  // Set form values when editing
  useEffect(() => {
    if (visible && department && isEdit) {
      form.setFieldsValue({
        department_name: department.department_name,
        description: department.description,
        manager_id: department.manager_id,
        is_active: department.is_active
      });
    } else if (visible && !isEdit) {
      form.resetFields();
    }
  }, [visible, department, isEdit, form]);

  const loadManagers = async () => {
    try {
      setLoadingManagers(true);
      console.log('Loading potential managers...');
      const managersResponse = await userService.getPotentialManagers();
      console.log('Potential managers response:', managersResponse);
      
      if (managersResponse.success) {
        const managersData = managersResponse.data?.managers || [];
        console.log('Managers data:', managersData);
        
        if (Array.isArray(managersData) && managersData.length > 0) {
          const mappedManagers = managersData.map((manager: any) => ({
            id: manager.id,
            full_name: manager.full_name,
            username: manager.username,
            email: manager.email,
            role: manager.role
          }));
          console.log('Mapped managers:', mappedManagers);
          setManagers(mappedManagers);
        } else {
          console.log('No potential managers available');
          setManagers([]);
        }
      } else {
        console.error('Failed to load potential managers:', managersResponse.message || 'Unknown error');
        message.warning('Không thể tải danh sách quản lý có sẵn');
        setManagers([]);
      }
    } catch (error) {
      console.error('Error loading potential managers:', error);
      message.error('Lỗi khi tải danh sách quản lý');
      setManagers([]);
    } finally {
      setLoadingManagers(false);
    }
  };


  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      
      // Validate department name uniqueness for new departments
      if (!isEdit) {
        try {
          const existingDepartments = await departmentService.searchDepartments({ 
            q: values.department_name,
            limit: 1000 
          });
          
          const duplicateName = existingDepartments.data.departments.find(
            (dept: any) => dept.department_name.toLowerCase() === values.department_name.toLowerCase()
          );
          
          if (duplicateName) {
            message.error('Tên phòng ban đã tồn tại! Vui lòng chọn tên khác.');
            setLoading(false);
            return;
          }
        } catch (validationError) {
          console.warn('Could not validate department name uniqueness:', validationError);
          // Continue with creation - backend will handle the validation
        }
      }
      
      if (isEdit && department) {
        // Update department
        await departmentService.updateDepartment(department.id, values);
        message.success('Cập nhật phòng ban thành công!');
        onSuccess();
      } else {
        // Create new department
        await departmentService.createDepartment(values);
        message.success('Tạo phòng ban thành công!');
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error submitting department:', error);
      
      // Handle specific error messages from backend
      if (error.response?.status === 409) {
        const errorMessage = error.response?.data?.message;
        if (errorMessage?.includes('already managing')) {
          message.error('Quản lý đã được phân công quản lý phòng ban khác. Vui lòng chọn quản lý khác!');
        } else if (errorMessage?.includes('already exists')) {
          message.error('Tên phòng ban đã tồn tại. Vui lòng chọn tên khác!');
        } else {
          message.error(errorMessage || 'Phòng ban đã tồn tại hoặc quản lý đã được phân công!');
        }
      } else if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || 'Dữ liệu không hợp lệ!';
        message.error(errorMessage);
      } else if (error.response?.status === 404) {
        const errorMessage = error.response?.data?.message || 'Không tìm thấy quản lý được chọn!';
        message.error(errorMessage);
      } else {
        message.error('Có lỗi xảy ra khi xử lý phòng ban!');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  console.log('DepartmentModal render:', { visible, title, mode, department });

  return (
    <Modal
      title={
        <Space>
          <BankOutlined />
          {title}
        </Space>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
      destroyOnClose
      zIndex={10000}
      style={{ top: 20 }}
      maskClosable={false}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          is_active: true
        }}
      >
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="department_name"
              label="Tên phòng ban"
              rules={[
                { required: true, message: 'Vui lòng nhập tên phòng ban!' },
                { min: 2, message: 'Tên phòng ban phải có ít nhất 2 ký tự!' },
                { max: 100, message: 'Tên phòng ban không được quá 100 ký tự!' }
              ]}
            >
              <Input
                placeholder="Nhập tên phòng ban"
                prefix={<BankOutlined />}
                size="large"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="description"
              label="Mô tả"
              rules={[
                { max: 500, message: 'Mô tả không được quá 500 ký tự!' }
              ]}
            >
              <TextArea
                placeholder="Nhập mô tả phòng ban"
                rows={3}
                showCount
                maxLength={500}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="manager_id"
              label="Quản lý phòng ban"
              tooltip="Chọn người quản lý phòng ban (chỉ hiển thị người chưa được phân công quản lý phòng ban khác)"
            >
              <Select
                placeholder="Chọn quản lý (tùy chọn)"
                allowClear
                showSearch
                optionFilterProp="children"
                loading={loadingManagers}
                notFoundContent={loadingManagers ? "Đang tải..." : managers.length === 0 ? "Không có quản lý nào" : "Không tìm thấy"}
                filterOption={(input, option) =>
                  (option?.children as string)?.toLowerCase().includes(input.toLowerCase())
                }
              >
                {Array.isArray(managers) && managers.map(manager => (
                  <Option key={manager.id} value={manager.id}>
                    <Space>
                      <UserOutlined />
                      {manager.full_name} ({manager.username})
                    </Space>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="is_active"
              label="Trạng thái"
              valuePropName="checked"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Switch />
                <Text type="secondary">
                  <InfoCircleOutlined style={{ marginRight: '4px' }} />
                  Phòng ban hoạt động
                </Text>
              </div>
            </Form.Item>
          </Col>
        </Row>

        <Divider />

        <div style={{ textAlign: 'right' }}>
          <Space>
            <Button onClick={handleCancel} size="large">
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              icon={<BankOutlined />}
            >
              {isEdit ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </Space>
        </div>
      </Form>
    </Modal>
  );
};

export default DepartmentModal;
