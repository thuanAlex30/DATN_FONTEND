import React from 'react';
import { Layout } from 'antd';
import Sidebar from './Sidebar';
import Header from './Header';
import RealtimeNotifications from '../../../components/RealtimeNotifications';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store';

// Định nghĩa kiểu cho props, children là nội dung trang sẽ được render bên trong layout
type AdminLayoutProps = {
    children: React.ReactNode;
};

const { Content } = Layout;

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const { accessToken } = useSelector((state: RootState) => state.auth);
    
    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sidebar />
            <Layout style={{ marginLeft: 280 }}>
                <Header />
                <Content 
                    style={{ 
                        margin: 0,
                        padding: 0,
                        background: '#ffffff',
                        minHeight: 'calc(100vh - 64px)'
                    }}
                >
                    {children}
                </Content>
            </Layout>
            
            {/* Realtime Notifications for Admin */}
            <RealtimeNotifications authToken={accessToken} />
        </Layout>
    );
};

export default AdminLayout;