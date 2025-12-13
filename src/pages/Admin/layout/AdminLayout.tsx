import React from 'react';
import { Layout } from 'antd';
import Sidebar from './Sidebar';
import Header from './Header';

// Định nghĩa kiểu cho props, children là nội dung trang sẽ được render bên trong layout
type AdminLayoutProps = {
    children: React.ReactNode;
};

const { Content } = Layout;

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
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
                        minHeight: 'calc(100vh - 64px)',
                        position: 'relative',
                        zIndex: 1
                    }}
                >
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
};

export default AdminLayout;