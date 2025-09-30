import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../../../store';
import { fetchProjectResources, deleteResource } from '../../../../store/slices/projectResourceSlice';

interface ProjectResourcesProps {
  projectId: string;
}

const ProjectResources: React.FC<ProjectResourcesProps> = ({ projectId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { resources, loading, error } = useSelector((state: RootState) => state.projectResource);

  useEffect(() => {
    if (projectId) {
      dispatch(fetchProjectResources(projectId));
    }
  }, [dispatch, projectId]);



  const handleDeleteResource = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tài nguyên này?')) {
      dispatch(deleteResource(id));
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'available':
        return 'status-available';
      case 'allocated':
        return 'status-allocated';
      case 'in_use':
        return 'status-in-use';
      case 'maintenance':
        return 'status-maintenance';
      default:
        return 'status-default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'equipment':
        return 'fas fa-tools';
      case 'material':
        return 'fas fa-cube';
      case 'personnel':
        return 'fas fa-user';
      case 'facility':
        return 'fas fa-building';
      default:
        return 'fas fa-cube';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <div className="project-resources-loading">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Đang tải danh sách tài nguyên...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="project-resources-error">
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          <h3>Lỗi tải tài nguyên</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="project-resources">
      <div className="resources-header">
        <h2>Tài nguyên Dự án</h2>
        <button 
          className="btn btn-primary"
          onClick={() => {}}
          disabled
          title="Sắp ra mắt"
        >
          <i className="fas fa-plus"></i>
          Thêm tài nguyên
        </button>
      </div>

      {!resources || resources.length === 0 ? (
        <div className="resources-empty">
          <div className="empty-state">
            <i className="fas fa-cubes"></i>
            <h3>Chưa có tài nguyên nào</h3>
            <p>Dự án này chưa có tài nguyên nào được tạo.</p>
            <button 
              className="btn btn-primary"
              onClick={() => {}}
              disabled
              title="Sắp ra mắt"
            >
              Tạo tài nguyên đầu tiên
            </button>
          </div>
        </div>
      ) : (
        <div className="resources-list">
          {resources?.map((resource) => (
            <div key={resource.id} className="resource-card">
              <div className="resource-header">
                <div className="resource-title">
                  <div className="resource-icon">
                    <i className={getTypeIcon(resource.resource_type)}></i>
                  </div>
                  <div className="resource-info">
                    <h3>{resource.resource_name}</h3>
                    <span className="resource-type">{resource.resource_type}</span>
                  </div>
                  <span className={`status-badge ${getStatusBadgeClass(resource.status)}`}>
                    {resource.status}
                  </span>
                </div>
                <div className="resource-actions">
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => {}}
                    disabled
                    title="Sắp ra mắt"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDeleteResource(resource.id)}
                    title="Xóa"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
              
              <div className="resource-content">
                <p className="resource-description">
                  {resource.description || 'Không có mô tả'}
                </p>
                
                <div className="resource-details">
                  <div className="detail-item">
                    <i className="fas fa-hashtag"></i>
                    <span>Số lượng: {resource.quantity}</span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-dollar-sign"></i>
                    <span>Chi phí đơn vị: {resource.unit_cost?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-calculator"></i>
                    <span>Tổng chi phí: {resource.total_cost?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-calendar-alt"></i>
                    <span>Từ: {formatDate(resource.availability_start)}</span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-calendar-alt"></i>
                    <span>Đến: {formatDate(resource.availability_end)}</span>
                  </div>
                </div>
                
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectResources;
