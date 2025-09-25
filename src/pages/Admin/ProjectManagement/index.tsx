import React, { useState, useEffect } from 'react';
import './ProjectManagement.css';
import projectService from '../../../services/projectService';
import userService from '../../../services/userService';
import type { Project, ProjectStats, Site, CreateProjectData, UpdateProjectData } from '../../../types/project';
import type { User } from '../../../types/user';

const ProjectManagement: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
    const [sites, setSites] = useState<Site[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [employees, setEmployees] = useState<User[]>([]);
    const [positionOptions, setPositionOptions] = useState<any[]>([]);
    const [stats, setStats] = useState<ProjectStats>({
        total: 0,
        active: 0,
        completed: 0,
        pending: 0,
        cancelled: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [siteFilter, setSiteFilter] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    
    // New state for additional features
    const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [progressValue, setProgressValue] = useState(0);
    const [isTimelineModalOpen, setIsTimelineModalOpen] = useState(false);
    const [projectTimeline, setProjectTimeline] = useState<any[]>([]);
    const [isSiteModalOpen, setIsSiteModalOpen] = useState(false);
    const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
    const [projectAssignments, setProjectAssignments] = useState<any[]>([]);
    const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
    const [memberFormData, setMemberFormData] = useState({
        user_id: '',
        role_in_project: '',
        start_date: '',
        end_date: ''
    });
    const [siteFormData, setSiteFormData] = useState({
        site_name: '',
        address: '',
        description: ''
    });
    const [formData, setFormData] = useState<CreateProjectData>({
        project_name: '',
        description: '',
        start_date: '',
        end_date: '',
        leader_id: '',
        site_name: '',
        status: 'pending',
        priority: 'medium'
    });

    const statusLabels = {
        active: 'Đang thực hiện',
        completed: 'Hoàn thành',
        pending: 'Đang chờ',
        cancelled: 'Đã hủy'
    };

    // Load initial data
    useEffect(() => {
        loadData();
    }, []);

    // Filter projects when filters change
    useEffect(() => {
        filterProjects();
    }, [searchTerm, statusFilter, siteFilter, projects]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Load projects, sites, stats, users (for leaders), employees (for members), and position options in parallel
            const [projectsResult, sitesResult, statsResult, usersResult, employeesResult, positionResult] = await Promise.all([
                projectService.getAllProjects(),
                projectService.getAllSites(),
                projectService.getProjectStats(),
                userService.getUsers().catch(err => {
                    console.error('Error loading users:', err);
                    return { success: false, message: err.message, data: [] };
                }),
                projectService.getAvailableEmployees(),
                projectService.getPositionOptions()
            ]);

            if (projectsResult.success) {
                setProjects(projectsResult.data || []);
            } else {
                setError(projectsResult.message);
            }

            if (sitesResult.success) {
                setSites(sitesResult.data || []);
            }

            if (statsResult.success) {
                setStats(statsResult.data || stats);
            }

            if (usersResult.success) {
                console.log('Users API response:', usersResult);
                console.log('Users data:', usersResult.data);
                
                // Temporarily show all users for debugging
                console.log('All users (for debugging):', usersResult.data);
                setUsers(usersResult.data || []);
                
                // Filter only users with Manager or Leader role
                const managerUsers = (usersResult.data || []).filter(user => {
                    console.log('Checking user:', user.full_name, 'Role:', user.role);
                    if (!user.role) return false;
                    
                    const roleName = user.role.role_name?.toLowerCase();
                    console.log('Role name (lowercase):', roleName);
                    
                    const isManagerOrLeader = roleName === 'manager' || roleName === 'leader';
                    console.log('Is manager or leader:', isManagerOrLeader);
                    
                    return isManagerOrLeader;
                });
                console.log('Filtered manager users:', managerUsers);
                // setUsers(managerUsers);
            } else {
                console.error('Users API failed:', usersResult);
                setError(`Lỗi khi tải danh sách users: ${usersResult.message}`);
            }

            if (employeesResult.success) {
                setEmployees(employeesResult.data || []);
            }

            if (positionResult.success) {
                setPositionOptions(positionResult.data || []);
            }

        } catch (err) {
            console.error('Error loading data:', err);
            setError('Lỗi khi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const filterProjects = () => {
        let filtered = projects.filter(project => {
            const matchesSearch = project.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                project.description.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesStatus = !statusFilter || project.status === statusFilter;
            const matchesSite = !siteFilter || project.site_id.id === siteFilter;

            return matchesSearch && matchesStatus && matchesSite;
        });

        setFilteredProjects(filtered);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const openModal = (project?: Project) => {
        if (project) {
            setEditingProject(project);
            setFormData({
                project_name: project.project_name,
                description: project.description,
                start_date: project.start_date,
                end_date: project.end_date,
                leader_id: project.leader_id.id,
                site_name: project.site_id.site_name,
                status: project.status,
                priority: project.priority
            });
        } else {
            setEditingProject(null);
            setFormData({
                project_name: '',
                description: '',
                start_date: '',
                end_date: '',
                leader_id: '',
                site_name: '',
                status: 'pending',
                priority: 'medium'
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingProject(null);
        setFormData({
            project_name: '',
            description: '',
            start_date: '',
            end_date: '',
            leader_id: '',
            site_name: '',
            status: 'pending',
            priority: 'medium'
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate dates
        if (new Date(formData.start_date) >= new Date(formData.end_date)) {
            alert('Ngày kết thúc phải sau ngày bắt đầu!');
            return;
        }

        try {
            let result;
        if (editingProject) {
            // Update existing project
                const updateData: UpdateProjectData = {
                    project_name: formData.project_name,
                    description: formData.description,
                    start_date: formData.start_date,
                    end_date: formData.end_date,
                    leader_id: formData.leader_id,
                    site_name: formData.site_name,
                    status: formData.status,
                    priority: formData.priority
                };
                result = await projectService.updateProject(editingProject.id, updateData);
            } else {
                // Create new project
                result = await projectService.createProject(formData);
            }

            if (result.success) {
                alert(editingProject ? 'Đã cập nhật dự án thành công!' : 'Đã tạo dự án mới thành công!');
                await loadData(); // Reload data
                closeModal();
        } else {
                alert(result.message);
            }
        } catch (error) {
            console.error('Error saving project:', error);
            alert('Lỗi khi lưu dự án');
        }
    };

    const viewProject = (project: Project) => {
        alert(`Chi tiết dự án:\n\nTên: ${project.project_name}\nMô tả: ${project.description}\nTrạng thái: ${statusLabels[project.status]}\nTiến độ: ${project.progress}%\nTrưởng dự án: ${project.leader_id.full_name}\nĐịa điểm: ${project.site_id.site_name}`);
    };


    const deleteProject = async (project: Project) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa dự án "${project.project_name}"?`)) {
            try {
                const result = await projectService.deleteProject(project.id);
                if (result.success) {
                    alert('Đã xóa dự án thành công!');
                    await loadData(); // Reload data
                } else {
                    alert(result.message);
                }
            } catch (error) {
                console.error('Error deleting project:', error);
                alert('Lỗi khi xóa dự án');
            }
        }
    };

    // ========== NEW FEATURES ==========
    
    // Update project progress
    const openProgressModal = (project: Project) => {
        setSelectedProject(project);
        setProgressValue(project.progress);
        setIsProgressModalOpen(true);
    };

    const updateProgress = async () => {
        if (!selectedProject) return;
        
        try {
            const result = await projectService.updateProjectProgress(selectedProject.id, progressValue);
            if (result.success) {
                alert('Cập nhật tiến độ thành công!');
                setIsProgressModalOpen(false);
                await loadData();
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error('Error updating progress:', error);
            alert('Lỗi khi cập nhật tiến độ');
        }
    };

    // View project timeline
    const viewTimeline = async (project: Project) => {
        try {
            console.log('Project object:', project);
            console.log('Project ID:', project.id);
            console.log('Project _id:', (project as any)._id);
            const projectId = project.id || (project as any)._id;
            console.log('Using project ID:', projectId);
            
            const result = await projectService.getProjectTimeline(projectId);
            if (result.success) {
                setProjectTimeline(Array.isArray(result.data) ? result.data : []);
                setSelectedProject(project);
                setIsTimelineModalOpen(true);
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error('Error getting timeline:', error);
            alert('Lỗi khi lấy timeline dự án');
        }
    };

    // Site management
    const openSiteModal = () => {
        setSiteFormData({ site_name: '', address: '', description: '' });
        setIsSiteModalOpen(true);
    };

    const createSite = async () => {
        try {
            const result = await projectService.createSite(siteFormData);
            if (result.success) {
                alert('Tạo địa điểm thành công!');
                setIsSiteModalOpen(false);
                await loadData();
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error('Error creating site:', error);
            alert('Lỗi khi tạo địa điểm');
        }
    };

    // Assignment management
    const openAssignmentModal = async (project: Project) => {
        try {
            console.log('Project object for assignments:', project);
            console.log('Project ID:', project.id);
            console.log('Project _id:', (project as any)._id);
            const projectId = project.id || (project as any)._id;
            console.log('Using project ID for assignments:', projectId);
            
            const result = await projectService.getProjectAssignments(projectId);
            if (result.success) {
                setProjectAssignments(result.data || []);
                setSelectedProject(project);
                setIsAssignmentModalOpen(true);
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error('Error getting assignments:', error);
            alert('Lỗi khi lấy danh sách thành viên');
        }
    };

    // Add member to project
    const openAddMemberModal = () => {
        console.log('openAddMemberModal called');
        setMemberFormData({
            user_id: '',
            role_in_project: '',
            start_date: '',
            end_date: ''
        });
        setIsAddMemberModalOpen(true);
    };

    const addMemberToProject = async () => {
        if (!selectedProject) return;
        
        try {
            const assignmentData = {
                project_id: selectedProject.id,
                user_id: memberFormData.user_id,
                role_in_project: memberFormData.role_in_project,
                start_date: memberFormData.start_date,
                end_date: memberFormData.end_date
            };

            const result = await projectService.addProjectAssignment(assignmentData);
            
            if (result.success) {
                alert('Thêm thành viên thành công!');
                setIsAddMemberModalOpen(false);
                // Reload assignments
                await openAssignmentModal(selectedProject);
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error('Error adding member:', error);
            alert('Lỗi khi thêm thành viên');
        }
    };

    // Advanced search
    const performAdvancedSearch = async () => {
        if (!searchTerm.trim()) {
            filterProjects();
            return;
        }

        try {
            const result = await projectService.searchProjects(searchTerm, {
                status: statusFilter,
                site_id: siteFilter
            });
            
            if (result.success) {
                setFilteredProjects(result.data || []);
            } else {
                setError(result.message);
            }
        } catch (error) {
            console.error('Error searching projects:', error);
            setError('Lỗi khi tìm kiếm dự án');
        }
    };

    if (loading) {
        return (
            <div className="project-management-container">
                <div className="loading">
                    <i className="fas fa-spinner fa-spin"></i>
                    <span>Đang tải dữ liệu...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="project-management-container">
                <div className="error">
                    <i className="fas fa-exclamation-triangle"></i>
                    <span>{error}</span>
                    <button onClick={loadData} className="btn btn-primary">
                        <i className="fas fa-refresh"></i> Thử lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="project-management-container">
            {/* Header */}
            <div className="header">
                <div>
                    <h1><i className="fas fa-project-diagram"></i> Quản lý dự án</h1>
                    <div className="breadcrumb">
                        <a href="/admin/dashboard">Dashboard</a> / Quản lý dự án
                    </div>
                </div>
                <a href="/admin/dashboard" className="btn btn-secondary">
                    <i className="fas fa-arrow-left"></i> Quay lại
                </a>
            </div>

            {/* Statistics */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-number">{stats.total}</div>
                    <div className="stat-label">Tổng số dự án</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{stats.active}</div>
                    <div className="stat-label">Đang thực hiện</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{stats.completed}</div>
                    <div className="stat-label">Đã hoàn thành</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{stats.pending}</div>
                    <div className="stat-label">Đang chờ</div>
                </div>
            </div>

            {/* Controls */}
            <div className="controls">
                <div className="search-filters">
                    <div className="search-box">
                        <i className="fas fa-search"></i>
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm dự án..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && performAdvancedSearch()}
                        />
                        <button className="search-btn" onClick={performAdvancedSearch}>
                            <i className="fas fa-search"></i>
                        </button>
                    </div>
                    
                    <select 
                        className="filter-select" 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="active">Đang thực hiện</option>
                        <option value="completed">Hoàn thành</option>
                        <option value="pending">Đang chờ</option>
                        <option value="cancelled">Đã hủy</option>
                    </select>
                    
                    <select 
                        className="filter-select" 
                        value={siteFilter}
                        onChange={(e) => setSiteFilter(e.target.value)}
                    >
                        <option value="">Tất cả địa điểm</option>
                        {sites.map(site => (
                            <option key={site.id} value={site.id}>
                                {site.site_name}
                            </option>
                        ))}
                    </select>
                </div>
                
                <div className="action-buttons">
                    <button className="btn btn-secondary" onClick={openSiteModal}>
                        <i className="fas fa-map-marker-alt"></i> Quản lý địa điểm
                    </button>
                <button className="btn btn-primary" onClick={() => openModal()}>
                    <i className="fas fa-plus"></i> Tạo dự án mới
                </button>
                </div>
            </div>

            {/* Project Grid */}
            <div className="project-grid">
                {filteredProjects.map(project => (
                    <div key={project.id} className="project-card">
                        <div className="project-header">
                            <div className="project-title">{project.project_name}</div>
                            <div className="project-description">{project.description}</div>
                            <div className={`project-status status-${project.status}`}>
                                {statusLabels[project.status]}
                            </div>
                        </div>
                        
                        <div className="project-body">
                            <div className="project-info">
                                <div className="info-item">
                                    <i className="fas fa-calendar"></i>
                                    <span>Bắt đầu: {formatDate(project.start_date)}</span>
                                </div>
                                <div className="info-item">
                                    <i className="fas fa-calendar-check"></i>
                                    <span>Kết thúc: {formatDate(project.end_date)}</span>
                                </div>
                            </div>
                            
                            <div className="project-leader">
                                <div className="leader-avatar">{(project.leader_id.full_name || 'L').charAt(0)}</div>
                                <div className="leader-info">
                                    <div className="leader-name">{project.leader_id.full_name}</div>
                                    <div className="leader-role">Trưởng dự án</div>
                                </div>
                            </div>
                            
                            <div className="project-progress">
                                <div className="progress-label">
                                    <span>Tiến độ</span>
                                    <span>{project.progress}%</span>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: `${project.progress}%` }}></div>
                                </div>
                            </div>
                            
                            <div className="project-site">
                                <div className="site-label">Địa điểm</div>
                                <div className="site-info">
                                    <i className="fas fa-map-marker-alt"></i>
                                    <span>{project.site_id.site_name}</span>
                                </div>
                            </div>
                            
                            <div className="project-actions">
                                <button className="btn btn-sm btn-primary" onClick={() => viewProject(project)}>
                                    <i className="fas fa-eye"></i> Chi tiết
                                </button>
                                <button className="btn btn-sm btn-secondary" onClick={() => openModal(project)}>
                                    <i className="fas fa-edit"></i> Sửa
                                </button>
                                <button className="btn btn-sm btn-success" onClick={() => openProgressModal(project)}>
                                    <i className="fas fa-chart-line"></i> Tiến độ
                                </button>
                                <button className="btn btn-sm btn-info" onClick={() => viewTimeline(project)}>
                                    <i className="fas fa-timeline"></i> Timeline
                                </button>
                                <button className="btn btn-sm btn-warning" onClick={() => openAssignmentModal(project)}>
                                    <i className="fas fa-users"></i> Thành viên
                                </button>
                                <button className="btn btn-sm btn-danger" onClick={() => deleteProject(project)}>
                                    <i className="fas fa-trash"></i> Xóa
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add/Edit Project Modal */}
            {isModalOpen && (
                <div className="modal active" onClick={(e) => e.target === e.currentTarget && closeModal()}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2 className="modal-title">
                                {editingProject ? 'Chỉnh sửa dự án' : 'Tạo dự án mới'}
                            </h2>
                            <span className="close-modal" onClick={closeModal}>&times;</span>
                        </div>
                        
                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">Tên dự án *</label>
                                    <input 
                                        type="text" 
                                        className="form-input" 
                                        value={formData.project_name}
                                        onChange={(e) => setFormData({...formData, project_name: e.target.value})}
                                        required 
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label className="form-label">Trạng thái</label>
                                    <select 
                                        className="form-input" 
                                        value={formData.status}
                                        onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                                    >
                                        <option value="pending">Đang chờ</option>
                                        <option value="active">Đang thực hiện</option>
                                        <option value="completed">Hoàn thành</option>
                                        <option value="cancelled">Đã hủy</option>
                                    </select>
                                </div>
                                
                                <div className="form-group">
                                    <label className="form-label">Ngày bắt đầu *</label>
                                    <input 
                                        type="date" 
                                        className="form-input" 
                                        value={formData.start_date}
                                        onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                                        required 
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label className="form-label">Ngày kết thúc *</label>
                                    <input 
                                        type="date" 
                                        className="form-input" 
                                        value={formData.end_date}
                                        onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                                        required 
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label className="form-label">Trưởng dự án *</label>
                                    <select 
                                        className="form-input" 
                                        value={formData.leader_id}
                                        onChange={(e) => setFormData({...formData, leader_id: e.target.value})}
                                        required
                                    >
                                        <option value="">Chọn trưởng dự án</option>
                                        {users.map(user => (
                                            <option key={user.id} value={user.id}>
                                                {user.full_name} ({user.email})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div className="form-group">
                                    <label className="form-label">Công trường/Địa điểm *</label>
                                    <input 
                                        type="text" 
                                        className="form-input" 
                                        value={formData.site_name || ''}
                                        onChange={(e) => setFormData({...formData, site_name: e.target.value})}
                                        placeholder="Nhập địa điểm dự án"
                                        required
                                    />
                                </div>
                                
                                
                                <div className="form-group">
                                    <label className="form-label">Độ ưu tiên</label>
                                    <select 
                                        className="form-input" 
                                        value={formData.priority}
                                        onChange={(e) => setFormData({...formData, priority: e.target.value as any})}
                                    >
                                        <option value="low">Thấp</option>
                                        <option value="medium">Trung bình</option>
                                        <option value="high">Cao</option>
                                        <option value="urgent">Khẩn cấp</option>
                                    </select>
                                </div>
                                
                                <div className="form-group full-width">
                                    <label className="form-label">Mô tả dự án *</label>
                                    <textarea 
                                        className="form-input" 
                                        rows={4}
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                        required
                                    ></textarea>
                                </div>
                            </div>
                            
                            <div className="form-actions">
                                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                                    Hủy
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    <i className="fas fa-save"></i> {editingProject ? 'Cập nhật' : 'Tạo dự án'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Progress Update Modal */}
            {isProgressModalOpen && selectedProject && (
                <div className="modal active" onClick={(e) => e.target === e.currentTarget && setIsProgressModalOpen(false)}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2 className="modal-title">Cập nhật tiến độ dự án</h2>
                            <span className="close-modal" onClick={() => setIsProgressModalOpen(false)}>&times;</span>
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label">Dự án: {selectedProject.project_name}</label>
                            <div className="progress-input-group">
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="100" 
                                    value={progressValue}
                                    onChange={(e) => setProgressValue(Number(e.target.value))}
                                    className="progress-slider"
                                />
                                <div className="progress-display">
                                    <span className="progress-value">{progressValue}%</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="form-actions">
                            <button type="button" className="btn btn-secondary" onClick={() => setIsProgressModalOpen(false)}>
                                Hủy
                            </button>
                            <button type="button" className="btn btn-primary" onClick={updateProgress}>
                                <i className="fas fa-save"></i> Cập nhật tiến độ
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Timeline Modal */}
            {isTimelineModalOpen && selectedProject && (
                <div className="modal active" onClick={(e) => e.target === e.currentTarget && setIsTimelineModalOpen(false)}>
                    <div className="modal-content timeline-modal">
                        <div className="modal-header">
                            <h2 className="modal-title">Timeline dự án: {selectedProject.project_name}</h2>
                            <span className="close-modal" onClick={() => setIsTimelineModalOpen(false)}>&times;</span>
                        </div>
                        
                        <div className="timeline-container">
                            {projectTimeline.length > 0 ? (
                                <div className="timeline">
                                    {projectTimeline.map((event, index) => (
                                        <div key={index} className="timeline-item">
                                            <div className="timeline-marker"></div>
                                            <div className="timeline-content">
                                                <div className="timeline-date">{event.date}</div>
                                                <div className="timeline-title">{event.title}</div>
                                                <div className="timeline-description">{event.description}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="no-timeline">
                                    <i className="fas fa-clock"></i>
                                    <p>Chưa có timeline cho dự án này</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Add Member Modal */}
            {isAddMemberModalOpen && selectedProject && (
                <div className="modal active" onClick={(e) => e.target === e.currentTarget && setIsAddMemberModalOpen(false)}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2 className="modal-title">Thêm thành viên vào dự án: {selectedProject.project_name}</h2>
                            <span className="close-modal" onClick={() => setIsAddMemberModalOpen(false)}>&times;</span>
                        </div>
                        
                        <div className="modal-body">
                            <div className="form-group">
                                <label htmlFor="user_id">Chọn thành viên:</label>
                                <select
                                    id="user_id"
                                    value={memberFormData.user_id}
                                    onChange={(e) => setMemberFormData({...memberFormData, user_id: e.target.value})}
                                    required
                                >
                                    <option value="">-- Chọn thành viên --</option>
                                    {employees.map(employee => (
                                        <option key={employee.id} value={employee.id}>
                                            {employee.full_name} ({employee.email})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="role_in_project">Vai trò trong dự án:</label>
                                <select
                                    id="role_in_project"
                                    value={memberFormData.role_in_project}
                                    onChange={(e) => setMemberFormData({...memberFormData, role_in_project: e.target.value})}
                                    required
                                >
                                    <option value="">Chọn vai trò...</option>
                                    {positionOptions.map((position) => (
                                        <option key={position.id} value={position.name}>
                                            {position.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="start_date">Ngày bắt đầu:</label>
                                <input
                                    type="date"
                                    id="start_date"
                                    value={memberFormData.start_date}
                                    onChange={(e) => setMemberFormData({...memberFormData, start_date: e.target.value})}
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="end_date">Ngày kết thúc:</label>
                                <input
                                    type="date"
                                    id="end_date"
                                    value={memberFormData.end_date}
                                    onChange={(e) => setMemberFormData({...memberFormData, end_date: e.target.value})}
                                    required
                                />
                            </div>
                        </div>
                        
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setIsAddMemberModalOpen(false)}>
                                Hủy
                            </button>
                            <button className="btn btn-primary" onClick={addMemberToProject}>
                                Thêm thành viên
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Site Management Modal */}
            {isSiteModalOpen && (
                <div className="modal active" onClick={(e) => e.target === e.currentTarget && setIsSiteModalOpen(false)}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2 className="modal-title">Tạo địa điểm mới</h2>
                            <span className="close-modal" onClick={() => setIsSiteModalOpen(false)}>&times;</span>
                        </div>
                        
                        <form onSubmit={(e) => { e.preventDefault(); createSite(); }}>
                            <div className="form-group">
                                <label className="form-label">Tên địa điểm *</label>
                                <input 
                                    type="text" 
                                    className="form-input" 
                                    value={siteFormData.site_name}
                                    onChange={(e) => setSiteFormData({...siteFormData, site_name: e.target.value})}
                                    required 
                                />
                            </div>
                            
                            <div className="form-group">
                                <label className="form-label">Địa chỉ</label>
                                <input 
                                    type="text" 
                                    className="form-input" 
                                    value={siteFormData.address}
                                    onChange={(e) => setSiteFormData({...siteFormData, address: e.target.value})}
                                />
                            </div>
                            
                            <div className="form-group">
                                <label className="form-label">Mô tả</label>
                                <textarea 
                                    className="form-input" 
                                    rows={3}
                                    value={siteFormData.description}
                                    onChange={(e) => setSiteFormData({...siteFormData, description: e.target.value})}
                                ></textarea>
                            </div>
                            
                            <div className="form-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setIsSiteModalOpen(false)}>
                                    Hủy
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    <i className="fas fa-save"></i> Tạo địa điểm
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Assignment Management Modal */}
            {isAssignmentModalOpen && selectedProject && (
                <div className="modal active" onClick={(e) => e.target === e.currentTarget && setIsAssignmentModalOpen(false)}>
                    <div className="modal-content assignment-modal">
                        <div className="modal-header">
                            <h2 className="modal-title">Thành viên dự án: {selectedProject.project_name}</h2>
                            <span className="close-modal" onClick={() => setIsAssignmentModalOpen(false)}>&times;</span>
                        </div>
                        
                        <div className="assignment-container">
                            <div className="project-leader-info">
                                <h3>Trưởng dự án</h3>
                                <div className="leader-card">
                                    <div className="leader-avatar">{(selectedProject.leader_id.full_name || 'L').charAt(0)}</div>
                                    <div className="leader-details">
                                        <div className="leader-name">{selectedProject.leader_id.full_name}</div>
                                        <div className="leader-email">{selectedProject.leader_id.email}</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="team-members">
                                <div className="members-header">
                                    <h3>Thành viên nhóm ({projectAssignments.length})</h3>
                                    <button className="btn btn-sm btn-primary" onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        console.log('Button clicked');
                                        openAddMemberModal();
                                    }}>
                                        <i className="fas fa-plus"></i> Thêm thành viên
                                    </button>
                                </div>
                                {projectAssignments.length > 0 ? (
                                    <div className="members-list">
                                        {projectAssignments.map((assignment) => (
                                            <div key={assignment.id} className="member-card">
                                                <div className="member-avatar">{(assignment.user_id.full_name || 'M').charAt(0)}</div>
                                                <div className="member-details">
                                                    <div className="member-name">{assignment.user_id.full_name}</div>
                                                    <div className="member-role">{assignment.role || 'Thành viên'}</div>
                                                </div>
                                                <div className="member-actions">
                                                    <button className="btn btn-sm btn-danger">
                                                        <i className="fas fa-times"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="no-members">
                                        <i className="fas fa-users"></i>
                                        <p>Chưa có thành viên nào trong dự án</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectManagement;
