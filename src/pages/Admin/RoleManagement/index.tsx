import React, { useState } from 'react';
import './RoleManagement.css';

interface Role {
    id: number;
    name: string;
    description: string;
    userCount: number;
    isActive: boolean;
    permissions: {
        [key: string]: string[];
    };
}

interface PermissionDefinition {
    title: string;
    icon: string;
    permissions: {
        [key: string]: {
            name: string;
            desc: string;
        };
    };
}

const UserManagementPage: React.FC = () => {
    const [roles, setRoles] = useState<Role[]>([
        {
            id: 1,
            name: "Admin",
            description: "Quản trị viên hệ thống với quyền truy cập đầy đủ",
            userCount: 2,
            isActive: true,
            permissions: {
                user_management: ['create_user', 'read_user', 'update_user', 'delete_user'],
                project_management: ['create_project', 'read_project', 'update_project', 'delete_project'],
                training_management: ['create_training', 'read_training', 'update_training', 'delete_training'],
                ppe_management: ['create_ppe', 'read_ppe', 'update_ppe', 'delete_ppe'],
                safety_management: ['create_incident', 'read_incident', 'update_incident', 'delete_incident'],
                system_management: ['view_logs', 'manage_settings', 'backup_restore']
            }
        },
        {
            id: 2,
            name: "Manager",
            description: "Quản lý dự án và nhân viên",
            userCount: 5,
            isActive: true,
            permissions: {
                user_management: ['read_user'],
                project_management: ['create_project', 'read_project', 'update_project'],
                training_management: ['read_training'],
                ppe_management: ['read_ppe', 'update_ppe'],
                safety_management: ['create_incident', 'read_incident', 'update_incident'],
                system_management: []
            }
        },
        {
            id: 3,
            name: "Employee",
            description: "Nhân viên thường",
            userCount: 45,
            isActive: true,
            permissions: {
                user_management: [],
                project_management: ['read_project'],
                training_management: ['read_training'],
                ppe_management: ['read_ppe'],
                safety_management: ['create_incident', 'read_incident'],
                system_management: []
            }
        },
        {
            id: 4,
            name: "Trainer",
            description: "Giảng viên đào tạo",
            userCount: 8,
            isActive: true,
            permissions: {
                user_management: ['read_user'],
                project_management: ['read_project'],
                training_management: ['create_training', 'read_training', 'update_training'],
                ppe_management: ['read_ppe'],
                safety_management: ['read_incident'],
                system_management: []
            }
        },
        {
            id: 5,
            name: "Safety Officer",
            description: "Chuyên viên an toàn lao động",
            userCount: 3,
            isActive: true,
            permissions: {
                user_management: ['read_user'],
                project_management: ['read_project'],
                training_management: ['read_training'],
                ppe_management: ['create_ppe', 'read_ppe', 'update_ppe'],
                safety_management: ['create_incident', 'read_incident', 'update_incident', 'delete_incident'],
                system_management: []
            }
        }
    ]);

    const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
    const [currentPermissions, setCurrentPermissions] = useState<{[key: string]: string[]}>({});
    const [isModalOpen, setIsModalOpen] = useState<string | null>(null);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });

    const permissionDefinitions: {[key: string]: PermissionDefinition} = {
        user_management: {
            title: "Quản lý người dùng",
            icon: "fas fa-users",
            permissions: {
                create_user: { name: "Tạo người dùng", desc: "Thêm người dùng mới vào hệ thống" },
                read_user: { name: "Xem người dùng", desc: "Xem thông tin người dùng" },
                update_user: { name: "Sửa người dùng", desc: "Chỉnh sửa thông tin người dùng" },
                delete_user: { name: "Xóa người dùng", desc: "Xóa người dùng khỏi hệ thống" }
            }
        },
        project_management: {
            title: "Quản lý dự án",
            icon: "fas fa-project-diagram",
            permissions: {
                create_project: { name: "Tạo dự án", desc: "Tạo dự án mới" },
                read_project: { name: "Xem dự án", desc: "Xem thông tin dự án" },
                update_project: { name: "Sửa dự án", desc: "Chỉnh sửa thông tin dự án" },
                delete_project: { name: "Xóa dự án", desc: "Xóa dự án khỏi hệ thống" }
            }
        },
        training_management: {
            title: "Quản lý đào tạo",
            icon: "fas fa-graduation-cap",
            permissions: {
                create_training: { name: "Tạo khóa đào tạo", desc: "Tạo khóa đào tạo mới" },
                read_training: { name: "Xem đào tạo", desc: "Xem thông tin đào tạo" },
                update_training: { name: "Sửa đào tạo", desc: "Chỉnh sửa khóa đào tạo" },
                delete_training: { name: "Xóa đào tạo", desc: "Xóa khóa đào tạo" }
            }
        },
        ppe_management: {
            title: "Quản lý PPE",
            icon: "fas fa-hard-hat",
            permissions: {
                create_ppe: { name: "Thêm PPE", desc: "Thêm thiết bị bảo hộ mới" },
                read_ppe: { name: "Xem PPE", desc: "Xem thông tin thiết bị bảo hộ" },
                update_ppe: { name: "Sửa PPE", desc: "Chỉnh sửa thông tin PPE" },
                delete_ppe: { name: "Xóa PPE", desc: "Xóa thiết bị bảo hộ" }
            }
        },
        safety_management: {
            title: "Quản lý an toàn",
            icon: "fas fa-shield-alt",
            permissions: {
                create_incident: { name: "Báo cáo sự cố", desc: "Tạo báo cáo sự cố mới" },
                read_incident: { name: "Xem sự cố", desc: "Xem thông tin sự cố" },
                update_incident: { name: "Sửa sự cố", desc: "Chỉnh sửa thông tin sự cố" },
                delete_incident: { name: "Xóa sự cố", desc: "Xóa báo cáo sự cố" }
            }
        },
        system_management: {
            title: "Quản lý hệ thống",
            icon: "fas fa-cogs",
            permissions: {
                view_logs: { name: "Xem nhật ký", desc: "Xem nhật ký hệ thống" },
                manage_settings: { name: "Cài đặt hệ thống", desc: "Quản lý cài đặt hệ thống" },
                backup_restore: { name: "Sao lưu & khôi phục", desc: "Thực hiện sao lưu và khôi phục" }
            }
        }
    };

    const selectRole = (roleId: number) => {
        setSelectedRoleId(roleId);
        const role = roles.find(r => r.id === roleId);
        if (role) {
            setCurrentPermissions(JSON.parse(JSON.stringify(role.permissions)));
        }
    };

    const togglePermission = (groupKey: string, permissionKey: string) => {
        setCurrentPermissions(prev => {
            const newPermissions = { ...prev };
            if (!newPermissions[groupKey]) {
                newPermissions[groupKey] = [];
            }

            const index = newPermissions[groupKey].indexOf(permissionKey);
            if (index > -1) {
                newPermissions[groupKey].splice(index, 1);
            } else {
                newPermissions[groupKey].push(permissionKey);
            }

            return newPermissions;
        });
    };

    const savePermissions = () => {
        if (!selectedRoleId) return;

        setRoles(prev => prev.map(role => 
            role.id === selectedRoleId 
                ? { ...role, permissions: JSON.parse(JSON.stringify(currentPermissions)) }
                : role
        ));
        alert('Đã lưu quyền hạn thành công!');
    };

    const openModal = (modalId: string) => {
        setIsModalOpen(modalId);
    };

    const closeModal = () => {
        setIsModalOpen(null);
        setEditingRole(null);
        setFormData({ name: '', description: '' });
    };

    const editRole = (roleId: number) => {
        const role = roles.find(r => r.id === roleId);
        if (role) {
            setEditingRole(role);
            setFormData({
                name: role.name,
                description: role.description
            });
            openModal('addRoleModal');
        }
    };

    const deleteRole = (roleId: number) => {
        const role = roles.find(r => r.id === roleId);
        if (role && window.confirm(`Bạn có chắc chắn muốn xóa vai trò "${role.name}"?`)) {
            setRoles(prev => prev.filter(r => r.id !== roleId));
            if (selectedRoleId === roleId) {
                setSelectedRoleId(null);
            }
            alert('Đã xóa vai trò thành công!');
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (editingRole) {
            // Update existing role
            setRoles(prev => prev.map(role => 
                role.id === editingRole.id 
                    ? { ...role, name: formData.name, description: formData.description }
                    : role
            ));
            alert('Đã cập nhật vai trò thành công!');
        } else {
            // Add new role
            const newRole: Role = {
                id: Math.max(...roles.map(r => r.id)) + 1,
                name: formData.name,
                description: formData.description,
                userCount: 0,
                isActive: true,
                permissions: {
                    user_management: [],
                    project_management: [],
                    training_management: [],
                    ppe_management: [],
                    safety_management: [],
                    system_management: []
                }
            };
            setRoles(prev => [...prev, newRole]);
            alert('Đã tạo vai trò mới thành công!');
        }
        
        closeModal();
    };

    const selectedRole = roles.find(r => r.id === selectedRoleId);

    return (
        <div className="role-management-container">
                {/* Header */}
                <div className="header">
                    <div>
                        <h1><i className="fas fa-user-shield"></i> Quản lý vai trò & quyền hạn</h1>
                        <div className="breadcrumb">
                            <a href="/admin/dashboard">Dashboard</a> / Vai trò & quyền hạn
                        </div>
                    </div>
                    <a href="/admin/dashboard" className="btn btn-secondary">
                        <i className="fas fa-arrow-left"></i> Quay lại
                    </a>
                </div>

                <div className="main-grid">
                    {/* Role List */}
                    <div className="role-list-section">
                        <div className="section-header">
                            <h3 className="section-title">Danh sách vai trò</h3>
                            <button className="btn btn-primary btn-sm" onClick={() => openModal('addRoleModal')}>
                                <i className="fas fa-plus"></i> Thêm vai trò
                            </button>
                        </div>
                        
                        <div className="role-list">
                            {roles.map(role => (
                                <div 
                                    key={role.id}
                                    className={`role-item ${selectedRoleId === role.id ? 'active' : ''}`}
                                    onClick={() => selectRole(role.id)}
                                >
                                    <div className="role-header">
                                        <div className="role-name">{role.name}</div>
                                        <span className={`role-badge role-${role.name.toLowerCase()}`}>
                                            {role.name}
                                        </span>
                                    </div>
                                    <div className="role-description">{role.description}</div>
                                    <div className="role-stats">
                                        <span><i className="fas fa-users"></i> {role.userCount} người dùng</span>
                                        <span><i className="fas fa-check-circle"></i> {role.isActive ? 'Hoạt động' : 'Không hoạt động'}</span>
                                    </div>
                                    <div className="role-actions">
                                        <button 
                                            className="btn btn-warning btn-sm" 
                                            onClick={(e) => { e.stopPropagation(); editRole(role.id); }}
                                        >
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <button 
                                            className="btn btn-danger btn-sm" 
                                            onClick={(e) => { e.stopPropagation(); deleteRole(role.id); }}
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Permission Management */}
                    <div className="permission-section">
                        <div className="section-header">
                            <h3 className="section-title">
                                {selectedRole ? `Quyền hạn của vai trò: ${selectedRole.name}` : 'Chọn vai trò để quản lý quyền hạn'}
                            </h3>
                            <div>
                                {selectedRoleId && (
                                    <button className="btn btn-success btn-sm" onClick={savePermissions}>
                                        <i className="fas fa-save"></i> Lưu thay đổi
                                    </button>
                                )}
                            </div>
                        </div>
                        
                        <div className="permission-content">
                            {!selectedRoleId ? (
                                <div className="empty-state">
                                    <i className="fas fa-shield-alt"></i>
                                    <p>Vui lòng chọn một vai trò để quản lý quyền hạn</p>
                                </div>
                            ) : (
                                <div className="permission-groups">
                                    {Object.entries(permissionDefinitions).map(([groupKey, group]) => (
                                        <div key={groupKey} className="permission-group">
                                            <div className="permission-group-header">
                                                <div className="group-title">
                                                    <i className={group.icon}></i>
                                                    {group.title}
                                                </div>
                                            </div>
                                            <div className="permission-list">
                                                {Object.entries(group.permissions).map(([permKey, perm]) => (
                                                    <div key={permKey} className="permission-item">
                                                        <div className="permission-info">
                                                            <div className="permission-name">{perm.name}</div>
                                                            <div className="permission-desc">{perm.desc}</div>
                                                        </div>
                                                        <div 
                                                            className={`permission-toggle ${currentPermissions[groupKey]?.includes(permKey) ? 'active' : ''}`}
                                                            onClick={() => togglePermission(groupKey, permKey)}
                                                        ></div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Add/Edit Role Modal */}
                {isModalOpen === 'addRoleModal' && (
                    <div className="modal active" onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h2 className="modal-title">
                                    {editingRole ? 'Chỉnh sửa vai trò' : 'Thêm vai trò mới'}
                                </h2>
                                <span className="close-modal" onClick={closeModal}>&times;</span>
                            </div>
                            
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label className="form-label">Tên vai trò *</label>
                                    <input 
                                        type="text" 
                                        className="form-input" 
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        required 
                                        placeholder="Nhập tên vai trò"
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label className="form-label">Mô tả</label>
                                    <textarea 
                                        className="form-input" 
                                        value={formData.description}
                                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        rows={3} 
                                        placeholder="Mô tả vai trò này"
                                    />
                                </div>
                                
                                <div className="form-actions">
                                    <button type="button" className="btn btn-secondary" onClick={closeModal}>
                                        Hủy
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        <i className="fas fa-save"></i> {editingRole ? 'Cập nhật' : 'Tạo vai trò'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
    );
};

export default UserManagementPage;
