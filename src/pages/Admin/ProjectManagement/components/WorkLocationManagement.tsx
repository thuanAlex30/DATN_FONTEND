import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../../store';
import workLocationService, { type WorkLocation, type CreateWorkLocationData } from '../../../../services/workLocationService';
import siteAreaService, { type SiteArea } from '../../../../services/siteAreaService';
import styles from './WorkLocationManagement.module.css';

interface WorkLocationManagementProps {
  projectId: string;
  onComplete: () => void;
}

const WorkLocationManagement: React.FC<WorkLocationManagementProps> = ({ projectId, onComplete }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [siteAreas, setSiteAreas] = useState<SiteArea[]>([]);
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [workLocations, setWorkLocations] = useState<WorkLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateLocation, setShowCreateLocation] = useState(false);
  const [editingLocation, setEditingLocation] = useState<WorkLocation | null>(null);

  // Form states
  const [locationForm, setLocationForm] = useState<CreateWorkLocationData>({
    area_id: '',
    location_code: '',
    location_name: '',
    location_type: 'WORKSTATION',
    access_requirements: '',
    capacity: 1,
    safety_equipment_required: [],
    special_instructions: ''
  });

  useEffect(() => {
    loadSiteAreas();
  }, []);

  useEffect(() => {
    if (selectedArea) {
      loadWorkLocations(selectedArea);
    }
  }, [selectedArea]);

  const loadSiteAreas = async () => {
    try {
      setLoading(true);
      // Get all areas for the project's site
      const data = await siteAreaService.getAllAreas();
      setSiteAreas(data);
    } catch (err) {
      console.error('Error loading site areas:', err);
      setError('Không thể tải danh sách khu vực');
    } finally {
      setLoading(false);
    }
  };

  const loadWorkLocations = async (areaId: string) => {
    try {
      setLoading(true);
      const data = await workLocationService.getAreaLocations(areaId);
      setWorkLocations(data);
    } catch (err) {
      console.error('Error loading work locations:', err);
      setError('Không thể tải danh sách vị trí làm việc');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await workLocationService.createLocation(locationForm);
      await loadWorkLocations(selectedArea);
      setShowCreateLocation(false);
      resetForm();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể tạo vị trí làm việc');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLocation) return;

    try {
      setLoading(true);
      await workLocationService.updateLocation(editingLocation._id, locationForm);
      await loadWorkLocations(selectedArea);
      setEditingLocation(null);
      resetForm();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể cập nhật vị trí làm việc');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLocation = async (locationId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa vị trí làm việc này?')) return;

    try {
      setLoading(true);
      await workLocationService.deleteLocation(locationId);
      await loadWorkLocations(selectedArea);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể xóa vị trí làm việc');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setLocationForm({
      area_id: selectedArea,
      location_code: '',
      location_name: '',
      location_type: 'WORKSTATION',
      access_requirements: '',
      capacity: 1,
      safety_equipment_required: [],
      special_instructions: ''
    });
  };

  const handleEditLocation = (location: WorkLocation) => {
    setEditingLocation(location);
    setLocationForm({
      area_id: location.area_id,
      location_code: location.location_code,
      location_name: location.location_name,
      location_type: location.location_type,
      coordinates_within_area: location.coordinates_within_area,
      access_requirements: location.access_requirements || '',
      capacity: location.capacity,
      safety_equipment_required: location.safety_equipment_required || [],
      special_instructions: location.special_instructions || ''
    });
    setShowCreateLocation(true);
  };

  const addSafetyEquipment = () => {
    setLocationForm(prev => ({
      ...prev,
      safety_equipment_required: [
        ...prev.safety_equipment_required,
        { equipment_name: '', is_mandatory: true }
      ]
    }));
  };

  const removeSafetyEquipment = (index: number) => {
    setLocationForm(prev => ({
      ...prev,
      safety_equipment_required: prev.safety_equipment_required.filter((_, i) => i !== index)
    }));
  };

  const updateSafetyEquipment = (index: number, field: string, value: any) => {
    setLocationForm(prev => ({
      ...prev,
      safety_equipment_required: prev.safety_equipment_required.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const getLocationTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'WORKSTATION': 'Trạm làm việc',
      'EQUIPMENT_AREA': 'Khu vực thiết bị',
      'MEETING_POINT': 'Điểm họp',
      'STORAGE': 'Kho lưu trữ',
      'SAFETY_ZONE': 'Khu vực an toàn',
      'REST_AREA': 'Khu nghỉ ngơi'
    };
    return labels[type] || type;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Thiết lập Vị trí Làm việc</h2>
        <p>Quản lý các vị trí làm việc trong khu vực</p>
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
        {/* Area Selection */}
        <div className={styles.section}>
          <h3>Chọn Khu vực</h3>
          <select
            value={selectedArea}
            onChange={(e) => {
              setSelectedArea(e.target.value);
              setLocationForm(prev => ({ ...prev, area_id: e.target.value }));
            }}
            className={styles.select}
          >
            <option value="">Chọn khu vực...</option>
            {siteAreas.map(area => (
              <option key={area._id} value={area._id}>
                {area.area_name} ({area.area_code}) - {area.area_type}
              </option>
            ))}
          </select>
        </div>

        {/* Work Locations List */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3>Vị trí Làm việc</h3>
            <button
              onClick={() => {
                setShowCreateLocation(true);
                setEditingLocation(null);
                resetForm();
              }}
              className={styles.btnPrimary}
              disabled={!selectedArea}
            >
              <i className="fas fa-plus"></i>
              Thêm vị trí
            </button>
          </div>

          {loading ? (
            <div className={styles.loading}>
              <i className="fas fa-spinner fa-spin"></i>
              Đang tải...
            </div>
          ) : (
            <div className={styles.locationsGrid}>
              {workLocations.map(location => (
                <div key={location._id} className={styles.locationCard}>
                  <div className={styles.locationHeader}>
                    <h4>{location.location_name}</h4>
                    <div className={styles.locationActions}>
                      <button
                        onClick={() => handleEditLocation(location)}
                        className={styles.btnIcon}
                        title="Chỉnh sửa"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        onClick={() => handleDeleteLocation(location._id)}
                        className={styles.btnIconDanger}
                        title="Xóa"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                  <div className={styles.locationDetails}>
                    <p><strong>Mã vị trí:</strong> {location.location_code}</p>
                    <p><strong>Loại:</strong> {getLocationTypeLabel(location.location_type)}</p>
                    <p><strong>Sức chứa:</strong> {location.capacity} người</p>
                    {location.access_requirements && (
                      <p><strong>Yêu cầu truy cập:</strong> {location.access_requirements}</p>
                    )}
                    {location.special_instructions && (
                      <p><strong>Hướng dẫn đặc biệt:</strong> {location.special_instructions}</p>
                    )}
                    {location.safety_equipment_required.length > 0 && (
                      <div>
                        <strong>Thiết bị an toàn yêu cầu:</strong>
                        <ul className={styles.equipmentList}>
                          {location.safety_equipment_required.map((equipment, index) => (
                            <li key={index}>
                              {equipment.equipment_name}
                              {equipment.is_mandatory && <span className={styles.mandatory}> (Bắt buộc)</span>}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {workLocations.length === 0 && (
                <div className={styles.emptyState}>
                  <i className="fas fa-map-pin"></i>
                  <p>Chưa có vị trí làm việc nào trong khu vực này</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Location Modal */}
      {showCreateLocation && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>{editingLocation ? 'Chỉnh sửa vị trí làm việc' : 'Thêm vị trí làm việc mới'}</h3>
              <button
                onClick={() => {
                  setShowCreateLocation(false);
                  setEditingLocation(null);
                  resetForm();
                }}
                className={styles.modalClose}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={editingLocation ? handleUpdateLocation : handleCreateLocation} className={styles.form}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Mã vị trí *</label>
                  <input
                    type="text"
                    value={locationForm.location_code}
                    onChange={(e) => setLocationForm(prev => ({ ...prev, location_code: e.target.value }))}
                    required
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Tên vị trí *</label>
                  <input
                    type="text"
                    value={locationForm.location_name}
                    onChange={(e) => setLocationForm(prev => ({ ...prev, location_name: e.target.value }))}
                    required
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Loại vị trí *</label>
                  <select
                    value={locationForm.location_type}
                    onChange={(e) => setLocationForm(prev => ({ ...prev, location_type: e.target.value }))}
                    required
                    className={styles.select}
                  >
                    <option value="WORKSTATION">Trạm làm việc</option>
                    <option value="EQUIPMENT_AREA">Khu vực thiết bị</option>
                    <option value="MEETING_POINT">Điểm họp</option>
                    <option value="STORAGE">Kho lưu trữ</option>
                    <option value="SAFETY_ZONE">Khu vực an toàn</option>
                    <option value="REST_AREA">Khu nghỉ ngơi</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Sức chứa (người)</label>
                  <input
                    type="number"
                    value={locationForm.capacity}
                    onChange={(e) => setLocationForm(prev => ({ ...prev, capacity: Number(e.target.value) }))}
                    min="1"
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Yêu cầu truy cập</label>
                <textarea
                  value={locationForm.access_requirements}
                  onChange={(e) => setLocationForm(prev => ({ ...prev, access_requirements: e.target.value }))}
                  rows={2}
                  className={styles.textarea}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Hướng dẫn đặc biệt</label>
                <textarea
                  value={locationForm.special_instructions}
                  onChange={(e) => setLocationForm(prev => ({ ...prev, special_instructions: e.target.value }))}
                  rows={2}
                  className={styles.textarea}
                />
              </div>

              {/* Safety Equipment */}
              <div className={styles.formGroup}>
                <div className={styles.equipmentHeader}>
                  <label>Thiết bị An toàn Yêu cầu</label>
                  <button
                    type="button"
                    onClick={addSafetyEquipment}
                    className={styles.btnAdd}
                  >
                    <i className="fas fa-plus"></i>
                    Thêm thiết bị
                  </button>
                </div>
                {locationForm.safety_equipment_required.map((equipment, index) => (
                  <div key={index} className={styles.equipmentItem}>
                    <input
                      type="text"
                      value={equipment.equipment_name}
                      onChange={(e) => updateSafetyEquipment(index, 'equipment_name', e.target.value)}
                      placeholder="Tên thiết bị"
                      className={styles.input}
                    />
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={equipment.is_mandatory}
                        onChange={(e) => updateSafetyEquipment(index, 'is_mandatory', e.target.checked)}
                      />
                      Bắt buộc
                    </label>
                    <button
                      type="button"
                      onClick={() => removeSafetyEquipment(index)}
                      className={styles.btnRemove}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                ))}
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateLocation(false);
                    setEditingLocation(null);
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
                    editingLocation ? 'Cập nhật' : 'Tạo mới'
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
          Hoàn thành thiết lập Vị trí Làm việc
        </button>
      </div>
    </div>
  );
};

export default WorkLocationManagement;



