import React from 'react';

interface Course {
  _id: string;
  course_name: string;
  description: string;
  duration_hours: number;
  course_set_id: {
    _id: string;
    course_set_name: string;
  };
  created_at: string;
  updated_at: string;
}

interface ViewCourseModalProps {
  course: Course | null;
  onClose: () => void;
}

const ViewCourseModal: React.FC<ViewCourseModalProps> = ({ course, onClose }) => {
  if (!course) {
    return null;
  }

  return (
    <div className="modal active">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Chi tiết khóa học</h2>
          <span className="close-modal" onClick={onClose}>&times;</span>
        </div>
        <div className="modal-body">
          <div className="course-details">
            <div className="detail-group">
              <label>Tên khóa học:</label>
              <p>{course.course_name}</p>
            </div>
            <div className="detail-group">
              <label>Bộ khóa học:</label>
              <p>{course.course_set_id?.course_set_name || 'Chưa phân loại'}</p>
            </div>
            <div className="detail-group">
              <label>Mô tả:</label>
              <p>{course.description}</p>
            </div>
            <div className="detail-group">
              <label>Thời lượng:</label>
              <p>{course.duration_hours} giờ</p>
            </div>
            <div className="detail-group">
              <label>Ngày tạo:</label>
              <p>{new Date(course.created_at).toLocaleDateString('vi-VN')}</p>
            </div>
            <div className="detail-group">
              <label>Cập nhật lần cuối:</label>
              <p>{new Date(course.updated_at).toLocaleDateString('vi-VN')}</p>
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

export default ViewCourseModal;
