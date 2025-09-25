import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import incidentService from '../../../services/incidentService';

interface IncidentItem {
  _id: string;
  incidentId?: string;
  title: string;
  description?: string;
  location?: string;
  severity?: string;
  status?: string;
  createdAt?: string;
  images?: string[];
}

const IncidentList: React.FC = () => {
  const [incidents, setIncidents] = useState<IncidentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState<string | null>(null);

  const openModal = (src: string) => {
    setModalImage(src);
    setIsModalOpen(true);
  };

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setModalImage(null);
  }, []);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    if (isModalOpen) {
      window.addEventListener('keydown', onEsc);
    }
    return () => window.removeEventListener('keydown', onEsc);
  }, [isModalOpen, closeModal]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await incidentService.getIncidents();
        setIncidents(res.data);
      } catch (err: any) {
        setError('Không thể tải danh sách sự cố');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div style={{ padding: 24 }}>Đang tải...</div>;
  if (error) return <div style={{ padding: 24, color: '#dc2626' }}>{error}</div>;

  return (
    <div style={{ padding: 24 }}>
      <h2>Danh sách sự cố</h2>
      <table className="incident-table" style={{ width: '100%', background: '#fff' }}>
        <thead>
          <tr>
            <th>Mã</th>
            <th>Tiêu đề</th>
            <th>Vị trí</th>
            <th>Mức độ</th>
            <th>Trạng thái</th>
            <th>Ngày tạo</th>
            <th>Hình ảnh</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {incidents.map((i) => (
            <tr key={i._id}>
              <td>{i.incidentId || '-'}</td>
              <td>{i.title}</td>
              <td>{i.location || '-'}</td>
              <td>{i.severity || '-'}</td>
              <td>{i.status || '-'}</td>
              <td>{i.createdAt ? new Date(i.createdAt).toLocaleString() : '-'}</td>
              <td>
                {Array.isArray(i.images) && i.images.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 48px)', gap: 6 }}>
                    {i.images.slice(0, 6).map((src, idx) => (
                      <img
                        key={idx}
                        src={src}
                        alt={`img-${idx}`}
                        style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6, border: '1px solid #eee', cursor: 'pointer' }}
                        onClick={() => openModal(src)}
                      />
                    ))}
                  </div>
                ) : (
                  <span style={{ color: '#94a3b8' }}>—</span>
                )}
              </td>
              <td style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Link to={`/admin/incidents/${i._id}/classify`} className="btn btn-sm btn-warning">Phân loại</Link>
                <Link to={`/admin/incidents/${i._id}/assign`} className="btn btn-sm btn-primary">Phân công</Link>
                <Link to={`/admin/incidents/${i._id}/investigate`} className="btn btn-sm btn-secondary">Điều tra</Link>
                <Link to={`/admin/incidents/${i._id}/progress-history`} className="btn btn-sm btn-success">Tiến độ</Link>
                <Link to={`/admin/incidents/${i._id}/close`} className="btn btn-sm btn-danger">Đóng</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && modalImage && (
        <div
          onClick={closeModal}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 99999,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}
          >
            <img src={modalImage} alt="preview" style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 8, display: 'block' }} />
            <button
              onClick={closeModal}
              style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer' }}
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncidentList;
