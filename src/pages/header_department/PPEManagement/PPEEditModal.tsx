import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, Button, message, Space, Row, Col } from 'antd';
import type { PPEItem, PPECategory } from '../../../services/ppeService';
import * as ppeService from '../../../services/ppeService';

interface PPEEditModalProps {
  item: PPEItem | null;
  categories: PPECategory[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PPEEditModal: React.FC<PPEEditModalProps> = ({
  item,
  categories,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen && item) {
      form.setFieldsValue({
        category_id: item.category_id,
        item_code: item.item_code || '',
        item_name: item.item_name || '',
        brand: item.brand || '',
        model: item.model || '',
        reorder_level: item.reorder_level || 10,
        quantity_available: item.quantity_available || 0,
        quantity_allocated: item.quantity_allocated || 0
      });
    } else if (isOpen && !item) {
      form.resetFields();
    }
  }, [isOpen, item, form]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      if (item) {
        // Update existing item
        await ppeService.updatePPEItem(item.id || (item as any)._id, values);
        message.success('Cập nhật thiết bị thành công');
      } else {
        // Create new item
        await ppeService.createPPEItem(values);
        message.success('Tạo thiết bị thành công');
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
      title={item ? 'Chỉnh sửa thiết bị' : 'Thêm thiết bị mới'}
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="category_id"
              label="Danh mục"
              rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
            >
              <Select placeholder="Chọn danh mục">
                {categories.map(category => (
                  <Select.Option key={category.id || (category as any)._id} value={category.id || (category as any)._id}>
                    {category.category_name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="item_code"
              label="Mã thiết bị"
              rules={[{ required: true, message: 'Vui lòng nhập mã thiết bị!' }]}
            >
              <Input placeholder="Nhập mã thiết bị" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="item_name"
          label="Tên thiết bị"
          rules={[{ required: true, message: 'Vui lòng nhập tên thiết bị!' }]}
        >
          <Input placeholder="Nhập tên thiết bị" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="brand"
              label="Thương hiệu"
              rules={[{ required: true, message: 'Vui lòng nhập thương hiệu!' }]}
            >
              <Input placeholder="Nhập thương hiệu" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="model"
              label="Model"
            >
              <Input placeholder="Nhập model" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="reorder_level"
              label="Mức tái đặt hàng"
              rules={[{ required: true, message: 'Vui lòng nhập mức tái đặt hàng!' }]}
            >
              <InputNumber 
                min={0} 
                style={{ width: '100%' }}
                placeholder="Mức tái đặt hàng"
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="quantity_available"
              label="Số lượng có sẵn"
              rules={[{ required: true, message: 'Vui lòng nhập số lượng!' }]}
            >
              <InputNumber 
                min={0} 
                style={{ width: '100%' }}
                placeholder="Số lượng có sẵn"
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="quantity_allocated"
              label="Số lượng đã phân phối"
            >
              <InputNumber 
                min={0} 
                style={{ width: '100%' }}
                placeholder="Số lượng đã phân phối"
              />
            </Form.Item>
          </Col>
        </Row>

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
              {item ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PPEEditModal;