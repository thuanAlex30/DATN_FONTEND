import React, { useState, useEffect } from 'react';
import './ProjectManagement.css';

interface ProjectLeader {
    id: number;
    name: string;
    department: string;
    position: string;
}

interface ProjectSite {
    id: number;
    name: string;
    address: string;
}

interface TeamMember {
    id: number;
    name: string;
    avatar: string;
    role: string;
}

interface ProjectEvidence {
    id: number;
    file_url: string;
    description: string;
}

interface Project {
    id: number;
    name: string;
    description: string;
    status: 'active' | 'completed' | 'pending' | 'cancelled';
    start_date: string;
    end_date: string;
    progress: number;
    leader: ProjectLeader;
    site: ProjectSite;
    team_members: TeamMember[];
    evidences: ProjectEvidence[];
}

const ProjectManagement: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([
        {
            id: 1,
            name: "Xây dựng nhà máy sản xuất",
            description: "Dự án xây dựng nhà máy sản xuất thiết bị điện tử với quy mô lớn",
            status: "active",
            start_date: "2024-01-15",
            end_date: "2024-06-30",
            progress: 65,
            leader: {
                id: 1,
                name: "Nguyễn Văn A",
                department: "Kỹ thuật",
                position: "Quản lý dự án"
            },
            site: {
                id: 1,
                name: "Công trường A",
                address: "123 Đường ABC, Quận 1"
            },
            team_members: [
                { id: 2, name: "Trần B", avatar: "TB", role: "Kỹ sư" },
                { id: 3, name: "Lê C", avatar: "LC", role: "Giám sát" },
            ],
            evidences: [
                { id: 1, file_url: "path/to/file1.jpg", description: "Hình ảnh công trường" },
                { id: 2, file_url: "path/to/file2.pdf", description: "Báo cáo tiến độ" }
            ]
        },
        {
            id: 2,
            name: "Cải tạo hệ thống an toàn",
            description: "Nâng cấp và cải tạo toàn bộ hệ thống an toàn lao động",
            status: "completed",
            start_date: "2023-10-01",
            end_date: "2024-01-31",
            progress: 100,
            leader: {
                id: 2,
                name: "Trần Thị B",
                department: "Kỹ thuật",
                position: "Quản lý dự án"
            },
            site: {
                id: 2,
                name: "Công trường B",
                address: "456 Đường DEF, Quận 2"
            },
            team_members: [
                { id: 4, name: "Nguyễn F", avatar: "NF", role: "Kỹ sư" },
                { id: 5, name: "Vũ G", avatar: "VG", role: "Giám sát" }
            ],
            evidences: [
                { id: 3, file_url: "path/to/file3.jpg", description: "Hình ảnh công trình hoàn thành" },
                { id: 4, file_url: "path/to/file4.pdf", description: "Báo cáo hoàn thành dự án" }
            ]
        },
        {
            id: 3,
            name: "Đào tạo nhân viên mới",
            description: "Chương trình đào tạo toàn diện cho 50 nhân viên mới tuyển dụng",
            status: "pending",
            start_date: "2024-03-01",
            end_date: "2024-04-15",
            progress: 0,
            leader: {
                id: 3,
                name: "Lê Văn C",
                department: "Nhân sự",
                position: "Trưởng phòng Nhân sự"
            },
            site: {
                id: 3,
                name: "Văn phòng",
                address: "789 Đường GHI, Quận 3"
            },
            team_members: [
                { id: 6, name: "Phạm D", avatar: "PD", role: "Giảng viên" },
                { id: 7, name: "Hoàng E", avatar: "HE", role: "Giảng viên" }
            ],
            evidences: []
        }
    ]);

    const [filteredProjects, setFilteredProjects] = useState<Project[]>(projects);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [siteFilter, setSiteFilter] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        status: 'pending' as Project['status'],
        start_date: '',
        end_date: '',
        leaderId: '',
        siteId: '',
        description: ''
    });

    const statusLabels = {
        active: 'Đang thực hiện',
        completed: 'Hoàn thành',
        pending: 'Đang chờ',
        cancelled: 'Đã hủy'
    };

    useEffect(() => {
        filterProjects();
    }, [searchTerm, statusFilter, siteFilter, projects]);

    const filterProjects = () => {
        let filtered = projects.filter(project => {
            const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                project.description.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesStatus = !statusFilter || project.status === statusFilter;
            const matchesSite = !siteFilter || project.site.id.toString() === siteFilter;

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
                name: project.name,
                status: project.status,
                start_date: project.start_date,
                end_date: project.end_date,
                leaderId: project.leader.id.toString(),
                siteId: project.site.id.toString(),
                description: project.description
            });
        } else {
            setEditingProject(null);
            setFormData({
                name: '',
                status: 'pending',
                start_date: '',
                end_date: '',
                leaderId: '',
                siteId: '',
                description: ''
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingProject(null);
        setFormData({
            name: '',
            status: 'pending',
            start_date: '',
            end_date: '',
            leaderId: '',
            siteId: '',
            description: ''
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate dates
        if (new Date(formData.start_date) >= new Date(formData.end_date)) {
            alert('Ngày kết thúc phải sau ngày bắt đầu!');
            return;
        }

        const projectData = {
            ...formData,
            leaderId: parseInt(formData.leaderId) || 0,
            siteId: parseInt(formData.siteId) || 0
        };

        if (editingProject) {
            // Update existing project
            const updatedProjects = projects.map(project => 
                project.id === editingProject.id 
                    ? { ...project, ...projectData }
                    : project
            );
            setProjects(updatedProjects);
            alert('Đã cập nhật dự án thành công!');
        } else {
            // Add new project
            const newProject: Project = {
                id: Math.max(...projects.map(p => p.id)) + 1,
                name: projectData.name,
                description: projectData.description,
                status: projectData.status,
                start_date: projectData.start_date,
                end_date: projectData.end_date,
                progress: 0,
                leader: {
                    id: projectData.leaderId,
                    name: getLeaderName(projectData.leaderId),
                    department: 'Kỹ thuật',
                    position: 'Quản lý dự án'
                },
                site: {
                    id: projectData.siteId,
                    name: getSiteName(projectData.siteId),
                    address: 'Địa chỉ công trường'
                },
                team_members: [],
                evidences: []
            };
            setProjects([...projects, newProject]);
            alert('Đã tạo dự án mới thành công!');
        }

        closeModal();
    };

    const getLeaderName = (leaderId: number) => {
        const leaders: { [key: number]: string } = {
            1: 'Nguyễn Văn A',
            2: 'Trần Thị B',
            3: 'Lê Văn C'
        };
        return leaders[leaderId] || '';
    };

    const getSiteName = (siteId: number) => {
        const sites: { [key: number]: string } = {
            1: 'Công trường A',
            2: 'Công trường B',
            3: 'Văn phòng'
        };
        return sites[siteId] || '';
    };

    const viewProject = (project: Project) => {
        alert(`Chi tiết dự án:\n\nTên: ${project.name}\nMô tả: ${project.description}\nTrạng thái: ${statusLabels[project.status]}\nTiến độ: ${project.progress}%\nTrưởng dự án: ${project.leader.name}\nĐịa điểm: ${project.site.name}`);
    };

    const manageTeam = (project: Project) => {
        const teamList = project.team_members.map(member => member.name).join('\n');
        alert(`Nhóm dự án "${project.name}":\n\nTrưởng dự án: ${project.leader.name}\n\nThành viên:\n${teamList}`);
    };

    const getStats = () => {
        return {
            total: projects.length,
            active: projects.filter(p => p.status === 'active').length,
            completed: projects.filter(p => p.status === 'completed').length,
            pending: projects.filter(p => p.status === 'pending').length
        };
    };

    const stats = getStats();

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
                        />
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
                        <option value="1">Công trường A</option>
                        <option value="2">Công trường B</option>
                        <option value="3">Văn phòng</option>
                    </select>
                </div>
                
                <button className="btn btn-primary" onClick={() => openModal()}>
                    <i className="fas fa-plus"></i> Tạo dự án mới
                </button>
            </div>

            {/* Project Grid */}
            <div className="project-grid">
                {filteredProjects.map(project => (
                    <div key={project.id} className="project-card">
                        <div className="project-header">
                            <div className="project-title">{project.name}</div>
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
                                <div className="leader-avatar">{project.leader.name.charAt(0)}</div>
                                <div className="leader-info">
                                    <div className="leader-name">{project.leader.name}</div>
                                    <div className="leader-role">{project.leader.position}</div>
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
                            
                            <div className="project-team">
                                <div className="team-label">Thành viên ({project.team_members.length})</div>
                                <div className="team-avatars">
                                    {project.team_members.slice(0, 5).map(member => (
                                        <div key={member.id} className="team-avatar" title={member.name}>
                                            {member.avatar}
                                        </div>
                                    ))}
                                    {project.team_members.length > 5 && (
                                        <div className="team-count">+{project.team_members.length - 5}</div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="project-actions">
                                <button className="btn btn-sm btn-primary" onClick={() => viewProject(project)}>
                                    <i className="fas fa-eye"></i> Chi tiết
                                </button>
                                <button className="btn btn-sm btn-warning" onClick={() => openModal(project)}>
                                    <i className="fas fa-edit"></i> Sửa
                                </button>
                                <button className="btn btn-sm btn-success" onClick={() => manageTeam(project)}>
                                    <i className="fas fa-users"></i> Nhóm
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
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        required 
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label className="form-label">Trạng thái</label>
                                    <select 
                                        className="form-input" 
                                        value={formData.status}
                                        onChange={(e) => setFormData({...formData, status: e.target.value as Project['status']})}
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
                                    <label className="form-label">Trưởng dự án</label>
                                    <select 
                                        className="form-input" 
                                        value={formData.leaderId}
                                        onChange={(e) => setFormData({...formData, leaderId: e.target.value})}
                                        required
                                    >
                                        <option value="">Chọn trưởng dự án</option>
                                        <option value="1">Nguyễn Văn A</option>
                                        <option value="2">Trần Thị B</option>
                                        <option value="3">Lê Văn C</option>
                                    </select>
                                </div>
                                
                                <div className="form-group">
                                    <label className="form-label">Công trường/Địa điểm</label>
                                    <select 
                                        className="form-input" 
                                        value={formData.siteId}
                                        onChange={(e) => setFormData({...formData, siteId: e.target.value})}
                                        required
                                    >
                                        <option value="">Chọn địa điểm</option>
                                        <option value="1">Công trường A</option>
                                        <option value="2">Công trường B</option>
                                        <option value="3">Văn phòng</option>
                                    </select>
                                </div>
                                
                                <div className="form-group full-width">
                                    <label className="form-label">Mô tả dự án</label>
                                    <textarea 
                                        className="form-input" 
                                        rows={4}
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    ></textarea>
                                </div>

                                <div className="form-group full-width">
                                    <label className="form-label">Tài liệu đính kèm</label>
                                    <input type="file" className="form-input" multiple />
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
        </div>
    );
};

export default ProjectManagement;
