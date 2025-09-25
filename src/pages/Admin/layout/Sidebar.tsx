import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../../store/slices/authSlice'; 

const Sidebar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <h2><i className="fas fa-shield-alt"></i> SafetyPro</h2>
                <div className="role">Administrator Dashboard</div>
            </div>

            <nav className="sidebar-nav">
                <div className="nav-section">
                    <div className="nav-section-title">Quản lý hệ thống</div>
                    <NavLink to="/admin/dashboard" className="nav-item">
                        <i className="fas fa-tachometer-alt"></i>
                        <span>Dashboard</span>
                    </NavLink>
                    <NavLink to="/admin/user-management" className="nav-item">
                        <i className="fas fa-users"></i>
                        <span>Quản lý người dùng</span>
                    </NavLink>

                    <NavLink to="/admin/role-management" className="nav-item">
                        <i className="fas fa-user-shield"></i>
                        <span>Vai trò & quyền hạn</span>
                    </NavLink>
                    <NavLink to="/admin/department-position" className="nav-item">
                        <i className="fas fa-building"></i>
                        <span>Phòng ban & vị trí</span>
                    </NavLink>
                    <NavLink to="/admin/system-logs" className="nav-item">
                        <i className="fas fa-file-alt"></i>
                        <span>Nhật ký hệ thống</span>
                    </NavLink>
                </div>

                <div className="nav-section">
                    <div className="nav-section-title">Quản lý dự án</div>
                    <NavLink to="/admin/project-management" className="nav-item">
                        <i className="fas fa-project-diagram"></i>
                        <span>Dự án</span>
                    </NavLink>
                </div>

                <div className="nav-section">
                    <div className="nav-section-title">Đào tạo & Sự cố</div>
                    <NavLink to="/admin/training-management" className="nav-item">
                        <i className="fas fa-graduation-cap"></i>
                        <span>Quản lý đào tạo</span>
                    </NavLink>
                    <NavLink to="/admin/certificate-management" className="nav-item">
                        <i className="fas fa-certificate"></i>
                        <span>Gói chứng chỉ</span>
                    </NavLink>
                    <NavLink to="/admin/incident-management" className="nav-item">
                        <i className="fas fa-exclamation-triangle"></i>
                        <span>Quản lý sự cố</span>
                    </NavLink>
                </div>

                <div className="nav-section">
                    <div className="nav-section-title">Thiết bị bảo hộ</div>
                    <NavLink to="/admin/ppe-management" className="nav-item">
                        <i className="fas fa-hard-hat"></i>
                        <span>Quản lý PPE</span>
                    </NavLink>
                </div>
            </nav>

            {/* Logout Section */}
            <div className="sidebar-footer">
                <button onClick={handleLogout} className="logout-btn">
                    <i className="fas fa-sign-out-alt"></i>
                    <span>Đăng xuất</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;