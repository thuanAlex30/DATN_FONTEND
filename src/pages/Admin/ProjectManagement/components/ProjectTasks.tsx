import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../../../store';
import { fetchProjectTasks, createTask, updateTask, deleteTask } from '../../../../store/slices/projectTaskSlice';
import type { ProjectTask, CreateTaskData, UpdateTaskData } from '../../../../types/projectTask';
import { qualityCheckpointService } from '../../../../services/qualityCheckpointService';

interface ProjectTasksProps {
  projectId: string;
}

const ProjectTasks: React.FC<ProjectTasksProps> = ({ projectId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { tasks, loading, error } = useSelector((state: RootState) => state.projectTask);
  const [checkpoints, setCheckpoints] = useState<any[]>([]);
  const [checkpointsLoading, setCheckpointsLoading] = useState(false);

  useEffect(() => {
    if (projectId) {
      dispatch(fetchProjectTasks(projectId));
    }
  }, [dispatch, projectId]);

  const loadCheckpoints = async (taskId: string) => {
    try {
      setCheckpointsLoading(true);
      const response = await qualityCheckpointService.getTaskCheckpoints(taskId);
      setCheckpoints(response.data || []);
    } catch (error) {
      console.error('Error loading checkpoints:', error);
    } finally {
      setCheckpointsLoading(false);
    }
  };

  const handleCreateTask = (data: CreateTaskData) => {
    dispatch(createTask(data));
  };

  const handleUpdateTask = (id: string, data: UpdateTaskData) => {
    dispatch(updateTask({ id, data }));
  };

  const handleDeleteTask = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa nhiệm vụ này?')) {
      dispatch(deleteTask(id));
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
      <div className="project-tasks-loading">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Đang tải danh sách nhiệm vụ...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="project-tasks-error">
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          <h3>Lỗi tải nhiệm vụ</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="project-tasks">
      <div className="tasks-header">
        <h2>Nhiệm vụ Dự án</h2>
        <button 
          className="btn btn-primary"
          onClick={() => {/* TODO: Open create task modal */}}
        >
          <i className="fas fa-plus"></i>
          Thêm nhiệm vụ
        </button>
      </div>

      {tasks.length === 0 ? (
        <div className="tasks-empty">
          <div className="empty-state">
            <i className="fas fa-tasks"></i>
            <h3>Chưa có nhiệm vụ nào</h3>
            <p>Dự án này chưa có nhiệm vụ nào được tạo.</p>
            <button 
              className="btn btn-primary"
              onClick={() => {/* TODO: Open create task modal */}}
            >
              Tạo nhiệm vụ đầu tiên
            </button>
          </div>
        </div>
      ) : (
        <div className="tasks-list">
          {tasks.map((task) => (
            <div key={task.id} className="task-card">
              <div className="task-header">
                <div className="task-title">
                  <h3>{task.task_name}</h3>
                  <div className="task-badges">
                    <span className={`status-badge ${getStatusBadgeClass(task.status)}`}>
                      {task.status}
                    </span>
                    <span className={`priority-badge ${getPriorityBadgeClass(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                </div>
                <div className="task-actions">
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => {/* TODO: Open edit task modal */}}
                    title="Chỉnh sửa"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDeleteTask(task.id)}
                    title="Xóa"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
              
              <div className="task-content">
                <p className="task-description">
                  {task.description || 'Không có mô tả'}
                </p>
                
                <div className="task-details">
                  <div className="detail-item">
                    <i className="fas fa-calendar-alt"></i>
                    <span>
                      {formatDate(task.start_date)} - {formatDate(task.end_date)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-percent"></i>
                    <span>Tiến độ: {task.progress}%</span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-user"></i>
                    <span>Giai đoạn: {task.phase_id || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-clock"></i>
                    <span>Ước tính: {task.estimated_hours}h</span>
                  </div>
                </div>
                
                <div className="task-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${task.progress}%` }}
                    ></div>
                  </div>
                  <span className="progress-text">{task.progress}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectTasks;
