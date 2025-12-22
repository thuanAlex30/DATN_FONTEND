import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Select,
  Input,
  Button,
  message,
  Space,
  Card,
  Row,
  Col,
  Typography,
  Divider,
  Spin
} from 'antd';
import {
  BookOutlined,
  TeamOutlined,
  UserOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { useTrainingAssignments } from '../../../../hooks/useTraining';
import { api } from '../../../../services/api';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

interface CourseAssignmentModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  selectedCourse?: any;
}

const CourseAssignmentModal: React.FC<CourseAssignmentModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  selectedCourse
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);

  const { createAssignment } = useTrainingAssignments();

  useEffect(() => {
    if (visible) {
      fetchDepartments();
      fetchCourses();
      if (selectedCourse) {
        form.setFieldsValue({
          course_id: selectedCourse._id
        });
      } else {
        form.resetFields();
        setSelectedDepartment(null);
      }
    }
  }, [visible, selectedCourse]);

  const fetchDepartments = async () => {
    try {
      console.log('Fetching departments...');
      console.log('Current token:', localStorage.getItem('safety_management_token'));
      
      const response = await api.get('/departments/active');
      console.log('Departments API response:', response);
      
      const departmentsData = response.data?.data || response.data || [];
      console.log('Departments data:', departmentsData);
      
      // Ensure it's an array and filter out null/undefined values
      if (Array.isArray(departmentsData)) {
        const validDepartments = departmentsData.filter(dept => 
          dept && (dept._id || dept.id) && dept.department_name
        );
        console.log('Valid departments:', validDepartments);
        setDepartments(validDepartments);
      } else {
        console.warn('Departments data is not an array:', departmentsData);
        setDepartments([]);
      }
    } catch (error: any) {
      console.error('Error fetching departments:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      message.error('Không thể tải danh sách phòng ban');
      setDepartments([]);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await api.get('/training/courses');
      const coursesData = response.data.data || [];
      // Filter out null/undefined values
      const validCourses = coursesData.filter((course: any) => 
        course && course._id && course.course_name
      );
      setCourses(validCourses);
    } catch (error) {
      console.error('Error fetching courses:', error);
      message.error('Không thể tải danh sách khóa học');
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      // Validate required fields
      if (!values.course_id) {
        message.error('Vui lòng chọn khóa học');
        setLoading(false);
        return;
      }
      if (!values.department_id) {
        message.error('Vui lòng chọn phòng ban');
        setLoading(false);
        return;
      }

      console.log('Submitting assignment with values:', {
        course_id: values.course_id,
        department_id: values.department_id,
        notes: values.notes
      });

      await createAssignment({
        course_id: values.course_id,
        department_id: values.department_id,
        notes: values.notes || undefined
      });
      
      message.success('Gán khóa học cho phòng ban thành công!');
      onSuccess();
      form.resetFields();
      setSelectedDepartment(null);
    } catch (error: any) {
      console.error('Error creating assignment:', error);
      console.error('Error response:', error.response?.data);
      
      // Handle validation errors
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const validationErrors = error.response.data.errors.map((err: any) => err.message).join(', ');
        message.error(`Lỗi validation: ${validationErrors}`);
      } else {
        const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi gán khóa học';
        message.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDepartmentChange = (departmentId: string) => {
    console.log('Department changed:', departmentId);
    const department = departments.find(d => d._id === departmentId || d.id === departmentId);
    console.log('Found department:', department);
    setSelectedDepartment(department);
    // Force form validation to re-run
    form.validateFields(['department_id']);
  };

  const getDepartmentInfo = () => {
    if (!selectedDepartment) return null;

    return (
      <Card size="small" style={{ marginTop: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Row>
            <Col span={24}>
              <Space>
                <TeamOutlined />
                <Text strong>{selectedDepartment.department_name}</Text>
              </Space>
            </Col>
          </Row>
          {selectedDepartment.description && (
            <Row>
              <Col span={24}>
                <Text type="secondary">{selectedDepartment.description}</Text>
              </Col>
            </Row>
          )}
          {selectedDepartment.manager_id && (
            <Row>
              <Col span={24}>
                <Space>
                  <UserOutlined />
                  <Text>Trưởng phòng: {selectedDepartment.manager_id.full_name}</Text>
                </Space>
              </Col>
            </Row>
          )}
        </Space>
      </Card>
    );
  };

  return (
    <Modal
      title="Gán khóa học cho phòng ban"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          course_id: selectedCourse?._id
        }}
      >
        <Form.Item
          name="course_id"
          label="Khóa học"
          rules={[{ required: true, message: 'Vui lòng chọn khóa học' }]}
        >
          <Select
            placeholder="Chọn khóa học"
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              (option?.children as unknown as string)
                ?.toLowerCase()
                .includes(input.toLowerCase())
            }
            disabled={!!selectedCourse}
          >
            {Array.isArray(courses) && courses.length > 0 && courses.map(course => (
              course && course._id && course.course_name ? (
                <Option key={course._id} value={course._id}>
                  <Space>
                    <BookOutlined />
                    <span>{course.course_name}</span>
                    {course.is_mandatory && (
                      <span style={{ color: '#ff4d4f' }}>(Bắt buộc)</span>
                    )}
                  </Space>
                </Option>
              ) : null
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="department_id"
          label="Phòng ban"
          rules={[{ required: true, message: 'Vui lòng chọn phòng ban' }]}
        >
          <Select
            placeholder="Chọn phòng ban"
            showSearch
            optionFilterProp="children"
            loading={departments.length === 0}
            filterOption={(input, option) =>
              (option?.children as unknown as string)
                ?.toLowerCase()
                .includes(input.toLowerCase())
            }
            onChange={handleDepartmentChange}
            allowClear
          >
            {Array.isArray(departments) && departments.length > 0 && departments.map(department => (
              department && (department._id || department.id) && department.department_name ? (
                <Option key={department._id || department.id} value={department._id || department.id}>
                  <Space>
                    <TeamOutlined />
                    <span>{department.department_name}</span>
                  </Space>
                </Option>
              ) : null
            ))}
          </Select>
        </Form.Item>

        {getDepartmentInfo()}

        <Form.Item
          name="notes"
          label="Ghi chú"
        >
          <TextArea
            rows={3}
            placeholder="Nhập ghi chú (tùy chọn)"
            maxLength={500}
            showCount
          />
        </Form.Item>

        <Divider />

        <Form.Item>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={onCancel}>
              Hủy
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              icon={<BookOutlined />}
            >
              Gán khóa học
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CourseAssignmentModal;
