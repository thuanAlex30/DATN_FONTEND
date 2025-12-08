import React, { useState } from 'react';
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
  Alert,
  Checkbox
} from 'antd';
import { BarChartOutlined, CalendarOutlined, FileTextOutlined } from '@ant-design/icons';
import * as ppeService from '../../../services/ppeService';
import ReportExportService from '../../../services/ReportExportService';
import type { ExportOptions } from '../../../services/ReportExportService';
import * as XLSX from 'xlsx';

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
      
      let reportData;
      
      // Generate report based on type
      switch (values.report_type) {
        case 'inventory':
          reportData = await ppeService.getInventoryReport();
          break;
        case 'usage':
          reportData = await ppeService.getAssignmentReport();
          break;
        case 'maintenance':
          reportData = await ppeService.getMaintenanceReport();
          break;
        case 'expiry':
          reportData = await ppeService.getExpiryReport({
            days: 30,
            status: 'all'
          });
          break;
        default:
          throw new Error('Loại báo cáo không được hỗ trợ');
      }

      // Create report object for export
      const report = {
        title: `Báo cáo ${getReportTypeLabel(values.report_type)}`,
        subtitle: `Từ ${values.start_date?.format('DD/MM/YYYY')} đến ${values.end_date?.format('DD/MM/YYYY')}`,
        dateRange: {
          start: values.start_date?.format('YYYY-MM-DD'),
          end: values.end_date?.format('YYYY-MM-DD')
        },
        data: reportData,
        filters: {
          reportType: values.report_type,
          includeCharts: values.include_charts,
          includeDetails: values.include_details,
          filters: values.filters || []
        }
      };

      // Export report based on format
      if (values.format === 'pdf') {
        await exportToPDF(report);
      } else if (values.format === 'excel') {
        await exportToExcel(report);
      } else if (values.format === 'csv') {
        await exportToCSV(report);
      }
      
      message.success('Báo cáo đã được tạo thành công');
      form.resetFields();
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error creating report:', err);
      message.error(err.response?.data?.message || err.message || 'Không thể tạo báo cáo');
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

  // Export functions
  const exportToPDF = async (report: any) => {
    try {
      const exportData = {
        logs: Array.isArray(report.data) ? report.data : [],
        summary: {
          'Loại báo cáo': getReportTypeLabel(report.filters.reportType),
          'Tổng số bản ghi': Array.isArray(report.data) ? report.data.length : 0,
          'Khoảng thời gian': report.subtitle,
        },
        analytics: report.filters.includeCharts ? {
          totalLogs: Array.isArray(report.data) ? report.data.length : 0,
        } : undefined,
      };

      const options: ExportOptions = {
        title: report.title,
        subtitle: report.subtitle,
        dateRange: report.dateRange,
        includeCharts: report.filters.includeCharts,
        includeAnalytics: report.filters.includeCharts,
      };

      await ReportExportService.exportToPDF(exportData, options);
      message.success('Báo cáo PDF đã được tạo thành công');
    } catch (error: any) {
      console.error('Error exporting to PDF:', error);
      message.error(error.message || 'Lỗi khi xuất báo cáo PDF');
    }
  };

  const exportToExcel = async (report: any) => {
    try {
      const workbook = XLSX.utils.book_new();
      
      // Summary sheet
      const summaryData = [
        ['Báo Cáo', report.title],
        ['Ngày tạo', new Date().toLocaleString('vi-VN')],
        ['Khoảng thời gian', report.subtitle],
        [''],
        ['Tổng Quan', ''],
        ['Loại báo cáo', getReportTypeLabel(report.filters.reportType)],
        ['Tổng số bản ghi', Array.isArray(report.data) ? report.data.length : 0],
      ];
      
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Tổng Quan');
      
      // Data sheet
      if (Array.isArray(report.data) && report.data.length > 0) {
        // Get headers from first item
        const firstItem = report.data[0];
        const headers = Object.keys(firstItem);
        const dataRows = report.data.map((item: any) => 
          headers.map(header => {
            const value = item[header];
            // Handle nested objects
            if (typeof value === 'object' && value !== null) {
              return JSON.stringify(value);
            }
            return value;
          })
        );
        
        const dataSheet = XLSX.utils.aoa_to_sheet([
          headers.map(h => h.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())),
          ...dataRows
        ]);
        
        // Set column widths
        dataSheet['!cols'] = headers.map(() => ({ wch: 20 }));
        
        XLSX.utils.book_append_sheet(workbook, dataSheet, 'Chi Tiết');
      }
      
      // Save the Excel file
      const filename = `bao_cao_${report.filters.reportType}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, filename);
      message.success('Báo cáo Excel đã được tạo thành công');
    } catch (error: any) {
      console.error('Error exporting to Excel:', error);
      message.error(error.message || 'Lỗi khi xuất báo cáo Excel');
    }
  };

  const exportToCSV = async (report: any) => {
    try {
      if (!Array.isArray(report.data) || report.data.length === 0) {
        message.warning('Không có dữ liệu để xuất');
        return;
      }

      // Get headers from first item
      const firstItem = report.data[0];
      const headers = Object.keys(firstItem);
      
      // Create CSV content
      const csvHeaders = headers.map(h => h.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())).join(',');
      const csvRows = report.data.map((item: any) => 
        headers.map(header => {
          const value = item[header];
          // Handle nested objects and escape commas
          if (typeof value === 'object' && value !== null) {
            return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
          }
          // Escape commas and quotes in string values
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value || '';
        }).join(',')
      );
      
      const csvContent = [csvHeaders, ...csvRows].join('\n');
      
      // Create blob and download
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `bao_cao_${report.filters.reportType}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      message.success('Báo cáo CSV đã được tạo thành công');
    } catch (error: any) {
      console.error('Error exporting to CSV:', error);
      message.error(error.message || 'Lỗi khi xuất báo cáo CSV');
    }
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
