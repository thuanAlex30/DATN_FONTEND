import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import incidentService from '../../../services/incidentService';

const UpdateProgress: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [progress, setProgress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !progress) return;
    try {
      setLoading(true);
      setError(null);
      await incidentService.updateIncidentProgress(id, { progress });
      navigate('/admin/incident-management');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể cập nhật tiến độ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Cập nhật tiến độ</h2>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12, maxWidth: 520 }}>
        <label>
          Nội dung tiến độ
          <textarea value={progress} onChange={(e) => setProgress(e.target.value)} rows={4} style={{ width: '100%', padding: 8 }} />
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

export default UpdateProgress;
