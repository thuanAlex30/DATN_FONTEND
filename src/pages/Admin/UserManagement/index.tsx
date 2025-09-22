import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import './UserManagement.css';
import userService from '../../../services/userService';
import departmentService from '../../../services/departmentService';
import positionService from '../../../services/positionService';
import RoleService from '../../../services/roleService';
import ImportUsers from '../../../components/ImportUsers';
import type { User } from '../../../types/user';
import type { RootState } from '../../../store';

const UserManagement: React.FC = () => {
  // Redux state
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showImportUsers, setShowImportUsers] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Data for dropdowns
  const [departments, setDepartments] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    phone: '',
    birthDate: '',
    departmentId: '',
    positionId: '',
    roleId: '',
    address: '',
    password: '',
    confirmPassword: ''
  });

  const itemsPerPage = 10;

  // Check if current user has permission to view users
  const hasUserReadPermission = () => {
    console.log('Current user:', currentUser);
    console.log('User role:', currentUser?.role);
    console.log('User permissions:', currentUser?.role?.permissions);
    
    if (!currentUser?.role?.permissions) {
      console.log('No permissions found');
      return false;
    }
    
    const hasPermission = currentUser.role.permissions['user:read'] === true;
    console.log('Has user:read permission:', hasPermission);
    return hasPermission;
  };

  // Check if current user has permission to create users
  const hasUserCreatePermission = () => {
    if (!currentUser?.role?.permissions) return false;
    return currentUser.role.permissions['user:create'] === true;
  };

  // Check if current user has permission to update users
  const hasUserUpdatePermission = () => {
    if (!currentUser?.role?.permissions) return false;
    return currentUser.role.permissions['user:update'] === true;
  };

  // Check if current user has permission to delete users
  const hasUserDeletePermission = () => {
    if (!currentUser?.role?.permissions) return false;
    return currentUser.role.permissions['user:delete'] === true;
  };

  // Load users from API
  const loadUsers = async () => {
    // Check permission before loading users
    if (!hasUserReadPermission()) {
      setError('Bạn không có quyền xem danh sách người dùng');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await userService.getUsers();
      console.log('Users response:', response);
      setUsers(response.data);
    } catch (err) {
      setError('Không thể tải danh sách người dùng');
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Load dropdown data
  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        // Load departments using /departments/active endpoint
        const departmentsResponse = await departmentService.getActiveDepartments();
        console.log('Departments response:', departmentsResponse);
        
        // departmentService.getActiveDepartments() already returns response.data.data
        const departmentsData = departmentsResponse;
        console.log('Departments data structure:', departmentsData);
        
        if (Array.isArray(departmentsData)) {
          console.log('First department sample:', departmentsData[0]);
          setDepartments(departmentsData);
        } else {
          console.warn('Departments data is not an array:', departmentsResponse);
          setDepartments([]);
        }

        // Load positions
        const positionsResponse = await positionService.getOptions();
        console.log('Positions response:', positionsResponse);
        
        // positionService.getOptions() returns api.get response, so we need response.data
        const positionsData = positionsResponse.data?.data || positionsResponse.data;
        console.log('Positions data structure:', positionsData);
        
        if (Array.isArray(positionsData)) {
          console.log('First position sample:', positionsData[0]);
          // Map API response format to expected format
          const mappedPositions = positionsData.map(pos => ({
            _id: pos.id,
            id: pos.id,
            position_name: pos.name,
            name: pos.name,
            level: pos.level
          }));
          setPositions(mappedPositions);
        } else {
          console.warn('Positions data is not an array:', positionsResponse);
          setPositions([]);
        }

        // Load roles
        const rolesResponse = await RoleService.getAllActiveRoles();
        console.log('Roles response:', rolesResponse);
        
        // RoleService.getAllActiveRoles() returns { success: boolean; data: Role[] }
        const rolesData = rolesResponse.data;
        console.log('Roles data structure:', rolesData);
        
        if (Array.isArray(rolesData)) {
          console.log('First role sample:', rolesData[0]);
          setRoles(rolesData);
        } else {
          console.warn('Roles data is not an array:', rolesResponse);
          setRoles([]);
        }
      } catch (err) {
        console.error('Error loading dropdown data:', err);
        // Set empty arrays as fallback
        setDepartments([]);
        setPositions([]);
        setRoles([]);
      }
    };

    loadDropdownData();
  }, []);

  // Set default role to employee when roles are loaded
  useEffect(() => {
    if (roles.length > 0 && !formData.roleId) {
      const employeeRole = roles.find(role => 
        role.role_name?.toLowerCase() === 'employee' || 
        role.name?.toLowerCase() === 'employee'
      );
      if (employeeRole) {
        setFormData(prev => ({
          ...prev,
          roleId: employeeRole.id || employeeRole._id
        }));
      }
    }
  }, [roles]);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, statusFilter, users]);

  // Update filteredUsers when users data is loaded
  useEffect(() => {
    if (users && users.length > 0) {
      filterUsers();
    }
  }, [users]);

  const filterUsers = () => {
    if (!users || !Array.isArray(users)) {
      setFilteredUsers([]);
      return;
    }
    
    console.log('Filtering users:', users.length, 'users');
    let filtered = users.filter(user => {
      // Add null/undefined checks before calling toLowerCase
      const fullName = user.full_name || '';
      const email = user.email || '';
      const username = user.username || '';
      
      const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           username.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = !statusFilter || 
                          (statusFilter === 'active' && user.is_active) ||
                          (statusFilter === 'inactive' && !user.is_active);

      return matchesSearch && matchesStatus;
    });

    setFilteredUsers(filtered);
    setCurrentPage(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const renderUsers = () => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedUsers = filteredUsers.slice(start, end);
    
    console.log('Rendering users:', paginatedUsers.length, 'users');
    console.log('Filtered users total:', filteredUsers.length);

    return paginatedUsers.map(user => (
      <tr key={user.id}>
        <td>
          <div className="user-info">
            <div className="avatar">
              {(user.full_name || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <div className="user-name">{user.full_name}</div>
              <div className="user-email">{user.email}</div>
            </div>
          </div>
        </td>
        <td>{user.department?.department_name || '-'}</td>
        <td>{user.position?.position_name || '-'}</td>
        <td>
          <span className={`status-badge ${user.is_active ? 'status-active' : 'status-inactive'}`}>
            {user.is_active ? 'Hoạt động' : 'Không hoạt động'}
          </span>
        </td>
        <td>{formatDate(user.created_at)}</td>
        <td>
          <div className="action-buttons">
            {hasUserUpdatePermission() && (
              <button className="btn btn-warning btn-sm" onClick={() => editUser(user)}>
                <i className="fas fa-edit"></i>
              </button>
            )}
            {hasUserDeletePermission() && (
              <button className="btn btn-danger btn-sm" onClick={() => deleteUser(user)}>
                <i className="fas fa-trash"></i>
              </button>
            )}
            {hasUserReadPermission() && (
              <button className="btn btn-secondary btn-sm" onClick={() => viewUser(user)}>
                <i className="fas fa-eye"></i>
              </button>
            )}
          </div>
        </td>
      </tr>
    ));
  };

  const renderPagination = () => {
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    
    if (totalPages <= 1) return null;

    let paginationButtons = [];
    
    // Previous button
    paginationButtons.push(
      <button 
        key="prev"
        className="pagination-btn" 
        onClick={() => goToPage(currentPage - 1)} 
        disabled={currentPage === 1}
      >
        <i className="fas fa-chevron-left"></i>
      </button>
    );

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
      if (i === currentPage || i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
        paginationButtons.push(
          <button 
            key={i}
            className={`pagination-btn ${i === currentPage ? 'active' : ''}`} 
            onClick={() => goToPage(i)}
          >
            {i}
          </button>
        );
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        paginationButtons.push(
          <span key={`ellipsis-${i}`} className="pagination-btn">...</span>
        );
      }
    }

    // Next button
    paginationButtons.push(
      <button 
        key="next"
        className="pagination-btn" 
        onClick={() => goToPage(currentPage + 1)} 
        disabled={currentPage === totalPages}
      >
        <i className="fas fa-chevron-right"></i>
      </button>
    );

    return paginationButtons;
  };

  const goToPage = (page: number) => {
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
    setEditingUser(null);
    setFormData({
      username: '',
      email: '',
      fullName: '',
      phone: '',
      birthDate: '',
      departmentId: '',
      positionId: '',
      roleId: '',
      address: '',
      password: '',
      confirmPassword: ''
    });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const editUser = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      fullName: user.full_name,
      phone: user.phone || '',
      birthDate: '',
      departmentId: user.department?._id || '',
      positionId: user.position?._id || '',
      roleId: user.role?._id || '',
      address: '',
      password: '',
      confirmPassword: ''
    });
    setIsModalOpen(true);
  };

  const deleteUser = (user: User) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    
    // Check permission before deleting
    if (!hasUserDeletePermission()) {
      alert('Bạn không có quyền xóa người dùng');
      setShowDeleteModal(false);
      setUserToDelete(null);
      return;
    }
    
    setIsDeleting(true);
    try {
      await userService.deleteUser(userToDelete.id);
      
      // Reload users from server to get updated data
      await loadUsers();
      
      setShowDeleteModal(false);
      setUserToDelete(null);
      alert('Đã xóa người dùng thành công!');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Có lỗi xảy ra khi xóa người dùng!');
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const viewUser = (user: User) => {
    alert(`Thông tin người dùng:\n\nID: ${user.id}\nTên: ${user.full_name}\nEmail: ${user.email}\nPhòng ban: ${user.department?.department_name || 'Chưa phân công'}\nVị trí: ${user.position?.position_name || 'Chưa phân công'}\nTrạng thái: ${user.is_active ? 'Hoạt động' : 'Không hoạt động'}`);
  };

  const validateForm = () => {
    const errors: string[] = [];

    // Validate username (alphanumeric only, 3-50 chars)
    if (!formData.username || formData.username.length < 3 || formData.username.length > 50) {
      errors.push('Username phải có từ 3-50 ký tự');
    }
    if (!/^[a-zA-Z0-9]+$/.test(formData.username)) {
      errors.push('Username chỉ được chứa chữ cái và số');
    }

    // Validate email
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push('Email không hợp lệ');
    }

    // Validate password (if creating new user)
    if (!editingUser) {
      if (!formData.password || formData.password.length < 6) {
        errors.push('Mật khẩu phải có ít nhất 6 ký tự');
      }
      if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/.test(formData.password)) {
        errors.push('Mật khẩu phải chứa ít nhất 1 chữ thường, 1 chữ hoa, 1 số và 1 ký tự đặc biệt');
      }
      if (formData.password !== formData.confirmPassword) {
        errors.push('Mật khẩu xác nhận không khớp');
      }
    }

    // Validate full name
    if (!formData.fullName || formData.fullName.length < 2 || formData.fullName.length > 100) {
      errors.push('Họ tên phải có từ 2-100 ký tự');
    }

    // Validate phone (if provided)
    if (formData.phone && !/^[0-9+\-\(\)\s]+$/.test(formData.phone)) {
      errors.push('Số điện thoại không hợp lệ');
    }

    // Validate role (required)
    if (!formData.roleId) {
      errors.push('Vai trò là bắt buộc');
    }

    // Validate department_id (if provided and not empty)
    if (formData.departmentId && formData.departmentId.trim() !== '' && !/^[0-9a-fA-F]{24}$/.test(formData.departmentId)) {
      errors.push('ID phòng ban không hợp lệ');
    }

    // Validate position_id (if provided and not empty)
    if (formData.positionId && formData.positionId.trim() !== '' && !/^[0-9a-fA-F]{24}$/.test(formData.positionId)) {
      errors.push('ID vị trí không hợp lệ');
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check permission before creating/updating
    if (editingUser) {
      if (!hasUserUpdatePermission()) {
        alert('Bạn không có quyền sửa người dùng');
        return;
      }
    } else {
      if (!hasUserCreatePermission()) {
        alert('Bạn không có quyền tạo người dùng');
        return;
      }
    }
    
    // Debug: Log form data before validation
    console.log('Form data before validation:', formData);
    
    // Validate form
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      console.log('Validation errors:', validationErrors);
      alert('Vui lòng sửa các lỗi sau:\n' + validationErrors.join('\n'));
      return;
    }

    try {
      if (editingUser) {
        // Update existing user
        const updateData = {
          email: formData.email.trim().toLowerCase(),
          full_name: formData.fullName.trim(),
          phone: formData.phone?.trim() || undefined,
          department_id: formData.departmentId?.trim() || undefined,
          position_id: formData.positionId?.trim() || undefined
        };
        
        const updatedUser = await userService.updateUser(editingUser.id, updateData);
        setUsers(users.map(user => user.id === editingUser.id ? updatedUser : user));
        alert('Đã cập nhật thông tin người dùng thành công!');
    } else {
        // Create new user
        const createData = {
          username: formData.username.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          full_name: formData.fullName.trim(),
          phone: formData.phone?.trim() || undefined,
          birth_date: formData.birthDate || undefined,
          address: formData.address?.trim() || undefined,
          department_id: formData.departmentId?.trim() || undefined,
          position_id: formData.positionId?.trim() || undefined,
          role_id: formData.roleId?.trim() || undefined
        };
        
        console.log('Creating user with data:', createData);
        const newUser = await userService.createUser(createData);
        console.log('User created successfully:', newUser);
      setUsers([...users, newUser]);
        alert('Đã tạo người dùng mới thành công!');
    }

    closeModal();
    } catch (error: any) {
      console.error('Error saving user:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMessage = 'Có lỗi xảy ra khi lưu thông tin người dùng!';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    console.log(`Form field changed: ${name} = ${value}`);
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="user-management-container">
      {/* Header */}
      <div className="header">
        <div>
          <h1><i className="fas fa-users"></i> Quản lý người dùng</h1>
          <div className="breadcrumb">
            <a href="/admin/dashboard">Dashboard</a> / Quản lý người dùng
          </div>
        </div>
        <a href="/admin/dashboard" className="btn btn-secondary">
          <i className="fas fa-arrow-left"></i> Quay lại
        </a>
      </div>

      {/* Controls */}
      <div className="controls">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input 
            type="text" 
            placeholder="Tìm kiếm theo tên, email, hoặc username..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <select 
            className="filter-select" 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Không hoạt động</option>
          </select>
          
          <button className="btn btn-success" onClick={() => setShowImportUsers(true)}>
            <i className="fas fa-file-excel"></i> Import Excel
          </button>
          {hasUserCreatePermission() && (
            <button className="btn btn-primary" onClick={openModal}>
              <i className="fas fa-plus"></i> Thêm người dùng
            </button>
          )}
        </div>
      </div>

      {/* Data Table */}
      <div className="data-table">
        <div className="table-header">
          <h3 className="table-title">Danh sách người dùng</h3>
        </div>
        
        {loading ? (
          <div className="loading-state">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Đang tải danh sách người dùng...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <i className="fas fa-exclamation-triangle"></i>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={() => window.location.reload()}>
              Thử lại
            </button>
          </div>
        ) : (
          <>
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Người dùng</th>
                <th>Phòng ban</th>
                <th>Vị trí</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {renderUsers()}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="pagination">
          {renderPagination()}
        </div>
          </>
        )}
      </div>

      {/* Add/Edit User Modal */}
      {isModalOpen && (
        <div className="modal active">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">
                {editingUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
              </h2>
              <span className="close-modal" onClick={closeModal}>&times;</span>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Username *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Chỉ chữ cái và số, 3-50 ký tự"
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input 
                    type="email" 
                    className="form-input" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Họ và tên *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Số điện thoại</label>
                  <input 
                    type="tel" 
                    className="form-input" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Ngày sinh</label>
                  <input 
                    type="date" 
                    className="form-input" 
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Phòng ban</label>
                  <select 
                    className="form-input" 
                    name="departmentId"
                    value={formData.departmentId}
                    onChange={handleInputChange}
                  >
                    <option value="">Chọn phòng ban</option>
                    {Array.isArray(departments) && departments.map(dept => (
                      <option key={dept._id || dept.id} value={dept._id || dept.id}>
                        {dept.department_name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Vị trí</label>
                  <select 
                    className="form-input" 
                    name="positionId"
                    value={formData.positionId}
                    onChange={handleInputChange}
                  >
                    <option value="">Chọn vị trí</option>
                    {Array.isArray(positions) && positions.map(position => (
                      <option key={position._id || position.id} value={position._id || position.id}>
                        {position.position_name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Vai trò *</label>
                  <select 
                    className="form-input" 
                    name="roleId"
                    value={formData.roleId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Chọn vai trò</option>
                    {Array.isArray(roles) && roles.map(role => (
                      <option key={role._id || role.id} value={role._id || role.id}>
                        {role.role_name || role.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group full-width">
                  <label className="form-label">Địa chỉ</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                </div>
                
                {!editingUser && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Mật khẩu *</label>
                      <input 
                        type="password" 
                        className="form-input" 
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Ít nhất 6 ký tự, có chữ hoa, thường, số và ký tự đặc biệt"
                        required 
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Xác nhận mật khẩu *</label>
                      <input 
                        type="password" 
                        className="form-input" 
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required 
                      />
                    </div>
                  </>
                )}
              </div>
              
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  <i className="fas fa-save"></i> Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Users Modal */}
      {showImportUsers && (
        <div className="import-modal-overlay">
          <div className="import-modal-content">
            <div className="import-modal-header">
              <h2 className="import-modal-title">Import Users từ Excel</h2>
              <button 
                className="import-modal-close" 
                onClick={() => setShowImportUsers(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="import-modal-body">
              <ImportUsers />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && userToDelete && (
        <div className="modal active">
          <div className="modal-content delete-modal">
            <div className="modal-header">
              <h2 className="modal-title">
                <i className="fas fa-exclamation-triangle" style={{ color: '#e74c3c', marginRight: '0.5rem' }}></i>
                Xác nhận xóa người dùng
              </h2>
            </div>
            
            <div className="delete-modal-body">
              <div className="user-info-delete">
                <div className="avatar">
                  {(userToDelete.full_name || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="user-details">
                  <div className="user-name">{userToDelete.full_name}</div>
                  <div className="user-email">{userToDelete.email}</div>
                  <div className="user-role">{userToDelete.role?.role_name || 'Chưa phân quyền'}</div>
                </div>
              </div>
              
              <div className="warning-message">
                <p><strong>Bạn có chắc chắn muốn xóa người dùng này?</strong></p>
                <p>Hành động này sẽ vô hiệu hóa tài khoản người dùng và không thể hoàn tác.</p>
              </div>
            </div>
            
            <div className="form-actions">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={cancelDelete}
                disabled={isDeleting}
              >
                Hủy
              </button>
              <button 
                type="button" 
                className="btn btn-danger" 
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Đang xóa...
                  </>
                ) : (
                  <>
                    <i className="fas fa-trash"></i>
                    Xóa người dùng
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
