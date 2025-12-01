import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Space, Table, Tag, Avatar, Row, Col, Statistic, Input, Select, Modal, Form, message, Popconfirm, Checkbox, Divider } from 'antd';
import { SafetyOutlined, PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, FilterOutlined, UserOutlined, KeyOutlined } from '@ant-design/icons';
import RoleService from '../../../services/roleService';
import type { Role, PermissionGroup } from '../../../types/role';

const RoleManagementPage: React.FC = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
    const [currentPermissions, setCurrentPermissions] = useState<Record<string, boolean>>({});
    const [isModalOpen, setIsModalOpen] = useState<string | null>(null);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        role_name: '',
        description: ''
    });

    const permissionDefinitions: PermissionGroup = {
        user: {
            title: "Quản lý người dùng",
            icon: "fas fa-users",
            permissions: {
                "user:create": { name: "Tạo người dùng", desc: "Thêm người dùng mới vào hệ thống" },
                "user:read": { name: "Xem người dùng", desc: "Xem thông tin người dùng" },
                "user:update": { name: "Sửa người dùng", desc: "Chỉnh sửa thông tin người dùng" },
                "user:delete": { name: "Xóa người dùng", desc: "Xóa người dùng khỏi hệ thống" },
                "user:list": { name: "Danh sách người dùng", desc: "Xem danh sách tất cả người dùng" }
            }
        },
        role: {
            title: "Quản lý vai trò",
            icon: "fas fa-user-shield",
            permissions: {
                "role:create": { name: "Tạo vai trò", desc: "Tạo vai trò mới" },
                "role:read": { name: "Xem vai trò", desc: "Xem thông tin vai trò" },
                "role:update": { name: "Sửa vai trò", desc: "Chỉnh sửa thông tin vai trò" },
                "role:delete": { name: "Xóa vai trò", desc: "Xóa vai trò khỏi hệ thống" },
                "role:list": { name: "Danh sách vai trò", desc: "Xem danh sách tất cả vai trò" }
            }
        },
        department: {
            title: "Quản lý phòng ban",
            icon: "fas fa-building",
            permissions: {
                "department:create": { name: "Tạo phòng ban", desc: "Tạo phòng ban mới" },
                "department:read": { name: "Xem phòng ban", desc: "Xem thông tin phòng ban" },
                "department:update": { name: "Sửa phòng ban", desc: "Chỉnh sửa thông tin phòng ban" },
                "department:delete": { name: "Xóa phòng ban", desc: "Xóa phòng ban khỏi hệ thống" },
                "department:list": { name: "Danh sách phòng ban", desc: "Xem danh sách tất cả phòng ban" }
            }
        },
        safety_report: {
            title: "Quản lý báo cáo an toàn",
            icon: "fas fa-shield-alt",
            permissions: {
                "safety_report:create": { name: "Tạo báo cáo", desc: "Tạo báo cáo sự cố mới" },
                "safety_report:read": { name: "Xem báo cáo", desc: "Xem thông tin báo cáo" },
                "safety_report:update": { name: "Sửa báo cáo", desc: "Chỉnh sửa thông tin báo cáo" },
                "safety_report:delete": { name: "Xóa báo cáo", desc: "Xóa báo cáo khỏi hệ thống" },
                "safety_report:list": { name: "Danh sách báo cáo", desc: "Xem danh sách tất cả báo cáo" },
                "safety_report:approve": { name: "Duyệt báo cáo", desc: "Duyệt và phê duyệt báo cáo" }
            }
        }
    };

    // Load roles from API
    useEffect(() => {
        const loadRoles = async () => {
            try {
                setLoading(true);
                setError(null);
        const response = await RoleService.getRoles({ page: 1, limit: 50 });
        const loadedRoles = response.data?.roles ?? response.data?.data?.roles ?? [];
        setRoles(Array.isArray(loadedRoles) ? loadedRoles : []);
            } catch (err) {
                console.error('Error loading roles:', err);
                setError('Không thể tải danh sách vai trò. Vui lòng thử lại.');
            } finally {
                setLoading(false);
            }
        };

        loadRoles();
    }, []);

    const selectRole = (roleId: string) => {
        setSelectedRoleId(roleId);
        const role = roles.find(r => r.id === roleId);
        if (role) {
            setCurrentPermissions(JSON.parse(JSON.stringify(role.permissions)));
        }
    };

    const togglePermission = (permissionKey: string) => {
        setCurrentPermissions(prev => ({
            ...prev,
            [permissionKey]: !prev[permissionKey]
        }));
    };

    const savePermissions = async () => {
        if (!selectedRoleId) return;

        try {
            setSaving(true);
            await RoleService.updateRolePermissions(selectedRoleId, currentPermissions);
            
            // Update local state
            setRoles(prev => prev.map(role => 
                role.id === selectedRoleId 
                    ? { ...role, permissions: { ...currentPermissions } }
                    : role
            ));
            
            alert('Đã lưu quyền hạn thành công!');
        } catch (error: any) {
            console.error('Error saving permissions:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi lưu quyền hạn. Vui lòng thử lại.';
            alert(`Lỗi: ${errorMessage}`);
        } finally {
            setSaving(false);
        }
    };

    const openModal = (modalId: string) => {
        setIsModalOpen(modalId);
    };

    const closeModal = () => {
        setIsModalOpen(null);
        setEditingRole(null);
        setFormData({ role_name: '', description: '' });
    };

    const editRole = (roleId: string) => {
        const role = roles.find(r => r.id === roleId);
        if (role) {
            setEditingRole(role);
            setFormData({
                role_name: role.role_name,
                description: role.description
            });
            openModal('addRoleModal');
        }
    };

    const deleteRole = async (roleId: string) => {
        const role = roles.find(r => r.id === roleId);
        if (role && window.confirm(`Bạn có chắc chắn muốn xóa vai trò "${role.role_name}"?`)) {
            try {
                await RoleService.deleteRole(roleId);
                setRoles(prev => prev.filter(r => r.id !== roleId));
                if (selectedRoleId === roleId) {
                    setSelectedRoleId(null);
                }
                alert('Đã xóa vai trò thành công!');
            } catch (error: any) {
                console.error('Error deleting role:', error);
                const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi xóa vai trò. Vui lòng thử lại.';
                alert(`Lỗi: ${errorMessage}`);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            setSaving(true);
            
            if (editingRole) {
                // Update existing role
                await RoleService.updateRole(editingRole.id, {
                    role_name: formData.role_name,
                    description: formData.description
                });
                
                setRoles(prev => prev.map(role => 
                    role.id === editingRole.id 
                        ? { ...role, role_name: formData.role_name, description: formData.description }
                        : role
                ));
                alert('Đã cập nhật vai trò thành công!');
            } else {
                // Add new role
                const newRoleData = {
                    role_name: formData.role_name,
                    description: formData.description,
                    permissions: {},
                    is_active: true
                };
                
                const response = await RoleService.createRole(newRoleData);
                const createdRole = response.data?.role ?? response.data?.data?.role;
                if (!createdRole) {
                    throw new Error('Không nhận được dữ liệu vai trò mới từ máy chủ');
                }
                setRoles(prev => [...prev, createdRole]);
                alert('Đã tạo vai trò mới thành công!');
            }
            
            closeModal();
        } catch (error: any) {
            console.error('Error saving role:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi lưu vai trò. Vui lòng thử lại.';
            alert(`Lỗi: ${errorMessage}`);
        } finally {
            setSaving(false);
        }
    };

    const selectedRole = roles.find(r => r.id === selectedRoleId);

    if (loading) {
        return (
            <div className="role-management-container">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Đang tải danh sách vai trò...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="role-management-container">
                <div className="error-container">
                    <i className="fas fa-exclamation-triangle"></i>
                    <p>{error}</p>
                    <button className="btn btn-primary" onClick={() => window.location.reload()}>
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

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
                                        <div className="role-name">{role.role_name}</div>
                                        <span className={`role-badge role-${role.role_name.toLowerCase()}`}>
                                            {role.role_name}
                                        </span>
                                    </div>
                                    <div className="role-description">{role.description}</div>
                                    <div className="role-stats">
                                        <span><i className="fas fa-users"></i> {role.user_count} người dùng</span>
                                        <span><i className="fas fa-check-circle"></i> {role.is_active ? 'Hoạt động' : 'Không hoạt động'}</span>
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
                                {selectedRole ? `Quyền hạn của vai trò: ${selectedRole.role_name}` : 'Chọn vai trò để quản lý quyền hạn'}
                            </h3>
                            <div>
                                {selectedRoleId && (
                                    <button 
                                        className="btn btn-success btn-sm" 
                                        onClick={savePermissions}
                                        disabled={saving}
                                    >
                                        <i className="fas fa-save"></i> {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
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
                                                            className={`permission-toggle ${currentPermissions[permKey] ? 'active' : ''}`}
                                                            onClick={() => togglePermission(permKey)}
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
                                        value={formData.role_name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, role_name: e.target.value }))}
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
                                    <button type="submit" className="btn btn-primary" disabled={saving}>
                                        <i className="fas fa-save"></i> {saving ? 'Đang lưu...' : (editingRole ? 'Cập nhật' : 'Tạo vai trò')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
    );
};

export default RoleManagementPage;