import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import type { RootState, AppDispatch } from '../../../../store';
import { fetchProjectStats } from '../../../../store/slices/projectSlice';
import { fetchProjectPhases } from '../../../../store/slices/projectPhaseSlice';
import { fetchProjectTasks } from '../../../../store/slices/projectTaskSlice';
import { fetchProjectMilestones } from '../../../../store/slices/projectMilestoneSlice';
import { fetchProjectRisks } from '../../../../store/slices/projectRiskSlice';
import { fetchProjectResources } from '../../../../store/slices/projectResourceSlice';

interface ProjectOverviewProps {
  projectId: string;
}

const ProjectOverview: React.FC<ProjectOverviewProps> = ({ projectId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { selectedProject, assignments, projects } = useSelector((state: RootState) => state.project);
  const { phases } = useSelector((state: RootState) => state.projectPhase);
  const { tasks } = useSelector((state: RootState) => state.projectTask);
  const { milestones } = useSelector((state: RootState) => state.projectMilestone);
  const { risks } = useSelector((state: RootState) => state.projectRisk);
  const { resources } = useSelector((state: RootState) => state.projectResource);
  
  const [projectFlow] = useState({
    currentPhase: 'PLANNING',
    completedSteps: [] as string[],
    nextSteps: [] as string[]
  });

  useEffect(() => {
    dispatch(fetchProjectStats());
    if (projectId) {
      dispatch(fetchProjectPhases(projectId));
      dispatch(fetchProjectTasks(projectId));
      dispatch(fetchProjectMilestones(projectId));
      dispatch(fetchProjectRisks(projectId));
      dispatch(fetchProjectResources(projectId));
    }
  }, [dispatch, projectId]);

  // Fallback: use project from list if selectedProject not yet populated
  const project = selectedProject || projects?.find((p: any) => p.id === projectId);

  if (!project) {
    return (
      <div className="project-overview-loading">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Đang tải thông tin dự án...</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  // const getDaysRemaining = () => {
  //   const endDate = new Date(selectedProject.end_date);
  //   const today = new Date();
  //   const diffTime = endDate.getTime() - today.getTime();
  //   const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  //   return diffDays;
  // };

  // const daysRemaining = getDaysRemaining();

  return (
    <div className="project-overview">
      {/* Project Flow Status */}
      <div className="project-flow-status">
        <h2>Trạng thái Luồng Dự án</h2>
        <div className="flow-timeline">
          <div className={`flow-step ${projectFlow.currentPhase === 'PLANNING' ? 'active' : ''} ${projectFlow.completedSteps.includes('PLANNING') ? 'completed' : ''}`}>
            <div className="step-icon">
              <i className="fas fa-clipboard-list"></i>
            </div>
            <div className="step-content">
              <h4>Khởi tạo Dự án</h4>
              <p>Project Registration → Site Setup → Phase Planning</p>
            </div>
          </div>
          
          <div className={`flow-step ${projectFlow.currentPhase === 'EXECUTION' ? 'active' : ''} ${projectFlow.completedSteps.includes('EXECUTION') ? 'completed' : ''}`}>
            <div className="step-icon">
              <i className="fas fa-play-circle"></i>
            </div>
            <div className="step-content">
              <h4>Quản lý Tiến độ</h4>
              <p>Task Assignment → Progress Tracking → Milestone Management</p>
            </div>
          </div>
          
          <div className={`flow-step ${projectFlow.currentPhase === 'MONITORING' ? 'active' : ''} ${projectFlow.completedSteps.includes('MONITORING') ? 'completed' : ''}`}>
            <div className="step-icon">
              <i className="fas fa-chart-line"></i>
            </div>
            <div className="step-content">
              <h4>Giám sát & Báo cáo</h4>
              <p>Status Reporting → Change Management → Quality Control</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="overview-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-percent"></i>
          </div>
          <div className="stat-content">
            <div className="stat-number">{project.progress}%</div>
            <div className="stat-label">Tiến độ</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-layer-group"></i>
          </div>
          <div className="stat-content">
            <div className="stat-number">{phases?.length || 0}</div>
            <div className="stat-label">Giai đoạn</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-tasks"></i>
          </div>
          <div className="stat-content">
            <div className="stat-number">{tasks?.length || 0}</div>
            <div className="stat-label">Nhiệm vụ</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <div className="stat-content">
            <div className="stat-number">{risks?.length || 0}</div>
            <div className="stat-label">Rủi ro</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-cubes"></i>
          </div>
          <div className="stat-content">
            <div className="stat-number">{resources?.length || 0}</div>
            <div className="stat-label">Tài nguyên</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-calendar-check"></i>
          </div>
          <div className="stat-content">
            <div className="stat-number">{milestones?.length || 0}</div>
            <div className="stat-label">Milestone</div>
          </div>
        </div>
      </div>

      {/* Project Details */}
      <div className="overview-details">
        <div className="details-section">
          <h3>Thông tin dự án</h3>
          <div className="details-grid">
            <div className="detail-item">
              <label>Tên dự án:</label>
              <span>{project.project_name}</span>
            </div>
            <div className="detail-item">
              <label>Trạng thái:</label>
              <span className={`status-badge status-${project.status}`}>
                {project.status}
              </span>
            </div>
            <div className="detail-item">
              <label>Ưu tiên:</label>
              <span className={`priority-badge priority-${project.priority}`}>
                {project.priority}
              </span>
            </div>
            <div className="detail-item">
              <label>Trưởng dự án:</label>
              <span>{typeof project.leader_id === 'object' ? project.leader_id?.full_name : project.leader_id || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <label>Địa điểm:</label>
              <span>{typeof project.site_id === 'object' ? project.site_id?.site_name : project.site_id || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <label>Ngày bắt đầu:</label>
              <span>{formatDate(project.start_date)}</span>
            </div>
            <div className="detail-item">
              <label>Ngày kết thúc:</label>
              <span>{formatDate(project.end_date)}</span>
            </div>
            <div className="detail-item">
              <label>Ngân sách:</label>
              <span>{formatCurrency(project.budget)}</span>
            </div>
          </div>
        </div>

        <div className="details-section">
          <h3>Mô tả dự án</h3>
          <p>{project.description || 'Không có mô tả'}</p>
        </div>
      </div>

      {/* Progress Section */}
      <div className="overview-progress">
        <h3>Tiến độ dự án</h3>
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${project.progress}%` }}
            ></div>
          </div>
          <div className="progress-text">{project.progress}% hoàn thành</div>
        </div>
      </div>

      {/* Team Members */}
      {assignments?.length > 0 && (
        <div className="overview-team">
          <h3>Thành viên dự án</h3>
          <div className="team-grid">
            {assignments?.map((assignment) => (
              <div key={assignment.id} className="team-member">
                <div className="member-avatar">
                  <i className="fas fa-user"></i>
                </div>
                <div className="member-info">
                  <div className="member-name">{typeof assignment.user_id === 'object' ? assignment.user_id?.full_name : assignment.user_id || 'N/A'}</div>
                  <div className="member-role">{assignment.role_in_project || 'Thành viên'}</div>
                  <div className={`member-status status-${assignment.status}`}>
                    {assignment.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Project Management Workflow */}
      <div className="project-workflow">
        <h3>Luồng Quản lý Dự án</h3>
        <div className="workflow-sections">
          {/* 1. Project Initialization */}
          <div className="workflow-section">
            <h4><i className="fas fa-clipboard-list"></i> 1. Khởi tạo Dự án</h4>
            <div className="workflow-actions">
              <Link 
                to={`/admin/project-management/${projectId}/phases`}
                className="workflow-btn"
              >
                <i className="fas fa-layer-group"></i>
                <span>Quản lý Giai đoạn</span>
                <small>Phase Planning & Setup</small>
              </Link>
              <Link 
                to={`/admin/project-management/${projectId}/resources`}
                className="workflow-btn"
              >
                <i className="fas fa-cubes"></i>
                <span>Quản lý Tài nguyên</span>
                <small>Resource Planning</small>
              </Link>
              <Link 
                to={`/admin/project-management/${projectId}/risks`}
                className="workflow-btn"
              >
                <i className="fas fa-exclamation-triangle"></i>
                <span>Đánh giá Rủi ro</span>
                <small>Risk Assessment</small>
              </Link>
            </div>
          </div>

          {/* 2. Progress Management */}
          <div className="workflow-section">
            <h4><i className="fas fa-play-circle"></i> 2. Quản lý Tiến độ</h4>
            <div className="workflow-actions">
              <Link 
                to={`/admin/project-management/${projectId}/tasks`}
                className="workflow-btn"
              >
                <i className="fas fa-tasks"></i>
                <span>Quản lý Nhiệm vụ</span>
                <small>Task Assignment & Tracking</small>
              </Link>
              <Link 
                to={`/admin/project-management/${projectId}/milestones`}
                className="workflow-btn"
              >
                <i className="fas fa-flag-checkered"></i>
                <span>Quản lý Milestone</span>
                <small>Milestone Tracking</small>
              </Link>
              <Link 
                to={`/admin/project-management/${projectId}/progress`}
                className="workflow-btn"
              >
                <i className="fas fa-chart-line"></i>
                <span>Theo dõi Tiến độ</span>
                <small>Progress Monitoring</small>
              </Link>
            </div>
          </div>

          {/* 3. Monitoring & Control */}
          <div className="workflow-section">
            <h4><i className="fas fa-chart-line"></i> 3. Giám sát & Kiểm soát</h4>
            <div className="workflow-actions">
              <Link 
                to={`/admin/project-management/${projectId}/status-reports`}
                className="workflow-btn"
              >
                <i className="fas fa-file-alt"></i>
                <span>Báo cáo Tình trạng</span>
                <small>Status Reporting</small>
              </Link>
              <Link 
                to={`/admin/project-management/${projectId}/change-requests`}
                className="workflow-btn"
              >
                <i className="fas fa-exchange-alt"></i>
                <span>Yêu cầu Thay đổi</span>
                <small>Change Management</small>
              </Link>
              <Link 
                to={`/admin/project-management/${projectId}/quality`}
                className="workflow-btn"
              >
                <i className="fas fa-check-circle"></i>
                <span>Kiểm soát Chất lượng</span>
                <small>Quality Control</small>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="overview-activity">
        <h3>Hoạt động gần đây</h3>
        <div className="activity-list">
          <div className="activity-item">
            <div className="activity-icon">
              <i className="fas fa-info-circle"></i>
            </div>
            <div className="activity-content">
              <div className="activity-title">Dự án được tạo</div>
              <div className="activity-description">
                Dự án "{project.project_name}" đã được tạo bởi {typeof project.leader_id === 'object' ? project.leader_id?.full_name : project.leader_id || 'N/A'}
              </div>
              <div className="activity-date">
                {formatDate(project.created_at)}
              </div>
            </div>
          </div>
          
          <div className="activity-item">
            <div className="activity-icon">
              <i className="fas fa-edit"></i>
            </div>
            <div className="activity-content">
              <div className="activity-title">Cập nhật tiến độ</div>
              <div className="activity-description">
                Tiến độ dự án đã được cập nhật lên {project.progress}%
              </div>
              <div className="activity-date">
                {formatDate(project.updated_at)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectOverview;
