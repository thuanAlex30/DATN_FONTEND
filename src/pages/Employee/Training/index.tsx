import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../../../store';
import { useCourses, useTrainingSessions, useTrainingEnrollments } from '../../../hooks/useTraining';
import { api } from '../../../services/api';
import styles from './Training.module.css';

const EmployeeTraining: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'available' | 'enrolled' | 'completed'>('available');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourseSet] = useState('');
  const [isMandatory, setIsMandatory] = useState('');

  // API hooks
  const { courses, loading: coursesLoading } = useCourses({
    courseSetId: selectedCourseSet || undefined,
    isMandatory: isMandatory ? isMandatory === 'true' : undefined,
  });
  
  const { sessions } = useTrainingSessions();
  const { enrollments, loading: enrollmentsLoading } = useTrainingEnrollments();

  // Filter courses based on search term
  const filteredCourses = courses.filter(course =>
    course.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get user's enrollments
  const userEnrollments = enrollments.filter(enrollment => 
    enrollment.user_id._id === user?.id
  );

  // Get enrolled course IDs
  const enrolledCourseIds = userEnrollments.map(enrollment => {
    const session = sessions.find(s => s._id === enrollment.session_id._id);
    return session?.course_id._id;
  }).filter(Boolean);

  // Get available courses (not enrolled)
  const availableCourses = filteredCourses.filter(course => 
    !enrolledCourseIds.includes(course._id)
  );

  // Get enrolled courses
  const enrolledCourses = filteredCourses.filter(course => 
    enrolledCourseIds.includes(course._id)
  );

  // Get completed courses
  const completedCourses = userEnrollments
    .filter(enrollment => enrollment.status === 'completed')
    .map(enrollment => {
      const session = sessions.find(s => s._id === enrollment.session_id._id);
      return session ? courses.find(c => c._id === session.course_id._id) : null;
    })
    .filter(Boolean);

  const handleEnroll = async (courseId: string) => {
    try {
      // Find available sessions for this course
      const availableSessions = sessions.filter(session => 
        session.course_id._id === courseId && 
        session.status_code === 'SCHEDULED' &&
        !userEnrollments.some(enrollment => enrollment.session_id._id === session._id)
      );

      if (availableSessions.length === 0) {
        alert('Không có buổi đào tạo nào khả dụng cho khóa học này');
        return;
      }

      // For now, enroll in the first available session
      const sessionToEnroll = availableSessions[0];
      
      const response = await api.post('/training/enrollments', {
        session_id: sessionToEnroll._id,
        user_id: user?.id,
      });

      if (response.data.success) {
        alert('Đăng ký thành công!');
        // Refresh the page or update state
        window.location.reload();
      } else {
        alert(`Lỗi đăng ký: ${response.data.message || 'Có lỗi xảy ra'}`);
      }
    } catch (error: any) {
      console.error('Error enrolling:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi đăng ký';
      alert(`Lỗi đăng ký: ${errorMessage}`);
    }
  };

  const handleLogout = () => {
    navigate('/login');
  };

  const handleStartTraining = async (courseId: string) => {
    try {
      // Find the session for this course that user is enrolled in
      const enrollment = userEnrollments.find(enrollment => {
        const session = sessions.find(s => s._id === enrollment.session_id._id);
        return session?.course_id._id === courseId;
      });

      if (!enrollment) {
        alert('Không tìm thấy đăng ký cho khóa học này');
        return;
      }

      const session = sessions.find(s => s._id === enrollment.session_id._id);
      if (!session) {
        alert('Không tìm thấy buổi đào tạo');
        return;
      }

      // Call start training API (backend will check and update session status)
      const response = await api.post(`/training/sessions/${session._id}/start`);

      if (response.data.success) {
        // Navigate to training page with training data
        navigate('/training/session', { 
          state: { 
            trainingData: response.data.data,
            sessionId: session._id,
            courseId: courseId
          } 
        });
      } else {
        alert(`Lỗi: ${response.data.message || 'Không thể bắt đầu học'}`);
      }
    } catch (error: any) {
      console.error('Error starting training:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi bắt đầu học';
      alert(`Lỗi: ${errorMessage}`);
    }
  };

  const handleRetakeTraining = async (courseId: string) => {
    try {
      // Find the session for this course that user is enrolled in
      const enrollment = userEnrollments.find(enrollment => {
        const session = sessions.find(s => s._id === enrollment.session_id._id);
        return session?.course_id._id === courseId;
      });

      if (!enrollment) {
        alert('Không tìm thấy đăng ký cho khóa học này');
        return;
      }

      const session = sessions.find(s => s._id === enrollment.session_id._id);
      if (!session) {
        alert('Không tìm thấy buổi đào tạo');
        return;
      }

      // Confirm retake action
      const confirmed = window.confirm(
        `Bạn có chắc chắn muốn làm lại bài "${session.session_name}"?\n\n` +
        `Điểm trước đó: ${enrollment.score || 0}/100\n` +
        `Lưu ý: Kết quả cũ sẽ bị ghi đè và bạn sẽ phải làm lại từ đầu.`
      );

      if (!confirmed) {
        return;
      }

      // Call retake training API
      const response = await api.post(`/training/sessions/${session._id}/retake`);

      if (response.data.success) {
        alert('Đã khởi tạo làm lại bài thành công!');
        // Navigate to training page with retake data
        navigate('/training/session', { 
          state: { 
            trainingData: response.data.data,
            sessionId: session._id,
            courseId: courseId,
            isRetake: true
          } 
        });
      } else {
        alert(`Lỗi: ${response.data.message || 'Không thể làm lại bài'}`);
      }
    } catch (error: any) {
      console.error('Error retaking training:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi làm lại bài';
      alert(`Lỗi: ${errorMessage}`);
    }
  };


  const getEnrollmentStatus = (courseId: string) => {
    const enrollment = userEnrollments.find(enrollment => {
      const session = sessions.find(s => s._id === enrollment.session_id._id);
      return session?.course_id._id === courseId;
    });
    return enrollment?.status || 'not_enrolled';
  };

  const getEnrollmentScore = (courseId: string) => {
    const enrollment = userEnrollments.find(enrollment => {
      const session = sessions.find(s => s._id === enrollment.session_id._id);
      return session?.course_id._id === courseId;
    });
    return enrollment?.score || null;
  };

  const renderCourseCard = (course: any, showEnrollButton = true) => {
    const enrollmentStatus = getEnrollmentStatus(course._id);
    const score = getEnrollmentScore(course._id);
    
    return (
      <div key={course._id} className={styles.courseCard}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>{course.course_name}</div>
          <div className={styles.cardDescription}>{course.description}</div>
          {course.is_mandatory && <div className={styles.mandatoryBadge}>Bắt buộc</div>}
        </div>
        
        <div className={styles.cardBody}>
          <div className={styles.courseInfo}>
            <div className={styles.infoItem}>
              <i className="fas fa-clock"></i>
              <span>{course.duration_hours} giờ</span>
            </div>
            <div className={styles.infoItem}>
              <i className="fas fa-certificate"></i>
              <span>{course.validity_months ? course.validity_months + ' tháng' : 'Vĩnh viễn'}</span>
            </div>
            <div className={styles.infoItem}>
              <i className="fas fa-layer-group"></i>
              <span>{course.course_set_id?.name || 'N/A'}</span>
            </div>
          </div>
          
          {enrollmentStatus !== 'not_enrolled' && (
            <div className={styles.enrollmentStatus}>
              <span className={`${styles.statusBadge} ${styles[enrollmentStatus]}`}>
                {enrollmentStatus === 'enrolled' ? 'Đã đăng ký' : 
                 enrollmentStatus === 'completed' ? 'Hoàn thành' : 
                 enrollmentStatus === 'failed' ? 'Chưa đạt' : enrollmentStatus}
              </span>
              {score && (
                <span className={styles.score}>
                  Điểm: {score}/100
                </span>
              )}
            </div>
          )}
          
          <div className={styles.cardActions}>
            {showEnrollButton && enrollmentStatus === 'not_enrolled' && (
              <button 
                className={styles.enrollBtn}
                onClick={() => handleEnroll(course._id)}
              >
                <i className="fas fa-user-plus"></i> Đăng ký
              </button>
            )}
            
            {enrollmentStatus === 'enrolled' && (
              <button 
                className={styles.viewBtn}
                onClick={() => handleStartTraining(course._id)}
              >
                <i className="fas fa-play"></i> Vào học
              </button>
            )}
            
            {enrollmentStatus === 'completed' && (
              <button className={styles.certificateBtn}>
                <i className="fas fa-certificate"></i> Xem chứng chỉ
              </button>
            )}
            
            {enrollmentStatus === 'failed' && (
              <button 
                className={styles.retakeBtn}
                onClick={() => handleRetakeTraining(course._id)}
              >
                <i className="fas fa-redo"></i> Làm lại bài
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1><i className="fas fa-graduation-cap"></i> Đào tạo an toàn lao động</h1>
        <div className={styles.userInfo}>
          <span>Xin chào, {user?.full_name || 'Người dùng'}</span>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            <i className="fas fa-sign-out-alt"></i> Đăng xuất
          </button>
        </div>
      </header>

      {/* Navigation */}
      <div className={styles.navigation}>
        <button 
          className={`${styles.navBtn} ${activeTab === 'available' ? styles.active : ''}`}
          onClick={() => setActiveTab('available')}
        >
          <i className="fas fa-book"></i> Khóa học có sẵn
        </button>
        <button 
          className={`${styles.navBtn} ${activeTab === 'enrolled' ? styles.active : ''}`}
          onClick={() => setActiveTab('enrolled')}
        >
          <i className="fas fa-user-check"></i> Đã đăng ký
        </button>
        <button 
          className={`${styles.navBtn} ${activeTab === 'completed' ? styles.active : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          <i className="fas fa-trophy"></i> Đã hoàn thành
        </button>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <i className="fas fa-search"></i>
          <input 
            type="text" 
            placeholder="Tìm kiếm khóa học..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select 
          className={styles.filterSelect}
          value={isMandatory}
          onChange={(e) => setIsMandatory(e.target.value)}
        >
          <option value="">Tất cả</option>
          <option value="true">Bắt buộc</option>
          <option value="false">Tự chọn</option>
        </select>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {activeTab === 'available' && (
          <div className={styles.tabContent}>
            <h2>Khóa học có sẵn</h2>
            {coursesLoading ? (
              <div className={styles.loading}>
                <i className="fas fa-spinner fa-spin"></i>
                <span>Đang tải dữ liệu...</span>
              </div>
            ) : availableCourses.length === 0 ? (
              <div className={styles.emptyState}>
                <i className="fas fa-graduation-cap"></i>
                <h3>Không có khóa học nào khả dụng</h3>
                <p>Bạn đã đăng ký tất cả các khóa học có sẵn</p>
              </div>
            ) : (
              <div className={styles.coursesGrid}>
                {availableCourses.map(course => renderCourseCard(course, true))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'enrolled' && (
          <div className={styles.tabContent}>
            <h2>Khóa học đã đăng ký</h2>
            {enrollmentsLoading ? (
              <div className={styles.loading}>
                <i className="fas fa-spinner fa-spin"></i>
                <span>Đang tải dữ liệu...</span>
              </div>
            ) : enrolledCourses.length === 0 ? (
              <div className={styles.emptyState}>
                <i className="fas fa-user-check"></i>
                <h3>Chưa đăng ký khóa học nào</h3>
                <p>Hãy đăng ký khóa học để bắt đầu học tập</p>
              </div>
            ) : (
              <div className={styles.coursesGrid}>
                {enrolledCourses.map(course => renderCourseCard(course, false))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'completed' && (
          <div className={styles.tabContent}>
            <h2>Khóa học đã hoàn thành</h2>
            {enrollmentsLoading ? (
              <div className={styles.loading}>
                <i className="fas fa-spinner fa-spin"></i>
                <span>Đang tải dữ liệu...</span>
              </div>
            ) : completedCourses.length === 0 ? (
              <div className={styles.emptyState}>
                <i className="fas fa-trophy"></i>
                <h3>Chưa hoàn thành khóa học nào</h3>
                <p>Hoàn thành các khóa học để nhận chứng chỉ</p>
              </div>
            ) : (
              <div className={styles.coursesGrid}>
                {completedCourses.map(course => renderCourseCard(course, false))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeTraining;
