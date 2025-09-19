import React, { useState } from 'react';
import './TrainingManagement.css';

// Types
interface CourseSet {
  id: number;
  name: string;
  description: string;
}

interface Course {
  course_id: number;
  course_name: string;
  description: string;
  course_set_id: number;
  duration_hours: number;
  is_mandatory: boolean;
  validity_months: number | null;
  totalEnrolled?: number;
  completed?: number;
  passed?: number;
}

interface TrainingSession {
  session_id: number;
  session_name: string;
  course_id: number;
  start_time: string;
  end_time: string;
  instructor_id: number | null;
  instructor_name?: string;
  max_participants: number;
  location?: string;
  status_code: string;
  enrolled?: number;
}

interface User {
  user_id: number;
  full_name: string;
  department: string;
}

interface TrainingEnrollment {
  enrollment_id: number;
  session_id: number;
  user_id: number;
  enrolled_at: string;
  status: string;
  score: number | null;
  passed: boolean | null;
  completion_date: string | null;
}

interface QuestionBank {
  bank_id: number;
  course_id: number;
  name: string;
  description: string;
  questionCount?: number;
}

const TrainingManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'courses' | 'sessions' | 'enrollments' | 'question-banks'>('courses');
  const [showModal, setShowModal] = useState<string | null>(null);
  
  // Sample data
  const courseSets: CourseSet[] = [
    { id: 1, name: "An toàn cơ bản", description: "Các khóa học an toàn lao động cơ bản" },
    { id: 2, name: "An toàn nâng cao", description: "Các khóa học an toàn lao động nâng cao" },
    { id: 3, name: "Chuyên môn kỹ thuật", description: "Các khóa học chuyên môn kỹ thuật" }
  ];

  const [courses] = useState<Course[]>([
    {
      course_id: 1,
      course_name: "An toàn lao động cơ bản",
      description: "Khóa học cơ bản về an toàn lao động cho tất cả nhân viên",
      course_set_id: 1,
      duration_hours: 8,
      is_mandatory: true,
      validity_months: 12,
      totalEnrolled: 45,
      completed: 38,
      passed: 35
    },
    {
      course_id: 2,
      course_name: "Sử dụng thiết bị bảo hộ",
      description: "Hướng dẫn sử dụng các loại thiết bị bảo hộ cá nhân",
      course_set_id: 1,
      duration_hours: 4,
      is_mandatory: true,
      validity_months: 6,
      totalEnrolled: 52,
      completed: 49,
      passed: 47
    },
    {
      course_id: 3,
      course_name: "An toàn điện nâng cao",
      description: "Khóa học chuyên sâu về an toàn điện cho kỹ thuật viên",
      course_set_id: 2,
      duration_hours: 16,
      is_mandatory: false,
      validity_months: 24,
      totalEnrolled: 18,
      completed: 15,
      passed: 14
    },
    {
      course_id: 4,
      course_name: "Quản lý rủi ro",
      description: "Phương pháp đánh giá và quản lý rủi ro trong công việc",
      course_set_id: 2,
      duration_hours: 12,
      is_mandatory: false,
      validity_months: 18,
      totalEnrolled: 25,
      completed: 20,
      passed: 18
    }
  ]);

  const [trainingSessions] = useState<TrainingSession[]>([
    {
      session_id: 1,
      session_name: "Đào tạo an toàn - Lớp A1",
      course_id: 1,
      start_time: "2024-03-15T08:00",
      end_time: "2024-03-15T16:00",
      instructor_id: 1,
      instructor_name: "Nguyễn Văn Trainer",
      max_participants: 30,
      location: "Phòng đào tạo A",
      status_code: "SCHEDULED",
      enrolled: 25
    },
    {
      session_id: 2,
      session_name: "PPE Training Session",
      course_id: 2,
      start_time: "2024-03-20T09:00",
      end_time: "2024-03-20T13:00",
      instructor_id: 2,
      instructor_name: "Trần Thị Giảng viên",
      max_participants: 25,
      location: "Khu vực thực hành",
      status_code: "ONGOING",
      enrolled: 22
    },
    {
      session_id: 3,
      session_name: "Advanced Electrical Safety",
      course_id: 3,
      start_time: "2024-02-28T08:00",
      end_time: "2024-03-01T17:00",
      instructor_id: 3,
      instructor_name: "Lê Văn Chuyên gia",
      max_participants: 15,
      location: "Phòng thí nghiệm",
      status_code: "COMPLETED",
      enrolled: 12
    }
  ]);

  const [users] = useState<User[]>([
    { user_id: 1, full_name: "Nguyễn Văn A", department: "Kỹ thuật" },
    { user_id: 2, full_name: "Trần Thị B", department: "An toàn" },
    { user_id: 3, full_name: "Lê Văn C", department: "Sản xuất" },
    { user_id: 4, full_name: "Phạm Thị D", department: "Kỹ thuật" },
    { user_id: 5, full_name: "Hoàng Văn E", department: "Bảo trì" }
  ]);

  const [trainingEnrollments] = useState<TrainingEnrollment[]>([
    {
      enrollment_id: 1,
      session_id: 1,
      user_id: 1,
      enrolled_at: "2024-02-15T10:00:00",
      status: "enrolled",
      score: null,
      passed: null,
      completion_date: null
    },
    {
      enrollment_id: 2,
      session_id: 3,
      user_id: 2,
      enrolled_at: "2024-02-20T14:30:00",
      status: "completed",
      score: 85,
      passed: true,
      completion_date: "2024-03-01T17:00:00"
    },
    {
      enrollment_id: 3,
      session_id: 2,
      user_id: 3,
      enrolled_at: "2024-03-01T09:15:00",
      status: "completed",
      score: 65,
      passed: false,
      completion_date: "2024-03-20T13:00:00"
    },
    {
      enrollment_id: 4,
      session_id: 1,
      user_id: 4,
      enrolled_at: "2024-02-18T11:20:00",
      status: "enrolled",
      score: null,
      passed: null,
      completion_date: null
    },
    {
      enrollment_id: 5,
      session_id: 2,
      user_id: 5,
      enrolled_at: "2024-03-05T16:45:00",
      status: "completed",
      score: 78,
      passed: true,
      completion_date: "2024-03-20T13:00:00"
    }
  ]);

  const [questionBanks] = useState<QuestionBank[]>([
    {
      bank_id: 1,
      course_id: 1,
      name: "Ngân hàng câu hỏi An toàn cơ bản",
      description: "Các câu hỏi về kiến thức an toàn lao động cơ bản",
      questionCount: 25
    },
    {
      bank_id: 2,
      course_id: 2,
      name: "Ngân hàng câu hỏi PPE",
      description: "Câu hỏi về thiết bị bảo hộ cá nhân",
      questionCount: 15
    },
    {
      bank_id: 3,
      course_id: 3,
      name: "Ngân hàng câu hỏi An toàn điện",
      description: "Câu hỏi chuyên sâu về an toàn điện",
      questionCount: 40
    }
  ]);

  // Utility functions
  const getCourseSetName = (courseSetId: number): string => {
    const courseSet = courseSets.find(cs => cs.id === courseSetId);
    return courseSet ? courseSet.name : 'Không xác định';
  };

  const getCourseName = (courseId: number): string => {
    const course = courses.find(c => c.course_id === courseId);
    return course ? course.course_name : 'Không xác định';
  };

  const getUserName = (userId: number): string => {
    const user = users.find(u => u.user_id === userId);
    return user ? user.full_name : 'Không xác định';
  };

  const getUserDepartment = (userId: number): string => {
    const user = users.find(u => u.user_id === userId);
    return user ? user.department : 'Không xác định';
  };

  const getStatusLabel = (statusCode: string): string => {
    const statusMap: { [key: string]: string } = {
      'SCHEDULED': 'Đã lên lịch',
      'ONGOING': 'Đang diễn ra',
      'COMPLETED': 'Hoàn thành',
      'CANCELLED': 'Đã hủy'
    };
    return statusMap[statusCode] || statusCode;
  };


  const formatDateTime = (dateTimeString: string): string => {
    return new Date(dateTimeString).toLocaleString('vi-VN');
  };

  const switchTab = (tabName: 'courses' | 'sessions' | 'enrollments' | 'question-banks') => {
    setActiveTab(tabName);
  };

  const openModal = (modalId: string) => {
    setShowModal(modalId);
  };

  const closeModal = () => {
    setShowModal(null);
  };

  return (
    <div className="training-management">
      <div className="container">
        {/* Header */}
        <div className="header">
          <div>
            <h1><i className="fas fa-graduation-cap"></i> Quản lý đào tạo</h1>
            <div className="breadcrumb">
              <a href="/admin/dashboard">Dashboard</a> / Quản lý đào tạo
            </div>
          </div>
          <a href="/admin/dashboard" className="btn btn-secondary">
            <i className="fas fa-arrow-left"></i> Quay lại
          </a>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <div className="tab-nav">
            <button 
              className={`tab-button ${activeTab === 'courses' ? 'active' : ''}`}
              onClick={() => switchTab('courses')}
            >
              <i className="fas fa-book"></i> Khóa học
            </button>
            <button 
              className={`tab-button ${activeTab === 'sessions' ? 'active' : ''}`}
              onClick={() => switchTab('sessions')}
            >
              <i className="fas fa-calendar-alt"></i> Buổi đào tạo
            </button>
            <button 
              className={`tab-button ${activeTab === 'enrollments' ? 'active' : ''}`}
              onClick={() => switchTab('enrollments')}
            >
              <i className="fas fa-user-graduate"></i> Đăng ký tham gia
            </button>
            <button 
              className={`tab-button ${activeTab === 'question-banks' ? 'active' : ''}`}
              onClick={() => switchTab('question-banks')}
            >
              <i className="fas fa-question-circle"></i> Ngân hàng câu hỏi
            </button>
          </div>

          {/* Courses Tab */}
          {activeTab === 'courses' && (
            <div className="tab-content active">
              <div className="controls">
                <div className="search-filters">
                  <div className="search-box">
                    <i className="fas fa-search"></i>
                    <input type="text" placeholder="Tìm kiếm khóa học..." />
                  </div>
                  
                  <select className="filter-select">
                    <option value="">Tất cả bộ khóa học</option>
                    <option value="1">An toàn cơ bản</option>
                    <option value="2">An toàn nâng cao</option>
                    <option value="3">Chuyên môn kỹ thuật</option>
                  </select>
                  
                  <select className="filter-select">
                    <option value="">Tất cả</option>
                    <option value="true">Bắt buộc</option>
                    <option value="false">Tự chọn</option>
                  </select>
                </div>
                
                <button className="btn btn-primary" onClick={() => openModal('addCourseModal')}>
                  <i className="fas fa-plus"></i> Tạo khóa học
                </button>
              </div>

              <div className="data-grid">
                {courses.map(course => (
                  <div key={course.course_id} className="course-card">
                    <div className="card-header">
                      <div className="card-title">{course.course_name}</div>
                      <div className="card-description">{course.description}</div>
                      {course.is_mandatory && <div className="mandatory-badge">Bắt buộc</div>}
                    </div>
                    
                    <div className="card-body">
                      <div className="course-info">
                        <div className="info-item">
                          <i className="fas fa-clock"></i>
                          <span>{course.duration_hours} giờ</span>
                        </div>
                        <div className="info-item">
                          <i className="fas fa-certificate"></i>
                          <span>{course.validity_months ? course.validity_months + ' tháng' : 'Vĩnh viễn'}</span>
                        </div>
                        <div className="info-item">
                          <i className="fas fa-layer-group"></i>
                          <span>{getCourseSetName(course.course_set_id)}</span>
                        </div>
                        <div className="info-item">
                          <i className="fas fa-users"></i>
                          <span>{course.totalEnrolled || 0} đăng ký</span>
                        </div>
                      </div>
                      
                      <div className="enrollment-stats">
                        <div className="stats-title">Thống kê đào tạo</div>
                        <div className="stats-row">
                          <span>Đã hoàn thành:</span>
                          <span>{course.completed || 0}/{course.totalEnrolled || 0}</span>
                        </div>
                        <div className="stats-row">
                          <span>Đã đạt:</span>
                          <span>{course.passed || 0}/{course.completed || 0}</span>
                        </div>
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{width: `${course.totalEnrolled ? (course.completed! / course.totalEnrolled) * 100 : 0}%`}}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="card-actions">
                        <button className="btn btn-warning btn-sm">
                          <i className="fas fa-edit"></i> Sửa
                        </button>
                        <button className="btn btn-success btn-sm">
                          <i className="fas fa-eye"></i> Xem
                        </button>
                        <button className="btn btn-secondary btn-sm">
                          <i className="fas fa-question-circle"></i> Câu hỏi
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sessions Tab */}
          {activeTab === 'sessions' && (
            <div className="tab-content active">
              <div className="controls">
                <div className="search-filters">
                  <div className="search-box">
                    <i className="fas fa-search"></i>
                    <input type="text" placeholder="Tìm kiếm buổi đào tạo..." />
                  </div>
                  
                  <select className="filter-select">
                    <option value="">Tất cả trạng thái</option>
                    <option value="SCHEDULED">Đã lên lịch</option>
                    <option value="ONGOING">Đang diễn ra</option>
                    <option value="COMPLETED">Hoàn thành</option>
                    <option value="CANCELLED">Đã hủy</option>
                  </select>
                </div>
                
                <button className="btn btn-primary" onClick={() => openModal('addSessionModal')}>
                  <i className="fas fa-plus"></i> Lên lịch đào tạo
                </button>
              </div>

              <div className="data-grid">
                {trainingSessions.map(session => (
                  <div key={session.session_id} className="session-card">
                    <div className="card-header">
                      <div className="card-title">{session.session_name}</div>
                      <div className="card-description">{getCourseName(session.course_id)}</div>
                      <div className={`status-badge status-${session.status_code.toLowerCase()}`}>
                        {getStatusLabel(session.status_code)}
                      </div>
                    </div>
                    
                    <div className="card-body">
                      <div className="session-info">
                        <div className="info-item">
                          <i className="fas fa-calendar-alt"></i>
                          <span>{formatDateTime(session.start_time)}</span>
                        </div>
                        <div className="info-item">
                          <i className="fas fa-calendar-check"></i>
                          <span>{formatDateTime(session.end_time)}</span>
                        </div>
                        <div className="info-item">
                          <i className="fas fa-chalkboard-teacher"></i>
                          <span>{session.instructor_name || 'Chưa phân công'}</span>
                        </div>
                        <div className="info-item">
                          <i className="fas fa-map-marker-alt"></i>
                          <span>{session.location || 'Chưa xác định'}</span>
                        </div>
                      </div>
                      
                      <div className="enrollment-stats">
                        <div className="stats-title">Đăng ký tham gia</div>
                        <div className="stats-row">
                          <span>Đã đăng ký:</span>
                          <span>{session.enrolled || 0}/{session.max_participants}</span>
                        </div>
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{width: `${session.max_participants ? (session.enrolled! / session.max_participants) * 100 : 0}%`}}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="card-actions">
                        <button className="btn btn-warning btn-sm">
                          <i className="fas fa-edit"></i> Sửa
                        </button>
                        <button className="btn btn-success btn-sm">
                          <i className="fas fa-eye"></i> Chi tiết
                        </button>
                        <button className="btn btn-secondary btn-sm">
                          <i className="fas fa-user-check"></i> Điểm danh
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Enrollments Tab */}
          {activeTab === 'enrollments' && (
            <div className="tab-content active">
              <div className="controls">
                <div className="search-filters">
                  <div className="search-box">
                    <i className="fas fa-search"></i>
                    <input type="text" placeholder="Tìm kiếm theo tên nhân viên..." />
                  </div>
                  
                  <select className="filter-select">
                    <option value="">Tất cả trạng thái</option>
                    <option value="enrolled">Đã đăng ký</option>
                    <option value="completed">Hoàn thành</option>
                    <option value="failed">Chưa đạt</option>
                  </select>
                </div>
                
                <button className="btn btn-success">
                  <i className="fas fa-download"></i> Xuất báo cáo
                </button>
              </div>

              <div className="data-table">
                <table>
                  <thead>
                    <tr>
                      <th>Nhân viên</th>
                      <th>Phòng ban</th>
                      <th>Khóa học</th>
                      <th>Buổi đào tạo</th>
                      <th>Ngày đăng ký</th>
                      <th>Trạng thái</th>
                      <th>Điểm số</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trainingEnrollments.map(enrollment => {
                      const session = trainingSessions.find(s => s.session_id === enrollment.session_id);
                      const courseName = session ? getCourseName(session.course_id) : 'Không xác định';
                      const sessionName = session ? session.session_name : 'Không xác định';
                      
                      return (
                        <tr key={enrollment.enrollment_id}>
                          <td style={{fontWeight: 600, color: '#2c3e50'}}>{getUserName(enrollment.user_id)}</td>
                          <td>{getUserDepartment(enrollment.user_id)}</td>
                          <td>{courseName}</td>
                          <td>{sessionName}</td>
                          <td>{formatDateTime(enrollment.enrolled_at)}</td>
                          <td>
                            <span className={`status-badge status-${enrollment.status}`}>
                              {enrollment.status === 'enrolled' ? 'Đã đăng ký' : 
                               enrollment.status === 'completed' ? 'Hoàn thành' : 
                               enrollment.status === 'failed' ? 'Chưa đạt' : enrollment.status}
                            </span>
                          </td>
                          <td style={{
                            color: enrollment.score ? (enrollment.passed ? '#27ae60' : '#e74c3c') : '#666',
                            fontWeight: 600
                          }}>
                            {enrollment.score ? `${enrollment.score}/100` : '-'}
                          </td>
                          <td>
                            <button className="btn btn-warning btn-sm">
                              <i className="fas fa-edit"></i>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Question Banks Tab */}
          {activeTab === 'question-banks' && (
            <div className="tab-content active">
              <div className="controls">
                <div className="search-filters">
                  <div className="search-box">
                    <i className="fas fa-search"></i>
                    <input type="text" placeholder="Tìm kiếm ngân hàng câu hỏi..." />
                  </div>
                  
                  <select className="filter-select">
                    <option value="">Tất cả khóa học</option>
                    {courses.map(course => (
                      <option key={course.course_id} value={course.course_id}>
                        {course.course_name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <button className="btn btn-primary" onClick={() => openModal('addBankModal')}>
                  <i className="fas fa-plus"></i> Tạo ngân hàng câu hỏi
                </button>
              </div>

              <div className="data-grid">
                {questionBanks.map(bank => (
                  <div key={bank.bank_id} className="course-card">
                    <div className="card-header">
                      <div className="card-title">{bank.name}</div>
                      <div className="card-description">{bank.description}</div>
                    </div>
                    
                    <div className="card-body">
                      <div className="course-info">
                        <div className="info-item">
                          <i className="fas fa-book"></i>
                          <span>{getCourseName(bank.course_id)}</span>
                        </div>
                        <div className="info-item">
                          <i className="fas fa-question-circle"></i>
                          <span>{bank.questionCount || 0} câu hỏi</span>
                        </div>
                      </div>
                      
                      <div className="card-actions">
                        <button className="btn btn-warning btn-sm">
                          <i className="fas fa-edit"></i> Sửa
                        </button>
                        <button className="btn btn-success btn-sm">
                          <i className="fas fa-list"></i> Quản lý câu hỏi
                        </button>
                        <button className="btn btn-secondary btn-sm">
                          <i className="fas fa-eye"></i> Xem trước
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Course Modal */}
      {showModal === 'addCourseModal' && (
        <div className="modal active">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Tạo khóa học mới</h2>
              <span className="close-modal" onClick={closeModal}>&times;</span>
            </div>
            
            <form>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Tên khóa học *</label>
                  <input type="text" className="form-input" required />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Bộ khóa học</label>
                  <select className="form-input">
                    <option value="1">An toàn cơ bản</option>
                    <option value="2">An toàn nâng cao</option>
                    <option value="3">Chuyên môn kỹ thuật</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Thời lượng (giờ) *</label>
                  <input type="number" className="form-input" required min="1" />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Hiệu lực (tháng)</label>
                  <input type="number" className="form-input" min="1" />
                </div>
                
                <div className="form-group full-width">
                  <label className="form-label">Mô tả khóa học</label>
                  <textarea className="form-input" rows={4}></textarea>
                </div>
                
                <div className="form-group full-width">
                  <div className="form-checkbox">
                    <input type="checkbox" />
                    <label>Khóa học bắt buộc</label>
                  </div>
                </div>
              </div>
              
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  <i className="fas fa-save"></i> Tạo khóa học
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Session Modal */}
      {showModal === 'addSessionModal' && (
        <div className="modal active">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Lên lịch đào tạo</h2>
              <span className="close-modal" onClick={closeModal}>&times;</span>
            </div>
            
            <form>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Tên buổi đào tạo *</label>
                  <input type="text" className="form-input" required />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Khóa học *</label>
                  <select className="form-input" required>
                    <option value="">Chọn khóa học</option>
                    {courses.map(course => (
                      <option key={course.course_id} value={course.course_id}>
                        {course.course_name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Ngày bắt đầu *</label>
                  <input type="datetime-local" className="form-input" required />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Ngày kết thúc *</label>
                  <input type="datetime-local" className="form-input" required />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Giảng viên</label>
                  <select className="form-input">
                    <option value="">Chọn giảng viên</option>
                    <option value="1">Nguyễn Văn Trainer</option>
                    <option value="2">Trần Thị Giảng viên</option>
                    <option value="3">Lê Văn Chuyên gia</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Số lượng tối đa</label>
                  <input type="number" className="form-input" min="1" defaultValue="20" />
                </div>
                
                <div className="form-group full-width">
                  <label className="form-label">Địa điểm</label>
                  <input type="text" className="form-input" />
                </div>
              </div>
              
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  <i className="fas fa-calendar-plus"></i> Tạo lịch đào tạo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Question Bank Modal */}
      {showModal === 'addBankModal' && (
        <div className="modal active">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Tạo ngân hàng câu hỏi</h2>
              <span className="close-modal" onClick={closeModal}>&times;</span>
            </div>
            
            <form>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Tên ngân hàng câu hỏi *</label>
                  <input type="text" className="form-input" required />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Khóa học *</label>
                  <select className="form-input" required>
                    <option value="">Chọn khóa học</option>
                    {courses.map(course => (
                      <option key={course.course_id} value={course.course_id}>
                        {course.course_name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group full-width">
                  <label className="form-label">Mô tả</label>
                  <textarea className="form-input" rows={3}></textarea>
                </div>
              </div>
              
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  <i className="fas fa-save"></i> Tạo ngân hàng câu hỏi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingManagement;
