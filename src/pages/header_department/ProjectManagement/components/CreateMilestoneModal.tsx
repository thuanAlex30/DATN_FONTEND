import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  Switch,
  Button,
  Row,
  Col,
  message
} from 'antd';
import { PlusOutlined, CalendarOutlined, UserOutlined, FlagOutlined } from '@ant-design/icons';
import type { RootState, AppDispatch } from '../../../../store';
import { useSelector, useDispatch } from 'react-redux';
import { createMilestone, fetchProjectMilestones } from '../../../../store/slices/projectMilestoneSlice';
import userService from '../../../../services/userService';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;

interface CreateMilestoneModalProps {
  visible: boolean;
  onCancel: () => void;
  projectId: string;
}

interface MilestoneFormData {
  milestone_name: string;
  description: string;
  planned_date: string;
  milestone_type: string;
  completion_criteria: string;
  responsible_user_id: string;
  is_critical: boolean;
}

const CreateMilestoneModal: React.FC<CreateMilestoneModalProps> = ({
  visible,
  onCancel,
  projectId
}) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.projectMilestone);
  const { user } = useSelector((state: RootState) => state.auth);
  const [managers, setManagers] = useState<any[]>([]);
  const [loadingManagers, setLoadingManagers] = useState(false);

  useEffect(() => {
    if (visible) {
      loadManagers();
      form.resetFields();
    }
  }, [visible, form]);

  // Update form default value when managers are loaded
  useEffect(() => {
    if (managers.length > 0 && visible) {
      form.setFieldsValue({
        responsible_user_id: managers[0].id
      });
    }
  }, [managers, visible, form]);

  const loadManagers = async () => {
    try {
      setLoadingManagers(true);
      // Load potential managers from API
      const managersResponse = await userService.getPotentialManagers();
      
      console.log('CreateMilestoneModal - managersResponse:', managersResponse);
      console.log('CreateMilestoneModal - managersResponse.success:', managersResponse.success);
      console.log('CreateMilestoneModal - managersResponse.data:', managersResponse.data);
      
      if (managersResponse.success) {
        const managersData = managersResponse.data?.managers || managersResponse.data;
        console.log('CreateMilestoneModal - managersData:', managersData);
        console.log('CreateMilestoneModal - managersData length:', managersData?.length);
        
        if (Array.isArray(managersData) && managersData.length > 0) {
          const mappedManagers = managersData.map((manager: any) => ({
            id: manager.id,
            name: manager.full_name,
            email: manager.email
          }));
          console.log('CreateMilestoneModal - mappedManagers:', mappedManagers);
          setManagers(mappedManagers);
        } else {
          console.log('CreateMilestoneModal - No managers data or empty array');
          setManagers([]);
        }
      } else {
        console.error('Failed to load managers:', managersResponse.message);
        message.error('Không thể tải danh sách manager');
        setManagers([]);
      }
    } catch (error) {
      console.error('Error loading managers:', error);
      message.error('Lỗi khi tải danh sách manager');
      setManagers([]);
    } finally {
      setLoadingManagers(false);
    }
  };

  const handleSubmit = async (values: MilestoneFormData) => {
    try {
      const milestoneData = {
        project_id: projectId,
        phase_id: 'default', // Default phase
        milestone_name: values.milestone_name,
        description: values.description || '',
        planned_date: values.planned_date,
        milestone_type: values.milestone_type,
        completion_criteria: values.completion_criteria || '',
        responsible_user_id: values.responsible_user_id || user?.id || '',
        is_critical: values.is_critical || false
      };

      await dispatch(createMilestone(milestoneData)).unwrap();
      message.success('Tạo milestone thành công!');
      // Refresh milestones list
      dispatch(fetchProjectMilestones(projectId));
      form.resetFields();
      onCancel();
    } catch (error: any) {
      console.error('Error creating milestone:', error);
      message.error(error?.message || 'Có lỗi xảy ra khi tạo milestone');
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <PlusOutlined className="text-blue-500" />
          <span>Tạo Milestone Mới</span>
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={800}
      className="create-milestone-modal"
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="mt-4"
        initialValues={{
          milestone_type: 'PHASE_COMPLETION',
          is_critical: false,
          responsible_user_id: managers.length > 0 ? managers[0].id : ''
        }}
      >
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label="Tên Milestone"
              name="milestone_name"
              rules={[
                { required: true, message: 'Vui lòng nhập tên milestone' },
                { max: 100, message: 'Tên milestone không được quá 100 ký tự' }
              ]}
            >
              <Input
                placeholder="Nhập tên milestone"
                prefix={<FlagOutlined className="text-gray-400" />}
                size="large"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Loại Milestone"
              name="milestone_type"
              rules={[{ required: true, message: 'Vui lòng chọn loại milestone' }]}
            >
              <Select size="large" placeholder="Chọn loại milestone">
                <Option value="PHASE_COMPLETION">Hoàn thành giai đoạn</Option>
                <Option value="DELIVERY">Giao hàng</Option>
                <Option value="APPROVAL">Phê duyệt</Option>
                <Option value="REVIEW">Đánh giá</Option>
                <Option value="CHECKPOINT">Điểm kiểm tra</Option>
                <Option value="TESTING">Kiểm thử</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Ngày dự kiến"
              name="planned_date"
              rules={[{ required: true, message: 'Vui lòng chọn ngày dự kiến' }]}
            >
              <DatePicker
                size="large"
                style={{ width: '100%' }}
                placeholder="Chọn ngày dự kiến"
                suffixIcon={<CalendarOutlined />}
                format="DD/MM/YYYY"
                disabledDate={(current) => current && current < dayjs().startOf('day')}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Người phụ trách"
              name="responsible_user_id"
              rules={[
                { required: true, message: 'Vui lòng chọn người phụ trách' }
              ]}
            >
              <Select
                size="large"
                placeholder="Chọn người phụ trách"
                suffixIcon={<UserOutlined />}
                showSearch
                loading={loadingManagers}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                }
              >
                {managers.map((manager) => (
                  <Option key={manager.id} value={manager.id}>
                    {manager.name} ({manager.email})
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Milestone quan trọng"
              name="is_critical"
              valuePropName="checked"
            >
              <Switch
                checkedChildren="Có"
                unCheckedChildren="Không"
                size="default"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label="Mô tả"
              name="description"
            >
              <TextArea
                rows={3}
                placeholder="Nhập mô tả chi tiết về milestone"
                maxLength={500}
                showCount
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label="Tiêu chí hoàn thành"
              name="completion_criteria"
              rules={[
                { required: true, message: 'Vui lòng nhập tiêu chí hoàn thành' },
                { max: 300, message: 'Tiêu chí hoàn thành không được quá 300 ký tự' }
              ]}
            >
              <TextArea
                rows={2}
                placeholder="Mô tả các tiêu chí để đánh giá milestone đã hoàn thành"
                maxLength={300}
                showCount
              />
            </Form.Item>
          </Col>
        </Row>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button size="large" onClick={handleCancel}>
            Hủy
          </Button>
          <Button
            type="primary"
            size="large"
            htmlType="submit"
            loading={loading}
            className="bg-gradient-to-r from-blue-500 to-blue-600 border-0"
          >
            Tạo Milestone
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateMilestoneModal;
