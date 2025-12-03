import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../../store/slices/authSlice';
import type { RootState } from '../../../store';
import { 
  Layout, 
  Menu, 
  Typography, 
  Button
} from 'antd';
import type { MenuProps } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  SafetyOutlined,
  BankOutlined,
  FileTextOutlined,
  LogoutOutlined,
  WifiOutlined,
  TeamOutlined,
  MessageOutlined
} from '@ant-design/icons';
import styles from './Sidebar.module.css'; 

const { Sider } = Layout;
const { Title, Text } = Typography;

const Sidebar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    // Check if user is system_admin
    const isSystemAdmin = user?.role?.role_code?.toLowerCase() === 'system_admin' || 
                          user?.role?.role_name?.toLowerCase() === 'system admin' ||
                          user?.role?.role_level === 100;

    // Menu items for system_admin - Dashboard, System Log, and Customer & Feedback
    const systemAdminMenuItems: MenuProps['items'] = [
        {
            key: 'system-management',
            label: 'Quản lý hệ thống',
            type: 'group',
            children: [
                {
                    key: '/system-admin/home',
                    icon: <DashboardOutlined />,
                    label: 'Dashboard',
                },
                {
                    key: '/admin/department-management',
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
        {
            key: 'customer-feedback',
            label: 'Khách hàng & phản hồi',
            type: 'group',
            children: [
                {
                    key: '/system-admin/customers',
                    icon: <TeamOutlined />,
                    label: 'Khách hàng tham gia',
                },
                {
                    key: '/system-admin/support-messages',
                    icon: <MessageOutlined />,
                    label: 'Tin nhắn hỗ trợ',
                },
            ],
        },
    ];

    // Menu items cho company_admin (và các admin không phải system_admin):
    // Chỉ giữ: Quản lý hệ thống, Dashboard, Quản lý người dùng, Vai trò & quyền hạn,
    // Phòng ban & vị trí, Nhật ký hệ thống
    const adminMenuItems: MenuProps['items'] = [
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
                    key: '/admin/department-management',
                    icon: <BankOutlined />,
                    label: 'Phòng ban & vị trí',
                },
                {
                    key: '/admin/role-management',
                    icon: <SafetyOutlined />,
                    label: 'Vai trò & quyền hạn',
                },
                {
                    key: '/admin/system-logs',
                    icon: <FileTextOutlined />,
                    label: 'Nhật ký hệ thống',
                },
            ],
        },
    ];

    const menuItems: MenuProps['items'] = isSystemAdmin ? systemAdminMenuItems : adminMenuItems;

    const handleMenuClick = ({ key }: { key: string }) => {
        navigate(key);
    };

    return (
        <Sider 
            width={280} 
            className={styles.sidebar}
        >
            {/* Header */}
            <div className={styles.sidebarHeader}>
                <div className={styles.logoContainer}>
                    <Title level={3} className={styles.logoTitle}>
                        <SafetyOutlined /> SafetyPro
                    </Title>
                    <Text className={styles.logoSubtitle}>
                        Administrator Dashboard
                    </Text>
                    <div className={styles.connectionStatus}>
                        <div className={styles.statusDot}></div>
                        <WifiOutlined style={{ fontSize: '10px' }} />
                        <span>Đã kết nối</span>
                    </div>
                </div>
            </div>

            {/* Navigation Menu */}
            <div className={styles.sidebarNav}>
                <Menu
                    mode="inline"
                    items={menuItems}
                    onClick={handleMenuClick}
                    className={styles.menu}
                    defaultOpenKeys={isSystemAdmin ? ['system-management', 'customer-feedback'] : ['system-management']}
                />
            </div>

            {/* Footer with Logout */}
            <div className={styles.sidebarFooter}>
                <Button 
                    type="primary"
                    danger
                    icon={<LogoutOutlined />}
                    onClick={handleLogout}
                    className={styles.logoutButton}
                    block
                >
                    Đăng xuất
                </Button>
            </div>
        </Sider>
    );
};

export default Sidebar;