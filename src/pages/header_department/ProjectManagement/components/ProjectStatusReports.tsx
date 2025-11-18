import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../../../store';
import { fetchProjectStatusReports, createStatusReport, updateStatusReport, deleteStatusReport } from '../../../../store/slices/projectStatusReportSlice';
import type { ProjectStatusReport, CreateStatusReportData, UpdateStatusReportData } from '../../../../types/projectStatusReport';

interface ProjectStatusReportsProps {
  projectId: string;
}

const ProjectStatusReports: React.FC<ProjectStatusReportsProps> = ({ projectId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { statusReports, loading, error } = useSelector((state: RootState) => state.projectStatusReport);

  useEffect(() => {
    if (projectId) {
      dispatch(fetchProjectStatusReports(projectId));
    }
  }, [dispatch, projectId]);

  const handleCreateStatusReport = (data: CreateStatusReportData) => {
    dispatch(createStatusReport({ ...data, project_id: projectId }));
  };

  const handleUpdateStatusReport = (id: string, data: UpdateStatusReportData) => {
    dispatch(updateStatusReport({ id, data }));
  };

  const handleDeleteStatusReport = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa báo cáo này?')) {
      dispatch(deleteStatusReport(id));
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'on_track':
        return 'status-on-track';
      case 'at_risk':
        return 'status-at-risk';
      case 'behind_schedule':
        return 'status-behind-schedule';
      case 'completed':
        return 'status-completed';
      default:
        return 'status-default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <div className="project-status-reports-loading">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Đang tải danh sách báo cáo...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="project-status-reports-error">
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          <h3>Lỗi tải báo cáo</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="project-status-reports">
      <div className="status-reports-header">
        <h2>Báo cáo Tình trạng Dự án</h2>
        <button 
          className="btn btn-primary"
          onClick={() => {
            // TODO: Implement create status report functionality
            console.log('Create status report clicked');
          }}
        >
          <i className="fas fa-plus"></i>
          Tạo báo cáo
        </button>
      </div>

      {statusReports.length === 0 ? (
        <div className="status-reports-empty">
          <div className="empty-state">
            <i className="fas fa-chart-line"></i>
            <h3>Chưa có báo cáo nào</h3>
            <p>Dự án này chưa có báo cáo tình trạng nào được tạo.</p>
            <button 
              className="btn btn-primary"
              onClick={() => {
                // TODO: Implement create status report functionality
                console.log('Create first status report clicked');
              }}
            >
              Tạo báo cáo đầu tiên
            </button>
          </div>
        </div>
      ) : (
        <div className="status-reports-list">
          {statusReports.map((report) => (
            <div key={report.id} className="status-report-card">
              <div className="status-report-header">
                <div className="status-report-title">
                  <h3>Báo cáo tuần {report.week_number}</h3>
                  <span className={`status-badge ${getStatusBadgeClass(report.overall_status)}`}>
                    {report.overall_status}
                  </span>
                </div>
                <div className="status-report-actions">
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => {
                      // TODO: Implement edit status report functionality
                      console.log('Edit status report clicked', report.id);
                    }}
                    title="Chỉnh sửa báo cáo"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDeleteStatusReport(report.id)}
                    title="Xóa"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
              
              <div className="status-report-content">
                <div className="report-meta">
                  <div className="meta-item">
                    <i className="fas fa-calendar-alt"></i>
                    <span>Tuần: {formatDate(report.report_date)}</span>
                  </div>
                  <div className="meta-item">
                    <i className="fas fa-user"></i>
                    <span>Người báo cáo: {report.reported_by || 'N/A'}</span>
                  </div>
                  <div className="meta-item">
                    <i className="fas fa-percent"></i>
                    <span>Tiến độ: {report.progress_percentage}%</span>
                  </div>
                </div>
                
                <div className="report-sections">
                  <div className="section">
                    <h4>Hoàn thành tuần này</h4>
                    <p>{report.completed_work || 'Không có thông tin'}</p>
                  </div>
                  
                  <div className="section">
                    <h4>Kế hoạch tuần tới</h4>
                    <p>{report.planned_work || 'Không có thông tin'}</p>
                  </div>
                  
                  <div className="section">
                    <h4>Vấn đề và rủi ro</h4>
                    <p>{report.issues_risks || 'Không có vấn đề nào'}</p>
                  </div>
                  
                  <div className="section">
                    <h4>Ghi chú</h4>
                    <p>{report.notes || 'Không có ghi chú'}</p>
                  </div>
                </div>
                
                <div className="report-metrics">
                  <div className="metric">
                    <span className="metric-label">Tiến độ dự án:</span>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${report.progress_percentage}%` }}
                      ></div>
                    </div>
                    <span className="metric-value">{report.progress_percentage}%</span>
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

export default ProjectStatusReports;
