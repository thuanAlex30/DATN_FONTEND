import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, InputNumber, Button, Row, Col, message } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../../store';
import { createRisk, updateRisk } from '../../../../store/slices/projectRiskSlice';
import type { CreateRiskData, UpdateRiskData } from '../../../../types/projectRisk';
import userService from '../../../../services/userService';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;

interface RiskFormModalProps {
  visible: boolean;
  onClose: () => void;
  projectId: string;
  editingRisk?: any;
  mode: 'create' | 'edit';
}

const RiskFormModal: React.FC<RiskFormModalProps> = ({
  visible,
  onClose,
  projectId,
  editingRisk,
  mode
}) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.projectRisk);
  const [managers, setManagers] = useState<any[]>([]);
  const [loadingManagers, setLoadingManagers] = useState(false);

  // Load managers when modal opens
  useEffect(() => {
    if (visible) {
      loadManagers();
    }
  }, [visible]);

  // Set form values when editing
  useEffect(() => {
    if (visible) {
      if (mode === 'edit' && editingRisk) {
        // Convert probability from 0-1 to 1-5 scale for form display
        const probabilityForForm = editingRisk.probability != null ? Math.round(editingRisk.probability * 5) : 3;
        
        form.setFieldsValue({
          risk_name: editingRisk.risk_name,
          description: editingRisk.description,
          risk_category: editingRisk.risk_category,
          probability: probabilityForForm, // Convert 0-1 to 1-5 for display
          impact_score: editingRisk.impact_score,
          mitigation_plan: editingRisk.mitigation_plan,
          owner_id: editingRisk.owner_id,
          target_resolution_date: editingRisk.target_resolution_date ? dayjs(editingRisk.target_resolution_date) : null,
          schedule_impact_days: editingRisk.schedule_impact_days,
        });
      } else {
        form.resetFields();
      }
    }
  }, [visible, mode, editingRisk, form]);

  const loadManagers = async () => {
    try {
      setLoadingManagers(true);

      // Load all users và lọc chỉ những user có role là manager
      const allUsers = await userService.getAllUsers();
      const filteredManagers = allUsers.filter((u: any) => {
        const roleCode = u.role?.role_code?.toLowerCase();
        const roleName = u.role?.role_name?.toLowerCase();
        const roleLevel = u.role?.role_level;

        if (roleCode) return roleCode === 'manager';
        if (roleName) return roleName.includes('manager') || roleName === 'department manager';
        if (roleLevel !== undefined && roleLevel !== null) return roleLevel === 70;
        return false;
      });

      const mappedManagers = filteredManagers.map((m: any) => ({
        id: m.id || m._id,
        name: m.full_name || m.name || m.fullName || '',
        email: m.email || ''
      }));

      setManagers(mappedManagers);
    } catch (error) {
      console.error('Error loading managers:', error);
      message.error('Lỗi khi tải danh sách manager');
      setManagers([]);
    } finally {
      setLoadingManagers(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Normalize probability from 1-5 to 0-1 (backend requires 0-1)
      const normalizedProbability = values.probability / 5;
      
      // Calculate risk_score: probability (0-1) * impact_score (1-5) = 0-5
      // But ensure it doesn't exceed 5
      const calculatedRiskScore = Math.min(normalizedProbability * values.impact_score, 5);
      
      const riskData = {
        ...values,
        project_id: projectId,
        probability: normalizedProbability, // Convert 1-5 to 0-1
        target_resolution_date: values.target_resolution_date ? dayjs(values.target_resolution_date).toDate().toISOString() : undefined,
        risk_score: calculatedRiskScore,
      };

      if (mode === 'create') {
        await dispatch(createRisk(riskData as CreateRiskData));
        message.success('Thêm rủi ro thành công!');
      } else if (mode === 'edit' && editingRisk) {
        await dispatch(updateRisk({ id: editingRisk.id, data: riskData as UpdateRiskData }));
        message.success('Cập nhật rủi ro thành công!');
      }

      onClose();
      form.resetFields();
    } catch (error) {
      console.error('Error submitting risk form:', error);
      message.error('Có lỗi xảy ra khi lưu rủi ro!');
    }
  };

  const handleCancel = () => {
    onClose();
    form.resetFields();
  };

  return (
    <Modal
      title={
        <div className="flex items-center space-x-2">
          <ExclamationCircleOutlined className="text-red-500" />
          <span>{mode === 'create' ? 'Thêm Rủi ro Mới' : 'Chỉnh sửa Rủi ro'}</span>
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      width={800}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {mode === 'create' ? 'Thêm Rủi ro' : 'Cập nhật'}
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        className="mt-4"
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="risk_name"
              label="Tên Rủi ro"
              rules={[{ required: true, message: 'Vui lòng nhập tên rủi ro!' }]}
            >
              <Input placeholder="Nhập tên rủi ro" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="risk_category"
              label="Danh mục Rủi ro"
              rules={[{ required: true, message: 'Vui lòng chọn danh mục rủi ro!' }]}
            >
              <Select placeholder="Chọn danh mục rủi ro">
                <Option value="TECHNICAL">Kỹ thuật</Option>
                <Option value="SCHEDULE">Tiến độ</Option>
                <Option value="SAFETY">An toàn</Option>
                <Option value="ENVIRONMENTAL">Môi trường</Option>
                <Option value="REGULATORY">Pháp lý</Option>
                <Option value="SUPPLIER">Nhà cung cấp</Option>
                <Option value="PERSONNEL">Nhân sự</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="description"
          label="Mô tả Rủi ro"
          rules={[{ required: true, message: 'Vui lòng nhập mô tả rủi ro!' }]}
        >
          <TextArea 
            rows={4} 
            placeholder="Mô tả chi tiết về rủi ro này..."
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="probability"
              label="Xác suất (1-5)"
              rules={[
                { required: true, message: 'Vui lòng nhập xác suất!' },
                { type: 'number', min: 1, max: 5, message: 'Xác suất phải từ 1 đến 5!' }
              ]}
            >
              <InputNumber
                min={1}
                max={5}
                placeholder="1-5"
                className="w-full"
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="impact_score"
              label="Tác động (1-5)"
              rules={[
                { required: true, message: 'Vui lòng nhập điểm tác động!' },
                { type: 'number', min: 1, max: 5, message: 'Điểm tác động phải từ 1 đến 5!' }
              ]}
            >
              <InputNumber
                min={1}
                max={5}
                placeholder="1-5"
                className="w-full"
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="target_resolution_date"
              label="Ngày Giải quyết Dự kiến"
              rules={[{ required: true, message: 'Vui lòng chọn ngày giải quyết!' }]}
            >
              <DatePicker 
                className="w-full"
                placeholder="Chọn ngày"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="mitigation_plan"
          label="Kế hoạch Giảm thiểu"
          rules={[{ required: true, message: 'Vui lòng nhập kế hoạch giảm thiểu!' }]}
        >
          <TextArea 
            rows={3} 
            placeholder="Mô tả kế hoạch để giảm thiểu rủi ro này..."
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="schedule_impact_days"
              label="Tác động Tiến độ (Ngày)"
            >
              <InputNumber
                min={0}
                placeholder="0"
                className="w-full"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="owner_id"
              label="Người Phụ trách"
              rules={[{ required: true, message: 'Vui lòng chọn người phụ trách!' }]}
            >
              <Select 
                placeholder="Chọn người phụ trách"
                loading={loadingManagers}
                showSearch
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
        </Row>
      </Form>
    </Modal>
  );
};

export default RiskFormModal;
