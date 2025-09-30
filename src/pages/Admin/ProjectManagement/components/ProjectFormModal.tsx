import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../../../store';
import { createProject, updateProject } from '../../../../store/slices/projectSlice';
import type { Project, CreateProjectData, UpdateProjectData } from '../../../../types/project';

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
    site_name: '',
    priority: 'medium',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (project) {
      setFormData({
        project_name: project.project_name,
        description: project.description,
        start_date: project.start_date.split('T')[0],
        end_date: project.end_date.split('T')[0],
        leader_id: project.leader_id?.id || '',
        site_name: project.site_id?.site_name || '',
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

    if (!formData.project_name.trim()) {
      newErrors.project_name = 'Tên dự án là bắt buộc';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Mô tả dự án là bắt buộc';
    }

    if (!formData.start_date) {
      newErrors.start_date = 'Ngày bắt đầu là bắt buộc';
    }

    if (!formData.end_date) {
      newErrors.end_date = 'Ngày kết thúc là bắt buộc';
    }

    if (!formData.leader_id) {
      newErrors.leader_id = 'Trưởng dự án là bắt buộc';
    }

    if (!formData.site_name.trim()) {
      newErrors.site_name = 'Tên địa điểm là bắt buộc';
    }

    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      if (startDate >= endDate) {
        newErrors.end_date = 'Ngày kết thúc phải sau ngày bắt đầu';
      }
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
          site_name: formData.site_name,
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
              <input
                type="text"
                id="leader_id"
                name="leader_id"
                value={formData.leader_id}
                onChange={handleInputChange}
                className={errors.leader_id ? 'error' : ''}
                placeholder="Nhập ID trưởng dự án"
              />
              {errors.leader_id && <span className="error-message">{errors.leader_id}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="site_name">Tên địa điểm *</label>
              <input
                type="text"
                id="site_name"
                name="site_name"
                value={formData.site_name}
                onChange={handleInputChange}
                className={errors.site_name ? 'error' : ''}
                placeholder="Nhập tên địa điểm"
              />
              {errors.site_name && <span className="error-message">{errors.site_name}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="priority">Ưu tiên</label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
            >
              <option value="low">Thấp</option>
              <option value="medium">Trung bình</option>
              <option value="high">Cao</option>
              <option value="urgent">Khẩn cấp</option>
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
