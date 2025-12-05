import React, { useState, useEffect } from 'react';
import userService from '../../services/userService';
import departmentService from '../../services/departmentService';
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

    roleId: ''
  });

  const [departments, setDepartments] = useState<any[]>([]);
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
        setRoles([]);
        return;
      }
      console.log('Loading dropdown data...');
      const [deptResponse, roleResponse] = await Promise.all([
        departmentService.getActiveDepartments(),
        roleService.getAllActiveRoles()
      ]);


      // Extract data from responses - handle different response formats
      let deptData: any[] = [];
      let roleData: any[] = [];

      // Handle department response
      if (deptResponse && (deptResponse as any).data && (deptResponse as any).data.data && Array.isArray((deptResponse as any).data.data)) {
        deptData = (deptResponse as any).data.data;
      } else if (deptResponse && (deptResponse as any).data && Array.isArray((deptResponse as any).data)) {
        deptData = (deptResponse as any).data;
      } else if (deptResponse && Array.isArray(deptResponse)) {
        deptData = deptResponse;
      }


      // Handle role response
      if (roleResponse && (roleResponse as any).data && (roleResponse as any).data.data && Array.isArray((roleResponse as any).data.data)) {
        roleData = (roleResponse as any).data.data;
      } else if (roleResponse && (roleResponse as any).data && Array.isArray((roleResponse as any).data)) {
        roleData = (roleResponse as any).data;
      } else if (roleResponse && Array.isArray(roleResponse)) {
        roleData = roleResponse;
      }

      console.log('Department data length:', deptData.length);
      console.log('Role data length:', roleData.length);

      setDepartments(deptData);
      setRoles(roleData);

      console.log('State updated:', { 
        departments: deptData, 
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
      newErrors.push('TÃªn Ä‘Äƒng nháº­p lÃ  báº¯t buá»™c');
    } else if (formData.username.length < 3) {
      newErrors.push('TÃªn Ä‘Äƒng nháº­p pháº£i cÃ³ Ã­t nháº¥t 3 kÃ½ tá»±');
    }

    if (!formData.email.trim()) {
      newErrors.push('Email lÃ  báº¯t buá»™c');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.push('Email khÃ´ng há»£p lá»‡');
    }

    if (!formData.fullName.trim()) {
      newErrors.push('Há» tÃªn lÃ  báº¯t buá»™c');
    }

    if (!formData.password) {
      newErrors.push('Máº­t kháº©u lÃ  báº¯t buá»™c');
    } else if (formData.password.length < 6) {
      newErrors.push('Máº­t kháº©u pháº£i cÃ³ Ã­t nháº¥t 6 kÃ½ tá»±');
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.push('Máº­t kháº©u xÃ¡c nháº­n khÃ´ng khá»›p');
    }

    if (!formData.roleId) {
      newErrors.push('Vai trÃ² lÃ  báº¯t buá»™c');
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
        role_id: formData.roleId
      };

      console.log('Creating user with data:', createData);
      await userService.createUser(createData);
      
      // Show success message
      setSuccessMessage('ThÃªm nhÃ¢n viÃªn thÃ nh cÃ´ng!');
      
      // Reset form
      setFormData({
        username: '',
        email: '',
        fullName: '',
        phone: '',
        password: '',
        confirmPassword: '',
        departmentId: '',
    
        roleId: ''
      });

      // Close modal after 2 seconds
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
      
    } catch (error: any) {
      console.error('Error creating user:', error);
      
      let errorMessage = 'CÃ³ lá»—i xáº£y ra khi táº¡o nhÃ¢n viÃªn má»›i!';
      
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
          <h2>ThÃªm nhÃ¢n viÃªn nhanh</h2>
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
              <label htmlFor="username">TÃªn Ä‘Äƒng nháº­p *</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Nháº­p tÃªn Ä‘Äƒng nháº­p"
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
                placeholder="Nháº­p email"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="fullName">Há» tÃªn *</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Nháº­p há» tÃªn"
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Sá»‘ Ä‘iá»‡n thoáº¡i</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Nháº­p sá»‘ Ä‘iá»‡n thoáº¡i"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Máº­t kháº©u *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Nháº­p máº­t kháº©u"
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">XÃ¡c nháº­n máº­t kháº©u *</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Nháº­p láº¡i máº­t kháº©u"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="roleId">Vai trÃ² *</label>
              <select
                id="roleId"
                name="roleId"
                value={formData.roleId}
                onChange={handleInputChange}
                required
                disabled={isLoading || isLoadingDropdowns}
              >
                <option value="">
                  {isLoadingDropdowns ? 'Äang táº£i...' : 'Chá»n vai trÃ²'}
                </option>
                {roles.map(role => (
                  <option key={role.id} value={role.id}>
                    {role.role_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="departmentId">PhÃ²ng ban</label>
              <select
                id="departmentId"
                name="departmentId"
                value={formData.departmentId}
                onChange={handleInputChange}
                disabled={isLoading || isLoadingDropdowns}
              >
                <option value="">
                  {isLoadingDropdowns ? 'Äang táº£i...' : 'Chá»n phÃ²ng ban'}
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
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={handleClose}
              disabled={isLoading}
            >
              Há»§y
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Äang táº¡o...
                </>
              ) : (
                <>
                  <i className="fas fa-user-plus"></i>
                  Táº¡o nhÃ¢n viÃªn
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
