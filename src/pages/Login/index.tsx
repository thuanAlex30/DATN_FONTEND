import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '../../store';
import { Button, Input } from '../../components/ui';
import { login } from '../../store/slices/authSlice';
import type { RootState } from '../../store';
import type { LoginRequest } from '../../types/auth';
import { useSafeNavigate } from '../../hooks/useSafeNavigate';

import './Login.css';

const LoginPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const safeNavigate = useSafeNavigate();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState<LoginRequest>({
    username: '',
    password: '',
  });

  const [formErrors, setFormErrors] = useState<{
    username?: string;
    password?: string;
  }>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user starts typing
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const errors: typeof formErrors = {};

    if (!formData.username.trim()) {
      errors.username = 'Tên đăng nhập không được để trống';
    }

    if (!formData.password.trim()) {
      errors.password = 'Mật khẩu không được để trống';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const resultAction = await dispatch(login(formData));
      
      if (login.fulfilled.match(resultAction)) {
        const user = resultAction.payload.user;
        
        // Check if user is admin
        if (user.role?.role_name === 'admin') {
          safeNavigate('/admin/dashboard', { replace: true });
        } else {
          // Handle non-admin users (redirect to appropriate page)
          safeNavigate('/home', { replace: true });
        }
      } else if (login.rejected.match(resultAction)) {
        // Error is already handled by the slice
        console.error('Login failed:', resultAction.payload);
      }
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">Hệ Thống Quản Lý An Toàn</h1>
          <p className="login-subtitle">Đăng nhập quản trị viên</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <Input
            type="text"
            name="username"
            label="Tên đăng nhập"
            placeholder="Nhập tên đăng nhập"
            value={formData.username}
            onChange={handleInputChange}
            error={formErrors.username}
            required
            autoComplete="username"
          />

          <Input
            type="password"
            name="password"
            label="Mật khẩu"
            placeholder="Nhập mật khẩu"
            value={formData.password}
            onChange={handleInputChange}
            error={formErrors.password}
            required
            autoComplete="current-password"
          />

          {error && (
            <div className="login-error">
              {typeof error === 'string' ? error : 'Đăng nhập thất bại, vui lòng kiểm tra tên đăng nhập và mật khẩu'}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="large"
            loading={loading}
            className="login-button"
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </Button>
        </form>

        <div className="login-footer">
          <p className="login-help">
            Nếu có vấn đề, vui lòng liên hệ quản trị viên hệ thống
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
