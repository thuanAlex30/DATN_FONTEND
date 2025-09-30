import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../../store';
import projectMilestoneService, { type ProjectMilestone, type CreateProjectMilestoneData } from '../../../../services/projectMilestoneService';
import projectPhaseService, { type ProjectPhase } from '../../../../services/projectPhaseService';
import userService from '../../../../services/userService';
import styles from './MilestoneManagement.module.css';

interface MilestoneManagementProps {
  projectId: string;
  onComplete: () => void;
}

const MilestoneManagement: React.FC<MilestoneManagementProps> = ({ projectId, onComplete }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [milestones, setMilestones] = useState<ProjectMilestone[]>([]);
  const [phases, setPhases] = useState<ProjectPhase[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateMilestone, setShowCreateMilestone] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<ProjectMilestone | null>(null);
  const [filterPhase, setFilterPhase] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');

  // Form states
  const [milestoneForm, setMilestoneForm] = useState<CreateProjectMilestoneData>({
    project_id: projectId,
    phase_id: '',
    milestone_name: '',
    description: '',
    planned_date: '',
    milestone_type: 'PHASE_COMPLETION',
    completion_criteria: '',
    responsible_user_id: user?.id || '',
    is_critical: false
  });

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [milestonesData, phasesData, usersData] = await Promise.all([
        projectMilestoneService.getProjectMilestones(projectId),
        projectPhaseService.getProjectPhases(projectId),
        userService.getAllUsers()
      ]);
      setMilestones(milestonesData);
      setPhases(phasesData);
      setUsers(usersData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await projectMilestoneService.createMilestone(milestoneForm);
      await loadData();
      setShowCreateMilestone(false);
      resetForm();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể tạo milestone');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMilestone) return;

    try {
      setLoading(true);
      await projectMilestoneService.updateMilestone(editingMilestone._id, milestoneForm);
      await loadData();
      setEditingMilestone(null);
      resetForm();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể cập nhật milestone');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMilestone = async (milestoneId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa milestone này?')) return;

    try {
      setLoading(true);
      await projectMilestoneService.deleteMilestone(milestoneId);
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể xóa milestone');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteMilestone = async (milestoneId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn đánh dấu milestone này là hoàn thành?')) return;

    try {
      setLoading(true);
      await projectMilestoneService.completeMilestone(milestoneId);
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể hoàn thành milestone');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setMilestoneForm({
      project_id: projectId,
      phase_id: '',
      milestone_name: '',
      description: '',
      planned_date: '',
      milestone_type: 'PHASE_COMPLETION',
      completion_criteria: '',
      responsible_user_id: user?.id || '',
      is_critical: false
    });
  };

  const handleEditMilestone = (milestone: ProjectMilestone) => {
    setEditingMilestone(milestone);
    setMilestoneForm({
      project_id: milestone.project_id,
      phase_id: milestone.phase_id,
      milestone_name: milestone.milestone_name,
      description: milestone.description || '',
      planned_date: milestone.planned_date.split('T')[0],
      milestone_type: milestone.milestone_type,
      completion_criteria: milestone.completion_criteria,
      responsible_user_id: milestone.responsible_user_id,
      is_critical: milestone.is_critical
    });
    setShowCreateMilestone(true);
  };

  const getTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'PHASE_COMPLETION': 'Hoàn thành giai đoạn',
      'DELIVERY': 'Giao hàng',
      'APPROVAL': 'Phê duyệt',
      'REVIEW': 'Đánh giá',
      'CHECKPOINT': 'Điểm kiểm tra'
    };
    return labels[type] || type;
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      'PENDING': 'Chờ thực hiện',
      'IN_PROGRESS': 'Đang thực hiện',
      'COMPLETED': 'Hoàn thành',
      'OVERDUE': 'Quá hạn',
      'CANCELLED': 'Đã hủy'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'PENDING': '#3498db',
      'IN_PROGRESS': '#f39c12',
      'COMPLETED': '#27ae60',
      'OVERDUE': '#e74c3c',
      'CANCELLED': '#95a5a6'
    };
    return colors[status] || '#95a5a6';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const isOverdue = (plannedDate: string, status: string) => {
    if (status === 'COMPLETED' || status === 'CANCELLED') return false;
    return new Date(plannedDate) < new Date();
  };

  const filteredMilestones = milestones.filter(milestone => {
    const matchesPhase = !filterPhase || milestone.phase_id === filterPhase;
    const matchesStatus = !filterStatus || milestone.status === filterStatus;
    const matchesType = !filterType || milestone.milestone_type === filterType;
    return matchesPhase && matchesStatus && matchesType;
  });

  const milestoneStats = {
    total: milestones.length,
    pending: milestones.filter(m => m.status === 'PENDING').length,
    inProgress: milestones.filter(m => m.status === 'IN_PROGRESS').length,
    completed: milestones.filter(m => m.status === 'COMPLETED').length,
    overdue: milestones.filter(m => isOverdue(m.planned_date, m.status)).length,
    critical: milestones.filter(m => m.is_critical).length
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Quản lý Milestone</h2>
        <p>Xác định và theo dõi các milestone quan trọng của dự án</p>
      </div>

      {error && (
        <div className={styles.alert}>
          <i className="fas fa-exclamation-triangle"></i>
          {error}
          <button onClick={() => setError(null)} className={styles.alertClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      <div className={styles.content}>
        {/* Milestone Statistics */}
        <div className={styles.section}>
          <h3>Thống kê Milestone</h3>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <i className="fas fa-flag"></i>
              </div>
              <div className={styles.statContent}>
                <h4>Tổng milestone</h4>
                <p className={styles.statNumber}>{milestoneStats.total}</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <i className="fas fa-clock"></i>
              </div>
              <div className={styles.statContent}>
                <h4>Chờ thực hiện</h4>
                <p className={styles.statNumber}>{milestoneStats.pending}</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <i className="fas fa-play"></i>
              </div>
              <div className={styles.statContent}>
                <h4>Đang thực hiện</h4>
                <p className={styles.statNumber}>{milestoneStats.inProgress}</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <i className="fas fa-check-circle"></i>
              </div>
              <div className={styles.statContent}>
                <h4>Hoàn thành</h4>
                <p className={styles.statNumber}>{milestoneStats.completed}</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <div className={styles.statContent}>
                <h4>Quá hạn</h4>
                <p className={styles.statNumber}>{milestoneStats.overdue}</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <i className="fas fa-star"></i>
              </div>
              <div className={styles.statContent}>
                <h4>Quan trọng</h4>
                <p className={styles.statNumber}>{milestoneStats.critical}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3>Danh sách Milestone</h3>
            <button
              onClick={() => {
                setShowCreateMilestone(true);
                setEditingMilestone(null);
                resetForm();
              }}
              className={styles.btnPrimary}
            >
              <i className="fas fa-plus"></i>
              Thêm milestone
            </button>
          </div>

          <div className={styles.filters}>
            <div className={styles.filterGroup}>
              <label>Lọc theo giai đoạn:</label>
              <select
                value={filterPhase}
                onChange={(e) => setFilterPhase(e.target.value)}
                className={styles.select}
              >
                <option value="">Tất cả giai đoạn</option>
                {phases.map(phase => (
                  <option key={phase._id} value={phase._id}>
                    {phase.phase_name}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.filterGroup}>
              <label>Lọc theo trạng thái:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={styles.select}
              >
                <option value="">Tất cả trạng thái</option>
                <option value="PENDING">Chờ thực hiện</option>
                <option value="IN_PROGRESS">Đang thực hiện</option>
                <option value="COMPLETED">Hoàn thành</option>
                <option value="OVERDUE">Quá hạn</option>
                <option value="CANCELLED">Đã hủy</option>
              </select>
            </div>
            <div className={styles.filterGroup}>
              <label>Lọc theo loại:</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className={styles.select}
              >
                <option value="">Tất cả loại</option>
                <option value="PHASE_COMPLETION">Hoàn thành giai đoạn</option>
                <option value="DELIVERY">Giao hàng</option>
                <option value="APPROVAL">Phê duyệt</option>
                <option value="REVIEW">Đánh giá</option>
                <option value="CHECKPOINT">Điểm kiểm tra</option>
              </select>
            </div>
          </div>
        </div>

        {/* Milestones List */}
        <div className={styles.section}>
          {loading ? (
            <div className={styles.loading}>
              <i className="fas fa-spinner fa-spin"></i>
              Đang tải...
            </div>
          ) : (
            <div className={styles.milestonesGrid}>
              {filteredMilestones.map(milestone => {
                const isOverdueMilestone = isOverdue(milestone.planned_date, milestone.status);
                return (
                  <div key={milestone._id} className={`${styles.milestoneCard} ${milestone.is_critical ? styles.critical : ''} ${isOverdueMilestone ? styles.overdue : ''}`}>
                    <div className={styles.milestoneHeader}>
                      <div className={styles.milestoneTitle}>
                        <h4>
                          {milestone.milestone_name}
                          {milestone.is_critical && <i className="fas fa-star" title="Quan trọng"></i>}
                        </h4>
                        <div className={styles.milestoneMeta}>
                          <span className={styles.type}>{getTypeLabel(milestone.milestone_type)}</span>
                          <span 
                            className={styles.status}
                            style={{ color: getStatusColor(milestone.status) }}
                          >
                            {getStatusLabel(milestone.status)}
                          </span>
                        </div>
                      </div>
                      <div className={styles.milestoneActions}>
                        {milestone.status === 'PENDING' && (
                          <button
                            onClick={() => handleCompleteMilestone(milestone._id)}
                            className={styles.btnComplete}
                            title="Hoàn thành"
                          >
                            <i className="fas fa-check"></i>
                          </button>
                        )}
                        <button
                          onClick={() => handleEditMilestone(milestone)}
                          className={styles.btnIcon}
                          title="Chỉnh sửa"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => handleDeleteMilestone(milestone._id)}
                          className={styles.btnIconDanger}
                          title="Xóa"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>

                    <div className={styles.milestoneContent}>
                      {milestone.description && (
                        <p className={styles.description}>{milestone.description}</p>
                      )}

                      <div className={styles.milestoneDetails}>
                        <div className={styles.detailRow}>
                          <span className={styles.label}>Giai đoạn:</span>
                          <span className={styles.value}>{milestone.phase?.phase_name || 'Chưa gán'}</span>
                        </div>
                        <div className={styles.detailRow}>
                          <span className={styles.label}>Ngày dự kiến:</span>
                          <span className={styles.value}>{formatDate(milestone.planned_date)}</span>
                        </div>
                        {milestone.actual_date && (
                          <div className={styles.detailRow}>
                            <span className={styles.label}>Ngày thực tế:</span>
                            <span className={styles.value}>{formatDate(milestone.actual_date)}</span>
                          </div>
                        )}
                        <div className={styles.detailRow}>
                          <span className={styles.label}>Người phụ trách:</span>
                          <span className={styles.value}>{milestone.responsible_user?.full_name || 'Chưa gán'}</span>
                        </div>
                      </div>

                      <div className={styles.completionCriteria}>
                        <strong>Tiêu chí hoàn thành:</strong>
                        <p>{milestone.completion_criteria}</p>
                      </div>

                      {isOverdueMilestone && (
                        <div className={styles.overdueWarning}>
                          <i className="fas fa-exclamation-triangle"></i>
                          <span>Milestone này đã quá hạn</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {filteredMilestones.length === 0 && (
                <div className={styles.emptyState}>
                  <i className="fas fa-flag"></i>
                  <p>Chưa có milestone nào được tạo</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Milestone Modal */}
      {showCreateMilestone && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>{editingMilestone ? 'Chỉnh sửa milestone' : 'Thêm milestone mới'}</h3>
              <button
                onClick={() => {
                  setShowCreateMilestone(false);
                  setEditingMilestone(null);
                  resetForm();
                }}
                className={styles.modalClose}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={editingMilestone ? handleUpdateMilestone : handleCreateMilestone} className={styles.form}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Tên milestone *</label>
                  <input
                    type="text"
                    value={milestoneForm.milestone_name}
                    onChange={(e) => setMilestoneForm(prev => ({ ...prev, milestone_name: e.target.value }))}
                    required
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Loại milestone *</label>
                  <select
                    value={milestoneForm.milestone_type}
                    onChange={(e) => setMilestoneForm(prev => ({ ...prev, milestone_type: e.target.value }))}
                    required
                    className={styles.select}
                  >
                    <option value="PHASE_COMPLETION">Hoàn thành giai đoạn</option>
                    <option value="DELIVERY">Giao hàng</option>
                    <option value="APPROVAL">Phê duyệt</option>
                    <option value="REVIEW">Đánh giá</option>
                    <option value="CHECKPOINT">Điểm kiểm tra</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Giai đoạn *</label>
                  <select
                    value={milestoneForm.phase_id}
                    onChange={(e) => setMilestoneForm(prev => ({ ...prev, phase_id: e.target.value }))}
                    required
                    className={styles.select}
                  >
                    <option value="">Chọn giai đoạn...</option>
                    {phases.map(phase => (
                      <option key={phase._id} value={phase._id}>
                        {phase.phase_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Người phụ trách *</label>
                  <select
                    value={milestoneForm.responsible_user_id}
                    onChange={(e) => setMilestoneForm(prev => ({ ...prev, responsible_user_id: e.target.value }))}
                    required
                    className={styles.select}
                  >
                    <option value="">Chọn người phụ trách...</option>
                    {users.map(user => (
                      <option key={user._id} value={user._id}>
                        {user.full_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Ngày dự kiến *</label>
                  <input
                    type="date"
                    value={milestoneForm.planned_date}
                    onChange={(e) => setMilestoneForm(prev => ({ ...prev, planned_date: e.target.value }))}
                    required
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={milestoneForm.is_critical}
                      onChange={(e) => setMilestoneForm(prev => ({ ...prev, is_critical: e.target.checked }))}
                    />
                    Milestone quan trọng
                  </label>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Mô tả</label>
                <textarea
                  value={milestoneForm.description}
                  onChange={(e) => setMilestoneForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className={styles.textarea}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Tiêu chí hoàn thành *</label>
                <textarea
                  value={milestoneForm.completion_criteria}
                  onChange={(e) => setMilestoneForm(prev => ({ ...prev, completion_criteria: e.target.value }))}
                  required
                  rows={4}
                  className={styles.textarea}
                  placeholder="Mô tả chi tiết các tiêu chí cần đạt được để milestone được coi là hoàn thành..."
                />
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateMilestone(false);
                    setEditingMilestone(null);
                    resetForm();
                  }}
                  className={styles.btnSecondary}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={styles.btnPrimary}
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Đang xử lý...
                    </>
                  ) : (
                    editingMilestone ? 'Cập nhật' : 'Tạo mới'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className={styles.actions}>
        <button onClick={onComplete} className={styles.btnSuccess}>
          <i className="fas fa-check"></i>
          Hoàn thành Quản lý Milestone
        </button>
      </div>
    </div>
  );
};

export default MilestoneManagement;

