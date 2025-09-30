import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../../store';
import projectRiskService, { type ProjectRisk, type CreateProjectRiskData } from '../../../../services/projectRiskService';
import projectPhaseService, { type ProjectPhase } from '../../../../services/projectPhaseService';
import userService from '../../../../services/userService';
import styles from './RiskAssessmentManagement.module.css';

interface RiskAssessmentManagementProps {
  projectId: string;
  onComplete: () => void;
}

const RiskAssessmentManagement: React.FC<RiskAssessmentManagementProps> = ({ projectId, onComplete }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [risks, setRisks] = useState<ProjectRisk[]>([]);
  const [phases, setPhases] = useState<ProjectPhase[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateRisk, setShowCreateRisk] = useState(false);
  const [editingRisk, setEditingRisk] = useState<ProjectRisk | null>(null);
  const [filterPhase, setFilterPhase] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  // Form states
  const [riskForm, setRiskForm] = useState<CreateProjectRiskData>({
    project_id: projectId,
    phase_id: '',
    risk_name: '',
    description: '',
    risk_category: 'TECHNICAL',
    probability: 0.5,
    impact_score: 3,
    mitigation_plan: '',
    owner_id: user?.id || '',
    target_resolution_date: '',
    cost_impact: 0,
    schedule_impact_days: 0
  });

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [risksData, phasesData, usersData] = await Promise.all([
        projectRiskService.getProjectRisks(projectId),
        projectPhaseService.getProjectPhases(projectId),
        userService.getAllUsers()
      ]);
      setRisks(risksData);
      setPhases(phasesData);
      setUsers(usersData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRisk = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const riskScore = projectRiskService.calculateRiskScore(riskForm.probability, riskForm.impact_score);
      const riskData = { ...riskForm, risk_score: riskScore };
      await projectRiskService.createRisk(riskData);
      await loadData();
      setShowCreateRisk(false);
      resetForm();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể tạo rủi ro');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRisk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRisk) return;

    try {
      setLoading(true);
      const riskScore = projectRiskService.calculateRiskScore(riskForm.probability, riskForm.impact_score);
      const riskData = { ...riskForm, risk_score: riskScore };
      await projectRiskService.updateRisk(editingRisk._id, riskData);
      await loadData();
      setEditingRisk(null);
      resetForm();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể cập nhật rủi ro');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRisk = async (riskId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa rủi ro này?')) return;

    try {
      setLoading(true);
      await projectRiskService.deleteRisk(riskId);
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể xóa rủi ro');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRiskStatus = async (riskId: string, status: string) => {
    try {
      setLoading(true);
      await projectRiskService.updateRiskStatus(riskId, status);
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể cập nhật trạng thái rủi ro');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setRiskForm({
      project_id: projectId,
      phase_id: '',
      risk_name: '',
      description: '',
      risk_category: 'TECHNICAL',
      probability: 0.5,
      impact_score: 3,
      mitigation_plan: '',
      owner_id: user?.id || '',
      target_resolution_date: '',
      cost_impact: 0,
      schedule_impact_days: 0
    });
  };

  const handleEditRisk = (risk: ProjectRisk) => {
    setEditingRisk(risk);
    setRiskForm({
      project_id: risk.project_id,
      phase_id: risk.phase_id || '',
      risk_name: risk.risk_name,
      description: risk.description,
      risk_category: risk.risk_category,
      probability: risk.probability,
      impact_score: risk.impact_score,
      mitigation_plan: risk.mitigation_plan,
      owner_id: risk.owner_id,
      target_resolution_date: risk.target_resolution_date.split('T')[0],
      cost_impact: risk.cost_impact,
      schedule_impact_days: risk.schedule_impact_days
    });
    setShowCreateRisk(true);
  };

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: string } = {
      'TECHNICAL': 'Kỹ thuật',
      'FINANCIAL': 'Tài chính',
      'SCHEDULE': 'Tiến độ',
      'SAFETY': 'An toàn',
      'ENVIRONMENTAL': 'Môi trường',
      'REGULATORY': 'Quy định',
      'SUPPLIER': 'Nhà cung cấp',
      'PERSONNEL': 'Nhân sự'
    };
    return labels[category] || category;
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      'IDENTIFIED': 'Đã xác định',
      'ANALYZED': 'Đã phân tích',
      'MITIGATED': 'Đã giảm thiểu',
      'MONITORED': 'Đang theo dõi',
      'CLOSED': 'Đã đóng'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'IDENTIFIED': '#3498db',
      'ANALYZED': '#f39c12',
      'MITIGATED': '#27ae60',
      'MONITORED': '#2ecc71',
      'CLOSED': '#95a5a6'
    };
    return colors[status] || '#95a5a6';
  };

  const getRiskLevel = (riskScore: number) => {
    return projectRiskService.getRiskLevel(riskScore);
  };

  const getRiskLevelColor = (riskLevel: string) => {
    const colors: { [key: string]: string } = {
      'LOW': '#27ae60',
      'MEDIUM': '#f39c12',
      'HIGH': '#e67e22',
      'CRITICAL': '#e74c3c'
    };
    return colors[riskLevel] || '#95a5a6';
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

  const filteredRisks = risks.filter(risk => {
    const matchesPhase = !filterPhase || risk.phase_id === filterPhase;
    const matchesCategory = !filterCategory || risk.risk_category === filterCategory;
    const matchesStatus = !filterStatus || risk.status === filterStatus;
    return matchesPhase && matchesCategory && matchesStatus;
  });

  const riskStats = {
    total: risks.length,
    identified: risks.filter(r => r.status === 'IDENTIFIED').length,
    analyzed: risks.filter(r => r.status === 'ANALYZED').length,
    mitigated: risks.filter(r => r.status === 'MITIGATED').length,
    closed: risks.filter(r => r.status === 'CLOSED').length,
    critical: risks.filter(r => getRiskLevel(r.risk_score) === 'CRITICAL').length,
    high: risks.filter(r => getRiskLevel(r.risk_score) === 'HIGH').length
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Đánh giá Rủi ro</h2>
        <p>Xác định, đánh giá và quản lý các rủi ro tiềm ẩn của dự án</p>
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
        {/* Risk Statistics */}
        <div className={styles.section}>
          <h3>Thống kê Rủi ro</h3>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <div className={styles.statContent}>
                <h4>Tổng rủi ro</h4>
                <p className={styles.statNumber}>{riskStats.total}</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <i className="fas fa-search"></i>
              </div>
              <div className={styles.statContent}>
                <h4>Đã xác định</h4>
                <p className={styles.statNumber}>{riskStats.identified}</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <i className="fas fa-chart-line"></i>
              </div>
              <div className={styles.statContent}>
                <h4>Đã phân tích</h4>
                <p className={styles.statNumber}>{riskStats.analyzed}</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <i className="fas fa-shield-alt"></i>
              </div>
              <div className={styles.statContent}>
                <h4>Đã giảm thiểu</h4>
                <p className={styles.statNumber}>{riskStats.mitigated}</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <i className="fas fa-check-circle"></i>
              </div>
              <div className={styles.statContent}>
                <h4>Đã đóng</h4>
                <p className={styles.statNumber}>{riskStats.closed}</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <i className="fas fa-fire"></i>
              </div>
              <div className={styles.statContent}>
                <h4>Nghiêm trọng</h4>
                <p className={styles.statNumber}>{riskStats.critical}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3>Danh sách Rủi ro</h3>
            <button
              onClick={() => {
                setShowCreateRisk(true);
                setEditingRisk(null);
                resetForm();
              }}
              className={styles.btnPrimary}
            >
              <i className="fas fa-plus"></i>
              Thêm rủi ro
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
              <label>Lọc theo loại:</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className={styles.select}
              >
                <option value="">Tất cả loại</option>
                <option value="TECHNICAL">Kỹ thuật</option>
                <option value="FINANCIAL">Tài chính</option>
                <option value="SCHEDULE">Tiến độ</option>
                <option value="SAFETY">An toàn</option>
                <option value="ENVIRONMENTAL">Môi trường</option>
                <option value="REGULATORY">Quy định</option>
                <option value="SUPPLIER">Nhà cung cấp</option>
                <option value="PERSONNEL">Nhân sự</option>
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
                <option value="IDENTIFIED">Đã xác định</option>
                <option value="ANALYZED">Đã phân tích</option>
                <option value="MITIGATED">Đã giảm thiểu</option>
                <option value="MONITORED">Đang theo dõi</option>
                <option value="CLOSED">Đã đóng</option>
              </select>
            </div>
          </div>
        </div>

        {/* Risks List */}
        <div className={styles.section}>
          {loading ? (
            <div className={styles.loading}>
              <i className="fas fa-spinner fa-spin"></i>
              Đang tải...
            </div>
          ) : (
            <div className={styles.risksGrid}>
              {filteredRisks.map(risk => {
                const riskLevel = getRiskLevel(risk.risk_score);
                return (
                  <div key={risk._id} className={styles.riskCard}>
                    <div className={styles.riskHeader}>
                      <div className={styles.riskTitle}>
                        <h4>{risk.risk_name}</h4>
                        <div className={styles.riskMeta}>
                          <span className={styles.category}>{getCategoryLabel(risk.risk_category)}</span>
                          <span 
                            className={styles.riskLevel}
                            style={{ color: getRiskLevelColor(riskLevel) }}
                          >
                            {riskLevel}
                          </span>
                        </div>
                      </div>
                      <div className={styles.riskActions}>
                        <button
                          onClick={() => handleEditRisk(risk)}
                          className={styles.btnIcon}
                          title="Chỉnh sửa"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => handleDeleteRisk(risk._id)}
                          className={styles.btnIconDanger}
                          title="Xóa"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>

                    <div className={styles.riskContent}>
                      <p className={styles.description}>{risk.description}</p>

                      <div className={styles.riskDetails}>
                        <div className={styles.detailRow}>
                          <span className={styles.label}>Xác suất:</span>
                          <span className={styles.value}>{(risk.probability * 100).toFixed(0)}%</span>
                        </div>
                        <div className={styles.detailRow}>
                          <span className={styles.label}>Tác động:</span>
                          <span className={styles.value}>{risk.impact_score}/5</span>
                        </div>
                        <div className={styles.detailRow}>
                          <span className={styles.label}>Điểm rủi ro:</span>
                          <span className={styles.value}>{risk.risk_score.toFixed(2)}</span>
                        </div>
                        <div className={styles.detailRow}>
                          <span className={styles.label}>Trạng thái:</span>
                          <span 
                            className={styles.status}
                            style={{ color: getStatusColor(risk.status) }}
                          >
                            {getStatusLabel(risk.status)}
                          </span>
                        </div>
                        <div className={styles.detailRow}>
                          <span className={styles.label}>Người phụ trách:</span>
                          <span className={styles.value}>{risk.owner?.full_name || 'Chưa gán'}</span>
                        </div>
                        <div className={styles.detailRow}>
                          <span className={styles.label}>Ngày giải quyết:</span>
                          <span className={styles.value}>{formatDate(risk.target_resolution_date)}</span>
                        </div>
                      </div>

                      {risk.cost_impact > 0 && (
                        <div className={styles.impactInfo}>
                          <strong>Tác động chi phí:</strong> {formatCurrency(risk.cost_impact)}
                        </div>
                      )}

                      {risk.schedule_impact_days > 0 && (
                        <div className={styles.impactInfo}>
                          <strong>Tác động tiến độ:</strong> {risk.schedule_impact_days} ngày
                        </div>
                      )}

                      <div className={styles.mitigationPlan}>
                        <strong>Kế hoạch giảm thiểu:</strong>
                        <p>{risk.mitigation_plan}</p>
                      </div>

                      <div className={styles.statusControls}>
                        <select
                          value={risk.status}
                          onChange={(e) => handleUpdateRiskStatus(risk._id, e.target.value)}
                          className={styles.statusSelect}
                        >
                          <option value="IDENTIFIED">Đã xác định</option>
                          <option value="ANALYZED">Đã phân tích</option>
                          <option value="MITIGATED">Đã giảm thiểu</option>
                          <option value="MONITORED">Đang theo dõi</option>
                          <option value="CLOSED">Đã đóng</option>
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })}
              {filteredRisks.length === 0 && (
                <div className={styles.emptyState}>
                  <i className="fas fa-shield-alt"></i>
                  <p>Chưa có rủi ro nào được xác định</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Risk Modal */}
      {showCreateRisk && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>{editingRisk ? 'Chỉnh sửa rủi ro' : 'Thêm rủi ro mới'}</h3>
              <button
                onClick={() => {
                  setShowCreateRisk(false);
                  setEditingRisk(null);
                  resetForm();
                }}
                className={styles.modalClose}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={editingRisk ? handleUpdateRisk : handleCreateRisk} className={styles.form}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Tên rủi ro *</label>
                  <input
                    type="text"
                    value={riskForm.risk_name}
                    onChange={(e) => setRiskForm(prev => ({ ...prev, risk_name: e.target.value }))}
                    required
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Loại rủi ro *</label>
                  <select
                    value={riskForm.risk_category}
                    onChange={(e) => setRiskForm(prev => ({ ...prev, risk_category: e.target.value }))}
                    required
                    className={styles.select}
                  >
                    <option value="TECHNICAL">Kỹ thuật</option>
                    <option value="FINANCIAL">Tài chính</option>
                    <option value="SCHEDULE">Tiến độ</option>
                    <option value="SAFETY">An toàn</option>
                    <option value="ENVIRONMENTAL">Môi trường</option>
                    <option value="REGULATORY">Quy định</option>
                    <option value="SUPPLIER">Nhà cung cấp</option>
                    <option value="PERSONNEL">Nhân sự</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Giai đoạn</label>
                  <select
                    value={riskForm.phase_id}
                    onChange={(e) => setRiskForm(prev => ({ ...prev, phase_id: e.target.value }))}
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
                    value={riskForm.owner_id}
                    onChange={(e) => setRiskForm(prev => ({ ...prev, owner_id: e.target.value }))}
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
                  <label>Xác suất xảy ra (0-1) *</label>
                  <input
                    type="number"
                    value={riskForm.probability}
                    onChange={(e) => setRiskForm(prev => ({ ...prev, probability: Number(e.target.value) }))}
                    required
                    min="0"
                    max="1"
                    step="0.1"
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Mức độ tác động (1-5) *</label>
                  <input
                    type="number"
                    value={riskForm.impact_score}
                    onChange={(e) => setRiskForm(prev => ({ ...prev, impact_score: Number(e.target.value) }))}
                    required
                    min="1"
                    max="5"
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Ngày giải quyết dự kiến *</label>
                  <input
                    type="date"
                    value={riskForm.target_resolution_date}
                    onChange={(e) => setRiskForm(prev => ({ ...prev, target_resolution_date: e.target.value }))}
                    required
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Tác động chi phí (VND)</label>
                  <input
                    type="number"
                    value={riskForm.cost_impact}
                    onChange={(e) => setRiskForm(prev => ({ ...prev, cost_impact: Number(e.target.value) }))}
                    min="0"
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Tác động tiến độ (ngày)</label>
                  <input
                    type="number"
                    value={riskForm.schedule_impact_days}
                    onChange={(e) => setRiskForm(prev => ({ ...prev, schedule_impact_days: Number(e.target.value) }))}
                    min="0"
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Mô tả rủi ro *</label>
                <textarea
                  value={riskForm.description}
                  onChange={(e) => setRiskForm(prev => ({ ...prev, description: e.target.value }))}
                  required
                  rows={3}
                  className={styles.textarea}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Kế hoạch giảm thiểu *</label>
                <textarea
                  value={riskForm.mitigation_plan}
                  onChange={(e) => setRiskForm(prev => ({ ...prev, mitigation_plan: e.target.value }))}
                  required
                  rows={4}
                  className={styles.textarea}
                />
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateRisk(false);
                    setEditingRisk(null);
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
                    editingRisk ? 'Cập nhật' : 'Tạo mới'
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
          Hoàn thành Đánh giá Rủi ro
        </button>
      </div>
    </div>
  );
};

export default RiskAssessmentManagement;

