import React, { useState, useEffect } from 'react';
import userService from '../../services/userService';
import departmentService from '../../services/departmentService';
import positionService from '../../services/positionService';
import roleService from '../../services/roleService';
import './QuickAddEmployeeModal.css';

interface QuickAddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  username: string;
  email: string;
  fullName: string;
  phone: string;
  password: string;
  confirmPassword: string;
  departmentId: string;
  positionId: string;
  roleId: string;
}

const QuickAddEmployeeModal: React.FC<QuickAddEmployeeModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    fullName: '',
    phone: '',
    password: '',
    confirmPassword: '',
    departmentId: '',
    positionId: '',
    roleId: ''
  });

  const [departments, setDepartments] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDropdowns, setIsLoadingDropdowns] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Load dropdown data
  useEffect(() => {
    if (isOpen) {
      loadDropdownData();
    }
  }, [isOpen]);

  // Debug state changes
  useEffect(() => {
    console.log('Departments state changed:', departments);
  }, [departments]);

  useEffect(() => {
    console.log('Positions state changed:', positions);
  }, [positions]);

  useEffect(() => {
    console.log('Roles state changed:', roles);
  }, [roles]);

  const loadDropdownData = async () => {
    setIsLoadingDropdowns(true);
    try {
      // Check if user is authenticated
      const token = localStorage.getItem('accessToken');
      console.log('Current token:', token ? 'Present' : 'Missing');
      
      if (!token) {
        console.warn('No access token found, user might not be authenticated');
        setDepartments([]);
        setPositions([]);
        setRoles([]);
        return;
      }

      console.log('Loading dropdown data...');
      const [deptResponse, posResponse, roleResponse] = await Promise.all([
        departmentService.getActiveDepartments(),
        positionService.getOptions(),
        roleService.getAllActiveRoles()
      ]);

      console.log('API Responses:', { deptResponse, posResponse, roleResponse });
      console.log('Position response structure:', posResponse);

      // Extract data from responses - handle different response formats
      let deptData: any[] = [];
      let posData: any[] = [];
      let roleData: any[] = [];

      // Handle department response
      if (deptResponse && (deptResponse as any).data && (deptResponse as any).data.data && Array.isArray((deptResponse as any).data.data)) {
        deptData = (deptResponse as any).data.data;
      } else if (deptResponse && (deptResponse as any).data && Array.isArray((deptResponse as any).data)) {
        deptData = (deptResponse as any).data;
      } else if (deptResponse && Array.isArray(deptResponse)) {
        deptData = deptResponse;
      }

      // Handle position response
      if (posResponse && (posResponse as any).data && (posResponse as any).data.data && Array.isArray((posResponse as any).data.data)) {
        posData = (posResponse as any).data.data;
      } else if (posResponse && (posResponse as any).data && Array.isArray((posResponse as any).data)) {
        posData = (posResponse as any).data;
      } else if (posResponse && Array.isArray(posResponse)) {
        posData = posResponse;
      }

      // Handle role response
      if (roleResponse && (roleResponse as any).data && (roleResponse as any).data.data && Array.isArray((roleResponse as any).data.data)) {
        roleData = (roleResponse as any).data.data;
      } else if (roleResponse && (roleResponse as any).data && Array.isArray((roleResponse as any).data)) {
        roleData = (roleResponse as any).data;
      } else if (roleResponse && Array.isArray(roleResponse)) {
        roleData = roleResponse;
      }

      console.log('Extracted data:', { deptData, posData, roleData });
      console.log('Department data length:', deptData.length);
      console.log('Position data length:', posData.length);
      console.log('Role data length:', roleData.length);
      console.log('Position data sample:', posData[0]);

      setDepartments(deptData);
      setPositions(posData);
      setRoles(roleData);

      console.log('State updated:', { 
        departments: deptData, 
        positions: posData, 
        roles: roleData 
      });
    } catch (error: any) {
      console.error('Error loading dropdown data:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      
      // Set empty arrays on error to prevent crashes
      setDepartments([]);
      setPositions([]);
      setRoles([]);
    } finally {
      setIsLoadingDropdowns(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors and success message when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const validateForm = (): string[] => {
    const newErrors: string[] = [];

    if (!formData.username.trim()) {
      newErrors.push('Tên đăng nhập là bắt buộc');
    } else if (formData.username.length < 3) {
      newErrors.push('Tên đăng nhập phải có ít nhất 3 ký tự');
    }

    if (!formData.email.trim()) {
      newErrors.push('Email là bắt buộc');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.push('Email không hợp lệ');
    }

    if (!formData.fullName.trim()) {
      newErrors.push('Họ tên là bắt buộc');
    }

    if (!formData.password) {
      newErrors.push('Mật khẩu là bắt buộc');
    } else if (formData.password.length < 6) {
      newErrors.push('Mật khẩu phải có ít nhất 6 ký tự');
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.push('Mật khẩu xác nhận không khớp');
    }

    if (!formData.roleId) {
      newErrors.push('Vai trò là bắt buộc');
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setErrors([]);
    setSuccessMessage('');

    try {
      const createData = {
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        full_name: formData.fullName.trim(),
        phone: formData.phone?.trim() || undefined,
        department_id: formData.departmentId || undefined,
        position_id: formData.positionId || undefined,
        role_id: formData.roleId
      };

      console.log('Creating user with data:', createData);
      await userService.createUser(createData);
      
      // Show success message
      setSuccessMessage('Thêm nhân viên thành công!');
      
      // Reset form
      setFormData({
        username: '',
        email: '',
        fullName: '',
        phone: '',
        password: '',
        confirmPassword: '',
        departmentId: '',
        positionId: '',
        roleId: ''
      });

      // Close modal after 2 seconds
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
      
    } catch (error: any) {
      console.error('Error creating user:', error);
      
      let errorMessage = 'Có lỗi xảy ra khi tạo nhân viên mới!';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setErrors([errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        username: '',
        email: '',
        fullName: '',
        phone: '',
        password: '',
        confirmPassword: '',
        departmentId: '',
        positionId: '',
        roleId: ''
      });
      setErrors([]);
      setSuccessMessage('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="quick-add-employee-modal-overlay">
      <div className="quick-add-employee-modal">
        <div className="modal-header">
          <h2>Thêm nhân viên nhanh</h2>
          <button 
            className="close-btn" 
            onClick={handleClose}
            disabled={isLoading}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {successMessage && (
            <div className="success-message">
              <i className="fas fa-check-circle"></i>
              {successMessage}
            </div>
          )}

          {errors.length > 0 && (
            <div className="error-messages">
              {errors.map((error, index) => (
                <div key={index} className="error-message">
                  <i className="fas fa-exclamation-circle"></i>
                  {error}
                </div>
              ))}
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="username">Tên đăng nhập *</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Nhập tên đăng nhập"
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Nhập email"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="fullName">Họ tên *</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Nhập họ tên"
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Số điện thoại</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Nhập số điện thoại"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Mật khẩu *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Nhập mật khẩu"
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Xác nhận mật khẩu *</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Nhập lại mật khẩu"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="roleId">Vai trò *</label>
              <select
                id="roleId"
                name="roleId"
                value={formData.roleId}
                onChange={handleInputChange}
                required
                disabled={isLoading || isLoadingDropdowns}
              >
                <option value="">
                  {isLoadingDropdowns ? 'Đang tải...' : 'Chọn vai trò'}
                </option>
                {roles.map(role => (
                  <option key={role.id} value={role.id}>
                    {role.role_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="departmentId">Phòng ban</label>
              <select
                id="departmentId"
                name="departmentId"
                value={formData.departmentId}
                onChange={handleInputChange}
                disabled={isLoading || isLoadingDropdowns}
              >
                <option value="">
                  {isLoadingDropdowns ? 'Đang tải...' : 'Chọn phòng ban'}
                </option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>
                    {dept.department_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="positionId">Chức vụ</label>
            <select
              id="positionId"
              name="positionId"
              value={formData.positionId}
              onChange={handleInputChange}
              disabled={isLoading || isLoadingDropdowns}
            >
              <option value="">
                {isLoadingDropdowns ? 'Đang tải...' : 'Chọn chức vụ'}
              </option>
              {positions.map(pos => (
                <option key={pos.id} value={pos.id}>
                  {pos.position_name || pos.name}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={handleClose}
              disabled={isLoading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Đang tạo...
                </>
              ) : (
                <>
                  <i className="fas fa-user-plus"></i>
                  Tạo nhân viên
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuickAddEmployeeModal;
