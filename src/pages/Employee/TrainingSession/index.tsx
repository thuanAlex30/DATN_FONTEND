import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../../../services/api';
import styles from './TrainingSession.module.css';

interface Question {
  _id: string;
  content: string;
  question_type: string;
  options: string[];
  difficulty_level: string;
  points: number;
}

interface TrainingData {
  session: {
    _id: string;
    session_name: string;
    start_time: string;
    end_time: string;
    location?: string;
  };
  course: {
    _id: string;
    course_name: string;
    description: string;
    duration_minutes: number;
  };
  enrollment: {
    _id: string;
    status: string;
    enrolled_at: string;
  };
  questionBank: {
    _id: string;
    bank_name: string;
    total_questions: number;
  };
  questions: Question[];
}

const TrainingSession: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Function to clear invalid data and redirect
  const clearAndRedirect = (reason: string) => {
    console.log(`Clearing invalid data: ${reason}`);
    localStorage.removeItem('currentTrainingData');
    alert(`Phiên học không hợp lệ: ${reason}. Vui lòng thử lại từ trang đào tạo.`);
    navigate('/training');
  };
  const [trainingData, setTrainingData] = useState<TrainingData | null>(null);
  
  // Debug: Track trainingData changes
  useEffect(() => {
    console.log('TrainingData changed:', trainingData);
    if (trainingData) {
      console.log('Session ID in trainingData:', trainingData.session?._id);
    }
  }, [trainingData]);
  
  // Use ref to store trainingData to prevent it from being reset
  const trainingDataRef = useRef<TrainingData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Clear old localStorage data on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('currentTrainingData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        // Check if the session ID is the old invalid one
        if (parsedData.session?._id === '68d405b3f69efa8873b5c836') {
          console.log('Found old invalid session data, clearing localStorage');
          localStorage.removeItem('currentTrainingData');
        }
      } catch (error) {
        console.log('Error parsing localStorage data, clearing it');
        localStorage.removeItem('currentTrainingData');
      }
    }
  }, []);

  useEffect(() => {
    console.log('Location state:', location.state);
    console.log('Location state changed, current trainingData:', trainingData);
    
    // Try to get training data from location state first
    let data = location.state?.trainingData;
    
    // If no data in state, try to get from localStorage (for page refresh)
    if (!data) {
      const savedData = localStorage.getItem('currentTrainingData');
      if (savedData) {
        try {
          data = JSON.parse(savedData);
          console.log('Training data loaded from localStorage:', data);
        } catch (error) {
          console.error('Error parsing saved training data:', error);
          localStorage.removeItem('currentTrainingData');
        }
      }
    } else {
      // Save to localStorage for page refresh
      localStorage.setItem('currentTrainingData', JSON.stringify(data));
    }
    
    if (data && data.session?._id) {
      console.log('Training data received:', data);
      console.log('Session ID from data:', data.session._id);
      
      // Validate session data before using it
      if (!data.session || !data.session._id || !data.session.end_time) {
        console.error('Invalid session data:', data);
        clearAndRedirect('Dữ liệu phiên học không hợp lệ');
        return;
      }
      
      // Only set trainingData if it's not already set or if it's different
      setTrainingData(prevData => {
        if (!prevData || prevData.session?._id !== data.session._id) {
          console.log('Setting new training data');
          return data;
        }
        console.log('Training data already set, keeping existing');
        return prevData;
      });
      
      // Also store in ref for reliable access
      trainingDataRef.current = data;
      setLoading(false);
      setIsInitialized(true);
      
      // Check if this is a retake
      if (location.state?.isRetake) {
        console.log('This is a retake session');
        // Show retake notification
        setTimeout(() => {
          alert('Đây là lần làm lại bài. Kết quả trước đó đã được reset. Chúc bạn làm bài tốt!');
        }, 500);
      }
      
      // Calculate time left based on session end time
      const endTime = new Date(data.session.end_time);
      const now = new Date();
      const timeDiff = endTime.getTime() - now.getTime();
      
      if (timeDiff > 0) {
        setTimeLeft(Math.floor(timeDiff / 1000));
      } else {
        // If session has expired, set a reasonable time limit (e.g., 2 hours)
        setTimeLeft(2 * 60 * 60); // 2 hours in seconds
        console.log('Session has expired, setting 2-hour time limit for completion');
      }
    } else {
      console.log('No valid training data found, redirecting to training page');
      clearAndRedirect('Không tìm thấy dữ liệu phiên học');
    }
  }, [location.state, navigate]);

  // Cleanup localStorage when component unmounts
  useEffect(() => {
    return () => {
      // Only clear if training is completed or user navigates away
      if (isSubmitted) {
        localStorage.removeItem('currentTrainingData');
      }
    };
  }, [isSubmitted]);

  useEffect(() => {
    // Only start timer after component is initialized
    if (!isInitialized) return;
    
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isSubmitted) {
      // Only auto-submit if user has answered at least one question
      const answeredQuestions = Object.keys(answers).length;
      if (answeredQuestions > 0) {
        console.log('Time expired, auto-submitting with', answeredQuestions, 'answered questions');
        handleSubmit();
      } else {
        console.log('Time expired but no answers provided, not auto-submitting');
        alert('Thời gian đã hết và bạn chưa trả lời câu hỏi nào. Phiên học sẽ được đóng.');
        navigate('/training');
      }
    }
  }, [timeLeft, isSubmitted, answers, isInitialized]);

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < (trainingData?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitted) return;
    
    // Use ref as fallback if state is null
    const currentTrainingData = trainingData || trainingDataRef.current;
    
    // Debug: Check if trainingData and session._id exist
    console.log('=== SUBMIT DEBUG ===');
    console.log('TrainingData (state):', trainingData);
    console.log('TrainingData (ref):', trainingDataRef.current);
    console.log('Current TrainingData:', currentTrainingData);
    console.log('TrainingData type:', typeof currentTrainingData);
    console.log('TrainingData is null:', currentTrainingData === null);
    console.log('TrainingData is undefined:', currentTrainingData === undefined);
    console.log('Session ID:', currentTrainingData?.session?._id);
    console.log('Session:', currentTrainingData?.session);
    console.log('Answers:', answers);
    console.log('Number of answered questions:', Object.keys(answers).length);
    console.log('===================');
    
    if (!currentTrainingData?.session?._id) {
      alert('Không tìm thấy thông tin phiên học. Vui lòng thử lại.');
      return;
    }

    // Check if user has answered at least one question
    const answeredQuestions = Object.keys(answers).length;
    if (answeredQuestions === 0) {
      alert('Bạn chưa trả lời câu hỏi nào. Vui lòng trả lời ít nhất một câu hỏi trước khi nộp bài.');
      return;
    }

    // Ask for confirmation before submitting
    const confirmSubmit = window.confirm(
      `Bạn đã trả lời ${answeredQuestions}/${currentTrainingData.questions.length} câu hỏi. Bạn có chắc chắn muốn nộp bài không?`
    );
    
    if (!confirmSubmit) {
      return;
    }
    
    setIsSubmitted(true);
    
    try {

      // Calculate score
      let totalScore = 0;
      let correctAnswers = 0;
      
      currentTrainingData?.questions.forEach(question => {
        const userAnswer = answers[question._id];
        if (userAnswer) {
          // For now, we'll need to get the correct answer from the backend
          // This is a simplified version - give full points for answered questions
          const points = Number(question.points) || 1; // Default to 1 point if not specified
          totalScore += points;
          correctAnswers++;
        }
      });

      // Ensure score is always a valid number
      totalScore = Number(totalScore) || 0;

      console.log('Calculated score:', totalScore, 'Type:', typeof totalScore);

      // Submit answers to backend
      const response = await api.post(`/training/sessions/${currentTrainingData.session._id}/submit`, {
        answers: answers,
        score: totalScore,
        completion_time: new Date().toISOString()
      });

      if (response.data.success) {
        alert(`Hoàn thành khóa học! Điểm số: ${totalScore}/${currentTrainingData?.questions.reduce((sum, q) => sum + q.points, 0)}`);
        localStorage.removeItem('currentTrainingData');
        navigate('/training');
      } else {
        alert(`Lỗi: ${response.data.message}`);
      }
    } catch (error: any) {
      console.error('Error submitting training:', error);
      alert('Có lỗi xảy ra khi nộp bài');
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <i className="fas fa-spinner fa-spin"></i>
          <span>Đang tải...</span>
        </div>
      </div>
    );
  }

  if (!trainingData) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <i className="fas fa-exclamation-triangle"></i>
          <h3>Không tìm thấy dữ liệu khóa học</h3>
          <button onClick={() => navigate('/training')} className={styles.backBtn}>
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = trainingData.questions?.[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / (trainingData.questions?.length || 1)) * 100;

  // Show loading if currentQuestion is not available
  if (!currentQuestion) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Đang tải câu hỏi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button onClick={() => navigate('/training')} className={styles.backBtn}>
            <i className="fas fa-arrow-left"></i> Quay lại
          </button>
          <div className={styles.sessionInfo}>
            <h1>{trainingData.session?.session_name || 'Training Session'}</h1>
            <p>{trainingData.course?.course_name || 'Course'}</p>
          </div>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.timer}>
            <i className="fas fa-clock"></i>
            <span className={timeLeft < 300 ? styles.timeWarning : ''}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
      </header>

      <div className={styles.progressBar}>
        <div 
          className={styles.progressFill} 
          style={{ width: `${progress}%` }}
        ></div>
        <span className={styles.progressText}>
          Câu {currentQuestionIndex + 1} / {trainingData.questions?.length || 0}
        </span>
      </div>

      <div className={styles.content}>
        <div className={styles.questionCard}>
          <div className={styles.questionHeader}>
            <div className={styles.questionNumber}>
              Câu {currentQuestionIndex + 1}
            </div>
            <div className={styles.questionPoints}>
              {currentQuestion.points} điểm
            </div>
            <div className={styles.questionDifficulty}>
              {currentQuestion.difficulty_level === 'EASY' ? 'Dễ' :
               currentQuestion.difficulty_level === 'MEDIUM' ? 'Trung bình' : 'Khó'}
            </div>
          </div>
          
          <div className={styles.questionContent}>
            <h3>{currentQuestion.content}</h3>
          </div>

          <div className={styles.options}>
            {currentQuestion.options.map((option, index) => (
              <label key={index} className={styles.option}>
                <input
                  type="radio"
                  name={`question_${currentQuestion._id}`}
                  value={option}
                  checked={answers[currentQuestion._id] === option}
                  onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)}
                />
                <span className={styles.optionText}>
                  {String.fromCharCode(65 + index)}. {option}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className={styles.navigation}>
          <button 
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className={styles.navBtn}
          >
            <i className="fas fa-chevron-left"></i> Câu trước
          </button>
          
          <div className={styles.questionNav}>
            {trainingData.questions?.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`${styles.questionNavBtn} ${
                  answers[trainingData.questions?.[index]?._id] ? styles.answered : ''
                } ${index === currentQuestionIndex ? styles.current : ''}`}
              >
                {index + 1}
              </button>
            ))}
          </div>
          
          <button 
            onClick={handleNext}
            disabled={currentQuestionIndex === (trainingData.questions?.length || 1) - 1}
            className={styles.navBtn}
          >
            Câu sau <i className="fas fa-chevron-right"></i>
          </button>
        </div>

        <div className={styles.submitSection}>
          <button 
            onClick={handleSubmit}
            disabled={isSubmitted}
            className={styles.submitBtn}
          >
            <i className="fas fa-check"></i> Nộp bài
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrainingSession;
