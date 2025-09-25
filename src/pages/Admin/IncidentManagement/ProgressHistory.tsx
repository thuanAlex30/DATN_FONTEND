import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import incidentService from '../../../services/incidentService';
import styles from './ProgressHistory.module.css';

interface ProgressEntry {
  _id: string;
  action: string;
  note: string;
  performedBy: {
    _id: string;
    full_name: string;
    username: string;
  };
  timestamp: string;
}

interface Incident {
  _id: string;
  incidentId?: string;
  title: string;
  description?: string;
  status?: string;
  histories?: ProgressEntry[];
}

const ProgressHistory: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIncident = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await incidentService.getIncidentById(id);
        setIncident(response.data);
      } catch (err: any) {
        setError('Không thể tải thông tin sự cố');
        console.error('Error fetching incident:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchIncident();
  }, [id]);

  const getActionColor = (action: string) => {
    switch (action?.toLowerCase()) {
      case 'ghi nhận':
        return '#3b82f6';
      case 'phân loại':
        return '#f59e0b';
      case 'phân công':
        return '#8b5cf6';
      case 'điều tra':
        return '#06b6d4';
      case 'khắc phục':
        return '#10b981';
      case 'cập nhật tiến độ':
        return '#f97316';
      case 'đóng sự cố':
        return '#ef4444';
      default:
        return '#64748b';
    }
  };

  const getActionText = (action: string) => {
    return action || 'Không xác định';
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p className={styles.loadingText}>Đang tải lịch sử tiến độ...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>⚠️</div>
          <h3 className={styles.errorTitle}>Lỗi</h3>
          <p className={styles.errorMessage}>{error}</p>
          <Link to="/admin/incidents" className={styles.backButton}>
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>❌</div>
          <h3 className={styles.errorTitle}>Không tìm thấy sự cố</h3>
          <p className={styles.errorMessage}>Sự cố không tồn tại hoặc đã bị xóa.</p>
          <Link to="/admin/incidents" className={styles.backButton}>
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  const histories = incident.histories || [];
  const sortedHistories = [...histories].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>
            <i className="fas fa-history"></i>
            Lịch sử tiến độ sự cố
          </h1>
          <p className={styles.breadcrumb}>
            <Link to="/admin/incidents">Quản lý sự cố</Link> / 
            <Link to={`/admin/incidents/${incident._id}`}>Chi tiết</Link> / 
            Lịch sử tiến độ
          </p>
        </div>
        <Link to="/admin/incidents" className={styles.backButton}>
          <i className="fas fa-arrow-left"></i>
          Quay lại
        </Link>
      </div>

      <div className={styles.incidentInfo}>
        <div className={styles.incidentCard}>
          <h3 className={styles.incidentTitle}>
            <i className="fas fa-exclamation-circle"></i>
            {incident.title}
          </h3>
          <div className={styles.incidentDetails}>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Mã sự cố:</span>
              <span className={styles.detailValue}>{incident.incidentId || 'Chưa có'}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Trạng thái hiện tại:</span>
              <span 
                className={styles.statusBadge}
                style={{ backgroundColor: '#667eea' }}
              >
                {incident.status || 'Không xác định'}
              </span>
            </div>
            {incident.description && (
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Mô tả:</span>
                <span className={styles.detailValue}>{incident.description}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.timelineContainer}>
        <h2 className={styles.timelineTitle}>
          <i className="fas fa-timeline"></i>
          Dòng thời gian cập nhật
        </h2>
        
        {sortedHistories.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📝</div>
            <h3 className={styles.emptyTitle}>Chưa có lịch sử cập nhật</h3>
            <p className={styles.emptyDescription}>
              Sự cố này chưa có lịch sử cập nhật tiến độ nào.
            </p>
          </div>
        ) : (
          <div className={styles.timeline}>
            {sortedHistories.map((entry, index) => (
              <div key={entry._id} className={styles.timelineItem}>
                <div className={styles.timelineMarker}>
                  <div 
                    className={styles.markerDot}
                    style={{ backgroundColor: getActionColor(entry.action) }}
                  ></div>
                  {index < sortedHistories.length - 1 && <div className={styles.timelineLine}></div>}
                </div>
                
                <div className={styles.timelineContent}>
                  <div className={styles.timelineHeader}>
                    <div className={styles.statusInfo}>
                      <span 
                        className={styles.statusBadge}
                        style={{ backgroundColor: getActionColor(entry.action) }}
                      >
                        {getActionText(entry.action)}
                      </span>
                      <span className={styles.updateTime}>
                        {new Date(entry.timestamp).toLocaleString('vi-VN')}
                      </span>
                    </div>
                  </div>
                  
                  <div className={styles.timelineBody}>
                    <p className={styles.description}>{entry.note}</p>
                    <div className={styles.updateInfo}>
                      <span className={styles.updatedBy}>
                        <i className="fas fa-user"></i>
                        Thực hiện bởi: {entry.performedBy?.full_name || entry.performedBy?.username || 'Không xác định'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.actions}>
        <Link 
          to={`/admin/incidents/${incident._id}/progress`} 
          className={styles.updateButton}
        >
          <i className="fas fa-edit"></i>
          Cập nhật tiến độ
        </Link>
        <Link to="/admin/incidents" className={styles.cancelButton}>
          <i className="fas fa-list"></i>
          Danh sách sự cố
        </Link>
      </div>
    </div>
  );
};

export default ProgressHistory;