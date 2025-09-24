import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import incidentService from '../../../services/incidentService';

interface HistoryItem {
  action: string;
  note?: string;
  timestamp?: string;
  performedBy?: { full_name?: string; username?: string };
}

interface IncidentDetail {
  _id: string;
  incidentId?: string;
  title: string;
  status?: string;
  histories?: HistoryItem[];
}

const ProgressHistory: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [incident, setIncident] = useState<IncidentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        // Reuse list API and filter client-side if no detail endpoint exists yet
        const res = await incidentService.getIncidents();
        const found = (res.data as IncidentDetail[]).find((x) => x._id === id);
        if (!found) {
          setError('Không tìm thấy sự cố');
        } else {
          setIncident(found);
        }
      } catch (err: any) {
        setError('Không thể tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetail();
  }, [id]);

  if (loading) return <div style={{ padding: 24 }}>Đang tải...</div>;
  if (error) return <div style={{ padding: 24, color: '#dc2626' }}>{error}</div>;
  if (!incident) return null;

  const histories = (incident.histories || []).slice().sort((a, b) => {
    const ta = a.timestamp ? new Date(a.timestamp).getTime() : 0;
    const tb = b.timestamp ? new Date(b.timestamp).getTime() : 0;
    return ta - tb;
  });

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Lịch sử tiến độ - {incident.incidentId || incident._id}</h2>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          <i className="fas fa-arrow-left"></i> Quay lại
        </button>
      </div>

      <div style={{ marginTop: 16, color: '#475569' }}>Trạng thái hiện tại: <strong>{incident.status || '-'}</strong></div>

      <div style={{ marginTop: 24 }}>
        {histories.length === 0 ? (
          <div style={{ color: '#94a3b8' }}>Chưa có lịch sử</div>
        ) : (
          <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {histories.map((h, idx) => (
              <li key={idx} style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 16, padding: '12px 0', borderBottom: '1px solid #eee' }}>
                <div style={{ color: '#64748b', fontSize: 12 }}>{h.timestamp ? new Date(h.timestamp).toLocaleString() : ''}</div>
                <div>
                  <div style={{ fontWeight: 700 }}>{h.action}</div>
                  <div style={{ marginTop: 4 }}>{h.note || '-'}</div>
                  {h.performedBy && (
                    <div style={{ marginTop: 6, color: '#64748b', fontSize: 12 }}>
                      Bởi: {h.performedBy.full_name || h.performedBy.username || '—'}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
};

export default ProgressHistory;
