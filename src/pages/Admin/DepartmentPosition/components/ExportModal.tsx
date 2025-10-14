import React, { useState } from 'react';
import {
  Modal,
  Form,
  Select,
  Button,
  Space,
  Typography,
  Row,
  Col,
  Checkbox,
  DatePicker,
  message,
  Progress
} from 'antd';
import {
  DownloadOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  FileTextOutlined
} from '@ant-design/icons';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Text } = Typography;

interface ExportModalProps {
  visible: boolean;
  onCancel: () => void;
  type: 'departments' | 'positions' | 'analytics';
  data?: any[];
}

const ExportModal: React.FC<ExportModalProps> = ({
  visible,
  onCancel,
  type,
  data = []
}) => {
  const [form] = Form.useForm();
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleExport = async (values: any) => {
    try {
      setExporting(true);
      setProgress(0);

      // Simulate export progress
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setExporting(false);
            message.success('Xuất dữ liệu thành công!');
            onCancel();
            return 100;
          }
          return prev + 10;
        });
      }, 200);

      // TODO: Implement actual export functionality
      console.log('Exporting:', { type, values, dataCount: data.length });
      
    } catch (error) {
      console.error('Export error:', error);
      message.error('Có lỗi xảy ra khi xuất dữ liệu!');
      setExporting(false);
    }
  };

  const getTypeName = () => {
    switch (type) {
      case 'departments': return 'phòng ban';
      case 'positions': return 'vị trí';
      case 'analytics': return 'thống kê';
      default: return 'dữ liệu';
    }
  };

  const getColumns = () => {
    switch (type) {
      case 'departments':
        return [
          { label: 'Tên phòng ban', value: 'name', default: true },
          { label: 'Mô tả', value: 'description', default: true },
          { label: 'Quản lý', value: 'manager', default: true },
          { label: 'Số nhân viên', value: 'employee_count', default: true },
          { label: 'Trạng thái', value: 'status', default: true },
          { label: 'Ngày tạo', value: 'created_at', default: false },
          { label: 'Ngày cập nhật', value: 'updated_at', default: false }
        ];
      case 'positions':
        return [
          { label: 'Tên vị trí', value: 'name', default: true },
          { label: 'Mô tả', value: 'description', default: true },
          { label: 'Cấp bậc', value: 'level', default: true },
          { label: 'Phòng ban', value: 'department', default: true },
          { label: 'Số nhân viên', value: 'employee_count', default: true },
          { label: 'Trạng thái', value: 'status', default: true },
          { label: 'Ngày tạo', value: 'created_at', default: false }
        ];
      case 'analytics':
        return [
          { label: 'Thống kê tổng quan', value: 'overview', default: true },
          { label: 'Phân bố phòng ban', value: 'department_distribution', default: true },
          { label: 'Phân bố vị trí', value: 'position_distribution', default: true },
          { label: 'Hiệu suất phòng ban', value: 'department_performance', default: true },
          { label: 'Biểu đồ', value: 'charts', default: false }
        ];
      default:
        return [];
    }
  };

  const columns = getColumns();

  return (
    <Modal
      title={
        <Space>
          <DownloadOutlined />
          Xuất {getTypeName()}
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleExport}
        initialValues={{
          format: 'excel',
          columns: columns.filter(col => col.default).map(col => col.value),
          dateRange: null
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="format"
              label="Định dạng file"
              rules={[{ required: true, message: 'Vui lòng chọn định dạng!' }]}
            >
              <Select>
                <Option value="excel">
                  <Space>
                    <FileExcelOutlined style={{ color: '#52c41a' }} />
                    Excel (.xlsx)
                  </Space>
                </Option>
                <Option value="pdf">
                  <Space>
                    <FilePdfOutlined style={{ color: '#ff4d4f' }} />
                    PDF (.pdf)
                  </Space>
                </Option>
                <Option value="csv">
                  <Space>
                    <FileTextOutlined style={{ color: '#1890ff' }} />
                    CSV (.csv)
                  </Space>
                </Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="dateRange"
              label="Khoảng thời gian"
            >
              <RangePicker
                style={{ width: '100%' }}
                placeholder={['Từ ngày', 'Đến ngày']}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="columns"
          label="Cột dữ liệu"
          rules={[{ required: true, message: 'Vui lòng chọn ít nhất một cột!' }]}
        >
          <Checkbox.Group style={{ width: '100%' }}>
            <Row>
              {columns.map(col => (
                <Col span={12} key={col.value}>
                  <Checkbox value={col.value}>{col.label}</Checkbox>
                </Col>
              ))}
            </Row>
          </Checkbox.Group>
        </Form.Item>

        {type === 'analytics' && (
          <Form.Item
            name="includeCharts"
            valuePropName="checked"
          >
            <Checkbox>Bao gồm biểu đồ và hình ảnh</Checkbox>
          </Form.Item>
        )}

        <Form.Item
          name="includeInactive"
          valuePropName="checked"
        >
          <Checkbox>Bao gồm dữ liệu không hoạt động</Checkbox>
        </Form.Item>

        {exporting && (
          <div style={{ marginBottom: '16px' }}>
            <Text>Đang xuất dữ liệu...</Text>
            <Progress percent={progress} status="active" />
          </div>
        )}

        <div style={{ textAlign: 'right' }}>
          <Space>
            <Button onClick={onCancel} disabled={exporting}>
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={exporting}
              icon={<DownloadOutlined />}
            >
              {exporting ? 'Đang xuất...' : 'Xuất dữ liệu'}
            </Button>
          </Space>
        </div>
      </Form>
    </Modal>
  );
};

export default ExportModal;
