import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import incidentService from '../../../services/incidentService';

const ReportIncident: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [severity, setSeverity] = useState<'nhẹ' | 'nặng' | 'rất nghiêm trọng'>('nhẹ');
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files) return;
    const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    try {
      const selected = Array.from(files).slice(0, 10); // limit to 10 images
      const base64Images = await Promise.all(selected.map((f) => toBase64(f)));
      setImages((prev) => [...prev, ...base64Images]);
    } catch {
      setError('Không thể đọc file hình ảnh');
    }
  };

  const handleRemoveImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      await incidentService.reportIncident({ title, description, location, severity, images });
      setSuccess('Ghi nhận sự cố thành công!');
      setTitle('');
      setDescription('');
      setLocation('');
      setSeverity('nhẹ');
      setImages([]);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể ghi nhận sự cố');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>Ghi nhận sự cố</h2>
        <button className="btn btn-secondary" onClick={() => navigate('/home')}>
          <i className="fas fa-arrow-left"></i> Về trang Home
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12, maxWidth: 720 }}>
        <label>
          Tiêu đề
          <input value={title} onChange={(e) => setTitle(e.target.value)} required style={{ width: '100%', padding: 8 }} />
        </label>
        <label>
          Mô tả
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} style={{ width: '100%', padding: 8 }} />
        </label>
        <label>
          Vị trí
          <input value={location} onChange={(e) => setLocation(e.target.value)} style={{ width: '100%', padding: 8 }} />
        </label>
        <label>
          Mức độ
          <select value={severity} onChange={(e) => setSeverity(e.target.value as any)} style={{ width: '100%', padding: 8 }}>
            <option value="nhẹ">Nhẹ</option>
            <option value="nặng">Nặng</option>
            <option value="rất nghiêm trọng">Rất nghiêm trọng</option>
          </select>
        </label>

        <div>
          <div style={{ marginBottom: 8, fontWeight: 600 }}>Hình ảnh</div>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleFilesSelected(e.target.files)}
          />
          {images.length > 0 && (
            <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 8 }}>
              {images.map((img, idx) => (
                <div key={idx} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: '1px solid #eee' }}>
                  <img src={img} alt={`incident-${idx}`} style={{ width: '100%', height: 100, objectFit: 'cover', display: 'block' }} />
                  <button type="button" onClick={() => handleRemoveImage(idx)}
                    style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 6px', cursor: 'pointer' }}>
                    x
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && <div style={{ color: '#dc2626' }}>{error}</div>}
        {success && <div style={{ color: '#16a34a' }}>{success}</div>}
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" disabled={loading} className="btn btn-primary">{loading ? 'Đang gửi...' : 'Gửi'}</button>
          <button type="reset" className="btn btn-secondary" onClick={() => { setTitle(''); setDescription(''); setLocation(''); setSeverity('nhẹ'); setImages([]); }}>Xóa</button>
        </div>
      </form>
    </div>
  );
};

export default ReportIncident;
