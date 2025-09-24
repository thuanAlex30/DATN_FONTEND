import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import incidentService from '../../../services/incidentService';

const InvestigateIncident: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [investigation, setInvestigation] = useState('');
  const [solution, setSolution] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !investigation || !solution) return;
    try {
      setLoading(true);
      setError(null);
      await incidentService.investigateIncident(id, { investigation, solution });
      navigate('/admin/incident-management');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể cập nhật điều tra & xử lý');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Điều tra & khắc phục</h2>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12, maxWidth: 520 }}>
        <label>
          Kết quả điều tra
          <textarea value={investigation} onChange={(e) => setInvestigation(e.target.value)} rows={4} style={{ width: '100%', padding: 8 }} />
        </label>
        <label>
          Giải pháp khắc phục
          <textarea value={solution} onChange={(e) => setSolution(e.target.value)} rows={4} style={{ width: '100%', padding: 8 }} />
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

export default InvestigateIncident;
