import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../../store';
import siteAreaService, { type SiteArea, type CreateSiteAreaData } from '../../../../services/siteAreaService';
import projectService from '../../../../services/projectService';
import styles from './SiteManagement.module.css';

interface SiteManagementProps {
  projectId: string;
  onComplete: () => void;
}

const SiteManagement: React.FC<SiteManagementProps> = ({ projectId, onComplete }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [sites, setSites] = useState<any[]>([]);
  const [selectedSite, setSelectedSite] = useState<string>('');
  const [siteAreas, setSiteAreas] = useState<SiteArea[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateArea, setShowCreateArea] = useState(false);
  const [editingArea, setEditingArea] = useState<SiteArea | null>(null);

  // Form states
  const [areaForm, setAreaForm] = useState<CreateSiteAreaData>({
    site_id: '',
    area_code: '',
    area_name: '',
    area_type: 'CONSTRUCTION',
    description: '',
    area_size_sqm: 0,
    safety_level: 'MEDIUM',
    supervisor_id: user?.id || '',
    capacity: 1,
    special_requirements: ''
  });

  useEffect(() => {
    loadSites();
  }, []);

  useEffect(() => {
    if (selectedSite) {
      loadSiteAreas(selectedSite);
    }
  }, [selectedSite]);

  const loadSites = async () => {
    try {
      setLoading(true);
      const response = await projectService.getAllSites();
      const data = response.data || [];
      setSites(data);
      if (data.length > 0 && !selectedSite) {
        setSelectedSite(data[0]._id);
        setAreaForm(prev => ({ ...prev, site_id: data[0]._id }));
      }
    } catch (err) {
      console.error('Error loading sites:', err);
      setError('Không thể tải danh sách site');
    } finally {
      setLoading(false);
    }
  };

  const loadSiteAreas = async (siteId: string) => {
    try {
      setLoading(true);
      const data = await siteAreaService.getSiteAreas(siteId);
      setSiteAreas(data);
    } catch (err) {
      console.error('Error loading site areas:', err);
      setError('Không thể tải danh sách khu vực');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateArea = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await siteAreaService.createArea(areaForm);
      await loadSiteAreas(selectedSite);
      setShowCreateArea(false);
      resetForm();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể tạo khu vực');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateArea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArea) return;

    try {
      setLoading(true);
      await siteAreaService.updateArea(editingArea._id, areaForm);
      await loadSiteAreas(selectedSite);
      setEditingArea(null);
      resetForm();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể cập nhật khu vực');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteArea = async (areaId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa khu vực này?')) return;

    try {
      setLoading(true);
      await siteAreaService.deleteArea(areaId);
      await loadSiteAreas(selectedSite);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể xóa khu vực');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setAreaForm({
      site_id: selectedSite,
      area_code: '',
      area_name: '',
      area_type: 'CONSTRUCTION',
      description: '',
      area_size_sqm: 0,
      safety_level: 'MEDIUM',
      supervisor_id: user?.id || '',
      capacity: 1,
      special_requirements: ''
    });
  };

  const handleEditArea = (area: SiteArea) => {
    setEditingArea(area);
    setAreaForm({
      site_id: area.site_id,
      area_code: area.area_code,
      area_name: area.area_name,
      area_type: area.area_type,
      description: area.description || '',
      area_size_sqm: area.area_size_sqm,
      safety_level: area.safety_level,
      supervisor_id: area.supervisor_id,
      capacity: area.capacity,
      special_requirements: area.special_requirements || ''
    });
    setShowCreateArea(true);
  };

  const getAreaTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'CONSTRUCTION': 'Xây dựng',
      'STORAGE': 'Kho bãi',
      'OFFICE': 'Văn phòng',
      'SAFETY': 'An toàn',
      'EQUIPMENT': 'Thiết bị',
      'MEETING': 'Họp',
      'REST': 'Nghỉ ngơi'
    };
    return labels[type] || type;
  };

  const getSafetyLevelLabel = (level: string) => {
    const labels: { [key: string]: string } = {
      'LOW': 'Thấp',
      'MEDIUM': 'Trung bình',
      'HIGH': 'Cao',
      'CRITICAL': 'Nghiêm trọng'
    };
    return labels[level] || level;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Thiết lập Site và Khu vực</h2>
        <p>Quản lý các khu vực trong site của dự án</p>
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
        {/* Site Selection */}
        <div className={styles.section}>
          <h3>Chọn Site</h3>
          <select
            value={selectedSite}
            onChange={(e) => {
              setSelectedSite(e.target.value);
              setAreaForm(prev => ({ ...prev, site_id: e.target.value }));
            }}
            className={styles.select}
          >
            <option value="">Chọn site...</option>
            {sites.map(site => (
              <option key={site._id} value={site._id}>
                {site.site_name} - {site.address}
              </option>
            ))}
          </select>
        </div>

        {/* Site Areas List */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3>Khu vực trong Site</h3>
            <button
              onClick={() => {
                setShowCreateArea(true);
                setEditingArea(null);
                resetForm();
              }}
              className={styles.btnPrimary}
              disabled={!selectedSite}
            >
              <i className="fas fa-plus"></i>
              Thêm khu vực
            </button>
          </div>

          {loading ? (
            <div className={styles.loading}>
              <i className="fas fa-spinner fa-spin"></i>
              Đang tải...
            </div>
          ) : (
            <div className={styles.areasGrid}>
              {siteAreas.map(area => (
                <div key={area._id} className={styles.areaCard}>
                  <div className={styles.areaHeader}>
                    <h4>{area.area_name}</h4>
                    <div className={styles.areaActions}>
                      <button
                        onClick={() => handleEditArea(area)}
                        className={styles.btnIcon}
                        title="Chỉnh sửa"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        onClick={() => handleDeleteArea(area._id)}
                        className={styles.btnIconDanger}
                        title="Xóa"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                  <div className={styles.areaDetails}>
                    <p><strong>Mã khu vực:</strong> {area.area_code}</p>
                    <p><strong>Loại:</strong> {getAreaTypeLabel(area.area_type)}</p>
                    <p><strong>Diện tích:</strong> {area.area_size_sqm} m²</p>
                    <p><strong>Mức độ an toàn:</strong> {getSafetyLevelLabel(area.safety_level)}</p>
                    <p><strong>Sức chứa:</strong> {area.capacity} người</p>
                    {area.description && (
                      <p><strong>Mô tả:</strong> {area.description}</p>
                    )}
                    {area.special_requirements && (
                      <p><strong>Yêu cầu đặc biệt:</strong> {area.special_requirements}</p>
                    )}
                  </div>
                </div>
              ))}
              {siteAreas.length === 0 && (
                <div className={styles.emptyState}>
                  <i className="fas fa-map-marker-alt"></i>
                  <p>Chưa có khu vực nào trong site này</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Area Modal */}
      {showCreateArea && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>{editingArea ? 'Chỉnh sửa khu vực' : 'Thêm khu vực mới'}</h3>
              <button
                onClick={() => {
                  setShowCreateArea(false);
                  setEditingArea(null);
                  resetForm();
                }}
                className={styles.modalClose}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={editingArea ? handleUpdateArea : handleCreateArea} className={styles.form}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Mã khu vực *</label>
                  <input
                    type="text"
                    value={areaForm.area_code}
                    onChange={(e) => setAreaForm(prev => ({ ...prev, area_code: e.target.value }))}
                    required
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Tên khu vực *</label>
                  <input
                    type="text"
                    value={areaForm.area_name}
                    onChange={(e) => setAreaForm(prev => ({ ...prev, area_name: e.target.value }))}
                    required
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Loại khu vực *</label>
                  <select
                    value={areaForm.area_type}
                    onChange={(e) => setAreaForm(prev => ({ ...prev, area_type: e.target.value }))}
                    required
                    className={styles.select}
                  >
                    <option value="CONSTRUCTION">Xây dựng</option>
                    <option value="STORAGE">Kho bãi</option>
                    <option value="OFFICE">Văn phòng</option>
                    <option value="SAFETY">An toàn</option>
                    <option value="EQUIPMENT">Thiết bị</option>
                    <option value="MEETING">Họp</option>
                    <option value="REST">Nghỉ ngơi</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Mức độ an toàn *</label>
                  <select
                    value={areaForm.safety_level}
                    onChange={(e) => setAreaForm(prev => ({ ...prev, safety_level: e.target.value }))}
                    required
                    className={styles.select}
                  >
                    <option value="LOW">Thấp</option>
                    <option value="MEDIUM">Trung bình</option>
                    <option value="HIGH">Cao</option>
                    <option value="CRITICAL">Nghiêm trọng</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Diện tích (m²) *</label>
                  <input
                    type="number"
                    value={areaForm.area_size_sqm}
                    onChange={(e) => setAreaForm(prev => ({ ...prev, area_size_sqm: Number(e.target.value) }))}
                    required
                    min="0"
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Sức chứa (người)</label>
                  <input
                    type="number"
                    value={areaForm.capacity}
                    onChange={(e) => setAreaForm(prev => ({ ...prev, capacity: Number(e.target.value) }))}
                    min="1"
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Mô tả</label>
                <textarea
                  value={areaForm.description}
                  onChange={(e) => setAreaForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className={styles.textarea}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Yêu cầu đặc biệt</label>
                <textarea
                  value={areaForm.special_requirements}
                  onChange={(e) => setAreaForm(prev => ({ ...prev, special_requirements: e.target.value }))}
                  rows={2}
                  className={styles.textarea}
                />
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateArea(false);
                    setEditingArea(null);
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
                    editingArea ? 'Cập nhật' : 'Tạo mới'
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
          Hoàn thành thiết lập Site
        </button>
      </div>
    </div>
  );
};

export default SiteManagement;
