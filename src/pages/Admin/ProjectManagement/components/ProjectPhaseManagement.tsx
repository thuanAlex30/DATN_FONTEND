import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../../store';
import projectPhaseService, { type ProjectPhase, type CreateProjectPhaseData } from '../../../../services/projectPhaseService';
import styles from './ProjectPhaseManagement.module.css';

interface ProjectPhaseManagementProps {
  projectId: string;
  onComplete: () => void;
}

const ProjectPhaseManagement: React.FC<ProjectPhaseManagementProps> = ({ projectId, onComplete }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [phases, setPhases] = useState<ProjectPhase[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreatePhase, setShowCreatePhase] = useState(false);
  const [editingPhase, setEditingPhase] = useState<ProjectPhase | null>(null);
  const [draggedPhase, setDraggedPhase] = useState<string | null>(null);

  // Form states
  const [phaseForm, setPhaseForm] = useState<CreateProjectPhaseData>({
    project_id: projectId,
    phase_name: '',
    description: '',
    phase_order: 1,
    planned_start_date: '',
    planned_end_date: '',
    planned_budget: 0
  });

  useEffect(() => {
    loadPhases();
  }, [projectId]);

  const loadPhases = async () => {
    try {
      setLoading(true);
      const data = await projectPhaseService.getProjectPhases(projectId);
      setPhases(data.sort((a, b) => a.phase_order - b.phase_order));
    } catch (err) {
      console.error('Error loading phases:', err);
      setError('Không thể tải danh sách giai đoạn');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePhase = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const newPhase = await projectPhaseService.createPhase(phaseForm);
      await loadPhases();
      setShowCreatePhase(false);
      resetForm();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể tạo giai đoạn');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePhase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPhase) return;

    try {
      setLoading(true);
      await projectPhaseService.updatePhase(editingPhase._id, phaseForm);
      await loadPhases();
      setEditingPhase(null);
      resetForm();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể cập nhật giai đoạn');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePhase = async (phaseId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa giai đoạn này?')) return;

    try {
      setLoading(true);
      await projectPhaseService.deletePhase(phaseId);
      await loadPhases();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể xóa giai đoạn');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProgress = async (phaseId: string, progress: number) => {
    try {
      setLoading(true);
      await projectPhaseService.updatePhaseProgress(phaseId, progress);
      await loadPhases();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể cập nhật tiến độ');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setPhaseForm({
      project_id: projectId,
      phase_name: '',
      description: '',
      phase_order: phases.length + 1,
      planned_start_date: '',
      planned_end_date: '',
      planned_budget: 0
    });
  };

  const handleEditPhase = (phase: ProjectPhase) => {
    setEditingPhase(phase);
    setPhaseForm({
      project_id: phase.project_id,
      phase_name: phase.phase_name,
      description: phase.description || '',
      phase_order: phase.phase_order,
      planned_start_date: phase.planned_start_date.split('T')[0],
      planned_end_date: phase.planned_end_date.split('T')[0],
      planned_budget: phase.planned_budget
    });
    setShowCreatePhase(true);
  };

  const handleDragStart = (e: React.DragEvent, phaseId: string) => {
    setDraggedPhase(phaseId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetPhaseId: string) => {
    e.preventDefault();
    if (!draggedPhase || draggedPhase === targetPhaseId) return;

    try {
      const draggedPhaseData = phases.find(p => p._id === draggedPhase);
      const targetPhaseData = phases.find(p => p._id === targetPhaseId);
      
      if (!draggedPhaseData || !targetPhaseData) return;

      // Swap phase orders
      const newOrder = targetPhaseData.phase_order;
      const oldOrder = draggedPhaseData.phase_order;

      // Update both phases
      await Promise.all([
        projectPhaseService.updatePhase(draggedPhase, { phase_order: newOrder }),
        projectPhaseService.updatePhase(targetPhaseId, { phase_order: oldOrder })
      ]);

      await loadPhases();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể sắp xếp lại giai đoạn');
    } finally {
      setDraggedPhase(null);
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      'PLANNED': 'Đã lên kế hoạch',
      'IN_PROGRESS': 'Đang thực hiện',
      'COMPLETED': 'Hoàn thành',
      'ON_HOLD': 'Tạm dừng',
      'CANCELLED': 'Đã hủy'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'PLANNED': '#3498db',
      'IN_PROGRESS': '#f39c12',
      'COMPLETED': '#27ae60',
      'ON_HOLD': '#e67e22',
      'CANCELLED': '#e74c3c'
    };
    return colors[status] || '#95a5a6';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Lập kế hoạch Giai đoạn</h2>
        <p>Quản lý các giai đoạn của dự án và thiết lập thứ tự thực hiện</p>
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
        {/* Phases List */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3>Giai đoạn Dự án</h3>
            <button
              onClick={() => {
                setShowCreatePhase(true);
                setEditingPhase(null);
                resetForm();
              }}
              className={styles.btnPrimary}
            >
              <i className="fas fa-plus"></i>
              Thêm giai đoạn
            </button>
          </div>

          {loading ? (
            <div className={styles.loading}>
              <i className="fas fa-spinner fa-spin"></i>
              Đang tải...
            </div>
          ) : (
            <div className={styles.phasesList}>
              {phases.map((phase, index) => (
                <div
                  key={phase._id}
                  className={styles.phaseCard}
                  draggable
                  onDragStart={(e) => handleDragStart(e, phase._id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, phase._id)}
                >
                  <div className={styles.phaseHeader}>
                    <div className={styles.phaseOrder}>
                      <span className={styles.orderNumber}>{phase.phase_order}</span>
                    </div>
                    <div className={styles.phaseInfo}>
                      <h4>{phase.phase_name}</h4>
                      <div className={styles.phaseMeta}>
                        <span className={styles.status} style={{ color: getStatusColor(phase.status) }}>
                          {getStatusLabel(phase.status)}
                        </span>
                        <span className={styles.dates}>
                          {formatDate(phase.planned_start_date)} - {formatDate(phase.planned_end_date)}
                        </span>
                      </div>
                    </div>
                    <div className={styles.phaseActions}>
                      <button
                        onClick={() => handleEditPhase(phase)}
                        className={styles.btnIcon}
                        title="Chỉnh sửa"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        onClick={() => handleDeletePhase(phase._id)}
                        className={styles.btnIconDanger}
                        title="Xóa"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>

                  <div className={styles.phaseDetails}>
                    {phase.description && (
                      <p className={styles.description}>{phase.description}</p>
                    )}
                    
                    <div className={styles.phaseStats}>
                      <div className={styles.stat}>
                        <span className={styles.statLabel}>Ngân sách:</span>
                        <span className={styles.statValue}>{formatCurrency(phase.planned_budget)}</span>
                      </div>
                      <div className={styles.stat}>
                        <span className={styles.statLabel}>Chi phí thực tế:</span>
                        <span className={styles.statValue}>{formatCurrency(phase.actual_cost)}</span>
                      </div>
                      <div className={styles.stat}>
                        <span className={styles.statLabel}>Tiến độ:</span>
                        <span className={styles.statValue}>{phase.progress_percentage}%</span>
                      </div>
                    </div>

                    <div className={styles.progressBar}>
                      <div
                        className={styles.progressFill}
                        style={{ width: `${phase.progress_percentage}%` }}
                      ></div>
                    </div>

                    <div className={styles.progressControls}>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={phase.progress_percentage}
                        onChange={(e) => handleUpdateProgress(phase._id, Number(e.target.value))}
                        className={styles.progressSlider}
                      />
                      <span className={styles.progressLabel}>{phase.progress_percentage}%</span>
                    </div>
                  </div>
                </div>
              ))}
              {phases.length === 0 && (
                <div className={styles.emptyState}>
                  <i className="fas fa-tasks"></i>
                  <p>Chưa có giai đoạn nào được tạo</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Phase Modal */}
      {showCreatePhase && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>{editingPhase ? 'Chỉnh sửa giai đoạn' : 'Thêm giai đoạn mới'}</h3>
              <button
                onClick={() => {
                  setShowCreatePhase(false);
                  setEditingPhase(null);
                  resetForm();
                }}
                className={styles.modalClose}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={editingPhase ? handleUpdatePhase : handleCreatePhase} className={styles.form}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Tên giai đoạn *</label>
                  <input
                    type="text"
                    value={phaseForm.phase_name}
                    onChange={(e) => setPhaseForm(prev => ({ ...prev, phase_name: e.target.value }))}
                    required
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Thứ tự *</label>
                  <input
                    type="number"
                    value={phaseForm.phase_order}
                    onChange={(e) => setPhaseForm(prev => ({ ...prev, phase_order: Number(e.target.value) }))}
                    required
                    min="1"
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Ngày bắt đầu dự kiến *</label>
                  <input
                    type="date"
                    value={phaseForm.planned_start_date}
                    onChange={(e) => setPhaseForm(prev => ({ ...prev, planned_start_date: e.target.value }))}
                    required
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Ngày kết thúc dự kiến *</label>
                  <input
                    type="date"
                    value={phaseForm.planned_end_date}
                    onChange={(e) => setPhaseForm(prev => ({ ...prev, planned_end_date: e.target.value }))}
                    required
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Ngân sách dự kiến (VND)</label>
                  <input
                    type="number"
                    value={phaseForm.planned_budget}
                    onChange={(e) => setPhaseForm(prev => ({ ...prev, planned_budget: Number(e.target.value) }))}
                    min="0"
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Mô tả</label>
                <textarea
                  value={phaseForm.description}
                  onChange={(e) => setPhaseForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className={styles.textarea}
                />
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreatePhase(false);
                    setEditingPhase(null);
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
                    editingPhase ? 'Cập nhật' : 'Tạo mới'
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
          Hoàn thành lập kế hoạch Giai đoạn
        </button>
      </div>
    </div>
  );
};

export default ProjectPhaseManagement;

