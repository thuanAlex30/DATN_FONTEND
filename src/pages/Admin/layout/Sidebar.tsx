import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../../store/slices/authSlice';
import { 
  Layout, 
  Menu, 
  Typography, 
  Button, 
  Space,
  Badge
} from 'antd';
import type { MenuProps } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  SafetyOutlined,
  BankOutlined,
  FileTextOutlined,
  ProjectOutlined,
  BookOutlined,
  SafetyCertificateOutlined,
  ExclamationCircleOutlined,
  LogoutOutlined,
  WifiOutlined
} from '@ant-design/icons';
import styles from './Sidebar.module.css'; 

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
        {
            key: 'project-management',
            label: 'Quản lý dự án',
            type: 'group',
            children: [
                {
                    key: '/admin/project-management',
                    icon: <ProjectOutlined />,
                    label: 'Dự án',
                },
            ],
        },
        {
            key: 'training-incident',
            label: 'Đào tạo & Sự cố',
            type: 'group',
            children: [
                {
                    key: '/admin/training-management',
                    icon: <BookOutlined />,
                    label: 'Quản lý đào tạo',
                },
                {
                    key: '/admin/certificate-management',
                    icon: <SafetyCertificateOutlined />,
                    label: 'Gói chứng chỉ',
                },
                {
                    key: '/admin/incident-management',
                    icon: <ExclamationCircleOutlined />,
                    label: 'Quản lý sự cố',
                },
            ],
        },
        {
            key: 'ppe-management',
            label: 'Thiết bị bảo hộ',
            type: 'group',
            children: [
                {
                    key: '/admin/ppe-management',
                    icon: <SafetyCertificateOutlined />,
                    label: 'Quản lý PPE',
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
                    defaultOpenKeys={['system-management', 'project-management', 'training-incident', 'ppe-management']}
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