import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../../../store';
import { fetchProjectRisks, createRisk, updateRisk, deleteRisk } from '../../../../store/slices/projectRiskSlice';
import type { ProjectRisk, CreateRiskData, UpdateRiskData } from '../../../../types/projectRisk';

interface ProjectRisksProps {
  projectId: string;
}

const ProjectRisks: React.FC<ProjectRisksProps> = ({ projectId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { risks, loading, error } = useSelector((state: RootState) => state.projectRisk);

  useEffect(() => {
    if (projectId) {
      dispatch(fetchProjectRisks(projectId));
    }
  }, [dispatch, projectId]);

  const handleCreateRisk = (data: CreateRiskData) => {
    dispatch(createRisk({ ...data, project_id: projectId }));
  };

  const handleUpdateRisk = (id: string, data: UpdateRiskData) => {
    dispatch(updateRisk({ id, data }));
  };

  const handleDeleteRisk = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa rủi ro này?')) {
      dispatch(deleteRisk(id));
    }
  };

  const getRiskLevelClass = (level: string) => {
    switch (level) {
      case 'high':
        return 'risk-high';
      case 'medium':
        return 'risk-medium';
      case 'low':
        return 'risk-low';
      default:
        return 'risk-default';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'identified':
        return 'status-identified';
      case 'monitoring':
        return 'status-monitoring';
      case 'mitigated':
        return 'status-mitigated';
      case 'resolved':
        return 'status-resolved';
      default:
        return 'status-default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <div className="project-risks-loading">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Đang tải danh sách rủi ro...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="project-risks-error">
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          <h3>Lỗi tải rủi ro</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="project-risks">
      <div className="risks-header">
        <h2>Rủi ro Dự án</h2>
        <button 
          className="btn btn-primary"
          onClick={() => {}}
          disabled
          title="Sắp ra mắt"
        >
          <i className="fas fa-plus"></i>
          Thêm rủi ro
        </button>
      </div>

      {risks.length === 0 ? (
        <div className="risks-empty">
          <div className="empty-state">
            <i className="fas fa-exclamation-triangle"></i>
            <h3>Chưa có rủi ro nào</h3>
            <p>Dự án này chưa có rủi ro nào được xác định.</p>
            <button 
              className="btn btn-primary"
              onClick={() => {}}
              disabled
              title="Sắp ra mắt"
            >
              Xác định rủi ro đầu tiên
            </button>
          </div>
        </div>
      ) : (
        <div className="risks-list">
          {risks.map((risk) => (
            <div key={risk.id} className="risk-card">
              <div className="risk-header">
                <div className="risk-title">
                  <h3>{risk.risk_name}</h3>
                  <div className="risk-badges">
                    <span className={`risk-level ${getRiskLevelClass(risk.risk_level)}`}>
                      {risk.risk_level}
                    </span>
                    <span className={`status-badge ${getStatusBadgeClass(risk.status)}`}>
                      {risk.status}
                    </span>
                  </div>
                </div>
                <div className="risk-actions">
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
                    onClick={() => handleDeleteRisk(risk.id)}
                    title="Xóa"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
              
              <div className="risk-content">
                <p className="risk-description">
                  {risk.description || 'Không có mô tả'}
                </p>
                
                <div className="risk-details">
                  <div className="detail-item">
                    <i className="fas fa-exclamation-circle"></i>
                    <span>Xác suất: {risk.probability}%</span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-bomb"></i>
                    <span>Tác động: {risk.impact}</span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-calculator"></i>
                    <span>Điểm rủi ro: {risk.risk_score}</span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-user"></i>
                    <span>Người phụ trách: {risk.assigned_to || 'N/A'}</span>
                  </div>
                </div>
                
                {risk.mitigation_plan && (
                  <div className="risk-mitigation">
                    <strong>Kế hoạch giảm thiểu:</strong>
                    <p>{risk.mitigation_plan}</p>
                  </div>
                )}
                
                {risk.contingency_plan && (
                  <div className="risk-contingency">
                    <strong>Kế hoạch dự phòng:</strong>
                    <p>{risk.contingency_plan}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectRisks;
