import React, { useEffect, useState } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Button,
  Space,
  Row,
  Col,
  message
} from 'antd';
import { motion } from 'framer-motion';
import projectTaskService from '../../../../services/projectTaskService';
import userService from '../../../../services/userService';
import type { User } from '../../../../services/userService';
// import projectPhaseService, { type ProjectPhase } from '../../../../services/projectPhaseService';
import type { CreateTaskData, UpdateTaskData } from '../../../../types/projectTask';

const { TextArea } = Input;
const { Option } = Select;

interface TaskFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  projectId: string;
  task?: any; // Task to edit (if editing)
}

const TaskFormModal: React.FC<TaskFormModalProps> = ({
  visible,
  onClose,
  onSuccess,
  projectId,
  task
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  // const [phases, setPhases] = useState<ProjectPhase[]>([]);

  useEffect(() => {
    if (visible) {
      loadUsers();
      // loadPhases();
      if (task) {
        // Editing existing task
        form.setFieldsValue({
          task_code: task.task_code,
          task_name: task.task_name,
          description: task.description,
          priority: task.priority,
          status: task.status,
          start_date: task.planned_start_date ? new Date(task.planned_start_date) : null,
          end_date: task.planned_end_date ? new Date(task.planned_end_date) : null,
          estimated_hours: task.planned_duration_hours,
          progress: task.progress_percentage,
          task_type: task.task_type,
          responsible_user_id: task.responsible_user_id
        });
      } else {
        // Creating new task
        form.resetFields();
      }
    }
  }, [visible, task, form]);

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const usersData = await userService.getPotentialManagers();
      setUsers(usersData.data.managers);
    } catch (error) {
      console.error('Error loading managers:', error);
      message.error('Không thể tải danh sách người phụ trách');
    } finally {
      setLoadingUsers(false);
    }
  };

  // const loadPhases = async () => {
  //   try {
  //     const phasesData = await projectPhaseService.getProjectPhases(projectId);
  //     setPhases(phasesData);
  //   } catch (error) {
  //     console.error('Error loading phases:', error);
  //   }
  // };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const taskData: any = {
        task_name: values.task_name,
        description: values.description,
        priority: values.priority?.toUpperCase(),
        status: values.status?.toUpperCase(),
        planned_start_date: values.start_date?.toISOString(),
        planned_end_date: values.end_date?.toISOString(),
        planned_duration_hours: values.estimated_hours,
        progress_percentage: values.progress,
        task_type: values.task_type || 'INSPECTION',
        responsible_user_id: values.responsible_user_id,
        area_id: values.area_id || '68e7502d68e679f350415ce0', // Default area ID
        location_id: values.location_id || '68e7502d68e679f350415ce1', // Default location ID
        project_id: projectId
      };

      // Only include task_code if user provided one
      if (values.task_code && values.task_code.trim()) {
        taskData.task_code = values.task_code.trim();
      }

      if (task) {
        // Update existing task
        const updateData: UpdateTaskData = taskData;
        const result = await projectTaskService.updateTask(task.id, updateData);
        if (result.success) {
          message.success('Nhiệm vụ đã được cập nhật thành công');
          onSuccess();
          onClose();
        } else {
          message.error(result.message || 'Không thể cập nhật nhiệm vụ');
        }
      } else {
        // Create new task
        const createData: CreateTaskData = taskData;
        const result = await projectTaskService.createTask(createData);
        if (result.success) {
          message.success('Nhiệm vụ đã được tạo thành công');
          onSuccess();
          onClose();
        } else {
          message.error(result.message || 'Không thể tạo nhiệm vụ');
        }
      }
    } catch (error) {
      console.error('Error submitting task:', error);
      message.error('Có lỗi xảy ra khi xử lý nhiệm vụ');
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
        <div className="flex items-center gap-2">
          <span>{task ? 'Chỉnh sửa Nhiệm vụ' : 'Tạo Nhiệm vụ Mới'}</span>
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={800}
      destroyOnHidden
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-4"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="task_code"
                label="Mã nhiệm vụ"
                rules={[
                  { max: 50, message: 'Mã nhiệm vụ không được quá 50 ký tự' },
                  { pattern: /^[A-Z0-9_-]*$/, message: 'Mã nhiệm vụ chỉ được chứa chữ hoa, số, gạch ngang và gạch dưới' }
                ]}
                extra="Để trống để hệ thống tự động tạo mã duy nhất"
              >
                <Input placeholder="Để trống để tự động tạo (VD: TASK-001)" />
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item
                name="task_name"
                label="Tên nhiệm vụ"
                rules={[
                  { required: true, message: 'Vui lòng nhập tên nhiệm vụ' },
                  { max: 255, message: 'Tên nhiệm vụ không được quá 255 ký tự' }
                ]}
              >
                <Input placeholder="Nhập tên nhiệm vụ" />
              </Form.Item>
            </Col>
            
            <Col span={24}>
              <Form.Item
                name="description"
                label="Mô tả"
                rules={[
                  { max: 1000, message: 'Mô tả không được quá 1000 ký tự' }
                ]}
              >
                <TextArea 
                  rows={4} 
                  placeholder="Nhập mô tả chi tiết về nhiệm vụ"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="task_type"
                label="Loại nhiệm vụ"
                rules={[{ required: true, message: 'Vui lòng chọn loại nhiệm vụ' }]}
                initialValue="INSPECTION"
              >
                <Select placeholder="Chọn loại nhiệm vụ">
                  <Option value="CONSTRUCTION">Xây dựng</Option>
                  <Option value="INSPECTION">Kiểm tra</Option>
                  <Option value="DOCUMENTATION">Tài liệu</Option>
                  <Option value="PLANNING">Lập kế hoạch</Option>
                  <Option value="COORDINATION">Phối hợp</Option>
                  <Option value="SAFETY">An toàn</Option>
                  <Option value="QUALITY">Chất lượng</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="priority"
                label="Mức độ ưu tiên"
                rules={[{ required: true, message: 'Vui lòng chọn mức độ ưu tiên' }]}
                initialValue="MEDIUM"
              >
                <Select placeholder="Chọn mức độ ưu tiên">
                  <Option value="LOW">Thấp</Option>
                  <Option value="MEDIUM">Trung bình</Option>
                  <Option value="HIGH">Cao</Option>
                  <Option value="URGENT">Khẩn cấp</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="status"
                label="Trạng thái"
                rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
                initialValue="PENDING"
              >
                <Select placeholder="Chọn trạng thái">
                  <Option value="PENDING">Chờ thực hiện</Option>
                  <Option value="IN_PROGRESS">Đang thực hiện</Option>
                  <Option value="COMPLETED">Hoàn thành</Option>
                  <Option value="ON_HOLD">Tạm dừng</Option>
                  <Option value="CANCELLED">Đã hủy</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="start_date"
                label="Ngày bắt đầu"
              >
                <DatePicker 
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
              >
                <DatePicker 
                  style={{ width: '100%' }} 
                  placeholder="Chọn ngày kết thúc"
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="estimated_hours"
                label="Số giờ ước tính"
                rules={[
                  { type: 'number', min: 0, message: 'Số giờ phải lớn hơn hoặc bằng 0' }
                ]}
              >
                <InputNumber 
                  style={{ width: '100%' }} 
                  placeholder="Nhập số giờ ước tính"
                  min={0}
                  step={0.5}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="progress"
                label="Tiến độ (%)"
                rules={[
                  { type: 'number', min: 0, max: 100, message: 'Tiến độ phải từ 0 đến 100' }
                ]}
                initialValue={0}
              >
                <InputNumber 
                  style={{ width: '100%' }} 
                  placeholder="Nhập tiến độ"
                  min={0}
                  max={100}
                  step={1}
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                name="responsible_user_id"
                label="Người phụ trách"
                rules={[{ required: true, message: 'Vui lòng chọn người phụ trách!' }]}
              >
                <Select 
                  placeholder="Chọn người phụ trách"
                  loading={loadingUsers}
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {users.map(user => (
                    <Option key={user.id} value={user.id}>
                      {user.full_name} ({user.username})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            {/* <Col span={24}>
              <Form.Item
                name="phase_id"
                label="Giai đoạn"
              >
                <Select placeholder="Chọn giai đoạn" allowClear>
                  {phases.map(phase => (
                    <Option key={phase._id} value={phase._id}>
                      {phase.phase_name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col> */}
          </Row>

          <div style={{ textAlign: 'right', marginTop: '24px' }}>
            <Space>
              <Button onClick={handleCancel} disabled={loading}>
                Hủy
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                className="bg-blue-500 hover:bg-blue-600 border-blue-500"
              >
                {task ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </Space>
          </div>
        </Form>
      </motion.div>
    </Modal>
  );
};

export default TaskFormModal;
