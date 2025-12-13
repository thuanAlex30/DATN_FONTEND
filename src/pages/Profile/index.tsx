import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Card, Descriptions, Tag, Spin, Alert, Button, Space, Typography, Divider } from 'antd';
import { 
  UserOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  CalendarOutlined,
  HomeOutlined,
  SafetyOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import type { RootState } from '../../store';
import { api } from '../../services/api';
import styles from './Profile.module.css';

const { Title, Text } = Typography;

interface ProfileData {
  id: string;
  username: string;
  email: string;
  full_name: string;
  phone?: string;
  birth_date?: string;
  address?: string;
  role?: {
    _id: string;
    role_name: string;
    role_code?: string;
    role_level?: number;
    description?: string;
    scope_rules?: {
      tenant_scope?: 'global' | 'tenant' | 'self';
      department_scope?: 'all' | 'hierarchy' | 'own' | 'none';
      data_scope?: 'full' | 'department' | 'self';
      can_assign_lower_roles?: boolean;
    };
    permissions?: Record<string, boolean>;
    is_active?: boolean;
  };
  department?: {
    _id: string;
    department_name: string;
    is_active: boolean;
  };
  position?: {
    _id: string;
    position_name: string;
    level: number;
    is_active: boolean;
  };
  tenant_id?: string;
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

const ProfilePage: React.FC = () => {
  const { user: currentUser, token } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      fetchProfile();
    } else {
      setError('Không có token xác thực');
      setLoading(false);
    }
  }, [token]);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get('/auth/profile');
      
      if (response.data) {
        setProfileData(response.data);
      } else {
        throw new Error('No profile data received');
      }
    } catch (err: any) {
      console.error('Profile fetch error:', err);
      setError(err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi tải thông tin');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Chưa có thông tin';
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateOnly = (dateString?: string) => {
    if (!dateString) return 'Chưa có thông tin';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getRoleBadgeColor = (roleName?: string) => {
    if (!roleName) return 'default';
    const role = roleName.toLowerCase();
    if (role.includes('admin') || role.includes('quản trị')) return 'purple';
    if (role.includes('manager') || role.includes('quản lý')) return 'blue';
    if (role.includes('header') || role.includes('trưởng')) return 'cyan';
    if (role.includes('employee') || role.includes('nhân viên')) return 'green';
    return 'default';
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <Spin size="large" />
          <Text type="secondary" style={{ marginTop: 16, display: 'block' }}>
            Đang tải thông tin tài khoản...
          </Text>
        </div>
      </div>
    );
  }

  if (error && !profileData) {
    return (
      <div className={styles.container}>
        <Alert
          message="Lỗi"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" onClick={fetchProfile}>
              Thử lại
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          className={styles.backButton}
        >
          Quay lại
        </Button>
        <Title level={2} className={styles.pageTitle}>
          <UserOutlined /> Thông tin tài khoản
        </Title>
      </div>

      {profileData && (
        <div className={styles.content}>
          {/* Profile Header Card */}
          <Card className={styles.profileHeaderCard}>
            <div className={styles.profileHeader}>
              <div className={styles.avatarSection}>
                <div className={styles.avatar}>
                  <UserOutlined style={{ fontSize: 48, color: '#6c5ce7' }} />
                </div>
                <Tag 
                  color={profileData.is_active ? 'success' : 'error'}
                  className={styles.statusTag}
                >
                  {profileData.is_active ? (
                    <>
                      <CheckCircleOutlined /> Hoạt động
                    </>
                  ) : (
                    <>
                      <CloseCircleOutlined /> Không hoạt động
                    </>
                  )}
                </Tag>
              </div>
              <div className={styles.profileInfo}>
                <Title level={3} className={styles.fullName}>
                  {profileData.full_name}
                </Title>
                {profileData.role && (
                  <Tag color={getRoleBadgeColor(profileData.role.role_name)} className={styles.roleTag}>
                    <SafetyOutlined /> {profileData.role.role_name}
                  </Tag>
                )}
                <Space direction="vertical" size="small" style={{ marginTop: 16 }}>
                  <Text>
                    <MailOutlined /> {profileData.email}
                  </Text>
                  {profileData.username && (
                    <Text type="secondary">
                      <UserOutlined /> Tên đăng nhập: {profileData.username}
                    </Text>
                  )}
                </Space>
              </div>
            </div>
          </Card>

          {/* Basic Information */}
          <Card 
            title={
              <span>
                <UserOutlined /> Thông tin cơ bản
              </span>
            }
            className={styles.infoCard}
          >
            <Descriptions column={{ xs: 1, sm: 2, md: 2, lg: 2 }} bordered>
              <Descriptions.Item label="Họ và tên">
                {profileData.full_name}
              </Descriptions.Item>
              <Descriptions.Item label="Tên đăng nhập">
                {profileData.username}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                <MailOutlined /> {profileData.email}
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                {profileData.phone ? (
                  <>
                    <PhoneOutlined /> {profileData.phone}
                  </>
                ) : (
                  <Text type="secondary">Chưa cập nhật</Text>
                )}
              </Descriptions.Item>
              {profileData.birth_date && (
                <Descriptions.Item label="Ngày sinh">
                  <CalendarOutlined /> {formatDateOnly(profileData.birth_date)}
                </Descriptions.Item>
              )}
              {profileData.address && (
                <Descriptions.Item label="Địa chỉ" span={2}>
                  <HomeOutlined /> {profileData.address}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>

          {/* Role and Department Information */}
          <Card 
            title={
              <span>
                <TeamOutlined /> Thông tin công việc
              </span>
            }
            className={styles.infoCard}
          >
            <Descriptions column={{ xs: 1, sm: 2, md: 2, lg: 2 }} bordered>
              {profileData.role && (
                <>
                  <Descriptions.Item label="Vai trò">
                    <Tag color={getRoleBadgeColor(profileData.role.role_name)}>
                      {profileData.role.role_name}
                    </Tag>
                  </Descriptions.Item>
                  {profileData.role.role_code && (
                    <Descriptions.Item label="Mã vai trò">
                      {profileData.role.role_code}
                    </Descriptions.Item>
                  )}
                  {profileData.role.role_level !== undefined && (
                    <Descriptions.Item label="Cấp độ vai trò">
                      {profileData.role.role_level}
                    </Descriptions.Item>
                  )}
                  {profileData.role.description && (
                    <Descriptions.Item label="Mô tả vai trò" span={2}>
                      {profileData.role.description}
                    </Descriptions.Item>
                  )}
                </>
              )}
              {profileData.department && (
                <Descriptions.Item label="Phòng ban">
                  <Tag color="blue">
                    <TeamOutlined /> {profileData.department.department_name}
                  </Tag>
                </Descriptions.Item>
              )}
              {profileData.position && (
                <Descriptions.Item label="Chức vụ">
                  <Tag color="cyan">
                    {profileData.position.position_name} (Cấp {profileData.position.level})
                  </Tag>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>

          {/* Permissions */}
          {profileData.role && profileData.role.permissions && Object.keys(profileData.role.permissions).length > 0 && (
            <Card 
              title={
                <span>
                  <SafetyOutlined /> Quyền hạn
                </span>
              }
              className={styles.infoCard}
            >
              <div className={styles.permissionsGrid}>
                {Object.entries(profileData.role.permissions).map(([permission, hasAccess]) => (
                  <Tag
                    key={permission}
                    color={hasAccess ? 'success' : 'default'}
                    className={styles.permissionTag}
                  >
                    {hasAccess ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                    {' '}
                    {permission}
                  </Tag>
                ))}
              </div>
            </Card>
          )}

          {/* Scope Rules */}
          {profileData.role && profileData.role.scope_rules && (
            <Card 
              title={
                <span>
                  <SafetyOutlined /> Quy tắc phạm vi
                </span>
              }
              className={styles.infoCard}
            >
              <Descriptions column={{ xs: 1, sm: 2, md: 2, lg: 2 }} bordered>
                {profileData.role.scope_rules.tenant_scope && (
                  <Descriptions.Item label="Phạm vi Tenant">
                    <Tag>{profileData.role.scope_rules.tenant_scope}</Tag>
                  </Descriptions.Item>
                )}
                {profileData.role.scope_rules.department_scope && (
                  <Descriptions.Item label="Phạm vi Phòng ban">
                    <Tag>{profileData.role.scope_rules.department_scope}</Tag>
                  </Descriptions.Item>
                )}
                {profileData.role.scope_rules.data_scope && (
                  <Descriptions.Item label="Phạm vi Dữ liệu">
                    <Tag>{profileData.role.scope_rules.data_scope}</Tag>
                  </Descriptions.Item>
                )}
                {profileData.role.scope_rules.can_assign_lower_roles !== undefined && (
                  <Descriptions.Item label="Có thể phân công vai trò thấp hơn">
                    <Tag color={profileData.role.scope_rules.can_assign_lower_roles ? 'success' : 'default'}>
                      {profileData.role.scope_rules.can_assign_lower_roles ? 'Có' : 'Không'}
                    </Tag>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>
          )}

          {/* System Information */}
          <Card 
            title={
              <span>
                <ClockCircleOutlined /> Thông tin hệ thống
              </span>
            }
            className={styles.infoCard}
          >
            <Descriptions column={{ xs: 1, sm: 2, md: 2, lg: 2 }} bordered>
              <Descriptions.Item label="Trạng thái tài khoản">
                <Tag color={profileData.is_active ? 'success' : 'error'}>
                  {profileData.is_active ? (
                    <>
                      <CheckCircleOutlined /> Hoạt động
                    </>
                  ) : (
                    <>
                      <CloseCircleOutlined /> Không hoạt động
                    </>
                  )}
                </Tag>
              </Descriptions.Item>
              {profileData.last_login && (
                <Descriptions.Item label="Lần đăng nhập cuối">
                  <ClockCircleOutlined /> {formatDate(profileData.last_login)}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Ngày tạo tài khoản">
                <CalendarOutlined /> {formatDate(profileData.created_at)}
              </Descriptions.Item>
              <Descriptions.Item label="Cập nhật lần cuối">
                <CalendarOutlined /> {formatDate(profileData.updated_at)}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;

