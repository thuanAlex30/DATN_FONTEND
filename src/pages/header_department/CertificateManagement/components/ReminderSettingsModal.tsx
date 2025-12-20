import React, { useEffect } from 'react';
import { Modal, Form, Switch, Checkbox, message, Space, Input } from 'antd';
import type { Certificate } from '../../../../services/certificateService';
import certificateService from '../../../../services/certificateService';

const { Group: CheckboxGroup } = Checkbox;

interface ReminderSettingsModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  certificate: Certificate | null;
}

const ReminderSettingsModal: React.FC<ReminderSettingsModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  certificate
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible && certificate) {
      form.setFieldsValue({
        enabled: certificate.reminderSettings?.enabled ?? true,
        reminderDays: certificate.reminderSettings?.reminderDays || [30, 15, 7],
        notificationMethods: certificate.reminderSettings?.notificationMethods || ['EMAIL', 'SYSTEM'],
        recipients: certificate.reminderSettings?.recipients || []
      });
    }
  }, [visible, certificate, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (!certificate) {
        message.error('Không tìm thấy chứng chỉ');
        return;
      }

      const reminderSettings = {
        enabled: values.enabled,
        reminderDays: values.reminderDays || [],
        notificationMethods: values.notificationMethods || [],
        recipients: values.recipients || []
      };

      await certificateService.updateReminderSettings(certificate._id, reminderSettings);
      message.success('Cập nhật cài đặt nhắc nhở thành công');
      form.resetFields();
      onSuccess();
    } catch (error: any) {
      console.error('Error updating reminder settings:', error);
      message.error(error.response?.data?.message || 'Không thể cập nhật cài đặt nhắc nhở');
    }
  };

  const commonReminderDays = [90, 60, 30, 15, 7, 3, 1];

  return (
    <Modal
      title="Cài đặt nhắc nhở"
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      okText="Cập nhật"
      cancelText="Hủy"
      width={600}
    >
      {certificate && (
        <div style={{ marginBottom: 16 }}>
          <p><strong>Chứng chỉ:</strong> {certificate.certificateName}</p>
        </div>
      )}
      
      <Form form={form} layout="vertical">
        <Form.Item
          name="enabled"
          label="Bật nhắc nhở"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          name="reminderDays"
          label="Nhắc nhở trước (ngày)"
          rules={[{ required: true, message: 'Vui lòng chọn ít nhất một ngày nhắc nhở' }]}
        >
          <CheckboxGroup>
            <Space direction="vertical">
              {commonReminderDays.map(day => (
                <Checkbox key={day} value={day}>
                  {day} ngày trước khi hết hạn
                </Checkbox>
              ))}
            </Space>
          </CheckboxGroup>
        </Form.Item>

        <Form.Item
          name="notificationMethods"
          label="Phương thức thông báo"
          rules={[{ required: true, message: 'Vui lòng chọn ít nhất một phương thức' }]}
        >
          <CheckboxGroup>
            <Space>
              <Checkbox value="EMAIL">Email</Checkbox>
              <Checkbox value="SMS">SMS</Checkbox>
              <Checkbox value="SYSTEM">Hệ thống</Checkbox>
            </Space>
          </CheckboxGroup>
        </Form.Item>

        <Form.Item
          name="customReminderDays"
          label="Tùy chỉnh số ngày (cách nhau bằng dấu phẩy)"
          help="Nhập các số ngày cách nhau bằng dấu phẩy, ví dụ: 45, 20, 10"
        >
          <Input 
            placeholder="VD: 45, 20, 10" 
            onBlur={(e) => {
              const value = e.target.value;
              if (value) {
                try {
                  const customDays = value.split(',')
                    .map(d => parseInt(d.trim()))
                    .filter(d => !isNaN(d) && d > 0 && d <= 365);
                  
                  if (customDays.length > 0) {
                    const currentDays = form.getFieldValue('reminderDays') || [];
                    const mergedDays = [...new Set([...currentDays, ...customDays])].sort((a, b) => b - a);
                    form.setFieldsValue({ reminderDays: mergedDays });
                    form.setFieldsValue({ customReminderDays: '' });
                  }
                } catch (err) {
                  console.error('Error parsing custom reminder days:', err);
                }
              }
            }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ReminderSettingsModal;

