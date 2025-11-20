import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { VALIDATION_RULES } from '../../../../constants/project';
import type { RootState, AppDispatch } from '../../../../store';
import { createProject, updateProject } from '../../../../store/slices/projectSlice';
import type { Project, CreateProjectData, UpdateProjectData } from '../../../../types/project';
import { message } from 'antd';

interface ProjectFormModalProps {
  project?: Project | null;
  onClose: () => void;
  onSuccess: () => void;
}

const ProjectFormModal: React.FC<ProjectFormModalProps> = ({
  project,
  onClose,
  onSuccess,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.project);

  const [formData, setFormData] = useState<CreateProjectData>({
    project_name: '',
    description: '',
    start_date: '',
    end_date: '',
    leader_id: '',
    site_id: '',
    project_type: 'CONSTRUCTION',
    priority: 'MEDIUM',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sites, setSites] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Load sites and users data
  useEffect(() => {
    const loadData = async () => {
      setLoadingData(true);
      try {
        // Load sites
        const { default: projectService } = await import('../../../../services/projectService');
        const sitesResponse = await projectService.getAllSites({ is_active: true });
        
        if (sitesResponse.success && sitesResponse.data) {
          setSites(sitesResponse.data);
        }

        // Load users (managers)
        const { default: userService } = await import('../../../../services/userService');
        const usersResponse = await userService.getUsers({ 
          role_id: 'manager',
          is_active: true 
        });
        
        if (usersResponse.success && usersResponse.data) {
          setUsers(usersResponse.data.users);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        message.error('Lỗi khi tải dữ liệu');
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (project) {
      setFormData({
        project_name: project.project_name,
        description: project.description,
        start_date: project.start_date.split('T')[0],
        end_date: project.end_date.split('T')[0],
        leader_id: project.leader_id?.id || '',
        site_id: project.site_id?.id || '',
        project_type: project.project_type || 'CONSTRUCTION',
        priority: project.priority,
      });
    }
  }, [project]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate project name
    if (!formData.project_name.trim()) {
      newErrors.project_name = 'Tên dự án là bắt buộc';
    } else if (formData.project_name.trim().length < VALIDATION_RULES.PROJECT_NAME_MIN_LENGTH) {
      newErrors.project_name = `Tên dự án phải có ít nhất ${VALIDATION_RULES.PROJECT_NAME_MIN_LENGTH} ký tự`;
    } else if (formData.project_name.trim().length > VALIDATION_RULES.PROJECT_NAME_MAX_LENGTH) {
      newErrors.project_name = `Tên dự án không được vượt quá ${VALIDATION_RULES.PROJECT_NAME_MAX_LENGTH} ký tự`;
    }

    // Validate description
    if (!formData.description.trim()) {
      newErrors.description = 'Mô tả dự án là bắt buộc';
    } else if (formData.description.trim().length < VALIDATION_RULES.DESCRIPTION_MIN_LENGTH) {
      newErrors.description = `Mô tả dự án phải có ít nhất ${VALIDATION_RULES.DESCRIPTION_MIN_LENGTH} ký tự`;
    } else if (formData.description.trim().length > VALIDATION_RULES.DESCRIPTION_MAX_LENGTH) {
      newErrors.description = `Mô tả dự án không được vượt quá ${VALIDATION_RULES.DESCRIPTION_MAX_LENGTH} ký tự`;
    }

    // Validate dates
    if (!formData.start_date) {
      newErrors.start_date = 'Ngày bắt đầu là bắt buộc';
    } else {
      const startDate = new Date(formData.start_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (startDate < today) {
        newErrors.start_date = 'Ngày bắt đầu không được là ngày trong quá khứ';
      }
    }

    if (!formData.end_date) {
      newErrors.end_date = 'Ngày kết thúc là bắt buộc';
    } else {
      const endDate = new Date(formData.end_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (endDate < today) {
        newErrors.end_date = 'Ngày kết thúc không được là ngày trong quá khứ';
      }
    }

    // Validate date relationship
    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      
      if (startDate >= endDate) {
        newErrors.end_date = 'Ngày kết thúc phải sau ngày bắt đầu';
      }
      
      // Check if project duration is reasonable (not more than 5 years)
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > VALIDATION_RULES.MAX_PROJECT_DURATION_DAYS) {
        newErrors.end_date = `Thời gian dự án không được vượt quá ${Math.floor(VALIDATION_RULES.MAX_PROJECT_DURATION_DAYS / 365)} năm`;
      }
    }

    // Validate leader
    if (!formData.leader_id) {
      newErrors.leader_id = 'Trưởng dự án là bắt buộc';
    }

    // Validate site (optional but if provided, should be valid)
    if (formData.site_id && formData.site_id === '') {
      newErrors.site_id = 'Vui lòng chọn địa điểm dự án hoặc để trống';
    }

    // Validate project type
    if (!formData.project_type) {
      newErrors.project_type = 'Loại dự án là bắt buộc';
    }

    // Validate priority
    if (!formData.priority) {
      newErrors.priority = 'Mức độ ưu tiên là bắt buộc';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      if (project) {
        const updateData: UpdateProjectData = {
          project_name: formData.project_name,
          description: formData.description,
          start_date: formData.start_date,
          end_date: formData.end_date,
          leader_id: formData.leader_id,
          
          site_id: formData.site_id || undefined,
          project_type: formData.project_type,
          priority: formData.priority,
        };
        await dispatch(updateProject({ id: project.id, data: updateData }));
      } else {
        await dispatch(createProject(formData));
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{project ? 'Chỉnh sửa Dự án' : 'Tạo Dự án Mới'}</h2>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        {loadingData && (
          <div className="loading-indicator">
            <i className="fas fa-spinner fa-spin"></i> Đang tải dữ liệu...
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label htmlFor="project_name">Tên dự án *</label>
            <input
              type="text"
              id="project_name"
              name="project_name"
              value={formData.project_name}
              onChange={handleInputChange}
              className={errors.project_name ? 'error' : ''}
              placeholder="Nhập tên dự án"
            />
            {errors.project_name && <span className="error-message">{errors.project_name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Mô tả dự án *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className={errors.description ? 'error' : ''}
              placeholder="Nhập mô tả dự án"
              rows={3}
            />
            {errors.description && <span className="error-message">{errors.description}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="start_date">Ngày bắt đầu *</label>
              <input
                type="date"
                id="start_date"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
                className={errors.start_date ? 'error' : ''}
              />
              {errors.start_date && <span className="error-message">{errors.start_date}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="end_date">Ngày kết thúc *</label>
              <input
                type="date"
                id="end_date"
                name="end_date"
                value={formData.end_date}
                onChange={handleInputChange}
                className={errors.end_date ? 'error' : ''}
              />
              {errors.end_date && <span className="error-message">{errors.end_date}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="leader_id">Trưởng dự án *</label>
              <select
                id="leader_id"
                name="leader_id"
                value={formData.leader_id}
                onChange={handleInputChange}
                className={errors.leader_id ? 'error' : ''}
                disabled={loadingData}
              >
                <option value="">Chọn trưởng dự án</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.full_name} ({user.email})
                  </option>
                ))}
              </select>
              {errors.leader_id && <span className="error-message">{errors.leader_id}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="site_id">Địa điểm dự án *</label>
              <select
                id="site_id"
                name="site_id"
                value={formData.site_id || ''}
                onChange={handleInputChange}
                className={errors.site_id ? 'error' : ''}
                disabled={loadingData}
              >
                <option value="">Chọn địa điểm dự án</option>
                {sites.map(site => (
                  <option key={site.id} value={site.id}>
                    {site.site_name} - {site.address}
                  </option>
                ))}
              </select>
              {errors.site_id && <span className="error-message">{errors.site_id}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="project_type">Loại dự án *</label>
              <select
                id="project_type"
                name="project_type"
                value={formData.project_type}
                onChange={handleInputChange}
                className={errors.project_type ? 'error' : ''}
              >
                <option value="CONSTRUCTION">Xây dựng</option>
                <option value="MAINTENANCE">Bảo trì</option>
                <option value="RENOVATION">Cải tạo</option>
                <option value="INSPECTION">Kiểm tra</option>
                <option value="SAFETY">An toàn</option>
                <option value="TRAINING">Đào tạo</option>
              </select>
              {errors.project_type && <span className="error-message">{errors.project_type}</span>}
            </div>

          </div>

          <div className="form-group">
            <label htmlFor="priority">Mức độ ưu tiên</label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
            >
              <option value="LOW">Thấp</option>
              <option value="MEDIUM">Trung bình</option>
              <option value="HIGH">Cao</option>
              <option value="URGENT">Khẩn cấp</option>
            </select>
          </div>
        </form>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-outline"
            onClick={onClose}
            disabled={loading}
          >
            Hủy
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                {project ? 'Đang cập nhật...' : 'Đang tạo...'}
              </>
            ) : (
              <>
                <i className="fas fa-save"></i>
                {project ? 'Cập nhật' : 'Tạo dự án'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectFormModal;
