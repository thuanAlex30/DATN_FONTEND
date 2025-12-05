import React, { useState, useEffect } from 'react';
import { 
    Card, 
    Typography, 
    Button, 
    Space, 
    Table, 
    Tag, 
    Avatar, 
    Row, 
    Col, 
    Statistic, 
    Input, 
    Select, 
    Modal, 
    Form, 
    message, 
    Popconfirm, 
    Checkbox, 
    Divider,
    Switch,
    Badge,
    Tooltip,
    Empty,
    Spin,
    Alert
} from 'antd';
import { 
    SafetyOutlined, 
    PlusOutlined, 
    EditOutlined, 
    DeleteOutlined, 
    SearchOutlined, 
    FilterOutlined, 
    UserOutlined, 
    KeyOutlined,
    SaveOutlined,
    CloseOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons';
import RoleService from '../../../services/roleService';
import type { Role, PermissionGroup } from '../../../types/role';

const { Title, Text } = Typography;
const { Search } = Input;

const RoleManagementPage: React.FC = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchText, setSearchText] = useState('');
    const [filterActive, setFilterActive] = useState<boolean | undefined>(undefined);
    const [stats, setStats] = useState({
        total_roles: 0,
        active_roles: 0,
        inactive_roles: 0,
        total_users: 0
    });

    const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
    const [currentPermissions, setCurrentPermissions] = useState<Record<string, boolean>>({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [saving, setSaving] = useState(false);
    const [form] = Form.useForm();

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

    useEffect(() => {
        loadRoles();
        loadStats();
    }, [searchText, filterActive]);

    const loadRoles = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await RoleService.getRoles({ 
                page: 1, 
                limit: 100,
                search: searchText || undefined,
                is_active: filterActive
            });
            const loadedRoles = response.data?.roles ?? response.data?.data?.roles ?? [];
            setRoles(Array.isArray(loadedRoles) ? loadedRoles : []);
        } catch (err) {
            console.error('Error loading roles:', err);
            setError('Không thể tải danh sách vai trò. Vui lòng thử lại.');
            message.error('Không thể tải danh sách vai trò');
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const response = await RoleService.getRoleStats();
            if (response.success && response.data) {
                setStats(response.data);
            }
        } catch (err) {
            console.error('Error loading stats:', err);
        }
    };

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
            
            setRoles(prev => prev.map(role => 
                role.id === selectedRoleId 
                    ? { ...role, permissions: { ...currentPermissions } }
                    : role
            ));
            
            message.success('Đã lưu quyền hạn thành công!');
        } catch (error: any) {
            console.error('Error saving permissions:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi lưu quyền hạn. Vui lòng thử lại.';
            message.error(errorMessage);
        } finally {
            setSaving(false);
        }
    };

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingRole(null);
        form.resetFields();
    };

    const editRole = (roleId: string) => {
        const role = roles.find(r => r.id === roleId);
        if (role) {
            setEditingRole(role);
            form.setFieldsValue({
                role_name: role.role_name,
                description: role.description,
                is_active: role.is_active
            });
            openModal();
        }
    };

    const deleteRole = async (roleId: string) => {
        try {
            await RoleService.deleteRole(roleId);
            setRoles(prev => prev.filter(r => r.id !== roleId));
            if (selectedRoleId === roleId) {
                setSelectedRoleId(null);
            }
            message.success('Đã xóa vai trò thành công!');
            loadStats();
        } catch (error: any) {
            console.error('Error deleting role:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi xóa vai trò. Vui lòng thử lại.';
            message.error(errorMessage);
        }
    };

    const handleSubmit = async (values: any) => {
        try {
            setSaving(true);
            
            if (editingRole) {
                await RoleService.updateRole(editingRole.id, {
                    role_name: values.role_name,
                    description: values.description,
                    is_active: values.is_active
                });
                
                setRoles(prev => prev.map(role => 
                    role.id === editingRole.id 
                        ? { ...role, role_name: values.role_name, description: values.description, is_active: values.is_active }
                        : role
                ));
                message.success('Đã cập nhật vai trò thành công!');
            } else {
                const newRoleData = {
                    role_name: values.role_name,
                    description: values.description,
                    permissions: {},
                    is_active: values.is_active ?? true
                };
                
                const response = await RoleService.createRole(newRoleData);
                const createdRole = response.data?.role ?? response.data?.data?.role;
                if (!createdRole) {
                    throw new Error('Không nhận được dữ liệu vai trò mới từ máy chủ');
                }
                setRoles(prev => [...prev, createdRole]);
                message.success('Đã tạo vai trò mới thành công!');
            }
            
            closeModal();
            loadStats();
        } catch (error: any) {
            console.error('Error saving role:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi lưu vai trò. Vui lòng thử lại.';
            message.error(errorMessage);
        } finally {
            setSaving(false);
        }
    };

    const toggleRoleStatus = async (roleId: string, isActive: boolean) => {
        try {
            await RoleService.toggleRoleStatus(roleId, isActive);
            setRoles(prev => prev.map(role => 
                role.id === roleId ? { ...role, is_active: isActive } : role
            ));
            message.success(`Đã ${isActive ? 'kích hoạt' : 'vô hiệu hóa'} vai trò thành công!`);
            loadStats();
        } catch (error: any) {
            console.error('Error toggling role status:', error);
            message.error('Có lỗi xảy ra khi thay đổi trạng thái vai trò');
        }
    };

    const selectedRole = roles.find(r => r.id === selectedRoleId);

    const filteredRoles = roles.filter(role => {
        const matchesSearch = !searchText || 
            role.role_name.toLowerCase().includes(searchText.toLowerCase()) ||
            role.description?.toLowerCase().includes(searchText.toLowerCase());
        const matchesFilter = filterActive === undefined || role.is_active === filterActive;
        return matchesSearch && matchesFilter;
    });

    const columns = [
        {
            title: 'Vai trò',
            dataIndex: 'role_name',
            key: 'role_name',
            render: (text: string, record: Role) => (
                <Space>
                    <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
                    <div>
                        <div style={{ fontWeight: 500 }}>{text}</div>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {record.description || 'Không có mô tả'}
                        </Text>
                    </div>
                </Space>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'is_active',
            key: 'is_active',
            render: (isActive: boolean, record: Role) => (
                <Space>
                    <Badge status={isActive ? 'success' : 'default'} />
                    <Switch
                        checked={isActive}
                        onChange={(checked) => toggleRoleStatus(record.id, checked)}
                        size="small"
                    />
                    <Text type={isActive ? undefined : 'secondary'}>
                        {isActive ? 'Hoạt động' : 'Không hoạt động'}
                    </Text>
                </Space>
            ),
        },
        {
            title: 'Số người dùng',
            dataIndex: 'user_count',
            key: 'user_count',
            render: (count: number) => (
                <Tag color="blue">
                    <UserOutlined /> {count || 0}
                </Tag>
            ),
        },
        {
            title: 'Thao tác',
            key: 'actions',
            render: (_: any, record: Role) => (
                <Space>
                    <Tooltip title="Chọn để quản lý quyền">
                        <Button
                            type={selectedRoleId === record.id ? 'primary' : 'default'}
                            icon={<KeyOutlined />}
                            onClick={() => selectRole(record.id)}
                        >
                            Quyền hạn
                        </Button>
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            icon={<EditOutlined />}
                            onClick={() => editRole(record.id)}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Xóa vai trò"
                        description={`Bạn có chắc chắn muốn xóa vai trò "${record.role_name}"?`}
                        onConfirm={() => deleteRole(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Tooltip title="Xóa">
                            <Button
                                danger
                                icon={<DeleteOutlined />}
                            />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
            <Card>
                <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                    <Col>
                        <Title level={2} style={{ margin: 0 }}>
                            <SafetyOutlined style={{ marginRight: 8 }} />
                            Quản lý vai trò & quyền hạn
                        </Title>
                        <Text type="secondary">Quản lý các vai trò và phân quyền trong hệ thống</Text>
                    </Col>
                    <Col>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            size="large"
                            onClick={openModal}
                        >
                            Thêm vai trò mới
                        </Button>
                    </Col>
                </Row>

                {error && (
                    <Alert
                        message="Lỗi"
                        description={error}
                        type="error"
                        showIcon
                        closable
                        style={{ marginBottom: 16 }}
                        onClose={() => setError(null)}
                    />
                )}

                <Row gutter={16} style={{ marginBottom: 24 }}>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Tổng số vai trò"
                                value={stats.total_roles}
                                prefix={<SafetyOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Vai trò hoạt động"
                                value={stats.active_roles}
                                valueStyle={{ color: '#3f8600' }}
                                prefix={<CheckCircleOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Vai trò không hoạt động"
                                value={stats.inactive_roles}
                                valueStyle={{ color: '#cf1322' }}
                                prefix={<ExclamationCircleOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Tổng người dùng"
                                value={stats.total_users}
                                prefix={<UserOutlined />}
                            />
                        </Card>
                    </Col>
                </Row>

                <Card>
                    <Row gutter={16} style={{ marginBottom: 16 }}>
                        <Col span={12}>
                            <Search
                                placeholder="Tìm kiếm vai trò..."
                                allowClear
                                enterButton={<SearchOutlined />}
                                size="large"
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                onSearch={loadRoles}
                            />
                        </Col>
                        <Col span={12}>
                            <Select
                                placeholder="Lọc theo trạng thái"
                                allowClear
                                style={{ width: '100%' }}
                                size="large"
                                value={filterActive}
                                onChange={(value) => setFilterActive(value)}
                            >
                                <Select.Option value={true}>Hoạt động</Select.Option>
                                <Select.Option value={false}>Không hoạt động</Select.Option>
                            </Select>
                        </Col>
                    </Row>

                    <Spin spinning={loading}>
                        <Table
                            columns={columns}
                            dataSource={filteredRoles}
                            rowKey="id"
                            pagination={{
                                pageSize: 10,
                                showSizeChanger: true,
                                showTotal: (total) => `Tổng ${total} vai trò`,
                            }}
                            rowClassName={(record) => selectedRoleId === record.id ? 'ant-table-row-selected' : ''}
                        />
                    </Spin>
                </Card>

                {selectedRoleId && (
                    <Card 
                        title={
                            <Space>
                                <KeyOutlined />
                                <span>Quyền hạn của vai trò: {selectedRole?.role_name}</span>
                            </Space>
                        }
                        extra={
                            <Button
                                type="primary"
                                icon={<SaveOutlined />}
                                onClick={savePermissions}
                                loading={saving}
                            >
                                Lưu thay đổi
                            </Button>
                        }
                        style={{ marginTop: 16 }}
                    >
                        {Object.entries(permissionDefinitions).map(([groupKey, group]) => (
                            <Card
                                key={groupKey}
                                type="inner"
                                title={
                                    <Space>
                                        <span>{group.title}</span>
                                    </Space>
                                }
                                style={{ marginBottom: 16 }}
                            >
                                <Row gutter={[16, 16]}>
                                    {Object.entries(group.permissions).map(([permKey, perm]) => (
                                        <Col span={12} key={permKey}>
                                            <Card size="small" hoverable>
                                                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontWeight: 500, marginBottom: 4 }}>
                                                            {perm.name}
                                                        </div>
                                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                                            {perm.desc}
                                                        </Text>
                                                    </div>
                                                    <Switch
                                                        checked={currentPermissions[permKey] || false}
                                                        onChange={() => togglePermission(permKey)}
                                                    />
                                                </Space>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            </Card>
                        ))}
                    </Card>
                )}

                {!selectedRoleId && (
                    <Card style={{ marginTop: 16 }}>
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description="Vui lòng chọn một vai trò để quản lý quyền hạn"
                        />
                    </Card>
                )}
            </Card>

            <Modal
                title={editingRole ? 'Chỉnh sửa vai trò' : 'Thêm vai trò mới'}
                open={isModalOpen}
                onCancel={closeModal}
                footer={null}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item
                        name="role_name"
                        label="Tên vai trò"
                        rules={[{ required: true, message: 'Vui lòng nhập tên vai trò' }]}
                    >
                        <Input placeholder="Nhập tên vai trò" />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Mô tả"
                    >
                        <Input.TextArea 
                            rows={4} 
                            placeholder="Mô tả vai trò này"
                        />
                    </Form.Item>

                    <Form.Item
                        name="is_active"
                        label="Trạng thái"
                        valuePropName="checked"
                        initialValue={true}
                    >
                        <Switch checkedChildren="Hoạt động" unCheckedChildren="Không hoạt động" />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Space>
                            <Button onClick={closeModal}>
                                Hủy
                            </Button>
                            <Button type="primary" htmlType="submit" loading={saving}>
                                {editingRole ? 'Cập nhật' : 'Tạo vai trò'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default RoleManagementPage;