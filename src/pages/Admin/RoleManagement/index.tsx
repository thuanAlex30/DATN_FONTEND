import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Space, Row, Col, Spin, Tag, Collapse, Checkbox, Empty } from 'antd';
import { SafetyOutlined, PlusOutlined, EditOutlined, DeleteOutlined, ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
import RoleService from '../../../services/roleService';
import type { Role, PermissionGroup } from '../../../types/role';

const RoleManagementPage: React.FC = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
    const [currentPermissions, setCurrentPermissions] = useState<Record<string, string[]>>({});
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
                // map tới permissions.user_management: ['create_user', 'read_user', ...]
                "user:create_user": { name: "Tạo người dùng", desc: "Thêm người dùng mới vào hệ thống" },
                "user:read_user": { name: "Xem người dùng", desc: "Xem thông tin người dùng" },
                "user:update_user": { name: "Sửa người dùng", desc: "Chỉnh sửa thông tin người dùng" },
                "user:delete_user": { name: "Xóa người dùng", desc: "Xóa người dùng khỏi hệ thống" },
                "user:list_user": { name: "Danh sách người dùng", desc: "Xem danh sách tất cả người dùng" }
            }
        },
        role: {
            title: "Quản lý vai trò",
            icon: "fas fa-user-shield",
            permissions: {
                // map tới permissions.role_management: ['create_role', 'read_role', ...]
                "role:create_role": { name: "Tạo vai trò", desc: "Tạo vai trò mới" },
                "role:read_role": { name: "Xem vai trò", desc: "Xem thông tin vai trò" },
                "role:update_role": { name: "Sửa vai trò", desc: "Chỉnh sửa thông tin vai trò" },
                "role:delete_role": { name: "Xóa vai trò", desc: "Xóa vai trò khỏi hệ thống" },
                "role:assign_role": { name: "Gán vai trò", desc: "Gán vai trò cho người dùng" }
            }
        },
        department: {
            title: "Quản lý phòng ban",
            icon: "fas fa-building",
            permissions: {
                // map tới permissions.department_management
                "department:create_department": { name: "Tạo phòng ban", desc: "Tạo phòng ban mới" },
                "department:read_department": { name: "Xem phòng ban", desc: "Xem thông tin phòng ban" },
                "department:update_department": { name: "Sửa phòng ban", desc: "Chỉnh sửa thông tin phòng ban" },
                "department:delete_department": { name: "Xóa phòng ban", desc: "Xóa phòng ban khỏi hệ thống" },
                "department:list_department": { name: "Danh sách phòng ban", desc: "Xem danh sách tất cả phòng ban" }
            }
        },
        safety_report: {
            title: "Quản lý báo cáo an toàn",
            icon: "fas fa-shield-alt",
            permissions: {
                // map tới permissions.safety_management
                "safety_report:create_safety": { name: "Tạo báo cáo", desc: "Tạo báo cáo sự cố mới" },
                "safety_report:read_safety": { name: "Xem báo cáo", desc: "Xem thông tin báo cáo" },
                "safety_report:update_safety": { name: "Sửa báo cáo", desc: "Chỉnh sửa thông tin báo cáo" },
                "safety_report:delete_safety": { name: "Xóa báo cáo", desc: "Xóa báo cáo khỏi hệ thống" },
                "safety_report:list_safety": { name: "Danh sách báo cáo", desc: "Xem danh sách tất cả báo cáo" },
                "safety_report:approve_safety": { name: "Duyệt báo cáo", desc: "Duyệt và phê duyệt báo cáo" }
            }
        },
        project: {
            title: "Quản lý dự án",
            icon: "fas fa-project-diagram",
            permissions: {
                // map tới permissions.project_management
                "project:create_project": { name: "Tạo dự án", desc: "Khởi tạo dự án mới" },
                "project:read_project": { name: "Xem dự án", desc: "Xem thông tin dự án" },
                "project:update_project": { name: "Sửa dự án", desc: "Cập nhật thông tin dự án" },
                "project:delete_project": { name: "Xóa dự án", desc: "Xóa dự án khỏi hệ thống" }
            }
        },
        training: {
            title: "Quản lý đào tạo",
            icon: "fas fa-chalkboard-teacher",
            permissions: {
                // map tới permissions.training_management
                "training:create_training": { name: "Tạo khóa đào tạo", desc: "Tạo khóa đào tạo mới" },
                "training:read_training": { name: "Xem đào tạo", desc: "Xem thông tin khóa đào tạo" },
                "training:update_training": { name: "Sửa đào tạo", desc: "Cập nhật khóa đào tạo" },
                "training:delete_training": { name: "Xóa đào tạo", desc: "Xóa khóa đào tạo" },
                "training:enroll_training": { name: "Ghi danh đào tạo", desc: "Đăng ký nhân viên tham gia đào tạo" }
            }
        },
        ppe: {
            title: "Quản lý PPE",
            icon: "fas fa-hard-hat",
            permissions: {
                // map tới permissions.ppe_management
                "ppe:create_ppe": { name: "Tạo PPE", desc: "Thêm trang bị bảo hộ mới" },
                "ppe:read_ppe": { name: "Xem PPE", desc: "Xem chi tiết trang bị bảo hộ" },
                "ppe:update_ppe": { name: "Sửa PPE", desc: "Cập nhật thông tin PPE" },
                "ppe:delete_ppe": { name: "Xóa PPE", desc: "Xóa PPE khỏi hệ thống" },
                "ppe:issue_ppe": { name: "Cấp phát PPE", desc: "Cấp phát PPE cho nhân viên" }
            }
        },
        incident: {
            title: "Quản lý sự cố",
            icon: "fas fa-exclamation-triangle",
            permissions: {
                // map tới permissions.incident_management
                "incident:create_incident": { name: "Tạo sự cố", desc: "Báo cáo sự cố an toàn" },
                "incident:read_incident": { name: "Xem sự cố", desc: "Xem chi tiết sự cố" },
                "incident:update_incident": { name: "Sửa sự cố", desc: "Cập nhật tiến độ xử lý sự cố" },
                "incident:close_incident": { name: "Đóng sự cố", desc: "Hoàn tất và đóng sự cố" },
                "incident:escalate_incident": { name: "Escalate sự cố", desc: "Chuyển cấp xử lý cao hơn" }
            }
        },
        analytics: {
            title: "Báo cáo & Phân tích",
            icon: "fas fa-chart-line",
            permissions: {
                // map tới permissions.analytics
                "analytics:view_global_metrics": { name: "Xem số liệu tổng quan", desc: "Xem dashboard tổng quan" },
                "analytics:export_global_reports": { name: "Xuất báo cáo tổng quan", desc: "Xuất file báo cáo thống kê" },
                "analytics:view_tenant_metrics": { name: "Xem số liệu tenant", desc: "Xem báo cáo cho tenant/công ty" },
                "analytics:export_tenant_reports": { name: "Xuất báo cáo tenant", desc: "Xuất báo cáo theo tenant" },
                "analytics:view_department_metrics": { name: "Xem số liệu phòng ban", desc: "Xem báo cáo theo phòng ban" },
                "analytics:view_safety_metrics": { name: "Xem số liệu an toàn", desc: "Xem báo cáo chỉ số an toàn" }
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
        // RoleService trả về { success, message, data: { roles, pagination } }
        const responseData = (response as any)?.data ?? response;
        const loadedRoles = responseData?.roles ?? responseData?.data?.roles ?? [];
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

    const mapModuleKeyToBackend = (moduleKey: string) => {
        switch (moduleKey) {
            case 'user':
                return 'user_management';
            case 'role':
                return 'role_management';
            case 'department':
                return 'department_management';
            case 'safety_report':
                return 'safety_management';
            case 'project':
                return 'project_management';
            case 'training':
                return 'training_management';
            case 'ppe':
                return 'ppe_management';
            case 'incident':
                return 'incident_management';
            case 'analytics':
                return 'analytics';
            default:
                return moduleKey;
        }
    };

    const togglePermission = (permissionKey: string) => {
        const [moduleKey, actionKey] = permissionKey.split(':');
        const backendModuleKey = mapModuleKeyToBackend(moduleKey);

        setCurrentPermissions(prev => {
            const next = { ...prev };
            const currentModulePerms: string[] = Array.isArray(next[backendModuleKey])
                ? [...next[backendModuleKey]]
                : [];

            const existsIndex = currentModulePerms.indexOf(actionKey);
            if (existsIndex >= 0) {
                // Đang có quyền → bỏ quyền
                currentModulePerms.splice(existsIndex, 1);
            } else {
                // Chưa có quyền → thêm quyền
                currentModulePerms.push(actionKey);
            }

            next[backendModuleKey] = currentModulePerms;
            return next;
        });
    };

    const savePermissions = async () => {
        if (!selectedRoleId) return;

        const role = roles.find(r => r.id === selectedRoleId);
        const roleNameLower = role?.role_name?.toLowerCase() || '';
        const isCompanyAdminRole =
            roleNameLower === 'company admin' || roleNameLower === 'company_admin';

        // Không cho chỉnh sửa quyền của vai trò Company Admin từ UI này
        if (isCompanyAdminRole) {
            alert('Bạn không thể chỉnh sửa quyền của vai trò Company Admin từ màn hình này.');
            return;
        }

        try {
            setSaving(true);
            await RoleService.updateRolePermissions(selectedRoleId, currentPermissions as Record<string, string[]>);
            
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
                const responseData = (response as any)?.data ?? response;
                const createdRole = responseData?.role ?? responseData?.data?.role;
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
            <div style={{ padding: 24 }}>
                <Card>
                    <Space direction="vertical" align="center" style={{ width: '100%' }}>
                        <Spin size="large" />
                        <Text>Đang tải danh sách vai trò...</Text>
                    </Space>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: 24 }}>
                <Card>
                    <Space direction="vertical" align="center" style={{ width: '100%' }}>
                        <Text type="danger">{error}</Text>
                        <Button type="primary" onClick={() => window.location.reload()}>
                            Thử lại
                        </Button>
                    </Space>
                </Card>
            </div>
        );
    }

    return (
        <div style={{ padding: 24 }}>
            {/* Header */}
            <Card style={{ marginBottom: 24 }}>
                <Row align="middle" justify="space-between">
                    <Col>
                        <Space direction="vertical" size={4}>
                            <Space size="middle" align="center">
                                <SafetyOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                                <Title level={3} style={{ margin: 0 }}>
                                    Quản lý vai trò & quyền hạn
                                </Title>
                            </Space>
                            <Text type="secondary">
                                <a href="/admin/dashboard">Dashboard</a> / Vai trò & quyền hạn
                            </Text>
                        </Space>
                    </Col>
                    <Col>
                        <Button
                            icon={<ArrowLeftOutlined />}
                            onClick={() => (window.location.href = '/admin/dashboard')}
                        >
                            Quay lại Dashboard
                        </Button>
                    </Col>
                </Row>
            </Card>

            <Row gutter={24}>
                {/* Role List */}
                <Col xs={24} lg={8}>
                    <Card
                        title="Danh sách vai trò"
                        extra={(
                            <Button
                                type="primary"
                                size="small"
                                icon={<PlusOutlined />}
                                onClick={() => openModal('addRoleModal')}
                            >
                                Thêm vai trò
                            </Button>
                        )}
                        bodyStyle={{ padding: 16, maxHeight: 600, overflowY: 'auto' }}
                    >
                        <Space direction="vertical" style={{ width: '100%' }}>
                            {roles
                              .filter(role => {
                                // Ẩn hoàn toàn role System Admin trên màn hình Company Admin
                                const name = role.role_name?.toLowerCase() || '';
                                const isSystemRole = name === 'system admin';
                                if (isSystemRole) return false;
                                return true;
                              })
                              .map(role => {
                                const roleNameLower = role.role_name?.toLowerCase() || '';
                                const isCompanyAdminRole =
                                  roleNameLower === 'company admin' || roleNameLower === 'company_admin';

                                return (
                                <Card
                                    key={role.id}
                                    size="small"
                                    hoverable
                                    onClick={() => selectRole(role.id)}
                                    style={{
                                        borderRadius: 8,
                                        borderColor: selectedRoleId === role.id ? '#1890ff' : undefined,
                                        boxShadow: selectedRoleId === role.id ? '0 0 0 1px rgba(24,144,255,0.3)' : undefined,
                                    }}
                                >
                                    <Space direction="vertical" style={{ width: '100%' }} size={8}>
                                        <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
                                            <Text strong>{role.role_name}</Text>
                                            <Tag color={role.is_active ? 'green' : 'red'}>
                                                {role.is_active ? 'Hoạt động' : 'Không hoạt động'}
                                            </Tag>
                                        </Space>
                                        {role.description && (
                                            <Text type="secondary">{role.description}</Text>
                                        )}
                                        <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
                                            <Text type="secondary">
                                                {role.user_count} người dùng
                                            </Text>
                                            <Space>
                                                {/* Không cho chỉnh sửa/xóa vai trò Company Admin từ màn hình này */}
                                                {!isCompanyAdminRole && (
                                                    <>
                                                        <Button
                                                            size="small"
                                                            icon={<EditOutlined />}
                                                            onClick={(e) => { e.stopPropagation(); editRole(role.id); }}
                                                        />
                                                        <Button
                                                            size="small"
                                                            danger
                                                            icon={<DeleteOutlined />}
                                                            onClick={(e) => { e.stopPropagation(); deleteRole(role.id); }}
                                                        />
                                                    </>
                                                )}
                                            </Space>
                                        </Space>
                                    </Space>
                                </Card>
                            );})}
                        </Space>
                    </Card>
                </Col>

                {/* Permission Management */}
                <Col xs={24} lg={16}>
                    <Card
                        title={selectedRole ? (
                            <Space direction="vertical" size={4}>
                                <Space align="center">
                                    <SafetyOutlined style={{ color: '#1890ff' }} />
                                    <Title level={4} style={{ margin: 0 }}>{selectedRole.role_name}</Title>
                                    <Tag color={selectedRole.is_active ? 'green' : 'red'}>
                                        {selectedRole.is_active ? 'Hoạt động' : 'Không hoạt động'}
                                    </Tag>
                                </Space>
                                {selectedRole.description && (
                                    <Text type="secondary">{selectedRole.description}</Text>
                                )}
                                <Text type="secondary">
                                    {selectedRole.user_count} người dùng đang sử dụng vai trò này
                                </Text>
                                {selectedRole.role_name?.toLowerCase() === 'company admin' && (
                                    <Text type="danger" style={{ fontSize: 12 }}>
                                        Cần liên hệ cấp hệ thống để chỉnh sửa quyền này ở Company Admin.
                                    </Text>
                                )}
                            </Space>
                        ) : 'Chọn vai trò để quản lý quyền hạn'}
                        extra={selectedRole && (
                            <Button
                                type="primary"
                                size="small"
                                icon={<SaveOutlined />}
                                onClick={savePermissions}
                                loading={saving}
                            >
                                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </Button>
                        )}
                        bodyStyle={{ padding: 16, maxHeight: 600, overflowY: 'auto' }}
                    >
                        {!selectedRole && (
                            <Empty
                                description="Vui lòng chọn một vai trò để quản lý quyền hạn"
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                            />
                        )}

                        {selectedRole && (
                            <Collapse
                                defaultActiveKey={Object.keys(permissionDefinitions)}
                                bordered={false}
                            >
                                {Object.entries(permissionDefinitions).map(([groupKey, group]) => (
                                    <Collapse.Panel
                                        key={groupKey}
                                        header={
                                            <Space>
                                                <i className={group.icon}></i>
                                                <span>{group.title}</span>
                                            </Space>
                                        }
                                    >
                                        {Object.entries(group.permissions).map(([permKey, perm]) => {
                                            const [moduleKey, actionKey] = permKey.split(':');
                                            const backendModuleKey = mapModuleKeyToBackend(moduleKey);
                                            const isChecked =
                                                Array.isArray(currentPermissions[backendModuleKey]) &&
                                                currentPermissions[backendModuleKey].includes(actionKey);

                                            return (
                                            <div
                                                key={permKey}
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    padding: '8px 0',
                                                    borderBottom: '1px solid #f0f0f0',
                                                }}
                                            >
                                                <div>
                                                    <div style={{ fontWeight: 500 }}>{perm.name}</div>
                                                    <Text type="secondary">{perm.desc}</Text>
                                                </div>
                                                <Checkbox
                                                    checked={isChecked}
                                                    onChange={() => togglePermission(permKey)}
                                                />
                                            </div>
                                        );})}
                                    </Collapse.Panel>
                                ))}
                            </Collapse>
                        )}
                    </Card>
                </Col>
            </Row>

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