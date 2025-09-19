import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import './styles.css';

// Định nghĩa kiểu cho props, children là nội dung trang sẽ được render bên trong layout
type AdminLayoutProps = {
    children: React.ReactNode;
};

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    return (
        <div className="dashboard-container">
            <Sidebar />
            <main className="main-content">
                <Header />
                {children} {/* Đây là nơi nội dung của DashboardPage hoặc các trang khác sẽ hiển thị */}
            </main>
        </div>
    );
};

export default AdminLayout;