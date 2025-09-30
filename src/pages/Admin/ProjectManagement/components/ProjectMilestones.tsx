import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../../../store';
import { fetchProjectMilestones, deleteMilestone } from '../../../../store/slices/projectMilestoneSlice';

interface ProjectMilestonesProps {
  projectId: string;
}

const ProjectMilestones: React.FC<ProjectMilestonesProps> = ({ projectId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { milestones, loading, error } = useSelector((state: RootState) => state.projectMilestone);

  useEffect(() => {
    if (projectId) {
      dispatch(fetchProjectMilestones(projectId));
    }
  }, [dispatch, projectId]);


  const handleDeleteMilestone = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa milestone này?')) {
      dispatch(deleteMilestone(id));
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'status-completed';
      case 'IN_PROGRESS':
        return 'status-in-progress';
      case 'PLANNED':
        return 'status-pending';
      case 'CANCELLED':
        return 'status-cancelled';
      case 'OVERDUE':
        return 'status-overdue';
      default:
        return 'status-default';
    }
  };

  const getProgressFromStatus = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 100;
      case 'IN_PROGRESS':
        return 50;
      case 'PLANNED':
        return 0;
      case 'CANCELLED':
        return 0;
      case 'OVERDUE':
        return 75;
      default:
        return 0;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <div className="project-milestones-loading">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Đang tải danh sách milestone...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="project-milestones-error">
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          <h3>Lỗi tải milestone</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="project-milestones">
      <div className="milestones-header">
        <h2>Milestone Dự án</h2>
        <button 
          className="btn btn-primary"
          onClick={() => {}}
          disabled
          title="Sắp ra mắt"
        >
          <i className="fas fa-plus"></i>
          Thêm milestone
        </button>
      </div>

      {milestones?.length === 0 ? (
        <div className="milestones-empty">
          <div className="empty-state">
            <i className="fas fa-flag-checkered"></i>
            <h3>Chưa có milestone nào</h3>
            <p>Dự án này chưa có milestone nào được tạo.</p>
            <button 
              className="btn btn-primary"
              onClick={() => {}}
              disabled
              title="Sắp ra mắt"
            >
              Tạo milestone đầu tiên
            </button>
          </div>
        </div>
      ) : (
        <div className="milestones-list">
          {milestones?.map((milestone) => (
            <div key={milestone.id} className="milestone-card">
              <div className="milestone-header">
                <div className="milestone-title">
                  <h3>{milestone.milestone_name}</h3>
                  <span className={`status-badge ${getStatusBadgeClass(milestone.status)}`}>
                    {milestone.status}
                  </span>
                </div>
                <div className="milestone-actions">
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
                    onClick={() => handleDeleteMilestone(milestone.id)}
                    title="Xóa"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
              
              <div className="milestone-content">
                <p className="milestone-description">
                  {milestone.description || 'Không có mô tả'}
                </p>
                
                <div className="milestone-details">
                  <div className="detail-item">
                    <i className="fas fa-calendar-alt"></i>
                    <span>
                      {formatDate(milestone.planned_date)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-percent"></i>
                    <span>Tiến độ: {getProgressFromStatus(milestone.status)}%</span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-user"></i>
                    <span>Người phụ trách: {milestone.responsible_user_id || 'N/A'}</span>
                  </div>
                </div>
                
                <div className="milestone-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${getProgressFromStatus(milestone.status)}%` }}
                    ></div>
                  </div>
                  <span className="progress-text">{getProgressFromStatus(milestone.status)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectMilestones;
