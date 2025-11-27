import React, { useState } from 'react';
import {
  Modal,
  Upload,
  Button,
  Space,
  Typography,
  Steps,
  Form,
  Select,
  message,
  Progress,
  Alert,
  Divider
} from 'antd';
import {
  UploadOutlined,
  FileExcelOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';

const { Step } = Steps;
const { Text, Title } = Typography;
const { Option } = Select;

interface ImportModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  type: 'departments' | 'positions';
}

const ImportModal: React.FC<ImportModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  type
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileList, setFileList] = useState<any[]>([]);
  const [importResults, setImportResults] = useState<any>(null);

  const getTypeName = () => {
    return type === 'departments' ? 'phòng ban' : 'vị trí';
  };

  const handleUpload = async (file: any) => {
    setUploading(true);
    setProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          setCurrentStep(1);
          message.success('Tải file thành công!');
          return 100;
        }
        return prev + 10;
      });
    }, 100);

    return false; // Prevent default upload
  };

  const handleImport = async (values: any) => {
    setImporting(true);
    setProgress(0);

    // Simulate import progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setImporting(false);
          setCurrentStep(2);
          
          // Simulate import results
          setImportResults({
            total: 100,
            success: 85,
            failed: 15,
            errors: [
              'Dòng 5: Tên phòng ban không được để trống',
              'Dòng 12: Email quản lý không hợp lệ',
              'Dòng 18: Phòng ban cha không tồn tại'
            ]
          });
          
          return 100;
        }
        return prev + 5;
      });
    }, 200);
  };

  const handleFinish = () => {
    onSuccess();
    onCancel();
    setCurrentStep(0);
    setFileList([]);
    setImportResults(null);
    setProgress(0);
  };

  const handleCancel = () => {
    onCancel();
    setCurrentStep(0);
    setFileList([]);
    setImportResults(null);
    setProgress(0);
  };

  const steps = [
    {
      title: 'Tải file',
      description: 'Chọn file Excel để nhập dữ liệu'
    },
    {
      title: 'Cấu hình',
      description: 'Thiết lập các tùy chọn nhập'
    },
    {
      title: 'Kết quả',
      description: 'Xem kết quả nhập dữ liệu'
    }
  ];

  return (
    <Modal
      title={
        <Space>
          <UploadOutlined />
          Nhập {getTypeName()}
        </Space>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={700}
      destroyOnHidden
    >
      <Steps current={currentStep} style={{ marginBottom: '24px' }}>
        {steps.map((step, index) => (
          <Step key={index} title={step.title} description={step.description} />
        ))}
      </Steps>

      {currentStep === 0 && (
        <div>
          <Alert
            message="Hướng dẫn nhập dữ liệu"
            description={
              <div>
                <Text>1. Tải file mẫu để biết định dạng dữ liệu</Text>
                <br />
                <Text>2. Điền dữ liệu vào file Excel</Text>
                <br />
                <Text>3. Tải file lên hệ thống</Text>
              </div>
            }
            type="info"
            showIcon
            style={{ marginBottom: '16px' }}
          />

          <Space direction="vertical" style={{ width: '100%' }}>
            <Button
              icon={<DownloadOutlined />}
              href="/templates/department-template.xlsx"
              download
            >
              Tải file mẫu
            </Button>

            <Upload.Dragger
              name="file"
              multiple={false}
              fileList={fileList}
              beforeUpload={handleUpload}
              onChange={({ fileList }) => setFileList(fileList)}
              accept=".xlsx,.xls,.csv"
              showUploadList={{
                showDownloadIcon: false,
                showRemoveIcon: true,
              }}
            >
              <p className="ant-upload-drag-icon">
                <FileExcelOutlined style={{ fontSize: '48px', color: '#52c41a' }} />
              </p>
              <p className="ant-upload-text">
                Kéo thả file Excel vào đây hoặc click để chọn file
              </p>
              <p className="ant-upload-hint">
                Hỗ trợ định dạng: .xlsx, .xls, .csv
              </p>
            </Upload.Dragger>

            {uploading && (
              <div>
                <Text>Đang tải file...</Text>
                <Progress percent={progress} status="active" />
              </div>
            )}
          </Space>
        </div>
      )}

      {currentStep === 1 && (
        <Form
          layout="vertical"
          onFinish={handleImport}
          initialValues={{
            updateExisting: false,
            skipErrors: true,
            validateData: true
          }}
        >
          <Form.Item
            name="updateExisting"
            valuePropName="checked"
            label="Cập nhật dữ liệu đã tồn tại"
          >
            <Select>
              <Option value={true}>Có - Ghi đè dữ liệu cũ</Option>
              <Option value={false}>Không - Bỏ qua dữ liệu trùng</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="skipErrors"
            valuePropName="checked"
            label="Bỏ qua lỗi"
          >
            <Select>
              <Option value={true}>Có - Bỏ qua các dòng lỗi</Option>
              <Option value={false}>Không - Dừng khi gặp lỗi</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="validateData"
            valuePropName="checked"
            label="Kiểm tra dữ liệu"
          >
            <Select>
              <Option value={true}>Có - Kiểm tra tính hợp lệ</Option>
              <Option value={false}>Không - Nhập trực tiếp</Option>
            </Select>
          </Form.Item>

          <Divider />

          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setCurrentStep(0)}>
                Quay lại
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={importing}
                icon={<UploadOutlined />}
              >
                {importing ? 'Đang nhập...' : 'Bắt đầu nhập'}
              </Button>
            </Space>
          </div>

          {importing && (
            <div style={{ marginTop: '16px' }}>
              <Text>Đang nhập dữ liệu...</Text>
              <Progress percent={progress} status="active" />
            </div>
          )}
        </Form>
      )}

      {currentStep === 2 && importResults && (
        <div>
          <Alert
            message="Kết quả nhập dữ liệu"
            description={`Đã xử lý ${importResults.total} dòng dữ liệu`}
            type={importResults.failed === 0 ? 'success' : 'warning'}
            showIcon
            style={{ marginBottom: '16px' }}
          />

          <Row gutter={16}>
            <Col span={8}>
              <div style={{ textAlign: 'center' }}>
                <Title level={3} style={{ color: '#52c41a', margin: 0 }}>
                  {importResults.success}
                </Title>
                <Text>Thành công</Text>
              </div>
            </Col>
            <Col span={8}>
              <div style={{ textAlign: 'center' }}>
                <Title level={3} style={{ color: '#ff4d4f', margin: 0 }}>
                  {importResults.failed}
                </Title>
                <Text>Thất bại</Text>
              </div>
            </Col>
            <Col span={8}>
              <div style={{ textAlign: 'center' }}>
                <Title level={3} style={{ color: '#1890ff', margin: 0 }}>
                  {importResults.total}
                </Title>
                <Text>Tổng cộng</Text>
              </div>
            </Col>
          </Row>

          {importResults.errors.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <Text strong>Chi tiết lỗi:</Text>
              <ul style={{ marginTop: '8px' }}>
                {importResults.errors.map((error: string, index: number) => (
                  <li key={index} style={{ color: '#ff4d4f' }}>
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Divider />

          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={handleCancel}>
                Đóng
              </Button>
              <Button
                type="primary"
                onClick={handleFinish}
                icon={<CheckCircleOutlined />}
              >
                Hoàn thành
              </Button>
            </Space>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ImportModal;
