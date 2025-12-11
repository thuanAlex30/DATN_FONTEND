import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Button, message, Space, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { PPECategory } from '../../../services/ppeService';
import * as ppeService from '../../../services/ppeService';

interface CategoryEditModalProps {
  category: PPECategory | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CategoryEditModal: React.FC<CategoryEditModalProps> = ({
  category,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen && category) {
      form.setFieldsValue({
        category_name: category.category_name || '',
        description: category.description || '',
        lifespan_months: category.lifespan_months || 0
      });
      setPreviewUrl(category.image_url || '');
      setImageFile(null);
    } else if (isOpen && !category) {
      form.resetFields();
      setPreviewUrl('');
      setImageFile(null);
    }
  }, [isOpen, category, form]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      if (category) {
        // Update existing category
        await ppeService.updatePPECategory(category.id || (category as any)._id, {
          ...values,
          imageFile
        });
        message.success('Cập nhật danh mục thành công');
      } else {
        // Create new category
        await ppeService.createPPECategory({
          ...values,
          imageFile
        });
        message.success('Tạo danh mục thành công');
      }
      onSuccess();
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={category ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="category_name"
          label="Tên danh mục"
          rules={[{ required: true, message: 'Vui lòng nhập tên danh mục!' }]}
        >
          <Input placeholder="Nhập tên danh mục" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Mô tả"
          rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
        >
          <Input.TextArea 
            rows={4} 
            placeholder="Nhập mô tả danh mục" 
          />
        </Form.Item>

        <Form.Item
          name="lifespan_months"
          label="Tuổi thọ (tháng)"
          rules={[{ required: true, message: 'Vui lòng nhập tuổi thọ!' }]}
        >
          <InputNumber 
            min={1} 
            max={120} 
            style={{ width: '100%' }}
            placeholder="Nhập tuổi thọ tính bằng tháng"
          />
        </Form.Item>

        <Form.Item label="Ảnh danh mục">
          <Space align="start">
            <Upload
              accept="image/*"
              showUploadList={false}
              beforeUpload={(file) => {
                setImageFile(file);
                setPreviewUrl(URL.createObjectURL(file));
                return false;
              }}
            >
              <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
            </Upload>
            {(previewUrl || category?.image_url) && (
              <img
                src={previewUrl || category?.image_url}
                alt="category preview"
                style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 8, border: '1px solid #f0f0f0' }}
              />
            )}
          </Space>
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
          <Space>
            <Button onClick={onClose}>
              Hủy
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
            >
              {category ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CategoryEditModal;