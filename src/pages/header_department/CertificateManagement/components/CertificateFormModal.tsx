import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, InputNumber, DatePicker, message, Space } from 'antd';
import type { Certificate } from '../../../../services/certificateService';
import dayjs from 'dayjs';
import certificateService from '../../../../services/certificateService';

const { Option } = Select;
const { TextArea } = Input;

interface CertificateFormModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  certificate?: Certificate | null;
  mode: 'create' | 'edit';
}

const CertificateFormModal: React.FC<CertificateFormModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  certificate,
  mode
}) => {
  const [form] = Form.useForm();
  const [checkingDuplicate, setCheckingDuplicate] = React.useState(false);

  useEffect(() => {
    if (visible) {
      if (mode === 'edit' && certificate) {
        form.setFieldsValue({
          ...certificate,
          issueDate: (certificate as any).issueDate ? dayjs((certificate as any).issueDate) : undefined,
          expiryDate: (certificate as any).expiryDate ? dayjs((certificate as any).expiryDate) : undefined,
          reminderSettings: {
            ...certificate.reminderSettings,
            reminderDays: certificate.reminderSettings?.reminderDays || []
          }
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          status: 'ACTIVE',
          priority: 'MEDIUM',
          validityPeriodUnit: 'MONTHS',
          reminderSettings: {
            enabled: true,
            reminderDays: [30, 15, 7],
            notificationMethods: ['EMAIL', 'SYSTEM']
          }
        });
      }
    }
  }, [visible, certificate, mode, form]);

  const handleCheckDuplicate = async (field: 'certificateName' | 'certificateCode', value: string) => {
    if (!value) return;
    
    setCheckingDuplicate(true);
    try {
      const checkData: any = {};
      checkData[field] = value;
      const result = await certificateService.checkDuplicate(
        field === 'certificateName' ? value : undefined,
        field === 'certificateCode' ? value : undefined
      );
      
      if (result.isDuplicate) {
        form.setFields([
          {
            name: field,
            errors: [`${field === 'certificateName' ? 'Tên' : 'Mã'} chứng chỉ đã tồn tại`]
          }
        ]);
      } else {
        form.setFields([
          {
            name: field,
            errors: []
          }
        ]);
      }
    } catch (error) {
      console.error('Error checking duplicate:', error);
    } finally {
      setCheckingDuplicate(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Calculate expiry date if not provided
      let expiryDate = values.expiryDate;
      if (!expiryDate && values.issueDate && values.validityPeriod && values.validityPeriodUnit) {
        const issueDate = dayjs(values.issueDate);
        if (values.validityPeriodUnit === 'MONTHS') {
          expiryDate = issueDate.add(values.validityPeriod, 'month');
        } else if (values.validityPeriodUnit === 'YEARS') {
          expiryDate = issueDate.add(values.validityPeriod, 'year');
        }
      }
      
      // Format dates
      const formData: any = {
        ...values,
        issueDate: values.issueDate ? values.issueDate.toISOString() : new Date().toISOString(),
        expiryDate: expiryDate ? expiryDate.toISOString() : undefined,
        validityPeriod: values.validityPeriod || 12,
        applicableRegulations: values.applicableRegulations ? (Array.isArray(values.applicableRegulations) ? values.applicableRegulations : values.applicableRegulations.split(',').map((r: string) => r.trim())) : []
      };
      
      // Remove fields that should not be sent
      delete formData.cost;
      delete formData.currency;
      delete formData.legalBasis;
      delete formData.renewalRequired;
      delete formData.renewalProcess;
      delete formData.tags;

      if (mode === 'create') {
        await certificateService.createCertificate(formData);
        message.success('Tạo chứng chỉ thành công');
      } else if (certificate) {
        await certificateService.updateCertificate(certificate._id, formData);
        message.success('Cập nhật chứng chỉ thành công');
      }
      
      form.resetFields();
      onSuccess();
    } catch (error: any) {
      console.error('Error submitting form:', error);
      if (error.errorFields) {
        // Validation errors
        return;
      }
      message.error(error.response?.data?.message || `Không thể ${mode === 'create' ? 'tạo' : 'cập nhật'} chứng chỉ`);
    }
  };

  return (
    <Modal
      title={mode === 'create' ? 'Tạo chứng chỉ mới' : 'Chỉnh sửa chứng chỉ'}
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      width={800}
      okText={mode === 'create' ? 'Tạo mới' : 'Cập nhật'}
      cancelText="Hủy"
      confirmLoading={checkingDuplicate}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          status: 'ACTIVE',
          priority: 'MEDIUM',
          validityPeriodUnit: 'MONTHS'
        }}
      >
        <Form.Item
          name="certificateName"
          label="Tên chứng chỉ"
          rules={[{ required: true, message: 'Vui lòng nhập tên chứng chỉ' }]}
        >
          <Input 
            placeholder="Nhập tên chứng chỉ"
            onBlur={(e) => handleCheckDuplicate('certificateName', e.target.value)}
          />
        </Form.Item>

        <Form.Item
          name="certificateCode"
          label="Mã chứng chỉ"
          rules={[{ required: true, message: 'Vui lòng nhập mã chứng chỉ' }]}
        >
          <Input 
            placeholder="Nhập mã chứng chỉ (VD: SAF-ABC-123)"
            onBlur={(e) => handleCheckDuplicate('certificateCode', e.target.value)}
          />
        </Form.Item>

        <Form.Item
          name="category"
          label="Danh mục"
          rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
        >
          <Select placeholder="Chọn danh mục">
            <Option value="SAFETY">An toàn lao động</Option>
            <Option value="TECHNICAL">Kỹ thuật</Option>
            <Option value="MANAGEMENT">Quản lý</Option>
            <Option value="QUALITY">Chất lượng</Option>
            <Option value="ENVIRONMENTAL">Môi trường</Option>
            <Option value="HEALTH">Sức khỏe</Option>
            <Option value="OTHER">Khác</Option>
          </Select>
        </Form.Item>

        <Form.Item name="subCategory" label="Danh mục phụ">
          <Input placeholder="Nhập danh mục phụ (tùy chọn)" />
        </Form.Item>

        <Form.Item
          name="issuingAuthority"
          label="Cơ quan cấp phát"
          rules={[{ required: true, message: 'Vui lòng nhập cơ quan cấp phát' }]}
        >
          <Input placeholder="Nhập tên cơ quan cấp phát" />
        </Form.Item>

        <Form.Item name="description" label="Mô tả">
          <TextArea rows={3} placeholder="Nhập mô tả chứng chỉ" />
        </Form.Item>

        <Space style={{ width: '100%' }} size="large">
          <Form.Item
            name="priority"
            label="Mức độ ưu tiên"
            style={{ flex: 1 }}
          >
            <Select>
              <Option value="LOW">Thấp</Option>
              <Option value="MEDIUM">Trung bình</Option>
              <Option value="HIGH">Cao</Option>
              <Option value="CRITICAL">Nghiêm trọng</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="Trạng thái"
            style={{ flex: 1 }}
          >
            <Select>
              <Option value="ACTIVE">Đang hoạt động</Option>
              <Option value="INACTIVE">Không hoạt động</Option>
              <Option value="SUSPENDED">Tạm dừng</Option>
              <Option value="EXPIRED">Đã hết hạn</Option>
            </Select>
          </Form.Item>
        </Space>

        <Space style={{ width: '100%' }} size="large">
          <Form.Item
            name="validityPeriod"
            label="Thời gian hiệu lực"
            style={{ flex: 1 }}
            rules={[{ required: true, message: 'Vui lòng nhập thời gian hiệu lực' }]}
          >
            <InputNumber min={1} max={120} placeholder="Số tháng/năm" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="validityPeriodUnit"
            label="Đơn vị"
            style={{ flex: 1 }}
          >
            <Select>
              <Option value="MONTHS">Tháng</Option>
              <Option value="YEARS">Năm</Option>
            </Select>
          </Form.Item>
        </Space>

        <Space style={{ width: '100%' }} size="large">
          <Form.Item
            name="issueDate"
            label="Ngày cấp"
            style={{ flex: 1 }}
          >
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item
            name="expiryDate"
            label="Ngày hết hạn"
            style={{ flex: 1 }}
          >
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
        </Space>

        <Form.Item name="notes" label="Ghi chú">
          <TextArea rows={2} placeholder="Nhập ghi chú" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CertificateFormModal;

