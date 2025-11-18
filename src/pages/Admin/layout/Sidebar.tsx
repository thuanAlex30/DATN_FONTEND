import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../../store/slices/authSlice';
import { 
  Layout, 
  Menu, 
  Typography, 
  Button, 
  Space
} from 'antd';
import type { MenuProps } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  SafetyOutlined,
  BankOutlined,
  FileTextOutlined,
  LogoutOutlined
} from '@ant-design/icons'; 

const { Sider } = Layout;
const { Title, Text } = Typography;

const Sidebar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const menuItems: MenuProps['items'] = [
        {
            key: 'system-management',
            label: 'Quản lý hệ thống',
            type: 'group',
            children: [
                {
                    key: '/admin/dashboard',
                    icon: <DashboardOutlined />,
                    label: 'Dashboard',
                },
                {
                    key: '/admin/user-management',
                    icon: <UserOutlined />,
                    label: 'Quản lý người dùng',
                },
                {
                    key: '/admin/role-management',
                    icon: <SafetyOutlined />,
                    label: 'Vai trò & quyền hạn',
                },
                {
                    key: '/admin/department-position',
                    icon: <BankOutlined />,
                    label: 'Phòng ban & vị trí',
                },
                {
                    key: '/admin/system-logs',
                    icon: <FileTextOutlined />,
                    label: 'Nhật ký hệ thống',
                },
            ],
        },
    ];

    const handleMenuClick = ({ key }: { key: string }) => {
        navigate(key);
    };

    return (
        <Sider 
            width={280} 
            style={{
                background: '#fff',
                borderRight: '1px solid #f0f0f0',
                height: '100vh',
                position: 'fixed',
                left: 0,
                top: 0,
                zIndex: 1000,
                overflow: 'auto'
            }}
        >
            {/* Header */}
            <div style={{ 
                padding: '24px 16px 16px', 
                borderBottom: '1px solid #f0f0f0',
                textAlign: 'center'
            }}>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
                        <SafetyOutlined /> SafetyPro
                    </Title>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                        Administrator Dashboard
                    </Text>
                </Space>
            </div>

            {/* Navigation Menu */}
            <div style={{ padding: '16px 0' }}>
                <Menu
                    mode="inline"
                    items={menuItems}
                    onClick={handleMenuClick}
                    style={{ 
                        border: 'none',
                        background: 'transparent'
                    }}
                    defaultOpenKeys={['system-management']}
                />
            </div>

            {/* Footer with Logout */}
            <div style={{ 
                position: 'absolute', 
                bottom: 0, 
                left: 0, 
                right: 0, 
                padding: '16px',
                borderTop: '1px solid #f0f0f0',
                background: '#fff'
            }}>
                <Button 
                    type="text" 
                    danger
                    icon={<LogoutOutlined />}
                    onClick={handleLogout}
                    style={{ 
                        width: '100%',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-start'
                    }}
                >
                    Đăng xuất
                </Button>
            </div>
        </Sider>
    );
};

export default Sidebar;