import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../../../store';
import { fetchProjectChangeRequests, createChangeRequest, updateChangeRequest, deleteChangeRequest } from '../../../../store/slices/projectChangeRequestSlice';
import type { ProjectChangeRequest, CreateChangeRequestData, UpdateChangeRequestData } from '../../../../types/projectChangeRequest';
import CreateChangeRequestModal from './CreateChangeRequestModal';

interface ProjectChangeRequestsProps {
  projectId: string;
}

const ProjectChangeRequests: React.FC<ProjectChangeRequestsProps> = ({ projectId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { changeRequests, loading, error } = useSelector((state: RootState) => state.projectChangeRequest);
  const [createModalVisible, setCreateModalVisible] = useState(false);

  useEffect(() => {
    if (projectId) {
      dispatch(fetchProjectChangeRequests(projectId));
    }
  }, [dispatch, projectId]);

  const handleCreateChangeRequest = (data: CreateChangeRequestData) => {
    dispatch(createChangeRequest({ ...data, project_id: projectId }));
  };

  const handleUpdateChangeRequest = (id: string, data: UpdateChangeRequestData) => {
    dispatch(updateChangeRequest({ id, data }));
  };

  const handleDeleteChangeRequest = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa yêu cầu thay đổi này?')) {
      dispatch(deleteChangeRequest(id));
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'approved':
        return 'status-approved';
      case 'rejected':
        return 'status-rejected';
      case 'implemented':
        return 'status-implemented';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-default';
    }
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      case 'low':
        return 'priority-low';
      default:
        return 'priority-default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <div className="project-change-requests-loading">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Đang tải danh sách yêu cầu thay đổi...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="project-change-requests-error">
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          <h3>Lỗi tải yêu cầu thay đổi</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="project-change-requests">
      <div className="change-requests-header">
        <h2>Yêu cầu Thay đổi Dự án</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setCreateModalVisible(true)}
          title="Tạo yêu cầu thay đổi mới"
        >
          <i className="fas fa-plus"></i>
          Tạo yêu cầu
        </button>
      </div>

      {changeRequests.length === 0 ? (
        <div className="change-requests-empty">
          <div className="empty-state">
            <i className="fas fa-exchange-alt"></i>
            <h3>Chưa có yêu cầu thay đổi nào</h3>
            <p>Dự án này chưa có yêu cầu thay đổi nào được tạo.</p>
            <button 
              className="btn btn-primary"
              onClick={() => setCreateModalVisible(true)}
              title="Tạo yêu cầu thay đổi đầu tiên"
            >
              Tạo yêu cầu đầu tiên
            </button>
          </div>
        </div>
      ) : (
        <div className="change-requests-list">
          {changeRequests.map((request) => (
            <div key={request.id} className="change-request-card">
              <div className="change-request-header">
                <div className="change-request-title">
                  <h3>{request.title}</h3>
                  <div className="change-request-badges">
                    <span className={`status-badge ${getStatusBadgeClass(request.status)}`}>
                      {request.status}
                    </span>
                    <span className={`priority-badge ${getPriorityBadgeClass(request.priority)}`}>
                      {request.priority}
                    </span>
                  </div>
                </div>
                <div className="change-request-actions">
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => handleEditChangeRequest(changeRequest)}
                    title="Chỉnh sửa yêu cầu thay đổi"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDeleteChangeRequest(request.id)}
                    title="Xóa"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
              
              <div className="change-request-content">
                <p className="change-request-description">
                  {request.description || 'Không có mô tả'}
                </p>
                
                <div className="change-request-details">
                  <div className="detail-item">
                    <i className="fas fa-calendar-alt"></i>
                    <span>Ngày tạo: {formatDate(request.submitted_at || request.created_at)}</span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-user"></i>
                    <span>Người yêu cầu: {request.requested_by || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-user-check"></i>
                    <span>Người phê duyệt: {request.approved_by || 'Chưa phê duyệt'}</span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-dollar-sign"></i>
                  </div>
                </div>
                
                <div className="change-request-sections">
                  <div className="section">
                    <h4>Lý do thay đổi</h4>
                    <p>{request.description || 'Không có thông tin'}</p>
                  </div>
                  
                  <div className="section">
                    <h4>Tác động</h4>
                    <p>{request.impact_assessment || 'Không có thông tin'}</p>
                  </div>
                  
                  <div className="section">
                    <h4>Kế hoạch thực hiện</h4>
                    <p>{request.implementation_plan || 'Không có thông tin'}</p>
                  </div>
                  
                  {request.approval_notes && (
                    <div className="section">
                      <h4>Ghi chú phê duyệt</h4>
                      <p>{request.approval_notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateChangeRequestModal
        visible={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        onSubmit={handleCreateChangeRequest}
        projectId={projectId}
      />
    </div>
  );
};

export default ProjectChangeRequests;
