import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { api } from '../../services/api';
import styles from './ProfileModal.module.css';

interface ProfileData {
    id: string;
    username: string;
    email: string;
    full_name: string;
    phone: string;
    role: {
        _id: string;
        role_name: string;
        description: string;
        permissions: Record<string, boolean>;
        is_active: boolean;
        created_at: string;
        updated_at: string;
    };
    is_active: boolean;
    last_login: string;
    created_at: string;
    updated_at: string;
}

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
    const { accessToken } = useSelector((state: RootState) => state.auth);
    const [profileData, setProfileData] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && accessToken) {
            fetchProfile();
        }
    }, [isOpen, accessToken]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    const fetchProfile = async () => {
        setLoading(true);
        setError(null);
        
        try {
            console.log('Fetching profile with token:', accessToken);
            const response = await api.get('/auth/profile');

            console.log('Response status:', response.status);
            
            if (response.data) {
                setProfileData(response.data);
                console.log('Profile data:', response.data);
            } else {
                throw new Error('No profile data received');
            }
        } catch (err) {
            console.error('Profile fetch error:', err);
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getRoleBadgeColor = (roleName: string) => {
        switch (roleName.toLowerCase()) {
            case 'admin':
                return styles.adminBadge;
            case 'manager':
                return styles.managerBadge;
            case 'user':
                return styles.userBadge;
            default:
                return styles.defaultBadge;
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>Thông tin tài khoản</h2>
                    <button className={styles.closeButton} onClick={onClose} title="Đóng (ESC)">
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <div className={styles.modalBody}>
                    {loading && (
                        <div className={styles.loadingContainer}>
                            <div className={styles.spinner}></div>
                            <p>Đang tải thông tin...</p>
                            <button className={styles.closeButton} onClick={onClose} style={{ marginTop: '1rem' }}>
                                Hủy
                            </button>
                        </div>
                    )}

                    {error && (
                        <div className={styles.errorContainer}>
                            <i className="fas fa-exclamation-triangle"></i>
                            <p>{error}</p>
                            <div className={styles.errorActions}>
                                <button className={styles.retryButton} onClick={fetchProfile}>
                                    Thử lại
                                </button>
                                <button className={styles.closeButton} onClick={onClose}>
                                    Đóng
                                </button>
                            </div>
                        </div>
                    )}

                    {!loading && !error && !profileData && (
                        <div className={styles.errorContainer}>
                            <i className="fas fa-info-circle"></i>
                            <p>Không có dữ liệu để hiển thị</p>
                            <button className={styles.retryButton} onClick={fetchProfile}>
                                Tải lại
                            </button>
                        </div>
                    )}

                    {profileData && !loading && !error && (
                        <div className={styles.profileContent}>
                            {/* Profile Header */}
                            <div className={styles.profileHeader}>
                                <div className={styles.avatar}>
                                    <i className="fas fa-user"></i>
                                </div>
                                <div className={styles.profileInfo}>
                                    <h3 className={styles.fullName}>{profileData.full_name}</h3>
                                    {profileData.role && (
                                        <div className={`${styles.roleBadge} ${getRoleBadgeColor(profileData.role.role_name)}`}>
                                            <i className="fas fa-crown"></i>
                                            {profileData.role.role_name.toUpperCase()}
                                        </div>
                                    )}
                                    <p className={styles.email}>{profileData.email}</p>
                                </div>
                            </div>

                            {/* Profile Details */}
                            <div className={styles.profileDetails}>
                                <div className={styles.detailSection}>
                                    <h4 className={styles.sectionTitle}>
                                        <i className="fas fa-info-circle"></i>
                                        Thông tin cơ bản
                                    </h4>
                                    <div className={styles.detailGrid}>
                                        <div className={styles.detailItem}>
                                            <label>Tên đăng nhập</label>
                                            <span>{profileData.username}</span>
                                        </div>
                                        <div className={styles.detailItem}>
                                            <label>Số điện thoại</label>
                                            <span>{profileData.phone || 'Chưa cập nhật'}</span>
                                        </div>
                                        <div className={styles.detailItem}>
                                            <label>Trạng thái</label>
                                            <span className={profileData.is_active ? styles.activeStatus : styles.inactiveStatus}>
                                                {profileData.is_active ? 'Hoạt động' : 'Không hoạt động'}
                                            </span>
                                        </div>
                                        <div className={styles.detailItem}>
                                            <label>Lần đăng nhập cuối</label>
                                            <span>{formatDate(profileData.last_login)}</span>
                                        </div>
                                    </div>
                                </div>

                                {profileData.role && profileData.role.permissions && (
                                    <div className={styles.detailSection}>
                                        <h4 className={styles.sectionTitle}>
                                            <i className="fas fa-shield-alt"></i>
                                            Quyền hạn
                                        </h4>
                                        <div className={styles.permissionsGrid}>
                                            {Object.entries(profileData.role.permissions).map(([permission, hasAccess]) => (
                                                <div key={permission} className={`${styles.permissionItem} ${hasAccess ? styles.hasPermission : styles.noPermission}`}>
                                                    <i className={`fas ${hasAccess ? 'fa-check' : 'fa-times'}`}></i>
                                                    <span>{permission}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className={styles.detailSection}>
                                    <h4 className={styles.sectionTitle}>
                                        <i className="fas fa-calendar"></i>
                                        Thông tin hệ thống
                                    </h4>
                                    <div className={styles.detailGrid}>
                                        <div className={styles.detailItem}>
                                            <label>Ngày tạo tài khoản</label>
                                            <span>{formatDate(profileData.created_at)}</span>
                                        </div>
                                        <div className={styles.detailItem}>
                                            <label>Cập nhật lần cuối</label>
                                            <span>{formatDate(profileData.updated_at)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className={styles.modalFooter}>
                    <button className={styles.closeModalButton} onClick={onClose}>
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileModal;
