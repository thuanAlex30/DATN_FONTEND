import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import incidentService from '../../../services/incidentService';

const CloseIncident: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      await incidentService.closeIncident(id);
      navigate('/admin/incident-management');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể đóng sự cố');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Đóng sự cố</h2>
      <p>Bạn có chắc chắn muốn đóng sự cố này?</p>
      {error && <div style={{ color: '#dc2626' }}>{error}</div>}
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={handleClose} disabled={loading} className="btn btn-danger">{loading ? 'Đang đóng...' : 'Xác nhận đóng'}</button>
        <button onClick={() => navigate(-1)} className="btn btn-secondary">Hủy</button>
      </div>
    </div>
  );
};

export default CloseIncident;
