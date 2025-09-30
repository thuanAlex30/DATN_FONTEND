import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Form, 
  Select, 
  Input, 
  DatePicker, 
  Button, 
  message, 
  Space,
  Row,
  Col,
  Typography,
  Alert,
  Checkbox
} from 'antd';
import { BarChartOutlined, CalendarOutlined, FileTextOutlined } from '@ant-design/icons';
import * as ReportExportService from '../../../services/ReportExportService';

interface CreateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const { Option } = Select;
const { TextArea } = Input;

const CreateReportModal: React.FC<CreateReportModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState<string>('');

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      
      // Generate report based on type
      const reportData = {
        title: `Báo cáo ${getReportTypeLabel(values.reportType)}`,
        subtitle: `Từ ${values.startDate?.format('DD/MM/YYYY')} đến ${values.endDate?.format('DD/MM/YYYY')}`,
        dateRange: {
          start: values.startDate?.format('YYYY-MM-DD'),
          end: values.endDate?.format('YYYY-MM-DD')
        },
        filters: {
          reportType: values.reportType,
          includeCharts: values.includeCharts,
          includeAnalytics: values.includeAnalytics
        }
      };

      // Export report based on format
      if (values.format === 'pdf') {
        // await ReportExportService.exportToPDF(reportData);
      } else if (values.format === 'excel') {
        // await ReportExportService.exportToExcel(reportData);
      }
      
      message.success('Báo cáo đã được tạo thành công');
      form.resetFields();
      onSuccess();
      onClose();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể tạo báo cáo');
    } finally {
      setLoading(false);
    }
  };

  const getReportTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'inventory': 'Tồn kho',
      'usage': 'Sử dụng',
      'maintenance': 'Bảo trì',
      'compliance': 'Tuân thủ',
      'expiry': 'Hết hạn',
      'damage': 'Hư hỏng'
    };
    return labels[type] || type;
  };

  const getReportDescription = (type: string) => {
    const descriptions: { [key: string]: string } = {
      'inventory': 'Báo cáo tổng hợp về tình trạng tồn kho PPE, bao gồm số lượng hiện có, đã phát, cần bổ sung.',
      'usage': 'Báo cáo về việc sử dụng PPE theo thời gian, người dùng, và loại thiết bị.',
      'maintenance': 'Báo cáo về lịch sử bảo trì, sửa chữa và tình trạng thiết bị PPE.',
      'compliance': 'Báo cáo về việc tuân thủ quy định an toàn lao động và sử dụng PPE.',
      'expiry': 'Báo cáo về thiết bị PPE sắp hết hạn sử dụng hoặc cần thay thế.',
      'damage': 'Báo cáo về thiết bị PPE bị hư hỏng, mất mát và cần thay thế.'
    };
    return descriptions[type] || '';
  };

  return (
    <Modal
      title={
        <Space>
          <BarChartOutlined />
          Tạo báo cáo
        </Space>
      }
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          format: 'pdf',
          include_charts: true,
          date_range: 'last_month'
        }}
      >
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="report_type"
              label="Loại báo cáo"
              rules={[{ required: true, message: 'Vui lòng chọn loại báo cáo' }]}
            >
              <Select
                placeholder="Chọn loại báo cáo"
                onChange={setReportType}
              >
                <Option value="inventory">
                  <Space>
                    <FileTextOutlined />
                    Báo cáo tồn kho
                  </Space>
                </Option>
                <Option value="usage">
                  <Space>
                    <BarChartOutlined />
                    Báo cáo sử dụng
                  </Space>
                </Option>
                <Option value="maintenance">
                  <Space>
                    <FileTextOutlined />
                    Báo cáo bảo trì
                  </Space>
                </Option>
                <Option value="compliance">
                  <Space>
                    <FileTextOutlined />
                    Báo cáo tuân thủ
                  </Space>
                </Option>
                <Option value="expiry">
                  <Space>
                    <CalendarOutlined />
                    Báo cáo hết hạn
                  </Space>
                </Option>
                <Option value="damage">
                  <Space>
                    <FileTextOutlined />
                    Báo cáo hư hỏng
                  </Space>
                </Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {reportType && (
          <Alert
            message={getReportDescription(reportType)}
            type="info"
            style={{ marginBottom: 16 }}
          />
        )}

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="date_range"
              label="Khoảng thời gian"
              rules={[{ required: true, message: 'Vui lòng chọn khoảng thời gian' }]}
            >
              <Select placeholder="Chọn khoảng thời gian">
                <Option value="last_week">Tuần trước</Option>
                <Option value="last_month">Tháng trước</Option>
                <Option value="last_quarter">Quý trước</Option>
                <Option value="last_year">Năm trước</Option>
                <Option value="custom">Tùy chỉnh</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="format"
              label="Định dạng"
              rules={[{ required: true, message: 'Vui lòng chọn định dạng' }]}
            >
              <Select placeholder="Chọn định dạng">
                <Option value="pdf">PDF</Option>
                <Option value="excel">Excel</Option>
                <Option value="csv">CSV</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="start_date"
              label="Từ ngày"
              dependencies={['date_range']}
            >
              <DatePicker 
                style={{ width: '100%' }}
                placeholder="Chọn ngày bắt đầu"
                disabled={form.getFieldValue('date_range') !== 'custom'}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="end_date"
              label="Đến ngày"
              dependencies={['date_range']}
            >
              <DatePicker 
                style={{ width: '100%' }}
                placeholder="Chọn ngày kết thúc"
                disabled={form.getFieldValue('date_range') !== 'custom'}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="filters"
          label="Bộ lọc"
        >
          <Checkbox.Group>
            <Row>
              <Col span={12}>
                <Checkbox value="by_department">Theo phòng ban</Checkbox>
              </Col>
              <Col span={12}>
                <Checkbox value="by_category">Theo danh mục</Checkbox>
              </Col>
              <Col span={12}>
                <Checkbox value="by_status">Theo trạng thái</Checkbox>
              </Col>
              <Col span={12}>
                <Checkbox value="by_priority">Theo độ ưu tiên</Checkbox>
              </Col>
            </Row>
          </Checkbox.Group>
        </Form.Item>

        <Form.Item
          name="include_charts"
          valuePropName="checked"
        >
          <Checkbox>Bao gồm biểu đồ và thống kê</Checkbox>
        </Form.Item>

        <Form.Item
          name="include_details"
          valuePropName="checked"
        >
          <Checkbox>Bao gồm chi tiết từng mục</Checkbox>
        </Form.Item>

        <Form.Item
          name="notes"
          label="Ghi chú"
        >
          <TextArea
            rows={2}
            placeholder="Nhập ghi chú cho báo cáo..."
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
          <Space>
            <Button onClick={onClose}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Tạo báo cáo
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateReportModal;
