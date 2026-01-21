import React, { useEffect } from 'react';
import { Modal, Form, DatePicker, Input, message } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import certificateService from '../../../../services/certificateService';

const { TextArea } = Input;

interface RenewUserCertificateModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  userCertificate: any | null;
}

const RenewUserCertificateModal: React.FC<RenewUserCertificateModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  userCertificate,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible && userCertificate) {
      const currentExpiry =
        userCertificate.expiryDate ||
        userCertificate.personalExpiryDate ||
        null;

      form.setFieldsValue({
        renewalDate: dayjs(),
        newExpiryDate: currentExpiry ? dayjs(currentExpiry) : null,
        notes: '',
      });
    } else if (!visible) {
      form.resetFields();
    }
  }, [visible, userCertificate, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (!userCertificate) {
        message.error('Không tìm thấy chứng chỉ cá nhân');
        return;
      }

      const id = userCertificate._id || userCertificate.id;
      if (!id) {
        message.error('ID chứng chỉ cá nhân không hợp lệ');
        return;
      }

      const renewalDate: Dayjs = values.renewalDate;
      const newExpiryDate: Dayjs = values.newExpiryDate;

      if (newExpiryDate && renewalDate && newExpiryDate.isBefore(renewalDate, 'day')) {
        message.error('Ngày hết hạn mới phải sau hoặc bằng ngày gia hạn');
        return;
      }

      const updateData: any = {
        expiryDate: newExpiryDate ? newExpiryDate.toISOString() : undefined,
        renewalStatus: 'COMPLETED',
        renewalNotes: values.notes || undefined,
        requestedExpiryDate: undefined,
      };

      await certificateService.updateUserCertificate(id, updateData);
      message.success('Gia hạn chứng chỉ cá nhân thành công');
      form.resetFields();
      onSuccess();
    } catch (error: any) {
      console.error('Error renewing user certificate:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Không thể gia hạn chứng chỉ cá nhân';
      message.error(errorMessage);
    }
  };

  return (
    <Modal
      title="Gia hạn chứng chỉ cá nhân"
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      okText="Gia hạn"
      cancelText="Hủy"
    >
      {userCertificate && (
        <div style={{ marginBottom: 16 }}>
          <p>
            <strong>Tên chứng chỉ:</strong>{' '}
            {userCertificate.certificateName ||
              userCertificate.certificate_id?.certificateName ||
              '-'}
          </p>
          {userCertificate.certificateNumber && (
            <p>
              <strong>Số chứng chỉ:</strong> {userCertificate.certificateNumber}
            </p>
          )}
          {(userCertificate.expiryDate || userCertificate.personalExpiryDate) && (
            <p>
              <strong>Ngày hết hạn hiện tại:</strong>{' '}
              {new Date(
                userCertificate.expiryDate || userCertificate.personalExpiryDate,
              ).toLocaleDateString('vi-VN')}
            </p>
          )}
        </div>
      )}

      <Form form={form} layout="vertical">
        <Form.Item
          name="renewalDate"
          label="Ngày gia hạn"
          rules={[{ required: true, message: 'Vui lòng chọn ngày gia hạn' }]}
        >
          <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
        </Form.Item>

        <Form.Item
          name="newExpiryDate"
          label="Ngày hết hạn mới"
          rules={[{ required: true, message: 'Vui lòng chọn ngày hết hạn mới' }]}
        >
          <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
        </Form.Item>

        <Form.Item name="notes" label="Ghi chú">
          <TextArea rows={3} placeholder="Nhập ghi chú về việc gia hạn" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default RenewUserCertificateModal;


