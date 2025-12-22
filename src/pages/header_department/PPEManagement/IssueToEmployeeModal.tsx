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
  InfoCircleOutlined,
  CheckOutlined,
  CloseOutlined
} from '@ant-design/icons';
import * as ppeService from '../../../services/ppeService';
import departmentService from '../../../services/departmentService';
import userService from '../../../services/userService';
import type { User } from '../../../types/user';
import dayjs from 'dayjs';
import { ENV } from '../../../config/env';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store';

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
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
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
        setEmployees([]);
        return;
      }
      
      let departmentId: string | null = null;
      
      // First, try to use current user's department if managerId matches current user
      const currentUserId = currentUser?.id || (currentUser as any)?._id;
      if (currentUserId && (currentUserId.toString() === managerId.toString())) {
        // Use current user's department_id directly
        departmentId = currentUser?.department?.id || 
                      currentUser?.department?._id || 
                      (currentUser as any)?.department_id?.id ||
                      (currentUser as any)?.department_id?._id ||
                      (currentUser as any)?.department_id;
        
        console.log('🔍 Using current user department:', {
          currentUserId,
          managerId,
          departmentId,
          department: currentUser?.department,
          department_id: (currentUser as any)?.department_id
        });
      }
      
      // If not found, get manager info from API
      if (!departmentId) {
        try {
          const manager = await userService.getUserById(managerId);
          
          if (!manager) {
            message.error('Không tìm thấy thông tin Manager');
            setEmployees([]);
            return;
          }
          
          // Extract department_id with multiple fallbacks
          departmentId = (manager as any).department?.id || 
                        (manager as any).department?._id || 
                        (manager as any).department_id?.id ||
                        (manager as any).department_id?._id ||
                        (manager as any).department_id;
          
          console.log('🔍 Got manager department from API:', {
            managerId,
            departmentId,
            manager: {
              id: (manager as any).id,
              department: (manager as any).department,
              department_id: (manager as any).department_id
            }
          });
        } catch (error: any) {
          console.error('Error fetching manager:', error);
          message.error('Không thể lấy thông tin Manager: ' + (error.response?.data?.message || error.message));
          setEmployees([]);
          return;
        }
      }
      
      // Validate departmentId
      if (!departmentId) {
        message.error('Manager chưa được phân công phòng ban');
        setEmployees([]);
        return;
      }
      
      // Convert to string if it's an object
      const deptIdString = typeof departmentId === 'string' 
        ? departmentId 
        : (departmentId.toString ? departmentId.toString() : String(departmentId));
      
      console.log('🔍 Fetching employees for department:', deptIdString);
      
      // Get employees from department
      const response = await departmentService.getDepartmentEmployees(deptIdString);
      
      console.log('🔍 Department employees response:', {
        success: response.success,
        employeesCount: response.data?.employees?.length || 0,
        data: response.data
      });
      
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
        
        console.log('✅ Mapped employees:', mappedEmployees.length);
        setEmployees(mappedEmployees);
        
        if (mappedEmployees.length === 0) {
          message.warning('Không có nhân viên nào trong phòng ban');
        }
      } else {
        console.error('❌ Invalid response structure:', response);
        message.error(response.message || 'Không thể tải danh sách nhân viên');
        setEmployees([]);
      }
    } catch (error: any) {
      console.error('❌ Error loading employees:', error);
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
    // Ngăn chặn double submit
    if (loading) {
      return;
    }

    // Kiểm tra số lượng PPE có đủ cho tất cả nhân viên không
    const totalPPENeeded = selectedEmployees.length; // Mỗi nhân viên cần 1 PPE
    if (totalPPENeeded > availableQuantity) {
      message.error(`Không đủ PPE! Cần ${totalPPENeeded} PPE nhưng chỉ có ${availableQuantity}`);
      return;
    }

    // Validate required fields
    if (!values.item_id || !values.employee_id || selectedEmployees.length === 0) {
      message.error('Vui lòng chọn đầy đủ thông tin');
      return;
    }

    setLoading(true);
    try {
      const userIds: string[] = Array.isArray(values.employee_id) ? values.employee_id : [values.employee_id];
      
      // Loại bỏ duplicate userIds (nếu có)
      const uniqueUserIds = [...new Set(userIds)];
      
      if (uniqueUserIds.length !== userIds.length) {
        message.warning('Đã loại bỏ nhân viên trùng lặp');
      }
      
      // Phát PPE cho từng nhân viên - mỗi nhân viên nhận 1 PPE
      // Sử dụng Promise.allSettled để xử lý từng request độc lập, tránh fail tất cả nếu 1 request fail
      const promises = uniqueUserIds.map((userId: string) => {
        const issuanceData = {
          user_id: userId,
          item_id: values.item_id,
          quantity: 1, // Mỗi nhân viên chỉ nhận 1 PPE
          issued_date: values.issued_date.toISOString(),
          expected_return_date: values.expected_return_date.toISOString(),
          notes: values.notes || ''
        };
        return ppeService.issueToEmployee(issuanceData).catch(error => {
          // Trả về error object để xử lý sau
          return {
            success: false,
            message: error.response?.data?.message || error.message || 'Lỗi không xác định'
          };
        });
      });
      
      const responses = await Promise.all(promises);
      
      // Kiểm tra kết quả
      const failedResponses = responses.filter(response => !response.success);
      const successResponses = responses.filter(response => response.success);
      const failedCount = failedResponses.length;
      const successCount = successResponses.length;
      
      // Hiển thị thông báo lỗi chi tiết nếu có
      if (failedCount > 0) {
        const errorMessages = failedResponses.map(r => r.message).filter(Boolean);
        const uniqueErrors = [...new Set(errorMessages)];
        uniqueErrors.forEach(msg => {
          if (msg.includes('đã tồn tại') || msg.includes('duplicate')) {
            message.warning(msg);
          } else {
            message.error(msg);
          }
        });
      }
      
      if (successCount > 0) {
        message.success(`Phát PPE thành công cho ${successCount} nhân viên! (Mỗi nhân viên nhận 1 PPE)`);
        form.resetFields();
        setSelectedItem(null);
        setSelectedEmployees([]);
        setAvailableQuantity(0);
        onSuccess();
      } else {
        message.error('Phát PPE cho tất cả nhân viên đều thất bại');
      }
    } catch (error: any) {
      console.error('Error issuing PPE:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Lỗi khi phát PPE cho Employee';
      message.error(errorMessage);
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
              label={
                <Space>
                  <span>Chọn Employee (cùng phòng ban)</span>
                  {selectedEmployees.length > 0 && (
                    <Tag color="blue">
                      Đã chọn: {selectedEmployees.length}/{employees.length}
                    </Tag>
                  )}
                </Space>
              }
              name="employee_id"
              rules={[{ required: true, message: 'Vui lòng chọn ít nhất 1 Employee' }]}
            >
              <div>
                <Select
                  mode="multiple"
                  placeholder={loading ? "Đang tải..." : (employees.length === 0 ? "Không có nhân viên nào trong phòng ban" : "Chọn 1 hoặc nhiều Employee")}
                  showSearch
                  optionFilterProp="children"
                  onChange={handleEmployeeChange}
                  suffixIcon={<UserOutlined />}
                  disabled={loading || employees.length === 0}
                  loading={loading}
                  maxTagCount="responsive"
                  maxTagTextLength={20}
                  value={selectedEmployees.map(e => e.id || (e as any)._id).filter(Boolean)}
                  notFoundContent={
                    loading ? (
                      <div style={{ textAlign: 'center', padding: '20px' }}>
                        <span>Đang tải danh sách nhân viên...</span>
                      </div>
                    ) : employees.length === 0 ? (
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
                
                {/* Nút chọn tất cả / Bỏ chọn tất cả */}
                {employees.length > 0 && (
                  <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {selectedEmployees.length > 0 ? (
                        <span>
                          Đã chọn <strong>{selectedEmployees.length}</strong> nhân viên
                          {selectedEmployees.length === employees.length && ' (Tất cả)'}
                        </span>
                      ) : (
                        <span>Chưa chọn nhân viên nào</span>
                      )}
                    </div>
                    <Space size="small">
                      {selectedEmployees.length < employees.length ? (
                        <Button
                          type="link"
                          size="small"
                          icon={<CheckOutlined />}
                          onClick={() => {
                            const allEmployeeIds = employees
                              .filter(employee => employee.id || (employee as any)._id)
                              .map(employee => employee.id || (employee as any)._id)
                              .filter(Boolean);
                            
                            form.setFieldsValue({ employee_id: allEmployeeIds });
                            handleEmployeeChange(allEmployeeIds);
                            
                            message.success(`Đã chọn tất cả ${allEmployeeIds.length} nhân viên`);
                          }}
                          style={{ 
                            padding: '0 4px',
                            height: 'auto',
                            fontSize: '12px',
                            color: '#1890ff'
                          }}
                        >
                          Chọn tất cả ({employees.length})
                        </Button>
                      ) : null}
                      {selectedEmployees.length > 0 && (
                        <Button
                          type="link"
                          size="small"
                          icon={<CloseOutlined />}
                          onClick={() => {
                            form.setFieldsValue({ employee_id: [] });
                            handleEmployeeChange([]);
                            message.info('Đã bỏ chọn tất cả');
                          }}
                          style={{ 
                            padding: '0 4px',
                            height: 'auto',
                            fontSize: '12px',
                            color: '#ff4d4f'
                          }}
                        >
                          Bỏ chọn tất cả
                        </Button>
                      )}
                    </Space>
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
                  <Card 
                    size="small" 
                    title={
                      <Space>
                        <UserOutlined />
                        <span>Thông tin Employee đã chọn</span>
                        <Tag color={selectedEmployees.length === employees.length ? 'green' : 'blue'}>
                          {selectedEmployees.length === employees.length ? 'Tất cả' : `${selectedEmployees.length}/${employees.length}`}
                        </Tag>
                      </Space>
                    } 
                    style={{ marginBottom: 8 }}
                    extra={
                      selectedEmployees.length > 5 ? (
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          Hiển thị 5/{selectedEmployees.length} đầu tiên
                        </Text>
                      ) : null
                    }
                  >
                    <Space direction="vertical" style={{ width: '100%' }} size="small">
                      {selectedEmployees.slice(0, 5).map((employee, index) => (
                        <div key={employee.id || (employee as any)._id} style={{ 
                          padding: '8px', 
                          border: '1px solid #f0f0f0', 
                          borderRadius: '4px',
                          backgroundColor: '#fafafa'
                        }}>
                          <Space>
                            <UserOutlined style={{ color: '#1890ff' }} />
                            <div style={{ flex: 1 }}>
                              <div>
                                <Text strong>{employee.full_name}</Text>
                              </div>
                              <div style={{ fontSize: '12px', color: '#666' }}>
                                <Text type="secondary">{employee.email}</Text>
                              </div>
                              <div style={{ fontSize: '12px', color: '#999' }}>
                                <Text type="secondary">Phòng ban: {employee.department?.department_name || 'N/A'}</Text>
                              </div>
                            </div>
                          </Space>
                        </div>
                      ))}
                      {selectedEmployees.length > 5 && (
                        <div style={{ 
                          padding: '8px', 
                          textAlign: 'center',
                          border: '1px dashed #d9d9d9',
                          borderRadius: '4px',
                          backgroundColor: '#fafafa'
                        }}>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            ... và {selectedEmployees.length - 5} nhân viên khác
                          </Text>
                        </div>
                      )}
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
                  disabled={loading || availableQuantity === 0 || (selectedEmployees.length > 0 && selectedEmployees.length > availableQuantity) || selectedEmployees.length === 0}
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
