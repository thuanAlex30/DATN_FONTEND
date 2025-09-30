import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../../../store';
import { fetchProjectPhases, createPhase, updatePhase, deletePhase } from '../../../../store/slices/projectPhaseSlice';
import type { ProjectPhase, CreatePhaseData, UpdatePhaseData } from '../../../../types/projectPhase';

interface ProjectPhasesProps {
  projectId: string;
}

const ProjectPhases: React.FC<ProjectPhasesProps> = ({ projectId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { phases, loading, error } = useSelector((state: RootState) => state.projectPhase);

  useEffect(() => {
    if (projectId) {
      dispatch(fetchProjectPhases(projectId));
    }
  }, [dispatch, projectId]);

  const handleCreatePhase = (data: CreatePhaseData) => {
    dispatch(createPhase({ ...data, project_id: projectId }));
  };

  const handleUpdatePhase = (id: string, data: UpdatePhaseData) => {
    dispatch(updatePhase({ id, data }));
  };

  const handleDeletePhase = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa giai đoạn này?')) {
      dispatch(deletePhase(id));
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'status-completed';
      case 'in_progress':
        return 'status-in-progress';
      case 'pending':
        return 'status-pending';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <div className="project-phases-loading">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Đang tải danh sách giai đoạn...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="project-phases-error">
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          <h3>Lỗi tải giai đoạn</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="project-phases">
      <div className="phases-header">
        <h2>Giai đoạn Dự án</h2>
        <button 
          className="btn btn-primary"
          onClick={() => {/* TODO: Open create phase modal */}}
        >
          <i className="fas fa-plus"></i>
          Thêm giai đoạn
        </button>
      </div>

      {phases?.length === 0 ? (
        <div className="phases-empty">
          <div className="empty-state">
            <i className="fas fa-layer-group"></i>
            <h3>Chưa có giai đoạn nào</h3>
            <p>Dự án này chưa có giai đoạn nào được tạo.</p>
            <button 
              className="btn btn-primary"
              onClick={() => {/* TODO: Open create phase modal */}}
            >
              Tạo giai đoạn đầu tiên
            </button>
          </div>
        </div>
      ) : (
        <div className="phases-list">
          {phases?.map((phase) => (
            <div key={phase.id} className="phase-card">
              <div className="phase-header">
                <div className="phase-title">
                  <h3>{phase.phase_name}</h3>
                  <span className={`status-badge ${getStatusBadgeClass(phase.status)}`}>
                    {phase.status}
                  </span>
                </div>
                <div className="phase-actions">
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => {/* TODO: Open edit phase modal */}}
                    title="Chỉnh sửa"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDeletePhase(phase.id)}
                    title="Xóa"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
              
              <div className="phase-content">
                <p className="phase-description">
                  {phase.description || 'Không có mô tả'}
                </p>
                
                <div className="phase-details">
                  <div className="detail-item">
                    <i className="fas fa-calendar-alt"></i>
                    <span>
                      {formatDate(phase.start_date)} - {formatDate(phase.end_date)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-percent"></i>
                    <span>Tiến độ: {phase.progress}%</span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-user"></i>
                    <span>Người phụ trách: {phase.assigned_to || 'N/A'}</span>
                  </div>
                </div>
                
                <div className="phase-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${phase.progress}%` }}
                    ></div>
                  </div>
                  <span className="progress-text">{phase.progress}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectPhases;
