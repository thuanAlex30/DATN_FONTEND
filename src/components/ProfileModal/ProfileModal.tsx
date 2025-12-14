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
    department?: {
        id?: string;
        _id?: string;
        department_name?: string;
        name?: string;
        description?: string;
        is_active?: boolean;
        created_at?: string;
        updated_at?: string;
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
    const { token } = useSelector((state: RootState) => state.auth);
    const [profileData, setProfileData] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && token) {
            fetchProfile();
        }
    }, [isOpen, token]);

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
            console.log('Fetching profile with token:', token);
            const response = await api.get('/auth/profile');

            console.log('Response status:', response.status);
            console.log('Response data:', response.data);
            
            // Handle different response structures
            // Structure 1: response.data.data.data (nested ApiResponse)
            // Structure 2: response.data.data (direct data)
            // Structure 3: response.data (direct)
            let profileData = null;
            
            if (response.data?.data?.data) {
                // Nested structure: ApiResponse wraps createResponse
                profileData = response.data.data.data;
            } else if (response.data?.data) {
                // Direct data structure
                profileData = response.data.data;
            } else if (response.data) {
                // Direct response
                profileData = response.data;
            }
            
            if (profileData) {
                setProfileData(profileData);
                console.log('Profile data set:', profileData);
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

    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return 'Chưa có dữ liệu';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Invalid Date';
            return date.toLocaleString('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Invalid Date';
        }
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

    const getInitials = (name: string) => {
        if (!name) return 'U';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name[0].toUpperCase();
    };

    const formatPermissionName = (permission: string) => {
        return permission
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (l) => l.toUpperCase());
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
                                <div className={styles.avatarContainer}>
                                    <div className={styles.avatar}>
                                        <span className={styles.avatarInitials}>
                                            {getInitials(profileData.full_name)}
                                        </span>
                                    </div>
                                    <div className={styles.statusIndicator}>
                                        <span className={`${styles.statusDot} ${profileData.is_active ? styles.active : styles.inactive}`}></span>
                                    </div>
                                </div>
                                <div className={styles.profileInfo}>
                                    <h3 className={styles.fullName}>{profileData.full_name || 'Chưa cập nhật'}</h3>
                                    <div className={styles.badgesContainer}>
                                        {profileData.role && (
                                            <div className={`${styles.roleBadge} ${getRoleBadgeColor(profileData.role.role_name)}`}>
                                                <i className="fas fa-user-shield"></i>
                                                <span>{profileData.role.role_name}</span>
                                            </div>
                                        )}
                                        {profileData.department && (
                                            <div className={styles.departmentBadge}>
                                                <i className="fas fa-building"></i>
                                                <span>{profileData.department.department_name || profileData.department.name}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className={styles.contactInfo}>
                                        <div className={styles.contactItem}>
                                            <i className="fas fa-envelope"></i>
                                            <span>{profileData.email}</span>
                                        </div>
                                        {profileData.phone && (
                                            <div className={styles.contactItem}>
                                                <i className="fas fa-phone"></i>
                                                <span>{profileData.phone}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Profile Details */}
                            <div className={styles.profileDetails}>
                                <div className={styles.detailSection}>
                                    <h4 className={styles.sectionTitle}>
                                        <i className="fas fa-info-circle"></i>
                                        <span>Thông tin cơ bản</span>
                                    </h4>
                                    <div className={styles.detailGrid}>
                                        <div className={styles.detailItem}>
                                            <div className={styles.detailIcon}>
                                                <i className="fas fa-user"></i>
                                            </div>
                                            <div className={styles.detailContent}>
                                                <label>Tên đăng nhập</label>
                                                <span>{profileData.username}</span>
                                            </div>
                                        </div>
                                        <div className={styles.detailItem}>
                                            <div className={styles.detailIcon}>
                                                <i className="fas fa-phone"></i>
                                            </div>
                                            <div className={styles.detailContent}>
                                                <label>Số điện thoại</label>
                                                <span>{profileData.phone || 'Chưa cập nhật'}</span>
                                            </div>
                                        </div>
                                        <div className={styles.detailItem}>
                                            <div className={styles.detailIcon}>
                                                <i className="fas fa-toggle-on"></i>
                                            </div>
                                            <div className={styles.detailContent}>
                                                <label>Trạng thái</label>
                                                <span className={`${styles.statusBadge} ${profileData.is_active ? styles.activeStatus : styles.inactiveStatus}`}>
                                                    <span className={styles.statusDotSmall}></span>
                                                    {profileData.is_active ? 'Hoạt động' : 'Không hoạt động'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className={styles.detailItem}>
                                            <div className={styles.detailIcon}>
                                                <i className="fas fa-clock"></i>
                                            </div>
                                            <div className={styles.detailContent}>
                                                <label>Lần đăng nhập cuối</label>
                                                <span>{formatDate(profileData.last_login)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {profileData.role && profileData.role.permissions && (
                                    <div className={styles.detailSection}>
                                        <h4 className={styles.sectionTitle}>
                                            <i className="fas fa-shield-alt"></i>
                                            <span>Quyền hạn</span>
                                        </h4>
                                        <div className={styles.permissionsGrid}>
                                            {Object.entries(profileData.role.permissions).map(([permission, hasAccess]) => (
                                                <div key={permission} className={`${styles.permissionItem} ${hasAccess ? styles.hasPermission : styles.noPermission}`}>
                                                    <div className={styles.permissionIcon}>
                                                        <i className={`fas ${hasAccess ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
                                                    </div>
                                                    <span className={styles.permissionName}>{formatPermissionName(permission)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className={styles.detailSection}>
                                    <h4 className={styles.sectionTitle}>
                                        <i className="fas fa-calendar-alt"></i>
                                        <span>Thông tin hệ thống</span>
                                    </h4>
                                    <div className={styles.detailGrid}>
                                        <div className={styles.detailItem}>
                                            <div className={styles.detailIcon}>
                                                <i className="fas fa-calendar-plus"></i>
                                            </div>
                                            <div className={styles.detailContent}>
                                                <label>Ngày tạo tài khoản</label>
                                                <span>{formatDate(profileData.created_at)}</span>
                                            </div>
                                        </div>
                                        <div className={styles.detailItem}>
                                            <div className={styles.detailIcon}>
                                                <i className="fas fa-edit"></i>
                                            </div>
                                            <div className={styles.detailContent}>
                                                <label>Cập nhật lần cuối</label>
                                                <span>{formatDate(profileData.updated_at)}</span>
                                            </div>
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
