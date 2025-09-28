import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import type { AppDispatch, RootState } from '../../../store';
import { updateProfile, refreshUserProfile } from '../../../store/slices/authSlice';
import Toast from '../../../components/Toast';
import styles from './EditProfile.module.css';

const EditProfilePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user, loading } = useSelector((state: RootState) => state.auth);
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
    isVisible: boolean;
  }>({
    message: '',
    type: 'info',
    isVisible: false,
  });

  // Populate form data when component mounts
  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
      setErrors({});
    }
  }, [user]);

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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Họ và tên không được để trống';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email không được để trống';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (formData.phone && !/^[0-9+\-\s()]+$/.test(formData.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
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
      console.log('🔍 EditProfilePage - formData:', formData);
      await dispatch(updateProfile(formData)).unwrap();
      
      // Refresh user profile from server to get latest data
      await dispatch(refreshUserProfile()).unwrap();
      
      console.log('🔍 EditProfilePage - update successful');
      setToast({
        message: 'Cập nhật thông tin thành công!',
        type: 'success',
        isVisible: true,
      });
      
      // Navigate back to profile after a short delay
      setTimeout(() => {
        navigate('/profile');
      }, 1500);
      
    } catch (error: any) {
      console.error('❌ EditProfilePage - update error:', error);
      setToast({
        message: error || 'Có lỗi xảy ra khi cập nhật thông tin',
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
    <div className={styles.editProfileContainer}>
      {/* Header */}
      <header className={styles.editProfileHeader}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <Link to="/profile" className={styles.backButton}>
              <i className="fas fa-arrow-left"></i>
              <span>Quay lại</span>
            </Link>
            <h1 className={styles.headerTitle}>Chỉnh sửa thông tin cá nhân</h1>
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
      <div className={styles.editProfileContent}>
        <div className={styles.editProfileCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>
              <i className="fas fa-edit"></i>
              Thông tin cá nhân
            </h2>
            <p className={styles.cardDescription}>
              Cập nhật thông tin cá nhân của bạn
            </p>
          </div>

          <form onSubmit={handleSubmit} className={styles.editProfileForm}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                <i className="fas fa-user"></i>
                Họ và tên *
              </label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                className={`${styles.formInput} ${errors.full_name ? styles.inputError : ''}`}
                placeholder="Nhập họ và tên"
                disabled={loading}
              />
              {errors.full_name && (
                <span className={styles.errorMessage}>{errors.full_name}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                <i className="fas fa-envelope"></i>
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`${styles.formInput} ${errors.email ? styles.inputError : ''}`}
                placeholder="Nhập email"
                disabled={loading}
              />
              {errors.email && (
                <span className={styles.errorMessage}>{errors.email}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                <i className="fas fa-phone"></i>
                Số điện thoại
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`${styles.formInput} ${errors.phone ? styles.inputError : ''}`}
                placeholder="Nhập số điện thoại"
                disabled={loading}
              />
              {errors.phone && (
                <span className={styles.errorMessage}>{errors.phone}</span>
              )}
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
                    Đang cập nhật...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save"></i>
                    Lưu thay đổi
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

export default EditProfilePage;
