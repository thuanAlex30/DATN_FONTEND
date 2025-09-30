import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Layout, 
  Typography, 
  Input, 
  Button, 
  Space, 
  Dropdown, 
  Badge, 
  Avatar
} from 'antd';
import type { MenuProps } from 'antd';
import { 
  SearchOutlined, 
  BellOutlined, 
  UserOutlined, 
  LogoutOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { logout } from '../../../store/slices/authSlice';
import type { RootState } from '../../../store';
import ProfileModal from '../../../components/ProfileModal/ProfileModal';

const { Header: AntHeader } = Layout;
const { Title, Text } = Typography;
const { Search } = Input;

const Header = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);
    const { unreadCount } = useSelector((state: RootState) => state.websocket);
    const [showProfileModal, setShowProfileModal] = useState(false);

    const handleNotificationClick = () => {
        // Toggle notification panel - this will be handled by RealtimeNotifications component
        console.log('Notification clicked, unread count:', unreadCount);
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const handleProfileInfo = () => {
        setShowProfileModal(true);
    };

    const handleCloseProfileModal = () => {
        setShowProfileModal(false);
    };

    const profileMenuItems: MenuProps['items'] = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: 'Thông tin tài khoản',
            onClick: handleProfileInfo,
        },
        {
            key: 'settings',
            icon: <SettingOutlined />,
            label: 'Cài đặt',
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Đăng xuất',
            onClick: handleLogout,
            danger: true,
        },
    ];

    return (
        <AntHeader 
            style={{
                background: 'rgba(255, 255, 255, 0.95)',
                padding: '1.5rem 2rem',
                margin: '0',
                borderRadius: '0',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'relative',
                zIndex: 10000,
            }}
        >
            <div>
                <Title level={2} style={{ margin: 0, color: '#2c3e50', fontSize: '1.8rem' }}>
                    Chào mừng, {user?.full_name || 'Admin'}!
                </Title>
                <Text style={{ color: '#666', fontSize: '0.95rem' }}>
                    Hôm nay là ngày tốt để đảm bảo an toàn lao động
                </Text>
            </div>
            
            <Space size="middle" align="center">
                <Search
                    placeholder="Tìm kiếm..."
                    style={{ width: 220 }}
                    prefix={<SearchOutlined style={{ color: '#6c5ce7' }} />}
                />
                
                <Badge count={unreadCount} size="small">
                    <Button
                        type="text"
                        icon={<BellOutlined />}
                        onClick={handleNotificationClick}
                        style={{
                            padding: '0.8rem',
                            borderRadius: '12px',
                            background: 'rgba(108, 92, 231, 0.1)',
                            color: '#6c5ce7',
                            border: 'none',
                        }}
                    />
                </Badge>
                
                <Dropdown
                    menu={{ items: profileMenuItems }}
                    placement="bottomRight"
                    trigger={['click']}
                >
                    <Button
                        type="text"
                        style={{
                            padding: '0.8rem',
                            borderRadius: '12px',
                            background: 'rgba(108, 92, 231, 0.1)',
                            color: '#6c5ce7',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                        }}
                    >
                        <Avatar 
                            icon={<UserOutlined />} 
                            size="small"
                            style={{ background: '#6c5ce7' }}
                        />
                    </Button>
                </Dropdown>
            </Space>
            
            {/* Profile Modal */}
            <ProfileModal 
                isOpen={showProfileModal} 
                onClose={handleCloseProfileModal} 
            />
        </AntHeader>
    );
};

export default Header;