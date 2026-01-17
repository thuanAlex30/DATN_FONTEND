import React, { useState, useMemo } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Space,
  Button,
  Typography,
  Descriptions,
  Tag,
  Alert,
  Divider,
  InputNumber,
  Image,
  Avatar
} from 'antd';
import {
  UndoOutlined,
  ExclamationCircleOutlined,
  SafetyOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import * as ppeService from '../../../services/ppeService';
import type { PPEIssuance } from '../../../services/ppeService';
import dayjs from 'dayjs';
import { ENV } from '../../../config/env';

const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface PPEReturnConfirmationModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  issuance: PPEIssuance | null;
  userRole?: 'employee' | 'manager'; // Add userRole prop
  managerSummary?: any | null;
}

const PPEReturnConfirmationModal: React.FC<PPEReturnConfirmationModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  issuance,
  userRole = 'manager', // Default to manager for backward compatibility
  managerSummary = null
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Helper function to resolve image URL
  const apiBaseForImages = useMemo(() => {
    return ENV.API_BASE_URL.replace(/\/api\/?$/, '');
  }, []);

  const resolveImageUrl = (url?: string) => {
    if (!url) return undefined;
    if (url.startsWith('http')) return url;
    return `${apiBaseForImages}${url}`;
  };

  const handleSubmit = async (values: any) => {
    if (!issuance) return;

    setLoading(true);
    try {
      const returnData = {
        actual_return_date: values.actual_return_date.format('YYYY-MM-DD'),
        return_condition: values.return_condition,
        notes: values.notes || '',
        ...(userRole === 'manager' && { quantity: values.quantity })
      };

      // Use different API based on user role
      if (userRole === 'employee') {
        await ppeService.returnPPEIssuanceEmployee(issuance.id, returnData);
        message.success('Trả PPE cho Manager thành công!');
      } else {
        await ppeService.returnToAdmin(issuance.id, returnData);
        message.success('Trả PPE cho Admin thành công!');
      }

      form.resetFields();
      onSuccess();
      // notify other parts of the app to refresh PPE data
      try {
        window.dispatchEvent(new CustomEvent('ppe:refresh'));
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('Could not dispatch ppe:refresh event', e);
      }
    } catch (error: any) {
      console.error('Error returning PPE:', error);
      message.error(error.response?.data?.message || 'Có lỗi xảy ra khi trả PPE');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  if (!issuance) return null;

  // Support both issuance shapes:
  // - PPEIssuance: has item_id (object or id) and quantity
  // - ManagerPPE summary: has item (object) and aggregated totals (total_received, total_issued_to_employees, remaining_in_hand)
  const item = (issuance as any).item || (typeof issuance.item_id === 'object' && issuance.item_id) || null;
  const isOverdue = dayjs().isAfter(dayjs(issuance.expected_return_date));
  
  // For manager returning to admin:
  // normalize values from issuance shape (support different field names)
  const aggregatedInHandRaw = (issuance as any).remaining_in_hand ?? (issuance as any).remaining ?? (issuance as any).remaining_quantity;
  const totalIssuedToEmployeesRaw = (issuance as any).total_issued_to_employees ?? 0;
  // total received may be present on manager summary or on the issuance.quantity (single issuance)
  const totalReceivedRaw = managerSummary?.total_received ?? (issuance as any).total_received ?? (issuance as any).totalReceived ?? issuance.quantity ?? 0;

  const aggregatedInHand = Number(aggregatedInHandRaw);
  const totalIssuedToEmployees = Number(totalIssuedToEmployeesRaw) || 0;
  const totalReceived = Number(totalReceivedRaw) || 0;

  // If backend provides aggregatedInHand (manager's actual holding), use it directly.
  // Otherwise compute from totalReceived - totalIssuedToEmployees.
  let availableToReturn = 0;
  if (aggregatedInHandRaw !== undefined && aggregatedInHandRaw !== null && !Number.isNaN(aggregatedInHand)) {
    availableToReturn = Math.max(0, Math.floor(aggregatedInHand));
  } else {
    availableToReturn = Math.max(0, Math.floor(totalReceived - totalIssuedToEmployees));
  }

  // Display value used for both 'Còn giữ' and 'Có thể trả' for manager
  const remainingQuantity = userRole === 'manager'
    ? availableToReturn
    : (issuance.remaining_quantity ?? issuance.quantity ?? 0);

  return (
    <Modal
      title={
        <Space>
          <UndoOutlined style={{ color: '#1890ff' }} />
          <span>{userRole === 'employee' ? 'Trả PPE cho Manager' : 'Trả PPE cho Admin'}</span>
        </Space>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
      destroyOnClose
    >
      <div style={{ marginBottom: '16px' }}>
        {userRole === 'manager' && remainingQuantity <= 0 ? (
          <Alert
            message="Không thể trả PPE"
            description={`Bạn không có PPE nào để trả. Số PPE đang giữ (${aggregatedInHand || 0}) đã được phát hết cho nhân viên (${totalIssuedToEmployees || 0}). Vui lòng thu hồi PPE từ nhân viên trước khi trả về Admin.`}
            type="warning"
            showIcon
            icon={<ExclamationCircleOutlined />}
          />
        ) : (
          <Alert
            message="Xác nhận trả PPE"
            description={`Bạn đang trả PPE này cho ${userRole === 'employee' ? 'Manager' : 'Admin'}. Vui lòng kiểm tra kỹ tình trạng thiết bị trước khi trả.`}
            type="info"
            showIcon
            icon={<InfoCircleOutlined />}
          />
        )}
      </div>

      <Descriptions
        title="Thông tin PPE"
        bordered
        column={1}
        size="small"
        style={{ marginBottom: '16px' }}
      >
        <Descriptions.Item label="Thiết bị">
          <Space>
            {(item as any)?.image_url ? (
              <Image
                src={resolveImageUrl((item as any).image_url)}
                width={60}
                height={60}
                style={{ objectFit: 'cover', borderRadius: 8 }}
                preview={{ mask: 'Xem ảnh' }}
                fallback=""
              />
            ) : (
              <Avatar icon={<SafetyOutlined />} size={60} />
            )}
            <div>
              <div style={{ fontWeight: 'bold' }}>{item?.item_name || 'Không xác định'}</div>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Mã: {item?.item_code || 'N/A'}
              </Text>
            </div>
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label="Số lượng">
          <Space direction="vertical" size={0}>
            <Space>
            <Tag color="blue">Tổng nhận: {managerSummary?.total_received ?? (issuance as any).total_received ?? (issuance as any).totalReceived ?? issuance.quantity}</Tag>
              {userRole === 'manager' && (
                <Tag color="orange">Đã phát cho NV: {totalIssuedToEmployees}</Tag>
              )}
            </Space>
            {userRole === 'manager' ? (
              <Space>
                <Tag color="cyan">Còn giữ: {remainingQuantity}</Tag>
                <Tag color="green">Có thể trả: {remainingQuantity}</Tag>
              </Space>
            ) : (
              <Space>
                <Tag color="cyan">Còn giữ: {issuance.remaining_quantity ?? issuance.quantity}</Tag>
              </Space>
            )}
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label="Ngày phát">
          <Space>
            <CalendarOutlined />
            {dayjs(issuance.issued_date).format('DD/MM/YYYY')}
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label="Ngày trả dự kiến">
          <Space>
            <CalendarOutlined style={{ color: isOverdue ? '#ff4d4f' : '#52c41a' }} />
            <Text style={{ color: isOverdue ? '#ff4d4f' : '#52c41a' }}>
              {dayjs(issuance.expected_return_date).format('DD/MM/YYYY')}
            </Text>
            {isOverdue && <Tag color="red">Quá hạn</Tag>}
          </Space>
        </Descriptions.Item>
      </Descriptions>

      <Divider />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          actual_return_date: dayjs(),
          return_condition: 'good',
          notes: '',
          quantity: remainingQuantity
        }}
      >
        {userRole === 'manager' && (
          <Form.Item
            label="Số lượng trả"
            name="quantity"
            rules={[
              { required: true, message: 'Vui lòng nhập số lượng' },
              { type: 'number', min: 1, message: 'Số lượng phải lớn hơn 0' },
              { 
                type: 'number', 
                max: remainingQuantity, 
                message: `Số lượng không được vượt quá ${remainingQuantity}` 
              }
            ]}
            extra={`Số lượng PPE còn lại: ${remainingQuantity}`}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={1}
              max={remainingQuantity}
              placeholder="Nhập số lượng trả"
            />
          </Form.Item>
        )}

        <Form.Item
          label="Ngày trả thực tế"
          name="actual_return_date"
          rules={[{ required: true, message: 'Vui lòng chọn ngày trả' }]}
        >
          <DatePicker
            style={{ width: '100%' }}
            format="DD/MM/YYYY"
            placeholder="Chọn ngày trả"
          />
        </Form.Item>

        <Form.Item
          label="Tình trạng thiết bị"
          name="return_condition"
          rules={[{ required: true, message: 'Vui lòng chọn tình trạng thiết bị' }]}
        >
          <Select placeholder="Chọn tình trạng thiết bị">
            <Option value="good">
              <Space>
                <CheckCircleOutlined style={{ color: '#52c41a' }} />
                <span>Tốt - Thiết bị hoạt động bình thường</span>
              </Space>
            </Option>
            <Option value="damaged">
              <Space>
                <ExclamationCircleOutlined style={{ color: '#faad14' }} />
                <span>Hư hại - Thiết bị có vấn đề nhỏ</span>
              </Space>
            </Option>
            <Option value="worn">
              <Space>
                <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
                <span>Mòn - Thiết bị cần thay thế</span>
              </Space>
            </Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Ghi chú"
          name="notes"
        >
          <TextArea
            rows={4}
            placeholder="Ghi chú về tình trạng thiết bị, lý do trả, hoặc các vấn đề cần lưu ý..."
            maxLength={500}
            showCount
          />
        </Form.Item>

        <Form.Item>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={handleCancel} disabled={loading}>
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<UndoOutlined />}
              disabled={userRole === 'manager' && remainingQuantity <= 0}
            >
              {loading ? 'Đang trả...' : 'Xác nhận trả PPE'}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PPEReturnConfirmationModal;
