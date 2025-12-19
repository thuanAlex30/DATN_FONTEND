import React, { useMemo } from 'react';
import { Layout } from 'antd';
import Sidebar from './Sidebar';
import Header from './Header';

// Định nghĩa kiểu cho props, children là nội dung trang sẽ được render bên trong layout
type AdminLayoutProps = {
    children: React.ReactNode;
};

const { Content } = Layout;

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    // Memoize Header để tránh render lại không cần thiết
    const headerComponent = useMemo(() => <Header key="admin-header-unique" />, []);

    return (
        <Layout style={{ 
            minHeight: '100vh',
            background: '#ffffff',
            position: 'relative'
        }}>
            <div
                style={{
                    position: 'absolute',
                    left: 280,
                    top: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: `
                        radial-gradient(circle at 15% 25%, rgba(163, 230, 53, 0.15), transparent 55%),
                        radial-gradient(circle at 85% 20%, rgba(52, 211, 153, 0.2), transparent 60%),
                        radial-gradient(circle at 60% 80%, rgba(16, 185, 129, 0.15), transparent 55%),
                        linear-gradient(120deg, rgba(255, 255, 255, 0.9), rgba(240, 253, 244, 0.8))
                    `,
                    backgroundPosition: '15% 25%, 85% 20%, 60% 80%, center',
                    backgroundSize: 'auto, auto, auto, cover',
                    backgroundRepeat: 'no-repeat',
                    zIndex: 0,
                    pointerEvents: 'none'
                }}
            />
            <Sidebar />
            <Layout style={{ 
                marginLeft: 280, 
                marginRight: 0,
                position: 'relative', 
                zIndex: 1,
                width: 'calc(100% - 280px)',
                minWidth: 0
            }}>
                {headerComponent}
                <Content 
                    style={{ 
                        margin: 0,
                        padding: 0,
                        background: '#ffffff',
                        minHeight: 'calc(100vh - 64px)',
                        position: 'relative',
                        zIndex: 1,
                        width: '100%',
                        maxWidth: 'none'
                    }}
                >
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
};

export default AdminLayout;