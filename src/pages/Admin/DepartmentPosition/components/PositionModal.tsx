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
  InputNumber,
  Row,
  Col,
  Typography,
  Divider,
  Tooltip
} from 'antd';
import { UserOutlined, InfoCircleOutlined, StarOutlined } from '@ant-design/icons';
import positionService from '../../../../services/positionService';
import type { Position as APIPosition } from '../../../../types/position';

const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

interface PositionModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  position?: APIPosition | null;
  mode: 'create' | 'edit';
}

const PositionModal: React.FC<PositionModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  position,
  mode
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const isEdit = mode === 'edit';
  const title = isEdit ? 'Chỉnh sửa vị trí' : 'Thêm vị trí mới';

  // Set form values when editing
  useEffect(() => {
    if (visible && position && isEdit) {
      form.setFieldsValue({
        position_name: position.position_name,
        description: position.description,
        level: position.level,
        is_active: position.is_active
      });
    } else if (visible && !isEdit) {
      form.resetFields();
    }
  }, [visible, position, isEdit, form]);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      
      if (isEdit && position) {
        // Update position
        const response = await positionService.updatePosition(position.id, values);
        if (response.success) {
          message.success('Cập nhật vị trí thành công!');
          onSuccess();
        } else {
          message.error(response.message || 'Cập nhật vị trí thất bại!');
        }
      } else {
        // Create new position
        const response = await positionService.createPosition(values);
        if (response.success) {
          message.success('Tạo vị trí thành công!');
          onSuccess();
        } else {
          message.error(response.message || 'Tạo vị trí thất bại!');
        }
      }
    } catch (error) {
      console.error('Error submitting position:', error);
      message.error('Có lỗi xảy ra khi xử lý vị trí!');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  const getLevelName = (level: number) => {
    const levelNames: { [key: number]: string } = {
      1: 'Thực tập sinh',
      2: 'Nhân viên',
      3: 'Chuyên viên',
      4: 'Trưởng nhóm',
      5: 'Quản lý',
      6: 'Giám đốc',
      7: 'Phó giám đốc',
      8: 'Tổng giám đốc',
      9: 'Chủ tịch',
      10: 'Cố vấn'
    };
    return levelNames[level] || `Cấp ${level}`;
  };

  const getLevelColor = (level: number) => {
    if (level <= 2) return '#52c41a'; // Green for junior
    if (level <= 5) return '#1890ff'; // Blue for mid-level
    if (level <= 7) return '#faad14'; // Orange for senior
    return '#722ed1'; // Purple for executive
  };

  return (
    <Modal
      title={
        <Space>
          <UserOutlined />
          {title}
        </Space>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          level: 1,
          is_active: true
        }}
      >
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="position_name"
              label="Tên vị trí"
              rules={[
                { required: true, message: 'Vui lòng nhập tên vị trí!' },
                { min: 2, message: 'Tên vị trí phải có ít nhất 2 ký tự!' },
                { max: 100, message: 'Tên vị trí không được quá 100 ký tự!' }
              ]}
            >
              <Input
                placeholder="Nhập tên vị trí công việc"
                prefix={<UserOutlined />}
                size="large"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="description"
              label="Mô tả công việc"
              rules={[
                { max: 1000, message: 'Mô tả không được quá 1000 ký tự!' }
              ]}
            >
              <TextArea
                placeholder="Nhập mô tả chi tiết về vị trí công việc"
                rows={4}
                showCount
                maxLength={1000}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="level"
              label={
                <Space>
                  <StarOutlined />
                  Cấp bậc
                  <Tooltip title="Cấp bậc từ 1-10, càng cao càng quan trọng">
                    <InfoCircleOutlined style={{ color: '#1890ff' }} />
                  </Tooltip>
                </Space>
              }
              rules={[
                { required: true, message: 'Vui lòng chọn cấp bậc!' }
              ]}
            >
              <Select
                placeholder="Chọn cấp bậc vị trí"
                size="large"
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.children as string)?.toLowerCase().includes(input.toLowerCase())
                }
              >
                {Array.from({ length: 10 }, (_, i) => i + 1).map(level => (
                  <Option key={level} value={level}>
                    <Space>
                      <span style={{ color: getLevelColor(level) }}>
                        {getLevelName(level)}
                      </span>
                      <Text type="secondary">(Cấp {level})</Text>
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
                  Vị trí đang hoạt động
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
              icon={<UserOutlined />}
            >
              {isEdit ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </Space>
        </div>
      </Form>
    </Modal>
  );
};

export default PositionModal;
