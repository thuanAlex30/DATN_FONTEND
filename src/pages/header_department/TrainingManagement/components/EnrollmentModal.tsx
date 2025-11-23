import React, { useState, useEffect } from 'react';
import { api } from '../../../../services/api';

interface Session {
  _id: string;
  session_name: string;
  course_id: {
    _id: string;
    course_name: string;
  };
  max_participants: number;
}

interface Enrollment {
  _id: string;
  user_id: {
    _id: string;
    full_name: string;
    email: string;
    department: string;
  };
  session_id: string;
  enrollment_date: string;
  status: string;
}

interface EnrollmentModalProps {
  session: Session | null;
  onClose: () => void;
}

const EnrollmentModal: React.FC<EnrollmentModalProps> = ({ session, onClose }) => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (session) {
      fetchEnrollments();
    }
  }, [session]);

  const fetchEnrollments = async () => {
    if (!session) return;
    
    setLoading(true);
    try {
      const response = await api.get(`/training/enrollments/session/${session._id}`);
      setEnrollments(response.data);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (enrollmentId: string, newStatus: string) => {
    try {
      await api.put(`/training/enrollments/${enrollmentId}`, {
        status: newStatus
      });
      fetchEnrollments();
    } catch (error) {
      console.error('Error updating enrollment status:', error);
    }
  };

  const filteredEnrollments = enrollments.filter(enrollment =>
    enrollment.user_id.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    enrollment.user_id.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!session) {
    return null;
  }

  return (
    <div className="modal active">
      <div className="modal-content large">
        <div className="modal-header">
          <h2 className="modal-title">Quản lý đăng ký - {session.session_name}</h2>
          <span className="close-modal" onClick={onClose}>&times;</span>
        </div>
        <div className="modal-body">
          <div className="enrollment-info">
            <p><strong>Khóa học:</strong> {session.course_id?.course_name}</p>
            <p><strong>Số lượng tối đa:</strong> {session.max_participants} người</p>
            <p><strong>Đã đăng ký:</strong> {enrollments.length} người</p>
          </div>

          <div className="search-section">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="enrollments-list">
            <h3>Danh sách đăng ký</h3>
            {loading ? (
              <p>Đang tải...</p>
            ) : filteredEnrollments.length === 0 ? (
              <p>Không có đăng ký nào.</p>
            ) : (
              <div className="enrollments-table">
                <table>
                  <thead>
                    <tr>
                      <th>Tên</th>
                      <th>Email</th>
                      <th>Phòng ban</th>
                      <th>Ngày đăng ký</th>
                      <th>Trạng thái</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEnrollments.map((enrollment) => (
                      <tr key={enrollment._id}>
                        <td>{enrollment.user_id.full_name}</td>
                        <td>{enrollment.user_id.email}</td>
                        <td>{enrollment.user_id.department}</td>
                        <td>{new Date(enrollment.enrollment_date).toLocaleDateString('vi-VN')}</td>
                        <td>
                          <span className={`status-badge status-${enrollment.status}`}>
                            {enrollment.status === 'pending' && 'Chờ duyệt'}
                            {enrollment.status === 'approved' && 'Đã duyệt'}
                            {enrollment.status === 'rejected' && 'Từ chối'}
                            {enrollment.status === 'completed' && 'Hoàn thành'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            {enrollment.status === 'pending' && (
                              <>
                                <button
                                  className="btn btn-success btn-sm"
                                  onClick={() => handleStatusChange(enrollment._id, 'approved')}
                                >
                                  Duyệt
                                </button>
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() => handleStatusChange(enrollment._id, 'rejected')}
                                >
                                  Từ chối
                                </button>
                              </>
                            )}
                            {enrollment.status === 'approved' && (
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => handleStatusChange(enrollment._id, 'completed')}
                              >
                                Hoàn thành
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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

export default EnrollmentModal;
