import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Space,
  Row,
  Col,
  Collapse,
  Typography,
  Tag,
  Divider
} from 'antd';
import {
  FilterOutlined,
  SearchOutlined,
  ClearOutlined,
  DownOutlined,
  UpOutlined
} from '@ant-design/icons';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Panel } = Collapse;
const { Text } = Typography;

interface AdvancedFiltersProps {
  onFilter: (filters: any) => void;
  onClear: () => void;
  type: 'departments' | 'positions';
  loading?: boolean;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  onFilter,
  onClear,
  type,
  loading = false
}) => {
  const [form] = Form.useForm();
  const [expanded, setExpanded] = useState(false);

  const handleSubmit = (values: any) => {
    onFilter(values);
  };

  const handleClear = () => {
    form.resetFields();
    onClear();
  };

  const isDepartment = type === 'departments';

  return (
    <Card size="small" style={{ marginBottom: '16px' }}>
      <Collapse
        activeKey={expanded ? ['filters'] : []}
        onChange={(keys) => setExpanded(keys.includes('filters'))}
        ghost
      >
        <Panel
          header={
            <Space>
              <FilterOutlined />
              <Text strong>Bộ lọc nâng cao</Text>
              {expanded ? <UpOutlined /> : <DownOutlined />}
            </Space>
          }
          key="filters"
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              status: '',
              level: '',
              dateRange: null
            }}
          >
            <Row gutter={[16, 8]}>
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  name="search"
                  label="Tìm kiếm"
                >
                  <Input
                    placeholder={`Tìm kiếm ${isDepartment ? 'phòng ban' : 'vị trí'}...`}
                    prefix={<SearchOutlined />}
                    allowClear
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  name="status"
                  label="Trạng thái"
                >
                  <Select placeholder="Chọn trạng thái" allowClear>
                    <Option value="active">Hoạt động</Option>
                    <Option value="inactive">Không hoạt động</Option>
                  </Select>
                </Form.Item>
              </Col>

              {isDepartment ? (
                <>
                  <Col xs={24} sm={12} md={8}>
                    <Form.Item
                      name="hasManager"
                      label="Quản lý"
                    >
                      <Select placeholder="Có quản lý?" allowClear>
                        <Option value="yes">Có quản lý</Option>
                        <Option value="no">Chưa có quản lý</Option>
                      </Select>
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12} md={8}>
                    <Form.Item
                      name="parentDepartment"
                      label="Phòng ban cha"
                    >
                      <Select placeholder="Chọn phòng ban cha" allowClear>
                        <Option value="root">Phòng ban gốc</Option>
                        <Option value="sub">Phòng ban con</Option>
                      </Select>
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12} md={8}>
                    <Form.Item
                      name="employeeCount"
                      label="Số nhân viên"
                    >
                      <Select placeholder="Số nhân viên" allowClear>
                        <Option value="0">Không có nhân viên</Option>
                        <Option value="1-5">1-5 nhân viên</Option>
                        <Option value="6-20">6-20 nhân viên</Option>
                        <Option value="20+">Trên 20 nhân viên</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </>
              ) : (
                <>
                  <Col xs={24} sm={12} md={8}>
                    <Form.Item
                      name="level"
                      label="Cấp bậc"
                    >
                      <Select placeholder="Chọn cấp bậc" allowClear>
                        <Option value="1-2">Cấp thấp (1-2)</Option>
                        <Option value="3-5">Cấp trung (3-5)</Option>
                        <Option value="6-7">Cấp cao (6-7)</Option>
                        <Option value="8-10">Cấp lãnh đạo (8-10)</Option>
                      </Select>
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12} md={8}>
                    <Form.Item
                      name="department"
                      label="Phòng ban"
                    >
                      <Select placeholder="Chọn phòng ban" allowClear>
                        {/* This would be populated with actual departments */}
                        <Option value="all">Tất cả phòng ban</Option>
                      </Select>
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12} md={8}>
                    <Form.Item
                      name="hasEmployees"
                      label="Có nhân viên"
                    >
                      <Select placeholder="Có nhân viên?" allowClear>
                        <Option value="yes">Có nhân viên</Option>
                        <Option value="no">Chưa có nhân viên</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </>
              )}

              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  name="dateRange"
                  label="Ngày tạo"
                >
                  <RangePicker
                    style={{ width: '100%' }}
                    placeholder={['Từ ngày', 'Đến ngày']}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  name="sortBy"
                  label="Sắp xếp theo"
                >
                  <Select placeholder="Chọn tiêu chí sắp xếp">
                    <Option value="name">Tên</Option>
                    <Option value="created_at">Ngày tạo</Option>
                    <Option value="updated_at">Ngày cập nhật</Option>
                    {isDepartment && <Option value="employee_count">Số nhân viên</Option>}
                    {!isDepartment && <Option value="level">Cấp bậc</Option>}
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  name="sortOrder"
                  label="Thứ tự"
                >
                  <Select placeholder="Chọn thứ tự">
                    <Option value="asc">Tăng dần</Option>
                    <Option value="desc">Giảm dần</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Divider />

            <div style={{ textAlign: 'right' }}>
              <Space>
                <Button 
                  icon={<ClearOutlined />} 
                  onClick={handleClear}
                  disabled={loading}
                >
                  Xóa bộ lọc
                </Button>
                <Button 
                  type="primary" 
                  icon={<SearchOutlined />} 
                  htmlType="submit"
                  loading={loading}
                >
                  Áp dụng bộ lọc
                </Button>
              </Space>
            </div>
          </Form>
        </Panel>
      </Collapse>
    </Card>
  );
};

export default AdvancedFilters;
