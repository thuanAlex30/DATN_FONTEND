import React from 'react';
import { 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  Button, 
  Space, 
  Row, 
  Col,
  Card
} from 'antd';
import { SearchOutlined, ClearOutlined } from '@ant-design/icons';
import type { ProjectFilters } from '../../../../types/project';

interface ProjectFiltersPanelProps {
  filters: ProjectFilters;
  onFiltersChange: (filters: Partial<ProjectFilters>) => void;
  onClearFilters: () => void;
  onClose: () => void;
}

const ProjectFiltersPanel: React.FC<ProjectFiltersPanelProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  onClose,
}) => {
  const [form] = Form.useForm();

  const handleValuesChange = (changedValues: Partial<ProjectFilters>) => {
    onFiltersChange(changedValues);
  };

  const handleClear = () => {
    form.resetFields();
    onClearFilters();
  };

  return (
    <Card 
      title="Bộ lọc dự án" 
      size="small"
      extra={
        <Button 
          type="text" 
          icon={<ClearOutlined />}
          onClick={handleClear}
        >
          Xóa bộ lọc
        </Button>
      }
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={filters}
        onValuesChange={handleValuesChange}
      >
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Form.Item name="search" label="Tìm kiếm">
              <Input
                placeholder="Tìm kiếm theo tên dự án..."
                prefix={<SearchOutlined />}
                allowClear
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item name="status" label="Trạng thái">
              <Select placeholder="Chọn trạng thái" allowClear>
                <Select.Option value="PLANNING">Lập kế hoạch</Select.Option>
                <Select.Option value="IN_PROGRESS">Đang thực hiện</Select.Option>
                <Select.Option value="COMPLETED">Hoàn thành</Select.Option>
                <Select.Option value="CANCELLED">Đã hủy</Select.Option>
                <Select.Option value="ON_HOLD">Tạm dừng</Select.Option>
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item name="priority" label="Mức độ ưu tiên">
              <Select placeholder="Chọn mức độ ưu tiên" allowClear>
                <Select.Option value="LOW">Thấp</Select.Option>
                <Select.Option value="MEDIUM">Trung bình</Select.Option>
                <Select.Option value="HIGH">Cao</Select.Option>
                <Select.Option value="URGENT">Khẩn cấp</Select.Option>
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item name="start_date_from" label="Ngày bắt đầu từ">
              <DatePicker style={{ width: '100%' }} placeholder="Chọn ngày" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item name="start_date_to" label="Đến ngày">
              <DatePicker style={{ width: '100%' }} placeholder="Chọn ngày" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item name="end_date_from" label="Ngày kết thúc từ">
              <DatePicker style={{ width: '100%' }} placeholder="Chọn ngày" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item name="end_date_to" label="Đến ngày">
              <DatePicker style={{ width: '100%' }} placeholder="Chọn ngày" />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item name="leader_id" label="Trưởng dự án">
              <Input placeholder="Nhập ID trưởng dự án" allowClear />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item name="site_name" label="Tên Site">
              <Input placeholder="Nhập tên site" allowClear />
            </Form.Item>
          </Col>
        </Row>

        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          marginTop: 16,
          paddingTop: 16,
          borderTop: '1px solid #f0f0f0'
        }}>
          <Button onClick={onClose}>
            Đóng
          </Button>
          <Space>
            <Button onClick={handleClear}>
              Xóa bộ lọc
            </Button>
            <Button type="primary" onClick={onClose}>
              Áp dụng
            </Button>
          </Space>
        </div>
      </Form>
    </Card>
  );
};

export default ProjectFiltersPanel;