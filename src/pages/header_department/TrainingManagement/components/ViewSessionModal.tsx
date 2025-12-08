import React from 'react';

interface Session {
  _id: string;
  session_name: string;
  description: string;
  start_date: string;
  end_date: string;
  max_participants: number;
  course_id: {
    _id: string;
    course_name: string;
  };
  instructor_id?: {
    _id: string;
    full_name: string;
  };
  status: string;
  created_at: string;
  updated_at: string;
}

interface ViewSessionModalProps {
  session: Session | null;
  onClose: () => void;
}

const ViewSessionModal: React.FC<ViewSessionModalProps> = ({ session, onClose }) => {
  if (!session) {
    return null;
  }

  return (
    <div className="modal active">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Chi tiết phiên đào tạo</h2>
          <span className="close-modal" onClick={onClose}>&times;</span>
        </div>
        <div className="modal-body">
          <div className="session-details">
            <div className="detail-group">
              <label>Tên phiên đào tạo:</label>
              <p>{session.session_name}</p>
            </div>
            <div className="detail-group">
              <label>Khóa học:</label>
              <p>{session.course_id?.course_name || 'Chưa xác định'}</p>
            </div>
            <div className="detail-group">
              <label>Mô tả:</label>
              <p>{session.description}</p>
            </div>
            <div className="detail-group">
              <label>Ngày bắt đầu:</label>
              <p>{new Date(session.start_date).toLocaleDateString('vi-VN')}</p>
            </div>
            <div className="detail-group">
              <label>Ngày kết thúc:</label>
              <p>{new Date(session.end_date).toLocaleDateString('vi-VN')}</p>
            </div>
            <div className="detail-group">
              <label>Số lượng tối đa:</label>
              <p>{session.max_participants} người</p>
            </div>
            <div className="detail-group">
              <label>Giảng viên:</label>
              <p>{session.instructor_id?.full_name || 'Chưa phân công'}</p>
            </div>
            <div className="detail-group">
              <label>Trạng thái:</label>
              <p>
                <span className={`status-badge status-${session.status}`}>
                  {session.status === 'scheduled' && 'Đã lên lịch'}
                  {session.status === 'ongoing' && 'Đang diễn ra'}
                  {session.status === 'completed' && 'Đã hoàn thành'}
                  {session.status === 'cancelled' && 'Đã hủy'}
                </span>
              </p>
            </div>
            <div className="detail-group">
              <label>Ngày tạo:</label>
              <p>{new Date(session.created_at).toLocaleDateString('vi-VN')}</p>
            </div>
            <div className="detail-group">
              <label>Cập nhật lần cuối:</label>
              <p>{new Date(session.updated_at).toLocaleDateString('vi-VN')}</p>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewSessionModal;
