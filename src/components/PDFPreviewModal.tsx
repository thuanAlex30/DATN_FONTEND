import React from 'react';
import { Modal, Button, Spin } from 'antd';
import { EyeOutlined, DownloadOutlined, CloseOutlined } from '@ant-design/icons';
import ReportPDFTemplate from './ReportPDFTemplate';

interface PDFPreviewModalProps {
  visible: boolean;
  onClose: () => void;
  reportData: any;
  reportType: string;
  onDownload: () => void;
  loading?: boolean;
}

const PDFPreviewModal: React.FC<PDFPreviewModalProps> = ({
  visible,
  onClose,
  reportData,
  reportType,
  onDownload,
  loading = false
}) => {
  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <EyeOutlined />
          <span>Xem trước báo cáo</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      width="90%"
      style={{ top: 20 }}
      footer={[
        <Button key="close" onClick={onClose} icon={<CloseOutlined />}>
          Đóng
        </Button>,
        <Button 
          key="download" 
          type="primary" 
          onClick={onDownload}
          icon={<DownloadOutlined />}
          loading={loading}
        >
          Tải về PDF
        </Button>
      ]}
      destroyOnClose
    >
      <div style={{ 
        height: '80vh', 
        overflow: 'auto',
        backgroundColor: '#f5f5f5',
        padding: '20px',
        borderRadius: '8px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <ReportPDFTemplate 
            reportData={reportData} 
            reportType={reportType} 
          />
        </div>
      </div>
    </Modal>
  );
};

export default PDFPreviewModal;
