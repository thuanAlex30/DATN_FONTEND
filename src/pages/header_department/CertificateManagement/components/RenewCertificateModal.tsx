import React, { useEffect } from 'react';
import { Modal, Form, DatePicker, Input, message } from 'antd';
import type { Certificate } from '../../../../services/certificateService';
import dayjs from 'dayjs';
import certificateService from '../../../../services/certificateService';

const { TextArea } = Input;

interface RenewCertificateModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  certificate: Certificate | null;
}

const RenewCertificateModal: React.FC<RenewCertificateModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  certificate
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible && certificate) {
      form.setFieldsValue({
        renewalDate: dayjs(),
        notes: ''
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

      const renewalData = {
        renewalDate: values.renewalDate ? values.renewalDate.toISOString() : new Date().toISOString(),
        notes: values.notes || ''
      };

      await certificateService.renewCertificate(certificate._id, renewalData);
      message.success('Gia hạn chứng chỉ thành công');
      form.resetFields();
      onSuccess();
    } catch (error: any) {
      console.error('Error renewing certificate:', error);
      message.error(error.response?.data?.message || 'Không thể gia hạn chứng chỉ');
    }
  };

  return (
    <Modal
      title="Gia hạn chứng chỉ"
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      okText="Gia hạn"
      cancelText="Hủy"
    >
      {certificate && (
        <div style={{ marginBottom: 16 }}>
          <p><strong>Tên chứng chỉ:</strong> {certificate.certificateName}</p>
          <p><strong>Mã chứng chỉ:</strong> {certificate.certificateCode}</p>
          {certificate.expiryDate && (
            <p><strong>Ngày hết hạn hiện tại:</strong> {new Date(certificate.expiryDate).toLocaleDateString('vi-VN')}</p>
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

        <Form.Item name="notes" label="Ghi chú">
          <TextArea rows={3} placeholder="Nhập ghi chú về việc gia hạn" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default RenewCertificateModal;

