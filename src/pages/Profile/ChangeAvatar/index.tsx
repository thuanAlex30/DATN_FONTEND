import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import type { AppDispatch, RootState } from '../../../store';
import { updateAvatar, refreshUserProfile } from '../../../store/slices/authSlice';
import userService from '../../../services/userService';
import Toast from '../../../components/Toast';
import styles from './ChangeAvatar.module.css';

const ChangeAvatarPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user, loading } = useSelector((state: RootState) => state.auth);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
    isVisible: boolean;
  }>({
    message: '',
    type: 'info',
    isVisible: false,
  });

  const handleFileSelect = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setToast({
        message: 'Vui lòng chọn file ảnh hợp lệ',
        type: 'error',
        isVisible: true,
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setToast({
        message: 'Kích thước file không được vượt quá 5MB',
        type: 'error',
        isVisible: true,
      });
      return;
    }

    console.log('🔍 File selected:', file);
    console.log('🔍 File details:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    });
    setSelectedFile(file);
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    console.log('🔍 Preview URL created:', url);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setToast({
        message: 'Vui lòng chọn ảnh đại diện',
        type: 'error',
        isVisible: true,
      });
      return;
    }

    try {
      console.log('🔍 ChangeAvatarPage - selectedFile:', selectedFile);
      console.log('🔍 ChangeAvatarPage - file details:', {
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type
      });
      
      // Upload avatar using userService
      const result = await userService.uploadAvatar(selectedFile);
      
      console.log('🔍 ChangeAvatarPage - upload result:', result);
      console.log('🔍 ChangeAvatarPage - result.avatar:', result.avatar);
      
      // Always refresh user profile from server to get latest data including avatar
      console.log('🔍 ChangeAvatarPage - Refreshing profile from server...');
      await dispatch(refreshUserProfile()).unwrap();
      
      // Also update Redux state directly if avatar was returned
      if (result.avatar) {
        dispatch(updateAvatar(result.avatar));
        console.log('🔍 ChangeAvatarPage - Redux updated with avatar:', result.avatar);
      }
      
      setToast({
        message: 'Cập nhật ảnh đại diện thành công!',
        type: 'success',
        isVisible: true,
      });
      
      // Navigate back to profile after a short delay
      setTimeout(() => {
        navigate('/profile');
      }, 1500);
      
    } catch (error: any) {
      console.error('❌ ChangeAvatarPage - upload error:', error);
      setToast({
        message: error?.response?.data?.message || error?.message || 'Có lỗi xảy ra khi cập nhật ảnh đại diện',
        type: 'error',
        isVisible: true,
      });
    }
  };

  const handleCancel = () => {
    navigate('/profile');
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.changeAvatarContainer}>
      {/* Header */}
      <header className={styles.changeAvatarHeader}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <Link to="/profile" className={styles.backButton}>
              <i className="fas fa-arrow-left"></i>
              <span>Quay lại</span>
            </Link>
            <h1 className={styles.headerTitle}>Đổi ảnh đại diện</h1>
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
      <div className={styles.changeAvatarContent}>
        <div className={styles.changeAvatarCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>
              <i className="fas fa-user-circle"></i>
              Ảnh đại diện
            </h2>
            <p className={styles.cardDescription}>
              Chọn ảnh đại diện mới cho tài khoản của bạn
            </p>
          </div>

          <form onSubmit={handleSubmit} className={styles.changeAvatarForm}>
            {/* Current Avatar */}
            <div className={styles.currentAvatarSection}>
              <h3 className={styles.sectionTitle}>Ảnh hiện tại</h3>
              <div className={styles.currentAvatarContainer}>
                <img 
                  src={user.avatar || `https://via.placeholder.com/150/4F46E5/FFFFFF?text=${user.full_name?.charAt(0)}`}
                  alt="Current Avatar" 
                  className={styles.currentAvatar}
                />
              </div>
            </div>

            {/* New Avatar Upload */}
            <div className={styles.newAvatarSection}>
              <h3 className={styles.sectionTitle}>Ảnh mới</h3>
              
              <div 
                className={`${styles.uploadArea} ${isDragOver ? styles.dragOver : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={openFileDialog}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className={styles.fileInput}
                />
                
                {previewUrl ? (
                  <div className={styles.previewContainer}>
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className={styles.previewImage}
                    />
                    <button
                      type="button"
                      className={styles.removeButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage();
                      }}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                ) : (
                  <div className={styles.uploadPlaceholder}>
                    <i className="fas fa-cloud-upload-alt"></i>
                    <p className={styles.uploadText}>
                      Kéo thả ảnh vào đây hoặc click để chọn
                    </p>
                    <p className={styles.uploadHint}>
                      Hỗ trợ: JPG, PNG, GIF (tối đa 5MB)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Avatar Guidelines */}
            <div className={styles.guidelinesSection}>
              <h4 className={styles.guidelinesTitle}>Hướng dẫn ảnh đại diện:</h4>
              <ul className={styles.guidelinesList}>
                <li className={styles.guideline}>
                  <i className="fas fa-check"></i>
                  Kích thước tối thiểu: 100x100px
                </li>
                <li className={styles.guideline}>
                  <i className="fas fa-check"></i>
                  Tỷ lệ khuyến nghị: 1:1 (vuông)
                </li>
                <li className={styles.guideline}>
                  <i className="fas fa-check"></i>
                  Định dạng: JPG, PNG, GIF
                </li>
                <li className={styles.guideline}>
                  <i className="fas fa-check"></i>
                  Kích thước file: Tối đa 5MB
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
                disabled={loading || !selectedFile}
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Đang cập nhật...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save"></i>
                    Cập nhật ảnh đại diện
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

export default ChangeAvatarPage;
