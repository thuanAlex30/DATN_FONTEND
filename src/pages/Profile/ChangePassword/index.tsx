import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import type { AppDispatch, RootState } from '../../../store';
import { changePassword } from '../../../store/slices/authSlice';
import Toast from '../../../components/Toast';
import styles from './ChangePassword.module.css';

const ChangePasswordPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user, loading } = useSelector((state: RootState) => state.auth);
  
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPasswords, setShowPasswords] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
    isVisible: boolean;
  }>({
    message: '',
    type: 'info',
    isVisible: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.oldPassword.trim()) {
      newErrors.oldPassword = 'Mật khẩu cũ không được để trống';
    }

    if (!formData.newPassword.trim()) {
      newErrors.newPassword = 'Mật khẩu mới không được để trống';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự';
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Xác nhận mật khẩu không được để trống';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    if (formData.oldPassword === formData.newPassword) {
      newErrors.newPassword = 'Mật khẩu mới phải khác mật khẩu cũ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setToast({
        message: 'Vui lòng kiểm tra lại thông tin',
        type: 'error',
        isVisible: true,
      });
      return;
    }

    try {
      await dispatch(changePassword({
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
      })).unwrap();
      
      setToast({
        message: 'Đổi mật khẩu thành công!',
        type: 'success',
        isVisible: true,
      });
      
      // Navigate back to profile after a short delay
      setTimeout(() => {
        navigate('/profile');
      }, 1500);
      
    } catch (error: any) {
      setToast({
        message: error || 'Có lỗi xảy ra khi đổi mật khẩu',
        type: 'error',
        isVisible: true,
      });
    }
  };

  const handleCancel = () => {
    navigate('/profile');
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.changePasswordContainer}>
      {/* Header */}
      <header className={styles.changePasswordHeader}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <Link to="/profile" className={styles.backButton}>
              <i className="fas fa-arrow-left"></i>
              <span>Quay lại</span>
            </Link>
            <h1 className={styles.headerTitle}>Đổi mật khẩu</h1>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user.full_name}</span>
              <span className={styles.userRole}>{user.role?.role_name}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className={styles.changePasswordContent}>
        <div className={styles.changePasswordCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>
              <i className="fas fa-key"></i>
              Đổi mật khẩu
            </h2>
            <p className={styles.cardDescription}>
              Để bảo mật tài khoản, hãy đặt mật khẩu mạnh và khác với mật khẩu cũ
            </p>
          </div>

          <form onSubmit={handleSubmit} className={styles.changePasswordForm}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                <i className="fas fa-lock"></i>
                Mật khẩu hiện tại *
              </label>
              <div className={styles.passwordInputContainer}>
                <input
                  type={showPasswords.oldPassword ? 'text' : 'password'}
                  name="oldPassword"
                  value={formData.oldPassword}
                  onChange={handleInputChange}
                  className={`${styles.formInput} ${errors.oldPassword ? styles.inputError : ''}`}
                  placeholder="Nhập mật khẩu hiện tại"
                  disabled={loading}
                />
                <button
                  type="button"
                  className={styles.togglePasswordButton}
                  onClick={() => togglePasswordVisibility('oldPassword')}
                  disabled={loading}
                >
                  <i className={`fas ${showPasswords.oldPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
              {errors.oldPassword && (
                <span className={styles.errorMessage}>{errors.oldPassword}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                <i className="fas fa-lock"></i>
                Mật khẩu mới *
              </label>
              <div className={styles.passwordInputContainer}>
                <input
                  type={showPasswords.newPassword ? 'text' : 'password'}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className={`${styles.formInput} ${errors.newPassword ? styles.inputError : ''}`}
                  placeholder="Nhập mật khẩu mới"
                  disabled={loading}
                />
                <button
                  type="button"
                  className={styles.togglePasswordButton}
                  onClick={() => togglePasswordVisibility('newPassword')}
                  disabled={loading}
                >
                  <i className={`fas ${showPasswords.newPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
              {errors.newPassword && (
                <span className={styles.errorMessage}>{errors.newPassword}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                <i className="fas fa-lock"></i>
                Xác nhận mật khẩu mới *
              </label>
              <div className={styles.passwordInputContainer}>
                <input
                  type={showPasswords.confirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`${styles.formInput} ${errors.confirmPassword ? styles.inputError : ''}`}
                  placeholder="Nhập lại mật khẩu mới"
                  disabled={loading}
                />
                <button
                  type="button"
                  className={styles.togglePasswordButton}
                  onClick={() => togglePasswordVisibility('confirmPassword')}
                  disabled={loading}
                >
                  <i className={`fas ${showPasswords.confirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
              {errors.confirmPassword && (
                <span className={styles.errorMessage}>{errors.confirmPassword}</span>
              )}
            </div>

            {/* Password Requirements */}
            <div className={styles.passwordRequirements}>
              <h4 className={styles.requirementsTitle}>Yêu cầu mật khẩu:</h4>
              <ul className={styles.requirementsList}>
                <li className={`${styles.requirement} ${formData.newPassword.length >= 6 ? styles.valid : ''}`}>
                  <i className={`fas ${formData.newPassword.length >= 6 ? 'fa-check' : 'fa-times'}`}></i>
                  Ít nhất 6 ký tự
                </li>
                <li className={`${styles.requirement} ${formData.newPassword !== formData.oldPassword ? styles.valid : ''}`}>
                  <i className={`fas ${formData.newPassword !== formData.oldPassword ? 'fa-check' : 'fa-times'}`}></i>
                  Khác mật khẩu cũ
                </li>
                <li className={`${styles.requirement} ${formData.newPassword === formData.confirmPassword && formData.confirmPassword ? styles.valid : ''}`}>
                  <i className={`fas ${formData.newPassword === formData.confirmPassword && formData.confirmPassword ? 'fa-check' : 'fa-times'}`}></i>
                  Mật khẩu xác nhận khớp
                </li>
              </ul>
            </div>

            <div className={styles.formActions}>
              <button
                type="button"
                onClick={handleCancel}
                className={styles.cancelButton}
                disabled={loading}
              >
                <i className="fas fa-times"></i>
                Hủy
              </button>
              <button
                type="submit"
                className={styles.saveButton}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Đang đổi mật khẩu...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save"></i>
                    Đổi mật khẩu
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
};

export default ChangePasswordPage;
