import React, { useState } from 'react';
import { Modal, Upload, Button, message, Space, Alert, Typography, Steps } from 'antd';
import { UploadOutlined, DownloadOutlined, FileExcelOutlined } from '@ant-design/icons';
import * as ppeService from '../../../services/ppeService';

interface ImportCategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: () => void;
}

const { Title, Text } = Typography;
const { Step } = Steps;

const ImportCategoriesModal: React.FC<ImportCategoriesModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess
}) => {
  const [fileList, setFileList] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.warning('Vui lòng chọn file để upload');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', fileList[0].originFileObj);
      
      await ppeService.importPPECategories(formData);
      message.success('Import danh mục thành công');
      onImportSuccess();
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Import thất bại');
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadTemplate = () => {
    // Create and download template file
    const templateData = [
      ['category_name', 'description', 'lifespan_months'],
      ['Mũ bảo hiểm', 'Mũ bảo hiểm lao động', '24'],
      ['Găng tay', 'Găng tay bảo hộ', '12'],
      ['Giày bảo hộ', 'Giày bảo hộ lao động', '36']
    ];

    const csvContent = templateData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'template_categories.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const uploadProps = {
    beforeUpload: (file: any) => {
      const isCSV = file.type === 'text/csv' || file.name.endsWith('.csv');
      const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                     file.name.endsWith('.xlsx');
      
      if (!isCSV && !isExcel) {
        message.error('Chỉ chấp nhận file CSV hoặc Excel!');
        return false;
      }
      
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('File phải nhỏ hơn 10MB!');
        return false;
      }
      
      setFileList([file]);
      setCurrentStep(1);
      return false;
    },
    fileList,
    onRemove: () => {
      setFileList([]);
      setCurrentStep(0);
    }
  };

  return (
    <Modal
      title="Import danh mục PPE"
      open={isOpen}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Hủy
        </Button>,
        <Button 
          key="download" 
          icon={<DownloadOutlined />}
                  onClick={handleDownloadTemplate}
        >
          Tải template
        </Button>,
        <Button 
          key="upload" 
          type="primary" 
          loading={uploading}
          onClick={handleUpload}
          disabled={fileList.length === 0}
        >
          Import
        </Button>
      ]}
      width={600}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Title level={4}>Hướng dẫn import</Title>
          <Text type="secondary">
            Tải file template và điền thông tin danh mục theo đúng format. 
            File phải có các cột: category_name, description, lifespan_months
          </Text>
              </div>

        <Steps current={currentStep} size="small">
          <Step title="Chọn file" />
          <Step title="Xác nhận" />
          <Step title="Hoàn thành" />
        </Steps>

        <div>
          <Upload {...uploadProps}>
            <Button icon={<UploadOutlined />} size="large" style={{ width: '100%' }}>
              Chọn file CSV/Excel
            </Button>
          </Upload>
              </div>

        {fileList.length > 0 && (
          <Alert
            message="File đã chọn"
            description={`${fileList[0].name} (${(fileList[0].size / 1024).toFixed(1)} KB)`}
            type="success"
            showIcon
          />
        )}

        <Alert
          message="Lưu ý"
          description="Đảm bảo file có đúng format và không có dữ liệu trùng lặp. Quá trình import có thể mất vài phút tùy thuộc vào kích thước file."
          type="info"
          showIcon
        />
      </Space>
    </Modal>
  );
};

export default ImportCategoriesModal;
