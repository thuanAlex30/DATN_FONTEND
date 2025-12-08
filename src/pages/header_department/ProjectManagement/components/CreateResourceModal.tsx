import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, InputNumber, DatePicker, Button, message, Card, Divider } from 'antd';
import { PlusOutlined, EditOutlined, UserOutlined, ToolOutlined, ExperimentOutlined, CalendarOutlined, EnvironmentOutlined, FileTextOutlined } from '@ant-design/icons';
import type { CreateProjectResourceData, UpdateProjectResourceData } from '../../../../services/projectResourceService';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

interface CreateResourceModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: (resource: any) => void;
  projectId: string;
  editingResource?: any | null;
}

const CreateResourceModal: React.FC<CreateResourceModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  projectId,
  editingResource = null
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const isEditMode = !!editingResource;

  useEffect(() => {
    if (visible && editingResource) {
      form.setFieldsValue({
        resource_name: editingResource.resource_name,
        resource_type: editingResource.resource_type,
        planned_quantity: editingResource.planned_quantity,
        unit_measure: editingResource.unit_measure,
        required_date: editingResource.required_date ? dayjs(editingResource.required_date) : null,
        location: editingResource.location,
        description: editingResource.description,
        notes: editingResource.notes
      });
    } else if (visible && !editingResource) {
      form.resetFields();
    }
  }, [visible, editingResource, form]);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      
      // Import service dynamically to avoid circular imports
      const { default: projectResourceService } = await import('../../../../services/projectResourceService');
      
      if (isEditMode && editingResource) {
        // Update existing resource
        const updateData: UpdateProjectResourceData = {
          resource_type: values.resource_type,
          resource_name: values.resource_name,
          description: values.description,
          planned_quantity: values.planned_quantity,
          unit_measure: values.unit_measure,
          required_date: values.required_date ? values.required_date.format('YYYY-MM-DD') : undefined,
          location: values.location,
          notes: values.notes
        };

        const updatedResource = await projectResourceService.updateResource(editingResource._id || editingResource.id, updateData);
        message.success('Cập nhật tài nguyên thành công!');
        onSuccess(updatedResource);
      } else {
        // Create new resource
        const resourceData: CreateProjectResourceData = {
          project_id: projectId,
          resource_type: values.resource_type,
          resource_name: values.resource_name,
          description: values.description,
          planned_quantity: values.planned_quantity,
          unit_measure: values.unit_measure,
          required_date: values.required_date.format('YYYY-MM-DD'),
          location: values.location,
          notes: values.notes
        };

        const newResource = await projectResourceService.createResource(resourceData);
        message.success('Tạo tài nguyên thành công!');
        onSuccess(newResource);
      }
      
      form.resetFields();
      onCancel();
    } catch (error: any) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} resource:`, error);
      message.error(error.response?.data?.message || `Không thể ${isEditMode ? 'cập nhật' : 'tạo'} tài nguyên`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  const getResourceTypeIcon = (type: string) => {
    switch (type) {
      case 'PERSONNEL': return <UserOutlined className="text-blue-500" />;
      case 'EQUIPMENT': return <ToolOutlined className="text-green-500" />;
      case 'MATERIAL': return <ExperimentOutlined className="text-orange-500" />;
      case 'TOOL': return <ToolOutlined className="text-green-500" />;
      case 'VEHICLE': return <EnvironmentOutlined className="text-purple-500" />;
      case 'SUBCONTRACTOR': return <UserOutlined className="text-cyan-500" />;
      default: return <PlusOutlined className="text-gray-500" />;
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center space-x-3 py-2">
          <div className={`w-10 h-10 bg-gradient-to-r ${isEditMode ? 'from-green-500 to-emerald-600' : 'from-blue-500 to-purple-600'} rounded-lg flex items-center justify-center`}>
            {isEditMode ? <EditOutlined className="text-white text-lg" /> : <PlusOutlined className="text-white text-lg" />}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 m-0">
              {isEditMode ? 'Chỉnh sửa Tài nguyên' : 'Tạo Tài nguyên Mới'}
            </h3>
            <p className="text-sm text-gray-500 m-0">
              {isEditMode ? 'Cập nhật thông tin tài nguyên' : 'Thêm tài nguyên vào dự án của bạn'}
            </p>
          </div>
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={700}
      className="create-resource-modal"
      styles={{
        body: { padding: '24px' }
      }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="space-y-6"
      >
        {/* Thông tin cơ bản */}
        <Card 
          size="small" 
          className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50"
          title={
            <div className="flex items-center space-x-2">
              <FileTextOutlined className="text-blue-600" />
              <span className="text-blue-800 font-medium">Thông tin cơ bản</span>
            </div>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="resource_name"
              label={
                <span className="text-gray-700 font-medium">
                  Tên tài nguyên <span className="text-red-500">*</span>
                </span>
              }
              rules={[
                { required: true, message: 'Vui lòng nhập tên tài nguyên' },
                { max: 255, message: 'Tên tài nguyên không được quá 255 ký tự' }
              ]}
            >
              <Input 
                placeholder="Nhập tên tài nguyên" 
                size="large"
                className="rounded-lg border-gray-300 hover:border-blue-400 focus:border-blue-500"
              />
            </Form.Item>

            <Form.Item
              name="resource_type"
              label={
                <span className="text-gray-700 font-medium">
                  Loại tài nguyên <span className="text-red-500">*</span>
                </span>
              }
              rules={[{ required: true, message: 'Vui lòng chọn loại tài nguyên' }]}
            >
              <Select 
                placeholder="Chọn loại tài nguyên" 
                size="large"
                className="rounded-lg"
                optionLabelProp="label"
              >
                <Option value="PERSONNEL" label={
                  <div className="flex items-center space-x-2">
                    <UserOutlined className="text-blue-500" />
                    <span>Nhân lực</span>
                  </div>
                }>
                  <div className="flex items-center space-x-2">
                    <UserOutlined className="text-blue-500" />
                    <span>Nhân lực</span>
                  </div>
                </Option>
                <Option value="EQUIPMENT" label={
                  <div className="flex items-center space-x-2">
                    <ToolOutlined className="text-green-500" />
                    <span>Thiết bị</span>
                  </div>
                }>
                  <div className="flex items-center space-x-2">
                    <ToolOutlined className="text-green-500" />
                    <span>Thiết bị</span>
                  </div>
                </Option>
                <Option value="MATERIAL" label={
                  <div className="flex items-center space-x-2">
                    <ExperimentOutlined className="text-orange-500" />
                    <span>Vật liệu</span>
                  </div>
                }>
                  <div className="flex items-center space-x-2">
                    <ExperimentOutlined className="text-orange-500" />
                    <span>Vật liệu</span>
                  </div>
                </Option>
                <Option value="TOOL" label={
                  <div className="flex items-center space-x-2">
                    <ToolOutlined className="text-green-500" />
                    <span>Công cụ</span>
                  </div>
                }>
                  <div className="flex items-center space-x-2">
                    <ToolOutlined className="text-green-500" />
                    <span>Công cụ</span>
                  </div>
                </Option>
                <Option value="VEHICLE" label={
                  <div className="flex items-center space-x-2">
                    <EnvironmentOutlined className="text-purple-500" />
                    <span>Phương tiện</span>
                  </div>
                }>
                  <div className="flex items-center space-x-2">
                    <EnvironmentOutlined className="text-purple-500" />
                    <span>Phương tiện</span>
                  </div>
                </Option>
                <Option value="SUBCONTRACTOR" label={
                  <div className="flex items-center space-x-2">
                    <UserOutlined className="text-cyan-500" />
                    <span>Nhà thầu phụ</span>
                  </div>
                }>
                  <div className="flex items-center space-x-2">
                    <UserOutlined className="text-cyan-500" />
                    <span>Nhà thầu phụ</span>
                  </div>
                </Option>
              </Select>
            </Form.Item>
          </div>
        </Card>

        {/* Thông tin số lượng */}
        <Card 
          size="small" 
          className="border-0 shadow-sm bg-gradient-to-r from-green-50 to-emerald-50"
          title={
            <div className="flex items-center space-x-2">
              <ToolOutlined className="text-green-600" />
              <span className="text-green-800 font-medium">Thông tin số lượng</span>
            </div>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="planned_quantity"
              label={
                <span className="text-gray-700 font-medium">
                  Số lượng dự kiến <span className="text-red-500">*</span>
                </span>
              }
              rules={[
                { required: true, message: 'Vui lòng nhập số lượng' },
                { type: 'number', min: 1, message: 'Số lượng phải lớn hơn 0' }
              ]}
            >
              <InputNumber 
                min={1} 
                placeholder="Nhập số lượng" 
                className="w-full rounded-lg border-gray-300 hover:border-green-400 focus:border-green-500"
                size="large"
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item
              name="unit_measure"
              label={
                <span className="text-gray-700 font-medium">
                  Đơn vị đo <span className="text-red-500">*</span>
                </span>
              }
              rules={[{ required: true, message: 'Vui lòng nhập đơn vị đo' }]}
            >
              <Input 
                placeholder="VD: cái, kg, m², giờ..." 
                size="large"
                className="rounded-lg border-gray-300 hover:border-green-400 focus:border-green-500"
              />
            </Form.Item>
          </div>
        </Card>

        {/* Thông tin thời gian */}
        <Card 
          size="small" 
          className="border-0 shadow-sm bg-gradient-to-r from-purple-50 to-pink-50"
          title={
            <div className="flex items-center space-x-2">
              <CalendarOutlined className="text-purple-600" />
              <span className="text-purple-800 font-medium">Thông tin thời gian</span>
            </div>
          }
        >
          <Form.Item
            name="required_date"
            label={
              <span className="text-gray-700 font-medium">
                Ngày yêu cầu <span className="text-red-500">*</span>
              </span>
            }
            rules={[{ required: true, message: 'Vui lòng chọn ngày yêu cầu' }]}
          >
            <DatePicker 
              className="w-full rounded-lg border-gray-300 hover:border-purple-400 focus:border-purple-500" 
              placeholder="Chọn ngày yêu cầu"
              format="DD/MM/YYYY"
              size="large"
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Card>

        {/* Thông tin bổ sung */}
        <Card 
          size="small" 
          className="border-0 shadow-sm bg-gradient-to-r from-orange-50 to-yellow-50"
          title={
            <div className="flex items-center space-x-2">
              <EnvironmentOutlined className="text-orange-600" />
              <span className="text-orange-800 font-medium">Thông tin bổ sung</span>
            </div>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="location"
              label={<span className="text-gray-700 font-medium">Vị trí sử dụng</span>}
            >
              <Input 
                placeholder="Vị trí sử dụng tài nguyên" 
                size="large"
                className="rounded-lg border-gray-300 hover:border-orange-400 focus:border-orange-500"
                prefix={<EnvironmentOutlined className="text-gray-400" />}
              />
            </Form.Item>

            <Form.Item
              name="description"
              label={<span className="text-gray-700 font-medium">Mô tả</span>}
            >
              <Input 
                placeholder="Mô tả ngắn về tài nguyên" 
                size="large"
                className="rounded-lg border-gray-300 hover:border-orange-400 focus:border-orange-500"
                prefix={<FileTextOutlined className="text-gray-400" />}
              />
            </Form.Item>
          </div>

          <Form.Item
            name="notes"
            label={<span className="text-gray-700 font-medium">Ghi chú</span>}
          >
            <TextArea 
              rows={3} 
              placeholder="Ghi chú bổ sung về tài nguyên..." 
              size="large"
              className="rounded-lg border-gray-300 hover:border-orange-400 focus:border-orange-500"
            />
          </Form.Item>
        </Card>

        {/* Footer buttons */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <Button 
            onClick={handleCancel} 
            size="large"
            className="px-6 rounded-lg border-gray-300 hover:border-gray-400"
          >
            Hủy bỏ
          </Button>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading}
            size="large"
            className={`px-8 rounded-lg border-0 shadow-lg hover:shadow-xl transition-all duration-200 ${
              isEditMode 
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700' 
                : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
            }`}
          >
            {isEditMode ? (
              <>
                <EditOutlined className="mr-2" />
                Cập nhật tài nguyên
              </>
            ) : (
              <>
                <PlusOutlined className="mr-2" />
                Tạo tài nguyên
              </>
            )}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateResourceModal;
