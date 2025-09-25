import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../../store/slices/authSlice';
import type { RootState } from '../../../store';
import ProfileModal from '../../../components/ProfileModal/ProfileModal';

const Header = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);
    const { unreadCount } = useSelector((state: RootState) => state.websocket);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);

    const handleNotificationClick = () => {
        // Toggle notification panel - this will be handled by RealtimeNotifications component
        console.log('Notification clicked, unread count:', unreadCount);
    };

    const handleProfileClick = () => {
        setShowProfileMenu(!showProfileMenu);
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const handleProfileInfo = () => {
        setShowProfileModal(true);
        setShowProfileMenu(false);
    };

    const handleCloseProfileModal = () => {
        setShowProfileModal(false);
    };

    return (
        <div className="top-bar">
            <div className="welcome-message">
                <h1>Chào mừng, {user?.full_name || 'Admin'}!</h1>
                <p>Hôm nay là ngày tốt để đảm bảo an toàn lao động</p>
            </div>
            <div className="top-bar-actions">
                <div className="search-container">
                    <input type="text" placeholder="Tìm kiếm..." className="search-input" />
                    <i className="fas fa-search search-icon"></i>
                </div>
                <button className="notification-btn" onClick={handleNotificationClick}>
                    <i className="fas fa-bell"></i>
                    {unreadCount > 0 && (
                        <span className="notification-badge">{unreadCount}</span>
                    )}
                </button>
                <div className="profile-container">
                    <button className="profile-btn" onClick={handleProfileClick}>
                        <i className="fas fa-user-circle"></i>
                    </button>
                    {showProfileMenu && (
                        <div className="profile-menu">
                            <button className="profile-menu-item" onClick={handleProfileInfo}>
                                <i className="fas fa-user"></i>
                                Thông tin tài khoản
                            </button>
                            <button className="profile-menu-item logout-btn" onClick={handleLogout}>
                                <i className="fas fa-sign-out-alt"></i>
                                Đăng xuất
                            </button>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Profile Modal */}
            <ProfileModal 
                isOpen={showProfileModal} 
                onClose={handleCloseProfileModal} 
            />
        </div>
    );
};

export default Header;