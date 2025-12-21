import React, { useState, useEffect } from 'react';
import { Modal, Form, Select, DatePicker, message, Button, Space, Input, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import certificateService from '../../../../services/certificateService';
import dayjs, { Dayjs } from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

interface AssignCertificateModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  departmentId?: string;
  preSelectedUserId?: string | null; // If provided, pre-select this user in the modal
}

interface User {
  _id: string;
  full_name: string;
  email: string;
  role_id?: {
    role_name: string;
    role_code: string;
    role_level?: number;
  };
  role?: {
    role_name: string;
    role_code: string;
    role_level?: number;
  };
}

const AssignCertificateModal: React.FC<AssignCertificateModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  departmentId,
  preSelectedUserId
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [calculatedExpiryDate, setCalculatedExpiryDate] = useState<string | null>(null);
  // CRITICAL: Separate state to track selected users independently from form
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  useEffect(() => {
    if (visible) {
      // CRITICAL: Clear all state FIRST before loading users
      console.log('🔍 Modal opening - Clearing all state...');
      form.resetFields();
      form.setFieldsValue({ userIds: [] });
      setCalculatedExpiryDate(null);
      setSelectedUserIds([]);
      setUsers([]); // CRITICAL: Clear users list to prevent stale data
      
      // Then load users for the department
      if (departmentId) {
        console.log('🔍 Loading users for department:', departmentId);
        loadUsers();
      }
      console.log('🔍 Modal opened - All state reset');
    } else {
      // Also reset when modal closes
      console.log('🔍 Modal closing - Clearing all state...');
      form.resetFields();
      form.setFieldsValue({ userIds: [] });
      setCalculatedExpiryDate(null);
      setSelectedUserIds([]);
      setUsers([]); // CRITICAL: Clear users list when modal closes
      console.log('🔍 Modal closed - All state cleared');
    }
  }, [visible, departmentId, form]);

  // Function to calculate expiry date
  const calculateExpiryDate = (issueDate: Dayjs | null, duration: number | string | null) => {
    if (issueDate && duration && parseInt(String(duration)) > 0) {
      const expiryDate = dayjs(issueDate).add(parseInt(String(duration)), 'month');
      setCalculatedExpiryDate(expiryDate.format('DD/MM/YYYY'));
    } else {
      setCalculatedExpiryDate(null);
    }
  };

  const loadUsers = async () => {
    if (!departmentId) {
      console.warn('⚠️ No departmentId provided');
      message.warning('Không tìm thấy thông tin phòng ban');
      return;
    }
    
    // Ensure departmentId is a string
    const deptId = typeof departmentId === 'string' ? departmentId : 
                   (departmentId as any)?._id || (departmentId as any)?.id || String(departmentId);
    
    if (!deptId || deptId === '[object Object]' || deptId === 'null' || deptId === 'undefined') {
      console.error('❌ Invalid departmentId:', deptId, 'from:', departmentId);
      message.error('ID phòng ban không hợp lệ');
      return;
    }
    
    try {
      setLoadingUsers(true);
      console.log('🔍 Loading users for department:', deptId, typeof deptId);
      const response = await certificateService.getUsersByDepartment(deptId);
      
      console.log('📦 Full API response:', response);
      console.log('📦 response.data:', response.data);
      console.log('📦 response.data?.data:', response.data?.data);
      console.log('📦 response.data?.success:', response.data?.success);
      
      // Handle different response formats
      let data: any[] = [];
      if (response?.data) {
        if (response.data.success !== undefined) {
          // Format: { success: true, message: '...', data: [...] }
          if (response.data.success && response.data.data) {
            data = Array.isArray(response.data.data) ? response.data.data : [];
          } else if (!response.data.success) {
            console.error('❌ API returned error:', response.data.message);
            message.error(response.data.message || 'Không thể tải danh sách người dùng');
            setUsers([]);
            return;
          }
        } else if (Array.isArray(response.data)) {
          data = response.data;
        } else if (Array.isArray(response.data.data)) {
          data = response.data.data;
        }
      } else if (Array.isArray(response)) {
        data = response;
      }
      
      console.log('📦 Parsed data:', data);
      console.log('📦 Data length:', data.length);
      
      // Log each user for debugging
      data.forEach((user, index) => {
        console.log(`User ${index + 1}:`, {
          _id: user._id,
          full_name: user.full_name,
          email: user.email,
          role_id: user.role_id,
          role: user.role,
          department_id: user.department_id
        });
      });
      
      // Backend already filters, but add extra safety filter on frontend
      const filteredData = data.filter((user: any) => {
        // Check role_id (populated from backend) - this is what backend returns
        const roleId = user.role_id;
        const role = user.role;
        
        // Get role info from role_id (populated) first, then fallback to role
        const roleCode = roleId?.role_code?.toLowerCase() || role?.role_code?.toLowerCase() || '';
        const roleName = roleId?.role_name?.toLowerCase() || role?.role_name?.toLowerCase() || '';
        const roleLevel = roleId?.role_level || role?.role_level || 0;
        
        // Explicitly exclude department_header and any header roles
        const isDepartmentHeader = roleLevel >= 80 || 
                                  roleCode === 'department_header' || 
                                  roleCode === 'header_department' ||
                                  roleCode === 'header' ||
                                  roleName === 'department header' ||
                                  roleName === 'department_header' ||
                                  roleName === 'header department' ||
                                  roleName === 'header';
        
        if (isDepartmentHeader) {
          console.log(`❌ Frontend filtered out department_header: ${user.full_name}`, {
            roleCode,
            roleName,
            roleLevel
          });
          return false;
        }
        
        // Include manager: role_level 70 OR role_code/role_name contains "manager" (but not "department manager")
        const isManager = roleLevel === 70 || 
                         (roleCode.includes('manager') && !roleCode.includes('department')) ||
                         (roleName.includes('manager') && !roleName.includes('department') && roleName !== 'department manager');
        
        // Include employee: role_level 60 OR role_code/role_name is "employee"
        const isEmployee = roleLevel === 60 || 
                          roleCode === 'employee' ||
                          roleName === 'employee';
        
        const isValid = isManager || isEmployee;
        
        if (!isValid && (roleId || role)) {
          console.log(`⚠️ User filtered (not manager/employee): ${user.full_name}`, {
            roleCode,
            roleName,
            roleLevel,
            hasRoleId: !!roleId,
            hasRole: !!role
          });
        }
        
        return isValid;
      });
      
      console.log('✅ Loaded users:', filteredData.length, 'managers/employees');
      console.log('🔍 Users loaded:', filteredData.map(u => ({ id: u._id, name: u.full_name })));
      
      // CRITICAL: Set users AFTER clearing form to prevent any auto-selection
      setUsers(filteredData);
      
      // IMPORTANT: Ensure form userIds is cleared after loading users
      // This prevents any auto-selection of all users
      // BUT: If preSelectedUserId is provided, pre-select that user
      if (preSelectedUserId) {
        const preSelectedUser = filteredData.find(u => (u._id || u.id) === preSelectedUserId);
        if (preSelectedUser) {
          console.log('🔍 Pre-selecting user:', preSelectedUserId);
          form.setFieldsValue({ userIds: [preSelectedUserId] });
          setSelectedUserIds([preSelectedUserId]);
        } else {
          form.setFieldsValue({ userIds: [] });
          setSelectedUserIds([]);
        }
      } else {
        form.setFieldsValue({ userIds: [] });
        setSelectedUserIds([]);
      }
      console.log('🔍 Form userIds and selectedUserIds set after loading users');
      console.log('🔍 Current users state length:', filteredData.length);
      console.log('🔍 Pre-selected userId:', preSelectedUserId);
      
      if (filteredData.length === 0 && data.length > 0) {
        message.warning('Không tìm thấy manager hoặc employee nào trong phòng ban này. Tổng số users: ' + data.length);
      } else if (filteredData.length === 0) {
        message.warning('Không tìm thấy người dùng nào trong phòng ban này');
      }
    } catch (error: any) {
      console.error('❌ Error loading users:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error data:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.message || 'Không thể tải danh sách người dùng';
      message.error(errorMessage);
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      
      console.log('🔍 Form values received:', values);
      console.log('🔍 values.userIds type:', typeof values.userIds);
      console.log('🔍 values.userIds is array?', Array.isArray(values.userIds));
      console.log('🔍 values.userIds value:', values.userIds);
      console.log('🔍 selectedUserIds state:', selectedUserIds);
      
      // CRITICAL: Use selectedUserIds state instead of form values to prevent auto-selection
      // This ensures we only use what the user actually selected
      let finalSelectedUserIds: string[] = [];
      
      if (selectedUserIds && selectedUserIds.length > 0) {
        // Use state if available (most reliable)
        finalSelectedUserIds = selectedUserIds;
        console.log('✅ Using selectedUserIds from state:', finalSelectedUserIds);
      } else if (values.userIds && Array.isArray(values.userIds) && values.userIds.length > 0) {
        // Fallback to form values if state is empty
        finalSelectedUserIds = values.userIds;
        console.log('⚠️ Using userIds from form values (state was empty):', finalSelectedUserIds);
      } else {
        console.error('❌ Validation failed: No users selected');
        message.error('Vui lòng chọn ít nhất một người dùng');
        setLoading(false);
        return;
      }
      
      // Validate finalSelectedUserIds - ensure it's an array and not empty
      if (!finalSelectedUserIds || !Array.isArray(finalSelectedUserIds) || finalSelectedUserIds.length === 0) {
        console.error('❌ Validation failed: finalSelectedUserIds is empty or not an array');
        message.error('Vui lòng chọn ít nhất một người dùng');
        setLoading(false);
        return;
      }
      
      // Ensure userIds only contains the selected users (not all users)
      const selectedUserIdsArray = Array.isArray(finalSelectedUserIds) ? finalSelectedUserIds : [finalSelectedUserIds];
      
      // Safety check: if selectedUserIdsArray equals all users, warn user
      const allUserIds = users.map(u => u._id);
      const isAllUsersSelected = selectedUserIdsArray.length === allUserIds.length && 
                                 selectedUserIdsArray.every((id: string) => allUserIds.includes(id));
      
      console.log('📤 Final selected user IDs:', selectedUserIdsArray);
      console.log('📤 Selected count:', selectedUserIdsArray.length);
      console.log('📤 Total users in list:', users.length);
      console.log('📤 All user IDs:', allUserIds);
      console.log('📤 Is all users selected?', isAllUsersSelected);
      
      // CRITICAL: If all users are selected but user only selected one, prevent submission
      if (isAllUsersSelected && selectedUserIdsArray.length > 1) {
        console.error('❌ ERROR: All users are selected! This should not happen.');
        message.warning('Cảnh báo: Tất cả người dùng đang được chọn. Vui lòng kiểm tra lại và chỉ chọn những người dùng cần thiết.');
        setLoading(false);
        return;
      }
      
      // Additional validation: ensure we're not accidentally sending all users
      if (selectedUserIdsArray.length > users.length) {
        console.error('❌ ERROR: Selected users count exceeds available users!');
        message.error('Lỗi: Số lượng người dùng được chọn không hợp lệ');
        setLoading(false);
        return;
      }
      
      // Calculate expiry date from issueDate + duration
      let expiryDate: Dayjs | null = null;
      if (values.issueDate && values.duration && values.duration > 0) {
        expiryDate = dayjs(values.issueDate).add(parseInt(values.duration), 'month');
      }
      
      const assignmentData = {
        userIds: selectedUserIdsArray, // Use only selected user IDs from state
        certificateInfo: {
          certificateName: values.certificateName,
          certificateCode: values.certificateCode || undefined,
          description: values.description || undefined,
          category: values.category || 'OTHER',
          issuingAuthority: values.issuingAuthority,
          issueDate: values.issueDate ? values.issueDate.format('YYYY-MM-DD') : undefined,
          expiryDate: expiryDate ? expiryDate.format('YYYY-MM-DD') : undefined,
          duration: values.duration ? parseInt(values.duration) : undefined,
          status: 'ACTIVE', // Default status
        }
      };

      console.log('📤 Sending assignment data:', JSON.stringify(assignmentData, null, 2));
      console.log('📤 Number of users to assign:', selectedUserIdsArray.length);
      console.log('📤 Selected user IDs (detailed):', selectedUserIdsArray);
      console.log('📤 All available user IDs:', allUserIds);
      console.log('📤 Match check:', selectedUserIdsArray.map((id: string) => allUserIds.includes(id)));
      
      // FINAL SAFETY CHECK: If all users are selected, show confirmation
      if (isAllUsersSelected && selectedUserIdsArray.length > 1) {
        console.error('❌ BLOCKED: Attempting to assign to all users!');
        message.error(`Cảnh báo: Bạn đang cố gán chứng chỉ cho tất cả ${selectedUserIdsArray.length} người dùng. Nếu đây không phải ý định của bạn, vui lòng kiểm tra lại.`);
        setLoading(false);
        return;
      }
      
      const response = await certificateService.assignCertificate(assignmentData);
      
          if (response.success) {
            message.success(`Ghi nhận chứng chỉ thành công cho ${selectedUserIdsArray.length} người dùng`);
            onSuccess();
            form.resetFields();
            form.setFieldsValue({ userIds: [] }); // Explicitly clear userIds
            setCalculatedExpiryDate(null);
            // CRITICAL: Clear selectedUserIds state after successful submission
            setSelectedUserIds([]);
            console.log('✅ Success - Cleared selectedUserIds state');
          } else {
            message.error(response.message || 'Không thể ghi nhận chứng chỉ');
          }
    } catch (error: any) {
      console.error('Error assigning certificate:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      console.error('Error response errors:', error.response?.data?.errors);
      
      // Show detailed validation errors if available
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const validationErrors = error.response.data.errors.map((err: any) => {
          const field = err.param || err.path || '';
          const msg = err.msg || err.message || 'Lỗi không xác định';
          return field ? `${field}: ${msg}` : msg;
        }).join(', ');
        message.error(`Dữ liệu không hợp lệ: ${validationErrors}`);
      } else {
        const errorMessage = error.response?.data?.message || error.message || 'Không thể ghi nhận chứng chỉ';
        message.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserOutlined />
            <span>Ghi nhận Chứng chỉ Cá nhân</span>
          </div>
        }
      open={visible}
      onCancel={() => {
        form.resetFields();
        form.setFieldsValue({ userIds: [] });
        setCalculatedExpiryDate(null);
        onCancel();
      }}
      footer={null}
      width={700}
      destroyOnClose={true}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="userIds"
          label="Người dùng"
          getValueFromEvent={(value) => {
            // Ensure we only get the selected values, not all users
            if (!value) return [];
            const selectedIds = Array.isArray(value) ? value : [value];
            console.log('🔍 getValueFromEvent - Selected IDs:', selectedIds);
            return selectedIds;
          }}
          rules={[
            { required: true, message: 'Vui lòng chọn ít nhất một người dùng' },
            {
              validator: (_, value) => {
                if (!value || (Array.isArray(value) && value.length === 0)) {
                  return Promise.reject(new Error('Vui lòng chọn ít nhất một người dùng'));
                }
                if (Array.isArray(value) && value.length > users.length) {
                  return Promise.reject(new Error('Số lượng người dùng được chọn không hợp lệ'));
                }
                // Additional check: warn if all users are selected
                if (Array.isArray(value) && value.length === users.length && users.length > 1) {
                  console.warn('⚠️ Validator: All users are selected!');
                }
                return Promise.resolve();
              }
            }
          ]}
        >
          <Select
            mode="multiple"
            placeholder="Chọn người dùng (có thể chọn nhiều)"
            loading={loadingUsers}
            showSearch
            allowClear
            maxTagCount="responsive"
            optionFilterProp="children"
            notFoundContent={loadingUsers ? <span>Đang tải...</span> : <span>Không tìm thấy người dùng</span>}
            onChange={(value) => {
              console.log('🔍 UserIds changed:', value);
              console.log('🔍 Selected count:', value ? value.length : 0);
              console.log('🔍 Total users available:', users.length);
              
              // Ensure value is an array
              const selectedIds = Array.isArray(value) ? value : (value ? [value] : []);
              
              // CRITICAL CHECK: If somehow all users are selected, warn and prevent
              if (selectedIds.length === users.length && users.length > 1) {
                console.warn('⚠️ WARNING: All users are being selected! This might be a bug.');
                console.warn('⚠️ Selected IDs:', selectedIds);
                console.warn('⚠️ All user IDs:', users.map(u => u._id));
                // Don't allow all users to be selected automatically
                message.warning('Cảnh báo: Tất cả người dùng đang được chọn. Vui lòng kiểm tra lại.');
                return;
              }
              
              // CRITICAL: Update both form and state
              form.setFieldsValue({ userIds: selectedIds });
              setSelectedUserIds(selectedIds); // Update state separately
              console.log('🔍 Form userIds set to:', selectedIds);
              console.log('🔍 selectedUserIds state updated to:', selectedIds);
            }}
            filterOption={(input, option) => {
              const label = option?.label || option?.children;
              if (typeof label === 'string') {
                return label.toLowerCase().includes(input.toLowerCase());
              }
              if (typeof label === 'object' && label !== null) {
                const labelStr = String(label);
                return labelStr.toLowerCase().includes(input.toLowerCase());
              }
              return false;
            }}
          >
            {users.map((user) => {
              const roleName = user.role_id?.role_name || 
                              user.role?.role_name || 
                              'N/A';
              return (
                <Option key={user._id} value={user._id}>
                  {user.full_name} ({user.email}) - {roleName}
                </Option>
              );
            })}
            </Select>
          </Form.Item>

        <Form.Item
          name="certificateName"
          label="Tên chứng chỉ"
          rules={[{ required: true, message: 'Vui lòng nhập tên chứng chỉ' }]}
        >
          <Input placeholder="Nhập tên chứng chỉ" />
        </Form.Item>

        <Form.Item
          name="certificateCode"
          label="Mã chứng chỉ"
        >
          <Input placeholder="Nhập mã chứng chỉ (tùy chọn)" />
        </Form.Item>

        <Form.Item
          name="category"
          label="Danh mục"
        >
          <Select placeholder="Chọn danh mục">
            <Option value="SAFETY">An toàn</Option>
            <Option value="TECHNICAL">Kỹ thuật</Option>
            <Option value="MANAGEMENT">Quản lý</Option>
            <Option value="QUALITY">Chất lượng</Option>
            <Option value="ENVIRONMENTAL">Môi trường</Option>
            <Option value="HEALTH">Sức khỏe</Option>
            <Option value="OTHER">Khác</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="issuingAuthority"
          label="Cơ quan cấp"
          rules={[{ required: true, message: 'Vui lòng nhập cơ quan cấp' }]}
        >
          <Input placeholder="Nhập tên cơ quan cấp chứng chỉ" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Mô tả"
        >
          <TextArea rows={3} placeholder="Nhập mô tả chứng chỉ (tùy chọn)" />
        </Form.Item>

        <Form.Item
          name="issueDate"
          label="Ngày cấp"
          rules={[{ required: true, message: 'Vui lòng chọn ngày cấp' }]}
        >
          <DatePicker
            style={{ width: '100%' }}
            format="DD/MM/YYYY"
            placeholder="Chọn ngày cấp"
            onChange={(date) => {
              const duration = form.getFieldValue('duration');
              calculateExpiryDate(date, duration);
            }}
          />
        </Form.Item>

        <Form.Item
          name="duration"
          label="Thời hạn (tháng)"
          rules={[
            { required: true, message: 'Vui lòng nhập thời hạn' },
            { 
              validator: (_, value) => {
                if (!value) {
                  return Promise.reject(new Error('Vui lòng nhập thời hạn'));
                }
                const numValue = parseInt(String(value));
                if (isNaN(numValue) || numValue < 1 || numValue > 120) {
                  return Promise.reject(new Error('Thời hạn phải từ 1 đến 120 tháng'));
                }
                return Promise.resolve();
              }
            }
          ]}
        >
          <Input 
            type="number" 
            placeholder="Nhập số tháng (1-120)" 
            min={1} 
            max={120}
            onChange={(e) => {
              const duration = e.target.value;
              const issueDate = form.getFieldValue('issueDate');
              calculateExpiryDate(issueDate, duration);
            }}
          />
        </Form.Item>

        {calculatedExpiryDate && (
          <Form.Item label="Ngày hết hạn (tự động tính)">
            <Text strong style={{ color: '#1890ff', fontSize: '16px' }}>
              {calculatedExpiryDate}
            </Text>
          </Form.Item>
        )}

          <Form.Item>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={onCancel}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Ghi nhận
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AssignCertificateModal;

