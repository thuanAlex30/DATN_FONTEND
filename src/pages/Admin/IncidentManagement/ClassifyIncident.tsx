import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import incidentService from '../../../services/incidentService';

const ClassifyIncident: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [severity, setSeverity] = useState<'nhẹ' | 'nặng' | 'rất nghiêm trọng'>('nhẹ');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      await incidentService.classifyIncident(id, { severity });
      navigate('/admin/incident-management');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể phân loại sự cố');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Phân loại sự cố</h2>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12, maxWidth: 420 }}>
        <label>
          Mức độ
          <select value={severity} onChange={(e) => setSeverity(e.target.value as any)} style={{ width: '100%', padding: 8 }}>
            <option value="nhẹ">Nhẹ</option>
            <option value="nặng">Nặng</option>
            <option value="rất nghiêm trọng">Rất nghiêm trọng</option>
          </select>
        </label>
        {error && <div style={{ color: '#dc2626' }}>{error}</div>}
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" disabled={loading} className="btn btn-primary">{loading ? 'Đang lưu...' : 'Lưu'}</button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Hủy</button>
        </div>
      </form>
    </div>
  );
};

export default ClassifyIncident;
