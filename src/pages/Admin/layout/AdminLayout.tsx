import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import RealtimeNotifications from '../../../components/RealtimeNotifications';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store';
import './styles.css';

// Định nghĩa kiểu cho props, children là nội dung trang sẽ được render bên trong layout
type AdminLayoutProps = {
    children: React.ReactNode;
};

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const { accessToken } = useSelector((state: RootState) => state.auth);
    
    return (
        <div className="dashboard-container">
            <Sidebar />
            <main className="main-content">
                <Header />
                {children} {/* Đây là nơi nội dung của DashboardPage hoặc các trang khác sẽ hiển thị */}
            </main>
            
            {/* Realtime Notifications for Admin */}
            <RealtimeNotifications authToken={accessToken} />
        </div>
    );
};

export default AdminLayout;