import React, { useState, useEffect, useMemo } from 'react';
import {
  Modal,
  Form,
  Select,
  InputNumber,
  Input,
  DatePicker,
  Button,
  message,
  Space,
  Typography,
  Card,
  Row,
  Col,
  Alert,
  Divider,
  Table,
  Tag,
  Image,
  Avatar
} from 'antd';
import {
  SafetyOutlined,
  UserOutlined,
  CalendarOutlined,
  NumberOutlined,
  SendOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import * as ppeService from '../../../services/ppeService';
import departmentService from '../../../services/departmentService';
import userService from '../../../services/userService';
import type { User } from '../../../types/user';
import dayjs from 'dayjs';
import { ENV } from '../../../config/env';

const { Title, Text } = Typography;
const { Option } = Select;

interface IssueToEmployeeModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  managerId: string;
}

interface PPEItem {
  id: string;
  _id?: string; // Add _id as optional property
  item_name: string;
  item_code: string;
  brand?: string;
  model?: string;
  quantity_available: number;
  quantity_allocated: number;
  image_url?: string;
}

interface ManagerPPE {
  item: PPEItem;
  total_received: number;
  total_returned: number;
  remaining: number;
  issuances: any[];
}

const IssueToEmployeeModal: React.FC<IssueToEmployeeModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  managerId
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<User[]>([]);
  const [managerPPE, setManagerPPE] = useState<ManagerPPE[]>([]);
  const [selectedItem, setSelectedItem] = useState<PPEItem | null>(null);
  const [selectedEmployees, setSelectedEmployees] = useState<User[]>([]);
  const [availableQuantity, setAvailableQuantity] = useState(0);

  // Helper function to resolve image URL
  const apiBaseForImages = useMemo(() => {
    return ENV.API_BASE_URL.replace(/\/api\/?$/, '');
  }, []);

  const resolveImageUrl = (url?: string) => {
    if (!url) return undefined;
    if (url.startsWith('http')) return url;
    return `${apiBaseForImages}${url}`;
  };

  useEffect(() => {
    if (visible) {
      loadEmployees();
      loadManagerPPE();
      form.resetFields();
      // Reset states when modal opens
      setSelectedItem(null);
      setSelectedEmployees([]);
      setAvailableQuantity(0);
    }
  }, [visible, managerId]);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      
      // Validate managerId
      if (!managerId) {
        message.error('Manager ID không hợp lệ');
        return;
      }
      
      // Lấy thông tin manager để lấy department_id
      const managerResponse = await userService.getUserById(managerId) as any;
      
      if (!managerResponse || !managerResponse.success || !managerResponse.data) {
        message.error('Không tìm thấy thông tin Manager');
        return;
      }
      
      const manager = managerResponse.data;
      
      // Check for department - could be id or _id depending on API response structure
      const departmentId = manager.department?.id || manager.department?._id || manager.department_id;
      
      if (!departmentId) {
        message.error('Manager chưa được phân công phòng ban');
        return;
      }
      
      const response = await departmentService.getDepartmentEmployees(departmentId);
      
      if (response.success && response.data?.employees) {
        // Map the response data to match User interface
        const mappedEmployees: User[] = response.data.employees.map((emp: any) => ({
          id: emp.id || emp._id,
          username: emp.username,
          full_name: emp.full_name,
          email: emp.email,
          phone: emp.phone,
          role: emp.role ? {
            _id: emp.role._id || emp.role.id,
            role_name: emp.role.role_name || emp.role.name,
            role_code: emp.role.role_code,
            role_level: emp.role.role_level,
            is_active: emp.role.is_active
          } : undefined,
          department: emp.department ? {
            _id: emp.department._id || emp.department.id,
            department_name: emp.department.department_name || emp.department.name,
            is_active: emp.department.is_active ?? true
          } : undefined,
          is_active: emp.is_active ?? true,
          created_at: emp.created_at
        }));
        
        setEmployees(mappedEmployees);
      } else {
        message.error('Không thể tải danh sách nhân viên');
        setEmployees([]);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Lỗi khi tải danh sách nhân viên';
      message.error(errorMessage);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const loadManagerPPE = async () => {
    try {
      const response = await ppeService.getManagerPPE();
      if (response.success) {
        setManagerPPE(response.data.ppe_summary);
      }
    } catch (error) {
      message.error('Lỗi khi tải PPE của Manager');
    }
  };

  const handleItemChange = (itemId: string) => {
    // Tìm PPE data với nhiều cách khác nhau để handle structure
    const ppeData = managerPPE.find(p => {
      // Nếu item là object có id
      if (p.item && typeof p.item === 'object' && p.item.id) {
        return p.item.id === itemId;
      }
      // Nếu item là object có _id
      if (p.item && typeof p.item === 'object' && p.item._id) {
        return p.item._id === itemId;
      }
      // Nếu item là string/ObjectId
      if (typeof p.item === 'string') {
        return p.item === itemId;
      }
      return false;
    });
    
    if (ppeData) {
      // Kiểm tra xem có PPE nào chưa xác nhận nhận từ Header Department không
      const hasUnconfirmedPPE = ppeData.issuances?.some((issuance: any) => 
        issuance.status === 'pending_confirmation' && issuance.issuance_level === 'admin_to_manager'
      );
      
      if (hasUnconfirmedPPE) {
        message.warning('Vui lòng xác nhận nhận PPE từ Header Department trước khi phát cho Employee');
        form.setFieldsValue({ item_id: undefined });
        setSelectedItem(null);
        setAvailableQuantity(0);
        return;
      }
      
      setSelectedItem(ppeData.item);
      setAvailableQuantity(ppeData.remaining);
    } else {
      setSelectedItem(null);
      setAvailableQuantity(0);
    }
  };

  const handleEmployeeChange = (employeeIds: string | string[]) => {
    try {
      const ids = Array.isArray(employeeIds) ? employeeIds : [employeeIds];
      const selectedEmployeesList = employees.filter(e => {
        const employeeId = e.id || (e as any)._id;
        return employeeId && ids.includes(employeeId);
      });
      setSelectedEmployees(selectedEmployeesList);
      
      // Tự động set số lượng = số nhân viên được chọn
      const selectedCount = selectedEmployeesList.length;
      
      if (selectedCount > 0) {
        form.setFieldsValue({ quantity: selectedCount });
      } else {
        form.setFieldsValue({ quantity: undefined });
      }
    } catch (error) {
      setSelectedEmployees([]);
      form.setFieldsValue({ quantity: undefined });
    }
  };

  const handleSubmit = async (values: any) => {
    // Kiểm tra số lượng PPE có đủ cho tất cả nhân viên không
    const totalPPENeeded = selectedEmployees.length; // Mỗi nhân viên cần 1 PPE
    if (totalPPENeeded > availableQuantity) {
      message.error(`Không đủ PPE! Cần ${totalPPENeeded} PPE nhưng chỉ có ${availableQuantity}`);
      return;
    }

    setLoading(true);
    try {
      const userIds: string[] = Array.isArray(values.employee_id) ? values.employee_id : [values.employee_id];
      
      // Phát PPE cho từng nhân viên - mỗi nhân viên nhận 1 PPE
      const promises = userIds.map((userId: string) => {
        const issuanceData = {
          user_id: userId,
          item_id: values.item_id,
          quantity: 1, // Mỗi nhân viên chỉ nhận 1 PPE
          issued_date: values.issued_date.toISOString(),
          expected_return_date: values.expected_return_date.toISOString(),
          notes: values.notes || ''
        };
        return ppeService.issueToEmployee(issuanceData);
      });
      
      const responses = await Promise.all(promises);
      
      // Kiểm tra kết quả
      const failedCount = responses.filter(response => !response.success).length;
      const successCount = responses.length - failedCount;
      
      if (successCount > 0) {
        message.success(`Phát PPE thành công cho ${successCount} nhân viên! (Mỗi nhân viên nhận 1 PPE)`);
        if (failedCount > 0) {
          message.warning(`${failedCount} nhân viên phát thất bại`);
        }
        form.resetFields();
        setSelectedItem(null);
        setSelectedEmployees([]);
        setAvailableQuantity(0);
        onSuccess();
      } else {
        message.error('Phát PPE cho tất cả nhân viên đều thất bại');
      }
    } catch (error) {
      message.error('Lỗi khi phát PPE cho Employee');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setSelectedItem(null);
    setSelectedEmployees([]);
    setAvailableQuantity(0);
    onCancel();
  };

  const columns = [
    {
      title: 'Thiết bị',
      dataIndex: ['item', 'item_name'],
      key: 'item_name',
      render: (text: string, record: ManagerPPE) => (
        <Space>
          <SafetyOutlined />
          <div>
            <div>{text}</div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.item.item_code}
            </Text>
          </div>
        </Space>
      )
    },
    {
      title: 'Đã nhận',
      dataIndex: 'total_received',
      key: 'total_received',
      render: (value: number) => (
        <Tag color="blue">{value}</Tag>
      )
    },
    {
      title: 'Đã trả',
      dataIndex: 'total_returned',
      key: 'total_returned',
      render: (value: number) => (
        <Tag color="green">{value}</Tag>
      )
    },
    {
      title: 'Còn lại',
      dataIndex: 'remaining',
      key: 'remaining',
      render: (value: number) => (
        <Tag color={value > 0 ? 'green' : 'red'}>
          {value}
        </Tag>
      )
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (record: ManagerPPE) => {
        // Lấy item ID với nhiều cách khác nhau
        const itemId = record.item?.id || record.item?._id || (typeof record.item === 'string' ? record.item : null);
        
        return (
          <Button
            type="primary"
            size="small"
            onClick={() => {
              if (itemId && typeof itemId === 'string') {
                form.setFieldsValue({ item_id: itemId });
                handleItemChange(itemId);
              }
            }}
            disabled={record.remaining === 0}
          >
            Chọn
          </Button>
        );
      }
    }
  ];

  return (
    <Modal
      title={
        <Space>
          <SafetyOutlined style={{ color: '#1890ff' }} />
          <span>Phát PPE cho Employee</span>
        </Space>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={1000}
      destroyOnClose
    >
      <Row gutter={16}>
        <Col span={14}>
          <Card title="PPE có sẵn của Manager" size="small">
            <Alert
              message="Ràng buộc phòng ban"
              description="Manager chỉ có thể phát PPE cho nhân viên trong cùng phòng ban với mình."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <Table
              columns={columns}
              dataSource={managerPPE}
              rowKey={(record) => {
                const itemId = record.item?.id || record.item?._id || (typeof record.item === 'string' ? record.item : null);
                return itemId || `ppe-${Math.random()}`;
              }}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        
        <Col span={10}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              issued_date: dayjs(),
              expected_return_date: dayjs().add(30, 'day')
            }}
          >
            <Form.Item
              label="Chọn Employee (cùng phòng ban)"
              name="employee_id"
              rules={[{ required: true, message: 'Vui lòng chọn Employee' }]}
            >
              <div>
                <Select
                  mode="multiple"
                  placeholder={employees.length === 0 ? "Không có nhân viên nào trong phòng ban" : "Chọn Employee"}
                  showSearch
                  optionFilterProp="children"
                  onChange={handleEmployeeChange}
                  suffixIcon={<UserOutlined />}
                  disabled={employees.length === 0}
                  maxTagCount="responsive"
                  maxTagTextLength={20}
                  notFoundContent={
                    employees.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '20px' }}>
                        <UserOutlined style={{ fontSize: '24px', color: '#ccc' }} />
                        <div style={{ marginTop: '8px', color: '#999' }}>
                          Không có nhân viên trong phòng ban
                        </div>
                        <div style={{ fontSize: '12px', color: '#ccc' }}>
                          Manager chỉ có thể phát PPE cho nhân viên cùng phòng ban
                        </div>
                      </div>
                    ) : null
                  }
                >
                  {employees.filter(employee => {
                    const employeeId = employee.id || (employee as any)._id;
                    return employeeId !== null && employeeId !== undefined;
                  }).map(employee => {
                    const employeeId = employee.id || (employee as any)._id;
                    if (!employeeId) return null;
                    return (
                      <Option key={employeeId} value={employeeId}>
                        <Space>
                          <UserOutlined />
                          <span>{employee.full_name}</span>
                          <Text type="secondary">
                            ({employee.department?.department_name || 'N/A'})
                          </Text>
                        </Space>
                      </Option>
                    );
                  }).filter(Boolean)}
                </Select>
                
                {/* Nút chọn tất cả nhân viên */}
                {employees.length > 0 && (
                  <div style={{ marginTop: '8px', textAlign: 'right' }}>
                    <Button
                      type="link"
                      size="small"
                      onClick={() => {
                        const allEmployeeIds = employees
                          .filter(employee => employee.id || (employee as any)._id)
                          .map(employee => employee.id || (employee as any)._id);
                        
                        form.setFieldsValue({ employee_id: allEmployeeIds });
                        handleEmployeeChange(allEmployeeIds);
                        
                        message.success(`Đã chọn tất cả ${allEmployeeIds.length} nhân viên (mỗi nhân viên sẽ nhận 1 PPE)`);
                      }}
                      style={{ 
                        padding: '0',
                        height: 'auto',
                        fontSize: '12px',
                        color: '#1890ff'
                      }}
                    >
                      <UserOutlined style={{ marginRight: '4px' }} />
                      Chọn tất cả nhân viên ({employees.length})
                    </Button>
                  </div>
                )}
              </div>
            </Form.Item>

            <Form.Item
              label="Chọn thiết bị PPE"
              name="item_id"
              rules={[{ required: true, message: 'Vui lòng chọn thiết bị PPE' }]}
            >
              <Select
                placeholder="Chọn thiết bị PPE"
                showSearch
                optionFilterProp="children"
                onChange={handleItemChange}
                suffixIcon={<SafetyOutlined />}
              >
                {managerPPE.filter(ppe => {
                  // Chỉ hiển thị PPE đã xác nhận nhận từ Header Department
                  const hasUnconfirmedPPE = ppe.issuances?.some((issuance: any) => 
                    issuance.status === 'pending_confirmation' && issuance.issuance_level === 'admin_to_manager'
                  );
                  const itemId = ppe.item?.id || ppe.item?._id || (typeof ppe.item === 'string' ? ppe.item : null);
                  return ppe.remaining > 0 && !hasUnconfirmedPPE && itemId !== null && itemId !== undefined;
                }).map(ppe => {
                  const itemId = ppe.item?.id || ppe.item?._id || (typeof ppe.item === 'string' ? ppe.item : null);
                  if (!itemId) return null;
                  const inactive = ppe.item?.status === 'inactive';
                  return (
                    <Option key={itemId} value={itemId} disabled={inactive}>
                      <Space>
                        <SafetyOutlined />
                        <span>
                          {ppe.item.item_name}{' '}
                          {inactive && <Text type="danger">(Inactive)</Text>}
                        </span>
                        <Text type="secondary">(Còn: {ppe.remaining})</Text>
                      </Space>
                    </Option>
                  );
                }).filter(Boolean)}
              </Select>
            </Form.Item>

            <Form.Item
              label="Số lượng (tự động = số nhân viên, mỗi nhân viên nhận 1 PPE)"
              name="quantity"
              rules={[
                { required: true, message: 'Vui lòng nhập số lượng' },
                { type: 'number', min: 1, message: 'Số lượng phải lớn hơn 0' },
                { 
                  validator: (_, value) => {
                    if (selectedEmployees.length > 0 && value !== selectedEmployees.length) {
                      return Promise.reject(`Số lượng phải bằng số nhân viên được chọn (${selectedEmployees.length})`);
                    }
                    if (selectedEmployees.length > availableQuantity) {
                      return Promise.reject(`Không đủ PPE! Cần ${selectedEmployees.length} PPE nhưng chỉ có ${availableQuantity}`);
                    }
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <InputNumber
                min={1}
                max={availableQuantity}
                style={{ width: '100%' }}
                suffix={<NumberOutlined />}
                placeholder={`Tự động = ${selectedEmployees.length} nhân viên (mỗi người 1 PPE)`}
                disabled={selectedEmployees.length > 0}
                value={selectedEmployees.length > 0 ? selectedEmployees.length : undefined}
              />
            </Form.Item>

            <Row gutter={8}>
              <Col span={12}>
                <Form.Item
                  label="Ngày phát"
                  name="issued_date"
                  rules={[{ required: true, message: 'Vui lòng chọn ngày phát' }]}
                >
                  <DatePicker
                    style={{ width: '100%' }}
                    suffixIcon={<CalendarOutlined />}
                    format="DD/MM/YYYY"
                  />
                </Form.Item>
              </Col>
              
              <Col span={12}>
                <Form.Item
                  label="Ngày trả dự kiến"
                  name="expected_return_date"
                  rules={[
                    { required: true, message: 'Vui lòng chọn ngày trả dự kiến' },
                    {
                      validator: (_, value) => {
                        const issuedDate = form.getFieldValue('issued_date');
                        if (issuedDate && value && !dayjs(value).isAfter(dayjs(issuedDate), 'day')) {
                          return Promise.reject(new Error('Ngày trả dự kiến phải sau ngày phát'));
                        }
                        return Promise.resolve();
                      }
                    }
                  ]}
                >
                  <DatePicker
                    style={{ width: '100%' }}
                    suffixIcon={<CalendarOutlined />}
                    format="DD/MM/YYYY"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Ghi chú"
              name="notes"
              rules={[
                {
                  validator: (_, value) => {
                    if (value && value.length > 500) {
                      return Promise.reject(new Error('Ghi chú không được quá 500 ký tự'));
                    }
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <Input.TextArea
                rows={2}
                placeholder="Nhập ghi chú (tùy chọn)"
                maxLength={500}
                showCount
              />
            </Form.Item>

            {/* Thông tin chi tiết */}
            {(selectedItem || selectedEmployees.length > 0) && (
              <>
                <Divider />
                <Title level={5}>
                  <InfoCircleOutlined /> Thông tin chi tiết
                </Title>
                
                {selectedEmployees.length > 0 && (
                  <Card size="small" title={`Thông tin Employee (${selectedEmployees.length} người)`} style={{ marginBottom: 8 }}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      {selectedEmployees.map((employee, index) => (
                        <div key={employee.id} style={{ 
                          padding: '8px', 
                          border: '1px solid #f0f0f0', 
                          borderRadius: '4px',
                          marginBottom: index < selectedEmployees.length - 1 ? '8px' : '0'
                        }}>
                          <div>
                            <Text strong>Tên: </Text>
                            <Text>{employee.full_name}</Text>
                          </div>
                          <div>
                            <Text strong>Email: </Text>
                            <Text>{employee.email}</Text>
                          </div>
                          <div>
                            <Text strong>Phòng ban: </Text>
                            <Text>{employee.department?.department_name || 'N/A'}</Text>
                          </div>
                        </div>
                      ))}
                    </Space>
                  </Card>
                )}
                
                {selectedItem && (
                  <Card size="small" title="Thông tin thiết bị">
                    <Space direction="vertical" style={{ width: '100%' }} size="middle">
                      {selectedItem.image_url ? (
                        <div style={{ textAlign: 'center', marginBottom: 8 }}>
                          <Image
                            src={resolveImageUrl(selectedItem.image_url)}
                            width={120}
                            height={120}
                            style={{ objectFit: 'cover', borderRadius: 8 }}
                            preview={{ mask: 'Xem ảnh' }}
                            fallback=""
                          />
                        </div>
                      ) : (
                        <div style={{ textAlign: 'center', marginBottom: 8 }}>
                          <Avatar icon={<SafetyOutlined />} size={120} />
                        </div>
                      )}
                      <div>
                        <Text strong>Tên thiết bị: </Text>
                        <Text>{selectedItem.item_name}</Text>
                      </div>
                      <div>
                        <Text strong>Mã thiết bị: </Text>
                        <Text>{selectedItem.item_code}</Text>
                      </div>
                      <div>
                        <Text strong>Số lượng có thể phát: </Text>
                        <Text type="success">{availableQuantity}</Text>
                      </div>
                    </Space>
                  </Card>
                )}
              </>
            )}

            {/* Cảnh báo số lượng */}
            {availableQuantity === 0 && selectedItem && (
              <Alert
                message="Không có PPE để phát"
                description={`Thiết bị ${selectedItem.item_name} đã hết số lượng có thể phát.`}
                type="error"
                showIcon
                style={{ marginTop: 8 }}
              />
            )}
            
            {/* Cảnh báo không đủ PPE cho số nhân viên */}
            {selectedEmployees.length > 0 && selectedItem && selectedEmployees.length > availableQuantity && (
              <Alert
                message="Không đủ PPE"
                description={`Cần ${selectedEmployees.length} PPE nhưng chỉ có ${availableQuantity} thiết bị ${selectedItem.item_name}. Vui lòng chọn ít nhân viên hơn hoặc chọn thiết bị khác.`}
                type="error"
                showIcon
                style={{ marginTop: 8 }}
              />
            )}


            <div style={{ marginTop: 16, textAlign: 'right' }}>
              <Space>
                <Button onClick={handleCancel}>
                  Hủy
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  icon={<SendOutlined />}
                  disabled={availableQuantity === 0 || (selectedEmployees.length > 0 && selectedEmployees.length > availableQuantity)}
                >
                  Phát PPE cho Employee ({selectedEmployees.length} người)
                </Button>
              </Space>
            </div>
          </Form>
        </Col>
      </Row>
    </Modal>
  );
};

export default IssueToEmployeeModal;
