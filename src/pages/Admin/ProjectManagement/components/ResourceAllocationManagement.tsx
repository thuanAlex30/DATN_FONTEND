import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../../store';
import projectResourceService, { type ProjectResource, type CreateProjectResourceData } from '../../../../services/projectResourceService';
import projectPhaseService, { type ProjectPhase } from '../../../../services/projectPhaseService';
import styles from './ResourceAllocationManagement.module.css';

interface ResourceAllocationManagementProps {
  projectId: string;
  onComplete: () => void;
}

const ResourceAllocationManagement: React.FC<ResourceAllocationManagementProps> = ({ projectId, onComplete }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [resources, setResources] = useState<ProjectResource[]>([]);
  const [phases, setPhases] = useState<ProjectPhase[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateResource, setShowCreateResource] = useState(false);
  const [editingResource, setEditingResource] = useState<ProjectResource | null>(null);
  const [filterPhase, setFilterPhase] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');

  // Form states
  const [resourceForm, setResourceForm] = useState<CreateProjectResourceData>({
    project_id: projectId,
    resource_type: 'MATERIAL',
    resource_name: '',
    description: '',
    planned_quantity: 0,
    unit_cost: 0,
    unit_measure: '',
    required_date: '',
    location: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [resourcesData, phasesData] = await Promise.all([
        projectResourceService.getProjectResources(projectId),
        projectPhaseService.getProjectPhases(projectId)
      ]);
      setResources(resourcesData);
      setPhases(phasesData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await projectResourceService.createResource(resourceForm);
      await loadData();
      setShowCreateResource(false);
      resetForm();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể tạo tài nguyên');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingResource) return;

    try {
      setLoading(true);
      await projectResourceService.updateResource(editingResource._id, resourceForm);
      await loadData();
      setEditingResource(null);
      resetForm();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể cập nhật tài nguyên');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tài nguyên này?')) return;

    try {
      setLoading(true);
      await projectResourceService.deleteResource(resourceId);
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể xóa tài nguyên');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setResourceForm({
      project_id: projectId,
      resource_type: 'MATERIAL',
      resource_name: '',
      description: '',
      planned_quantity: 0,
      unit_cost: 0,
      unit_measure: '',
      required_date: '',
      location: '',
      notes: ''
    });
  };

  const handleEditResource = (resource: ProjectResource) => {
    setEditingResource(resource);
    setResourceForm({
      project_id: resource.project_id,
      resource_type: resource.resource_type,
      resource_name: resource.resource_name,
      description: resource.description || '',
      planned_quantity: resource.planned_quantity,
      unit_cost: resource.unit_cost,
      unit_measure: resource.unit_measure,
      supplier_id: resource.supplier_id,
      supplier_name: resource.supplier_name || '',
      required_date: resource.required_date.split('T')[0],
      location: resource.location || '',
      notes: resource.notes || ''
    });
    setShowCreateResource(true);
  };

  const getResourceTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'MATERIAL': 'Vật liệu',
      'EQUIPMENT': 'Thiết bị',
      'TOOL': 'Công cụ',
      'VEHICLE': 'Phương tiện',
      'PERSONNEL': 'Nhân lực',
      'SUBCONTRACTOR': 'Nhà thầu phụ'
    };
    return labels[type] || type;
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      'PLANNED': 'Đã lên kế hoạch',
      'ORDERED': 'Đã đặt hàng',
      'DELIVERED': 'Đã giao',
      'IN_USE': 'Đang sử dụng',
      'CONSUMED': 'Đã sử dụng hết',
      'RETURNED': 'Đã trả'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'PLANNED': '#3498db',
      'ORDERED': '#f39c12',
      'DELIVERED': '#27ae60',
      'IN_USE': '#2ecc71',
      'CONSUMED': '#95a5a6',
      'RETURNED': '#9b59b6'
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

  const filteredResources = resources.filter(resource => {
    const matchesPhase = !filterPhase || resource.project_id === filterPhase;
    const matchesType = !filterType || resource.resource_type === filterType;
    return matchesPhase && matchesType;
  });

  const totalBudget = resources.reduce((sum, resource) => sum + (resource.planned_quantity * resource.unit_cost), 0);
  const totalActualCost = resources.reduce((sum, resource) => sum + (resource.actual_quantity * resource.unit_cost), 0);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Phân bổ Tài nguyên</h2>
        <p>Quản lý và phân bổ tài nguyên cho dự án</p>
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
        {/* Budget Summary */}
        <div className={styles.section}>
          <h3>Tổng quan Ngân sách</h3>
          <div className={styles.budgetGrid}>
            <div className={styles.budgetCard}>
              <div className={styles.budgetIcon}>
                <i className="fas fa-wallet"></i>
              </div>
              <div className={styles.budgetContent}>
                <h4>Ngân sách dự kiến</h4>
                <p className={styles.budgetAmount}>{formatCurrency(totalBudget)}</p>
              </div>
            </div>
            <div className={styles.budgetCard}>
              <div className={styles.budgetIcon}>
                <i className="fas fa-receipt"></i>
              </div>
              <div className={styles.budgetContent}>
                <h4>Chi phí thực tế</h4>
                <p className={styles.budgetAmount}>{formatCurrency(totalActualCost)}</p>
              </div>
            </div>
            <div className={styles.budgetCard}>
              <div className={styles.budgetIcon}>
                <i className="fas fa-chart-line"></i>
              </div>
              <div className={styles.budgetContent}>
                <h4>Chênh lệch</h4>
                <p className={`${styles.budgetAmount} ${totalActualCost > totalBudget ? styles.overBudget : styles.underBudget}`}>
                  {formatCurrency(totalActualCost - totalBudget)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3>Tài nguyên Dự án</h3>
            <button
              onClick={() => {
                setShowCreateResource(true);
                setEditingResource(null);
                resetForm();
              }}
              className={styles.btnPrimary}
            >
              <i className="fas fa-plus"></i>
              Thêm tài nguyên
            </button>
          </div>

          <div className={styles.filters}>
            <div className={styles.filterGroup}>
              <label>Lọc theo loại:</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className={styles.select}
              >
                <option value="">Tất cả loại</option>
                <option value="MATERIAL">Vật liệu</option>
                <option value="EQUIPMENT">Thiết bị</option>
                <option value="TOOL">Công cụ</option>
                <option value="VEHICLE">Phương tiện</option>
                <option value="PERSONNEL">Nhân lực</option>
                <option value="SUBCONTRACTOR">Nhà thầu phụ</option>
              </select>
            </div>
          </div>
        </div>

        {/* Resources List */}
        <div className={styles.section}>
          {loading ? (
            <div className={styles.loading}>
              <i className="fas fa-spinner fa-spin"></i>
              Đang tải...
            </div>
          ) : (
            <div className={styles.resourcesGrid}>
              {filteredResources.map(resource => (
                <div key={resource._id} className={styles.resourceCard}>
                  <div className={styles.resourceHeader}>
                    <div className={styles.resourceType}>
                      <i className={`fas fa-${getResourceTypeIcon(resource.resource_type)}`}></i>
                      <span>{getResourceTypeLabel(resource.resource_type)}</span>
                    </div>
                    <div className={styles.resourceActions}>
                      <button
                        onClick={() => handleEditResource(resource)}
                        className={styles.btnIcon}
                        title="Chỉnh sửa"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        onClick={() => handleDeleteResource(resource._id)}
                        className={styles.btnIconDanger}
                        title="Xóa"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>

                  <div className={styles.resourceContent}>
                    <h4>{resource.resource_name}</h4>
                    {resource.description && (
                      <p className={styles.description}>{resource.description}</p>
                    )}

                    <div className={styles.resourceDetails}>
                      <div className={styles.detailRow}>
                        <span className={styles.label}>Số lượng dự kiến:</span>
                        <span className={styles.value}>{resource.planned_quantity} {resource.unit_measure}</span>
                      </div>
                      <div className={styles.detailRow}>
                        <span className={styles.label}>Số lượng thực tế:</span>
                        <span className={styles.value}>{resource.actual_quantity} {resource.unit_measure}</span>
                      </div>
                      <div className={styles.detailRow}>
                        <span className={styles.label}>Đơn giá:</span>
                        <span className={styles.value}>{formatCurrency(resource.unit_cost)}</span>
                      </div>
                      <div className={styles.detailRow}>
                        <span className={styles.label}>Tổng chi phí:</span>
                        <span className={styles.value}>{formatCurrency(resource.planned_quantity * resource.unit_cost)}</span>
                      </div>
                      <div className={styles.detailRow}>
                        <span className={styles.label}>Ngày yêu cầu:</span>
                        <span className={styles.value}>{formatDate(resource.required_date)}</span>
                      </div>
                      <div className={styles.detailRow}>
                        <span className={styles.label}>Trạng thái:</span>
                        <span className={styles.status} style={{ color: getStatusColor(resource.status) }}>
                          {getStatusLabel(resource.status)}
                        </span>
                      </div>
                    </div>

                    {resource.supplier_name && (
                      <div className={styles.supplierInfo}>
                        <strong>Nhà cung cấp:</strong> {resource.supplier_name}
                      </div>
                    )}

                    {resource.location && (
                      <div className={styles.locationInfo}>
                        <strong>Vị trí:</strong> {resource.location}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {filteredResources.length === 0 && (
                <div className={styles.emptyState}>
                  <i className="fas fa-boxes"></i>
                  <p>Chưa có tài nguyên nào được thêm</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Resource Modal */}
      {showCreateResource && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>{editingResource ? 'Chỉnh sửa tài nguyên' : 'Thêm tài nguyên mới'}</h3>
              <button
                onClick={() => {
                  setShowCreateResource(false);
                  setEditingResource(null);
                  resetForm();
                }}
                className={styles.modalClose}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={editingResource ? handleUpdateResource : handleCreateResource} className={styles.form}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Loại tài nguyên *</label>
                  <select
                    value={resourceForm.resource_type}
                    onChange={(e) => setResourceForm(prev => ({ ...prev, resource_type: e.target.value }))}
                    required
                    className={styles.select}
                  >
                    <option value="MATERIAL">Vật liệu</option>
                    <option value="EQUIPMENT">Thiết bị</option>
                    <option value="TOOL">Công cụ</option>
                    <option value="VEHICLE">Phương tiện</option>
                    <option value="PERSONNEL">Nhân lực</option>
                    <option value="SUBCONTRACTOR">Nhà thầu phụ</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Tên tài nguyên *</label>
                  <input
                    type="text"
                    value={resourceForm.resource_name}
                    onChange={(e) => setResourceForm(prev => ({ ...prev, resource_name: e.target.value }))}
                    required
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Số lượng dự kiến *</label>
                  <input
                    type="number"
                    value={resourceForm.planned_quantity}
                    onChange={(e) => setResourceForm(prev => ({ ...prev, planned_quantity: Number(e.target.value) }))}
                    required
                    min="0"
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Đơn vị đo *</label>
                  <input
                    type="text"
                    value={resourceForm.unit_measure}
                    onChange={(e) => setResourceForm(prev => ({ ...prev, unit_measure: e.target.value }))}
                    required
                    placeholder="Ví dụ: cái, kg, m, giờ..."
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Đơn giá (VND) *</label>
                  <input
                    type="number"
                    value={resourceForm.unit_cost}
                    onChange={(e) => setResourceForm(prev => ({ ...prev, unit_cost: Number(e.target.value) }))}
                    required
                    min="0"
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Ngày yêu cầu *</label>
                  <input
                    type="date"
                    value={resourceForm.required_date}
                    onChange={(e) => setResourceForm(prev => ({ ...prev, required_date: e.target.value }))}
                    required
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Mô tả</label>
                <textarea
                  value={resourceForm.description}
                  onChange={(e) => setResourceForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className={styles.textarea}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Tên nhà cung cấp</label>
                <input
                  type="text"
                  value={resourceForm.supplier_name}
                  onChange={(e) => setResourceForm(prev => ({ ...prev, supplier_name: e.target.value }))}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Vị trí lưu trữ</label>
                <input
                  type="text"
                  value={resourceForm.location}
                  onChange={(e) => setResourceForm(prev => ({ ...prev, location: e.target.value }))}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Ghi chú</label>
                <textarea
                  value={resourceForm.notes}
                  onChange={(e) => setResourceForm(prev => ({ ...prev, notes: e.target.value }))}
                  rows={2}
                  className={styles.textarea}
                />
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateResource(false);
                    setEditingResource(null);
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
                    editingResource ? 'Cập nhật' : 'Tạo mới'
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
          Hoàn thành Phân bổ Tài nguyên
        </button>
      </div>
    </div>
  );
};

// Helper function to get icon for resource type
const getResourceTypeIcon = (type: string): string => {
  const icons: { [key: string]: string } = {
    'MATERIAL': 'cube',
    'EQUIPMENT': 'cogs',
    'TOOL': 'wrench',
    'VEHICLE': 'truck',
    'PERSONNEL': 'users',
    'SUBCONTRACTOR': 'handshake'
  };
  return icons[type] || 'box';
};

export default ResourceAllocationManagement;

